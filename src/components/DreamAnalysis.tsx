"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Loader2, Briefcase, GraduationCap, Zap, Activity,
  AlertTriangle, TrendingUp, DollarSign, ChevronRight, Sparkles
} from "lucide-react";
import { AnalysisData } from "@/app/page";
import { toast } from "react-toastify";
import { fetchWithRetry } from "@/lib/fetchWithRetry";
import { calculateRealityScore } from "@/lib/scoreEngine";

interface DreamAnalysisProps {
  dream: string;
  initialData: AnalysisData | null;
  onAnalysisComplete: (data: AnalysisData) => void;
  onProceed: () => void;
}

import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Save, Check, Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function DreamAnalysis({ dream, initialData, onAnalysisComplete, onProceed }: DreamAnalysisProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(!initialData);
  const [data, setData] = useState<AnalysisData | null>(initialData);
  const [scoreData, setScoreData] = useState<{score: number, label: string, explanation: string} | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    if (!user || !data || isSaved) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, "simulations"), {
        userId: user.uid,
        career: data.career,
        dream,
        aiResponse: data,
        realityScore: scoreData?.score,
        createdAt: serverTimestamp(),
      });
      setIsSaved(true);
      toast.success("Simulation saved to your dashboard!");
    } catch (error) {
      console.error("Error saving simulation:", error);
      toast.error("Failed to save simulation.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    const element = document.getElementById("analysis-content");
    if (!element) return;
    
    toast.info("Preparing your PDF...");
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#000" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${data?.career}-Roadmap.pdf`);
    toast.success("PDF exported successfully!");
  };

  useEffect(() => {
    // ... rest of useEffect

    const fetchAnalysis = async () => {
      if (initialData) {
        setScoreData(calculateRealityScore(initialData.success_probability_inputs));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await fetchWithRetry("/api/dream", {
          method: "POST",
          body: JSON.stringify({ dream }),
          headers: { "Content-Type": "application/json" },
        });
        
        setData(result);
        onAnalysisComplete(result);
        setScoreData(calculateRealityScore(result.success_probability_inputs));
      } catch (err: any) {
        toast.error("Failed to analyze dream: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [dream, initialData, onAnalysisComplete]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-20 h-20 border-t-2 border-r-2 border-primary rounded-full"
          />
          <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-black mb-2 gradient-text uppercase tracking-tighter">Analyzing Path...</h2>
          <p className="text-zinc-500 max-w-xs mx-auto">Connecting career dots and crafting your future evolution.</p>
        </div>
      </div>
    );
  }

  if (!data || !scoreData) return null;

  return (
    <div id="analysis-content" className="space-y-12 pb-20">
      {/* Reality Score Hero Card */}
      <div className="bg-card border border-card-border p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-8 shadow-glass relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/10 transition-colors" />
        
        <div className="w-32 h-32 rounded-full flex items-center justify-center relative shrink-0">
           <svg className="absolute inset-0 w-full h-full transform -rotate-90 scale-110">
             <circle strokeWidth="8" stroke="rgba(255,255,255,0.03)" fill="transparent" r="42" cx="48" cy="48" />
             <motion.circle 
                initial={{ strokeDashoffset: 263.89 }} 
                animate={{ strokeDashoffset: 263.89 - (263.89 * scoreData.score) / 100 }} 
                transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                strokeWidth="8" 
                strokeDasharray="263.89" 
                strokeLinecap="round" 
                stroke={scoreData.score >= 80 ? "#10B981" : scoreData.score >= 50 ? "#F59E0B" : "#F43F5E"} 
                fill="transparent" 
                r="42" cx="48" cy="48" 
             />
           </svg>
           <div className="flex flex-col items-center z-10">
             <span className="text-3xl font-black">{scoreData.score}</span>
             <span className="text-[10px] uppercase text-zinc-500 tracking-[0.2em] font-black">Score</span>
           </div>
        </div>

        <div className="flex-1 text-center md:text-left z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                <h3 className="text-3xl font-black">{data.career}</h3>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-lg ${
                  scoreData.score >= 80 ? 'bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.3)] text-emerald-400' : 
                  scoreData.score >= 50 ? 'bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.3)] text-amber-400' : 'bg-[rgba(244,63,94,0.1)] border-[rgba(244,63,94,0.3)] text-rose-400'
                }`}>
                  {scoreData.label} Match
                </div>
              </div>
              <p className="text-zinc-400 leading-relaxed text-lg italic">&quot;{data.summary}&quot;</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 shrink-0">
               <motion.button 
                 onClick={handleExportPDF}
                 whileHover={{ scale: 1.05 }}
                 className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                 title="Export Roadmap as PDF"
               >
                 <Download size={16} /> <span className="hidden sm:inline">Export PDF</span>
               </motion.button>
               
                {user && (
                 <motion.button 
                   onClick={handleSave}
                   disabled={isSaving || isSaved}
                   whileHover={{ scale: 1.05 }}
                   className={`px-6 py-3 border rounded-xl transition-all flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest shadow-xl ${
                     isSaved ? 'bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.3)] text-emerald-400 cursor-default' : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                   }`}
                 >
                   {isSaving ? <Loader2 size={16} className="animate-spin" /> : isSaved ? <Check size={16} className="text-emerald-400" /> : <Save size={16} />} 
                   <span>{isSaved ? "Saved" : "Save Choice"}</span>
                 </motion.button>
               )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Timeline Column - Taking more space for readability */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-card border border-card-border p-8 rounded-[1.5rem] shadow-glass h-full">
            <h3 className="text-xl font-black mb-10 flex items-center gap-3 uppercase tracking-tighter">
              <Activity size={20} className="text-accent" /> Evolution Timeline
            </h3>
            
            <div className="relative space-y-12 pl-4">
              {/* Vertical Connector Line */}
              <div className="absolute left-9 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/50 via-white/10 to-transparent" />
              
              {data.timeline.map((phase, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="relative flex gap-10 items-start group"
                >
                  {/* Step Circle */}
                  <div className="relative z-10 w-10 h-10 rounded-xl bg-background border border-[rgba(255,255,255,0.2)] flex items-center justify-center font-black text-xs group-hover:border-primary transition-colors shadow-xl">
                    {idx + 1}
                  </div>
                  
                  {/* Phase Content */}
                  <div className="flex-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-5 rounded-2xl group-hover:bg-[rgba(255,255,255,0.08)] transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <h4 className="font-bold text-primary group-hover:text-primary-hover transition-colors">{phase.phase}</h4>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-2 py-1 bg-[rgba(255,255,255,0.03)] rounded border border-[rgba(255,255,255,0.06)] shrink-0 h-fit">
                        {phase.duration}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">{phase.goal}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Column */}
        <div className="lg:col-span-5 space-y-8">
          {/* Score Matrix */}
          <div className="bg-card border border-card-border p-8 rounded-[1.5rem] shadow-glass">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3 uppercase tracking-tighter">
              <Sparkles size={20} className="text-primary" /> Success Matrix
            </h3>
            <div className="space-y-5">
              {[
                { label: "Interest Match", val: data.success_probability_inputs.interest_match, color: "bg-primary" },
                { label: "Skill Alignment", val: data.success_probability_inputs.skill_alignment * 10, color: "bg-accent" },
                { label: "Market Opportunity", val: data.success_probability_inputs.market_opportunity * 10, color: "bg-secondary" },
                { label: "Competition Level", val: data.success_probability_inputs.competition_level * 10, color: "bg-rose-500" },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    <span>{item.label}</span>
                    <span className="text-zinc-300 font-mono">{Math.round(item.val)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden border border-[rgba(255,255,255,0.05)]">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.val}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={`h-full ${item.color.replace('bg-', 'bg-opacity-100 ')}`}
                      style={{ backgroundColor: item.color === 'bg-primary' ? '#7C3AED' : item.color === 'bg-accent' ? '#22D3EE' : item.color === 'bg-secondary' ? '#EC4899' : '#F43F5E' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Snapshot */}
          <div className="bg-card border border-card-border p-8 rounded-[1.5rem] shadow-glass">
             <h3 className="text-xl font-black mb-6 flex items-center gap-3 uppercase tracking-tighter">
               <TrendingUp size={20} className="text-secondary" /> Market Insights
             </h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-5 rounded-2xl hover:bg-[rgba(255,255,255,0.06)] transition-all">
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Market Demand</div>
                  <div className="text-lg font-bold">{data.market_demand}</div>
                </div>
                <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-5 rounded-2xl hover:bg-[rgba(255,255,255,0.06)] transition-all">
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Complexity</div>
                  <div className="text-lg font-bold">{data.difficulty_level}</div>
                </div>
                <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-5 rounded-2xl col-span-2 hover:bg-[rgba(255,255,255,0.06)] transition-all flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Projected Salary</div>
                    <div className="text-2xl font-black text-emerald-400">{data.average_salary_range}</div>
                  </div>
                  <DollarSign size={24} className="text-[rgba(16,185,129,0.1)]" />
                </div>
             </div>
          </div>

          {/* Skills Required */}
          <div className="bg-card border border-card-border p-8 rounded-[1.5rem] shadow-glass">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3 uppercase tracking-tighter">
              <GraduationCap size={20} className="text-primary" /> Skill Graph
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.skills_required.map((skill, i) => (
                <span key={i} className="px-4 py-2 bg-[rgba(124,58,237,0.03)] border border-[rgba(124,58,237,0.1)] text-zinc-300 rounded-xl text-xs font-semibold hover:border-primary/50 transition-all cursor-default">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Risks */}
          <div className="bg-[rgba(244,63,94,0.03)] border border-[rgba(244,63,94,0.1)] p-8 rounded-[1.5rem] relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 rotate-12 text-[rgba(244,63,94,0.05)] group-hover:text-[rgba(244,63,94,0.1)] transition-colors">
               <AlertTriangle size={64} />
             </div>
             <h3 className="text-xl font-black mb-6 flex items-center gap-3 uppercase tracking-tighter text-rose-500">
               Reality Check
             </h3>
             <div className="space-y-4">
               {data.risk_factors.map((risk, i) => (
                 <div key={i} className="flex gap-3 text-sm text-zinc-400 leading-relaxed">
                   <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                   {risk}
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* Floating CTA Section */}
      <div className="mt-8">
        <div className="bg-gradient-primary p-[1px] rounded-[1.5rem] shadow-[0_0_50px_rgba(124,58,237,0.2)]">
          <div className="bg-background rounded-[1.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-3xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-primary/5 animate-pulse" />
            <div className="relative z-10 text-center md:text-left">
              <h4 className="text-sm font-black uppercase tracking-widest text-primary mb-2">Roadmap Locked In</h4>
              <p className="text-zinc-400 max-w-lg">
                Your path to becoming a <span className="text-zinc-200 font-bold">{data.career}</span> is ready. Step into the simulation to test your skills in real-world scenarios.
              </p>
            </div>
            
            <motion.button
              onClick={onProceed}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-primary text-white font-black py-5 px-10 rounded-2xl flex items-center justify-center gap-3 transition-all group relative z-10 shadow-2xl"
            >
              <span>Begin Simulation</span>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
