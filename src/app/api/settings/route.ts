import { handle, ok, readJson, requireUser } from "@/lib/api";
import { db } from "@/lib/db";
import { revalidateSite } from "@/lib/revalidate";
import { settingsSchema } from "@/lib/schemas";

/** GET /api/settings -> { chave: valor } (publico) */
export const GET = handle(async () => {
  const rows = await db.siteSetting.findMany();
  return ok(Object.fromEntries(rows.map((r) => [r.key, r.value])));
});

/** PUT /api/settings  corpo: { chave: valor, ... } (ADMIN/EDITOR) */
export const PUT = handle(async (req: Request) => {
  await requireUser(["ADMIN", "EDITOR"]);
  const data = settingsSchema.parse(await readJson(req));
  await db.$transaction(
    Object.entries(data).map(([key, value]) =>
      db.siteSetting.upsert({ where: { key }, create: { key, value }, update: { value } }),
    ),
  );
  revalidateSite();
  const rows = await db.siteSetting.findMany();
  return ok(Object.fromEntries(rows.map((r) => [r.key, r.value])));
});
