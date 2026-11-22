# AGENTS.md — apps/backend

API REST em NestJS 12 + TypeScript, backend do monorepo `recipes-app-2` (irmão do frontend: `../frontend`). Stack: **Nest + Drizzle ORM + PostgreSQL**, com Drizzle em todas as queries (não há TypeORM/Prisma). Gerenciador de pacotes: **pnpm**, fixado via campo `packageManager` (corepack). O projeto é ESM (`"type": "module"`, tsconfig `nodenext`).

## Comandos

```bash
pnpm start:dev   # dev server com watch (porta: env PORT, default 3000)
pnpm build       # nest build → dist/
pnpm lint        # oxlint em src/ e test/ (não há ESLint)
pnpm format      # prettier --write (singleQuote, trailingComma: all)
pnpm test        # testes unitários (Vitest) — não precisam de Postgres
pnpm test:e2e    # e2e — exige o Postgres efêmero de teste (v. abaixo)
pnpm db:generate # gera migrations de src/database/schema.ts → drizzle/
pnpm db:migrate  # aplica migrations pendentes
pnpm db:studio   # Drizzle Studio
```

- Os scripts `db:*` usam `drizzle.config.ts`, que lê `DATABASE_URL` (via `dotenv`, com fallback `postgres://root:123@localhost:5432/recipes_app`). Exporte um `DATABASE_URL` apontando para o banco certo antes de rodar.
- O e2e (`vitest.config.e2e.ts`) aponta `DATABASE_URL` para a porta **5433** (`db-test` do compose, banco `recipes_app_test`, usuário `root`). Antes de rodar: `docker compose up -d --wait db-test`. Nunca rode e2e contra o Postgres de dev (5432) — os testes fazem `TRUNCATE`.
- Formatação: Prettier (`singleQuote` + `trailingComma: "all"`); lint via oxlint (`oxlint.json`) em `src/` e `test/` — `@typescript-eslint/no-explicit-any` está off e `no-floating-promises` em warn.

## Estrutura

```
src/
├── common/         # transversal: guards/, decorators/, validators/, dto/, request-with-user.ts
├── config/         # env.ts (validação de variáveis via class-validator)
├── database/       # schema.ts (Drizzle), DatabaseModule (migrate+seed no boot), DRIZZLE provider
├── app.controller.ts  # GET /health (público)
└── <domínio>/      # módulos por feature: auth, users, recipes, ingredients, steps, friends
    └── *.module.ts / *.controller.ts / *.service.ts + dto/
```

Novos domínios seguem o padrão `<nome>/{<nome>.module.ts,<nome>.controller.ts,<nome>.service.ts,dto/}` e são registrados em `app.module.ts`. Exceção atual: `friends/` é um módulo próprio, mas suas rotas ficam sob `/users/me/friends`.

## Mapa de rotas

- `GET /health` — público (AppController); alvo do HEALTHCHECK do Docker e do `depends_on: service_healthy` do compose. Ao adicionar rota pública nova, confirme se ela não deve passar pelo guard.
- `/auth`: `POST /login` (público, `@HttpCode(200)`, responde `{ id, accessToken }`) e `GET /me` (**protegido**, sem `@Public`; devolve `{ id, name, email, avatarUrl, createdAt }` e dá 404 se o usuário do token não existe mais).
- `/users`: `POST /register` (público, `201` com header `Location: /users/:id`; o DTO exige também `avatarUrl` não-vazio), `PATCH /me` (só `name`/`email`; sem mudanças efetivas devolve o registro atual sem UPDATE; e-mail duplicado → 409), `PATCH /me/password`, `POST /me/avatar` (multipart) e `DELETE /me`.
- `/users/me/friends`: `GET`, `POST` (400 se `friendId === userId`) e `DELETE /:friendId` — controlado pelo módulo `friends`.
- `/recipes`: `GET`, `GET /:id`, `POST`, `DELETE /:id` (403 se não é do usuário logado), `GET /:id/ingredients`, `GET /:id/steps`. `difficulty` é string livre (sem enum no banco, máx. 255) e `imageUrl` é obrigatório no POST.
- `/ingredients` e `/steps`: apenas `POST` (criação avulsa); leitura é pelas rotas aninhadas em `/recipes`. **Verificam só a existência da recipe, não ownership** — qualquer usuário autenticado anexa a qualquer receita.
- Todo `POST` que retorna `201` (users/recipes/ingredients/steps) seta header `Location` para o recurso criado.

## Convenções do código

