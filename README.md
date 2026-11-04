# Site LACID (Next.js)

Site da Liga Acadêmica de Ciência de Dados e IA do IFS, com o design do PR #1 e um painel
administrativo para editar tudo sem mexer no código.

**Stack:** Next.js 15 (App Router) · TypeScript · Prisma + PostgreSQL · Auth.js (login e senha) · Zod

## Rodando localmente

```bash
npm install
cp .env.example .env        # ajuste AUTH_SECRET e a senha do admin
npm run db:up               # sobe o Postgres (docker compose)
npm run db:deploy           # cria as tabelas (aplica prisma/migrations)
npm run db:seed             # importa membros, notícias, carrossel e cria o admin
npm run dev
```

- Site: http://localhost:3000
- Painel: http://localhost:3000/admin (e-mail/senha definidos em `SEED_ADMIN_*`)

Sem Docker, aponte `DATABASE_URL` para qualquer Postgres (Neon, Supabase, local).

## Níveis de acesso

| Nível | Pode |
| --- | --- |
| **ADMIN** | Tudo, inclusive usuários |
| **EDITOR** | Todo o conteúdo, publicar notícias, textos do site |
| **AUTHOR** | Criar notícias e editar **só os próprios rascunhos** (um editor publica) |

## API REST

Leitura é pública (só conteúdo publicado/ativo); escrita exige login e o nível indicado.

| Recurso | Rotas | Escrita |
| --- | --- | --- |
| Notícias | `GET/POST /api/news`, `GET/PATCH/DELETE /api/news/:idOuSlug` | todos (regras acima) |
| Membros | `/api/members`, `/api/members/:id` | ADMIN, EDITOR |
| Carrossel | `/api/carousel`, `/api/carousel/:id` | ADMIN, EDITOR |
| Atividades | `/api/activities`, `/api/activities/:id` | ADMIN, EDITOR |
| Eventos | `/api/events`, `/api/events/:id` | ADMIN, EDITOR |
| Textos do site | `GET/PUT /api/settings` | ADMIN, EDITOR |
| Usuários | `/api/users`, `/api/users/:id` | ADMIN |
| Upload | `POST /api/upload` (multipart, campo `file`) | logado |

Notícias aceitam `?q=texto` e, logado, `?manage=1` (autor vê só as suas, com rascunhos).
Erros: `401` sem login, `403` sem permissão, `404`, `409` duplicado, `422` dados inválidos (com `issues`).

## Estrutura

```
prisma/            schema, seed e dados originais (seed-data/)
src/app/(site)/    site público (home, /noticias, /noticias/[slug])
src/app/(admin)/   painel em /admin
src/app/api/       rotas REST
src/lib/           db, auth, helpers de API/CRUD, schemas Zod, storage
src/components/    site/ (carrossel, navbar...) e admin/ (CRUD genérico, editor de notícia)
public/            imagens, fontes e PDFs (do PR #1)
```

## Deploy (produção)

O site precisa de **três coisas externas**, além do código:

| Peça | Para quê | Hoje |
| --- | --- | --- |
| Hospedagem Node.js | Roda o Next.js | Vercel |
| Banco PostgreSQL | Notícias, membros, usuários, textos do site | Neon (Postgres gerenciado) |
| Armazenamento de arquivos | Imagens e PDFs enviados pelo painel | Vercel Blob |

Requisitos: Node 20 ou superior e um repositório Git com o código.

### Variáveis de ambiente

