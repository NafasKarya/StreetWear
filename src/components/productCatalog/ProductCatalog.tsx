import React, { useState } from "react";
import SidebarCategoryLogo from "../sidebar/SidebarCategoryLogo";
import DetailProduct from "./DetailPorduct";
import Marquee from "../marqueeBanner/Marquee";


// Icon Close (untuk MobileMenu)
const FiX = ({ size = 28, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

interface Product {
  id: number;
  name: string;
  price: string;
  imageUrl: string;
}

const products: Product[] = [
  { id: 1, name: 'CREST ARCH TRACK JACKET [BLACK]', price: 'Rp1.950.000', imageUrl: 'https://i.pinimg.com/1200x/1e/a0/f6/1ea0f62df0669837081ed5bd9d285b80.jpg' },
  { id: 2, name: 'CREST ARCH TRACK PANT [BLACK]', price: 'Rp1.800.000', imageUrl: 'https://i.pinimg.com/1200x/51/d0/07/51d00783bc9220a4053a60dd407c267a.jpg' },
  { id: 3, name: 'PANELED RUGBY [RED]', price: 'Rp1.700.000', imageUrl: 'https://i.pinimg.com/736x/2d/98/61/2d98612f88f42b32ad322cbcca1de825.jpg' },
  { id: 4, name: 'LEATHER RACER [BLACK]', price: 'Rp6.800.000', imageUrl: 'https://i.pinimg.com/1200x/e9/df/5a/e9df5ad7799b6733bacfdec3640acc85.jpg' },
  { id: 5, name: '4STARZ ALCATRAZ T-SHIRT [SKY]', price: 'Rp570.000', imageUrl: 'https://i.pinimg.com/1200x/69/71/1d/69711d074b05a22f54899a65828c9bfd.jpg' },
  { id: 6, name: '4STARZ SKIRT [SKY]', price: 'Rp1.050.000', imageUrl: 'https://i.pinimg.com/1200x/bc/66/c0/bc66c0e325a998df25957c0e2897f574.jpg' },
];

const ProductCard = ({ name, price, imageUrl, onClick }: Product & { onClick: () => void }) => (
  <div className="group cursor-pointer" onClick={onClick}>
    <div className="bg-neutral-900 overflow-hidden rounded-xl aspect-[4/5] sm:aspect-[3/4] md:aspect-square min-h-[200px] sm:min-h-[260px] md:min-h-[230px] transition-all duration-300 group-hover:shadow-lg group-hover:shadow-yellow-500/10">
      <img src={imageUrl} alt={name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
    </div>
    <div className="text-center mt-4 px-2">
      <p className="text-sm text-gray-300 tracking-wider uppercase">{name}</p>
      <p className="mt-1 text-base text-white tracking-wider">{price}</p>
    </div>
  </div>
);

const MobileMenu = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) => {
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

const FourteenProduct = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Kalau user pilih produk, tampilkan detail produk
  if (selectedProduct) {
    return (
      <DetailProduct
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
      />
    );
  }

  return (
    <div className="bg-black min-h-screen text-gray-300 font-mono">
      {/* TIDAK ADA HEADER DI SINI */}

      {/* MARQUEE */}
      <Marquee />

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="container mx-auto px-4 sm:px-8 pt-0 pb-8">
        <div className="flex flex-row gap-12 items-start mt-8 pt-0">
          <aside className="w-1/6 pr-4 hidden md:flex flex-col items-center pt-0 mt-0 sticky top-28">
            <SidebarCategoryLogo />
          </aside>
          <main className="w-full md:w-5/6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 sm:gap-x-8 sm:gap-y-16">
              {products.map((product, index) => (
                <ProductCard
                  key={`${product.id}-${index}`}
                  {...product}
                  onClick={() => setSelectedProduct(product)}
                />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default FourteenProduct;
