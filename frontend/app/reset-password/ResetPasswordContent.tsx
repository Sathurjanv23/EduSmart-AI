"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowLeft, CheckCircle2, RefreshCw, School, Shield } from 'lucide-react';
import { resetPassword as resetPasswordApi } from "../services/authService";

export default function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validatePassword = (value: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-]).{8,}$/.test(value);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or expired link. Please request a new one.");
      return;
    }

    if (!validatePassword(newPassword)) {
      setError("Password must be 8+ chars with uppercase, lowercase, number & special char.");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordApi({ token, newPassword: newPassword.trim() });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-700">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-rose-500/5 blur-[120px] dark:bg-rose-900/10" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-blue-500/5 blur-[120px] dark:bg-blue-900/10" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[440px] px-6"
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-white dark:border-slate-800/50 shadow-2xl rounded-[3rem] p-8 sm:p-12">
          
          {/* Header */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center mb-6 shadow-xl shadow-rose-500/20">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">New Password</h1>
            <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">Anti-Gravity Security</p>
          </div>

          <AnimatePresence mode="wait">
            {!success ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onSubmit={handleResetPassword} 
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Secure Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 pl-11 pr-4 py-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500 transition-all font-medium"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs font-bold text-rose-500 px-1 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl border border-rose-100 dark:border-rose-800/50">
                    {error}
                  </p>
                )}

                <button 
                  disabled={loading}
                  className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Update Password"}
                </button>

                <button 
                  type="button"
                  onClick={() => router.push("/login")}
                  className="w-full text-center text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to Login
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500 mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Success!</h2>
                <p className="text-sm text-slate-500 font-medium">Your password has been updated. Redirecting you to login...</p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>

    </div>
  );
}