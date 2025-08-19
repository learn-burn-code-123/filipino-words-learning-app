"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Volume2, RotateCcw, PartyPopper, Star, Info, ChevronRight, ChevronLeft } from "lucide-react";

// Import the word-to-audio mapping
import wordAudioMap from "../public/audio/word_audio_map.json";

// ---------------------------
// DATA
// ---------------------------
const LETTER_SETS = {
  Mm: [
    { word: "mata", emoji: "👁️", hint: "eye" },
    { word: "maya", emoji: "🐦", hint: "sparrow/bird" },
    { word: "mangga", emoji: "🥭", hint: "mango" },
    { word: "mais", emoji: "🌽", hint: "corn" },
    { word: "manok", emoji: "🐔", hint: "chicken" },
    { word: "mani", emoji: "🥜", hint: "peanut" },
    { word: "mami", emoji: "🍜", hint: "noodle soup" },
    { word: "mesa", emoji: "🍽️", hint: "table" },
    { word: "misa", emoji: "⛪", hint: "mass (church)" },
  ],
  Ss: [
    { word: "sabon", emoji: "🧼", hint: "soap" },
    { word: "saging", emoji: "🍌", hint: "banana" },
    { word: "sako", emoji: "🧺", hint: "sack" },
    { word: "sali", emoji: "🤝", hint: "join" },
    { word: "sipa", emoji: "⚽", hint: "kick" },
    { word: "siko", emoji: "💪", hint: "elbow" },
    { word: "sopas", emoji: "🍲", hint: "soup" },
    { word: "sulat", emoji: "✉️", hint: "letter" },
    { word: "susi", emoji: "🔑", hint: "key" },
  ],
  Aa: [
    { word: "aklat", emoji: "📖", hint: "book" },
    { word: "ahas", emoji: "🐍", hint: "snake" },
    { word: "ama", emoji: "👨", hint: "father" },
    { word: "anak", emoji: "🧒", hint: "child" },
    { word: "anim", emoji: "6️⃣", hint: "six" },
    { word: "apoy", emoji: "🔥", hint: "fire" },
    { word: "araw", emoji: "☀️", hint: "sun/day" },
    { word: "aso", emoji: "🐶", hint: "dog" },
    { word: "atis", emoji: "🍏", hint: "sugar apple" }, // closest emoji
  ],
  Bb: [
    { word: "baboy", emoji: "🐷", hint: "pig" },
    { word: "baka", emoji: "🐮", hint: "cow" },
    { word: "baso", emoji: "🥛", hint: "glass" },
    { word: "bata", emoji: "👶", hint: "child" },
    { word: "bibig", emoji: "👄", hint: "mouth" },
    { word: "bilog", emoji: "⭕", hint: "circle" },
    { word: "bintana", emoji: "🪟", hint: "window" },
    { word: "bola", emoji: "🏀", hint: "ball" },
    { word: "bulaklak", emoji: "🌸", hint: "flower" },
  ],
  Ii: [
    { word: "ibon", emoji: "🦜", hint: "bird" },
    { word: "ilaw", emoji: "💡", hint: "light" },
    { word: "ilog", emoji: "🏞️", hint: "river" },
    { word: "ilong", emoji: "👃", hint: "nose" },
    { word: "ipis", emoji: "🪳", hint: "cockroach" },
    { word: "ipo-ipo", emoji: "🌪️", hint: "tornado" },
    { word: "isa", emoji: "1️⃣", hint: "one" },
    { word: "isda", emoji: "🐟", hint: "fish" },
    { word: "itlog", emoji: "🥚", hint: "egg" },
  ],
  Oo: [
    { word: "obispo", emoji: "⛪", hint: "bishop" },
    { word: "otap", emoji: "🍪", hint: "cookie/pastry" },
    { word: "okra", emoji: "🥬", hint: "vegetable" },
    { word: "orasan", emoji: "⏰", hint: "clock" },
    { word: "oso", emoji: "🐻", hint: "bear" },
    { word: "ospital", emoji: "🏥", hint: "hospital" },
    { word: "oras", emoji: "⌛️", hint: "time/hour" },
    { word: "orasyon", emoji: "🙏", hint: "prayer" },
    { word: "ostra", emoji: "🦪", hint: "oyster" },
  ],
};

