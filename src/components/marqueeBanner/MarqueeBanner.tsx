// components/Marquee.tsx

import React from "react";

const text = "AUDIOSCIENCE NOW - LIMITED QUANTITIES AVAILABLE IN ALL FORMATS";
const repeat = 10;

const Marquee: React.FC = () => {
  return (
    <div className="w-full overflow-hidden bg-[#1a1a1a] border-b border-[#404040] py-4 h-[30px]">
      <div className="flex animate-marquee whitespace-nowrap will-change-transform">
        {Array.from({ length: repeat }).map((_, i) => (
          <span
            key={i}
            className="text-white text-[12px] uppercase tracking-[1px] px-8 font-sans"
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
