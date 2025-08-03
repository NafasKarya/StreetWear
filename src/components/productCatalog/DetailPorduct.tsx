import React, { useState, useRef } from 'react';
import { useCart } from '../cart/CartContext';

const categories = [
  "NEW", "T-SHIRTS", "TOPS / JERSEYS", "SWEATSHIRTS", "JACKETS",
  "KNITWEAR", "BOTTOMS", "SHORTS", "DENIM",
  "HATS", "BAGS", "COMBOS", "ACCESSORIES", "WOMENS"
];

const ChevronLeft = (props: any) => (
  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);
const ChevronRight = (props: any) => (
  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

interface DetailProductProps {
  product: {
    id: number;
    name: string;
    price: string;
    imageUrl: string;
  };
  onBack: () => void;
}

export default function DetailProduct({ product, onBack }: DetailProductProps) {
  const [selectedSize, setSelectedSize] = useState<string>('S');
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const { addToCart } = useCart();

  const images = [product.imageUrl];
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handlePrev = () => setActiveIdx(idx => (idx === 0 ? images.length - 1 : idx - 1));
  const handleNext = () => setActiveIdx(idx => (idx === images.length === 1 ? 0 : idx + 1));
  const setIdx = (idx: number) => setActiveIdx(idx);

  // --- ANIMASI FLY TO CART ---
  const handleAddToCart = () => {
    // 1. Temukan posisi gambar produk
    const img = imgRef.current;
    const cart = document.getElementById('cart-icon');
    if (img && cart) {
      const imgRect = img.getBoundingClientRect();
      const cartRect = cart.getBoundingClientRect();

      // 2. Clone gambar produk
      const flyingImg = img.cloneNode(true) as HTMLImageElement;
      flyingImg.style.position = 'fixed';
      flyingImg.style.left = imgRect.left + 'px';
      flyingImg.style.top = imgRect.top + 'px';
      flyingImg.style.width = imgRect.width + 'px';
      flyingImg.style.height = imgRect.height + 'px';
      flyingImg.style.transition = 'all 0.7s cubic-bezier(.71,-0.04,.29,1.03)';
      flyingImg.style.zIndex = '9999';
      flyingImg.style.pointerEvents = 'none';
      document.body.appendChild(flyingImg);

      // 3. Pakai force reflow supaya animasi jalan
      // @ts-ignore
      flyingImg.offsetWidth;

      // 4. Animate ke cart
      flyingImg.style.left = cartRect.left + cartRect.width / 2 - imgRect.width / 4 + 'px';
      flyingImg.style.top = cartRect.top + cartRect.height / 2 - imgRect.height / 4 + 'px';
      flyingImg.style.width = imgRect.width / 2 + 'px';
      flyingImg.style.height = imgRect.height / 2 + 'px';
      flyingImg.style.opacity = '0.4';
      flyingImg.style.borderRadius = '30px';

      // 5. Hapus clone setelah animasi, dan tambahkan ke cart
      setTimeout(() => {
        document.body.removeChild(flyingImg);
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          size: selectedSize,
        });
      }, 700);
    } else {
      // Fallback: langsung add to cart kalau gagal ambil elemen
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        size: selectedSize,
      });
    }
  };

  return (
    <div className="bg-black text-yellow-400 min-h-screen font-mono p-4 md:p-8">
      <button onClick={onBack} className="mr-2 text-yellow-400 hover:text-white flex items-center font-bold mb-6 mt-2">
        <svg width={22} height={22} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>
        <span className="ml-1">Back</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="col-span-1">
          <nav className="flex flex-row flex-wrap lg:flex-col gap-2 text-sm mb-8">
            {categories.map(cat => (
              <a key={cat} href="#" className="hover:underline">{cat}</a>
            ))}
          </nav>
          <div className="flex flex-col gap-2 text-sm">
            <a href="#" className="hover:underline">NEWSLETTER</a>
            <a href="#" className="hover:underline">SHIPPING POLICY</a>
            <a href="#" className="hover:underline">TERMS OF SERVICE</a>
          </div>
        </aside>

        <main className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            <div className="relative w-full flex items-center justify-center">
              <button
                className="absolute left-0 text-2xl p-2 z-10"
                onClick={handlePrev}
                aria-label="Gambar Sebelumnya"
                type="button"
                disabled={images.length === 1}
                style={{ opacity: images.length === 1 ? 0.3 : 1 }}
              >
                <ChevronLeft />
              </button>
              <img
                ref={imgRef}
                src={images[activeIdx]}
                alt={product.name}
                className="w-full max-w-md object-cover transition-all duration-300"
                draggable={false}
              />
              <button
                className="absolute right-0 text-2xl p-2 z-10"
                onClick={handleNext}
                aria-label="Gambar Berikutnya"
                type="button"
                disabled={images.length === 1}
                style={{ opacity: images.length === 1 ? 0.3 : 1 }}
              >
                <ChevronRight />
              </button>
            </div>
            <div className="flex gap-4 mt-4">
              {images.map((img, idx) => (
                <img
                  key={img}
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className={`w-20 h-20 object-cover border-2 cursor-pointer ${idx === activeIdx ? 'border-yellow-400' : 'border-transparent'}`}
                  onClick={() => setIdx(idx)}
                  draggable={false}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
            <p className="text-xl">{product.price}</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-14 h-14 border-2 border-yellow-400 font-bold transition-colors duration-200
                    ${selectedSize === size ? 'bg-yellow-400 text-black' : 'text-yellow-400 hover:bg-yellow-400/20'}`}
                >
                  {size}
                </button>
              ))}
            </div>
            <button
              className="w-full max-w-xs border-2 border-red-500 text-red-500 py-3 font-bold hover:bg-red-500 hover:text-black transition-colors duration-200"
              onClick={handleAddToCart}
            >
              ADD TO CART
            </button>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>100% POLY</li>
              <li>RIBBED COLLAR, CUFFS AND BOTTOM HEM</li>
              <li>CORTEIZ LOGO EMBROIDERED LEFT CHEST</li>
              <li>YKK ZIPPERS</li>
              <li>APPLIQUE CORTEIZ LOGO ON THE BACK</li>
            </ul>
            <div className="flex flex-col gap-2 text-sm">
              <a href="#" className="underline hover:text-white">SIZE GUIDE</a>
              <a href="#" className="underline hover:text-white">SHIPPING POLICY</a>
            </div>
          </div>
        </main>
      </div>
      <footer className="text-center text-xs text-yellow-400/70 pt-8 mt-8 border-t border-yellow-400/50">
        <p>Copyright © 2023, CRTZW</p>
      </footer>
    </div>
  );
}