// Small helper: Fisher–Yates shuffle
function shuffle(arr: any[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Helper function for speech synthesis with Filipino voice settings
function continueWithVoices(utter: SpeechSynthesisUtterance, voices: SpeechSynthesisVoice[], text: string) {
  // Voice selection priority based on research for best Filipino pronunciation
  // 1. Native Filipino/Tagalog voice
  // 2. Filipino-accented English voice
  // 3. Spanish voice (phonetically similar to Filipino)
  // 4. Indonesian/Malaysian voice (regional proximity)
  // 5. Female voice (generally clearer for Filipino)
  
  // Try to find the best voice match
  const filipinoVoice = voices.find(v => /fil|tl|tag/i.test(v.lang));
  const filipinoAccentedVoice = voices.find(v => /en-PH/i.test(v.lang));
  const spanishVoice = voices.find(v => /es/i.test(v.lang) && v.name.includes('Female'));
  const indonesianMalaysianVoice = voices.find(v => /(id|ms)/i.test(v.lang));
  const femaleVoice = voices.find(v => v.name.includes('Female'));
  
  // Apply the best available voice
  if (filipinoVoice) {
    utter.voice = filipinoVoice;
  } else if (filipinoAccentedVoice) {
    utter.voice = filipinoAccentedVoice;
  } else if (spanishVoice) {
    // Spanish voices handle Filipino phonetics well due to historical influence
    utter.voice = spanishVoice;
  } else if (indonesianMalaysianVoice) {
    // Regional proximity provides similar phonetic patterns
    utter.voice = indonesianMalaysianVoice;
  } else if (femaleVoice) {
    // Female voices tend to articulate vowels more clearly
    utter.voice = femaleVoice;
  }
  
  // Adjust speech parameters based on Filipino speech patterns
  // Filipino is syllable-timed (not stress-timed like English)
  utter.rate = 0.7;     // Moderate speed for clear syllable articulation
  utter.pitch = 1.05;   // Natural pitch - Filipino isn't typically high-pitched
  utter.volume = 1.0;   // Full volume for clarity
  
  // Apply stress patterns to the text
  const stressedText = addSyllableStress(text);
  
  // Add pronunciation hints for Filipino words
  const enhancedText = addFilipinoPronunciationHints(stressedText);
  utter.text = enhancedText;
  
  // Use SSML if supported by the browser for more precise pronunciation control
  try {
    if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
      const ssmlText = createSSMLForFilipino(text);
      if (ssmlText) utter.text = ssmlText;
    }
  } catch (e) {
    // Fallback to enhanced text if SSML fails
    console.log('SSML not supported, using enhanced text');
  }
  
  // Cancel any ongoing speech and speak the new text
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

// Audio cache to prevent repeated network requests
const audioCache: Record<string, HTMLAudioElement> = {};

// Function to speak text using pre-generated MP3 files with fallback options
function speak(text: string) {
  try {
    // Show audio feedback
    const feedbackElement = showAudioFeedback();
    
    // Create a cache key based on the text
    const cacheKey = `tts-${btoa(encodeURIComponent(text))}`;
    
    // Check if audio is already in cache
    if (audioCache[cacheKey]) {
      // Cancel any ongoing speech
      Object.values(audioCache).forEach(audio => audio.pause());
      
      // Play from cache
      const cachedAudio = audioCache[cacheKey];
      updateAudioFeedbackToPlaying(feedbackElement);
      
      cachedAudio.currentTime = 0;
      cachedAudio.play().catch(error => {
        console.error('Error playing cached audio:', error);
        hideAudioFeedback(feedbackElement);
        // Try fallback approaches
        playFromLocalMP3(text, feedbackElement);
      });
      return;
    }
    
    // Not in cache, try playing from local MP3 files first
    playFromLocalMP3(text, feedbackElement);
  } catch (error) {
    console.error('TTS error:', error);
    // Final fallback
    fallbackToSpeechSynthesis(text);
  }
}

// Helper function to play audio from local MP3 files
function playFromLocalMP3(text: string, feedbackElement?: HTMLElement) {
  // Create a cache key based on the text
  const cacheKey = `tts-${btoa(encodeURIComponent(text))}`;
  
  // Check if we have a pre-generated MP3 for this word
  const audioPath = (wordAudioMap as Record<string, string>)[text.toLowerCase()];
  
  if (audioPath) {
    // We have a pre-generated MP3 file for this word
    const audioElement = new Audio();
    let hasPlayedOrErrored = false;
    
    // Set up event handlers
    audioElement.oncanplaythrough = () => {
      // Store in cache once loaded
      audioCache[cacheKey] = audioElement;
      
      // Update feedback to show playing state
      if (feedbackElement && !hasPlayedOrErrored) {
        updateAudioFeedbackToPlaying(feedbackElement);
      }
    };
    
    audioElement.onplay = () => {
      hasPlayedOrErrored = true;
      // Update feedback to show playing state
      if (feedbackElement) {
        updateAudioFeedbackToPlaying(feedbackElement);
      }
    };
    
    audioElement.onended = () => {
      if (feedbackElement) hideAudioFeedback(feedbackElement);
    };
    
    audioElement.onerror = (e) => {
      hasPlayedOrErrored = true;
      console.error('Error loading local audio file:', e);
      if (feedbackElement) hideAudioFeedback(feedbackElement);
      
      // Try fallback to API
      fetchAndPlayAudio(text, cacheKey, feedbackElement);
    };
    
    // Start loading and playing
    audioElement.src = audioPath;
    audioElement.load();
    
    // Play when possible
    audioElement.play().catch(error => {
      console.error('Error playing local audio:', error);
      
      if (!hasPlayedOrErrored) {
        hasPlayedOrErrored = true;
        // Try fallback to API
        fetchAndPlayAudio(text, cacheKey, feedbackElement);
      }
    });
  } else {
    // No pre-generated MP3, fall back to API
    fetchAndPlayAudio(text, cacheKey, feedbackElement);
  }
}

// Helper function to fetch and play audio from API (as fallback)
function fetchAndPlayAudio(text: string, cacheKey: string, feedbackElement?: HTMLElement) {
  // Create a new audio element
  const audioElement = new Audio();
  
  // Use our API route to get Filipino TTS from Google Translate
  // Include trailing slash to prevent redirect and add timestamp to prevent caching issues
  const timestamp = Date.now();
  const apiUrl = `/api/tts/?text=${encodeURIComponent(text)}&_t=${timestamp}`;
  
  let hasPlayedOrErrored = false;
  
  // Set up event handlers
  audioElement.oncanplaythrough = () => {
    // Store in cache once loaded
    audioCache[cacheKey] = audioElement;
    
    // Update feedback to show playing state
    if (feedbackElement && !hasPlayedOrErrored) {
      updateAudioFeedbackToPlaying(feedbackElement);
    }
  };
  
  audioElement.onplay = () => {
    hasPlayedOrErrored = true;
    // Update feedback to show playing state
    if (feedbackElement) {
      updateAudioFeedbackToPlaying(feedbackElement);
    }
  };
  
  audioElement.onended = () => {
    if (feedbackElement) hideAudioFeedback(feedbackElement);
  };
  
  audioElement.onerror = (e) => {
    hasPlayedOrErrored = true;
    console.error('Error loading audio from API:', e);
    if (feedbackElement) hideAudioFeedback(feedbackElement);
    
    // Show error toast
    showErrorToast('Could not load Filipino pronunciation');
    
    // Try a second attempt with a different approach
    retryWithDirectFetch(text, feedbackElement);
  };
  
  // Add timeout for slow connections
  const timeoutId = setTimeout(() => {
    if (audioElement.readyState < 3 && !hasPlayedOrErrored) { // Not enough data yet
      console.warn('Audio loading timeout, trying alternative approach');
      audioElement.src = ''; // Stop loading
      retryWithDirectFetch(text, feedbackElement);
    }
  }, 8000); // 8 second timeout
  
  // Clear timeout when audio can play
  audioElement.oncanplay = () => clearTimeout(timeoutId);
  
  // Cancel any ongoing speech
  Object.values(audioCache).forEach(audio => audio.pause());
  
  // Set source and play
  audioElement.src = apiUrl;
  audioElement.load();
  
  // Play when possible
  audioElement.play().catch(error => {
    hasPlayedOrErrored = true;
    console.error('Error playing audio:', error);
    clearTimeout(timeoutId);
    if (feedbackElement) hideAudioFeedback(feedbackElement);
    
    // Show error toast
    showErrorToast('Could not play Filipino pronunciation');
    
    // Try a second attempt with a different approach
    retryWithDirectFetch(text, feedbackElement);
  });
}

// Use browser-compatible TTS approach that works in all browsers including Windsurf
function useBrowserTTS(text: string, feedbackElement?: HTMLElement) {
  try {
    // Try direct browser TTS first
    const voices = window.speechSynthesis.getVoices();
    
    // If voices are available immediately, proceed
    if (voices.length > 0) {
      speakWithBrowserTTS(text, voices, feedbackElement);
    } else {
      // Otherwise wait for voices to load
      window.speechSynthesis.onvoiceschanged = () => {
        const updatedVoices = window.speechSynthesis.getVoices();
        speakWithBrowserTTS(text, updatedVoices, feedbackElement);
      };
    }
  } catch (error) {
    console.error('Browser TTS error:', error);
    // Try API-based approach as fallback
    const cacheKey = `tts-${btoa(encodeURIComponent(text))}`;
    fetchAndPlayAudio(text, cacheKey, feedbackElement);
  }
}

// Helper function to speak with browser TTS
function speakWithBrowserTTS(text: string, voices: SpeechSynthesisVoice[], feedbackElement?: HTMLElement) {
  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Try to find a Filipino voice
  let filipinoVoice = voices.find(voice => 
    voice.lang === 'fil' || 
    voice.lang === 'fil-PH' || 
    voice.lang === 'tl' || 
    voice.lang === 'tl-PH' ||
    voice.name.toLowerCase().includes('filipino') ||
    voice.name.toLowerCase().includes('tagalog')
  );
  
  // If no Filipino voice, try to find any voice that might work
  if (!filipinoVoice) {
    filipinoVoice = voices.find(voice => 
      voice.lang.startsWith('en') || // English as fallback
      voice.lang.startsWith('es') || // Spanish has some phonetic similarities
      voice.lang.startsWith('id')    // Indonesian has some similarities
    );
  }
  
  // Set the voice if found
  if (filipinoVoice) {
    utterance.voice = filipinoVoice;
    utterance.lang = filipinoVoice.lang;
  }
  
  // Set other properties for better pronunciation
  utterance.rate = 0.9; // Slightly slower
  utterance.pitch = 1.0;
  
  // Set up event handlers
  utterance.onstart = () => {
    if (feedbackElement) {
      updateAudioFeedbackToPlaying(feedbackElement);
    }
  };
  
  utterance.onend = () => {
    if (feedbackElement) {
      hideAudioFeedback(feedbackElement);
    }
  };
  
  utterance.onerror = () => {
    if (feedbackElement) {
      hideAudioFeedback(feedbackElement);
    }
    // Try API-based approach as fallback
    const cacheKey = `tts-${btoa(encodeURIComponent(text))}`;
    fetchAndPlayAudio(text, cacheKey, feedbackElement);
  };
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  // Speak
  window.speechSynthesis.speak(utterance);
}

// Retry with direct fetch to handle CORS or other issues
async function retryWithDirectFetch(text: string, feedbackElement?: HTMLElement) {
  try {
    // Try direct fetch to handle potential CORS issues
    const timestamp = Date.now();
    const response = await fetch(`/api/tts/?text=${encodeURIComponent(text)}&_t=${timestamp}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    const audio = new Audio(audioUrl);
    
    if (feedbackElement) {
      updateAudioFeedbackToPlaying(feedbackElement);
    }
    
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl); // Clean up
      if (feedbackElement) hideAudioFeedback(feedbackElement);
    };
    
    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl); // Clean up
      if (feedbackElement) hideAudioFeedback(feedbackElement);
      // Final fallback to browser's speech synthesis
      fallbackToSpeechSynthesis(text);
    };
    
    await audio.play();
  } catch (error) {
    console.error('Error in retry attempt:', error);
    if (feedbackElement) hideAudioFeedback(feedbackElement);
    // Final fallback to browser's speech synthesis
    fallbackToSpeechSynthesis(text);
  }
}

// Show subtle audio feedback indicator with loading animation
function showAudioFeedback(): HTMLElement {
  let feedbackElement = document.getElementById('audio-feedback');
  if (!feedbackElement) {
    feedbackElement = document.createElement('div');
    feedbackElement.id = 'audio-feedback';
    feedbackElement.style.position = 'fixed';
    feedbackElement.style.bottom = '60px';
    feedbackElement.style.right = '20px';
    feedbackElement.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    feedbackElement.style.color = 'white';
    feedbackElement.style.padding = '8px 12px';
    feedbackElement.style.borderRadius = '20px';
    feedbackElement.style.fontSize = '14px';
    feedbackElement.style.zIndex = '1000';
    feedbackElement.style.transition = 'opacity 0.3s ease';
    feedbackElement.style.display = 'flex';
    feedbackElement.style.alignItems = 'center';
    feedbackElement.style.gap = '8px';
    document.body.appendChild(feedbackElement);
  }
  
  // Create loading spinner
  const spinnerContainer = document.createElement('div');
  spinnerContainer.style.width = '14px';
  spinnerContainer.style.height = '14px';
  spinnerContainer.style.position = 'relative';
  
  const spinner = document.createElement('div');
  spinner.style.border = '2px solid rgba(255, 255, 255, 0.3)';
  spinner.style.borderRadius = '50%';
  spinner.style.borderTopColor = 'white';
  spinner.style.width = '100%';
  spinner.style.height = '100%';
  spinner.style.animation = 'audio-spinner 0.8s linear infinite';
  spinnerContainer.appendChild(spinner);
  
  // Create animation style if it doesn't exist
  if (!document.getElementById('audio-spinner-style')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'audio-spinner-style';
    styleElement.textContent = `
      @keyframes audio-spinner {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleElement);
  }
  
  // Clear previous content
  feedbackElement.innerHTML = '';
  
  // Add icon and text
  const icon = document.createElement('span');
  icon.textContent = '🔊';
  
  const text = document.createElement('span');
  text.textContent = 'Filipino pronunciation';
  
  // Append all elements
  feedbackElement.appendChild(icon);
  feedbackElement.appendChild(text);
  feedbackElement.appendChild(spinnerContainer);
  
  // Show the feedback
  feedbackElement.style.opacity = '1';
  
  return feedbackElement;
}

// Update audio feedback to show playing state
function updateAudioFeedbackToPlaying(element: HTMLElement) {
  // Find the spinner container
  const spinnerContainer = element.querySelector('div');
  if (spinnerContainer) {
    // Replace spinner with checkmark
    spinnerContainer.innerHTML = '';
    spinnerContainer.style.display = 'flex';
    spinnerContainer.style.alignItems = 'center';
    spinnerContainer.style.justifyContent = 'center';
    
    const checkmark = document.createElement('span');
    checkmark.textContent = '✓';
    checkmark.style.color = '#4ade80'; // Green color
    spinnerContainer.appendChild(checkmark);
    
    // Update text
    const textElement = element.querySelector('span:nth-child(2)');
    if (textElement) {
      textElement.textContent = 'Playing';
    }
  }
}

// Hide audio feedback indicator with animation
function hideAudioFeedback(element: HTMLElement) {
  element.style.opacity = '0';
  setTimeout(() => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }, 300);
}

// Show error toast notification
function showErrorToast(message: string) {
  // Check if a toast container exists
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    // Create toast container
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '120px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '1000';
    toastContainer.style.display = 'flex';
    toastContainer.style.flexDirection = 'column';
    toastContainer.style.gap = '8px';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.style.backgroundColor = 'rgba(239, 68, 68, 0.9)'; // Red background
  toast.style.color = 'white';
  toast.style.padding = '10px 16px';
  toast.style.borderRadius = '8px';
  toast.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '8px';
  toast.style.minWidth = '250px';
  toast.style.transform = 'translateY(10px)';
  toast.style.opacity = '0';
  toast.style.transition = 'all 0.3s ease';
  
  // Add error icon
  const icon = document.createElement('span');
  icon.textContent = '⚠️';
  icon.style.fontSize = '16px';
  
  // Add message
  const text = document.createElement('span');
  text.textContent = message;
  text.style.flex = '1';
  
  // Add close button
  const closeBtn = document.createElement('span');
  closeBtn.textContent = '×';
  closeBtn.style.fontSize = '20px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.marginLeft = '8px';
  closeBtn.onclick = () => removeToast(toast);
  
  // Append elements to toast
  toast.appendChild(icon);
  toast.appendChild(text);
  toast.appendChild(closeBtn);
  
  // Append toast to container
  toastContainer.appendChild(toast);
  
  // Animate toast in
  setTimeout(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  }, 10);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    removeToast(toast);
  }, 5000);
}

