# Planejamento semanal (`/planner`) — PROPOSTA

> **Status:** tela proposta, ainda não implementada. Exige nova entidade e
> endpoints no backend.

**Arquivos sugeridos:** `frontend/src/pages/PlannerPage.tsx` ·
**CSS:** `PlannerPage.css`

Agenda de refeições da semana: o usuário atribui as próprias receitas aos dias
e o app monta a lista de compras a partir do plano. É o elo entre as três
telas individuais — receitas, [modo-cozinha.md](modo-cozinha.md) e
[lista-de-compras.md](lista-de-compras.md) — transformando o app de caderno de
receitas em ferramenta de rotina.

## Pré-condições

- **Não autenticado:** redirecionar para `/login` (guard).

## Estrutura

- Título: **"Planejamento da semana"** + navegação entre semanas
  (← semana anterior · "Semana de 01/09" · semana seguinte →).
- **Grade 7 dias × refeições** (Almoço · Jantar; o café da manhã pode vir
  depois): cada célula é um **slot vazio** ("+ Adicionar receita") ou um mini
  card da receita (imagem, título, tempo).
- **Seletor de receitas:** modal com a lista de `GET /recipes` (busca por
  título), para escolher a receita do slot.
- Rodapé: **"🛒 Gerar lista de compras da semana"** — consolida os
  ingredientes de todas as receitas planejadas no
  [store da lista de compras](lista-de-compras.md).

## Comportamento

- Dados via `GET /meal-plans?week=YYYY-WXX` (chave `['planner', semana]`).
- **Atribuir/remover/trocar receita** no slot via mutation (`POST`/`DELETE`
  /`PUT`), com atualização otimista — a grade é manipulada com frequência,
  refetch completo por clique fica lento.
- Drag-and-drop entre células é um refinamento posterior; começar com
  "+ adicionar" clicável.
- Slot pode repetir a mesma receita (sobras! "Lasanha ×2 na semana").

## Pontos de entrada

- Link "Planejar" no header autenticado.

## Dependências no backend

- Nova tabela `meal_plans` (user_id, date, meal, recipe_id) com migração
  Drizzle.
- **`GET /meal-plans`** (por semana), **`POST /meal-plans`**,
  **`PUT /meal-plans/:id`**, **`DELETE /meal-plans/:id`** — nenhum existe.
- A geração da lista de compras em si é frontend puro (reusa os ingredientes
  já carregados).