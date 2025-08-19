import axios from 'axios';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Simple in-memory rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute
const ipRequestCounts: Record<string, { count: number, resetTime: number }> = {};

// Simple in-memory cache
interface CacheEntry {
  data: ArrayBuffer;
  timestamp: number;
}
const memoryCache: Record<string, CacheEntry> = {};
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * API route for text-to-speech conversion using Google Translate TTS
 * Converts text to Filipino speech audio with caching and rate limiting
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  
  // Validate input
  if (!text) {
    return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
  }
  
  if (text.length > 200) {
    return NextResponse.json({ error: 'Text too long. Maximum 200 characters allowed.' }, { status: 400 });
  }
  
  // Get client IP for rate limiting
  const headersList = headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const clientIp = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
  
  // Apply rate limiting
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  
  // Create a cache key based on the text
  const cacheKey = `tts-${Buffer.from(text).toString('base64')}`;
  
  // Check for If-None-Match header for client-side caching
  const ifNoneMatch = headersList.get('if-none-match');
  if (ifNoneMatch === `"${cacheKey}"`) {
    return new NextResponse(null, { status: 304 }); // Not Modified
  }
  
  // Check memory cache first
  const cachedResponse = checkCache(cacheKey);
  if (cachedResponse) {
    return new NextResponse(cachedResponse, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=604800', // Cache for 1 week
        'ETag': `"${cacheKey}"`,
        'Vary': 'Accept-Encoding',
        'X-Cache': 'HIT'
      },
    });
  }
  
  try {
    // Use a more reliable Google Translate TTS API endpoint for Filipino language (tl)
    // This endpoint is more stable and less likely to be blocked
    const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=tl&client=gtx&textlen=${text.length}`;
    
    // Make request to Google Translate TTS API with timeout
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 8000, // 8 second timeout for more reliability
      headers: {
        // Set a user agent to avoid being blocked
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9,tl;q=0.8',
        'Origin': 'https://translate.google.com',
        'Referer': 'https://translate.google.com/',
      },
    });
    
    // Cache the response
    updateCache(cacheKey, response.data);
    
    // Return the audio with caching headers
    return new NextResponse(response.data, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=604800', // Cache for 1 week
        'ETag': `"${cacheKey}"`,
        'Vary': 'Accept-Encoding',
        'X-Cache': 'MISS'
      },
    });
  } catch (error: any) {
    console.error('TTS API error:', error.message);
    
    // Determine appropriate status code based on error
    let status = 500;
    let errorMessage = 'Failed to generate speech';
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        status = 504; // Gateway Timeout
        errorMessage = 'Connection to speech service timed out';
      } else if (error.response) {
        status = error.response.status;
        errorMessage = `Speech service responded with status ${status}`;
      } else if (error.request) {
        status = 503; // Service Unavailable
        errorMessage = 'Speech service is unavailable';
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: error.message 
      }, 
      { 
        status,
        headers: {
          'Cache-Control': 'no-cache, no-store',
          'X-Error': errorMessage
        }
      }
    );
  }
}

/**
 * Check if the request is within rate limits
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  
  // Clean up expired entries
  for (const [storedIp, data] of Object.entries(ipRequestCounts)) {
    if (data.resetTime < now) {
      delete ipRequestCounts[storedIp];
    }
  }
  
  // Check if IP exists in counter
  if (!ipRequestCounts[ip]) {
    ipRequestCounts[ip] = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    };
    return true;
  }
  
  // Check if window has expired
  if (ipRequestCounts[ip].resetTime < now) {
    ipRequestCounts[ip] = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    };
    return true;
  }
  
  // Increment counter and check limit
  ipRequestCounts[ip].count++;
  return ipRequestCounts[ip].count <= MAX_REQUESTS_PER_WINDOW;
}

/**
 * Check if response is in cache
 */
function checkCache(key: string): ArrayBuffer | null {
  const now = Date.now();
  const entry = memoryCache[key];
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance to clean up on each request
    for (const [cachedKey, cachedEntry] of Object.entries(memoryCache)) {
      if (now - cachedEntry.timestamp > CACHE_TTL) {
        delete memoryCache[cachedKey];
      }
    }
  }
  
  if (entry && now - entry.timestamp <= CACHE_TTL) {
    return entry.data;
  }
  
  return null;
}

/**
 * Update cache with new response
 */
function updateCache(key: string, data: ArrayBuffer): void {
  // Limit cache size to prevent memory leaks
  const MAX_CACHE_ENTRIES = 1000;
  if (Object.keys(memoryCache).length >= MAX_CACHE_ENTRIES) {
    // Remove oldest entry
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [cachedKey, entry] of Object.entries(memoryCache)) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = cachedKey;
      }
    }
    
    if (oldestKey) {
      delete memoryCache[oldestKey];
    }
  }
  
  memoryCache[key] = {
    data,
    timestamp: Date.now()
  };
}
