// components/VideoBackground.tsx
"use client";
import React from "react";

const VideoBackground = () => (
  <video
    className="absolute inset-0 w-full h-full object-cover z-0"
    src="/assets/videos/splash.mp4"
    autoPlay
    loop
    muted
    playsInline
    preload="auto"
  />
);

export default VideoBackground;
