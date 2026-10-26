"use client";

import { useEffect, useState } from "react";

/** Barra de progresso de leitura + botao "voltar ao topo". */
export function ReadingExtras() {
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setProgress(height > 0 ? (scrolled / height) * 100 : 0);
      setShowTop(window.scrollY > 300);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="reading-progress" style={{ width: `${progress}%` }} />
      <button
        className={`back-to-top${showTop ? " show" : ""}`}
        aria-label="Voltar ao topo"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ↑
      </button>
    </>
  );
}