// Helper to remove toast with animation
function removeToast(toast: HTMLElement) {
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(10px)';
  
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
      
      // Remove container if empty
      const container = document.getElementById('toast-container');
      if (container && container.children.length === 0) {
        container.parentNode?.removeChild(container);
      }
    }
  }, 300);
}

// Fallback to browser's speech synthesis if our API fails
function fallbackToSpeechSynthesis(text: string) {
  try {
    const utter = new SpeechSynthesisUtterance(text);
    
    // Load voices and ensure they're available
    let voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      // If voices aren't loaded yet, wait for them
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        continueWithVoices(utter, voices, text);
      };
    } else {
      continueWithVoices(utter, voices, text);
    }
  } catch (_) {
    // ignore errors
  }
}

// Helper function to enhance Filipino pronunciation
function addFilipinoPronunciationHints(text: string): string {
  // First, handle common Filipino digraphs and special sounds
  let enhancedText = text.toLowerCase();
  
  // Pre-process text to handle special cases
  // Handle adjacent vowels with glottal stops (common in Filipino)
  enhancedText = enhancedText
    .replace(/([aeiou])([aeiou])/gi, '$1\'$2');
  
  // Handle digraphs and special sounds (must come before single letter replacements)
  enhancedText = enhancedText
    // The 'ng' sound is a single consonant in Filipino, not two separate sounds
    .replace(/ng/g, 'ŋ')
    
    // Filipino diphthongs - more accurate pronunciation
    .replace(/ay/g, 'ai') // 'ay' as in "baybay" (beach)
    .replace(/aw/g, 'au') // 'aw' as in "araw" (sun)
    .replace(/oy/g, 'oi') // 'oy' as in "toyboy"
    .replace(/uy/g, 'ui') // 'uy' as in "suyuin" (to court)
    .replace(/iw/g, 'iu') // 'iw' as in "tiwalang" (trust)
    .replace(/ey/g, 'ei') // 'ey' as in "heyano" (hey there)
    
    // Special consonant combinations
    .replace(/ty/g, 'ty') // Filipino 'ty' sound as in "pityang" (slightly open)
    .replace(/sy/g, 'sy') // Filipino 'sy' sound as in "sya" (he/she)
    .replace(/ny/g, 'ny') // Filipino 'ny' sound as in "nyaya" (invitation)
    .replace(/ky/g, 'ky') // Filipino 'ky' sound
    
    // Vowels - authentic Filipino pronunciation based on research
    // Filipino vowels maintain consistent sounds regardless of position
    .replace(/a/g, 'a') // 'a' as in "father" - central low [a]
    .replace(/e/g, 'e') // 'e' as in "bet" - consistent 'eh' sound
    .replace(/i/g, 'i') // 'i' as in "see" - close front vowel
    .replace(/o/g, 'o') // 'o' as in "go" - close-mid back rounded
    .replace(/u/g, 'u') // 'u' as in "moon" - close back rounded
    
    // Consonants with special Filipino pronunciation
    .replace(/r([aeiou])/g, 'ɾ$1') // Filipino 'r' is a single tap, not a trill
    .replace(/d([aeiou])/g, 'd̪$1') // Filipino 'd' is dental (tongue touches upper teeth)
    .replace(/n([aeiou])/g, 'n$1') // Clear 'n' sound
    .replace(/p([aeiou])/g, 'p$1') // Unaspirated 'p'
    .replace(/t([aeiou])/g, 't$1') // Unaspirated 't'
    .replace(/k([aeiou])/g, 'k$1'); // Unaspirated 'k'
  
  // Add proper syllable timing (Filipino is syllable-timed, not stress-timed like English)
  // Each syllable should receive roughly equal duration
  enhancedText = enhancedText.replace(/([bcdfghjklmnpqrstvwxyzŋ])([aeiou])/gi, '$1·$2');
  
  return enhancedText;
}

