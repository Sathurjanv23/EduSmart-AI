'use client';

import { useState, useEffect, useRef } from "react";
import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Search, Settings, LogOut, User, ChevronDown,
  GraduationCap, Presentation, Users, Shield, Menu,
  Moon, Sun, Globe, X, CheckCircle, AlertCircle, Info, Clock
} from 'lucide-react';
import { useRole, Role } from './RoleProvider';
import { useTheme } from 'next-themes';
import { logout } from '@/app/services/authService';
import { notificationService, Notification as AppNotification } from '@/app/services/notificationService';

// ────────── Role Config ──────────
const ROLE_CONFIG: Record<Role, { label: string; icon: any; gradient: string; accent: string }> = {
  STUDENT: { label: 'Student', icon: GraduationCap, gradient: 'from-emerald-500 to-teal-600', accent: 'bg-emerald-500' },
  TEACHER: { label: 'Teacher', icon: Presentation, gradient: 'from-blue-500 to-indigo-600', accent: 'bg-blue-500' },
  PARENT:  { label: 'Parent',  icon: Users,         gradient: 'from-purple-500 to-violet-600', accent: 'bg-purple-500' },
  ADMIN:   { label: 'Admin',   icon: Shield,         gradient: 'from-rose-500 to-pink-600',    accent: 'bg-rose-500' },
};

const NotifIcon = ({ type }: { type: string }) => {
  if (type === 'success') return <CheckCircle className="h-4 w-4 text-emerald-500" />;
  if (type === 'warning') return <AlertCircle className="h-4 w-4 text-amber-500" />;
  if (type === 'error') return <X className="h-4 w-4 text-rose-500" />;
  return <Info className="h-4 w-4 text-blue-500" />;
};

// ────────── Breadcrumb helper ──────────
function useBreadcrumb() {
  const pathname = usePathname() || '/';
  const segments = pathname.split('/').filter(Boolean);
  return segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    href: '/' + segments.slice(0, i + 1).join('/'),
  }));
}

// ────────── Time Ago Helper ──────────
function timeAgo(date: string) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
}

// ────────── Main Navbar ──────────
export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { role, setRole } = useRole();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const breadcrumbs = useBreadcrumb();

  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
  const [user, setUser] = React.useState<any>(null);
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem("auth-user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchNotifications(parsedUser.id || parsedUser.email);
    }
  }, []);

  const fetchNotifications = async (userId: string) => {
    try {
      const data = await notificationService.getNotifications(userId);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const cfg = ROLE_CONFIG[role];
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    if (!user) return;
    try {
      await notificationService.markAllAsRead(user.id || user.email);
      setNotifications(n => n.map(x => ({ ...x, read: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // close dropdowns on outside click
  React.useEffect(() => {
    const handler = () => { setNotifOpen(false); setProfileOpen(false); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 transition-all duration-300">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <motion.div
          key={role}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`hidden sm:flex items-center gap-2 rounded-full bg-gradient-to-r ${cfg.gradient} px-3 py-1.5 text-xs font-bold text-white shadow-md`}
        >
          <cfg.icon className="h-3.5 w-3.5" />
          {cfg.label} Mode
        </motion.div>

        <nav className="hidden md:flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.href}>
              {i > 0 && <span className="text-slate-300 dark:text-slate-700">/</span>}
              <Link
                href={crumb.href}
                className={`hover:text-slate-900 dark:hover:text-white transition-colors ${i === breadcrumbs.length - 1 ? 'text-slate-800 dark:text-white font-medium' : ''}`}
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <AnimatePresence>
          {searchOpen ? (
            <motion.div
              key="search-open"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-2">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                />
                <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
                  <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="search-closed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Search className="h-5 w-5" />
            </motion.button>
          )}
        </AnimatePresence>

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {mounted ? (
            theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
          ) : (
            <div className="h-4 w-4" />
          )}
        </button>

        <div className="relative" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="relative h-9 w-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white"
              >
                {unreadCount}
              </motion.span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-12 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-900 dark:text-white">Notifications</span>
                  <button onClick={markAllRead} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Mark all read</button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                  {mounted && notifications.map(n => (
                    <div key={n.id} className={`flex gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!n.read ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}>
                      <div className="mt-0.5 shrink-0"><NotifIcon type={n.type} /></div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${!n.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{n.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 truncate">{n.message}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Clock className="h-3 w-3" />{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.read && <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />}
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800">
                  <button className="w-full text-center text-xs text-blue-600 dark:text-blue-400 hover:underline py-1">View all notifications</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${cfg.gradient} text-white text-sm font-bold shadow-md`}>
              {role.charAt(0)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-800 dark:text-white leading-none">{user?.name || `${cfg.label} User`}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{user?.role || cfg.label}</p>
            </div>
            <ChevronDown className={`hidden md:block h-3.5 w-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-12 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
              >
                <div className={`bg-gradient-to-r ${cfg.gradient} px-4 py-4`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white text-lg font-bold">
                      {role.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{user?.name || `${cfg.label} User`}</p>
                      <p className="text-xs text-white/70">{user?.email || 'user@school.edu'}</p>
                    </div>
                  </div>
                </div>

                <div className="px-2 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Switch Role</p>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {(Object.entries(ROLE_CONFIG) as [Role, typeof cfg][]).map(([r, c]) => (
                      <button
                        key={r}
                        onClick={() => {
                          setRole(r);
                          setProfileOpen(false);
                          router.push(`/${r.toLowerCase()}/dashboard`);
                        }}
                        className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${role === r ? `bg-gradient-to-r ${c.gradient} text-white` : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                      >
                        <c.icon className="h-3.5 w-3.5" />
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="px-2 py-2">
                  <div className="flex flex-col gap-0.5">
                    <Link
                      href={`/${role.toLowerCase()}/dashboard`}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Account Info
                    </Link>
                    <Link
                      href="/admin/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      System Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>

                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Session Active</span>
                  <div className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
