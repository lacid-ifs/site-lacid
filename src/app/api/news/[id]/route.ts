import { currentUser, HttpError, handle, ok, readJson, requireUser, type SessionUser } from "@/lib/api";
import { db } from "@/lib/db";
import { postInclude, uniqueSlug } from "@/lib/posts";
import { revalidateSite } from "@/lib/revalidate";
import { postSchema } from "@/lib/schemas";

type Ctx = { params: Promise<{ id: string }> };

/** Aceita id ou slug. */
async function findPost(idOrSlug: string) {
  return db.post.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    include: postInclude,
  });
}

/** AUTHOR so mexe nos proprios rascunhos; EDITOR/ADMIN em tudo. */
function assertCanModify(user: SessionUser, post: { authorId: string; status: string }) {
  if (user.role === "AUTHOR") {
    if (post.authorId !== user.id) throw new HttpError(403, "Voce so pode editar suas proprias noticias");
    if (post.status === "PUBLISHED") throw new HttpError(403, "Noticia publicada: peca a um editor");
  }
}

export const GET = handle(async (_req: Request, ctx: Ctx) => {
  const { id } = await ctx.params;
  const post = await findPost(id);
  if (!post) throw new HttpError(404, "Nao encontrado");

  const isPublic = post.status === "PUBLISHED" && post.publishedAt <= new Date();
  if (!isPublic) {
    const user = await currentUser();
    const allowed = user && (user.role !== "AUTHOR" || user.id === post.authorId);
    if (!allowed) throw new HttpError(404, "Nao encontrado");
  }
  return ok(post);
});

export const PATCH = handle(async (req: Request, ctx: Ctx) => {
  const user = await requireUser(["ADMIN", "EDITOR", "AUTHOR"]);
  const { id } = await ctx.params;
  const post = await findPost(id);
  if (!post) throw new HttpError(404, "Nao encontrado");
  assertCanModify(user, post);

  const data = postSchema.partial().parse(await readJson(req));
  if (user.role === "AUTHOR" && data.status === "PUBLISHED") {
    throw new HttpError(403, "Autores nao podem publicar");
  }
  const slug = data.slug && data.slug !== post.slug ? await uniqueSlug(data.slug, post.id) : undefined;

  const updated = await db.post.update({
    where: { id: post.id },
    data: { ...data, slug },
    include: postInclude,
  });
  revalidateSite();
  return ok(updated);
});

export const DELETE = handle(async (_req: Request, ctx: Ctx) => {
  const user = await requireUser(["ADMIN", "EDITOR", "AUTHOR"]);
  const { id } = await ctx.params;
  const post = await findPost(id);
  if (!post) throw new HttpError(404, "Nao encontrado");
  assertCanModify(user, post);

  await db.post.delete({ where: { id: post.id } });
  revalidateSite();
  return ok({ ok: true });
});