// Create SSML markup for better Filipino pronunciation control
function createSSMLForFilipino(text: string): string {
  try {
    // Only use SSML if the text is a single Filipino word (not a sentence)
    if (text.trim().split(/\s+/).length > 1) return '';
    
    // Apply syllable stress to the word
    const stressedWord = addSyllableStress(text);
    
    // Convert to IPA for more accurate pronunciation
    const ipaText = convertToIPA(stressedWord);
    
    // Create SSML with phoneme, prosody, and break tags for authentic Filipino rhythm
    const ssml = `<speak>
      <prosody rate="0.8" pitch="medium">
        <phoneme alphabet="ipa" ph="${ipaText}">${text}</phoneme>
        <break time="10ms"/>
      </prosody>
    </speak>`;
    
    return ssml;
  } catch (e) {
    return '';
  }
}

// Convert Filipino text to IPA (International Phonetic Alphabet)
function convertToIPA(text: string): string {
  // Enhanced IPA conversion for Filipino based on linguistic research
  let ipaText = text;
  
  // First handle uppercase vowels as stressed (marked by our stress function)
  ipaText = ipaText
    .replace(/A/g, 'ˈa')
    .replace(/E/g, 'ˈɛ')
    .replace(/I/g, 'ˈi')
    .replace(/O/g, 'ˈo')
    .replace(/U/g, 'ˈu');
  
  // Convert to lowercase for remaining processing
  ipaText = ipaText.toLowerCase();
  
  // Handle digraphs and special sounds first
  ipaText = ipaText
    // The 'ng' digraph is a single sound in Filipino
    .replace(/ng/g, 'ŋ')
    // Diphthongs
    .replace(/ay/g, 'aɪ')
    .replace(/aw/g, 'aʊ')
    .replace(/oy/g, 'oɪ')
    .replace(/uy/g, 'uɪ')
    .replace(/iw/g, 'iʊ')
    .replace(/ey/g, 'eɪ');
  
  // Vowels - Filipino has 5 pure vowels, similar to Spanish
  ipaText = ipaText
    .replace(/a/g, 'a') // central open vowel
    .replace(/e/g, 'ɛ') // mid-front unrounded vowel
    .replace(/i/g, 'i') // close front unrounded vowel
    .replace(/o/g, 'o') // mid-back rounded vowel
    .replace(/u/g, 'u'); // close back rounded vowel
  
  // Consonants with special Filipino characteristics
  ipaText = ipaText
    .replace(/b/g, 'b')
    .replace(/k/g, 'k̚') // unaspirated k with no audible release
    .replace(/d/g, 'd̪') // dental d
    .replace(/g/g, 'g')
    .replace(/h/g, 'h')
    .replace(/l/g, 'l')
    .replace(/m/g, 'm')
    .replace(/n/g, 'n')
    .replace(/p/g, 'p̚') // unaspirated p with no audible release
    .replace(/r/g, 'ɾ') // tapped r, not trilled
    .replace(/s/g, 's')
    .replace(/t/g, 't̚') // unaspirated t with no audible release
    .replace(/w/g, 'w')
    .replace(/y/g, 'j'); // palatal approximant
  
  // Add syllable boundaries for clearer pronunciation
  ipaText = ipaText.replace(/([bcdfghjklmnpqrstvwxyzŋ])([aeiouɛɪʊ])/g, '$1.$2');
  
  return ipaText;
}

