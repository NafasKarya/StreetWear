"use client";
import Upload from "@/components/admin/upload/upload";
import { ProductFormData } from "@/store/type/types";
import { Upload as UploadIcon, X } from "lucide-react";

interface Props {
  formData: ProductFormData;
  handleChange: <K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K]
  ) => void;
  handleGalleryChange: (file: File | null) => void;
  loading: boolean;
}

export default function ProductMediaAndSubmit({
  formData,
  handleChange,
  handleGalleryChange,
  loading,
}: Props) {
  return (
    <>
      {/* Media Section */}
<div className="rounded-2xl backdrop-blur-2xl border border-white/10 p-6 shadow">
  <h2 className="mb-4 flex items-center gap-2 text-xs font-extrabold tracking-widest uppercase text-zinc-200/90">
    <UploadIcon className="h-4 w-4" />
    Media
  </h2>

  <div className="flex flex-col gap-4">
    <Upload
      label="Front Image"
      onFileChange={(f) => handleChange("frontImage", f)}
      accept="image/*"
    />
    <Upload
      label="Back Image"
      onFileChange={(f) => handleChange("backImage", f)}
      accept="image/*"
    />
    <Upload
      label="Gallery Image"
      onFileChange={handleGalleryChange}
      accept="image/*"
    />

    {formData.galleryImages.length > 0 && (
      <div>
        <p className="mb-2 text-[10px] font-bold tracking-widest text-zinc-300/80 uppercase">
          Gallery Queue
        </p>
        <ul className="flex flex-wrap gap-2">
          {formData.galleryImages.map((file, idx) => (
            <li
              key={file.name + idx}
              className="flex items-center gap-2 rounded-xl backdrop-blur-xl bg-transparent border border-white/15 px-2 py-1 text-[10px] font-bold uppercase text-zinc-100/90 shadow"
            >
              <span className="truncate max-w-[160px]">{file.name}</span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() =>
                  handleChange(
                    "galleryImages",
                    formData.galleryImages.filter((_, i) => i !== idx)
                  )
                }
                className="ml-1 text-red-300 hover:text-red-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
</div>


      {/* Submit Button */}
      <div className="sticky bottom-6">
        <button
          type="submit"
          aria-busy={loading}
          disabled={loading}
          className="w-full py-4 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-amber-300 to-yellow-400 text-black font-black uppercase tracking-[0.25em] text-sm border border-white/20 shadow active:translate-y-px disabled:opacity-60"
        >
          {loading ? "Uploading..." : "Upload Product"}
        </button>
        <p className="mt-2 text-center text-[10px] tracking-widest text-zinc-400 uppercase">
          By uploading you agree this drop follows brand guidelines.
        </p>
      </div>
    </>
  );
}
