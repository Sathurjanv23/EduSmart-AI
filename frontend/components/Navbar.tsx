"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Bell,
  CheckCircle,
  ChevronDown,
  Clock,
  GraduationCap,
  Info,
  LogOut,
  Menu,
  Moon,
  Presentation,
  Settings,
  Shield,
  Sun,
  User,
  Users,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Role } from "@/app/services/authService";
import { notificationService, Notification as AppNotification } from "@/app/services/notificationService";
import { useAuth } from "./AuthProvider";

const ROLE_CONFIG: Record<Role, { label: string; icon: typeof GraduationCap; gradient: string }> = {
  STUDENT: { label: "Student", icon: GraduationCap, gradient: "from-emerald-500 to-teal-600" },
  TEACHER: { label: "Teacher", icon: Presentation, gradient: "from-blue-500 to-indigo-600" },
  PARENT: { label: "Parent", icon: Users, gradient: "from-purple-500 to-violet-600" },
  ADMIN: { label: "Admin", icon: Shield, gradient: "from-rose-500 to-pink-600" },
};

function NotifIcon({ type }: { type: string }) {
  if (type === "success") return <CheckCircle className="h-4 w-4 text-emerald-500" />;
  if (type === "warning") return <AlertCircle className="h-4 w-4 text-amber-500" />;
  if (type === "error") return <X className="h-4 w-4 text-rose-500" />;
  return <Info className="h-4 w-4 text-blue-500" />;
}

function timeAgo(date: string) {
  const timestamp = new Date(date).getTime();
  if (!Number.isFinite(timestamp)) return "Recently";
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds >= 86_400) return `${Math.floor(seconds / 86_400)}d ago`;
  if (seconds >= 3_600) return `${Math.floor(seconds / 3_600)}h ago`;
  if (seconds >= 60) return `${Math.floor(seconds / 60)}m ago`;
  return "Just now";
}

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, role, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname() || "/";
  const [mounted, setMounted] = React.useState(false);
  const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
  const [notificationError, setNotificationError] = React.useState("");
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!user?.id) return;
    let active = true;
    notificationService.getNotifications(user.id)
      .then((data) => {
        if (active) setNotifications(data);
      })
      .catch((unknownError: unknown) => {
        if (active) setNotificationError(unknownError instanceof Error ? unknownError.message : "Notifications are unavailable.");
      });
    return () => { active = false; };
  }, [user?.id]);

  React.useEffect(() => {
    const closeMenus = () => { setNotifOpen(false); setProfileOpen(false); };
    document.addEventListener("click", closeMenus);
    return () => document.removeEventListener("click", closeMenus);
  }, []);

  if (!user || !role) return null;
  const config = ROLE_CONFIG[role];
  const breadcrumbs = pathname.split("/").filter(Boolean).map((segment, index, all) => ({
    label: segment.replace(/-/g, " ").replace(/^./, (letter) => letter.toUpperCase()),
    href: `/${all.slice(0, index + 1).join("/")}`,
  }));
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const dashboard = `/${role.toLowerCase()}/dashboard`;

  const markAllRead = async () => {
    if (!user.id || unreadCount === 0) return;
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    } catch (unknownError: unknown) {
      setNotificationError(unknownError instanceof Error ? unknownError.message : "Could not update notifications.");
    }
  };

  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onMenuClick} aria-label="Open navigation" className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <div className={`hidden items-center gap-2 rounded-full bg-gradient-to-r ${config.gradient} px-3 py-1.5 text-xs font-bold text-white shadow-md sm:flex`}>
          <config.icon className="h-3.5 w-3.5" /> {config.label}
        </div>
        <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1 text-sm text-slate-500 md:flex dark:text-slate-400">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              {index > 0 && <span aria-hidden="true">/</span>}
              <Link href={crumb.href} className="truncate hover:text-slate-900 dark:hover:text-white">{crumb.label}</Link>
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button type="button" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label="Toggle color theme" className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          {mounted && resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="relative" onClick={(event) => event.stopPropagation()}>
          <button type="button" onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }} aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`} className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unreadCount}</span>}
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 top-12 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900" aria-label="Notifications">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                  <span className="font-semibold">Notifications</span>
                  <button type="button" onClick={markAllRead} disabled={!unreadCount} className="text-xs text-blue-600 disabled:opacity-50 dark:text-blue-400">Mark all read</button>
                </div>
                <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
                  {notificationError && <p role="alert" className="p-4 text-sm text-rose-600 dark:text-rose-300">{notificationError}</p>}
                  {!notificationError && notifications.length === 0 && <p className="p-6 text-center text-sm text-slate-500">No notifications yet.</p>}
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`flex gap-3 px-4 py-3 ${notification.read ? "" : "bg-blue-50/50 dark:bg-blue-950/20"}`}>
                      <NotifIcon type={notification.type} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{notification.title}</p>
                        <p className="truncate text-xs text-slate-500">{notification.message}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400"><Clock className="h-3 w-3" />{timeAgo(notification.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" onClick={(event) => event.stopPropagation()}>
          <button type="button" onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }} aria-label="Open account menu" className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
            <span className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${config.gradient} text-sm font-bold text-white`}>{user.name.charAt(0).toUpperCase()}</span>
            <span className="hidden text-left md:block"><span className="block text-xs font-semibold">{user.name}</span><span className="block text-[10px] text-slate-400">{config.label}</span></span>
            <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 md:block" />
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 top-12 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                <div className={`bg-gradient-to-r ${config.gradient} px-4 py-4 text-white`}><p className="font-semibold">{user.name}</p><p className="truncate text-xs text-white/75">{user.email}</p></div>
                <div className="p-2">
                  <Link href={dashboard} onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"><User className="h-4 w-4" />My dashboard</Link>
                  {role === "ADMIN" && <Link href="/admin/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"><Settings className="h-4 w-4" />System settings</Link>}
                  <button type="button" onClick={signOut} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20"><LogOut className="h-4 w-4" />Sign out</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