Configure no painel da hospedagem (nunca commite valores reais; o `.gitignore` já ignora `.env*`, exceto o `.env.example`).

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | Sim | String de conexão do Postgres, usada pelo site e pelas migrations. No Neon, use a URL **direta** (host **sem** `-pooler`): as migrations não funcionam pelo pooler. |
| `AUTH_SECRET` | Sim | Segredo do login. Gere com `npx auth secret` ou `openssl rand -base64 32`. Trocar o valor desloga todo mundo. |
| `AUTH_TRUST_HOST` | Fora da Vercel | `true`. Necessário quando o app roda atrás de proxy ou domínio próprio. |
| `BLOB_READ_WRITE_TOKEN` | Para uploads | Token do Vercel Blob. Sem ele, os uploads vão para o disco (`uploads/`), que **não persiste** na Vercel. |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME` | Só no primeiro seed | Dados do administrador inicial. A senha precisa ter 8 caracteres ou mais. |
| `UPLOAD_DIR` | Não | Pasta de uploads em disco (padrão: `uploads`). Só vale sem Blob. |

### Passo a passo na Vercel

1. **Banco:** crie um projeto Postgres no [Neon](https://neon.tech) (ou Supabase) e copie a `DATABASE_URL`.
2. **Projeto:** na Vercel, **Add New → Project**, importe o repositório. O framework é detectado como Next.js e o build usa `npm run build`. Não mude nada.
3. **Variáveis:** em **Settings → Environment Variables**, cadastre `DATABASE_URL` (URL direta do banco, no ambiente **Production**), `AUTH_SECRET` e as `SEED_ADMIN_*`.
4. **Uploads:** em **Storage → Create → Blob**, crie o store e conecte ao projeto. A Vercel adiciona `BLOB_READ_WRITE_TOKEN` sozinha.
5. **Deploy:** o build de **produção** roda `prisma migrate deploy` sozinho (veja "Migrations" abaixo), então as tabelas são criadas no primeiro deploy se o banco estiver vazio.
6. **Dados iniciais** (uma vez, só se o banco novo estiver vazio e você **não** for restaurar um dump). Na sua máquina, apontando para o banco de produção:

   ```bash
   # Linux/macOS
   DATABASE_URL="<url direta do banco>" SEED_ADMIN_EMAIL="..." SEED_ADMIN_PASSWORD="..." npm run db:seed
   ```

   No PowerShell, defina antes com `$env:DATABASE_URL = "<url>"` e rode `npm run db:seed` sem o prefixo.
7. Acesse `https://<seu-dominio>/admin`, entre com o admin do seed e **troque a senha**.
8. Domínio próprio: **Settings → Domains → Add** e siga o DNS indicado.

### Migrations (como o banco é criado e atualizado)

O schema fica em `prisma/schema.prisma` e as mudanças em `prisma/migrations/`. O `npm run build` (arquivo `scripts/build.mjs`) faz:

- `prisma generate` sempre;
- `prisma migrate deploy` **só quando `VERCEL_ENV=production`**. Previews e builds locais não tocam no banco;
- `next build`.

O `migrate deploy` só aplica o que ainda não foi aplicado e não pede confirmação. Ele cria tabelas dentro de um banco que **já existe**; criar o banco em si (o projeto no Neon, por exemplo) é manual.

**Escolha o caminho conforme o banco:**

| Situação | O que fazer |
| --- | --- |
| **Banco novo e vazio, começando do zero** | Nada de extra: o primeiro deploy de produção cria as tabelas. Depois rode o seed (passo 6). |
| **Banco novo, herdando o conteúdo atual do site** | Restaure o dump **antes** do primeiro deploy: `psql "<url direta>" -f lacid.sql`. Depois marque a migration inicial como aplicada (linha abaixo) e faça o deploy. |
| **Banco que já tem as tabelas** (criado com `db push`, como o atual de produção) | Marque a migration inicial como já aplicada **antes** do primeiro deploy com migrations. |

Marcar a migration inicial como aplicada (para bancos que já têm as tabelas):

```bash
DATABASE_URL="<url direta>" npx prisma migrate resolve --applied 0_init
```

Sem isso, o build de produção tenta criar tabelas que já existem e **falha** (o site anterior continua no ar).

**Mudando o schema depois:** edite o `schema.prisma`, rode `npm run db:migrate -- --name descricao` (precisa de um Postgres local, veja o `docker-compose.yml`, ou de uma branch de desenvolvimento do Neon), revise o SQL gerado em `prisma/migrations/` e faça commit da pasta. O próximo deploy de produção aplica. Migration que remove coluna ou tabela **apaga dados**: faça backup antes.

### Cuidados importantes

