// src/app/api/upload/[...path]/route.ts
import path from "path";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import { lookup as mimeLookup } from "mime-types";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    // Ambil path setelah /api/upload/ dari URL
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Sesuaikan jika kamu punya basePath, tapi /api/upload/ tetap jadi marker
    const marker = "/api/upload/";
    const idx = pathname.indexOf(marker);
    const rest = idx >= 0 ? pathname.slice(idx + marker.length) : "";

    // Pecah jadi array segmen (match [...path])
    const parts = rest
      ? rest.split("/").map((s) => decodeURIComponent(s)).filter(Boolean)
      : [];

    // route [...path] butuh minimal 1 segmen; kalau kosong, 404
    if (parts.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const BASE = path.join(process.cwd(), "public", "uploads");
    const absPath = path.join(BASE, ...parts);

    // prevent path traversal
    const rel = path.relative(BASE, absPath);
    if (rel.startsWith("..") || path.isAbsolute(rel)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const file = await fs.readFile(absPath).catch(() => null);
    if (!file) return new NextResponse("Not Found", { status: 404 });

    const looked = mimeLookup(absPath);
    const type = typeof looked === "string" ? looked : "application/octet-stream";

    // Kirim Buffer langsung (valid BodyInit)
return new NextResponse(new Uint8Array(file), {
  headers: {
    "Content-Type": type,
    "Content-Length": String(file.byteLength),
    "Cache-Control": "public, max-age=31536000, immutable",
  },
});

  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
