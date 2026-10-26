import { ResourceManager } from "@/components/admin/ResourceManager";
import { requirePage } from "@/lib/guard";

export const metadata = { title: "Carrossel" };

export default async function Page() {
  await requirePage(["ADMIN", "EDITOR"]);
  return (
    <ResourceManager
      title="Carrossel da página inicial"
      singular="slide"
      endpoint="/api/carousel"
      fields={[
        { name: "src", label: "Imagem", type: "image", required: true, column: "thumb", full: true },
        { name: "alt", label: "Texto alternativo", type: "text", column: "text" },
        { name: "order", label: "Ordem", type: "number", column: "text" },
        { name: "active", label: "Visível no site", type: "checkbox", column: "badge" },
      ]}
    />
  );
}
