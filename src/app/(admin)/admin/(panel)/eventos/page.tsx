import { ResourceManager } from "@/components/admin/ResourceManager";
import { requirePage } from "@/lib/guard";

export const metadata = { title: "Eventos" };

export default async function Page() {
  await requirePage(["ADMIN", "EDITOR"]);
  return (
    <ResourceManager
      title="Eventos"
      singular="evento"
      endpoint="/api/events"
      fields={[
        { name: "title", label: "Título", type: "text", required: true, column: "text", full: true },
        { name: "startsAt", label: "Início", type: "datetime", required: true, column: "date" },
        { name: "endsAt", label: "Fim (opcional)", type: "datetime" },
        { name: "location", label: "Local", type: "text" },
        { name: "link", label: "Link (inscrição / mais informações)", type: "text" },
        { name: "imageUrl", label: "Imagem", type: "image", full: true },
        { name: "description", label: "Descrição", type: "textarea" },
        { name: "published", label: "Publicado", type: "checkbox", column: "badge" },
      ]}
    />
  );
}
