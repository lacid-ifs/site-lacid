import bcrypt from "bcryptjs";
import { handle, ok, readJson, requireUser } from "@/lib/api";
import { db } from "@/lib/db";
import { publicUserFields } from "@/lib/posts";
import { userCreateSchema } from "@/lib/schemas";

export const GET = handle(async () => {
  await requireUser(["ADMIN"]);
  return ok(await db.user.findMany({ select: publicUserFields, orderBy: { createdAt: "asc" } }));
});

export const POST = handle(async (req: Request) => {
  await requireUser(["ADMIN"]);
  const data = userCreateSchema.parse(await readJson(req));
  const user = await db.user.create({
    data: { ...data, password: await bcrypt.hash(data.password, 12) },
    select: publicUserFields,
  });
  return ok(user, 201);
});
