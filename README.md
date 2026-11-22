# 🍴 Recipes App

Monorepo de um app de gerenciamento de receitas: SPA em **React** no frontend e API REST em **NestJS** no backend.

> Reescrita completa de um projeto original em Java/Angular (removido do repositório).

## 🛠️ Tecnologias

| | Frontend ([`apps/frontend/`](./apps/frontend)) | Backend ([`apps/backend/`](./apps/backend)) |
|---|---|---|
| Base | React 19 + TypeScript + Vite 8 | NestJS 12 + TypeScript (ESM) |
| Roteamento | React Router v8 (`createBrowserRouter`) | — |
| Dados servidor | TanStack Query v5 | — |
| Estado | Zustand (autenticação) | — |
| Formulários | react-hook-form + Zod | class-validator + class-transformer |
| UI / Estilo | `@base-ui/react` + Tailwind CSS v4 | — |
| ORM / Banco | — | Drizzle ORM + PostgreSQL 17 (migrations em `drizzle/`) |
| Auth | — | JWT (global guard) + bcrypt |
| Docs / API | — | Swagger em `/docs` |
| Lint | oxlint | oxlint + Prettier |
| Testes | — | Vitest (unitários + e2e) |
| Containerização | Docker + Docker Compose (nginx-unprivileged) | Docker + Docker Compose |

## ✨ Funcionalidades

- **Autenticação (JWT)** — login e registro de novo usuário; o token fica no `localStorage` via store Zustand, com logout automático em 401 de `/auth/me`.
- **Receitas** — listagem das próprias receitas na home, criação de receita (dados gerais: título, descrição, tempo, porções, dificuldade e `imageUrl`), detalhe e exclusão (nos cards da home; **só o próprio autor** — o backend responde 403). `ingredients` e `steps` não entram no ato de criação: são adicionados depois, em dialogs na página de detalhe.
- **Conta** — edição de perfil, troca de senha (com histórico para impedir reuso), upload de avatar (foto de perfil, máx. 5MB — validação de tamanho/tipo é só no backend; o cliente apenas informa o limite) e exclusão da conta (cascade de todos os dados).
- **Amigos** — gerenciamento de amizades na página de conta.
- **API documentada** — Swagger interativo em [`http://localhost:3000/docs`](http://localhost:3000/docs).

> Ao subir o backend, um usuário admin é criado automaticamente (seed idempotente), usado para o primeiro login:
>
> ```text
> E-mail: admin@email.com
> Senha:  123
> ```

## ⚙️ Como rodar

Pré-requisitos: Node.js 24, pnpm (fixado via corepack) e Docker.

### Opção A — Stack completa com Docker

Na raiz do monorepo:

```bash
cp .env.example .env    # defina DB_USERNAME, DB_PASSWORD e JWT_SECRET
docker compose up -d --wait
```

Sobe tudo de uma vez: frontend em `http://localhost:5173`, backend (Swagger em `/docs`) em `http://localhost:3000` e PostgreSQL em `localhost:5432`. Migrations e seed do admin rodam no boot do backend. Para encerrar: `docker compose down`.

> Não suba o compose standalone de um app (`docker compose up` dentro de `apps/<app>/`) junto com a stack da raiz — o frontend dos dois disputa a mesma porta 5173 do host.

### Opção B — Desenvolvimento local (app por app)

**Banco de dados** — em `apps/backend/`:

```bash
cd apps/backend
docker compose up -d postgres        # só o Postgres de dev (5432) — sem o
                                     #   serviço backend, que disputaria a
                                     #   porta 3000 com o pnpm start:dev
cp .env.example .env
```

**Backend** — ainda em `apps/backend/`:

```bash
pnpm install
pnpm start:dev                        # http://localhost:3000
```

**Frontend** — em outro terminal, em `apps/frontend/`:

```bash
cd ../frontend                        # ou abra apps/frontend em outro terminal
pnpm install
pnpm dev                              # http://localhost:5173
```

Comandos úteis por app (rodar dentro de `apps/<app>/`): `pnpm lint`, `pnpm build`; no backend também `pnpm format`, `pnpm test` (unitários) e `pnpm test:e2e` — este exige o Postgres efêmero da porta 5433, que sobe com `docker compose --profile test up -d --wait postgres-test` (nunca rode e2e contra o Postgres de dev da 5432; os testes fazem `TRUNCATE`). Para migrations e Drizzle Studio via `pnpm db:*`, exporte `DATABASE_URL` antes (ver [AGENTS.md do backend](./apps/backend/AGENTS.md)).

## 📁 Estrutura do projeto

```
.
├── apps/
│   ├── backend/        # API REST (NestJS + Drizzle ORM + PostgreSQL)
│   └── frontend/       # SPA (React 19 + Vite)
├── compose.yaml        # stack completa — inclui os composes dos dois apps
├── .env.example        # variáveis de ambiente da stack Docker (raiz)
├── AGENTS.md           # convenções do monorepo (leia junto com os AGENTS.md dos apps)
└── docs/               # documentação complementar (reservado; ainda vazio)
```

Cada app tem seu próprio `README.md`, `AGENTS.md`, `compose.yaml`, `.env.example` e `pnpm-lock.yaml` — detalhes de comandos, módulos, rotas e Docker estão neles:

- [`apps/backend/AGENTS.md`](./apps/backend/AGENTS.md) — módulos, mapa de rotas, auth, env, migrations, uploads, testes, Docker.
- [`apps/frontend/AGENTS.md`](./apps/frontend/AGENTS.md) — estrutura `core/` + `features/`, cliente HTTP, estado, formulários, tema, rotas.

## 👨‍💻 Autor

<table>
  <tr>
    <td align="center">
    <a href="https://github.com/guighm">
        <img src="https://avatars.githubusercontent.com/guighm" width="100px;" alt="Foto de Guilherme Moraes"/><br />
        <sub><b>Guilherme Moraes</b></sub>
        </a>
    </td>
  </tr>
</table>
