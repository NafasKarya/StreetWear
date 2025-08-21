// src/app/api/admin/metrics/event/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { chartRepo } from "@/repositories/chartRepo";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { requireAdminFeature } from "@/lib/auth/requireAdminFeature";

// --- utils ---
function parseNumberLike(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function badRequest(msg: string) {
  return NextResponse.json({ ok: false, message: msg }, { status: 400, headers: { "Cache-Control": "no-store" } });
}

function devError(e: any) {
  // balikkan detail supaya kamu lihat penyebab 500 di Network → Response
  const body = { ok: false, message: e?.message || "Server error", stack: e?.stack || String(e) };
  return NextResponse.json(body, { status: 500, headers: { "Cache-Control": "no-store" } });
}

const ALLOWED = new Set([
  "ADD_TO_CART",
  "REMOVE_FROM_CART",
  "PRODUCT_VIEW",
  "PRODUCT_IMAGE_VIEW",
  "SIZE_SELECTED",
  "CHECKOUT_CLICKED",
]);

export async function POST(req: NextRequest) {
  // ---- AUTH HYBRID persis versi kamu ----
  const authHeader = req.headers.get("x-admin-access-token") || req.headers.get("authorization");
  const ctx = authHeader ? await requireAdminFeature(req) : await requireAdmin(req);
  if (ctx instanceof NextResponse) return ctx; // 401/403 keluar rapi, bukan 500

  try {
    const body = await req.json().catch(() => ({} as any));
    const type = String(body?.type ?? "");

    if (!ALLOWED.has(type)) {
      return badRequest("type invalid/unsupported");
    }

    const now = new Date();
    const productId = body?.productId != null ? Number(body.productId) : null;
    const sizeLabel = typeof body?.sizeLabel === "string" ? body.sizeLabel : null;
    const qty = body?.qty != null ? Number(body.qty) : null;
    const sessionId = typeof body?.sessionId === "string" ? body.sessionId : null;
    const currency = typeof body?.currency === "string" ? body.currency : null;
    const metadata = body?.metadata ?? null;

    // --- LOG RAW EVENT ---
    await chartRepo.logEvent({
      type,
      productId,
      sizeLabel,
      qty,
      amount: parseNumberLike((metadata && metadata.total) ?? body?.amount),
      currency,
      sessionId,
      metadata, // jangan tambah field aneh2 di sini
    });

    // --- AGGREGATE (AMANKAN dim & angka) ---
    const inc = Math.max(1, qty ?? 1);
    switch (type) {
      case "ADD_TO_CART": {
        await chartRepo.upsertDaily(now, "add_to_cart", inc);
        if (productId) await chartRepo.upsertDaily(now, "add_to_cart", inc, `product=${productId}`);

        const price = parseNumberLike(metadata?.price);
        if (price != null) {
          const total = price * inc;
          await chartRepo.upsertDaily(now, "add_to_cart_value", total);
          if (productId) await chartRepo.upsertDaily(now, "add_to_cart_value", total, `product=${productId}`);
        }
        break;
      }

      case "REMOVE_FROM_CART": {
        const dec = Math.max(1, qty ?? 1);
        await chartRepo.upsertDaily(now, "remove_from_cart", dec);
        if (productId) await chartRepo.upsertDaily(now, "remove_from_cart", dec, `product=${productId}`);
        break;
      }

      case "PRODUCT_VIEW": {
        await chartRepo.upsertDaily(now, "product_view", 1);
        if (productId) await chartRepo.upsertDaily(now, "product_view", 1, `product=${productId}`);
        break;
      }

      case "PRODUCT_IMAGE_VIEW": {
        await chartRepo.upsertDaily(now, "product_image_view", 1);
        if (productId) await chartRepo.upsertDaily(now, "product_image_view", 1, `product=${productId}`);
        break;
      }

      case "SIZE_SELECTED": {
        await chartRepo.upsertDaily(now, "size_selected", 1);
        if (productId && sizeLabel) {
          await chartRepo.upsertDaily(now, "size_selected", 1, `product=${productId}|size=${sizeLabel}`);
        }
        break;
      }

      case "CHECKOUT_CLICKED": {
        await chartRepo.upsertDaily(now, "checkout_clicked", 1);
        break;
      }
    }

    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    console.error("[METRICS_EVENT_ERROR_ADMIN]", e);
    return devError(e);
  }
}
