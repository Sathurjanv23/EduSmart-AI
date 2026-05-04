"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  MessageSquare, 
  Send, 
  Mail, 
  Smartphone, 
  Bell, 
  Users, 
  Search, 
  ChevronRight,
  Plus,
  History,
  CheckCircle2,
  Clock,
  Filter
} from 'lucide-react';

export default function CommunicationHub() {
  const [activeTab, setActiveTab] = useState("broadcast");

  return (
    <div className="p-6 lg:p-10 max-w-[1400px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-rose-600" />
            Communication Hub
          </h1>
          <p className="text-slate-500 font-medium mt-1">Send global announcements and manage system-wide messaging.</p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[1.5rem]">
          <button 
            onClick={() => setActiveTab("broadcast")}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === "broadcast" ? "bg-white dark:bg-slate-700 shadow-lg text-rose-600" : "text-slate-400"}`}
          >
            Broadcaster
          </button>
          <button 
            onClick={() => setActiveTab("inbox")}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === "inbox" ? "bg-white dark:bg-slate-700 shadow-lg text-rose-600" : "text-slate-400"}`}
          >
            Inbox
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Interface (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Broadcaster Card */}
          <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 md:p-10 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">New Global Broadcast</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Message Recipients</label>
                  <div className="flex flex-wrap gap-3">
                    {['All Students', 'All Teachers', 'All Parents', 'Specific Class'].map(tag => (
                      <button key={tag} className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-rose-500 hover:text-rose-600 transition-all">
                        {tag}
                      </button>
                    ))}
                    <button className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 border border-rose-500/30">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'email', label: 'Email', icon: Mail, color: 'text-blue-500' },
                    { id: 'sms', label: 'SMS', icon: Smartphone, color: 'text-emerald-500' },
                    { id: 'push', label: 'Push App', icon: Bell, color: 'text-amber-500' },
                  ].map(channel => (
                    <div key={channel.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <channel.icon className={`w-5 h-5 ${channel.color}`} />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{channel.label}</span>
                      </div>
                      <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 text-rose-600 focus:ring-rose-500" />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject</label>
                  <input type="text" placeholder="Announcement Title" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-rose-500 outline-none" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Content</label>
                  <textarea rows={5} placeholder="Write your message here..." className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] px-6 py-4 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-rose-500 outline-none resize-none" />
                </div>

                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-rose-500/40 flex items-center justify-center gap-3 transition-all"
                >
                  <Send className="w-6 h-6" /> Send Broadcast Now
                </motion.button>
              </div>
            </div>
            {/* Background Blob */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          </div>

          {/* Recent Communications */}
          <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <History className="w-6 h-6 text-slate-400" />
                Transmission History
              </h2>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <Filter className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              {[
                { title: 'Annual Sports Meet Update', to: 'Students, Parents', type: 'Email, Push', status: 'delivered', time: '2h ago' },
                { title: 'New Fee Structure 2026', to: 'Parents', type: 'SMS, Email', status: 'pending', time: '5h ago' },
                { title: 'Holiday Announcement', to: 'Global', type: 'Push', status: 'delivered', time: '1d ago' },
              ].map((log, idx) => (
                <div key={idx} className="p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between group hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${log.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {log.status === 'delivered' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">{log.title}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Recipients: {log.to}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{log.type}</p>
                    <p className="text-[10px] font-medium text-slate-400">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          
          {/* Quick Stats */}
          <div className="bg-rose-900 rounded-[3rem] p-8 text-white relative overflow-hidden group">
            <h2 className="text-xl font-bold mb-8 relative z-10">Usage Stats</h2>
            <div className="space-y-8 relative z-10">
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                  <span>Monthly SMS Credit</span>
                  <span>78% Used</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '78%' }} className="h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></motion.div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] font-bold text-rose-300 uppercase mb-1">Emails Sent</p>
                  <p className="text-xl font-black">12.4k</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] font-bold text-blue-300 uppercase mb-1">Push Delivered</p>
                  <p className="text-xl font-black">8.2k</p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl -mr-24 -mt-24 group-hover:scale-125 transition-all duration-700"></div>
          </div>

          {/* Directory Shortcuts */}
          <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Contact Directory</h2>
            <div className="space-y-4">
              {[
                { name: 'Student Directory', icon: Users, count: '1200+' },
                { name: 'Teacher Registry', icon: Smartphone, count: '85' },
                { name: 'Parent Connect', icon: Smartphone, count: '1800+' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                      <item.icon className="w-5 h-5 text-slate-400 group-hover:text-rose-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</h4>
                      <p className="text-[10px] font-medium text-slate-400">{item.count} Contacts</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
