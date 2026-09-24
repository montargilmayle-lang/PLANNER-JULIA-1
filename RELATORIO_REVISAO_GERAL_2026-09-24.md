# Relatório — Bloco C (semanas com 3 blocos) + revisão geral do arquivo · 24/09/2026

> **Estado:** pacote do Bloco C implementado no branch e aberto em PR — **não mesclado** (aguarda aval). Revisão geral = **só relatório**, nada aplicado. Regra da equipe (`EQUIPE_MULTIDISCIPLINAR_REGRA_DE_DECISAO.md`) aplicada a cada item: membro + evidência, passagem pelos oito, conflitos apresentados sem decidir.

---

## Parte 1 · Bloco C

### 1 · Diagnóstico (antes de corrigir)

**Confirmado.** A cascata usava `modulesForWeek(week)[0]` e `[1]`; a lista "BLOCOS DESTA SEMANA" iterava todos os módulos com badges A/B/C. Nas três semanas com 3 módulos o primeiro dos dados é um "Bônus":

| Semana | Lista mostrava | Cascata fazia | Sem tarefa em dia nenhum |
|---|---|---|---|
| 8 (25/02–03/03) | A = ANAT Bônus · B = PRE2 · C = CIR2 | ANAT = "Bloco A" (aula, apostila, banco, D2) · PRE2 = "Bloco B" | **CIR2 · Urologia** |
| 38 (23/09–29/09, **atual**) | A = ATB Bônus · B = INF1 AIDS · C = INF2 | ATB = "Bloco A" (aula+D2 qui, apostila sáb, banco seg, selagem qua') · INF1 = "Bloco B" (aula+D2 dom, apostila seg, banco qui', selagem qua') | **INF2 · Parasitoses Intestinais** |
| 43 (28/10–03/11) | A = OFT Bônus · B = Psiquiatria I · C = Psiquiatria II | OFT = "Bloco A" · Psiquiatria I = "Bloco B" | **PSI1 · Psiquiatria II** |

Render da semana 38 antes da correção (relógio 24/09): QUI "D3 · Aula online Bloco A ⇒ ATB · Bônus Antibioticoterapia", "D2-A ⇒ ATB"; SÁB "Apostila do Bloco A ⇒ ATB"; DOM "aula online Bloco B + D2-B ⇒ INF1"; SEG "banco A ⇒ ATB", "Apostila do Bloco B ⇒ INF1"; QUA 30/09 "Selar Bloco A ⇒ ATB", "Selar Bloco B ⇒ INF1"; QUI 01/10 "banco B da semana passada ⇒ INF1". **INF2: zero blocos** na semana e na seguinte (log `build/dbg_blocoC.log`).

**Impacto em outras telas:**
- **Módulos:** o card do INF2 aparece normal ("Sem.38 · ATUAL", 4 checks) — nada no cronograma o marca; a presencial marca `aulaPresencial` só de A e B (o C nem o registro complementar recebia).
- **Fila de desatraso:** na semana 39 o INF2 entra na fila por recência (é "semana passada", <100%) e pode virar Fio 1 — o conteúdo da semana vira desatraso, silenciosamente, ocupando um slot de fio.
- **Projeção de zeramento:** conta o INF2 como módulo atrasado (+1 no backlog → ~½ semana no ritmo 2). Mesma coisa com ANAT/CIR2 (sem. 8) e Psiquiatria II (sem. 43).

**Varredura de cobertura pré-correção (45 semanas com módulos): 6 falhavam** — 8, 38, 43 (3º bloco); **30** (29/07–04/08: fronteira template antigo → AMB — o D2-A que o template antigo dava na segunda 03/08 foi substituído pelo template AMB, e o CAR3 ficou sem questões); **32 e 34** (AMB, semanas de simulado: o bloco "D2 compacto: aula online B antes + 20q A + 20q B" só registrava o D2 — a aula do B não tinha onde ser marcada). As três últimas são históricas, mas são a mesma família do defeito.

### 2–7 · O que foi implementado (PR #13, branch `claude/gracious-knuth-8h90i8`)

| Item | Implementação | Membro que pede · evidência |
|---|---|---|
| 2 · N blocos + agrupamento | `weekGroupsFor(config, week)` → grupos A, B, C… (`config.weekGroups[semana] = [[ids],[ids],…]`, padrão 1 módulo por grupo). `blockRef`/`resolveBlock`/`blockTasks` por letra A–H; um bloco de grupo com N módulos tem tempo × N, rótulo "· grupo A: 2 módulos (X + Y)", **uma tarefa por módulo** (o ✓ do bloco marca todos; cada botão marca o seu). Grupo C+: cascata injetada em `genForCtx` (`cascadeFor`): **SÁB aula 1.5x + D2-C → DOM apostila (+1d) → QUA' "Selar Bloco C da semana passada" (+3d, após as de A/B) → QUI' banco (+4d)**; D: um dia depois. | 🩺 (todo bloco da semana é núcleo; A/B/C têm prioridade sobre desatraso) · 📚 (aula → D2 ≤1d, apostila +1d, banco/selagem ~3d — decisão 40) · ⚙️ (a tela não pode listar o que ninguém estuda) |
| 3 · Interface | Cabeçalho "BLOCOS DESTA SEMANA · 3 grupos" com badge por grupo (A ×2 / A ↳ quando agrupado); botão **"✎ Blocos e grupos"**: seletor de letra por módulo (mesma letra = juntos; letra nova = grupo separado), código/título editáveis (grava `config.moduleEdits[id]` ou o próprio `customModules`), **"+ Adicionar bloco"** (`config.customModules`, ids ≥ 1000, entra em cronograma, fila, projeção, revisões e Módulos com etiqueta "ADICIONADO POR VOCÊ"). Nada é apagado: remover só bloco dela sem registro, com confirmação. | 🧩 (o app lembra por ela; controle explícito no lugar onde o problema aparece) · ⚙️ (dados dela vencem a lista embutida; persistem e exportam no backup) |
| 4 · Capacidade | Aviso existente (`weekFit`) passa a dizer "⚠️ Semana com 3 blocos (A, B, C — 3 cascatas completas): ritmo N não cabe … Sugestão: ritmo Z. Os blocos da semana têm prioridade sobre o desatraso — o app não corta etapa de bloco." + botão "Aplicar ritmo Z". Nenhuma etapa de bloco é cortada. | 🧠/😴 (aviso antes do fracasso) · 🩺 (semana nova > desatraso) · 💬 (a paciente decide) |
| 5 · Ordem | `modulesForWeek`: principais primeiro, "Bônus" por último; só as semanas 8, 38 e 43 mudam de ordem (as demais têm 2 módulos sem bônus — **nenhuma outra semana é afetada**). | 🩺 (bônus é complementar) |
| 6 · Cobertura | `coverageWarn`: para cada módulo listado, exige `aula` + `questoesD2` + `apostila` marcáveis em algum dia (listas reais, inclusive dias editados). Aviso no topo: "⚠️ [código] está na lista da semana mas não tem tarefas — agrupe-o ou defina os dias." (código repetido na semana, ex. PSI1 I e II, traz o título entre parênteses — desvio mínimo do texto pedido, para não ser ambíguo). | ⚙️ + 📚 |
| 7 · Teste permanente | `coverage45.js`: abre as 45 semanas com módulos, lê lista + botões de etapa de cada bloco (oráculo independente) e exige aula+questões+apostila por módulo e ausência/presença do aviso. **Antes: 6 falhavam. Depois: 45/45** (sem.30 passa como *exceção documentada* — ver decisões pendentes). | ⚙️ |
| + · AMB "D2 compacto" | O bloco de simulado da AMB passa a registrar também a aula do B (o texto já dizia "aula online B antes"). Histórico (ago/26), mas corrige a família do defeito. | 📚 |

**Tabela de intervalos (semana 43, sem simulado · semana 38, com simulado e plantões 26–27/09):**

| Bloco | Semana normal (43) | Semana de simulado (38) |
|---|---|---|
| A | presencial QUA →1→ aula+D2 QUI →1→ apostila SEX →3→ banco SEG →2→ selagem QUA' | QUI →2→ apostila SÁB →2→ banco SEG →2→ selagem QUA' (pré-existente) |
| B | QUA →2→ aula+D2 SEX →1→ apostila SÁB →3→ banco TER →1→ selagem QUA' | aula+D2 DOM →1→ apostila SEG →2→ selagem QUA' →1→ banco QUI' (aceito em 24/09) |
| **C** | **QUA →3→ aula+D2 SÁB →1→ apostila DOM →3→ selagem QUA' →1→ banco QUI' (+4d da apostila)** | **idem: SÁB → DOM → QUA' → QUI'** |
| [A+B]+[C] | grupo A = 2 aulas (3,4h) + 60q (4h) QUI · apostila 3h SEX · banco 4h SEG · selagem 40min QUA' (2 tarefas); o bônus vira o grupo B (SEX/SÁB/TER/QUA') | idem, com o B na cascata de simulado (DOM/SEG/QUA'/QUI') |
| [A]+[B+C] | grupo B = aula 3,4h + 60q SEX · apostila 3h SÁB · banco 4h TER · selagem 40min QUA' | DOM "deslocado da sexta" = 8h (2 aulas + 60q), apostila 3h SEG, banco 4h QUI' |

