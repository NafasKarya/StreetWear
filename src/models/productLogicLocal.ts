// model/productLogicLocal.ts

import {
  ProductImage,
  getAvailableProductImages,
  uploadProductImage,
  deleteProductImage,
  renameTitleAllProducts,
} from "@/logic/productLogic";

// Group products by title
export function groupByTitle(products: ProductImage[]) {
  const grouped: { [key: string]: ProductImage[] } = {};
  products.forEach((p) => {
    const key = p.title?.trim() ? p.title.trim() : "Tanpa Judul";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  });
  return grouped;
}

// Format price: Rp
export function formatHargaRp(val: string) {
  let onlyNumber = val.replace(/[^\d]/g, "");
  if (!onlyNumber) return "Rp 0";
  return "Rp " + parseInt(onlyNumber, 10).toLocaleString("id-ID");
}

// Handlers for form & CRUD
export function handleFileChangeProduct(
  e: React.ChangeEvent<HTMLInputElement>,
  setUrl: any,
  setFile: any
) {
  const fileObj = e.target.files?.[0];
  setFile(fileObj || null);
  if (fileObj) {
    const reader = new FileReader();
    reader.onloadend = () => setUrl(reader.result as string);
    reader.readAsDataURL(fileObj);
  }
}

export function handlePriceChangeProduct(
  e: React.ChangeEvent<HTMLInputElement>,
  setPrice: any
) {
  let raw = e.target.value.replace(/[^\d]/g, "");
  setPrice(raw);
}

// === PENTING: PERBAIKI DI SINI, BIAR FIELD PRODUK NGGAK ADA YANG KOSONG ===
export function handleUploadProduct({
  e,
  name,
  price,
  url,           // frontImage BASE64 (hasil handleFileChangeProduct)
  file,          // file objek
  title,
  productDetail, // tambahkan dari form
  discount,      // tambahkan dari form
  voucher,       // tambahkan dari form
  tax,           // tambahkan dari form
  currentUser,
  setError,
  setTitle,
  setName,
  setPrice,
  setUrl,
  setFile,
  setAdminImages,
}) {
  e.preventDefault();
  setError(null);

  // Validasi minimal
  if (!name.trim() || !price.trim() || (!url && !file)) {
    setError("Nama, harga, dan gambar wajib");
    return;
  }
  if (!currentUser || currentUser.role !== "admin") {
    setError("Hanya admin yang boleh upload");
    return;
  }

  // Pastikan semua field KEISI
  uploadProductImage(
    {
      title: title || undefined,
      name,
      price,
      frontImage: url,
      productDetail: productDetail || "-",
      discount: discount || "0",
      voucher: voucher || "0",
      tax: tax || "0",
    },
    currentUser.email
  );

  setTitle("");
  setName("");
  setPrice("");
  setUrl("");
  setFile(null);
  setAdminImages(getAvailableProductImages(currentUser?.role) as ProductImage[]);
}

export function handleDeleteProduct(id, currentUser, setAdminImages) {
  if (!currentUser || currentUser.role !== "admin") return;
  deleteProductImage(id, currentUser.email);
  setAdminImages(getAvailableProductImages(currentUser?.role) as ProductImage[]);
}

export function handleTitleClickProduct(
  oldTitle,
  currentUser,
  setEditingTitle,
  setTitleInput
) {
  if (currentUser?.role !== "admin") return;
  setEditingTitle(oldTitle);
  setTitleInput(oldTitle === "Tanpa Judul" ? "" : oldTitle);
}

export function submitRenameTitleProduct({
  editingTitle,
  titleInput,
  setEditingTitle,
  setAdminImages,
  currentUser,
}) {
  if (editingTitle == null) return;
  const newTitle =
    titleInput.trim() === "" ? "Tanpa Judul" : titleInput.trim();
  if (newTitle === editingTitle) {
    setEditingTitle(null);
    return;
  }
  renameTitleAllProducts(editingTitle, newTitle);
  setEditingTitle(null);
  setAdminImages(getAvailableProductImages(currentUser?.role) as ProductImage[]);
}
