"use client";

import { useCallback, useEffect, useState } from "react";
import { api, toLocalInput } from "./client-api";
import { FileField } from "./FileField";

export type Field = {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "textarea" | "number" | "checkbox" | "select" | "image" | "datetime";
  options?: { value: string; label: string }[];
  required?: boolean;
  full?: boolean;
  hint?: string;
  defaultValue?: string | number | boolean;
  /** Coluna na tabela: "thumb" mostra miniatura, "badge" mostra sim/nao */
  column?: "text" | "thumb" | "badge" | "date";
};

type Row = Record<string, unknown> & { id: string };
type Props = {
  title: string;
  endpoint: string;
  fields: Field[];
  singular: string;
  /** Impede excluir a propria linha (usuarios) */
  selfId?: string;
};

function emptyValues(fields: Field[]) {
  return Object.fromEntries(
    fields.map((f) => [f.name, f.defaultValue ?? (f.type === "checkbox" ? true : f.type === "number" ? 0 : "")]),
  ) as Record<string, string | number | boolean>;
}

export function ResourceManager({ title, endpoint, fields, singular, selfId }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [values, setValues] = useState(emptyValues(fields));
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setRows(await api<Row[]>(endpoint));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    void load();
  }, [load]);

  function open(row: Row | "new") {
    setError("");
    setEditing(row);
    if (row === "new") return setValues(emptyValues(fields));
    setValues(
      Object.fromEntries(
        fields.map((f) => {
          const v = row[f.name];
          if (f.type === "datetime") return [f.name, toLocalInput(v as string)];
          if (f.type === "password") return [f.name, ""];
          return [f.name, (v ?? (f.type === "checkbox" ? false : "")) as string | number | boolean];
        }),
      ),
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {};
      for (const f of fields) {
        const v = values[f.name];
        if (f.type === "password" && editing !== "new" && !v) continue;
        if (f.type === "datetime") payload[f.name] = v ? new Date(String(v)).toISOString() : f.required ? v : null;
        else if (f.type === "number") payload[f.name] = Number(v);
        else payload[f.name] = v;
      }
      if (editing === "new") await api(endpoint, { method: "POST", body: JSON.stringify(payload) });
      else await api(`${endpoint}/${(editing as Row).id}`, { method: "PATCH", body: JSON.stringify(payload) });
      setEditing(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: Row) {
    if (!confirm(`Excluir este ${singular}? Esta ação não pode ser desfeita.`)) return;
    try {
      await api(`${endpoint}/${row.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const columns = fields.filter((f) => f.column);

  return (
    <>
      <div className="adm-head">
        <h1>{title}</h1>
        {!editing && (
          <button className="btn" onClick={() => open("new")}>
            <i className="bi bi-plus-lg" /> Novo {singular}
          </button>
        )}
      </div>

      {error && <div className="alert">{error}</div>}

      {editing ? (
        <form className="adm-card" onSubmit={save}>
          <h2 style={{ marginBottom: 16 }}>{editing === "new" ? `Novo ${singular}` : `Editar ${singular}`}</h2>
          <div className="form-grid">
            {fields.map((f) => {
              const v = values[f.name];
              const set = (nv: string | number | boolean) => setValues((s) => ({ ...s, [f.name]: nv }));
              if (f.type === "checkbox")
                return (
                  <label key={f.name} className="field check">
                    <input type="checkbox" checked={Boolean(v)} onChange={(e) => set(e.target.checked)} /> {f.label}
                  </label>
                );
              return (
                <label key={f.name} className={`field${f.full || f.type === "textarea" ? " full" : ""}`}>
                  {f.label}
                  {f.type === "textarea" ? (
                    <textarea value={String(v)} required={f.required} onChange={(e) => set(e.target.value)} />
                  ) : f.type === "select" ? (
                    <select value={String(v)} onChange={(e) => set(e.target.value)}>
                      {f.options?.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "image" ? (
                    <FileField value={String(v)} onChange={set} />
                  ) : (
                    <input
                      type={f.type === "datetime" ? "datetime-local" : f.type}
                      value={String(v)}
                      required={f.required && !(f.type === "password" && editing !== "new")}
                      minLength={f.type === "password" ? 8 : undefined}
                      autoComplete={f.type === "password" ? "new-password" : undefined}
                      onChange={(e) => set(e.target.value)}
                    />
                  )}
                  {f.hint && <span className="hint">{f.hint}</span>}
                </label>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button className="btn" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" className="btn ghost" onClick={() => setEditing(null)}>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="adm-card table-wrap">
          {loading ? (
            "Carregando..."
          ) : rows.length === 0 ? (
            <span className="hint">Nada cadastrado ainda.</span>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.name}>{c.label}</th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    {columns.map((c) => {
                      const v = row[c.name];
                      return (
                        <td key={c.name}>
                          {c.column === "thumb" ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img className="thumb" src={String(v)} alt="" />
                          ) : c.column === "badge" ? (
                            <span className={`badge ${v ? "ok" : "warn"}`}>{v ? "Sim" : "Não"}</span>
                          ) : c.column === "date" ? (
                            v ? new Date(String(v)).toLocaleString("pt-BR") : "—"
                          ) : (
                            String(c.options?.find((o) => o.value === v)?.label ?? v ?? "")
                          )}
                        </td>
                      );
                    })}
                    <td>
                      <div className="adm-actions">
                        <button className="btn ghost sm" onClick={() => open(row)}>
                          <i className="bi bi-pencil" /> Editar
                        </button>
                        {row.id !== selfId && (
                          <button className="btn red sm" onClick={() => remove(row)}>
                            <i className="bi bi-trash" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </>
  );
}
