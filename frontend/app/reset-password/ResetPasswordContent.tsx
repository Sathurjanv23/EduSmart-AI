"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");

  const validatePassword = (value: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-]).{8,}$/.test(value);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      alert("Invalid token");
      return;
    }

    if (!newPassword.trim()) {
      alert("New password is required");
      return;
    }

    if (!validatePassword(newPassword)) {
      alert(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
      );
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Reset failed");
      }

      alert(data.message || "Password reset successful");
      setNewPassword("");
      router.push("/login");
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 text-white shadow-2xl">
        <h1 className="mb-6 text-center text-3xl font-bold text-cyan-300">
          Reset Password
        </h1>

        <form onSubmit={handleResetPassword} className="space-y-5">
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-cyan-400"
          />

          <button
            type="submit"
            className="w-full rounded-xl bg-cyan-500 py-3 font-semibold text-slate-900 transition hover:bg-cyan-400"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}