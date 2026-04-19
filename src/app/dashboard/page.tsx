"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, Calendar, Trash2, ExternalLink, 
  Search, Filter, Loader2, Sparkles, LayoutGrid
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Cache-first loading
  useEffect(() => {
    const cached = localStorage.getItem("d2r_simulations");
    if (cached) {
      setSimulations(JSON.parse(cached));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchSimulations = async () => {
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, "simulations"), 
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSimulations(docs);
        localStorage.setItem("d2r_simulations", JSON.stringify(docs));
      } catch (error) {
        console.error("Error fetching simulations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimulations();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!db) return;
    if (!window.confirm("Are you sure you want to delete this simulation?")) return;
    try {
      await deleteDoc(doc(db, "simulations", id));
      setSimulations(prev => prev.filter(s => s.id !== id));
      toast.success("Simulation removed.");
    } catch (error) {
      toast.error("Failed to delete.");
    }
  };

  const filteredSims = simulations.filter(s => 
    s.career.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.dream.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="text-primary animate-spin" size={48} />
      </div>
    );
  }

  const SkeletonCard = () => (
    <div className="bg-card border border-card-border p-6 rounded-2xl animate-pulse space-y-4">
      <div className="w-10 h-10 bg-white/5 rounded-lg" />
      <div className="h-6 bg-white/5 rounded w-3/4" />
      <div className="h-3 bg-white/5 rounded w-1/2" />
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="h-10 bg-white/5 rounded-xl" />
        <div className="h-10 bg-white/5 rounded-xl" />
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h2 className="text-2xl font-bold">Please sign in to view your dashboard.</h2>
        <Link href="/" className="px-6 py-2 bg-primary rounded-lg font-bold">Back to Home</Link>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-6 pt-24 pb-12 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
             <LayoutGrid className="text-primary" />
             My Career Lab
          </h1>
          <p className="text-zinc-500">Track your future evolutions and saved roadmaps.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text" 
            placeholder="Search simulations..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && !simulations.length ? (
            Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            filteredSims.map((sim, idx) => (
              <motion.div
                layout
                key={sim.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-card border border-card-border p-6 rounded-2xl group relative hover:border-primary/30 transition-all flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary/10 p-2.5 rounded-lg border border-primary/20 text-primary">
                    <Briefcase size={20} />
                  </div>
                  <button 
                    onClick={() => handleDelete(sim.id)}
                    className="text-zinc-600 hover:text-rose-500 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 className="text-xl font-bold mb-1 truncate">{sim.career}</h3>
                <p className="text-xs text-zinc-500 mb-4 line-clamp-1 italic">&quot;{sim.dream}&quot;</p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Score</div>
                    <div className="text-lg font-black text-emerald-400">{sim.realityScore}</div>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Date</div>
                    <div className="text-sm font-bold flex items-center gap-1 mt-1">
                      <Calendar size={12} className="text-zinc-500" />
                      {sim.createdAt?.toDate ? new Date(sim.createdAt.toDate()).toLocaleDateString() : "Fixed"}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 flex gap-3">
                  <Link 
                    href={`/?dream=${encodeURIComponent(sim.dream)}`} 
                    className="flex-1 py-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/20 transition-all"
                  >
                    <Sparkles size={14} /> Re-analyze
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </AnimatePresence>

      {!filteredSims.length && !loading && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-zinc-600 mb-6">
            <Search size={40} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No simulations found</h2>
          <p className="text-zinc-500 max-w-xs">Start your first career evolution to see it saved here.</p>
          <Link href="/" className="mt-6 px-8 py-3 bg-gradient-primary rounded-xl font-bold uppercase tracking-widest text-xs">
            Begin Journey
          </Link>
        </motion.div>
      )}
    </main>
  );
}
