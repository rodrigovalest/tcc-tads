# História de Usuário - Seleção de Jogo e Configuração de Partida

**Como** usuário  
**Quero** selecionar um jogo e configurar seu modo e idioma  
**Para** iniciar uma partida apropriada (solo ou dupla), seja vindo pelo menu principal ou pelo fluxo de convite dentro do chat.

---

## CONTEXTOS DE ENTRADA

- **Entrada via menu**: acessa a rota `/(private)/(tabs)/matches` (seleção ampla de todos os jogos)
- **Entrada via chat**: origem é um atalho dentro de uma conversa (deve restringir a jogos em dupla)

---

## ESCOPO DOS JOGOS

Definidos em `mobile/constants/available-match-modes.ts`:

- **Solo**: `word-builder`, `time-attack-vocab`
- **Dupla**: `just-chilling`, `guess-who`, `who-am-i`
- **Formato Híbrido**: Nenhum jogo atualmente suporta ambos os formatos

---

## CRITÉRIOS DE ACEITAÇÃO

1. Deve apresentar todos os jogos ao acessar via menu
2. Deve apresentar somente jogos em dupla ao acessar via chat
3. Deve apresentar seletor de modo de jogo (solo/dupla) conforme suporte do jogo
4. Deve apresentar seletor de idioma com base nas línguas do usuário
5. Deve exigir seletor de modo de entrada quando aplicável (word-builder, time-attack-vocab)
6. Deve criar partida diretamente se o jogo for solo
7. Deve entrar em matchmaking se o jogo for em dupla
8. Deve enviar convite ao amigo se a partida foi iniciada via chat
9. Deve atualizar o título da tela conforme jogo e modo escolhidos
10. Deve redirecionar para tela principal se estado for inválido
11. Deve exibir botão "Next" para time-attack-vocab e "Play" para demais jogos
12. Não deve permitir continuar sem jogo selecionado
13. Não deve permitir continuar sem modo selecionado (quando aplicável)
14. Não deve permitir continuar sem idioma selecionado
15. Não deve permitir continuar sem modo de entrada selecionado (quando aplicável)
16. Não deve listar jogos solo ao entrar via chat
17. Não deve enviar convite para jogos solo
18. Não deve exibir seletor de modo se o jogo tiver apenas um formato

---

## CRITÉRIOS DE ACEITAÇÃO - DETALHAMENTO

### 1. Deve apresentar todos os jogos ao acessar via menu

**DADO QUE** o usuário acessa a tela pelo menu "Matches" (`/(private)/(tabs)/matches`)  
**QUANDO** a tela carregar  
**ENTÃO** deve listar todos os 5 jogos disponíveis: Just Chilling, Word Builder, Time Attack Vocab, Guess Who e Who Am I

**Estado Atual**: ✅ Implementado - A tela `matches.tsx` lista todos os jogos de `AVALIABLE_MATCH_MODES`

---

### 2. Deve apresentar somente jogos em dupla ao acessar via chat

**DADO QUE** o usuário entra pela ação de iniciar jogo dentro do chat  
**QUANDO** a tela carregar  
**ENTÃO** deve listar apenas os jogos cujo `matchFormat` contenha "duo": Just Chilling, Guess Who e Who Am I  
**E** não deve exibir Word Builder nem Time Attack Vocab

**Estado Atual**: ⚠️ Não implementado - Não há distinção de origem (menu vs chat) no componente atual

---

### 3. Deve apresentar seletor de modo de jogo (solo/dupla) conforme suporte do jogo

**DADO QUE** o usuário seleciona um jogo que suporte ambos os formatos (solo e dupla)  
**QUANDO** for redirecionado à tela de configuração (`language-selection`)  
**ENTÃO** deve exibir o componente `MatchFormatSelector` com opções de solo e dupla

**Estado Atual**: ⚠️ Parcialmente implementado - O seletor existe no código, mas nenhum jogo atualmente suporta ambos os formatos (todos têm apenas `["solo"]` ou `["duo"]`)

