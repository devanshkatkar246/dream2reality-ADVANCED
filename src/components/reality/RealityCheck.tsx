"use client";

import { useRef } from "react";
import { motion, useInView as useFramerInView } from "framer-motion";
import { Zap, AlertCircle } from "lucide-react";

interface RealityCheckData {
  competition: number;
  timeInvestment: number;
  financialRisk: number;
  entryBarrier: number;
  fulfilmentPotential: number;
  jobMarketDemand: number;
}

const REALITY_FALLBACKS: Record<string, RealityCheckData> = {
  "software/engineer": { competition: 8, timeInvestment: 8, financialRisk: 3, entryBarrier: 7, fulfilmentPotential: 8, jobMarketDemand: 9 },
  "ai/research": { competition: 9, timeInvestment: 10, financialRisk: 3, entryBarrier: 9, fulfilmentPotential: 10, jobMarketDemand: 9 },
  "game/gaming": { competition: 9, timeInvestment: 8, financialRisk: 5, entryBarrier: 7, fulfilmentPotential: 9, jobMarketDemand: 7 },
  "doctor/medical": { competition: 9, timeInvestment: 10, financialRisk: 4, entryBarrier: 10, fulfilmentPotential: 10, jobMarketDemand: 8 },
  "law/lawyer": { competition: 8, timeInvestment: 9, financialRisk: 5, entryBarrier: 8, fulfilmentPotential: 8, jobMarketDemand: 7 }
};

const DEFAULT_REALITY: RealityCheckData = { competition: 7, timeInvestment: 8, financialRisk: 5, entryBarrier: 6, fulfilmentPotential: 8, jobMarketDemand: 7 };

const DESCRIPTOR_MAPPING = (score: number) => {
  if (score <= 2) return "Minimal";
  if (score <= 4) return "Low";
  if (score <= 6) return "Moderate";
  if (score <= 8) return "High";
  if (score === 9) return "Very High";
  return "Extreme";
};

const INTREPRET_BAD_METRIC = (score: number) => {
  if (score <= 3) return "#22c55e"; // Green (not much competition is good)
  if (score <= 6) return "#f59e0b"; // Amber (medium)
  return "#ef4444"; // Red (high is hard)
};

const INTREPRET_GOOD_METRIC = (score: number) => {
  if (score <= 3) return "#ef4444"; // Red (low fulfillment is bad)
  if (score <= 6) return "#f59e0b"; // Amber (medium)
  return "#22c55e"; // Green (high fulfillment is good)
};

export default function RealityCheck({ dream, data }: { dream: string, data?: RealityCheckData }) {
  const containerRef = useRef(null);
  const isInView = useFramerInView(containerRef, { once: true });

  const getRealityData = () => {
    if (data) return data;
    for (const [key, value] of Object.entries(REALITY_FALLBACKS)) {
      if (new RegExp(key, "i").test(dream)) return value;
    }
    return DEFAULT_REALITY;
  };

  const reality = getRealityData();

  const metrics = [
    { name: "Competition Level", score: reality.competition, type: "bad" },
    { name: "Time Investment Required", score: reality.timeInvestment, type: "bad" },
    { name: "Financial Risk", score: reality.financialRisk, type: "bad" },
    { name: "Entry Barrier", score: reality.entryBarrier, type: "bad" },
    { name: "Fulfilment Potential", score: reality.fulfilmentPotential, type: "good" },
    { name: "Job Market Demand", score: reality.jobMarketDemand, type: "good" }
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="border-b border-white/10 pb-4 mb-8">
        <h3 className="text-2xl font-bold flex items-center gap-3">
          <Zap size={24} className="text-[#ef4444]" />
          Reality Check
        </h3>
        <p className="text-zinc-500 text-sm mt-1">An honest assessment — not just cheerleading</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        {metrics.map((m, i) => {
          const color = m.type === "bad" ? INTREPRET_BAD_METRIC(m.score) : INTREPRET_GOOD_METRIC(m.score);
          const descriptor = DESCRIPTOR_MAPPING(m.score);
          
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="space-y-3"
            >
              <div className="flex justify-between items-center text-[13px] font-bold text-zinc-100">
                <span>{m.name}</span>
                <span className="flex items-center gap-2">
                  <span className="font-mono" style={{ color }}>{m.score}/10</span>
                  <span className="text-zinc-600 text-[11px] uppercase tracking-tighter">{descriptor}</span>
                </span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full ring-1 ring-white/10 relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${m.score * 10}%` } : {}}
                  transition={{ duration: 0.8, delay: 0.3 + (i * 0.1), ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
