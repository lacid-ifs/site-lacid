import Link from "next/link";
import { db } from "@/lib/db";
import { requirePage } from "@/lib/guard";

export const metadata = { title: "Início" };
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await requirePage();
  const isAuthor = user.role === "AUTHOR";
  const mine = isAuthor ? { authorId: user.id } : {};

  const [published, drafts, events, members, slides] = await Promise.all([
    db.post.count({ where: { ...mine, status: "PUBLISHED" } }),
    db.post.count({ where: { ...mine, status: "DRAFT" } }),
    db.event.count(),
    db.member.count(),
    db.carouselSlide.count(),
  ]);

  return (
    <>
      <div className="adm-head">
        <h1>Olá, {user.name?.split(" ")[0]}!</h1>
        <Link className="btn" href="/admin/noticias/nova">
          <i className="bi bi-plus-lg" /> Nova notícia
        </Link>
      </div>
      <div className="adm-stats">
        <div className="adm-stat"><strong>{published}</strong> notícias publicadas</div>
        <div className="adm-stat"><strong>{drafts}</strong> rascunhos</div>
        {!isAuthor && (
          <>
            <div className="adm-stat"><strong>{events}</strong> eventos</div>
            <div className="adm-stat"><strong>{members}</strong> membros</div>
            <div className="adm-stat"><strong>{slides}</strong> slides</div>
          </>
        )}
      </div>
      <div className="adm-card">
        <h2 style={{ marginBottom: 8 }}>Seu nível de acesso</h2>
        <p>
          {user.role === "ADMIN" && "Administrador: gerencia todo o conteúdo, os textos do site e os usuários."}
          {user.role === "EDITOR" && "Editor: gerencia todo o conteúdo e publica notícias, mas não gerencia usuários."}
          {user.role === "AUTHOR" && "Autor: escreve notícias e as edita enquanto forem rascunho. Um editor faz a publicação."}
        </p>
      </div>
    </>
  );
}