- **Imports**: como o projeto é ESM/`nodenext`, imports relativos **sempre com extensão `.js`** (ex.: `../database/schema.js`) mesmo em arquivos `.ts`. Prefira `import type` para tipos (o código atual usa type-only imports extensivamente).
- **Banco de dados**: toda service injeta `@Inject(DRIZZLE) db: Database` (símbolo `DRIZZLE` de `database.provider.ts`, módulo global). Erros de domínio viram exceções Nest (`NotFoundException`, `ConflictException`, `ForbiddenException`, `UnauthorizedException`, `BadRequestException`) lançadas na service — não há try/catch de infra no controller. Operações com múltiplas escritas usam `db.transaction` (ex.: troca de senha, amizade bidirecional).
- **Controllers finos**: só roteamento, decorators Swagger e montagem da resposta. `201` responde com header `Location` (via `@Res({ passthrough: true })`, ver `UsersController.register`). `204` via `@HttpCode(204)`. O usuário autenticado chega via `@CurrentUser()` ou `req.user` (ver `RecipesController`).
- **DTOs**: `class-validator` + `class-transformer`. O `ValidationPipe` global usa `whitelist: true, transform: true` (definido em `main.ts`) — campos extras são descartados silenciosamente e não precisa validar isso por rota.
- **Env**: toda variável nova precisa de `@IsString()` em `Environment` (`src/config/env.ts`) e entrada em `.env.example` e `compose.yaml`. `ConfigModule` carrega `.env` local; `validateEnv` aplica defaults para PORT/ALLOWED_ORIGIN/JWT_EXPIRATION_MS/JWT_ISSUER/DATABASE_URL (fallback de DB_USERNAME (`root`)/DB_PASSWORD (`123`)) e o que não estiver em `process.env` é reatribuído a ele — por isso `main.ts` lê o PORT default (`3000`) via `process.env`. `validateSync` usa `skipMissingProperties: true`, então DB_USERNAME/DB_PASSWORD ausentes não derrubam o boot local — mas são obrigatórios no compose via `${DB_USERNAME:?…}` (assim como `JWT_SECRET`). No drizzle, `drizzle.config.ts` usa `dotenv/config` com fallback direto `postgres://root:123@localhost:5432/recipes_app`.
- **Swagger**: todo endpoint público/documentado usa `@ApiTags`, `@ApiOperation`, `@ApiResponse` (erros com `ErrorResponseDto` de `common/dto/`). A UI fica em `http://localhost:3000/docs`.

## Autenticação

- `JwtAuthGuard` é **global** (registrado via `APP_GUARD` em `app.module.ts`). Tudo requer JWT por padrão; rotas públicas recebem `@Public()` (`common/decorators/public.decorator.ts`).
- Token: HS256 com claim `{ sub: email, id }` + issuer `JWT_ISSUER` (verificado no guard; header deve ser `Bearer <token>`). Assinatura/config do `JwtModule` ficam em `AuthModule` (global), com `JWT_SECRET` e `JWT_EXPIRATION_MS` — apesar do nome, o valor é usado como `expiresIn` do jsonwebtoken, que interpreta número como **segundos** (72000000 ≈ 2,3 anos; não renomeie sem migrar os valores de env). O helper `login()` de e2e devolve `accessToken`.
- `@CurrentUser()` (`common/decorators/current-user.decorator.ts`) injeta `AuthUser = { id, email }` montado pelo guard (`request-with-user.ts`).
- Senhas: `bcryptjs` (`compare`/`hash`, 10 rounds). Validações de email/senha em `common/validators/` — senha: mínimo 8, máximo 72 (limite de bytes que o bcrypt hasheia) e padrão exigindo maiúscula, minúscula, dígito e caractere especial. São espelhadas no frontend (`../frontend/src/core/validation/`); mantenha os dois lados sincronizados.
- Troca de senha (`PATCH /users/me/password`): exige `currentPassword` correto (401 se errado) e rejeita senha igual à atual ou a qualquer entrada do `password_history` (409) — a senha antiga é gravada no histórico na mesma transação da troca.

## Banco de dados

- Schema único em `src/database/schema.ts` (tabelas `users`, `recipes`, `ingredients`, `steps`, `password_history`, `friendships`). Migrations ficam em `drizzle/` (geradas por `pnpm db:generate`) — **nunca edite SQL de migration ou snapshots à mão**.
- FKs com `onDelete: 'cascade'`: apagar um `user` apaga recipes/ingredients/steps/password_history/friendships dele; apagar uma recipe apaga seus ingredients/steps.
- `friendships` é **bidirecional**: cada amizade grava duas linhas (`(A,B)` e `(B,A)`) numa mesma transação — considere isso em queries e testes.
- `DatabaseModule.onApplicationBootstrap` roda `migrate()` + seed a cada boot (migrations de `drizzle/` relativo ao cwd). O seed (SeedService) cria o admin `admin@email.com` / `123` (hash bcrypt 10) com `avatarUrl: 'admin'`, idempotente via `onConflictDoNothing({ target: users.email })` — inclusive na imagem Docker e nos testes e2e (o `resetDb` re-seed após o TRUNCATE).
- As tabelas `categories` e `recipes_categories` existem só por paridade com o schema do projeto Java original; não use como referência.

