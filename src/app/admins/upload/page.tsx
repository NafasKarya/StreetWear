// src/app/admins/upload/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SizeRow } from "./types";
import SizeRowEditor from "./SizeRowEditor";

export default function AdminUploadPage() {
  const router = useRouter();

  // Front/Back opsional
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string>("");
  const [backPreview, setBackPreview] = useState<string>("");

  // Galeri (maks 12)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // Fields
  const [productName, setProductName] = useState(""); // 🆕 Product Name (opsional)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  // 🆕 Hidden product controls
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [hiddenScope, setHiddenScope] = useState<string>(""); // contoh: "product:drop-aug" atau "product:123"

  // Sizes — default 1 baris IDR
  const [sizes, setSizes] = useState<SizeRow[]>([
    { label: "", stock: 0, price: 0, currency: "IDR" },
  ]);

  // UX
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ==== file helpers ====
  const onPickFront = (f?: File) => {
    setFrontFile(f ?? null);
    if (frontPreview) URL.revokeObjectURL(frontPreview);
    setFrontPreview(f ? URL.createObjectURL(f) : "");
  };

  const onPickBack = (f?: File) => {
    setBackFile(f ?? null);
    if (backPreview) URL.revokeObjectURL(backPreview);
    setBackPreview(f ? URL.createObjectURL(f) : "");
  };

  const onPickGalleryMultiple = (fileList?: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const incoming = Array.from(fileList);
    const combined = [...galleryFiles, ...incoming];
    if (combined.length > 12) setErrorMsg("Galeri maksimal 12 gambar. Sebagian file tidak ditambahkan.");
    const capped = combined.slice(0, 12);
    galleryPreviews.forEach((u) => u && URL.revokeObjectURL(u));
    setGalleryFiles(capped);
    setGalleryPreviews(capped.map((f) => URL.createObjectURL(f)));
  };

  const removeGalleryAt = (idx: number) => {
    const removed = galleryPreviews[idx];
    if (removed) URL.revokeObjectURL(removed);
    setGalleryFiles((prev) => prev.filter((_, i) => i !== idx));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // ==== sizes helpers ====
  const addSize = () => setSizes((s) => [...s, { label: "", stock: 0, price: 0, currency: "IDR" }]);
  const removeSize = (i: number) => setSizes((s) => s.filter((_, idx) => idx !== i));
  const patchRow = (i: number, patch: Partial<SizeRow>) =>
    setSizes((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], ...patch };
      return next;
    });

  // ==== submit (upload product) ====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const totalImages = (frontFile ? 1 : 0) + (backFile ? 1 : 0) + galleryFiles.length;
    if (totalImages === 0) return setErrorMsg("Minimal unggah 1 gambar (front atau galeri).");
    if (galleryFiles.length > 12) return setErrorMsg("Galeri maksimal 12 gambar.");
    if (!title.trim()) return setErrorMsg("Judul wajib diisi.");
    if (!description.trim()) return setErrorMsg("Deskripsi wajib diisi.");
    if (!category.trim()) return setErrorMsg("Kategori wajib diisi.");
    if (sizes.length === 0 || !sizes[0].label.trim()) {
      return setErrorMsg("Minimal satu ukuran dengan label harus diisi.");
    }
    if (isHidden && !hiddenScope.trim()) {
      return setErrorMsg("Hidden Scope wajib diisi saat produk disembunyikan.");
    }

    const form = new FormData();
    if (frontFile) form.append("frontImage", frontFile);
    if (backFile) form.append("backImage", backFile);
    galleryFiles.forEach((f) => form.append("gallery", f));

    // 🆕 kirim productName (opsional). Server akan fallback ke title kalau kosong.
    if (productName.trim()) form.append("productName", productName.trim());

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
          currency: s.currency,
        }))
      )
    );
    if (expiresAt) form.append("expiresAt", new Date(expiresAt).toISOString());

    // 🆕 kirim flag hidden + scope
    form.append("isHidden", String(!!isHidden));
    if (isHidden && hiddenScope.trim()) {
      form.append("hiddenScope", hiddenScope.trim());
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", { method: "POST", credentials: "include", body: form });
      const ct = res.headers.get("content-type") || "";
      const raw = await res.text();
      const data = ct.includes("application/json") && raw ? JSON.parse(raw) : null;

      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || (raw ? raw.slice(0, 200) : "Gagal membuat produk"));
      }
      router.push("/");
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal membuat produk");
    } finally {
      setLoading(false);
    }
  };

  // ====== SIMULASI CHECKOUT (pakai endpoint yang sudah kamu buat) ======
  const [ckId, setCkId] = useState<string>("");
  const [ckSize, setCkSize] = useState<string>("");
  const [ckQty, setCkQty] = useState<string>("1");
  const [ckMsg, setCkMsg] = useState<string>("");
  const [ckLoading, setCkLoading] = useState<boolean>(false);
  const [ckResult, setCkResult] = useState<any>(null);

  const handleSimCheckout = async () => {
    setCkMsg("");
    setCkResult(null);
    const productId = Number(ckId || 0);
    const qty = Number(ckQty || 0);
    if (!productId) return setCkMsg("Isi productId yang valid.");
    if (!ckSize.trim()) return setCkMsg("Isi sizeLabel yang valid.");
    if (qty <= 0) return setCkMsg("Qty harus > 0.");

    try {
      setCkLoading(true);
      const res = await fetch("/api/admin/products/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ productId, sizeLabel: ckSize.trim(), qty }] }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || payload?.ok === false) {
        throw new Error(payload?.message || "Checkout gagal");
      }
      setCkResult(payload?.data ?? null);
      setCkMsg("Checkout berhasil. Stok sudah dikurangi. Cek 'data' di bawah untuk stok & isSoldOut terbaru.");
    } catch (e: any) {
      setCkMsg(e?.message || "Checkout gagal");
    } finally {
      setCkLoading(false);
    }
  };

  // ====== ACCESS CODE TOOL (ADMIN ONLY) ======
  const [genLoading, setGenLoading] = useState(false);
  const [genMsg, setGenMsg] = useState<string>("");
  const [genToken, setGenToken] = useState<string>("");

  const handleGenerateAccessCode = async () => {
    setGenMsg("");
    setGenToken("");
    if (!hiddenScope.trim()) {
      setGenMsg("Isi Hidden Scope dulu.");
      return;
    }
    try {
      setGenLoading(true);
      const res = await fetch("/api/admin/access-codes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: hiddenScope.trim(),
          label: `product:${title || productName || hiddenScope}`.slice(0, 191),
          // maxUses / expiresAt opsional — tinggal tambahin kalau perlu
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || "Gagal membuat access code");
      }
      setGenToken(String(data?.access_token_plaintext || ""));
      setGenMsg("Kode akses berhasil dibuat. Simpan plaintext di bawah — server hanya simpan HASH.");
    } catch (e: any) {
      setGenMsg(e?.message || "Gagal membuat access code");
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 p-6 font-mono">
      <h1 className="text-2xl font-bold text-yellow-400 mb-1">Post Product</h1>
      <p className="text-sm text-gray-400 mb-6">
        Unggah gambar produk & isi detailnya. Front/back opsional. Galeri bisa sampai 12 gambar.
      </p>

      {errorMsg && (
        <div className="bg-red-500/20 text-red-300 p-3 rounded mb-4 border border-red-500/30">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Gambar Depan */}
        <section className="p-4 rounded border border-yellow-400/30 bg-white/5">
          <label className="block font-bold text-yellow-400 mb-2">Gambar Depan (cover)</label>
          <p className="text-xs text-gray-400 mb-3">Jika kosong, sistem akan memakai gambar pertama dari galeri sebagai cover.</p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onPickFront(e.target.files?.[0])}
            className="block w-full text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-yellow-400 file:text-black hover:file:bg-yellow-300"
          />
          {frontPreview && <img src={frontPreview} alt="preview front" className="mt-3 max-h-56 rounded" />}
        </section>

        {/* Gambar Belakang */}
        <section className="p-4 rounded border border-yellow-400/20 bg-white/5">
          <label className="block font-bold text-yellow-400 mb-2">Gambar Belakang (opsional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onPickBack(e.target.files?.[0])}
            className="block w-full text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-yellow-400 file:text-black hover:file:bg-yellow-300"
          />
          {backPreview && <img src={backPreview} alt="preview back" className="mt-3 max-h-56 rounded" />}
        </section>

        {/* Galeri */}
        <section className="p-4 rounded border border-yellow-400/20 bg-white/5">
          <div className="flex items-center justify-between">
            <label className="block font-bold text-yellow-400 mb-2">Galeri (multiple, maks 12)</label>
            <span className="text-xs text-gray-400">{galleryFiles.length}/12</span>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => onPickGalleryMultiple(e.target.files)}
            className="block w-full text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-yellow-400 file:text-black hover:file:bg-yellow-300"
          />

          {galleryPreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {galleryPreviews.map((src, i) => (
                <div key={i} className="relative">
                  <img src={src} alt={`gallery-${i + 1}`} className="aspect-square w-full object-cover rounded border border-yellow-400/30" />
                  <button
                    type="button"
                    onClick={() => removeGalleryAt(i)}
                    className="absolute top-1 right-1 px-2 py-0.5 text-xs bg-red-600 text-white rounded"
                    title="Hapus"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-[11px] text-gray-500 mt-2">Jika cover kosong, gambar pertama di galeri akan dipakai sebagai cover.</p>
        </section>

        {/* Detail Produk */}
        <section className="grid gap-4 md:grid-cols-2">
          {/* 🆕 Product Name (opsional) */}
          <div className="p-4 rounded border border-yellow-400/30 bg白/5 md:col-span-2 bg-white/5">
            <label className="block text-sm text-gray-400 mb-1">Product Name (opsional)</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="contoh: Kaos Oversize - Sunset Series"
              className="w-full px-3 py-2 rounded bg-black border border-yellow-400/40"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Kalau kosong, sistem otomatis pakai <span className="text-yellow-300">Judul</span>.
            </p>
          </div>

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
              Jika diisi, produk otomatis dianggap tidak aktif setelah waktu ini (sesuai logika penayanganmu).
            </p>
          </div>
        </section>

        {/* 🆕 Hidden Product & Access Code */}
        <section className="p-4 rounded border border-fuchsia-400/30 bg-white/5">
          <div className="flex items-center gap-3 mb-3">
            <input
              id="hidden-toggle"
              type="checkbox"
              checked={isHidden}
              onChange={(e) => setIsHidden(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="hidden-toggle" className="font-bold text-fuchsia-300">
              Sembunyikan produk (butuh access code untuk muncul di list public)
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto] items-end">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Hidden Scope (mis. <code>product:drop-aug</code>)</label>
              <input
                type="text"
                value={hiddenScope}
                onChange={(e) => setHiddenScope(e.target.value)}
                placeholder="contoh: product:drop-aug"
                className="w-full px-3 py-2 rounded bg-black border border-fuchsia-400/40"
                disabled={!isHidden}
              />
              <p className="text-[11px] text-gray-500 mt-1">
                FE publik akan kirim header <code>x-access-code</code> ke <code>/api/products</code>.
                Server cek token → cocok scope ini → produk hidden ikut tampil.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerateAccessCode}
              disabled={!isHidden || !hiddenScope.trim() || genLoading}
              className="px-4 py-2 rounded bg-fuchsia-400 text-black font-bold hover:bg-fuchsia-300 disabled:opacity-50"
              title="Buat kode akses untuk scope di sebelah"
            >
              {genLoading ? "Membuat..." : "Generate Access Code"}
            </button>
          </div>

          {(genMsg || genToken) && (
            <div className="mt-3 text-sm">
              {genMsg && <p className="text-fuchsia-300">{genMsg}</p>}
              {genToken && (
                <div className="mt-2 p-3 rounded bg-black/60 border border-fuchsia-400/30">
                  <div className="text-xs text-gray-400 mb-1">Plaintext (tampilkan sekali – simpan sekarang):</div>
                  <code className="break-all text-fuchsia-200">{genToken}</code>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Ukuran / Stok / Harga + Currency */}
        <section className="p-4 rounded border border-yellow-400/30 bg-white/5">
          <div className="flex items-center justify-between mb-2">
            <label className="block font-bold text-yellow-400">Ukuran, Stok & Harga</label>
            <button type="button" onClick={addSize} className="px-3 py-1 bg-yellow-500 text-black rounded">
              + Tambah Ukuran
            </button>
          </div>

          <p className="text-xs text-gray-400 mb-3">
            Isi <span className="text-yellow-300">Label</span> (mis. S / M / L / 42).{" "}
            <span className="text-yellow-300">Stock</span> = jumlah unit tersedia. Pilih{" "}
            <span className="text-yellow-300">Mata Uang</span> (Rp / USD / MYR / SGD).{" "}
            <span className="text-yellow-300">Harga</span> angka saja; 0 diperbolehkan. <br />
            <em>Catatan:</em> angka <strong>0</strong> disembunyikan saat kolom masih kosong—baru muncul jika kamu benar-benar mengisi 0.
          </p>

          {sizes.map((row, i) => (
            <SizeRowEditor
              key={i}
              index={i}
              row={row}
              onChange={patchRow}
              onRemove={sizes.length > 1 ? removeSize : undefined}
            />
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
          <button type="button" onClick={() => router.push("/")} className="px-6 py-2 bg-white/10 rounded hover:bg-white/20">
            Batal
          </button>
        </div>
      </form>

      {/* ====== Blok opsional: Simulasi Checkout (kurangi stok + lihat isSoldOut) ====== */}
      <section className="mt-10 p-4 rounded border border-emerald-400/30 bg-white/5">
        <h3 className="text-lg font-bold text-emerald-400 mb-2">Simulasi Checkout (dev tool)</h3>
        <p className="text-xs text-gray-400 mb-3">
          Masukkan <b>productId</b> (produk yang sudah ada di DB), <b>sizeLabel</b>, dan <b>qty</b>.
          Ini akan memanggil <code>/api/orders/checkout</code> untuk mengurangi stok dan mengembalikan status <code>isSoldOut</code>.
        </p>

        <div className="flex flex-wrap gap-2">
          <input
            type="number"
            placeholder="productId"
            value={ckId}
            onChange={(e) => setCkId(e.target.value)}
            className="w-32 px-3 py-2 rounded bg-black border border-emerald-400/40"
            title="ID produk di database"
          />
          <input
            type="text"
            placeholder="sizeLabel (mis. M)"
            value={ckSize}
            onChange={(e) => setCkSize(e.target.value)}
            className="w-40 px-3 py-2 rounded bg-black border border-emerald-400/40"
            title="Label ukuran yang ada di produk"
          />
          <input
            type="number"
            placeholder="qty"
            value={ckQty}
            onChange={(e) => setCkQty(e.target.value)}
            className="w-28 px-3 py-2 rounded bg-black border border-emerald-400/40"
            title="Jumlah yang dibeli"
          />
          <button
            type="button"
            onClick={handleSimCheckout}
            disabled={ckLoading}
            className="px-4 py-2 rounded bg-emerald-400 text-black font-bold hover:bg-emerald-300 disabled:opacity-50"
          >
            {ckLoading ? "Memproses..." : "Checkout"}
          </button>
        </div>

        {ckMsg && <p className="mt-2 text-sm text-emerald-300">{ckMsg}</p>}
        {ckResult && (
          <pre className="mt-3 text-xs bg-black/50 p-3 rounded border border-emerald-400/20 overflow-auto">
            {JSON.stringify(ckResult, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
}
