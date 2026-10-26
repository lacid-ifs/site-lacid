"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type NewsListItem = { slug: string; title: string; day: string; label: string };

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

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

  const groups = useMemo(() => {
    const map = new Map<string, NewsListItem[]>();
    for (const item of filtered) map.set(item.label, [...(map.get(item.label) ?? []), item]);
    return Array.from(map.entries());
  }, [filtered]);

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
      <main className="coluna-lista">
        {groups.map(([label, list]) => (
          <section key={label} className="grupo-noticias">
            <h2 className="data-noticia">{label}</h2>
            {list.map((item) => (
              <article key={item.slug} className="item-noticia">
                <Link href={`/noticias/${item.slug}`} className="link-noticia">
                  {item.title}
                </Link>
              </article>
            ))}
          </section>
        ))}
        {groups.length === 0 && <div className="mensagem-sem-resultados">Nenhuma notícia encontrada.</div>}
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
