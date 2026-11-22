# AGENTS.md — raiz do monorepo

`recipes-app-2` é um monorepo de duas aplicações, criado como reescrita de um projeto Java/Angular original (hoje removido do repositório — sobrou só a referência no `README.md`):

- **`apps/backend/`** — API REST em **NestJS 12 + TypeScript**, persistência em **Drizzle ORM + PostgreSQL** (Postgres 17). ESM (`"type": "module"`), testes com Vitest (unit + e2e), lint com oxlint, migrations em `drizzle/`.
- **`apps/frontend/`** — SPA em **React 19 + TypeScript + Vite 8**, estado com TanStack Query (servidor) + Zustand (auth), formulários com react-hook-form + Zod, UI própria sobre `@base-ui/react` e Tailwind CSS v4. Lint com oxlint. Sem testes configurados.

**Leia primeiro o AGENTS.md do app que vai tocar** — eles são a fonte detalhada de comandos, convenções de código, rotas e Docker de cada lado:

- [`apps/backend/AGENTS.md`](apps/backend/AGENTS.md) — módulos, mapa de rotas, auth (JWT), env, banco/migrations, uploads, testes, Docker.
- [`apps/frontend/AGENTS.md`](apps/frontend/AGENTS.md) — estrutura `core/` + `features/`, cliente HTTP (`apiFetch`), estado, formulários, tema, rotas, Docker.

## Comandos

**Não há `package.json` nem `pnpm-workspace.yaml` na raiz** — cada app é um projeto pnpm independente (workspace próprio só no backend, cujo `pnpm-workspace.yaml` declara `allowBuilds` — esbuild habilitado, `@scarf/scarf` desabilitado). `packageManager` fixa `pnpm@12.18.0` nos dois (corepack). Todos os comandos de lint/build/teste rodam **dentro de `apps/<app>/`**:

```bash
# Backend (apps/backend/)
pnpm start:dev    # dev server (3000); migrate + seed do admin rodam no boot
pnpm test         # unitários (Vitest), sem banco
pnpm test:e2e     # exige Postgres efêmero na 5433 (v. AGENTS.md do backend)
pnpm db:*         # migrations/Drizzle Studio — passe DATABASE_URL (drizzle.config.ts
                  #   tem fallback root:123@localhost:5432/recipes_app)
pnpm lint && pnpm format

# Frontend (apps/frontend/)
pnpm dev          # dev server (5173)
pnpm build        # tsc -b + vite build (type-check + bundle)
pnpm preview      # serve o build de produção (dist/)
pnpm lint
```

## Stack Docker

O `compose.yaml` **da raiz** é o ponto de entrada único da stack completa — sobe tudo com:

```bash
cp .env.example .env                        # na raiz
docker compose up -d --wait                 # backend + frontend + postgres
docker compose down
```

- Cada serviço é declarado **em um único arquivo**: `apps/backend/compose.yaml` (backend, postgres, postgres-test com profile `test`) e `apps/frontend/compose.yaml` (frontend). A raiz **não redefine nada** — só inclui os dois via `include:` e adiciona os fios de orquestração do frontend (`depends_on: backend (service_healthy)` + rede `recipes_app`). Adicione atributos de serviço no compose do app onde ele é declarado; na raiz, apenas ligações entre serviços.
- **Os compose files são fortemente comentados** — leia-os antes de mexer; os comentários explicam o porquê de cada decisão (hardening, ports, build-args). O `.env.example` da raiz também; os dos apps são minimalistas (o backend nem tem comentários, só variáveis).
- Serviços e portas expostas ao host: frontend **5173** (nginx-unprivileged, porta interna 8080), backend **3000** (Swagger em `/docs`), Postgres dev **5432**, Postgres de teste efêmero **5433** (só com `--profile test`).
- Nome do projeto fixo: `recipes_app_2`. O `name` da raiz prevalece sobre o dos arquivos incluídos — o compose standalone do frontend declara `recipes_app_2_frontend` (backend standalone usa o mesmo da raiz). Não suba o frontend standalone junto com a stack da raiz: ambos querem a porta 5173 do host.
- Todos os serviços têm `no-new-privileges`; os do backend adicionam `read_only: true`, tmpfs em `/tmp` e `init: true` (o frontend roda nginx-unprivileged como usuário comum, uid 101, e dispensa os demais) — **preserve o que existir**. A rede `recipes_app` e os volumes (dados de dev, uploads) são declarados no compose do backend.
- Para e2e do backend: `docker compose --profile test up -d --wait postgres-test` e depois `down`. Nunca rode e2e contra o Postgres de dev (5432) — os testes fazem `TRUNCATE`.

## Variáveis de ambiente

Há **dois níveis** de env, com papéis distintos:

- **`.env` da raiz** → alimenta a interpolação dos composes incluídos quando a stack é subida pela raiz. `DB_USERNAME`, `DB_PASSWORD` e `JWT_SECRET` são obrigatórias (o compose aborta sem elas); as demais têm defaults.
- **`.env` de cada app** (`apps/backend/`, `apps/frontend/`) → vale para o compose individual do app e para o dev local (`pnpm start:dev`, `pnpm dev`); o backend também as valida em `src/config/env.ts`. `DATABASE_URL` só existe no `.env.example` do backend (para `pnpm db:*`).

Armadilhas documentadas nos `.env.example` que valem para todo o monorepo:

- `VITE_API_URL` é build-arg embutido no bundle **em tempo de build** — deve apontar para a URL visível ao **navegador** do host (nunca hostname interno da rede Docker).
- `ALLOWED_ORIGIN` do backend deve casar com a origem do frontend no host (`http://localhost:5173`).
- `JWT_EXPIRATION_MS` tem nome enganoso: o valor é usado como `expiresIn` do jsonwebtoken (número = **segundos**). Não renomeie sem migrar os valores.

## Convenções de projeto

- **Idioma**: documentação do repositório (READMEs, AGENTS.md, comentários de compose/env) é escrita em **português (pt-BR)**; siga o padrão.
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/pt-br/) em pt-BR (veja o histórico: `build(docker): …`, `refactor: …`, `chore: …`).
- **Sincronização entre apps**: as regras de validação de email/senha são espelhadas no backend (`apps/backend/src/common/validators/`) e no frontend (`apps/frontend/src/core/validation/`). Mudou uma, mude a outra.
- **Lint/format**: os dois apps usam oxlint; `pnpm format` (Prettier) existe **só no backend**. O frontend não tem testes configurados.
- **Git**: branch principal é `trunk`. Cada app tem seu `pnpm-lock.yaml` e `.gitignore` próprios; `.env.*` é ignorado exceto `.env.example`.
- **README da raiz**: descreve as funcionalidades, as credenciais do seed admin (`admin@email.com` / `123`) e o setup — mantenha-o em sync ao mudar setup; `docs/` é reservado e ainda vazio.
- **Schema de paridade (backend)**: as tabelas `categories`/`recipes_categories` existem só por paridade com o schema Java original — não use como referência (detalhe no AGENTS.md do backend).
