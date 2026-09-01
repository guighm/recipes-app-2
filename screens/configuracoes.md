# Configurações (`/settings`) — PROPOSTA

> **Status:** tela proposta, ainda não implementada. **Pode ser 100%
> frontend** (preferências em `localStorage`, tema inclusive); a sincronização
> por usuário é refinamento posterior.

**Arquivos sugeridos:** `frontend/src/pages/SettingsPage.tsx` ·
**CSS:** `SettingsPage.css` · store `stores/settings.ts` (Zustand + persist)

Centraliza preferências que hoje não existem em lugar nenhum. Diferente das
outras propostas, não resolve uma tarefa — ela **melhora todas as outras
telas**: tema escuro, unidades, restrições alimentares e o tamanho da fonte do
[modo cozinha](modo-cozinha.md) são configurações com efeito global.

## Pré-condições

- Disponível autenticado ou não (preferências são locais na versão inicial);
  o item "Conta" só aparece quando autenticado.

## Estrutura

- Título: **"Configurações"**.
- **Aparência:** tema **Claro / Escuro / Sistema** (toggle). O CSS atual é
  só claro; implementar via variáveis de tema em vez de classes soltas, para
  que `prefers-color-scheme` funcione.
- **Cozinha:**
  - **Tamanho da fonte no Modo Cozinha** (Normal / Grande / Enorme) — é lida
    de longe, a escolha é individual.
  - **Unidade de medida** (Sistema métrico / imperial) — afeta exibição de
    quantidades nas listas; a conversão só é honesta depois de unidades
    padronizadas no backend (ver [lista-de-compras.md](lista-de-compras.md)).
- **Restrições alimentares:** chips de alergias/intolerâncias (glúten,
  lactose, etc.) e dietas (vegetariano, vegano). Efeito imediato: ingrediente
  que casa com uma restrição ganha destaque ⚠️ no detalhe da receita e na
  [lista de compras](lista-de-compras.md).
- **Conta** (só autenticado): atalhos para [perfil](perfil.md) e
  [recuperar senha](recuperar-senha.md), botão **Sair** (reusa o `logout`
  da Home).
- **Dados locais:** "Limpar histórico de cozinha" e "Limpar lista de
  compras" com confirmação — transparece que essa versão guarda tudo no
  navegador (ver [historico-cozinha.md](historico-cozinha.md)).

## Comportamento

- Toda mudança aplica em tempo real (não há botão "Salvar" — preferências se
  ajustam e se veem imediatamente, como o usuário espera).
- Persistência automática no `localStorage` a cada mudança; o tema também
  respeita `prefers-color-scheme` no modo "Sistema".
- O store de settings é lido pelas telas consumidoras (modo cozinha lê o
  tamanho de fonte; lista de compras lê as restrições) — sem prop drilling.

## Pontos de entrada

- ⚙️ no header, sempre visível.

## Dependências no backend

- **Nenhuma** para a versão local.
- **Opcional:** `GET`/`PUT /users/me/settings` para sincronizar entre
  dispositivos, junto com os endpoints do [perfil](perfil.md).
- O destaque de restrições (⚠️) funciona no cliente casando nomes de
  ingredientes — honesto para alergias comuns, mas **não substitui**
  informação médica; a tela deve exibir o aviso de que a checagem é
  heurística.