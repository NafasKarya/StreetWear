// src/logic/productLogic.ts

export interface ProductImage {
  id: number;
  title?: string;
  name: string;
  price: string;           // legacy: disimpan sebagai string (tetap dipakai untuk localStorage)
  frontImage: string;      // WAJIB
  backImage?: string;      // OPSIONAL
  productDetail: string;
  discount: string;        // persen (mis. "10")
  voucher: string;         // nominal potongan (mis. "5000")
  tax: string;             // persen (mis. "11")
  shipping: string;        // 5% dari harga (disimpan string)
  uploadedBy: string;
  createdAt: number;
}

const STORAGE_KEY = "uploadedProductImages";

// ===== Utils koersi angka aman (terima number/string yang mungkin ber-format Rp/titik/koma) =====
function toNum(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    // coba hapus semua non-digit supaya "Rp120.000" -> "120000"
    const onlyDigits = v.replace?.(/\D/g, "");
    if (onlyDigits && onlyDigits.length > 0) {
      const n = Number(onlyDigits);
      return Number.isFinite(n) ? n : 0;
    }
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  const n = Number(v as any);
  return Number.isFinite(n) ? n : 0;
}

// Ambil semua produk yang pernah di-upload admin
export function getAllProductImages(): ProductImage[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

// Format harga fleksibel (terima number atau string)
export function formatHargaRp(input: number | string): string {
  const n = toNum(input);
  return "Rp" + n.toLocaleString("id-ID");
}

export function getAllProductCategories(): string[] {
  const all = getAllProductImages();
  const categories = new Set<string>();
  all.forEach((img) => {
    const c = img.title?.trim() || "";
    categories.add(c ? c : "Tanpa Kategori");
  });
  return Array.from(categories);
}

// ===== HITUNG HARGA TOTAL PRODUK (fleksibel: number | string) =====
export function calcTotalHargaProduk({
  price,
  discount,
  voucher,
  tax,
  shipping,
}: {
  price: number | string;
  discount: number | string;
  voucher: number | string;
  tax: number | string;
  shipping?: number | string;
}): number {
  const harga = toNum(price);
  const diskon = toNum(discount);
  const voucherNum = toNum(voucher);
  const pajak = toNum(tax);
  const ongkir =
    typeof shipping === "undefined" ? Math.round(harga * 0.05) : toNum(shipping);

  const diskonNominal = Math.round(harga * (diskon / 100));
  const subtotal = Math.max(0, harga - diskonNominal - voucherNum);
  const pajakNominal = Math.round(subtotal * (pajak / 100));
  const total = subtotal + pajakNominal + ongkir;
  return Math.max(0, total);
}

// ===== Hanya admin boleh upload (legacy penyimpanan ke localStorage) =====
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
    tax,
  }: {
    title?: string;
    name: string;
    price: string;          // tetap string karena disimpan ke localStorage
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
  if (
    images.some(
      (img) =>
        img.name === name && img.price === price && img.frontImage === frontImage
    )
  ) {
    return { ok: false, msg: "Produk sudah ada" };
  }

  const id = images.length > 0 ? images[images.length - 1].id + 1 : 1;

  // Hitung ongkir otomatis 5% dari harga
  let ongkir = "0";
  const numPrice = toNum(price);
  if (numPrice > 0) {
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
  return all.filter(
    (img) =>
      img.name.toLowerCase().includes(q) ||
      (img.title?.toLowerCase() || "").includes(q) ||
      img.productDetail.toLowerCase().includes(q)
  );
}

// Ganti semua title tertentu
export function renameTitleAllProducts(oldTitle: string, newTitle: string) {
  if (typeof window === "undefined") return { ok: false, msg: "No window" };
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { ok: false, msg: "No produk" };
  const arr = JSON.parse(raw);
  arr.forEach((img: any) => {
    const current = img.title?.trim() || "Tanpa Judul";
    if (current === oldTitle) {
      img.title = newTitle === "Tanpa Judul" ? "" : newTitle;
    }
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  return { ok: true };
}

// Dapatkan semua title unik
export function getAllProductTitles(): string[] {
  const all = getAllProductImages();
  const titles = new Set<string>();
  all.forEach((img) => {
    const t = img.title?.trim() || "";
    titles.add(t ? t : "Tanpa Judul");
  });
  return Array.from(titles);
}

export function deleteProductImage(
  id: number,
  adminEmail: string
): { ok: true } | { ok: false; msg: string } {
  if (typeof window === "undefined") return { ok: false, msg: "No window" };
  if (adminEmail !== "admin@dev.com") return { ok: false, msg: "Bukan admin" };
  const images = getAllProductImages();
  const newImages = images.filter((img) => img.id !== id);
  if (newImages.length === images.length)
    return { ok: false, msg: "Produk tidak ditemukan" };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newImages));
  return { ok: true };
}

// Hanya admin bisa lihat uploader & tanggal. User tidak dapat field itu.
export function getAvailableProductImages(
  role?: "admin" | "user"
): (ProductImage | Omit<ProductImage, "uploadedBy" | "createdAt">)[] {
  const data = getAllProductImages();
  if (role === "admin") return data;
  // Untuk user: hapus uploadedBy & createdAt
  return data.map(({ uploadedBy, createdAt, ...rest }) => rest);
}
