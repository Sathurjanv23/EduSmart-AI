"use client";

import { motion } from "framer-motion";
import { 
  PieChart, 
  BarChart as BarChartIcon, 
  TrendingUp, 
  Download, 
  FileText, 
  Filter, 
  Calendar,
  Users,
  DollarSign,
  GraduationCap
} from 'lucide-react';
import { 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend
} from 'recharts';

const userDistData = [
  { name: 'Students', value: 1248, color: '#f43f5e' },
  { name: 'Teachers', value: 85, color: '#3b82f6' },
  { name: 'Staff', value: 42, color: '#10b981' },
];

const performanceData = [
  { grade: 'Grade 10', pass: 98, fail: 2 },
  { grade: 'Grade 11', pass: 94, fail: 6 },
  { grade: 'Grade 12', pass: 96, fail: 4 },
];

export default function GlobalReports() {
  return (
    <div className="p-6 lg:p-10 max-w-[1500px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <PieChart className="w-8 h-8 text-rose-600" />
            Reports & Analytics
          </h1>
          <p className="text-slate-500 font-medium mt-1">Global performance summary and data export center.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-6 py-3 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <Calendar className="w-5 h-5" /> This Academic Year
          </button>
          <button className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-rose-500/20 flex items-center gap-2">
            <Download className="w-5 h-5" /> Generate PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* User Distribution */}
        <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">User Demographics</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={userDistData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {userDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Academic Success Rate */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Academic Success Rate</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="pass" fill="#10b981" radius={[10, 10, 0, 0]} />
                <Bar dataKey="fail" fill="#f43f5e" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Report Access */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Financial Audit', icon: DollarSign, color: 'emerald' },
            { label: 'Staff Attendance', icon: Users, color: 'blue' },
            { label: 'Student Growth', icon: GraduationCap, color: 'rose' },
            { label: 'Infrastructure', icon: FileText, color: 'amber' },
          ].map((report, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-2xl bg-${report.color}-100 dark:bg-${report.color}-900/20 text-${report.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <report.icon className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2">{report.label} Report</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last updated 2 days ago</p>
            </motion.div>
          ))}
        </div>

      </div>

    </div>
  );
}
