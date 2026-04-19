"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ListChecks, Target, Hammer, TrendingUp, Loader2, Award } from "lucide-react";
import { toast } from "react-toastify";
import RealityScore from "./RealityScore";
import MentorMatch from "./reality/MentorMatch";
import SalaryChart from "./reality/SalaryChart";
import RealityCheck from "./reality/RealityCheck";
import TopResources from "./reality/TopResources";

export type RoadmapData = {
  daily_tasks: (string | { Title: string; Description: string })[];
  weekly_goals: (string | { Title: string; Description: string })[];
  projects: (string | { Title: string; Description: string })[];
  mentors?: any[];
  salaryTrajectory?: any;
  realityCheck?: any;
  resources?: any;
};

import { fetchWithRetry } from "@/lib/fetchWithRetry";

export default function RealityRoadmap({ dream }: { dream: string }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RoadmapData | null>(null);
  const [startedToday, setStartedToday] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    setPrefersReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // Helper to safely render AI children which might be objects
  const renderChild = (child: string | { Title?: string; Description?: string; title?: string; description?: string }) => {
    if (typeof child === "string") return child;
    if (typeof child === "object" && child !== null) {
      const title = child.Title || child.title || "";
      const desc = child.Description || child.description || "";
      if (title && desc) return `${title}: ${desc}`;
      return title || desc || JSON.stringify(child);
    }
    return String(child);
  };

  useEffect(() => {
    const saved = localStorage.getItem(`started-today-${dream.substring(0, 10)}`);
    if (saved === "true") setStartedToday(true);

    const fetchRoadmap = async () => {
      try {
        const result = await fetchWithRetry("/api/roadmap", {
          method: "POST",
          body: JSON.stringify({ dream }),
          headers: { "Content-Type": "application/json" },
        });
        setData(result);
      } catch (err: any) {
        toast.error("Roadmap generation failed: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [dream]);

  const handleStartTodayChange = (checked: boolean) => {
    setStartedToday(checked);
    localStorage.setItem(`started-today-${dream.substring(0, 10)}`, String(checked));
    if (checked) {
      toast.success("Day 1 started. You're already ahead of 90% of people.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={48} className="text-primary animate-spin mb-4" />
        <h3 className="text-2xl font-bold">Constructing Reality...</h3>
        <p className="text-zinc-500">Mapping your simulation to real-world tasks.</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-24">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-black mb-4 flex items-center justify-center gap-3">
          <TrendingUp size={32} className="text-primary" />
          The Reality Roadmap
        </h2>
        <p className="text-zinc-400">Step-by-step actionable plan to bridge the gap.</p>
      </div>

      {/* ANALYSIS SECTION (New order) */}
      <div className="space-y-24 max-w-6xl mx-auto px-4">
        {/* SECTION 0: Reality Score Card */}
        <RealityScore dream={dream} />

        {/* SECTION 1: Mentor Match */}
        <MentorMatch dream={dream} mentors={data.mentors} />

        {/* SECTION 2: Salary Trajectory */}
        <SalaryChart dream={dream} data={data.salaryTrajectory} />

        {/* SECTION 3: Reality Check */}
        <RealityCheck dream={dream} data={data.realityCheck} />

        {/* SECTION 4: Top Resources */}
        <TopResources dream={dream} data={data.resources} />
      </div>

      {/* ROADMAP SECTION (Existing) */}
      <div className="space-y-12">
        <div className="text-center">
           <h3 className="text-xl font-bold uppercase tracking-widest text-[#7c6af7]">Actionable Milestones</h3>
        </div>

        {/* Timeline Strip */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex justify-between items-center relative gap-4">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2 z-0" />
            {["Week 1", "Month 1", "Month 3", "Month 6"].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center gap-3 group">
                <div className="w-4 h-4 rounded-full bg-zinc-900 border-2 border-primary group-hover:bg-primary transition-all" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-primary transition-all">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Daily Tasks */}
          <motion.div
            initial={prefersReduced ? {} : { opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-6 rounded-2xl border-l-4 border-l-blue-500"
          >
            <h4 className="text-xl font-bold mb-6 flex items-center gap-3">
              <ListChecks className="text-blue-500" />
              Daily Tasks
            </h4>
            <ul className="space-y-4">
              {data.daily_tasks.map((task, i) => (
                <li key={i} className={`flex gap-3 transition-opacity duration-300 ${i === 0 && startedToday ? 'opacity-50' : ''}`}>
                  <div className="shrink-0 mt-1">
                    {i === 0 ? (
                      <input 
                        type="checkbox" 
                        checked={startedToday}
                        onChange={(e) => handleStartTodayChange(e.target.checked)}
                        id="start-today"
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-blue-500 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-blue-500/50 mt-1.5" />
                    )}
                  </div>
                  <label htmlFor={i === 0 ? "start-today" : undefined} className={`text-sm md:text-base cursor-pointer ${i === 0 ? 'font-bold' : 'text-zinc-300'}`}>
                    {renderChild(task)}
                    {i === 0 && <span className="ml-2 text-[10px] text-blue-400 uppercase tracking-tighter">Start today</span>}
                  </label>
                </li>
              ))}
            </ul>
            {startedToday && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-400 font-medium"
              >
                🎉 Day 1 started. You're already ahead of 90% of people. Keep it up!
              </motion.div>
            )}
          </motion.div>

          {/* Weekly Goals */}
          <motion.div
            initial={prefersReduced ? {} : { opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-6 rounded-2xl border-l-4 border-l-purple-500"
          >
            <h4 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Target className="text-purple-500" />
              Weekly Goals
            </h4>
            <ul className="space-y-4">
              {data.weekly_goals.map((goal, i) => (
                <li key={i} className="flex gap-3 text-zinc-300">
                  <div className="shrink-0 mt-1 h-2 w-2 rounded-full bg-purple-500/50" />
                  <span className="text-sm md:text-base">{renderChild(goal)}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Projects */}
          <motion.div
            initial={prefersReduced ? {} : { opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-6 rounded-2xl border-l-4 border-l-pink-500"
          >
            <h4 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Hammer className="text-pink-500" />
              Projects to Build
            </h4>
            <ul className="space-y-4">
              {data.projects.map((project, i) => (
                <li key={i} className="flex gap-3 text-zinc-300">
                  <div className="shrink-0 mt-1 h-2 w-2 rounded-full bg-pink-500/50" />
                  <span className="text-sm md:text-base italic">{renderChild(project)}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-center pb-20 mt-10">
        <button
          onClick={() => window.location.reload()}
          className="px-12 py-5 bg-gradient-primary text-white font-black uppercase tracking-widest text-sm rounded-full shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 relative z-10"
        >
          <Award size={22} className="text-white" />
          Start New Dream
        </button>
      </div>
    </div>
  );
}
