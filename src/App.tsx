/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCcw, 
  Share2, 
  Loader2,
  Trophy,
  Zap,
  Clock,
  Euro,
  Target,
  User,
  Briefcase
} from "lucide-react";

// Types for the application
interface Tool {
  name: string;
  purpose: string;
  url: string;
}

interface Hustle {
  name: string;
  tagline: string;
  fit_score: number;
  monthly_income: string;
  time_to_first_income: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  why_perfect: string;
  first_3_steps: string[];
  tools: Tool[];
}

interface HustleResponse {
  hustles: Hustle[];
}

interface QuizAnswers {
  skills: string;
  hours: string;
  budget: string;
  goal: string;
  workStyle: string;
  speed: string;
}

const QUESTIONS = [
  {
    id: 'skills',
    question: "What are your top skills?",
    options: ["Writing", "Design", "Coding", "Teaching", "Marketing", "Crafts"],
    icon: <Briefcase className="w-6 h-6" />
  },
  {
    id: 'hours',
    question: "Hours per week available?",
    options: ["1–5", "5–10", "10–20", "20+"],
    icon: <Clock className="w-6 h-6" />
  },
  {
    id: 'budget',
    question: "Starting budget?",
    options: ["€0 — I want free", "Under €100", "€100–500", "€500+"],
    icon: <Euro className="w-6 h-6" />
  },
  {
    id: 'goal',
    question: "Main goal?",
    options: ["Extra €500/mo", "Replace my salary", "Build a brand", "Financial freedom"],
    icon: <Target className="w-6 h-6" />
  },
  {
    id: 'workStyle',
    question: "Work style?",
    options: ["Solo creative work", "Working with clients", "Selling products", "Teaching others"],
    icon: <User className="w-6 h-6" />
  },
  {
    id: 'speed',
    question: "How fast do you need money?",
    options: ["This week", "Within a month", "3–6 months, I'm patient"],
    icon: <Zap className="w-6 h-6" />
  }
];

interface HustleCardProps {
  key?: string;
  hustle: Hustle;
  index: number;
  isBestMatch: boolean;
  isSaved: boolean;
  onToggleSave: (hustle: Hustle) => void;
  onShare: (name: string, income: string) => void;
}

