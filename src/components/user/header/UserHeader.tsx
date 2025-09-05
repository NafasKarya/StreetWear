"use client";
import React, { useState } from "react";
import { User2, LogOut, Loader2 } from "lucide-react";
import { useUserLoggoutStore } from "@/store/user/auth/useUserLoggoutStore";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function UserHeader() {
  const { isLoading, logoutUser } = useUserLoggoutStore();
  const router = useRouter();

  const [loadingEditProfile, setLoadingEditProfile] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    setTimeout(() => {
      router.push("/user/auth/login");
    }, 800);
  };

  const handleEditProfile = () => {
    setLoadingEditProfile(true);
    setTimeout(() => {
      router.push("/user/auth/profile");
    }, 600);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
      <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl px-6 py-5 shadow-lg flex flex-col items-center justify-center">
        <Image
          src="/assets/images/logo.png"
          alt="Brand Logo"
          width={80}
          height={80}
          className="object-contain mb-3"
        />
        <h2 className="text-3xl font-black uppercase tracking-[0.25em] text-white text-center">
          FOURTEENDENCY
        </h2>
        <p className="text-xs text-zinc-300 mt-2 tracking-widest uppercase text-center">
          Minimal effort, maximal drip.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleEditProfile}
          disabled={loadingEditProfile}
          className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold uppercase tracking-widest text-sm border border-blue-400/40 text-blue-300 hover:bg-blue-400/10 active:scale-95 transition
            ${loadingEditProfile ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {loadingEditProfile ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <User2 className="h-4 w-4" /> Edit Profile
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold uppercase tracking-widest text-sm border border-red-400/40 text-red-300 hover:bg-red-400/10 active:scale-95 transition"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  );
}
