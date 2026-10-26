import type { Metadata } from "next";
import "./site.css";

export const metadata: Metadata = {
  title: { default: "LACID", template: "%s - LACID" },
  description: "Liga Acadêmica de Ciência de Dados e Inteligência Artificial do IFS",
  icons: { icon: "/img/logoLACID.webp" },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
