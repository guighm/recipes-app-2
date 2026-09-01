# Recuperar senha (`/forgot-password` e `/reset-password`) — PROPOSTA

> **Status:** tela proposta, ainda não implementada. Exige fluxo de
> recuperação no backend (geração/envio de token).

**Arquivos sugeridos:** `frontend/src/pages/ForgotPasswordPage.tsx` ·
`frontend/src/pages/ResetPasswordPage.tsx` ·
**CSS:** `ForgotPasswordPage.css`

Fecha a lacuna mais crítica do fluxo de conta: hoje, quem esquece a senha
**perde a conta definitivamente** (não há recuperação, e o e-mail não pode ser
alterado). São duas telas irmãs, documentadas juntas.

## `/forgot-password`

**Pré-condição:** rota pública.

- Título: **"Recuperar senha"**.
- Campo único: **E-mail** (`email`, obrigatório, padrão das demais telas).
- **Comportamento:** `POST /auth/forgot-password` com `{ email }`. Resposta
  **sempre** genérica: "Se este e-mail estiver cadastrado, você receberá um
  link de redefinição." — não revelar se o e-mail existe (enumeração de
  contas). Mesma mensagem no erro 404 do backend.
- Link de volta: "Lembrou a senha? **Fazer Login**" → `/login`.
- Nota de UX: com o fluxo inicial enviando link por e-mail, o frontend só
  funciona de ponta a ponta quando houver serviço de e-mail no backend; sem
  isso, a tela ainda pode existir retornando o token na resposta em ambiente
  de desenvolvimento.

## `/reset-password`

**Pré-condição:** exige token (query param `?token=...`); sem token, exibir
"Link inválido ou expirado." com link para `/forgot-password`.

- Título: **"Definir nova senha"**.
- Campos:

| Campo              | Tipo      | Validação (Zod)                                    |
| ------------------ | --------- | --------------------------------------------------- |
| Nova senha         | `password`| Obrigatória; mínimo de 6 caracteres (mesma regra do [register.md](register.md)). |
| Confirmar senha    | `password`| Obrigatória; `.refine()` comparando com a nova.    |

- **Comportamento:** `POST /auth/reset-password` com `{ token, password }`.
  - **Sucesso:** toast "Senha redefinida!" e redirect para `/login` (sem
    login automático).
  - **Token inválido/expirado:** "Link inválido ou expirado." com link para
    solicitar um novo.

## Pontos de entrada

- Link "Esqueci minha senha" abaixo do botão **Enviar** da
  [login.md](login.md) — hoje não há para onde apontar.

## Dependências no backend

- **`POST /auth/forgot-password`** — gera token de curta duração, guarda hash
  e envia por e-mail (ex.: nodemailer/Resend).
- **`POST /auth/reset-password`** — valida o token, atualiza o hash da senha
  e invalida o token (uso único).
- Invalidar todos os JWTs emitidos antes da troca, se aplicável.