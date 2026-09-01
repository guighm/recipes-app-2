# Criar receita (`/recipe/new`)

**Arquivo:** `frontend/src/pages/CreateRecipePage.tsx` (wrapper) ·
**Componente:** `frontend/src/components/CreateRecipeForm.tsx` · **CSS:** `CreateRecipeForm.css`

Formulário de cadastro de nova receita (`POST /recipes`, via `useMutation` do
TanStack Query). Não requer autenticação explícita na UI (o backend rejeita
requisições não autenticadas).

## Estrutura

- Título: **"Cadastre uma nova receita"**.
- Observação (após o formulário): "Os campos obrigatórios estão marcados (*)."
- **Pré-visualização:** enquanto o campo **Imagem** tem valor, a imagem é
  renderizada entre o título e o formulário (`watch('imageUrl')`, com `alt` =
  "Pré-visualização da imagem da receita"); desaparece quando o campo é limpo.

## Campos

| Campo                | Tipo     | Validação (Zod)                          |
| -------------------- | -------- | ---------------------------------------- |
| Título               | `text`   | Obrigatório ("Campo Obrigatório!").      |
| Descrição            | `text`   | Obrigatória.                             |
| Tempo de Preparação  | `number` | Obrigatório; inteiro ≥ 1 (com `valueAsNumber`). |
| Número de porções    | `number` | Obrigatório; inteiro ≥ 1 (com `valueAsNumber`). |
| Dificuldade          | `text`   | Obrigatória.                             |
| Imagem               | `text`   | Obrigatória (URL da imagem).             |

O payload enviado é `CreateRecipeDTO { title, description, preparationTime,
servings, difficulty, imageUrl }`.

Validação `mode: 'onTouched'`; erros de campo aparecem abaixo de cada input via
`ErrorMessage` ("ATENÇÃO: …").

## Comportamento

- Botão **Enviar** desabilitado enquanto o formulário é inválido ou a mutation
  está em andamento ("Enviando…").
- **Sucesso:** redireciona para `/`; a lista da Home é recarregada com a nova
  receita.
- **Erro de API:** exibe a mensagem do `ApiError` abaixo do botão.
- **Erro de rede:** "Falha de conexão com o servidor."

## Melhorias sugeridas

- **Exigir login na UI:** qualquer visitante abre o formulário, preenche tudo
  e só descobre na submissão que o backend rejeita sem sessão. Redirecionar
  para `/login` quando não autenticado (guard compartilhado), como as demais
  páginas já fazem com avisos.
- **Dificuldade como `select`:** hoje é texto livre ("Fácil", "facil",
  "FÁCIL"...), o que impede filtros e fica inconsistente. Um `select` com
  opções fixas (Fácil/Médio/Difícil) padroniza os dados.
- **Validar a URL da imagem:** `z.string().min(1)` aceita qualquer texto; a
  pré-visualização existente já mostrará o problema, mas `z.string().url()`
  pegaria antes de enviar.
- **Upload de imagem:** permitir envio de arquivo com preview, em vez de
  exigir que o usuário hospede a imagem em outro lugar e cole a URL.
- **Fluxo assistido (wizard):** hoje cria-se a receita "pelada" e o usuário é
  jogado na Home — precisa abrir o detalhe para só então cadastrar
  ingredientes e passos. Um wizard em etapas (dados → ingredientes → passos)
  ou o redirect direto para `/recipe/{id}` da receita criada completaria o
  cadastro num fluxo só.