"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Plus, 
  ChevronRight,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const gradeDistData = [
  { grade: 'A+', count: 45 },
  { grade: 'A', count: 120 },
  { grade: 'B', count: 85 },
  { grade: 'C', count: 32 },
  { grade: 'D', count: 12 },
  { grade: 'F', count: 5 },
];

export default function ExamManagement() {
  return (
    <div className="p-6 lg:p-10 max-w-[1500px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-rose-600" />
            Exams & Results
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage examination schedules and global result analytics.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-rose-500/20 transition-all">
            <Plus className="w-5 h-5" /> Schedule New Exam
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Analytics Section (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Quick Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Overall Pass %', value: '94.8%', trend: '+2.4%', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { label: 'Top Scorer', value: '98.2%', trend: 'STD104', color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Pending Results', value: '14 Classes', trend: 'Due in 2d', color: 'text-amber-500', bg: 'bg-amber-500/10' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
                  <span className={`text-[10px] font-black ${stat.color}`}>{stat.trend}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Grade Distribution */}
          <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Global Grade Distribution</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeDistData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none'}} />
                  <Bar dataKey="count" fill="#f43f5e" radius={[10, 10, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Upcoming Exams Table */}
          <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Ongoing & Upcoming</h2>
            <div className="space-y-4">
              {[
                { title: 'Final Term Assessment', class: 'Grade 10, 11, 12', status: 'In Progress', color: 'emerald' },
                { title: 'Monthly Unit Test - II', class: 'Grade 6 - 9', status: 'Scheduled', color: 'blue' },
                { title: 'Practical Lab Exam', class: 'Science Group', status: 'Coming Soon', color: 'amber' },
              ].map((exam, idx) => (
                <div key={idx} className="p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between group hover:bg-white transition-all">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl bg-${exam.color}-100 dark:bg-${exam.color}-900/30 flex items-center justify-center text-${exam.color}-600`}>
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">{exam.title}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{exam.class}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase bg-${exam.color}-100 text-${exam.color}-600`}>
                      {exam.status}
                    </span>
                    <button className="ml-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"><ChevronRight className="w-4 h-4 text-slate-300" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          
          {/* Performance Insight */}
          <div className="bg-rose-900 rounded-[3rem] p-8 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-6 text-rose-300">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold mb-2">AI Performance Predictor</h2>
              <p className="text-xs text-rose-200 mb-6">Based on current trends, <span className="text-white font-black">Grade 11-A</span> is expected to top the finals with an average of 88%.</p>
              <button className="w-full py-4 bg-white text-rose-600 rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                Generate Full Report <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/30 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-all duration-700"></div>
          </div>

          {/* Quick Tools */}
          <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Quick Tools</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Enter Marks', icon: CheckCircle2 },
                { label: 'Grade Config', icon: Award },
                { label: 'Hall Tickets', icon: FileText },
                { label: 'Issue Report', icon: AlertCircle },
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
