// src/app/api/admin/products/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { requireAdmin } from "@/lib/auth/requireAdmin";
import { productRepo } from "@/repositories/productRepo";
import { categoryRepo } from "@/repositories/categoryRepo"; // ⬅️ kategori

import { saveFileToPublicUploads, saveImages } from "./helpers/fileUpload";
import { computeIsSoldOut } from "./helpers/stock";
import { CreateBodyForm, CreateBodyJSON } from "./schemas/productSchemas";
import { mapSizesForOut } from "./helpers/currency";


// --- helper: normalisasi JsonValue -> array untuk sizes ---
const toSizesArray = (v: unknown): any[] => (Array.isArray(v) ? (v as any[]) : []);

// ---- POST /api/admin/products ----
export const POST = async (req: NextRequest) => {
  const ctx = await requireAdmin(req);
  if (ctx instanceof NextResponse) return ctx; // 401

  try {
    const ct = req.headers.get("content-type") || "";

    // ====== Mode MULTIPART (upload file) ======
    if (ct.startsWith("multipart/form-data")) {
      const form = await req.formData();

      // files
      const galleryFiles = form.getAll("gallery").filter((v) => v instanceof File) as File[];
      const imagesFiles = form.getAll("images").filter((v) => v instanceof File) as File[];
      const frontImage = form.get("frontImage");
      const backImage = form.get("backImage");

      const hasFrontFile = frontImage instanceof File && frontImage.size > 0;
      const hasBackFile = backImage instanceof File && backImage.size > 0;
      if (!hasFrontFile && galleryFiles.length === 0 && imagesFiles.length === 0) {
        return NextResponse.json(
          { ok: false, message: "Unggah minimal 1 gambar: frontImage ATAU gallery[] ATAU images[]" },
          { status: 400 }
        );
      }
      if (galleryFiles.length > 12) {
        return NextResponse.json({ ok: false, message: "Galeri maksimal 12 gambar" }, { status: 400 });
      }
      if (imagesFiles.length > 5) {
        return NextResponse.json({ ok: false, message: "Field 'images' maksimal 5 gambar" }, { status: 400 });
      }

      // fields
      const title = String(form.get("title") ?? "");
      const productNameRaw = String(form.get("productName") ?? ""); // ⬅️ NEW
      const productName = productNameRaw.trim() || title; // fallback ke title
      const description = String(form.get("description") ?? "");
      const category = String(form.get("category") ?? "");
      const sizesRaw = String(form.get("sizes") ?? "[]");
      const expiresAtRaw = String(form.get("expiresAt") ?? "");

      const parsed = CreateBodyForm.parse({
        title,
        description,
        category,
        sizes: sizesRaw, // {label, stock, price, currency}
        expiresAt: expiresAtRaw || undefined,
      });

      // ⬇️⬇️ NEW: baca & validasi hidden + scope (multipart)
      const isHiddenRaw = String(form.get("isHidden") ?? "");
      const hiddenScopeRaw = String(form.get("hiddenScope") ?? "");
      const isHidden = ["true", "1", "on", "yes"].includes(isHiddenRaw.toLowerCase());
      const hiddenScope = (hiddenScopeRaw || "").trim() || null;

      if (isHidden && !hiddenScope) {
        return NextResponse.json(
          { ok: false, message: "Hidden Scope wajib diisi saat produk disembunyikan." },
          { status: 400 }
        );
      }

      // pastikan kategori ada
      await categoryRepo.ensure(parsed.category);

      // simpan file
      let frontImageUrl: string | null = null;
      let backImageUrl: string | null = null;
      const galleryUrls: string[] = [];
      const extraFromImages: string[] = [];

      if (hasFrontFile) frontImageUrl = await saveFileToPublicUploads(frontImage as File, "front");
      if (hasBackFile) backImageUrl = await saveFileToPublicUploads(backImage as File, "back");
      if (galleryFiles.length > 0) galleryUrls.push(...(await saveImages(galleryFiles, 12, "gallery")));
      if (imagesFiles.length > 0) {
        const urls = await saveImages(imagesFiles, 5, "product");
        if (!frontImageUrl) frontImageUrl = urls.shift() || null;
        if (!backImageUrl && urls.length > 0) backImageUrl = urls.shift() || null;
        extraFromImages.push(...urls);
      }
      if (!frontImageUrl && (galleryUrls.length > 0 || extraFromImages.length > 0)) {
        const fallback = galleryUrls.length > 0 ? galleryUrls.shift()! : extraFromImages.shift()!;
        frontImageUrl = fallback;
      }
      const finalGallery = [...galleryUrls, ...extraFromImages];

      // persist
      const created = await productRepo.create({
        frontImageUrl: frontImageUrl!, // pasti ada
        backImageUrl: backImageUrl ?? null,
        galleryJson: finalGallery,
        title: parsed.title,
        productName, // ⬅️ NEW
        description: parsed.description,
        category: parsed.category,
        sizesJson: parsed.sizes,
        expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : null,
        createdBy: ctx.email,

        // ⬇️ SIMPAN KE DB
        isHidden,
        hiddenScope,
      } as any); // <-- kalau typing repo belum ada fieldnya, sudah aman via any

      // ✅ normalisasi sizesJson sebelum dipakai helper2
      const sizesArr = toSizesArray(created.sizesJson);
      const isSoldOut = computeIsSoldOut(sizesArr as any);
      const sizesOut = mapSizesForOut(sizesArr);

      return NextResponse.json(
        {
          ok: true,
          data: {
            id: created.id,
            images: [frontImageUrl!, ...(backImageUrl ? [backImageUrl] : []), ...finalGallery],
            frontImageUrl: frontImageUrl!,
            backImageUrl: backImageUrl ?? null,
            gallery: finalGallery,
            title: created.title,
            productName: created.productName ?? productName, // ⬅️ NEW
            description: created.description,
            category: created.category,
            sizes: sizesOut,
            isSoldOut,
            expiresAt: created.expiresAt,
            createdAt: created.createdAt,
            createdBy: created.createdBy,

            // ⬇️ expose status hidden
            isHidden: created.isHidden,
            hiddenScope: created.hiddenScope,
          },
          note: "Produk berhasil dibuat (gallery maks 12; images lama tetap didukung).",
        },
        { status: 201 }
      );
    }

    // ====== Mode JSON (fallback) ======
    const json = await req.json();
    const body = CreateBodyJSON.parse(json);
    const productNameRaw =
      typeof (json as any)?.productName === "string" ? (json as any).productName : ""; // ⬅️ NEW
    const productName = (productNameRaw || body.title || "").trim() || body.title;

    // ⬇️⬇️ NEW: baca & validasi hidden + scope (JSON)
    const jsonIsHidden = !!(json as any)?.isHidden;
    const jsonHiddenScope =
      typeof (json as any)?.hiddenScope === "string" ? (json as any).hiddenScope.trim() : null;

    if (jsonIsHidden && !jsonHiddenScope) {
      return NextResponse.json(
        { ok: false, message: "Hidden Scope wajib diisi saat produk disembunyikan." },
        { status: 400 }
      );
    }

    await categoryRepo.ensure(body.category);

    const imagesFromJson =
      body.imagesUrls && body.imagesUrls.length > 0
        ? body.imagesUrls
        : [body.frontImageUrl!, ...(body.backImageUrl ? [body.backImageUrl] : [])];

    if (imagesFromJson.length > 5) {
      return NextResponse.json({ ok: false, message: "Maksimal 5 URL gambar" }, { status: 400 });
    }

    const [frontImageUrl, backImageUrl, ...galleryUrls] = imagesFromJson;

    const created = await productRepo.create({
      frontImageUrl,
      backImageUrl: backImageUrl ?? null,
      galleryJson: galleryUrls,
      title: body.title,
      productName, // ⬅️ NEW
      description: body.description,
      category: body.category,
      sizesJson: body.sizes,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      createdBy: ctx.email,

      // ⬇️ SIMPAN KE DB (JSON)
      isHidden: jsonIsHidden,
      hiddenScope: jsonIsHidden ? jsonHiddenScope : null,
    } as any);

    // ✅ normalisasi sizesJson sebelum dipakai helper2
    const sizesArr = toSizesArray(created.sizesJson);
    const isSoldOut = computeIsSoldOut(sizesArr as any);
    const sizesOut = mapSizesForOut(sizesArr);

    return NextResponse.json(
      {
        ok: true,
        data: {
          id: created.id,
          images: [frontImageUrl, ...(backImageUrl ? [backImageUrl] : []), ...galleryUrls],
          frontImageUrl,
          backImageUrl: backImageUrl ?? null,
          gallery: galleryUrls,
          title: created.title,
          productName: created.productName ?? productName, // ⬅️ NEW
          description: created.description,
          category: created.category,
          sizes: sizesOut,
          isSoldOut,
          expiresAt: created.expiresAt,
          createdAt: created.createdAt,
          createdBy: created.createdBy,

          // ⬇️ expose status hidden
          isHidden: created.isHidden,
          hiddenScope: created.hiddenScope,
        },
        note: "Produk berhasil dibuat (mode JSON, maksimal 5 URL).",
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("[PRODUCT_CREATE_ERROR]", e);
    const isDev = process.env.NODE_ENV !== "production";

    if (e?.issues) {
      return NextResponse.json(
        { ok: false, dev: isDev, type: "ZodError", message: "Body invalid", issues: e.issues },
        { status: 400 }
      );
    }

    if (isDev) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        return NextResponse.json(
          { ok: false, dev: true, type: "KnownRequestError", code: e.code, meta: e.meta, message: e.message },
          { status: 500 }
        );
      }
      if (e instanceof Prisma.PrismaClientValidationError) {
        return NextResponse.json({ ok: false, dev: true, type: "ValidationError", message: e.message }, { status: 400 });
      }
      return NextResponse.json({ ok: false, dev: true, type: e?.name || "Error", message: e?.message || String(e) }, { status: 500 });
    }

    return NextResponse.json({ ok: false, message: "Gagal membuat produk" }, { status: 500 });
  }
};

