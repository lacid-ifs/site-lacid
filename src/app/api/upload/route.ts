import { HttpError, handle, ok, requireUser } from "@/lib/api";
import { ALLOWED_TYPES, MAX_UPLOAD_BYTES, saveUpload } from "@/lib/storage";

/** POST /api/upload  (multipart, campo "file") -> { url } */
export const POST = handle(async (req: Request) => {
  await requireUser(["ADMIN", "EDITOR", "AUTHOR"]);

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw new HttpError(400, 'Envie o arquivo no campo "file"');
  if (!ALLOWED_TYPES[file.type]) throw new HttpError(415, "Tipo nao permitido (jpg, png, webp, gif ou pdf)");
  if (file.size > MAX_UPLOAD_BYTES) throw new HttpError(413, "Arquivo maior que 10 MB");

  return ok({ url: await saveUpload(file), name: file.name }, 201);
});
