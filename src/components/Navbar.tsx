"use client"
import { useState, useEffect, cloneElement } from "react"
import Link from "next/link"
import Logo from "./Logo"
import { motion, AnimatePresence } from "framer-motion"
import { Github, Info, Mail, X, Send, Loader2, CheckCircle2, Linkedin, Map, Cpu, Users, Smartphone, GraduationCap, Globe, Briefcase, Handshake, LayoutDashboard, Award as LucideAward } from "lucide-react"

const TEAM = [
  { initial: "D", name: "Devansh Katkar", role: "Full Stack Developer & AI Architect", color: "#f59e0b", bg: "rgba(245,158,11,0.2)" },
]

const TECH_STACK = ["Next.js", "TypeScript", "Framer Motion", "Groq", "Gemini", "OpenRouter", "Tailwind"]

import { useAuth } from "@/hooks/useAuth"

export default function Navbar() {
  const { user, loginWithGoogle, logout } = useAuth()
  const [modal, setModal] = useState<"about" | "contact" | "roadmap" | null>(null)
  const [contactForm, setContactForm] = useState({ email: "", message: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSent, setIsSent] = useState(false)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal(null)
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactForm.email || !contactForm.message) return

    setIsSubmitting(true)
    setTimeout(() => {
      const messages = JSON.parse(localStorage.getItem("d2r_contact_messages") || "[]")
      messages.push({ ...contactForm, timestamp: new Date().toISOString() })
      localStorage.setItem("d2r_contact_messages", JSON.stringify(messages))

      setIsSubmitting(false)
      setIsSent(true)

      setTimeout(() => {
        setModal(null)
        setIsSent(false)
        setContactForm({ email: "", message: "" })
      }, 2000)
    }, 1500)
  }

  const [imgError, setImgError] = useState(false)

  return (
    <>
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, height: "64px", zIndex: 100,
          background: "rgba(7, 8, 15, 0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}
      >
        <div className="flex items-center">
          <Logo />
        </div>

        <div className="hidden md:flex items-center gap-[12px]">
          {/* ... existing links ... */}
          <Link href="/">
            <motion.div
              whileHover={{ backgroundColor: "rgba(255,255,255,0.06)" }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-[8px] px-3 py-1.5 rounded-lg text-[13px] text-white/40 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              <Cpu size={14} />
              <span className="font-medium">Home</span>
            </motion.div>
          </Link>

          {user && (
            <Link href="/dashboard">
              <motion.div
                whileHover={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-[8px] px-3 py-1.5 rounded-lg text-[13px] text-white/40 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                <LayoutDashboard size={14} />
                <span className="font-medium">Dashboard</span>
              </motion.div>
            </Link>
          )}

          <motion.div
            onClick={() => setModal("roadmap")}
            whileHover={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-[8px] px-3 py-1.5 rounded-lg text-[13px] text-white/40 hover:text-white transition-colors duration-200 cursor-pointer"
          >
            <Map size={14} />
            <span className="font-medium">Future</span>
          </motion.div>

          <motion.div
            onClick={() => setModal("about")}
            whileHover={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-[8px] px-3 py-1.5 rounded-lg text-[13px] text-white/40 hover:text-white transition-colors duration-200 cursor-pointer"
          >
            <Info size={14} />
            <span className="font-medium">About</span>
          </motion.div>

          <div className="w-[1px] h-4 bg-white/10 mx-2" />

          {user ? (
            <div className="flex items-center gap-4 pl-2">
              <div className="flex flex-col items-end justify-center h-full">
                <span className="text-[12px] font-bold text-white mb-0.5">{user.displayName}</span>
                <span className="text-[10px] text-primary font-black uppercase tracking-[0.1em] opacity-80">Explorer</span>
              </div>
              <motion.button
                onClick={logout}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative group w-10 h-10 rounded-xl overflow-hidden border border-white/10 p-[1px] bg-gradient-to-br from-primary/30 to-secondary/30"
              >
                <div className="w-full h-full rounded-[10px] overflow-hidden bg-black">
                  {user.photoURL && !imgError ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || "User"} 
                      className="w-full h-full object-cover" 
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary text-white font-black text-sm">
                      {user.displayName?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
              </motion.button>
            </div>
          ) : (
            <motion.button
              onClick={loginWithGoogle}
              whileHover={{ scale: 1.02, backgroundColor: "rgba(124,106,247,0.15)" }}
              whileTap={{ scale: 0.98 }}
              className="ml-2 px-5 py-2 bg-primary/10 border border-primary/25 text-primary text-[12px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 hover:bg-primary/20 transition-all shadow-lg"
            >
              Sign In
            </motion.button>
          )}
        </div>
      </nav>

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModal(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-[4px]"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="relative w-full max-w-[520px] max-h-[85vh] overflow-y-auto bg-[#0d0f1c] border border-white/10 rounded-[20px] p-7 md:p-8 shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setModal(null)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all transition-colors"
              >
                <X size={14} />
              </button>

              {modal === "about" ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Logo />
                  </div>

                  <div className="space-y-1">
                    <p className="text-white/80 text-lg font-medium italic">"Experience your future before you live it."</p>
                    <p style={{
                      fontSize: "14px",
                      lineHeight: "1.8",
                      color: "rgba(255,255,255,0.65)",
                      margin: "20px 0",
                      padding: "16px",
                      background: "rgba(124,106,247,0.06)",
                      border: "1px solid rgba(124,106,247,0.15)",
                      borderRadius: "12px"
                    }}>
                      Dream2Reality AI solves one of India's biggest education
                      problems — students have dreams but no roadmap to achieve
                      them. Our platform takes a single sentence describing your
                      dream career and instantly generates a complete skill gap
                      analysis, a week-by-week learning roadmap, an AI-powered
                      career simulation with real workplace scenarios, salary
                      trajectory charts, mentor profiles, and a personalized
                      Reality Score — all powered by a multi-provider AI system
                      that never goes down.
                    </p>
                    <div className="flex items-center gap-2 text-[13px] text-primary font-bold uppercase tracking-widest pb-2">
                      <Trophy size={14} />
                      <span>Built at AI Hackathon • March 2026</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">What we built</h5>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                      {["AI career simulation engine", "Multi-provider API rotation", "Dream → Reality in 4 steps", "Personalized skill gap analysis"].map(item => (
                        <li key={item} className="flex items-center gap-2 text-sm text-white/70">
                          <span className="text-primary text-xs">✦</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="h-[1px] w-full bg-white/5" />

                  <div className="space-y-4">
                    <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">👥 JSDK Coders Team</h5>
                    <div className="grid gap-3">
                      {TEAM.map(member => (
                        <div key={member.name} className="flex items-center gap-3 group">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-black transition-transform group-hover:scale-110"
                            style={{ backgroundColor: member.bg, color: member.color }}
                          >
                            {member.initial}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white tracking-wide">{member.name}</div>
                            <div className="text-[11px] text-zinc-500 font-medium">{member.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-[1px] w-full bg-white/5" />

                  <div className="space-y-3">
                    <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">Tech Stack</h5>
                    <div className="flex flex-wrap gap-2">
                      {TECH_STACK.map(tech => (
                        <span key={tech} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[12px] text-white/60 font-medium tracking-tight">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <a
                      href="https://github.com/devanshkatkar246/Dream2Reality-AI"
                      target="_blank"
                      className="w-full py-3 bg-white/5 border border-primary/40 text-primary hover:bg-primary/10 transition-colors rounded-xl font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-2"
                    >
                      <Github size={14} /> View on GitHub →
                    </a>
                  </div>
                </div>
              ) : modal === "roadmap" ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[#a594ff]">
                      <Map size={20} />
                      <h3 className="text-xl font-black uppercase tracking-tighter">🗺️ What&apos;s Coming Next</h3>
                    </div>
                    <p className="text-zinc-500 text-sm">Our vision for Dream2Reality AI</p>
                  </div>

                  <div className="space-y-8">
                    {/* Phase 1 */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">Phase 1</span>
                        <span className="bg-[#E1F5EE] text-[#085041] px-2.5 py-0.5 rounded-full text-[10px] font-bold">Coming Soon</span>
                      </div>
                      <div className="space-y-2">
                        {[
                          { Icon: Cpu, title: "AI Mock Interview Simulator", desc: "Practice real interview Q&As for your target company", bg: "rgba(34,197,94,0.15)" },
                          { Icon: Users, title: "Peer Learning Network", desc: "Connect with students on the same career path", bg: "rgba(34,197,94,0.15)" },
                          { Icon: Smartphone, title: "Mobile App (iOS & Android)", desc: "Full experience on your phone", bg: "rgba(34,197,94,0.15)" },
                        ].map((feature, i) => (
                          <div key={i} className="flex gap-[14px] items-start p-[14px_16px] bg-white/[0.03] border border-white/[0.06] rounded-xl hover:bg-white/[0.06] transition-all duration-200">
                            <div className="w-[32px] h-[32px] shrink-0 rounded-full flex items-center justify-center" style={{ background: feature.bg }}>
                              <feature.Icon size={16} className="text-white" />
                            </div>
                            <div>
                              <div className="text-[14px] font-semibold text-white">{feature.title}</div>
                              <div className="text-[12px] text-white/50 mt-0.5">{feature.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Phase 2 */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">Phase 2</span>
                        <span className="bg-[#FAEEDA] text-[#633806] px-2.5 py-0.5 rounded-full text-[10px] font-bold">In Development</span>
                      </div>
                      <div className="space-y-2">
                        {[
                          { Icon: GraduationCap, title: "College & Exam Roadmap", desc: "GATE, NEET, CLAT specific preparation paths", bg: "rgba(245,158,11,0.15)" },
                          { Icon: Globe, title: "Global University Matcher", desc: "Find universities worldwide aligned with your dream", bg: "rgba(245,158,11,0.15)" },
                          { Icon: Briefcase, title: "Real Job Listings Integration", desc: "Live jobs matching your exact skill level", bg: "rgba(245,158,11,0.15)" },
                        ].map((feature, i) => (
                          <div key={i} className="flex gap-[14px] items-start p-[14px_16px] bg-white/[0.03] border border-white/[0.06] rounded-xl hover:bg-white/[0.06] transition-all duration-200">
                            <div className="w-[32px] h-[32px] shrink-0 rounded-full flex items-center justify-center" style={{ background: feature.bg }}>
                              <feature.Icon size={16} className="text-white" />
                            </div>
                            <div>
                              <div className="text-[14px] font-semibold text-white">{feature.title}</div>
                              <div className="text-[12px] text-white/50 mt-0.5">{feature.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Phase 3 */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">Phase 3</span>
                        <span className="bg-[#EEEDFE] text-[#3C3489] px-2.5 py-0.5 rounded-full text-[10px] font-bold">Future Vision</span>
                      </div>
                      <div className="space-y-2">
                        {[
                          { Icon: Handshake, title: "1-on-1 Mentor Booking", desc: "Book real sessions with verified industry mentors", bg: "rgba(124,106,247,0.15)" },
                          { Icon: LayoutDashboard, title: "Progress Tracking Dashboard", desc: "Track your learning journey over months and years", bg: "rgba(124,106,247,0.15)" },
                          { Icon: LucideAward, title: "Career Achievement System", desc: "Earn badges as you complete milestones on your roadmap", bg: "rgba(124,106,247,0.15)" },
                        ].map((feature, i) => (
                          <div key={i} className="flex gap-[14px] items-start p-[14px_16px] bg-white/[0.03] border border-white/[0.06] rounded-xl hover:bg-white/[0.06] transition-all duration-200">
                            <div className="w-[32px] h-[32px] shrink-0 rounded-full flex items-center justify-center" style={{ background: feature.bg }}>
                              <feature.Icon size={16} className="text-white" />
                            </div>
                            <div>
                              <div className="text-[14px] font-semibold text-white">{feature.title}</div>
                              <div className="text-[12px] text-white/50 mt-0.5">{feature.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  <div className="bg-[#7c6af7]/10 border border-[#7c6af7]/15 rounded-xl p-4 text-center mt-6">
                    <p className="text-[13px] text-white/60">
                      💡 Have a feature idea? We&apos;d love to hear from you!
                    </p>
                    <button
                      onClick={() => setModal("contact")}
                      className="mt-2 text-[#a594ff] text-[13px] font-bold hover:underline transition-all"
                    >
                      Share your idea →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary">
                      <Mail size={20} />
                      <h3 className="text-xl font-black uppercase tracking-tighter">Get in Touch</h3>
                    </div>
                    <p className="text-zinc-500 text-sm">We'd love to hear your feedback or collaboration ideas.</p>
                  </div>

                  <div className="h-[1px] w-full bg-white/5" />

                  {!isSent ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500 ml-1">Your Email</label>
                        <input
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500 ml-1">Message</label>
                        <textarea
                          required
                          rows={4}
                          placeholder="How can we help you?"
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors resize-none"
                        />
                      </div>
                      <button
                        disabled={isSubmitting || !contactForm.email || !contactForm.message}
                        className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest text-sm rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                      >
                        {isSubmitting ? (
                          <><Loader2 size={18} className="animate-spin" /> Sending...</>
                        ) : (
                          <><Send size={18} /> Send Message →</>
                        )}
                      </button>
                    </form>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-12 flex flex-col items-center justify-center text-center space-y-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                        <CheckCircle2 size={32} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xl font-bold text-white">Message Sent!</h4>
                        <p className="text-zinc-500 text-sm">We'll get back to you as soon as possible.</p>
                      </div>
                    </motion.div>
                  )}

                  <div className="h-[1px] w-full bg-white/5" />

                  <div className="space-y-4">
                    <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">Other channels</h5>
                    <div className="grid gap-3">
                      <a href="mailto:devanshkatkar20@gmail.com" className="flex items-center gap-3 text-zinc-500 hover:text-white transition-colors group">
                        <Mail size={16} className="group-hover:text-primary" />
                        <span className="text-sm font-medium">devanshkatkar20@gmail.com</span>
                      </a>
                      <a href="https://github.com/devanshkatkar246/Dream2Reality-AI" target="_blank" className="flex items-center gap-3 text-zinc-500 hover:text-white transition-colors group">
                        <Github size={16} className="group-hover:text-primary" />
                        <span className="text-sm font-medium">github.com/jsdk-coders</span>
                      </a>
                      <a href="https://www.linkedin.com/in/devansh-katkar-695b69317/" target="_blank" className="flex items-center gap-3 text-zinc-500 hover:text-white transition-colors group">
                        <Linkedin size={16} className="group-hover:text-primary" />
                        <span className="text-sm font-medium">linkedin.com/in/devansh-katkar</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

function Trophy({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}
