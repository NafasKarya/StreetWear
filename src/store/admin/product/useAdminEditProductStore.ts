import { create } from "zustand";
import { ADMIN_EDIT_PRODUCT_URL } from "@/config/api-endpoints";
import { StoreProductPayload } from "@/store/type/types";


interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
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

interface EditProductState {
  loading: boolean;
  error: string | null;
  success: boolean;
  editProduct: (uuid: string, data: StoreProductPayload) => Promise<boolean>;
  reset: () => void;
}

export const useEditProductStore = create<EditProductState>((set) => ({
  loading: false,
  error: null,
  success: false,

  // === EDIT PRODUCT ===
  editProduct: async (uuid, data) => {
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

      // Laravel method override
      formData.append("_method", "PATCH");

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const response = await fetch(`${ADMIN_EDIT_PRODUCT_URL}/${uuid}`, {
        method: "POST", // pakai POST + _method=PATCH
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const resJson = await response.json().catch(() => null);

      if (!response.ok) {
        const message = isErrorResponse(resJson)
          ? resJson.message
          : "Update produk gagal";
        throw new Error(message);
      }

      set({ loading: false, success: true });
      return true;
    } catch (err) {
      set({ loading: false, error: extractError(err), success: false });
      return false;
    }
  },

  reset: () => set({ loading: false, error: null, success: false }),
}));
