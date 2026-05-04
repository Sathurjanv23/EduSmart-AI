"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Search, 
  Plus, 
  Filter, 
  Bookmark, 
  Clock, 
  CheckCircle2, 
  Users, 
  ChevronRight,
  MoreVertical,
  BookMarked
} from 'lucide-react';

const MOCK_BOOKS = [
  { id: 'B001', title: 'Quantum Physics', author: 'Richard Feynman', category: 'Science', status: 'Available', shelf: 'A-12' },
  { id: 'B002', title: 'Advanced Calculus', author: 'Morris Tenenbaum', category: 'Mathematics', status: 'Issued', shelf: 'B-04' },
  { id: 'B003', title: 'World History', author: 'H.G. Wells', category: 'History', status: 'Available', shelf: 'C-08' },
  { id: 'B004', title: 'Computer Science', author: 'Donald Knuth', category: 'Computing', status: 'Reserved', shelf: 'D-01' },
  { id: 'B005', title: 'English Literature', author: 'William Shakespeare', category: 'Language', status: 'Available', shelf: 'L-05' },
];

export default function LibraryManagement() {
  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <BookMarked className="w-8 h-8 text-rose-600" />
            Library Portal
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage physical book inventory, digital resources, and borrowing history.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-rose-500/20 flex items-center gap-2 transition-all active:scale-95">
            <Plus className="w-5 h-5" /> Add New Book
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Content (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Controls */}
          <div className="bg-white dark:bg-slate-900/50 p-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-6 shadow-sm">
            <div className="flex-1 relative min-w-[250px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search books by title, author, or ISBN..." className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm outline-none focus:ring-1 focus:ring-rose-500" />
            </div>
            <div className="flex items-center gap-3">
              <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 outline-none">
                <option>All Categories</option>
                <option>Science</option>
                <option>Mathematics</option>
              </select>
              <button className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400"><Filter className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Book Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_BOOKS.map((book, idx) => (
              <motion.div 
                key={book.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/20 text-rose-600 flex items-center justify-center">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${book.status === 'Available' ? 'bg-emerald-100 text-emerald-600' : book.status === 'Issued' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                    {book.status}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors truncate">{book.title}</h3>
                <p className="text-sm font-bold text-slate-400 mb-4">{book.author}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{book.category}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shelf: {book.shelf}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          
          {/* Issue Summary */}
          <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden group">
            <h2 className="text-xl font-bold mb-8 relative z-10">Library Pulse</h2>
            <div className="space-y-6 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Books Issued</p>
                  <p className="text-xl font-black">428</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Overdue</p>
                  <p className="text-xl font-black text-rose-500">14</p>
                </div>
              </div>
              <button className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-rose-500/20 hover:bg-rose-500 transition-all flex items-center justify-center gap-2">
                Issue / Return Book <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/20 rounded-full blur-3xl group-hover:scale-125 transition-all duration-700"></div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm h-full">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Recent Activity</h2>
            <div className="space-y-6">
              {[
                { name: 'Arun Kumar', book: 'Quantum Physics', action: 'Returned', time: '12m ago', color: 'emerald' },
                { name: 'Priya Raj', book: 'Advanced Calculus', action: 'Issued', time: '1h ago', color: 'blue' },
                { name: 'Rahul Dev', book: 'World History', action: 'Reserved', time: '2h ago', color: 'amber' },
                { name: 'Fathima Z.', book: 'English Lit.', action: 'Overdue', time: '1d ago', color: 'rose' },
              ].map((activity, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className={`w-1 h-10 rounded-full bg-${activity.color}-500/20`}></div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{activity.name}</h4>
                    <p className="text-[10px] font-medium text-slate-500">{activity.action}: <span className="font-bold text-slate-700 dark:text-slate-300">{activity.book}</span></p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{activity.time}</p>
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
