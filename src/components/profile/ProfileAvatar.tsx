"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout } from "@/logic/authLocal";

type UIUser = { username?: string; email: string; role?: "admin" | "user" };

const ProfileIcon = ({
  size = 28,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="8" r="4"></circle>
    <path d="M4 20c0-4 4-7 8-7s8 3 8 7"></path>
  </svg>
);

const ProfileAvatar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UIUser | null>(null);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const u = (await getCurrentUser()) as UIUser | null;
      setUser(u);
    })();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setOpen(false);
      router.replace("/login");
      router.refresh();
    }
  };

  const displayName =
    user?.username ||
    (user?.role === "admin" ? "Admin" : (user?.email?.split("@")[0] ?? "User"));

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center justify-center rounded-full hover:bg-yellow-400/10 transition pointer-events-auto"
        aria-label="Profile"
        onClick={() => setOpen((v) => !v)}
      >
        <ProfileIcon className="text-yellow-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white text-black z-[60] border border-yellow-200 animate-fadeIn">
          {user ? (
            <>
              <div className="px-4 py-3 border-b border-yellow-100">
                <div className="font-bold text-base">{displayName}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>

              <button
                type="button"
                className="w-full px-4 py-3 text-left hover:bg-yellow-50 transition rounded-b-none"
                onClick={() => {
                  setOpen(false);
                  router.push("/profile");
                }}
              >
                Lihat Profil
              </button>

              <button
                type="button"
                className="w-full px-4 py-3 text-left hover:bg-yellow-50 transition text-red-600 font-semibold rounded-b-lg"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-yellow-100">
                <div className="font-bold text-base">Belum login</div>
                <div className="text-xs text-gray-500">Silakan login untuk mengakses profil</div>
              </div>
              <button
                type="button"
                className="w-full px-4 py-3 text-left hover:bg-yellow-50 transition rounded-b-lg"
                onClick={() => {
                  setOpen(false);
                  router.push("/login");
                }}
              >
                Login
              </button>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn { 0% { opacity: 0; transform: translateY(-6px);} 100% { opacity: 1; transform: none;} }
        .animate-fadeIn { animation: fadeIn 0.15s linear; }
      `}</style>
    </div>
  );
};

export default ProfileAvatar;
