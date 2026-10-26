import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const postInclude = {
  author: { select: { id: true, name: true } },
} satisfies Prisma.PostInclude;

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export async function uniqueSlug(base: string, ignoreId?: string) {
  const root = slugify(base) || "noticia";
  let slug = root;
  let n = 2;
  for (;;) {
    const found = await db.post.findUnique({ where: { slug } });
    if (!found || found.id === ignoreId) return slug;
    slug = `${root}-${n++}`;
  }
}

/** Filtro de noticias visiveis ao publico. */
export function publicPostWhere(): Prisma.PostWhereInput {
  return { status: "PUBLISHED", publishedAt: { lte: new Date() } };
}

/** Dia (yyyy-mm-dd) no fuso de Sao Paulo. */
export function dayKey(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(d);
}

/** Campos de usuario seguros para devolver pela API (nunca a senha). */
export const publicUserFields = {
  id: true,
  name: true,
  email: true,
  role: true,
  active: true,
  createdAt: true,
} as const;
