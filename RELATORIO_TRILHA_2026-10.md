# Relatório — TRILHA AUTÔNOMA (26/10/2026 → 01/01/2027; transição 20–25/10)

Entregue antes do merge, como pedido ("bateria completa verde, `cmp` do `index.html`, PR sem merge e relatório antes"). Plano aprovado: *TRILHA AUTÔNOMA — substitui o cronograma do cursinho a partir de 20/10/2026*. Data do relatório: 20/10/2026. **Revisão de 26/10/2026: início adiado para 26/10 (pedido da paciente), com 20–25/10 de transição — §A.** As seções §0–§14 ficam como estavam (medidas com início em 20/10, decisões já tomadas); os números do plano vigente estão em §A.

## A · Início em 26/10 (pedido de 26/10/2026) — decisão 74

A paciente não iniciou em 20/10. A Trilha começa **hoje, SEG 26/10**, com a 1ª aula da fila (**CIR1 · Trauma I**) à tarde, depois do plantão curto 06h–12h; **a ordem da fila não muda** — tudo só desliza para começar hoje. Nada que é ancorado no calendário se desloca: plantões nas datas reais, simulados de 06/11 e 18/12, bloco 04h30 de 16/11 a 11/12, feriados de 3h (24, 25 e 31/12) e o encerramento em 01/01.

### A.1 · O que mudou (e como)

1. **`TRILHA_START = "2026-10-26"`.** A fronteira do histórico ganhou nome próprio: **`POS_CURSO = "2026-10-20"`** — o 1º dia depois do curso. Tudo o que era "fronteira do histórico / motor antigo desligado / registro do curso × da trilha / rótulo pela data" fica em 20/10 (por isso o histórico até 19/10 não muda uma vírgula); tudo o que é "etapa, cota, 1º acesso, revisão" passa a 26/10.
2. **Semana de 20/10 descartada** (migração ao carregar, revisada pela revisão adversarial — §A.11):
   - **Config:** todo `trilhaWeeks`/`trilhaPlan` feito no calendário antigo (inclusive Adiantar, 🔓 e uma semana de 27/10, se a versão anterior tiver sido aberta depois de hoje) e o `trilhaFirstOpen` antigo saem do plano e ficam em `config.trilhaDescartes` (nada é apagado — ⚙️). `trilhaFirstOpen` passa a ser o dia em que ela abre a versão nova (hoje, 26/10). Escolhas antigas de rampa ou dia leve que caíam dentro da T1 são levadas para a T1; as outras vão para `trilhaDescartes`.
   - **Dias gravados:** o original vai sempre para `medplanner_schedule_archive_v1`. Em 20–25/10 o dia vira transição e **ficam os ✓ dela e os blocos que ela criou** (ex.: uma consulta); a partir de 26/10, saem só as etapas do plano antigo e entram as do plano novo daquele dia.
   - **`trail_v1` não é tocado:** módulo com etapa marcada não reabre — se houvesse um começado, ele viria à frente da fila para continuar logo (📚 intervalos); módulo fechado não volta. Com os dados reais nada foi executado, então a fila é a mesma (5, 6, 14…).
   - Idempotente: abrir de novo não faz nada; um backup antigo importado é limpo de novo.
3. **20–25/10 = dias de transição.** **A forma mais limpa** (respondendo à pergunta): não um terceiro regime, e sim os dias pós-curso **sem etapa** — eles já estão do lado de cá da fronteira do histórico (motor antigo desligado desde 20/10), então basta que o gerador do dia da trilha tenha um ramo de transição que devolve só o **bloco do plantão** (quando há), **Anki**, **academia** e **lazer** (com a véspera), mais a nota **"🗓️ A trilha começa em 26/10 (segunda) — hoje sem etapa de módulo"**. Sem etapa, revisão, PLAN, 🌿, simulado (nem o botão na sexta 23/10). O painel da semana diz "SEMANA DE TRANSIÇÃO · 20/10–25/10 — a trilha começa na segunda 26/10 com o 1º módulo da fila", o selo diz "Transição" e a aba Trilha mostra "🗓️ Dias de transição (20/10–25/10) …". Nada é gravado da trilha nesses dias (nem o 1º acesso).
4. **Semanas:** Sem.42 = transição 20–25/10 (TER→DOM, 6 dias) · **Sem.43 = T1 = SEG 26/10 → SEG 02/11 (8 dias, duas segundas)** · depois TER→SEG: T2 03–09/11 … **T10 = Sem.52 = 29/12–01/01** (4 dias) — **10 semanas**. A chave da T1 é "2026-10-26" (uma segunda). O dia ativo do Cronograma passou a distinguir as duas segundas (tocar na aba 02/11 abre o 02/11; ◀ a partir de SEG 09/11 cai na SEG 02/11, a mais perto); as 8 abas cabem num celular de 360px; o seletor 🌿, o "mover para" e a grade da academia levam a data quando a semana tem 8 dias.

### A.2 · Rampa semana a semana

Mesma forma aprovada (começa leve, travada no bloco 04h30, pico em 15–21/12, zero na semana final), com uma semana a menos: **3 · 4 · 4 · 4 · 4 · 4 · 4 · 5 · 4 · 0 = 36**. T3 (10–16/11, pelo 16/11) a T7 (08–14/12, pelo 08–11/12) tocam o bloco 04h30 — não sobem; a T8 (15/12) só vai a 5 se a T7 fechar.

| Semana | Datas | Dias | Rampa | Cota | Estado | Módulos novos |
|---|---|---|---|---|---|---|
| T1 (Sem.43) | 26/10–02/11 | 8 | 3 | 3 | congelada hoje | CIR1 Trauma I · CIR1 Trauma II · CIR2 Urologia |
| T2 (Sem.44) | 03/11–09/11 | 7 | 4 | 4 | prévia | CIR2 Cicatrização de Feridas e Queimaduras · CIR2 Cirurgia Pediátrica · CIR3 Preparo Pré-operatório e Risco Cirúrgico · CIR3 Hérnias da Parede Abdominal |
| T3 (Sem.45) | 10/11–16/11 | 7 | 4 | 4 | prévia | CIR4 Especialidade Cirúrgica · CIR4 Especialidade Cirúrgica · NEF1 Glomerulopatias I · GIN1 Ciclo Menstrual e Anticoncepção |
| T4 (Sem.46) | 17/11–23/11 | 7 | 4 | 4 | prévia | NEF1 Glomerulopatias II · GIN1 Amenorreia e Ovário Policístico · NEF2 Distúrbio Hidroeletrolítico · OBS1 Diagnóstico de Gravidez e Modificações do Organismo |
| T5 (Sem.47) | 24/11–30/11 | 7 | 4 | 4 | prévia | NEF3 Insuficiência Renal · NEF2 Distúrbio Ácido-Básico · PRE1 Medidas de Saúde Coletiva · PED1 Neonatologia I |
| T6 (Sem.48) | 01/12–07/12 | 7 | 4 | 4 | prévia | PRE2 Estudos Epidemiológicos · ANAT Bônus Anatomia · REU1 Intro à Reumatologia + Artrites · PED1 Neonatologia II |
| T7 (Sem.49) | 08/12–14/12 | 7 | 4 | 4 | prévia | REU1 Gota · PRE2 Epidemiologia Clínica · OBS2 Assistência Clínica ao Parto e Parto Prematuro · PRE3 Vigilância da Saúde |
| T8 (Sem.50) | 15/12–21/12 | 7 | 5 | 5 | prévia | REU2 Colagenoses · PRE3 Saúde do Trabalhador + Ética Médica · REU2 Vasculites · PED2 Aleitamento Materno · HEM1 Anemias I |
| T9 (Sem.51) | 22/12–28/12 | 7 | 4 | 4 | prévia | PED2 Crescimento e Desenvolvimento Normais · HEM1 Anemia II · HEM2 Leucemias Agudas e Crônicas · HEM2 Linfomas e Mieloma Múltiplo |
| T10 (Sem.52) | 29/12–01/01 | 4 | 0 | 0 | prévia | — |

Soma das cotas: 36. Alcance N = 36 (dentro, as 4 etapas datadas até 01/01); fila = 93; fora = 57.

### A.3 · Alcance

**N = 36 dentro** (as 4 etapas datadas até 01/01) · **57 fora** (fila de 93) · 0 fechados. A sua conta (≈ 36) bate. Saem do alcance os 4 que eram #37–#40 no plano de 20/10: **HEM2 · Distúrbios da Hemostasia, GAS1 · Doenças do Esôfago, GIN2 · Sangramento Uterino Anormal, Endometriose e Infertilidade, GAS1 · Doenças do Estômago** (agora os primeiros fora). Últimos dentro: #33 PED2 · Crescimento e Desenvolvimento, #34 HEM1 · Anemia II, #35 HEM2 · Leucemias, #36 HEM2 · Linfomas e Mieloma.

### A.4 · Cota proporcional na 1ª semana (8 dias) — a escolha

