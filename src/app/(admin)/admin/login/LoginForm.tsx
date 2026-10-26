"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(form.get("email")),
      password: String(form.get("password")),
      redirect: false,
    });
    if (res?.error) {
      setError("E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }
    window.location.href = "/admin";
  }

  return (
    <form className="login-card" onSubmit={onSubmit}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/img/logoLACID.webp" alt="LACID" />
      <h1>Painel LACID</h1>
      {error && <div className="alert">{error}</div>}
      <label className="field">
        E-mail
        <input type="email" name="email" required autoComplete="username" />
      </label>
      <label className="field">
        Senha
        <input type="password" name="password" required autoComplete="current-password" />
      </label>
      <button className="btn" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
