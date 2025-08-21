// components/SplashScreen.tsx
"use client";

import React from "react";

const SplashScreen: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-yellow-400">
      {/* --- Checkerboard background --- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(45deg, #fff 25%, transparent 25%), linear-gradient(-45deg, #fff 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #fff 75%), linear-gradient(-45deg, transparent 75%, #fff 75%)",
          backgroundSize: "24px 24px",
          backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0",
          mixBlendMode: "overlay",
        }}
      />

      {/* --- Gradient glow blobs --- */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-yellow-400/30 via-fuchsia-500/30 to-cyan-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-cyan-400/30 via-emerald-400/30 to-yellow-400/30 blur-3xl" />

      {/* --- Center content --- */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        {/* spinner ring */}
        <div className="mb-8 grid place-items-center">
          <div className="h-20 w-20 rounded-full border-2 border-zinc-700 border-t-yellow-400 animate-spin" />
        </div>

        {/* brand / wordmark */}
        <h1 className="select-none text-center font-extrabold tracking-widest">
          <span className="bg-gradient-to-r from-yellow-400 via-white to-yellow-400 bg-clip-text text-4xl sm:text-5xl md:text-6xl text-transparent drop-shadow-[0_0_18px_rgba(250,204,21,0.35)]">
            FOURTEENDENCY
          </span>
        </h1>

        {/* subcopy */}
        <p className="mt-2 text-sm text-zinc-300/80">
          loading the next drop… stay laced 🖤
        </p>

        {/* pill badge */}
        <div className="mt-5 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-1 text-[11px] font-semibold tracking-wider text-yellow-300">
          STREETWEAR MODE • LIVE
        </div>
      </div>

      {/* --- bottom marquee --- */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
        <div className="whitespace-nowrap py-3 text-[12px] font-bold tracking-widest text-yellow-400/70">
          <span className="animate-marquee inline-block">
            ✦ FOURTEENDENCY — STREETWEAR SUPPLY — NEW DROP — LIMITED RUN — NO RESTOCK — COP NOW — JKT EDITION — KEEP IT FRESH ✦{" "}
          </span>
          <span className="animate-marquee inline-block">
            ✦ FOURTEENDENCY — STREETWEAR SUPPLY — NEW DROP — LIMITED RUN — NO RESTOCK — COP NOW — JKT EDITION — KEEP IT FRESH ✦{" "}
          </span>
        </div>
      </div>

      {/* --- local styles for marquee --- */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 12s linear infinite;
          will-change: transform;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
