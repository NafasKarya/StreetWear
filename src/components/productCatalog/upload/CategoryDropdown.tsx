"use client";
import React from "react";

interface CategoryDropdownProps {
  allCategories: string[];
  useManualCategory: boolean;
  setUseManualCategory: (b: boolean) => void;
  category: string;
  setCategory: (t: string) => void;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  allCategories,
  useManualCategory,
  setUseManualCategory,
  category,
  setCategory,
}) => (
  <div>
    <label className="block text-xs mb-1 text-pink-300">Kategori</label>
    <select
      value={useManualCategory ? "__manual__" : (category || "")}
      onChange={e => {
        if (e.target.value === "__manual__") {
          setUseManualCategory(true);
          setCategory("");
        } else {
          setUseManualCategory(false);
          setCategory(e.target.value);
        }
      }}
      className="bg-neutral-800 border border-neutral-600 px-2 py-1 rounded text-gray-100 w-[180px]"
    >
      <option value="">Tanpa Kategori</option>
      {allCategories
        .filter(c => c !== "" && c !== "Tanpa Kategori")
        .map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      <option value="__manual__">+ Buat Kategori Baru</option>
    </select>
    {useManualCategory && (
      <input
        value={category}
        onChange={e => setCategory(e.target.value)}
        placeholder="Kategori baru"
        className="bg-neutral-800 border border-pink-400 px-2 py-1 rounded text-gray-100 w-[180px] mt-1"
        autoFocus
      />
    )}
  </div>
);

export default CategoryDropdown;
