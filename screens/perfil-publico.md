# Perfil público do autor (`/u/:userId`) — PROPOSTA

> **Status:** tela proposta, ainda não implementada. É o complemento natural
> do feed público ([explorar.md](explorar.md)) e compartilha os endpoints
> necessários.

**Arquivos sugeridos:** `frontend/src/pages/PublicProfilePage.tsx` ·
**CSS:** `PublicProfilePage.css`

Página pública de um cozinheiro com as receitas dele. Hoje o app não tem
nenhuma noção de autoria visível — `RecipeDTO` carrega `userId`, mas o nome do
autor nunca aparece em tela. Sem esta tela (ou algo equivalente), o
[explorar](explorar.md) vira só um feed anônimo.

## Pré-condições

- Tela **pública** (sem login), como o explorar.
- **ID inválido** (não inteiro ou ≤ 0): "Usuário não encontrado." com link
  para `/explore`.

## Estrutura

- **Cabeçalho do autor:** avatar grande (`avatarUrl`), nome, total de
  receitas publicadas ("12 receitas") e membro desde (`createdAt`).
- **Grade de cards** das receitas públicas do autor: imagem, título, tempo de
  preparação, dificuldade — mesma grade do [explorar.md](explorar.md),
  reusando o componente de card.
- **Autor é o próprio visitante logado:** badge "Este é você" com link para o
  [perfil](perfil.md) privado.

## Comportamento

- Dados via `GET /users/:id/public` (chave `['user', id]`, retornando um
  subconjunto público: nome, avatarUrl, createdAt — **nunca** e-mail) e
  `GET /users/:id/recipes` (chave `['user', id, 'recipes']`), com paginação.
- 404 → "Usuário não encontrado."; erro de rede → "Falha de conexão com o
  servidor." (padrão atual).
- Clique no card → `/recipe/{id}` na variante pública de detalhe
  (sem formulários de ingrediente/passo).

## Pontos de entrada

- Nome/avatar do autor nos cards do explorar.
- Nome do autor na página de detalhe de uma receita de terceiro.

## Dependências no backend

- **`GET /users/:id/public`** e **`GET /users/:id/recipes`** — não existem;
  podem nascer junto com o `GET /recipes/public` do explorar, já que a
  infraestrutura de "conteúdo público" é a mesma.
- Cuidado de privacidade: o subconjunto público deve ser explícito — não
  reutilizar `UserDTO` cru, que expõe e-mail.
- **`GET /recipes`** hoje lista só as receitas do usuário do token; a listagem
  "por autor, pública" é endpoint novo.