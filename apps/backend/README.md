# Recipes API (NestJS)

Backend do monorepo `recipes-app-2`: API REST de receitas com autenticação JWT, upload de avatares e amizades. Construída com **Nest 12 + Drizzle ORM + PostgreSQL** (migrada do backend original em Spring Boot, `old-backend/`). O frontend irmão (Vite + React) vive em `../frontend` e é servido pela stack do `compose.yaml` deste diretório.

## Setup (desenvolvimento)

Pré-requisitos: Node 24, pnpm (fixado via campo `packageManager`), Docker.

```bash
docker compose up -d db db-test   # Postgres: db (5432) e db-test (5433)
cp .env.example .env
pnpm install
pnpm start:dev                    # http://localhost:3000
```

No boot a aplicação aplica as migrations (`drizzle/`) e faz o seed do usuário admin (idempotente):

- **email:** `admin@email.com`
- **password:** `123`

## Stack completa com Docker

O `compose.yaml` deste diretório é o ponto de entrada único da stack (substitui o antigo `docker-compose.yaml`):

| Serviço | Porta no host | Descrição |
|---|---|---|
| `app` | 3000 | API NestJS (imagem com HEALTHCHECK em `/health`) |
| `frontend` | 5173 | Frontend em `nginx-unprivileged` (escuta na 8080 interna) |
| `db` | 5432 | Postgres 17 de desenvolvimento (volume persistente) |
| `db-test` | 5433 | Postgres 17 efêmero (tmpfs) para os testes e2e |

```bash
docker compose up -d --build
```

As variáveis `DB_USERNAME`, `DB_PASSWORD` e `JWT_SECRET` são **obrigatórias** no compose; o restante tem defaults. No frontend, `VITE_API_URL` é build-arg (default `http://localhost:3000`) e deve apontar para a URL que o navegador do host usa para alcançar a API — é embutido no bundle em tempo de build. Os contêineres rodam com hardening (`read_only`, `no-new-privileges`, `init: true`), subida em ordem via healthchecks e `restart: unless-stopped`.

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
| GET | `/recipes` | JWT | Lista (200 com `[]` quando vazio) |
| GET | `/recipes/:id` | JWT | Detalhe (404 se não existir) |
| POST | `/recipes` | JWT | Cria receita para o usuário do token → 201 + `Location` |
| DELETE | `/recipes/:id` | JWT | Remove — só o dono (senão **403**; 404 se não existir) → 204 |
| GET | `/recipes/:id/ingredients` | JWT | Ingredientes da receita |
| GET | `/recipes/:id/steps` | JWT | Passos da receita |
| POST | `/ingredients` | JWT | Adiciona ingrediente (404 se a receita não existir) |
| POST | `/steps` | JWT | Adiciona passo (404 se a receita não existir) |

Notas:

- DTOs validados com `class-validator` e o `ValidationPipe` global (`whitelist: true`): campos extras no corpo são descartados silenciosamente.
- Todo `POST` com resposta `201` (users/recipes/ingredients/steps) seta o header `Location` para o recurso criado.
- O registro exige `name`, `email`, `password` (mín. 8, com maiúscula, minúscula, dígito e especial) e `avatarUrl` não vazio.
- A troca de senha valida a senha atual e rejeita reutilização de senha do histórico; a antiga é arquivada no mesmo banco.
- `POST /ingredients` e `POST /steps` verificam **apenas a existência** da receita, não a posse.
- `POST /recipes` exige todos os campos: `title`, `description`, `preparationTime` e `servings` (inteiros), `difficulty` (string livre, sem enum no banco, máx. 255) e `imageUrl`.
- Swagger UI em [`http://localhost:3000/docs`](http://localhost:3000/docs).

## Uploads

Avatares são enviados via `POST /users/me/avatar` (campo `file`): JPEG/PNG/WebP/GIF, até 5 MB (413 acima disso). O arquivo é gravado em `uploads/avatars/<uuid>.<ext>` e servido estaticamente em `/uploads` com `nosniff`. O avatar anterior é apagado do disco quando substituído ou quando a conta é removida (URLs fora de `/uploads/avatars/`, como a do seed, não são apagadas). No Docker, `uploads/` é um volume nomeado — a imagem roda read-only, então nada fora dele (e de `/tmp`) é gravável.

`recipes.imageUrl` existe no schema, mas ainda não há endpoint de upload de imagem de receita.

## Variáveis de ambiente

| Variável | Default | Descrição |
|---|---|---|
| `DATABASE_URL` | `postgres://root:123@localhost:5432/recipes_app` | Conexão Postgres |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / `123` | Fallback para montar `DATABASE_URL` (obrigatórias no compose) |
| `PORT` | `3000` (via `.env.example`; sem `.env`, o fallback em `main.ts` é `8000`) | Porta HTTP |
| `ALLOWED_ORIGIN` | `http://localhost:5173` | Origem CORS (frontend Vite) |
| `JWT_SECRET` | `your-secure-secret` | Secret do JWT (HS256) — obrigatório no compose |
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
pnpm test:e2e           # e2e contra o db-test (docker compose up -d --wait db-test)
pnpm db:generate        # gera migrations a partir de src/database/schema.ts
pnpm db:migrate         # aplica migrations pendentes
pnpm db:studio          # Drizzle Studio
```

Os testes e2e apontam para a porta 5433 (`db-test`) e fazem `TRUNCATE` a cada teste — nunca rode e2e contra o Postgres de dev (5432). Em dev, exporte um `DATABASE_URL` apontando para o banco certo antes de usar os scripts `db:*`.

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
