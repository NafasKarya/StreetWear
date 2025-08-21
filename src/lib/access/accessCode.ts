import crypto from "crypto";

export type AccessTokenSpec = {
  length?: number; // bytes
  prefix?: string; // opsional, ex: "acs_"
};

export function generateAccessToken(spec: AccessTokenSpec = {}) {
  const { length = 32, prefix = "acs_" } = spec;
  const raw = crypto.randomBytes(length).toString("base64url"); // URL-safe
  return `${prefix}${raw}`;
}

export function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}
