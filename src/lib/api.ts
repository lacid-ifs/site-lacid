import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export type SessionUser = { id: string; role: Role; name?: string | null };

/** Retorna o usuario logado ou null (rotas publicas). */
export async function currentUser(): Promise<SessionUser | null> {
  const session = await auth();
  return session?.user ? { id: session.user.id, role: session.user.role, name: session.user.name } : null;
}

/** Exige login e, opcionalmente, um dos papeis informados. */
export async function requireUser(roles?: Role[]): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) throw new HttpError(401, "Nao autenticado");
  if (roles && !roles.includes(user.role)) throw new HttpError(403, "Sem permissao");
  return user;
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/** Envolve um handler traduzindo erros em respostas JSON padronizadas. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof HttpError) return NextResponse.json({ error: err.message }, { status: err.status });
      if (err instanceof ZodError) {
        return NextResponse.json({ error: "Dados invalidos", issues: err.flatten() }, { status: 422 });
      }
      const code = (err as { code?: string }).code;
      if (code === "P2025") return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
      if (code === "P2002") return NextResponse.json({ error: "Registro duplicado" }, { status: 409 });
      console.error(err);
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  };
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, "JSON invalido");
  }
}
