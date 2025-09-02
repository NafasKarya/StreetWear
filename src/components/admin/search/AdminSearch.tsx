import React, { useEffect } from "react";
import { Search } from "lucide-react";

interface AdminSearchProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  categories: string[];
}

export default function AdminSearch({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
}: AdminSearchProps) {

  // Update search query when search text changes
  useEffect(() => {
    // Set the search query only when the search text changes
    setSearchQuery(searchQuery.trim());
  }, [searchQuery, setSearchQuery]);

  // Update search query when selected category changes
  useEffect(() => {
    // Update the search query when the category is changed
    const query = `${searchQuery} ${selectedCategory ? `category:${selectedCategory}` : ""}`.trim();
    setSearchQuery(query);  // Set the combined search query based on category
  }, [selectedCategory, searchQuery, setSearchQuery]);

  return (
    <div className="mb-8 flex flex-col items-start gap-3">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query based on input
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
        />
      </div>

      {/* Dropdown for selecting category */}
      <div className="relative w-full mt-2">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)} // Update selected category
          className="w-full pl-4 pr-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
        >
          <option value="">All Categories</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
