import { useState, useMemo } from "react";
import { Send, Rocket, Brain, Zap, Map, Sparkles, Wand2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SUGGESTIONS = [
  "AI Solopreneur in Bali",
  "Sustainable Architect in Scandinavia",
  "Blockchain Developer in San Francisco",
  "Esports Coach in Seoul",
  "Zero-Waste Fashion Designer",
  "Deep Tech Ethical Hacker"
];

export default function DreamInput({ onSubmit }: { onSubmit: (dream: string) => void }) {
  const [dream, setDream] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Clarity score logic
  const clarityScore = useMemo(() => {
    if (!dream.trim()) return 0;
    const wordCount = dream.trim().split(/\s+/).length;
    let score = Math.min(wordCount * 5, 60); // Max 60 from length
    
    // Bonus for specific words
    const specificWords = ["become", "want", "live", "create", "build", "master", "work", "lead"];
    specificWords.forEach(w => {
      if (dream.toLowerCase().includes(w)) score += 5;
    });
    
    return Math.min(score, 100);
  }, [dream]);

  const getClarityLabel = (score: number) => {
    if (score < 30) return { label: "Vague", color: "text-rose-500", bg: "bg-rose-500" };
    if (score < 60) return { label: "Developing", color: "text-amber-500", bg: "bg-amber-500" };
    return { label: "Crystal Clear", color: "text-emerald-500", bg: "bg-emerald-500" };
  };

  const clarityInfo = getClarityLabel(clarityScore);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dream.trim()) {
      onSubmit(dream);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, y: 0,
        borderColor: isFocused ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)",
        boxShadow: isFocused ? "0 0 30px rgba(124,58,237,0.1)" : "none"
      }}
      transition={{ duration: 0.3 }}
      className="glass-card p-8 md:p-12 rounded-[2rem] relative z-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <h2 className="text-3xl font-black flex items-center gap-3">
          <Rocket className="text-primary w-8 h-8" />
          Manifest Your Future
        </h2>
        
        {dream && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-end"
          >
            <div className="flex items-center gap-2 mb-1.5">
               <span className={`text-[10px] font-black uppercase tracking-widest ${clarityInfo.color}`}>{clarityInfo.label}</span>
               <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                 <motion.div 
                   className={`h-full ${clarityInfo.bg}`}
                   animate={{ width: `${clarityScore}%` }}
                 />
               </div>
            </div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Dream Depth Score</p>
          </motion.div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
          <textarea
            value={dream}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setDream(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (dream.trim()) onSubmit(dream);
              }
            }}
            placeholder="Describe your dream career in detail..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-xl focus:outline-none transition-all min-h-[200px] resize-none placeholder:text-zinc-600 focus:bg-white/[0.08] shadow-inner"
          />
          <div className="absolute right-4 bottom-4 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background/50 border border-white/10 rounded-lg text-[10px] font-bold text-zinc-500">
               <Info size={12} /> SHIFT + ENTER for line break
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 pl-1">
            <Sparkles size={12} className="text-primary" /> Suggestions
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setDream(s)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                {s}
              </button>
            ))}
            <button
               type="button"
               onClick={() => setDream("")}
               className="px-4 py-2 text-rose-500/50 hover:text-rose-500 transition-colors text-xs font-bold"
            >
              Clear
            </button>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={!dream.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-primary text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_10px_40px_rgba(124,58,237,0.3)] disabled:opacity-50 disabled:grayscale disabled:scale-100 group mt-4 overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          <Wand2 size={20} className="relative z-10" />
          <span className="text-lg relative z-10">Generate Evolution</span>
        </motion.button>
      </form>

      <div className="mt-12 grid grid-cols-3 gap-6">
        {[
          { label: "Analyze", icon: Brain, color: "text-accent" },
          { label: "Simulate", icon: Zap, color: "text-secondary" },
          { label: "Manifest", icon: Map, color: "text-primary" },
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center text-center">
            <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${item.color} mb-3 shadow-lg`}>
              <item.icon size={22} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{item.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

