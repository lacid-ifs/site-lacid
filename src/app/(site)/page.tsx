import Link from "next/link";
import { ActivityCard } from "@/components/site/ActivityCard";
import { Carousel } from "@/components/site/Carousel";
import { Reveal } from "@/components/site/Reveal";
import { formatDateTime, getHomeData } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata = { title: "Página Inicial" };

const link = (href: string | null) => (href && href !== "#" ? href : null);

export default async function HomePage() {
  const { settings, slides, members, activities, events, latest } = await getHomeData();

  return (
    <>
      <main>
        <header className="hero-header">
          <h1 className="logo-titulo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/logotituloLACID.webp"
              alt="LACID - Liga Acadêmica de Ciência de Dados e Inteligência Artificial"
              className="logo-imagem"
            />
            <span className="sr-only">LACID - Liga Acadêmica de Ciência de Dados e Inteligência Artificial</span>
          </h1>
          <p className="subtitle">{settings.heroSubtitle}</p>
        </header>

        <section className="hero">
          <div className="hero-left">
            <Carousel slides={slides.map((s) => ({ id: s.id, src: s.src, alt: s.alt }))} />
          </div>

          <div className="hero-right">
            <div className="noticias-card">
              {latest ? (
                <>
                  <div className="noticias-conteudo">
                    <span className="noticias-tag">
                      Notícias |{" "}
                      <Link href="/noticias" className="link-ver-todas">
                        Ver todas <i className="bi bi-arrow-right" />
                      </Link>
                    </span>
                    <h2>{latest.homeTitle || latest.title}</h2>
                    <p className="noticias-texto">
                      {latest.homeSummary.split("\n\n").map((part, i, arr) => (
                        <span key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <>
                              <br />
                              <br />
                            </>
                          )}
                        </span>
                      ))}
                    </p>
                  </div>
                  <Link href={`/noticias/${latest.slug}`} className="btn-saiba-mais">
                    Saiba mais <i className="bi bi-arrow-right" />
                  </Link>
                </>
              ) : (
                <p className="noticias-texto">Nenhuma notícia disponível no momento.</p>
              )}
            </div>
          </div>
        </section>

        <section id="quem-somos" className="section-container">
          <div className="quem-somos-wrapper">
            <h2 className="titulo-quem-somos">
              QU<span className="letra-dupla">E</span>M SO<span className="letra-dupla">M</span>OS
            </h2>
            <div className="box-quem-somos">
              <p>{settings.aboutText}</p>
            </div>
          </div>
        </section>

        <section id="atividades" className="section-container">
          <h2 className="section-title">
            AT<span className="letra-dupla">I</span>VIDAD<span className="letra-dupla">E</span>S
          </h2>
          <div className="grid-atividades">
            {activities.map((a) => (
              <ActivityCard key={a.id} title={a.title} subtitle={a.subtitle} text={a.text} icon={a.icon} variant={a.variant} />
            ))}
          </div>
        </section>

        {events.length > 0 && (
          <section id="eventos" className="section-container">
            <h2 className="section-title">
              EV<span className="letra-dupla">E</span>NTOS
            </h2>
            <div className="grid-eventos">
              {events.map((e) => (
                <article key={e.id} className="card-evento">
                  {e.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.imageUrl} alt={e.title} loading="lazy" />
                  )}
                  <div className="evento-corpo">
                    <span className="evento-data">{formatDateTime(e.startsAt)}</span>
                    <h3>{e.title}</h3>
                    {e.location && (
                      <p>
                        <i className="bi bi-geo-alt-fill" /> {e.location}
                      </p>
                    )}
                    {e.description && <p>{e.description}</p>}
                    {link(e.link) && (
                      <a href={link(e.link)!} target="_blank" rel="noopener noreferrer">
                        Saiba mais <i className="bi bi-arrow-right" />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section id="membros" className="section-container style-playful">
          <div className="equipe-wrapper">
            <h2 className="titulo-quem-somos">
              NO<span className="letra-dupla">S</span>SA EQU<span className="letra-dupla">I</span>PE
            </h2>
            <div className="grid-membros">
              {members.length === 0 && (
                <p style={{ textAlign: "center", width: "100%", color: "var(--azul-texto-claro)" }}>
                  Nenhum membro encontrado.
                </p>
              )}
              {members.map((m) => (
                <article key={m.id} className="card-membro">
                  <div className="foto-container">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.photoUrl} className="foto-membro" alt={`Foto de ${m.name}`} loading="lazy" />
                  </div>
                  <div className="membro-info">
                    <h3 className="nome-membro">{m.name}</h3>
                    <p className="cargo-membro">{m.role}</p>
                    <p className="curso-membro">{m.course}</p>
                    <div className="membro-redes">
                      {link(m.linkedin) && (
                        <a href={link(m.linkedin)!} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn">
                          <i className="bi bi-linkedin" />
                        </a>
                      )}
                      {link(m.github) && (
                        <a href={link(m.github)!} target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
                          <i className="bi bi-github" />
                        </a>
                      )}
                      {link(m.lattes) && (
                        <a href={link(m.lattes)!} target="_blank" rel="noopener noreferrer" aria-label="Currículo Lattes" title="Currículo Lattes">
                          <i className="bi bi-mortarboard-fill" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Reveal selector=".card, .card-membro, .card-evento" />
    </>
  );
}
