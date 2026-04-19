"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView as useFramerInView } from "framer-motion";
import { Book, Play, Youtube, Users, ExternalLink, GraduationCap } from "lucide-react";

interface Resource {
  name: string;
  provider?: string;
  author?: string;
  channel?: string;
  platform?: string;
  price: string;
  duration?: string;
  level: string;
  members?: string;
  bestFor: string;
  url: string;
}

interface ResourceData {
  courses: Resource[];
  books: Resource[];
  youtube: Resource[];
  communities: Resource[];
}

const RESOURCE_FALLBACKS: Record<string, ResourceData> = {
  "software/engineer": {
    courses: [
      { name: "CS50: Intro to CS", provider: "Harvard (edX)", price: "Free", duration: "12 weeks", level: "Beginner", bestFor: "Absolute foundations", url: "https://cs50.harvard.edu" },
      { name: "The Odin Project", provider: "Open Source", price: "Free", duration: "Self-paced", level: "Beginner", bestFor: "Full-stack web dev", url: "https://theodinproject.com" },
      { name: "DSA Masterclass", provider: "Abdul Bari", price: "₹499", duration: "40 hours", level: "Intermediate", bestFor: "Algorithms & Logic", url: "https://udemy.com" }
    ],
    books: [
      { name: "Clean Code", author: "Robert C. Martin", price: "₹499", level: "Intermediate", bestFor: "Writing clean code", url: "https://amazon.in" },
      { name: "The Pragmatic Programmer", author: "Hunt & Thomas", price: "₹699", level: "Advanced", bestFor: "Engineer mindset", url: "https://amazon.in" }
    ],
    youtube: [
      { name: "Web Dev Tutorials", channel: "Traversy Media", price: "Free", level: "Beginner", bestFor: "Practical coding basics", url: "https://youtube.com/@TraversyMedia" },
      { name: "Modern Systems", channel: "ByteByteGo", price: "Free", level: "Advanced", bestFor: "Scalability concepts", url: "https://youtube.com/@ByteByteGo" }
    ],
    communities: [
      { name: "r/cscareerquestions", platform: "Reddit", price: "Free", members: "800k", level: "All levels", bestFor: "Interview prep", url: "https://reddit.com/r/cscareerquestions" },
      { name: "Dev.to", platform: "Web", price: "Free", members: "1M+", level: "All levels", bestFor: "Articles & networking", url: "https://dev.to" }
    ]
  }
};

const DEFAULT_RESOURCES: ResourceData = {
  courses: [{ name: "Skillshare for You", provider: "Skillshare", price: "Paid", duration: "2 weeks", level: "Beginner", bestFor: "General intro", url: "https://skillshare.com" }],
  books: [{ name: "Atomic Habits", author: "James Clear", price: "₹399", level: "All levels", bestFor: "Personal growth", url: "https://amazon.in" }],
  youtube: [{ name: "TED Talks", channel: "TED", price: "Free", level: "All levels", bestFor: "Inspiration", url: "https://youtube.com" }],
  communities: [{ name: "LinkedIn Groups", platform: "LinkedIn", price: "Free", members: "Varies", level: "All levels", bestFor: "Networking", url: "https://linkedin.com" }]
};

