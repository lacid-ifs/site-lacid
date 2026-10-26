import { ResourceManager } from "@/components/admin/ResourceManager";
import { requirePage } from "@/lib/guard";

export const metadata = { title: "Membros" };

export default async function Page() {
  await requirePage(["ADMIN", "EDITOR"]);
  return (
    <ResourceManager
      title="Membros"
      singular="membro"
      endpoint="/api/members"
      fields={[
        { name: "photoUrl", label: "Foto", type: "image", column: "thumb", defaultValue: "/img/default_avatar.png", full: true },
        { name: "name", label: "Nome", type: "text", required: true, column: "text" },
        { name: "role", label: "Cargo", type: "text", defaultValue: "Membro da Liga", column: "text" },
        { name: "course", label: "Curso", type: "text", column: "text" },
        { name: "order", label: "Ordem", type: "number", hint: "Menor aparece primeiro" },
        { name: "linkedin", label: "LinkedIn", type: "text" },
        { name: "github", label: "GitHub", type: "text" },
        { name: "lattes", label: "Lattes", type: "text" },
        { name: "active", label: "Visível no site", type: "checkbox", column: "badge" },
      ]}
    />
  );
}
