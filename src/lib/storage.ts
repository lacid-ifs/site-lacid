import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

/**
 * Uploads: Vercel Blob quando BLOB_READ_WRITE_TOKEN esta definido (producao),
 * senao disco local em ./uploads (desenvolvimento).
 */
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? "uploads");

export const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "application/pdf": ".pdf",
};

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export async function saveUpload(file: File): Promise<string> {
  const ext = ALLOWED_TYPES[file.type];
  const name = `${randomUUID()}${ext}`;

  // Producao (Vercel): com BLOB_READ_WRITE_TOKEN os arquivos vao para o Vercel Blob.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`uploads/${name}`, file, { access: "public", contentType: file.type });
    return blob.url;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

export async function readUpload(name: string): Promise<{ data: Buffer; type: string } | null> {
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp|gif|pdf)$/.test(name)) return null;
  try {
    const data = await readFile(path.join(UPLOAD_DIR, name));
    const type = Object.entries(ALLOWED_TYPES).find(([, ext]) => name.endsWith(ext))?.[0] ?? "application/octet-stream";
    return { data, type };
  } catch {
    return null;
  }
}
