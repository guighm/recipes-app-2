# AGENTS.md — apps/frontend

SPA em React 19 + TypeScript + Vite, frontend do monorepo `recipes-app-2` (o backend NestJS fica em `../backend`). Gerenciador de pacotes: **pnpm**, fixado via campo `packageManager` (corepack).

## Comandos

```bash
pnpm dev        # dev server na porta 5173
pnpm build      # tsc -b (type-check) + vite build → dist/
pnpm lint       # oxlint (não há ESLint/Prettier neste projeto)
pnpm preview    # serve o build de produção
```

Não há testes configurados. Porta fixa em 5173 (`vite.config.ts`): é a origem esperada no `ALLOWED_ORIGIN` do backend — não troque sem ajustar o backend.

## Estrutura

```
src/
├── app/            # entrada (main.tsx, providers) + globals.css (tema)
├── core/           # código transversal às features
│   ├── components/         # componentes de layout (Header, Footer…) + components/ui/ (design system)
│   ├── config/api/         # cliente HTTP (apiFetch, ApiError, getToken, resolveAssetUrl)
│   ├── layouts/            # MainLayout
│   ├── pages/              # NotFoundPage
│   ├── router/             # routes.tsx (createBrowserRouter) + index
│   └── validation/         # regras de email/senha compartilhadas (constantes + patterns)
└── features/       # código por domínio: account, auth, recipes
    └── <feature>/          # components/, pages/, types/, stores/
```

- Alias de import: `@/*` → `src/*` (vite.config.ts + tsconfig.app.json; imports internos de feature usam caminho relativo).
- Novas features seguem o padrão `features/<nome>/{components,pages,types,stores}`.
- Componentes de UI primitivos (Button, Field, Input, Dialog, Select, Toaster, etc.) ficam em `core/components/ui/` e são wrappers sobre `@base-ui/react`. Prefira reusá-los a criar elementos brutos.

## API e autenticação

- Todo acesso ao backend passa por `apiFetch` (`src/core/config/api/api.ts`). Ele injeta `Authorization: Bearer` do localStorage (`TOKEN_KEY = 'jwt'`), serializa JSON, decodifica erros (`body.message` string **ou array** no formato NestJS) e lança `ApiError` com `status`. Não use `fetch` direto.
- `VITE_API_URL` (ver `.env.example`) é embutido no bundle **em tempo de build** — mudar `.env` em runtime não tem efeito; em Docker é `--build-arg`. Deve apontar para a URL visível ao navegador (não hostname interno de rede Docker).
- URLs de assets/imagens vindas da API passam por `resolveAssetUrl`.
- Estado de autenticação: `useAuthStore` (Zustand) em `features/auth/stores/auth.ts`. Em 401 em `/auth/me`, o store faz logout automático.

## Estado e formulários

- **Servidor**: TanStack Query (`useQuery`/`useMutation`) — `QueryClient` é criado em `app/main.tsx`.
- **Auth**: Zustand.
- **Formulários**: react-hook-form + `@hookform/resolvers/zod`, com `mode: 'onTouched'` e botão de submit desabilitado enquanto `!isValid || isSubmitting` (ver `LoginForm.tsx` como referência). Erros de API exibidos via componente `ErrorMessage`.
- Constantes de validação (limites/patterns de email e senha em `core/validation/`) espelham as regras do backend — mantenha sincronizadas se mudar algo.

## Estilo

Tailwind CSS v4 com tema definido via `@theme` em `src/app/globals.css` ("tile notebook"). Use os tokens existentes (`porcelain`, `cobalt`, `ink`, `butter`, `error`, `border`, `shadow-card`, `font-display`…), não hex/valores hardcoded. Fontes e animações (`--animate-rise`) também vêm do `@theme`.

## Rotas

`src/core/router/routes.tsx` usa `createBrowserRouter` (react-router v8), tudo dentro de `MainLayout`. Rotas protegidas envolvem a página com `<PrivateRoute>` de `features/auth`. 404 via rota `*`.

## Docker

- `Dockerfile`: multi-stage — build com node:24-alpine + pnpm (via corepack, `pnpm fetch` para cache de camadas), servido por `nginxinc/nginx-unprivileged:1.28-alpine` na porta **8080**, com healthcheck.
- `compose.yaml` sobe só o frontend na 5173→8080; para subir a stack completa (backend + Postgres juntos), use `apps/backend/docker-compose.yaml`, que também builda este Dockerfile.
- A imagem já roda como usuário comum (uid 101); `no-new-privileges` está habilitado — preserve esse hardening.
