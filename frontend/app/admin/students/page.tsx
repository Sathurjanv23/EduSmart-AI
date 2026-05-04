"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Download,
  UserPlus,
  X
} from 'lucide-react';
import { getAllStudents, addStudent } from "@/app/services/studentService";

export default function StudentManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", email: "", grade: "10-A", parent: "", gender: "M" });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await getAllStudents();
      if (data) setStudents(data);
    } catch (error) {
      console.log("Using static data as fallback");
      setStudents([
        { id: 'STD101', name: 'Arun Kumar', grade: '10-A', parent: 'Kumar S.', email: 'arun@example.com', status: 'Active', gender: 'M' },
        { id: 'STD102', name: 'Balan S.', grade: '10-B', parent: 'Suresh V.', email: 'balan@example.com', status: 'Active', gender: 'M' },
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addStudent({ ...newStudent, status: "Active" });
      setIsModalOpen(false);
      fetchStudents();
      alert("Student added successfully to MongoDB!");
    } catch (error) {
      alert("Error adding student. Check console.");
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-rose-600" />
            Student Directory
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage admissions, profiles, and academic records for all students.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-6 py-3 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-white transition-all flex items-center gap-2">
            <Download className="w-5 h-5" /> Export Data
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-rose-500/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <UserPlus className="w-5 h-5" /> New Admission
          </button>
        </div>
      </div>

      {/* Analytics Mini-Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Enrolled', value: '1,248', icon: Users, color: 'text-rose-600', bg: 'bg-rose-100' },
          { label: 'Male Students', value: '642', icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Female Students', value: '606', icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: 'New Admissions', value: '24', icon: Plus, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} dark:bg-opacity-20 ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="bg-white dark:bg-slate-900/50 p-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 mb-8 flex flex-wrap items-center gap-6 shadow-sm">
        <div className="flex-1 relative min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, ID, or parent name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-xs font-bold text-slate-600 outline-none">
            <option>All Grades</option>
            <option>Grade 10</option>
            <option>Grade 11</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-500">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {students.map((student, idx) => (
            <motion.div 
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-rose-300 dark:hover:border-rose-900/50 transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-2xl font-black shadow-lg ${student.gender === 'M' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>
                  {student.name[0]}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${student.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {student.status}
                  </span>
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <MoreVertical className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">{student.name}</h3>
              <p className="text-sm font-bold text-slate-400 mb-6 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> Grade {student.grade} • ID: {student.id}
              </p>

              <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Parent: <b>{student.parent}</b></span>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{student.email}</span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <button className="py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-rose-600 hover:text-white transition-all">
                  View Profile
                </button>
                <button className="py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-rose-600 hover:text-white transition-all">
                  Contact
                </button>
              </div>

              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-all duration-700"></div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      <div className="mt-12 flex items-center justify-center gap-4">
        <button className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 transition-all"><ChevronLeft className="w-5 h-5" /></button>
        <span className="text-sm font-bold text-slate-500">Page 1 of 42</span>
        <button className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 transition-all"><ChevronRight className="w-5 h-5" /></button>
      </div>

      {/* Add Student Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-8 shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
              
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">New Student Admission</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student Name</label>
                  <input 
                    required 
                    type="text" 
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    placeholder="Enter full name" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-500" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    required 
                    type="email" 
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                    placeholder="student@example.com" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-500" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade</label>
                    <input 
                      required 
                      type="text" 
                      value={newStudent.grade}
                      onChange={(e) => setNewStudent({...newStudent, grade: e.target.value})}
                      placeholder="e.g. 10-A" 
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-500" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                    <select 
                      value={newStudent.gender}
                      onChange={(e) => setNewStudent({...newStudent, gender: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-3 text-sm outline-none"
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parent/Guardian Name</label>
                  <input 
                    required 
                    type="text" 
                    value={newStudent.parent}
                    onChange={(e) => setNewStudent({...newStudent, parent: e.target.value})}
                    placeholder="Enter parent name" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-500" 
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="w-full mt-6 bg-rose-600 hover:bg-rose-500 text-white py-4 rounded-2xl font-black text-sm shadow-xl transition-all"
                >
                  Register Student
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