## Uploads

- Avatar: `FileInterceptor('file')` com `memoryStorage`, limite de 5MB (413 acima) e `ParseFilePipeBuilder.addFileTypeValidator` com `overrideMimeType: true` (jpeg/png/webp/gif → fora disso 400) em `POST /users/me/avatar`.
- O arquivo é gravado em `uploads/avatars/<uuid>.<ext>` (a partir de `process.cwd()/uploads`) e `avatarUrl` vira `/uploads/avatars/<arquivo>`. A extensão vem de um mapa mimeType→ext na `UsersService`, que revalida o mimetype (dupla checagem após o pipe do controller; `BadRequestException` se fora da lista). O avatar anterior é **apagado do disco** ao ser substituído e ao deletar a conta — erro de `unlink` é engolido silenciosamente, e URLs fora do prefixo `/uploads/avatars/` (ex.: seed) não são apagadas.
- Arquivos são servidos em `/uploads` a partir de `process.cwd()/uploads` (`main.ts`, com `nosniff`). No Docker, `/app/uploads` é volume (a aplicação roda read-only — fora desse volume e de `/tmp` nada é escrevível).
- `recipes.imageUrl` existe no schema mas ainda não há endpoint de upload de imagem de receita.

## Testes

- **Unitários** (`*.spec.ts` ao lado do código: `app.controller.spec.ts`, `users.service.spec.ts`, `auth.service.spec.ts`, `recipes.service.spec.ts`, `jwt-auth.guard.spec.ts`; config `vitest.config.ts`, com plugin `vite-tsconfig-paths`): services são instanciadas direto com o banco simulado (objeto stub com `select`/`insert`/`delete` encadeados, ver `recipes.service.spec.ts`) — sem `Test.createTestingModule`, sem Postgres. Globals do Vitest (`describe`/`it`/`vi`) disponíveis sem import.
- **E2E** (`test/*.e2e-spec.ts`: app, auth, recipes; config `vitest.config.e2e.ts`): usam `createTestApp`, `resetDb` e `login` de `test/utils/setup-app.ts`. `createTestApp` sobe o `AppModule` real (com migrations/seed) e reaplica o `ValidationPipe` global. O `resetDb` no `beforeEach` é obrigatório para isolar estados (TRUNCATE de `steps, ingredients, recipes, users` com `RESTART IDENTITY CASCADE` — o CASCADE alcança `password_history` e `friendships` via FK). `fileParallelism: false` — os arquivos compartilham o mesmo banco e rodam sequencialmente por causa do TRUNCATE.

## Docker

- `Dockerfile`: multi-stage `node:24-alpine` + corepack/pnpm (installs cacheados via `--mount=type=cache` no store do pnpm; copia também `pnpm-workspace.yaml`, que configura approve-builds); imagem copia `dist/` + `drizzle/` (migrations rodam no boot), `pnpm install --prod` com `--ignore-scripts` (nada de postinstall roda na imagem de produção), cria `/app/uploads` com dono `node`, roda como usuário `node`, `CMD node dist/main.js`, `HEALTHCHECK` em `/health` (wget, com `start-period` cobrindo migrate+seed, que rodam antes do listen) e `NODE_OPTIONS=--enable-source-maps`.
- `compose.yaml` **deste diretório** é o ponto de entrada da stack completa (app:3000 + frontend nginx-unprivileged em 8080 mapeado para o host 5173 + db:5432 + db-test:5433 efêmero, ambos `postgres:17`) — o compose do frontend sobe só o frontend. O nome do projeto é fixo (`recipes_app_2`) e todos os serviços usam a rede `recipes_app` com `restart: unless-stopped`.
- Hardening existente e a preservar: `no-new-privileges`, `read_only: true` com tmpfs `/tmp`, `init: true`, `depends_on` com `condition: service_healthy`, uploads em volume named. `VITE_API_URL` é build-arg apontando para a URL visível ao navegador do host (não hostname interno Docker).

## CORS

`main.ts` configura CORS a partir de `ALLOWED_ORIGIN` (default `http://localhost:5173`), com `credentials: true` e métodos `GET/POST/PUT/DELETE`. Um host novo consumindo a API (ou porta do frontend alterada) precisa dessa variável atualizada — em dev local o default já cobre o Vite.
