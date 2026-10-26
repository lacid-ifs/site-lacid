"use client";

import { useEffect } from "react";

/**
 * Animacao de entrada ao rolar. Sem UI: marca os elementos que casam com
 * `selector` e os revela quando entram na tela.
 */
export function Reveal({ selector }: { selector: string }) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );
    els.forEach((el, i) => {
      el.classList.add("reveal");
      el.style.transitionDelay = `${(i % 6) * 0.1}s`;
      observer.observe(el);
    });
    return () => {
      observer.disconnect();
      els.forEach((el) => {
        el.classList.remove("reveal", "visible");
        el.style.transitionDelay = "";
      });
    };
  }, [selector]);

  return null;
}
