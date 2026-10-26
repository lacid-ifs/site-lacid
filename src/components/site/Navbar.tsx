"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "./Toast";

/** Barra de navegacao compartilhada por todas as paginas do site. */
export function Navbar({ contactEmail, hasEvents }: { contactEmail: string; hasEvents: boolean }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { toast, show } = useToast();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ao chegar de outra pagina com #secao, rola ate a secao assim que ela existir
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    let tries = 0;
    const timer = setInterval(() => {
      const el = document.getElementById(id);
      if (el || ++tries > 25) {
        clearInterval(timer);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 80);
    return () => clearInterval(timer);
  }, [pathname]);

  // Esconde a barra quando o rodape aparece (o rodape muda de lugar a cada pagina)
  useEffect(() => {
    const footer = document.querySelector(".main-footer");
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => setHidden(entry.isIntersecting), { threshold: 0.1 });
    observer.observe(footer);
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <>
      <header className={`navbar${scrolled ? " scrolled" : ""}${hidden ? " navbar-hidden" : ""}`}>
        <nav>
          {!isHome && (
            <Link href="/" className="navbar-logo" aria-label="LACID - Página inicial">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/logoLACID.webp" alt="LACID" />
            </Link>
          )}
          <Link href="/#quem-somos">Quem somos</Link>
          <Link href="/#atividades">Atividades</Link>
          {hasEvents && <Link href="/#eventos">Eventos</Link>}
          <Link href="/#membros">Nossa Equipe</Link>
          <Link href="/noticias" className={pathname.startsWith("/noticias") ? "ativo" : undefined}>
            Notícias
          </Link>
        </nav>
        <div className="navbar-acoes">
          <a href="/admin/login" className="btn-login-nav">
            <i className="bi bi-person-circle" /> <span>Entrar</span>
          </a>
          <button className="btn-aba-lateral" onClick={() => show("bi-envelope-at-fill", `Entre em contato: ${contactEmail}`)}>
            <i className="bi bi-envelope-fill" /> Contato
          </button>
        </div>
      </header>
      {toast}
    </>
  );
}