A regra da decisão 71 fica como está: a semana do 1º acesso recebe `round(rampa × dias que restam ÷ dias da semana)`, contando o dia do 1º acesso, e só quando o 1º acesso cai **depois** do 1º dia da semana. Na T1 o denominador é **8**. Como o 1º acesso é hoje e hoje é o 1º dia, **restam 8 de 8 dias ⇒ cota cheia (3)**, sem marca de proporcional — e a T2 sobe a 4 se a T1 fechar. Por quê: a proporcionalidade existe para a semana não abrir acima do que os dias que sobram sustentam; com a semana inteira pela frente não há o que reduzir, e a T1 de 8 dias fica leve (pior dia de estudo: 4,3h, QUA 28/10; 27/10 é plantão longo). Se ela só abrisse depois: 27/10 → 3 (round 2,625) · 28, 29 e 30/10 → 2 · 31/10 e 01/11 → 1 · 02/11 → 0 (testado: TR13 em 28/10, TR13b em 02/11, TR13c em 26/10).

### A.5 · Carga dia a dia — transição + as 10 semanas (plano visto em 26/10, sem revisões vencidas)

| Dia | Plantão | Etapas | Estudo | Total | 📚 limiar | Marcas |
|---|---|---|---|---|---|---|
| **Sem.42** | | | | | | |
| TER 20/10 | 06h–19h (longo) | — | 0,33h | 13,83h | 8h | transição |
| QUA 21/10 | 13h–18h (curto) | — | 0,33h | 6,33h | 8h | transição |
| QUI 22/10 | 06h–12h (curto) | — | 0,33h | 7,33h | 8h | transição |
| SEX 23/10 | 05h30–17h (curto) | — | 0,33h | 12,83h | 8h | transição |
| SÁB 24/10 |  | — | 0,58h | 0,58h | 8h | transição |
| DOM 25/10 |  | — | 0,58h | 1,58h | 8h | transição |
| **Sem.43** | | | | | | |
| SEG 26/10 | 06h–12h (curto) | CIR1 aula | 2,03h | 9,03h | 8h |  |
| TER 27/10 | 06h–19h (longo) | — | 0,33h | 13,83h | 8h |  |
| QUA 28/10 |  | CIR1 aula, CIR1 questões | 4,28h | 5,28h | 8h |  |
| QUI 29/10 | 06h–15h (curto) | CIR1 questões, CIR1 apostila | 3,83h | 13,83h | 8h |  |
| SEX 30/10 |  | CIR2 aula, CIR1 apostila | 3,78h | 4,78h | 8h |  |
| SÁB 31/10 |  | — | 0,83h | 0,83h | 8h | 🌿 |
| DOM 01/11 |  | CIR2 questões, CIR1 selagem | 3,25h | 4,25h | 8h |  |
| SEG 02/11 |  | CIR2 apostila, CIR1 selagem | 2,75h | 3,75h | 8h |  |
| **Sem.44** | | | | | | |
| TER 03/11 | 06h–19h (longo) | — | 0,33h | 13,83h | 8h |  |
| QUA 04/11 | 06h–15h (curto) | — | 0,33h | 10,33h | 8h |  |
| QUI 05/11 | 06h–17h (curto) | CIR2 selagem | 1h | 13h | 8h |  |
| SEX 06/11 |  | — | 8,58h | 9,58h | 8h | 📚 🎯 |
| SÁB 07/11 |  | — | 0,83h | 0,83h | 8h | 🌿 |
| DOM 08/11 |  | — | 0,58h | 1,58h | 8h |  |
| SEG 09/11 | 06h–09h30 (curto) | CIR2 aula, CIR2 aula, CIR3 aula, CIR3 aula | 7,13h | 11,63h | 8h |  |
| **Sem.45** | | | | | | |
| TER 10/11 | 06h–19h (longo) | — | 0,33h | 13,83h | 8h |  |
| QUA 11/11 |  | NEF1 aula, CIR2 questões, CIR2 questões, CIR3 questões, CIR3 questões | 10,28h | 11,28h | 8h | 📚 |
| QUI 12/11 | 06h–19h (longo) | — | 0,33h | 13,83h | 8h |  |
| SEX 13/11 |  | GIN1 aula, NEF1 questões, CIR2 apostila, CIR2 apostila, CIR3 apostila, CIR3 apostila | 10,28h | 11,28h | 8h | 📚 |
| SÁB 14/11 |  | — | 0,83h | 0,83h | 8h | 🌿 |
| DOM 15/11 |  | CIR4 aula, CIR4 aula, GIN1 questões, NEF1 apostila | 7,48h | 8,48h | 8h |  |
| SEG 16/11 | 04h30–12h30 (madrugada) | CIR4 questões, CIR2 selagem, CIR2 selagem, CIR3 selagem, CIR3 selagem | 5h | 14h | 5h |  |
| **Sem.46** | | | | | | |
| TER 17/11 | 04h30–12h30 (madrugada) | CIR4 questões, CIR4 apostila, GIN1 apostila | 5,33h | 14,33h | 5h | 📚 |
| QUA 18/11 | 04h30–12h30 (madrugada) | NEF1 aula, CIR4 apostila, NEF1 selagem | 4,2h | 13,2h | 5h |  |
| QUI 19/11 | 04h30–12h30 (madrugada) | NEF1 questões | 2,33h | 11,33h | 5h |  |
| SEX 20/11 | 04h30–12h30 (madrugada) | GIN1 aula, NEF1 apostila, CIR4 selagem, GIN1 selagem | 4,87h | 13,87h | 5h |  |
| SÁB 21/11 |  | — | 0,83h | 0,83h | 8h | 🌿 |
| DOM 22/11 |  | NEF2 aula, OBS1 aula, GIN1 questões, CIR4 selagem | 6,65h | 7,65h | 8h |  |
| SEG 23/11 | 04h30–12h30 (madrugada) | NEF2 questões, GIN1 apostila, NEF1 selagem | 4,5h | 13,5h | 5h |  |
| **Sem.47** | | | | | | |
| TER 24/11 | 04h30–12h30 (madrugada) | OBS1 questões, NEF2 apostila | 3,83h | 12,83h | 5h |  |
| QUA 25/11 | 04h30–12h30 (madrugada) | NEF3 aula, OBS1 apostila | 3,53h | 12,53h | 5h |  |
| QUI 26/11 | 04h30–12h30 (madrugada) | NEF3 questões, GIN1 selagem | 3h | 12h | 5h |  |
| SEX 27/11 | 04h30–12h30 (madrugada) | NEF2 aula, NEF3 apostila, NEF2 selagem | 4,2h | 13,2h | 5h |  |
| SÁB 28/11 |  | — | 0,83h | 0,83h | 8h | 🌿 |
| DOM 29/11 |  | PRE1 aula, PED1 aula, NEF2 questões, OBS1 selagem | 6,65h | 7,65h | 8h |  |
| SEG 30/11 | 04h30–12h30 (madrugada) | PRE1 questões, NEF2 apostila, NEF3 selagem | 4,5h | 13,5h | 5h |  |
| **Sem.48** | | | | | | |
| TER 01/12 | 04h30–12h30 (madrugada) | PED1 questões, PRE1 apostila | 3,83h | 12,83h | 5h |  |
| QUA 02/12 | 04h30–12h30 (madrugada) | PRE2 aula, PED1 apostila | 3,53h | 12,53h | 5h |  |
| QUI 03/12 | 04h30–12h30 (madrugada) | PRE2 questões, NEF2 selagem | 3h | 12h | 5h |  |
| SEX 04/12 | 04h30–12h30 (madrugada) | ANAT aula, PRE2 apostila, PRE1 selagem | 4,2h | 13,2h | 5h |  |
| SÁB 05/12 |  | — | 0,83h | 0,83h | 8h | 🌿 |
| DOM 06/12 |  | REU1 aula, PED1 aula, ANAT questões, PED1 selagem | 6,65h | 7,65h | 8h |  |
| SEG 07/12 | 04h30–12h30 (madrugada) | REU1 questões, ANAT apostila, PRE2 selagem | 4,5h | 13,5h | 5h |  |
| **Sem.49** | | | | | | |
| TER 08/12 | 04h30–12h30 (madrugada) | PED1 questões, REU1 apostila | 3,83h | 12,83h | 5h |  |
| QUA 09/12 | 04h30–12h30 (madrugada) | REU1 aula, PED1 apostila | 3,53h | 12,53h | 5h |  |
| QUI 10/12 | 04h30–12h30 (madrugada) | PRE2 aula, ANAT selagem | 2,7h | 11,7h | 5h |  |
| SEX 11/12 | 04h30–12h30 (madrugada) | PRE3 aula, REU1 questões, REU1 selagem | 4,7h | 13,7h | 5h |  |
| SÁB 12/12 |  | PRE2 questões, PRE3 questões, REU1 apostila, PED1 selagem | 7h | 7h | 8h |  |
| DOM 13/12 |  | OBS2 aula, PRE2 apostila, PRE3 apostila | 5,28h | 6,28h | 8h |  |
| SEG 14/12 |  | — | 0,58h | 1,58h | 8h | 🌿 |
| **Sem.50** | | | | | | |
| TER 15/12 |  | REU2 aula, REU2 aula, OBS2 questões, REU1 selagem | 6,65h | 7,65h | 8h |  |
| QUA 16/12 |  | REU2 questões, REU2 questões, OBS2 apostila, PRE2 selagem, PRE3 selagem | 7,42h | 8,42h | 8h |  |
| QUI 17/12 |  | PRE3 aula, PED2 aula, HEM1 aula, REU2 apostila, REU2 apostila | 8,68h | 9,68h | 8h | 📚 |
| SEX 18/12 |  | — | 8,58h | 9,58h | 8h | 📚 🎯 |
| SÁB 19/12 |  | PRE3 questões, PED2 questões, HEM1 questões, OBS2 selagem | 7,5h | 7,5h | 8h |  |
| DOM 20/12 |  | PRE3 apostila, PED2 apostila, HEM1 apostila, REU2 selagem, REU2 selagem | 6,42h | 7,42h | 8h |  |
| SEG 21/12 |  | — | 0,58h | 1,58h | 8h | 🌿 |
| **Sem.51** | | | | | | |
| TER 22/12 |  | PED2 aula, HEM1 aula | 3,98h | 4,98h | 8h |  |
| QUA 23/12 |  | PED2 questões, HEM1 questões, PRE3 selagem, PED2 selagem, HEM1 selagem | 6,58h | 7,58h | 8h |  |
| QUI 24/12 |  | PED2 apostila | 2,08h | 3,08h | 3h | 🎄 |
| SEX 25/12 |  | HEM1 apostila | 2,08h | 3,08h | 3h | 🎄 |
| SÁB 26/12 |  | — | 0,83h | 0,83h | 8h | 🌿 |
| DOM 27/12 |  | HEM2 aula, HEM2 aula, PED2 selagem | 4,65h | 5,65h | 8h |  |
| SEG 28/12 |  | HEM2 questões, HEM2 questões, HEM1 selagem | 5,25h | 6,25h | 8h |  |
| **Sem.52** | | | | | | |
| TER 29/12 |  | — | 0,58h | 1,58h | 8h | 🌿 |
| QUA 30/12 |  | HEM2 apostila, HEM2 apostila | 3,58h | 4,58h | 8h |  |
| QUI 31/12 |  | — | 0,58h | 1,58h | 3h | 🎄 |
| SEX 01/01 |  | HEM2 selagem, HEM2 selagem | 1,92h | 2,92h | 8h | 🏁 |

