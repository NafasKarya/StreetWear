import { create } from "zustand";
import {
  ADMIN_STORE_PRODUCTS_URL,
  ADMIN_GET_PRODUCTS_URL,
  ADMIN_GET_SEARCH_URL,
  ADMIN_LOGIN_URL,
  ADMIN_DELETE_PRODUCTS_URL,
  ADMIN_SHOW_PRODUCT_URL,
} from "@/config/api-endpoints";
import { Product, StoreProductPayload } from "@/store/type/types";

interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

interface AdminProductStoreState {
  loading: boolean;
  error: string | null;
  success: boolean;
  products: Product[];
  productDetail: Product | null;
  categories: string[];
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  storeProduct: (data: StoreProductPayload) => Promise<void>;
  // ⬇️ INI YANG DIUBAH!
  getAdminProducts: (search?: string, selectedCategory?: string) => Promise<void>;
  getProductDetail: (uuid: string) => Promise<void>;
  deleteProduct: (uuid: string) => Promise<void>;
  getCategoriesFromProducts: () => void;
  reset: () => void;
}

function isErrorResponse(val: unknown): val is ErrorResponse {
  return (
    typeof val === "object" &&
    val !== null &&
    "message" in val &&
    typeof (val as { message: unknown }).message === "string"
  );
}

function extractError(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  return "Terjadi kesalahan tidak diketahui";
}

export const useAdminProductStore = create<AdminProductStoreState>((set, get) => ({
  loading: false,
  error: null,
  success: false,
  products: [],
  productDetail: null,
  categories: [],
  token:
    typeof window !== "undefined" ? localStorage.getItem("token") || null : null,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(ADMIN_LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const resJson = await response.json().catch(() => null);

      if (!response.ok) {
        const message = isErrorResponse(resJson)
          ? resJson.message
          : "Login gagal";
        throw new Error(message);
      }

      const token = resJson?.token;
      if (!token) throw new Error("Token tidak ditemukan");

      localStorage.setItem("token", token);
      set({ token, loading: false, success: true });
    } catch (err) {
      set({ loading: false, error: extractError(err), success: false });
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, products: [], productDetail: null, success: false });
    if (typeof window !== "undefined") {
      window.location.href = "/admins/login";
    }
  },

  storeProduct: async (data) => {
    set({ loading: true, error: null, success: false });
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("expired_at", data.expired_at);

      data.sizes.forEach((sz, i) => {
        formData.append(`sizes[${i}][size]`, sz.size);
        formData.append(`sizes[${i}][price]`, sz.price.toString());
        formData.append(`sizes[${i}][stock]`, sz.stock.toString());
      });

      if (data.front_image) formData.append("front_image", data.front_image);
      if (data.back_image) formData.append("back_image", data.back_image);
      data.gallery_images.forEach((img) => {
        formData.append("gallery_images[]", img);
      });

      if (data.category_name) {
        formData.append("category_name", data.category_name);
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const response = await fetch(ADMIN_STORE_PRODUCTS_URL, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const resJson = await response.json().catch(() => null);

      if (response.status === 401) {
        localStorage.removeItem("token");
        set({ token: null });
        if (typeof window !== "undefined") {
          window.location.href = "/admins/login";
        }
        return;
      }

      if (!response.ok) {
        const message = isErrorResponse(resJson)
          ? resJson.message
          : "Upload produk gagal";
        throw new Error(message);
      }

      set({ loading: false, success: true });
    } catch (err) {
      set({ loading: false, error: extractError(err), success: false });
    }
  },

  // ⬇️ PERHATIKAN: Sekarang support 2 argumen!
  getAdminProducts: async (search = "", selectedCategory = "") => {
    set({ loading: true, error: null });
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      // Gabungkan pencarian dengan kategori
      let url = `${ADMIN_GET_PRODUCTS_URL}`;
      if (search.trim() !== "" || selectedCategory !== "") {
        url = `${ADMIN_GET_SEARCH_URL}?search=${encodeURIComponent(search)}&category=${encodeURIComponent(selectedCategory)}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: "application/json",
        },
      });

      const resJson = await response.json().catch(() => null);

      if (response.status === 401) {
        localStorage.removeItem("token");
        set({ token: null });
        if (typeof window !== "undefined") {
          window.location.href = "/admins/auth/login";
        }
        return;
      }

      if (!response.ok) {
        const message = isErrorResponse(resJson) ? resJson.message : "Gagal mengambil data produk";
        throw new Error(message);
      }

      set({ loading: false, products: resJson.products || [] });
      get().getCategoriesFromProducts(); // Ambil kategori dari produk yang didapat
    } catch (err) {
      set({ loading: false, error: extractError(err) });
    }
  },

  getCategoriesFromProducts: () => {
    const products = get().products;
    const categories = [...new Set(products.map((product) => product.category_name))];
    set({ categories });
  },

  getProductDetail: async (uuid: string) => {
    set({ loading: true, error: null });
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(`${ADMIN_SHOW_PRODUCT_URL}/${uuid}`, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: "application/json",
        },
      });
      const resJson = await response.json().catch(() => null);
      if (!response.ok) throw new Error(resJson?.message || "Gagal ambil detail produk");
      set({ loading: false, productDetail: resJson.product });
    } catch (err) {
      set({ loading: false, error: extractError(err), productDetail: null });
    }
  },

  deleteProduct: async (uuid: string) => {
    set({ loading: true, error: null, success: false });
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const response = await fetch(`${ADMIN_DELETE_PRODUCTS_URL}/${uuid}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: "application/json",
        },
      });

      const resJson = await response.json().catch(() => null);

      if (response.status === 401) {
        localStorage.removeItem("token");
        set({ token: null });
        if (typeof window !== "undefined") {
          window.location.href = "/admins/auth/login";
        }
        return;
      }

      if (!response.ok) {
        const message = isErrorResponse(resJson)
          ? resJson.message
          : "Gagal menghapus produk";
        throw new Error(message);
      }

      await get().getAdminProducts();
      set({ loading: false, success: true });
    } catch (err) {
      set({ loading: false, error: extractError(err), success: false });
    }
  },

  reset: () =>
    set({
      loading: false,
      error: null,
      success: false,
      products: [],
      productDetail: null,
      token: null,
      categories: [],
    }),
}));
