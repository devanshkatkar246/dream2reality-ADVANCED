"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Users, Linkedin, Twitter, Clock } from "lucide-react";
import { useInView } from "@/hooks/useInView";

interface Mentor {
  name: string;
  role: string;
  company: string;
  origin: string;
  journeyYears: number;
  quote: string;
  linkedinQuery: string;
  twitterHandle: string;
}

const MENTOR_FALLBACKS: Record<string, Mentor[]> = {
  "software|engineer|developer|coding": [
    { name: "Sundar Pichai", role: "CEO", company: "Google", origin: "Started as product manager at Google", journeyYears: 20, quote: "It does not matter where you come from, your dreams are valid.", linkedinQuery: "Sundar+Pichai+Google", twitterHandle: "@sundarpichai" },
    { name: "Kunal Shah", role: "Founder", company: "CRED", origin: "Started as software developer", journeyYears: 12, quote: "Build something people love, not something people need.", linkedinQuery: "Kunal+Shah+CRED", twitterHandle: "@kunalb11" },
    { name: "Ankur Warikoo", role: "Entrepreneur", company: "Nearbuy", origin: "Started with an MBA, pivoted to tech startups", journeyYears: 10, quote: "Consistency is the bridge between goals and accomplishment.", linkedinQuery: "Ankur+Warikoo", twitterHandle: "@warikoo" }
  ],
  "ai|machine learning|research|deepmind": [
    { name: "Demis Hassabis", role: "CEO & Co-founder", company: "Google DeepMind", origin: "Started as a game developer and neuroscientist", journeyYears: 15, quote: "Solve intelligence, then use it to solve everything else.", linkedinQuery: "Demis+Hassabis", twitterHandle: "@demishassabis" },
    { name: "Andrej Karpathy", role: "Former AI Lead", company: "Tesla / OpenAI", origin: "Started with a PhD in computer vision at Stanford", journeyYears: 10, quote: "Don't just read about AI — build things with it every day.", linkedinQuery: "Andrej+Karpathy", twitterHandle: "@karpathy" },
    { name: "Sai Gadde", role: "AI Engineer", company: "OpenAI", origin: "Started with open source contributions from India", journeyYears: 7, quote: "The gap between knowing and doing is where most people live.", linkedinQuery: "Sai+Gadde", twitterHandle: "" }
  ],
  "game|gaming|riot|unity|unreal": [
    { name: "Markus Persson", role: "Creator", company: "Minecraft / Mojang", origin: "Self-taught developer, built games on weekends", journeyYears: 8, quote: "Make the game you want to play.", linkedinQuery: "Markus+Persson", twitterHandle: "@notch" },
    { name: "Hideo Kojima", role: "Game Director", company: "Kojima Productions", origin: "Started in marketing, taught himself game design", journeyYears: 15, quote: "You are what you eat, read, and experience.", linkedinQuery: "Hideo+Kojima", twitterHandle: "@HIDEO_KOJIMA_EN" },
    { name: "Shreyans Bhansali", role: "Senior Game Dev", company: "Ubisoft India", origin: "Started with modding, joined indie studio", journeyYears: 6, quote: "Every bug you fix teaches you more than any tutorial.", linkedinQuery: "Shreyans+Bhansali", twitterHandle: "" }
  ],
  "doctor|medical|medicine|surgeon|health": [
    { name: "Devi Shetty", role: "Founder & Cardiac Surgeon", company: "Narayana Health", origin: "MBBS from Kasturba Medical College, trained in UK", journeyYears: 25, quote: "Medicine is not just a science; it is an art of healing.", linkedinQuery: "Devi+Shetty", twitterHandle: "" },
    { name: "Atul Gawande", role: "Surgeon & Author", company: "Harvard Medical School", origin: "Combined medicine with writing and public health", journeyYears: 20, quote: "The function of a surgeon is to give the patient a chance.", linkedinQuery: "Atul+Gawande", twitterHandle: "@Atul_Gawande" },
    { name: "Priya Sood", role: "Neurosurgeon", company: "AIIMS Delhi", origin: "NEET AIR 23, specialized in pediatric neurology", journeyYears: 12, quote: "Every patient is a teacher. Every surgery is a lesson.", linkedinQuery: "Priya+Sood+Neurosurgeon", twitterHandle: "" }
  ],
  "law|lawyer|legal|court|advocate": [
    { name: "Harish Salve", role: "Senior Advocate", company: "Supreme Court of India", origin: "Started as a chartered accountant, switched to law", journeyYears: 30, quote: "Law is reason free from passion.", linkedinQuery: "Harish+Salve", twitterHandle: "" },
    { name: "Indira Jaising", role: "Senior Advocate", company: "Supreme Court of India", origin: "LLB from Government Law College Mumbai", journeyYears: 35, quote: "Justice is not given — it is fought for.", linkedinQuery: "Indira+Jaising", twitterHandle: "@ijaising" },
    { name: "Abhinav Chandrachud", role: "Former Supreme Court Judge", company: "Supreme Court", origin: "LLB from ILS Law College, LLM from Harvard", journeyYears: 25, quote: "The law is a living thing — it grows with society.", linkedinQuery: "Abhinav+Chandrachud", twitterHandle: "" }
  ]
};

