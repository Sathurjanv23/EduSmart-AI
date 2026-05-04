"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Megaphone, 
  Search, 
  Plus, 
  Calendar, 
  Clock, 
  Tag, 
  ChevronRight, 
  Info, 
  AlertTriangle, 
  CheckCircle2,
  Pin
} from 'lucide-react';

const MOCK_ANNOUNCEMENTS = [
  { 
    id: 1, 
    title: "Annual Sports Meet 2026", 
    desc: "The much awaited annual sports meet will be held on June 10th at the city stadium. All students are requested to register for their respective events.",
    date: "May 15, 2026",
    category: "Sports",
    type: "info",
    pinned: true
  },
  { 
    id: 2, 
    title: "Term 1 Examination Schedule", 
    desc: "The final timetable for Term 1 exams has been published. Please check the timetable section for detailed subject-wise dates.",
    date: "May 12, 2026",
    category: "Academic",
    type: "warning",
    pinned: false
  },
  { 
    id: 3, 
    title: "New Library Addition", 
    desc: "We have added over 500 new books to the digital and physical library including latest research journals and fiction.",
    date: "May 10, 2026",
    category: "Library",
    type: "success",
    pinned: false
  }
];

export default function AnnouncementsHub() {
  const [activeTab, setActiveTab] = useState("All");
  const categories = ["All", "Academic", "Sports", "Events", "Library"];

  return (
    <div className="p-6 lg:p-10 max-w-[1400px] mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[2rem] bg-rose-600 text-white flex items-center justify-center shadow-2xl shadow-rose-500/30">
            <Megaphone className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Announcements Hub</h1>
            <p className="text-slate-500 font-medium mt-1">Stay updated with the latest news and alerts from the campus.</p>
          </div>
        </div>
        
        <button className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all">
          <Plus className="w-5 h-5" /> New Bulletin
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-10">
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-[1.5rem] border border-slate-200 dark:border-slate-800">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === cat ? 'bg-white dark:bg-slate-800 text-rose-600 shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search bulletins..." 
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 transition-all font-medium text-sm"
          />
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {MOCK_ANNOUNCEMENTS
            .filter(a => activeTab === "All" || a.category === activeTab)
            .map((ann, idx) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={ann.id}
              className="bg-white dark:bg-slate-900/50 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-rose-300 dark:hover:border-rose-900/50 transition-all group relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  ann.type === 'warning' ? 'bg-amber-100 text-amber-600' : 
                  ann.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {ann.type === 'warning' ? <AlertTriangle className="w-6 h-6" /> : 
                   ann.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <Info className="w-6 h-6" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {ann.pinned && (
                      <div className="flex items-center gap-1 text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-full">
                        <Pin className="w-3 h-3" /> Pinned
                      </div>
                    )}
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Tag className="w-3 h-3" /> {ann.category}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-rose-600 transition-colors">
                    {ann.title}
                  </h2>
                  <p className="text-slate-500 font-medium leading-relaxed mb-6">
                    {ann.desc}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Calendar className="w-4 h-4" /> {ann.date}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Clock className="w-4 h-4" /> 10:30 AM
                    </div>
                  </div>
                </div>
                
                <button className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
              
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-all duration-700"></div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
