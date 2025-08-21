import { z } from "zod";

export const SizeItem = z.object({
  label: z.string().min(1),
  stock: z.coerce.number().int().min(0),
  price: z.coerce.number().min(0).optional().default(0),
  /** NEW: mata uang per-size (default IDR) */
  currency: z.enum(["IDR", "USD", "MYR", "SGD"]).optional().default("IDR"),
});

export const CreateBodyJSON = z
  .object({
    imagesUrls: z.array(z.string().url()).min(1).max(5).optional(),
    frontImageUrl: z.string().url().optional(),
    backImageUrl: z.string().url().optional(),
    title: z.string().min(1, "Judul wajib"),
    description: z.string().min(1, "Deskripsi wajib"),
    category: z.string().min(1, "Kategori wajib"),
    sizes: z.array(SizeItem).min(1, "Minimal 1 ukuran"),
    expiresAt: z.string().datetime().optional(),
  })
  .refine(
    (data) => (data.imagesUrls && data.imagesUrls.length > 0) || !!data.frontImageUrl,
    { message: "Minimal sediakan 1 gambar: imagesUrls[0] atau frontImageUrl" }
  );

export const CreateBodyForm = z.object({
  title: z.string().min(1, "Judul wajib"),
  description: z.string().min(1, "Deskripsi wajib"),
  category: z.string().min(1, "Kategori wajib"),
  sizes: z
    .string()
    .min(2, "Sizes wajib")
    .transform((s) => {
      try {
        const arr = JSON.parse(s);
        return z.array(SizeItem).parse(arr); // <-- sudah termasuk currency
      } catch {
        throw new Error("Format sizes harus JSON array objek {label,stock,price,currency?}");
      }
    }),
  expiresAt: z.string().optional(),
});
