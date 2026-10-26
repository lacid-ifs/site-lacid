import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { NavLink } from "@/components/admin/NavLink";

const ROLE_LABEL = { ADMIN: "Administrador", EDITOR: "Editor", AUTHOR: "Autor" } as const;

type Item = { href: string; label: string; icon: string; roles: ("ADMIN" | "EDITOR" | "AUTHOR")[] };

const ITEMS: Item[] = [
  { href: "/admin", label: "Início", icon: "bi-speedometer2", roles: ["ADMIN", "EDITOR", "AUTHOR"] },
  { href: "/admin/noticias", label: "Notícias", icon: "bi-newspaper", roles: ["ADMIN", "EDITOR", "AUTHOR"] },
  { href: "/admin/eventos", label: "Eventos", icon: "bi-calendar-event", roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/carrossel", label: "Carrossel", icon: "bi-images", roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/atividades", label: "Atividades", icon: "bi-lightbulb", roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/membros", label: "Membros", icon: "bi-people", roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/site", label: "Textos do site", icon: "bi-gear", roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/usuarios", label: "Usuários", icon: "bi-shield-lock", roles: ["ADMIN"] },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const { role, name } = session.user;

  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <div className="adm-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logoLACID.webp" alt="" /> LACID
        </div>
        <nav>
          {ITEMS.filter((i) => i.roles.includes(role)).map((i) => (
            <NavLink key={i.href} href={i.href} exact={i.href === "/admin"}>
              <i className={`bi ${i.icon}`} /> {i.label}
            </NavLink>
          ))}
          <a href="/" target="_blank" rel="noopener noreferrer">
            <i className="bi bi-box-arrow-up-right" /> Ver site
          </a>
        </nav>
        <div className="adm-user">
          <div>
            {name}
            <br />
            <small>{ROLE_LABEL[role]}</small>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button className="btn ghost sm" type="submit">
              <i className="bi bi-box-arrow-left" /> Sair
            </button>
          </form>
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
