// components/profile/ProfileAvatar.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout } from "@/logic/authLocal";

const ProfileIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="8" r="4"></circle>
        <path d="M4 20c0-4 4-7 8-7s8 3 8 7"></path>
    </svg>
);

const ProfileAvatar: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState<{ username: string; email: string } | null>(null);
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Ambil user info dari localStorage saat mount
    useEffect(() => {
        setUser(getCurrentUser());
    }, []);

    // Klik luar untuk nutup dropdown
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    const handleLogout = () => {
        logout();
        setOpen(false);
        window.location.reload(); // Simple reset ke Home setelah logout
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className="flex items-center justify-center rounded-full hover:bg-yellow-400/10 transition"
                aria-label="Profile"
                onClick={() => setOpen(v => !v)}
                tabIndex={0}
            >
                <ProfileIcon className="text-yellow-400" />
            </button>
            {open && user && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white text-black z-50 border border-yellow-200 animate-fadeIn">
                    <div className="px-4 py-3 border-b border-yellow-100">
                        <div className="font-bold text-base">{user.username}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                    <button
                        className="w-full px-4 py-3 text-left hover:bg-yellow-50 transition text-red-600 font-semibold rounded-b-lg"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            )}
            <style>{`
                @keyframes fadeIn {
                  0% { opacity: 0; transform: translateY(-6px);}
                  100% { opacity: 1; transform: none;}
                }
                .animate-fadeIn { animation: fadeIn 0.15s linear; }
            `}</style>
        </div>
    );
};

export default ProfileAvatar;
