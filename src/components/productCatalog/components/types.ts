// Shared product types (dipakai di hooks & komponen lain)
export interface ProductItem {
  id: number;
  frontImageUrl: string;
  backImageUrl?: string | null;
  images?: string[];     // prefer dari API baru
  gallery?: string[];    // fallback dari galleryJson
  title: string;
  description: string;
  category: string;
  sizes: Array<{ label: string; stock: number; price?: number | string }>;
  isSoldOut: boolean;
  expiresAt?: string | null;
  createdAt: string;
  createdBy: string;
}
