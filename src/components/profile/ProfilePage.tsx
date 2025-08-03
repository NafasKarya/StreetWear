'use client';
import React from "react";
import { getCurrentUser, logout } from "@/logic/authLocal";

export default function ProfilePage({ onLogout }: { onLogout?: () => void }) {
  const user = getCurrentUser();
  if (!user) return null; // tidak akan terjadi, kecuali dipanggil manual

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-800">
      <div className="bg-white/90 rounded-lg p-8 shadow-md min-w-[340px] text-center">
        <h2 className="text-xl font-bold mb-2">Profile</h2>
        <div className="mb-3 text-black font-medium">Username:<br /><span className="text-blue-700">{user.username}</span></div>
        <div className="mb-6 text-black font-medium">Email:<br /><span className="text-blue-700">{user.email}</span></div>
        <button
          className="px-6 py-2 rounded bg-red-700 text-white font-bold hover:bg-red-800"
          onClick={() => { logout(); onLogout && onLogout(); }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
