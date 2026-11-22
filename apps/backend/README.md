# Recipes API (NestJS)

Backend do monorepo `recipes-app-2`: API REST de receitas com autenticação JWT, upload de avatares e amizades. Construída com **Nest 12 + Drizzle ORM + PostgreSQL** (reescrita do backend original em Java do projeto, hoje removido do repositório). O frontend irmão (Vite + React) vive em `../frontend`; a stack completa (frontend incluso) é subida pelo `compose.yaml` da raiz do monorepo.

## Setup (desenvolvimento)

Pré-requisitos: Node 24, pnpm (fixado via campo `packageManager`), Docker.

```bash
docker compose up -d postgres postgres-test   # Postgres: postgres (5432) e postgres-test (5433)
cp .env.example .env
pnpm install
pnpm start:dev                    # http://localhost:3000
```

No boot a aplicação aplica as migrations (`drizzle/`) e faz o seed do usuário admin (idempotente):

- **email:** `admin@email.com`
- **password:** `123`

## Docker

O `compose.yaml` deste diretório sobe o backend e os bancos — o serviço `frontend` **não** é declarado aqui (fica em `apps/frontend/compose.yaml`, única declaração dele). Na stack completa, o `compose.yaml` da raiz do monorepo inclui este arquivo e o do frontend via `include:` e é o ponto de entrada único:

| Serviço | Porta no host | Descrição |
|---|---|---|
| `backend` | 3000 | API NestJS (imagem com HEALTHCHECK em `/health`) |
| `postgres` | 5432 | Postgres 17 de desenvolvimento (volume persistente) |
| `postgres-test` | 5433 | Postgres 17 efêmero (tmpfs) para os testes e2e (`profile test`) |

```bash
docker compose up -d --build       # a partir deste diretório: backend + postgres
# stack completa (frontend incluso): docker compose up -d --wait na raiz
```

As variáveis `DB_USERNAME`, `DB_PASSWORD` e `JWT_SECRET` são **obrigatórias** no compose; o restante tem defaults (veja o `.env.example` da raiz para a stack completa). Os contêineres rodam com hardening (`read_only`, `no-new-privileges`, `init: true`), subida em ordem via healthchecks e `restart: unless-stopped`.

## Endpoints

Todas as rotas exigem `Authorization: Bearer <token>`, exceto as marcadas como públicas.

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/health` | público | Health check |
| POST | `/auth/login` | público | Login → `{ id, accessToken }` |
| GET | `/auth/me` | JWT | Usuário autenticado (`{ id, name, email, avatarUrl, createdAt }`; 404 se o usuário do token não existir mais) |
| POST | `/users/register` | público | Registro → 201 + `Location` |
| PATCH | `/users/me` | JWT | Atualiza `name` e/ou `email` (409 se o e-mail já existir) |
| PATCH | `/users/me/password` | JWT | Troca de senha → 204 (401 se a atual estiver errada; 409 se repetida) |
| POST | `/users/me/avatar` | JWT | Upload de avatar (multipart) → 201 (400 se tipo inválido; 413 se > 5 MB), ver [Uploads](#uploads) |
| DELETE | `/users/me` | JWT | Remove a conta (e tudo em cascade) → 204 |
| GET | `/users/me/friends` | JWT | Lista de amizades |
| POST | `/users/me/friends` | JWT | Cria amizade bidirecional (400 se `friendId === userId`; 404 se o usuário não existe; 409 se já são amigos) |
| DELETE | `/users/me/friends/:friendId` | JWT | Remove a amizade → 204 (404 se não existe) |
| GET | `/recipes` | JWT | Lista **todas as receitas de todos os usuários** (sem paginação; `[]` quando vazio) — a home do frontend filtra pelas do usuário logado |
| GET | `/recipes/:id` | JWT | Detalhe (404 se não existir) |
| POST | `/recipes` | JWT | Cria receita para o usuário do token → 201 + `Location` |
| DELETE | `/recipes/:id` | JWT | Remove — só o dono (senão **403**; 404 se não existir) → 204 |
| GET | `/recipes/:id/ingredients` | JWT | Ingredientes da receita |
| GET | `/recipes/:id/steps` | JWT | Passos da receita |
| POST | `/ingredients` | JWT | Adiciona ingrediente (404 se a receita não existir) |
| POST | `/steps` | JWT | Adiciona passo (404 se a receita não existir) |

Notas:

- DTOs validados com `class-validator` e o `ValidationPipe` global (`whitelist: true`): campos extras no corpo são descartados silenciosamente.
- Todo `POST` com resposta `201` (users/recipes/ingredients/steps) seta o header `Location` para o recurso criado — exceção: `POST /users/me/friends` responde `201` sem `Location`. Em `/ingredients` e `/steps`, o `Location` (`/ingredients/:id`, `/steps/:id`) aponta para rotas que só existem como POST (não há GET nelas).
- O registro exige `name`, `email`, `password` (mín. 8, com maiúscula, minúscula, dígito e especial) e `avatarUrl` não vazio.
- A troca de senha valida a senha atual e rejeita reutilização de senha do histórico; a antiga é arquivada no mesmo banco.
- `POST /ingredients` e `POST /steps` verificam **apenas a existência** da receita, não a posse.
- `POST /recipes` exige todos os campos: `title`, `description`, `preparationTime` e `servings` (inteiros ≥ 1), `difficulty` (string livre, sem enum no banco, máx. 255) e `imageUrl`.
- Swagger UI em [`http://localhost:3000/docs`](http://localhost:3000/docs).

