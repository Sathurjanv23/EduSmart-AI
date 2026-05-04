"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  Terminal, 
  Lock, 
  Eye, 
  Activity, 
  Database, 
  AlertTriangle, 
  UserCheck, 
  Globe, 
  History,
  CheckCircle2,
  XCircle,
  ChevronRight
} from 'lucide-react';

export default function SecurityAudit() {
  return (
    <div className="p-6 lg:p-10 max-w-[1500px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-rose-600" />
            Security & Audit
          </h1>
          <p className="text-slate-500 font-medium mt-1">Monitor system integrity, access logs, and core security configurations.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all flex items-center gap-2">
            <Database className="w-4 h-4" /> Run System Backup
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Logs (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Security Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'System Integrity', value: 'Optimal', icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-100' },
              { label: 'Failed Logins', value: '12', icon: Lock, color: 'text-rose-500', bg: 'bg-rose-100' },
              { label: 'Active Sessions', value: '184', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-100' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className={`w-10 h-10 ${stat.bg} dark:bg-opacity-20 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* Live System Logs */}
          <div className="bg-slate-900 rounded-[3rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Terminal className="w-6 h-6 text-rose-500" />
                Live System Logs
              </h2>
              <span className="flex items-center gap-2 text-[10px] font-black uppercase text-rose-500 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div> Real-time Feed
              </span>
            </div>
            
            <div className="space-y-4 font-mono text-[11px] h-[400px] overflow-y-auto pr-4 scrollbar-hide">
              {[
                { time: '13:42:01', user: 'ADMIN_ROOT', action: 'Modified Fee Structure (Grade 10)', status: 'Success' },
                { time: '13:41:48', user: 'SYSTEM', action: 'DB_BACKUP_COMPLETED', status: 'Info' },
                { time: '13:40:12', user: 'IP_182.1.0.4', action: 'BRUTE_FORCE_PREVENTED', status: 'Warning' },
                { time: '13:38:55', user: 'TCH002', action: 'Bulk Attendance Marked (12-C)', status: 'Success' },
                { time: '13:35:20', user: 'SYSTEM', action: 'EMAIL_DISPATCH_COMPLETED', status: 'Info' },
                { time: '13:32:11', user: 'ADMIN_ROOT', action: 'New Staff Hired (STF042)', status: 'Success' },
              ].map((log, idx) => (
                <div key={idx} className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10 group/log">
                  <span className="text-slate-500 whitespace-nowrap">{log.time}</span>
                  <span className="text-rose-400 font-bold whitespace-nowrap">[{log.user}]</span>
                  <span className="text-slate-300 flex-1">{log.action}</span>
                  <span className={`font-black uppercase tracking-widest ${log.status === 'Warning' ? 'text-amber-500' : 'text-emerald-500'}`}>{log.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          
          {/* Security Incidents */}
          <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Security Alerts</h2>
            <div className="space-y-4">
              <div className="p-5 rounded-[2rem] bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-rose-500 mt-1" />
                <div>
                  <h4 className="text-sm font-black text-rose-600">3 Unauthorized Login Attempts</h4>
                  <p className="text-[10px] font-medium text-rose-400 mt-1">Origin: Unknown IP (London, UK)</p>
                  <button className="mt-3 text-[10px] font-black uppercase text-rose-600 hover:underline">Review & Block</button>
                </div>
              </div>
            </div>
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          </div>

          {/* Access Control Shortcuts */}
          <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Global Controls</h2>
            <div className="space-y-4">
              {[
                { label: 'Role Permissions', icon: UserCheck },
                { label: 'IP White-listing', icon: Globe },
                { label: 'Audit Archives', icon: History },
                { label: 'API Keys', icon: Shield },
              ].map((tool, idx) => (
                <button key={idx} className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all group">
                  <div className="flex items-center gap-4">
                    <tool.icon className="w-5 h-5 text-slate-400 group-hover:text-rose-600" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{tool.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
