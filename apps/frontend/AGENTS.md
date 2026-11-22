# AGENTS.md — apps/frontend

SPA em React 19 + TypeScript + Vite, frontend do monorepo `recipes-app-2` (o backend NestJS fica em `../backend`). Gerenciador de pacotes: **pnpm**, fixado via campo `packageManager` (corepack).

## Comandos

```bash
pnpm dev        # dev server na porta 5173
pnpm build      # tsc -b (type-check) + vite build → dist/
pnpm lint       # oxlint (não há ESLint/Prettier neste projeto)
pnpm preview    # serve o build de produção
```

Não há testes configurados. Porta em 5173 (`vite.config.ts`), mas **sem `strictPort`**: se a 5173 estiver ocupada, o Vite sobe em outra (ex. 5174) e o CORS do backend quebra silenciosamente — não troque a porta sem ajustar o `ALLOWED_ORIGIN` do backend.

## Estrutura

```
src/
├── app/            # entrada (main.tsx, providers) + globals.css (tema)
├── core/           # código transversal às features
│   ├── components/         # componentes de layout (Header, Footer…) + components/ui/ (design system)
│   ├── config/api/         # cliente HTTP (apiFetch, ApiError, getToken, resolveAssetUrl) + errorMessages (mensagens 401/403 usadas pelos forms)
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

- Todo acesso ao backend passa por `apiFetch` (`src/core/config/api/api.ts`). Ele injeta `Authorization: Bearer` do localStorage (`TOKEN_KEY = 'jwt'`), serializa JSON, decodifica erros (`body.message` string **ou array** no formato NestJS) e lança `ApiError` com `status`. Não use `fetch` direto — inclusive multipart: quando o body é `FormData`, o `apiFetch` pula o `Content-Type` (deixa o browser montar o boundary), então uploads (ex.: avatar) também passam por ele. `204`/resposta sem corpo devolve `undefined`.
- `VITE_API_URL` (ver `.env.example`) é embutido no bundle **em tempo de build** — mudar `.env` em runtime não tem efeito; em Docker é `--build-arg`. Deve apontar para a URL visível ao navegador (não hostname interno de rede Docker). Em código há fallback `?? 'http://localhost:3000'` — o `.env` continua sendo a fonte de verdade.
- URLs de assets/imagens vindas da API passam por `resolveAssetUrl`; mensagens de erro 401/403 dos forms vêm de `errorMessages` (`core/config/api/`).
- Estado de autenticação: `useAuthStore` (Zustand) em `features/auth/stores/auth.ts`. O logout automático em 401 de `/auth/me` acontece dentro de `fetchCurrentUser` (no store) — chamado on-mount pelo `MainLayout` —, ou seja, ocorre na carga de qualquer página quando o token expirou.

## Estado e formulários

- **Servidor**: TanStack Query (`useQuery`/`useMutation`) — `QueryClient` é criado em `app/main.tsx`.
- **Auth**: Zustand.
- **Formulários**: react-hook-form + `@hookform/resolvers/zod`, com `mode: 'onTouched'` e botão de submit desabilitado enquanto `!isValid || isSubmitting` (ver `LoginForm.tsx` como referência). Erros de API exibidos via componente `ErrorMessage`. Variações existentes: `ProfileForm` também exige `!isDirty` (`disabled={!isValid || !isDirty || isSubmitting}`) e os dialogs de ingredient/step na `RecipeDetailPage` usam o `isPending` da mutation em vez de `isSubmitting`.
- Constantes de validação (limites/patterns de email e senha em `core/validation/`) espelham as regras do backend — mantenha sincronizadas se mudar algo.

## Estilo

Tailwind CSS v4 com tema definido via `@theme` em `src/app/globals.css` ("tile notebook"), com **tema claro e escuro derivados do mesmo token**: cada cor é declarada uma única vez com CSS nativo `light-dark()`, e o modo é escolhido pelo `color-scheme` — segue a preferência do sistema por padrão, com classes `.dark`/`.light` no `<html>` para forçar. Use os tokens existentes — cores (`porcelain`, `surface` (fundo de cards) vs `white` (literal, para texto/traço sobre pigmentos sólidos), `cobalt` (sólidos: botão, tracks) vs `lapis` (texto/contorno de destaque), `cobalt-ink` (pigmento estático: Tooltip, hover primário) vs `ink-strong` (texto de ênfase), `cobalt-mist`, `scrim` (overlays), `ink`/`ink-soft`/`ink-faint`, `butter`, `error`/`error-mist`, `border`), fontes (`font-display`, `font-body`, `font-mono`), sombras (`shadow-card`, `shadow-card-lifted`) e animação (`--animate-rise`) — não hex/valores hardcoded. Fontes vêm de **Google Fonts via `@import` no próprio `globals.css`** (Fraunces, Plus Jakarta Sans, IBM Plex Mono) — dependência de rede em runtime. Há também três `@utility` custom: `page` (esqueleto de layout das páginas), `label` (mono, uppercase, letter-spaced) e `frieze` — use-as em vez de recriar os estilos. Em `@layer base`, `prefers-reduced-motion` desliga animações globalmente e headings usam `text-wrap: balance`. **Form controls não têm estilo no `@layer base`** — o padrão de input vive no `controlClasses` de `Input.tsx` (e Checkbox/Switch/Select têm classes próprias); use o `<Input>` de `core/components/ui/` em vez de `<input>` cru.

## Rotas

`src/core/router/routes.tsx` usa `createBrowserRouter` (react-router v8), tudo dentro de `MainLayout`. Rotas protegidas envolvem a página com `<PrivateRoute>` de `features/auth`. 404 via rota `*`.

Exceção: `/recipe/:id` **não** usa `<PrivateRoute>` — a página se auto-protege dentro dela (`RecipeDetailPage`): usuário deslogado vê "Sign in to view the recipe" em vez do redirect padrão. `PrivateRoute` guarda o destino em `state.from` e o `LoginForm` restaura; registro redireciona para `/login` sem auto-login.

## Docker

- `Dockerfile`: multi-stage — build com node:24-alpine + pnpm (via corepack, `pnpm fetch` para cache de camadas), servido por `nginxinc/nginx-unprivileged:1.28-alpine` na porta **8080**, com healthcheck.
- `compose.yaml` sobe só o frontend na 5173→8080 e é a **única** declaração do serviço (build-arg `VITE_API_URL`, porta, hardening). Em dev standalone ele sobe sozinho; para subir a stack completa (backend + Postgres juntos), use o `compose.yaml` da raiz do monorepo, que inclui os composes de backend e frontend via `include:` e adiciona só os fios de orquestração (`depends_on backend` + rede `recipes_app`).
- A imagem já roda como usuário comum (uid 101); `no-new-privileges` está habilitado — preserve esse hardening.
