"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  CreditCard, 
  PieChart as PieChartIcon, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Plus, 
  Filter, 
  Download,
  AlertCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const feeCollectionData = [
  { month: 'Jan', collected: 125000, target: 150000 },
  { month: 'Feb', collected: 138000, target: 150000 },
  { month: 'Mar', collected: 145000, target: 150000 },
  { month: 'Apr', collected: 110000, target: 150000 }, // Ongoing
];

export default function FeeManagement() {
  return (
    <div className="p-6 lg:p-10 max-w-[1500px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-rose-600" />
            Fee Management
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage student fee structures, dues, and transaction records.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Download className="w-5 h-5" />
          </button>
          <button className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-rose-500/20 transition-all">
            <Plus className="w-5 h-5" /> Add Fee Structure
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Collection', value: '₹42.5L', trend: '+12%', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Pending Dues', value: '₹8.4L', trend: '-5%', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'This Month', value: '₹4.2L', trend: '+18%', icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Avg Payment', value: '₹12k', trend: '+2%', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-black ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'} bg-white dark:bg-slate-800 px-2 py-1 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm`}>{stat.trend}</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Analytics (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Collection Chart */}
          <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Revenue Overview</h2>
                <p className="text-sm text-slate-500 font-medium">Monthly collection vs targets</p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <span className="text-xs font-bold text-slate-500">Collected</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                  <span className="text-xs font-bold text-slate-500">Target</span>
                </div>
              </div>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={feeCollectionData}>
                  <defs>
                    <linearGradient id="colorColl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis hide />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Area type="monotone" dataKey="target" stroke="#e2e8f0" strokeWidth={2} fill="transparent" />
                  <Area type="monotone" dataKey="collected" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorColl)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pending Dues Table */}
          <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search ID..." className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border-none text-xs focus:ring-1 focus:ring-rose-500 outline-none" />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-4 px-4">Student</th>
                    <th className="pb-4 px-4">Category</th>
                    <th className="pb-4 px-4">Amount</th>
                    <th className="pb-4 px-4">Status</th>
                    <th className="pb-4 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { name: 'Arun Kumar', id: 'STD104', type: 'Tuition Fee', amount: '₹12,500', status: 'Success' },
                    { name: 'Priya Raj', id: 'STD105', type: 'Transport', amount: '₹2,400', status: 'Success' },
                    { name: 'Rahul Dev', id: 'STD106', type: 'Exam Fee', amount: '₹1,500', status: 'Pending' },
                  ].map((row, idx) => (
                    <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">{row.name[0]}</div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{row.name}</p>
                            <p className="text-[10px] font-medium text-slate-400">{row.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-slate-600 dark:text-slate-400">{row.type}</td>
                      <td className="py-4 px-4 text-sm font-black text-slate-900 dark:text-white">{row.amount}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${row.status === 'Success' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button className="text-[10px] font-black text-rose-600 uppercase hover:underline">Receipt</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          
          {/* Fee Structure Quick List */}
          <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden group">
            <h2 className="text-xl font-bold mb-8 relative z-10">Fee Categories</h2>
            <div className="space-y-6 relative z-10">
              {[
                { name: 'Tuition Fee', amount: '₹45,000 / Yr', color: 'bg-blue-500' },
                { name: 'Transport', amount: '₹12,000 / Yr', color: 'bg-emerald-500' },
                { name: 'Hostel', amount: '₹60,000 / Yr', color: 'bg-amber-500' },
              ].map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div>
                    <h4 className="text-sm font-bold">{cat.name}</h4>
                    <p className="text-xs text-white/60">{cat.amount}</p>
                  </div>
                  <div className={`w-2 h-10 rounded-full ${cat.color}`}></div>
                </div>
              ))}
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/20 rounded-full blur-3xl group-hover:scale-125 transition-all duration-700"></div>
          </div>

          {/* Dues Distribution */}
          <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Payment Channels</h2>
            <div className="space-y-4">
              {[
                { name: 'Online (Razorpay)', share: '64%', count: '₹2.4L', color: 'emerald' },
                { name: 'Cash / Cheque', share: '28%', count: '₹1.1L', color: 'rose' },
                { name: 'Bank Transfer', share: '8%', count: '₹0.3L', color: 'blue' },
              ].map((channel, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600 dark:text-slate-400">{channel.name}</span>
                    <span className="text-slate-900 dark:text-white">{channel.share}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: channel.share }} 
                      className={`h-full bg-${channel.color}-500`}
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