Dias acima do tempo hábil (14,5h): nenhum. Dias acima do 📚: 06/11, 11/11, 13/11, 17/11, 17/12, 18/12.

**De 03/11 em diante a carga por dia é idêntica à do plano de 20/10** (mesmas semanas TER→SEG, mesma rampa — conferido dia a dia); só os módulos andam 4 posições. Acima do 📚 (informativo, abaixo do tempo hábil): QUA 11/11 e SEX 13/11 (10,3h — decisão 70), TER 17/11 (5,3h num dia de 04h30), QUI 17/12 (8,7h — decisão 72) e as sextas de simulado (06/11, 18/12).

**Uso real (simulador do motor):** varredura de todas as datas possíveis de 1º acesso, **26/10 → 28/12 (64 datas): nenhuma deixa dia acima de 14,5h**. Simulação progressiva com 1º acesso hoje, ela fazendo tudo no dia e as revisões vencidas no 1º dia com folga, com selagens a **50, 70 e 85%**: **36 módulos fechados até 01/01** nos três casos; nenhum dia acima de 14,5h (pior: 14,33h, TER 17/11); revisões deslizam no máximo 1 dia (decisão 73).

### A.6 · Tabela de intervalos — os 36 módulos planejados

| # | Módulo | Semana | Aula | Questões | Apostila | Selagem | a→q | q→p | p→s |
|---|---|---|---|---|---|---|---|---|---|
| 1 | CIR1 Trauma I | 26/10 | SEG 26/10 | QUA 28/10 | QUI 29/10 | DOM 01/11 | 2 | 1 | 3 |
| 2 | CIR1 Trauma II | 26/10 | QUA 28/10 | QUI 29/10 | SEX 30/10 | SEG 02/11 | 1 | 1 | 3 |
| 3 | CIR2 Urologia | 26/10 | SEX 30/10 | DOM 01/11 | SEG 02/11 | QUI 05/11 | 2 | 1 | 3 |
| 4 | CIR2 Cicatrização de Feridas e Queimaduras | 03/11 | SEG 09/11 | QUA 11/11 | SEX 13/11 | SEG 16/11 | 2 | 2 | 3 |
| 5 | CIR2 Cirurgia Pediátrica | 03/11 | SEG 09/11 | QUA 11/11 | SEX 13/11 | SEG 16/11 | 2 | 2 | 3 |
| 6 | CIR3 Preparo Pré-operatório e Risco Cirúrgico | 03/11 | SEG 09/11 | QUA 11/11 | SEX 13/11 | SEG 16/11 | 2 | 2 | 3 |
| 7 | CIR3 Hérnias da Parede Abdominal | 03/11 | SEG 09/11 | QUA 11/11 | SEX 13/11 | SEG 16/11 | 2 | 2 | 3 |
| 8 | CIR4 Especialidade Cirúrgica | 10/11 | DOM 15/11 | SEG 16/11 | TER 17/11 | SEX 20/11 | 1 | 1 | 3 |
| 9 | CIR4 Especialidade Cirúrgica | 10/11 | DOM 15/11 | TER 17/11 | QUA 18/11 | DOM 22/11 | 2 | 1 | 4 |
| 10 | NEF1 Glomerulopatias I | 10/11 | QUA 11/11 | SEX 13/11 | DOM 15/11 | QUA 18/11 | 2 | 2 | 3 |
| 11 | GIN1 Ciclo Menstrual e Anticoncepção | 10/11 | SEX 13/11 | DOM 15/11 | TER 17/11 | SEX 20/11 | 2 | 2 | 3 |
| 12 | NEF1 Glomerulopatias II | 17/11 | QUA 18/11 | QUI 19/11 | SEX 20/11 | SEG 23/11 | 1 | 1 | 3 |
| 13 | GIN1 Amenorreia e Ovário Policístico | 17/11 | SEX 20/11 | DOM 22/11 | SEG 23/11 | QUI 26/11 | 2 | 1 | 3 |
| 14 | NEF2 Distúrbio Hidroeletrolítico | 17/11 | DOM 22/11 | SEG 23/11 | TER 24/11 | SEX 27/11 | 1 | 1 | 3 |
| 15 | OBS1 Diagnóstico de Gravidez e Modificações do Organismo | 17/11 | DOM 22/11 | TER 24/11 | QUA 25/11 | DOM 29/11 | 2 | 1 | 4 |
| 16 | NEF3 Insuficiência Renal | 24/11 | QUA 25/11 | QUI 26/11 | SEX 27/11 | SEG 30/11 | 1 | 1 | 3 |
| 17 | NEF2 Distúrbio Ácido-Básico | 24/11 | SEX 27/11 | DOM 29/11 | SEG 30/11 | QUI 03/12 | 2 | 1 | 3 |
| 18 | PRE1 Medidas de Saúde Coletiva | 24/11 | DOM 29/11 | SEG 30/11 | TER 01/12 | SEX 04/12 | 1 | 1 | 3 |
| 19 | PED1 Neonatologia I | 24/11 | DOM 29/11 | TER 01/12 | QUA 02/12 | DOM 06/12 | 2 | 1 | 4 |
| 20 | PRE2 Estudos Epidemiológicos | 01/12 | QUA 02/12 | QUI 03/12 | SEX 04/12 | SEG 07/12 | 1 | 1 | 3 |
| 21 | ANAT Bônus Anatomia | 01/12 | SEX 04/12 | DOM 06/12 | SEG 07/12 | QUI 10/12 | 2 | 1 | 3 |
| 22 | REU1 Intro à Reumatologia + Artrites | 01/12 | DOM 06/12 | SEG 07/12 | TER 08/12 | SEX 11/12 | 1 | 1 | 3 |
| 23 | PED1 Neonatologia II | 01/12 | DOM 06/12 | TER 08/12 | QUA 09/12 | SÁB 12/12 | 2 | 1 | 3 |
| 24 | REU1 Gota | 08/12 | QUA 09/12 | SEX 11/12 | SÁB 12/12 | TER 15/12 | 2 | 1 | 3 |
| 25 | PRE2 Epidemiologia Clínica | 08/12 | QUI 10/12 | SÁB 12/12 | DOM 13/12 | QUA 16/12 | 2 | 1 | 3 |
| 26 | OBS2 Assistência Clínica ao Parto e Parto Prematuro | 08/12 | DOM 13/12 | TER 15/12 | QUA 16/12 | SÁB 19/12 | 2 | 1 | 3 |
| 27 | PRE3 Vigilância da Saúde | 08/12 | SEX 11/12 | SÁB 12/12 | DOM 13/12 | QUA 16/12 | 1 | 1 | 3 |
| 28 | REU2 Colagenoses | 15/12 | TER 15/12 | QUA 16/12 | QUI 17/12 | DOM 20/12 | 1 | 1 | 3 |
| 29 | PRE3 Saúde do Trabalhador + Ética Médica | 15/12 | QUI 17/12 | SÁB 19/12 | DOM 20/12 | QUA 23/12 | 2 | 1 | 3 |
| 30 | REU2 Vasculites | 15/12 | TER 15/12 | QUA 16/12 | QUI 17/12 | DOM 20/12 | 1 | 1 | 3 |
| 31 | PED2 Aleitamento Materno | 15/12 | QUI 17/12 | SÁB 19/12 | DOM 20/12 | QUA 23/12 | 2 | 1 | 3 |
| 32 | HEM1 Anemias I | 15/12 | QUI 17/12 | SÁB 19/12 | DOM 20/12 | QUA 23/12 | 2 | 1 | 3 |
| 33 | PED2 Crescimento e Desenvolvimento Normais | 22/12 | TER 22/12 | QUA 23/12 | QUI 24/12 | DOM 27/12 | 1 | 1 | 3 |
| 34 | HEM1 Anemia II | 22/12 | TER 22/12 | QUA 23/12 | SEX 25/12 | SEG 28/12 | 1 | 2 | 3 |
| 35 | HEM2 Leucemias Agudas e Crônicas | 22/12 | DOM 27/12 | SEG 28/12 | QUA 30/12 | SEX 01/01 | 1 | 2 | 2 |
| 36 | HEM2 Linfomas e Mieloma Múltiplo | 22/12 | DOM 27/12 | SEG 28/12 | QUA 30/12 | SEX 01/01 | 1 | 2 | 2 |

