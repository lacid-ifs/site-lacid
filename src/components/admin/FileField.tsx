"use client";

import { useRef, useState } from "react";
import { uploadFile } from "./client-api";

type Props = {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  preview?: boolean;
};

/** Campo de URL com botao de upload (imagens ou PDF). */
export function FileField({ value, onChange, accept = "image/*", preview = true }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      onChange(await uploadFile(file));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <div className="img-field">
        {preview && value && /\.(jpe?g|png|webp|gif)$|^https?:/i.test(value) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" />
        )}
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="/img/... ou https://..." />
        <button type="button" className="btn ghost sm" disabled={busy} onClick={() => input.current?.click()}>
          <i className="bi bi-upload" /> {busy ? "..." : "Enviar"}
        </button>
        <input ref={input} type="file" accept={accept} hidden onChange={onPick} />
      </div>
      {error && <div className="hint" style={{ color: "var(--red)" }}>{error}</div>}
    </div>
  );
}
