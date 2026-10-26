import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Para paginas do painel: exige login e um dos papeis. */
export async function requirePage(roles?: Role[]) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (roles && !roles.includes(session.user.role)) redirect("/admin");
  return session.user;
}
