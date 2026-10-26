"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, toLocalInput } from "./client-api";
import { FileField } from "./FileField";

type Role = "ADMIN" | "EDITOR" | "AUTHOR";
type Draft = { title: string; text: string; listText: string };

export type PostData = {
  id?: string;
  title: string;
  slug: string;
  homeTitle: string;
  detailTitleLines: string[];
  homeSummary: string;
  subtitle: string;
  sections: { title: string; paragraphs?: string[]; list?: string[] }[];
  attachments: { label: string; href: string; icon?: string }[];
  coverUrl: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string;
};

const EMPTY: PostData = {
  title: "",
  slug: "",
  homeTitle: "",
  detailTitleLines: [],
  homeSummary: "",
  subtitle: "",
  sections: [{ title: "", paragraphs: [""], list: [] }],
  attachments: [],
  coverUrl: "",
  status: "DRAFT",
  publishedAt: new Date().toISOString(),
};

const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
const paragraphs = (s: string) => s.split(/\n\s*\n/).map((l) => l.trim()).filter(Boolean);

export function PostEditor({ role, initial }: { role: Role; initial?: PostData }) {
  const router = useRouter();
  const [post, setPost] = useState<PostData>(initial ?? EMPTY);
  const [titleLines, setTitleLines] = useState((initial?.detailTitleLines ?? []).join("\n"));
  const [secs, setSecs] = useState<Draft[]>(() =>
    (initial?.sections ?? EMPTY.sections).map((s) => ({
      title: s.title,
      text: (s.paragraphs ?? []).join("\n\n"),
      listText: (s.list ?? []).join("\n"),
    })),
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const canPublish = role !== "AUTHOR";

  const set = <K extends keyof PostData>(key: K, value: PostData[K]) => setPost((p) => ({ ...p, [key]: value }));

  const setSection = (i: number, patch: Partial<Draft>) =>
    setSecs((all) => all.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const setAttachment = (i: number, patch: Partial<PostData["attachments"][number]>) =>
    set("attachments", post.attachments.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = {
        title: post.title,
        slug: post.slug || undefined,
        homeTitle: post.homeTitle || null,
        detailTitleLines: lines(titleLines),
        homeSummary: post.homeSummary,
        subtitle: post.subtitle,
        sections: secs
          .filter((s) => s.title.trim())
          .map((s) => ({ title: s.title, paragraphs: paragraphs(s.text), list: lines(s.listText) })),
        attachments: post.attachments
          .filter((a) => a.label.trim() && a.href.trim())
          .map((a) => ({ label: a.label, href: a.href, icon: a.icon || "bi-file-earmark-text" })),
        coverUrl: post.coverUrl,
        status: canPublish ? post.status : "DRAFT",
        publishedAt: new Date(post.publishedAt).toISOString(),
      };
      if (post.id) await api(`/api/news/${post.id}`, { method: "PATCH", body: JSON.stringify(body) });
      else await api("/api/news", { method: "POST", body: JSON.stringify(body) });
      router.push("/admin/noticias");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save}>
      <div className="adm-head">
        <h1>{post.id ? "Editar notícia" : "Nova notícia"}</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="btn ghost" onClick={() => router.push("/admin/noticias")}>
            Cancelar
          </button>
          <button className="btn" disabled={saving}>
            {saving ? "Salvando..." : canPublish && post.status === "PUBLISHED" ? "Salvar e publicar" : "Salvar"}
          </button>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}

      <div className="adm-card">
        <div className="form-grid">
          <label className="field full">
            Título
            <input type="text" required value={post.title} onChange={(e) => set("title", e.target.value)} />
          </label>
          <label className="field">
            Endereço (slug)
            <input type="text" value={post.slug} placeholder="gerado a partir do título" onChange={(e) => set("slug", e.target.value)} />
          </label>
          <label className="field">
            Data de publicação
            <input
              type="datetime-local"
              value={toLocalInput(post.publishedAt)}
              onChange={(e) => e.target.value && set("publishedAt", new Date(e.target.value).toISOString())}
            />
          </label>
          <label className="field">
            Status
            <select value={canPublish ? post.status : "DRAFT"} disabled={!canPublish} onChange={(e) => set("status", e.target.value as PostData["status"])}>
              <option value="DRAFT">Rascunho</option>
              <option value="PUBLISHED">Publicada</option>
            </select>
            {!canPublish && <span className="hint">Autores salvam como rascunho; um editor publica.</span>}
          </label>
          <label className="field">
            Imagem de capa (opcional)
            <FileField value={post.coverUrl} onChange={(v) => set("coverUrl", v)} />
          </label>
          <label className="field full">
            Subtítulo
            <input type="text" value={post.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
          </label>
        </div>
      </div>

      <div className="adm-card">
        <h2 style={{ marginBottom: 12 }}>Destaque na página inicial</h2>
        <div className="form-grid">
          <label className="field full">
            Título do destaque (opcional)
            <input type="text" value={post.homeTitle} onChange={(e) => set("homeTitle", e.target.value)} />
          </label>
          <label className="field full">
            Resumo
            <textarea value={post.homeSummary} onChange={(e) => set("homeSummary", e.target.value)} />
            <span className="hint">Linha em branco separa parágrafos.</span>
          </label>
          <label className="field full">
            Título grande da notícia (uma linha por linha do título, opcional)
            <textarea style={{ minHeight: 70 }} value={titleLines} onChange={(e) => setTitleLines(e.target.value)} placeholder={"RESULTADO\nFINAL\n2026/1"} />
          </label>
        </div>
      </div>

      <div className="adm-card">
        <h2 style={{ marginBottom: 12 }}>Conteúdo</h2>
        {secs.map((s, i) => (
          <div key={i} className="repeat-item">
            <label className="field">
              Título da seção
              <input type="text" value={s.title} onChange={(e) => setSection(i, { title: e.target.value })} />
            </label>
            <label className="field">
              Texto
              <textarea
                value={s.text}
                onChange={(e) => setSection(i, { text: e.target.value })}
              />
              <span className="hint">Linha em branco separa parágrafos.</span>
            </label>
            <label className="field">
              Lista (opcional, um item por linha)
              <textarea style={{ minHeight: 60 }} value={s.listText} onChange={(e) => setSection(i, { listText: e.target.value })} />
            </label>
            <div>
              <button type="button" className="btn red sm" onClick={() => setSecs((all) => all.filter((_, idx) => idx !== i))}>
                <i className="bi bi-trash" /> Remover seção
              </button>
            </div>
          </div>
        ))}
        <button type="button" className="btn ghost" onClick={() => setSecs((all) => [...all, { title: "", text: "", listText: "" }])}>
          <i className="bi bi-plus-lg" /> Adicionar seção
        </button>
      </div>

      <div className="adm-card">
        <h2 style={{ marginBottom: 12 }}>Anexos</h2>
        {post.attachments.map((a, i) => (
          <div key={i} className="repeat-item">
            <label className="field">
              Nome do anexo
              <input type="text" value={a.label} onChange={(e) => setAttachment(i, { label: e.target.value })} />
            </label>
            <label className="field">
              Arquivo (PDF/imagem) ou link
              <FileField value={a.href} onChange={(v) => setAttachment(i, { href: v })} accept="application/pdf,image/*" preview={false} />
            </label>
            <div>
              <button type="button" className="btn red sm" onClick={() => set("attachments", post.attachments.filter((_, idx) => idx !== i))}>
                <i className="bi bi-trash" /> Remover anexo
              </button>
            </div>
          </div>
        ))}
        <button type="button" className="btn ghost" onClick={() => set("attachments", [...post.attachments, { label: "", href: "" }])}>
          <i className="bi bi-paperclip" /> Adicionar anexo
        </button>
      </div>
    </form>
  );
}
