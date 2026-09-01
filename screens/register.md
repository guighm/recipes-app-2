# Cadastro de usuário (`/register`)

**Arquivo:** `frontend/src/pages/RegisterPage.tsx` (wrapper) ·
**Componente:** `frontend/src/components/RegisterForm.tsx` · **CSS:** `RegisterForm.css`

Formulário de criação de conta (`POST /users/register`). Espelha o
`CreateUserDto` do backend: todos os campos são obrigatórios.

## Estrutura

- Título: **"Cadastre-se"**.
- Observação: "Os campos obrigatórios estão marcados (*)."

## Campos

| Campo         | Tipo      | Validação (Zod)                                     |
| ------------- | --------- | ---------------------------------------------------- |
| Nome          | `text`    | Obrigatório ("Campo Obrigatório!").                 |
| E-mail        | `email`   | Obrigatório; formato de e-mail válido.              |
| Senha         | `password`| Obrigatória; mínimo de 6 caracteres ("Mínimo de 6 caracteres!"). |
| URL do Avatar | `text`    | Obrigatória ("Campo Obrigatório!").                  |

O payload enviado é `RegisterDTO { name, email, password, avatarUrl }`.

Validação `mode: 'onTouched'`; erros de campo aparecem abaixo de cada input via
`ErrorMessage` ("ATENÇÃO: …").

## Comportamento

- Botão **Enviar** desabilitado enquanto o formulário é inválido ou o envio
  está em andamento ("Enviando…").
- **Sucesso:** redireciona para `/login` — **não** faz login automático; o
  usuário precisa entrar com as credenciais recém-criadas.
- **Erro de API:** exibe a mensagem do `ApiError` (ex.: e-mail já cadastrado).
- **Erro de rede:** "Falha de conexão com o servidor."
- Link no rodapé: "Já possui cadastro? **Fazer Login**" → `/login`.

## Melhorias sugeridas

- **Validar a URL do avatar:** o campo aceita qualquer texto
  (`z.string().min(1)`). Usar `z.string().url()` e mostrar uma
  pré-visualização da imagem (como o formulário de receita já faz com
  `watch('imageUrl')`) para o usuário conferir antes de enviar.
- **Tornar o avatar opcional:** exigir URL de avatar para criar conta é uma
  barreira artificial; no backend, um default de avatar eliminarceria o campo.
- **Confirmação de senha:** segundo campo "Repita a senha" com
  `.refine()` comparando os valores — evita cadastro com senha digitada errada
  e sem recuperação de conta.
- **Medidor de força de senha:** exibir força (comprimento/variety) à medida
  que digita, já que o mínimo é apenas 6 caracteres.
- **Erro amigável para e-mail duplicado:** o backend retorna a mensagem
  pronta, mas exibir algo como "Este e-mail já está em uso" com link direto
  para o login deixa o fluxo mais claro.