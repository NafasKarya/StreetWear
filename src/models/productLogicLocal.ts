// src/models/productLogicLocal.ts

import type {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
} from "react";

import {
  ProductImage,
  getAvailableProductImages,
  uploadProductImage,
  deleteProductImage,
  renameTitleAllProducts,
} from "@/logic/productLogic";

// Helper: validasi & normalize role ke union yang benar
type Role = "admin" | "user";
function asRole(role?: string): Role | undefined {
  return role === "admin" || role === "user" ? role : undefined;
}

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
  const onlyNumber = val.replace(/[^\d]/g, "");
  if (!onlyNumber) return "Rp 0";
  return "Rp " + parseInt(onlyNumber, 10).toLocaleString("id-ID");
}

// Handlers for form & CRUD
export function handleFileChangeProduct(
  e: ChangeEvent<HTMLInputElement>,
  setUrl: (v: string) => void,
  setFile: (f: File | null) => void
) {
  const fileObj = e.target.files?.[0] ?? null;
  setFile(fileObj);
  if (fileObj) {
    const reader = new FileReader();
    reader.onloadend = () => setUrl(reader.result as string);
    reader.readAsDataURL(fileObj);
  }
}

export function handlePriceChangeProduct(
  e: ChangeEvent<HTMLInputElement>,
  setPrice: (raw: string) => void
) {
  const raw = e.target.value.replace(/[^\d]/g, "");
  setPrice(raw);
}

// === Upload product ===
export function handleUploadProduct({
  e,
  name,
  price,
  url,
  file,
  title,
  productDetail,
  discount,
  voucher,
  tax,
  currentUser,
  setError,
  setTitle,
  setName,
  setPrice,
  setUrl,
  setFile,
  setAdminImages,
}: {
  e: FormEvent<HTMLFormElement>;
  name: string;
  price: string;
  url?: string;
  file?: File | null;
  title?: string;
  productDetail?: string;
  discount?: string;
  voucher?: string;
  tax?: string;
  currentUser: { email?: string; role?: string } | null | undefined;
  setError: (msg: string | null) => void;
  setTitle: (v: string) => void;
  setName: (v: string) => void;
  setPrice: (v: string) => void;
  setUrl: (v: string) => void;
  setFile: (f: File | null) => void;
  setAdminImages: Dispatch<SetStateAction<ProductImage[]>>;
}) {
  e.preventDefault();
  setError(null);

  if (!name.trim() || !price.trim() || (!url && !file)) {
    setError("Nama, harga, dan gambar wajib");
    return;
  }
  if (!currentUser || asRole(currentUser.role) !== "admin") {
    setError("Hanya admin yang boleh upload");
    return;
  }

  uploadProductImage(
    {
      title: title || undefined,
      name,
      price,
      frontImage: url ?? "",
      productDetail: productDetail || "-",
      discount: discount || "0",
      voucher: voucher || "0",
      tax: tax || "0",
    },
    currentUser.email || ""
  );

  setTitle("");
  setName("");
  setPrice("");
  setUrl("");
  setFile(null);
  setAdminImages(
    getAvailableProductImages(asRole(currentUser.role)) as ProductImage[]
  );
}

export function handleDeleteProduct(
  id: string | number,
  currentUser: { email?: string; role?: string } | null | undefined,
  setAdminImages: Dispatch<SetStateAction<ProductImage[]>>
) {
  if (!currentUser || asRole(currentUser.role) !== "admin") return;

  const numericId = typeof id === "string" ? Number(id) : id;
  if (!Number.isFinite(numericId)) return;

  deleteProductImage(numericId, currentUser.email || "");

  setAdminImages(
    getAvailableProductImages(asRole(currentUser.role)) as ProductImage[]
  );
}

export function handleTitleClickProduct(
  oldTitle: string,
  currentUser: { role?: string } | null | undefined,
  setEditingTitle: Dispatch<SetStateAction<string | null>>,
  setTitleInput: (v: string) => void
) {
  if (asRole(currentUser?.role) !== "admin") return;
  setEditingTitle(oldTitle);
  setTitleInput(oldTitle === "Tanpa Judul" ? "" : oldTitle);
}

export function submitRenameTitleProduct({
  editingTitle,
  titleInput,
  setEditingTitle,
  setAdminImages,
  currentUser,
}: {
  editingTitle: string | null;
  titleInput: string;
  setEditingTitle: Dispatch<SetStateAction<string | null>>;
  setAdminImages: Dispatch<SetStateAction<ProductImage[]>>;
  currentUser: { role?: string } | null | undefined;
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
  setAdminImages(
    getAvailableProductImages(asRole(currentUser?.role)) as ProductImage[]
  );
}
