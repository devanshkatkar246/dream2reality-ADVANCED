"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { Activity, ChevronUp, ChevronDown, Key, Server, RefreshCw, Zap } from "lucide-react";

interface ProviderStatus {
  name: string;
  model: string;
  status: "active" | "rate_limited" | "exhausted" | "not_configured";
  keysTotal: number;
  keysAvailable: number;
  requestsThisSession: number;
  lastUsed: number | null;
  rateLimitResetIn: number | null;
}

interface FullStatus {
  activeProvider: string;
  providers: ProviderStatus[];
  totalRequestsServed: number;
  serverUptime: number;
}

export default function UsageStats() {
  const [status, setStatus] = useState<FullStatus | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [cached, setCached] = useState<string | null>(null);
  const [localCounters, setLocalCounters] = useState<Record<string, number>>({});
  const [timers, setTimers] = useState<Record<string, number>>({});
  const lastActiveProvider = useRef<string>("");

  useEffect(() => {
    const handleHit = (e: any) => setCached(e.detail?.type || 'hit');
    const handleClear = () => setCached(null);
    window.addEventListener('api-cache-hit', handleHit);
    window.addEventListener('api-cache-clear', handleClear);
    return () => {
      window.removeEventListener('api-cache-hit', handleHit);
      window.removeEventListener('api-cache-clear', handleClear);
    };
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/ai-status");
      const data: FullStatus = await res.json();
      
      // Check for recovery notifications
      if (status) {
        status.providers.forEach(p => {
          const newP = data.providers.find(np => np.name === p.name);
          if (p.status === "rate_limited" && newP?.status === "active") {
            toast.success(`✓ ${p.name.toUpperCase()} recovered — switching back`, {
              position: "bottom-right",
              autoClose: 3000
            });
          }
        });
      }

      // Flash on provider change
      if (lastActiveProvider.current && lastActiveProvider.current !== data.activeProvider) {
        // Handled by framer-motion animate on border
      }
      lastActiveProvider.current = data.activeProvider;

      setStatus(data);
      
      // Update timers
      const newTimers: Record<string, number> = {};
      data.providers.forEach(p => {
        if (p.rateLimitResetIn) newTimers[p.name] = p.rateLimitResetIn;
      });
      setTimers(newTimers);

    } catch (e) {
      console.error("AI Status fetch failed", e);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimers(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          if (next[key] > 0) next[key] = Math.max(0, next[key] - 1000);
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!status) return null;

  const active = status.providers.find(p => p.name === status.activeProvider) || status.providers[0];

  const formatTime = (ms: number) => {
    const s = Math.ceil(ms / 1000);
    if (s >= 3600) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
    if (s >= 60) return `${Math.floor(s / 60)}m ${s % 60}s`;
    return `${s}s`;
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "active": return "emerald";
      case "rate_limited": return "amber";
      case "exhausted": return "red";
      default: return "zinc";
    }
  };

  const getStatusIcon = (s: string) => {
    switch (s) {
      case "active": return "●";
      case "rate_limited": return "◐";
      case "exhausted": return "○";
      default: return "—";
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-sans">
      <motion.div
        layout
        onClick={() => setExpanded(!expanded)}
        initial={false}
        animate={{ 
          width: expanded ? 280 : 220,
          borderColor: [null, "rgba(245, 158, 11, 0.5)", "rgba(39, 39, 42, 1)"],
        }}
        transition={{ duration: 0.25 }}
        className="glass-card border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden cursor-pointer bg-zinc-950/90 backdrop-blur-xl"
        style={{ transformOrigin: "bottom right" }}
      >
        {/* Collapsed State */}
        {!expanded && (
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-emerald-500 ${!cached ? 'animate-pulse' : ''}`}>{cached ? '⚡' : '●'}</span>
                <span className="text-[10px] font-black uppercase tracking-tighter text-white">
                  {cached ? `CACHED (${cached.toUpperCase()})` : `${status.activeProvider} ACTIVE`}
                </span>
              </div>
              <span className="text-[9px] text-zinc-500 font-mono">{active.model}</span>
            </div>
            <div className="flex justify-between items-center text-[9px] text-zinc-500">
              <span>{active.keysAvailable}/{active.keysTotal} keys</span>
              <span>•</span>
              <span className="font-mono">{status.totalRequestsServed?.toLocaleString()} req served</span>
            </div>
          </div>
        )}

        {/* Expanded State */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col"
            >
              <div className="p-4 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest">API STATUS</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 text-[9px]">
                  <span>↑ collapse</span>
                </div>
              </div>

              <div className="divide-y divide-zinc-900">
                {status.providers.map(p => {
                  const color = getStatusColor(p.status);
                  const isExhausted = p.status === "exhausted";
                  const isNotConfigured = p.status === "not_configured";

                  return (
                    <div key={p.name} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-${color}-500 ${p.status === "active" ? "animate-pulse" : ""}`}>
                            {getStatusIcon(p.status)}
                          </span>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isNotConfigured ? 'text-zinc-600' : 'text-white'}`}>
                            {p.name}
                          </span>
                        </div>
                        <span className={`text-[9px] font-bold uppercase ${isNotConfigured ? 'text-zinc-700' : p.status === "active" ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {p.status.replace("_", " ")}
                        </span>
                      </div>

                      {!isNotConfigured ? (
                        <>
                          <div className="text-[9px] text-zinc-500 flex justify-between">
                            <span>Model: {p.model}</span>
                          </div>
                          <div className="flex gap-1">
                            {Array.from({ length: p.keysTotal }).map((_, i) => (
                              <div 
                                key={i} 
                                className={`h-1 flex-1 rounded-sm ${i < p.keysAvailable ? 'bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-red-500/50'}`} 
                              />
                            ))}
                          </div>
                          <div className="flex justify-between items-center text-[9px] font-mono">
                            <span className="text-zinc-500">
                              Keys: <span className="text-white">{p.keysAvailable}/{p.keysTotal} </span>
                            </span>
                            {timers[p.name] > 0 ? (
                              <span className={`${timers[p.name] < 60000 ? 'text-red-500 animate-pulse' : 'text-zinc-400'}`}>
                                Reset: {formatTime(timers[p.name])}
                              </span>
                            ) : (
                              <span className="text-zinc-500">Req: {p.requestsThisSession}</span>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-[9px] text-zinc-700 italic">
                          Add {p.name.toUpperCase()}_API_KEYS to .env
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-zinc-950/40 border-t border-zinc-900">
                 <div className="flex items-center gap-2 mb-3">
                    <Server size={12} className="text-zinc-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">MONITORED ENDPOINTS</span>
                 </div>
                 <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      "/api/dream",
                      "/api/roadmap",
                      "/api/score",
                      "/api/career-guidance",
                      "/api/compare-dreams"
                    ].map(route => (
                      <div key={route} className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                        <span className="text-[9px] font-mono text-zinc-400 truncate">{route}</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="p-3 bg-zinc-900/80 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-zinc-500 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  <span>Total Served: {status.totalRequestsServed}</span>
                </div>
                <div>
                  Up: {Math.floor(status.serverUptime / 60000)}m
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    localStorage.removeItem("dp_api_stats");
                  }}
                  className="hover:text-primary transition-colors hover:scale-110 active:scale-90"
                >
                  <RefreshCw size={10} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
