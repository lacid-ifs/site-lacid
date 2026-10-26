import { ResourceManager } from "@/components/admin/ResourceManager";
import { requirePage } from "@/lib/guard";

export const metadata = { title: "Usuários" };

export default async function Page() {
  const me = await requirePage(["ADMIN"]);
  return (
    <>
      <p className="hint" style={{ marginBottom: 14 }}>
        <b>Administrador</b>: tudo, inclusive usuários. <b>Editor</b>: todo o conteúdo e publicação de notícias.{" "}
        <b>Autor</b>: cria e edita só os próprios rascunhos.
      </p>
      <ResourceManager
        title="Usuários"
        singular="usuário"
        endpoint="/api/users"
        selfId={me.id}
        fields={[
          { name: "name", label: "Nome", type: "text", required: true, column: "text" },
          { name: "email", label: "E-mail", type: "email", required: true, column: "text" },
          { name: "password", label: "Senha", type: "password", required: true, hint: "Mínimo 8 caracteres. Ao editar, deixe vazio para manter." },
          {
            name: "role",
            label: "Nível de acesso",
            type: "select",
            defaultValue: "AUTHOR",
            options: [
              { value: "ADMIN", label: "Administrador" },
              { value: "EDITOR", label: "Editor" },
              { value: "AUTHOR", label: "Autor" },
            ],
            column: "text",
          },
          { name: "active", label: "Ativo", type: "checkbox", column: "badge" },
        ]}
      />
    </>
  );
}
