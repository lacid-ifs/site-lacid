import { PostList } from "@/components/admin/PostList";
import { requirePage } from "@/lib/guard";

export const metadata = { title: "Notícias" };

export default async function Page() {
  const user = await requirePage();
  return <PostList role={user.role} userId={user.id} />;
}
