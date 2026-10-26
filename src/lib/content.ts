import { cache } from "react";
import { db } from "@/lib/db";
import { authorView, dayKey, postInclude, publicPostWhere } from "@/lib/posts";

export type Section = { title: string; paragraphs?: string[]; list?: string[] };
export type Attachment = { label: string; href: string; icon?: string };

export const getSettings = cache(async () => {
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

export const getPublishedPosts = cache(async () => {
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

export async function getPublishedPost(slug: string) {
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
}

export async function getHomeData() {
  const [settings, slides, members, activities, events, latest] = await Promise.all([
    getSettings(),
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
  return { settings, slides, members, activities, events, latest };
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
