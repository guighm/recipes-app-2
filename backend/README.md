# Recipes API (NestJS)

Backend do recipes-app: API REST de receitas com autenticação JWT, construída com **Nest 12 + Drizzle ORM + PostgreSQL**. Migrada do backend Spring Boot original (`old-backend/`).

## Setup

Pré-requisitos: Node 24, pnpm, Docker.

```bash
docker compose up -d      # Postgres: db (5432) e db-test (5433)
cp .env.example .env
pnpm install
pnpm start:dev            # http://localhost:3000
```

No startup a aplicação roda as migrations (`drizzle/`) e semeia o usuário admin:

- **email:** `admin@email.com`
- **senha:** `123`

## Endpoints

Todas as rotas exigem `Authorization: Bearer <token>`, exceto as marcadas como públicas.

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/health` | pública | Healthcheck |
| POST | `/auth/login` | pública | Login → `{ id, accessToken }` |
| POST | `/users/register` | pública | Registro → 201 + `Location` |
| GET | `/recipes` | JWT | Lista (200 com `[]` quando vazia) |
| GET | `/recipes/:id` | JWT | Detalhe (404 se inexistente) |
| POST | `/recipes` | JWT | Cria receita do usuário do token → 201 + `Location` |
| DELETE | `/recipes/:id` | JWT | Remove — apenas o dono (senão **403**) |
| GET | `/recipes/:id/ingredients` | JWT | Ingredientes da receita |
| GET | `/recipes/:id/steps` | JWT | Passos da receita |
| POST | `/ingredients` | JWT | Adiciona ingrediente (404 se receita inexistente) |
| POST | `/steps` | JWT | Adiciona passo (404 se receita inexistente) |

DTOs são validados com `class-validator`; campos extras no body são ignorados (whitelist). Swagger UI em [`http://localhost:3000/docs`](http://localhost:3000/docs).

## Variáveis de ambiente

| Variável | Default | Descrição |
|---|---|---|
| `DATABASE_URL` | `postgres://root:123@localhost:5432/recipes_app` | Conexão Postgres |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / `123` | Fallback do `DATABASE_URL` |
| `PORT` | `3000` | Porta HTTP |
| `ALLOWED_ORIGIN` | `http://localhost:5173` | Origem CORS (frontend Vite) |
| `JWT_SECRET` | `your-secure-secret` | Secret do JWT (HS256) |
| `JWT_EXPIRATION_MS` | `72000000` (20h) | Expiração do token |
| `JWT_ISSUER` | `recipes-app-api` | Emissor do token |

## Scripts

```bash
pnpm start:dev          # desenvolvimento (watch)
pnpm test               # testes unitários (Vitest)
pnpm test:e2e           # e2e contra o db-test (docker compose up -d db-test)
pnpm lint               # oxlint
pnpm db:generate        # gera migrations a partir de src/database/schema.ts
pnpm db:migrate         # aplica migrations pendentes
pnpm db:studio          # Drizzle Studio
```

## Docker

```bash
docker build -t recipes-backend .
docker run -p 3000:3000 \
  -e DATABASE_URL=postgres://root:123@host.docker.internal:5432/recipes_app \
  recipes-backend
```

A imagem roda migrations e o seed no startup.

## Estrutura

```
src/
├── common/          # @Public() decorator, JwtAuthGuard, tipagem de request.user
├── config/          # validação de variáveis de ambiente
├── database/        # schema Drizzle, DatabaseModule (migrate + seed no boot)
├── auth/            # login JWT (módulo global)
├── users/           # registro de usuários
├── recipes/         # CRUD de receitas + listagens aninhadas
├── ingredients/     # adição de ingredientes
└── steps/           # adição de passos
```

As tabelas `categories` e `recipes_categories` existem no schema por paridade com o projeto Java original, mas não são usadas pela aplicação.