- **Rode `db:seed` só uma vez.** Ele apaga e recria carrossel, membros e atividades a partir de `prisma/seed-data/` e regrava as notícias de mesmo `slug`. Rodar de novo em produção **desfaz o que foi editado pelo painel**.
- **Não use `prisma db push` em produção.** O banco é versionado por migrations (seção acima). Misturar os dois faz o banco ficar diferente do histórico de migrations.
- Arquivos `*.sql` de dump estão no `.gitignore` de propósito (têm e-mails e hashes de senha). Nunca faça commit de um dump.
- Os PDFs e imagens em `public/` fazem parte do repositório. Os enviados pelo painel ficam no Blob e **não** estão no Git.
- Sem `BLOB_READ_WRITE_TOKEN`, o upload funciona, mas os arquivos somem a cada novo deploy na Vercel.

### Deploy em outra hospedagem (servidor próprio, VPS, Docker)

Qualquer lugar com Node 20+ serve:

```bash
npm ci
npm run build
npm run start        # porta 3000; use PORT=... para mudar
```

Coloque Nginx ou Caddy na frente para HTTPS e defina `AUTH_TRUST_HOST=true`. Sem Vercel Blob, os uploads ficam na pasta `uploads/`: monte um volume persistente nela (ou defina `UPLOAD_DIR`) e inclua essa pasta no backup. Para o banco, use qualquer Postgres 14 ou superior (o `docker-compose.yml` serve só para desenvolvimento).

### Trocar de repositório ou de conta (passagem de bastão)

Quem recebe o projeto precisa de acesso a estas peças, que **não** vêm junto com o código:

1. **Repositório Git:** adicione o novo remoto e envie tudo.

   ```bash
   git remote add novo <url-do-novo-repo>
   git push novo main
   ```

2. **Banco de dados:** o conteúdo editado pelo painel mora no Postgres, não no Git. Para levar para outro banco, **não use o seed**; copie os dados:

   ```bash
   pg_dump "<url-do-banco-antigo>" --no-owner --no-acl -f lacid.sql
   psql "<url-do-banco-novo>" -f lacid.sql
   ```

   Ou transfira a propriedade do projeto Neon para a nova conta.
3. **Arquivos enviados (Vercel Blob):** os links no banco apontam para o store antigo. Se o store antigo for apagado, imagens e PDFs enviados pelo painel quebram. Mantenha o store ativo ou baixe os arquivos e envie de novo para o novo store (e atualize as URLs no banco).
4. **Projeto na Vercel:** reimporte o repositório novo e recadastre as variáveis. O `AUTH_SECRET` pode ser novo (só desloga os usuários).
5. **Contas e acessos:** liste quem é dono do Neon, da Vercel, do domínio e do GitHub, e transfira ou adicione o novo responsável em cada um.
6. **Usuários do painel:** crie ou ajuste os usuários em `/admin/usuarios` e troque as senhas do admin inicial.

### Checklist depois de publicar

- A página inicial carrega com carrossel, membros e atividades.
- `/noticias` lista as notícias e abrir uma funciona.
- `/admin/login` aceita o login e o painel abre.
- Enviar uma imagem pelo painel e ver ela aparecer no site (confirma o Blob).
- Criar uma notícia de teste, publicar e apagar.

### Problemas comuns

| Sintoma | Causa provável |
| --- | --- |
| Build falha com erro do Prisma | `DATABASE_URL` ausente ou inválida nas variáveis do build. |
| Build de produção falha em `migrate deploy` com "already exists" | Banco já tinha as tabelas e a migration inicial não foi marcada: rode `prisma migrate resolve --applied 0_init`. |
| Build de produção falha pedindo `DATABASE_URL` | Variável não cadastrada na Vercel, ou cadastrada só em Preview. Ela precisa estar em **Production**. |
| `migrate deploy` trava ou dá timeout no build | `DATABASE_URL` com a URL **pooled** (`-pooler` no host). Troque pela URL direta. |
| Erro de tabela inexistente | O deploy não era de produção (previews não migram) ou o banco novo ainda não recebeu `migrate deploy`. |
| Login volta para a tela de login | `AUTH_SECRET` ausente, ou `AUTH_TRUST_HOST` faltando fora da Vercel. |
| Upload dá certo mas a imagem some depois | Sem `BLOB_READ_WRITE_TOKEN`: está gravando em disco efêmero. |
| Erro de "too many connections" no banco | Muitas conexões diretas abertas ao mesmo tempo (tráfego alto). Aí vale separar uma URL *pooled* para o site e uma direta para as migrations (`directUrl` no Prisma). |
