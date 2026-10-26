import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s - Painel LACID" },
  robots: { index: false, follow: false },
  icons: { icon: "/img/logoLACID.webp" },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
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
