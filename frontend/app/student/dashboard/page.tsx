"use client";

import { motion } from "framer-motion";
import { 
  GraduationCap, 
  Calendar, 
  Clock, 
  TrendingUp, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Search,
  Bell
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const gradeData = [
  { month: 'Sep', gpa: 3.2 },
  { month: 'Oct', gpa: 3.5 },
  { month: 'Nov', gpa: 3.4 },
  { month: 'Dec', gpa: 3.8 },
  { month: 'Jan', gpa: 3.7 },
  { month: 'Feb', gpa: 3.9 },
];

const attendanceData = [
  { name: 'Present', value: 85, color: '#10b981' },
  { name: 'Absent', value: 15, color: '#f43f5e' },
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

export default function StudentDashboard() {
  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      
      {/* Header / Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2.5rem] p-8 mb-8 text-white shadow-2xl shadow-emerald-500/20"
      >
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">Vanakkam, Sathurjan! 👋</h1>
          <p className="text-emerald-50/80 font-medium max-w-xl">
            You're doing great! Your performance is up by <span className="text-white font-bold">12%</span> this month. Keep up the momentum for the upcoming final exams.
          </p>
          
          <div className="flex flex-wrap gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl flex items-center gap-3 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-emerald-200">Current GPA</p>
                <p className="text-xl font-black tracking-tight">3.85 / 4.0</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl flex items-center gap-3 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-emerald-200">Attendance</p>
                <p className="text-xl font-black tracking-tight">92.4%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        
        {/* Main Performance Chart (Left 2 columns) */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
          
          <div className="bg-white dark:bg-slate-900/50 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Academic Performance</h2>
                <p className="text-sm text-slate-500 font-medium">Monthly GPA growth overview</p>
              </div>
              <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 outline-none">
                <option>Current Year</option>
                <option>Last Year</option>
              </select>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gradeData}>
                  <defs>
                    <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis hide domain={[0, 4]} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#fff'}}
                    itemStyle={{color: '#10b981', fontWeight: 'bold'}}
                  />
                  <Area type="monotone" dataKey="gpa" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorGpa)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Attendance Card */}
            <div className="bg-white dark:bg-slate-900/50 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Attendance Overview</h2>
              <div className="flex items-center gap-4">
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attendanceData}
                        innerRadius={35}
                        outerRadius={50}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {attendanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Present: 85%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Absent: 15%</span>
                  </div>
                  <button className="mt-4 text-xs font-bold text-emerald-600 hover:underline">View History</button>
                </div>
              </div>
            </div>

            {/* Upcoming Task */}
            <div className="bg-white dark:bg-slate-900/50 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Chemistry Quiz</h3>
                <p className="text-sm text-slate-500 font-medium">Tomorrow at 10:00 AM</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 text-[10px] font-black uppercase tracking-wider">Priority</span>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100 dark:bg-amber-900/10 rounded-full -mr-12 -mt-12 blur-xl"></div>
            </div>
          </div>
        </motion.div>

        {/* Sidebar Sections (Right column) */}
        <motion.div variants={itemVariants} className="space-y-8">
          
          {/* Schedule Section */}
          <div className="bg-white dark:bg-slate-900/50 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Daily Schedule</h2>
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>
            
            <div className="space-y-6">
              {[
                { time: '09:00 AM', subject: 'Advanced Mathematics', room: 'Room 302', active: true },
                { time: '11:15 AM', subject: 'Computer Science', room: 'Lab 01', active: false },
                { time: '01:30 PM', subject: 'Physics Practical', room: 'Room 105', active: false },
                { time: '03:00 PM', subject: 'English Literature', room: 'Library', active: false },
              ].map((item, idx) => (
                <div key={idx} className={`flex gap-4 relative ${item.active ? 'opacity-100' : 'opacity-60'}`}>
                  {idx !== 3 && <div className="absolute left-3 top-10 bottom-0 w-px bg-slate-200 dark:bg-slate-800"></div>}
                  <div className={`w-6 h-6 rounded-full border-4 ${item.active ? 'bg-emerald-500 border-emerald-100 dark:border-emerald-900' : 'bg-slate-200 dark:bg-slate-800 border-slate-50 dark:border-slate-950'} z-10`}></div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mb-1">{item.time}</p>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.subject}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.room}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-8 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 transition-all flex items-center justify-center gap-2">
              Full Timetable <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Announcements */}
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <h2 className="text-xl font-bold mb-6 relative z-10">Campus Feed</h2>
            <div className="space-y-4 relative z-10">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Announcement</p>
                <h4 className="text-sm font-bold mb-1">Annual Sports Meet 2026</h4>
                <p className="text-xs text-white/60">Registrations are now open for all events.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2">Holiday</p>
                <h4 className="text-sm font-bold mb-1">Tamil New Year</h4>
                <p className="text-xs text-white/60">School will remain closed on April 14th.</p>
              </div>
            </div>
            
            {/* Interactive Background Gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700"></div>
          </div>

        </motion.div>
      </motion.div>

    </div>
  );
}