---

### 4. Deve apresentar seletor de idioma com base nas línguas do usuário

**DADO QUE** o usuário está na tela de configuração  
**QUANDO** visualizar o seletor de idioma  
**ENTÃO** deve listar apenas os idiomas em que o usuário tem proficiência cadastrada no perfil  
**E** deve exibir o componente `MatchLanguageSelector`

**Estado Atual**: ✅ Implementado - O componente `MatchLanguageSelector` é exibido para jogos que não sejam time-attack-vocab

---

### 5. Deve exigir seletor de modo de entrada quando aplicável

**DADO QUE** o jogo selecionado é `word-builder` ou `time-attack-vocab`  
**QUANDO** o usuário estiver na tela de configuração  
**ENTÃO** deve exibir o componente `InputModeSelector`  
**E** deve exigir seleção (teclado, voz ou escrita) antes de prosseguir

**Estado Atual**: ✅ Implementado - `InputModeSelector` é exibido condicionalmente para word-builder e time-attack-vocab

---

### 6. Deve criar partida diretamente se o jogo for solo

**DADO QUE** o modo efetivo do jogo é solo (word-builder ou time-attack-vocab)  
**QUANDO** o usuário pressionar o botão "Jogar" ou "Next"  
**ENTÃO** o sistema deve criar a sala e redirecionar para a tela de entrada na partida  
**E** não deve colocar em fila de matchmaking

**Estado Atual**: ✅ Implementado - Para word-builder solo, redireciona para `/(private)/word-builder/solo/game`; time-attack-vocab redireciona para próxima etapa de configuração

---

### 7. Deve entrar em matchmaking se o jogo for em dupla

**DADO QUE** o modo do jogo é dupla (just-chilling, guess-who ou who-am-i)  
**QUANDO** o usuário pressionar "Jogar"  
**ENTÃO** o sistema deve redirecionar para a rota de espera correspondente:

- `/(private)/just-chilling/duo/waiting`
- `/(private)/guess-who/duo/waiting`
- `/(private)/who-am-i/duo/waiting`

**E** deve colocá-lo em estado de espera até emparelhamento

**Estado Atual**: ✅ Implementado - Rotas de waiting configuradas para cada jogo em dupla

---

### 8. Deve enviar convite ao amigo se a partida foi iniciada via chat

**DADO QUE** a entrada ocorreu via chat **E** o modo do jogo é dupla  
**QUANDO** o usuário pressionar "Jogar"  
**ENTÃO** o sistema deve criar a sala **E** enviar convite automático com link no chat ao amigo  
**E** o convite deve expirar após 5 minutos se não for aceito

**Estado Atual**: ❌ Não implementado - Não há lógica de envio de convite no código atual de `language-selection.tsx`

---

### 9. Deve atualizar o título da tela conforme jogo e modo escolhidos

**DADO QUE** o usuário selecionou jogo e modo  
**QUANDO** a tela de configuração for exibida  
**ENTÃO** o título deve refletir:

- **Modo Solo**: "Play to challenge yourself!"
- **Modo Dupla**: "Find a duo partner!"  
  **E** deve exibir o nome do jogo escolhido logo abaixo

**Estado Atual**: ⚠️ Parcialmente implementado - Sempre exibe `t("match.playToChallenge")`, sem condicional baseada no modo. O nome do jogo é exibido via `selectedMatchMode.title`

---

### 10. Deve redirecionar para tela principal se estado for inválido

**DADO QUE** a tela de configuração é aberta sem `matchMode` definido no estado  
**QUANDO** o componente carregar  
**ENTÃO** o sistema deve redirecionar automaticamente para `/(private)/(tabs)/matches`  
**E** deve retornar `null` para evitar renderização de conteúdo inválido

**Estado Atual**: ✅ Implementado - Validação presente no início do componente `language-selection.tsx`

---

