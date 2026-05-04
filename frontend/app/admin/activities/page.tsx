"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  User, 
  Star,
  ChevronRight,
  Filter,
  X,
  Target
} from 'lucide-react';
import { 
  getAllActivities, 
  addActivity, 
  updateActivity, 
  deleteActivity 
} from "../../services/activityService";

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    activityType: "Sports",
    activityName: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    result: "",
    remarks: ""
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const data = await getAllActivities();
      setActivities(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateActivity(editingId, formData);
      } else {
        await addActivity(formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({
        studentId: "", studentName: "", activityType: "Sports",
        activityName: "", description: "", date: new Date().toISOString().split('T')[0],
        result: "", remarks: ""
      });
      fetchActivities();
    } catch (error) {
      alert("Action failed. Check console.");
    }
  };

  const handleEdit = (act: any) => {
    setEditingId(act.id);
    setFormData({
      studentId: act.studentId || "",
      studentName: act.studentName || "",
      activityType: act.activityType || "Sports",
      activityName: act.activityName || "",
      description: act.description || "",
      date: act.date || "",
      result: act.result || "",
      remarks: act.remarks || ""
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteActivity(id);
      fetchActivities();
    } catch (error) {
      alert("Delete failed.");
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xl shadow-amber-500/20">
              <Trophy className="w-6 h-6" />
            </div>
            Activity Tracking
          </h1>
          <p className="text-slate-500 font-medium mt-2">Monitor student achievements, extracurriculars, and events.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" /> Log Achievement
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Statistics Bar */}
        <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Events', value: activities.length, icon: Calendar, color: 'blue' },
            { label: 'Top Performers', value: '24', icon: Star, color: 'amber' },
            { label: 'Pending Reviews', value: '03', icon: Target, color: 'rose' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex items-center gap-6 shadow-sm">
              <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-100 dark:bg-${stat.color}-900/20 text-${stat.color}-600 flex items-center justify-center`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="lg:col-span-4 flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by student name or activity..." 
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium"
            />
          </div>
          <button className="px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
            <Filter className="w-5 h-5" /> Filter Types
          </button>
        </div>

        {/* Activity Cards */}
        <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <AnimatePresence>
            {activities.map((act, i) => (
              <motion.div 
                key={act.id || i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900/50 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-amber-300 dark:hover:border-amber-900/50 transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center font-black">
                    {act.studentName?.[0]}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(act)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><Edit3 className="w-4 h-4 text-slate-400" /></button>
                    <button onClick={() => handleDelete(act.id)} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-colors"><Trash2 className="w-4 h-4 text-rose-500" /></button>
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 group-hover:text-amber-600 transition-colors">{act.activityName}</h3>
                <p className="text-sm font-bold text-slate-500 mb-6 flex items-center gap-2">
                  <User className="w-4 h-4" /> {act.studentName}
                </p>

                <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-widest">Type</span>
                    <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-black text-slate-600 dark:text-slate-300">{act.activityType}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-widest">Result</span>
                    <span className="font-black text-emerald-600">{act.result || "N/A"}</span>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <Calendar className="w-4 h-4" /> {act.date}
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-2 transition-all" />
                </div>
                
                {/* Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-all duration-700"></div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-6 h-6" /></button>
              <h2 className="text-3xl font-black mb-8">{editingId ? "Update Record" : "New Achievement"}</h2>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student Name</label>
                  <input required value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g. Rahul Raj" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Activity Name</label>
                  <input required value={formData.activityName} onChange={e => setFormData({...formData, activityName: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g. 100m Sprint" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                  <select value={formData.activityType} onChange={e => setFormData({...formData, activityType: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none">
                    <option>Sports</option>
                    <option>Arts</option>
                    <option>Science</option>
                    <option>Music</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none" />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Result/Achievement</label>
                  <input value={formData.result} onChange={e => setFormData({...formData, result: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g. Gold Medalist" />
                </div>
                
                <button type="submit" className="col-span-2 mt-4 py-5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black shadow-xl shadow-amber-500/20 transition-all">
                  {editingId ? "Save Changes" : "Confirm Record"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