Fora das faixas (aula→questões 1–2 · questões→apostila 1–2 · apostila→selagem 2–5): nenhum.

Ideais: questões→apostila em 1 dia 27/36 · apostila→selagem em 3 dias 31/36 · aula→questões em 1 dia 15/36 (o plantão longo do dia seguinte à aula força 2 dias em várias semanas). Nenhum módulo com duas etapas no mesmo dia; nada em plantão longo (27/10, 03/11, 10/11, 12/11) nem em sexta de simulado; nenhuma aula no dia leve previsto nem em 24/25/31/12; 01/01 só selagem.

### A.7 · 20–25/10 sem etapa nenhuma e histórico até 19/10 idêntico

- **20–25/10:** nenhuma etapa, áudio, revisão, PLAN, 🌿 ou simulado em nenhum dos 6 dias — conferido pela tela (TR0, TR0b, S7b, intervalsTrilha "nenhuma etapa em 20–25/10") e também com o app chegando com a semana de 20/10 congelada pela versão anterior e dias gravados com etapa antiga, simulado ou PLAN (TR16, TR16c: o original vai para o arquivo e o dia fica de transição, com os ✓ dela). Cada dia: TER 20/10 plantão longo (🚑 só Anki no trajeto) · QUA 21/10 plantão 13h–18h · QUI 22/10 plantão 06h–12h · SEX 23/10 plantão 05h30–17h (sem simulado) · SÁB 24/10 Anki e lazer · DOM 25/10 Anki, academia e "dormir ~21h45" (plantão 06h de 26/10).
- **Histórico:** `historico.js` compara o app de antes da Trilha (git 11c65b8) com o novo, dia a dia de 07/01 a 19/10, em quatro modos — relógio na quarta de cada semana, relógio em 21/10 (agora transição), **relógio em 26/10 (hoje)** navegando ◀ até a Sem.1 e, no modo D, **20 e 21/10 gravados depois do curso**: (D1) pela versão de 20/10, com etapas e ✓; (D2) com ✓ marcado por ela num dia de transição na versão nova; (D3) uma edição de 20/10 feita no tempo do curso, que continua valendo. Nos três a Sem.41 é a do app de antes da Trilha: o dia leve histórico (que lê a TER 20/10) só usa uma lista do tempo do curso; lista gravada depois do curso nunca conta. Única diferença, a de sempre: a TER 20/10 não está na Sem.41 (é o 1º dia pós-curso). Resultado na §A.10.

### A.8 · Passagem pelos oito

| | Veto? | Por quê |
|---|---|---|
| 🧠 Psiquiatria | não | Nenhum horário de medicação em nenhum dos 74 dias (6 de transição + 68 da Trilha), nem no bloco 04h30 ("janela do estimulante a validar com a psiquiatra"). A T1 começa leve (3 módulos em 8 dias); um dia leve previsto por semana (na T1: SÁB 31/10), nunca com aula nova. |
| 📚 Pedagogia | não | Cadeia completa e dentro das faixas da decisão 40 em todos os 36; a fila não muda; nenhuma etapa antes de 26/10. |
| 😴 Sono | não | Nenhum dia acima de 14,5h (prévia, varredura de 64 datas e simulação progressiva). Plantão longo sem etapa de mesa; vésperas mantidas, inclusive nos dias de transição (21, 22 e 25/10). |
| 🩺 Clínica/ordem | não | Cirurgia primeiro; CIR1 · Trauma I hoje, na tarde livre depois do plantão de 06h–12h. |
| 🏃 Corpo | não | Academia nos dias de transição como nos demais (sábado sem treino — ver §A.9). |
| 🧩 TDAH/funções executivas | não | Uma tela por dia, a nota de transição diz o que esperar; nada de ⏳ herdado da semana descartada; as 8 abas e as duas segundas distinguíveis. |
| 💬 Autonomia | não | Nada decidido por ela além do pedido; os pontos abertos estão em §A.9. |
| ⚙️ Dados/engenharia | não | Nada apagado: semana de 20/10 em `trilhaDescartes`, originais dos dias gravados no arquivo (os ✓ e blocos dela ficam na tela), `trail_v1` intocado; migração idempotente e refeita se o arquivo falhar; histórico idêntico (também com a versão anterior aberta em 20–25/10). |

### A.9 · Para você decidir (nada aplicado)

1. **Cota da T1 (8 dias):** ficou **3** (a forma "começar leve" e a sua conta de 36). Alternativa medida: **4** → alcance **37**, nenhum dia acima de 14,5h, mas a QUI 05/11 vai a **14,5h** (no limite) e a semana de 8 dias deixa de ser leve. Sugestão da equipe: manter 3.
2. **SÁB 24/10 (transição):** a sua lista dizia "plantão, Anki, academia e lazer"; a regra de sempre tira o treino do sábado (descanso do treino), então o sábado ficou com Anki e lazer. É um dia passado; se quiser academia no sábado de transição, é uma linha.
3. **(Informação)** O 1º acesso é o dia em que ela abre a versão nova. Se, em vez de hoje, ela abrir só amanhã, a T1 continua com 3 (7 de 8 dias, round 2,625); a partir de 28/10, 2.

### A.10 · Bateria e `cmp`

(preenchido abaixo)

### A.11 · Revisão adversarial antes do merge (5 lentes + verificação de cada achado)

Lentes: transição, calendário, migração, semana de 8 dias, docs/testes. Cada achado foi reproduzido (Playwright ou motor em node) e corrigido; o teste novo falha na versão de antes da correção e passa na de agora.

| Achado | Correção | Teste |
|---|---|---|
| Dia gravado pela versão de 20/10 com etapa era arquivado inteiro: uma consulta acrescentada por ela e os ✓ (Anki etc.) sumiam da tela | o original vai para o arquivo; o dia fica com os blocos e ✓ dela, sem as etapas antigas, e recebe as etapas do plano novo daquele dia | TR16c (QUA 28/10) |
| Dia de transição gravado **sem** etapa mantinha PLAN, simulado com o campo de %, texto antigo e ⚠️ de carga | todo dia gravado em 20–25/10 é refeito como transição a cada carga (fica o que é dela) | TR16, TR16c |
| Versão anterior aberta em 27/10 ou depois congelaria a semana de 27/10 (19, 24, 32) por cima da T1 — 6 módulos, 8,7h de estudo em 30/10 | qualquer marca do calendário antigo descarta todo `trilhaWeeks`/`trilhaPlan` (enquanto o config não traz `trilhaInicio`) | TR16e |
| ✓ num dia de transição (20 ou 21/10), ou uma lista da versão de 20/10, mudava o dia leve histórico da Sem.41 (0,3h × 4,1h) | o dia leve histórico só lê edição do tempo do curso (`trilhaCourseList`); a lista de depois do curso nunca conta | `historico.js` modo D (D1–D3) |
| Rampa/dia leve/dispensa gravados na chave de 27/10 ficavam sem efeito e sem registro | levados para a T1 (se a T1 não tem valor) ou para `trilhaDescartes` | TR16c |
| Limpeza dos dias gravados só rodava junto com a do config e não repetia se o arquivo falhasse; um bloco antigo restante podia ser "movido" e reescrever o plano novo | marca própria (`config.trilhaInicio`), repete até gravar; "mover p/ dia" nunca num dia de transição | TR16d |
| Módulo começado na versão anterior (ex.: aula feita pelo Adiantar) esperaria a vez na fila — 12 dias entre aula e questões | começado vem à frente da fila e continua logo (≤ 7 dias da aula); nos dados reais nada foi executado | TR16b, TR16f |
| ◀ a partir de SEG 09/11 abria SEG 26/10 (14 dias antes) | o dia ativo guarda a data; vai à segunda mais perto | TR0c |
| 8 abas da T1 não cabiam em celular de 360px (SEG 02/11 escondida) | abas de 36px com espaço de 4px na semana de 8 dias (316px) | TR0 (360px) |
| Título da academia na transição dizia "6 dos 7 dias" | texto sem contagem quando a semana não tem 7 dias | TR0b |
| (testes) Várias checagens de "nenhuma etapa em 20–25/10" liam só a marca `data-tm`, que o app não põe nos dias de transição — não podiam falhar | `transStage` no harness reconhece etapa, revisão, PLAN e simulado também pela etiqueta e pelo texto; usado em TR0, TR0b, TR16, TR16b, TR16c, S7b, intervalsTrilha e coverageTrilha (a). Prova: com o ramo de transição desligado ou a limpeza desligada, as checagens ficam vermelhas | mutantes m1/m2 |
| Bloco criado por ela com etiqueta diferente de "extra" num dia de transição sumiria | fica todo bloco dela (id `c-<hora>` do "adicionar"), qualquer etiqueta; nunca um bloco gerado | TR16c (SÁB 24/10) |
| ✓ na nota "a trilha começa em 26/10" era tirado ao abrir de novo | o ✓ da nota também fica | conferido por script (abrir 2×: nada muda, nada arquivado) |

