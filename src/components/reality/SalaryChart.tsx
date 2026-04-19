"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useInView as useFramerInView } from "framer-motion";
import { IndianRupee, Globe, TrendingUp } from "lucide-react";

interface SalaryData {
  year1: { amount: number; label: string };
  year3: { amount: number; label: string };
  year5: { amount: number; label: string };
  year10: { amount: number; label: string };
  globalUSA: string;
  globalUK: string;
  globalRemote: string;
  indiaRange: string;
}

const SALARY_FALLBACKS: Record<string, SalaryData> = {
  "software/engineer": { 
    year1: { amount: 8, label: "₹8L" }, 
    year3: { amount: 22, label: "₹22L" }, 
    year5: { amount: 38, label: "₹38L" }, 
    year10: { amount: 75, label: "₹75L+" }, 
    globalUSA: "$90k-180k", globalUK: "£45k-90k", globalRemote: "$70k-150k", indiaRange: "₹8L-75L+" 
  },
  "ai/research": { 
    year1: { amount: 15, label: "₹15L" }, 
    year3: { amount: 35, label: "₹35L" }, 
    year5: { amount: 65, label: "₹65L" }, 
    year10: { amount: 150, label: "₹1.5Cr+" }, 
    globalUSA: "$120k-400k", globalUK: "£70k-200k", globalRemote: "$100k-300k", indiaRange: "₹15L-1.5Cr+" 
  },
  "game/gaming": { 
    year1: { amount: 6, label: "₹6L" }, 
    year3: { amount: 16, label: "₹16L" }, 
    year5: { amount: 28, label: "₹28L" }, 
    year10: { amount: 55, label: "₹55L+" }, 
    globalUSA: "$75k-160k", globalUK: "£40k-85k", globalRemote: "$60k-130k", indiaRange: "₹6L-55L+" 
  },
  "doctor/medical": { 
    year1: { amount: 8, label: "₹8L" }, 
    year3: { amount: 18, label: "₹18L" }, 
    year5: { amount: 35, label: "₹35L" }, 
    year10: { amount: 80, label: "₹80L+" }, 
    globalUSA: "$200k-400k", globalUK: "£80k-150k", globalRemote: "N/A", indiaRange: "₹8L-2Cr+" 
  },
  "law/lawyer": { 
    year1: { amount: 5, label: "₹5L" }, 
    year3: { amount: 14, label: "₹14L" }, 
    year5: { amount: 30, label: "₹30L" }, 
    year10: { amount: 100, label: "₹1Cr+" }, 
    globalUSA: "$80k-300k", globalUK: "£50k-150k", globalRemote: "N/A", indiaRange: "₹5L-5Cr+" 
  }
};

const DEFAULT_SALARY: SalaryData = { 
  year1: { amount: 6, label: "₹6L" }, 
  year3: { amount: 15, label: "₹15L" }, 
  year5: { amount: 28, label: "₹28L" }, 
  year10: { amount: 55, label: "₹55L+" }, 
  globalUSA: "$60k-150k", globalUK: "£35k-80k", globalRemote: "$50k-120k", indiaRange: "₹6L-55L+" 
};

function CountUp({ target, duration = 1000, prefix = "", suffix = "" }: { target: number, duration?: number, prefix?: string, suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useFramerInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.round(progress * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, target, duration]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

export default function SalaryChart({ dream, data }: { dream: string, data?: SalaryData }) {
  const containerRef = useRef(null);
  const isInView = useFramerInView(containerRef, { once: true });

  const getSalaryData = () => {
    if (data) return data;
    for (const [key, value] of Object.entries(SALARY_FALLBACKS)) {
      if (new RegExp(key, "i").test(dream)) return value;
    }
    return DEFAULT_SALARY;
  };

  const salary = getSalaryData();
  const maxAmount = salary.year10.amount || 100;

  const rows = [
    { year: "Year 1", amount: salary.year1, color: "#6b7280" },
    { year: "Year 3", amount: salary.year3, color: "#f59e0b" },
    { year: "Year 5", amount: salary.year5, color: "#22c55e" },
    { year: "Year 10", amount: salary.year10, color: "#7c6af7" }
  ];

  const comparison = [
    { flag: "🇮🇳", name: "India", range: salary.indiaRange.split(' across')[0] || "₹8L-75L+", subtitle: "across career" },
    { flag: "🇺🇸", name: "USA", range: salary.globalUSA, subtitle: "across career" },
    { flag: "🇬🇧", name: "UK", range: salary.globalUK, subtitle: "" },
    { flag: "🌍", name: "Remote", range: salary.globalRemote, subtitle: "" }
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="border-b border-white/10 pb-4 mb-8">
        <h3 className="text-2xl font-bold flex items-center gap-3">
          <IndianRupee size={24} className="text-[#f59e0b]" />
          Your Earning Trajectory
        </h3>
        <p className="text-zinc-500 text-sm mt-1">Projected income growth as you master your craft</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
        {/* Left Side: India salary bars (60%) */}
        <div className="lg:col-span-3 space-y-6">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="w-20 text-right text-[12px] font-bold text-zinc-500 uppercase tracking-wider">{row.year}</span>
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${(row.amount.amount / maxAmount) * 100}%` } : {}}
                  transition={{ duration: 0.8, delay: i * 0.15, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: row.color }}
                />
              </div>
              <span className="w-24 text-[13px] font-mono font-bold" style={{ color: row.color }}>
                {isInView ? <CountUp target={row.amount.amount} prefix="₹" suffix="L" /> : "₹0L"}
                {row.year === "Year 10" ? "+" : ""}
              </span>
            </div>
          ))}
        </div>

        {/* Right Side: comparison cards (40%) */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {comparison.map((comp, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 transition-all hover:bg-white/10 hover:border-white/20"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{comp.flag}</span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">{comp.name}</span>
                </div>
                <h5 className="text-[16px] font-bold text-white mt-1 leading-tight">{comp.range}</h5>
                {comp.subtitle && <p className="text-[10px] text-zinc-600 mt-1 uppercase font-bold">{comp.subtitle}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
