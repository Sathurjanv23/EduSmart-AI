"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  loginUser, 
  signupUser, 
  verifyOtp, 
  resendOtp, 
  forgotPassword,
  saveToken 
} from "../services/authService";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, 
  Presentation, 
  Users, 
  Shield, 
  School, 
  ArrowLeft, 
  Mail, 
  Lock, 
  User, 
  ChevronRight,
  RefreshCw,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useRole, Role } from "@/components/RoleProvider";

type AuthView = "login" | "signup" | "otp" | "forgot" | "success";

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useRole();

  // Navigation state
  const [view, setView] = useState<AuthView>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRoleLocal] = useState("STUDENT");

  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpPurpose, setOtpPurpose] = useState<"REGISTER" | "LOGIN_2FA">("LOGIN_2FA");
  const [resendTimer, setResendTimer] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer logic for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Handle Login (Step 1)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser({ email, password });
      
      if (data.message === "OTP_SENT") {
        setOtpPurpose("LOGIN_2FA");
        setView("otp");
        setResendTimer(30);
      } else {
        // Direct login fallback (if 2FA was disabled for some reason)
        finalizeLogin(data);
      }
    } catch (err: any) {
      if (err.message === "EMAIL_NOT_VERIFIED") {
        setOtpPurpose("REGISTER");
        setView("otp");
        setResendTimer(30);
      } else {
        setError(err.message || "Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await signupUser({ 
        name, 
        email, 
        password, 
        role 
      });
      
      if (data.message === "OTP_SENT") {
        setOtpPurpose("REGISTER");
        setView("otp");
        setResendTimer(30);
      }
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Verification
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) return;

    setError("");
    setLoading(true);

    try {
      const data = await verifyOtp({ 
        email, 
        otp: otpString, 
        purpose: otpPurpose 
      });
      
      finalizeLogin(data);
    } catch (err: any) {
      setError(err.message || "Invalid OTP code");
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError("");
    try {
      await resendOtp({ email, purpose: otpPurpose });
      setResendTimer(30);
      setOtp(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP");
    }
  };

  // Handle Forgot Password
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await forgotPassword(email);
      setView("success");
    } catch (err: any) {
      setError(err.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  // Common finalize logic
  const finalizeLogin = (data: any) => {
    saveToken(data.token || "");
    localStorage.setItem("auth-user", JSON.stringify(data.user));
    const role = data.user.role.toLowerCase();
    setRole(data.user.role as Role);
    router.push(`/${role}/dashboard`);
  };

  // OTP Input logic
  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Anti-Gravity Animations
  const floatingVariant = {
    animate: {
      y: [0, -10, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    }
  };

  const pageTransition = {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 1.05, y: -10 },
    transition: { type: "spring", stiffness: 300, damping: 25 }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-700">
      
      {/* Dynamic Background */}
      <motion.div 
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[15%] -left-[10%] w-[80vw] h-[80vw] rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 blur-[120px] dark:from-blue-900/20 dark:to-indigo-900/20"
      />
      <motion.div 
        animate={{ rotate: -360, scale: [1, 1.2, 1] }}
        transition={{ duration: 220, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[15%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-tl from-emerald-500/10 to-cyan-500/10 blur-[100px] dark:from-emerald-900/15 dark:to-cyan-900/15"
      />

      <motion.div 
        variants={floatingVariant}
        animate="animate"
        className="relative z-10 w-full max-w-[440px] px-6"
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-white dark:border-slate-800/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] rounded-[3rem] p-8 sm:p-12 transition-all duration-500">
          
          {/* Brand Header */}
          <div className="flex flex-col items-center mb-10">
            <motion.div 
              whileHover={{ rotate: 180, scale: 1.1 }}
              className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center mb-4 shadow-2xl shadow-emerald-500/40"
            >
              <School className="w-8 h-8" />
            </motion.div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">EduSmart</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="h-px w-4 bg-slate-300 dark:bg-slate-700"></span>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-[0.2em] uppercase">Anti-Gravity Edition</p>
              <span className="h-px w-4 bg-slate-300 dark:bg-slate-700"></span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* LOGIN VIEW */}
            {view === "login" && (
              <motion.div key="login" {...pageTransition}>
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-1">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-2xl border-none bg-slate-100/50 dark:bg-slate-800/50 pl-11 pr-4 py-4 text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-2xl border-none bg-slate-100/50 dark:bg-slate-800/50 pl-11 pr-4 py-4 text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-semibold text-rose-500 px-1">
                      {error}
                    </motion.p>
                  )}

                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all mt-6"
                  >
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Enter Dashboard"}
                    {!loading && <ChevronRight className="w-4 h-4" />}
                  </motion.button>
                </form>

                <div className="mt-8 flex items-center justify-between px-2">
                  <button onClick={() => setView("signup")} className="text-sm font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Create Account
                  </button>
                  <button onClick={() => setView("forgot")} className="text-sm font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Reset Password
                  </button>
                </div>
              </motion.div>
            )}

            {/* SIGNUP VIEW */}
            {view === "signup" && (
              <motion.div key="signup" {...pageTransition}>
                <button onClick={() => setView("login")} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors">
                  <ArrowLeft className="w-3 h-3" /> BACK
                </button>
                <form className="space-y-4" onSubmit={handleSignup}>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" required placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-2xl border-none bg-slate-100/50 dark:bg-slate-800/50 pl-11 pr-4 py-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" required placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border-none bg-slate-100/50 dark:bg-slate-800/50 pl-11 pr-4 py-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border-none bg-slate-100/50 dark:bg-slate-800/50 pl-11 pr-4 py-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                  </div>
                  <div className="relative">
                    <select value={role} onChange={(e) => setRoleLocal(e.target.value)} className="w-full rounded-2xl border-none bg-slate-100/50 dark:bg-slate-800/50 px-5 py-4 text-slate-900 dark:text-white appearance-none focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium">
                      <option value="STUDENT">👨‍🎓 Student</option>
                      <option value="TEACHER">👩‍🏫 Teacher</option>
                      <option value="PARENT">👪 Parent</option>
                      <option value="ADMIN">👑 Admin</option>
                    </select>
                  </div>

                  {error && <p className="text-xs font-semibold text-rose-500 px-1">{error}</p>}

                  <motion.button whileTap={{ scale: 0.98 }} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all mt-6">
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : "Sign Up"}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* OTP VERIFICATION VIEW */}
            {view === "otp" && (
              <motion.div key="otp" {...pageTransition} className="text-center">
                <button onClick={() => setView("login")} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors mx-auto">
                  <ArrowLeft className="w-3 h-3" /> BACK
                </button>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verify Account</h2>
                  <p className="text-xs text-slate-500 mt-1">We sent a 6-digit code to <b>{email}</b></p>
                </div>

                <div className="flex justify-between gap-2 mb-8">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-12 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 text-center text-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  ))}
                </div>

                {error && <p className="text-xs font-semibold text-rose-500 mb-4">{error}</p>}

                <motion.button 
                  whileTap={{ scale: 0.98 }} 
                  disabled={loading || otp.join("").length < 6}
                  onClick={() => handleVerifyOtp()}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/20 disabled:opacity-50 transition-all mb-4"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : "Verify & Continue"}
                </motion.button>

                <div className="flex items-center justify-center gap-2 text-xs font-bold">
                  <span className="text-slate-400">Didn't get code?</span>
                  {resendTimer > 0 ? (
                    <span className="text-blue-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Resend in {resendTimer}s
                    </span>
                  ) : (
                    <button onClick={handleResend} className="text-blue-600 hover:underline">Resend Now</button>
                  )}
                </div>
              </motion.div>
            )}

            {/* FORGOT PASSWORD VIEW */}
            {view === "forgot" && (
              <motion.div key="forgot" {...pageTransition}>
                <button onClick={() => setView("login")} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors">
                  <ArrowLeft className="w-3 h-3" /> BACK
                </button>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recover Password</h2>
                  <p className="text-xs text-slate-500 mt-1">Enter your email to receive a reset link</p>
                </div>
                <form className="space-y-4" onSubmit={handleForgot}>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" required placeholder="Account Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border-none bg-slate-100/50 dark:bg-slate-800/50 pl-11 pr-4 py-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                  </div>
                  {error && <p className="text-xs font-semibold text-rose-500 px-1">{error}</p>}
                  <motion.button whileTap={{ scale: 0.98 }} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all">
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : "Send Reset Link"}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* SUCCESS VIEW */}
            {view === "success" && (
              <motion.div key="success" {...pageTransition} className="text-center">
                <div className="flex flex-col items-center py-6">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500 mb-6">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Check Your Email</h2>
                  <p className="text-sm text-slate-500 mt-3 px-4">We've sent the instructions to recover your account if it exists in our system.</p>
                  <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setView("login")} 
                    className="mt-10 px-8 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-all"
                  >
                    Back to Login
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Social Proof / Trust Badges */}
          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800/50 flex justify-center gap-8 text-slate-400 dark:text-slate-600 transition-colors">
            <motion.div whileHover={{ scale: 1.2, color: "#10b981" }}><GraduationCap className="w-5 h-5" /></motion.div>
            <motion.div whileHover={{ scale: 1.2, color: "#3b82f6" }}><Presentation className="w-5 h-5" /></motion.div>
            <motion.div whileHover={{ scale: 1.2, color: "#8b5cf6" }}><Users className="w-5 h-5" /></motion.div>
            <motion.div whileHover={{ scale: 1.2, color: "#f43f5e" }}><Shield className="w-5 h-5" /></motion.div>
          </div>

        </div>
      </motion.div>

      {/* Aesthetic Floating Footer Info */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
        <span>Cloud Sync Active</span>
        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Secure Session v2.0</span>
      </div>

    </div>
  );
}