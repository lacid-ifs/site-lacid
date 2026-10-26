import bcrypt from "bcryptjs";
import { HttpError, handle, ok, readJson, requireUser } from "@/lib/api";
import { db } from "@/lib/db";
import { publicUserFields } from "@/lib/posts";
import { revalidateSite } from "@/lib/revalidate";
import { userCreateSchema } from "@/lib/schemas";

type Ctx = { params: Promise<{ id: string }> };

export const GET = handle(async (_req: Request, ctx: Ctx) => {
  await requireUser(["ADMIN"]);
  const { id } = await ctx.params;
  const user = await db.user.findUnique({ where: { id }, select: publicUserFields });
  if (!user) throw new HttpError(404, "Nao encontrado");
  return ok(user);
});

export const PATCH = handle(async (req: Request, ctx: Ctx) => {
  const admin = await requireUser(["ADMIN"]);
  const { id } = await ctx.params;
  const data = userCreateSchema.partial().parse(await readJson(req));

  if (id === admin.id && (data.role && data.role !== "ADMIN" || data.active === false)) {
    throw new HttpError(400, "Voce nao pode rebaixar ou desativar a propria conta");
  }
  const user = await db.user.update({
    where: { id },
    data: { ...data, password: data.password ? await bcrypt.hash(data.password, 12) : undefined },
    select: publicUserFields,
  });
  revalidateSite(); // perfil do autor aparece nas noticias
  return ok(user);
});

export const DELETE = handle(async (_req: Request, ctx: Ctx) => {
  const admin = await requireUser(["ADMIN"]);
  const { id } = await ctx.params;
  if (id === admin.id) throw new HttpError(400, "Voce nao pode excluir a propria conta");

  const posts = await db.post.count({ where: { authorId: id } });
  if (posts > 0) throw new HttpError(409, "Usuario tem noticias; desative-o em vez de excluir");

  await db.user.delete({ where: { id } });
  return ok({ ok: true });
});