Achados refutados pela verificação (já estavam corrigidos quando foram conferidos): sobreposição de chaves antigas de rampa/dia leve; limpeza só junto com o config; arquivo do dia inteiro; semana de 27/10; repetição após falha do arquivo.


## 0 · Decisões da paciente e aval (20/10/2026)

1. **Ordem do agendador — confirmada:** tempo hábil antes dos intervalos ideais. "Dezenove vírgula sete horas num dia é inviável, não é 'intervalo subótimo' — nenhum plano com um dia assim se cumpre, e um módulo que não acontece tem espaçamento zero." (decisão 69)
2. **11/11 e 13/11 (~10,3h de estudo) — mantidos, sem reduzir o ritmo:** trocar seis módulos de alcance por dois dias mais leves não se paga; o selo 📚 avisa e ela move o que não couber. (decisão 70)
3. **1ª semana proporcional aos dias restantes — aprovada e implementada,** inclusive quando o 1º acesso cai num sábado do bloco 04h30. (decisão 71)
4. **Semana 15–21/12 — mantém o ritmo 5:** 0,7h acima em um único dia não justifica perder um módulo. (decisão 72)
5. **Aval dado para o merge do PR #15.**

**Como a decisão 3 ficou no código:** a semana do 1º acesso recebe `round(rampa × dias restantes ÷ dias da semana)`, contando o dia do 1º acesso (ex.: quinta-feira = 5 de 7 dias; T1 com rampa 3 → 2 módulos). Não é semana "segurada": a regra de subida da semana seguinte compara com a cota cheia, então a seguinte volta à rampa normal (testado: 1º acesso em 22/10 → T1 = 2 e T2 = 4; em 28/11 → T6 = 2 e T7 = 4). O motivo aparece no painel da semana ("1º acesso: proporcional aos 5 de 7 dias que restavam (a rampa previa 3)"), na aba Trilha e na linha da rampa.

**Verificação (varredura do motor em todos os 70 dias possíveis de 1º acesso, 20/10 → 28/12):**

| Regra da 1ª semana | Datas de 1º acesso com algum dia acima de 14,5h | Pior dia |
|---|---|---|
| cota cheia (antes) | **15 de 70** — 31/10, 01/11, 02/11, 14–16/11, 21–23/11, 28–30/11, 05–07/12 | 18,3h (1º acesso em 02/11 → 04 e 05/11) |
| **proporcional (adotada)** | **0 de 70** | 14,5h (o mesmo teto do plano padrão) |

Simulação progressiva (ela abre o app todo dia, faz cada etapa no dia planejado e as revisões quando vencem — com as revisões, que a prévia não tem): regra antiga **15 de 70** datas com algum dia acima de 14,5h; regra nova **2 de 70** (1º acesso em 06 ou 07/11 → SEG 23/11 com 15,1h, só por causa de uma revisão de 45min — ver §10, item 4).

O caso que motivou a regra: 1º acesso em 28/11 → T6 com 2 módulos, SEG 30/11 com 13,0h (antes 15,0h). Para os dias em que ela pode abrir agora: 20/10 e 21/10 → 3 módulos (alcance 40); 22/10 e 23/10 → 2 (alcance 39); 24 e 25/10 → 1 (38); 26/10 → 0 (37). **Na semana seguinte** a regra de subida conta a cota cheia da semana proporcional (sem isso, abrir num sábado do bloco 04h30 seguraria o bloco inteiro em 2); a tela explica: "a semana do 1º acesso teve 2 módulos em 5 dias; para subir ou segurar, conta a cota cheia dela (3)". **Semana sem etapa** (1º acesso numa segunda → cota 0) não oferece ⏩.

**Revisão adversarial antes do merge (4 lentes: motor, carga, interface, testes):** corrigidos (1) o ⏩ "todas as etapas marcadas" numa semana vazia, (2) a falta de explicação do ritmo da semana seguinte, (3) a concordância "ao único dia que restava"; registrados (4) 1º acesso em 11 ou 12/11 acrescenta um dia 04h30 a 5,2h de 5h (marginal) e (5) o resíduo das revisões fora da capacidade (§10, item 4).

*(Arredondar para cima também daria zero dias acima de 14,5h e manteria um módulo a mais em alguns desses dias — ex.: 22/10 → 3; adotei o arredondamento comum, que é o "proporcional" literal.)*

## 1 · Em uma página

