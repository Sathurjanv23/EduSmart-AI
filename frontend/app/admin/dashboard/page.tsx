"use client";

import { motion } from "framer-motion";
import { 
  Shield, 
  Users, 
  UserCheck, 
  DollarSign, 
  Database, 
  Cpu, 
  Activity, 
  Settings, 
  AlertTriangle,
  ChevronRight,
  Search,
  Plus
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const revenueData = [
  { month: 'Jan', amount: 45000 },
  { month: 'Feb', amount: 52000 },
  { month: 'Mar', amount: 48000 },
  { month: 'Apr', amount: 61000 },
  { month: 'May', amount: 55000 },
  { month: 'Jun', amount: 67000 },
];

const userDistData = [
  { name: 'Students', value: 1200, color: '#f43f5e' },
  { name: 'Teachers', value: 85, color: '#3b82f6' },
  { name: 'Parents', value: 950, color: '#8b5cf6' },
  { name: 'Staff', value: 42, color: '#10b981' },
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

export default function AdminDashboard() {
  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      
      {/* Top Navigation / Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Admin Console</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Central Management System</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search global records..." 
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-rose-500 transition-all outline-none text-sm font-medium"
            />
          </div>
          <button className="bg-rose-600 hover:bg-rose-700 text-white p-3 rounded-2xl shadow-xl shadow-rose-500/20 transition-all">
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Active Users', value: '2,277', icon: Users, color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30', trend: '+14%' },
          { label: 'Attendance Rate', value: '94.2%', icon: UserCheck, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', trend: '+2%' },
          { label: 'Monthly Revenue', value: '₹6.2L', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', trend: '+8%' },
          { label: 'System Health', value: 'Optimal', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30', trend: '100%' },
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="bg-white dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">{stat.trend}</span>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        
        {/* Revenue Analytics (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Financial Growth</h2>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button className="px-4 py-1.5 text-[10px] font-black uppercase rounded-lg bg-white dark:bg-slate-700 shadow-sm">Revenue</button>
                <button className="px-4 py-1.5 text-[10px] font-black uppercase text-slate-400">Expenses</button>
              </div>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis hide />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Area type="monotone" dataKey="amount" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* User Distribution */}
            <div className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">User Base</h2>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={userDistData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                      {userDistData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {userDistData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                    <span className="text-[10px] font-bold text-slate-500">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Infrastructure Health */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
              <h2 className="text-lg font-bold mb-6">Server Status</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-1.5">
                    <span className="text-slate-400">CPU Usage</span>
                    <span className="text-rose-500">24%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '24%' }} className="h-full bg-rose-500"></motion.div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-1.5">
                    <span className="text-slate-400">Database Load</span>
                    <span className="text-blue-500">42%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '42%' }} className="h-full bg-blue-500"></motion.div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-1.5">
                    <span className="text-slate-400">API Response</span>
                    <span className="text-emerald-500">92ms</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '15%' }} className="h-full bg-emerald-500"></motion.div>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/20 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700"></div>
            </div>
          </div>
        </div>

        {/* Audit Logs / Activity */}
        <div className="space-y-8">
          
          <div className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm h-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Audit Logs</h2>
              <button className="text-[10px] font-black text-rose-600 uppercase">View All</button>
            </div>
            
            <div className="space-y-6">
              {[
                { type: 'Update', user: 'Admin_Super', action: 'Modified Tuition Fee Structure', time: '5m ago', color: 'rose' },
                { type: 'Auth', user: 'Sathurjan', action: 'New Student account verified', time: '12m ago', color: 'blue' },
                { type: 'Alert', user: 'System', action: 'Database backup completed', time: '1h ago', color: 'emerald' },
                { type: 'Security', user: 'Firewall', action: 'Blocked suspicious IP 192.168.1.1', time: '2h ago', color: 'amber' },
                { type: 'Update', user: 'Ms. Kavitha', action: 'Published Grade 10 results', time: '3h ago', color: 'rose' },
              ].map((log, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className={`w-1 h-10 rounded-full bg-${log.color}-500/20 group-hover:bg-${log.color}-500 transition-all`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className={`text-[9px] font-black uppercase text-${log.color}-600 tracking-wider`}>{log.type}</span>
                      <span className="text-[10px] font-medium text-slate-400">{log.time}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{log.action}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">By {log.user}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 p-6 rounded-2xl bg-slate-900 text-white relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h4 className="text-sm font-bold">2 Pending Approvals</h4>
              </div>
              <button className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-xs relative z-10 hover:bg-rose-500 hover:text-white transition-all">
                Review Now
              </button>
            </div>
          </div>

        </div>
      </motion.div>

    </div>
  );
}
