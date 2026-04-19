"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Bot, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";

interface Message {
  role: "user" | "assistant";
  content: string;
}

import { fetchWithRetry } from "@/lib/fetchWithRetry";

export default function FutureSimulation({ dream, onComplete }: { dream: string; onComplete: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [xp, setXp] = useState(0);
  const [selectionFeedback, setSelectionFeedback] = useState<{
    text: string;
    outcome: string;
    consequence: string;
    xpChange: number;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-start simulation
  useEffect(() => {
    if (messages.length === 0) {
      handleChat();
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, selectionFeedback]);

  const handleChat = async (userChoice?: string) => {
    setLoading(true);
    setSelectionFeedback(null);
    const updatedHistory = [...messages];
    if (userChoice) {
      updatedHistory.push({ role: "user", content: userChoice });
      setMessages(updatedHistory);
    }

    try {
      const result = await fetchWithRetry("/api/simulation", {
        method: "POST",
        body: JSON.stringify({ dream, history: updatedHistory }),
        headers: { "Content-Type": "application/json" },
      });
      if (result.error) throw new Error(result.error);
      setMessages([...updatedHistory, { role: "assistant", content: result.content }]);
    } catch (err: any) {
      toast.error("Simulation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChoiceClick = (choice: { text: string; outcome: string; consequence: string; xpChange: number }) => {
    if (selectionFeedback) return;
    setSelectionFeedback(choice);
    // Add XP immediately
    setXp(prev => prev + choice.xpChange);
  };

  const choices = messages.length > 0 && messages[messages.length - 1].role === "assistant" 
    ? extractChoices(messages[messages.length - 1].content) 
    : [];

  return (
    <div className="flex flex-col h-[75vh] glass-card rounded-3xl overflow-hidden relative">
      <div className="bg-primary/10 border-b border-white/5 py-3 px-6 flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="text-primary" />
          Future Reality Simulator
        </h3>
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 px-3 py-1 rounded-full border border-primary/30 flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">XP</span>
            <span className="text-sm font-bold text-primary font-mono">{xp}</span>
          </div>
          <button
            onClick={onComplete}
            aria-label="Finish Simulation and View Roadmap"
            className="bg-white/10 hover:bg-white/20 text-white font-medium py-1.5 px-4 rounded-xl text-sm transition-all"
          >
            Finish Simulation
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        <AnimatePresence>
          {messages.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-5 rounded-2xl flex gap-4 ${
                  m.role === "user"
                    ? "bg-primary text-white ml-auto"
                    : "bg-white/5 border border-white/10 text-zinc-100"
                }`}
              >
                <div className="shrink-0 mt-1">
                  {m.role === "user" ? <User size={20} /> : <Bot size={20} className="text-primary" />}
                </div>
                <div className="prose prose-invert max-w-none text-lg leading-relaxed whitespace-pre-line">
                  {m.role === "assistant" ? cleanAssistantContent(m.content) : m.content}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {selectionFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-white/5 border-2 border-primary/30 rounded-2xl animate-pulse-slow max-w-[85%]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded ${
                selectionFeedback.outcome.toLowerCase() === 'good' ? 'bg-emerald-500/20 text-emerald-500' :
                selectionFeedback.outcome.toLowerCase() === 'bad' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'
              }`}>
                {selectionFeedback.outcome} Outcome
              </span>
              <span className={`text-sm font-bold ${selectionFeedback.xpChange > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {selectionFeedback.xpChange > 0 ? '+' : ''}{selectionFeedback.xpChange} XP
              </span>
            </div>
            <p className="text-lg text-zinc-200 leading-relaxed italic">&quot;{selectionFeedback.consequence}&quot;</p>
            <button 
              onClick={() => handleChat(selectionFeedback.text)}
              className="mt-4 w-full bg-primary hover:bg-primary-hover p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              Continue Simulation <ChevronRight size={18} />
            </button>
          </motion.div>
        )}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-3">
              <Loader2 className="text-primary animate-spin" />
              <p className="text-zinc-500 italic">Simulator breathing life into your future...</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Choices UI */}
      {!loading && !selectionFeedback && choices.length > 0 && (
        <div className="p-6 bg-gradient-to-t from-black to-zinc-900/50 space-y-3">
          <p className="text-sm font-semibold text-zinc-500 uppercase tracking-widest pl-2">State your choice</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => handleChoiceClick(choice)}
                disabled={!!selectionFeedback}
                className="text-left bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/50 p-4 rounded-xl transition-all flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-medium text-lg">{choice.text}</span>
                <ChevronRight className="text-primary group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Manual Input (Fallback) */}
      {!loading && choices.length === 0 && messages.length > 0 && !selectionFeedback && (
        <div className="p-6 border-t border-white/5 flex gap-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleChat(input)}
            placeholder="Type your response..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-lg"
          />
          <button
            onClick={() => handleChat(input)}
            aria-label="Send message"
            className="bg-primary hover:bg-primary-hover p-4 rounded-xl transition-all"
          >
            <Send />
          </button>
        </div>
      )}
    </div>
  );
}

// Helpers to extract choices from assistant text with the new format (Choice [OUTCOME: ...])
function extractChoices(text: string): { 
  text: string; 
  outcome: string; 
  consequence: string; 
  xpChange: number; 
}[] {
  const lines = text.split("\n").filter(l => l.trim().startsWith("-"));
  
  return lines.map(line => {
    const textMatch = line.match(/^-\s(.*?)\s\[/);
    const outcomeMatch = line.match(/OUTCOME:\s(.*?)\s\|/);
    const consequenceMatch = line.match(/CONSEQUENCE:\s(.*?)\s\|/);
    const xpMatch = line.match(/XP:\s([+-]?\d+)\]/);

    return {
      text: textMatch ? textMatch[1].trim() : line.replace(/^-\s/, "").split("[")[0].trim(),
      outcome: outcomeMatch ? outcomeMatch[1].trim() : "Neutral",
      consequence: consequenceMatch ? consequenceMatch[1].trim() : "You continue your journey.",
      xpChange: xpMatch ? parseInt(xpMatch[1]) : 5
    };
  });
}

function cleanAssistantContent(text: string): string {
  // Remove the choices and their metadata from the main bubble
  const parts = text.split("\n-");
  return parts[0].trim();
}
