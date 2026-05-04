"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  BrainCircuit, 
  Search, 
  ChevronRight, 
  ArrowUpRight,
  Target,
  Sparkles
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

const predictionData = [
  { month: 'Sep', actual: 78, predicted: 78 },
  { month: 'Oct', actual: 82, predicted: 81 },
  { month: 'Nov', actual: 80, predicted: 83 },
  { month: 'Dec', actual: 85, predicted: 84 },
  { month: 'Jan', actual: null, predicted: 88 },
  { month: 'Feb', actual: null, predicted: 91 },
];

const skillData = [
  { subject: 'Maths', A: 120, B: 110, fullMark: 150 },
  { subject: 'Science', A: 98, B: 130, fullMark: 150 },
  { subject: 'English', A: 86, B: 130, fullMark: 150 },
  { subject: 'History', A: 99, B: 100, fullMark: 150 },
  { subject: 'Comp. Sci', A: 85, B: 90, fullMark: 150 },
];

export default function PerformancePredictor() {
  const [selectedStudent, setSelectedStudent] = useState("Arun Kumar (STD101)");

  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto">
      
      {/* AI Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white mb-10 relative overflow-hidden shadow-2xl shadow-rose-500/10"
      >
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/50">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">AI Engine Active</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">Performance <span className="text-rose-600">Predictor</span></h1>
            <p className="text-slate-400 text-lg max-w-lg mb-8 leading-relaxed">Our neural network analyzes 24+ parameters including attendance, test scores, and behavior to forecast student success.</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
                <BrainCircuit className="w-5 h-5 text-rose-500" />
                <span className="text-sm font-bold">Accuracy: 94.2%</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-bold">Updated: Just now</span>
              </div>
            </div>
          </div>
          
          {/* Main Chart Card inside Hero */}
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-500" /> Grade Trajectory</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={predictionData}>
                  <XAxis dataKey="month" hide />
                  <YAxis hide domain={[60, 100]} />
                  <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px'}} />
                  <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981' }} />
                  <Line type="monotone" dataKey="predicted" stroke="#f43f5e" strokeWidth={4} strokeDasharray="5 5" dot={{ r: 4, fill: '#f43f5e' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Actual</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500"></div> AI Predicted</div>
            </div>
          </div>
        </div>
        
        {/* Animated Background Decor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -ml-32 -mb-32"></div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Detailed Insights */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Analysis Search */}
          <div className="bg-white dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                placeholder="Search student to analyze..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-rose-500" 
              />
            </div>
            <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all">Analyze Now</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Skill Matrix */}
            <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Aptitude Matrix</h2>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                    <Radar name="Student" dataKey="A" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* High Risk Students */}
            <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
                Attention Needed
              </h2>
              <div className="space-y-4">
                {[
                  { name: 'Rahul Dev', risk: 'High', reason: 'Grade Drop (-12%)', color: 'rose' },
                  { name: 'Sonia M.', risk: 'Medium', reason: 'Low Attendance (64%)', color: 'amber' },
                  { name: 'Kevin J.', risk: 'Medium', reason: 'Assignment Delays', color: 'amber' },
                ].map((risk, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between group cursor-pointer hover:bg-rose-50 transition-all">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{risk.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{risk.reason}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase bg-${risk.color}-100 text-${risk.color}-600`}>
                      {risk.risk} Risk
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-8">
          
          {/* Key Predictions */}
          <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">AI Projections</h2>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase mb-3 text-slate-400">
                  <span>Probability of Graduation</span>
                  <span className="text-emerald-500">98%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '98%' }} className="h-full bg-emerald-500"></motion.div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase mb-3 text-slate-400">
                  <span>Expected Top Rank</span>
                  <span className="text-blue-500">#04</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-blue-500"></motion.div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase mb-3 text-slate-400">
                  <span>Subject Improvement</span>
                  <span className="text-rose-500">History</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '42%' }} className="h-full bg-rose-500"></motion.div>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-10 py-4 border-2 border-rose-600 rounded-[1.5rem] text-rose-600 font-black text-xs hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2">
              Deep-Dive Report <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Activity Log */}
          <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden group">
            <h2 className="text-xl font-bold mb-6">Engine Activity</h2>
            <div className="space-y-4">
              {[
                'Scanned 1200+ student profiles',
                'Detected anomaly in Grade 10-A',
                'Recalculated finals probability',
                'Generated risk alerts for Parents'
              ].map((log, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></div>
                  <p className="text-[11px] text-slate-400 leading-tight">{log}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
