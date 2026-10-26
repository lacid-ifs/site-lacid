import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/site/Reveal";
import { ReadingExtras } from "@/components/site/ReadingExtras";
import { formatDateLong, getPublishedPost } from "@/lib/content";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPublishedPost((await params).slug);
  return { title: post?.title ?? "Notícia" };
}

const safeHref = (href: string) => (/^https?:\/\//i.test(href) || href.startsWith("/") ? href : "#");

export default async function NoticiaPage({ params }: Props) {
  const post = await getPublishedPost((await params).slug);
  if (!post) notFound();

  const titleLines = post.detailTitleLines.length ? post.detailTitleLines : [post.title];

  return (
    <>
      <header className="header-breadcrumb">
        <Link href="/" className="icone-home">
          <i className="bi bi-house-door-fill" />
        </Link>
        <span className="separador">/</span>
        <Link href="/noticias" className="link-voltar">
          Notícias
        </Link>
      </header>

      <article className="layout-noticia-aberta">
        <div className="coluna-texto-noticia">
          <h1 className="titulo-principal-noticia">
            {titleLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < titleLines.length - 1 && <br />}
              </span>
            ))}
          </h1>
          {post.subtitle && (
            <p className="subtitulo-noticia">
              <em>{post.subtitle}</em>
            </p>
          )}
          <div className="author-box">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.postedBy.photoUrl} alt="" />
            <div>
              <strong>{post.postedBy.name}</strong>
              <span>
                {[post.postedBy.role, post.postedBy.course].filter(Boolean).join(" · ")} · {formatDateLong(post.publishedAt)}
              </span>
            </div>
          </div>
          {post.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverUrl} alt="" className="noticia-capa" />
          )}

          {post.sections.map((section, i) => (
            <section key={i} className="bloco-texto">
              <h3 className="topico-texto">{section.title}</h3>
              {(section.paragraphs ?? []).map((p, j) => (
                <p key={j}>{p}</p>
              ))}
              {section.list && section.list.length > 0 && (
                <ul className="lista-etapas">
                  {section.list.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <aside className="coluna-anexos">
          {post.attachments.length > 0 && (
            <div className="box-links">
              <h2 className="titulo-anexos">Anexos</h2>
              <ul className="lista-anexos">
                {post.attachments.map((a, i) => (
                  <li key={i}>
                    <a href={safeHref(a.href)} target="_blank" rel="noopener noreferrer">
                      <i className={`bi ${a.icon || "bi-file-earmark-text"}`} />
                      {a.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </article>

      <ReadingExtras />
      <Reveal selector=".bloco-texto, .box-links" />
    </>
  );
}
