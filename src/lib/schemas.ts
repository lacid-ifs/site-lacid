import { z } from "zod";

/** URL segura: http(s) ou caminho interno. Vazio/"#" vira null. */
const safeUrl = z.preprocess(
  (v) => (typeof v === "string" && (v.trim() === "" || v.trim() === "#") ? null : v),
  z
    .string()
    .trim()
    .max(2048)
    .refine((v) => /^https?:\/\//i.test(v) || (v.startsWith("/") && !v.startsWith("//")), {
      message: "Use uma URL http(s) ou um caminho comecando com /",
    })
    .nullable(),
);

const requiredUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => /^https?:\/\//i.test(v) || (v.startsWith("/") && !v.startsWith("//")), {
    message: "Use uma URL http(s) ou um caminho comecando com /",
  });

export const memberSchema = z.object({
  name: z.string().trim().min(1).max(120),
  role: z.string().trim().max(120).default("Membro da Liga"),
  course: z.string().trim().max(120).default(""),
  photoUrl: requiredUrl.default("/img/default_avatar.png"),
  linkedin: safeUrl.optional(),
  github: safeUrl.optional(),
  lattes: safeUrl.optional(),
  order: z.coerce.number().int().default(0),
  active: z.boolean().default(true),
});

export const carouselSchema = z.object({
  src: requiredUrl,
  alt: z.string().trim().max(200).default(""),
  order: z.coerce.number().int().default(0),
  active: z.boolean().default(true),
});

export const activitySchema = z.object({
  title: z.string().trim().min(1).max(120),
  subtitle: z.string().trim().max(160).default(""),
  text: z.string().trim().max(1000).default(""),
  icon: z.string().trim().regex(/^bi-[a-z0-9-]+$/, "Use o nome de um icone Bootstrap, ex.: bi-lightbulb-fill").default("bi-lightbulb-fill"),
  variant: z.enum(["inovacao", "extensao", "oficinas", "minicursos"]).default("inovacao"),
  order: z.coerce.number().int().default(0),
  active: z.boolean().default(true),
});

export const eventSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).default(""),
  location: z.string().trim().max(200).nullable().optional(),
  imageUrl: safeUrl.optional(),
  link: safeUrl.optional(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().nullable().optional(),
  published: z.boolean().default(true),
});

export const sectionSchema = z.object({
  title: z.string().trim().min(1).max(200),
  paragraphs: z.array(z.string().trim().max(5000)).default([]),
  list: z.array(z.string().trim().max(1000)).default([]),
});

export const attachmentSchema = z.object({
  label: z.string().trim().min(1).max(200),
  href: requiredUrl,
  icon: z.string().trim().regex(/^bi-[a-z0-9-]+$/).default("bi-file-earmark-text"),
});

export const postSchema = z.object({
  title: z.string().trim().min(1).max(250),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalido")
    .max(120)
    .optional(),
  homeTitle: z.string().trim().max(250).nullable().optional(),
  detailTitleLines: z.array(z.string().trim().max(120)).default([]),
  homeSummary: z.string().trim().max(3000).default(""),
  subtitle: z.string().trim().max(500).default(""),
  sections: z.array(sectionSchema).default([]),
  attachments: z.array(attachmentSchema).default([]),
  coverUrl: safeUrl.optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  publishedAt: z.coerce.date().optional(),
});

export const userCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(100),
  role: z.enum(["ADMIN", "EDITOR", "AUTHOR"]).default("AUTHOR"),
  active: z.boolean().default(true),
  memberId: z.preprocess((v) => (v === "" ? null : v), z.string().nullable()).optional(),
});

export const settingsSchema = z.record(z.string().regex(/^[a-zA-Z0-9_.-]{1,60}$/), z.union([z.string().max(5000), z.number(), z.boolean()]));