## Uploads

Avatares são enviados via `POST /users/me/avatar` (campo `file`): JPEG/PNG/WebP/GIF, até 5 MB (413 acima disso). O arquivo é gravado em `uploads/avatars/<uuid>.<ext>` e servido estaticamente em `/uploads` com `nosniff`. O avatar anterior é apagado do disco quando substituído ou quando a conta é removida (URLs fora de `/uploads/avatars/`, como a do seed, não são apagadas). No Docker, `uploads/` é um volume nomeado — a imagem roda read-only, então nada fora dele (e de `/tmp`) é gravável.

`recipes.imageUrl` existe no schema, mas ainda não há endpoint de upload de imagem de receita.

## Variáveis de ambiente

| Variável | Default | Descrição |
|---|---|---|
| `DATABASE_URL` | `postgres://root:123@localhost:5432/recipes_app` | Conexão Postgres |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / `123` | Fallback para montar `DATABASE_URL` (obrigatórias no compose) |
| `PORT` | `3000` (default em `src/config/env.ts`, reatribuído a `process.env` pelo `ConfigModule` — o fallback `8000` de `main.ts` não é alcançado) | Porta HTTP |
| `ALLOWED_ORIGIN` | `http://localhost:5173` | Origem CORS (frontend Vite) |
| `JWT_SECRET` | ⚠️ sem default em `env.ts`, mas o `AuthModule` cai para `'your-secure-secret'` hardcoded se ausente (obrigatório no compose) | Secret do JWT (HS256) — defina sempre, inclusive em dev: sem ela o boot sobe silenciosamente com o segredo conhecido |
| `JWT_EXPIRATION_MS` | `72000000` | `expiresIn` do token, em segundos apesar do nome (72000000 s ≈ 2,3 anos — **não confunda com milissegundos**) |
| `JWT_ISSUER` | `recipes-app-api` | Issuer do token |

Verificadas em `src/config/env.ts` (class-validator). Um host novo consumindo a API precisa do `ALLOWED_ORIGIN` atualizado — em dev local o default já cobre o Vite.

## Scripts

```bash
pnpm start:dev          # desenvolvimento (watch)
pnpm build              # nest build → dist/
pnpm format             # prettier --write
pnpm lint               # oxlint em src/ e test/
pnpm test               # testes unitários (Vitest) — não precisam de Postgres
pnpm test:e2e           # e2e contra o postgres-test (docker compose up -d --wait postgres-test)
pnpm db:generate        # gera migrations a partir de src/database/schema.ts
pnpm db:migrate         # aplica migrations pendentes
pnpm db:studio          # Drizzle Studio
```

Os testes e2e apontam para a porta 5433 (`postgres-test`) e fazem `TRUNCATE` a cada teste — nunca rode e2e contra o Postgres de dev (5432). Em dev, exporte um `DATABASE_URL` apontando para o banco certo antes de usar os scripts `db:*`.

> O `package.json` ainda tem scripts do scaffold sem uso real (`start`, `start:debug`, `deploy`, `test:watch`, `test:cov`, `test:debug`). O `start:prod` roda `node dist/main` sem `.js` — falha em ESM; em produção use `node dist/main.js` (como faz o CMD do Docker).

## Docker (imagem da API)

```bash
docker build -t recipes-backend .
docker run -p 3000:3000 \
  -e DATABASE_URL=postgres://root:123@host.docker.internal:5432/recipes_app \
  recipes-backend
```

A imagem multi-stage (`node:24-alpine`) roda como usuário `node`, executa as migrations e o seed no boot e tem `HEALTHCHECK` em `/health` com `start-period` cobrindo a migração.

## Estrutura

```
src/
├── common/          # guards, @Public() e @CurrentUser(), validators, DTOs de erro
├── config/          # validação de variáveis de ambiente
├── database/        # schema Drizzle, DatabaseModule (migrate + seed no boot), provider
├── auth/            # login e GET /auth/me (módulo global)
├── users/           # registro, perfil (/users/me), avatar, deleção de conta
├── friends/         # amizades (rotas sob /users/me/friends)
├── recipes/         # CRUD de receitas + listagens aninhadas
├── ingredients/     # criação avulsa de ingredientes
└── steps/           # criação avulsa de passos
```

O guard JWT é global (`APP_GUARD`): por padrão toda rota é protegida e as públicas recebem `@Public()`. Erros de domínio são lançados nas services como exceções Nest (`NotFound`, `Conflict`, `Forbidden`, `Unauthorized`, `BadRequest`). FKs usam `CASCADE`: apagar um usuário apaga receitas, ingredientes, passos, histórico de senhas e amizades dele; apagar uma receita apaga seus ingredientes e passos.

As tabelas `categories` e `recipes_categories` existem no schema por paridade com o projeto Java original, mas não são usadas pela aplicação.
