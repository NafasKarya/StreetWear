"use client";
import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminLogoutStore } from "@/store/admin/auth/useAdminLogoutStore";
import { Loader2, User2 } from "lucide-react";

interface AdminHeaderProps {
  greeting: string;
  timeWIB: string;
}

export default function AdminHeader({ greeting, timeWIB }: AdminHeaderProps) {
  const router = useRouter();
  const { logout, loading: logoutLoading, error: logoutError } = useAdminLogoutStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // **ROUTE EDIT PROFILE KE /admins/auth/profile**
  const handleGoToEditProfile = useCallback(() => {
    router.push("/admins/auth/profile");
  }, [router]);

  const handleLogout = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admins/auth/login");
      return;
    }

    const success = await logout(token);
    if (success) {
      localStorage.removeItem("token");
      localStorage.setItem("logoutSuccess", "true");
      setShowLogoutModal(true);
      setTimeout(() => {
        setShowLogoutModal(false);
        router.push("/admins/auth/login");
      }, 3000);
    } else {
      alert(logoutError || "Logout gagal. Silakan coba lagi.");
    }
  }, [logout, logoutError, router]);

  return (
    <>
      <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl px-6 py-5 shadow-lg">
        {greeting && (
          <p className="text-lg font-semibold text-emerald-300 mb-1">
            {greeting}
          </p>
        )}
        <h2 className="text-3xl font-black uppercase tracking-[0.25em]">
          Admin Dashboard
        </h2>
        <p className="text-xs text-zinc-300 mt-2 tracking-widest uppercase">
          Manage Drops · Minimal / Glass / Precise
        </p>
        {timeWIB && (
          <p className="text-sm text-emerald-400 mt-3">🕒 {timeWIB} WIB</p>
        )}
      </div>
      <div className="flex gap-3">
        {/* Edit Profile */}
        <button
          type="button"
          onClick={handleGoToEditProfile}
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold uppercase tracking-widest text-sm border border-blue-400/40 text-blue-300 hover:bg-blue-400/10 active:scale-95 transition"
        >
          <User2 className="h-4 w-4" /> Edit Profile
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={logoutLoading}
          className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold uppercase tracking-widest text-sm border border-red-400/40 text-red-300 hover:bg-red-400/10 active:scale-95 transition ${
            logoutLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {logoutLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Logging out...
            </>
          ) : (
            "Logout"
          )}
        </button>
      </div>

      {/* Modal Logout Sukses */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-gradient-to-br from-white/90 to-white/70 text-black px-10 py-8 rounded-2xl shadow-2xl border border-white/40 animate-scaleUp">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400 animate-pulse">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h3 className="text-xl font-extrabold uppercase tracking-wide text-emerald-600">
                Logout Berhasil
              </h3>
              <p className="text-sm text-gray-700">
                Anda akan diarahkan ke halaman login...
              </p>
            </div>
            <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 rounded-b-2xl animate-progress" />
          </div>
        </div>
      )}
    </>
  );
}
