"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaTshirt } from "react-icons/fa";

type Props = {
  onContinue?: () => void;
};

const SplashScreen: React.FC<Props> = ({ onContinue }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    if (onContinue) onContinue();
    router.push("/user/auth/login");
  };

  useEffect(() => {
    if (loading) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        setLoading(true);
        if (onContinue) onContinue();
        router.push("/user/auth/login");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading, onContinue, router]);

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* IMAGE BACKGROUND */}
      <Image
        src="/assets/images/splash.jpg"
        alt="Background"
        fill
        priority
        className="object-cover"
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/70 z-10" />

      {/* Center content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen w-full px-4">
        
        {/* LOGO IMAGE */}
        <Image
          src="/assets/images/logo.png" // ganti sesuai path logo lo di /public
          alt="Fourteendency Logo"
          width={120}
          height={120}
          className="mb-4"
        />

        <h1 className="select-none text-center font-black uppercase leading-tight w-full whitespace-pre-line sm:whitespace-nowrap text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-normal sm:tracking-[.13em] md:tracking-[.18em]">
          <span className="text-white w-full block">FOURTEENDENCY</span>
        </h1>

        <p className="mt-2 text-center block text-xs xs:text-sm sm:text-base text-[#FF8A00] font-bold uppercase tracking-wide sm:tracking-wider w-full max-w-full sm:max-w-md mx-auto">
          DROP SEASON — STREET ARCHIVE
        </p>

        <div className="mt-4 sm:mt-6 inline-flex items-center gap-1 sm:gap-2 rounded border-2 border-[#FF8A00] px-2 sm:px-4 py-1 text-[10px] sm:text-xs font-semibold tracking-widest text-[#FF8A00] bg-black uppercase shadow-[0_1px_5px_0_rgba(0,0,0,0.12)]">
          <FaTshirt className="inline mr-1 sm:mr-2 text-xs sm:text-base" /> Fourteendency · EST. 2025
        </div>

        <button
          className="mt-8 sm:mt-10 px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-[#FF8A00] text-[#FF8A00] font-extrabold rounded uppercase tracking-wider text-base sm:text-lg shadow bg-transparent hover:bg-[#FF8A00] hover:text-black transition-all duration-150 active:scale-95 w-full max-w-xs"
          onClick={handleClick}
          disabled={loading}
          style={{
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Loading..." : "ENTER"}
        </button>

        {loading && (
          <span className="mt-3 text-[#FF8A00] text-xs sm:text-sm font-bold animate-pulse">
            Loading...
          </span>
        )}
      </div>

      {/* bottom marquee */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden z-30 border-t border-[#FF8A00]/30">
        <div className="whitespace-nowrap py-2 sm:py-3 text-[10px] xs:text-[11px] sm:text-[13px] font-extrabold tracking-[.12em] sm:tracking-[.17em] text-[#FF8A00] uppercase font-mono opacity-80">
          <span className="animate-marquee inline-block">
            ✧ NEW DROP ✧ FOURTEENDENCY ✧ HYPE SUPPLY ✧ NO RESTOCK ✧ TRAVIS VIBES ✧ GEN Z ONLY ✧ PLAYBOY CARTI MOOD ✧ COP BEFORE GONE ✧{" "}
          </span>
          <span className="animate-marquee inline-block">
            ✧ NEW DROP ✧ FOURTEENDENCY ✧ HYPE SUPPLY ✧ NO RESTOCK ✧ TRAVIS VIBES ✧ GEN Z ONLY ✧ PLAYBOY CARTI MOOD ✧ COP BEFORE GONE ✧{" "}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 10s linear infinite;
          will-change: transform;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
