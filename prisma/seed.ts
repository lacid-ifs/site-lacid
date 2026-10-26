import { readFileSync } from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const read = <T>(file: string): T =>
  JSON.parse(readFileSync(path.join(__dirname, "seed-data", file), "utf8")) as T;

const abs = (p: string) => (p.startsWith("/") || /^https?:/.test(p) ? p : `/${p}`);
const link = (v?: string) => (!v || v.trim() === "#" ? null : v);

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@lacid.local").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password || password.length < 8) throw new Error("Defina SEED_ADMIN_PASSWORD (min. 8 caracteres) no .env");

  const admin = await db.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: process.env.SEED_ADMIN_NAME ?? "Administrador",
      password: await bcrypt.hash(password, 12),
      role: "ADMIN",
    },
  });

  // Carrossel
  const slides = read<{ slides: { src: string; alt: string }[] }>("carousel.json").slides;
  await db.carouselSlide.deleteMany();
  await db.carouselSlide.createMany({
    data: slides.map((s, i) => ({ src: abs(s.src), alt: s.alt, order: i })),
  });

  // Membros (ordem alfabetica, como no site original)
  const membros = read<{ membros: Record<string, string>[] }>("membros.json").membros.sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR"),
  );
  await db.member.deleteMany();
  await db.member.createMany({
    data: membros.map((m, i) => ({
      name: m.nome,
      role: m.cargo,
      course: m.curso,
      photoUrl: abs(m.foto),
      linkedin: link(m.linkedin),
      github: link(m.github),
      lattes: link(m.lattes),
      order: i,
    })),
  });

  // Noticias
  type SeedNews = {
    slug: string;
    title: string;
    homeTitle?: string;
    detailTitleLines?: string[];
    homeSummary: string;
    subtitle: string;
    publishedAt: string;
    sections: unknown[];
    attachments?: unknown[];
  };
  const news = read<{ news: SeedNews[] }>("news.json").news;
  for (const n of news) {
    const data = {
      title: n.title,
      homeTitle: n.homeTitle ?? null,
      detailTitleLines: n.detailTitleLines ?? [],
      homeSummary: n.homeSummary,
      subtitle: n.subtitle,
      sections: n.sections as object[],
      attachments: (n.attachments ?? []) as object[],
      status: "PUBLISHED" as const,
      publishedAt: new Date(`${n.publishedAt}T12:00:00-03:00`),
      authorId: admin.id,
    };
    await db.post.upsert({ where: { slug: n.slug }, update: data, create: { slug: n.slug, ...data } });
  }

  // Atividades (cards da home)
  await db.activity.deleteMany();
  await db.activity.createMany({
    data: [
      { title: "Inovação", subtitle: "Projetos e Pesquisa", icon: "bi-lightbulb-fill", variant: "inovacao", text: "Criamos soluções com IA e análise de dados para desafios reais, incentivando a experimentação e projetos." },
      { title: "Extensão", subtitle: "Comunidade e Impacto", icon: "bi-people-fill", variant: "extensao", text: "Levamos conhecimento em dados e IA para além da universidade por meio de eventos educacionais." },
      { title: "Oficinas", subtitle: "Aprendizado Prático", icon: "bi-tools", variant: "oficinas", text: "Oficinas mão na massa para aprender na prática ferramentas como Python e visualização de dados." },
      { title: "Minicursos", subtitle: "Formação Estruturada", icon: "bi-book-fill", variant: "minicursos", text: "Minicursos organizados por módulos para formação progressiva em Ciência de Dados e IA." },
    ].map((a, i) => ({ ...a, order: i })),
  });

  // Textos do site
  const settings: Record<string, string> = {
    heroSubtitle: "Liga Acadêmica de Ciência de Dados e Inteligência Artificial",
    aboutText:
      "A LACID é uma Liga Acadêmica voltada para a inovação, extensão e aprendizado de Ciência de Dados e Inteligência Artificial. Fundada, organizada e gerida por estudantes do Instituto Federal de Sergipe (IFS). Nosso objetivo é conectar discentes e pesquisadores para desenvolver soluções tecnológicas que impactem positivamente a comunidade local e externa :)",
    contactEmail: "lacid.ifs@gmail.com",
    instagramUrl: "https://www.instagram.com/lacid.ifs/",
    footerText: "Liga Acadêmica de Ciência de Dados e IA - IFS",
  };
  for (const [key, value] of Object.entries(settings)) {
    await db.siteSetting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  console.log(`Seed ok. Admin: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
