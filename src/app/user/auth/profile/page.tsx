"use client";
import React, { useState } from "react";
import { Loader2 } from "lucide-react";

export default function UserEditProfilePage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [repeatPassword, setRepeatPassword] = useState<string>("");

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-6 bg-cover bg-center"
      style={{ backgroundImage: "url('/assets/images/profile.jpg')" }}
    >
      {/* Dark neon overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-emerald-900/40 to-black/90 backdrop-blur-sm"></div>

      <form
        className="relative w-full max-w-lg rounded-[2rem] border border-emerald-500/20 bg-black/40 backdrop-blur-2xl shadow-[0_0_60px_-10px_rgba(16,185,129,0.8)] p-12 flex flex-col gap-8 animate-fadeIn"
      >
        {/* Title */}
        <h2 className="text-4xl font-black text-center uppercase tracking-widest bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]">
          User Profile
        </h2>

        {/* Inputs */}
        <div className="flex flex-col gap-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="New Email"
            autoComplete="off"
            className="px-5 py-4 rounded-xl bg-black/40 border border-emerald-500/20 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition shadow-lg"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
            autoComplete="new-password"
            className="px-5 py-4 rounded-xl bg-black/40 border border-emerald-500/20 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition shadow-lg"
          />

          <input
            type="password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            placeholder="Repeat Password"
            autoComplete="new-password"
            className="px-5 py-4 rounded-xl bg-black/40 border border-emerald-500/20 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition shadow-lg"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-xl font-extrabold bg-gradient-to-r from-emerald-400 to-emerald-600 text-black uppercase tracking-wider shadow-lg shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition"
          >
            <Loader2 className="h-5 w-5 animate-spin hidden" /> Save Changes
          </button>

          <button
            type="button"
            className="w-full px-5 py-4 rounded-xl font-bold bg-white/5 hover:bg-white/10 border border-white/20 text-zinc-300 uppercase tracking-wide transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
