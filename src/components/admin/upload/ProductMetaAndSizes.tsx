"use client";
import { ProductFormData } from "@/store/type/types";
import {
  Tag,
  Shirt,
  Hash,
  Calendar,
  DollarSign,
  Package,
  X,
  Plus,
} from "lucide-react";


interface Props {
  formData: ProductFormData;
  handleChange: <K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K]
  ) => void;
  updateSize: (
    i: number,
    key: keyof ProductFormData["sizes"][0],
    value: string
  ) => void;
  error: string | null;
  success: boolean;
}

export default function ProductMetaAndSizes({
  formData,
  handleChange,
  updateSize,
  error,
  success,
}: Props) {
  return (
    <>
      {/* Product Meta */}
      <div className="rounded-2xl backdrop-blur-2xl bg-white/6 border border-white/10 p-6 shadow">
        <h2 className="mb-4 flex items-center gap-2 text-xs font-extrabold tracking-widest uppercase text-zinc-200/90">
          <Tag className="h-4 w-4" /> Product Meta
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <label className="group">
            <span className="mb-2 block text-[10px] font-bold tracking-widest uppercase text-zinc-300/80">
              Title
            </span>
            <input
              type="text"
              placeholder="TITLE (E.G. DROP #07)"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-zinc-400/70 font-semibold uppercase focus:outline-none focus:ring-4 focus:ring-emerald-400/20"
            />
          </label>

          {/* Name */}
          <label className="group relative">
            <span className="mb-2 block text-[10px] font-bold tracking-widest uppercase text-zinc-300/80">
              Name
            </span>
            <Shirt className="absolute left-3 top-9 h-4 w-4 text-zinc-400/70 pointer-events-none" />
            <input
              type="text"
              placeholder="PRODUCT NAME"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-zinc-400/70 font-semibold uppercase focus:outline-none focus:ring-4 focus:ring-emerald-400/20"
            />
          </label>

          {/* Description */}
          <label className="md:col-span-2 group">
            <span className="mb-2 block text-[10px] font-bold tracking-widest uppercase text-zinc-300/80">
              Description
            </span>
            <textarea
              placeholder="FABRIC / FIT / VIBE / LIMITED NOTES"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-zinc-400/70 font-medium uppercase min-h-[120px] focus:outline-none focus:ring-4 focus:ring-emerald-400/20"
            />
          </label>

          {/* Expired At */}
          <label className="group relative">
            <span className="mb-2 block text-[10px] font-bold tracking-widest uppercase text-zinc-300/80">
              Expired At
            </span>
            <Calendar className="absolute left-3 top-9 h-4 w-4 text-zinc-400/70 pointer-events-none" />
            <input
              type="date"
              value={formData.expiredAt}
              onChange={(e) => handleChange("expiredAt", e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-400/20"
            />
          </label>
        </div>
      </div>

      {/* Sizes */}
      <div className="rounded-2xl backdrop-blur-2xl bg-white/6 border border-white/10 p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xs font-extrabold tracking-widest uppercase text-zinc-200/90">
            <Hash className="h-4 w-4" /> Sizes & Pricing
          </h2>
          <button
            type="button"
            onClick={() =>
              handleChange("sizes", [
                ...formData.sizes,
                { size: "", price: "", stock: "" },
              ])
            }
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-amber-300 to-yellow-400 px-3 py-2 text-[11px] font-extrabold uppercase text-black shadow active:scale-95 transition"
          >
            <Plus className="h-4 w-4" /> Add Size
          </button>
        </div>

        <div className="space-y-3">
          {formData.sizes.map((sz, i) => (
            <div key={`${sz.size}-${i}`} className="grid grid-cols-12 gap-3">
              {/* Size */}
              <input
                type="text"
                placeholder="Size"
                value={sz.size}
                onChange={(e) => updateSize(i, "size", e.target.value)}
                required
                className="col-span-6 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white font-semibold uppercase focus:outline-none focus:ring-4 focus:ring-sky-400/20"
              />

              {/* Price */}
              <div className="col-span-3 relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400/70 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Price"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={sz.price}
                  onChange={(e) =>
                    updateSize(
                      i,
                      "price",
                      e.target.value.replace(/\D+/g, "").replace(/^0+(\d)/, "$1")
                    )
                  }
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white font-semibold focus:outline-none focus:ring-4 focus:ring-sky-400/20"
                />
              </div>

              {/* Stock */}
              <div className="col-span-2 relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400/70 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Stock"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={sz.stock}
                  onChange={(e) =>
                    updateSize(
                      i,
                      "stock",
                      e.target.value.replace(/\D+/g, "").replace(/^0+(\d)/, "$1")
                    )
                  }
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white font-semibold focus:outline-none focus:ring-4 focus:ring-sky-400/20"
                />
              </div>

              {/* Remove button */}
              {formData.sizes.length > 1 && (
                <button
                  type="button"
                  aria-label="Remove size"
                  onClick={() =>
                    handleChange(
                      "sizes",
                      formData.sizes.filter((_, idx) => idx !== i)
                    )
                  }
                  className="col-span-1 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-200/90 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error / Success */}
      {(error || success) && (
        <div
          className={[
            "rounded-2xl p-4 text-center font-extrabold uppercase tracking-widest border shadow backdrop-blur-2xl",
            error
              ? "border-red-400/30 bg-red-400/10 text-red-300"
              : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
          ].join(" ")}
        >
          {error || "Produk berhasil di-upload!"}
        </div>
      )}
    </>
  );
}
