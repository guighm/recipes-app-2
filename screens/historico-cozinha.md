# Histórico de cozinha (`/history`) — PROPOSTA

> **Status:** tela proposta, ainda não implementada. Pode começar **100%
> frontend** (`localStorage`, como a [lista de compras](lista-de-compras.md));
> o log em nuvem para estatísticas e multi-dispositivo é a evolução natural.

**Arquivos sugeridos:** `frontend/src/pages/CookingHistoryPage.tsx` ·
**CSS:** `CookingHistoryPage.css` · store `stores/cookingLog.ts`

Registro das receitas que o usuário efetivamente cozinhou. É o dado que falta
para o aplicativo responder "o que eu mais cozinho?" — hoje o sistema sabe o
que o usuário *cadastrou*, mas nada sobre o que ele *fez*. Nasce naturalmente
do [modo cozinha](modo-cozinha.md): a tela final "Receita concluída! 🎉"
ganha um botão **"Registrar no histórico"**.

## Pré-condições

- **Não autenticado:** redirecionar para `/login` (guard).

## Estrutura

- Título: **"Histórico de cozinha"**.
- **Timeline** em ordem decrescente: data + mini card da receita (imagem,
  título, tempo de preparação) + tempo decorrido registrado no modo cozinha.
- **Resumo no topo:** "X receitas cozinhadas · Y neste mês".
- Repetição é esperada e desejada: cozinhar a mesma lasanha 5 vezes são 5
  entradas (é isso que gera estatística de "mais cozinhada").

## Comportamento

- Registrar: a tela final do modo cozinha envia
  `{ recipeId, cookedAt, elapsedMinutes }` ao store (versão local) ou
  `POST /cooking-log` (versão nuvem); invalida a chave `['history']`.
- **Cozinhar de novo:** botão no item da timeline abre o
  [modo cozinha](modo-cozinha.md) direto — o histórico vira atalho de rotina.
- Estado vazio: "Nada por aqui ainda — conclua uma receita no Modo Cozinha
  para registrar".

## Pontos de entrada

- Botão **"Registrar no histórico"** na tela final do modo cozinha.
- Link "Histórico" no header autenticado.

## Dependências no backend

- **Nenhuma** para a versão local (Zustand `persist`).
- **Nuvem:** tabela `cooking_log` (user_id, recipe_id, cooked_at,
  elapsed_minutes) com `POST /cooking-log` e `GET /cooking-log` — não existe;
  é também o pré-requisito das [estatísticas](estatisticas.md).