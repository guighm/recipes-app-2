# Importar receita (`/recipe/import`) — PROPOSTA

> **Status:** tela proposta, ainda não implementada. Exige um endpoint de
> extração no backend ( scraping/parser ou LLM) — é a proposta mais pesada do
> catálogo em termos de backend, e uma das mais valiosas para o usuário.

**Arquivos sugeridos:** `frontend/src/pages/ImportRecipePage.tsx` ·
**CSS:** `ImportRecipePage.css` · reusa `CreateRecipeForm`

Colar a URL de um site de receita e receber o formulário de criação
**pré-preenchido** com título, descrição, tempo, porções, dificuldade,
imagem e — o grande ganho — **ingredientes e passos**. Hoje cadastrar uma
receita exige digitar tudo; como a criação de ingredientes/passos é separada
(da criação da receita, ver [criar-receita.md](criar-receita.md) e
[detalhe-receita.md](detalhe-receita.md)), o usuário digita duas vezes.
Esta tela mata as duas fricções.

## Pré-condições

- **Autenticado** (a importação termina em `POST /recipes`, que exige sessão):
  redirecionar para `/login` (guard).

## Estrutura — fluxo em duas etapas

**Etapa 1 — Origem:**

- Título: **"Importar receita"**.
- Campo único: **URL da receita** (`z.string().url()`).
- Botão **Importar**; estado de processamento com texto claro ("Extraindo a
  receita do site… pode levar alguns segundos") — scraping é lento e o
  feedback importa.

**Etapa 2 — Revisão (o coração da tela):**

- O `CreateRecipeForm` já existente pré-preenchido com o que foi extraído
  (incluindo a pré-visualização da imagem via `watch`, que já funciona).
- **Nova seção "Ingredientes"**: lista editável (nome + quantidade) com
  ✕ para remover e campo para acrescentar manualmente — o usuário confere o
  que o extrator acertou e corrige o que errou.
- **Nova seção "Passos"**: lista de passos numerados, mesma edição, com
  reordenamento.
- Botão **"Criar receita"**.

## Comportamento

- **Importar:** `POST /recipes/import` com `{ url }` → retorna os dados
  extraídos (não salva nada ainda).
- **Criar receita:** sequência `POST /recipes` → para cada ingrediente
  `POST /ingredients` → para cada passo `POST /steps` (todos já existem) →
  redirect para `/recipe/{id}` com toast "Receita importada!".
- Progresso da sequência visível ("Salvando ingredientes… (3/8)") — são N+1
  requisições e o usuário precisa ver o avanço; se um item falha, prosseguir e
  reportar ao final o que faltou, em vez de abortar tudo.
- Erros do extrator (site bloqueado, formato não reconhecido): mensagem
  amigável + sugestão "Cadastre manualmente" → link para `/recipe/new`.

## Pontos de entrada

- Botão **"🔗 Importar de um link"** na tela de criar receita
  ([criar-receita.md](criar-receita.md)).

## Dependências no backend

- **`POST /recipes/import`** — não existe: fetch da página, extração
  (schema.org/Recipe quando houver — muitos sites de receita já publicam
  esse markup — ou LLM como fallback), normalização dos campos.
- Riscos a tratar no backend: SSRF (a URL vem do usuário — bloquear IPs
  internos), limites de tamanho/tempo, e rate limiting do endpoint.
- `POST /recipes`, `/ingredients` e `/steps` já existem e são reusados
  sem alteração.