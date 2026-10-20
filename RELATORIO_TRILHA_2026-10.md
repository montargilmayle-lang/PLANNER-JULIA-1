# Relatório — TRILHA AUTÔNOMA (20/10/2026 → 01/01/2027)

Entregue antes do merge, como pedido ("bateria completa verde, `cmp` do `index.html`, PR sem merge e relatório antes"). Plano aprovado: *TRILHA AUTÔNOMA — substitui o cronograma do cursinho a partir de 20/10/2026*. Data do relatório: 20/10/2026.

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
