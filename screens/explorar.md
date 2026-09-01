# Explorar receitas (`/explore`) — PROPOSTA

> **Status:** tela proposta, ainda não implementada. Exige endpoints públicos
> no backend.

**Arquivos sugeridos:** `frontend/src/pages/ExplorePage.tsx` ·
**CSS:** `ExplorePage.css`

Feed público com receitas de todos os usuários, para descoberta de conteúdo.
Hoje o app é fechado: cada usuário só vê as próprias receitas (`GET /recipes`
filtra pelo token), o que limita o produto a um caderno individual.

## Pré-condições

- Tela **pública** (não exige login) — é o que a diferencia da Home; visitantes
  podem navegar e o CTA "Entre para criar a sua" aparece no estado vazio da
  sessão.

## Estrutura

- Título: **"Explorar receitas"**.
- **Barra de busca** por título + **filtros** por dificuldade (depende da
  dificuldade padronizada, ver [criar-receita.md](criar-receita.md)) e tempo
  de preparação; ordenação (mais recentes, mais rápidas de preparar).
- Grade de **cards** com imagem, título, autor (nome/avatar — depende dos
  dados do usuário, ver [perfil.md](perfil.md)), tempo, porções e dificuldade.
- Paginação ou "carregar mais" — um feed público tende a crescer mais que a
  lista individual (ver [home.md](home.md)).

## Comportamento

- Dados via `GET /recipes/public` (chave `['explore', filtros]`), com os
  filtros enviados como query params para o backend paginar/ordenar.
- Clique no card → `/recipe/{id}`; a página de detalhe precisa de uma variante
  pública (sem os formulários de ingrediente/passo para receita alheia).
- **Card de receita do próprio usuário:** badge "Sua receita" e atalho para
  editar (ver [editar-receita.md](editar-receita.md)).

## Pontos de entrada

- Link "Explorar" no header, sempre visível (o header só mostra "Home"/
  "Fazer Login" hoje, ver [README.md](README.md)).
- Estado vazio da Home autenticada pode sugerir "Explore receitas de outros
  cozinheiros".

## Dependências no backend

- **`GET /recipes/public`** com paginação/filtros — não existe; `GET /recipes`
  atual filtra pelo usuário do token e é autenticado.
- `GET /recipes/:id` público (ou `@Public()` com retorno reduzido) para o
  detalhe de receitas de terceiros.
- Junção com dados do autor (nome/avatar) nos cards.
- Bônus natural: alimenta o caso de uso dos
  [favoritos.md](favoritos.md) (favoritar receitas de outros).