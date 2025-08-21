// src/components/profile/ProfilePage.tsx
"use client";

import React, { useEffect, useState } from "react";
import { getCurrentUser, getCurrentUserLocal, logout, type User } from "@/logic/authLocal";

export default function ProfilePage({ onLogout }: { onLogout?: () => void }) {
  // ✅ init sinkron dari localStorage (bukan Promise)
  const [user, setUser] = useState<User | null>(() => getCurrentUserLocal());
  const [loading, setLoading] = useState(true);

  // ✅ verifikasi session ke server setelah mount (async)
  useEffect(() => {
    let alive = true;
    (async () => {
      const u = await getCurrentUser(); // Promise → aman di effect
      if (alive) setUser(u);
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

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
          Kamu belum login.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-800">
      <div className="bg-white/90 rounded-lg p-8 shadow-md min-w-[340px] text-center">
        <h2 className="text-xl font-bold mb-2">Profile</h2>

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
          onClick={async () => {
            await logout();
            onLogout?.();
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
