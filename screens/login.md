# Login (`/login`)

**Arquivo:** `frontend/src/pages/LoginPage.tsx` (wrapper) ·
**Componente:** `frontend/src/components/LoginForm.tsx` · **CSS:** `LoginForm.css`

Formulário de autenticação.

## Estrutura

- Título: **"Faça login"**.
- Observação: "Os campos obrigatórios estão marcados (*)."

## Campos

| Campo   | Tipo      | Validação (Zod)                                   |
| ------- | --------- | -------------------------------------------------- |
| E-mail  | `email`   | Obrigatório ("Campo Obrigatório!"); formato de e-mail válido ("Inserir e-mail válido!"). |
| Senha   | `password`| Obrigatória ("Campo Obrigatório!").                |

Validação `mode: 'onTouched'`; erros de campo aparecem abaixo de cada input via
`ErrorMessage` ("ATENÇÃO: …").

## Comportamento

- Botão **Enviar** desabilitado enquanto o formulário é inválido ou o envio
  está em andamento (texto muda para "Enviando…").
- Submissão chama `login(dto)` do store de autenticação (Zustand), que faz
  `POST /auth/login` com `{ email, password }`:
  - **Sucesso:** a API retorna `JwtDTO { id, accessToken }`; o `accessToken` é
    persistido no `localStorage` (chave `jwt`) e a página redireciona para `/`
    (`navigate('/')`). A partir daí, todas as requisições passam a enviar o
    cabeçalho `Authorization: Bearer <token>` automaticamente.
  - **401:** "E-mail ou senha inválidos."
  - **Outros erros / rede:** "Falha de conexão com o servidor."
- Link no rodapé: "Não tem cadastro? **Cadastre-se**" → `/register`.

## Melhorias sugeridas

- **Mostrar/ocultar senha:** um toggle (👁) no campo de senha reduz erros de
  digitação, principal fricção de um formulário de dois campos.
- **Voltar para a página de origem:** hoje o sucesso sempre vai para `/`. Se
  o usuário foi barrado em `/recipe/5` por não estar logado, o login deveria
  devolvê-lo lá (via `location.state` no navigate).
- **Mensagem pós-cadastro:** o `/register` redireciona para cá sem contexto.
  Passar um state ("Conta criada! Faça login.") e pré-preencher o e-mail
  digitado no cadastro.
- **Tratamento do 401 expirado:** se o token salvo estiver inválido, a Home é
  quem percebe primeiro; um redirect automático aqui (ver [README.md](README.md))
  daria fluxo mais limpo.