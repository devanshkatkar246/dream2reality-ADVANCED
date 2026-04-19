"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Zap, Info } from "lucide-react";
import { toast } from "react-toastify";

import { fetchWithRetry } from "@/lib/fetchWithRetry";

interface RealityData {
  score: number;
  scoreBreakdown: {
    complexity: number;
    feasibility: number;
    readiness: number;
  };
  verdict: string;
  strengths: string[];
  keyGaps: string[];
  topActions: string[];
}

export default function RealityScore({ dream }: { dream: string }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RealityData | null>(null);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const result = await fetchWithRetry("/api/score", {
          method: "POST",
          body: JSON.stringify({ dream }),
          headers: { "Content-Type": "application/json" },
        });
        setData(result);
      } catch (err: any) {
        toast.error("Reality Score failed: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, [dream]);

  useEffect(() => {
    if (data?.score !== undefined) {
      setDisplayScore(0);
      const target = data.score;
      const duration = 1500;
      const interval = 20;
      const steps = duration / interval;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setDisplayScore(target);
          clearInterval(timer);
        } else {
          setDisplayScore(Math.floor(current));
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [data?.score]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-4">
        <Loader2 size={32} className="text-primary animate-spin" />
        <h4 className="text-lg font-bold">Calculating Reality Score...</h4>
      </div>
    );
  }

  if (!data) return null;

  const getScoreColor = (score: number) => {
    if (score >= 71) return "text-emerald-500 shadow-emerald-500/50";
    if (score >= 41) return "text-amber-500 shadow-amber-500/50";
    return "text-red-500 shadow-red-500/50";
  };

  const getVerdict = (score: number) => {
    if (score >= 90) return "Exceptional — this dream is within reach right now.";
    if (score >= 75) return "Strong foundation — you're closer than you think.";
    if (score >= 60) return "Good start — focused effort will get you there.";
    if (score >= 40) return "Challenging but possible — it will take real commitment.";
    return "Ambitious dream — expect a long but rewarding journey.";
  };

  const strengths = data.strengths?.length > 0 ? data.strengths : [
    "Your ambition and clarity of vision",
    "Choosing a high-demand field",
    "Starting early gives you time advantage"
  ];
  const keyGaps = data.keyGaps?.length > 0 ? data.keyGaps : [
    "Specific technical skills need building",
    "Portfolio and practical experience",
    "Industry network and connections"
  ];
  const topActions = data.topActions?.length > 0 ? data.topActions : [
    "Research the top 3 courses for this career today",
    "Connect with 1 professional in this field on LinkedIn",
    "Set a 90-day learning goal and track it weekly"
  ];

  const handleShare = () => {
    const shareText = `I scored ${data.score}/100 on Dream2Reality AI for my dream of ${dream}. Check your own reality score at dream2reality.ai`;
    navigator.clipboard.writeText(shareText);
    toast.success("Copied! Share your journey 🚀", {
      position: "bottom-center",
      autoClose: 3000,
    });
  };

  return (
    <div className="glass-card p-10 rounded-3xl relative overflow-hidden flex flex-col items-center text-center">
      <div className="absolute top-0 right-0 p-6 opacity-20">
        <Zap size={100} className="text-primary translate-x-12 -translate-y-12" />
      </div>

      <h3 className="text-3xl font-bold mb-2">Reality Score</h3>
      <div className={`text-8xl font-black flex items-baseline gap-1 transition-colors duration-500 ${getScoreColor(displayScore)}`}>
        {displayScore}
        <span className="text-3xl text-zinc-600">/100</span>
      </div>

      <p className="text-[14px] italic text-zinc-400 mt-2 mb-6 max-w-lg">
        {data.verdict || getVerdict(data.score)}
      </p>

      {/* Sub-Score Bars */}
      <div className="w-full max-w-sm space-y-3 mb-10">
        {[
          { label: "Complexity", val: data.scoreBreakdown?.complexity || 50, color: "#7c6af7" },
          { label: "Feasibility", val: data.scoreBreakdown?.feasibility || 50, color: "#14b8a6" },
          { label: "Readiness", val: data.scoreBreakdown?.readiness || 50, color: "#22c55e" }
        ].map((bar, i) => (
          <div key={bar.label} className="w-full">
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
              <span>{bar.label}</span>
              <span className="font-mono">{bar.val}</span>
            </div>
            <div className="h-[4px] bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${bar.val}%` }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: bar.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left items-stretch">
        {/* Strengths */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col h-full overflow-hidden">
          <h5 className="text-emerald-500 font-black text-[12px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Your Strengths
          </h5>
          <div className="space-y-3 overflow-y-auto max-h-[300px]">
            {strengths.map((item, i) => (
              <div key={i} className="flex gap-3 text-[13px] leading-relaxed text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Gaps */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col h-full overflow-hidden">
          <h5 className="text-amber-500 font-black text-[12px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            Key Gaps
          </h5>
          <div className="space-y-3 overflow-y-auto max-h-[300px]">
            {keyGaps.map((item, i) => (
              <div key={i} className="flex gap-3 text-[13px] leading-relaxed text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Actions */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col h-full overflow-hidden">
          <h5 className="text-[#7c6af7] font-black text-[12px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#7c6af7] rounded-full animate-pulse" />
            Top 3 Actions
          </h5>
          <div className="space-y-4 overflow-y-auto max-h-[300px]">
            {topActions.map((item, i) => (
              <div key={i} className="flex gap-3 text-[13px] leading-relaxed text-zinc-300">
                <div className="w-5 h-5 rounded-full bg-[#7c6af7] shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-1">
                  {i + 1}
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <motion.button 
        onClick={handleShare}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="mt-12 px-8 py-3.5 bg-gradient-primary text-white rounded-xl transition-all text-sm font-bold shadow-[0_0_30px_rgba(124,58,237,0.3)] border-none"
      >
        Share My Real Score
      </motion.button>

      <p className="mt-8 text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-black opacity-40">AI-Validated Progress Roadmap</p>
    </div>
  );
}
