// src/app/admins/upload/components/SizeRowEditor.tsx
"use client";

import React from "react";
import { SizeRow } from "./types";
import { CURRENCY_OPTIONS } from "./constants";


type Props = {
  index: number;
  row: SizeRow;
  onChange: (index: number, patch: Partial<SizeRow>) => void;
  onRemove?: (index: number) => void;
};

export default function SizeRowEditor({ index, row, onChange, onRemove }: Props) {
  const currMeta = CURRENCY_OPTIONS.find((c) => c.code === row.currency);

  return (
    <div className="flex flex-wrap gap-2 mb-2 items-start">
      {/* Label */}
      <input
        type="text"
        placeholder="Label (S / M / L / 42, dst.)"
        value={row.label}
        onChange={(e) => onChange(index, { label: e.target.value })}
        className="flex-1 min-w-[160px] px-3 py-2 rounded bg-black border border-yellow-400/40"
        title="Nama/label ukuran"
      />

      {/* Stock — nol disembunyikan di UI */}
      <input
        type="number"
        placeholder="Stock"
        value={row.stock === 0 ? "" : row.stock}
        onChange={(e) => onChange(index, { stock: Number(e.target.value || 0) })}
        className="w-28 px-3 py-2 rounded bg-black border border-yellow-400/40"
        title="Jumlah unit tersedia"
      />

      {/* Currency */}
      <select
        value={row.currency}
        onChange={(e) => onChange(index, { currency: e.target.value as SizeRow["currency"] })}
        className="w-44 px-3 py-2 rounded bg-black border border-yellow-400/40 text-gray-200"
        title="Mata uang"
      >
        {CURRENCY_OPTIONS.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Price — nol disembunyikan di UI */}
      <input
        type="number"
        step="0.01"
        placeholder={`Harga (${currMeta?.hint || row.currency})`}
        value={row.price === 0 ? "" : row.price}
        onChange={(e) => onChange(index, { price: Number(e.target.value || 0) })}
        className="w-40 px-3 py-2 rounded bg-black border border-yellow-400/40"
        title="Harga per ukuran"
      />

      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="px-2 bg-red-500 text-white rounded mt-1"
          title="Hapus baris ukuran"
        >
          ✕
        </button>
      )}
    </div>
  );
}
