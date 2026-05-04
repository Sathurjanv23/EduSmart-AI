"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  CreditCard, 
  Users, 
  Search, 
  Plus, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Briefcase
} from 'lucide-react';

const MOCK_PAYROLL = [
  { id: 'TCH001', name: 'Dr. Subramanian', role: 'Teacher', base: '₹85,000', bonus: '₹5,000', net: '₹90,000', status: 'Paid' },
  { id: 'TCH002', name: 'Ms. Kavitha', role: 'Teacher', base: '₹72,000', bonus: '₹0', net: '₹72,000', status: 'Paid' },
  { id: 'ADM001', name: 'Rajesh Kumar', role: 'Admin', base: '₹65,000', bonus: '₹2,500', net: '₹67,500', status: 'Pending' },
  { id: 'STF001', name: 'Kumar S.', role: 'Driver', base: '₹32,000', bonus: '₹1,200', net: '₹33,200', status: 'Processing' },
];

export default function StaffSalary() {
  return (
    <div className="p-6 lg:p-10 max-w-[1500px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-rose-600" />
            Staff Payroll
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage salaries, bonuses, and financial payouts for all employees.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-rose-500/20 flex items-center gap-2">
            <Plus className="w-5 h-5" /> Bulk Release
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
        {[
          { label: 'Total Payout', value: '₹12.4L', icon: DollarSign, color: 'text-rose-600', bg: 'bg-rose-100' },
          { label: 'Staff Count', value: '127', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Pending Payout', value: '₹1.8L', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Efficiency', value: '98.2%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className={`w-10 h-10 ${stat.bg} dark:bg-opacity-20 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Payroll Table (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white dark:bg-slate-900/50 p-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex items-center gap-6 shadow-sm">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search staff name or ID..." className="w-full pl-11 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm outline-none" />
            </div>
            <button className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-xs">Filter</button>
          </div>

          <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <th className="p-6">Employee</th>
                  <th className="p-6">Base Salary</th>
                  <th className="p-6">Net Payout</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {MOCK_PAYROLL.map((row, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-400 group-hover:text-rose-600 transition-colors">
                          {row.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{row.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.id} • {row.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-sm font-medium text-slate-600 dark:text-slate-400">{row.base}</td>
                    <td className="p-6 text-sm font-black text-slate-900 dark:text-white">{row.net}</td>
                    <td className="p-6">
                      <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        row.status === 'Paid' ? 'bg-emerald-100 text-emerald-600' : 
                        row.status === 'Processing' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button className="text-[10px] font-black text-rose-600 uppercase hover:underline">Payslip</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          
          {/* Quick Calculator / Insight */}
          <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden group">
            <h2 className="text-xl font-bold mb-8 relative z-10">Payroll Insight</h2>
            <div className="space-y-6 relative z-10">
              <div className="p-5 rounded-[2rem] bg-white/5 border border-white/10">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Next Payout Cycle</p>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-rose-500" />
                  <h3 className="text-xl font-black">May 01, 2026</h3>
                </div>
              </div>
              <button className="w-full py-4 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                Download Yearly Audit
              </button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          </div>

          {/* Recent Payouts */}
          <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Recent History</h2>
            <div className="space-y-4">
              {[
                { month: 'March 2026', amount: '₹12.2L', status: 'Success' },
                { month: 'February 2026', amount: '₹12.1L', status: 'Success' },
                { month: 'January 2026', amount: '₹11.8L', status: 'Success' },
              ].map((h, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-rose-50 transition-all">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{h.month}</h4>
                    <p className="text-[10px] font-medium text-slate-400">{h.amount}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
