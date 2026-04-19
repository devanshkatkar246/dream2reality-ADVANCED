"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const steps = [
  { id: 1, name: "Dream" },
  { id: 2, name: "Explore" },
  { id: 3, name: "Simulate" },
  { id: 4, name: "Reality" }
];

export default function ProgressIndicator({ 
  currentStep, 
  visitedSteps, 
  onStepClick 
}: { 
  currentStep: number, 
  visitedSteps: Set<number>,
  onStepClick: (step: number) => void
}) {
  return (
    <div className="flex items-center justify-between max-w-2xl mx-auto px-4 mb-20 relative">
      {steps.map((step, idx) => {
        const isCompleted = visitedSteps.has(step.id) && currentStep !== step.id;
        const isActive = currentStep === step.id;
        const isLocked = !visitedSteps.has(step.id) && !isActive;

        return (
          <div key={step.id} className="flex flex-col items-center flex-1 last:flex-none relative h-12">
            <div className="relative group">
              {isActive && (
                <motion.div
                  initial={{ scale: 1, opacity: 0.4 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full bg-[#7c6af7] z-0"
                />
              )}
              
              <button 
                disabled={isLocked && !isCompleted && !isActive}
                onClick={() => (isCompleted || visitedSteps.has(step.id)) && onStepClick(step.id)}
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 relative ${
                  isActive 
                    ? "bg-black border-white text-white shadow-[0_0_24px_rgba(124,106,247,0.4),0_0_0_4px_rgba(124,106,247,0.15)] scale-110" 
                    : isCompleted 
                      ? "bg-[#2dd4bf] border-[#2dd4bf] text-white cursor-pointer hover:scale-105" 
                      : "bg-black border-zinc-800 text-zinc-600"
                }`}
              >
                {isCompleted ? (
                  <Check size={24} strokeWidth={3} />
                ) : (
                  <span className="font-bold text-lg">{step.id}</span>
                )}
              </button>
            </div>
            
            <span className={`absolute -bottom-10 whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
              isActive ? "text-white scale-110" : isCompleted ? "text-[#2dd4bf]" : "text-zinc-600"
            }`}>
              {step.name}
            </span>

            {/* Connectors */}
            {idx < steps.length - 1 && (
              <div className="absolute top-6 left-1/2 w-full h-[2px] bg-zinc-800/30 -z-0">
                 <motion.div 
                   initial={false}
                   animate={{ width: visitedSteps.has(steps[idx + 1].id) || currentStep > step.id ? "100%" : "0%" }}
                   className="h-full bg-gradient-to-r from-[#7c6af7] to-[#2dd4bf]"
                   transition={{ duration: 0.8, ease: "circOut" }}
                 />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