// Add syllable stress patterns for Filipino words
function addSyllableStress(word: string): string {
  // Clean the word
  const cleanWord = word.toLowerCase().trim();
  if (!cleanWord) return word;
  
  // Filipino stress patterns (based on research):
  // 1. Malumay - stress on the second-to-last syllable (most common)
  // 2. Malumi - stress on the third-to-last syllable
  // 3. Mabilis - stress on the last syllable with a glottal stop
  // 4. Maragsa - stress on the last syllable without a glottal stop
  
  // Count syllables based on vowel clusters
  const syllables = identifySyllables(cleanWord);
  const syllableCount = syllables.length;
  
  if (syllableCount <= 1) {
    // Single syllable words - stress the only syllable
    return cleanWord;
  }
  
  // Check word ending patterns to determine stress pattern
  // Words ending in consonants (except n/ng) often follow Maragsa pattern
  const endsInConsonant = /[bcdfghjklmpqrstvwxyz]$/i.test(cleanWord) && 
                         !(/[n]$/i.test(cleanWord)) && 
                         !(/ng$/i.test(cleanWord));
  
  // Words ending in vowels typically follow Malumay pattern
  const endsInVowel = /[aeiou]$/i.test(cleanWord);
  
  // Words with specific endings may follow Malumi pattern
  const malumi = /[aeiou]han$|[aeiou]hin$/i.test(cleanWord);
  
  // Apply stress mark based on pattern
  if (malumi && syllableCount >= 3) {
    // Malumi pattern - stress on third-to-last syllable
    return applyStressToAntepenultimateSyllable(cleanWord, syllables);
  } else if (endsInConsonant) {
    // Maragsa pattern - stress on last syllable
    return applyStressToLastSyllable(cleanWord);
  } else if (endsInVowel || /n$|ng$/i.test(cleanWord)) {
    // Malumay pattern - stress on second-to-last syllable (default)
    return applyStressToPenultimateSyllable(cleanWord, syllableCount);
  } else {
    // Default to Malumay if no pattern is matched
    return applyStressToPenultimateSyllable(cleanWord, syllableCount);
  }
}

