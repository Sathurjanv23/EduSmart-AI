"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  LogOut, 
  Save, 
  Camera,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react';
import { useRole } from "@/components/RoleProvider";
import { useTheme } from "next-themes";
import { logout } from "@/app/services/authService";

export default function SettingsPage() {
  const { role } = useRole();
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("profile");
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentRole = role || 'ADMIN';

  const sections = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-[1200px] mx-auto">
      
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">System Settings</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your account preferences and global system configurations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {sections.map(section => (
            <button 
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold text-sm transition-all ${activeSection === section.id ? 'bg-white dark:bg-slate-800 shadow-lg text-rose-600 border border-slate-100 dark:border-slate-700' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}
            >
              <div className="flex items-center gap-3">
                <section.icon className="w-5 h-5" />
                {section.label}
              </div>
              {activeSection === section.id && <ChevronRight className="w-4 h-4" />}
            </button>
          ))}
          
          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all"
            >
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <motion.div 
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-8 md:p-10 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            {activeSection === 'profile' && (
              <div className="space-y-10">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white text-4xl font-black shadow-xl group-hover:opacity-80 transition-all">
                      {currentRole.charAt(0)}
                    </div>
                    <button className="absolute bottom-0 right-0 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 text-rose-600 hover:scale-110 transition-transform">
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Profile Identity</h3>
                    <p className="text-sm text-slate-500 font-medium">Update your photo and personal details.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input type="text" defaultValue="Sathurjan" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-rose-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input type="email" defaultValue="admin@school.edu" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-rose-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role Title</label>
                    <input type="text" disabled defaultValue={currentRole} className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-500 cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <input type="text" defaultValue="+91 98765 43210" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-rose-500 outline-none" />
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button className="bg-rose-600 hover:bg-rose-500 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-rose-500/20 flex items-center gap-2 transition-all active:scale-95">
                    <Save className="w-5 h-5" /> Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'appearance' && (
              <div className="space-y-10">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Interface Customization</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div 
                    onClick={() => setTheme('light')}
                    className={`p-6 rounded-[2.5rem] border-4 cursor-pointer transition-all ${theme === 'light' ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/10' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50'}`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md mb-4">
                      <Sun className="w-6 h-6 text-amber-500" />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Light Mode</h4>
                    <p className="text-xs text-slate-500 mt-1">Optimal for daytime environments.</p>
                  </div>
                  <div 
                    onClick={() => setTheme('dark')}
                    className={`p-6 rounded-[2.5rem] border-4 cursor-pointer transition-all ${theme === 'dark' ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/10' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50'}`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center shadow-md mb-4">
                      <Moon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Dark Mode</h4>
                    <p className="text-xs text-slate-500 mt-1">Easier on the eyes in low-light.</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Account Security</h3>
                <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 flex items-start gap-4">
                  <Shield className="w-6 h-6 text-amber-600 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400">Two-Factor Authentication</h4>
                    <p className="text-xs text-amber-700 dark:text-amber-500/80 mt-1">2FA is currently enabled for your account via Email. This adds an extra layer of protection.</p>
                  </div>
                </div>
                
                <div className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-rose-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-rose-500 outline-none" />
                  </div>
                  <button className="text-sm font-bold text-rose-600 hover:underline">Forgot your password?</button>
                </div>

                <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                  <button className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all">
                    Update Security
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

      </div>

    </div>
  );
}
