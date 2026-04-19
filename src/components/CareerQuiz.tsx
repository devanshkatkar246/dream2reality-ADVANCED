"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Loader2, Trophy, ArrowRight, RotateCcw } from "lucide-react";
import { fetchWithRetry } from "@/lib/fetchWithRetry";
import { toast } from "react-toastify";

const QUESTIONS = [
  {
    id: "energy",
    question: "What energizes you the most?",
    options: [
      { label: "Building & creating things", value: "builder" },
      { label: "Helping & teaching people", value: "helper" },
      { label: "Solving complex problems", value: "solver" },
      { label: "Leading & organizing", value: "leader" },
      { label: "Creating art & stories", value: "creator" }
    ]
  },
  {
    id: "subjects",
    question: "Which subjects did you enjoy most?",
    options: [
      { label: "Maths & Science", value: "stem" },
      { label: "Commerce & Economics", value: "commerce" },
      { label: "Arts & Humanities", value: "arts" },
      { label: "Computers & Technology", value: "tech" },
      { label: "Biology & Nature", value: "biology" }
    ]
  },
  {
    id: "strength",
    question: "What is your biggest strength?",
    options: [
      { label: "Analytical thinking", value: "analytical" },
      { label: "Creative thinking", value: "creative" },
      { label: "Working with people", value: "people" },
      { label: "Highly organized", value: "organized" },
      { label: "Natural leader", value: "leadership" }
    ]
  },
  {
    id: "environment",
    question: "What work environment appeals to you?",
    options: [
      { label: "Startup — fast & high risk/reward", value: "startup" },
      { label: "Corporate — stable & structured", value: "corporate" },
      { label: "Freelance — independent & flexible", value: "freelance" },
      { label: "Non-profit — meaningful work", value: "nonprofit" },
      { label: "Research — deep & academic", value: "research" }
    ]
  },
  {
    id: "priority",
    question: "What matters most to you in a career?",
    options: [
      { label: "High salary", value: "money" },
      { label: "Creative freedom", value: "creativity" },
      { label: "Making an impact", value: "impact" },
      { label: "Work-life balance", value: "balance" },
      { label: "Prestige & recognition", value: "prestige" }
    ]
  }
];

interface Recommendation {
  rank: number;
  career: string;
  company_example: string;
  matchScore: number;
  whyMatch: string;
  salary: string;
  timeToReady: string;
  difficulty: string;
  dreamStatement: string;
}

interface QuizResults {
  personalityType: string;
  personalitySummary: string;
  recommendations: Recommendation[];
}

export default function CareerQuiz({ onSimulate }: { onSimulate: (dream: string) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<QuizResults | null>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("d2r_quiz_answers");
    if (saved) setAnswers(JSON.parse(saved));
  }, []);

  const handleOptionClick = async (val: string) => {
    const newAnswers = [...answers.slice(0, step), val];
    setAnswers(newAnswers);
    localStorage.setItem("d2r_quiz_answers", JSON.stringify(newAnswers));

    if (step < QUESTIONS.length - 1) {
      setTimeout(() => setStep(step + 1), 300);
    } else {
      // Analyze
      await analyzeProfile(newAnswers);
    }
  };

  const analyzeProfile = async (currentAnswers: string[]) => {
    setLoading(true);
    try {
      const res = await fetchWithRetry("/api/career-guidance", {
        method: "POST",
        body: JSON.stringify({ answers: currentAnswers }),
        headers: { "Content-Type": "application/json" }
      });
      setResults(res);
      if (res.recommendations?.[0]) {
        localStorage.setItem("d2r_last_quiz_rec", res.recommendations[0].dreamStatement);
      }
      if (res.fromCache) {
        window.dispatchEvent(new CustomEvent('api-cache-hit', { detail: { type: 'server' } }));
      }
    } catch (err: any) {
      toast.error("Quiz analysis failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setStep(0);
    setAnswers([]);
    setResults(null);
    setLoading(false);
    localStorage.removeItem("d2r_quiz_answers");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <Loader2 size={40} className="text-primary animate-spin" />
        <p className="text-xl font-medium animate-pulse">Analyzing your profile...</p>
      </div>
    );
  }

  if (results) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center space-y-3">
          <span className="px-4 py-1.5 bg-[#7c6af7]/20 text-[#a594ff] rounded-full text-[12px] font-black uppercase tracking-widest border border-[#7c6af7]/30 inline-block">
            You are: {results.personalityType}
          </span>
          <p className="text-zinc-400 text-sm italic max-w-lg mx-auto leading-relaxed">
            "{results.personalitySummary}"
          </p>
        </div>

        <div className="space-y-4">
          {results.recommendations.map((rec, i) => (
            <motion.div
              key={rec.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="glass-card p-6 border border-white/10 rounded-2xl group hover:border-[#7c6af7]/40 transition-all flex flex-col md:flex-row gap-6 relative"
            >
              <div className={`absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center font-black text-white/20 text-2xl group-hover:text-white/40 transition-colors`}>
                #{rec.rank}
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-white pr-10">{rec.career}</h4>
                  <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{rec.company_example}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500 text-[13px] font-black">{rec.matchScore}% match</span>
                  <span className="text-zinc-600">•</span>
                  <p className="text-zinc-500 text-[12px] italic">{rec.whyMatch}</p>
                </div>

                <div className="flex gap-4 pt-2">
                   <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">SALARY</span>
                      <span className="text-[13px] text-white font-mono">{rec.salary}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">TIME</span>
                      <span className="text-[13px] text-white font-mono">{rec.timeToReady}</span>
                   </div>
                </div>
              </div>

              <button 
                onClick={() => onSimulate(rec.dreamStatement)}
                className="bg-[#7c6af7]/10 hover:bg-[#7c6af7] text-[#a594ff] hover:text-white border border-[#7c6af7]/30 rounded-xl px-6 py-3 font-bold text-sm transition-all flex items-center gap-2"
              >
                Simulate <ArrowRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>

        <button 
          onClick={resetQuiz}
          className="flex items-center gap-2 mx-auto text-zinc-500 hover:text-white text-[12px] font-bold uppercase tracking-tighter"
        >
          <RotateCcw size={14} /> Retake Quiz
        </button>
      </motion.div>
    );
  }

  const q = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-[11px] font-black text-zinc-600 uppercase tracking-[0.2em]">
          <span>Question {step + 1}/{QUESTIONS.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-primary"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {step > 0 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 text-zinc-500 hover:text-white transition-colors text-xs font-bold"
            >
              <ChevronLeft size={14} /> Back
            </button>
          )}

          <h3 className="text-xl md:text-2xl font-bold text-white text-center">
            {q.question}
          </h3>

          <div className="flex flex-col gap-3">
            {q.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleOptionClick(opt.value)}
                className={`w-full p-4 rounded-xl text-left text-sm font-medium transition-all backdrop-blur-sm ${
                  answers[step] === opt.value
                    ? "bg-[#7c6af7]/10 border-[#7c6af7] text-white"
                    : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:border-white/20"
                } border`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
