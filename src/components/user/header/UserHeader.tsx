"use client";
import React, { useState, useEffect } from "react";
import { User2, LogOut, Loader2 } from "lucide-react";
import { useUserLoggoutStore } from "@/store/user/auth/useUserLoggoutStore";
import { useRouter } from "next/navigation";

export default function UserHeader() {
  const { isLoading, logoutUser } = useUserLoggoutStore();
  const router = useRouter();

  const [loadingEditProfile, setLoadingEditProfile] = useState(false);
  const [userName, setUserName] = useState<string>("User");
  const [greeting, setGreeting] = useState<string>("");

  // Ambil nama user dari localStorage setiap mount (biar fresh pas reload/after login/register)
  useEffect(() => {
    const name = localStorage.getItem("userName") || "User";
    setUserName(name);

    // Greeting sekalian di sini aja
    const hour = new Date().getHours();
    let greet = "Hello";
    if (hour < 12) greet = "Good morning";
    else if (hour < 18) greet = "Good afternoon";
    else greet = "Good evening";
    setGreeting(`${greet}, ${name}!`);
  }, []);

  // Handler Logout
  const handleLogout = async () => {
    await logoutUser();
    setTimeout(() => {
      router.push("/user/auth/login");
    }, 800);
  };

  // Handler Edit Profile
  const handleEditProfile = () => {
    setLoadingEditProfile(true);
    setTimeout(() => {
      router.push("/user/auth/profile");
    }, 600);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
      {/* Box Greeting */}
      <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl px-6 py-5 shadow-lg">
        {greeting && (
          <p className="text-lg font-semibold text-emerald-300 mb-1">
            {greeting}
          </p>
        )}
<h2 className="text-3xl font-black uppercase tracking-[0.25em]">
  Your Fits, Your Rules
</h2>
<p className="text-xs text-zinc-300 mt-2 tracking-widest uppercase">
  Minimal effort, maximal drip.
</p>

      </div>

      {/* Action Buttons */}
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
