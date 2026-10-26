import { revalidateTag } from "next/cache";

export const SITE_TAG = "site";

/** Invalida os dados em cache do site publico (chamar apos qualquer escrita). */
export function revalidateSite() {
  revalidateTag(SITE_TAG);
}
