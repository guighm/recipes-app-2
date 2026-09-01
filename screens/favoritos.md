# Favoritos (`/favorites`) — PROPOSTA

> **Status:** tela proposta, ainda não implementada. Exige nova entidade e
> endpoints no backend.

**Arquivos sugeridos:** `frontend/src/pages/FavoritesPage.tsx` ·
**CSS:** `FavoritesPage.css`

Lista as receitas que o usuário marcou como favoritas. Hoje a Home lista todas
as receitas do usuário em ordem de criação, sem forma de destacar as queridas
ou de separar "cozinhar hoje" de "acervo".

## Pré-condições

- **Não autenticado:** redirecionar para `/login` (guard).

## Estrutura

- Título: **"Receitas favoritas"**.
- Grade de **cards** (em vez da tabela da Home): imagem, título, tempo de
  preparação e dificuldade — favoritos pedem visual mais convidativo que
  linhas de tabela; no mobile os cards já resolvem a responsividade.
- **Estado de lista vazia:** "Você ainda não tem favoritos — marque uma
  receita com ⭐ na Home" (ver melhoria correspondente em
  [home.md](home.md)).

## Comportamento

- Dados via `GET /favorites` (TanStack Query, chave `['favorites']`),
  retornando as `RecipeDTO`s completas para os cards.
- **Remover dos favoritos:** ⭐ clicável no card (toggle), com atualização
  otimista do cache; a query da Home também precisa refletir a marcação
  (estender `RecipeDTO` com `isFavorite` ou invalidar `['recipes']`).
- Clique no card → `/recipe/{id}`.

## Pontos de entrada

- ⭐/☆ na coluna **Ações** da Home e na página de detalhe
  (componente `Action` já suporta o visual de emoji com tooltip).
- Link "Favoritos" no header autenticado.

## Dependências no backend

- Nova tabela `favorites` (user_id, recipe_id, unique conjunta) com migração
  Drizzle.
- **`GET /favorites`**, **`POST /favorites`** (ou `POST /recipes/:id/favorite`)
  e **`DELETE /favorites/:recipeId`** — nenhum existe.
- Favoritar deve ser restrito às próprias receitas **ou** abrir caminho para
  o feed público (ver [explorar.md](explorar.md)) — favoritar de terceiros só
  faz sentido se houver descoberta de conteúdo.