// logic/categoryLogic.ts

const CATEGORY_KEY = "productCategories";

// Ambil semua kategori dari localStorage (array string)
export function getAllCategories(): string[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(CATEGORY_KEY);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Tambah kategori (cek duplikat, nama kosong)
export function addCategory(newCat: string): { ok: true } | { ok: false; msg: string } {
  if (typeof window === "undefined") return { ok: false, msg: "No window" };
  const name = newCat.trim();
  if (!name) return { ok: false, msg: "Nama kategori wajib" };
  let all = getAllCategories();
  if (all.includes(name)) return { ok: false, msg: "Kategori sudah ada" };
  all = [...all, name];
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(all));
  return { ok: true };
}

// Hapus kategori
export function deleteCategory(cat: string): { ok: true } | { ok: false; msg: string } {
  if (typeof window === "undefined") return { ok: false, msg: "No window" };
  let all = getAllCategories();
  if (!all.includes(cat)) return { ok: false, msg: "Kategori tidak ditemukan" };
  all = all.filter(c => c !== cat);
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(all));
  return { ok: true };
}