Nenhum dia repete duas etapas do mesmo módulo (aula 1.5x → D2 no mesmo dia é a exceção justificada). Fios (1–4) inalterados.

**Cargas (estudo/dia, ritmo 2 / 4):**

| Semana · agrupamento | QUA | QUI | SEX | SÁB | DOM | SEG | TER | Aviso de semana |
|---|---|---|---|---|---|---|---|---|
| 43 · A,B,C | 7,7 / 9,8 | 8,0 / 10,1 | 6,5 / 6,5 | **8,5📚** / 10,2 | 6,0 / 8,7 | 4,6 / 6,1 | 4,1🌿 / 5,8🌿 | ritmo 2: nenhum (1 dia >8h) · ritmo 4: "3 blocos … Sugestão: ritmo 2" |
| 43 · [A+B]+[C] | 7,7 / 9,8 | **11,7📚** / 13,9 | 8,0 / 8,0 | 4,8 / 6,5 | 4,5 / 7,2 | 6,6 / 8,1 | 4,1🌿 / 5,8🌿 | ritmo 2: nenhum |
| 43 · [A]+[B+C] | 7,7 / 9,8 | 8,0 / 10,1 | **10,2📚** / 10,2 | 6,8 / 8,5 | 4,5 / 7,2 | 4,6🌿 / 6,1🌿 | 6,1 / 7,8 | ritmo 2: nenhum |
| 38 (sim + 2 plantões) · A,B,C | 7,7 / 9,8 | 6,0 / 8,2 | 9,2📚 | **7,8 (plantão diurno)** / 9,5 | **9,3📚 (véspera de noturno)** / 12,0 | 6,8📚 (pós-noturno) / 8,3 | 3,6🌿 / 5,3🌿 | "Semana com 3 blocos … Sugestão: ritmo 1" |
| 39 (seguinte) · A,B,C | 8,1📚 / 10,1 | **10,0📚** / 12,1 (aula A + D2-A + banco B pós-simulado + banco C) | 6,5 | 4,6 | 4,5🌿 | 4,6 | 5,6 | "ritmo 2 não cabe … Sugestão: ritmo 1" |

