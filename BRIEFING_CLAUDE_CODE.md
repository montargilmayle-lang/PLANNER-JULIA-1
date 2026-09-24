# BRIEFING COMPLETO — Planner de Residência Médica
## Para Claude Code: leia este documento INTEIRO antes de tocar em qualquer linha de código.

---

## 0 · Contexto da paciente

- Estudante de medicina para residência via **MedCurso**
- Diagnóstico: **TDAH desatento + TAG**
- Medicação: **Venvanse 50mg + Escitalopram 10mg** (horários de medicação = decisão da psiquiatra, nunca prescrever)
- Academia 6x/semana · namorado · curso início 07/01/2026
- **Princípio-gatilho:** AULA sempre antes de questões ou apostila, inclusive no desatraso
- **Foco:** APRENDER e LEMBRAR, não zerar o cronograma
- Regra de ouro: **nunca prescrever horário de medicação — validar sempre com a psiquiatra**

---

## 1 · Arquivos do projeto

| Arquivo | Descrição |
|---|---|
| `planner_residencia_2026_offline.html` | Entregável principal (offline) |
| `index.html` | Cópia idêntica para Netlify |
| `protocolo_equipe_multidisciplinar.md` | Protocolo escrito com evidências |

**Tecnologia:** HTML single-file · React inlined via `createElement` (sem JSX) · localStorage prefix `medplanner_` · semana começa na quarta (dia da aula presencial).

---

## 2 · Constantes críticas (não alterar sem razão)

```javascript
DEFAULT_START = "2026-01-07"   // início do curso
AMB_START     = "2026-08-03"   // início do regime atual
AMB_END       = "2026-11-24"   // fim do ambulatório
G2_START      = "2026-09-10"   // grade real de plantões
G2_END        = "2026-10-11"   // fim da grade real
CATCHUP_START = "2026-11-25"   // recuperação (fios A/B)
FREE_START    = "2026-12-16"   // reta final em PIPELINE — QUARTA (a terça 15/12 fecha o Fio B da última semana CATCHUP)
TOTAL_WEEKS   = 51             // piso; dynTW() cresce com a projeção
SIMULADO_ANCHOR = "2026-08-14" // 1ª sexta COM simulado (âncora quinzenal real)
```

---

## 3 · Fases do cronograma (cascata por prioridade em `schedFor`)

```
pré-03/08  → histórico (template antigo intacto, prova sáb, aula 18h20)
03/08–09/09 → AMB (plantão Ter/Qui/Dom 07h–17h — vale o que estava)
10/09–11/10 → G2 (grade real com plantões DATADOS — ver §6)
> 11/10     → POST (provisório: tudo livre, só Medcurso qua — até nova grade; SEM aula da faculdade — decisão fechada da paciente em 14/09)
25/11–14/12 → CATCHUP (PROVISÓRIO — nova grade pendente: dias livres, Fio A qua→qui→sáb, Fio B dom→seg→ter, selagem do A na ter e do B na sex; sábado útil (apostila do A + temas fracos + PLAN), academia livre, simulados)
16/12+      → FREE em PIPELINE: cada dia, sábado incluído = aula do fio de hoje + questões do de ontem + apostila do de anteontem + selagem do de há ~5 dias (7 fios/semana, Fio 1..7 = QUA..TER; decisão 24/09), congelados por semana; simulado quinzenal mantido na sexta
```

**Cada fase tem seu próprio `WEEK_SCHEDULE_*`:** `WEEK_SCHEDULE_AMB`, `WEEK_SCHEDULE_G2`, `WEEK_SCHEDULE_POST`, `WEEK_SCHEDULE_CATCHUP`, `WEEK_SCHEDULE_FREE`.

---

## 4 · A cascata semanal (fase G2/POST — o coração do cronograma)

Esta é a distribuição **correta e validada pela equipe**. Não alterar sem revisar as evidências:

| Dia | O que acontece | Por quê (evidência) |
|---|---|---|
| **QUA (Dia 0)** | 10q pré-aula (priming) + **aula presencial A e B** (17h–22h) + D+1 relâmpago · **Selar Fio 1 (sem. passada)** (apostila foi no DOM, +3d) · ritmo 4: **Fio 4 (sem. passada) · questões** | Pretesting (Kornell 2009); gatilho da semana |
| **QUI (Dia 1)** | **Aula online Bloco A (1.5x) → D2-A (30q) no mesmo dia** + **Fio 1 · aula** · **Selar Fio 3 (sem. passada)** (+3d) · ritmo 4: **Fio 4 (sem. passada) · apostila** | Testing effect a 1 dia da presencial (Roediger 2006) |
| **SEX (Dia 2)** | **Aula online Bloco B → D2-B (30q)** + **Apostila do A pelos erros de ontem** + Fio 1 · questões · **Selar Fio 2 (sem. passada)** (+3d) | Erro→releitura em 24h; prática distribuída (Cepeda 2006) |
| **SÁB (Dia 3)** | **Dia útil comum (decisão da paciente, 24/09)**: **Apostila do B pelos erros de ONTEM** + Fio 1 · questões (ritmo ≥3: + Fio 3 · aula) + PLAN (intenções + recompensa + pomodoros + backup semanal) · sem academia (🏃 dia de descanso do treino) · em semana de simulado: apostila do A pelos erros de quinta | Apostila a 1 dia das questões, como o A na sexta; nenhum dia livre nasce vazio |
| **DOM (Dia 4)** | **Dia de fios + revisão**: Fio 1 · apostila + Fio 2 · aula (ritmo ≥3: + Fio 3 · questões) + revisão adaptativa da semana anterior (45min, fora de semana de simulado) + gym · ritmo 4: **Selar Fio 4 (sem. passada)** (+3d) · em semana de simulado: aula B (1.5x) + resumo + D2-B deslocados da sexta (a revisão vai para a segunda) | Dois toques de fio + revisão: carga comparável aos outros dias (4,5h no ritmo 2) |
| **SEG (Dia 5)** | Banco A + smartcards (D5 — etapa de execução, sem "registre o %"; +3d da apostila do A) + Fio 2 · questões (ritmo ≥3: + Fio 3 · apostila) · em semana de simulado: + apostila do B (erros de domingo) e revisão adaptativa | 2ª recuperação espaçada |
| **TER (Dia 6)** | **Banco B** (D6, +3d da apostila do B, antes da selagem) + **Selar A e B desta semana** (30min; +4d da apostila do A, +3d da do B) + Fio 2 · apostila (ritmo 4: + Fio 4 · aula → questões QUA e apostila QUI seguintes) + faculdade 19h30–21h (até 11/10) | Selagem = re-recuperação pós-critério (Rawson 2011); banco B na terça em todas as semanas (antes só em semana de simulado, P3) |

*Tabela reescrita em 24/09 (rebalanceada no mesmo dia) a partir do `FIO_PAT` vigente (§5): Fio 1 qui→sáb→dom · Fio 2 dom→seg→ter · Fio 3 sáb→dom→seg · Fio 4 ter→qua→qui. Em semana de simulado: SEX = prova + correção; SÁB = apostila do A; DOM = aula B (1.5x) + resumo + D2-B; SEG = + apostila do B + revisão adaptativa; TER = banco B. Cargas medidas (POST, ritmo 2 / 4): QUA 7,1 / 9,1 · QUI 6,0 / 8,2 · SEX 6,5 / 6,5 · SÁB 4,8 / 6,5 · DOM 4,5 / 7,2 · SEG 4,6 / 6,1 · TER 4,6 / 6,3 (G2: TER 6,1 / 7,8 com a faculdade); semana de simulado: SEX 9,2 · SÁB 4,3 / 6,0 · DOM 7,8 / 10,5 · SEG 6,8 / 8,3.*

**RESOLVIDO (12/09):** o card de Estrutura dizia "Sex+Sáb (A sex · B sáb)" — corrigido para "Sex+Dom" (e em 24/09 para "Sex+Sáb", com a apostila do B no sábado); o card ACADEMIA passou a ler a lista real de cada dia (sábado leve sem treino, domingo com treino, pós-noturno sem treino, plantão diurno "opcional").

