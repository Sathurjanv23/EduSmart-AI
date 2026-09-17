"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [cardTransform, setCardTransform] = useState(
    "perspective(1400px) rotateX(0deg) rotateY(0deg) scale(1)"
  );

  useEffect(() => {
    const img = new window.Image();
    img.src = "/logo.png";

    img.onload = () => {
      setLogoLoaded(true);

      setTimeout(() => {
        setShowSplash(false);
      }, 3200);
    };

    img.onerror = () => {
      setTimeout(() => {
        setShowSplash(false);
      }, 3200);
    };
  }, []);

  const handleSplashMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { currentTarget, clientX, clientY } = e;
    const rect = currentTarget.getBoundingClientRect();

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const rotateY = (x / rect.width - 0.5) * 12;
    const rotateX = (y / rect.height - 0.5) * -12;

    setCardTransform(
      `perspective(1400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
    );
  };

  const handleSplashMouseLeave = () => {
    setCardTransform(
      "perspective(1400px) rotateX(0deg) rotateY(0deg) scale(1)"
    );
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden bg-[radial-gradient(circle_at_top,_#10214d_0%,_#060b18_40%,_#02040b_75%,_#000000_100%)] text-white">
        {/* Background layers */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08),transparent_45%)]" />
        <div className="absolute left-1/2 top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[140px] animate-pulse" />
        <div className="absolute left-[8%] top-[15%] h-[260px] w-[260px] rounded-full bg-sky-500/10 blur-[120px] animate-pulse" />
        <div className="absolute right-[10%] bottom-[10%] h-[280px] w-[280px] rounded-full bg-indigo-500/10 blur-[130px] animate-pulse" />
        <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Stars */}
        <div className="star star-1" />
        <div className="star star-2" />
        <div className="star star-3" />
        <div className="star star-4" />
        <div className="star star-5" />
        <div className="star star-6" />
        <div className="star star-7" />
        <div className="star star-8" />
        <div className="star star-9" />
        <div className="star star-10" />
        <div className="star star-11" />
        <div className="star star-12" />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
          <div
            className="group relative w-full max-w-4xl overflow-hidden rounded-[38px] border border-white/10 bg-white/[0.08] px-6 py-10 md:px-12 md:py-14 shadow-[0_25px_90px_rgba(0,0,0,0.55)] backdrop-blur-3xl"
            onMouseMove={handleSplashMouseMove}
            onMouseLeave={handleSplashMouseLeave}
            style={{
              transform: cardTransform,
              transformStyle: "preserve-3d",
              transition: "transform 180ms ease-out",
            }}
          >
            <div className="pointer-events-none absolute inset-0 rounded-[38px] bg-[linear-gradient(135deg,rgba(255,255,255,0.10),rgba(255,255,255,0.02),rgba(56,189,248,0.06))]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
            <div className="pointer-events-none absolute -left-20 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 top-1/3 h-40 w-40 rounded-full bg-indigo-400/10 blur-3xl" />

            <div className="relative flex flex-col items-center text-center">
              {/* Logo system */}
              <div className="relative mb-8 mt-2 flex h-[260px] w-[260px] items-center justify-center">
                <div className="absolute h-[260px] w-[260px] rounded-full bg-cyan-400/10 blur-3xl animate-pulse" />
                <div className="absolute h-[250px] w-[250px] rounded-full border border-cyan-300/15 animate-spin-slowest" />
                <div className="absolute h-[220px] w-[220px] rounded-full border border-sky-300/20 animate-spin-slow" />
                <div className="absolute h-[190px] w-[190px] rounded-full border border-indigo-300/20 animate-spin-reverse" />
                <div className="absolute h-[240px] w-[240px] rounded-full border-[3px] border-transparent border-t-cyan-300 border-r-sky-400/80 animate-spin-fast shadow-[0_0_30px_rgba(34,211,238,0.22)]" />
                <div className="absolute h-[170px] w-[170px] rounded-full border-2 border-transparent border-b-cyan-200/80 border-l-indigo-300/70 animate-spin-reverse-fast" />
                <div className="absolute h-[230px] w-[230px] rounded-full border border-cyan-300/10 animate-ping-slow" />

                <div className="relative z-20 flex h-[130px] w-[130px] items-center justify-center rounded-full border border-white/15 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.28),rgba(255,255,255,0.05),rgba(15,23,42,0.7))] shadow-[0_0_45px_rgba(34,211,238,0.25),inset_0_0_30px_rgba(255,255,255,0.08)] backdrop-blur-2xl animate-logo-float">
                  <div className="absolute inset-[8px] rounded-full border border-cyan-200/10" />
                  <Image
                    src="/logo.png"
                    alt="SMS Logo"
                    width={72}
                    height={72}
                    priority
                    className="relative z-10 object-contain drop-shadow-[0_0_18px_rgba(34,211,238,0.55)] animate-logo-entry"
                  />
                </div>
              </div>

              <h1 className="animate-title-reveal bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent md:text-7xl">
                CampusCore
              </h1>

              <p className="animate-fade-up mt-4 text-xs uppercase tracking-[0.55em] text-slate-400 md:text-sm">
                Smart • Secure • Modern
              </p>

              <p className="animate-fade-up-delay mt-8 text-lg text-slate-200 md:text-2xl">
                {logoLoaded
                  ? "Launching premium experience..."
                  : "Preparing immersive intro..."}
              </p>

              <div className="mt-8 w-full max-w-[520px]">
                <div className="relative h-3 overflow-hidden rounded-full border border-white/10 bg-white/10 shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <div className="absolute inset-y-0 left-0 w-40 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 shadow-[0_0_25px_rgba(34,211,238,0.65)] animate-loading-premium" />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 animate-bounce [animation-delay:0ms]" />
                <span className="h-2.5 w-2.5 rounded-full bg-sky-300 animate-bounce [animation-delay:150ms]" />
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-300 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .star {
            position: absolute;
            border-radius: 9999px;
            background: rgba(255, 255, 255, 0.92);
            box-shadow: 0 0 18px rgba(34, 211, 238, 0.4);
            animation: twinkle 4s ease-in-out infinite;
          }

          .star-1 { width: 3px; height: 3px; left: 8%; top: 14%; animation-delay: 0s; }
          .star-2 { width: 4px; height: 4px; left: 18%; top: 30%; animation-delay: 0.5s; }
          .star-3 { width: 2px; height: 2px; left: 76%; top: 16%; animation-delay: 1s; }
          .star-4 { width: 3px; height: 3px; left: 90%; top: 24%; animation-delay: 1.5s; }
          .star-5 { width: 4px; height: 4px; left: 12%; top: 78%; animation-delay: 2s; }
          .star-6 { width: 2px; height: 2px; left: 30%; top: 84%; animation-delay: 2.5s; }
          .star-7 { width: 3px; height: 3px; left: 72%; top: 76%; animation-delay: 0.7s; }
          .star-8 { width: 4px; height: 4px; left: 84%; top: 66%; animation-delay: 1.3s; }
          .star-9 { width: 2px; height: 2px; left: 48%; top: 12%; animation-delay: 2.2s; }
          .star-10 { width: 3px; height: 3px; left: 58%; top: 88%; animation-delay: 1.8s; }
          .star-11 { width: 2px; height: 2px; left: 64%; top: 24%; animation-delay: 0.9s; }
          .star-12 { width: 4px; height: 4px; left: 24%; top: 62%; animation-delay: 1.9s; }

          @keyframes twinkle {
            0%, 100% {
              opacity: 0.25;
              transform: scale(1);
            }
            50% {
              opacity: 1;
              transform: scale(1.9);
            }
          }

          @keyframes logoEntry {
            0% {
              opacity: 0;
              transform: scale(0.55) rotateY(25deg) rotateX(18deg);
              filter: blur(8px);
            }
            60% {
              opacity: 1;
              transform: scale(1.08) rotateY(0deg) rotateX(0deg);
              filter: blur(0px);
            }
            100% {
              opacity: 1;
              transform: scale(1);
              filter: blur(0px);
            }
          }

          @keyframes logoFloat {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          @keyframes titleReveal {
            0% {
              opacity: 0;
              transform: translateY(28px) scale(0.95);
              letter-spacing: 0.18em;
            }
            100% {
              opacity: 1;
              transform: translateY(0px) scale(1);
              letter-spacing: 0.01em;
            }
          }

          @keyframes fadeUp {
            0% {
              opacity: 0;
              transform: translateY(16px);
            }
            100% {
              opacity: 1;
              transform: translateY(0px);
            }
          }

          @keyframes loadingPremium {
            0% {
              transform: translateX(-160%);
            }
            100% {
              transform: translateX(420%);
            }
          }

          @keyframes spinSlow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes spinReverse {
            from {
              transform: rotate(360deg);
            }
            to {
              transform: rotate(0deg);
            }
          }

          @keyframes spinFast {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes spinReverseFast {
            from {
              transform: rotate(360deg);
            }
            to {
              transform: rotate(0deg);
            }
          }

          @keyframes pingSlow {
            0% {
              transform: scale(0.94);
              opacity: 0.35;
            }
            70%, 100% {
              transform: scale(1.08);
              opacity: 0;
            }
          }

          .animate-logo-entry {
            animation: logoEntry 1.3s ease forwards;
          }

          .animate-logo-float {
            animation: logoFloat 3.2s ease-in-out infinite;
          }

          .animate-title-reveal {
            animation: titleReveal 1s ease forwards;
          }

          .animate-fade-up {
            opacity: 0;
            animation: fadeUp 0.9s ease forwards;
            animation-delay: 0.35s;
          }

          .animate-fade-up-delay {
            opacity: 0;
            animation: fadeUp 0.9s ease forwards;
            animation-delay: 0.6s;
          }

          .animate-loading-premium {
            animation: loadingPremium 1.8s ease-in-out infinite;
          }

          .animate-spin-slow {
            animation: spinSlow 14s linear infinite;
          }

          .animate-spin-slowest {
            animation: spinSlow 22s linear infinite;
          }

          .animate-spin-reverse {
            animation: spinReverse 10s linear infinite;
          }

          .animate-spin-fast {
            animation: spinFast 4s linear infinite;
          }

          .animate-spin-reverse-fast {
            animation: spinReverseFast 6s linear infinite;
          }

          .animate-ping-slow {
            animation: pingSlow 3s ease-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="SMS Logo"
              width={50}
              height={50}
              priority
              className="object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-emerald-400">CampusCore</h1>
              <p className="text-xs text-slate-300">Modern School Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-white/10 bg-white/10 px-5 py-2.5 text-sm font-medium transition hover:bg-white/15"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-indigo-300">
              Modern Education Platform
            </p>

            <h2 className="text-4xl font-bold leading-tight md:text-6xl">
              Manage Your
              <span className="text-emerald-400"> School </span>
              Smarter
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              A professional school management system for administrators,
              teachers, students, and parents to manage academics, attendance,
              marks, and announcements in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Login Now
              </Link>

              <Link
                href="/register"
                className="rounded-2xl border border-white/10 bg-white/10 px-6 py-3 font-medium transition hover:bg-white/15"
              >
                Create Account
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-2xl font-bold text-cyan-300">4</p>
                <p className="mt-1 text-sm text-slate-300">User Portals</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-2xl font-bold text-emerald-300">24/7</p>
                <p className="mt-1 text-sm text-slate-300">Access</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-2xl font-bold text-pink-300">100%</p>
                <p className="mt-1 text-sm text-slate-300">Organized</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-2xl font-bold text-violet-300">Easy</p>
                <p className="mt-1 text-sm text-slate-300">Management</p>
              </div>
            </div>
          </div>

          {/* Hero Card */}
          <div className="group rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_80px_rgba(34,211,238,0.12)] md:p-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 transition duration-300 hover:scale-[1.03] hover:bg-white/15">
                <h3 className="text-lg font-semibold text-indigo-300">Admin</h3>
                <p className="mt-2 text-sm text-slate-300">
                  Manage students, announcements, and system activities.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 transition duration-300 hover:scale-[1.03] hover:bg-white/15">
                <h3 className="text-lg font-semibold text-emerald-300">
                  Teacher
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  Mark attendance, add marks, and track class records.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 transition duration-300 hover:scale-[1.03] hover:bg-white/15">
                <h3 className="text-lg font-semibold text-pink-300">Student</h3>
                <p className="mt-2 text-sm text-slate-300">
                  View attendance, marks, and school announcements.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 transition duration-300 hover:scale-[1.03] hover:bg-white/15">
                <h3 className="text-lg font-semibold text-violet-300">
                  Parent
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  Monitor child performance, marks, and updates.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 p-5">
              <h3 className="text-xl font-bold">One Platform. Multiple Roles.</h3>
              <p className="mt-2 text-slate-300">
                Secure login and smooth access for every user in the school.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Portal Section */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-indigo-300">
            Explore Portals
          </p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            Access Your Dashboard
          </h2>
          <p className="mt-3 text-slate-300">
            Login based on your role and access the features designed for you.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/login"
            className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/15"
          >
            <h3 className="text-2xl font-bold text-indigo-300">Admin Portal</h3>
            <p className="mt-3 text-slate-300">
              Student management, announcements, and administration tools.
            </p>
          </Link>

          <Link
            href="/teacher"
            className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/15"
          >
            <h3 className="text-2xl font-bold text-emerald-300">
              Teacher Portal
            </h3>
            <p className="mt-3 text-slate-300">
              Attendance, marks, and classroom academic records.
            </p>
          </Link>

          <Link
            href="/student"
            className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/15"
          >
            <h3 className="text-2xl font-bold text-pink-300">Student Portal</h3>
            <p className="mt-3 text-slate-300">
              Check your attendance, marks, and latest school updates.
            </p>
          </Link>

          <Link
            href="/parent"
            className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/15"
          >
            <h3 className="text-2xl font-bold text-violet-300">Parent Portal</h3>
            <p className="mt-3 text-slate-300">
              Follow your child’s progress and school announcements.
            </p>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl md:p-10">
          <h2 className="text-3xl font-bold md:text-4xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Login to your existing account or register as a new user and start
            managing your school activities professionally.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Go to Login
            </Link>

            <Link
              href="/register"
              className="rounded-2xl border border-white/10 bg-white/10 px-6 py-3 font-medium transition hover:bg-white/15"
            >
              Go to Register
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-10 border-t border-white/10 bg-white/5">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-sm text-slate-400">
          © 2026 CampusCore · Secure School Management
        </div>
      </footer>
    </div>
  );
}
