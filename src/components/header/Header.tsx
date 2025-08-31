import React, { useState, useEffect, useRef, useCallback } from "react";

import ProfileAvatar from "../profile/ProfileAvatar";
import { FiMenu } from "react-icons/fi";
import { getCurrentUser } from "@/logic/authLocal";
import AuthButtons from "./AuthButtons";
import Search from "./Search";
import { useDebouncedValue } from "@/hooks/useDebouncedValue"; // <-- Tambahkan ini
import Cart from "../cart/Cart";

interface HeaderProps {
    onMenuClick?: () => void;
    onCheckout?: () => void;
    onSearch?: (q: string) => void;
}

const AUTO_TYPE_TEXTS = [
    "lagi cari baju A nih",
    "mau street jacket?",
    "test: hoodie hitam oversized",
    "nyari celana, ya?",
    "Tulis apa aja di sini…"
] as const;

const Header: React.FC<HeaderProps> = ({ onMenuClick, onCheckout, onSearch }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Auto-type state
    const [autoText, setAutoText] = useState("");
    const [autoIdx, setAutoIdx] = useState(0);
    const [autoPhase, setAutoPhase] = useState<"typing" | "deleting">("typing");
    const [typing, setTyping] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // --- DEBOUNCE SEARCH ---
    const debouncedSearch = useDebouncedValue(searchQuery, 400); // 400ms, bisa kamu adjust

    useEffect(() => {
        if (debouncedSearch.trim() === "") return;
        onSearch?.(debouncedSearch); // Panggil search hanya pas debounce selesai
    }, [debouncedSearch, onSearch]);
    // --- END DEBOUNCE ---

    // Auth sync
    useEffect(() => {
        setIsLoggedIn(!!getCurrentUser());
        const listener = () => setIsLoggedIn(!!getCurrentUser());
        window.addEventListener("storage", listener);
        return () => window.removeEventListener("storage", listener);
    }, []);

    // Auto-typing effect
    useEffect(() => {
        if (typing || searchQuery) {
            if (autoText !== "") setAutoText("");
            return;
        }
        const fullText = AUTO_TYPE_TEXTS[autoIdx];
        let timeout: ReturnType<typeof setTimeout>;

        if (autoPhase === "typing") {
            if (autoText.length < fullText.length) {
                timeout = setTimeout(() => setAutoText(fullText.slice(0, autoText.length + 1)), 48);
            } else {
                timeout = setTimeout(() => setAutoPhase("deleting"), 900);
            }
        } else {
            if (autoText.length > 0) {
                timeout = setTimeout(() => setAutoText(fullText.slice(0, autoText.length - 1)), 28);
            } else {
                timeout = setTimeout(() => {
                    setAutoPhase("typing");
                    setAutoIdx(i => (i + 1) % AUTO_TYPE_TEXTS.length);
                }, 300);
            }
        }
        return () => clearTimeout(timeout);
    }, [autoText, autoPhase, autoIdx, typing, searchQuery]);

    // Handlers di-memo agar stabil
    const handleInputChange = useCallback((val: string) => {
        setSearchQuery(val);
        setTyping(val.length > 0);
        // onSearch?() DIHAPUS dari sini! Debounce yang handle.
    }, []);

    const handleFocus = useCallback(() => setTyping(true), []);
    const handleBlur = useCallback(() => setTyping(false), []);
    const handleFocusSearch = useCallback(() => inputRef.current?.focus(), []);

    return (
        <header className="sticky top-0 z-30 bg-black text-yellow-400 font-mono">
            <div className="container mx-auto px-4 sm:px-8">
                {/* Desktop Header */}
                <div className="hidden md:flex items-center justify-between h-20">
                    <div>
                        <span className="text-2xl font-bold tracking-wide text-yellow-400 select-none">
                            Fourteendency
                        </span>
                    </div>
                    <div className="flex items-center gap-8 text-base">
                        <Cart onCheckout={onCheckout} />
                        <Search
                            value={searchQuery}
                            onChange={handleInputChange}
                            placeholder={autoText || "Search"}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onClickIcon={handleFocusSearch}
                            inputRef={inputRef}
                        />
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
                        <div className="flex-1 flex justify-center">
                            <Search
                                value={searchQuery}
                                onChange={handleInputChange}
                                placeholder={autoText || "Search"}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                onClickIcon={handleFocusSearch}
                                inputRef={inputRef}
                                className="w-full text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                            <Cart onCheckout={onCheckout} />
                            {!isLoggedIn ? (
                                <AuthButtons isMobile />
                            ) : (
                                <ProfileAvatar />
                            )}
                        </div>
                        <button onClick={onMenuClick} aria-label="Open menu" className="ml-2">
                            <FiMenu size={28} className="text-white" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default React.memo(Header);
