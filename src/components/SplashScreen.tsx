"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { FaTshirt } from "react-icons/fa";

const VideoBackground = dynamic(() => import("@/components/VideoBackground"), { ssr: false });

type Props = {
  onContinue?: () => void;
};

const SplashScreen: React.FC<Props> = ({ onContinue }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    if (onContinue) onContinue();
    // Auto redirect ke /user/auth/login
    router.push("/user/auth/login");
  };

  // === ENTER Key listener ===
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, onContinue, router]);

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* VIDEO BACKGROUND */}
      <VideoBackground />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/70 z-10" />

      {/* Center content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen w-full px-4">
        {/* brand/wordmark */}
        <h1 className="
          select-none text-center font-black uppercase leading-tight w-full
          whitespace-pre-line
          sm:whitespace-nowrap
          text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl
          tracking-normal sm:tracking-[.13em] md:tracking-[.18em]
          ">
          <span
            className="
              text-white
              w-full
              block
            "
            style={{
              wordBreak: "normal",
              overflowWrap: "normal",
            }}
          >
            FOURTEENDENCY
          </span>
        </h1>

        {/* sub tagline */}
        <p className="
          mt-2
          text-center
          block
          text-xs xs:text-sm sm:text-base
          text-yellow-400 font-bold uppercase
          tracking-wide sm:tracking-wider
          w-full max-w-full sm:max-w-md
          mx-auto
        ">
          DROP SEASON — STREET ARCHIVE
        </p>

        {/* badge */}
        <div className="mt-4 sm:mt-6 inline-flex items-center gap-1 sm:gap-2 rounded border-2 border-yellow-400 px-2 sm:px-4 py-1 text-[10px] sm:text-xs font-semibold tracking-widest text-yellow-400 bg-black uppercase shadow-[0_1px_5px_0_rgba(0,0,0,0.12)]">
          <FaTshirt className="inline mr-1 sm:mr-2 text-xs sm:text-base" /> Fourteendency · EST. 2025
        </div>

        {/* BUTTON ENTER/LOGIN */}
        <button
          className="
            mt-8 sm:mt-10
            px-6 sm:px-8 py-2.5 sm:py-3
            border-2 border-yellow-400
            text-yellow-400
            font-extrabold rounded
            uppercase tracking-wider
            text-base sm:text-lg
            shadow
            bg-transparent
            hover:bg-yellow-400 hover:text-black
            transition-all duration-150 active:scale-95
            w-full max-w-xs
          "
          onClick={handleClick}
          disabled={loading}
          style={{
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Loading..." : "ENTER"}
        </button>

        {/* Loading Text (kalau mau muncul di bawah tombol) */}
        {loading && (
          <span className="mt-3 text-yellow-400 text-xs sm:text-sm font-bold animate-pulse">
            Loading...
          </span>
        )}
      </div>

      {/* bottom marquee */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden z-30 border-t border-yellow-800/30">
        <div className="whitespace-nowrap py-2 sm:py-3 text-[10px] xs:text-[11px] sm:text-[13px] font-extrabold tracking-[.12em] sm:tracking-[.17em] text-yellow-400 uppercase font-mono opacity-80">
          <span className="animate-marquee inline-block">
            ✧ NEW DROP ✧ FOURTEENDENCY ✧ HYPE SUPPLY ✧ NO RESTOCK ✧ TRAVIS VIBES ✧ GEN Z ONLY ✧ PLAYBOY CARTI MOOD ✧ COP BEFORE GONE ✧{" "}
          </span>
          <span className="animate-marquee inline-block">
            ✧ NEW DROP ✧ FOURTEENDENCY ✧ HYPE SUPPLY ✧ NO RESTOCK ✧ TRAVIS VIBES ✧ GEN Z ONLY ✧ PLAYBOY CARTI MOOD ✧ COP BEFORE GONE ✧{" "}
          </span>
        </div>
      </div>

      {/* Marquee keyframes + mobile word-break */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 10s linear infinite;
          will-change: transform;
        }
        @media (max-width: 480px) {
          h1 {
            font-size: 1.6rem !important;
            letter-spacing: 0.04em !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
            white-space: normal !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
