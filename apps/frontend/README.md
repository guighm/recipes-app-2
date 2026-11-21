# recipes-app-2 — Frontend

SPA em React 19 + TypeScript + Vite para gerenciamento de receitas. Frontend do monorepo `recipes-app-2` — o backend (NestJS + Postgres) fica em [`../backend`](../backend).

## Stack

| Camada | Ferramenta |
|---|---|
| UI | React 19 + TypeScript (~6.0) |
| Build | Vite 8 |
| Estilo | Tailwind CSS v4 (tema "@theme" em `src/app/globals.css`) |
| Roteamento | React Router v8 (`createBrowserRouter`) |
| Dados servidor | TanStack Query v5 |
| Estado (auth) | Zustand v5 |
| Formulários | react-hook-form + zod v4 (`@hookform/resolvers`) |
| Componentes primitivos | `@base-ui/react` (wrappers em `core/components/ui/`) |
| Linter | oxlint (não há ESLint/Prettier) |
| Pacotes | pnpm (fixado via `packageManager`, 12.18) |

## Comandos

```bash
pnpm install    # instalar dependências
pnpm dev        # dev server em http://localhost:5173
pnpm build      # type-check (tsc -b) + build de produção → dist/
pnpm preview    # servir o build de produção
pnpm lint       # oxlint
```

Não há testes configurados. A porta **5173** do dev server é a origem esperada no `ALLOWED_ORIGIN` do backend — não troque sem ajustar o backend.

## Configuração

Copie `.env.example` → `.env`:

```bash
VITE_API_URL=http://localhost:3000
```

> ⚠️ `VITE_API_URL` é embutido no bundle **em tempo de build**. Alterações em runtime não têm efeito; no Docker é passado como `--build-arg`. Deve apontar para a URL visível ao **navegador**, não para um hostname interno da rede Docker.

## Estrutura

```
src/
├── app/            # entrada (main.tsx, providers) + globals.css (tema)
├── core/           # código transversal às features
│   ├── components/         # layout (Header, Footer…) + components/ui/ (design system)
│   ├── config/api/         # cliente HTTP (apiFetch, ApiError, getToken, resolveAssetUrl)
│   ├── layouts/            # MainLayout
│   ├── pages/              # NotFoundPage
│   ├── router/             # routes.tsx (createBrowserRouter)
│   └── validation/         # regras de email/senha compartilhadas
└── features/       # código por domínio (components/, pages/, types/, stores/)
    ├── account/            # conta (AccountPage)
    ├── auth/               # login, registro, useAuthStore (Zustand), PrivateRoute
    └── recipes/            # home, detalhe e criação de receitas
```

- Alias de import: `@/*` → `src/*` (imports internos de feature usam caminho relativo).
- Features novas seguem o padrão `features/<nome>/{components,pages,types,stores}`.
- Componentes de UI primitivos (Button, Input, Dialog, Select, Toaster…) ficam em `core/components/ui/` — prefira reusá-los a criar elementos brutos.

## API e autenticação

- Todo acesso ao backend passa por `apiFetch` (`src/core/config/api/api.ts`): injeta `Authorization: Bearer` do localStorage (`TOKEN_KEY = 'jwt'`), serializa JSON e decodifica erros no formato do NestJS (`body.message` string ou array), lançando `ApiError` com `status`. **Não usar `fetch` direto.**
- Assets/imagens vindos da API passam por `resolveAssetUrl`.
- Estado de auth: `useAuthStore` (`features/auth/stores/auth.ts`); em 401 em `/auth/me` o store faz logout automático.
- Rotas protegidas envolvem as páginas com `<PrivateRoute>` (`features/auth`).
- Constantes de validação em `core/validation/` espelham as regras do backend — mantenha sincronizadas.

## Docker

```bash
docker compose up --build          # só o frontend (5173 → nginx na 8080)
```

Para subir a **stack completa** (frontend + backend + Postgres), use `apps/backend/docker-compose.yaml`, que builda este mesmo Dockerfile.

- Multi-stage: build com `node:24-alpine` + pnpm (corepack, `pnpm fetch` para cache), servido por `nginxinc/nginx-unprivileged:1.28-alpine` na porta **8080**, com healthcheck.
- A imagem já roda como usuário comum (uid 101) e `no-new-privileges` está habilitado — **preserve esse hardening** ao alterar o `Dockerfile` ou o `compose.yaml`.

## Documentação de apoio

- **[AGENTS.md](AGENTS.md)** — instruções detalhadas de arquitetura e convenções para agentes de IA e novos contribuidores.
- Backend e API: [`../backend`](../backend).
