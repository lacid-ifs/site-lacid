"use client";

import { useState } from "react";
import { api } from "./client-api";

type Settings = Record<string, string>;

const FIELDS: { name: string; label: string; textarea?: boolean }[] = [
  { name: "heroSubtitle", label: "Subtítulo da página inicial" },
  { name: "aboutText", label: "Texto de “Quem somos”", textarea: true },
  { name: "contactEmail", label: "E-mail de contato" },
  { name: "instagramUrl", label: "Link do Instagram" },
  { name: "footerText", label: "Texto do rodapé" },
];

export function SettingsForm({ initial }: { initial: Settings }) {
  const [values, setValues] = useState<Settings>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await api("/api/settings", { method: "PUT", body: JSON.stringify(values) });
      setMsg({ ok: true, text: "Salvo! As mudanças já estão no site." });
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="adm-card" onSubmit={save}>
      {msg && <div className={`alert${msg.ok ? " ok" : ""}`}>{msg.text}</div>}
      <div className="form-grid">
        {FIELDS.map((f) => (
          <label key={f.name} className={`field${f.textarea ? " full" : ""}`}>
            {f.label}
            {f.textarea ? (
              <textarea value={values[f.name] ?? ""} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
            ) : (
              <input type="text" value={values[f.name] ?? ""} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
            )}
          </label>
        ))}
      </div>
      <button className="btn" style={{ marginTop: 18 }} disabled={saving}>
        {saving ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