// Helper function to identify syllables in a Filipino word
function identifySyllables(word: string): string[] {
  // Filipino syllable structure is typically CV (consonant-vowel)
  // or V (vowel) with some variations
  const syllables: string[] = [];
  let currentSyllable = '';
  let i = 0;
  
  while (i < word.length) {
    // Handle special cases: digraphs like 'ng' count as single consonants
    if (i < word.length - 1 && word.substring(i, i + 2).toLowerCase() === 'ng') {
      currentSyllable += 'ng';
      i += 2;
    } else {
      currentSyllable += word[i];
      i++;
    }
    
    // If we have a vowel and the next character is a consonant or end of word,
    // we've completed a syllable
    if (/[aeiou]/i.test(currentSyllable) && 
        (i >= word.length || /[bcdfghjklmnpqrstvwxyz]/i.test(word[i]))) {
      syllables.push(currentSyllable);
      currentSyllable = '';
    }
  }
  
  // Add any remaining characters as the final syllable
  if (currentSyllable) {
    syllables.push(currentSyllable);
  }
  
  return syllables;
}

// Apply stress to the last syllable of a word
function applyStressToLastSyllable(word: string): string {
  // Find the last vowel cluster in the word
  const lastVowelMatch = word.match(/([aeiou]+)[^aeiou]*$/i);
  if (!lastVowelMatch || !lastVowelMatch.index) return word;
  
  // Add stress marker to the first vowel of the last syllable
  const index = lastVowelMatch.index;
  return word.substring(0, index) + word.charAt(index).toUpperCase() + word.substring(index + 1);
}

// Apply stress to the antepenultimate (third-to-last) syllable
function applyStressToAntepenultimateSyllable(word: string, syllables: string[]): string {
  if (syllables.length < 3) return word;
  
  // Calculate the position of the third-to-last syllable
  let position = 0;
  for (let i = 0; i < syllables.length - 2; i++) {
    position += syllables[i].length;
  }
  
  // Find the first vowel in the third-to-last syllable
  const thirdToLastSyllable = syllables[syllables.length - 3];
  const vowelIndex = thirdToLastSyllable.search(/[aeiou]/i);
  
  if (vowelIndex === -1) return word;
  
  // Add stress marker to the vowel in the third-to-last syllable
  const stressIndex = position + vowelIndex;
  return word.substring(0, stressIndex) + word.charAt(stressIndex).toUpperCase() + word.substring(stressIndex + 1);
}

// Apply stress to the penultimate (second-to-last) syllable
function applyStressToPenultimateSyllable(word: string, syllableCount: number): string {
  if (syllableCount <= 1) return word;
  
  // Find all vowel clusters
  const vowelMatches = Array.from(word.matchAll(/([aeiou]+)/gi));
  if (vowelMatches.length < 2) return word;
  
  // Get the penultimate vowel cluster
  const penultimateMatch = vowelMatches[vowelMatches.length - 2];
  if (!penultimateMatch || !penultimateMatch.index) return word;
  
  // Add stress marker to the first vowel of the penultimate syllable
  const index = penultimateMatch.index;
  return word.substring(0, index) + word.charAt(index).toUpperCase() + word.substring(index + 1);
}

// Convert Filipino words to IPA (International Phonetic Alphabet) with stress markers
function getIPAForFilipino(text: string): string {
  // Handle uppercase letters as stress markers
  let result = '';
  let i = 0;
  
  while (i < text.length) {
    const char = text[i];
    const isUppercase = char === char.toUpperCase() && char !== char.toLowerCase();
    
    if (isUppercase) {
      // Add primary stress mark before stressed vowel
      result += 'ˈ';
      result += mapCharToIPA(char.toLowerCase());
    } else {
      result += mapCharToIPA(char);
    }
    
    i++;
  }
  
  // Handle special Filipino phoneme combinations after individual character mapping
  return result
    .replace(/nˈg/g, 'ˈŋ') // Stressed ng
    .replace(/ng/g, 'ŋ')    // Unstressed ng
    .replace(/aɪ/g, 'aj')   // More accurate for Filipino ay
    .replace(/aʊ/g, 'aw')   // More accurate for Filipino aw
    .replace(/oɪ/g, 'oj')   // More accurate for Filipino oy
    .replace(/tʃ/g, 'tʃ')   // Filipino ch sound
    .replace(/dʒ/g, 'dʒ');  // Filipino j sound
}

// Map individual characters to their IPA equivalents
function mapCharToIPA(char: string): string {
  const ipaMap: {[key: string]: string} = {
    'a': 'a',   // Filipino 'a' is central low [a], not back [ɑ]
    'e': 'ɛ',   // Filipino 'e' is open-mid front
    'i': 'i',   // Filipino 'i' is close front
    'o': 'o',   // Filipino 'o' is close-mid back rounded
    'u': 'u',   // Filipino 'u' is close back rounded
    'b': 'b',
    'c': 'k',   // 'c' is pronounced as 'k' in Filipino
    'd': 'd',
    'f': 'f',
    'g': 'g',
    'h': 'h',
    'j': 'h',   // 'j' is often pronounced as 'h' in Filipino
    'k': 'k',
    'l': 'l',
    'm': 'm',
    'n': 'n',
    'ñ': 'nj',  // Spanish ñ in Filipino
    'p': 'p',
    'q': 'k',   // 'q' is pronounced as 'k' in Filipino
    'r': 'ɾ',   // Filipino 'r' is a tap/flap
    's': 's',
    't': 't',
    'v': 'b',   // 'v' is often pronounced as 'b' in Filipino
    'w': 'w',
    'x': 'ks',  // 'x' is pronounced as 'ks' in Filipino
    'y': 'j',   // 'y' is pronounced as IPA 'j'
    'z': 's',   // 'z' is often pronounced as 's' in Filipino
    ' ': ' ',
    '-': '-',
  };
  
  return ipaMap[char] || char;
}

function useLocalStorage(key: string, initial: any) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  
  return [value, setValue];
}

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold">
    {children}
  </span>
);

