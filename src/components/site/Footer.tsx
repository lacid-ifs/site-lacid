import Link from "next/link";

type Props = { footerText: string; instagramUrl: string };

export function Footer({ footerText, instagramUrl }: Props) {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logoLACID.webp" alt="Logo LACID" className="footer-logo-img" />
          <p>{footerText}</p>
        </div>
        <div className="footer-links">
          <nav aria-label="Navegação do rodapé">
            <Link href="/#quem-somos">Quem somos</Link>
            <Link href="/#atividades">Atividades</Link>
            <Link href="/#membros">Nossa Equipe</Link>
            <Link href="/noticias">Notícias</Link>
          </nav>
        </div>
        <div className="footer-social">
          {instagramUrl && (
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i className="bi bi-instagram" />
            </a>
          )}
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} LACID - Instituto Federal de Sergipe. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
