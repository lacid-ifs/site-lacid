/** fetch JSON do painel com mensagens de erro legiveis. */
export async function api<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json", ...init.headers } : init?.headers,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const fields = body?.issues?.fieldErrors
      ? Object.entries(body.issues.fieldErrors as Record<string, string[]>)
          .map(([k, v]) => `${k}: ${v.join(", ")}`)
          .join(" | ")
      : "";
    throw new Error([body?.error ?? `Erro ${res.status}`, fields].filter(Boolean).join(" - "));
  }
  return body as T;
}

export async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const { url } = await api<{ url: string }>("/api/upload", { method: "POST", body: form });
  return url;
}

/** Date -> valor de <input type="datetime-local"> no horario local. */
export function toLocalInput(value?: string | Date | null) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