function getResourceFallback(dream: string, type: "courses" | "books" | "youtube" | "communities") {
  const d = dream.toLowerCase();
  
  if (type === "courses") {
    if (d.includes("data") || d.includes("analyst")) return [
      { name: "Google Data Analytics Certificate", provider: "Coursera", price: "Free (audit)", duration: "6 months", level: "Beginner", bestFor: "Industry-recognized data analytics certification", url: "https://coursera.org/professional-certificates/google-data-analytics" },
      { name: "SQL for Data Science", provider: "Coursera", price: "Free (audit)", duration: "4 weeks", level: "Beginner", bestFor: "Database querying fundamentals", url: "https://coursera.org/learn/sql-for-data-science" },
      { name: "Python for Everybody", provider: "University of Michigan", price: "Free (audit)", duration: "8 months", level: "Beginner", bestFor: "Python programming from scratch", url: "https://coursera.org/specializations/python" },
    ];
    if (d.includes("software") || d.includes("developer") || d.includes("engineer")) return [
      { name: "The Odin Project", provider: "Free", price: "Free", duration: "Self-paced", level: "Beginner", bestFor: "Full-stack web development", url: "https://theodinproject.com" },
      { name: "CS50", provider: "Harvard edX", price: "Free", duration: "12 weeks", level: "Beginner", bestFor: "Computer science foundations", url: "https://cs50.harvard.edu" },
      { name: "DSA Masterclass", provider: "Udemy", price: "₹499", duration: "40 hours", level: "Intermediate", bestFor: "Cracking FAANG interviews", url: "https://udemy.com/course/datastructurescncpp" },
    ];
    return [
      { name: "Learning How to Learn", provider: "Coursera", price: "Free", duration: "4 weeks", level: "Beginner", bestFor: "Study techniques for any career", url: "https://coursera.org/learn/learning-how-to-learn" },
      { name: "Career Development Specialization", provider: "Coursera", price: "Free (audit)", duration: "3 months", level: "Beginner", bestFor: "Professional skills and career planning", url: "https://coursera.org" },
    ];
  }

  if (type === "youtube") {
    if (d.includes("data") || d.includes("analyst")) return [
      { name: "Alex The Analyst", channel: "Alex Freberg", price: "Free", duration: "Ongoing", level: "Beginner", bestFor: "Data analyst roadmap and tutorials", url: "https://youtube.com/@AlexTheAnalyst" },
      { name: "Ken Jee", channel: "Ken Jee", price: "Free", duration: "Ongoing", level: "All levels", bestFor: "Data science career advice", url: "https://youtube.com/@KenJee_ds" },
      { name: "Luke Barousse", channel: "Luke Barousse", price: "Free", duration: "Ongoing", level: "Beginner", bestFor: "SQL and data analytics projects", url: "https://youtube.com/@LukeBarousse" },
    ];
    if (d.includes("software") || d.includes("developer")) return [
      { name: "Traversy Media", channel: "Brad Traversy", price: "Free", duration: "Ongoing", level: "Beginner", bestFor: "Web development tutorials", url: "https://youtube.com/@TraversyMedia" },
      { name: "Fireship", channel: "Jeff Delaney", price: "Free", duration: "Ongoing", level: "All levels", bestFor: "Quick modern tech concepts", url: "https://youtube.com/@Fireship" },
      { name: "Abdul Bari", channel: "Abdul Bari", price: "Free", duration: "Ongoing", level: "Intermediate", bestFor: "DSA deep dives", url: "https://youtube.com/@abdul_bari" },
    ];
    return [
      { name: "TED Talks — Career", channel: "TED", price: "Free", duration: "Ongoing", level: "All levels", bestFor: "Career inspiration and insights", url: "https://youtube.com/@TED" },
      { name: "Ankur Warikoo", channel: "Ankur Warikoo", price: "Free", duration: "Ongoing", level: "All levels", bestFor: "Career and life advice for Indians", url: "https://youtube.com/@warikoo" },
    ];
  }

  if (type === "books") {
    return [
      { name: "Atomic Habits", author: "James Clear", price: "₹399", level: "All levels", bestFor: "Building consistent learning habits", url: "https://amazon.in/s?k=atomic+habits" },
      { name: "Deep Work", author: "Cal Newport", price: "₹449", level: "All levels", bestFor: "Focused skill-building strategies", url: "https://amazon.in/s?k=deep+work+cal+newport" },
      { name: "The 10X Rule", author: "Grant Cardone", price: "₹399", level: "All levels", bestFor: "Mindset for ambitious career goals", url: "https://amazon.in/s?k=10x+rule" },
    ];
  }

  if (type === "communities") {
    return [
      { name: "Reddit r/careerguidance", platform: "Reddit", price: "Free", members: "1.2M+", level: "All levels", bestFor: "Career advice and experiences", url: "https://reddit.com/r/careerguidance" },
      { name: "LinkedIn Groups", platform: "LinkedIn", price: "Free", members: "Millions", level: "All levels", bestFor: "Professional networking in your field", url: "https://linkedin.com/groups" },
      { name: "Discord — Indian Students", platform: "Discord", price: "Free", members: "50k+", level: "All levels", bestFor: "Connect with Indian students and professionals", url: "https://discord.com" },
    ];
  }

  return [];
}