**Passagem pelos oito (pacote do Bloco C):** 🧠 nada empilha no dia sem remédio (o dia leve continua calculado; na 38 e na 43 fica na TER); 🧩 avisos mantidos e ampliados; 📚 intervalos dentro da regra 40, nenhum módulo sem aula antes de questões; 🩺 A/B/C núcleo, desatraso cede; 😴 pós-noturno intocado (o C não cai nele nas semanas reais: 28/09 é SEG e o C fica em SÁB/DOM); 🏃 academia inalterada; 💬 linguagem de aviso, não de culpa; ⚙️ nada apagado, backup cobre os novos campos. **Nenhum veto.**

**Conflitos a decidir (não decididos):**
1. **Carga do SÁB 26/09 e do DOM 27/09 (semana 38):** o C cai no plantão diurno (SÁB) e na véspera de noturno (DOM). 🧩 e 😴 vetariam "dia-monstro"; 🩺 e 📚 pedem o C dentro da semana. Saídas na sua mão: ritmo 1 (botão), agrupar (ex. [A]+[B+C]: DOM 11,8h — pior), ou mover blocos à mão. O app avisa e não corta.
2. **QUI' após semana de simulado com 3 blocos** (01/10: 10,0h — dois bancos, B e C): a alternativa seria banco C na SEX' (+5d da apostila). Pela regra 40 (c) "~3 dias", QUI' (+4) é o mais próximo; carga não é critério (decisão 38). Mantido QUI'; decide se prefere SEX'.
3. **Colocação do C:** SÁB/DOM (implementada: primeira recuperação a +3d da presencial, selagem exatamente +3d da apostila) × DOM/SEG (aula+D2 a +4d, banco QUI' +3d, selagem SEX' +4d — sem dois bancos na QUI', mas selagem separada das de A/B).
4. **Semana 30 (histórica):** manter como exceção documentada com aviso ⚠️ (implementado) × injetar o D2-A na segunda 03/08 (reescreve um dia passado).
5. **Ritmo por semana:** o item 4 pede "reduzir o ritmo de fios naquela semana"; o botão existente muda o ritmo global (`config.catchupPace`) — um `config.paceOverrides[semana]` é possível, mas toca 7 pontos do motor. Deixado como sugestão.

**Testes:** bateria `audit.js` 383 checks (S0–S17 + S18a–h: semanas 8/38/43 antes e depois, [A+B]+[C], [A]+[B+C], marcação de grupo com 2 módulos nos dois sentidos, bloco adicionado/editado pela interface, fila na semana seguinte, aviso de cobertura em dia editado, capacidade + "Aplicar ritmo 2") + `coverage45.js` 90 checks. Resultado registrado no PR. `index.html` idêntico (`cmp`).

---

## Parte 2 · Revisão geral — defeitos da família "aparece na tela, nada o estuda" e outras inconsistências

Gravidade: **crítico** = conteúdo não estudado ou dado perdido · **médio** = etapa sem registro ou promessa falsa · **baixo** = texto/cosmético. Linhas do `planner_residencia_2026_offline.html` (versão do PR).

### 1 · Todo dado exibido tem tarefa correspondente?

| # | Onde | Equipe/paciente determina | O código faz | Grav. | Correção proposta (membro) |
|---|---|---|---|---|---|
| 1.1 | Lista da semana × cascata (`resolveBlock` l.1394–1400, antes `mods[0]/[1]`) | Todo bloco listado é estudado (🩺, ⚙️) | 3º módulo sem tarefa (sem. 8, 38, 43) | **crítico** | **Corrigido no PR** (Parte 1) |
| 1.2 | `weekFioIds` l.918 (snapshot) × regra 7 da aba Desatraso l.2247 ("Toque 📌 … ele assume o 1º slot da semana … Fixe 2 para controlar os dois slots") | 📌 fixa o fio da semana (decisão dela) | Com o snapshot `config.fioWeek` já gravado (1ª renderização da semana), o 📌 só vale a partir da **semana seguinte**; nesta, a fila mostra "FIXADO" mas MATÉRIAS DESTA SEMANA e os blocos não mudam (sonda: pin 60 com snapshot [77,78] → Fio 1 continua Síndromes Febris) | médio (promessa falsa) | ⚙️ + 🧩: ou o 📌 reescreve o snapshot da semana corrente **só nos fios ainda não abertos** (aula não marcada), ou o texto da regra 7 diz "vale a partir da próxima semana" — decisão dela |
| 1.3 | Semana 30, fronteira template antigo → AMB (l.296 SEG "30 questões Bloco A" × `AMB_START` 03/08 l.316) | Todo módulo tem D2 | CAR3 (DAC) sem questões em 29/07–04/08; aviso ⚠️ agora aparece nessa semana | baixo (histórico, jul/26) | ⚙️: manter exceção documentada **ou** injetar D2-A em 03/08 (decisão pendente, Parte 1) |
| 1.4 | AMB "D2 compacto" l.349 (sem. 32 e 34) | Aula do B registrável (📚) | Só D2 era registrado → **corrigido no PR** | — | — |
| 1.5 | Blocos "(sem. passada)" (selagens de fio, Fio 4 cruzado, selagens A/B/C, banco B/C) × "MATÉRIAS DESTA SEMANA" (l.2166 `targetsAll`) | Tudo que gera tarefa aparece em algum lugar | Geram tarefa e são marcáveis **no bloco**, mas não aparecem na lista da aba Desatraso (que só lista os fios desta semana + extras) | baixo | 🧩: linha "FECHANDO DA SEMANA PASSADA" na aba Desatraso — sugestão, sem membro que exija |
| 1.6 | Seed histórico de 25/06 l.1073 "📌 Estudo desta quinta (… apostila Bloco A)" e l.1077 "📌 Tarefas de hoje (D2/D4/D6 Bloco B …)" | Bloco-nota não é etapa | Pelo texto "apostila Bloco A", `blockTasks` oferece "Apostila pelos erros (toque 3) ✓ · A · HEP2" num bloco que é só uma nota (o de B mostra ↳ GIN3 sem tarefa) | baixo (jun/26, histórico) | ⚙️: `blockTasks` ignora blocos cujo texto começa com 📌 — sugestão |
| 1.7 | Fila de desatraso (todos os módulos <100% de semanas passadas) | Fila = o que ainda falta | Coerente: a fila é lista de espera, não tarefa da semana; os fios da semana saem dela por snapshot | — | nada |

### 2 · Toda etapa gerada tem onde ser registrada?

| # | Onde | Determina | O código faz | Grav. | Proposta |
|---|---|---|---|---|---|
| 2.1 | "Revisão adaptativa da semana anterior (o app avisa pelo seu %)" (G2/POST DOM/SEG l.503/512/567/576), "Revisão adaptativa (D+7/D+30 pelo seu %)" (CATCHUP QUA l.396), "Revisão D+30 adaptativa + caderno" (CATCHUP DOM, FREE SÁB), "Revisão adaptativa + Anki dos erros" (CATCHUP SEG, FREE DOM), "Revisão adaptativa (o app avisa…)" (FREE QUA/TER l.644/708) | 🧩: registrar no próprio bloco, 1 toque | Só ✓ manual do dia; o "Revisei" (com %) vive no card amarelo `ReviewAlerts` (topo) e na seção "REVISÕES ESPAÇADAS — dd/mm" do dia (lista sem botão) | médio | 🧩 + ⚙️: o bloco REV lista as revisões vencidas do dia com o botão "Revisei" + % (mesma função `markReviewDone`); sem revisão vencida, diz "nada vencendo hoje" |
| 2.2 | "D1 · 10 questões pré-aula (priming)" l.321/466/530 e "D+1: reler palavras-chave + 5 questões" | Etapas de execução (sem campo) | ✓ manual, não alimenta nada | baixo (por decisão: não são checks) | nada — ou registrar "feito" por data (sugestão) |
| 2.3 | D5/D6 banco (l.510/574 etc.) | T4 recusado (decisão 29): banco sem registro | ✓ manual | — (decidido) | nada |
| 2.4 | "Questões dos temas fracos + Smartcards" (CATCHUP/FREE l.404/423/448/655/698), "caderno de erros dos simulados anteriores" (FREE SEX) | Etapa de execução | ✓ manual | baixo | nada |
| 2.5 | "D7 · CORREÇÃO DO SIMULADO" | % do simulado | Campo "% do simulado" no bloco ✓ (`simResults`) | — | — |
| 2.6 | Bloco de grupo (novo) | Marcar todos os módulos | Uma tarefa por módulo + % por módulo ✓ | — | — |

### 3 · Todo registro alimenta algo?

| Campo | Alimenta | Situação |
|---|---|---|
| `aula` | libera questões (`catchupAction`), P1 (`fioCandidates`), % do módulo, fila, projeção, BUG 2, sugestão de preenchimento | vivo |
| `aulaPresencial` | **nada** — registro complementar por decisão 33 (fora dos 4 checks) | morto **por decisão**; visível no card |
| `questoesD2` / `accD2` | fila, P1, BUG 2, preenchimento · `accD2` = reserva do D+7 (`r1Interval`) | vivo |
| `apostila` | idem | vivo |
| `smartcard` / `accSelagem` | `completedAt` → revisões D+7/D+30 · `accSelagem` calibra o D+7 | vivo ("o % da selagem agenda as revisões" **é verdade** hoje, l.806) |
| `completedAt`, `reviewD7Done`/`r1DoneAt`/`accR1`, `reviewD30Done`/`r2DoneAt`/`accR2`, `reviewR3Done` | motor de revisões (D+30 pelo `accR1`; reforço +14d se `accR2` < 60) | vivo |
| `aulaMin` (planejador) | só a sugestão de pomodoros | vivo, declarado "só sugestão" |
| `config.simResults[sexta]` | **só o input daquele dia** (l.1804 "acompanhamento entre provas — não calibra o motor") | semi-morto: não há série/histórico em lugar nenhum — **baixo**; 🩺 sugere uma linha "simulados: 62% (14/08) · 70% (28/08)…" na aba Desatraso |
| `events_v1` (imprevistos) | só o campo do dia | por design (anotação) |
| `catchupPins` | `effectiveTargets` — **só quando não há snapshot** (ver 1.2) | parcialmente morto na semana corrente |
| `lightDayOverrides`, `simOverrides`, `fioPlan`, `fioExtra`, `fillDismissed`, `fioWeek`, `catchupPace`, `manualWeek`, `weekGroups`, `customModules`, `moduleEdits` | motores respectivos | vivos |
| Texto do card amarelo l.1119 "<60% encurta + reexposição (apostila/aula antes de novas questões)" e protocolo §6 "<40% = trate a aula como não vista" | — | O app **encurta** (4d) mas **não gera** bloco de reexposição nem trata <40% — o texto instrui a paciente, não promete ação do app; protocolo já rotula como "sugestão da equipe" — baixo |

### 4 · Toda promessa de comportamento se cumpre?

| # | Texto | Cumpre? | Grav. | Proposta |
|---|---|---|---|---|
| 4.1 | Regra 7 Desatraso "ele assume o 1º slot da semana" / "Fixe 2 para controlar os dois slots" (l.2247) | **Não** na semana corrente já congelada (1.2) | médio | ver 1.2 |
| 4.2 | Cards Estrutura G2/POST "o ⚠️ da semana avisa quando não cabe" (l.1573) | Sim na G2/POST; **na CATCHUP/FREE não existe aviso de semana** (`weekFit` l.1518 só G2) — na FREE de simulado a SEX chega a 13,8h com só o selo 📚 do dia | baixo (ritmo travado nessas fases: não há ritmo a reduzir) | 🧩: aviso de semana também na FREE, com saída "pausar 1 fio nesta semana" — sugestão |
| 4.3 | Seletor 🌿 title l.1630 "Auto = menor carga entre os dias livres (**sábado por padrão**; nunca pós-noturno)" e card FREE "Sem remédio · … **sábado por padrão**" l.1686 | **Não** — decisões 15/36: menor carga estrita, sem dia padrão | baixo (texto) | ⚙️: trocar por "sem dia padrão; empate resolvido pelos critérios a–d" |
| 4.4 | Protocolo §2 "sábado por padrão", §12 "Fio A qua→qui→**sex**", "**sábado leve**", "selagem … do B na sexta — **domingo** em semana de simulado", FREE "**sábado = template leve**" | **Não** — código: Fio A qua→qui→**sáb**, sábado útil, selagem B deslizada para **sábado** (l.396), FREE sábado útil | baixo (docs) | ⚙️: alinhar §2/§12 com §5 (que já está certo) |
| 4.5 | Briefing §16 decisão 3 "G2/POST: **apostila do B + fios** no domingo" | Desatualizado (apostila do B foi para o sábado em 24/09; domingo = fios + revisão) | baixo (docs) | ⚙️ |
| 4.6 | "07/10 … a aula será vista AMANHÃ, online, no lugar das aulas 1.5x da semana" / 08/10 "substitui as aulas 1.5x desta semana · D2-B desliza p/ os tempos mortos dos plantões ou p/ segunda 12/10" | Sim: 08/10 marca `aula` de todos os blocos; 09/10 "Resumo rápido → D2-B"; o D2-B fica no plantão de 09/10 com o texto "tempos mortos … mova" (mover é manual) | — | — |
| 4.7 | CATCHUP "Selar o Fio B da semana passada (deslizado da sexta)" em semana de simulado | Sim (SÁB) | — | — |
| 4.8 | "o % da selagem agenda as revisões" (fios) / "registre o %" (D2) | Sim (T3) | — | — |
| 4.9 | Plantão "o que não der, mova para outro dia" / "Revisão adaptativa … o app avisa" / carga "se não der, mova blocos" | Sim (mover manual; alertas; selos) | — | — |
| 4.10 | Planejador "o app encaixa aula→questões→apostila→selagem sozinho" | Sim (`FIO_PAT`, selagens) | — | — |
| 4.11 | Planejador `dayCaps` G2 l.2094 "QUI ×2 · SEX ×2 · DOM ×3 …" divide a **aula de um fio** em pomodoros de vários dias | Contradiz "aula → questões +1d" se a aula for fatiada em 3 dias; é "só sugestão" (declarado) | baixo | 📚: sugerir a divisão só dentro do dia da aula do fio — sugestão |

### 5 · Cobertura plena de cada assunto, por fase e tipo de semana (intervalos lidos do render — `build/intervals16.log`, `intervals14.js`)

| Fase · semana | Cadeia | Fora da faixa / ausente |
|---|---|---|
| G2/POST normal | A: presencial→1→aula+D2→1→apostila→3→banco→2→selagem · B: →2→…→1→apostila→3→banco→1→selagem · C: →3→aula+D2→1→apostila→3→selagem→1→banco | nenhuma etapa ausente; selagem de A a +5d da apostila (aceito) |
| G2/POST simulado | A: aula+D2 QUI →2→ apostila SÁB →2→ banco SEG →2→ selagem QUA' · B: DOM →1→ SEG →2→ selagem QUA' →1→ banco QUI' (aceito 24/09) · C: SÁB→DOM→QUA'→QUI' | A: questões→apostila **2d** e apostila→banco **2d** (pré-existente, dentro do "cede na ordem inversa"; não registrado como aceito em §16 — **sinalizo**) |
| G2/POST plantão diurno (26/09, 03/10, 07/10, 09–11/10) | blocos mantidos + 🚑 + "tempos mortos" | intervalos iguais; cargas ⚠️ (>14,5h totais) — decisão 19 |
| G2/POST noturno/pós-noturno (20→21/09, 27→28/09, 05→06/10) | véspera: dia normal (😴 09h); pós: 😴 6h + blocos | 😴 vs "plantão não é dia morto" — conflito já apresentado e decidido pela paciente (decisão 19) |
| Semana 40 (07/10 plantão na presencial) | gravada 08/10 marca `aula` A+B; 09/10 resumo → D2-B; apostila A 09/10, apostila B 10/10, bancos 12–13/10, selagens 14/10 | ok |
| Dia leve (🌿) | não altera blocos | ok |
| Fios G2/POST (ritmo 1–4) | Fio 1 2/1/3 · Fios 2–4 1/1/3 | Fio 1 aula→questões 2d (aceito, decisão 40) |
| CATCHUP | Fio A 1/2/3 · Fio B 1/1/3 (4 em semana de simulado: selagem deslizada) | Fio A questões→apostila 2d (aceito); **fios não têm etapa "banco"** — por design (protocolo §7: 3 toques + selagem), **sinalizo** porque o item 5 pede "aula → questões → apostila → banco → selagem" para cada módulo: no desatraso o banco não existe |
| FREE | 6 fios 1/1/3; DOM só fecha etapas | idem: sem banco nos fios |
| Revisões | só após os 4 checks (`completedAt`) | módulo sem selagem nunca entra em revisão — por design ("dívida disfarçada de conquista"); o 3º bloco (antes da correção) nunca chegava lá |
| Duplicidade no mesmo dia | nenhuma (aula 1.5x → D2 é a exceção) | — |

### 6 · Fronteiras e casos-limite

| Caso | Resultado | Obs. |
|---|---|---|
| POST → CATCHUP (25/11) | 1ª semana CATCHUP: selagens A/B da última semana do POST (QUA), selagens dos fios fechados, Fio 4 cruzado fechado | ok (decisão 31); com o PR, uma semana 46 com 3 blocos também selaria o C (`gP`) |
| CATCHUP → FREE (16/12) | TER 15/12 fecha o Fio B; SEX 18/12 sela o Fio B; 1ª semana FREE sem "(sem. passada)" do pipeline; extras da CATCHUP sobrevivem ao filtro | ok |
| Ritmo muda no meio da semana | cai → snapshot encolhe (`applyPace`); sobe → App completa o snapshot | ok |
| 📌 concluído | sai de `effectiveTargets` (fila só <100%); o id fica em `catchupPins` para sempre (inócuo) | baixo: limpar pins de módulos completos — sugestão |
| Simulado ligado/desligado à mão | SEX/SÁB/DOM/SEG/TER trocam de variante; QUI' recebe/perde o banco B; CATCHUP SÁB recebe a selagem deslizada; candidatos ao dia leve excluem a sexta de simulado | ok |
| Semana inteira de plantões (09–11/10) | blocos mantidos; dia leve = nenhum candidato → aviso amarelo | ok |
| Dia editado à mão | override vence; BUG 2 não reescreve; sugestão "Aplicar" entra na lista editada; **com o PR** o aviso de cobertura dispara se a edição removeu aula/questões/apostila de um módulo listado (S18g) | ok |
| Fio extra atravessando 2–3 semanas | "(há 2 sem.)"/"(há 3 sem.)" | ok |
| Semana 7 (não existe) e semanas 47+ | "Semana de recuperação — sem módulos novos"; **com o PR** blocos A/B que referenciam letra inexistente somem só quando a semana TEM módulos; semana sem módulos mantém o template | ok |
| `catchupAction` l.972 usa `DEFAULT_START` em vez de `config.startDate` | se ela mudar a data-base na engrenagem, o "gap" da reexposição fica errado | baixo | ⚙️ |
| `catchupForDay` l.1191 (G2/AMB) | código morto para G2+ (todos os blocos de fio têm "Fio N") | baixo (limpeza) | ⚙️ |

### 7 · Decisões da paciente ainda valendo?

| Decisão | Código | Situação |
|---|---|---|
| Domingo é dia de estudo | G2/POST: Fio 1 apostila + Fio 2 aula + revisão (sim: aula B + D2-B); CATCHUP: Fio B aula; FREE: questões F4 + apostila F3 + selagem F6' | **vale** (com o PR: + apostila do C) |
| Dia leve varia pela carga, não é o sábado | `lightDayFor` menor carga estrita + desempate a–d | **vale** (só textos antigos "sábado por padrão" — 4.3/4.4) |
| Plantão não é dia morto | `buildShiftDay` mantém blocos | **vale** |
| Nada é apagado ao mover | `moveAct` (confirm só cancela o movimento); `applyFill.takeFrom` retira só o bloco gerado com texto idêntico do dia editado (decidido 24/09); "✕ remover" é ação explícita dela | **vale** |
| Limiar informa, nunca veta | `fillSuggest` (passadas por preferência), `moveAct` (confirm informativo, "Manter TUDO"), `weekFit` (botão, não bloqueio) | **vale** |
| Aula presencial ≠ aula 1.5x | `aulaPresencial` × `aula`; 08/10 marca `aula` | **vale** (com o PR a presencial marca `aulaPresencial` de A, B **e C**) |
| Conteúdo da semana > desatraso | **Estava violada** pelo Bloco C (o 3º bloco virava desatraso). Com o PR: cascata própria + aviso que propõe reduzir fios, nunca cortar bloco | **restaurada** |
| Selagem B +2d em sim (dec. 40), Fio 1 2d, CATCHUP Fio A 2d | inalterados | valem |
| Ritmo travado em 2 na CATCHUP, 6 na FREE | inalterado | vale |

**Nenhuma decisão de §16 foi revertida silenciosamente por patches posteriores.** As inconsistências são de texto (4.3–4.5), de promessa (1.2/4.1) e de registro (2.1).

---

## Decisões da paciente (24/09, 2ª rodada) — aplicadas no mesmo PR #13

| # | Decisão | O que mudou no código | Verificação |
|---|---|---|---|
| 1 | Semana 38 com o C: aceita como está | nada | — |
| 2 | Banco C na **sexta seguinte (+5d)**, não na quinta | `cascadeFor`: banco em `d0 + 6`; texto "(+5d da apostila)" | S18a2: QUI 01/10 sem banco C; SEX 02/10 com banco C ⇒ ATB. Sem.39 QUI cai de 10,0h para 8,0h (SEX 8,5h). **Sinalização:** quando a semana seguinte é de simulado (sem.44, 06/11) o banco C cai na sexta da prova — 11,2h com o selo 📚; o app avisa, não corta |
| 3 | C em sábado/domingo | mantido | — |
| 4 | Semana 30: **D2-A injetado na segunda 03/08** | `genForCtx`: bloco "30 questões Bloco A … (D2 da segunda do template antigo — fronteira 03/08)" após o Anki; `coverage45.js` sem exceções | S19a; cobertura 45/45 sem `KNOWN` |
| 5 | Ritmo por semana: feature aprovada, **fora deste PR** | registrado em briefing §14 E | — |
| 6 | 📌: corrigir a promessa, não o congelamento; oferecer na sugestão | regra 7 reescrita ("a partir da próxima semana … use a sugestão"); `pinWait` + aviso "📌 Você fixou … Quer abri-lo já, como fio extra?" → `fillSuggest(forceMod)` (só o passo 2) → "Aplicar" grava `fioExtra`; "Deixar para a próxima semana" grava `fillDismissed[wed\|pin]` | S19b, S19b2 |
| 7 | "Revisei" + % dentro do bloco de revisão | `ReviewRows` (extraído do card amarelo) nos blocos REV de revisão e na seção REVISÕES ESPAÇADAS; sem revisão vencida: "nenhuma revisão vencendo hoje", sem botão | S19c (grava `reviewD7Done`, `r1DoneAt`, `accR1`; D+30 recalcula) |
| 8 | Textos desatualizados | seletor 🌿, card FREE, comentário CATCHUP; protocolo §2/§12; briefing decisão 3 | grep sem "sábado por padrão" |
| 9 | Aviso de semana também na CATCHUP/FREE | `weekFit` em todas as fases ≥ G2; fase travada: "Semana pesada … (ritmo travado nesta fase: K fios). Mova blocos ou deixe um fio…"; sexta de simulado >8h avisa sozinha | S19d (FREE 30/12: 13,8h), S19d2 (CATCHUP 04/12: 8,6h) |
| 10 | 📌-nota, data-base, `catchupForDay` | `resolveBlock`/`blockTasks` ignoram "📌 …"; `__START_ISO` (`setStartCfg`) em `rawWeekOf` e `catchupAction`; `catchupForDay` só para templates históricos (ramos G2/CATCHUP/FREE removidos) | S19e, S19f; S0/S1 (histórico) inalterados |
| 11 | `aulaPresencial` informativa | `aulaPresencialAt` gravado no toggle; card: "presencial assistida em dd/mm · registro complementar" | S19g |
| 12 | Série do % dos simulados | `simSeriesText`: no bloco de correção ("📈 Evolução: …") e no topo da aba Módulos | S19h |
| 13 | Fios sem banco: decisão explícita | briefing §16 decisão 46; protocolo §7 | — |

Bateria final: `audit.js` S0–S19 e `coverage45.js` (números no PR). `index.html` idêntico.

## Resumo do que precisava do seu aval (histórico — decidido em 24/09, tabela acima)

1. **Mesclar o PR #13** (Bloco C + grupos + cobertura + testes) — ou pedir ajustes nos conflitos 1–3 da Parte 1.
2. **Semana 30**: exceção documentada (como está) ou injetar o D2-A histórico.
3. **Ritmo por semana** (`paceOverrides`): implementar ou manter o botão global.
4. Da revisão geral, o que aplicar (tudo é opcional e nada foi tocado): **1.2/4.1** 📌 na semana corrente; **2.1** "Revisei" dentro do bloco de revisão; **4.3–4.5** textos "sábado por padrão"/protocolo §2/§12/decisão 3; **3** série de % dos simulados; **1.5**, **1.6**, **4.2**, **4.11**, **6** (pins, `DEFAULT_START`, código morto) como limpeza.


---

## Parte 3 · Aviso de espaçamento ao mover tarefa (PR #14, 24/09) — relatório antes do merge

**Membro que pede · evidência:** 📚 (a distribuição é decidida pela estratégia de aprendizagem — decisão 38; faixas da decisão 40) e ⚙️ (o app não pode deixar um movimento à mão quebrar o que a cascata garante sem dizer nada). 🧩 pede o aviso sem bloqueio e a proposta pronta; 💬 pede que a decisão fique com ela ("Mover assim mesmo" sempre disponível).

**O que faz:** ao mover um bloco ligado a módulo, `analyzeMove` recalcula os intervalos da **cadeia daquele bloco** (`familyOf`: o próprio fio — rótulo + semana do slot — ou a cascata A/B/C — letra + semana; um módulo pode ter as duas, ex. Bloco A da semana passada e Fio 1 desta) na posição nova, nos dias −7…+20, e compara com a faixa vigente: nunca duas etapas no mesmo dia · questões→apostila 1–2d · apostila→banco e apostila→selagem 2–5d · aula→questões 1–2d (A/B/C: 0–2, aula online → D2 no mesmo dia). As faixas aceitas são exatamente as já registradas em §16 40 (Fio 1 a→q 2d, sim B selagem +2d, C banco +5d passam sem aviso). O diálogo é o mesmo em que a carga é informada, sem bloquear, com o antes e o depois de cada intervalo afetado, na ordem de prioridade. **Mover assim mesmo** grava só o movimento; **Ver como reorganizar o fio** mostra a proposta (só etapas não feitas e não vividas; pós-noturno nunca; dia leve por último com aviso; ⚠️ à vista) e só **Aplicar** grava — fios da G2/POST pelo plano (`fioPlan`/`fioExtra`), A/B/C e fios da CATCHUP/FREE só dentro da própria semana (o texto "Bloco A"/"Fio A" é relativo à semana em que aparece), materializando os dias como um movimento à mão; **Cancelar** não move nada. Bloco sem módulo (Anki, PLAN, academia, lazer, plantão): como antes, só a carga.

**Intervalos antes e depois em cada cenário (lidos do render, `tests/audit.js` S20):**

| Cenário (sem.41, 14/10, ritmo 2, fios [77, 78]) | Antes | Depois do movimento | Aviso | Proposta / resultado |
|---|---|---|---|---|
| a · Fio 1 (Sem.40 Síndromes Febris) · questões SÁB 17 → SEG 19 | aula QUI 15 →2d→ questões SÁB 17 →1d→ apostila DOM 18 →3d→ selagem QUA' 21 | aula QUI →**4d**→ questões SEG →**−1d**→ apostila DOM | "⚠️ Isso deixa a apostila 1 dia ANTES das questões (a ordem é questões → apostila) e as questões a 4 dias da aula (ideal: 1 a 2 dias)." · aula → questões: 2d → 4d · questões → apostila: 1d → −1d | **aula SÁB 17 (6,5h) →2d→ questões SEG 19 (seu movimento) →2d→ apostila ⚠️ QUA' 21 (9,3h) →3d→ selagem SÁB' 24 (5,0h)** — TER 🌿 preterida, ⚠️ à vista. "Aplicar" grava SÁB/SEG editados + `fioPlan[14/10][1] = { aula 3, apost 7, seal 10 }`; a QUA' mostra "Fio 1 (sem. passada) · toque 3" e o SÁB' "Selar Fio 1 (sem. passada)" ⇒ Sem.40 |
| b · Bloco A (NEU1) · apostila SEX 16 → SEG 19 (dia do banco) | aula+D2 QUI 15 →1d→ apostila SEX 16 →3d→ banco SEG 19 →5d→ selagem QUA' 21 | questões →**4d**→ apostila SEG = **mesmo dia do banco** | "⚠️ Isso deixa a apostila no mesmo dia do banco e a apostila a 4 dias das questões (ideal: ~1 dia)." · apostila → banco: 3d → mesmo dia · questões → apostila: 1d → 4d | "Não consigo reacomodar sem quebrar outra regra — mover assim mesmo mantém a apostila no mesmo dia do banco." (o banco de A/B/C só se move dentro da semana; +2…5d cairia na semana seguinte). Só "Mover assim mesmo" / "Cancelar" |
| c · Fio 1 · questões SÁB 17 → SEX 16 | aula QUI →2d→ questões SÁB →1d→ apostila DOM | aula →**1d**→ questões SEX →**2d**→ apostila DOM (na faixa) | nenhum — move direto | SEX/SÁB editados |
| d · "Mover assim mesmo" no cenário a | — | aula QUI →4d→ questões SEG · apostila DOM | — | só SÁB e SEG editados, sem `fioPlan`; aula e apostila ficam |
| e · "Cancelar" no cenário b | — | — | — | nada gravado (sem dia editado, sem plano) |
| f · Anki QUI → SEX (sem módulo) | — | — | nenhum (só carga, como antes) | QUI/SEX editados |
| g · sem.38 (24/09): aula online A QUI → SÁB 26 (plantão) | aula+D2 QUI 24 →2d→ apostila SÁB 26 (simulado) →2d→ banco SEG 28 | aula SÁB = **mesmo dia da apostila**; questões **2 dias ANTES** da aula | "⚠️ SÁB ficaria com ~22,5h de atividades — acima do tempo hábil (~14,5h)…" + "⚠️ Isso deixa a aula no mesmo dia da apostila e as questões 2 dias ANTES da aula (a ordem é aula → questões)." | D2-A de hoje é vivido (fixo) → "Não consigo reacomodar…" |

**Passagem pelos oito:** 🧠/😴 nada muda no dia sem remédio nem no pós-noturno (a proposta nunca o recebe); 🧩 aviso + proposta pronta, sem bloqueio; 📚 faixas da decisão 40; 🩺 o movimento dela vence sempre ("Mover assim mesmo"); 🏃/💬 blocos sem módulo intocados; ⚙️ nada apagado, "Cancelar" não grava, plano só com "Aplicar". **Nenhum veto.**

**Sinalizações (não decididas):** (1) a proposta só reacomoda dentro da própria semana para A/B/C e fios da CATCHUP/FREE — o texto desses blocos é relativo à semana; levar um banco de A/B/C para a semana seguinte exigiria um bloco "Bloco X da semana passada" gerado sob demanda (possível, PR próprio); (2) o cálculo usa o dia de cada etapa lido das listas reais (inclusive dias editados à mão): se ela editou o dia e apagou uma etapa, o intervalo com essa etapa simplesmente não é avaliado; (3) hoje conta como dia vivido — a etapa de hoje nunca é reacomodada.

**Bateria:** `tests/audit.js` S0–S20 e `tests/coverage45.js` (números no PR). `index.html` idêntico.
