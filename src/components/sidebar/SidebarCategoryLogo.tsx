// src/components/sidebar/SidebarCategoryLogo.tsx
"use client";

import React, { useEffect, useState } from "react";
import ModelViewer from "@/components/ModelViewer";

// --- 3D Logo (client-only) ---
const SidebarLogo3D: React.FC = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    void import("@google/model-viewer");
  }, []);

  if (!isClient) return <div className="h-[130px]" />;

  return (
    <div className="flex flex-col items-center w-full pt-0 mt-0 mb-2" suppressHydrationWarning>
      <div className="flex justify-center items-center">
        <ModelViewer
          src="/matrix/3D LOGO FOURTENZ REVISI.glb"
          camera-controls
          camera-orbit="-90deg 80deg 5m"
          auto-rotate
          rotation="0deg 90deg 0deg"
          style={{ width: "230px", height: "230px" }}
          exposure="1"
          interaction-prompt="none"
          background-color="#000000"
          disable-zoom
          disable-pan
        />
      </div>
    </div>
  );
};

const SidebarNav = ({
  categories,
  onLinkClick,
}: {
  categories: string[];
  onLinkClick?: (cat?: string) => void;
}) => {
  // ⬇️ kalau kosong, jangan render apapun
  if (!Array.isArray(categories) || categories.length === 0) return null;

  return (
    <nav>
      <ul className="space-y-3">
        {categories.map((category) => (
          <li key={category} className="flex items-center group">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onLinkClick?.(category);
              }}
              className="block text-xs uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors duration-200"
              title={category}
            >
              {category}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const SidebarCategoryLogo = ({
  categories = [],
  onLinkClick,
}: {
  categories?: string[];
  onLinkClick?: (cat?: string) => void;
}) => {
  return (
    <>
      <SidebarLogo3D />
      {/* ⬇️ hanya render nav jika ada kategori */}
      {Array.isArray(categories) && categories.length > 0 && (
        <div className="w-full">
          <SidebarNav categories={categories} onLinkClick={onLinkClick} />
        </div>
      )}
    </>
  );
};

export default SidebarCategoryLogo;
