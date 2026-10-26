"use client";

import { useEffect, useState } from "react";
import { useToast } from "./Toast";

export function Navbar({ contactEmail, hasEvents }: { contactEmail: string; hasEvents: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { toast, show } = useToast();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Esconde a barra quando o rodape aparece
    const footer = document.querySelector(".main-footer");
    let observer: IntersectionObserver | undefined;
    if (footer) {
      observer = new IntersectionObserver(([entry]) => setHidden(entry.isIntersecting), { threshold: 0.1 });
      observer.observe(footer);
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer?.disconnect();
    };
  }, []);

  function goTo(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.offsetTop - 80, behavior: "smooth" });
  }

  return (
    <>
      <header className={`navbar${scrolled ? " scrolled" : ""}${hidden ? " navbar-hidden" : ""}`}>
        <nav>
          <a href="#quem-somos" onClick={(e) => goTo(e, "quem-somos")}>Quem somos</a>
          <a href="#atividades" onClick={(e) => goTo(e, "atividades")}>Atividades</a>
          {hasEvents && (
            <a href="#eventos" onClick={(e) => goTo(e, "eventos")}>Eventos</a>
          )}
          <a href="#membros" onClick={(e) => goTo(e, "membros")}>Nossa Equipe</a>
        </nav>
        <button className="btn-aba-lateral" onClick={() => show("bi-envelope-at-fill", `Entre em contato: ${contactEmail}`)}>
          <i className="bi bi-envelope-fill" /> Contato
        </button>
      </header>
      {toast}
    </>
  );
}
