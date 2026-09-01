# Home (`/`)

**Arquivo:** `frontend/src/pages/HomePage.tsx` · **CSS:** `HomePage.css`

Lista todas as receitas do usuário autenticado em uma tabela, com ações de
visualizar e deletar cada uma.

## Estrutura

- Título da página (`h1`): **"🍴 Aplicativo de Receitas 🍴"**.
- Subtítulo (`h2`): **"Lista de Receitas"**.

## Estados da página

| Condição                    | Renderização                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------- |
| Não autenticado             | Aviso "Faça login para ver as receitas." com link **Fazer Login** (`/login`).      |
| Autenticado, carregando     | "Carregando…".                                                                     |
| Autenticado, erro da API    | 401 → "Não autorizado. Faça login novamente."; outros → "Falha ao carregar as receitas." |
| Autenticado, dados prontos  | Tabela de receitas (abaixo).                                                       |

A query só é habilitada quando autenticado (`enabled: isAuthenticated`), e a
tabela só renderiza quando `receitas` chega (lista vazia → `tbody` sem linhas).

## Tabela de receitas

Colunas: **Nome da receita · Descrição · Tempo de Preparação · Número de
porções · Dificuldade · Imagem · Ações**.

- **Imagem:** `img` (`.receita__imagem`) com a `imageUrl` da receita; `alt` =
  "Imagem de {título}".
- **Ações:** dois ícones lado a lado (`.icones`):
  - 🔍 (Tooltip "Ver receita") — navega para `/recipe/{id}`.
  - 🗑️ (Action "Deletar receita") — pede confirmação via `confirm("Gostaria de
    deletar esta receita?")` e chama `DELETE /recipes/{id}`. Só envia após
    confirmação.
- Erro da exclusão (`.erro-api`, exibido abaixo da tabela):
  - 403 → "Você não pode deletar receitas de outro usuário."
  - 401 → "Não autorizado. Faça login novamente."
  - Outros `ApiError` → mensagem bruta retornada pela API.
  - Falha de rede → **nenhuma mensagem é exibida** (o erro não é traduzido).

Os dados vêm de `GET /recipes` (TanStack Query, chave `['recipes']`), que
retorna `RecipeDTO[]` (id, userId, title, description, preparationTime,
servings, difficulty, imageUrl, createdAt); a exclusão invalida essa chave para
recarregar a lista automaticamente.

## Botões no rodapé da página

- **Criar receita** — link para `/recipe/new` (sempre visível, mesmo sem login).
- **Logout** — exibido apenas quando autenticado; remove o token do
  `localStorage` (chave `jwt`) via Zustand, o que devolve a página ao estado
  "Faça login para ver as receitas.".

## Melhorias sugeridas

- **Buscar/filtrar:** campo de busca por título e filtro por dificuldade
  (a dificuldade é texto livre, então o filtro exigiria normalizá-la — ver
  [criar-receita.md](criar-receita.md)) e ordenação clicando no cabeçalho das
  colunas (nome, tempo, porções).
- **Estado de lista vazia:** hoje uma lista vazia renderiza um `tbody` sem
  linhas. Exibir um estado dedicado com CTA: "Nenhuma receita ainda — crie a
  primeira" apontando para `/recipe/new`.
- **Corrigir erro silencioso:** falha de rede na exclusão não exibe mensagem
  alguma (o código só trata 403/401 e `ApiError`); o usuário clica em 🗑️,
  confirma e nada aparenta acontecer. Mapear também o erro genérico.
- **Feedback e otimismo na exclusão:** hoje só há feedback negativo. Com
  sucesso, remover a linha otimisticamente (update no cache da chave
  `['recipes']`) e mostrar confirmação via toast, em vez de aguardar o refetch.
- **Diálogo próprio de confirmação:** trocar `confirm()` por um modal
  (ver [README.md](README.md)).
- **Paginação ou scroll virtual:** `GET /recipes` traz tudo de uma vez; com
  dezenas de receitas a tabela e as imagens pesam.