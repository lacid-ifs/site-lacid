import { readUpload } from "@/lib/storage";

type Ctx = { params: Promise<{ name: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { name } = await ctx.params;
  const file = await readUpload(name);
  if (!file) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.type,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
