import path from "path";
import { promises as fs } from "fs";
import crypto from "crypto";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function detectExtFromMime(mime?: string | null): string {
  if (!mime) return "";
  if (mime.includes("jpeg") || mime.includes("jpg")) return ".jpg";
  if (mime.includes("png")) return ".png";
  if (mime.includes("webp")) return ".webp";
  if (mime.includes("gif")) return ".gif";
  if (mime.includes("avif")) return ".avif";
  return "";
}

function sanitizePrefix(prefix?: string) {
  return (prefix || "img").replace(/[^\w.\-]+/g, "_");
}

/**
 * Generate path relatif untuk simpan & akses file (misal: "2025/08/img-xxxx.jpg")
 */
function getRelativeUploadPath(filename: string, date = new Date()) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return path.posix.join(year, month, filename); // <-- pastikan selalu pake '/' bukan '\'
}

/**
 * Path absolut ke folder /public/uploads (buat simpan file)
 */
export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/**
 * Konversi path relatif ke URL public (buat FE/browser)
 * Selalu pakai '/' agar cross-platform
 */
export const toPublicUrl = (relativePath: string) => `/uploads/${relativePath.replace(/\\/g, '/')}`;

/**
 * Simpan file ke /public/uploads/{tahun}/{bulan}/, return path relatif siap dipakai FE.
 */
export async function saveFileToPublicUploads(
  file: File,
  prefix = "img",
  opts?: { maxSizeMB?: number }
): Promise<string> {
  if (!(file instanceof File)) throw new Error("Invalid file");
  if (file.size <= 0) throw new Error("Empty file");

  if (opts?.maxSizeMB && file.size > opts.maxSizeMB * 1024 * 1024) {
    throw new Error(`File terlalu besar (>${opts.maxSizeMB}MB)`);
  }

  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error(`Mime tidak didukung: ${file.type}`);
  }

  // Generate unique filename
  let ext = path.extname(file.name);
  if (!ext) {
    ext = detectExtFromMime(file.type) || ".jpg";
  }
  const safePrefix = sanitizePrefix(prefix);
  const fileName = `${safePrefix}-${crypto.randomUUID()}${ext}`;

  // Bikin path relatif dan path absolut
  const relativePath = getRelativeUploadPath(fileName);
  const absPath = path.join(UPLOAD_DIR, relativePath);

  // Pastikan folder ada
  await ensureDir(path.dirname(absPath));

  // Simpan file
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(absPath, buffer);

  // Return path relatif buat FE
  return relativePath.replace(/\\/g, "/"); // FE WAJIB pake ke toPublicUrl()!
}

/**
 * Simpan banyak gambar sekaligus, return array path relatif.
 */
export async function saveImages(
  files: File[],
  limit: number,
  prefix = "img",
  opts?: { maxSizeMB?: number }
): Promise<string[]> {
  if (files.length === 0) throw new Error("Minimal unggah 1 gambar");
  if (files.length > limit) throw new Error(`Maksimal ${limit} gambar`);

  const paths: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    if (!(f instanceof File) || f.size === 0) {
      throw new Error(`Gambar ke-${i + 1} tidak valid`);
    }
    if (!/^image\//.test(f.type)) {
      throw new Error(`Gambar ke-${i + 1} bukan file gambar yang valid`);
    }
    paths.push(await saveFileToPublicUploads(f, prefix, opts));
  }
  return paths;
}

/**
 * Helper validasi: deteksi path lama tanpa tahun/bulan (untuk data lama, opsional debug)
 */
export function isLegacyImagePath(imgPath: string) {
  // contoh: "upload_123.jpg" = legacy, "2025/08/upload_123.jpg" = ok
  return !/^\d{4}\/\d{2}\//.test(imgPath);
}
