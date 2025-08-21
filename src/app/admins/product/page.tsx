// src/app/admins/upload/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SizeRow = { label: string; stock: number; price: number };

export default function AdminUploadPage() {
  const router = useRouter();

  // Files
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string>("");
  const [backPreview, setBackPreview] = useState<string>("");

  // Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [expiresAt, setExpiresAt] = useState(""); // datetime-local

  // Sizes
  const [sizes, setSizes] = useState<SizeRow[]>([{ label: "", stock: 0, price: 0 }]);

  // UX
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onPickFront = (f?: File) => {
    setFrontFile(f ?? null);
    setFrontPreview(f ? URL.createObjectURL(f) : "");
  };
  const onPickBack = (f?: File) => {
    setBackFile(f ?? null);
    setBackPreview(f ? URL.createObjectURL(f) : "");
  };

  const updateSize = (i: number, key: keyof SizeRow, value: string | number) => {
    setSizes((prev) => {
      const next = [...prev];
      // cast number for numeric fields
      (next[i] as any)[key] = key === "label" ? String(value) : Number(value || 0);
      return next;
    });
  };

  const addSize = () => setSizes((s) => [...s, { label: "", stock: 0, price: 0 }]);
  const removeSize = (i: number) => setSizes((s) => s.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validasi minimal
    if (!frontFile) return setErrorMsg("Gambar depan wajib diunggah.");
    if (!title.trim()) return setErrorMsg("Judul wajib diisi.");
    if (!description.trim()) return setErrorMsg("Deskripsi wajib diisi.");
    if (!category.trim()) return setErrorMsg("Kategori wajib diisi.");
    if (sizes.length === 0 || !sizes[0].label.trim()) {
      return setErrorMsg("Minimal satu ukuran dengan label harus diisi.");
    }

    // Build FormData (JANGAN set Content-Type manual)
    const form = new FormData();
    form.append("frontImage", frontFile);
    if (backFile) form.append("backImage", backFile);
    form.append("title", title);
    form.append("description", description);
    form.append("category", category);
    form.append(
      "sizes",
      JSON.stringify(
        sizes.map((s) => ({
          label: s.label.trim(),
          stock: Number(s.stock) || 0,
          price: Number(s.price) || 0,
        }))
      )
    );
    if (expiresAt) form.append("expiresAt", new Date(expiresAt).toISOString());

    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        credentials: "include",
        body: form, // penting: TANPA header "Content-Type"
      });

      const ct = res.headers.get("content-type") || "";
      const raw = await res.text();
      const data = ct.includes("application/json") && raw ? JSON.parse(raw) : null;

      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || (raw ? raw.slice(0, 200) : "Gagal membuat produk"));
      }

      // Sukses → kembali ke katalog
      router.push("/");
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal membuat produk");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 p-6 font-mono">
      <h1 className="text-2xl font-bold text-yellow-400 mb-1">Post Product</h1>
      <p className="text-sm text-gray-400 mb-6">
        Unggah gambar produk & isi detailnya. Gambar belakang opsional. Ukuran dapat ditambah
        lebih dari satu. Kadaluarsa juga opsional.
      </p>

      {errorMsg && (
        <div className="bg-red-500/20 text-red-300 p-3 rounded mb-4 border border-red-500/30">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Gambar Depan */}
        <section className="p-4 rounded border border-yellow-400/30 bg-white/5">
          <label className="block font-bold text-yellow-400 mb-2">Gambar Depan *</label>
          <p className="text-xs text-gray-400 mb-3">
            Format disarankan: JPG/PNG. Maksimal beberapa MB (sesuaikan di server). Ini akan
            ditampilkan sebagai foto utama.
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onPickFront(e.target.files?.[0])}
            className="block w-full text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-yellow-400 file:text-black hover:file:bg-yellow-300"
          />
          {frontPreview && (
            <img src={frontPreview} alt="preview front" className="mt-3 max-h-56 rounded" />
          )}
        </section>

        {/* Gambar Belakang */}
        <section className="p-4 rounded border border-yellow-400/20 bg-white/5">
          <label className="block font-bold text-yellow-400 mb-2">Gambar Belakang (opsional)</label>
          <p className="text-xs text-gray-400 mb-3">
            Jika ada tampak belakang/alternatif, unggah di sini. Boleh dikosongkan.
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onPickBack(e.target.files?.[0])}
            className="block w-full text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-yellow-400 file:text-black hover:file:bg-yellow-300"
          />
          {backPreview && (
            <img src={backPreview} alt="preview back" className="mt-3 max-h-56 rounded" />
          )}
        </section>

        {/* Detail Produk */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="p-4 rounded border border-yellow-400/30 bg-white/5 md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Judul *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="contoh: Hoodie Oversize 'Night City'"
              className="w-full px-3 py-2 rounded bg-black border border-yellow-400/40"
            />
          </div>

          <div className="p-4 rounded border border-yellow-400/30 bg-white/5 md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Deskripsi *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Bahan fleece, jahitan rapi, nyaman dipakai harian..."
              className="w-full px-3 py-2 rounded bg-black border border-yellow-400/40"
            />
          </div>

          <div className="p-4 rounded border border-yellow-400/30 bg-white/5">
            <label className="block text-sm text-gray-400 mb-1">Kategori *</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="contoh: hoodie / t-shirt / pants"
              className="w-full px-3 py-2 rounded bg-black border border-yellow-400/40"
            />
          </div>

          <div className="p-4 rounded border border-yellow-400/30 bg-white/5">
            <label className="block text-sm text-gray-400 mb-1">Kadaluarsa (opsional)</label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-3 py-2 rounded bg-black border border-yellow-400/40"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Jika diisi, produk otomatis dianggap tidak aktif setelah waktu ini (logika
              penayangan kamu implementasikan di sisi list).
            </p>
          </div>
        </section>

        {/* Ukuran / Stok / Harga */}
        <section className="p-4 rounded border border-yellow-400/30 bg-white/5">
          <div className="flex items-center justify-between mb-2">
            <label className="block font-bold text-yellow-400">Ukuran & Stok</label>
            <button
              type="button"
              onClick={addSize}
              className="px-3 py-1 bg-yellow-500 text-black rounded"
            >
              + Tambah Ukuran
            </button>
          </div>

          <p className="text-xs text-gray-400 mb-3">
            Minimal 1 ukuran. Kosongkan harga bila tidak relevan (boleh 0).
          </p>

          {sizes.map((s, i) => (
            <div key={i} className="flex flex-wrap gap-2 mb-2">
              <input
                type="text"
                placeholder="Label (S / M / L / 42, dst.)"
                value={s.label}
                onChange={(e) => updateSize(i, "label", e.target.value)}
                className="flex-1 min-w-[160px] px-3 py-2 rounded bg-black border border-yellow-400/40"
              />
              <input
                type="number"
                placeholder="Stock"
                value={s.stock}
                onChange={(e) => updateSize(i, "stock", e.target.value)}
                className="w-28 px-3 py-2 rounded bg-black border border-yellow-400/40"
              />
              <input
                type="number"
                placeholder="Price"
                value={s.price}
                onChange={(e) => updateSize(i, "price", e.target.value)}
                className="w-28 px-3 py-2 rounded bg-black border border-yellow-400/40"
              />
              {sizes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSize(i)}
                  className="px-2 bg-red-500 text-white rounded"
                  title="Hapus baris ukuran"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </section>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-300 disabled:opacity-50"
          >
            {loading ? "Mengunggah..." : "Post Product"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-white/10 rounded hover:bg-white/20"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
