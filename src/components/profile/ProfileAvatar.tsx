// src/components/profile/ProfileAvatar.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

// Minimal, all-white street icon (smaller)
const StreetProfileIcon = ({ size = 26, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fff"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-5 4-8 8-8s8 3 8 8" />
  </svg>
);

const ProfileAvatar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Pure white icon button */}
      <button
        type="button"
        aria-label="Open Profile"
        className="rounded-full border border-white bg-white/5 p-1.5 hover:bg-white/10 focus:outline-none transition-colors duration-100"
        onClick={() => setOpen((v) => !v)}
        style={{ backdropFilter: "blur(6px)" }}
      >
        <StreetProfileIcon />
      </button>

      {/* Dropdown glass box */}
      {open && (
        <div
          className="absolute right-0 mt-3 w-60 max-w-[90vw] rounded-xl bg-white/20 border border-white/30 overflow-hidden animate-profilefade backdrop-blur-xl"
          style={{
            WebkitBackdropFilter: "blur(12px)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex flex-col items-center py-5 px-4">
            <span className="uppercase text-base font-extrabold text-white tracking-[0.17em] mb-1.5">
              Not signed in
            </span>
            <span className="text-[11px] text-white/70 font-mono text-center mb-4 leading-snug">
              Sign in to access your <span className="text-white font-bold">profile</span> & members-only features.
            </span>
            <button
              className="bg-white/90 text-black font-bold text-xs px-5 py-2 rounded-full tracking-[0.12em] uppercase hover:bg-white active:bg-white/80 transition-colors duration-100 w-full"
              onClick={() => {
                setOpen(false);
                router.push("/login");
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes profilefade { 
          0% { opacity: 0; transform: translateY(-10px) scale(0.97);}
          100% { opacity: 1; transform: none;}
        }
        .animate-profilefade { animation: profilefade 0.18s cubic-bezier(.46,1.54,.45,.97); }
      `}</style>
    </div>
  );
};

export default ProfileAvatar;
