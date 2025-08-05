export interface ProductImage {
  id: number;
  title?: string;
  name: string;
  price: string;
  frontImage: string;      // WAJIB
  backImage?: string;      // OPSIONAL
  productDetail: string;
  discount: string;        // dalam persen (misal "10" berarti 10%)
  voucher: string;         // nominal potongan, "0" jika ga ada
  tax: string;             // dalam persen (misal "11" berarti 11%)
  shipping: string;        // SELALU: 5% dari harga, DIHITUNG otomatis
  uploadedBy: string;
  createdAt: number;
}

const STORAGE_KEY = "uploadedProductImages";

// Ambil semua produk yang pernah di-upload admin
export function getAllProductImages(): ProductImage[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function formatHargaRp(input: string): string {
  if (!input) return "";
  const n = Number(input.replace(/\D/g, ""));
  if (isNaN(n)) return "";
  return "Rp" + n.toLocaleString("id-ID");
}

export function getAllProductCategories(): string[] {
  const all = getAllProductImages();
  const categories = new Set<string>();
  all.forEach(img => {
    let c = img.title?.trim() || "";
    categories.add(c ? c : "Tanpa Kategori");
  });
  return Array.from(categories);
}

// Fungsi HITUNG HARGA TOTAL PRODUK, modular, dipakai di mana aja
export function calcTotalHargaProduk({
  price,
  discount,
  voucher,
  tax,
  shipping,
}: {
  price: string;
  discount: string;
  voucher: string;
  tax: string;
  shipping?: string | number;
}): number {
  const harga = Number(price.replace(/\D/g, "")) || 0;
  const diskon = Number(discount) || 0;
  const voucherNum = Number(voucher) || 0;
  const pajak = Number(tax) || 0;
  const ongkir = typeof shipping === "undefined"
    ? Math.round(harga * 0.05)
    : Number(typeof shipping === "string" ? shipping.replace(/\D/g, "") : shipping) || 0;

  const diskonNominal = Math.round(harga * (diskon / 100));
  const subtotal = harga - diskonNominal - voucherNum;
  const subtotalFix = subtotal < 0 ? 0 : subtotal;
  const pajakNominal = Math.round(subtotalFix * (pajak / 100));
  const total = subtotalFix + pajakNominal + ongkir;
  return total < 0 ? 0 : total;
}

// Hanya admin boleh upload
export function uploadProductImage(
  {
    title,
    name,
    price,
    frontImage,
    backImage,
    productDetail,
    discount,
    voucher,
    tax
  }: {
    title?: string;
    name: string;
    price: string;
    frontImage: string;
    backImage?: string;
    productDetail: string;
    discount: string;
    voucher: string;
    tax: string;
  },
  adminEmail: string
): { ok: true } | { ok: false; msg: string } {
  if (typeof window === "undefined") return { ok: false, msg: "No window" };
  if (adminEmail !== "admin@dev.com") return { ok: false, msg: "Bukan admin" };
  if (!name.trim() || !price.trim() || !frontImage.trim() || !productDetail.trim())
    return { ok: false, msg: "Nama, harga, gambar depan, dan detail wajib" };

  const images = getAllProductImages();
  // Cek duplikat: nama + frontImage + price
  if (images.some((img) => img.name === name && img.price === price && img.frontImage === frontImage)) {
    return { ok: false, msg: "Produk sudah ada" };
  }
  const id = images.length > 0 ? images[images.length - 1].id + 1 : 1;

  // Hitung ongkir otomatis 5% dari harga
  let ongkir = "0";
  const numPrice = Number(price.replace(/\D/g, ""));
  if (!isNaN(numPrice) && numPrice > 0) {
    ongkir = Math.round(numPrice * 0.05).toString();
  }

  images.push({
    id,
    title,
    name,
    price,
    frontImage,
    backImage,
    productDetail,
    discount: discount || "0",
    voucher: voucher || "0",
    tax: tax || "0",
    shipping: ongkir,
    uploadedBy: adminEmail,
    createdAt: Date.now(),
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
  return { ok: true };
}

export function searchProductImages(query: string): ProductImage[] {
  const all = getAllProductImages();
  if (!query.trim()) return all;
  const q = query.toLowerCase();
  return all.filter(img =>
    img.name.toLowerCase().includes(q) ||
    (img.title?.toLowerCase() || "").includes(q) ||
    img.productDetail.toLowerCase().includes(q)
  );
}

// Tambahkan di bawah function lain di productLogic.ts
export function renameTitleAllProducts(oldTitle: string, newTitle: string) {
  if (typeof window === "undefined") return { ok: false, msg: "No window" };
  const raw = localStorage.getItem("uploadedProductImages");
  if (!raw) return { ok: false, msg: "No produk" };
  const arr = JSON.parse(raw);
  arr.forEach((img: any) => {
    // Pastikan perbandingan aman, "Tanpa Judul" sama dengan kosong/null/undefined
    const current = img.title?.trim() || "Tanpa Judul";
    if (current === oldTitle) {
      img.title = newTitle === "Tanpa Judul" ? "" : newTitle;
    }
  });
  localStorage.setItem("uploadedProductImages", JSON.stringify(arr));
  return { ok: true };
}

// Dapatkan semua title unik, kecuali null/undefined/"" -> selalu ada "Tanpa Judul" juga
export function getAllProductTitles(): string[] {
  const all = getAllProductImages();
  const titles = new Set<string>();
  all.forEach(img => {
    let t = img.title?.trim() || "";
    titles.add(t ? t : "Tanpa Judul");
  });
  return Array.from(titles);
}

export function deleteProductImage(id: number, adminEmail: string): { ok: true } | { ok: false; msg: string } {
  if (typeof window === "undefined") return { ok: false, msg: "No window" };
  if (adminEmail !== "admin@dev.com") return { ok: false, msg: "Bukan admin" };
  let images = getAllProductImages();
  const newImages = images.filter((img) => img.id !== id);
  if (newImages.length === images.length) return { ok: false, msg: "Produk tidak ditemukan" };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newImages));
  return { ok: true };
}

// Hanya admin bisa lihat uploader & tanggal. User tidak dapat field itu.
export function getAvailableProductImages(role?: "admin" | "user"): (ProductImage | Omit<ProductImage, "uploadedBy" | "createdAt">)[] {
  const data = getAllProductImages();
  if (role === "admin") return data;
  // Untuk user: hapus uploadedBy & createdAt
  return data.map(({ uploadedBy, createdAt, ...rest }) => rest);
}
