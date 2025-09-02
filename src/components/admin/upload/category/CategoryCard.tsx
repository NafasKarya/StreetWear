// components/admin/category/CategoryCard.tsx
import React from "react";

interface CategoryCardProps {
  categories: string[]; // Menerima kategori sebagai props
}

const CategoryCard: React.FC<CategoryCardProps> = ({ categories }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {categories.map((category, index) => (
        <div
          key={index}
          className="relative h-16 md:h-24 rounded-xl overflow-hidden group transition-transform duration-300 ease-in-out transform hover:scale-105"
        >
          {/* Gambar dan overlay kategori */}
          <div className="absolute inset-0">
            <img
              src={`https://via.placeholder.com/150?text=${category}`} // Placeholder image, bisa diganti dengan gambar kategori
              alt={category}
              className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/70 transition-colors" />
          </div>
          <div className="relative flex items-end justify-center h-full p-1 z-10">
            <h3 className="text-white text-[10px] md:text-xs font-bold text-center tracking-wide drop-shadow-md">
              {category}
            </h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryCard;
