import Link from "next/link";
import { NewsBrowser } from "@/components/site/NewsBrowser";
import { formatDateLong, getPublishedPosts } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata = { title: "Notícias" };

export default async function NoticiasPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <header className="header-noticias">
        <div className="breadcrumb">
          <Link href="/" aria-label="Página Inicial" className="icone-home">
            <i className="bi bi-house-door-fill" />
          </Link>
        </div>
        <h1 className="titulo-pagina">NOTÍCIAS</h1>
      </header>

      <NewsBrowser
        items={posts.map((p) => ({
          slug: p.slug,
          title: p.title,
          subtitle: p.subtitle,
          day: p.day,
          label: formatDateLong(p.publishedAt),
          coverUrl: p.coverUrl,
          sections: p.sections,
          attachments: p.attachments,
          author: p.postedBy,
        }))}
      />
    </>
  );
}
