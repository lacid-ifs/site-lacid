import type { Metadata } from "next";
import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { getChrome } from "@/lib/content";
import "./site.css";

export const metadata: Metadata = {
  title: { default: "LACID", template: "%s - LACID" },
  description: "Liga Acadêmica de Ciência de Dados e Inteligência Artificial do IFS",
  icons: { icon: "/img/logoLACID.webp" },
};

// Os dados vem do cache do Next (revalidado ao publicar), mas o banco nao
// pode ser consultado no build.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { settings, hasEvents } = await getChrome();

  return (
    <html lang="pt-br">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
      </head>
      <body>
        <Navbar contactEmail={settings.contactEmail} hasEvents={hasEvents} />
        {children}
        <Footer footerText={settings.footerText} instagramUrl={settings.instagramUrl} />
      </body>
    </html>
  );
}
