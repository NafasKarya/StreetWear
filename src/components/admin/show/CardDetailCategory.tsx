"use client";
import React from "react";
import Image from "next/image";
import clsx from "clsx";

// ✅ Extract ke luar biar ga recreate setiap render
const CATEGORIES = [
  {
    id: 1,
    title: "Streetwear",
    description: "Baju streetwear terbaru.",
    image: "/assets/images/admin-bg.png",
  },
  {
    id: 2,
    title: "Aksesoris",
    description: "Topi, tas, dan aksesoris keren.",
    image: "/assets/images/admin-bg2.png",
  },
  {
    id: 3,
    title: "Sneakers",
    description: "Sepatu hype untuk gaya sehari-hari.",
    image: "/assets/images/admin-bg3.png",
  },
  {
    id: 4,
    title: "Premium",
    description: "Item eksklusif edisi terbatas.",
    image: "/assets/images/admin-bg.png",
  },
];

export default function CardDetailCategory() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {CATEGORIES.map((item) => (
        <div
          key={item.id}
          className={clsx(
            "relative group rounded-2xl overflow-hidden shadow-md cursor-pointer",
            "transition-transform duration-300 hover:scale-[1.02]",
            "aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/3]"
          )}
        >
          {/* Background Image */}
          <Image
            src={item.image}
            alt={item.title}
            fill
            priority
            sizes="(max-width: 640px) 50vw,
                   (max-width: 1024px) 33vw,
                   25vw"
            className="object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors"></div>

          {/* Text */}
          <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4 lg:p-6">
            <h3 className="text-sm sm:text-lg lg:text-xl font-extrabold uppercase tracking-wide text-white group-hover:text-yellow-300">
              {item.title}
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-zinc-300 leading-snug">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
