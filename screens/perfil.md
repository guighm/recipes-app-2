# Perfil do usuário (`/profile`) — PROPOSTA

> **Status:** tela proposta, ainda não implementada. O backend não possui os
> endpoints necessários.

**Arquivos sugeridos:** `frontend/src/pages/ProfilePage.tsx` ·
**CSS:** `ProfilePage.css`

Exibe e edita os dados da conta autenticada. Hoje, depois do cadastro, o
`avatarUrl` e o nome nunca mais podem ser vistos ou alterados — o
`UserDTO { id, name, email, avatarUrl, createdAt }` já está modelado no
frontend (`models/user.ts`), mas nenhuma tela o usa.

## Pré-condições

- **Não autenticado:** redirecionar para `/login` (guard).

## Estrutura

- **Cabeçalho do perfil:** avatar (preview da `avatarUrl`), nome e e-mail,
  além de "Membro desde {createdAt}" (formatar a data).
- **Estatísticas:** total de receitas criadas (conta os itens de
  `GET /recipes`) — dá senso de progresso com dado que já existe.
- **Formulário de edição** (react-hook-form + Zod, `mode: 'onTouched'`,
  padrão das demais telas):

| Campo         | Tipo      | Validação (Zod)                          |
| ------------- | --------- | ------------------------------------------ |
| Nome          | `text`    | Obrigatório.                              |
| E-mail        | `email`   | Obrigatório; formato válido.              |
| URL do Avatar | `text`    | Obrigatória; `z.string().url()` + preview. |

- **Alterar senha** (formulário separado): senha atual + nova senha +
  confirmação (`.refine()` comparando), com as melhorias de
  [register.md](register.md) (toggle 👁, força da senha).
- **Zona de perigo:** botão **Excluir conta** com diálogo de confirmação
  (modal, não `confirm()`), avisando que as receitas serão removidas.

## Comportamento

- **Salvar:** `PUT /users/me`; sucesso → toast "Perfil atualizado!" e
  invalidação da query do perfil; e-mail alterado exige novo login
  (documentar isso na tela).
- **Senha:** `PUT /users/me/password` (endpoint próprio); sucesso → toast,
  sem deslogar.
- **Excluir conta:** `DELETE /users/me` com confirmação digitada
  ("digite EXCLUIR"), `logout()` no sucesso e redirect para `/`.

## Pontos de entrada

- Nome/avatar no header quando autenticado (ver
  [README.md](README.md)) clicando para `/profile`.

## Dependências no backend

- **`GET /users/me`** — não existe (o login retorna só `{ id, accessToken }`).
- **`PUT /users/me`** e **`DELETE /users/me`** — não existem.
- Alterar senha pede um endpoint próprio (para exigir a senha atual) ou
  `PATCH /users/me/password`.
- Alternativa de menor escopo: enquanto os endpoints não existem, a tela pode
  começar só-leitura com os dados decodificados do JWT.