// ---------------------------
// MAIN APP
// ---------------------------
export default function App() {
  const [letter, setLetter] = useLocalStorage("letterChoice", "Mm");
  const [tab, setTab] = useLocalStorage("tabChoice", "learn");
  const words = LETTER_SETS[letter as keyof typeof LETTER_SETS];

  // Reward stars
  const [stars, setStars] = useLocalStorage("stars", 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white text-neutral-800">
      <header className="mx-auto max-w-5xl px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PartyPopper className="h-6 w-6" />
          <h1 className="text-2xl font-extrabold tracking-tight">Baybayin Buddies: Mm · Ss · Aa · Bb · Ii · Oo</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge><Star className="h-3 w-3"/> {stars}</Badge>
          <Button variant="secondary" onClick={() => setStars(0)} className="rounded-2xl">Reset Stars</Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24">
        <section className="mb-4 flex items-center justify-between">
          <LetterPicker letter={letter} setLetter={setLetter} />
          <div className="flex items-center gap-2 text-sm opacity-70">
            <Info className="h-4 w-4" />
            <span>Tap the 🔊 button to hear a Filipino pronunciation.</span>
          </div>
        </section>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-2xl rounded-2xl">
            <TabsTrigger value="learn">Learn</TabsTrigger>
            <TabsTrigger value="match">Match</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="stickers">Stickers</TabsTrigger>
          </TabsList>

          <TabsContent value="learn" className="mt-6">
            <LearnView letter={letter} words={words} onStar={() => setStars((s: number) => s + 1)} />
          </TabsContent>

          <TabsContent value="match" className="mt-6">
            <MatchView letter={letter} words={words} onWin={() => setStars((s: number) => s + 3)} />
          </TabsContent>

          <TabsContent value="quiz" className="mt-6">
            <QuizView letter={letter} words={words} onWin={() => setStars((s: number) => s + 2)} />
          </TabsContent>

          <TabsContent value="stickers" className="mt-6">
            <StickerBook stars={stars} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 border-t bg-white/80 backdrop-blur p-3">
        <div className="mx-auto max-w-5xl flex items-center justify-between text-sm">
          <span className="opacity-70">Tip: Celebrate each win with a ⭐ and say the word together!</span>
          <span className="opacity-70">Made for kinder kids learning Filipino basics.</span>
        </div>
      </footer>
    </div>
  );
}

interface LetterPickerProps {
  letter: string;
  setLetter: (letter: string) => void;
}

function LetterPicker({ letter, setLetter }: LetterPickerProps) {
  const letters = Object.keys(LETTER_SETS);
  return (
    <div className="flex items-center gap-2">
      {letters.map(L => (
        <Button
          key={L}
          variant={L === letter ? "default" : "secondary"}
          onClick={() => setLetter(L)}
          className="rounded-2xl text-lg"
        >
          <span className="font-black mr-2">{L[0]}</span>
          {L}
        </Button>
      ))}
    </div>
  );
}

interface WordItem {
  word: string;
  emoji: string;
  hint: string;
}

interface LearnViewProps {
  letter: string;
  words: WordItem[];
  onStar: () => void;
}

// ---------------------------
// LEARN VIEW (Flashcards)
// ---------------------------
function LearnView({ letter, words, onStar }: LearnViewProps) {
  const [index, setIndex] = useState(0);
  const card = words[index];

  useEffect(() => setIndex(0), [letter]);

  const next = () => setIndex(i => (i + 1) % words.length);
  const prev = () => setIndex(i => (i - 1 + words.length) % words.length);

  return (
    <div className="grid md:grid-cols-[1fr,1fr] gap-6 items-start">
      <motion.div
        key={card.word}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className=""
      >
        <Card className="rounded-3xl shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold">Letter {letter.slice(0,1)} / {letter.slice(0,1).toLowerCase()}</h2>
              <div className="flex gap-2">
                <Button variant="ghost" className="rounded-2xl" onClick={() => speak(card.word)} aria-label="Speak">
                  <Volume2 className="h-5 w-5" />
                </Button>
                <Button variant="ghost" className="rounded-2xl" onClick={onStar} aria-label="Give Star">
                  <Star className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="grid place-items-center py-6">
              <div className="text-7xl leading-none mb-4">{card.emoji}</div>
              <div className="text-3xl font-black tracking-wide capitalize">{card.word}</div>
              <div className="mt-2 opacity-70 text-sm">({card.hint})</div>
            </div>
            <div className="flex items-center justify-between pt-4">
              <Button className="rounded-2xl" variant="secondary" onClick={prev}><ChevronLeft className="h-4 w-4 mr-1"/>Back</Button>
              <Progress value={((index+1)/words.length)*100} className="h-2"/>
              <Button className="rounded-2xl" onClick={next}>Next<ChevronRight className="h-4 w-4 ml-1"/></Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <HelpfulPronunciation words={words} />
    </div>
  );
}

interface HelpfulPronunciationProps {
  words: WordItem[];
}

function HelpfulPronunciation({ words }: HelpfulPronunciationProps) {
  return (
    <Card className="rounded-3xl bg-amber-50 border-amber-200">
      <CardContent className="p-6 text-sm leading-relaxed">
        <h3 className="font-bold mb-3">Parent / Teacher Tips</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Say the word slowly, then have your child echo it. Tap 🔊 when needed.</li>
          <li>Point to the first letter and emphasize the sound: <b>Mmm</b>, <b>Sss</b>, <b>Aa</b>, <b>Bbb</b>, <b>Iii</b>, <b>Ooo</b>.</li>
          <li>Make it playful: act out the word (e.g., pretend to <i>sipa</i> a ball ⚽).</li>
          <li>Pick 3–5 words at a time and review tomorrow for quick wins.</li>
        </ul>
        <div className="mt-4 opacity-70">Included words: {words.map(w => w.word).join(", ")}</div>
      </CardContent>
    </Card>
  );
}

interface MatchViewProps {
  letter: string;
  words: WordItem[];
  onWin: () => void;
}