const DEFAULT_MENTORS: Mentor[] = [
  { name: "Ritesh Agarwal", role: "Founder & CEO", company: "OYO Rooms", origin: "Dropped out of college, started with one hotel room", journeyYears: 8, quote: "Chase your dreams with all your heart, not half your brain.", linkedinQuery: "Ritesh+Agarwal+OYO", twitterHandle: "@riteshagar" },
  { name: "Falguni Nayar", role: "Founder & CEO", company: "Nykaa", origin: "Investment banker for 19 years before founding Nykaa at 50", journeyYears: 10, quote: "It is never too late to follow your passion.", linkedinQuery: "Falguni+Nayar+Nykaa", twitterHandle: "@falguninayar" },
  { name: "Deepinder Goyal", role: "Founder & CEO", company: "Zomato", origin: "IIT Delhi graduate who started a food menu website", journeyYears: 14, quote: "Don't be afraid to start small and think big.", linkedinQuery: "Deepinder+Goyal+Zomato", twitterHandle: "@deepigoyal" }
];

export default function MentorMatch({ dream, mentors }: { dream: string, mentors?: Mentor[] }) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef);
  
  const getMentors = () => {
    if (mentors?.length) return mentors;
    for (const [key, value] of Object.entries(MENTOR_FALLBACKS)) {
      if (new RegExp(key, "i").test(dream)) return value;
    }
    return DEFAULT_MENTORS;
  };

  const currentMentors = getMentors();

  const getAvatarColors = (name: string) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      { bg: "#7c6af720", text: "#a594ff" },
      { bg: "#2dd4bf20", text: "#2dd4bf" },
      { bg: "#f59e0b20", text: "#f59e0b" }
    ];
    return colors[hash % colors.length];
  };

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="border-b border-white/10 pb-4 mb-8">
        <h3 className="text-2xl font-bold flex items-center gap-3">
          <Users size={24} className="text-[#a594ff]" />
          People Who Made This Journey
        </h3>
        <p className="text-zinc-500 text-sm mt-1">Real professionals on your exact path</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {currentMentors.map((mentor, i) => {
          const colors = getAvatarColors(mentor.name);
          const initials = mentor.name.split(' ').map(n => n[0]).join('').substring(0, 2);
          
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="bg-white/5 border border-white/10 rounded-[14px] p-6 hover:translate-y-[-4px] hover:border-white/20 transition-all group flex flex-col h-full"
            >
              {/* Header: Avatar + Info */}
              <div className="flex items-start gap-[12px] mb-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
                  style={{ backgroundColor: colors.bg, color: colors.text }}
                >
                  {initials}
                </div>
                <div className="flex flex-col">
                  <h4 className="font-bold text-[15px] text-white leading-tight">{mentor.name}</h4>
                  <p className="text-zinc-400 text-[13px] mt-1">{mentor.role} at {mentor.company}</p>
                </div>
              </div>

              <div className="w-full h-px bg-white/5 mb-4" />

              {/* Content */}
              <div className="flex flex-col flex-grow">
                <div className="text-[13px] text-zinc-300 leading-snug">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-[0.08em] mr-1.5">
                    Started as
                  </span>
                  {mentor.origin}
                </div>
                
                <div className="inline-flex mt-2 items-center gap-1.5 px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-zinc-400 font-bold w-fit">
                  <Clock size={12} />
                  {mentor.journeyYears} YEARS
                </div>

                <div className="w-full h-px bg-white/5 my-4" />
                
                <p className="text-[12px] text-white/50 italic leading-relaxed">
                  "{mentor.quote}"
                </p>
              </div>

              {/* Socials */}
              <div className="flex gap-[12px] mt-[12px] pt-4 border-t border-white/5">
                <a 
                  href={`https://linkedin.com/search/results/people/?keywords=${mentor.linkedinQuery || mentor.name}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/35 hover:text-white transition-colors"
                >
                  <Linkedin size={18} />
                </a>
                {mentor.twitterHandle && (
                  <a 
                    href={`https://twitter.com/search?q=${mentor.name}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/35 hover:text-white transition-colors"
                  >
                    <Twitter size={18} />
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