function HustleCard({ hustle, index, isBestMatch, isSaved, onToggleSave, onShare }: HustleCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-amber-100 text-amber-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative bg-gray-50 rounded-3xl p-6 md:p-8 border-2 ${isBestMatch ? 'border-primary shadow-xl ring-4 ring-primary/5' : 'border-transparent shadow-sm'}`}
    >
      {isBestMatch && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold flex items-center shadow-lg">
          <Trophy className="w-4 h-4 mr-2" />
          Best Match
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{hustle.name}</h3>
          <p className="text-gray-500 font-medium">{hustle.tagline}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getDifficultyColor(hustle.difficulty)}`}>
            {hustle.difficulty}
          </span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="space-y-1">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-gray-600">Fit Score</span>
            <span className="text-primary">{hustle.fit_score}%</span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${hustle.fit_score}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 uppercase font-bold">Potential</p>
            <p className="text-lg font-bold text-gray-900">{hustle.monthly_income}</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 uppercase font-bold">Time to Pay</p>
            <p className="text-lg font-bold text-gray-900">{hustle.time_to_first_income}</p>
          </div>
        </div>
      </div>

      <div className="bg-white/50 p-4 rounded-2xl mb-6 italic text-gray-700 border border-gray-100">
        "{hustle.why_perfect}"
      </div>

      <div className="space-y-4 mb-8">
        <h4 className="font-bold text-gray-900 flex items-center">
          <CheckCircle2 className="w-5 h-5 mr-2 text-primary" />
          First 3 Steps
        </h4>
        <div className="space-y-3">
          {hustle.first_3_steps.map((step, i) => (
            <div key={i} className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                {i + 1}
              </span>
              <p className="text-gray-600">{step}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <h4 className="font-bold text-gray-900">Tools You'll Need</h4>
        <div className="flex flex-wrap gap-2">
          {hustle.tools.map((tool) => (
            <a
              key={tool.name}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-primary hover:text-primary transition-colors shadow-sm"
            >
              {tool.name} — {tool.purpose}
              <ExternalLink className="ml-2 w-3 h-3" />
            </a>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={hustle.tools[0]?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg"
        >
          Start this hustle →
        </a>
        <div className="flex gap-2">
          <button
            onClick={() => onToggleSave(hustle)}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-3 border-2 rounded-xl font-bold transition-all ${
              isSaved
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-white border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
            }`}
          >
            <CheckCircle2 className={`w-5 h-5 mr-2 ${isSaved ? 'fill-primary' : ''}`} />
            {isSaved ? "Saved" : "Save"}
          </button>
          <button
            onClick={() => onShare(hustle.name, hustle.monthly_income)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [view, setView] = useState<'landing' | 'quiz' | 'loading' | 'results' | 'error' | 'saved'>('landing');
  const [currentStep, setCurrentStep] = useState(0);
  const [customChoice, setCustomChoice] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswers>({
    skills: '',
    hours: '',
    budget: '',
    goal: '',
    workStyle: '',
    speed: ''
  });
  const [results, setResults] = useState<Hustle[]>([]);
  const [savedHustles, setSavedHustles] = useState<Hustle[]>(() => {
    const saved = localStorage.getItem('saved_hustles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load saved hustles", e);
      }
    }
    return [];
  });
  const [error, setError] = useState<{ message: string; type: 'api' | 'parse' | 'unknown' } | null>(null);

  // Persist saved hustles
  useEffect(() => {
    localStorage.setItem('saved_hustles', JSON.stringify(savedHustles));
  }, [savedHustles]);

  const toggleSaveHustle = (hustle: Hustle) => {
    setSavedHustles(prev => {
      const isSaved = prev.some(h => h.name === hustle.name);
      if (isSaved) {
        return prev.filter(h => h.name !== hustle.name);
      }
      return [...prev, hustle];
    });
  };

  const startQuiz = () => {
    setView('quiz');
    setCurrentStep(0);
  };

  const handleAnswer = (option: string) => {
    if (option === 'Other') {
      setShowCustomInput(true);
      return;
    }

    const currentQuestionId = QUESTIONS[currentStep].id;
    const updatedAnswers = { ...answers, [currentQuestionId]: option };
    setAnswers(updatedAnswers);
    setShowCustomInput(false);
    setCustomChoice('');

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      generateHustles(updatedAnswers);
    }
  };

  const handleCustomSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (customChoice.trim()) {
      handleAnswer(customChoice.trim());
    }
  };

  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const LOADING_MESSAGES = [
    "Analyzing your unique skill set...",
    "Scanning market opportunities...",
    "Matching with high-potential niches...",
    "Calculating fit scores...",
    "Personalizing your action plan...",
    "Finding the best tools for you...",
    "Finalizing your side hustle roadmap..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    if (view === 'loading') {
      setLoadingProgress(0);
      setLoadingMessageIndex(0);

      // Cycle through messages
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);

      // Simulate progress bar (up to 95%, then wait for actual API)
      progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev < 95) return prev + Math.random() * 5;
          return prev;
        });
      }, 300);
    }

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [view]);

  const generateHustles = async (finalAnswers: QuizAnswers) => {
    setView('loading');
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const prompt = `
        Analyze these 6 answers from a side hustle quiz and return a valid JSON object only, no markdown, no explanation.
        
        User Profile:
        - Skills: ${finalAnswers.skills}
        - Hours available: ${finalAnswers.hours}
        - Budget: ${finalAnswers.budget}
        - Goal: ${finalAnswers.goal}
        - Work Style: ${finalAnswers.workStyle}
        - Speed needed: ${finalAnswers.speed}

        Return exactly 3 hustle objects with this exact structure:
        {
          "hustles": [
            {
              "name": "Hustle Name",
              "tagline": "Short catchy tagline",
              "fit_score": 92,
              "monthly_income": "€X–Y/mo",
              "time_to_first_income": "Timeframe",
              "difficulty": "Beginner/Intermediate/Advanced",
              "why_perfect": "Two sentences personalized to the user's exact answers explaining why this fits them specifically.",
              "first_3_steps": ["Step 1", "Step 2", "Step 3"],
              "tools": [
                { "name": "Tool Name", "purpose": "Tool Purpose", "url": "https://toolurl.com" }
              ]
            }
          ]
        }

        Choose tools from: Fiverr, Upwork, Shopify, Teachable, Gumroad, Canva, Notion, Coursera, Skillshare, ConvertKit, Squarespace, Etsy.
        Pick the 2–3 most relevant tools per hustle.
      `;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = response.text || "";
      const cleanJson = text.replace(/```json|```/g, "").trim();
      
      try {
        const data: HustleResponse = JSON.parse(cleanJson);
        if (data.hustles && data.hustles.length > 0) {
          const sortedHustles = [...data.hustles].sort((a, b) => b.fit_score - a.fit_score);
          setResults(sortedHustles);
          setView('results');
        } else {
          throw new Error("Empty hustles array");
        }
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError, cleanJson);
        setError({
          type: 'parse',
          message: "The AI generated a response, but we couldn't read it properly. This usually happens when the AI gets too creative with the formatting."
        });
        setView('error');
      }
    } catch (apiError) {
      console.error("API Error:", apiError);
      setError({
        type: 'api',
        message: "We couldn't connect to our AI engine. Please check your internet connection or try again in a few moments."
      });
      setView('error');
    }
  };

  const shareResult = (hustleName: string, income: string) => {
    const text = `I just found my perfect side hustle using AI — ${hustleName}, ${income} potential. Find yours free: ${window.location.href}`;
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const resetQuiz = () => {
    setAnswers({
      skills: '',
      hours: '',
      budget: '',
      goal: '',
      workStyle: '',
      speed: ''
    });
    setCurrentStep(0);
    setShowCustomInput(false);
    setCustomChoice('');
    setView('landing');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl">
        
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6"
            >
              <div className="inline-block p-3 bg-primary/10 rounded-2xl mb-4">
                <Zap className="w-12 h-12 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                Find Your Perfect Side Hustle in 60 Seconds — <span className="text-primary">Free</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-lg mx-auto">
                Answer 6 simple questions. Get a personalized AI plan to start making extra income today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={startQuiz}
                  className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-primary rounded-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary w-full sm:w-auto"
                >
                  Start My Assessment
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                {savedHustles.length > 0 && (
                  <button 
                    onClick={() => setView('saved')}
                    className="inline-flex items-center justify-center px-8 py-4 font-bold text-gray-700 transition-all duration-200 bg-white border-2 border-gray-200 rounded-xl hover:border-primary hover:text-primary focus:outline-none w-full sm:w-auto"
                  >
                    <Trophy className="mr-2 w-5 h-5 text-amber-500" />
                    My Saved Hustles ({savedHustles.length})
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {view === 'quiz' && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <button
                    onClick={resetQuiz}
                    className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center"
                  >
                    <ArrowRight className="w-3 h-3 mr-1 rotate-180" />
                    Exit Quiz
                  </button>
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider">Question {currentStep + 1} of 6</span>
                  <span className="text-sm text-gray-400">{Math.round(((currentStep + 1) / 6) * 100)}% Complete</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / 6) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-8 rounded-3xl space-y-6 border border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    {QUESTIONS[currentStep].icon}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{QUESTIONS[currentStep].question}</h2>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {!showCustomInput ? (
                    <>
                      <div className="grid grid-cols-1 gap-3">
                        {QUESTIONS[currentStep].options.map((option) => (
                          <button
                            key={option}
                            onClick={() => handleAnswer(option)}
                            className="w-full text-left p-4 rounded-xl border-2 border-white bg-white hover:border-primary hover:bg-primary/5 transition-all duration-200 shadow-sm font-medium text-gray-700"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => setShowCustomInput(true)}
                          className="flex items-center justify-center p-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-primary hover:text-primary transition-all text-sm font-bold"
                        >
                          Other
                        </button>
                        <button
                          onClick={() => handleAnswer('None / Not Applicable')}
                          className="flex items-center justify-center p-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-primary hover:text-primary transition-all text-sm font-bold"
                        >
                          None
                        </button>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleCustomSubmit} className="space-y-4">
                      <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Custom Answer</p>
                        <p className="text-sm text-gray-600">Please specify your answer for: <span className="font-bold">"{QUESTIONS[currentStep].question}"</span></p>
                      </div>
                      <input
                        autoFocus
                        type="text"
                        value={customChoice}
                        onChange={(e) => setCustomChoice(e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full p-4 rounded-xl border-2 border-primary bg-white focus:outline-none shadow-sm font-medium text-gray-700"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={!customChoice.trim()}
                          className="flex-1 p-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomInput(false);
                            setCustomChoice('');
                          }}
                          className="px-6 p-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {view === 'loading' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="text-center space-y-8 py-12"
            >
              <div className="flex justify-end">
                <button
                  onClick={resetQuiz}
                  className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
                >
                  Cancel Analysis
                </button>
              </div>
              <div className="relative inline-block">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-20 h-20 text-primary opacity-20" />
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-4 h-4 bg-primary rounded-full shadow-[0_0_15px_rgba(91,33,182,0.5)]"
                  />
                </div>
              </div>

              <div className="space-y-6 max-w-sm mx-auto">
                <div className="space-y-2 min-h-[80px] flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    <motion.h2 
                      key={loadingMessageIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-2xl font-bold text-gray-900 leading-tight"
                    >
                      {LOADING_MESSAGES[loadingMessageIndex]}
                    </motion.h2>
                  </AnimatePresence>
                  <p className="text-gray-500">Just a few more seconds...</p>
                </div>

                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200 p-0.5">
                    <motion.div 
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${loadingProgress}%` }}
                      transition={{ type: "spring", stiffness: 50 }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>Initializing</span>
                    <span>{Math.round(loadingProgress)}%</span>
                    <span>Ready</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      y: [0, -10, 0],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{ 
                      duration: 0.6, 
                      repeat: Infinity, 
                      delay: i * 0.2 
                    }}
                    className="w-2 h-2 bg-primary rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {view === 'results' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">Your Personalized Hustle Plan</h2>
                <p className="text-gray-600">We found 3 opportunities that match your profile perfectly.</p>
              </div>

              <div className="space-y-6">
                {results.map((hustle: Hustle, index: number) => (
                  <HustleCard
                    key={hustle.name}
                    hustle={hustle}
                    index={index}
                    isBestMatch={index === 0}
                    isSaved={savedHustles.some(h => h.name === hustle.name)}
                    onToggleSave={toggleSaveHustle}
                    onShare={shareResult}
                  />
                ))}
              </div>

              {savedHustles.length > 0 && (
                <div className="pt-12 border-t border-gray-100 text-center">
                  <button
                    onClick={() => setView('saved')}
                    className="inline-flex items-center px-8 py-4 bg-amber-50 text-amber-700 border-2 border-amber-200 rounded-2xl font-bold hover:bg-amber-100 transition-all shadow-sm"
                  >
                    <Trophy className="w-6 h-6 mr-3" />
                    View All My Saved Hustles ({savedHustles.length})
                  </button>
                </div>
              )}

              <div className="flex justify-center pt-8">
                <button
                  onClick={resetQuiz}
                  className="inline-flex items-center text-gray-500 hover:text-primary font-bold transition-colors"
                >
                  <RefreshCcw className="w-5 h-5 mr-2" />
                  Retake Quiz
                </button>
              </div>
            </motion.div>
          )}

          {view === 'saved' && (
            <motion.div 
              key="saved"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => results.length > 0 ? setView('results') : setView('landing')}
                  className="text-gray-500 hover:text-primary font-bold flex items-center transition-colors"
                >
                  <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                  Back
                </button>
                <h2 className="text-2xl font-bold text-gray-900">My Saved Hustles</h2>
              </div>

              <div className="space-y-6">
                {savedHustles.map((hustle: Hustle, index: number) => (
                  <HustleCard
                    key={hustle.name}
                    hustle={hustle}
                    index={index}
                    isBestMatch={false}
                    isSaved={true}
                    onToggleSave={toggleSaveHustle}
                    onShare={shareResult}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {view === 'error' && (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-6 py-12"
            >
              <div className="inline-block p-4 bg-red-50 rounded-full">
                <RefreshCcw className="w-12 h-12 text-red-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {error?.type === 'api' ? 'Connection Error' : 'Analysis Error'}
                </h2>
                <p className="text-gray-500 max-w-sm mx-auto">
                  {error?.message || "We couldn't generate your results. Please try again."}
                </p>
                <div className="pt-4 text-sm text-gray-400">
                  <p className="font-bold uppercase tracking-widest text-[10px] mb-2">Recommended Next Steps:</p>
                  <ul className="space-y-1">
                    <li>• Check your internet connection</li>
                    <li>• Refresh the page and try again</li>
                    <li>• Ensure your skills are clearly selected</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={resetQuiz}
                className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      
      <footer className="mt-12 py-8 border-t border-gray-100 text-center space-y-4">
        <div className="max-w-lg mx-auto px-4">
          <h5 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Monetization Disclosure</h5>
          <p className="text-xs text-gray-500 leading-relaxed">
            AI Side Hustle Finder is 100% free to use. To keep this service free, we may receive a commission when you click on some of the tool links and make a purchase. This does not affect our recommendations, which are generated purely by AI based on your unique profile.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
            {["Fiverr", "Upwork", "Shopify", "Teachable", "Gumroad", "Canva", "Notion", "Coursera", "Skillshare", "ConvertKit", "Squarespace", "Etsy"].map(partner => (
              <span key={partner} className="text-[10px] text-gray-400 font-medium">{partner}</span>
            ))}
          </div>
        </div>
        <p className="text-gray-400 text-xs pt-4">© 2026 AI Side Hustle Finder • Free & AI-Powered</p>
      </footer>
    </div>
  );
}