---

## 5 · Motor de fios dinâmico (FIO_PAT)

```javascript
const FIO_PAT = [
    [[1, "aula"], [2, "quest"], [4, "apost"]],   // Fio 1: aula=QUI, q=SEX, a=DOM
    [[4, "aula"], [5, "quest"], [6, "apost"]],   // Fio 2: aula=DOM, q=SEG, a=TER
    [[2, "aula"], [4, "quest"], [5, "apost"]],   // Fio 3: aula=SEX, q=DOM, a=SEG
    [[6, "aula"]],                                // Fio 4: aula=TER; toques 2–3 na QUA/QUI SEGUINTES (cascata cruzada, P5a)
];
const FIO4_NEXT = [[0, "quest"], [1, "apost"]];    // blocos "Fio 4 (sem. passada) · toque 2/3" na semana seguinte (se a semana passada abriu 4 fios)
const FIO_SEAL_NEXT = { 0: 1, 1: 3, 2: 2, 4: 4 };  // P2: selagem por fio, bloco próprio, +3d da apostila — QUA sela Fio 1 · QUI Fio 3 · SEX Fio 2 · DOM Fio 4
// fioBlocksFor(dayIdx, pace, prevN): prevN = nº de fios que a semana passada abriu (snapshot); 0 na 1ª semana da G2
// Rebalanceado para o ritmo 4: evita empilhar aulas na sexta/segunda. Com ritmo 4 a sexta chega a ~9,5h de estudo
// e o selo 📚 (>8h) avisa — é o mecanismo que identifica quando o ritmo não cabe.
// dayIdx: 0=QUA, 1=QUI, 2=SEX, 3=SÁB, 4=DOM, 5=SEG, 6=TER
```

**Tempos dos fios (validados pela equipe):**
- Aula: **1.7h**
- Questões: **2h** (padrão da paciente: 2h/30q — corrigido de 1.5h)
- Apostila: **1.5h** (corrigido de 1.2h)
- Total por fio: ~5.2h + selagem = **≈5.9h/módulo** (dentro do padrão 5–6h da equipe)

