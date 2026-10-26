import type { Role } from "@prisma/client";
import type { ZodObject, ZodRawShape } from "zod";
import { currentUser, HttpError, handle, ok, readJson, requireUser } from "@/lib/api";
import { revalidateSite } from "@/lib/revalidate";

type Delegate = {
  findMany(args?: object): Promise<unknown[]>;
  findUnique(args: object): Promise<unknown | null>;
  create(args: object): Promise<unknown>;
  update(args: object): Promise<unknown>;
  delete(args: object): Promise<unknown>;
};

type Options = {
  delegate: Delegate;
  schema: ZodObject<ZodRawShape>;
  /** Papeis que podem criar/editar/excluir (e ver registros nao publicos). */
  write: Role[];
  /** Filtro aplicado a quem nao tem permissao de escrita (visitantes). */
  publicWhere?: object;
  orderBy?: object | object[];
};

type Ctx = { params: Promise<{ id: string }> };

/**
 * Gera handlers REST padrao para uma colecao:
 *   GET /colecao       GET /colecao/:id
 *   POST /colecao      PATCH /colecao/:id      DELETE /colecao/:id
 */
export function crud({ delegate, schema, write, publicWhere, orderBy }: Options) {
  return {
    collection: {
      GET: handle(async () => {
        const user = await currentUser();
        const canSeeAll = !!user && write.includes(user.role);
        const items = await delegate.findMany({
          where: canSeeAll ? undefined : publicWhere,
          orderBy,
        });
        return ok(items);
      }),
      POST: handle(async (req: Request) => {
        await requireUser(write);
        const data = schema.parse(await readJson(req));
        const created = await delegate.create({ data });
        revalidateSite();
        return ok(created, 201);
      }),
    },
    item: {
      GET: handle(async (_req: Request, ctx: Ctx) => {
        const { id } = await ctx.params;
        const user = await currentUser();
        const canSeeAll = !!user && write.includes(user.role);
        const row = await delegate.findUnique({ where: { id } });
        if (!row) throw new HttpError(404, "Nao encontrado");
        if (!canSeeAll && publicWhere) {
          const visible = await delegate.findMany({ where: { AND: [{ id }, publicWhere] } });
          if (visible.length === 0) throw new HttpError(404, "Nao encontrado");
        }
        return ok(row);
      }),
      PATCH: handle(async (req: Request, ctx: Ctx) => {
        await requireUser(write);
        const { id } = await ctx.params;
        const data = schema.partial().parse(await readJson(req));
        const updated = await delegate.update({ where: { id }, data });
        revalidateSite();
        return ok(updated);
      }),
      DELETE: handle(async (_req: Request, ctx: Ctx) => {
        await requireUser(write);
        const { id } = await ctx.params;
        await delegate.delete({ where: { id } });
        revalidateSite();
        return ok({ ok: true });
      }),
    },
  };
}
