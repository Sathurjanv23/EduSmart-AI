'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRole, Role } from './RoleProvider';
import { GraduationCap, Presentation, Users, Shield, Settings2 } from 'lucide-react';

const ROLES: { id: Role; label: string; icon: any; color: string }[] = [
  { id: 'STUDENT', label: 'Student', icon: GraduationCap, color: 'bg-emerald-500' },
  { id: 'TEACHER', label: 'Teacher', icon: Presentation, color: 'bg-blue-500' },
  { id: 'PARENT', label: 'Parent', icon: Users, color: 'bg-purple-500' },
  { id: 'ADMIN', label: 'Admin', icon: Shield, color: 'bg-rose-500' },
];

export function RoleSwitcher() {
  const { role, setRole } = useRole();
  const [isOpen, setIsOpen] = React.useState(false);

  const activeRole = ROLES.find(r => r.id === role) || ROLES[3];

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="mb-4 flex flex-col gap-2 rounded-2xl bg-white/90 p-2 shadow-2xl backdrop-blur-lg dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800"
          >
            {ROLES.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setRole(r.id);
                  setIsOpen(false);
                }}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  role === r.id
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${r.color} text-white shadow-lg transition-transform group-hover:scale-110`}>
                  <r.icon className="h-4 w-4" />
                </div>
                {r.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-2xl ring-4 ring-white transition-all hover:shadow-blue-500/25 dark:bg-white dark:text-slate-900 dark:ring-slate-900"
      >
        <Settings2 className={`h-6 w-6 transition-transform duration-500 ${isOpen ? 'rotate-90' : 'rotate-0'}`} />
        
        {/* Floating active role indicator */}
        <div className={`absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white dark:border-slate-900 ${activeRole.color}`}>
          <activeRole.icon className="h-3 w-3 text-white" />
        </div>
      </motion.button>
    </div>
  );
}
