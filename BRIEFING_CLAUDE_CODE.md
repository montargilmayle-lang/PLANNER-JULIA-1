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
25/11–14/12 → CATCHUP (PROVISÓRIO — nova grade pendente: dias livres, Fio A qua→qui→sex, Fio B sáb→dom→seg, selagem ter, academia livre, simulados)
16/12+      → FREE em PIPELINE: cada dia livre = aula do fio de hoje + questões do de ontem + apostila do de anteontem + selagem do de há ~5 dias (6 fios/semana, Fio 1..6 = QUA·QUI·SEX·DOM·SEG·TER; sábado = template leve)
```

**Cada fase tem seu próprio `WEEK_SCHEDULE_*`:** `WEEK_SCHEDULE_AMB`, `WEEK_SCHEDULE_G2`, `WEEK_SCHEDULE_POST`, `WEEK_SCHEDULE_CATCHUP`, `WEEK_SCHEDULE_FREE`.

---

## 4 · A cascata semanal (fase G2/POST — o coração do cronograma)

Esta é a distribuição **correta e validada pela equipe**. Não alterar sem revisar as evidências:

| Dia | O que acontece | Por quê (evidência) |
|---|---|---|
| **QUA (Dia 0)** | 10q pré-aula (priming) + **aula presencial A e B** (17h–22h) + D+1 relâmpago | Pretesting (Kornell 2009); gatilho da semana |
| **QUI (Dia 1)** | **Aula online Bloco A (1.5x) → D2-A (30q) no mesmo dia** + **Fio 1 · aula** | Testing effect a 1 dia da presencial (Roediger 2006) |
| **SEX (Dia 2)** | **Aula online Bloco B → D2-B (30q)** + **Apostila do A pelos erros de ontem** + Fio 1 · questões (ritmo ≥3: + Fio 3 · aula) | Erro→releitura em 24h; prática distribuída (Cepeda 2006) |
| **SÁB (Dia 3)** | **DIA LEVE (template)**: Anki 30min + PLAN — sem fios. O dia **sem Venvanse** é o selo 🌿 calculado pela menor carga entre os dias livres (sábado por padrão; override por semana) | Reset dopaminérgico no dia de menor demanda; domingo é sempre dia de estudo |
| **DOM (Dia 4)** | **Dia ATIVO** (domingo é sempre dia de estudo): Apostila do B + Fio 1 · apostila + Fio 2 · aula (ritmo ≥3: + Fio 3 · questões) + gym | Descansado pelo sábado; alimenta a segunda |
| **SEG (Dia 5)** | Banco A+B + smartcards (D5/D6) + Fio 2 · questões (ritmo ≥3: + Fio 3 · apostila) | 2ª recuperação espaçada |
| **TER (Dia 6)** | Selar os fios FECHADOS na semana passada + Fio 2 · apostila (ritmo 4: + Fio 4 · aula, que continua na semana seguinte) + faculdade 19h30–21h (até 11/10) | Selagem = re-recuperação pós-critério (Rawson 2011) |

*Tabela reescrita em 13/09 a partir do `FIO_PAT` vigente (§5). Em semana de simulado: SEX = prova + correção; DOM = aula B + D2-B + apostila do A; SEG = + apostila do B.*

**RESOLVIDO (12/09):** o card de Estrutura dizia "Sex+Sáb (A sex · B sáb)" — corrigido para "Sex+Dom"; o card ACADEMIA passou a ler a lista real de cada dia (sábado leve sem treino, domingo com treino, pós-noturno sem treino, plantão diurno "opcional").

---

## 5 · Motor de fios dinâmico (FIO_PAT)

```javascript
const FIO_PAT = [
    [[1, "aula"], [2, "quest"], [4, "apost"]],   // Fio 1: aula=QUI, q=SEX, a=DOM
    [[4, "aula"], [5, "quest"], [6, "apost"]],   // Fio 2: aula=DOM, q=SEG, a=TER
    [[2, "aula"], [4, "quest"], [5, "apost"]],   // Fio 3: aula=SEX, q=DOM, a=SEG
    [[6, "aula"]],                                // Fio 4: aula=TER; toques 2–3 na semana seguinte (o app retoma pelo check da aula)
];
// Rebalanceado para o ritmo 4: evita empilhar aulas na sexta/segunda. Com ritmo 4 a sexta chega a ~9,5h de estudo
// e o selo 📚 (>8h) avisa — é o mecanismo que identifica quando o ritmo não cabe.
// dayIdx: 0=QUA, 1=QUI, 2=SEX, 3=SÁB, 4=DOM, 5=SEG, 6=TER
```

**Tempos dos fios (validados pela equipe):**
- Aula: **1.7h**
- Questões: **2h** (padrão da paciente: 2h/30q — corrigido de 1.5h)
- Apostila: **1.5h** (corrigido de 1.2h)
- Total por fio: ~5.2h + selagem = **≈5.9h/módulo** (dentro do padrão 5–6h da equipe)

**Selagem (terça-feira):** `fioBlocksFor(dayIdx=6)` injeta o bloco de selagem antes dos fios:
> "Selar os fios FECHADOS na semana passada: 10 questões + smartcards + os 4 checks por módulo — o % agenda as revisões D+7/D+30"

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
- **Sexta de plantão = sem simulado por padrão** (`DATED_SHIFTS[fri] ? false : paridade`), salvo override manual
- NUNCA voltar ao modelo antigo em que o plantão substituía o dia inteiro

---

## 7 · Simulados (quinzenais, opcionais)

- Âncora: **14/08/2026** (primeira sexta COM simulado — informado pela paciente)
- Ciclo de **09/10 pulado** (fim de semana com 3 plantões) — retoma 23/10
- Paridade: `((diffDays(SIMULADO_ANCHOR, fri) % 14) + 14) % 14 === 0`
- **Override por sexta:** `config.simOverrides[isoSexta]` = true/false (2º toque apaga → volta à paridade)
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
function r1Interval(p) {
    const a = p && p.accD2;
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

- Campo `accD2` aparece no card do módulo quando D2 está marcado
- Ao tocar "Revisei" num alerta, campo de % abre para capturar `accR1` ou `accR2`
- Reset de módulo limpa: `reviewD7Done, reviewD30Done, reviewR3Done, r1DoneAt, r2DoneAt, accR1, accR2`

---

## 9 · Desatraso — fila e pins

- **catchupQueue:** módulos com `week < semanaAtual` e incompletos, ordenados por recência (mais antigo primeiro)
- **effectiveTargets(queue, n):** pins primeiro + automáticos completam até n
- **Pins (📌):** `config.catchupPins` = array de IDs fixados; toggle no botão de cada linha da fila
- **catchupForDay(dayIdx):** retorna o alvo do fio para aquele dia conforme a fase
- **resolveBlock(text):** injeta o módulo real no bloco genérico:
  - `/Fio (\d+)/` → `targets[n-1]`
  - `/2º bloco antigo/` → `targets[1]`
  - senão → `catchupForDay(activeIdx)`

---

## 10 · Projeção de zeramento (dinâmica)

```javascript
const PROJ_PACE = { amb: 1, g2: __PACE, catchup: 2, free: 6 }; // free: o pipeline abre 6 fios/semana
// __PACE é alimentado pelo seletor de ritmo (1–4) na aba Desatraso (setPaceCfg ANTES de setDynTW no render do App)
// dynTW() cresce para cobrir a projeção além de TOTAL_WEEKS
// Meta: 31/12/2026, pode ultrapassar
// Fonte ÚNICA: projectedZeroISO(progress) alimenta o planejador E o card "RITMO E PREVISÃO" (mesmo texto de data);
// o rodapé mostra "ritmo atual: __PACE/sem". Não existe mais o cálculo remaining/pace uniforme.
```

---

## 11 · Aviso de tempo hábil (sobrecarga)

```javascript
const DAY_CAP_H = 14.5; // 24h − 8h sono − 1h30 refeições
```
- `lightDayFor()` (Schedule): dia SEM Venvanse da semana visível = menor `studyHours(listFor(dayIdx))` entre os candidatos (7 dias menos a quarta com presencial `iso <= "2026-11-24"`, dias com `DATED_SHIFTS`, dias PÓS-NOTURNO (`DATED_SHIFTS[addDaysISO(iso,-1)].kind === "noite"` — veto 🧠: pausa + privação de sono + compromisso noturno) e a sexta quando `isSim`); empate → sábado; menor carga > `STUDY_WARN_H` → o menos pesado vira DIA DE RESPIRO (`breather: true`; selo 🌬️ âmbar "Dia de respiro — o mais leve da semana. COM Venvanse…", sem texto de pausa); `null` só quando não há candidato. O selo 🌿 só aparece quando há dia realmente leve; a escolha manual é sempre "sem remédio" (dela), com selo de validação. O domingo NÃO é excluído dos candidatos: pode ser o dia sem remédio ou dia ativo, a critério da equipe em cada semana (14/09). Override: `config.lightDayOverrides[isoDaQuarta] = dayIdx` (ponte `__LIGHT_SAVE`). UI: seletor `🌿 Sem remédio: [Auto · SÁB] ▾` acima das abas dos dias + selo no cabeçalho do dia escolhido. O selo não altera blocos; semanas totalmente anteriores a 10/09 não mostram o seletor.
- `STUDY_WARN_POSTNIGHT_H = 5`: no dia pós-noturno o selo 📚 dispara em 5h de estudo (em vez de 8h)
- Reta final: `weekFioIds(config, progress, wk, startISO)` devolve os 6 fios da semana — snapshot `config.fioWeek[isoDaQuarta]` gravado pelo App (useEffect) na 1ª renderização da semana corrente, senão cálculo vivo. `resolveBlock` resolve "Fio N" e "Fio N (sem. passada)" por esse snapshot; a 1ª semana do pipeline omite os blocos "(sem. passada)"
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
| SÁB = template leve por construção (G2/POST/CATCHUP/FREE) | ✅ |
| DOM = sempre dia de estudo (FREE: recebe o fio do dia) | ✅ |
| Dia sem Venvanse calculado por semana (lightDayFor: menor carga entre dias livres, sábado no empate; override config.lightDayOverrides; selo 🌿) | ✅ |
| Pós-noturno nunca é candidato ao dia sem Venvanse (veto 🧠, 14/09) | ✅ |
| Semana sem dia leve → 🌬️ dia de respiro COM Venvanse (o mais leve), sem pausa (🧠 + 💬, 14/09) | ✅ |
| Card ACADEMIA: "1 treino em 6 dos 7 dias · sem treino no dia pós-noturno"; dia sem treino = "sem treino" (não "descanso") | ✅ |
| Após 11/10 sem aula da faculdade — decisão fechada (14/09) | ✅ |
| FREE em pipeline (aula hoje · questões ontem · apostila anteontem · selagem em bloco próprio), 6 fios/semana congelados por `config.fioWeek` (PR #4) | ✅ |
| FREE_START = quarta 16/12; PROJ_PACE.free = 6 (PR #4) | ✅ |
| Véspera de noturno = dia normal começando mais tarde (😴 ~09h); pós-noturno = sono até ~13h inegociável + estudo real; 📚 em 5h no pós-noturno; academia ausente no pós-noturno (4a–4d, PR #4) | ✅ |
| Regra de trabalho da equipe registrada em §17 (PR #4) | ✅ |
| Colisão 08→09/10 confirmada pela paciente (14/09) | ✅ |
| Seletor de ritmo 1–4 na aba Desatraso | ✅ |
| Projeção pace-aware (__PACE) | ✅ |
| Tempos: aula 1.7h, questões 2h, apostila 1.5h | ✅ |
| Selagem dos fios na terça | ✅ |
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
| CATCHUP provisório: sem ambulatório Ter/Qui/Dom, sem aula da faculdade; Fio A qua→qui→sex, Fio B sáb→dom→seg, selagem ter (C4) | ✅ |
| Card RITMO E PREVISÃO = projectedZeroISO (fonte única) + "ritmo atual" no rodapé (S2/S3) | ✅ |
| Planejador: subtítulo "Dimensionamento apenas — na execução, siga o Flowtime" (C6); ritmo 1 mostra 1 fio (S6) | ✅ |
| Rótulo "D2 (30q por bloco)" (S4) · dica véspera de plantão 06h na aba Sono (S5) · "bloco antigo" nos fios CATCHUP/FREE (S1) | ✅ |
| Cards Estrutura ("Sex+Dom") e ACADEMIA (lista real do dia); venv SEG/TER sem "Fio A/B"; fios da TER antes da faculdade | ✅ |

---

## 14 · Inconsistências CONHECIDAS / pendentes de correção

### A · RESOLVIDO (12/09) — card de Estrutura corrigido ("Sex+Dom"); blocos do sábado confirmados visualmente (só Anki + PLAN + LAZER; nos plantões, + 🚑 e lazer específico)

### G · IMPLEMENTADO no PR #4 (decisões da equipe e da paciente em 14/09 — o desenho abaixo é o que está no código)
1. **FREE em pipeline (📚 tem razão; ritmo mantido):** 1 fio novo por dia, toques escalonados entre dias — cada dia livre contém a AULA do fio de hoje, as QUESTÕES do fio de ontem e a APOSTILA do fio de anteontem (1 dia + uma noite de sono entre exposição e teste; feedback do erro em ~24h). A selagem sai desse bloco e vira bloco próprio, fechando os fios cujas apostilas ocorreram há ~3 dias. Sábado continua template leve; domingo entra no pipeline.
2. **Dias de plantão — nova regra da paciente (revoga a "manutenção" aprovada antes pela equipe):**
   - 2a · Véspera de noturno (entra às 18h) = dia normal de estudo começando mais tarde. Em `buildShiftDay`, ramo `kind === "noite"`: prepor SONO "😴 Acordar mais tarde (~09h) — você entra no plantão às 18h e vira a noite" (time "—"); manter todos os blocos de estudo; bloco 🌙 final "…encerre os blocos até ~17h · saída ~17h15"; nenhum texto tratando o dia como leve; academia mantida.
   - 2b · Pós-noturno (chega às 07h) = dia de estudo com o sono como bloco inegociável antes. SONO no topo com "😴 Chegando (~07h): dormir até ~13h — bloco inegociável. Depois, dia de estudo normal: comece pelo mais pesado" (time "6h"). Sem linguagem de "manutenção"; blocos do template ficam e valem.
   - 2c · `STUDY_WARN_POSTNIGHT_H = 5`: o selo 📚 dispara em 5h de estudo nos dias pós-noturno (janela desperta ~13h–22h) — sinal para mover o excedente, não freio.
   - 2d · Academia no pós-noturno continua ausente (veto 🏃 + 😴 mantido; a paciente autorizou estudo, não treino). Sinalizar se ela quiser rever.
   - Testado: 20/09 e 05/10 (vésperas), 21/09 e 06/10 (pós-noturno), 15/12 (ainda CATCHUP), 16–22/12 (1ª semana do pipeline) e 23–29/12 (pipeline completo com a semana anterior).
3. **Regra de trabalho** (§17): antes de cada mudança, a linha "membro + evidência" (sem membro que a peça → sugestão); antes de entregar, passagem pelos oito membros; conflitos apresentados, não decididos; nunca alteração silenciosa — registrada em §17.

### F · CATCHUP (25/11+) é PROVISÓRIO — distribuição escolhida na auditoria de 13/09
Sem ambulatório e sem aula da faculdade (decisões da paciente). Fio A = qua (aula) → qui (questões) → sex (apostila); Fio B = dom (aula) → seg (questões) → ter (apostila); sábado = template leve (Anki + PLAN); selagem do Fio A na terça e do Fio B na sexta sem simulado (com simulado, desliza para o domingo); academia livre em 6 dias (sábado sem); simulados quinzenais na sexta (o Fio A apostila fica no dia — o 📚 avisa; se não der, domingo). O dia sem Venvanse segue a regra geral (decisão 15). Trocar quando a nova grade chegar.

### B · RESOLVIDO — DOM sem simulado tem apostila do B (erros de sexta) + fios; com simulado tem aula B + D2-B + apostila do A. Testado.

### C · RESOLVIDO — plantões preservam blocos e fios (buildShiftDay não-destrutivo). Testado em 09/10, 10/10, 11/10, 20/09, 21/09, 07/10 e, na grade de 14/09, 28/09 (pós-noturno simples), 29/09 (terça normal), 05/10 (🌙 PM04) e 06/10 (😴 + aula 19h30).

### D · Ritmo 4 no planejador
Com `catchupPace=4`, o Fio 4 só recebe aula (SEG) e questões (TER) nesta semana — a apostila vem na próxima semana. O bloco já avisa: "apostila deste fio abre na próxima semana". Isso é correto e aceito.

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
2. **Sábado = template leve por construção** (Anki + PLAN) em G2/POST/CATCHUP/FREE — o dia SEM Venvanse é calculado (decisão 15)
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
13. **CATCHUP sem ambulatório Ter/Qui/Dom e sem aula da faculdade** — provisório até a nova grade; sábado = template leve, Fio B dom→seg→ter, selagem do A na terça e do B na sexta (domingo em semana de simulado)
14. **Flowtime × Pomodoro coexistem:** Flowtime governa a EXECUÇÃO; o planejador 60/10/35 só DIMENSIONA as aulas de desatraso
15. **Domingo sempre estudo; dia sem Venvanse calculado pela demanda** (menor carga entre os dias livres da semana), sábado por padrão, override por semana (`config.lightDayOverrides`), validar com a psiquiatra — substitui "sábado = dia leve em todas as fases". **Dias pós-noturno nunca são candidatos** (veto 🧠, 14/09). **Semana sem dia leve (<8h) não tem pausa:** o menos pesado vira 🌬️ dia de respiro, COM Venvanse (🧠 + 💬, 14/09). **O domingo é candidato como os demais dias:** pode ser o dia sem remédio (quando é o de menor carga) ou dia ativo — decisão da equipe/paciente em cada semana pelo seletor, nunca por regra fixa (14/09)
16. **Após 11/10, sem aula da faculdade** — decisão fechada da paciente (14/09); a fase POST não recebe bloco de faculdade
17. **Colisão 08→09/10 confirmada** (14/09): gravada A+B na quinta; resumo rápido de 20min do Bloco B na sexta antes do D2-B
18. **Reta final em PIPELINE** (📚, 14/09): 1 fio novo por dia livre; aula hoje → questões amanhã → apostila depois de amanhã → selagem ~3 dias depois em bloco próprio; 6 fios/semana congelados por `config.fioWeek`; FREE_START = quarta 16/12 (a terça 15/12 fecha o Fio B da CATCHUP)
19. **Dias de plantão — regra da paciente (14/09):** véspera de noturno = dia normal começando mais tarde (😴 ~09h, blocos completos, academia); pós-noturno = sono até ~13h como bloco inegociável (6h) + dia de estudo normal, 📚 em 5h, sem academia. Revoga a "manutenção"

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