// ---- GET /api/admin/products ----
export const GET = async (req: NextRequest) => {
  const ctx = await requireAdmin(req);
  if (ctx instanceof NextResponse) return ctx;

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? undefined;
    const page = Number(searchParams.get("page") ?? "1");
    const pageSize = Number(searchParams.get("pageSize") ?? "20");

    const result = await productRepo.list({ q, page, pageSize });

    const items = result.items.map((it) => {
      const sizesArr = toSizesArray(it.sizesJson);
      const sizesOut = mapSizesForOut(sizesArr);
      const gallery = Array.isArray((it as any).galleryJson) ? (it as any).galleryJson : [];
      return {
        id: it.id,
        images: [it.frontImageUrl, ...(it.backImageUrl ? [it.backImageUrl] : []), ...gallery],
        frontImageUrl: it.frontImageUrl,
        backImageUrl: it.backImageUrl,
        gallery,
        title: it.title,
        productName: (it as any).productName ?? it.title, // ⬅️ NEW
        description: it.description,
        category: it.category,
        sizes: sizesOut,
        isSoldOut: computeIsSoldOut(sizesArr as any),
        expiresAt: it.expiresAt,
        createdAt: it.createdAt,
        createdBy: it.createdBy,

        // ⬇️ expose status hidden di admin list
        isHidden: (it as any).isHidden ?? false,
        hiddenScope: (it as any).hiddenScope ?? null,
      };
    });

    return NextResponse.json({
      ok: true,
      items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    });
  } catch (e: any) {
    console.error("[PRODUCT_LIST_ERROR]", e);
    return NextResponse.json(
      { ok: false, message: e?.message || "Gagal mengambil list" },
      { status: 500 }
    );
  }
};

// ---- DELETE /api/admin/products?id=:id ----
export const DELETE = async (req: NextRequest) => {
  const ctx = await requireAdmin(req);
  if (ctx instanceof NextResponse) return ctx;

  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ ok: false, message: "ID produk wajib" }, { status: 400 });
    }

    await productRepo.delete(id, ctx.email ?? null);

    return NextResponse.json({ ok: true, message: "Produk berhasil dihapus" });
  } catch (e: any) {
    console.error("[PRODUCT_DELETE_ERROR]", e);
    return NextResponse.json(
      { ok: false, message: e?.message || "Gagal menghapus produk" },
      { status: 500 }
    );
  }
};
