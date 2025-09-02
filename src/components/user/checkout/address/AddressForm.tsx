import React from "react";
import { AddressFormData } from "./AddressFormPage";

interface Props {
  formData: AddressFormData;
  handleChange: <K extends keyof AddressFormData>(key: K, value: AddressFormData[K]) => void;
  handleSubmit: (e: React.FormEvent) => void;
  setModalType: (type: keyof AddressFormData | null) => void;
  loading: boolean; // <--- ini WAJIB ada
}

export default function AddressForm({
  formData,
  handleChange,
  handleSubmit,
  setModalType,
  loading, // <--- ini juga WAJIB ada
}: Props) {
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-6 py-8 shadow"
    >
      {/* Receiver Name & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-zinc-300 mb-2">
            Receiver Name
          </label>
          <input
            type="text"
            name="receiver_name"
            value={formData.receiver_name}
            onChange={(e) => handleChange("receiver_name", e.target.value)}
            placeholder="Nama penerima"
            autoComplete="name"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-zinc-500"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-zinc-300 mb-2">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="0812xxxxxxx"
            autoComplete="tel"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-zinc-500"
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* Address line */}
      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-zinc-300 mb-2">
          Address Line
        </label>
        <textarea
          name="address_line"
          value={formData.address_line}
          onChange={(e) => handleChange("address_line", e.target.value)}
          placeholder="Jalan, Gedung, RT/RW"
          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-zinc-500 h-20 resize-none"
          required
          disabled={loading}
        />
      </div>

      {/* Province, Regency, District, Village pakai modal */}
      {(["province", "regency", "district", "village"] as (keyof AddressFormData)[]).map(
        (key) => (
          <div key={key}>
            <label className="block text-xs font-bold tracking-widest uppercase text-zinc-300 mb-2">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
            <button
              type="button"
              onClick={() => setModalType(key)}
              className="w-full text-left bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              disabled={loading}
            >
              {formData[key] || `Select ${key}`}
            </button>
          </div>
        )
      )}

      {/* Postal code */}
      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-zinc-300 mb-2">
          Postal Code
        </label>
        <input
          type="text"
          name="postal_code"
          value={formData.postal_code}
          onChange={(e) => handleChange("postal_code", e.target.value)}
          placeholder="20111"
          inputMode="numeric"
          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-zinc-500"
          required
          disabled={loading}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-yellow-400 text-black font-bold py-3 rounded-xl hover:opacity-90 transition uppercase tracking-wider shadow-lg"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Address"}
      </button>
    </form>
  );
}
