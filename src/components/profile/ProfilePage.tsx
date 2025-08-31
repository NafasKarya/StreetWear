// src/components/profile/ProfilePage.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getCurrentUser, getCurrentUserLocal, logout, type User } from "@/logic/authLocal";

type Props = { onLogout?: () => void };

export default function ProfilePage({ onLogout }: Props) {
  // Ambil user dari localStorage (sinkron)
  const [user, setUser] = useState<User | null>(() => getCurrentUserLocal());
  const [loading, setLoading] = useState(true);

  // Verifikasi session ke server
  useEffect(() => {
    let alive = true;
    (async () => {
      const u = await getCurrentUser();
      if (alive) {
        // Jangan update state kalau value sama (minor optimasi)
        setUser((prev) => (prev?.email === u?.email && prev?.username === u?.username ? prev : u));
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Optimized logout handler
  const handleLogout = useCallback(async () => {
    await logout();
    onLogout?.();
    setUser(null);
  }, [onLogout]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-800">
        <div className="text-neutral-300">Memuat profil...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-800">
        <div className="bg-white/90 rounded-lg p-8 shadow-md min-w-[340px] text-center text-black">
          Kamu belum login.sas
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-800">
      <div className="bg-white/90 rounded-lg p-8 shadow-md min-w-[340px] text-center">
        <h2 className="text-xl font-bold mb-2 text-black">Profile</h2>
        <div className="mb-3 text-black font-medium">
          Username:
          <br />
          <span className="text-blue-700">{user.username ?? "—"}</span>
        </div>
        <div className="mb-6 text-black font-medium">
          Email:
          <br />
          <span className="text-blue-700">{user.email}</span>
        </div>
        <button
          className="px-6 py-2 rounded bg-red-700 text-white font-bold hover:bg-red-800"
          onClick={handleLogout}
          disabled={loading}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
