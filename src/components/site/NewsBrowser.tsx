"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type NewsListItem = {
  slug: string;
  title: string;
  subtitle: string;
  day: string;
  label: string;
  coverUrl: string | null;
  sections: { title: string; paragraphs?: string[]; list?: string[] }[];
  attachments: { label: string; href: string; icon?: string }[];
  author: { name: string; role: string; course: string; photoUrl: string };
};

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

const safeHref = (href: string) => (/^https?:\/\//i.test(href) || href.startsWith("/") ? href : "#");

export function NewsBrowser({ items }: { items: NewsListItem[] }) {
  const [query, setQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const daysWithNews = useMemo(() => new Set(items.map((i) => i.day)), [items]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return items.filter((i) => (!q || i.title.toLowerCase().includes(q)) && (!selectedDay || i.day === selectedDay));
  }, [items, query, selectedDay]);

  // Calendario: do primeiro mes com noticia (ou fev/2026) ate o mes atual
  const earliest = useMemo(() => {
    const first = items.at(-1)?.day;
    return first ? new Date(Number(first.slice(0, 4)), Number(first.slice(5, 7)) - 1, 1) : new Date(2026, 1, 1);
  }, [items]);
  const canPrev = view > earliest;
  const canNext = view < new Date(today.getFullYear(), today.getMonth(), 1);

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
  const key = (d: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div className="layout-duas-colunas">
      <main className="coluna-lista feed">
        {filtered.map((item) => (
          <article key={item.slug} className="feed-post">
            <header className="feed-autor">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.author.photoUrl} alt="" className="feed-avatar" />
              <div className="feed-autor-info">
                <strong>{item.author.name}</strong>
                <span>{[item.author.role, item.author.course].filter(Boolean).join(" · ")}</span>
              </div>
              <time className="feed-data">{item.label}</time>
            </header>

            {item.coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.coverUrl} alt={item.title} className="feed-capa" loading="lazy" />
            )}

            <div className="feed-corpo">
              <h2 className="feed-titulo">
                <Link href={`/noticias/${item.slug}`}>{item.title}</Link>
              </h2>
              {item.subtitle && <p className="feed-subtitulo">{item.subtitle}</p>}
              {item.sections.map((sec, i) => (
                <section key={i} className="feed-secao">
                  <h3>{sec.title}</h3>
                  {(sec.paragraphs ?? []).map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                  {sec.list && sec.list.length > 0 && (
                    <ul>
                      {sec.list.map((li, j) => (
                        <li key={j}>{li}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
              {item.attachments.length > 0 && (
                <div className="feed-anexos">
                  {item.attachments.map((a, i) => (
                    <a key={i} href={safeHref(a.href)} target="_blank" rel="noopener noreferrer">
                      <i className={`bi ${a.icon || "bi-file-earmark-text"}`} /> {a.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
        {filtered.length === 0 && <div className="mensagem-sem-resultados">Nenhuma notícia encontrada.</div>}
      </main>

      <aside className="coluna-filtros">
        <div className="busca-container">
          <input
            type="text"
            placeholder="Buscar notícia..."
            className="input-busca"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button" className="btn-busca" aria-label="Buscar">
            <i className="bi bi-search" />
          </button>
        </div>

        <div className="calendario-container">
          <h3 className="titulo-filtro">Filtrar por data</h3>
          <div className="calendario-box">
            <div className="calendario-header">
              <button className="btn-mes" disabled={!canPrev} onClick={() => setView(new Date(year, month - 1, 1))} aria-label="Mês anterior">
                <i className="bi bi-chevron-left" />
              </button>
              <span className="nome-mes">
                {new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(view)}
              </span>
              <button className="btn-mes" disabled={!canNext} onClick={() => setView(new Date(year, month + 1, 1))} aria-label="Próximo mês">
                <i className="bi bi-chevron-right" />
              </button>
            </div>
            <table className="tabela-mes">
              <thead>
                <tr>
                  {WEEKDAYS.map((d, i) => (
                    <th key={i}>{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, i) => (
                  <tr key={i}>
                    {week.map((day, j) =>
                      day === null ? (
                        <td key={j} className="dia-vazio" />
                      ) : (
                        <td
                          key={j}
                          className={`${daysWithNews.has(key(day)) ? "dia-com-noticia" : ""} ${selectedDay === key(day) ? "dia-ativo" : ""}`}
                          title={daysWithNews.has(key(day)) ? "Possui notícias" : undefined}
                          onClick={() => setSelectedDay(key(day))}
                        >
                          {day}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            className="btn-limpar-filtros"
            onClick={() => {
              setQuery("");
              setSelectedDay(null);
            }}
          >
            <i className="bi bi-x-circle" /> Limpar Filtros
          </button>
        </div>
      </aside>
    </div>
  );
}
