# Recipes API (NestJS)

recipes-app backend: REST recipes API with JWT authentication, built with **Nest 12 + Drizzle ORM + PostgreSQL**. Migrated from the original Spring Boot backend (`old-backend/`).

## Setup

Prerequisites: Node 24, pnpm, Docker.

```bash
docker compose up -d      # Postgres: db (5432) and db-test (5433)
cp .env.example .env
pnpm install
pnpm start:dev            # http://localhost:3000
```

On startup the application runs the migrations (`drizzle/`) and seeds the admin user:

- **email:** `admin@email.com`
- **password:** `123`

## Endpoints

All routes require `Authorization: Bearer <token>`, except those marked as public.

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/health` | public | Health check |
| POST | `/auth/login` | public | Login → `{ id, accessToken }` |
| POST | `/users/register` | public | Register → 201 + `Location` |
| GET | `/recipes` | JWT | List (200 with `[]` when empty) |
| GET | `/recipes/:id` | JWT | Detail (404 if missing) |
| POST | `/recipes` | JWT | Creates a recipe for the token's user → 201 + `Location` |
| DELETE | `/recipes/:id` | JWT | Removes — owner only (otherwise **403**) |
| GET | `/recipes/:id/ingredients` | JWT | Recipe ingredients |
| GET | `/recipes/:id/steps` | JWT | Recipe steps |
| POST | `/ingredients` | JWT | Adds an ingredient (404 if the recipe is missing) |
| POST | `/steps` | JWT | Adds a step (404 if the recipe is missing) |

DTOs are validated with `class-validator`; extra fields in the body are ignored (whitelist). Swagger UI at [`http://localhost:3000/docs`](http://localhost:3000/docs).

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgres://root:123@localhost:5432/recipes_app` | Postgres connection |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / `123` | Fallback for `DATABASE_URL` |
| `PORT` | `3000` | HTTP port |
| `ALLOWED_ORIGIN` | `http://localhost:5173` | CORS origin (Vite frontend) |
| `JWT_SECRET` | `your-secure-secret` | JWT secret (HS256) |
| `JWT_EXPIRATION_MS` | `72000000` (20h) | Token expiration |
| `JWT_ISSUER` | `recipes-app-api` | Token issuer |

## Scripts

```bash
pnpm start:dev          # development (watch)
pnpm test               # unit tests (Vitest)
pnpm test:e2e           # e2e against db-test (docker compose up -d db-test)
pnpm lint               # oxlint
pnpm db:generate        # generates migrations from src/database/schema.ts
pnpm db:migrate         # applies pending migrations
pnpm db:studio          # Drizzle Studio
```

## Docker

```bash
docker build -t recipes-backend .
docker run -p 3000:3000 \
  -e DATABASE_URL=postgres://root:123@host.docker.internal:5432/recipes_app \
  recipes-backend
```

The image runs the migrations and the seed on startup.

## Structure

```
src/
├── common/          # @Public() decorator, JwtAuthGuard, request.user typing
├── config/          # environment variable validation
├── database/        # Drizzle schema, DatabaseModule (migrate + seed on boot)
├── auth/            # JWT login (global module)
├── users/           # user registration
├── recipes/         # recipes CRUD + nested listings
├── ingredients/     # ingredient addition
└── steps/           # step addition
```

The `categories` and `recipes_categories` tables exist in the schema for parity with the original Java project, but are not used by the application.