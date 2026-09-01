# Lista de compras (`/shopping-list`) — PROPOSTA

> **Status:** tela proposta, ainda não implementada. **Pode ser 100%
> frontend**: persistência em `localStorage` (mesma técnica do token em
> `stores/auth.ts`); sincronização em nuvem é um bônus posterior.

**Arquivos sugeridos:** `frontend/src/pages/ShoppingListPage.tsx` ·
**CSS:** `ShoppingListPage.css` · store `stores/shoppingList.ts` (Zustand +
persist)

Transforma ingredientes de receitas em uma lista de mercado riscável. Hoje o
usuário lê a tabela de ingredientes na tela de detalhe e copia na mão (papel
ou bloco de notas) — a lista de compras é o destino natural desses dados.

## Pré-condições

- Funciona autenticado ou não (o estado é local); ao logar em outro
  dispositivo a lista não segue — limitação documentada (ver "Dependências").

## Estrutura

- Título: **"Lista de compras"**.
- **Origem das receitas:** chips no topo com as receitas cujos ingredientes
  foram adicionados (ex.: "Lasanha ×1", "Bolo de cenoura ×2" — a quantidade
  multiplica os ingredientes), com ✕ para remover a receita e recalcula a
  lista.
- **Itens:** checkbox + nome + quantidade consolidada (ex.: "Farinha — 500g ×
  2"), agrupados quando a mesma receita aparece mais de uma vez; itens
  riscados (`.riscado`) permanecem visíveis até a limpeza.
- **Adicionar item manual:** campo `text` no fim (o óleo que sempre falta).
- Rodapé: **"Limpar itens riscados"** e **"Limpar tudo"** (com confirmação).

## Comportamento

- **Consolidação:** somar/concatenar quantidades quando duas receitas usam o
  mesmo ingrediente (`quantity` é texto livre — "2 xícaras" + "1 xícara" não
  somam; agrupar por nome e listar as quantidades lado a lado é o comportamento
  honesto até o backend padronizar unidades).
- **Marcar/desmarcar** item alterna o estado no store; tudo persiste em
  `localStorage` a cada mudança.
- Estado vazio: "Sua lista está vazia — adicione ingredientes de uma receita
  pelo botão '🛒 Adicionar à lista'".

## Pontos de entrada

- Botão **"🛒 Adicionar à lista"** na página de detalhe
  ([detalhe-receita.md](detalhe-receita.md)): envia todos os ingredientes da
  receita para o store e confirma com toast.
- Link "Lista de compras" no header autenticado, com badge da contagem de
  itens pendentes.

## Dependências no backend

- **Nenhuma** para a versão local (Zustand `persist` no `localStorage`).
- **Opcional, para multi-dispositivo:** tabela `shopping_list_items`
  (user_id, recipe_id, quantity, checked) com `GET`/`POST`/`PATCH`/`DELETE`
  próprios; endpooints não existem hoje.