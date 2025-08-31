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
}) => {
  const options = Array.from(
    new Set(
      (allCategories ?? [])
        .map(c => (c ?? "").trim())
        .filter(c => c.length > 0)
    )
  ).sort((a, b) => a.localeCompare(b));

  return (
    <div className="flex items-end gap-3">
      <div>
        <label className="block text-xs mb-1 text-yellow-300">Kategori *</label>

        {useManualCategory ? (
          <input
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="bg-neutral-800 border border-neutral-600 px-2 py-1 rounded text-gray-100 w-[200px]"
            placeholder="Tulis kategori…"
            required
          />
        ) : (
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="bg-neutral-800 border border-neutral-600 px-2 py-1 rounded text-gray-100 w-[200px]"
            required
          >
            <option value="" disabled>
              Pilih kategori…
            </option>
            {options.map(opt => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}
      </div>

      <label className="flex items-center gap-2 text-xs text-gray-300">
        <input
          type="checkbox"
          checked={useManualCategory}
          onChange={e => setUseManualCategory(e.target.checked)}
          className="accent-yellow-400"
        />
        Tulis manual
      </label>
    </div>
  );
};

export default CategoryDropdown;
