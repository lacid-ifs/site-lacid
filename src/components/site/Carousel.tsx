"use client";

import { useEffect, useRef } from "react";

type Slide = { id: string; src: string; alt: string };

/** Carrossel continuo com pausa/encaixe ao passar o mouse (porta do carousel.js original). */
export function Carousel({ slides }: { slides: Slide[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    const dots = Array.from(dotsRef.current?.children ?? []) as HTMLElement[];
    if (!container || !track || slides.length === 0) return;

    const originalCount = slides.length;
    const slideEls = () => Array.from(track.children) as HTMLElement[];
    const slideWidth = () => slideEls()[0]?.offsetWidth ?? 0;

    let currentPos = 0;
    let paused = true;
    let starting = true;
    let raf = 0;
    const speed = 0.6;

    const updateDots = () => {
      const w = slideWidth();
      if (!w) return;
      const idx = Math.round(Math.abs(currentPos) / w) % originalCount;
      dots.forEach((d, i) => d.classList.toggle("active", i === idx));
    };

    const animate = () => {
      if (!paused) {
        currentPos -= speed;
        if (Math.abs(currentPos) >= slideWidth() * originalCount) currentPos = 0;
        track.style.transform = `translateX(${currentPos}px)`;
        updateDots();
      }
      raf = requestAnimationFrame(animate);
    };

    const snap = () => {
      if (starting) return;
      paused = true;
      const w = slideWidth();
      currentPos = -(Math.round(Math.abs(currentPos) / w) * w);
      track.classList.add("snapping");
      track.style.transform = `translateX(${currentPos}px)`;
      updateDots();
    };

    const resume = () => {
      if (starting) return;
      track.classList.remove("snapping");
      paused = false;
    };

    const dotHandlers = dots.map((dot, index) => {
      const handler = (e: Event) => {
        e.stopPropagation();
        starting = false;
        currentPos = -(index * slideWidth());
        track.classList.add("snapping");
        track.style.transform = `translateX(${currentPos}px)`;
        updateDots();
      };
      dot.addEventListener("click", handler);
      return handler;
    });

    const onResize = () => {
      if (!paused) currentPos = 0;
    };

    container.addEventListener("mouseenter", snap);
    container.addEventListener("mouseleave", resume);
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(animate);
    const startTimer = setTimeout(() => {
      starting = false;
      paused = false;
    }, 2000);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(startTimer);
      container.removeEventListener("mouseenter", snap);
      container.removeEventListener("mouseleave", resume);
      window.removeEventListener("resize", onResize);
      dots.forEach((d, i) => d.removeEventListener("click", dotHandlers[i]));
      track.style.transform = "";
    };
  }, [slides]);

  return (
    <div className="carousel-container" ref={containerRef}>
      <div className="carousel-track" id="track" ref={trackRef}>
        {/* Duplicado para o loop infinito */}
        {[...slides, ...slides].map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={`${s.id}-${i}`} src={s.src} className="slide" alt={s.alt} loading="lazy" />
        ))}
      </div>
      <div className="carousel-dots" ref={dotsRef}>
        {slides.map((s, i) => (
          <span key={s.id} className={`dot${i === 0 ? " active" : ""}`} />
        ))}
      </div>
    </div>
  );
}
