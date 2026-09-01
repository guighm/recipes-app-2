# Detalhe da receita (`/recipe/:id`)

**Arquivo:** `frontend/src/pages/RecipeDetailPage.tsx` · **CSS:** `RecipeDetailPage.css`

Exibe uma receita com seus ingredientes e passos, e permite adicionar novos
ingredientes e passos via formulários inline.

## Pré-condições

Verificadas nesta ordem — a primeira que falha define a renderização:

1. **ID inválido** (não inteiro ou ≤ 0, ex.: `/recipe/abc` ou `/recipe/0`):
   exibe "Receita não encontrada!" com link **Voltar para a Home** (`/`).
2. **Não autenticado:** exibe "Faça login para ver a receita." com link
   **Fazer Login** (`/login`).

## Carregamento

Três queries paralelas (habilitadas só quando autenticado e com id válido):

- `GET /recipes/{id}` — dados da receita (chave `['recipe', id]`)
- `GET /recipes/{id}/ingredients` — ingredientes (chave `['ingredients', id]`)
- `GET /recipes/{id}/steps` — passos (chave `['steps', id]`)

Estados: "Carregando…" enquanto a query da receita carrega; se qualquer uma das
três falhar, o primeiro `ApiError` encontrado é exibido: 401 → "Não autorizado.
Faça login novamente."; outros → "Falha ao carregar a receita." As seções de
ingredientes/passos sempre renderizam (com tabela vazia enquanto não há dados).

## Cabeçalho da receita

Imagem da receita (`alt` = "Imagem de {título}") seguida de título e campos
rotulados: **Descrição, Tempo de Preparação, Número de Porções, Dificuldade**.

## Lista de Ingredientes

- Tabela **Nome · Quantidade**.
- Botão **Novo Ingrediente** alterna (mostra/esconde) um formulário inline com:
  - **Nome** (`text`) — obrigatório ("Campo Obrigatório!").
  - **Quantidade** (`text`) — obrigatória ("Campo Obrigatório!").
  - Botão **Cadastrar** (desabilitado se inválido ou enviando) faz
    `POST /ingredients` com `{ name, quantity, recipeId }`.
- Sucesso: limpa o erro de mutation, fecha o formulário, limpa os campos e
  invalida a chave `['ingredients', id]` para recarregar a tabela.

## Lista de Passos

- Tabela **Número · Descrição**.
- Botão **Novo Passo** alterna um formulário inline com:
  - **Número** (`number`, convertido com `valueAsNumber`) — obrigatório, inteiro
    ≥ 1 (mensagem: "Campo Obrigatório!").
  - **Descrição** (`text`) — obrigatória ("Campo Obrigatório!").
  - Botão **Cadastrar** faz `POST /steps` com
    `{ stepNumber, description, recipeId }`.
- Mesmo comportamento de sucesso do formulário de ingredientes (invalidando
  a chave `['steps', id]`).

## Erros de mutation

Erros de `POST /ingredients` / `POST /steps` aparecem no fim da página
(`.erro-api`): mensagem do `ApiError` ou "Falha de conexão com o servidor." A
mensagem é limpa quando a próxima mutation tem sucesso.

## Melhorias sugeridas

- **Distinguir receita inexistente:** um 404 da API cai no mesmo "Falha ao
  carregar a receita." dos outros erros. Tratar 404 explicitamente com
  "Receita não encontrada!" (mesma tela do id inválido), para o usuário não
  achar que é um problema temporário.
- **Editar e remover itens:** os formulários só adicionam — não há como
  corrigir um ingrediente, remover um passo adicionado por engano ou editar
  os dados da receita (título, tempo etc.). Botões de editar/excluir por
  linha (`PUT`/`DELETE` de `ingredients` e `steps`) completariam o CRUD.
- **Ordenar passos:** a tabela renderiza na ordem que a API devolve; ordenar
  por `stepNumber` no cliente garante o modo de preparo em sequência mesmo se
  o backend não ordenar.
- **Validar número duplicado:** adicionar um passo com `stepNumber` já usado
  depende de o backend rejeitar; validar também no cliente contra a lista já
  carregada, com mensagem clara.
- **Botão "Voltar":** não há como voltar à Home senão pelo header; um link
  "← Minhas receitas" no topo da página melhora a navegação.
- **Upload de imagem:** depende de a receita ter uma URL de imagem válida;
  aceitar upload de arquivo (com preview) removeria a fricção.