import React from "react";
import SidebarCategoryLogo from "../sidebar/SidebarCategoryLogo";

const FiX = ({ size = 28, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const MobileMenuProduct = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black p-8 md:hidden animate-fade-in">
      <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors" aria-label="Tutup menu">
        <FiX size={28} />
      </button>
      <div className="mt-16">
        <SidebarCategoryLogo onLinkClick={onClose} />
      </div>
    </div>
  );
};

export default MobileMenuProduct;