// ---------------------------
// MATCH VIEW (Word ↔ Emoji)
// ---------------------------
function MatchView({ letter, words, onWin }: MatchViewProps) {
  const [round, setRound] = useState(0);
  // Use a smaller pool size for letter sets with fewer words
  const poolSize = words.length < 6 ? words.length : 6;
  const pool = useMemo(() => shuffle(words).slice(0, poolSize), [letter, round]);
  const left = useMemo(() => shuffle(pool.map(x => ({ key: x.word, label: x.word }))), [pool]);
  const right = useMemo(() => shuffle(pool.map(x => ({ key: x.word, label: x.emoji }))), [pool]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSelectedLeft(null);
    setMatches({});
  }, [letter, round]);

  const allMatched = Object.keys(matches).length === pool.length;

  useEffect(() => {
    if (allMatched) onWin();
  }, [allMatched, onWin]);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="rounded-3xl">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-lg">Tap a word, then its picture</h3>
            <Button variant="ghost" className="rounded-2xl" onClick={() => setRound(r => r + 1)}><RotateCcw className="h-4 w-4 mr-1"/>New</Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {left.map(item => (
              <Selectable
                key={item.key}
                active={selectedLeft === item.key}
                done={matches[item.key]}
                onClick={() => setSelectedLeft(item.key)}
                label={item.label}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardContent className="p-6">
          <div className="mb-4 font-bold text-lg">Pictures</div>
          <div className="grid grid-cols-3 gap-3">
            {right.map(item => (
              <Selectable
                key={item.key}
                emoji
                label={item.label}
                done={matches[item.key]}
                onClick={() => {
                  if (!selectedLeft) return;
                  if (selectedLeft === item.key) {
                    speak(item.key);
                    setMatches(m => ({ ...m, [item.key]: true }));
                    setSelectedLeft(null);
                  } else {
                    // gentle shake or feedback? just clear selection
                    setSelectedLeft(null);
                  }
                }}
              />
            ))}
          </div>
          <AnimatePresence>
            {allMatched && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex items-center gap-2 text-green-700"
              >
                <PartyPopper className="h-5 w-5"/> Great job! You matched them all. +3 ⭐
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

interface SelectableProps {
  label: string;
  onClick: () => void;
  active?: boolean;
  done?: boolean;
  emoji?: boolean;
}

function Selectable({ label, onClick, active, done, emoji }: SelectableProps) {
  return (
    <button
      disabled={done}
      onClick={onClick}
      className={
        "rounded-2xl border p-4 text-center shadow-sm transition-transform active:scale-95 " +
        (done ? "opacity-40 line-through " : active ? "ring-2 ring-amber-400 " : "")
      }
    >
      <div className={"text-3xl " + (emoji ? "" : "capitalize font-bold")}>{label}</div>
    </button>
  );
}

interface QuizViewProps {
  letter: string;
  words: WordItem[];
  onWin: () => void;
}

// ---------------------------
// QUIZ VIEW (Multiple Choice)
// ---------------------------
function QuizView({ letter, words, onWin }: QuizViewProps) {
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const questions = useMemo(() => {
    // Build questions: show an emoji, ask for the word
    const qs = shuffle(words).map(item => {
      // For letter sets with fewer words, adjust the number of wrong options
      const wrongOptionsCount = words.length >= 3 ? 2 : words.length - 1;
      const wrong = wrongOptionsCount > 0 ? 
        shuffle(words.filter(w => w.word !== item.word)).slice(0, wrongOptionsCount) : 
        [];
      const options = shuffle([item.word, ...wrong.map(w => w.word)]);
      return { prompt: item, options };
    });
    return qs;
  }, [letter]);

  useEffect(() => {
    setQIndex(0); setScore(0); setDone(false);
  }, [letter]);

  const current = questions[qIndex];

  const choose = (opt: string) => {
    const correct = opt === current.prompt.word;
    if (correct) {
      setScore(s => s + 1);
      speak(current.prompt.word);
    }
    if (qIndex + 1 >= questions.length) {
      setDone(true);
      if (correct) onWin();
    } else {
      setQIndex(i => i + 1);
    }
  };

  return (
    <Card className="rounded-3xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">What is this word?</h3>
          <Badge>Score: {score}/{questions.length}</Badge>
        </div>
        {!done ? (
          <div className="grid gap-6">
            <div className="grid place-items-center">
              <div className="text-8xl">{current.prompt.emoji}</div>
              <div className="opacity-60 mt-2">Starts with "{letter[0]}"</div>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {current.options.map(opt => (
                <Button key={opt} className="rounded-2xl text-lg" variant="secondary" onClick={() => choose(opt)}>
                  {opt}
                </Button>
              ))}
            </div>
            <Progress value={((qIndex+1)/questions.length)*100} className="h-2"/>
          </div>
        ) : (
          <div className="grid place-items-center gap-3">
            <div className="text-6xl">🎉</div>
            <div className="text-lg font-bold">Quiz Finished!</div>
            <div>You scored {score} out of {questions.length}. +2 ⭐ for a correct final answer.</div>
            <Button className="rounded-2xl mt-2" onClick={() => { setQIndex(0); setScore(0); setDone(false); }}>
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StickerBookProps {
  stars: number;
}

// ---------------------------
// STICKER BOOK (Rewards)
// ---------------------------
function StickerBook({ stars }: StickerBookProps) {
  // Unlock a sticker every 3 stars, up to 12 fun stickers
  const unlocks = Math.min(12, Math.floor(stars / 3));
  const stickers = ["🛝","🧸","🚗","🛡️","🐯","🐼","🦕","🚀","🧃","🍯","🍕","🎈"]; 

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="rounded-3xl">
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-2">Your Sticker Shelf</h3>
          <div className="grid grid-cols-6 gap-3 text-4xl">
            {stickers.map((s, i) => (
              <div key={i} className={"grid place-items-center aspect-square rounded-2xl border " + (i < unlocks ? "bg-amber-50" : "opacity-30")}>{s}</div>
            ))}
          </div>
          <div className="mt-4 text-sm opacity-70">Earn stickers by playing Match and Quiz. Every 3 ⭐ unlocks 1 sticker!</div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl bg-amber-50 border-amber-200">
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-2">How to use the Sticker Book</h3>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>Play a round of <b>Match</b> (+3 ⭐) and finish a <b>Quiz</b> with a correct final answer (+2 ⭐).</li>
            <li>When a sticker unlocks, celebrate and ask your child to name a favorite word!</li>
            <li>Review unlocked stickers at the end of the week to revisit words.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
