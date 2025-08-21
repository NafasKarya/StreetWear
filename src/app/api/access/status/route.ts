export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/middlewares/requireUser";
import { userAccessRepo } from "@/repositories/userAccessRepo";
import { readAccessScopesFromRequest } from "@/lib/access/accessCookie";

export async function GET(req: NextRequest) {
  let u: any = null;
  try { u = await requireUser(req); } catch { u = null; }

  if (u && !(u instanceof NextResponse) && u?.id) {
    const scopes = await userAccessRepo.scopes(u.id);
    const isAdmin = u.role === "admin" || scopes.includes("product:*");
    return NextResponse.json({
      ok: true,
      source: "account",
      hasAccess: isAdmin || scopes.length > 0,
      scopes,
    });
  }

  // guest → baru lihat cookie
  const cookieScopes = await readAccessScopesFromRequest();
  return NextResponse.json({
    ok: true,
    source: "cookie",
    hasAccess: cookieScopes.length > 0,
    scopes: cookieScopes,
  });
}