- **O que mudou:** a partir de 20/10 o app é uma trilha única — fila de 93 módulos (cirurgia primeiro, depois a ordem do curso), cadeia completa por módulo (aula → questões → apostila → selagem), rampa 3·4·4·4·4·4·4·4·5·4·0, semanas TER→SEG, plantões novos, dia leve previsto antes de distribuir, ⏳ recolocar / 🔓 subir / ⏩ adiantar (só gravam com "Aplicar"), 📦 a partir de 15/12, recolocação automática na semana final, encerramento em 01/01 e balanço depois. Registro próprio (`medplanner_trail_v1`); nada antigo é apagado.
- **Bateria (todas verdes, código de saída 0):** audit 393/393 · trilha 144/144 · historico 82/82 · coverage41 80/80 · coverageTrilha 7/7 · intervalsTrilha 10/10 · intervals16 7/7 · loads16 12/12 → **735 checks**. `cmp planner_residencia_2026_offline.html index.html`: idênticos.
- **Alcance:** cabem **40 módulos até 01/01** (as 4 etapas datadas até 01/01); **53 ficam fora**; 0 fechados ainda.
- **Simulados na janela:** exatamente **06/11 e 18/12** (teste TRsim). 23/10, 20/11 e 04/12 caem em plantão (sem prova pela regra; o botão religa); 01/01 fica fora.
- **Semana 15–21/12 (ritmo 5 + simulado):** só **QUI 17/12** passa do 📚 (8,7h / 8h). Não há "vários dias muito acima" → **não proponho ritmo 4**; se ela quiser, T9 = 4 deixa 17/12 em 7,0h ao custo de 1 módulo (alcance 39).
- **Decidido em 20/10 (§0):** (1) ordem do agendador confirmada; (2) 11/11 e 13/11 ficam como estão; (3) 1ª semana proporcional, implementada; (4) T9 no ritmo 5.
- **Nota CIR3 (§11):** o Preparo Pré-operatório (#6) apoia-se em cardiologia (#52); fica na posição atual, ela pode movê-lo com ↑↓.

## 2 · Alcance (N) e fora

Prévia de 19/10 (= o que congela semana a semana se cada semana fechar): **fechados 0 · dentro do alcance 40 · fora 53** (fila de 93). Aberturas por semana = rampa [3, 4, 4, 4, 4, 4, 4, 4, 5, 4, 0]. Linha de alcance depois do #40 (GAS1 · Doenças do Estômago). Primeiros fora: #41 GAS2 · Doenças Clínicas do Intestino · #42 GAS2 · Doenças Cirúrgicas do Intestino I · #43 OBS3 · Sangramentos na Gravidez I · #44 GAS2 · Doenças Cirúrgicas do Intestino II · #45 OBS3 · Sangramentos na Gravidez II … até o #93. A conta é honesta: não é promessa — muda quando ela marca, recoloca ou adianta (⏩ soma um; semana segurada tira).

## 3 · Tabela de intervalos — os 40 módulos planejados

Faixas (decisão 40): aula→questões 1–2d · questões→apostila 1–2d (ideal 1) · apostila→selagem 2–5d (ideal 3); nunca duas etapas do mesmo módulo no mesmo dia. Todos dentro das faixas (teste intervalsTrilha).

| Fila | Módulo | aula | → | questões | → | apostila | → | selagem |
|---|---|---|---|---|---|---|---|---|
| #1 | CIR1 · Trauma I — Avaliação Inicial e Trauma de Tórax | 21/10 | 1d | 22/10 | 1d | 23/10 | 3d | 26/10 |
| #2 | CIR1 · Trauma II — Abdome, Pelve e TCE | 26/10 | 2d | 28/10 | 1d | 29/10 | 3d | 01/11 |
| #3 | CIR2 · Urologia | 26/10 | 2d | 28/10 | 1d | 29/10 | 3d | 01/11 |
| #4 | CIR2 · Cicatrização de Feridas e Queimaduras | 30/10 | 2d | 01/11 | 1d | 02/11 | 3d | 05/11 |
| #6 | CIR3 · Preparo Pré-operatório e Risco Cirúrgico | 30/10 | 2d | 01/11 | 1d | 02/11 | 2d | 04/11 |
| #7 | CIR3 · Hérnias da Parede Abdominal | 30/10 | 2d | 01/11 | 1d | 02/11 | 2d | 04/11 |
| #5 | CIR2 · Cirurgia Pediátrica | 02/11 | 2d | 04/11 | 1d | 05/11 | 3d | 08/11 |
| #8 | CIR4 · Especialidade Cirúrgica — Parte I | 09/11 | 2d | 11/11 | 2d | 13/11 | 3d | 16/11 |
| #9 | CIR4 · Especialidade Cirúrgica — Parte II | 09/11 | 2d | 11/11 | 2d | 13/11 | 3d | 16/11 |
| #10 | NEF1 · Glomerulopatias I (Nefrítica, Assintomáticas, GNRP) | 09/11 | 2d | 11/11 | 2d | 13/11 | 3d | 16/11 |
| #11 | GIN1 · Ciclo Menstrual e Anticoncepção | 09/11 | 2d | 11/11 | 2d | 13/11 | 3d | 16/11 |
| #14 | NEF2 · Distúrbio Hidroeletrolítico | 11/11 | 2d | 13/11 | 2d | 15/11 | 3d | 18/11 |
| #15 | OBS1 · Diagnóstico de Gravidez e Modificações do Organismo | 13/11 | 2d | 15/11 | 2d | 17/11 | 3d | 20/11 |
| #12 | NEF1 · Glomerulopatias II (Síndrome Nefrótica) | 15/11 | 1d | 16/11 | 1d | 17/11 | 3d | 20/11 |
| #13 | GIN1 · Amenorreia e Ovário Policístico | 15/11 | 2d | 17/11 | 1d | 18/11 | 4d | 22/11 |
| #16 | NEF3 · Insuficiência Renal | 18/11 | 1d | 19/11 | 1d | 20/11 | 3d | 23/11 |
| #17 | NEF2 · Distúrbio Ácido-Básico | 20/11 | 2d | 22/11 | 1d | 23/11 | 3d | 26/11 |
| #18 | PRE1 · Medidas de Saúde Coletiva | 22/11 | 1d | 23/11 | 1d | 24/11 | 3d | 27/11 |
| #19 | PED1 · Neonatologia I | 22/11 | 2d | 24/11 | 1d | 25/11 | 4d | 29/11 |
| #20 | PRE2 · Estudos Epidemiológicos | 25/11 | 1d | 26/11 | 1d | 27/11 | 3d | 30/11 |
| #21 | ANAT · Bônus Anatomia | 27/11 | 2d | 29/11 | 1d | 30/11 | 3d | 03/12 |
| #22 | REU1 · Intro à Reumatologia + Artrites | 29/11 | 1d | 30/11 | 1d | 01/12 | 3d | 04/12 |
| #23 | PED1 · Neonatologia II | 29/11 | 2d | 01/12 | 1d | 02/12 | 4d | 06/12 |
| #24 | REU1 · Gota; Febre Reumática | 02/12 | 1d | 03/12 | 1d | 04/12 | 3d | 07/12 |
| #25 | PRE2 · Epidemiologia Clínica | 04/12 | 2d | 06/12 | 1d | 07/12 | 3d | 10/12 |
| #26 | OBS2 · Assistência Clínica ao Parto e Parto Prematuro | 06/12 | 1d | 07/12 | 1d | 08/12 | 3d | 11/12 |
| #27 | PRE3 · Vigilância da Saúde | 06/12 | 2d | 08/12 | 1d | 09/12 | 3d | 12/12 |
| #28 | REU2 · Colagenoses | 09/12 | 2d | 11/12 | 1d | 12/12 | 3d | 15/12 |
| #29 | PRE3 · Saúde do Trabalhador + Ética Médica | 10/12 | 2d | 12/12 | 1d | 13/12 | 3d | 16/12 |
| #31 | PED2 · Aleitamento Materno | 11/12 | 1d | 12/12 | 1d | 13/12 | 3d | 16/12 |
| #30 | REU2 · Vasculites | 13/12 | 2d | 15/12 | 1d | 16/12 | 3d | 19/12 |
| #32 | HEM1 · Anemias I — Ferropriva, Megaloblástica, Doença Crônica | 15/12 | 1d | 16/12 | 1d | 17/12 | 3d | 20/12 |
| #34 | HEM1 · Anemia II — Hemolíticas / Anemia Falciforme | 15/12 | 1d | 16/12 | 1d | 17/12 | 3d | 20/12 |
| #33 | PED2 · Crescimento e Desenvolvimento Normais | 17/12 | 2d | 19/12 | 1d | 20/12 | 3d | 23/12 |
| #35 | HEM2 · Leucemias Agudas e Crônicas | 17/12 | 2d | 19/12 | 1d | 20/12 | 3d | 23/12 |
| #36 | HEM2 · Linfomas e Mieloma Múltiplo | 17/12 | 2d | 19/12 | 1d | 20/12 | 3d | 23/12 |
| #37 | HEM2 · Distúrbios da Hemostasia | 22/12 | 1d | 23/12 | 1d | 24/12 | 3d | 27/12 |
| #38 | GAS1 · Doenças do Esôfago | 22/12 | 1d | 23/12 | 2d | 25/12 | 3d | 28/12 |
| #39 | GIN2 · Sangramento Uterino Anormal, Endometriose e Infertilidade | 27/12 | 1d | 28/12 | 2d | 30/12 | 2d | 01/01 |
| #40 | GAS1 · Doenças do Estômago | 27/12 | 1d | 28/12 | 2d | 30/12 | 2d | 01/01 |

- questões→apostila no ideal (1 dia): 31/40
- apostila→selagem no ideal (3 dias): 33/40
- aula→questões em 1 dia: 15/40

## 4 · Carga por dia — as 11 semanas

Prévia de 19/10, sem revisões vencidas (que entram por cima, "só se vencer"). 🌿 = dia leve previsto; "(simulado)" = sexta de prova (8h por desenho). Limiar 📚: 8h · 5h no bloco 04h30 · 3h em 24/25/31/12. Tempo hábil 14,5h: **nenhum dia acima**.

| Dia | Estudo | Limiar | Total | Etapas (a=aula · Q=questões · P=apostila · S=selagem) |
|---|---|---|---|---|
| TER 20/10 | 0,33h | 8h | 13,83h | — |
| QUA 21/10 | 2,03h | 8h | 8,03h | aCIR1 |
| QUI 22/10 | 2,33h | 8h | 9,33h | QCIR1 |
| SEX 23/10 | 1,83h | 8h | 14,33h | PCIR1 |
| SÁB 24/10 | 0,83h 🌿 | 8h | 0,83h | — |
| DOM 25/10 | 0,58h | 8h | 1,58h | — |
| SEG 26/10 | 4,40h | 8h | 11,40h | aCIR1 aCIR2 SCIR1 |
| TER 27/10 | 0,33h | 8h | 13,83h | — |
| QUA 28/10 | 4,58h | 8h | 5,58h | QCIR1 QCIR2 |
| QUI 29/10 | 3,33h | 8h | 13,33h | PCIR1 PCIR2 |
| SEX 30/10 | 5,68h | 8h | 6,68h | aCIR2 aCIR3 aCIR3 |
| SÁB 31/10 | 0,83h 🌿 | 8h | 0,83h | — |
| DOM 01/11 | 7,92h | 8h | 8,92h | QCIR2 QCIR3 QCIR3 SCIR1 SCIR2 |
| SEG 02/11 | 6,78h | 8h | 7,78h | aCIR2 PCIR2 PCIR3 PCIR3 |
| TER 03/11 | 0,33h | 8h | 13,83h | — |
| QUA 04/11 | 3,67h | 8h | 13,67h | QCIR2 SCIR3 SCIR3 |
| QUI 05/11 | 2,50h | 8h | 14,50h | PCIR2 SCIR2 |
| SEX 06/11 | 8,58h (simulado) | 8h | 9,58h | — |
| SÁB 07/11 | 0,83h 🌿 | 8h | 0,83h | — |
| DOM 08/11 | 1,25h | 8h | 2,25h | SCIR2 |
| SEG 09/11 | 7,13h | 8h | 11,63h | aCIR4 aCIR4 aNEF1 aGIN1 |
| TER 10/11 | 0,33h | 8h | 13,83h | — |
| QUA 11/11 | 10,28h 📚 | 8h | 11,28h | aNEF2 QCIR4 QCIR4 QNEF1 QGIN1 |
| QUI 12/11 | 0,33h | 8h | 13,83h | — |
| SEX 13/11 | 10,28h 📚 | 8h | 11,28h | aOBS1 QNEF2 PCIR4 PCIR4 PNEF1 PGIN1 |
| SÁB 14/11 | 0,83h 🌿 | 8h | 0,83h | — |
| DOM 15/11 | 7,48h | 8h | 8,48h | aNEF1 aGIN1 QOBS1 PNEF2 |
| SEG 16/11 | 5,00h | 5h | 14,00h | QNEF1 SCIR4 SCIR4 SNEF1 SGIN1 |
| TER 17/11 | 5,33h 📚 | 5h | 14,33h | QGIN1 PNEF1 POBS1 |
| QUA 18/11 | 4,20h | 5h | 13,20h | aNEF3 PGIN1 SNEF2 |
| QUI 19/11 | 2,33h | 5h | 11,33h | QNEF3 |
| SEX 20/11 | 4,87h | 5h | 13,87h | aNEF2 PNEF3 SNEF1 SOBS1 |
| SÁB 21/11 | 0,83h 🌿 | 8h | 0,83h | — |
| DOM 22/11 | 6,65h | 8h | 7,65h | aPRE1 aPED1 QNEF2 SGIN1 |
| SEG 23/11 | 4,50h | 5h | 13,50h | QPRE1 PNEF2 SNEF3 |
| TER 24/11 | 3,83h | 5h | 12,83h | QPED1 PPRE1 |
| QUA 25/11 | 3,53h | 5h | 12,53h | aPRE2 PPED1 |
| QUI 26/11 | 3,00h | 5h | 12,00h | QPRE2 SNEF2 |
| SEX 27/11 | 4,20h | 5h | 13,20h | aANAT PPRE2 SPRE1 |
| SÁB 28/11 | 0,83h 🌿 | 8h | 0,83h | — |
| DOM 29/11 | 6,65h | 8h | 7,65h | aREU1 aPED1 QANAT SPED1 |
| SEG 30/11 | 4,50h | 5h | 13,50h | QREU1 PANAT SPRE2 |
| TER 01/12 | 3,83h | 5h | 12,83h | QPED1 PREU1 |
| QUA 02/12 | 3,53h | 5h | 12,53h | aREU1 PPED1 |
| QUI 03/12 | 3,00h | 5h | 12,00h | QREU1 SANAT |
| SEX 04/12 | 4,20h | 5h | 13,20h | aPRE2 PREU1 SREU1 |
| SÁB 05/12 | 0,83h 🌿 | 8h | 0,83h | — |
| DOM 06/12 | 6,65h | 8h | 7,65h | aOBS2 aPRE3 QPRE2 SPED1 |
| SEG 07/12 | 4,50h | 5h | 13,50h | QOBS2 PPRE2 SREU1 |
| TER 08/12 | 3,83h | 5h | 12,83h | QPRE3 POBS2 |
| QUA 09/12 | 3,53h | 5h | 12,53h | aREU2 PPRE3 |
| QUI 10/12 | 2,70h | 5h | 11,70h | aPRE3 SPRE2 |
| SEX 11/12 | 4,70h | 5h | 13,70h | aPED2 QREU2 SOBS2 |
| SÁB 12/12 | 7,00h | 8h | 7,00h | QPRE3 QPED2 PREU2 SPRE3 |
| DOM 13/12 | 5,28h | 8h | 6,28h | aREU2 PPRE3 PPED2 |
| SEG 14/12 | 0,58h 🌿 | 8h | 1,58h | — |
| TER 15/12 | 6,65h | 8h | 7,65h | aHEM1 aHEM1 QREU2 SREU2 |
| QUA 16/12 | 7,42h | 8h | 8,42h | QHEM1 QHEM1 PREU2 SPRE3 SPED2 |
| QUI 17/12 | 8,68h 📚 | 8h | 9,68h | aPED2 aHEM2 aHEM2 PHEM1 PHEM1 |
| SEX 18/12 | 8,58h (simulado) | 8h | 9,58h | — |
| SÁB 19/12 | 7,50h | 8h | 7,50h | QPED2 QHEM2 QHEM2 SREU2 |
| DOM 20/12 | 6,42h | 8h | 7,42h | PPED2 PHEM2 PHEM2 SHEM1 SHEM1 |
| SEG 21/12 | 0,58h 🌿 | 8h | 1,58h | — |
| TER 22/12 | 3,98h | 8h | 4,98h | aHEM2 aGAS1 |
| QUA 23/12 | 6,58h | 8h | 7,58h | QHEM2 QGAS1 SPED2 SHEM2 SHEM2 |
| QUI 24/12 | 2,08h | 3h | 3,08h | PHEM2 |
| SEX 25/12 | 2,08h | 3h | 3,08h | PGAS1 |
| SÁB 26/12 | 0,83h 🌿 | 8h | 0,83h | — |
| DOM 27/12 | 4,65h | 8h | 5,65h | aGIN2 aGAS1 SHEM2 |
| SEG 28/12 | 5,25h | 8h | 6,25h | QGIN2 QGAS1 SGAS1 |
| TER 29/12 | 0,58h 🌿 | 8h | 1,58h | — |
| QUA 30/12 | 3,58h | 8h | 4,58h | PGIN2 PGAS1 |
| QUI 31/12 | 0,58h | 3h | 1,58h | — |
| SEX 01/01 | 1,92h | 8h | 2,92h | SGIN2 SGAS1 |

Dias acima do 📚 (fora a sexta de simulado): **QUA 11/11 10,3h/8 · SEX 13/11 10,3h/8 · TER 17/11 5,3h/5 · QUI 17/12 8,7h/8** (todos abaixo do tempo hábil; o app mostra o 📚 no dia).

## 5 · Semana 15–21/12 (ritmo 5 + simulado de 18/12), dia a dia

| Dia | Estudo | Limiar | Total | |
|---|---|---|---|---|
| TER 15/12 | 6,7h | 8h | 7,7h | aula ×2 (HEM1), questões REU2, selagem REU2 |
| QUA 16/12 | 7,4h | 8h | 8,4h | questões ×2 (HEM1), apostila REU2, selagens PRE3 e PED2 |
| QUI 17/12 | **8,7h** 📚 | 8h | 9,7h | aulas PED2, HEM2 ×2 + apostilas HEM1 ×2 |
| SEX 18/12 | 8,6h | — | 9,6h | **simulado + correção**, nenhuma etapa de módulo |
| SÁB 19/12 | 7,5h | 8h | 7,5h | questões PED2, HEM2 ×2, selagem REU2 |
| DOM 20/12 | 6,4h | 8h | 7,4h | apostilas PED2, HEM2 ×2, selagens HEM1 ×2 |
| SEG 21/12 | 0,6h 🌿 | 8h | 1,6h | dia leve previsto |

Só um dia passa do limiar, por 0,7h → **sem proposta de ritmo 4** (a regra pedida era sinalizar se *vários* dias ficassem *muito* acima). Opção, se ela quiser: T9 = 4 → 17/12 cai para 7,0h, 19/12 5,5h, 20/12 4,9h; alcance 40 → 39.

## 6 · Simulados

Confirmado em teste (trilha.js TRsim): na janela 20/10–01/01 os simulados ligados são **06/11 e 18/12**. **23/10, 20/11 e 04/12** mostram "Sexta de plantão: sem simulado pela regra" (o botão religa — e religar transforma as etapas daquela sexta em ⏳ com "Ver como recolocar", testado); **01/01** mostra "último dia de acesso: sem simulado pela regra". Sexta de simulado não recebe etapa de módulo.

## 7 · O que mudou no histórico (até 19/10)

- **historico.js (82/82):** o app de antes da Trilha (commit 11c65b8) e o novo foram comparados **dia a dia nas semanas 1–41** (07/01–19/10), lendo da tela título, 💊, avisos, botão do simulado, selos, seletor 🌿 e cada bloco (texto, tempo, módulo, tarefas, ✓, campos de %), em dois modos: relógio na quarta de cada semana e relógio em 21/10 navegando ◀. **Única diferença: a TER 20/10 saiu da Sem.41** (virou o 1º dia da Trilha). Todos os outros 286 dias, idênticos.
- **Consequências visíveis (esperadas):** a Sem.41 tem 6 abas (14–19/10); as etapas que o motor antigo punha em 20/10 ou depois somem (ex.: na Sem.41, a apostila do Fio 2 e a aula do Fio 4 que caíam na TER 20/10; selagens que cairiam em 21–27/10); o 🌿 da Sem.41 continua calculado com os 7 dias originais — quando ele cai na TER 20/10, nenhum selo aparece em 14–19/10.
- **Sugestão de redistribuição na fronteira:** antes, em 15/10, abria um fio com apostila na TER 20/10 e selagem no SÁB 24/10; agora diz "Nada cabe sem quebrar a ordem…" — o motor antigo nunca propõe dia da Trilha.
- **Registros:** `progress_v1`, `fioWeek`, `weekGroups`, `schedule_v1` ficam como estavam; nenhum `fioWeek` ≥ 20/10 é gravado. Dias editados à mão com data ≥ 20/10 continuam valendo, com aviso e "↺ Voltar ao padrão" (a edição vai para `medplanner_schedule_archive_v1`).

## 8 · Decisões superadas ou suspensas na Trilha

(Valem só no histórico até 19/10; registradas no §16 do briefing.) **8** projeção de zeramento → linha de alcance até 01/01 · **13, 26, 31** CATCHUP, ritmo travado em 2 e fronteiras de fase → nunca chegam a valer · **18** reta final em pipeline · **20** P1/`fioWeek` → `trilhaWeeks`/`trilhaPlan` · **35** 🔄 redistribuição → ⏩ Adiantar e ⏳ recolocar · **47** 📌 no meio da semana → 📌 da fila da Trilha · **48** bloco de revisão fixo → revisão "só se vencer" · **15** dia leve calculado depois → **previsto antes** de distribuir · entrada adaptativa do §5/§9 → cadeia sempre completa. Novas: decisões **55–73** (briefing §16).

## 9 · Passagem pelos oito

| Membro | Pede / verifica | Veto? |
|---|---|---|
| 🧠 Psiquiatra | dia sem remédio protegido (nunca aula nova; previsto antes); **nenhum horário de medicação** em texto algum (testado nos 74 dias + abas); no 04h30 só "janela do estimulante a validar com a psiquiatra" | não |
| 🧩 Neuropsicóloga | o app lembra por ela: ⏳/🔓/⏩ uma decisão por vez, linha de alcance, 📦, recolocação final; propostas com dia e carga | não |
| 📚 Ciência da aprendizagem | cadeia completa sempre, faixas da decisão 40 em todos os 40 módulos; registro próprio; revisões só dos % da Trilha | não — mas ver conflito (1): os intervalos ideais cedem ao tempo hábil |
| 🩺 Preceptor | cirurgia primeiro, depois a ordem do curso; ↑↓ e 📌; nota do CIR3 | não |
| 😴 Médico do sono | plantão longo sem etapa de mesa; 04h30 com 📚 a 5h; véspera ~20h30/~21h45; **nenhum dia acima do tempo hábil** na prévia | **vetaria a ordem aprovada do score** (4 dias acima do tempo hábil, pior 19,7h) — por isso a ordem foi trocada (conflito 1); vigia 11 e 13/11 |
| 🏃 Educador físico | academia livre em 6 dias, sábado sem treino, opcional no plantão longo | não |
| 💬 Psicóloga TCC | nada grava sem "Aplicar"; textos sem culpa ("sem culpa: posso propor novos dias"); "e se esta semana virar manutenção?" sob demanda, tom neutro | não |
| ⚙️ Engenheiro | histórico intacto (82/82), nada apagado, projeção honesta, 735 checks, `cmp` | não |

## 10 · Conflitos e bordas achados rodando — decididos em 20/10 (ver §0)

1. **Ordem do agendador (😴 × 📚).** O plano aprovado ordenava: dia protegido → intervalos ideais (questões→apostila ~1d, apostila→selagem ~3d) → **tempo hábil** → 📚 … Rodando, essa ordem dava **4 dias acima do tempo hábil**: QUI 29/10 17,3h · **SEG 16/11 19,7h (10,7h de estudo num dia de 04h30)** · SEG 23/11 15,7h · SEG 30/11 15,2h. Implementei **tempo hábil antes dos intervalos**: 0 dias acima do tempo hábil; todos os intervalos continuam dentro das faixas; o custo é ficar menos vezes no ideal — questões→apostila em 1 dia: 31/40 (era 33/40) · apostila→selagem em 3 dias: 33/40 (era 38/40) · aula→questões em 1 dia: 15/40 (era 19/40). **Confirmado em 20/10.**
2. **QUA 11/11 e SEX 13/11 com ~10,3h de estudo** (entre os plantões longos de 10 e 12/11; total do dia 11,3h, abaixo do tempo hábil). Saída sem custo: mover blocos. O − da T3 resolve (11/11 → 6,6h, 13/11 → 8,5h) mas **custa 6 módulos** (alcance 40 → 34), porque o bloco 04h30 não deixa o ritmo voltar a subir até 15/12; T4 = 3 → alcance 35 e só 13/11 melhora (8,6h). **Decidido em 20/10: ficam assim; ela move blocos se pesar.**
3. **1º acesso tardio.** A regra aprovada dá à semana do 1º acesso a cota inteira "a partir daquele dia". Se a Trilha fosse aberta pela 1ª vez num sábado do bloco 04h30 (ex.: 28/11), as 4 aulas só caberiam em DOM e SEG e a **SEG 30/11 somaria 15,0h** (com ⚠️). Na prática não acontece (ela abre em 20/10; aberturas de 20 a 26/10 testadas sem excesso), → **aprovada em 20/10 a cota proporcional aos dias que restam**, implementada (§0).
4. **Revisão vencida em dia cheio (pré-existente — proposta para ela decidir).** A capacidade do agendador não conta a revisão adaptativa (45min), que só existe depois do % da selagem. Com o 1º acesso hoje (20/10), se a selagem de CIR1 (26/10) for registrada com % < 60 ou ≥ 80, a revisão D+7 cai na QUI 05/11 e o dia vai a **15,25h** (era assim antes da cota proporcional também); com % < 60, a SEX 20/11 vai a 14,6h. O app mostra ⚠️ no dia e a revisão pode ser feita no dia seguinte. **Proposta:** revisão vencida que levaria o dia acima do tempo hábil vira opcional e desliza para o próximo dia com folga, como já acontece no plantão longo (decisão 66). Não mexi sem a decisão dela.
5. **Interpretação (⚙️), para registro:** "dia protegido aceita etapa leve" foi aplicada com capacidade — uma etapa em dia protegido também respeita o 📚 daquele dia (sem isso, quatro apostilas caíam no 24/12).

## 11 · Nota do briefing — CIR3 Preparo Pré-operatório

O **CIR3 Preparo Pré-operatório e Risco Cirúrgico** (#6 na fila, aula prevista 30/10) apoia-se em cardiologia, que vem depois (CAR1 Intro à Cardiologia + Arritmias I é o #52, fora do alcance). Fica na posição atual, como pedido; ela pode movê-lo com ↑↓ na aba Trilha (só enquanto não estiver planejado — a T2 congela em 27/10). Registrado no briefing (§11-T) e no protocolo (§7-T).

## 12 · A bateria de testes

- **Novos:** `trilha.js` (TR0–TR14 + invariantes), `historico.js`, `coverageTrilha.js`, `intervalsTrilha.js`; `coverage41.js` (era `coverage45.js`: semanas 1–41); `intervals16.js`/`loads16.js` só com a Sem.38/39 (tabelas idênticas às do app antigo).
- **audit.js (393 checks):** aposentados S7, S8b, S15, S16b, S16g2, S19d2 (cada um com o motivo no código e a cobertura equivalente); reescritos na Trilha S8, S8c, S9, S9b, S12, S16e, S18f2, S19d; re-datados para antes de 20/10, com a premissa conferida no app antigo, S10 (→ 23–29/09), S16a/S16d/S16g (→ Sem.39/40), S16f (−14 dias), S18b/S18g (→ Sem.41 com bloco adicionado), S18d/S18d2/S18h (→ Sem.38), S19b/S19b2 (→ Sem.39), S19h (→ 25/09), S20a/S20g (→ Sem.40); S6, S10b, S10c, S16, S16c recortados para a Sem.41 de 6 dias.
- **harness.js:** abas por data, `reopen`, `markUntil`, `banner`/`clickIn`; `pageerror` vira ❌; todo script sai com código ≠ 0 em falha.

## 13 · Próximo passo

Aval dado em 20/10 com as decisões do §0; a decisão 3 entrou no mesmo PR (#15), com a bateria completa rodada de novo antes do merge.

## 14 · Depois do merge: decisão 73 (20/10) — PR próprio

- **Revisão vencida em dia cheio:** aplicada a proposta do §10, item 4. Quando a revisão levaria o dia acima de 14,5h no total — ou, num dia de limiar reduzido (04h30, pós-noturno, 24/25/31/12), acima desse limiar de estudo —, ela vira opcional ("Revisão adaptativa — opcional hoje: o dia já está cheio; se não fizer, ela passa para SÁB 07/11") e desliza para o próximo dia com folga, como no plantão longo. Não entra no ⏳; o alerta conta o atraso só a partir do 1º dia que tinha folga ("passou para hoje (o dia em que venceu estava cheio)").
- **Efeito medido (simulação progressiva, com revisões):** nenhuma data de 1º acesso (20/10 → 28/12) deixa algum dia acima de 14,5h (antes: 2 datas; antes da cota proporcional: 15). Com o 1º acesso em 20/10 e selagens a 50%, 70% ou 85%, as revisões deslizam no máximo 2 dias (a maioria não desliza).
- **Revisão adversarial (semântica, texto, regressão):** corrigidos antes do PR (1) a linha de estado cortada com reticências no celular — agora em linha própria; (2) "opcional" no bloco e "em atraso" no alerta no mesmo dia cheio — o dia cheio sempre vence; (3) "passou para hoje" em dia futuro — agora "passa para este dia"; (4) depois de ⏳ Recolocar, o dia cheio do passado era reavaliado pelo plano novo e a revisão voltava "em atraso" — o dia cheio fica gravado (`trilhaRevFull`); (5) depois de 01/01 toda revisão dizia "o dia está cheio" — a regra para em 01/01; (6) a folga ignorava dia editado à mão — agora usa a lista real. Testes TR15, TR15b–e.
- **Arredondamento da 1ª semana:** mantido `Math.round`, confirmado pela paciente.
- **Bateria do PR da decisão 73:** audit 393 · trilha 155 · historico 82 · coverage41 80 · coverageTrilha 7 · intervalsTrilha 10 · intervals16 7 · loads16 12 → **746 checks**, todos verdes; `index.html` idêntico (`cmp`).
