# Modo cozinha (`/recipe/:id/cook`) — PROPOSTA

> **Status:** tela proposta, ainda não implementada. **Depende apenas do que
> já existe**: usa `GET /recipes/:id` e `GET /recipes/:id/steps` — nenhum
> trabalho de backend.

**Arquivos sugeridos:** `frontend/src/pages/CookingModePage.tsx` ·
**CSS:** `CookingModePage.css` · componente de apoio `StepCard.tsx`

Tela de preparo passo a passo, pensada para ser usada com as mãos ocupadas e a
tela longe. Hoje o modo de preparo é uma tabela densa junto de ingredientes e
formulários — pouco prático para acompanhar enquanto se cozinha.

## Pré-condições

- Mesmas do [detalhe-receita.md](detalhe-receita.md): id inválido →
  "Receita não encontrada!"; não autenticado → link para `/login`.

## Estrutura

Exibição **imersiva**, um passo por vez, sem scroll:

- **Barra de progresso** no topo: "Passo 2 de 7" + progresso visual; tempo
  total de preparação (`preparationTime`) como referência.
- **Passo atual em texto grande** (fonte escalada, alto contraste) com o
  `stepNumber` e a `description`.
- **Lista de ingredientes fixa** (colapsável): os ingredientes ficam a um
  toque de distância sem sair do passo.
- Botões grandes: **← Anterior** · **Marcar e avançar →** · **Sair**.

## Comportamento

- Passos ordenados por `stepNumber` (ver melhoria em
  [detalhe-receita.md](detalhe-receita.md)) — aqui é requisito, não
  refinamento.
- **Concluído:** tela final "Receita concluída! 🎉" com tempo decorrido e
  botão "Voltar para a receita".
- **Timer opcional:** cronômetro manual (iniciar/pausar) exibido junto ao
  passo — como os passos não têm duração no modelo (`StepDTO`), o timer é
  livre, não por passo.
- **Navegação por teclado:** setas ←/→ avançam e voltam (útil com teclado ou
  controle).
- Nenhum dado novo é enviado à API; nenhum formulário nesta tela.

## Pontos de entrada

- Botão **"Modo cozinha"** 👨‍🍳 na página de detalhe (ao lado de
  "Novo Ingrediente"/"Novo Passo").
- Ícone opcional na coluna **Ações** da Home.

## Por que é um bom próximo passo

É a proposta de menor custo do lote: dois `GET` que já existem, zero migração,
e entrega o "momento de uso" que justifica o aplicativo existir (a tela de
detalhe é para ler; esta é para cozinhar).