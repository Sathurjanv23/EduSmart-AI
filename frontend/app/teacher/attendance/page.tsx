"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Save, 
  CheckSquare,
  ChevronDown
} from 'lucide-react';

const MOCK_STUDENTS = [
  { id: 'STD101', name: 'Arun Kumar', status: 'present' },
  { id: 'STD102', name: 'Balan S.', status: 'present' },
  { id: 'STD103', name: 'Chitra M.', status: 'absent' },
  { id: 'STD104', name: 'Divya P.', status: 'present' },
  { id: 'STD105', name: 'Eswar R.', status: 'late' },
];

export default function TeacherAttendance() {
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [selectedClass, setSelectedClass] = useState("Grade 10-A");

  const updateStatus = (id: string, newStatus: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const markAllPresent = () => {
    setStudents(prev => prev.map(s => ({ ...s, status: 'present' })));
  };

  return (
    <div className="p-6 lg:p-10 max-w-[1200px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-blue-600" />
            Mark Attendance
          </h1>
          <p className="text-slate-500 font-medium mt-1">Class attendance for {new Date().toLocaleDateString('en-GB')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={markAllPresent}
            className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-6 py-3 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
          >
            Mark All Present
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95">
            <Save className="w-5 h-5" /> Submit List
          </button>
        </div>
      </div>

      {/* Roster Controls */}
      <div className="bg-white dark:bg-slate-900/50 p-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 mb-8 flex flex-wrap items-center gap-6 shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <Users className="w-5 h-5 text-slate-400" />
          <div className="relative w-full">
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-transparent border-none text-sm font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer appearance-none"
            >
              <option>Grade 10-A</option>
              <option>Grade 11-C</option>
              <option>Grade 12-A</option>
            </select>
            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block"></div>
        <div className="flex-1 relative min-w-[250px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search student name..." className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-sm outline-none" />
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {students.map((student, idx) => (
            <motion.div 
              key={student.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg">
                  {student.name[0]}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{student.name}</h4>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{student.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {[
                  { id: 'present', label: 'Present', icon: CheckCircle2, color: 'emerald' },
                  { id: 'absent', label: 'Absent', icon: XCircle, color: 'rose' },
                  { id: 'late', label: 'Late', icon: Clock, color: 'amber' },
                ].map(status => (
                  <button
                    key={status.id}
                    onClick={() => updateStatus(student.id, status.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      student.status === status.id 
                      ? `bg-${status.color}-500 text-white shadow-lg shadow-${status.color}-500/20` 
                      : `bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300`
                    }`}
                  >
                    <status.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{status.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}
