"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "./client-api";

type Role = "ADMIN" | "EDITOR" | "AUTHOR";
type Item = {
  id: string;
  slug: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string;
  authorId: string;
  author: { id: string; name: string };
};

export function PostList({ role, userId }: { role: Role; userId: string }) {
  const [posts, setPosts] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setPosts(await api<Item[]>("/api/news?manage=1"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Mesma regra da API: autor so mexe nos proprios rascunhos
  const canModify = (p: Item) => role !== "AUTHOR" || (p.authorId === userId && p.status === "DRAFT");

  async function remove(p: Item) {
    if (!confirm(`Excluir a notícia “${p.title}”?`)) return;
    try {
      await api(`/api/news/${p.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      <div className="adm-head">
        <h1>Notícias</h1>
        <Link className="btn" href="/admin/noticias/nova">
          <i className="bi bi-plus-lg" /> Nova notícia
        </Link>
      </div>
      {error && <div className="alert">{error}</div>}
      <div className="adm-card table-wrap">
        {loading ? (
          "Carregando..."
        ) : posts.length === 0 ? (
          <span className="hint">Nenhuma notícia ainda.</span>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Autor</th>
                <th>Data</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td>{p.author.name}</td>
                  <td>{new Date(p.publishedAt).toLocaleDateString("pt-BR")}</td>
                  <td>
                    <span className={`badge ${p.status === "PUBLISHED" ? "ok" : "warn"}`}>
                      {p.status === "PUBLISHED" ? "Publicada" : "Rascunho"}
                    </span>
                  </td>
                  <td>
                    <div className="adm-actions">
                      {p.status === "PUBLISHED" && (
                        <a className="btn ghost sm" href={`/noticias/${p.slug}`} target="_blank" rel="noopener noreferrer">
                          <i className="bi bi-eye" />
                        </a>
                      )}
                      {canModify(p) && (
                        <>
                          <Link className="btn ghost sm" href={`/admin/noticias/${p.id}`}>
                            <i className="bi bi-pencil" /> Editar
                          </Link>
                          <button className="btn red sm" onClick={() => remove(p)}>
                            <i className="bi bi-trash" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
