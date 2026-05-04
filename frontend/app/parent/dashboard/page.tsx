"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  CreditCard, 
  BookOpen, 
  MessageSquare, 
  Bell, 
  FileText, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

const childrenPerformance = [
  { month: 'Sep', rahul: 78, priya: 85 },
  { month: 'Oct', rahul: 82, priya: 88 },
  { month: 'Nov', rahul: 80, priya: 92 },
  { month: 'Dec', rahul: 85, priya: 90 },
  { month: 'Jan', rahul: 88, priya: 94 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function ParentDashboard() {
  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      
      {/* Top Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 bg-white dark:bg-slate-900/50 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[1.5rem] bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Parent Portal</h1>
            <p className="text-slate-500 font-medium">Monitoring the progress of <b>Rahul</b> and <b>Priya</b></p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Next PTM</p>
            <p className="text-sm font-black text-slate-900 dark:text-white">April 20, 2026</p>
          </div>
          <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-2xl shadow-xl shadow-purple-500/20 transition-all">
            <Bell className="w-6 h-6" />
          </button>
        </div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        
        {/* Progress Tracking (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Academic Comparison</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                  <span className="text-xs font-bold text-slate-500">Priya (Grade 12)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs font-bold text-slate-500">Rahul (Grade 10)</span>
                </div>
              </div>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={childrenPerformance}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#fff'}}
                  />
                  <Line type="monotone" dataKey="priya" stroke="#9333ea" strokeWidth={4} dot={{ r: 6, fill: '#9333ea' }} />
                  <Line type="monotone" dataKey="rahul" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Children Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { name: 'Priya Raj', class: 'Grade 12-A', attendance: '98%', performance: 'Exceeding', color: 'purple' },
              { name: 'Rahul Raj', class: 'Grade 10-C', attendance: '92%', performance: 'Average', color: 'blue' },
            ].map((child, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-purple-300 dark:hover:border-purple-900/50 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-${child.color}-100 dark:bg-${child.color}-900/30 flex items-center justify-center text-${child.color}-600 font-black text-xl`}>
                    {child.name[0]}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${child.performance === 'Exceeding' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {child.performance}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{child.name}</h3>
                <p className="text-sm font-bold text-slate-400 mb-6">{child.class}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Attendance</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{child.attendance}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Rank</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">#04</p>
                  </div>
                </div>
                
                <button className="w-full mt-6 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-all flex items-center justify-center gap-2">
                  Detailed Report <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          
          {/* Fee Status Card */}
          <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-rose-500/20 relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                <CreditCard className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold mb-2">Fees Pending</h2>
              <p className="text-rose-100 text-sm mb-6">Annual term fee for Rahul Raj is due by <b>April 15th</b>.</p>
              
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl font-black">₹4,200</span>
                <span className="text-rose-200 text-xs font-bold">Total Due</span>
              </div>
              
              <button className="w-full py-4 bg-white text-rose-600 rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                Pay Now
              </button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          </div>

          {/* Teacher Contact */}
          <div className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Contact Class Teacher</h2>
            <div className="space-y-4">
              {[
                { name: 'Dr. Subramanian', role: 'Grade 12-A Teacher', img: 'S' },
                { name: 'Ms. Kavitha', role: 'Grade 10-C Teacher', img: 'K' },
              ].map((teacher, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center font-bold">
                      {teacher.img}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{teacher.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{teacher.role}</p>
                    </div>
                  </div>
                  <MessageSquare className="w-5 h-5 text-slate-300 group-hover:text-purple-600 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Security & Health */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
            <div className="relative z-10 flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold">Campus Security</h2>
            </div>
            <p className="text-xs text-white/60 relative z-10 mb-4">Last checked-in: Priya (08:42 AM), Rahul (08:45 AM). Both safely reached campus.</p>
            <div className="h-1 w-full bg-white/5 rounded-full relative z-10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              ></motion.div>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700"></div>
          </div>

        </div>
      </motion.div>

    </div>
  );
}
