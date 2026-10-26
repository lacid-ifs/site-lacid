# Site LACID (Next.js)

Site da Liga Acadêmica de Ciência de Dados e IA do IFS, com o design do PR #1 e um painel
administrativo para editar tudo sem mexer no código.

**Stack:** Next.js 15 (App Router) · TypeScript · Prisma + PostgreSQL · Auth.js (login e senha) · Zod

## Rodando localmente

```bash
npm install
cp .env.example .env        # ajuste AUTH_SECRET e a senha do admin
npm run db:up               # sobe o Postgres (docker compose)
npm run db:push             # cria as tabelas
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

## Pontos de atenção para produção

- **Uploads:** hoje vão para a pasta `uploads/` (disco). Na Vercel o disco não persiste: troque
  `saveUpload`/`readUpload` em `src/lib/storage.ts` por Vercel Blob, S3 ou Supabase Storage.
- Defina `AUTH_SECRET` forte e **troque a senha do admin** após o primeiro login.
- Banco gerenciado (Neon/Supabase) + `DATABASE_URL` nas variáveis da Vercel; rode `db:push` e `db:seed` uma vez.
