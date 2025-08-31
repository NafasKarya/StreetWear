// store/types.ts (optional, biar clean)

export interface ProductSizeInput {
  size: string;
  price: number;
  stock: number;
}

export interface StoreProductPayload {
  title: string;
  name: string;
  description: string;
  expired_at: string;
  sizes: ProductSizeInput[];
  front_image: File | null;
  back_image: File | null;
  gallery_images: File[];
  category_name?: string;  // Tambahkan category_name, opsional untuk backend
}

export interface Product {
  id: number;
  uuid: string; // ← DITAMBAHKAN
  title: string;
  name: string;
  description: string;
  expired_at: string;
  sizes: ProductSizeInput[];
  front_image: string;
  back_image: string;
  gallery_images: string[];
  created_at: string;
  updated_at: string;
  category_uuid: string;  // Tambahkan category_uuid untuk mengaitkan dengan kategori
  category_name: string;  // Tambahkan category_name untuk menyimpan nama kategori
  category_slug: string;  // Tambahkan category_slug untuk menyimpan slug kategori
}

export interface ProductSize {
  size: string;
  price: string;
  stock: string;
}

export interface ProductFormData {
  title: string;
  name: string;
  description: string;
  expiredAt: string;
  sizes: ProductSize[];
  frontImage: File | null;
  backImage: File | null;
  galleryImages: File[];
  category_name?: string;  // Tambahkan category_name, opsional untuk backend
  category_uuid?: string;  // Tambahkan category_uuid, opsional untuk backend
  category_slug?: string;  // Tambahkan category_slug, opsional untuk backend
}

export interface UserProduct {
  id: number;
  uuid: string;
  title: string;
  name: string;
  price: number;
  stock: number;
  front_image: string;
  back_image: string;         // fallback "" via normalizer
  category_uuid: string;
  category_name: string;
  category_slug: string;
  expired_at?: string;        // optional
  [key: string]: unknown;
}