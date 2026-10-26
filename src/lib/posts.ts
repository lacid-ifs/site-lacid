import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const postInclude = {
  author: {
    select: {
      id: true,
      name: true,
      role: true,
      member: { select: { name: true, role: true, course: true, photoUrl: true } },
    },
  },
} satisfies Prisma.PostInclude;

const ROLE_LABEL = { ADMIN: "Administrador", EDITOR: "Editor", AUTHOR: "Autor" } as const;

/** Dados do postador: se o usuario esta vinculado a um membro, vale o perfil do membro. */
export function authorView(author: {
  name: string;
  role: keyof typeof ROLE_LABEL;
  member: { name: string; role: string; course: string; photoUrl: string } | null;
}) {
  return author.member
    ? { name: author.member.name, role: author.member.role, course: author.member.course, photoUrl: author.member.photoUrl }
    : { name: author.name, role: ROLE_LABEL[author.role], course: "", photoUrl: "/img/default_avatar.png" };
}

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
  memberId: true,
} as const;
