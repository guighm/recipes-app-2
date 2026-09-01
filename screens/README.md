# Telas do Aplicativo de Receitas

Documentação das páginas do frontend (`frontend/src/pages/`), construído em
React 19 + Vite, com roteamento via `react-router` (v8), estado de autenticação
via Zustand (`stores/auth.ts`), dados via TanStack Query v5 (`lib/api.ts`) e
formulários com react-hook-form + validação Zod.

## Rotas (`App.tsx`)

| Rota           | Página               | Arquivo                        | Documentação             |
| -------------- | -------------------- | ------------------------------ | ------------------------ |
| `/`            | Home                 | `pages/HomePage.tsx`            | [home.md](home.md)       |
| `/login`       | Login                | `pages/LoginPage.tsx`          | [login.md](login.md)     |
| `/register`    | Cadastro de usuário  | `pages/RegisterPage.tsx`       | [register.md](register.md) |
| `/recipe/new`  | Criar receita        | `pages/CreateRecipePage.tsx`   | [criar-receita.md](criar-receita.md) |
| `/recipe/:id`  | Detalhe da receita   | `pages/RecipeDetailPage.tsx`   | [detalhe-receita.md](detalhe-receita.md) |
| `*`            | 404                  | `pages/NotFoundPage.tsx`       | [404.md](404.md)         |

## Telas propostas

Telas ainda não implementadas, documentadas para planejamento — cada arquivo
lista os endpoints que o backend precisaria expor (hoje o backend só possui
`POST` de criação; não há nenhum `PUT`/`PATCH`):

| Rota                            | Página               | Documentação                                   | Escopo no backend                        |
| ------------------------------- | -------------------- | ---------------------------------------------- | ---------------------------------------- |
| `/recipe/:id/edit`              | Editar receita       | [editar-receita.md](editar-receita.md)        | `PUT /recipes/:id`                        |
| `/recipe/:id/cook`              | Modo cozinha         | [modo-cozinha.md](modo-cozinha.md)            | **nenhum** — só os `GET`s existentes      |
| `/shopping-list`                | Lista de compras     | [lista-de-compras.md](lista-de-compras.md)    | **nenhum** (versão em `localStorage`)     |
| `/profile`                      | Perfil do usuário    | [perfil.md](perfil.md)                        | `GET`/`PUT`/`DELETE /users/me`            |
| `/favorites`                    | Favoritos             | [favoritos.md](favoritos.md)                  | entidade + endpoints de favoritos         |
| `/explore`                      | Explorar (feed público) | [explorar.md](explorar.md)                  | `GET /recipes/public` (público, com filtros) |
| `/u/:userId`                    | Perfil público do autor | [perfil-publico.md](perfil-publico.md)     | junto com os endpoints do explorar        |
| `/planner`                      | Planejamento semanal | [planejamento.md](planejamento.md)            | entidade `meal_plans` + CRUD              |
| `/forgot-password`, `/reset-password` | Recuperar senha | [recuperar-senha.md](recuperar-senha.md)      | fluxo de token por e-mail                 |
| `/history`                      | Histórico de cozinha | [historico-cozinha.md](historico-cozinha.md) | **nenhum** (local); nuvem: `cooking_log` |
| `/stats`                        | Estatísticas         | [estatisticas.md](estatisticas.md)           | `GET /stats` — depende do histórico em nuvem |
| `/recipe/import`                | Importar receita     | [importar-receita.md](importar-receita.md)   | `POST /recipes/import` (extração)         |
| `/settings`                     | Configurações        | [configuracoes.md](configuracoes.md)         | **nenhum** (preferências locais)           |

Ordem de implementação sugerida: as telas **sem custo de backend** primeiro
(**modo-cozinha**, **lista-de-compras**, **configurações** e o histórico na
versão local — valor imediato, zero migração) → **editar-receita** (um único
endpoint) → **recuperar-senha** (contas hoje são irrecuperáveis sem ela) →
**perfil** → **favoritos**/**explorar**/**perfil-publico** (o trio forma a
descoberta de conteúdo) → **planejamento** → **importar-receita** (scraping,
o mais pesado) → **estatísticas** (depende do histórico em nuvem).

## Layout compartilhado

Todas as páginas são renderizadas dentro de `App.tsx` (`.app`), entre um
`Header` (`.navegacao`) e um `Footer` fixos, com o conteúdo da rota envolvido em
`<main className="main">`.

### Header (`components/Header.tsx`)

Barra de navegação com links estilizados (cada opção é um link com uma
"listra"/sublinhado abaixo do texto, `.navegacao__listra`):

- **Home** — sempre visível (`/`).
- **Fazer Login** (`/login`) — exibido apenas quando o usuário **não** está
  autenticado (ou seja, após o login o header mostra apenas "Home").

### Footer (`components/Footer.tsx`)

- Texto "Desenvolvido por Guilherme Moraes".
- Copyright com o ano corrente (`new Date().getFullYear()`), renderizado como
  `©` + ano em um bloco `.copyright`.

