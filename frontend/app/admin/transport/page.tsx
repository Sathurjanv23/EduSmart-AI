"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Bus, 
  MapPin, 
  Users, 
  Fuel, 
  Settings, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronRight,
  Plus,
  Navigation,
  Clock,
  CheckCircle2
} from 'lucide-react';

const MOCK_ROUTES = [
  { id: 'RT001', name: 'Downtown Route', driver: 'Somasundaram', bus: 'NB-4281', students: 42, status: 'On Trip' },
  { id: 'RT002', name: 'Coastal Line', driver: 'Abdul Rahuman', bus: 'NB-1205', students: 38, status: 'Completed' },
  { id: 'RT003', name: 'Hillside Loop', driver: 'Perera Silva', bus: 'NB-3302', students: 25, status: 'Delayed' },
  { id: 'RT004', name: 'North Suburban', driver: 'Fernando J.', bus: 'NB-8812', students: 54, status: 'Maintenance' },
];

export default function TransportManagement() {
  return (
    <div className="p-6 lg:p-10 max-w-[1500px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Bus className="w-8 h-8 text-rose-600" />
            Transport Fleet
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage school bus routes, driver assignments, and vehicle maintenance.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-rose-500/20 flex items-center gap-2 transition-all active:scale-95">
            <Plus className="w-5 h-5" /> Add New Route
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Content (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Fleet Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Total Buses', value: '18', icon: Bus, color: 'text-blue-600', bg: 'bg-blue-100' },
              { label: 'Active Routes', value: '14', icon: Navigation, color: 'text-emerald-600', bg: 'bg-emerald-100' },
              { label: 'Safety Incidents', value: '0', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-100' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
                <div className={`w-12 h-12 ${stat.bg} dark:bg-opacity-20 ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* Active Routes Table */}
          <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Live Route Tracking</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-4 px-4">Route Name</th>
                    <th className="pb-4 px-4">Driver / Vehicle</th>
                    <th className="pb-4 px-4">Load</th>
                    <th className="pb-4 px-4">Status</th>
                    <th className="pb-4 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {MOCK_ROUTES.map((route, idx) => (
                    <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                      <td className="py-6 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-rose-600 transition-colors`}>
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{route.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{route.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{route.driver}</p>
                        <p className="text-[10px] font-medium text-slate-400">Bus: {route.bus}</p>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-slate-300" />
                          <span className="text-xs font-black text-slate-900 dark:text-white">{route.students} Students</span>
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          route.status === 'On Trip' ? 'bg-blue-100 text-blue-600' : 
                          route.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 
                          route.status === 'Delayed' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                        }`}>
                          {route.status}
                        </span>
                      </td>
                      <td className="py-6 px-4">
                        <button className="text-[10px] font-black text-rose-600 uppercase hover:underline">Track Live</button>
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
          
          {/* Fleet Health */}
          <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden group">
            <h2 className="text-xl font-bold mb-8 relative z-10">Fleet Health</h2>
            <div className="space-y-6 relative z-10">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                  <span>Fuel Efficiency</span>
                  <span className="text-emerald-500">8.4 KM/L</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-emerald-500"></motion.div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-black uppercase text-amber-500">Maintenance Due</h4>
                  <p className="text-xs text-white/60">Bus NB-8812 requires engine service in 42 KM.</p>
                </div>
              </div>
              <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-xs shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                Maintenance Logs
              </button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Transport Tools</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'GPS Config', icon: Navigation },
                { label: 'Fuel Logs', icon: Fuel },
                { label: 'Assigned', icon: Users },
                { label: 'Setup', icon: Settings },
              ].map((tool, idx) => (
                <button key={idx} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all group">
                  <tool.icon className="w-6 h-6 text-slate-400 group-hover:text-rose-600" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
