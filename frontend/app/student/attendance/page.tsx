"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  ClipboardCheck, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { getAttendanceByStudent } from "@/app/services/attendanceService";

// Mock data for the calendar
const generateMockAttendance = () => {
  const data: Record<number, string> = {};
  for (let i = 1; i <= 31; i++) {
    const r = Math.random();
    if (r > 0.85) data[i] = "absent";
    else if (r > 0.75) data[i] = "late";
    else data[i] = "present";
  }
  return data;
};

const MOCK_ATTENDANCE_MAP = generateMockAttendance();

export default function StudentAttendance() {
  const [currentMonth, setCurrentMonth] = useState("April 2026");
  const [attendanceMap, setAttendanceMap] = useState<Record<number, string>>(MOCK_ATTENDANCE_MAP);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const studentId = localStorage.getItem("userId") || "STD101";
        const data = await getAttendanceByStudent(studentId);
        if (data && data.length > 0) {
          // Transform backend list to map
          const newMap: Record<number, string> = {};
          data.forEach((item: any) => {
            const day = new Date(item.date).getDate();
            newMap[day] = item.status.toLowerCase();
          });
          setAttendanceMap(newMap);
        }
      } catch (error) {
        console.error("Using mock data due to error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  
  const stats = [
    { label: "Present", value: "22", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: CheckCircle2 },
    { label: "Absent", value: "02", color: "text-rose-500", bg: "bg-rose-500/10", icon: XCircle },
    { label: "Late", value: "01", color: "text-amber-500", bg: "bg-amber-500/10", icon: Clock },
    { label: "Holidays", value: "06", color: "text-blue-500", bg: "bg-blue-500/10", icon: CalendarIcon },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-[1200px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <ClipboardCheck className="w-8 h-8 text-emerald-600" />
            Attendance Record
          </h1>
          <p className="text-slate-500 font-medium mt-1">Track your daily presence and leave applications.</p>
        </div>
        
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-emerald-500/20 transition-all">
          <FileText className="w-5 h-5" /> Request Leave
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className={`text-2xl font-black ${stat.color} mt-1`}>{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Calendar View */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{currentMonth}</h2>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><ChevronLeft className="w-5 h-5 text-slate-500" /></button>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><ChevronRight className="w-5 h-5 text-slate-500" /></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-4 text-center mb-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <span key={day} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</span>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-4">
            {/* Empty slots for month start (mock) */}
            <div className="aspect-square"></div>
            <div className="aspect-square"></div>
            
            {Array.from({ length: 30 }).map((_, i) => {
              const day = i + 1;
              const status = attendanceMap[day] || "present";
              let statusClass = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
              if (status === "absent") statusClass = "bg-rose-500/10 text-rose-600 border-rose-500/20";
              if (status === "late") statusClass = "bg-amber-500/10 text-amber-600 border-amber-500/20";

              return (
                <motion.div 
                  key={i}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className={`aspect-square flex items-center justify-center rounded-2xl border font-bold text-sm ${statusClass} cursor-pointer transition-all`}
                >
                  {day}
                </motion.div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="mt-10 flex flex-wrap gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Late</span>
            </div>
          </div>
        </div>

        {/* Recent Updates / Warnings */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center mb-6">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold mb-2">Shortage Warning</h2>
              <p className="text-xs text-slate-400 mb-6">Your Physics attendance is <span className="text-rose-500 font-black">72%</span>. Minimum required is 75%.</p>
              <button className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-xs hover:bg-rose-500 hover:text-white transition-all">
                Speak to Coordinator
              </button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-all duration-700"></div>
          </div>

          <div className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Leave Requests</h2>
            <div className="space-y-4">
              {[
                { date: '12 Apr', type: 'Medical', status: 'Approved', color: 'emerald' },
                { date: '05 Mar', type: 'Family Event', status: 'Rejected', color: 'rose' },
              ].map((leave, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{leave.type}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{leave.date}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase bg-${leave.color}-100 text-${leave.color}-600`}>
                    {leave.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
