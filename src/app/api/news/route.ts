import type { Prisma } from "@prisma/client";
import { currentUser, handle, ok, readJson, requireUser } from "@/lib/api";
import { db } from "@/lib/db";
import { postInclude, publicPostWhere, uniqueSlug } from "@/lib/posts";
import { postSchema } from "@/lib/schemas";

/**
 * GET /api/news
 *   publico: so noticias publicadas
 *   ?manage=1 (logado): AUTHOR ve as proprias (todos os status); EDITOR/ADMIN veem todas
 *   ?q=texto  busca no titulo
 */
export const GET = handle(async (req: Request) => {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  const manage = url.searchParams.get("manage") === "1";

  let where: Prisma.PostWhereInput = publicPostWhere();
  if (manage) {
    const user = await requireUser();
    where = user.role === "AUTHOR" ? { authorId: user.id } : {};
  } else {
    await currentUser();
  }
  if (q) where = { AND: [where, { title: { contains: q, mode: "insensitive" } }] };

  const posts = await db.post.findMany({
    where,
    include: postInclude,
    orderBy: { publishedAt: "desc" },
  });
  return ok(posts);
});

export const POST = handle(async (req: Request) => {
  const user = await requireUser(["ADMIN", "EDITOR", "AUTHOR"]);
  const data = postSchema.parse(await readJson(req));

  // Autores so criam rascunhos; quem publica e EDITOR/ADMIN.
  const status = user.role === "AUTHOR" ? "DRAFT" : data.status;
  const slug = await uniqueSlug(data.slug ?? data.title);

  const post = await db.post.create({
    data: { ...data, slug, status, authorId: user.id, publishedAt: data.publishedAt ?? new Date() },
    include: postInclude,
  });
  return ok(post, 201);
});
