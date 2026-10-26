import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { authorView, dayKey, postInclude, publicPostWhere } from "@/lib/posts";
import { SITE_TAG } from "@/lib/revalidate";

export type Section = { title: string; paragraphs?: string[]; list?: string[] };
export type Attachment = { label: string; href: string; icon?: string };

/**
 * Leituras do site publico ficam no cache de dados do Next: a pagina nao
 * consulta o banco a cada visita. O cache e invalidado quando alguem
 * publica/edita pelo painel (revalidateSite) e expira sozinho em 10 min.
 * Obs.: o cache serializa em JSON, entao datas voltam como texto e sao
 * reconvertidas abaixo.
 */
const cached = <A extends unknown[], T>(key: string, fn: (...args: A) => Promise<T>) =>
  unstable_cache(fn, [key], { tags: [SITE_TAG], revalidate: 600 });

export const getSettings = cached("settings", async () => {
  const rows = await db.siteSetting.findMany();
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, string>;
  return {
    heroSubtitle: s.heroSubtitle ?? "Liga Acadêmica de Ciência de Dados e Inteligência Artificial",
    aboutText: s.aboutText ?? "",
    contactEmail: s.contactEmail ?? "lacid.ifs@gmail.com",
    instagramUrl: s.instagramUrl ?? "",
    footerText: s.footerText ?? "Liga Acadêmica de Ciência de Dados e IA - IFS",
  };
});

const fetchPosts = cached("posts", async () => {
  const posts = await db.post.findMany({
    where: publicPostWhere(),
    include: postInclude,
    orderBy: { publishedAt: "desc" },
  });
  return posts.map((p) => ({
    ...p,
    day: dayKey(p.publishedAt),
    sections: p.sections as unknown as Section[],
    attachments: p.attachments as unknown as Attachment[],
    postedBy: authorView(p.author),
  }));
});

export async function getPublishedPosts() {
  const posts = await fetchPosts();
  return posts.map((p) => ({ ...p, publishedAt: new Date(p.publishedAt) }));
}

const fetchPost = cached("post", async (slug: string) => {
  const post = await db.post.findFirst({
    where: { slug, ...publicPostWhere() },
    include: postInclude,
  });
  if (!post) return null;
  return {
    ...post,
    sections: post.sections as unknown as Section[],
    attachments: post.attachments as unknown as Attachment[],
    postedBy: authorView(post.author),
  };
});

export async function getPublishedPost(slug: string) {
  const post = await fetchPost(slug);
  return post && { ...post, publishedAt: new Date(post.publishedAt) };
}

const fetchHome = cached("home", async () => {
  const [slides, members, activities, events, latest] = await Promise.all([
    db.carouselSlide.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    db.member.findMany({ where: { active: true }, orderBy: [{ order: "asc" }, { name: "asc" }] }),
    db.activity.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    db.event.findMany({
      where: { published: true, startsAt: { gte: new Date(Date.now() - 24 * 3600 * 1000) } },
      orderBy: { startsAt: "asc" },
      take: 6,
    }),
    db.post.findFirst({ where: publicPostWhere(), orderBy: { publishedAt: "desc" } }),
  ]);
  return { slides, members, activities, events, latest };
});

export async function getHomeData() {
  const [settings, home] = await Promise.all([getSettings(), fetchHome()]);
  return {
    settings,
    ...home,
    events: home.events.map((e) => ({ ...e, startsAt: new Date(e.startsAt) })),
  };
}

/** Dados do cabecalho/rodape compartilhados por todas as paginas do site. */
export async function getChrome() {
  const [settings, home] = await Promise.all([getSettings(), fetchHome()]);
  return { settings, hasEvents: home.events.length > 0 };
}

const TZ = "America/Sao_Paulo";

export function formatDateLong(d: Date) {
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: TZ });
}

export function formatDateTime(d: Date) {
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  });
}
