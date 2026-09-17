'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Role } from '@/app/services/authService';
import { useAuth } from './AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './Navbar';
import {
  LayoutDashboard, Users, Calendar, BookOpen, DollarSign, MessageSquare,
  Bus, Shield, Settings, FileText, School, X,
  ClipboardCheck, Presentation, PieChart, CreditCard,
  BrainCircuit, Zap, BookMarked
} from 'lucide-react';

// ─── Role colours for sidebar active states ───────────────────────────────────
const ROLE_ACTIVE: Record<Role, string> = {
  STUDENT: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  TEACHER: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  PARENT:  'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  ADMIN:   'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};
const ROLE_ICON_ACTIVE: Record<Role, string> = {
  STUDENT: 'text-emerald-600 dark:text-emerald-400',
  TEACHER: 'text-blue-600 dark:text-blue-400',
  PARENT:  'text-purple-600 dark:text-purple-400',
  ADMIN:   'text-rose-600 dark:text-rose-400',
};
const ROLE_LOGO: Record<Role, string> = {
  STUDENT: 'from-emerald-500 to-teal-600',
  TEACHER: 'from-blue-500 to-indigo-600',
  PARENT:  'from-purple-500 to-violet-600',
  ADMIN:   'from-rose-500 to-pink-600',
};

// ─── Sidebar nav data per role ────────────────────────────────────────────────
const getSidebarGroupsForRole = (role: Role) => {
  switch (role) {
    case 'STUDENT':
      return [
        {
          name: 'My Academics',
          items: [
            { name: 'Dashboard',      href: '/student/dashboard',    icon: LayoutDashboard },
            { name: 'My Attendance',  href: '/student/attendance',   icon: ClipboardCheck },
            { name: 'My Marks',       href: '/student/marks',        icon: FileText },
            { name: 'My Exams',       href: '/student/exams',        icon: Calendar },
            { name: 'Assignments',    href: '/student/assignments',  icon: BookOpen },
          ],
        },
        {
          name: 'My Portal',
          items: [
            { name: 'Fee Status',        href: '/student/fees',         icon: CreditCard },
          ],
        },
      ];

    case 'TEACHER':
      return [
        {
          name: 'Class Management',
          items: [
            { name: 'Dashboard',       href: '/teacher/dashboard',  icon: LayoutDashboard },
            { name: 'Mark Attendance', href: '/teacher/attendance', icon: ClipboardCheck },
            { name: 'Exams & Marks',   href: '/teacher/exams',       icon: FileText },
            { name: 'Assignments',     href: '/teacher/assignments', icon: BookOpen },
            { name: 'Risk Predictor',  href: '/teacher/predictor',   icon: Zap },
          ],
        },
      ];

    case 'PARENT':
      return [
        {
          name: "Child's Overview",
          items: [
            { name: 'Dashboard',      href: '/parent/dashboard',   icon: LayoutDashboard },
            { name: 'Child Progress', href: '/parent/portal',      icon: ClipboardCheck },
          ],
        },
      ];

    case 'ADMIN':
    default:
      return [
        {
          name: 'Core Academics',
          items: [
            { name: 'Global Dashboard',   href: '/admin/dashboard',       icon: LayoutDashboard },
            { name: 'Branch Management',  href: '/admin/infrastructure',  icon: School },
            { name: 'Staff Management',   href: '/admin/staff',           icon: Presentation },
            { name: 'User Accounts',      href: '/admin/users',           icon: Shield },
            { name: 'Student Management', href: '/admin/students',        icon: Users },
            { name: 'Library',            href: '/admin/library',         icon: BookMarked },
            { name: 'Timetable',          href: '/admin/timetable',       icon: Calendar },
            { name: 'Exams & Results',    href: '/admin/exams',           icon: FileText },
          ],
        },
        {
          name: 'Finance',
          items: [
            { name: 'Fee Management',  href: '/admin/finance/fees',   icon: DollarSign },
            { name: 'Staff Salary',    href: '/admin/finance/salary', icon: CreditCard },
            { name: 'Transport',       href: '/admin/transport',      icon: Bus },
          ],
        },
        {
          name: 'AI & Analytics',
          items: [
            { name: 'Performance Predictor', href: '/admin/ai/predictor', icon: Zap },
            { name: 'Question Generator',    href: '/admin/ai/generator', icon: BrainCircuit },
            { name: 'Reports & Analytics',   href: '/admin/reports',        icon: PieChart },
          ],
        },
        {
          name: 'System',
          items: [
            { name: 'Communications', href: '/admin/communication', icon: MessageSquare },
            { name: 'Security & Logs', href: '/admin/security',     icon: Shield },
            { name: 'Settings',        href: '/admin/settings',     icon: Settings },
          ],
        },
      ];
  }
};

// ─── Layout ───────────────────────────────────────────────────────────────────
export function ErpLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { role } = useAuth();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!role) return null;
  const sidebarGroups = getSidebarGroupsForRole(role);
  const activeClass  = ROLE_ACTIVE[role];
  const activeIcon   = ROLE_ICON_ACTIVE[role];
  const logoGradient = ROLE_LOGO[role];
  const dashboardHref = `/${role.toLowerCase()}/dashboard`;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5">
          <Link href={dashboardHref} className="flex items-center gap-3">
            <motion.div
              key={role}
              initial={{ rotate: -90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${logoGradient} shadow-lg`}
            >
              <School className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <p className="text-base font-bold leading-none text-slate-900 dark:text-white">CampusCore</p>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">School Management</p>
            </div>
          </Link>
          <button
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <nav>
            <AnimatePresence mode="wait">
              <motion.div
                key={role}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6"
              >
                {sidebarGroups.map((group) => (
                  <div key={group.name}>
                    <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
                      {group.name}
                    </p>
                    <div className="flex flex-col gap-0.5">
                      {group.items.map((item) => {
                        const isActive =
                          pathname === item.href ||
                          (item.href !== '/admin' && pathname?.startsWith(item.href + '/'));
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                              isActive
                                ? activeClass
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {mounted ? (
                              <item.icon
                                className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                                  isActive ? activeIcon : 'text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400'
                                }`}
                                size={18}
                              />
                            ) : (
                              <div className="h-4.5 w-4.5 shrink-0" />
                            )}
                            {item.name}
                            {isActive && (
                              <motion.div
                                layoutId="sidebar-active-dot"
                                className={`ml-auto h-1.5 w-1.5 rounded-full ${activeIcon.replace('text-', 'bg-').split(' ')[0]}`}
                              />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </nav>
        </div>

        {/* Sidebar footer – version tag */}
        <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 px-5 py-3">
          <p className="text-[10px] text-slate-400 dark:text-slate-600 text-center">
            CampusCore · Secure role portal
          </p>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="relative flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
          <AnimatePresence mode="wait">
            <motion.div
              key={role + pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