export default function TopResources({ dream, data }: { dream: string, data?: ResourceData }) {
  const [activeTab, setActiveTab] = useState<keyof ResourceData>("courses");
  const containerRef = useRef(null);
  const isInView = useFramerInView(containerRef, { once: true });

  const getResourceData = () => {
    if (data) return data;
    for (const [key, value] of Object.entries(RESOURCE_FALLBACKS)) {
      if (new RegExp(key, "i").test(dream)) return value;
    }
    return DEFAULT_RESOURCES;
  };

  const allResources = getResourceData();
  const rawResources = (allResources[activeTab]?.length > 0 
    ? allResources[activeTab] 
    : getResourceFallback(dream, activeTab)) as Resource[];

  const validResources = rawResources.filter(r => r.name && r.name.trim() !== "");

  const tabs: { id: keyof ResourceData, label: string, icon: any }[] = [
    { id: "courses", label: "Courses", icon: GraduationCap },
    { id: "books", label: "Books", icon: Book },
    { id: "youtube", label: "YouTube", icon: Youtube },
    { id: "communities", label: "Communities", icon: Users }
  ];

  const getIcon = (tab: keyof ResourceData) => {
    switch(tab) {
      case "courses": return Play;
      case "books": return Book;
      case "youtube": return Youtube;
      case "communities": return Users;
      default: return Play;
    }
  };

  const IconComp = getIcon(activeTab);

  const getSearchUrl = (name: string, type: string) => {
    const encoded = encodeURIComponent(name);
    switch(type) {
      case "courses": return `https://google.com/search?q=${encoded}+course`;
      case "books": return `https://amazon.in/s?k=${encoded}`;
      case "youtube": return `https://youtube.com/results?search_query=${encoded}`;
      case "communities": return `https://google.com/search?q=${encoded}+community`;
      default: return `https://google.com/search?q=${encoded}`;
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="border-b border-white/10 pb-4 mb-8">
        <h3 className="text-2xl font-bold flex items-center gap-3">
          <GraduationCap size={24} className="text-[#2dd4bf]" />
          Your Learning Stack
        </h3>
        <p className="text-zinc-500 text-sm mt-1">Handpicked resources for this exact path</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold transition-all ${
              activeTab === tab.id 
                ? "bg-[#7c6af7] text-white shadow-[0_0_15px_rgba(124,106,247,0.3)]" 
                : "bg-white/5 text-zinc-500 hover:bg-white/10 border border-white/10"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.98 }}
           transition={{ duration: 0.25 }}
           className={validResources.length === 0 ? "block" : "grid grid-cols-1 md:grid-cols-2 gap-4"}
        >
          {validResources.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-10 py-20 bg-white/5 border border-dashed border-white/10 rounded-2xl w-full">
               <Book size={24} className="text-zinc-600 mb-4" />
               <p className="text-zinc-500 text-sm italic font-medium">Resources loading... try regenerating</p>
            </div>
          ) : (
            validResources.map((res, i) => {
              const resUrl = res.url || getSearchUrl(res.name, activeTab);
              const label = activeTab === "courses" ? "OPEN COURSE" 
                          : activeTab === "books" ? "OPEN BOOK" 
                          : activeTab === "youtube" ? "OPEN YOUTUBE" 
                          : "OPEN COMMUNITY";

              return (
                <motion.div
                  key={i}
                  className={`bg-white/5 border border-white/10 rounded-xl p-5 hover:translate-y-[-2px] hover:border-white/20 transition-all group relative flex flex-col justify-between ${validResources.length === 1 ? 'md:col-span-2' : ''}`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                           <IconComp size={16} className="text-[#2dd4bf]" />
                        </div>
                        <span className="font-bold text-[14px] text-white leading-tight truncate">{res.name}</span>
                      </div>
                      <a href={resUrl} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/5 rounded text-[#7c6af7] shrink-0">
                        <ExternalLink size={14} />
                      </a>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                       <div className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${(res.price || 'Free') === 'Free' ? 'bg-[#2dd4bf]/20 text-[#2dd4bf]' : 'bg-white/5 text-zinc-500'}`}>
                         {res.price || 'Free'}
                       </div>
                       {(res.duration || activeTab === 'courses') && <div className="px-2 py-0.5 bg-white/5 text-zinc-500 rounded text-[10px] uppercase font-black">{res.duration || 'Self-paced'}</div>}
                       {res.members && <div className="px-2 py-0.5 bg-white/5 text-zinc-500 rounded text-[10px] uppercase font-black">{res.members} MEMBERS</div>}
                       <div className="px-2 py-0.5 bg-white/5 text-[#7c6af7] rounded text-[10px] uppercase font-black">{res.level || 'All levels'}</div>
                    </div>

                    <p className="text-[12px] text-zinc-500 font-medium">
                       <span className="text-zinc-600 font-bold">Best for:</span> {res.bestFor || 'Great resource for this career path'}
                    </p>
                  </div>

                  <div className="flex justify-end mt-4">
                    <a 
                      href={resUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-[4px] text-[12px] font-semibold uppercase text-[#7c6af7] hover:text-[#a594ff] transition-colors whitespace-nowrap min-width-[fit-content]"
                    >
                      {label} <ExternalLink size={14} />
                    </a>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
