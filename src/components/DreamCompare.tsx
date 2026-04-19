"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Loader2, Swords, Sparkles, Trophy, Info, ChevronRight, Crown } from "lucide-react";
import { fetchWithRetry } from "@/lib/fetchWithRetry";
import { toast } from "react-toastify";

interface ComparisonResult {
  dream: string;
  topCareer: string;
  realityScore?: number;
  salary: { entry: string; senior: string };
  timeToReady: string;
  difficulty: string;
  jobSecurity: number;
  fulfilment: number;
  indiaMarketDemand: number;
  globalScope: number;
  workLifeBalance: number;
  uniqueAdvantage: string;
  biggestChallenge: string;
  aiRecommendation: string;
}

interface CompareData {
  comparisons: ComparisonResult[];
  finalRecommendation: {
    winner: string;
    reasoning: string;
  };
}

export default function DreamCompare({ onExplore }: { onExplore: (dream: string) => void }) {
  const [dreams, setDreams] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CompareData | null>(null);
  const [recommendedDream, setRecommendedDream] = useState<string | null>(null);

  // Helper function to handle all score fallback cases
  const getScore = (c: ComparisonResult): number => {
    const raw = c.realityScore ?? 
                (c as any).score ?? 
                (c as any).reality_score ?? 
                (c as any).realisticScore ??
                (c as any).realScore ??
                (c as any).feasibilityScore ?? 0;
    return Math.round(Number(raw)) || 0;
  };

  useEffect(() => {
    const lastCompare = localStorage.getItem("d2r_last_compare");
    const quizAnswers = localStorage.getItem("d2r_quiz_answers");
    
    if (lastCompare) {
      const { dreams: savedDreams, results: savedResults } = JSON.parse(lastCompare);
      setDreams(savedDreams);
      setResults(savedResults);
    } else if (quizAnswers) {
      const lastRec = localStorage.getItem("d2r_last_quiz_rec");
      if (lastRec) {
        setDreams([lastRec, ""]);
        setRecommendedDream(lastRec);
      }
    }
  }, []);

  const addDream = () => {
    if (dreams.length < 3) setDreams([...dreams, ""]);
  };

  const removeDream = (idx: number) => {
    setDreams(dreams.filter((_, i) => i !== idx));
  };

  const updateDream = (idx: number, val: string) => {
    const next = [...dreams];
    next[idx] = val;
    setDreams(next);
  };

  const handleCompare = async () => {
    const valid = dreams.filter(d => d.trim().length > 5);
    if (valid.length < 2) {
      toast.error("Please enter at least 2 clear dreams.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchWithRetry("/api/compare-dreams", {
        method: "POST",
        body: JSON.stringify({ dreams: valid }),
        headers: { "Content-Type": "application/json" }
      });
      console.log("API Response:", JSON.stringify(res, null, 2));
      setResults(res);
      localStorage.setItem("d2r_last_compare", JSON.stringify({ dreams: valid, results: res }));
      
      if (res.fromCache) {
        window.dispatchEvent(new CustomEvent('api-cache-hit', { detail: { type: 'server' } }));
      }
    } catch (err: any) {
      toast.error("Comparison failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper Calculations
  const metrics = useMemo(() => [
    { key: "jobSecurity" as const, label: "Job Security" },
    { key: "fulfilment" as const, label: "Fulfilment" },
    { key: "indiaMarketDemand" as const, label: "Market Demand (IN)" },
    { key: "workLifeBalance" as const, label: "Work-Life Balance" },
    { key: "globalScope" as const, label: "Global Scope" }
  ], []);

  const bestOverallIdx = useMemo(() => {
    if (!results) return -1;
    const averages = results.comparisons.map(c => {
      const scoreValue = getScore(c);
      const numericSum = scoreValue + (c.jobSecurity * 10) + (c.fulfilment * 10) + 
                         (c.indiaMarketDemand * 10) + (c.globalScope * 10) + (c.workLifeBalance * 10);
      return numericSum / 6;
    });
    const maxAvg = Math.max(...averages);
    return averages.indexOf(maxAvg);
  }, [results, getScore]);

  const getDifficultyStyles = (diff: string) => {
    const d = diff ? diff.toLowerCase() : "";
    if (d.includes("very high")) return { bg: "#FCEBEB", color: "#791F1F", border: "#E24B4A" };
    if (d.includes("high")) return { bg: "#FAECE7", color: "#712B13", border: "#D85A30" };
    if (d.includes("medium")) return { bg: "#FAEEDA", color: "#633806", border: "#BA7517" };
    if (d.includes("easy")) return { bg: "#E1F5EE", color: "#085041", border: "#1D9E75" };
    if (d.includes("extreme")) return { bg: "#500000", color: "#fca5a5", border: "#ef4444" };
    return { bg: "#FAECE7", color: "#712B13", border: "#D85A30" };
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 8) return "#22c55e";
    if (score >= 6) return "#f59e0b";
    if (score >= 4) return "#f87171";
    return "#ef4444";
  };

  const parseSalary = (salaryStr: string) => {
    if (!salaryStr) return 0;
    return parseInt(salaryStr.replace(/[^0-9]/g, "")) || 0;
  };

  const maxSeniorSalary = useMemo(() => {
    if (!results) return 0;
    return Math.max(...results.comparisons.map(c => parseSalary(c.salary.senior)));
  }, [results]);

  const SkeletonRow = () => (
    <div className="flex gap-4 p-4 border-b border-white/5 animate-pulse">
       <div className="w-24 h-4 bg-white/5 rounded" />
       <div className="flex-1 h-4 bg-white/5 rounded" />
       <div className="flex-1 h-4 bg-white/5 rounded" />
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Inputs Section */}
      {!results && !loading && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dreams.map((dreamText, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -top-3 left-4 px-2 py-0.5 bg-black text-[10px] text-zinc-500 border border-white/10 rounded-full font-black uppercase z-10 group-focus-within:text-primary transition-colors">
                  Dream {idx + 1}
                </div>
                <div className="relative">
                  <textarea
                    value={dreamText}
                    onChange={(e) => updateDream(idx, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (dreams.filter(d => d.trim().length > 5).length >= 2) {
                          handleCompare();
                        }
                      }
                    }}
                    placeholder={idx === 0 ? "e.g. Become a data scientist..." : "e.g. Become a UI designer..."}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-6 pt-8 text-sm focus:outline-none focus:border-primary focus:bg-white/[0.08] transition-all resize-none min-h-[120px]"
                  />
                  {idx === 0 && recommendedDream === dreamText && (
                    <div className="flex items-center gap-1.5 mt-2 px-1 text-zinc-600 text-[10px] italic font-medium">
                       <Info size={10} /> Pre-filled from your quiz result
                    </div>
                  )}
                  {dreams.length > 2 && (
                    <button 
                      onClick={() => removeDream(idx)}
                      className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {dreams.length < 3 && (
              <button 
                onClick={addDream}
                className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-zinc-500 hover:border-white/20 hover:text-white transition-all group min-h-[120px]"
              >
                <Plus size={24} className="group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider">Add Dream</span>
              </button>
            )}
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={handleCompare}
              disabled={dreams.filter(d => d.trim().length > 5).length < 2}
              className="px-12 py-4 bg-gradient-to-r from-primary to-purple-600 rounded-xl text-white font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(124,106,247,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 flex items-center gap-3"
            >
              <Swords size={20} />
              Compare Dreams
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
           <div className="p-10 flex flex-col items-center justify-center space-y-4">
              <Loader2 size={40} className="text-primary animate-spin" />
              <p className="text-zinc-500 font-medium">Strategizing your options...</p>
           </div>
           <div className="border-t border-white/5">
              {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
           </div>
        </div>
      )}

      {/* Results Section */}
      {results && !loading && (
        <div className="space-y-12">
          {/* Main Table Container with Gradient Border */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden", borderRadius: "17px" }}
            className="p-[1px] bg-gradient-to-br from-primary/15 to-[#d4537e]/10 shadow-2xl"
          >
            <div 
              className="bg-[#0d0f1c] rounded-[16px] overflow-hidden relative"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
                backgroundSize: "40px 40px"
              }}
            >
              <div className="overflow-x-auto relative">
                <table className="w-full text-left border-separate border-spacing-0 min-w-[500px]">
                  <thead>
                    <tr>
                      <th className="p-6 min-w-[180px] text-[11px] font-black uppercase tracking-widest text-zinc-500 bg-[#0d0f1c] sticky top-0 left-0 z-50 border-r border-white/10 border-b border-white/10 shadow-[2px_2px_10px_rgba(0,0,0,0.2)]">
                        Metric Comparison
                      </th>
                      {results.comparisons.map((c, i) => (
                        <th 
                          key={i} 
                          className={`p-6 min-w-[240px] sticky top-0 z-40 bg-[#0d0f1c] border-b border-white/10 transition-colors duration-300 ${i === bestOverallIdx ? 'bg-primary/[0.06]' : ''}`}
                        >
                          {i === bestOverallIdx && (
                            <div style={{
                              height: "3px",
                              background: "linear-gradient(90deg, #7c6af7, #d4537e)",
                              borderRadius: "0",
                              margin: "0 0 12px 0",
                              zIndex: 10
                            }} />
                          )}
                          <div className="flex flex-col gap-1">
                            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-tight">Dream {i + 1}</span>
                            <span className="text-base font-bold text-white truncate max-w-[150px]">{c.topCareer}</span>
                            {i === bestOverallIdx && (
                              <div className="mt-2 text-[9px] font-bold uppercase tracking-widest bg-primary text-white w-fit px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md shadow-primary/20">
                                <span>⭐ Best Overall</span>
                              </div>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y-0">
                    <motion.tr 
                      initial={{ opacity: 1 }}
                      className="hover:bg-primary/[0.04] transition-colors"
                    >
                      <td className="p-6 border-r border-white/10 sticky left-0 bg-[#0d0f1c] z-20 text-[13px] font-black uppercase tracking-widest text-[#7c6af7] border-b border-white/5 shadow-[2px_0_8px_rgba(0,0,0,0.1)]">
                        Reality Score
                      </td>
                      {results.comparisons.map((comparison, i) => {
                        const rawScore = comparison.realityScore ?? 
                                         (comparison as any).score ?? 
                                         (comparison as any).reality_score ?? 
                                         (comparison as any).realisticScore ?? 0
                        const score = Math.round(Number(rawScore))
                        const color = score >= 90 ? "#22c55e" 
                                    : score >= 75 ? "#f59e0b"
                                    : "#f87171"
                        return (
                          <td 
                            key={i}
                            className={`p-4 ${i === bestOverallIdx ? 'bg-primary/[0.06]' : ''}`}
                            style={{ verticalAlign: "middle" }}
                          >
                            <div style={{ 
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "4px",
                              paddingTop: "8px",
                              paddingBottom: "8px"
                            }}>
                              <span style={{
                                fontSize: "42px",
                                fontWeight: 900,
                                color: color,
                                lineHeight: "1",
                                display: "block"
                              }}>
                                {score || "—"}
                              </span>
                              <span style={{
                                fontSize: "10px",
                                color: "rgba(255,255,255,0.3)"
                              }}>
                                SCORE / 100
                              </span>
                              <div style={{
                                width: "36px",
                                height: "3px",
                                background: "rgba(255,255,255,0.08)",
                                borderRadius: "2px",
                                marginTop: "4px"
                              }}>
                                <div style={{
                                  width: `${score}%`,
                                  height: "100%",
                                  background: color,
                                  borderRadius: "2px"
                                }}/>
                              </div>
                            </div>
                          </td>
                        )
                      })}
                    </motion.tr>

                    {/* Difficulty Row */}
                    <motion.tr 
                      initial={{ y: 10, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      className="bg-white/[0.02] hover:bg-primary/[0.04] transition-colors group"
                    >
                      <td className="p-[20px_24px] border-r border-white/10 sticky left-0 bg-[#0d0f1c] z-20 text-[13px] font-medium text-white/60">
                        Difficulty
                      </td>
                      {results.comparisons.map((c, i) => {
                        const diffStyle = getDifficultyStyles(c.difficulty);
                        return (
                          <td key={i} className={`p-6 transition-colors duration-300 ${i === bestOverallIdx ? 'bg-primary/[0.06]' : ''}`}>
                            <span 
                              className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 w-fit"
                              style={{ backgroundColor: diffStyle.bg, color: diffStyle.color, border: `1px solid ${diffStyle.border}` }}
                            >
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: diffStyle.color }} />
                              {c.difficulty}
                            </span>
                          </td>
                        );
                      })}
                    </motion.tr>

                    {/* Salary Range Row */}
                    <motion.tr 
                      initial={{ y: 10, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      className="hover:bg-primary/[0.04] transition-colors group"
                    >
                      <td className="p-[20px_24px] border-r border-white/10 sticky left-0 bg-[#0d0f1c] z-20 text-[13px] font-medium text-white/60">
                        Salary Range
                      </td>
                      {results.comparisons.map((c, i) => {
                        const isMaxSalary = parseSalary(c.salary.senior) === maxSeniorSalary;
                        return (
                          <td key={i} className={`p-6 transition-colors duration-300 ${i === bestOverallIdx ? 'bg-primary/[0.06]' : ''}`}>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-medium whitespace-nowrap">
                                <span>Entry:</span>
                                <span>₹{c.salary.entry} LPA</span>
                              </div>
                              <div className={`p-1.5 px-2 rounded-md ${isMaxSalary ? 'bg-emerald-500/10' : ''} w-fit`}>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-tight">Senior:</span>
                                  <span className={`text-[15px] font-black ${isMaxSalary ? 'text-emerald-400' : 'text-zinc-200'}`}>
                                    ₹{c.salary.senior} LPA
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </motion.tr>

                    {/* Time To Ready Row */}
                    <motion.tr 
                      initial={{ y: 10, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      className="bg-white/[0.02] hover:bg-primary/[0.04] transition-colors group"
                    >
                      <td className="p-[20px_24px] border-r border-white/10 sticky left-0 bg-[#0d0f1c] z-20 text-[13px] font-medium text-white/60">
                        Preparation Time
                      </td>
                      {results.comparisons.map((c, i) => (
                        <td key={i} className={`p-6 transition-colors duration-300 ${i === bestOverallIdx ? 'bg-primary/[0.06]' : ''}`}>
                          <span className="text-sm font-bold text-zinc-300">{c.timeToReady}</span>
                        </td>
                      ))}
                    </motion.tr>

                    {/* Progress Bar Rows */}
                    {metrics.map((m, rowIdx) => {
                      const maxVal = Math.max(...results.comparisons.map(c => c[m.key]));
                      const minVal = Math.min(...results.comparisons.map(c => c[m.key]));

                      return (
                        <motion.tr 
                          key={m.key}
                          initial={{ y: 10, opacity: 0 }}
                          whileInView={{ y: 0, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.08 * rowIdx }}
                          className={`${rowIdx % 2 === 0 ? '' : 'bg-white/[0.02]'} hover:bg-primary/[0.04] transition-colors group relative`}
                        >
                          <td className="p-[20px_24px] border-r border-white/10 sticky left-0 bg-[#0d0f1c] z-20 text-[13px] font-medium text-white/60">
                            {m.label}
                          </td>
                          {results.comparisons.map((c, i) => {
                            const progScore = c[m.key];
                            const isWinner = progScore === maxVal;
                            const isLoser = progScore === minVal && progScore !== maxVal;
                            const barColor = isLoser && progScore < 5 ? "#ef4444" : getProgressBarColor(progScore);
                            
                            return (
                              <td 
                                key={i} 
                                className={`p-6 transition-colors duration-300 relative ${i === bestOverallIdx ? 'bg-primary/[0.06]' : ''} ${isWinner ? 'bg-emerald-500/[0.05]' : ''}`}
                              >
                                <div className="flex flex-col gap-2">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className={`text-[12px] font-black ${isWinner ? 'text-emerald-400' : isLoser ? 'text-red-400' : 'text-zinc-200'}`}>
                                      {Math.round(progScore)}<span className="opacity-40 text-[10px]">/10</span>
                                      {isWinner && <span className="ml-1.5">👑</span>}
                                    </span>
                                  </div>
                                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      whileInView={{ width: `${(progScore / 10) * 100}%` }}
                                      viewport={{ once: true }}
                                      transition={{ duration: 0.8, delay: 0.8 + (rowIdx * 0.1), ease: "easeOut" }}
                                      className="h-full rounded-full"
                                      style={{ 
                                        backgroundColor: barColor,
                                        boxShadow: isWinner ? `0 0 10px ${barColor}80` : 'none',
                                        filter: isWinner ? `drop-shadow(0 0 4px ${barColor})` : 'none'
                                      }}
                                    />
                                  </div>
                                </div>
                              </td>
                            );
                          })}
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Scrolling Hint for Mobile */}
          <div className="block md:hidden text-center mt-2 px-4">
             {dreams.length > 2 && (
               <motion.div 
                 animate={{ x: [-5, 5, -5] }}
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest flex items-center justify-center gap-2"
               >
                 <span>← scroll to see more →</span>
               </motion.div>
             )}
          </div>

          {/* AI Recommendation Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="bg-[#7c6af7]/10 border border-[#7c6af7]/25 rounded-[24px] overflow-hidden p-8 relative"
          >
            <div className="absolute -top-4 -right-4 opacity-5 pointer-events-none">
              <Sparkles size={160} className="text-[#d4537e]" />
            </div>

            <div className="flex items-center gap-3 mb-6 relative">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/70">Our Recommendation</h4>
                <div className="text-2xl font-black font-syne gradient-text leading-tight mt-1">
                  ⭐ {results.finalRecommendation.winner}
                </div>
              </div>
            </div>

            <p className="text-white/75 text-[15px] leading-[1.8] max-w-4xl mb-10 italic border-l-2 border-primary/30 pl-6 bg-white/5 p-4 rounded-r-xl">
              "{results.finalRecommendation.reasoning}"
            </p>

            <div className="flex flex-wrap items-center gap-4">
               <button
                 onClick={() => {
                    const rec = results.comparisons.find(c => c.topCareer === results.finalRecommendation.winner) || results.comparisons[0];
                    onExplore(rec.dream);
                 }}
                 className="px-10 py-4 bg-gradient-to-r from-primary to-[#d4537e] text-white font-black uppercase tracking-widest text-xs rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
               >
                 Explore {results.finalRecommendation.winner} <ChevronRight size={16} />
               </button>
               
               <button
                 onClick={() => {
                    setResults(null); 
                    localStorage.removeItem("d2r_last_compare");
                 }}
                 className="px-8 py-4 bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 font-bold uppercase tracking-widest text-[11px] rounded-full transition-all"
               >
                 Compare Again
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
