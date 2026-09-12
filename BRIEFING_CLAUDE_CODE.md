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
FREE_START    = "2026-12-15"   // reta final (1 fio/dia)
TOTAL_WEEKS   = 51             // piso; dynTW() cresce com a projeção
SIMULADO_ANCHOR = "2026-08-14" // 1ª sexta COM simulado (âncora quinzenal real)
```

---

## 3 · Fases do cronograma (cascata por prioridade em `schedFor`)

```
pré-03/08  → histórico (template antigo intacto, prova sáb, aula 18h20)
03/08–09/09 → AMB (plantão Ter/Qui/Dom 07h–17h — vale o que estava)
10/09–11/10 → G2 (grade real com plantões DATADOS — ver §6)
> 11/10     → POST (provisório: tudo livre, só Medcurso qua — até nova grade)
25/11–14/12 → CATCHUP (fios A/B, academia fixa, simulados)
15/12+      → FREE (1 fio/dia, domingo restaurado sem Venvanse)
```

**Cada fase tem seu próprio `WEEK_SCHEDULE_*`:** `WEEK_SCHEDULE_AMB`, `WEEK_SCHEDULE_G2`, `WEEK_SCHEDULE_POST`, `WEEK_SCHEDULE_CATCHUP`, `WEEK_SCHEDULE_FREE`.

---

## 4 · A cascata semanal (fase G2/POST — o coração do cronograma)

Esta é a distribuição **correta e validada pela equipe**. Não alterar sem revisar as evidências:

| Dia | O que acontece | Por quê (evidência) |
|---|---|---|
| **QUA (Dia 0)** | 10q pré-aula (priming) + **aula presencial A e B** (17h–22h) + D+1 relâmpago | Pretesting (Kornell 2009); gatilho da semana |
| **QUI (Dia 1)** | **Aula online Bloco A (1.5x) → D2-A (30q) no mesmo dia** + Fio 1 e 2 (motor dinâmico) | Testing effect a 1 dia da presencial (Roediger 2006) |
| **SEX (Dia 2)** | **Aula online Bloco B → D2-B (30q)** + **Apostila do A pelos erros de ontem** | Erro→releitura em 24h; prática distribuída (Cepeda 2006) |
| **SÁB (Dia 3)** | **DIA LEVE — SEM Venvanse** (Anki 30min + PLAN) | Reset dopaminérgico após arco qui+sex; domingo descansado vira dia ativo pleno |
| **DOM (Dia 4)** | **Dia ATIVO** (com remédio): Apostila do B + Fio 1 apostila + Fio 2 questões + gym | Descansado pelo sábado; alimenta a segunda |
| **SEG (Dia 5)** | Banco A+B + smartcards (D5/D6) + Fio 2 apostila/Fio 3 aula | 2ª recuperação espaçada |
| **TER (Dia 6)** | Selar fios da semana passada + Fio 1 aula + revisão + faculdade 19h (até 11/10) | Selagem = re-recuperação pós-critério (Rawson 2011) |

**ATENÇÃO — inconsistência detectada e PENDENTE de correção:**
O sábado nos templates G2/POST mostra a venv "DIA LEVE — SEM Venvanse" mas a probe revelou que o **card de Estrutura/briefing da semana** que aparece logo abaixo menciona apostilas e pode confundir quem olha o texto bruto. Os blocos de ATIVIDADE do sábado estão corretos (só Anki + PLAN). O card de Estrutura é informativo, não é atividade.

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
"2026-09-28": { label: "CZ50 · Base Cajazeiras", hours: "18h–07h", kind: "noite" },
"2026-10-03": { label: "CRU", hours: "06h–19h", kind: "dia" },
"2026-10-07": { label: "CRL · SUREM", hours: "06h–19h", kind: "dia" },
"2026-10-09": { label: "PM40 · Base Pau Miúdo", hours: "06h–19h", kind: "dia" },
"2026-10-10": { label: "CRU", hours: "06h–19h", kind: "dia" },
"2026-10-11": { label: "SM01 · Base San Martin", hours: "06h–19h", kind: "dia" },
```

