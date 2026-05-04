"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  BookOpen, 
  FileText, 
  CheckSquare, 
  MessageSquare, 
  BarChart3, 
  Clock, 
  Plus,
  ArrowUpRight,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const performanceData = [
  { class: 'Grade 10-A', average: 82, attendance: 95 },
  { class: 'Grade 10-B', average: 75, attendance: 88 },
  { class: 'Grade 11-A', average: 88, attendance: 92 },
  { class: 'Grade 12-C', average: 91, attendance: 98 },
];

const submissionsData = [
  { day: 'Mon', count: 45 },
  { day: 'Tue', count: 52 },
  { day: 'Wed', count: 38 },
  { day: 'Thu', count: 65 },
  { day: 'Fri', count: 48 },
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

export default function TeacherDashboard() {
  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            Dashboard
          </motion.h1>
          <p className="text-slate-500 font-medium mt-1">Manage your classes, students, and grading from one place.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-blue-500/20"
          >
            <Plus className="w-5 h-5" /> New Announcement
          </motion.button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Students', value: '184', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Classes Today', value: '4', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
          { label: 'Assignments', value: '12', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
          { label: 'Pending Grades', value: '28', icon: CheckSquare, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        
        {/* Class Performance (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Class Average Scores</h2>
                <p className="text-sm text-slate-500 font-medium">Comparison across different sections</p>
              </div>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <MoreVertical className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="class" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#fff'}}
                  />
                  <Bar dataKey="average" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-500/20">
              <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Attendance', icon: CheckSquare },
                  { label: 'Exams', icon: FileText },
                  { label: 'Lessons', icon: BookOpen },
                  { label: 'Results', icon: BarChart3 },
                ].map((action, idx) => (
                  <motion.button 
                    key={idx}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
                    className="bg-white/10 backdrop-blur-md p-4 rounded-2xl flex flex-col items-center gap-2 border border-white/10 transition-all"
                  >
                    <action.icon className="w-6 h-6" />
                    <span className="text-xs font-bold">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Submissions Trend */}
            <div className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Submission Volume</h2>
              <div className="h-[150px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={submissionsData}>
                    <Tooltip hide />
                    <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">248</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total this week</p>
                </div>
                <div className="flex items-center text-emerald-500 text-xs font-bold">
                  <ArrowUpRight className="w-4 h-4" /> +12%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          
          {/* Today's Schedule */}
          <div className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Today's Schedule</h2>
            <div className="space-y-6">
              {[
                { time: '09:00 - 10:30', class: 'Grade 10-A', subject: 'Algebra I', status: 'In Progress' },
                { time: '11:00 - 12:30', class: 'Grade 11-C', subject: 'Calculus BC', status: 'Upcoming' },
                { time: '02:00 - 03:30', class: 'Grade 12-A', subject: 'Statistics', status: 'Upcoming' },
              ].map((lecture, idx) => (
                <div key={idx} className="group cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{lecture.time}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${lecture.status === 'In Progress' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {lecture.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{lecture.subject}</h4>
                  <p className="text-xs text-slate-500 font-medium">{lecture.class}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
              View Calendar <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Recent Messages */}
          <div className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Recent Inquiries</h2>
            <div className="space-y-6">
              {[
                { name: 'Arun Kumar', msg: 'Sir, I have a doubt in chapter 4 quadratic equations.', time: '12m ago' },
                { name: 'Priya Raj', msg: 'Assignment submitted on the portal. Please verify.', time: '1h ago' },
              ].map((msg, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center font-bold text-slate-500">
                    {msg.name[0]}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{msg.name}</h4>
                      <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{msg.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{msg.msg}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </motion.div>

    </div>
  );
}
