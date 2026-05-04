"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  School, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  Users, 
  Zap, 
  Droplets, 
  Wifi, 
  Plus, 
  ChevronRight,
  Monitor,
  Activity
} from 'lucide-react';

export default function InfrastructureManagement() {
  const [selectedBranch, setSelectedBranch] = useState("Main Campus - Colombo");

  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-rose-600" />
            Branch Infrastructure
          </h1>
          <p className="text-slate-500 font-medium mt-1">Monitor facilities, assets, and utility status across all school branches.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-rose-500/20 flex items-center gap-2 transition-all active:scale-95">
            <Plus className="w-5 h-5" /> Add New Branch
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Branch Selection & Facility Map (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Branch Overview Card */}
          <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div className="w-48 h-48 rounded-[2.5rem] bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 shadow-inner">
                <School className="w-20 h-20" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Headquarters</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{selectedBranch}</h2>
                <p className="text-sm text-slate-500 font-medium mb-6">Established 1998 • 4.2 Acres • Total Capacity: 2,500 Students</p>
                
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[10px] font-black uppercase border border-emerald-100 dark:border-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5" /> Safety Certified
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-black uppercase border border-blue-100 dark:border-blue-800">
                    <Activity className="w-3.5 h-3.5" /> High Performance
                  </div>
                </div>
              </div>
            </div>
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          </div>

          {/* Facility Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Computer Labs', count: '04', status: 'Optimal', icon: Monitor, color: 'blue' },
              { label: 'Smart Classrooms', count: '42', status: 'Active', icon: Zap, color: 'amber' },
              { label: 'Sport Grounds', count: '02', status: 'Available', icon: Activity, color: 'emerald' },
            ].map((facility, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <div className={`w-12 h-12 bg-${facility.color}-100 dark:bg-${facility.color}-900/20 text-${facility.color}-600 rounded-2xl flex items-center justify-center mb-6`}>
                  <facility.icon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{facility.label}</h4>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{facility.count}</p>
                  <span className={`text-[10px] font-black uppercase text-${facility.color}-600`}>{facility.status}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Asset Utilization (Large Card) */}
          <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Facility Utilization</h2>
              <button className="text-[10px] font-black text-rose-600 uppercase">Resource Audit</button>
            </div>
            
            <div className="space-y-8">
              {[
                { name: 'Library Seating', usage: '82%', icon: Users },
                { name: 'Science Lab Equipment', usage: '64%', icon: Building2 },
                { name: 'Server Uptime', usage: '99.9%', icon: Zap },
              ].map((item, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-rose-600">{item.usage}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: item.usage }} className="h-full bg-rose-500"></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          
          {/* Utility Status */}
          <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden group">
            <h2 className="text-xl font-bold mb-8 relative z-10">Real-time Utilities</h2>
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-bold">Electricity</span>
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-500">Stable</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-bold">Water Supply</span>
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-500">Normal</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <Wifi className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-bold">High-Speed Wi-Fi</span>
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-500">Online</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
          </div>

          {/* Other Branches List */}
          <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Other Branches</h2>
            <div className="space-y-4">
              {[
                { name: 'Kandy Secondary', type: 'Branch', students: '850' },
                { name: 'Jaffna International', type: 'Associate', students: '1200' },
                { name: 'Galle Preparatory', type: 'Branch', students: '420' },
              ].map((branch, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all cursor-pointer group">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{branch.name}</h4>
                    <p className="text-[10px] font-medium text-slate-400">{branch.type} • {branch.students} Students</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-600 transition-colors" />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
