"use client";
import React, { useRef } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Combobox } from "@headlessui/react";

interface UserSearchProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  categories: string[];
}

export default function UserSearch({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
}: UserSearchProps) {
  const comboboxRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mb-8 flex flex-col items-start gap-3">
      {/* Search Box */}
      <div className="relative w-full max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
        />
      </div>

      {/* Dropdown Categories - Glass, Max Width, Hover */}
      <Combobox value={selectedCategory} onChange={setSelectedCategory}>
        <div className="relative w-full max-w-xs mt-2">
          <div className="flex">
            <Combobox.Input
              ref={comboboxRef}
              className="w-full py-3 pl-4 pr-10 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 truncate"
              displayValue={(category: string) => category || "All Categories"}
              placeholder="All Categories"
            />
            {/* Toggle Dropdown */}
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded bg-white/10 hover:bg-white/20"
              tabIndex={-1}
              onClick={() => {
                comboboxRef.current?.focus();
                comboboxRef.current?.dispatchEvent(
                  new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })
                );
              }}
            >
              <ChevronDown className="w-5 h-5 text-white/80" />
            </button>
          </div>
          <Combobox.Options className="absolute w-full max-w-xs mt-2 max-h-60 overflow-auto rounded-xl bg-white/20 backdrop-blur-md text-white shadow-lg ring-1 ring-black/10 z-10">
            <Combobox.Option value="">
              {({ active }: { active: boolean }) => (
                <span
                  className={`
                    truncate block px-4 py-2 cursor-pointer transition
                    ${active ? "bg-white/30 text-emerald-300" : ""}
                  `}
                >
                  All Categories
                </span>
              )}
            </Combobox.Option>
            {categories.map((category) => (
              <Combobox.Option key={category} value={category}>
                {({ active }: { active: boolean }) => (
                  <span
                    className={`
                      truncate block px-4 py-2 cursor-pointer transition
                      ${active ? "bg-white/30 text-emerald-300" : ""}
                    `}
                  >
                    {category.length > 24 ? category.slice(0, 24) + "..." : category}
                  </span>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </div>
      </Combobox>
    </div>
  );
}
