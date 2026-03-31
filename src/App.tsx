/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
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
    options: ["Writing", "Design", "Coding", "Teaching", "Marketing", "Crafts", "Other"],
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

export default function App() {
  const [view, setView] = useState<'landing' | 'quiz' | 'loading' | 'results' | 'error'>('landing');
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    skills: '',
    hours: '',
    budget: '',
    goal: '',
    workStyle: '',
    speed: ''
  });
  const [results, setResults] = useState<Hustle[]>([]);
  const [error, setError] = useState<string | null>(null);

  const startQuiz = () => {
    setView('quiz');
    setCurrentStep(0);
  };

  const handleAnswer = (option: string) => {
    const currentQuestionId = QUESTIONS[currentStep].id;
    const updatedAnswers = { ...answers, [currentQuestionId]: option };
    setAnswers(updatedAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      generateHustles(updatedAnswers);
    }
  };

  const generateHustles = async (finalAnswers: QuizAnswers) => {
    setView('loading');
    setError(null);

    try {
      const response = await fetch("/api/generate-hustles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalAnswers),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data: HustleResponse = await response.json();

      if (data.hustles && data.hustles.length > 0) {
        const sortedHustles = [...data.hustles].sort((a, b) => b.fit_score - a.fit_score);
        setResults(sortedHustles);
        setView('results');
      } else {
        throw new Error("No hustles found in response");
      }
    } catch (apiError) {
      console.error("API Error:", apiError);
      setError("Something went wrong with the AI analysis. Please try again.");
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
    setView('landing');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-amber-100 text-amber-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
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
              <button 
                onClick={startQuiz}
                className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-primary rounded-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Start My Assessment
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
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
              </div>
            </motion.div>
          )}

          {view === 'loading' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6 py-12"
            >
              <div className="relative inline-block">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Analyzing your profile…</h2>
                <p className="text-gray-500">Our AI is matching your skills with current market opportunities.</p>
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
                {results.map((hustle, index) => (
                  <motion.div
                    key={hustle.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative bg-gray-50 rounded-3xl p-6 md:p-8 border-2 ${index === 0 ? 'border-primary shadow-xl ring-4 ring-primary/5' : 'border-transparent shadow-sm'}`}
                  >
                    {index === 0 && (
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
                      <button
                        onClick={() => shareResult(hustle.name, hustle.monthly_income)}
                        className="inline-flex items-center justify-center px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        <Share2 className="w-5 h-5 mr-2" />
                        Share
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

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
                <h2 className="text-2xl font-bold text-gray-900">Oops! Something went wrong</h2>
                <p className="text-gray-500 max-w-sm mx-auto">{error || "We couldn't generate your results. Please try again."}</p>
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
      
      <footer className="mt-12 text-center text-gray-400 text-sm">
        <p>© 2026 AI Side Hustle Finder • Free & AI-Powered</p>
      </footer>
    </div>
  );
}
