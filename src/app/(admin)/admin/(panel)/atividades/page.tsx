import { ResourceManager } from "@/components/admin/ResourceManager";
import { requirePage } from "@/lib/guard";

export const metadata = { title: "Atividades" };

export default async function Page() {
  await requirePage(["ADMIN", "EDITOR"]);
  return (
    <ResourceManager
      title="Atividades"
      singular="atividade"
      endpoint="/api/activities"
      fields={[
        { name: "title", label: "Título", type: "text", required: true, column: "text" },
        { name: "subtitle", label: "Subtítulo", type: "text", column: "text" },
        { name: "text", label: "Descrição", type: "textarea" },
        { name: "icon", label: "Ícone (Bootstrap Icons)", type: "text", defaultValue: "bi-lightbulb-fill", hint: "Ex.: bi-lightbulb-fill, bi-people-fill, bi-tools, bi-book-fill" },
        {
          name: "variant",
          label: "Cor do card",
          type: "select",
          options: [
            { value: "inovacao", label: "Inovação" },
            { value: "extensao", label: "Extensão" },
            { value: "oficinas", label: "Oficinas" },
            { value: "minicursos", label: "Minicursos" },
          ],
          column: "text",
        },
        { name: "order", label: "Ordem", type: "number" },
        { name: "active", label: "Visível no site", type: "checkbox", column: "badge" },
      ]}
    />
  );
}
