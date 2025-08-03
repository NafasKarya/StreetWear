import React from "react";

// Marquee INFINTY, pakai 2x span (loop mulus)
const marqueeText = "AUDIOSCIENCE NOW - LIMITED QUANTITIES AVAILABLE IN ALL FORMATS";
const separator = " \u00A0\u00A0 • \u00A0\u00A0 ";
const fullText = Array(10).fill(marqueeText).join(separator);

const Marquee: React.FC = () => (
  <div className="bg-black overflow-hidden whitespace-nowrap border-y border-neutral-800 select-none">
    <div className="inline-block animate-marquee py-3 min-w-full">
      <span className="text-sm font-semibold text-gray-200 tracking-widest uppercase">
        {fullText}
      </span>
      <span className="text-sm font-semibold text-gray-200 tracking-widest uppercase ml-8">
        {fullText}
      </span>
    </div>
  </div>
);

export default Marquee;
