import { notFound, redirect } from "next/navigation";
import { PostEditor, type PostData } from "@/components/admin/PostEditor";
import { db } from "@/lib/db";
import { requirePage } from "@/lib/guard";

export const metadata = { title: "Editar notícia" };
export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePage();
  const post = await db.post.findUnique({ where: { id: (await params).id } });
  if (!post) notFound();
  if (user.role === "AUTHOR" && (post.authorId !== user.id || post.status === "PUBLISHED")) redirect("/admin/noticias");

  const initial: PostData = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    homeTitle: post.homeTitle ?? "",
    detailTitleLines: post.detailTitleLines,
    homeSummary: post.homeSummary,
    subtitle: post.subtitle,
    sections: post.sections as PostData["sections"],
    attachments: post.attachments as PostData["attachments"],
    coverUrl: post.coverUrl ?? "",
    status: post.status,
    publishedAt: post.publishedAt.toISOString(),
  };
  return <PostEditor role={user.role} initial={initial} />;
}
