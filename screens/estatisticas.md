# Estatísticas (`/stats`) — PROPOSTA

> **Status:** tela proposta, ainda não implementada. Depende do
> [histórico de cozinha](historico-cozinha.md) (nuvem) como fonte de dados —
> sem ele, só é possível mostrar estatísticas do cadastro, não do uso.

**Arquivos sugeridos:** `frontend/src/pages/StatsPage.tsx` ·
**CSS:** `StatsPage.css` · componentes de apoio de gráfico

Painel com a visão consolidada do uso: o que o usuário cozinha, quanto tempo
gasta e como é o seu acervo. Transforma dados que o app já coleta (ou
coletaria) em senso de progresso — o tipo de tela que gera retorno ao app.

## Pré-condições

- **Não autenticado:** redirecionar para `/login` (guard).

## Estrutura

- Título: **"Suas estatísticas"** + seletor de período (mês atual · últimos
  3 meses · tudo).
- **Cards de resumo:** receitas cozinhadas no período · tempo total na cozinha
  (soma dos `elapsedMinutes` do histórico) · tempo médio por preparo ·
  receita mais cozinhada.
- **Gráficos** (dados agregados pelo backend, para não varrer o histórico no
  cliente):
  - Receitas cozinhadas por mês (barras).
  - Distribuição por dificuldade do que foi cozinhado — depende da
    dificuldade padronizada, ver [criar-receita.md](criar-receita.md).
  - Top 5 receitas mais cozinhadas (barras horizontais).
- **Notas de rodapé:** dias sem cozinhar a mais ("🔥 Sequência de 3 semanas").
  Estado vazio (sem histórico): "Cozinhe sua primeira receita para ver
  estatísticas aqui" com botão para a Home.

## Comportamento

- Dados via `GET /stats?period=...` (chave `['stats', periodo]`) — a
  agregação (somas, contagens por mês, top N) acontece no backend; o cliente
  só desenha.
- Período troca invalida a chave e recarrega os cards/gráficos.
- Acessibilidade dos gráficos: cada visual deve ter sua leitura textual
  correspondente (título + valores), não só a imagem.

## Pontos de entrada

- Link "Estatísticas" no header autenticado.
- Resumo resumido ("3 receitas este mês") como teaser no
  [histórico](historico-cozinha.md), clicando para cá.

## Dependências no backend

- **`GET /stats`** com agregação por período — não existe; consulta a tabela
  `cooking_log` (ver [historico-cozinha.md](historico-cozinha.md)) e
  `recipes`.
- Sem backend no primeiro momento é inviável: agregação de histórico local em
  `localStorage` não sobrevive a troca de dispositivo e não escala.