## Componentes compartilhados

| Componente      | Função                                                                                          |
| --------------- | ----------------------------------------------------------------------------------------------- |
| `Asterisco`     | `*` em negrito (`<strong class="asterisco">`), marca campos obrigatórios nos formulários.        |
| `ErrorMessage`  | Exibe `ATENÇÃO: <mensagem>` quando recebe uma mensagem de erro; não renderiza nada se for nula. |
| `Tooltip`       | Link com emoji (`label`) que navega para `link` e mostra `message` no hover (CSS `.tooltip-text`). |
| `Action`        | Botão com emoji (`label`) que dispara `onClick` e mostra `message` no hover. Mesmo visual do `Tooltip`, sem navegação. |

## Camada de dados

- **`lib/api.ts` (`apiFetch`)** — wrapper de `fetch` para a API do backend.
  - URL base: `VITE_API_URL` (fallback `http://localhost:3000`).
  - Anexa `Authorization: Bearer <token>` automaticamente quando existe um
    token salvo, e `Content-Type: application/json` quando há `body`.
  - Respostas de erro viram `ApiError { status, message }`; a mensagem vem do
    corpo JSON da resposta (string ou array de strings concatenado), com
    fallback para `statusText`.
  - Respostas `204`/vazias retornam `undefined`.
- **`stores/auth.ts` (Zustand)** — o token JWT é persistido em `localStorage`
  sob a chave `jwt` (`TOKEN_KEY`). `login(dto)` chama `POST /auth/login`,
  guarda `accessToken` e atualiza o estado; `logout` remove a chave e zera o
  estado. `useIsAuthenticated()` deriva da presença do token (o estado é
  reidratado do `localStorage` na inicialização, então o login sobrevive a
  recarregamentos da página).
- **Modelos (`models/`)** — `RecipeDTO`/`CreateRecipeDTO`, `IngredientDTO`/
  `CreateIngredientDTO`, `StepDTO`/`CreateStepDTO`, `LoginDTO`/`RegisterDTO`/
  `JwtDTO`/`UserDTO` espelham os DTOs do backend.

## Convenções comuns às páginas

- **Autenticação:** o conteúdo protegido só carrega com `useIsAuthenticated()`;
  caso contrário a página exibe um aviso "Faça login…" com link para `/login`.
- **Erros de API:** erros da classe `ApiError` são traduzidos em mensagens
  amigáveis (401 → "Não autorizado. Faça login novamente."; outros → mensagem
  específica da página). Erros de rede → "Falha de conexão com o servidor.".
- **Formulários:** validação Zod com `mode: 'onTouched'` (valida após o primeiro
  toque no campo), botão de envio desabilitado enquanto o formulário é inválido
  ou o envio está em andamento ("Enviando…"), erros de campo exibidos via
  `ErrorMessage` ("ATENÇÃO: …") abaixo de cada input e erros da API em
  `<p className="erro-api">`.
- **Consultas:** listas/detalhes usam `useQuery` do TanStack Query; mutations
  bem-sucedidos invalidam as chaves correspondentes para recarregar os dados
  automaticamente.

## Melhorias sugeridas (globais)

Aplacam a todas as telas:

- **Sessão expirada:** hoje um 401 só exibe "Faça login novamente." na página
  em que ocorreu. Centralizar no `apiFetch`/store: ao receber 401, fazer
  `logout()` automático e redirecionar para `/login` — evita que o usuário
  continue navegando com um token inválido.
- **Feedback de sucesso:** os feedbacks existentes são só de erro
  (`.erro-api`). Um sistema de toasts global (ex.: sonner) cobriria também
  "Receita criada!", "Ingrediente adicionado" etc., hoje silenciosos.
- **`confirm()` nativo → diálogo próprio:** o `confirm()` do browser bloqueia a
  thread e é inconsistente entre navegadores; um modal acessível (foco
  preso, `Escape` para fechar) fica melhor em qualquer tela.
- **Estados de carregamento:** substituir "Carregando…" textual por skeletons
  com o layout da tabela/detalhe, dando noção de forma antes dos dados.
- **Robustez de imagens:** as imagens vêm de URLs livres digitadas pelo
  usuário — adicionar `loading="lazy"` e um fallback `onError` (placeholder
  quando a URL quebra).
- **Responsividade:** a tabela de receitas não colapsa em telas estreitas;
  em mobile, transformar linhas em cards via media query.
- **Header autenticado:** com sessão ativa, o header só mostra "Home" —
  exibir o nome/avatar do usuário (`avatarUrl` já existe no cadastro) e mover
  o **Logout** da Home para o header.
- **Acessibilidade:** marcar os blocos de erro com `aria-live="polite"` para
  leitores de tela e manter o foco nos formulários após erros de campo.
- **Dev experience:** habilitar React Query Devtools em desenvolvimento para
  inspecionar o cache (`['recipes']`, `['recipe', id]` etc.).