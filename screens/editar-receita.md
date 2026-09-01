# Editar receita (`/recipe/:id/edit`) — PROPOSTA

> **Status:** tela proposta, ainda não implementada. O frontend não possui
> esta página e o backend não possui o endpoint necessário.

**Arquivos sugeridos:** `frontend/src/pages/EditRecipePage.tsx` (wrapper) ·
`frontend/src/components/EditRecipeForm.tsx` · **CSS:** `EditRecipeForm.css`

Permite alterar os dados de uma receita existente — hoje, depois de criada, a
receita só pode ser vista ou deletada; qualquer erro de digitação obriga a
deletar e recriar do zero (inclusive ingredientes e passos).

## Pré-condições

- **ID inválido** (não inteiro ou ≤ 0): mesma tela "Receita não encontrada!"
  do [detalhe-receita.md](detalhe-receita.md).
- **Não autenticado:** redirecionar para `/login` (guard, ver
  [README.md](README.md)).
- **Receita de outro usuário:** exibir aviso "Você não pode editar receitas de
  outro usuário." (hoje o backend só nega na exclusão, com 403 — editar deve
  seguir o mesmo contrato).

## Estrutura

Reaproveitar `CreateRecipeForm` como base (mesmos campos, mesmas validações),
com diferenças:

- Título: **"Editar receita"**.
- Campos pré-preenchidos com os dados atuais (`GET /recipes/{id}` já existe).
- **Pré-visualização da imagem** funcionando como na criação (`watch`).
- Botão **Salvar** no lugar de **Enviar**; botão/link **Cancelar** que volta
  para `/recipe/{id}` sem salvar.

## Comportamento

- **Sucesso:** invalida a chave `['recipe', id]` (e `['recipes']`, pois a Home
  lista os mesmos dados) e redireciona para `/recipe/{id}` com toast
  "Receita atualizada!".
- **Erro de API:** mensagem do `ApiError` acima do botão (padrão atual).
- **Erro de rede:** "Falha de conexão com o servidor."

## Pontos de entrada

- Ícone ✏️ na coluna **Ações** da Home (ao lado dos 🔍/🗑️ atuais), via
  `Tooltip`.
- Botão "Editar receita" na página de detalhe.

## Dependências no backend

- **`PUT /recipes/:id`** (ou `PATCH`) — não existe; é o pré-requisito principal.
  Deve validar propriedade (mesma regra do `DELETE`: 403 para receita alheia).
- Idealmente `PUT /recipes/:id/ingredients/:ingredientId` e
  `PUT /steps/:stepId` no mesmo espírito, para editar itens das listas (ver
  [detalhe-receita.md](detalhe-receita.md)).