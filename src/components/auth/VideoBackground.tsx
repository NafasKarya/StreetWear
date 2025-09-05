// components/VideoBackground.tsx
"use client";
import React from "react";

const VideoBackground = () => (
  <video
    className="absolute inset-0 w-full h-full object-cover"
    src="https://nafaskarya-bucket.oss-ap-southeast-5.aliyuncs.com/videos/Jakarta_Streetwear_Nightlife_Cinematic_Scene.mp4"
    autoPlay
    loop
    muted
    playsInline
    preload="auto"
  />
);

export default VideoBackground;