### 11. Deve exibir botão "Next" para time-attack-vocab e "Play" para demais jogos

**DADO QUE** o jogo selecionado é `time-attack-vocab`  
**QUANDO** o usuário visualizar o botão de ação  
**ENTÃO** deve exibir texto "Next" com ícone de seta para direita  
**E** para todos os demais jogos, deve exibir "Play" com ícone de play

**Estado Atual**: ✅ Implementado - Lógica condicional no componente `Button` com `iconRight` dinâmico

---

### 12. Não deve permitir continuar sem jogo selecionado

**DADO QUE** o usuário está na tela de configuração  
**QUANDO** nenhum jogo foi selecionado (matchMode é null)  
**ENTÃO** o sistema deve redirecionar para a tela principal de Matches  
**E** não deve permitir visualizar ou interagir com a tela de configuração

**Estado Atual**: ✅ Implementado - Guard clause no início do componente

---

### 13. Não deve permitir continuar sem modo selecionado (quando aplicável)

**DADO QUE** o jogo suporta ambos os modos (solo e dupla)  
**QUANDO** o usuário tentar pressionar "Jogar" sem selecionar o modo  
**ENTÃO** o botão deve permanecer desabilitado  
**E** não deve executar nenhuma ação

**Estado Atual**: ⚠️ Não aplicável atualmente - Nenhum jogo suporta ambos os formatos; validação existe mas nunca é testada na prática

---

### 14. Não deve permitir continuar sem idioma selecionado

**DADO QUE** o usuário está configurando um jogo que exige idioma (todos exceto variações sem esse requisito)  
**QUANDO** `matchLanguage` for null (para jogos normais) ou `sourceLanguage` for null (para time-attack-vocab)  
**ENTÃO** o botão "Jogar"/"Next" deve estar desabilitado  
**E** ao tentar pressionar, deve exibir toast de erro com mensagem específica

**Estado Atual**: ✅ Implementado - Validação presente tanto no atributo `disabled` quanto na função `onPlay` com Toast

---

### 15. Não deve permitir continuar sem modo de entrada selecionado (quando aplicável)

**DADO QUE** o jogo é `word-builder` ou `time-attack-vocab`  
**QUANDO** `inputMode` (ou `taInputMode` para time-attack) for null  
**ENTÃO** o botão deve estar desabilitado  
**E** ao tentar pressionar, deve exibir toast: "Modo de entrada é obrigatório" / "Por favor, selecione um modo de entrada"

**Estado Atual**: ✅ Implementado - Validação condicional com Toast específico para input mode

---

### 16. Não deve listar jogos solo ao entrar via chat

**DADO QUE** o usuário entra no fluxo de seleção de jogo via chat  
**QUANDO** a lista de jogos for renderizada  
**ENTÃO** não deve exibir Word Builder nem Time Attack Vocab  
**E** deve exibir apenas jogos com `matchFormat` contendo "duo"

**Estado Atual**: ❌ Não implementado - Não há filtro baseado em origem; todos os jogos são sempre listados

---

### 17. Não deve enviar convite para jogos solo

**DADO QUE** o jogo selecionado é solo (word-builder ou time-attack-vocab)  
**QUANDO** o usuário pressionar "Jogar"/"Next"  
**ENTÃO** não deve tentar enviar convite via chat  
**E** não deve criar link de convite  
**E** deve apenas criar a sala e redirecionar

**Estado Atual**: ✅ Implementado por omissão - Jogos solo redirecionam diretamente sem lógica de convite

---

### 18. Não deve exibir seletor de modo se o jogo tiver apenas um formato

**DADO QUE** o jogo selecionado tem apenas `matchFormat: ["solo"]` ou `matchFormat: ["duo"]`  
**QUANDO** a tela de configuração for renderizada  
**ENTÃO** não deve exibir o componente `MatchFormatSelector`  
**E** deve assumir automaticamente o único formato disponível

