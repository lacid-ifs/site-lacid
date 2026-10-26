import { db } from "@/lib/db";
import { crud } from "@/lib/crud";
import { activitySchema, carouselSchema, eventSchema, memberSchema } from "@/lib/schemas";

const CONTENT_WRITERS = ["ADMIN", "EDITOR"] as const;

export const members = crud({
  delegate: db.member,
  schema: memberSchema,
  write: [...CONTENT_WRITERS],
  publicWhere: { active: true },
  orderBy: [{ order: "asc" }, { name: "asc" }],
});

export const carousel = crud({
  delegate: db.carouselSlide,
  schema: carouselSchema,
  write: [...CONTENT_WRITERS],
  publicWhere: { active: true },
  orderBy: { order: "asc" },
});

export const activities = crud({
  delegate: db.activity,
  schema: activitySchema,
  write: [...CONTENT_WRITERS],
  publicWhere: { active: true },
  orderBy: { order: "asc" },
});

export const events = crud({
  delegate: db.event,
  schema: eventSchema,
  write: [...CONTENT_WRITERS],
  publicWhere: { published: true },
  orderBy: { startsAt: "desc" },
});
