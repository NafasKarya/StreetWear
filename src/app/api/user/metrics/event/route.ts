// src/app/api/user/metrics/event/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { chartRepo } from "@/repositories/chartRepo";
import { requireAdmin } from "@/lib/auth/requireAdmin";

function parseNumberLike(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export const POST = async (req: NextRequest) => {
  // 0) Drop jika request punya sesi admin server-side
  const adminCtx = await requireAdmin(req);
  const isAdmin = !(adminCtx instanceof NextResponse);
  if (isAdmin) {
    return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  }

  // 0b) Drop kalau ada indikasi admin dari header/referer (belt & suspenders)
  const authHeader = req.headers.get("x-admin-access-token") || req.headers.get("authorization");
  const referer = (req.headers.get("referer") || "").toLowerCase();
  if (authHeader || referer.includes("/admins")) {
    return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const body = await req.json().catch(() => ({} as any));
    const now = new Date();

    const type = String(body?.type ?? "");
    const productId = body?.productId != null ? Number(body.productId) : null;
    const sizeLabel = typeof body?.sizeLabel === "string" ? body.sizeLabel : null;
    const qty = body?.qty != null ? Number(body.qty) : null;
    const sessionId = typeof body?.sessionId === "string" ? body.sessionId : null;
    const currency = typeof body?.currency === "string" ? body.currency : null;
    const metadata = body?.metadata ?? null;

    await chartRepo.logEvent({
      type,
      productId,
      sizeLabel,
      qty,
      amount: parseNumberLike((metadata && metadata.total) ?? body?.amount),
      currency,
      sessionId,
      metadata: { ...metadata, source: "public" },
    });

    switch (type) {
      case "ADD_TO_CART": {
        const inc = qty ?? 1;
        await chartRepo.upsertDaily(now, "add_to_cart", inc);
        if (productId) await chartRepo.upsertDaily(now, "add_to_cart", inc, `product=${productId}`);
        const price = parseNumberLike(metadata?.price);
        if (price != null) {
          await chartRepo.upsertDaily(now, "add_to_cart_value", price * inc);
          if (productId) await chartRepo.upsertDaily(now, "add_to_cart_value", price * inc, `product=${productId}`);
        }
        break;
      }
      case "REMOVE_FROM_CART": {
        const dec = qty ?? 1;
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
    console.error("[METRICS_EVENT_ERROR_USER]", e);
    return NextResponse.json(
      { ok: false, message: e?.message || "Gagal log metrics (user)" },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }
};
