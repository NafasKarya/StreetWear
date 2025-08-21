import jwt from "jsonwebtoken";
import { userRepo } from "@/repositories/userRepo";

type Fail =
  | { ok: false; status: 500; msg: "Server env setup belum lengkap" }
  | { ok: false; status: 403; msg: "Admin sudah ada. Setup ditutup." }
  | { ok: false; status: 401; msg: "Unauthorized" }
  | { ok: false; status: 403; msg: "Email tidak diizinkan jadi admin" };

type Ok = { ok: true };

export async function verifyInitialSetupAuth(req: Request, adminEmailEnv: string): Promise<Ok | Fail> {
  const SETUP_KEY = (process.env.ADMIN_SETUP_KEY ?? "").trim();
  const SETUP_JWT_SECRET = (process.env.SETUP_JWT_SECRET ?? "").trim();
  if (!SETUP_KEY || !SETUP_JWT_SECRET) {
    return { ok: false, status: 500, msg: "Server env setup belum lengkap" };
  }

  // Tutup kalau sudah pernah setup
  const flag = await userRepo.getSetting("SETUP_DONE");
  if (flag?.value === "1") {
    return { ok: false, status: 403, msg: "Admin sudah ada. Setup ditutup." };
  }

  // Header shared secret
  const setupKeyHeader = (req.headers.get("x-setup-key") ?? "").trim();
  if (setupKeyHeader !== SETUP_KEY) {
    return { ok: false, status: 401, msg: "Unauthorized" };
  }

  // Signed JWS (short-lived) di header
  const jws = req.headers.get("x-setup-jws") ?? "";
  let payload: any;
  try {
    payload = jwt.verify(jws, SETUP_JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    return { ok: false, status: 401, msg: "Unauthorized" };
  }

  const email = String(payload.email ?? "").trim().toLowerCase();
  const jti = String(payload.jti ?? "");
  if (!email || email !== adminEmailEnv) {
    return { ok: false, status: 403, msg: "Email tidak diizinkan jadi admin" };
  }
  if (!jti) {
    return { ok: false, status: 401, msg: "Unauthorized" };
  }

  // Nonce sekali pakai
  const nonceKey = `SETUP_NONCE:${jti}`;
  const seen = await userRepo.getSetting(nonceKey);
  if (seen) {
    return { ok: false, status: 401, msg: "Unauthorized" };
  }
  await userRepo.setSetting(nonceKey, "used");

  return { ok: true };
}
