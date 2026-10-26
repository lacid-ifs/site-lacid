import { PostEditor } from "@/components/admin/PostEditor";
import { requirePage } from "@/lib/guard";

export const metadata = { title: "Nova notícia" };

export default async function Page() {
  const user = await requirePage();
  return <PostEditor role={user.role} />;
}
