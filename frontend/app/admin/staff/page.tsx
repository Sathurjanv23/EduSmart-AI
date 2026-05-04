"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Mail, 
  Presentation, 
  Award,
  DollarSign,
  ChevronRight,
  Briefcase
} from 'lucide-react';

const MOCK_STAFF = [
  { id: 'TCH001', name: 'Dr. Subramanian', role: 'Teacher', dept: 'Mathematics', rating: 4.9, status: 'Active' },
  { id: 'TCH002', name: 'Ms. Kavitha', role: 'Teacher', dept: 'Science', rating: 4.8, status: 'Active' },
  { id: 'ADM001', name: 'Rajesh Kumar', role: 'Admin', dept: 'Finance', rating: 4.5, status: 'Active' },
  { id: 'TCH003', name: 'Mrs. Priya', role: 'Teacher', dept: 'English', rating: 4.7, status: 'On Leave' },
  { id: 'STF001', name: 'Kumar S.', role: 'Staff', dept: 'Transport', rating: 4.2, status: 'Active' },
];

export default function StaffManagement() {
  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-rose-600" />
            Staff Directory
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage teaching and non-teaching staff, departments, and payroll.</p>
        </div>
        
        <button className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-rose-500/20 flex items-center gap-2 transition-all active:scale-95">
          <Plus className="w-5 h-5" /> Hire New Staff
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* Main List (Left 3 columns) */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Controls */}
          <div className="bg-white dark:bg-slate-900/50 p-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-6 shadow-sm">
            <div className="flex-1 relative min-w-[250px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search staff by name or ID..." className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm outline-none focus:ring-1 focus:ring-rose-500" />
            </div>
            <div className="flex items-center gap-3">
              <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 outline-none">
                <option>All Departments</option>
                <option>Mathematics</option>
                <option>Science</option>
              </select>
              <button className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400"><Filter className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <th className="p-6">Staff Member</th>
                  <th className="p-6">Department</th>
                  <th className="p-6">Rating</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {MOCK_STAFF.map((staff, idx) => (
                  <tr key={staff.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-black">
                          {staff.name[0]}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">{staff.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{staff.id} • {staff.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{staff.dept}</span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-black text-slate-900 dark:text-white">{staff.rating}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${staff.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                        {staff.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all">
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          
          {/* Quick Actions */}
          <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden group">
            <h2 className="text-xl font-bold mb-8 relative z-10">Payroll Status</h2>
            <div className="space-y-6 relative z-10">
              <div className="p-5 rounded-[2rem] bg-white/5 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase text-slate-400">Monthly Payout</span>
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black">₹18.4L</h3>
                <p className="text-[10px] text-emerald-500 font-bold mt-1">Processed: 92%</p>
              </div>
              <button className="w-full py-4 bg-rose-600 text-white rounded-[1.5rem] font-black text-xs shadow-xl shadow-rose-500/20 hover:bg-rose-500 transition-all flex items-center justify-center gap-2">
                Release Salaries <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/20 rounded-full blur-3xl group-hover:scale-125 transition-all duration-700"></div>
          </div>

          {/* Department Breakdown */}
          <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Departments</h2>
            <div className="space-y-4">
              {[
                { name: 'Mathematics', count: 12, color: 'bg-rose-500' },
                { name: 'Science', count: 15, color: 'bg-blue-500' },
                { name: 'Admin', count: 8, color: 'bg-emerald-500' },
                { name: 'Transport', count: 24, color: 'bg-amber-500' },
              ].map((dept, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${dept.color}`}></div>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{dept.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white">{dept.count}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
