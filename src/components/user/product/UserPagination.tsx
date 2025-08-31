"use client";
import React from "react";

type Props = {
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
};

export default function UserPagination({
  totalPages,
  currentPage,
  setCurrentPage,
}: Props) {
  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(currentPage - 1)}
        className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 disabled:opacity-50"
      >
        Prev
      </button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => setCurrentPage(i + 1)}
          className={`px-3 py-2 rounded-lg border ${
            currentPage === i + 1
              ? "bg-emerald-500/30 border-emerald-400 text-emerald-300"
              : "bg-white/10 border-white/20 hover:bg-white/20"
          }`}
        >
          {i + 1}
        </button>
      ))}
      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(currentPage + 1)}
        className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
