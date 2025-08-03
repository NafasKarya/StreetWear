'use client';
import React, { useEffect, useState } from "react";

const categories = [
  "T-SHIRTS", "TOPS / JERSEYS", "SWEATSHIRTS", "JACKETS",
  "KNITWEAR", "BOTTOMS", "SHORTS", "DENIM",
  "HATS", "BAGS", "COMBOS", "ACCESSORIES", "WOMENS"
];

// Komponen Logo 3D
const SidebarLogo3D = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    import('@google/model-viewer'); // Import HANYA di client!
  }, []);

  if (!isClient) return <div className="h-[130px]" />;

  return (
    <div className="flex flex-col items-center w-full pt-0 mt-0 mb-2">
      <div className="flex justify-center items-center">
        <model-viewer
          src="/matrix/base.glb"
          camera-controls
          camera-orbit="-90deg 80deg 5m"
          auto-rotate
          rotation="0deg 90deg 0deg"
          style={{ width: "130px", height: "130px" }}
          exposure="1"
          interaction-prompt="none"
          background-color="#000000"
          disable-zoom
          disable-pan
        ></model-viewer>
      </div>
    </div>
  );
};

const SidebarNav = ({ onLinkClick }: { onLinkClick?: () => void }) => (
  <nav>
    <ul className="space-y-3">
      {categories.map((category) => (
        <li key={category}>
          <a
            href="#"
            onClick={onLinkClick}
            className="block text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors duration-200"
          >
            {category}
          </a>
        </li>
      ))}
    </ul>
  </nav>
);

const SidebarCategoryLogo = ({ onLinkClick }: { onLinkClick?: () => void }) => (
  <>
    <SidebarLogo3D />
    <div className="w-full">
      <SidebarNav onLinkClick={onLinkClick} />
    </div>
  </>
);

export default SidebarCategoryLogo;
