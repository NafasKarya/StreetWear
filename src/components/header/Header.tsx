import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cart from "../cart/Cart";
import CheckoutIcons from "../checkout/CheckoutIcons";
import ProfileAvatar from "../profile/ProfileAvatar"; // --- Tambahan Import

// --- Custom SVG Icons ---
const FiMenu = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
);

const SearchIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

import { getCurrentUser } from "@/logic/authLocal";
import AuthButtons from "./AuthButtons";

// Tambahkan di interface HeaderProps
interface HeaderProps {
    onMenuClick?: () => void;
    onCheckout?: () => void;
    onSearch?: (q: string) => void; // <--- Tambahan
}


const Header: React.FC<HeaderProps> = ({ onMenuClick, onCheckout, onSearch }) => {

    const [searchQuery, setSearchQuery] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const user = getCurrentUser();
        setIsLoggedIn(!!user);
        const listener = () => setIsLoggedIn(!!getCurrentUser());
        window.addEventListener("storage", listener);
        return () => window.removeEventListener("storage", listener);
    }, []);

    return (
        <header className="sticky top-0 z-30 bg-black text-yellow-400 font-mono">
            <div className="container mx-auto px-4 sm:px-8">
                {/* Desktop Header */}
                <div className="hidden md:flex items-center justify-between h-20">
                    <div>
                        <span className="text-2xl font-bold tracking-wide text-yellow-400 select-none">Fourteendency</span>
                    </div>
                    <div className="flex items-center gap-8 text-base">
                        <Cart onCheckout={onCheckout} />
                        <div className="flex items-center gap-3 ml-3">
                            <SearchIcon className="text-yellow-400" />
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        onSearch?.(e.target.value); // <--- panggil prop onSearch tiap kali berubah
                                    }}
                                    placeholder="Search"
                                    className="bg-transparent border-b-2 border-yellow-400 focus:border-yellow-300 text-yellow-400 placeholder-yellow-400/60 outline-none w-48 transition-all"
                                />
                            </div>
                        </div>
                        {!isLoggedIn ? (
                            <AuthButtons />
                        ) : (
                            <div className="ml-5">
                                <ProfileAvatar />
                            </div>
                        )}
                    </div>
                </div>
                {/* Mobile Header */}
                <div className="md:hidden">
                    <div className="flex items-center justify-between h-20">
                        <a href="#" aria-label="Search"><SearchIcon /></a>
                        <div className="flex items-center justify-center flex-1" />
                        <div className="flex items-center gap-2">
                            <div className="mr-3 flex items-center">
                                <Cart onCheckout={onCheckout} />
                            </div>
                            {!isLoggedIn ? (
                                <AuthButtons isMobile />
                            ) : (
                                <ProfileAvatar />
                            )}
                        </div>
                    </div>
                    <div className="flex justify-center pb-4">
                        <button onClick={onMenuClick} aria-label="Open menu"><FiMenu /></button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
