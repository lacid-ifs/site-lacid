"use client";

import { useToast } from "./Toast";

type Props = {
  title: string;
  subtitle: string;
  text: string;
  icon: string;
  variant: string;
};

export function ActivityCard({ title, subtitle, text, icon, variant }: Props) {
  const { toast, show } = useToast();
  return (
    <>
      <article className={`card card-${variant}`}>
        <div className="icon-circle"><i className={`bi ${icon}`} /></div>
        <h3>{title}</h3>
        <p className="card-subtitulo">{subtitle}</p>
        <p>{text}</p>
        <button className="btn-card-branco" onClick={() => show("bi-info-circle-fill", `Em breve: Mais informações sobre ${title}!`)}>
          <i className="bi bi-plus-circle" /> Saiba mais
        </button>
      </article>
      {toast}
    </>
  );
}