**Selagem por fio (P2, PR #5):** `fioSealBlock(n)` injeta, na semana seguinte, um bloco próprio por fio (~3 dias após a apostila daquele fio):
> "Selar Fio N (sem. passada): 10 questões + smartcards + os 4 checks (bloco antigo) — o % da selagem agenda as revisões"

**Selagem de A e B (P6):** bloco fixo na TER dos templates G2/POST — "Selar A e B desta semana: 10 questões por bloco + smartcards + os 4 checks — registre o %" (30min): sela os blocos A e B da semana corrente (`blockA`/`blockB`), +4d da apostila do A e +2d da do B; D5/D6 é a etapa 4 (banco), não selagem.

**Regra ABSOLUTA:** Aula sempre antes de questões ou apostila. O sistema nunca deve gerar questões de um módulo sem que a aula tenha sido marcada como vista (check `p.aula`). No desatraso: entrada adaptativa — sem aula vista → toque 1 (aula); aula vista há ≤8 sem → direto às questões; aula vista há mais tempo → reexposição rápida (~40min) → questões.

---

## 6 · Plantões datados (DATED_SHIFTS)

```javascript
"2026-09-12": { label: "CRU", hours: "06h–19h", kind: "dia" },
"2026-09-19": { label: "CRU", hours: "06h–19h", kind: "dia" },
"2026-09-20": { label: "CN10 · Base Centenário", hours: "18h–07h", kind: "noite" },
"2026-09-26": { label: "CRU", hours: "06h–19h", kind: "dia" },
"2026-09-27": { label: "IT30 · Base Itapoã", hours: "18h–07h", kind: "noite" },
"2026-10-03": { label: "CRU", hours: "06h–19h", kind: "dia" },
"2026-10-05": { label: "PM04", hours: "18h–07h", kind: "noite" },
"2026-10-07": { label: "CRL · SUREM", hours: "06h–19h", kind: "dia" },
"2026-10-09": { label: "PM40 · Base Pau Miúdo", hours: "06h–19h", kind: "dia" },
"2026-10-10": { label: "CRU", hours: "06h–19h", kind: "dia" },
"2026-10-11": { label: "SM01 · Base San Martin", hours: "06h–19h", kind: "dia" },
```

**Regras dos plantões (REGRA DA PACIENTE: plantão NÃO é dia morto):**
- `buildShiftDay` é **NÃO-DESTRUTIVO**: mantém TODOS os blocos do dia (cascata A/B, fios, gym) e ACRESCENTA o bloco do plantão. O ⚠️ (tempo hábil >14,5h) e o 📚 (estudo >8h) avisam; a paciente move o que não der.
- Diurno 13h: bloco 🚑 no topo + blocos do dia + fechamento "dormir ~21h45". O bloco ANKI vira "Anki no trajeto — 20min (meditação 10min no almoço ou à noite)" e o GYM vira "Academia — opcional, só se sobrar energia" (30min)
- Véspera de noturno (dia em que ENTRA às 18h) — regra da paciente (14/09): dia normal de estudo começando mais tarde. Bloco 😴 "Acordar mais tarde (~09h) — você entra no plantão às 18h e vira a noite" (tempo "—") no topo + TODOS os blocos de estudo + academia + 🌙 no fim ("encerre os blocos até ~17h · saída ~17h15")
- Dia pós-noturno (chega às 07h) — regra da paciente (14/09): dia de ESTUDO com o sono como bloco inegociável antes. Bloco 😴 "Chegando (~07h): dormir até ~13h — bloco inegociável. Depois, dia de estudo normal: comece pelo mais pesado" (6h) no topo + blocos do template para valer; **sem academia** (veto 🏃 + 😴 mantido); o selo 📚 dispara em **5h** de estudo (`STUDY_WARN_POSTNIGHT_H`, janela desperta ~13h–22h) — sinal para mover o excedente, não freio. A linguagem de "manutenção" foi revogada
- Arco 05→06→07/10 (noturno PM04 → recuperação + aula 19h30 → plantão diurno na quarta da presencial): o trecho mais duro da grade — 05/10 recebe os blocos da segunda + 🌙 no fim; 06/10 recebe 😴 + blocos da terça com a aula preservada e sem academia; 07/10 é a colisão (⚠️ dispara; ela decide). Grade atualizada em 14/09: o noturno de 28/09 saiu; 28/09 virou pós-noturno simples e 29/09 terça normal
- Colisão com AULA presencial (07/10): o bloco da aula vira aviso "vista AMANHÃ, online"; a gravada substitui **as aulas 1.5x da semana (plural)**: 08/10 recebe a presencial gravada (A+B) no lugar da 1.5x do A; 09/10 troca a 1.5x do B por "Resumo rápido do Bloco B (visto na gravação de ontem) → vá direto ao D2-B" (20min) — sem dupla exposição sem teste entre elas
- **Sexta de plantão = sem simulado por padrão** (`DATED_SHIFTS[fri] ? false : paridade`), salvo override manual — o botão de override existe TAMBÉM nas sextas de plantão (P8, ⚙️: toda regra automática é reversível pela paciente); texto "📚 Sexta de plantão: sem simulado pela regra — toque se FOR fazer simulado hoje"
- NUNCA voltar ao modelo antigo em que o plantão substituía o dia inteiro

---

## 7 · Simulados (quinzenais, opcionais)

- Âncora: **14/08/2026** (primeira sexta COM simulado — informado pela paciente)
- Ciclo de **09/10 pulado** (fim de semana com 3 plantões) — retoma 23/10
- Paridade: `((diffDays(SIMULADO_ANCHOR, fri) % 14) + 14) % 14 === 0`
- **Override por sexta:** `config.simOverrides[isoSexta]` = true/false (2º toque apaga → volta à paridade/regra)
- **Resultado (T7):** `config.simResults[isoSexta]` = % do simulado, digitado no bloco de correção ("📈 % do simulado") — acompanhamento entre provas para a equipe, NÃO calibra o motor
- **Botão na sexta:** "🎯 Simulado marcado — toque se NÃO for fazer" / "📚 toque se FOR fazer"
- Semana de simulado (paridade cobre dayIdx 2,3,4,5): DOM recebe aula B + D2-B deslocados + **apostila do A (erros de quinta)**; SEG recebe **apostila do B (erros de domingo)**. Sem simulado: DOM tem apostila do B (erros de sexta). Prefixos "Semana de simulado ·" / "Sem simulado ·" controlam o filtro.

**Quando NÃO há simulado, a sexta vira dia ativo com:**
- Aula online Bloco B (1.5x) + resumo
- D2-B: 30q + caderno + Anki dos erros
- Apostila do A pelos erros de ontem
- Fios do motor dinâmico (pace configurado)

---

## 8 · Motor de revisões adaptativo por %

```javascript
function r1Interval(p) { // T3 (📚): o % da SELAGEM calibra o D+7 (re-recuperação pós-critério); o % do D2 é a reserva
    const a = p && (p.accSelagem != null ? p.accSelagem : p.accD2);
    if (a == null) return 7;
    return a >= 80 ? 10 : (a >= 60 ? 7 : 4);
}
function r2Interval(p) {
    const a = p && p.accR1;
    if (a == null) return 30;
    return a >= 80 ? 30 : (a >= 60 ? 21 : 12);
}
// Reforço em +14d se accR2 < 60
```

- Campo `accD2` ("% de acerto no D2") aparece quando D2 está marcado; campo `accSelagem` ("% da selagem (10q + smartcards)") quando a Selagem está marcada — no card (Módulos), na linha (Desatraso, T5) e no bloco do dia (Cronograma, T1)
- Campos de progresso: `PROGRESS_FIELDS = ["aula", "questoesD2", "apostila", "smartcard"]` com rótulos "Aula 1.5x + resumo (toque 1) ✓", "D2 · 30q (toque 2) ✓", "Apostila pelos erros (toque 3) ✓", "Selagem ✓" — a chave `smartcard` foi PRESERVADA (dados antigos continuam válidos)
- **`aulaPresencial`** (BUG 1, paciente 24/09 — REVOGA a decisão de 15/09 do campo único): registro complementar, opcional, fora dos 4 checks (não altera `completedAt` nem o %). A presencial de quarta marca `aulaPresencial` de A e B; `aula` = exclusivamente a exposição completa 1.5x + resumo (é o que libera questões e alimenta fila/projeção/entrada adaptativa). Exceção: a gravada de 08/10 substitui a 1.5x e marca `aula`. Fios só têm `aula`. Card: botão "Aula presencial ✓" abaixo dos 4 checks; `aula` antigos continuam válidos (sem migração)
- Gravação única: `toggleProgressField(progress, id, field)` e `setProgressPct(progress, id, field, v)` — usados pelo card, pela linha e pelo bloco do dia (T1, ⚙️)
- Ao tocar "Revisei" num alerta, campo de % abre para capturar `accR1` ou `accR2`
- Reset de módulo limpa: `reviewD7Done, reviewD30Done, reviewR3Done, r1DoneAt, r2DoneAt, accR1, accR2`

---

## 9 · Desatraso — fila e pins

- **catchupQueue:** módulos com `week < semanaAtual` e incompletos, ordenados por recência (mais antigo primeiro)
- **effectiveTargets(queue, n):** pins primeiro + automáticos completam até n
- **Pins (📌):** `config.catchupPins` = array de IDs fixados; toggle no botão de cada linha da fila
- **catchupForDay(dayIdx):** retorna o alvo do fio para aquele dia conforme a fase
- **weekPhase(startISO, wk)** → "AMB" | "G2" (G2 e POST) | "CATCHUP" | "FREE"; **fiosWanted(fase, ritmo)** → 4 (ritmo) | 2 | 6
- **fioCandidates(queue, progress, carry)** (P1, 📚 + ⚙️): módulo FECHADO (aula + questões + apostila) sai dos slots de fio (só a selagem o chama); módulo EM ANDAMENTO (aula marcada, questões pendentes) entra PRIMEIRO; depois recência. `carry` = ids que a semana passada ainda conduz (Fio 4 em cascata cruzada na G2/POST; todos os fios na FREE)
- **weekFioIds(config, progress, wk, startISO, n)** (todas as fases ≥ G2): fios da semana congelados em `config.fioWeek[isoDaQuarta]` (snapshot gravado pelo App na 1ª renderização da semana corrente; ritmo sobe → completa; nunca reordena). Semana passada sem snapshot → ordem legada (recência)
- **resolveBlock(text):** injeta o módulo real no bloco genérico:
  - `/Fio (\d+)( \(sem\. passada\))?/` → `wkIds[n-1]` ou `prevIds[n-1]` (snapshot desta / da semana passada)
  - `/Selar o Fio ([AB]) da semana passada/` (CATCHUP) → `prevIds[0|1]`
  - `/2º bloco antigo/` → `targets[1]`; senão → `catchupForDay(activeIdx)`
- **blockTasks(text, mod)** (T1): tarefas marcáveis do bloco → `[{ mod, field }]` (toque 1 → aula; toque 2 → questoesD2; toque 3 → apostila; "Selar …" → smartcard; presencial de quarta → `aulaPresencial` de A e B (BUG 1); gravada de 08/10 → `aula` de A e B; D2/D4 de A/B → campo do módulo A/B). D1, D+1, D5/D6, REV, D7 → `[]` (✓ manual do dia)

---

## 10 · Projeção de zeramento (dinâmica)

```javascript
const PROJ_PACE = { amb: 1, g2: __PACE, catchup: 2, free: 7 }; // free: o pipeline abre 7 fios/semana (sábado incluído)
// __PACE é alimentado pelo seletor de ritmo (1–4) na aba Desatraso (setPaceCfg ANTES de setDynTW no render do App)
// dynTW() cresce para cobrir a projeção além de TOTAL_WEEKS
// Meta: 31/12/2026, pode ultrapassar
// Fonte ÚNICA: projectedZeroISO(progress) alimenta o planejador E o card "RITMO E PREVISÃO" (mesmo texto de data);
// o rodapé mostra "ritmo atual: __PACE/sem". Não existe mais o cálculo remaining/pace uniforme.
// P7 (⚙️): na CATCHUP (25/11–15/12) o ritmo é TRAVADO em 2 — setPaceCfg(2), seletores inertes com a nota "esta fase agenda 2 fios (A e B)".
```

---

## 11 · Aviso de tempo hábil (sobrecarga)

```javascript
const DAY_CAP_H = 14.5; // 24h − 8h sono − 1h30 refeições
```
- `lightDayFor()` (Schedule): dia SEM Venvanse da semana visível = menor `studyHours(listFor(dayIdx))` entre os candidatos (7 dias menos a quarta com presencial `iso <= "2026-11-24"`, dias com `DATED_SHIFTS`, dias PÓS-NOTURNO (`DATED_SHIFTS[addDaysISO(iso,-1)].kind === "noite"` — veto 🧠: pausa + privação de sono + compromisso noturno) e a sexta quando `isSim`); empate → sábado; menor carga > `STUDY_WARN_H` → o menos pesado vira DIA DE RESPIRO (`breather: true`; selo 🌬️ âmbar "Dia de respiro — o mais leve da semana. COM Venvanse…", sem texto de pausa); `null` só quando não há candidato. O selo 🌿 só aparece quando há dia realmente leve; a escolha manual é sempre "sem remédio" (dela), com selo de validação. O domingo NÃO é excluído dos candidatos: pode ser o dia sem remédio ou dia ativo, a critério da equipe em cada semana (14/09). Override: `config.lightDayOverrides[isoDaQuarta] = dayIdx` (ponte `__LIGHT_SAVE`). UI: seletor `🌿 Sem remédio: [Auto · SÁB] ▾` acima das abas dos dias + selo no cabeçalho do dia escolhido. O selo não altera blocos; semanas totalmente anteriores a 10/09 não mostram o seletor.
- **P5b · viabilidade da semana** (`weekFit`, Schedule; só G2/POST): conta os dias da semana visível com `studyHours > STUDY_WARN_H` no ritmo atual; se passar de `WEEK_FIT_MAX_OVER = 1`, mostra "⚠️ Ritmo N não cabe nesta semana (X dias acima de 8h · Y plantões). Sugestão: ritmo Z." com o botão "Aplicar ritmo Z" (`__PACE_SAVE`). Z = maior ritmo menor que N que cabe (ou o que menos estoura). A escolha continua dela. Em semana de simulado, se nem o ritmo 1 cabe, linha extra: "⚠️ Semana de simulado: mesmo no ritmo 1 a carga excede. A prova + correção (8h) ocupam um dia-motor inteiro — considere pausar os fios nesta semana." com botão "Aplicar ritmo 1" (🧠/😴 saída explícita; 💬 é a semana, não ela)
- **BUG 2 (paciente, 24/09) — etapa feita não ocupa dia futuro:** o snapshot `fioWeek` congela os fios (P1/P2) e os blocos "Fio N · toque k" vêm do padrão por posição, sem olhar o estado do módulo — por isso um fio selado no meio da semana continuava nos dias seguintes (com ✓). Correção em `genActivities`: em dia com `iso > hoje` (fase ≥ G2), bloco de fio (DESAT ou "Selar … Fio") cuja tarefa já está marcada é omitido; dias passados e o de hoje ficam como histórico. O snapshot não é alterado.
- **Redistribuição avisada (paciente, 24/09 — o app nunca mexe sozinho; DECISÃO FINAL 24/09: a paciente decide se cabe, não o app):** blocos omitidos pelo BUG 2 em dias futuros da semana corrente = espaço liberado → faixa "🔄 Você adiantou [etapa de módulo]. Sobrou espaço em [dias]. Quer preencher?" com "Ver sugestão" / "Manter como está" (`config.fillDismissed[quarta]` = assinatura do espaço liberado). `fillSuggest()` (ordem, mantida mesmo quando a opção 1 cai em dia ⚠️): 1) adiantar etapa de fio em andamento (pré-requisito marcado, ≥1 dia da etapa anterior, antes do dia planejado, sem violar a etapa seguinte); 2) abrir o próximo fio da fila (`fioCandidates` + pins) pela aula nesta semana, toques seguintes por `nextOk`, selagem +3d; 3) antecipar selagem de fio fechado com +3d atingidos; 4) "Nada cabe sem quebrar a ordem aula→questões→apostila. Espaço protegido — descanse ou adiante o Anki." — **só por regra pedagógica ou pós-noturno, nunca por carga**. **Candidatos (sinalização 2 do PR #7, 24/09):** a única proteção rígida é o **pós-noturno** (recuperação de sono) — em todas as semanas avaliadas; o **dia leve da semana (🌿/🌬️, `lightAtWeek(k)` = escolha manual `lightDayOverrides[quarta]` ou `lightDayFor(k)`, o mesmo cálculo de menor carga para as semanas à frente)** não é excluído: é a última preferência, só entra quando nenhum outro dia cabe, e a proposta avisa sempre ("🌿 SÁB 24/10 é o dia leve da sem. seguinte (sem Venvanse)"; 🌬️ para respiro); **SÁB é um dia como os outros**, avaliado só pela carga; plantão diurno também é só carga (o custo mostra "+ plantão" e ⚠️ pelo tempo hábil). **O limiar de horas informa, nunca veta:** `scan(lo, hi, hrs, passada)` em 4 passadas — 0) dia normal que cabe (≤ `STUDY_WARN_H` de estudo e ≤ `DAY_CAP_H` no total) · 1) dia leve que cabe · 2) dia normal com ⚠️ · 3) dia leve com ⚠️; `thisWeek(from, hrs, hi)` faz as 4 passadas nesta semana (aula da opção 2, opções 1 e 3); `nextOk(from, hrs)` faz cada passada nesta semana e depois na semana onde a etapa cai (`loadAt(d)`, d = 0–27: override de `scheduleOv` ou `genForCtx(ctxAt(k))`, até 3 semanas à frente); além de 3 semanas, 1º dia não pós-noturno com "carga não avaliada". **A proposta mostra o custo de cada dia, sempre** (`dayCost`): "aula DOM 18/10 (6,0h) · questões TER 20/10 (4,6h) · apostila 🌿 SÁB 24/10 (2,3h, sem. seguinte) · selagem ⚠️ TER 27/10 (9,7h, sem. seguinte). 🌿 SÁB 24/10 é o dia leve da sem. seguinte (sem Venvanse)" — ⚠️ acima de 8h de estudo ou do tempo hábil. **"Aplicar" está sempre disponível** (mesmo com todos os dias em ⚠️) e grava de uma vez: `config.fioPlan[quarta][slot] = { aula|quest|apost|seal: dia }` (dias absolutos; ≥7 = semanas seguintes) ou `config.fioExtra[quarta] = [{ label, id, aula, quest, apost, seal }]`; **dia editado à mão (sinalização 1 do PR #7):** a etapa é inserida na lista editada daquele dia (`putInto`, antes do LAZER, com o texto que o gerador daria — `blockForStage`) e, num movimento (opções 1 e 3), o bloco gerado sai do dia antigo se ainda estiver lá com o texto original (`takeFrom`; nada que ela escreveu é tocado). `fioBlocksFor`/`fioPrevBlocksFor` renderizam pelo plano (cascata cruzada carregada; fios extras não viram fio novo — `weekFioIds` os inclui no carry). Extras de semanas anteriores rendem por `extraBlocksFor(dayIdx, extras, prevExtras, prev2Extras, prev3Extras)` (−7 "(sem. passada)", −14 "(há 2 sem.)", −21 "(há 3 sem.)"), válido também na CATCHUP/FREE; `resolveBlock` lê "(há N sem.)" só nos extras daquela semana (sem colisão de rótulo). `resolveBlock` resolve "Fio N" além do ritmo pelos extras (`label`). Fio extra aberto pela sugestão aparece em **MATÉRIAS DESTA SEMANA** (aba Desatraso, `targetsAll`, slot "FIO n · sugestão") e no planejador de pomodoros (sinalização 3, 🧩) — é onde ela marca o %.
- `STUDY_WARN_POSTNIGHT_H = 5`: no dia pós-noturno o selo 📚 dispara em 5h de estudo (em vez de 8h)
- Reta final: `weekFioIds(config, progress, wk, startISO)` devolve os 7 fios da semana (Fio 1..7 = QUA..TER) — snapshot `config.fioWeek[isoDaQuarta]` gravado pelo App (useEffect) na 1ª renderização da semana corrente, senão cálculo vivo. `resolveBlock` resolve "Fio N" e "Fio N (sem. passada)" por esse snapshot; a 1ª semana do pipeline omite os blocos "(sem. passada)"
- `moveAct` verifica o total do dia destino antes de mover
- Se > 14.5h: `window.confirm` pergunta se mantém tudo ("Manter TUDO nesse dia mesmo assim?")
- Cancela = só desfaz o movimento, nada é apagado
- Confirma = move e exibe o selo ⚠️ no cabeçalho do dia

---

## 12 · Backup e sincronização

- Card **💾 Backup e sincronização** na aba **Sono**
- Exporta/importa TODAS as chaves `medplanner_*`
- Botões: Baixar .json / Copiar / Importar arquivo / Colar texto
- Alerta amarelo se último backup > 7 dias
- Regra de ouro: **backup antes de subir nova versão no Netlify; sempre atualizar o MESMO site (mesmo endereço = dados intactos)**

---

## 13 · Estado atual do arquivo (auditado em 10/09/2026)

| Feature | Status |
|---|---|
| Motor de fios dinâmico (FIO_PAT + fioBlocksFor) | ✅ |
| Toggle simulado (__SIM_SAVE + botão na sexta) | ✅ |
| Nenhum template nasce com um dia sistematicamente mais vazio (decisão 24/09): G2/POST — SÁB com apostila do B + Fio 1 · questões (+ Fio 3 · aula) + PLAN, DOM com Fio 1 · apostila + Fio 2 · aula + revisão adaptativa; CATCHUP — SÁB com Fio A · apostila + temas fracos + PLAN; FREE — pipeline de 7 fios, sábado incluído | ✅ |
| DOM = sempre dia de estudo (FREE: recebe o fio do dia) | ✅ |
| Dia sem Venvanse calculado por semana (lightDayFor: menor carga estrita entre dias livres, sem desempate do sábado, pode cair em qualquer dia; override config.lightDayOverrides; selo 🌿) | ✅ |
| Pós-noturno nunca é candidato ao dia sem Venvanse (veto 🧠, 14/09) | ✅ |
| Semana sem dia leve → 🌬️ dia de respiro COM Venvanse (o mais leve), sem pausa (🧠 + 💬, 14/09) | ✅ |
| Card ACADEMIA: "1 treino em 6 dos 7 dias · sem treino no dia pós-noturno"; dia sem treino = "sem treino" (não "descanso") | ✅ |
| Após 11/10 sem aula da faculdade — decisão fechada (14/09) | ✅ |
| FREE em pipeline (aula hoje · questões ontem · apostila anteontem · selagem em bloco próprio), 7 fios/semana (sábado incluído) congelados por `config.fioWeek` (PR #4) | ✅ |
| FREE_START = quarta 16/12; PROJ_PACE.free = 6 (PR #4) | ✅ |
| Véspera de noturno = dia normal começando mais tarde (😴 ~09h); pós-noturno = sono até ~13h inegociável + estudo real; 📚 em 5h no pós-noturno; academia ausente no pós-noturno (4a–4d, PR #4) | ✅ |
| Regra de trabalho da equipe registrada em §17 (PR #4) | ✅ |
| P1: fio fechado sai dos slots; em andamento entra primeiro; fios congelados por semana em todas as fases ≥ G2 (PR #5) | ✅ |
| P3: D6-B na terça (desde 24/09 em todas as semanas) · P4: DOM de simulado com "(1.5x) + resumo" e "Anki dos erros" (PR #5) | ✅ |
| P5: Fio 4 em cascata cruzada (QUA/QUI seguintes) + aviso "⚠️ Ritmo N não cabe" com botão (PR #5) | ✅ |
| P7: ritmo travado em 2 na CATCHUP · P8: botão do simulado também nas sextas de plantão (PR #5) | ✅ |
| T1/T2: marcar a etapa direto do bloco do dia; bloco reflete o card (ida e volta); função única de gravação (PR #5) | ✅ |
| T3: % da selagem (`accSelagem`) calibra o D+7, reserva `accD2`; chave `smartcard` preservada (PR #5) | ✅ |
| T5/T6: % também na aba Desatraso; rótulos "Aula (toque 1) ✓ · D2 · 30q (toque 2) ✓ · Apostila pelos erros (toque 3) ✓ · Selagem ✓" (PR #5) | ✅ |
| T7: `config.simResults[isoSexta]` = % do simulado, no bloco de correção — acompanhamento, não calibra (PR #5) | ✅ |
| T4 recusado: banco D5/D6 sem registro; "registre o %" removido desses blocos na G2/POST (PR #5) | ✅ |
| BUG 1: `aulaPresencial` separado de `aula` (presencial de quarta ≠ 1.5x + resumo); gravada de 08/10 marca `aula` (PR #6) | ✅ |
| BUG 2: etapa de fio já feita não ocupa dia ainda não vivido; passado preservado (PR #6) | ✅ |
| Redistribuição avisada: aviso 🔄 + sugestão (adiantar etapa · abrir próximo fio · antecipar selagem · nada cabe só por regra pedagógica/pós-noturno) aplicada só com confirmação; custo de cada dia à vista com ⚠️ (até 3 semanas à frente), limiar informa e nunca veta, "Aplicar" sempre disponível; pós-noturno = única proteção rígida, dia leve (🌿/🌬️) = última preferência com aviso, SÁB sem tratamento especial; dia editado à mão recebe o bloco; `fioPlan`/`fioExtra`; fio extra em MATÉRIAS DESTA SEMANA (PR #6, PR #7) | ✅ |
| Colisão 08→09/10 confirmada pela paciente (14/09) | ✅ |
| Seletor de ritmo 1–4 na aba Desatraso | ✅ |
| Projeção pace-aware (__PACE) | ✅ |
| Tempos: aula 1.7h, questões 2h, apostila 1.5h | ✅ |
| Selagem por fio em bloco próprio, +3d da apostila (G2/POST: QUA/QUI/SEX/DOM da semana seguinte; CATCHUP/FREE já eram) + "Selar A e B" na terça (PR #5) | ✅ |
| 11 plantões datados com horários 06h–19h / 18h–07h | ✅ |
| Colisão 07/10 + política presencial→amanhã | ✅ |
| Motor revisões adaptativo (r1DueOf, r2DueOf) | ✅ |
| Campo % no card + captura no Revisei | ✅ |
| Pins 📌 (effectiveTargets) | ✅ |
| Backup (BackupCard na aba Sono) | ✅ |
| Planejador pomodoros (PlanejadorSemana) | ✅ |
| Aviso tempo hábil (DAY_CAP_H = 14.5h) | ✅ |
| dynTW() crescente com a projeção | ✅ |
| Plantão não-destrutivo (blocos mantidos + ⚠️/📚) | ✅ |
| Selo 📚 carga de estudo >8h (STUDY_WARN_H) | ✅ |
| Apostilas A/B realocadas em semana de simulado | ✅ |
| Sexta de plantão = sem simulado por padrão | ✅ |
| Plantão diurno: Anki no trajeto 20min + academia opcional 30min (C1/C2) | ✅ |
| Dia pós-noturno SEM academia (C2) | ✅ |
| Colisão 07/10: 09/10 = resumo rápido do B → D2-B (C3, plural) | ✅ |
| CATCHUP provisório: sem ambulatório Ter/Qui/Dom, sem aula da faculdade; Fio A qua→qui→sáb, Fio B dom→seg→ter, selagem do A na ter e do B na sex (C4; sábado útil desde 24/09) | ✅ |
| Card RITMO E PREVISÃO = projectedZeroISO (fonte única) + "ritmo atual" no rodapé (S2/S3) | ✅ |
| Planejador: subtítulo "Dimensionamento apenas — na execução, siga o Flowtime" (C6); ritmo 1 mostra 1 fio (S6) | ✅ |
| Rótulo "D2 (30q por bloco)" (S4) · dica véspera de plantão 06h na aba Sono (S5) · "bloco antigo" nos fios CATCHUP/FREE (S1) | ✅ |
| Cards Estrutura ("Sex+Dom") e ACADEMIA (lista real do dia); venv SEG/TER sem "Fio A/B"; fios da TER antes da faculdade | ✅ |

---

## 14 · Inconsistências CONHECIDAS / pendentes de correção

### A · RESOLVIDO (12/09) — card de Estrutura corrigido ("Sex+Dom"); blocos do sábado confirmados visualmente (só Anki + PLAN + LAZER; nos plantões, + 🚑 e lazer específico)

### G · IMPLEMENTADO no PR #4 (decisões da equipe e da paciente em 14/09 — o desenho abaixo é o que está no código)
1. **FREE em pipeline (📚 tem razão; ritmo mantido):** 1 fio novo por dia (sábado incluído desde 24/09: 7 fios/semana), toques escalonados entre dias — cada dia contém a AULA do fio de hoje, as QUESTÕES do fio de ontem e a APOSTILA do fio de anteontem (1 dia + uma noite de sono entre exposição e teste; feedback do erro em ~24h). A selagem sai desse bloco e vira bloco próprio, fechando os fios cujas apostilas ocorreram há ~3 dias. Sábado continua template leve; domingo entra no pipeline.
2. **Dias de plantão — nova regra da paciente (revoga a "manutenção" aprovada antes pela equipe):**
   - 2a · Véspera de noturno (entra às 18h) = dia normal de estudo começando mais tarde. Em `buildShiftDay`, ramo `kind === "noite"`: prepor SONO "😴 Acordar mais tarde (~09h) — você entra no plantão às 18h e vira a noite" (time "—"); manter todos os blocos de estudo; bloco 🌙 final "…encerre os blocos até ~17h · saída ~17h15"; nenhum texto tratando o dia como leve; academia mantida.
   - 2b · Pós-noturno (chega às 07h) = dia de estudo com o sono como bloco inegociável antes. SONO no topo com "😴 Chegando (~07h): dormir até ~13h — bloco inegociável. Depois, dia de estudo normal: comece pelo mais pesado" (time "6h"). Sem linguagem de "manutenção"; blocos do template ficam e valem.
   - 2c · `STUDY_WARN_POSTNIGHT_H = 5`: o selo 📚 dispara em 5h de estudo nos dias pós-noturno (janela desperta ~13h–22h) — sinal para mover o excedente, não freio.
   - 2d · Academia no pós-noturno continua ausente (veto 🏃 + 😴 mantido; a paciente autorizou estudo, não treino). Sinalizar se ela quiser rever.
   - Testado: 20/09 e 05/10 (vésperas), 21/09 e 06/10 (pós-noturno), 15/12 (ainda CATCHUP), 16–22/12 (1ª semana do pipeline) e 23–29/12 (pipeline completo com a semana anterior).
3. **Regra de trabalho** (§17): antes de cada mudança, a linha "membro + evidência" (sem membro que a peça → sugestão); antes de entregar, passagem pelos oito membros; conflitos apresentados, não decididos; nunca alteração silenciosa — registrada em §17.

### F · CATCHUP (25/11+) é PROVISÓRIO — distribuição escolhida na auditoria de 13/09
Sem ambulatório e sem aula da faculdade (decisões da paciente). Fio A = qua (aula) → qui (questões) → sáb (apostila, desde 24/09); Fio B = dom (aula) → seg (questões) → ter (apostila); sábado = template leve (Anki + PLAN); selagem do Fio A na terça e do Fio B na sexta sem simulado (com simulado, desliza para o domingo); academia livre em 6 dias (sábado sem); simulados quinzenais na sexta (o Fio A apostila fica no dia — o 📚 avisa; se não der, domingo). O dia sem Venvanse segue a regra geral (decisão 15). Trocar quando a nova grade chegar.

### B · RESOLVIDO — DOM sem simulado tem apostila do B (erros de sexta) + fios; com simulado tem aula B + D2-B + apostila do A. Testado.

### C · RESOLVIDO — plantões preservam blocos e fios (buildShiftDay não-destrutivo). Testado em 09/10, 10/10, 11/10, 20/09, 21/09, 07/10 e, na grade de 14/09, 28/09 (pós-noturno simples), 29/09 (terça normal), 05/10 (🌙 PM04) e 06/10 (😴 + aula 19h30).

### D · Ritmo 4 — RESOLVIDO no PR #5 (P5)
Com `catchupPace=4`, o Fio 4 recebe a aula na TER e continua na semana seguinte como "Fio 4 (sem. passada)": questões na QUA, apostila na QUI, selagem no DOM (+3d). O P1 impede que ele seja re-sorteado como fio novo e o aviso ⚠️ da semana diz quando o ritmo não cabe (sugere Z e oferece o botão). O seletor continua com 1–4: a paciente escolhe, o app informa.

### H · Auditoria de cobertura (15/09) — PR #5
Achados corrigidos: selagem dos fios era um bloco compartilhado 7–9 dias após a apostila (→ P2); Fio 4 sumia na semana seguinte (→ P1/P5a); Bloco B tinha apostila e banco no mesmo dia em semana de simulado (→ P3); textos do DOM de simulado sem "1.5x + resumo"/"Anki dos erros" (→ P4); A/B sem selagem própria (→ P6); ritmo 4 não cabe sem aviso (→ P5b); CATCHUP prometia 4 fios e agendava 2 (→ P7); sexta de plantão sem botão de simulado (→ P8). AMB (encerrada) só registrada. Sinalizações aceitas pela equipe (15/09), sem ação: no ritmo 2 a SEX do POST fica em ~8,4h (📚) por causa da selagem do Fio 2; semana de simulado não cabe em ritmo nenhum (o aviso diz, com a linha extra e o botão "Aplicar ritmo 1"); em semana de simulado o banco B (D6) e a selagem A/B caem na mesma terça, banco antes (trade-off conhecido: 7,8h no ritmo 4, mover geraria cascata pior); sem checks, o fio se repete e a selagem aparece pelo snapshot (os checks são o contrato, a 1 toque). Corrigido: **fronteira de fase** — a 1ª semana da CATCHUP sela os fios fechados no fim do POST (+3d, `fioPrevBlocksFor`, sem o "Selar o Fio A/B da semana passada" do template) e a 1ª semana da FREE sela o Fio B da última semana da CATCHUP na sexta (📚 nenhuma etapa fica órfã · ⚙️ a transição de template não perde estado).

### I · Auditoria de rastreabilidade (15/09) — PR #5
O cronograma não marcava nada no progresso (o ✓ do bloco era só visual). Corrigido: T1 (tarefa marcável no bloco: 1 toque), T2 (bloco reflete o card), T3 (`accSelagem` calibra o D+7), T5 (% na Desatraso), T6 (rótulos), T7 (% do simulado). Recusado: T4 (registro do banco sem uso no motor — 🧩 veta trabalho cognitivo sem retorno). Campo único `aula` para presencial e online (decisão 15/09).

### J · Bugs relatados pela paciente (24/09) — PR #6
1. **Presencial e 1.5x no mesmo check** → campo `aulaPresencial` (complementar) separado de `aula`; rótulos "Aula presencial ✓" × "Aula 1.5x + resumo (toque 1) ✓"; 08/10 marca `aula`; fios só `aula`; dados antigos válidos.
2. **Módulo selado continuava ocupando a semana** → causa: snapshot `fioWeek` + blocos por posição sem olhar o estado; correção: bloco de fio com tarefa feita é omitido em dias futuros (§11). Junto veio a **redistribuição avisada** (§11), que só mexe com "Aplicar".
3. **Sinalizações do PR #6 decididas pela paciente (24/09):** (1) 1.5x não marcada não bloqueia o fio — mantido; (2) carga dos dias da semana seguinte agora é avaliada com o mesmo limiar e a proposta avisa "⚠️ [dia] ficará em X,Xh" — corrigido (§11); (3) fio extra entra em MATÉRIAS DESTA SEMANA — corrigido (§11); (4) **sem migração**: presenças marcadas no check `aula` entre o PR #5 e o PR #6 ficam como estão (o campo `aulaPresencial` só vale daqui em diante; se quiser, ela desmarca `aula` à mão e marca "Aula presencial ✓"); (5) sugestão só na semana corrente (o espaço liberado é de agora) — aceito como está.
4. **DECISÃO FINAL (24/09, PR #7) — a paciente decide se cabe, não o app:** revoga o veto por carga que o PR #6 ainda tinha (aula só em dia que coubesse; "nada cabe" quando nenhum cabia). Agora a sugestão só some por regra pedagógica ou pós-noturno; cada etapa proposta mostra a carga resultante do dia (⚠️ acima de 8h, também nas semanas seguintes); "Aplicar" sempre disponível e grava tudo de uma vez; preferência por dias abaixo do limiar mantida.
5. **Sinalizações do PR #7 decididas pela paciente (24/09):** (1) dia editado à mão recebia a proposta mas não o bloco → **corrigido**: a etapa entra na lista editada (e, num movimento, o bloco gerado sai do dia antigo se ainda tiver o texto original); (2) dias protegidos nas semanas à frente → **corrigido com o critério certo**: só o pós-noturno é proteção rígida; o dia leve (🌿/🌬️) de cada semana, calculado com a mesma regra, é a última preferência com aviso explícito; SÁB perdeu o tratamento especial (o `y % 7 === 3` de pular sábado saiu); (3) ordem 1→2→3 mantida mesmo em dia ⚠️ — aceito sem mudança. **Reportado, não decidido:** os templates G2/POST nascem com o SÁB quase vazio (Anki + PLAN + LAZER, 0,8h), então `lightDayFor` o escolhe sempre que ele é livre (a regra é menor carga estrita; SÁB só ganha o desempate); quando o SÁB tem plantão datado ele é excluído e o dia leve vai para o menor dos outros (na bateria: QUI 10/09 6,0h, TER 22/09 4,1h, QUI 24/09 6,0h, TER 29/09 7,8h, DOM 04/10 5,8h, TER 13/10 4,3h; com os 3 dias livres editados acima de 8h, 🌬️ respiro na TER 13/10 8,5h); outro dia só vence o SÁB livre se ficar abaixo de 0,8h, o que não acontece nos templates — a paciente decide se o SÁB deixa de nascer vazio.
6. **Decisões de 24/09 (PR #8):** (1) sábado útil na G2/POST (decisão 36) — dia leve por semana na bateria, ritmo 2 / 4: 16/09 TER / TER · sim 23/09 QUI / TER (🌬️ 7,8h) · 30/09 DOM / DOM · sim 07/10 TER / TER · 14/10 DOM / TER · sim 21/10 SÁB / SÁB · 28/10 DOM / TER · sim 04/11 SÁB / SÁB (sábados de plantão 19/09, 26/09, 03/10 e 10/10 excluídos do cálculo); (2) dia leve depois dos dias com ⚠️ nas passadas da sugestão; plantão diurno como candidato comum com "+ plantão" aprovado.
7. **Decisões de 24/09 (PR #9) — nenhum dia livre nasce vazio:** (1) o domingo tinha ficado com 2,3h no ritmo 2 (só Anki + Fio 2 · aula) e virava o dia leve automático por vazio estrutural → rebalanceamento: Fio 1 qui→sáb→dom (o domingo ganha a apostila do Fio 1), banco B da segunda para a terça em todas as semanas (+3d da apostila do B, como o banco A na segunda), revisão adaptativa da segunda para o domingo fora de semana de simulado. Cargas no ritmo 2 (POST): SÁB 4,8 · DOM 4,5 · SEG 4,6 · TER 4,6 · SEX 6,5 · QUI 6,0 — diferenças de minutos entre SÁB/DOM/SEG/TER; o dia leve passa a ser decidido por esses minutos (DOM 4,53h contra SEG/TER 4,58h nas semanas normais do ritmo 2; SEG no ritmo 4; SÁB nas semanas de simulado; QUI/SEX/TER na G2 conforme a faculdade e os plantões). (2) CATCHUP: Fio A fecha no sábado (apostila, +2d das questões) com "temas fracos" e PLAN; a sexta fica com a selagem do B e o caderno de erros (2h); cargas 3,3–4,0h em todos os dias. (3) FREE: pipeline de 7 fios (Fio 1..7 = QUA..TER), sábado incluído, com PLAN + backup no sábado; todos os dias ficam em 7,5h (SÁB 7,7h) — o dia leve cai no primeiro dia empatado (QUA) fora de semana de simulado: é resultado de uniformidade, não de esvaziamento (sinalizado). Regra geral registrada (decisão 37).

### E · Pendências que dependem da paciente (não código)
1. Nova grade de plantões pós-11/10 (provisório POST ativo enquanto não chega)
2. Marcar no app o que já estudou (cada check encurta a projeção)
3. Atualizar o protocolo .md com os redesenhos desta sessão (SÁB leve, DOM ativo, motor dinâmico)

---

## 15 · Como testar (ambiente Playwright)

```javascript
// Sempre mockar a data ANTES de navegar
const PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
import pw from '/home/claude/.npm-global/lib/node_modules/playwright/index.js';
// (no ambiente Claude Code web: require('/opt/node22/lib/node_modules/playwright'))

// Mock de data:
await page.addInitScript((dd) => {
    const F = new Date(dd + 'T12:00:00').getTime();
    const O = Date;
    class M extends O {
        constructor(...a) { a.length === 0 ? super(F) : super(...a); }
        static now() { return F; }
    }
    window.Date = M;
}, '2026-10-15');

// Bloquear rede (arquivo local):
await page.route('**/*', r => r.request().url().startsWith('file://') ? r.continue() : r.abort());

// Seed de localStorage:
await page.addInitScript((s) => {
    localStorage.setItem('medplanner_progress_v1', JSON.stringify(s));
}, { "1": { aula: true, questoesD2: true, completedAt: '2026-08-21', accD2: 85 } });

// Navegar para o arquivo:
await page.goto('file:///caminho/para/planner.html', { waitUntil: 'load' });
await page.waitForTimeout(1200); // aguardar React renderizar

// Tocar em aba por dia (código SEM acento):
// QUA, QUI, SEX, SAB, DOM, SEG, TER
```

**Emojis no Python:** sempre usar literais UTF-8, NUNCA escapes `\ud83c` (lone surrogates crasham). Salvaguarda: `h.encode("utf-16","surrogatepass").decode("utf-16")` antes de escrever.

---

## 16 · Decisões que NÃO devem ser revertidas

1. **Aula SEMPRE antes de questões/apostila** — em toda fase, em todo fio, no desatraso
2. **Sábado = template leve por construção** — **REVOGADO em 24/09 em todas as fases (decisões 36 e 37)**: o sábado é dia útil em G2/POST, CATCHUP e FREE; o dia SEM Venvanse é calculado (decisão 15)
3. **Domingo = sempre dia de estudo** (G2/POST: apostila do B + fios; FREE: fio do dia)
4. **Simulados são OPCIONAIS** — override por data, 2º toque apaga e volta à paridade
5. **Plantões datados substituem o template** — nunca acumular fios em dia de plantão de 13h
6. **Nada é apagado ao mover** — só o movimento é desfeito se cancelado
7. **Tempos dos fios:** aula 1.7h, questões 2h, apostila 1.5h (corrigidos, não reverter)
8. **Projeção honesta** — o horizonte de semanas cresce, meta 31/12 pode ultrapassar
9. **A aula conta SÓ pelo check da paciente** no app (`p.aula`) — não por inferência
10. **Backup antes de atualizar o site** — mesma URL no Netlify = dados intactos
11. **Plantão diurno:** Anki no trajeto (20min) e academia opcional; **dia pós-noturno SEM academia** (a regra de saúde vence a "plantão não é dia morto", que protege o ESTUDO)
12. **Colisão da presencial:** a gravada substitui as aulas 1.5x da semana toda (plural); o D2-B vem após um resumo rápido, nunca após nova exposição sem teste
13. **CATCHUP sem ambulatório Ter/Qui/Dom e sem aula da faculdade** — provisório até a nova grade; Fio A qua→qui→sáb (sábado útil desde 24/09), Fio B dom→seg→ter, selagem do A na terça e do B na sexta (domingo em semana de simulado)
14. **Flowtime × Pomodoro coexistem:** Flowtime governa a EXECUÇÃO; o planejador 60/10/35 só DIMENSIONA as aulas de desatraso
15. **Domingo sempre estudo; dia sem Venvanse calculado pela demanda** (menor carga entre os dias livres da semana), sem dia padrão desde 24/09 (menor carga estrita, pode cair em qualquer dia — na bateria: TER, QUI, DOM ou SÁB conforme a semana e o ritmo), override por semana (`config.lightDayOverrides`), validar com a psiquiatra — substitui "sábado = dia leve em todas as fases". **Dias pós-noturno nunca são candidatos** (veto 🧠, 14/09). **Semana sem dia leve (<8h) não tem pausa:** o menos pesado vira 🌬️ dia de respiro, COM Venvanse (🧠 + 💬, 14/09). **O domingo é candidato como os demais dias:** pode ser o dia sem remédio (quando é o de menor carga) ou dia ativo — decisão da equipe/paciente em cada semana pelo seletor, nunca por regra fixa (14/09)
16. **Após 11/10, sem aula da faculdade** — decisão fechada da paciente (14/09); a fase POST não recebe bloco de faculdade
17. **Colisão 08→09/10 confirmada** (14/09): gravada A+B na quinta; resumo rápido de 20min do Bloco B na sexta antes do D2-B
18. **Reta final em PIPELINE** (📚, 14/09): 1 fio novo por dia, sábado incluído (7 fios/semana desde 24/09); aula hoje → questões amanhã → apostila depois de amanhã → selagem ~3 dias depois em bloco próprio; 6 fios/semana congelados por `config.fioWeek`; FREE_START = quarta 16/12 (a terça 15/12 fecha o Fio B da CATCHUP)
19. **Dias de plantão — regra da paciente (14/09):** véspera de noturno = dia normal começando mais tarde (😴 ~09h, blocos completos, academia); pós-noturno = sono até ~13h como bloco inegociável (6h) + dia de estudo normal, 📚 em 5h, sem academia. Revoga a "manutenção"
20. **P1 (15/09, 📚 + ⚙️):** fio FECHADO (aula + questões + apostila) sai dos slots de fio; módulo com aula marcada e questões pendentes entra PRIMEIRO na semana seguinte; fios congelados por semana (`config.fioWeek`) em todas as fases ≥ G2
21. **P2 (📚):** selagem por fio, bloco próprio, ~3 dias após a apostila daquele fio — G2/POST na semana seguinte: Fio 1 → QUA · Fio 3 → QUI · Fio 2 → SEX · Fio 4 → DOM; substitui o bloco compartilhado da terça
22. **P3 (📚):** o D6-B vai da segunda para a terça — em semana de simulado desde 15/09 (D2-B dom → apostila seg → banco ter) e em todas as semanas desde 24/09 (+3d da apostila do B, banco antes da selagem)
23. **P4 (📚):** DOM de simulado diz "aula online Bloco B (1.5x) + resumo + D2-B (30q + caderno + Anki dos erros)"
24. **P5 (🧠/😴 + 📚 + 🧩):** ritmo 4 disponível, Fio 4 em cascata cruzada (questões QUA e apostila QUI seguintes) e aviso "⚠️ Ritmo N não cabe nesta semana (X dias acima de 8h · Y plantões). Sugestão: ritmo Z." com botão — nunca limitar o seletor a 3
25. **P6 (🩺 + 📚):** A/B ganham selagem própria na terça ("Selar A e B desta semana", 30min; +4d da apostila do A, +2d da do B); D5/D6 é a etapa 4 (banco), não selagem
26. **P7 (⚙️):** CATCHUP trava o ritmo em 2 com a nota "esta fase agenda 2 fios (A e B)"
27. **P8 (🩺 + ⚙️):** quinzena 26/09–09/10 sem simulado; o botão de override existe também nas sextas de plantão
28. **T1/T2 (🧩 + ⚙️):** marcar a etapa direto do bloco do dia (1 toque); bloco com módulo reflete o card (ida e volta); blocos sem módulo mantêm o ✓ manual; função única de gravação
29. **T3 (📚):** D+7 calibrado pelo % da SELAGEM (`accSelagem ?? accD2 ?? 7 dias`); 4º check renomeado "Selagem ✓" com a chave `smartcard` preservada; **T4 recusado** (sem `accBanco`; "registre o %" removido do D5/D6); **campo único `aula`** para presencial e online
31. **Fronteira de fase (📚 + ⚙️, 15/09):** a selagem olha os fios fechados na semana anterior independentemente da fase — 1ª semana da CATCHUP sela os fios do fim do POST (+3d) e fecha o Fio 4 cruzado; 1ª semana da FREE sela o Fio B da CATCHUP na sexta
32. **Semana de simulado que não cabe (🧠/😴 + 💬):** linha extra no aviso + botão "Aplicar ritmo 1"; banco B e selagem A/B na mesma terça aceitos como trade-off
30. **T5/T6/T7:** % também na aba Desatraso; rótulos "Aula (toque 1) ✓ · D2 · 30q (toque 2) ✓ · Apostila pelos erros (toque 3) ✓ · Selagem ✓"; `config.simResults` = % do simulado (acompanhamento, não calibração)
33. **BUG 1 (paciente, 24/09) — REVOGA a decisão de 15/09 do campo único:** `aulaPresencial` (complementar, fora dos 4 checks) para a presencial de quarta; `aula` = 1.5x + resumo, o único que libera questões e alimenta o motor; 08/10 (gravada) marca `aula`; fios só `aula`; rótulos inequívocos
34. **BUG 2 (paciente, 24/09):** etapa de fio já feita não ocupa dia ainda não vivido; o snapshot fica como histórico e o passado nunca é reescrito
35. **Redistribuição avisada (paciente, 24/09) + DECISÃO FINAL (24/09, PR #7 — a paciente decide se cabe, não o app):** a paciente decide, o app nunca mexe sozinho — aviso 🔄, "Ver sugestão" mostra a proposta e só "Aplicar" grava; ordem 1) adiantar etapa em andamento 2) abrir próximo fio pela aula 3) antecipar selagem 4) "nada cabe" **só por regra pedagógica** (ordem aula→questões→apostila, ≥1 dia entre etapas) **ou pós-noturno** — nunca por carga, e a ordem 1→2→3 não é invertida por carga; o limiar de 8h só ordena a preferência (dias que cabem primeiro; se nenhum, o 1º dia útil com ⚠️) e marca o custo de cada dia na proposta, inclusive nas semanas seguintes; **pós-noturno é a única proteção rígida** (razão: sono, não carga); **o dia leve de cada semana (🌿/🌬️) é a última preferência, depois dos dias com ⚠️** (passadas: dia normal que cabe → dia normal com ⚠️ → dia leve que cabe → dia leve com ⚠️; preservar o descanso vale mais que evitar um dia pesado — 24/09), sempre com aviso; **SÁB é um dia como os outros**; "Aplicar" sempre disponível e grava todos os toques de uma vez, inclusive na lista de um dia editado à mão; fio extra listado em MATÉRIAS DESTA SEMANA; sem migração de presenças antigas marcadas em `aula`
36. **Sábado útil na G2/POST (paciente, 24/09; rebalanceado no mesmo dia):** o sábado deixa de nascer vazio — recebe a apostila do B pelos erros de ontem (em semana de simulado, a do A), o Fio 1 · questões e, no ritmo ≥3, o Fio 3 · aula, mantendo PLAN + backup e sem academia; o domingo recebe o Fio 1 · apostila, o Fio 2 · aula e a revisão adaptativa (fora de semana de simulado); o banco B vai para a terça em todas as semanas (`FIO_PAT`: 1 qui→sáb→dom · 2 dom→seg→ter · 3 sáb→dom→seg · 4 ter→qua→qui). O dia leve é calculado de verdade (menor carga estrita, sem desempate do sábado). Selagens todas +3d.
37. **Regra geral (paciente, 24/09): nenhum template pode nascer com um dia sistematicamente mais vazio que os demais.** O dia leve é sempre um resultado do cálculo semanal, nunca uma escolha embutida na estrutura. Vale para G2/POST, CATCHUP (Fio A fecha no sábado; sexta com selagem do B + caderno de erros) e FREE (pipeline de 7 fios, sábado incluído). Um patch que reintroduza um dia pré-esvaziado viola esta decisão.

---

## 17 · Regras de patch seguro

1. Sempre `cp output.html build/planner.html` antes de editar
2. Escrever em `planner_new.html`, só fazer `mv` se o patch não abortar
3. Usar `rep(old, new, label, count)` com verificação de contagem
4. Deletar linhas por substring ESCOPADO à região (evitar vazamento)
5. Sondar bytes reais antes de deletar (memória de texto autoral falha)
6. Sempre rodar bateria Playwright antes de copiar para outputs
7. Sempre `cp planner.html /mnt/user-data/outputs/planner_residencia_2026_offline.html` E `index.html`
8. **Regra da equipe (obrigatória, `EQUIPE_MULTIDISCIPLINAR_REGRA_DE_DECISAO.md`):** antes de cada mudança, escrever em uma linha **qual membro a pede e com que evidência**; se nenhum pedir, não fazer — anotar como sugestão
9. Antes de entregar, passar a mudança pelos oito membros e verificar se **algum veta**; um veto não se negocia com "fica mais simples"
10. Se dois membros conflitarem, **não escolher sozinho**: apresentar o conflito e esperar decisão (padrão: segurança e sono vencem volume; aprendizagem vence conveniência de calendário; dados da paciente vencem elegância de código)
11. Decisão mais recente vence a antiga do mesmo tema; nunca restaurar modelo superado; nunca esconder inconsistência com alteração silenciosa — sinalizar, propor, esperar