**Regras dos plantões (REGRA DA PACIENTE: plantão NÃO é dia morto):**
- `buildShiftDay` é **NÃO-DESTRUTIVO**: mantém TODOS os blocos do dia (cascata A/B, fios, gym) e ACRESCENTA o bloco do plantão. O ⚠️ (tempo hábil >14,5h) e o 📚 (estudo >8h) avisam; a paciente move o que não der.
- Diurno 13h: bloco 🚑 no topo + blocos do dia + fechamento "dormir ~21h45"
- Noturno (dia de saída): blocos do dia + bloco 🌙 no fim ("encerre até ~17h")
- Dia seguinte a noturno: bloco 😴 (dormir até ~12h30) no topo + blocos do dia mantidos
- Sanduíche (27→28/09): 😴 até ~13h + blocos + 🌙 Cajazeiras (o ⚠️ dispara; ela decide)
- Colisão com AULA presencial (07/10): o bloco da aula vira aviso "vista AMANHÃ, online"; 08/10 recebe a presencial gravada (A+B) no lugar da 1.5x
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
const PROJ_PACE = { amb: 1, g2: __PACE, catchup: 2, free: 4 };
// __PACE é alimentado pelo seletor de ritmo (1–4) na aba Desatraso
// dynTW() cresce para cobrir a projeção além de TOTAL_WEEKS
// Meta: 31/12/2026, pode ultrapassar
```

---

## 11 · Aviso de tempo hábil (sobrecarga)

```javascript
const DAY_CAP_H = 14.5; // 24h − 8h sono − 1h30 refeições
```
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
| SÁB = DIA LEVE sem Venvanse | ✅ |
| DOM = Dia ATIVO com remédio | ✅ |
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

---

## 14 · Inconsistências CONHECIDAS / pendentes de correção

### A · SÁB — venv não aparece na probe (falso-positivo corrigido, mas confirmar)
O teste Playwright verifica `innerText` de toda a página, que inclui o card de Estrutura (que descreve a semana e menciona "apostilas"). Os blocos de ATIVIDADE do sábado estão corretos (só Anki + PLAN + LAZER). Confirmar visualmente no navegador.

### B · RESOLVIDO — DOM sem simulado tem apostila do B (erros de sexta) + fios; com simulado tem aula B + D2-B + apostila do A. Testado.

### C · RESOLVIDO — plantões preservam blocos e fios (buildShiftDay não-destrutivo). Testado em 09/10, 10/10, 11/10, 20/09, 21/09, 07/10.

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
2. **Sábado = dia leve SEM Venvanse** (não domingo; o argumento é o arco qui+sex + domingo ativo alimenta a segunda)
3. **Domingo = dia ATIVO** com remédio, apostila do B + fios
4. **Simulados são OPCIONAIS** — override por data, 2º toque apaga e volta à paridade
5. **Plantões datados substituem o template** — nunca acumular fios em dia de plantão de 13h
6. **Nada é apagado ao mover** — só o movimento é desfeito se cancelado
7. **Tempos dos fios:** aula 1.7h, questões 2h, apostila 1.5h (corrigidos, não reverter)
8. **Projeção honesta** — o horizonte de semanas cresce, meta 31/12 pode ultrapassar
9. **A aula conta SÓ pelo check da paciente** no app (`p.aula`) — não por inferência
10. **Backup antes de atualizar o site** — mesma URL no Netlify = dados intactos

---

## 17 · Regras de patch seguro

1. Sempre `cp output.html build/planner.html` antes de editar
2. Escrever em `planner_new.html`, só fazer `mv` se o patch não abortar
3. Usar `rep(old, new, label, count)` com verificação de contagem
4. Deletar linhas por substring ESCOPADO à região (evitar vazamento)
5. Sondar bytes reais antes de deletar (memória de texto autoral falha)
6. Sempre rodar bateria Playwright antes de copiar para outputs
7. Sempre `cp planner.html /mnt/user-data/outputs/planner_residencia_2026_offline.html` E `index.html`
