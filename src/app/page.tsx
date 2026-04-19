"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DreamInput from "@/components/DreamInput";
import DreamAnalysis from "@/components/DreamAnalysis";
import FutureSimulation from "@/components/FutureSimulation";
import RealityRoadmap from "@/components/RealityRoadmap";
import ProgressIndicator from "@/components/ProgressIndicator";
import AuroraBackground from "@/components/AuroraBackground";
import { ToastContainer, toast } from "react-toastify";
import { getCachedDream, setCachedDream, clearDreamCache } from "@/lib/dreamCache";
import CareerQuiz from "@/components/CareerQuiz";
import DreamCompare from "@/components/DreamCompare";
import "react-toastify/dist/ReactToastify.css";

export type AnalysisData = {
  career: string;
  summary: string;
  timeline: {
    phase: string;
    duration: string;
    goal: string;
  }[];
  skills_required: string[];
  market_demand: string;
  difficulty_level: string;
  average_salary_range: string;
  risk_factors: string[];
  success_probability_inputs: {
    interest_match: number;
    skill_alignment: number;
    market_opportunity: number;
    competition_level: number;
  };
  fromCache?: boolean;
};

export default function Home() {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<"dream" | "guide" | "compare">("dream");
  const [direction, setDirection] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([1]));
  const [dream, setDream] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  const hasGenerated = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const navigateTo = (newStep: number) => {
    if (newStep === 1) {
      clearDreamCache();
      setDream("");
      setAnalysis(null);
      setMode("dream");
      hasGenerated.current = false;
      window.dispatchEvent(new CustomEvent("api-cache-clear"));
    }
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
    setVisitedSteps(prev => new Set([...Array.from(prev), newStep]));
  };

  const handleDreamSubmit = async (inputDream: string) => {
    if (hasGenerated.current) return;
    
    setDream(inputDream);
    
    // 1. Check local cache
    const cached = getCachedDream(inputDream);
    if (cached) {
      setAnalysis({ ...cached, fromCache: true });
      hasGenerated.current = true;
      window.dispatchEvent(new CustomEvent("api-cache-hit", { detail: { type: 'local' } }));
      navigateTo(2);
      return;
    }

    // Pass to Step 2 which will handle the API call
    navigateTo(2);
  };

  // Called by DreamAnalysis when API returns
  const handleAnalysisResult = (data: AnalysisData) => {
    setAnalysis(data);
    hasGenerated.current = true;
    setCachedDream(dream, data);
    if (data.fromCache) {
      window.dispatchEvent(new CustomEvent("api-cache-hit", { detail: { type: 'server' } }));
    }
  };

  const handleStartSimulation = () => {
    navigateTo(3);
  };

  const handleSimulationComplete = () => {
    navigateTo(4);
  };

  const titleChars = "Dream2Reality AI".split("");

  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.12, when: "beforeChildren" }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: "easeOut" as const } 
    }
  };

  const charVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" as const } }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

  return (
    <main className="container mx-auto px-4 pt-[56px] pb-8 min-h-screen relative overflow-x-hidden">
      {!prefersReducedMotion && <AuroraBackground />}
      
      <motion.div 
        className="max-w-6xl mx-auto relative z-10"
        initial="hidden"
        animate="visible"
        variants={pageVariants}
      >
        {/* Header Section */}
        <div className="text-center mb-12 mt-12 flex flex-col items-center">
          <motion.div 
            className="flex flex-wrap justify-center overflow-hidden mb-4"
            variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
          >
            {titleChars.map((char, index) => (
              <motion.span
                key={index}
                variants={charVariants}
                className={`text-5xl md:text-7xl font-black tracking-tight ${char === " " ? "mx-2" : "gradient-text"}`}
              >
                {char}
              </motion.span>
            ))}
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-zinc-400 text-lg md:text-xl font-medium"
          >
            Experience your future before you live it.
          </motion.p>
        </div>

        {/* Current Flow Visualization */}
        <motion.div variants={childVariants} className="w-full">
          <ProgressIndicator 
            currentStep={step} 
            visitedSteps={visitedSteps} 
            onStepClick={navigateTo}
          />
        </motion.div>

        <motion.div variants={childVariants} className="mt-12 overflow-hidden relative min-h-[500px] w-full">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full"
            >
              <div className="flex flex-col gap-8">
                {step > 1 && (
                  <button 
                    onClick={() => navigateTo(step - 1)}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors w-fit group"
                  >
                    <div className="p-2 rounded-full border border-zinc-800 group-hover:border-white transition-all">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="font-bold uppercase tracking-widest text-[10px]">Back</span>
                  </button>
                )}

                {step === 1 && (
                  <div className="space-y-12">
                     <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-full w-fit mx-auto shadow-xl backdrop-blur-md">
                      {[
                        { id: "dream", label: "🚀 My Dream" },
                        { id: "guide", label: "🧭 Guide Me" },
                        { id: "compare", label: "⚔️ Compare" }
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            if (m.id === "dream" || m.id === "guide" || m.id === "compare") {
                              setMode(m.id);
                            }
                          }}
                          className={`px-6 py-2 rounded-full text-[13px] font-bold transition-all duration-300 ${
                            mode === m.id 
                              ? "bg-[#7c6af7] text-white shadow-[0_4px_15px_rgba(124,106,247,0.4)]" 
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      {mode === "dream" ? (
                        <motion.div
                          key="mode-dream"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.3 }}
                        >
                          <DreamInput onSubmit={handleDreamSubmit} />
                        </motion.div>
                      ) : mode === "guide" ? (
                        <motion.div
                          key={`mode-guide-${Date.now()}`}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CareerQuiz onSimulate={(d) => {
                            setDream(d);
                            setMode("dream");
                            setTimeout(() => handleDreamSubmit(d), 500);
                          }} />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="mode-compare"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.3 }}
                        >
                          <DreamCompare onExplore={(d) => {
                             setDream(d);
                             setMode("dream");
                             setTimeout(() => handleDreamSubmit(d), 500);
                          }} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {step === 2 && (
                  <DreamAnalysis 
                    dream={dream} 
                    initialData={analysis}
                    onAnalysisComplete={handleAnalysisResult} 
                    onProceed={handleStartSimulation}
                  />
                )}

                {step === 3 && (
                  <FutureSimulation 
                    dream={dream} 
                    onComplete={handleSimulationComplete} 
                  />
                )}

                {step === 4 && (
                  <RealityRoadmap dream={dream} />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
      <ToastContainer position="bottom-right" theme="dark" />
    </main>
  );
}
