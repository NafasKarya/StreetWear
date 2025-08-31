// loading.tsx
"use client";
import React from "react";

const LoadingPage: React.FC = () => (
  <div className="w-full min-h-screen flex flex-col items-center justify-center bg-black text-white select-none">
    {/* SVG Spinner dengan efek gradient */}
    <svg
      className="animate-spin mb-7"
      width={54}
      height={54}
      viewBox="0 0 54 54"
      fill="none"
      style={{ color: "#fff" }}
    >
      <circle
        cx="27"
        cy="27"
        r="23"
        stroke="url(#spin-gradient)"
        strokeWidth="7"
        strokeLinecap="round"
        className="opacity-60"
      />
      <defs>
        <linearGradient id="spin-gradient" x1="0" y1="0" x2="54" y2="54">
          <stop stopColor="#fff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
        </linearGradient>
      </defs>
    </svg>
    <div className="text-xl font-bold tracking-widest text-white/80">
      Loading Page
      <span className="animate-pulse ml-1">…</span>
    </div>
  </div>
);

export default LoadingPage;
