import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

/**
 * Armazenamento em disco. Em hospedagem serverless (Vercel) o disco nao e
 * persistente: troque as duas funcoes abaixo por Vercel Blob / S3 / Supabase
 * Storage sem mexer no resto do codigo.
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