**Estado Atual**: ⚠️ Parcialmente implementado - O seletor é sempre renderizado para jogos que não sejam time-attack-vocab, mas como nenhum jogo tem formatos múltiplos, o seletor sempre mostra apenas uma opção

---

## REGRAS DE NEGÓCIO

**R1** - Jogos exclusivamente solo não dependem de servidor de matchmaking ativo; criação de sala é imediata.

**R2** - Jogos em dupla requerem servidor/fila de matchmaking disponível para prosseguir; se indisponível, deve exibir mensagem de erro e bloquear início.

**R3** - Convites enviados via chat expiram após 5 minutos; devem ser marcados como inválidos depois disso e não permitem entrada tardia.

**R4** - Na entrada via chat, filtrar apenas jogos cuja lista `matchFormat` contenha "duo".

**R5** - Em jogos sem suporte a ambos os formatos, omitir o seletor de modo para evitar confusão.

**R6** - O título da tela deve ser derivado dinamicamente do modo final resolvido (solo vs dupla), não apenas do jogo.

---

## LACUNAS IDENTIFICADAS NO CÓDIGO ATUAL

### Críticas (Bloqueadores de Requisitos)

- ❌ **Filtro de jogos por origem (chat vs menu)**: Não há distinção de origem para filtrar jogos em dupla quando vindo do chat
- ❌ **Envio de convite via chat**: Lógica de criação e envio de convite não implementada em jogos de dupla originados do chat
- ❌ **Título dinâmico por modo**: Sempre exibe "Play to challenge yourself!" independente do modo ser solo ou dupla

### Médias (Requisitos Futuros)

- ⚠️ **Seletor de modo inútil**: Componente `MatchFormatSelector` existe mas nunca é usado adequadamente pois nenhum jogo suporta ambos os formatos
- ⚠️ **Verificação de servidor/matchmaking**: Não há validação de disponibilidade de servidor antes de entrar em fila de dupla (R2)
- ⚠️ **Mecanismo de expiração de convite**: Sistema de timer e invalidação de convites não implementado (R3)

### Baixas (Otimizações)

- 💡 Ocultar `MatchFormatSelector` quando jogo tiver apenas um formato ao invés de exibi-lo com opção única
- 💡 Adicionar logs/métricas para rastrear origem (menu vs chat) para análise de uso

---

## PRIORIDADES TÉCNICAS PARA ALINHAMENTO

1. **[ALTA]** Introduzir parâmetro/contexto de origem (menu vs chat) e filtrar jogos na tela de seleção
2. **[ALTA]** Ajustar título em `language-selection.tsx` baseado em `matchFormat` (solo vs dupla)
3. **[ALTA]** Implementar envio de convite automático no fluxo chat + modo dupla
4. **[MÉDIA]** Adicionar verificação de disponibilidade de matchmaking antes de redirecionar para rota de espera
5. **[MÉDIA]** Implementar mecanismo de expiração de convite (timer + estado)
6. **[BAIXA]** Ocultar condicionalmente `MatchFormatSelector` quando jogo tiver apenas um formato
7. **[FUTURA]** Planejar suporte a jogos híbridos (solo/duo) antes de reativar totalmente critério do seletor de modo

---

## ARQUIVOS RELACIONADOS

- `mobile/app/(private)/(tabs)/matches.tsx` - Tela de seleção de jogos
- `mobile/app/(private)/language-selection.tsx` - Tela de configuração de partida
- `mobile/constants/available-match-modes.ts` - Definição dos jogos e seus formatos
- `mobile/components/MatchFormatSelector.tsx` - Seletor de modo (solo/dupla)
- `mobile/components/MatchLanguageSelector.tsx` - Seletor de idioma
- `mobile/components/InputModeSelector.tsx` - Seletor de modo de entrada
- `mobile/store/match-store.ts` - Estado global de partida
- `mobile/store/time-attack-vocab-store.ts` - Estado específico do time-attack-vocab
