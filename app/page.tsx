"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Volume2, RotateCcw, PartyPopper, Star, Info, ChevronRight, ChevronLeft } from "lucide-react";

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
  // Try to find Filipino or Tagalog voice first
  const filipinoVoice = voices.find(v => /fil|tag/i.test(v.lang));
  
  // If Filipino voice is available, use it
  if (filipinoVoice) {
    utter.voice = filipinoVoice;
  } else {
    // Otherwise use a female voice which tends to sound better for Filipino
    const femaleVoice = voices.find(v => v.name.includes('Female'));
    if (femaleVoice) utter.voice = femaleVoice;
  }
  
  // Adjust speech parameters for Filipino accent
  utter.rate = 0.75; // Slower rate for clearer pronunciation
  utter.pitch = 1.2; // Slightly higher pitch for Filipino accent
  
  // Add slight pauses between syllables for Filipino words
  // This helps with the rhythm of Filipino pronunciation
  const enhancedText = addFilipinoPronunciationHints(text);
  utter.text = enhancedText;
  
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

// Web Speech: enhanced Filipino pronunciation
function speak(text: string) {
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
  // Don't modify the actual text that will be displayed
  // Just add subtle pronunciation hints for the speech engine
  
  // Common Filipino pronunciation patterns
  let enhancedText = text
    // Ensure proper stress on vowels
    .replace(/a/g, 'ah')
    .replace(/e/g, 'eh')
    .replace(/i/g, 'ee')
    .replace(/o/g, 'oh')
    .replace(/u/g, 'oo')
    
    // Handle common Filipino consonant combinations
    .replace(/ng/g, 'n-g')
    .replace(/ay/g, 'ai')
    .replace(/aw/g, 'au');
    
  return enhancedText;
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
