"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BrainCircuit, 
  Sparkles, 
  Plus, 
  Settings2, 
  FileDown, 
  Copy, 
  CheckCircle2, 
  Layout, 
  Layers, 
  Wand2,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

export default function QuestionGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState(1);

  const startGeneration = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setStep(2);
    }, 3000);
  };

  return (
    <div className="p-6 lg:p-10 max-w-[1200px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-rose-600" />
            AI Question Generator
          </h1>
          <p className="text-slate-500 font-medium mt-1">Generate high-quality exam papers and quizzes in seconds using AI.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
            <History className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left: Configuration */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-rose-600" />
              Parameters
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Subject</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none">
                  <option>Advanced Mathematics</option>
                  <option>Physics Theory</option>
                  <option>Computer Science</option>
                  <option>World History</option>
                </select>
              </div>
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Easy', 'Medium', 'Hard'].map(level => (
                    <button key={level} className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${level === 'Medium' ? 'bg-rose-600 border-rose-600 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-500'}`}>
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Topic Focus</label>
                <input type="text" placeholder="e.g. Calculus, Trigonometry" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-1 focus:ring-rose-500" />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Question Count</label>
                <input type="range" className="w-full accent-rose-600" />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
                  <span>5</span>
                  <span>50</span>
                </div>
              </div>
            </div>

            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={startGeneration}
              disabled={isGenerating}
              className="w-full mt-10 bg-rose-600 hover:bg-rose-500 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-rose-500/30 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" /> Generate Questions
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Right: Results / Preview */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[500px] rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800/50 flex flex-col items-center justify-center text-center p-10 bg-slate-50/30 dark:bg-slate-800/10"
              >
                <div className="w-20 h-20 rounded-[2.5rem] bg-rose-100 dark:bg-rose-900/20 text-rose-600 flex items-center justify-center mb-6">
                  <Sparkles className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Ready to Create?</h3>
                <p className="text-slate-500 max-w-sm mb-8 font-medium">Configure the parameters on the left and our AI will curate the perfect exam paper for you.</p>
                <div className="flex gap-4">
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm"><Layers className="w-3 h-3" /> Multi-Topic</span>
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm"><Layout className="w-3 h-3" /> PDF Export</span>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h2 className="text-xl font-bold">Generated Questions</h2>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-rose-600 transition-all"><Copy className="w-5 h-5" /></button>
                      <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2 shadow-xl active:scale-95 transition-all"><FileDown className="w-4 h-4" /> Export PDF</button>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {[
                      { q: "Explain the fundamental principles of Quantum Superposition in 500 words.", marks: 10, type: 'Descriptive' },
                      { q: "What is the Schrodinger's Cat experiment primarily intended to illustrate?", marks: 5, type: 'Conceptual' },
                      { q: "Calculate the probability density for a particle in a 1D box at n=3.", marks: 15, type: 'Numerical' },
                    ].map((item, idx) => (
                      <div key={idx} className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 relative group">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full uppercase tracking-widest">{item.type}</span>
                          <span className="text-xs font-black text-slate-400">{item.marks} Marks</span>
                        </div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed pr-8">{item.q}</p>
                        <button className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-slate-200 rounded-lg">
                          <HelpCircle className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}

// Helper icons that were missing
const History = ({ className }: { className?: string }) => <svg className={className} fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>;
