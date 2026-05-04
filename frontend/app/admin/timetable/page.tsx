"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  Search, 
  Plus, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  Users,
  MapPin
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'];

const MOCK_SCHEDULE = [
  { day: 'Monday', time: '09:00 AM', subject: 'Maths', teacher: 'Dr. Subramanian', room: 'R302', color: 'bg-rose-500' },
  { day: 'Monday', time: '11:00 AM', subject: 'Physics', teacher: 'Ms. Kavitha', room: 'Lab 01', color: 'bg-blue-500' },
  { day: 'Tuesday', time: '10:00 AM', subject: 'Chemistry', teacher: 'Mr. Rajesh', room: 'Lab 02', color: 'bg-emerald-500' },
  { day: 'Wednesday', time: '09:00 AM', subject: 'English', teacher: 'Mrs. Priya', room: 'R105', color: 'bg-purple-500' },
  { day: 'Friday', time: '02:00 PM', subject: 'Computer', teacher: 'Admin_Super', room: 'Lab 04', color: 'bg-amber-500' },
];

export default function TimetableManagement() {
  const [selectedClass, setSelectedClass] = useState("Grade 10-A");

  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Calendar className="w-8 h-8 text-rose-600" />
            Timetable Manager
          </h1>
          <p className="text-slate-500 font-medium mt-1">Design and optimize class schedules across the campus.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button className="px-4 py-2 text-[10px] font-black uppercase rounded-xl bg-white dark:bg-slate-700 shadow-sm">Main View</button>
            <button className="px-4 py-2 text-[10px] font-black uppercase text-slate-400">Exam View</button>
          </div>
          <button className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-rose-500/20 transition-all">
            <Plus className="w-5 h-5" /> Auto-Generate
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900/50 p-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 mb-10 flex flex-wrap items-center gap-6 shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <Users className="w-5 h-5 text-slate-400" />
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-transparent border-none text-sm font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option>Grade 10-A</option>
            <option>Grade 11-C</option>
            <option>Grade 12-A</option>
          </select>
        </div>
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block"></div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors">
            <Filter className="w-4 h-4" /> More Filters
          </button>
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
            <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg shadow-sm transition-all"><ChevronLeft className="w-4 h-4 text-slate-500" /></button>
            <span className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">April 06 - 11</span>
            <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg shadow-sm transition-all"><ChevronRight className="w-4 h-4 text-slate-500" /></button>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Table Header */}
            <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
              <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30"></div>
              {DAYS.map(day => (
                <div key={day} className="p-6 text-center border-l border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</span>
                </div>
              ))}
            </div>

            {/* Table Rows */}
            {TIME_SLOTS.map(time => (
              <div key={time} className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 last:border-none">
                <div className="p-6 flex items-center justify-center bg-slate-50/30 dark:bg-slate-800/10">
                  <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
                    <Clock className="w-3 h-3" /> {time}
                  </span>
                </div>
                
                {DAYS.map(day => {
                  const session = MOCK_SCHEDULE.find(s => s.day === day && s.time === time);
                  return (
                    <div key={`${day}-${time}`} className="p-4 border-l border-slate-100 dark:border-slate-800 min-h-[120px] relative group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                      {session ? (
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`h-full rounded-2xl p-4 text-white ${session.color} shadow-lg shadow-current/10 cursor-pointer relative overflow-hidden`}
                        >
                          <h4 className="text-sm font-black mb-1">{session.subject}</h4>
                          <p className="text-[10px] font-bold opacity-80 mb-3">{session.teacher}</p>
                          <div className="flex items-center gap-2 opacity-90">
                            <MapPin className="w-3 h-3" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{session.room}</span>
                          </div>
                          
                          <button className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-black/20">
                            <MoreVertical className="w-3 h-3" />
                          </button>
                        </motion.div>
                      ) : (
                        <div className="h-full w-full rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:border-rose-300 dark:hover:border-rose-900/50">
                          <Plus className="w-5 h-5 text-slate-300 group-hover:text-rose-500" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
