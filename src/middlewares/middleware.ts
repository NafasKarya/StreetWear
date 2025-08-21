// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/auth/adminAuth";
// Kalau verifyAdminJwt kamu edge-safe (pakai `jose`), import langsung:
import { verifyAdminJwt } from "@/lib/auth/adminAuth";

export async function middleware(req: NextRequest) {
  const { pathname, origin, search } = req.nextUrl;

  // Lindungi seluruh segmen admin
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value ?? "";

    let ok = false;
    if (token) {
      try {
        // Pastikan fungsi ini edge-safe (WebCrypto/jose), bukan jsonwebtoken Node
        const payload = await verifyAdminJwt(token);
        ok = !!payload;
      } catch {
        ok = false;
      }
    }

    if (!ok) {
      const url = new URL("/login", origin);
      // Bawa user balik ke page semula setelah login
      const next = pathname + (search || "");
      url.searchParams.set("next", next);
      return NextResponse.redirect(url);
    }
  }

  // Opsional: kalau user udah login & buka /login, balikin ke /admin
  if (pathname === "/login") {
    const token = req.cookies.get(ADMIN_COOKIE)?.value ?? "";
    if (token) {
      try {
        const payload = await verifyAdminJwt(token);
        if (payload) {
          const url = new URL("/admin", origin);
          return NextResponse.redirect(url);
        }
      } catch { /* abaikan */ }
    }
  }

  return NextResponse.next();
}

// Middleware defaultnya Edge; cukup batasi matcher ke segmen admin
export const config = {
  matcher: ["/admin/:path*", "/login"],
};
