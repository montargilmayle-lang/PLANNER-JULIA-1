# Relatório — TRILHA AUTÔNOMA (26/10/2026 → aula nova até 01/01/2027, cauda em janeiro; transição 20–25/10)

Entregue antes do merge, como pedido ("bateria completa verde, `cmp` do `index.html`, PR sem merge e relatório antes"). Plano aprovado: *TRILHA AUTÔNOMA — substitui o cronograma do cursinho a partir de 20/10/2026*. Data do relatório: 20/10/2026. **Revisão de 10–11/11/2026: regra de 01/01 — aula nova só até 01/01, questões, apostila e selagem seguem em janeiro (decisões finais da paciente de 10/11) — §D.** **Revisão de 07/11/2026 (2): mover o fio todo junto (pedido da paciente; PR próprio) — §C.** **Revisão de 07/11/2026: restaurar o plano ao estado da última atualização (pedido da paciente) — §B.** **Revisão de 26/10/2026: início adiado para 26/10 (pedido da paciente), com 20–25/10 de transição — §A.** As seções §0–§14 ficam como estavam (medidas com início em 20/10, decisões já tomadas); os números do plano de 26/10 estão em §A, e os da regra de 01/01 (o plano vigente) em §D.

## D · Regra de 01/01 (decisões finais de 10/11/2026) — decisões 77–91

**Quem pede:** a paciente (💬 📚 🧩), com o mecanismo proposto em 09/11 e as decisões finais de 10/11 (itens 1 a 11, aqui "DELA 1–11"), mais a correção 0b ("sem dia" nunca some calado), que ela pediu neste mesmo PR. Implementado em etapas (S0 a S10), cada uma com checkpoint e conferência independente; depois, três rodadas de revisão do diff inteiro. **Não fazer merge antes do aval.** No briefing: §11-T, §14 N e §16, decisões 77–91.

### D.0 · Em linguagem simples — o que muda para você

- **Aula nova: até 01/01.** Depois disso o app não põe aula nova em dia nenhum. Todo o resto continua: apostilas, questões, caderno de erros, banco de questões, revisões, smartcards e simulados — e você pode rever uma aula que já assistiu.
- **O que começou em dezembro termina em janeiro.** Questões, apostila e selagem de um módulo aberto seguem nos dias de janeiro (a "cauda"), com os mesmos intervalos de sempre. Na simulação com os seus dados (fazendo cada etapa no dia), tudo fecha até **domingo 03/01**, antes do 1º dia do cursinho novo (04/01).
- **01/01 virou um dia comum.** Pode ter aula. Não tem simulado pela regra (se quiser fazer, o botão religa). Tem o 🏁 lembrando de conferir o que segue aberto para janeiro e de fazer o 💾 backup. Nenhuma tela pede para "exportar antes de perder": os materiais continuam com você.
- **Janeiro:** os dias aparecem como "livre provisório (a grade do cursinho novo ainda não chegou)", sem horário inventado. Nas semanas de janeiro nenhum dia leve é marcado sozinho; se quiser, você escolhe um no seletor 🌿. Os simulados seguem a quinzena de sempre (15/01 e 29/01), com o botão liga/desliga.
- **No máximo 5 módulos abertos ao mesmo tempo** (da aula até a selagem). Quando já há 5, o próximo módulo espera, e o app diz por quê: "Já há 5 cadeias abertas — o próximo módulo espera uma fechar". Isso só vale para começar módulo novo; nunca atrasa o que já está aberto.
- **No máximo 2 aulas no mesmo dia.** A 2ª só entra quando, com uma aula por dia, algum dia passaria de 14,5h, e só em dia sem plantão, fora do dia leve, do dia depois do plantão noturno e de 24, 25 e 31/12. Na simulação com os seus dados, isso acontece em 3 domingos (22/11, 29/11 e 06/12). Os dias que já estavam combinados (09/11 com 4 aulas, 15/11 com 2) ficam como estão: o app só mostra.
- **No dia leve:** apostila ou selagem. Questões só como última saída, e com o aviso 🌿. Aula nova, nunca.
- **A aula conta pela data do ✓.** Se você assistiu e não marcou, marque no bloco do dia em que assistiu. Um módulo sem nenhuma marca, cuja aula não foi marcada até 01/01, sai do calendário a partir de 02/01 (fica só o bloco da aula, no dia em que ela estava) e aparece no balanço como "aula não assistida até 01/01". Nada é apagado: se você marcar, o módulo volta e o ⏳ propõe os dias.
- **De 29/12 a 01/01** o app continua recolocando sozinho o que estiver aberto, uma vez por dia (é a única coisa que ele grava sem o seu "Aplicar"), e agora pode usar dias de janeiro. **Depois de 01/01 nada se move sozinho:** o ⏳ propõe, você decide com "Aplicar".
- **Revisões:** o app lembra até a última revisão prevista e mostra "lembro até DD/MM (estimado)". Nessa data o cartão de revisões fecha, e o que sobrou aparece no balanço, com a data.
- **Botão novo "⏹ Encerrar a cauda agora":** se você quiser parar a cauda antes, ele mostra o que vai para o balanço, só grava com "Aplicar" e tem "Desfazer". Nada é apagado.
- **O alcance tem dois números:** "Aulas até 01/01" e "Cadeias completas (com janeiro)".
- **Nada some calado:** uma etapa que ficou sem dia aparece como "sem dia" no aviso ⚠️, no painel da semana, no 📦 e no ⏳.

### D.1 · As decisões (10/11) e onde estão

| Dela | Decisão (briefing §16) | O que o app faz | Testes |
|---|---|---|---|
| mecanismo de 09/11 | 77 | aula só até 01/01 por todo caminho; questões, apostila e selagem nas faixas, sem data-limite; semana final por data; cauda C1 = SÁB 02/01–SEG 04/01 e depois TER→SEG; o calendário termina sozinho; aula não assistida até 01/01; dois números | TR19a–c, TR19h, TR19i, TR19q, TR19s, TR19n; `simTrilha` |
| 1 | 78 | K = 5, inclusivo, só ao abrir cadeia nova, com o motivo na tela | TR19f, TR19v, TR19n-b; `simTrilha` |
| 2 | 79 | 2ª aula só com o gatilho de 14,5h, nunca 3, só em dia permitido, área diferente no desempate; questões no dia leve só como última saída, com 🌿 | TR19e, TRleve; `intervalsTrilha`, `simTrilha` |
| 3 | 80 | ⏩ pode usar a 2ª aula, com " · 2ª aula neste dia" e Aplicar | TR19e-i |
| 4 | 81 | T10 com ritmo 0; −/+ para ela decidir; ⏩ na T10 como antes | TR19u |
| 5 | 82 | 01/01 dia comum: aula, 📚 8h, sem simulado pela regra, 🏁 | TR19a, TR19s, TR19p |
| 6 | 83 | nenhum dia leve previsto na cauda; seletor 🌿 continua | TR19i, TRleve |
| 7 | 84 | medido: cabe; regra ligada (selagem até 03/01) | TR19t; `simTrilha` (I × II) |
| 8 | 85 | recolocação de 29/12 a 01/01 grava janeiro; depois só ⏳ + Aplicar | TR19r, TR19p, TR19a-iii, TR18j/k |
| 9 | 86 | R‑a: "lembro até DD/MM (estimado)", card fecha, sobras no balanço | TR15e, TR19j; `simTrilha` |
| 10 | 87 | "⏹ Encerrar a cauda agora" com prévia, Aplicar e Desfazer | TR19k, TR19rv1 |
| 11 | 88 | materiais depois de 01/01; 📦 e balanço sem exportação; 🎬 em janeiro; simulados 15/01 e 29/01 | TR19m, TR19o |
| 0b | 89 | "sem dia" no ⚠️, no painel, no 📦 e no ⏳ | TR19l, TR19d, TR19g-x50 |
| orquestrador | 90 | DECISOES do S4: (g) fora de ordem, (e) semana sem app depois de 01/01, (f) começado sem plano, (d′) rótulos do 📦, "Deixar neste dia" no ⏳ | TR19w, TR19y, TR19z, TR19d-iii/iv |
| — | 91 | conflitos aplicados pelo padrão (§D.7) | — |

### D.2 · O mecanismo, resumido

- **Dois tetos.** `AULA_END` = 01/01 vale só para a aula, em todo caminho (rampa, ⏳, recolocação automática, ⏩, 🔓, Reorganizar, "Propor a aula primeiro", movimentos). Questões, apostila e selagem vão até `PLAN_HZ` = 28/06/2027, um horizonte técnico que nunca aparece; na prática as faixas seguram.
- **Calendário.** Depois da T10 vêm as semanas da cauda, com ritmo 0. O que ela vê vai até o fim da semana da última etapa ou revisão; quando não há mais nada, o app para de gravar e mostra o encerramento.
- **Colocação em passos.** P1 (1 aula por dia, sem questões no dia leve, até 14,5h) → P2 (2ª aula, só com o gatilho) → P3 (questões no dia leve, última saída) → P4 (o comportamento de antes, com 1 aula por dia, só para cadeia já aberta). Módulo novo que não cabe em P1–P3 não entra ("não coube"). Dentro de cada passo vale a ordem de sempre (decisão 69), com "fechar até 03/01" logo depois do tempo hábil e "área diferente" logo antes de "aula mais cedo".
- **K = 5** só ao abrir cadeia nova; o motivo aparece na rampa, no painel, no 🔓, no ⏩ e na restauração.
- **Semana final por data (29/12–01/01).** A recolocação diária pode gravar janeiro. Aula sem outro dia até 01/01 fica na data (o bloco continua lá para ela marcar) e as seguintes ficam "sem dia".
- **Depois de 01/01:** aula não assistida sai do calendário e vai para o balanço; ⏳ com o motivo novo "sem dia"; revisões até o horizonte R‑a; "⏹ Encerrar a cauda agora"; balanço em três modos ("aulas" na aba Trilha, uma linha "compacta" no Cronograma, "fim" quando a cauda acaba).
- **Dados que já estão no aparelho dela:** nada é migrado. T1–T3, o plano com `orig`/`hist`/`keep`, as revisões e as restaurações carregam iguais.

### D.3 · A tela de hoje (09/11 e 10/11) e de 17/11 em diante

Medido pelo TR19n: a versão de antes (409e1f9) usada de 26/10 a 10/11, ela fazendo tudo no dia; depois a versão nova abre os mesmos dados.

- **Nada muda no que já estava combinado.** Config, registro e dias gravados ficam byte a byte iguais. Os 22 dias de 26/10 a 16/11 (T1–T3) mostram a mesma lista na versão de antes e na nova.
  - **SEG 09/11** (plantão 06h–09h30): 4 aulas — CIR2 Cicatrização de Feridas e Queimaduras, CIR2 Cirurgia Pediátrica, CIR3 Preparo Pré-operatório e Risco Cirúrgico, CIR3 Hérnias da Parede Abdominal. Só reportado, nunca alterado.
  - **DOM 15/11** (feriado, "📚 8,2h de estudo — acima de 8h: se não der, mova blocos"): 2 aulas — CIR4 Especialidade Cirúrgica Parte I e Parte II — mais GIN1 questões e NEF1 apostila.
- **17/11 (T4) com as regras novas:** NEF1 Glomerulopatias II, GIN1 Amenorreia, NEF2 Distúrbio Hidroeletrolítico e OBS1 Diagnóstico de Gravidez; aulas em 18/11, 20/11 e DOM 22/11 (NEF2 + OBS1, 2ª aula em domingo sem plantão); no máximo 5 cadeias abertas (em 18/11). Com estes dados, a versão de antes congelaria a mesma T4.
- **De 17/11 a 01/01 (realista, `simTrilha`):** 3 dias com 2 aulas — DOM 22/11 (NEF2 + OBS1), DOM 29/11 (PRE1 + PED1) e DOM 06/12 (REU1 + PED1) —, nunca 3. A versão de antes punha mais de 1 aula em 7 dias desse trecho (os mesmos 3 + 15/12 com 2, 17/12 com 3, 22/12 e 27/12 com 2).
- **Se a semana de 10/11 (T3) ainda não tiver congelado** quando a versão nova abrir pela 1ª vez (TR19n-b), a T3 congela pelas regras novas: com as cadeias da T1–T2 ainda abertas, entra 1 módulo (CIR4 Parte I, aula em 15/11) e 3 esperam, com o motivo na tela. A versão de antes punha 4 e chegava a 8 cadeias abertas em 15/11. Depois de uma restauração feita na versão de antes (TR19n-c, restaurada em 07/11), a T3 congela na nova com 0 módulos (4 esperam). Restauração, Desfazer e Refazer da versão de antes continuam funcionando na nova.

### D.4 · A tela com etapa sem dia (TR19l)

**Caso A′ — simulado religado em 01/01 e a apostila do PED2 deixada em 01/01** (as questões e a selagem ficam sem dia). Em 31/12 e em 01/01:
- ⚠️ "PED2 (Aleitamento Materno) aberto — questões, selagem sem dia. A aula só tem dia até 01/01: se você assistiu, marque no bloco do dia em que assistiu."
- painel da semana: "aula 30/12 · questões sem dia · apostila 01/01 · selagem sem dia";
- ⏳ "Ficaram para trás 1 etapa (PED2 · aula de QUA 30/12) — sem culpa: posso propor novos dias.";
- 📦 "Semana final (31/12): nenhuma etapa recolocada (as etapas sem dia estão no aviso ⚠️ acima). Aula sem outro dia até 01/01: PED2 · Aleitamento Materno (fica no ⏳; se você assistiu, marque no bloco do dia em que assistiu). Carga dia a dia: TER 29/12 3,3h · QUA 30/12 5,2h · QUI 31/12 1,3h · SEX 01/01 10,1h · SÁB 02/01 2,3h · 01/01 com simulado (sua escolha): sem etapa de módulo."
- **Em 02/01**, sem nenhuma marca no módulo: ele sai do ⚠️ e do ⏳; o balanço diz "Aula não assistida até 01/01: PED2 · Aleitamento Materno (planejada QUA 30/12) … — se você assistiu, marque no bloco do dia em que assistiu e a cadeia volta."; o bloco da aula continua em 30/12; 31/12 e 01/01 não mostram mais etapa do PED2 (nunca questões sem aula). A conta fecha: 32 fechados + 1 aberto + 1 não assistida + 59 fora = 93.

**Caso B′ — dias editados por ela e a aula do HEM1 Anemias I em 28/12 sem outro dia até 01/01.** A recolocação de 29/12 deixa a aula em 28/12 e as três etapas seguintes sem dia (com o histórico "final"). De 29/12 a 01/01 aparecem o ⚠️ ("… aberto — questões, apostila, selagem sem dia. A aula só tem dia até 01/01: …"), o painel ("questões sem dia · apostila sem dia · selagem sem dia"), o ⏳, o 📦 ("Aula sem outro dia até 01/01: HEM1 · Anemias I …") e, no dia em que a selagem estava, "↷ Trilha · HEM1 — selagem sem dia (veja o aviso ⚠️ e o ⏳)". Em 02/01 o módulo vai para o balanço, como no caso A′.

### D.5 · Decisão 7 — "fechar até 03/01", com e sem a regra

Medido antes de implementar (measure7, conferido por verify7, 0 divergências) e de novo no build final (`simTrilha`, medições; igual ao measure7 em todas as células comparáveis). I = intervalo ideal (sem a regra) · II = fechar até 03/01 (o que está no app). Cenário realista (T1–T3 pela versão de antes; ela faz tudo no dia) e estresses ("fora" = abre o app, mas não marca nem aplica).

| Cenário | Ramo | Aulas até 01/01 | Cadeias completas | Fechadas até 01/01 | Até 03/01 | Todas até 03/01? | Última etapa |
|---|---|---|---|---|---|---|---|
| S0 realista | I | 36 | 36 | 34 | 35 | não | SEG 04/01 (selagem HEM1 Anemia II) |
| S0 realista | **II** | 36 | 36 | 34 | **36** | **sim** | **DOM 03/01** |
| S-a (fora 29–30/12) | I | 36 | 36 | 34 | 34 | não | TER 05/01 |
| S-a | II | 36 | 36 | 34 | 35 | não | TER 05/01 |
| S-b (fora 02–08/01) | I = II | 36 | 36 | 34 | 34 | não | SÁB 09/01 (⏳ em 7 dias) |
| S-c (para em 04/01) | I | 36 | **35** | 34 | 35 | não | HEM1 Anemia II fica aberta; ⏳ até o horizonte |
| S-c | II | 36 | 36 | 34 | 36 | sim | DOM 03/01 |
| S-d (fora 22–26/12) | I | 36 | 36 | 31 | 32 | não | QUI 07/01 |
| S-d | II | 36 | 36 | 32 | 34 | não | QUA 06/01 |

- **Cabe sem dia leve na cauda: sim.** Por isso a regra está ligada.
- No realista, **a única data que muda** é a selagem de HEM1 Anemia II: 04/01 → 03/01 (cadeia 28/12 → 30/12 → 01/01 → 03/01, intervalos 2 · 2 · 2, dentro das faixas). Ela é decidida na T9 (22/12); antes de 22/12 nada muda.
- Carga de 29/12 a 04/01 (📚 · total), igual nos dois ramos exceto 03/01 e 04/01: 29/12 🌿 1,33 · 2,33 · 30/12 5,50 · 6,50 · 31/12 🎄 1,33 · 2,33 · 01/01 2,08 · 3,08 · 02/01 2,25 · 2,25 · **03/01** com a regra 2,00 · 3,00 (selagem) / sem a regra 1,33 · 2,33 · **04/01** sem a regra 2,00 · 3,00 (selagem).
- "Lembro até" (último horizonte): 31/01 com a regra, 01/02 sem.

### D.6 · Carga dia a dia de 29/12 até o fim da cauda, e o alcance nos dois números

**Com os seus dados** (realista: T1–T3 como estão no aparelho; de 17/11 em diante ela faz tudo no dia e aplica o ⏳):

| Dia | 📚 estudo / limiar | Total / 14,5h | Etapas |
|---|---|---|---|
| TER 29/12 (🌿 dia leve) | 1,33 / 8 | 2,33 | — (revisão 45 min) |
| QUA 30/12 | 5,50 / 8 | 6,50 | HEM1 Anemia II questões · PED2 apostila · HEM2 Linfomas selagem (+ revisão) |
| QUI 31/12 (🎄) | 1,33 / 3 | 2,33 | — (revisão) |
| SEX 01/01 | 2,08 / 8 | 3,08 | HEM1 Anemia II apostila |
| SÁB 02/01 | 2,25 / 8 | 2,25 | PED2 selagem (+ revisão) |
| DOM 03/01 | 2,00 / 8 | 3,00 | HEM1 Anemia II selagem — a última (+ revisão) |
| 04/01 → 31/01 | ≤ 1,33 / 8 | ≤ 2,33 | só revisões (45 min), em alguns dias |
| SEX 15/01 e 29/01 (simulado) | 8,58 / 8 | 9,58 | simulado + correção, sem etapa de módulo |

- Nenhum dia acima de 14,5h; os únicos acima do 📚 de 8h na cauda são as duas sextas de simulado. Calendário até 08/02 (6 semanas da cauda); em 02/01 o app "lembra até 02/02 (estimado)"; o último horizonte cai em 31/01 e a cauda acaba em 01/02.
- Cadeias que terminam depois de 22/12: PRE3 (17/12 → 23/12), REU2 Vasculites (20/12 → 27/12), HEM1 Anemias I (19/12 → 27/12), HEM2 Leucemias (22/12 → 27/12), HEM2 Linfomas (23/12 → 30/12), PED2 Crescimento (27/12 → 02/01), HEM1 Anemia II (28/12 → 03/01), todas nas faixas.

**Alcance nos dois números:**
- **Com os seus dados:** "Aulas até 01/01: 36 · Cadeias completas (com janeiro): 36" — iguais em 17/11, 15/12, 01/01 e 02/01; 34 cadeias fecham até 01/01 e as 36 até 03/01.
- **Prévia de config nova** (19/10, ou 1º acesso em 26/10): 34 aulas = 34 cadeias (antes 36). A diferença vem de 1 aula por dia (a T2 fica com 1 "não coube") e do K (a T3 com 1 "espera").
- **Progressiva** (1º acesso 26/10, tudo no dia, selagens a 50, 70 e 85%): 34 aulas · 34 cadeias (32 até 01/01, 2 em janeiro, até 03/01); nenhuma aula depois de 01/01; nenhum dia acima de 14,5h (pior 13,95h); 0 intervalos fora das faixas; 0 questões no dia leve; K máx. 5; revisão desliza no máximo 1 dia.
- **Varredura do 1º acesso** (64 datas, 26/10 → 28/12): nenhum dia acima de 14,5h; aulas até 01/01 = 34 (26 e 27/10), 33 (28–30/10), 32 (31/10–02/11).
- **Se ela subir a T10 em 15/12** (−/+ da DELA 4; aulas só em 30/12 e 01/01): T10 = 0 → 36/36 · 1 → 37/37 · 2 → 38/38 · 3 → 38/38 · 4 → 38/38 (o 3º e o 4º aparecem como "· N não coube"). Na leitura larga do gatilho seriam 39 com a T10 em 3 ou 4 (2ª aula em 01/01) — conflito C1/C12.
- **Marcas incompletas** (3 selagens da T1 feitas e não marcadas até 16/11): a T4 congela com 2 módulos (1 espera pelo K); aulas até 01/01 36 → 29 (1 pelo K; os outros pela semana segurada e pelo bloco 04h30, regras de antes). Na prévia de 17/11 o número cai para 21 e volta a 29 quando ela aplica o ⏳ das 3 selagens. O motivo aparece na rampa e no painel (conflito C2).

### D.7 · Conflitos e escolhas — o padrão aplicado, a alternativa e os números

Nada aqui foi decidido por ela. Em cada um ficou o padrão conservador do desenho ("padrão até o aval dela"); a alternativa está pronta para ser trocada se ela preferir.

**Do desenho (C1–C24):**

| Id | Ponto | Padrão aplicado | Alternativa | Números |
|---|---|---|---|---|
| C1 | Quando entra a 2ª aula | estrito (DELA 2) na rampa, 🔓, ⏳, recolocação e Reorganizar; no ⏩ também quando falta dia sem aula (DELA 3) | (a) estrito também no ⏩; (b) largo em tudo | ⏩ no realista (42 dias): 14 ofertas com 2ª aula, que no estrito virariam "não cabe"; alcance só difere com a T10 ≥ 3 (38 × 39) |
| C2 | K com selagem atrasada ou sem dia | conta como aberta até ganhar data ou fechar, julgada em `min(from, hoje)` | só até a selagem planejada | marcas incompletas: 36 → 29 (1 pelo K) |
| C3 | Cadeia nova que não cabe em P1–P3 | não entra ("não coube") | o comportamento de antes (14,5h como penalidade) | no realista, o mesmo resultado |
| C4 | Aula sem outro dia até 01/01 | fica na data; seguintes sem dia; depois de 02/01 o bloco da aula continua no dia | aula nula; ou "sai do calendário" | TR19l-b, TR19e-ii |
| C5 | 01/01 candidato a dia leve | sim (dia comum) | fora | a T10 continua com 29/12 |
| C6 | Encerrar × revisões | as revisões continuam até o horizonte | encerrar também as revisões | — |
| C7 | Depois do horizonte R‑a | o card **e** o "🔁 REVISAR" da aba Módulos somem | manter o "REVISAR" | — |
| C8 | Restauração × encerramento | o encerramento volta ao padrão; o Desfazer da restauração o devolve | a restauração não toca nele | — |
| C9 | Etapa marcada, aula sem marca, depois de 01/01 | fica no ⏳ só com "Marquei a aula" | ir para o balanço como não assistida | TR9c-0301 |
| C10 | Aula marcada pelo card depois de 01/01 | a cadeia volta, mas a aula não conta em "Aulas até 01/01" | contar | TR19q |
| C11 | Posição da "área diferente" | logo antes de "aula mais cedo" | antes dos intervalos | antes dos intervalos, 30/12 subiria de 9,2h para 10,9h |
| C12 | T10 subindo | no máximo 2 aulas (1 por dia) | leitura larga | T10 em 4: 01/01 com 5,78h de 📚 e 30/12 com 7,2h; larga: 01/01 com 2 aulas e 7,48h |
| C13 | Selagem em 04/01 | resolvido pela decisão 84 | — | §D.5 |
| C14 | Horizonte técnico | 28/06/2027 (depois dele, encerramento) | fim de 2027 | cobre o R‑a com folga |
| C15 | Dia leve escolhido por ela na cauda | vale | — | TR19i |
| C16 | 2ª aula na recolocação automática | só pelo gatilho estrito, registrada no 📦 | larga, ou nunca | estresse S-a com T10 ≥ 2: o estrito perde a aula de 30/12 (vai para o balanço); o largo a põe em 01/01 |
| C17 | Aviso de 2ª aula no bloco da rampa | não (só ⏩, ⏳ e movimentos avisam) | sufixo no bloco | 3 domingos |
| C18 | Aula que ela pôs no dia leve, de 29/12 a 01/01 | a recolocação a tira de lá; o aviso do movimento deixa de dizer "fica assim" nesses dias | respeitar como escolha dela | TR18k, TR18f |
| C19 | Teto do 📚 na recolocação automática | mantido; o que só cabe acima vai para o ⏳ (até 14,5h) | até 14,5h | é a única gravação sem Aplicar |
| C20 | A T10 é "semana de janeiro"? | não: mantém o 🌿 previsto em 29/12 | sem dia leve na T10 | sem ele, o intervalo ideal já fecharia tudo até 02/01 |
| C21 | Módulo com a aula marcada pela rampa | como cadeia já aberta (sem K, com P4) | só P1–P3 | sem o P4 a rampa da semana inteira poderia travar |
| C22 | Mover a aula para depois de 01/01 | o movimento inteiro é recusado, sem pergunta | "aula fica sem dia" | o seletor nunca oferece esse dia |
| C23 | Merge entre 29/12 e 01/01 | sem reexecução por versão; o que o código velho deixou sem dia aparece no ⚠️/⏳ e a recolocação nova roda no dia seguinte | reexecutar uma vez | a reexecução quebraria o Desfazer da restauração |
| C24 | Começado (etapa marcada) sem plano depois da última semana com ritmo | só aviso (badge, ⚠️, balanço) | proposta no ⏳, criando a entrada no plano | — |

**Do orquestrador no S4 (DECISOES; aplicam regras já aprovadas):**
- **(g) começado fora de ordem** (etapa marcada depois de etapa sem marca): não recebe cadeia nova pela rampa, ⏩ ou 🔓 (é pulado só nesse caso, fica fora do K, aviso neutro); guarda de ordem em todos os caminhos. Alternativa: deixar como no HEAD, que travava a rampa (30 → 9) ou propunha a selagem antes da aula. Dentro disso: "Propor X primeiro" continua valendo como escolha dela (a guarda não vale no reabrir); na recolocação automática, um módulo com marca fora de ordem fica com as seguintes "sem dia" em vez de ganhar cadeia fora de ordem.
- **(e) semana sem app vista depois de 01/01:** congela como estava planejada (regra de 19–20/10); também com a cauda já parada. Na 2ª semana seguida sem abrir o app, congela como teria congelado no início dela (em 3 de 7 casos medidos difere do que ela viu na véspera; os módulos que ficam de fora continuam na fila).
- **(f) começado sem plano:** visível pelo badge e no balanço, sem manter o calendário vivo.
- **(d′) rótulos do 📦:** "código · título" quando o código se repete na fila (alternativa: só quando se repete dentro do próprio 📦).
- **"Deixar neste dia" no ⏳:** o ⏳ pode recolocar a etapa que ela deixou (ela decide com Aplicar), com a nota "inclui a etapa que você tinha deixado em DIA".

**Da implementação (S5 a S10):**
- Badges do mais específico ao mais geral (fechado → encerrado → etapa sem dia → aberto — falta … → nesta semana → aula não assistida → planejado → prévia → aula até 01/01 → fora); efeito: um módulo desta semana com alguma etapa marcada aparece como "ABERTO — FALTA …". Alternativa: "NESTA SEMANA" antes.
- Balanço: "código · título" quando o código se repete (CIR2 = Urologia e Cicatrização); "próxima DIA" = a 1ª etapa sem marca; o "recoloquei" do 📦 fica (é o registro do que o app gravou) com a frase do balanço para quem virou não assistida; "—" nas etapas escondidas do painel; concordância "1 aula"/"N aulas".
- 01/01: "aula ainda sem ✓: H" (corte de "de hoje", porque H conta também aulas de dias anteriores).
- R‑a: a seção REVISÕES ESPAÇADAS do dia corta junto com o card; sem linha quando não há horizonte ou sobra; no último dia, o card corta no horizonte mesmo que a revisão fosse deslizar (alternativas: horizonte no dia em que ela desliza; card até o fim da semana).
- Encerrar: cartão nos modos "aulas" e "fim" (o Cronograma compacto fica uma linha); a prévia usa o horizonte de depois do Aplicar; uma linha por aplicação ativa, um Desfazer (a última); o começado sem plano entra; a etapa do próprio dia da aplicação fica como histórico; mover etapa de encerrado só até a data do encerramento. Em 18 de 219 aplicações medidas o Aplicar fecha o card de revisões na hora e a prévia não diz (frase própria = texto novo, pendente).
- Restauração: "+ D sem dia" no fim dos parênteses do X50; X48 em toda prévia depois de 01/01; X47 "seguem para janeiro" mantido (só as cadeias cuja aula ela marcar).
- "Como a Trilha funciona": a frase nova do item 2 logo depois de "nunca duas etapas do módulo no mesmo dia.".
- Recolocação automática: o guloso só grava dentro das faixas (antes gravava, sem Aplicar, aula→questões de 5 dias e apostila→selagem de 1 dia num caso); o que não cabe fica sem dia e volta às faixas no dia seguinte.
- Cortes de frase que ficaram falsas (nenhum texto novo): X14/X15 sem "; se você aplicar, fica assim" de 29/12 a 01/01 (C18); ⏩ B sem "para a semana seguinte" quando a selagem passa dela; 📦 sem "fica no ⏳" para aula futura que não está no ⏳; prévia da restauração sem a linha do ritmo segurado depois de 01/01.
- **Revisões finais do S10:** (rv1) o dia leve que ela escolhe em 24, 25 ou 31/12 vale como dia leve (questões só como última saída, com 🌿; antes ficava como feriado comum) — nenhuma data muda em 36 variações, só o passo e a nota; (rv1) Desfazer depois de 01/01 de uma restauração feita entre 22 e 31/12 continua devolvendo o registro 📦 da T10 do arquivo (fica em "antes de desfazer"; o Refazer o traz) — alternativa: não devolver essas chaves depois de 01/01; (rv2) se a recolocação de 31/12 não acha dia nem no normal nem no comprimido de antes, o comprimido também vale da etapa fixa até a 1ª a colocar (até 2× a faixa) — leitura (a); a leitura (b) deixaria a cadeia sem dia (⚠️/⏳ e Aplicar), com 402 casos medidos; a (c) mudaria a validação além do desenho; (rv2) no Refazer, as datas que o app recolocou vão para "Saem de novo", não para "Mudanças suas…"; (rv3) "Intervalos encurtados" no 📦 só quando o intervalo ficou abaixo do mínimo da faixa (leitura (a); a (b), abaixo do ideal, não muda nada em 396 entradas e 297 linhas do tempo). Na semente E de 31/12 o 📦 deixa de dizer "Intervalos encurtados: NEF2 · Distúrbio Hidroeletrolítico", que era falso (3 dias numa faixa de 1–2 é alongamento); as datas do 📦 são as mesmas.

**Textos propostos e NÃO criados (aguardam o aval dela; sem aval a tela fica com o texto aprovado ou com a frase falsa cortada):**
- X22b para o começado fora de ordem: "… sem dia. Tem questões marcadas, mas a aula não. Marque cada uma no card da aba Módulos quando fizer."
- ⏩ B, quando a selagem passa da semana seguinte: "… e deixar X DIA (Xh) e Y DIA (Xh) para os próximos dias."
- X14/X15 de 29/12 a 01/01: "🌿 A aula iria para o dia leve da semana (DIA) — o app não põe aula nova nele; de 29/12 a 01/01 a recolocação do dia seguinte a tira de lá (só informa)."
- X27 com o mês da semana (fevereiro em diante): "🌿 Nas semanas de " + mês + " nenhum dia leve é previsto — se quiser, escolha um dia no seletor."
- X58 de semana congelada que perdeu módulo para o K: "congelada: " + (cota − esperaram) + " novo(s) · N esperou (…)" (hoje mostra a cota, como no HEAD).
- 📦, para o comprimido que alonga um intervalo: "Intervalos fora da faixa: CÓD (questões 3 dias após a aula — fora de 1–2)."
- Frase própria quando o Aplicar do encerramento fecha o card de revisões; posição do "+ D sem dia" antes do simulado no X50; condição do X48 só quando a restauração desmarca aula; os textos do balanço do S5 (ordem dos badges, rótulos, "aula sem ✓; falta …").

**Pendência anotada (DELA 11):** revisitar os simulados quando ela mandar a grade do cursinho novo.

### D.8 · Passagem pelos oito

- 🩺 **Método e fila:** a ordem da fila não muda; cadeia completa sempre; módulo fora de ordem nunca recebe cadeia nova fora de ordem.
- 📚 **Cadeia e intervalos:** aula sempre antes; faixas `GAP_T` em todo caminho (0 intervalos fora nas progressivas e no realista); fechar até 03/01 medido e ligado; K = 5 só ao abrir.
- 🧩 **O app lembra por ela:** "sem dia" no ⚠️/painel/📦/⏳; aula não assistida no balanço com o bloco ainda marcável; revisões até "lembro até DD/MM"; o motivo do K na tela; nada some calado.
- 😴 **Sono / 14,5h:** nenhum dia acima de 14,5h na varredura (64 datas), nas progressivas e no realista; 2ª aula só pelo gatilho de 14,5h, nunca 3, nunca em dia de plantão ou depois do noturno.
- 🧠 **Dia leve:** nenhum dia leve previsto em janeiro (o seletor continua); no dia leve, questões só como última saída e com aviso; aula nova nunca. Nenhum texto novo trata do tema da regra permanente 🧠: as 38 linhas do planner que a busca da regra encontra são as mesmas do HEAD, com o mesmo conteúdo e na mesma ordem, e 0 aparecem nas linhas novas do diff.
- 💬 **Ela decide:** tudo grava só com Aplicar (⏳, ⏩, 🔓, Reorganizar, encerrar, restaurar), menos a recolocação diária de 29/12 a 01/01, já aprovada; depois de 01/01, nada se move sozinho.
- ⚙️ **Dados intactos:** nada migrado nem apagado; T1–T3 byte a byte; histórico até 19/10 idêntico (148 linhas iguais); `cmp` ok.
- 🏃 **Academia:** sem mudança (sábado sem treino, também em janeiro); audit, coverage41, loads16 e intervals16 idênticos à bateria anterior.

### D.9 · Bateria, `cmp`, buscas e tempos (11/11/2026, planner final)

| Suíte | Checks | Tempo | Antes (409e1f9) |
|---|---|---|---|
| audit | 396 ✅ | 165 s | 396 |
| trilha (+ TR19a–z, TR19rv1–rv3, TR8c/TR11b/TR9c-…-aplicar) | 762 ✅ | 987 s | 410 |
| historico | 148 ✅ | 426 s | 148 |
| coverage41 | 80 ✅ | 100 s | 80 |
| coverageTrilha | 8 ✅ | 22 s | 8 |
| intervalsTrilha | 13 ✅ | 17 s | 11 |
| intervals16 | 7 ✅ | 15 s | 7 |
| loads16 | 12 ✅ | 32 s | 12 |
| simTrilha | 67 ✅ | 75 s | 6 |
| **total** | **1493 ✅ · 0 ❌** | **1839 s (≈ 31 min)** | 1078 |

- `cmp planner_residencia_2026_offline.html index.html`: idênticos. `node --check` ok nos 10 arquivos de `tests/`. 0 `pageerror`, 0 `console.error`.
- Comparada com a bateria anterior do S10 (1484), nenhuma linha antiga mudou de resultado (a do U24 só no tempo medido, 11 → 15 ms, limite 2000): as 9 novas são as das revisões (TR19rv1 ×3, TR19rv2, TR19rv3; U25–U28). historico, audit, coverage41, coverageTrilha, intervalsTrilha, intervals16 e loads16 dão saída idêntica, linha a linha.
- Buscas: `TRILHA_END` = 0 no planner e no `index.html`; a busca da regra permanente 🧠: 38 linhas no planner e 38 no HEAD, mesmo conteúdo e ordem.
- **Desempenho** (Playwright, CPU 4× mais lenta, um toque num ✓ do Cronograma até a tela pintar, mediana; A/B alternado com o HEAD sobre as mesmas fotos; ruído A/A desta sessão 1,03 / 1,01). Orçamento: build ≤ 1,3 × HEAD.

| Foto | Data | HEAD | Build | Razão |
|---|---|---|---|---|
| tudo feito | 10/12 | 177,1 ms | 141,9 ms | 0,80 |
| tudo feito | 30/12 | 138,7 ms | 152,4 ms | 1,10 |
| tudo feito (confirmação, N = 20) | 30/12 | 143,1 ms | 148,9 ms | 1,04 |
| com atraso | 10/12 | 155,4 ms | 160,2 ms | 1,03 |
| com atraso | 30/12 | 159,8 ms | 139,9 ms | 0,88 |

  Dentro do orçamento em todas. Registro: em 30/12 ("tudo feito") a CPU do toque ficou 1,16–1,25 × a do HEAD (cerca de 28–43 ms a mais com a CPU 4× mais lenta), sem aparecer no tempo até a tela pintar (1,04 com N = 20); a causa não foi investigada. Janeiro (só no build; o HEAD não tem calendário em janeiro): 05/01 ≈ 157 ms e 20/01 165–194 ms, do mesmo tamanho de dezembro na mesma sessão (10/12: 148–172 ms).

### D.10 · Conferência — item pedido → código → teste

| Item | Código | Teste |
|---|---|---|
| aula só até 01/01, por todo caminho | `AULA_END`, `stageCap`, janelas presas em `chainEnum`; `moveOptsFor`, `aulaFim` em `trilhaShiftPlan`, defesa em `applyMoveT` | TR19a, TR19b, TR19h; U10–U16 |
| questões, apostila e selagem em janeiro, nas faixas | `stageCap` = `PLAN_HZ`; `GAP_T`; `trilhaFinalPlan` (`valid`, guloso nas faixas) | TR19c, TR19r, TR18j/k; `intervalsTrilha` |
| semana final por data; cauda; calendário termina sozinho | `FINAL_START`, `POST_WEEKS` com `TAIL_START`/`TAIL_GRID`, `P.LWv`/`P.endISO`, `P.live` em `trilhaFreezePatch` | TR19i, TR19c (nada gravado depois do fim), TR5b, TR0, TRstart |
| K = 5 (DELA 1) | `K_OPEN`, `kCount`, `st.open`, `shortWhy`, `K_TXT` | TR19f, TR19v, TR19n-b; U-unidades |
| 2ª aula e dia leve (DELA 2) | escada em `placeChain` (`aula2Ok`, `aulaDayOk`, gatilho `g2`), `AREA`, X02 | TR19e-ii/iii, TRleve; `intervalsTrilha`, `simTrilha` |
| ⏩ com 2ª aula (DELA 3) | `trilhaProposeAdvance` (passos × A/B, `adv`), X21 | TR19e-i |
| T10 ritmo 0 (DELA 4) | `TRILHA_RAMP_DEFAULT`, −/+ até congelar, ⏩ "final" | TR19u, TR19a-i |
| 01/01 dia comum (DELA 5) | saiu `prot.fim` e o 01/01 de `trilhaBlockedWhy`; `simForCfg`; 🏁 X06/X07, botão X32 | TR19s, TR19a, TR19p |
| sem dia leve na cauda (DELA 6) | pré-passe com `light: null` depois de 01/01; X27 | TR19i, TRleve |
| fechar até 03/01 (DELA 7) | `LATE03` no score (fora do comprimido) | TR19t; `simTrilha` medições |
| recolocação grava janeiro; depois só ⏳ (DELA 8) | `trilhaFinalPlan` de `FINAL_START` a `AULA_END`; `pending` "semdia" | TR19r, TR19p, TR19a-iii, TR19d |
| R‑a (DELA 9) | `trilhaRevLast`, `P.revEnd`, `reviewsLive`, X41/X64/X65/X67 | TR15e, TR19j |
| encerrar a cauda (DELA 10) | `trilhaTailEnd`/`trilhaTailEndHist`, `P.ended`, X45, X40 | TR19k, TR19rv1 |
| materiais e simulados depois de 01/01 (DELA 11) | X05, X26, X43, 📦 sem exportação; paridade 15/01 e 29/01 | TR19m, TR19o |
| dois números, partição sem contagem dupla | `aulaIn`, `fullC`, `P.N`/`P.NC`/`P.reach`, `trilhaModStatus`, `TrilhaBalanco` (modos) | TR19q, TR10, TR12 |
| aula não assistida até 01/01 | `P.noAula`, `hidden`, bloco da aula no dia | TR19d, TR19l, TR19y |
| 0b "sem dia" | `P.semDia` → X22/X22b, X31, X23, X25, X03 | TR19l (A′, B′), TR19g-x50 |
| restauração com a cauda | `FINAL_KEEP_FROM`, `trilhaTailEnd` em `RESTORE_CFG_KEYS`, X46–X51, `leaveLines` | TR19g, TR17e/i/z, TR19rv1, TR19rv2 |
| dados já gravados carregam iguais | sem migração; RM11 só na memória | TR19n (a–d), `historico.js` |

### D.11 · Testes que mudaram

Uma expectativa antiga só mudou quando a regra nova explica; cada troca tem a linha "antes → depois — motivo". Os motivos:
- **1 aula por dia** (DELA 2): a T2 congela com 3 módulos (19, 24, 32) e 1 "não coube"; o 🔓 da T2 deixa de ter proposta; "Ver como reorganizar" com a aula de hoje fica sem proposta; um teste do ⏩ ganhou a premissa certa (o carimbo é o dia do bloco).
- **K** (DELA 1): a T3 da prévia com 1 "espera"; os testes do "Mover o fio" passam a montar o estado "ela fez tudo no dia" (com o app fechado desde 26/10, as selagens atrasadas seguram a rampa).
- **Teto por etapa e 01/01 dia comum** (DELA 5/8): "cadeia completa até 01/01" → "aula até 01/01, intervalos nas faixas (a selagem pode ir para janeiro)"; "01/01 só selagem" saiu; ▶ além da Sem.52 vai para a C1; os TR18f/j/k ("nada depois de 01/01") foram reescritos com o simulado religado em 01/01 e a selagem em janeiro.
- **Fechar até 03/01** (DELA 7): "última selagem até 01/01" → "última selagem: 03/01".
- **Alcance** (decisão 77): os números "cabem 36" passaram a "34 aulas até 01/01" na prévia; o alcance pelo dia do 1º acesso, de 36·36·35… para 34·34·33…
- Testes novos: TR19a–z e TR19rv1–rv3 (49 cenários), TR8c, TR11b e TR9c-…-aplicar (o Aplicar do 🔓, do Reorganizar e do "Propor X primeiro", que tinham perdido cobertura), TR9c-0301, 2 invariantes no `intervalsTrilha` e o `simTrilha` inteiro (varredura, progressiva até o fim da cauda, realista pelo git, U1–U28, medições). Cada teste novo falha na versão de antes (HEAD) ou num mutante de uma troca, e passa no build.

## C · Mover o fio todo junto (pedido de 07/11/2026) — decisão 76

**Quem pede:** a paciente (💬 🧩), com as decisões de 07/11 ("Mover o fio todo junto" e a entrega final, itens 2.1–2.6). Ela quer adiar ou adiantar um módulo sem desmontar os intervalos que o app já tinha montado. PR próprio, a partir da `main` depois do merge do PR #18. **Não fazer merge antes do aval.**

> **Nota de 11/11 (regra de 01/01, §D):** onde esta seção diz "nada depois de 01/01", "último dia de acesso — só selagem" ou "Aplicar o deslocamento parcial", vale hoje a regra nova: só a **aula** tem fim em 01/01 (o movimento que a levaria para depois é recusado inteiro, sem pergunta); questões, apostila e selagem andam para janeiro; 01/01 não é mais dia bloqueado. Os casos TR18f, TR18j e TR18k foram reescritos (simulado religado em 01/01, selagem em janeiro) — §D.11. O texto abaixo fica como foi entregue em 07–08/11.

### C.1 · Quando a opção aparece
- Mover uma etapa que tem etapas **sem marca** depois dela, no mesmo módulo, abre sempre o diálogo.
- **Se nada quebra**, o diálogo é curto: "Este movimento mantém os intervalos.", com "Mover só esta etapa", "Mover o fio todo (+N dias)" (ou "−N dias") e "Cancelar". A linha de carga do destino aparece junto quando o dia passa do tempo hábil; ela só informa.
- **Se algo quebra**, aparece o aviso de hoje (os intervalos antes → depois) com as opções de sempre ("Mover assim mesmo", "Ver como reorganizar o fio") **e** a opção nova "Mover o fio todo (±N)".
- **A selagem** (nada depois dela) continua movendo direto. A exceção é o dia que já passou: aí o diálogo abre só para mostrar a linha do dia passado, com "Mover assim mesmo" e "Cancelar".
- **Uma etapa já marcada nunca anda:** mover o bloco dela não oferece o fio.

### C.2 · O que "Mover o fio todo" faz
- **N** = dias entre a data atual da etapa e a nova. O mesmo N vale para a etapa movida e para **todas as seguintes sem marca** do mesmo módulo, inclusive as ⏳ de dias que já passaram.
  - As ⏳ andam **a partir de amanhã**. Só elas: as outras continuam com o mesmo N.
  - Uma etapa que cairia no dia da anterior, ou antes dela, vai **logo depois da etapa anterior**.
- **Uma etapa seguinte já marcada segura o fio.** O fio não anda além dela, e a prévia avisa: "⚠️ As questões já estão marcadas: o fio não anda além delas."
- **Se a ordem não pode ser mantida**, a prévia diz "⚠️ A ordem não pode ser preservada: … As outras opções continuam." e não oferece "Aplicar". O botão "Voltar às outras opções" devolve o diálogo inteiro. Isso acontece quando uma etapa ficaria antes ou no mesmo dia de uma marcada, ou quando uma etapa anterior teria de ir para antes de amanhã.
- **Só o módulo tocado muda.** Nunca há duas etapas do módulo no mesmo dia, e a ordem aula → questões → apostila → selagem fica sempre. A ordem é conferida nos pares em que o fio mexe: um par antigo que ele não toca (por exemplo, as questões já no dia da aula) não bloqueia o fio e não é atribuído ao movimento.
- **A prévia mostra:**
  - cada etapa, com o dia de antes → o dia novo e a carga dele, já sem a etapa do módulo que sai daquele dia (⚠️ acima do 📚, 🌿 dia leve, 🎄 feriado);
  - "(seu movimento)" na etapa que ela moveu, e "a partir de amanhã" na ⏳ que andou;
  - os intervalos antes → depois, com ⚠️ fora da faixa.
- **Só grava com "Aplicar".** A gravação vai para `trilhaPlan[id]`: a `orig` fica intacta e o `hist` ganha uma entrada por etapa com o motivo próprio **"fio"**. Restaurar o plano (decisão 75) volta à `orig`.

### C.3 · Dias bloqueados — o app pergunta
- **Bloqueado** é o que o motor já não usa:
  - plantão longo;
  - pós-noturno;
  - sexta de simulado;
  - 20–25/10 (transição);
  - **01/01**, para aula, questões e apostila ("último dia de acesso — só selagem").
- Cada etapa que cairia num dia bloqueado vira uma pergunta: **"⛔ As questões iriam para TER 10/11, que é plantão longo."**, com "Deixar neste dia" e "Pular +1 dia". O texto segue o modelo pedido, com artigo e concordância (C.6.3).
- **"Deixar neste dia"** põe a etapa lá, e o app guarda a escolha (`trilhaPlan[id].keep`).
  - O bloco do dia mostra "⚠️ plantão longo — escolha sua", também num dia editado à mão.
  - No plantão longo, o 🚑 e a linha 🗓️ passam a dizer "etapa deixada aqui por escolha sua (⚠️ no bloco)".
  - Na sexta de simulado, a etapa que ela deixou não vira ⏳.
  - Uma etapa que **o app** pôs num dia que depois virou bloqueado (o simulado religado depois) não recebe "escolha sua". Ela continua no ⏳ ("que virou simulado"), como antes.
- **"Pular +1 dia"** empurra essa etapa e as seguintes do fio. Se o dia seguinte também é bloqueado, o app pergunta de novo.
- **A resposta vale para o dia perguntado.** Se outra resposta muda o dia em que a etapa cai, o app pergunta de novo pelo dia novo.
- **As perguntas são independentes.** "Aplicar" só aparece quando todas estão respondidas; até lá, a prévia diz "Responda às perguntas acima para aplicar."
- **Dia leve 🌿 e feriados 🎄 não perguntam.** Mostram o selo e a carga com ⚠️.

### C.4 · Limites
- **Nada vai para depois de 01/01.** A partir da 1ª etapa que não cabe, as seguintes ficam "sem dia — não cabe antes do fim do acesso (01/01)". A prévia diz "⚠️ Estas etapas não cabem antes do fim do acesso (01/01): …", e o botão vira "Aplicar o deslocamento parcial" (as que não cabem ficam sem data). "Cancelar" continua lá. "Pular" a partir de 01/01 significa exatamente isso.
- **Aula, questões ou apostila deixada em 01/01** traz o aviso explícito, que nomeia as etapas: "⚠️ Deixando a apostila em 01/01 (último dia de acesso), a etapa seguinte (selagem) fica sem dia." Com mais de uma: "as etapas seguintes (…) ficam sem dia".
- **Para hoje ou um dia futuro:** a etapa vai para lá; as seguintes, a partir de amanhã. Se uma anterior teria de voltar para antes de amanhã, a prévia diz "a aula iria para antes de amanhã — não pode voltar" ("as questões … não podem voltar").
- **Para um dia passado:** é permitido, com a linha pedida, no diálogo e na prévia: "Esse dia já passou. Se você fez a etapa nele, marque o ✓ no bloco desse dia, assim o carimbo fica com a data certa. Mover para um dia passado só deixa a etapa como pendente (⏳)."
- **O que não muda:**
  - a carga ⚠️/📚 só informa;
  - a regra de fechar a semana é a mesma;
  - o seletor continua oferecendo esta semana e a próxima.

### C.5 · Os casos pedidos (rodados na interface, módulo NEF1 · Glomerulopatias I)
- **Caso A** (aula QUA 18/11, questões QUI 19/11, apostila SEX 20/11, selagem TER 24/11). Ela move a aula para QUI 19/11:
  - o aviso de hoje aparece ("a aula no mesmo dia das questões"), mais "Mover o fio todo (+1 dia)";
  - a prévia: aula QUI 19/11, questões SEX 20/11, apostila SÁB 21/11 (🌿 dia leve, sem pergunta), selagem QUA 25/11;
  - os intervalos antes → depois: **1d → 1d · 1d → 1d · 4d → 4d**, idênticos;
  - "Aplicar" grava as 4 datas, com 4 entradas "fio" no histórico. A `orig` fica, e o resto do plano e o registro ficam iguais.
- **Caso B** (aula e questões marcadas, apostila SEX 20/11, selagem TER 24/11). Ela move a apostila para DOM 22/11 ("+2 dias"):
  - só a apostila e a selagem andam (selagem QUI 26/11);
  - os intervalos: questões → apostila **1d → 3d ⚠️ fora de 1–2**; apostila → selagem 4d → 4d;
  - "Aplicar" está lá, porque o ⚠️ só informa. As marcas e os carimbos não mudam.
- **Prévia do diálogo curto:** aula de QUA 18/11 para TER 17/11 → "Este movimento mantém os intervalos." · "Mover só esta etapa" · "Mover o fio todo (−1 dia)" · "Cancelar".

### C.6 · Escolhas minhas — decididas no aval de 08/11 (1 a 5 confirmadas; a 6 mudou, ver C.11)
1. **Ao adiantar (N negativo), uma etapa anterior sem marca que ficaria no mesmo dia da etapa movida, ou depois dela, anda junto o mesmo N.** Os intervalos ficam. Se ela teria de ir para antes de amanhã, a prévia diz que a ordem não pode ser preservada. *Alternativa:* nunca levar as anteriores e dizer direto que a ordem não pode ser preservada. O pedido fala só das seguintes; levei as anteriores para manter a ordem sem quebrar intervalo.
2. **O diálogo curto também aparece quando o destino passa do tempo hábil.** A linha de carga aparece junto, porque o curto é sobre intervalos e a carga só informa. *Alternativa:* o diálogo completo nesse caso.
3. **O texto da pergunta tem artigo e concordância:** "⛔ As questões iriam para …" e "⛔ A apostila iria para …". O modelo pedido era "⛔ [etapa] iria para [dia], que é [motivo]."
4. **O 🚑 do plantão longo com etapa deixada por ela** diz "etapa deixada aqui por escolha sua (⚠️ no bloco)". O texto antigo dizia "sem etapa de mesa hoje" e ficaria em contradição com o bloco. Sem etapa deixada, o texto é o de sempre.
5. **A selagem para um dia passado** abre o diálogo só com a linha do dia passado, porque a linha é pedida em todo movimento para dia passado. Para hoje ou para a frente, a selagem continua indo direto.
6. ~~Semana final: a recolocação automática diária pode recolocar uma etapa deixada em 01/01.~~ **Mudou no aval de 08/11:** a etapa que ela deixou com "Deixar neste dia" fica onde ela deixou; a recolocação diária respeita a escolha (C.11).

### C.7 · Conferência — item pedido → código → teste

| Item pedido | Onde está (`planner_residencia_2026_offline.html`) | Teste que prova |
|---|---|---|
| 2.1 Mover etapa com seguintes sem marca abre o diálogo | `moveToIso` (`hasLater`) | TR18a, TR18b, TR18c |
| Diálogo curto: "Este movimento mantém os intervalos", "Mover só esta etapa", "Mover o fio todo (±N)", "Cancelar" | `moveToIso` (`short`), diálogo `move-ask` (`data-t="move-short"`) | TR18a |
| Algo quebra: o aviso de hoje com antes → depois + a opção nova | diálogo `move-ask` (`issues`, `askLinesT`) + botão "Mover o fio todo (±N)" | TR18a (caso A), TR18b, TR11 |
| A selagem segue movendo direto | `moveToIso` (sem `hasLater`) | TR18g; TR18h (dia passado: só a linha) |
| 2.2 Mesmo N para a etapa e as seguintes sem marca, ⏳ inclusive, a partir de amanhã | `trilhaShiftPlan` (`later`, `place` com piso = amanhã) | TR18a, TR18c |
| Etapa seguinte marcada segura o fio, com aviso | `trilhaShiftPlan` (`stopAt`), `shiftViewT` | TR18d |
| "A ordem não pode ser preservada" e as outras opções continuam | `trilhaShiftPlan` (`orderBroken`, `orderWhy`), "Voltar às outras opções" | TR18d, TR18g |
| Só o módulo tocado; nunca duas etapas no mesmo dia; ordem sempre | `applyShiftT` (só `trilhaPlan[id]`), checagem de ordem em `trilhaShiftPlan` | TR18a, TR18b, TR18e |
| Prévia com dia e carga de cada etapa e intervalos antes → depois | `shiftViewT` (`dayCostT`, `data-t="shift-gaps"`) | TR18a, TR18b, TR18e |
| Grava só no "Aplicar", em `trilhaPlan`; `orig` intacta; `hist` "fio"; restaurar volta à `orig` | `applyShiftT`; `trilhaRestore` (já existia) | TR18a (com a restauração), TR18e, TR18f |
| "Cancelar" não grava | botões do diálogo | TR18a (diálogo curto e prévia), TR18g |
| 2.3 Dia bloqueado pergunta: "⛔ … iria para …, que é …" com "Deixar neste dia" / "Pular +1 dia" | `trilhaBlockedWhy`; `place` (`ans`); `shiftViewT` (`data-t="shift-q"`) | TR18e, TR18f |
| "Deixar" mantém a etapa no dia, com ⚠️ no bloco | `trilhaListFor` (⚠️ no bloco), `buildShiftDayT` (🚑) | TR18e |
| "Pular" empurra as seguintes e pergunta de novo | `place` (`extra`) | TR18e (dois bloqueados em sequência: QUI 12/11 e SEX 13/11; e o caminho inverso) |
| Perguntas independentes; "Aplicar" só com todas respondidas | `pendingQ`, `ready` | TR18e |
| Dia leve e feriados não perguntam | `trilhaBlockedWhy` (não os inclui); 🌿/🎄 em `dayCostT` | TR18a, TR18e, TR18f |
| 2.4 Nada depois de 01/01; deslocamento parcial ou cancelar | `place` (`nofit` e corte), "Aplicar o deslocamento parcial" | TR18f |
| Aula/questões/apostila em 01/01 → aviso das seguintes sem dia | `leftOnEnd` (`data-t="shift-end"`) | TR18f |
| Para hoje ou o futuro: seguintes a partir de amanhã, ou "não pode voltar" | `place` (piso), `orderWhy` | TR18c, TR18g |
| Dia passado permitido, com a linha | `PAST_LINE` (`data-t="move-past"`, `data-t="shift-past"`) | TR18c, TR18d, TR18h |
| A carga só informa; a regra de fechar a semana e o seletor não mudam | `dayCostT`; `moveOptsFor` e `weekDone` sem mudança | TR18b (⚠️ com "Aplicar"); bateria inteira |
| Outro módulo intacto | `applyShiftT` | TR18a, TR18b, TR18e |
| A resposta vale para o dia perguntado (respondendo fora de ordem, o app pergunta de novo) | `trilhaShiftPlan` (`ans[ts][dia]`) | TR18e |
| "Deixar" guardado: ⚠️ só no que ela escolheu; não vira ⏳ na sexta de simulado; 🚑 e 🗓️ coerentes; dia editado igual | `applyShiftT` (`keep`), `trilhaKeptOf`, `buildTrilhaPlan` (`pending`), `trilhaListFor`, `putIntoT`, linha `day-type` | TR18e, TR18i |
| Etapa marcada não oferece o fio | `moveToIso` (`hasLater`) | TR18b |
| Par antigo fora de ordem não bloqueia o fio | `trilhaShiftPlan` (pares com etapa do fio) | TR18g |
| Carga da prévia sem a etapa que sai do dia | `shiftViewT` (`net`) | TR18a |
| "Mover só esta etapa" grava só ela | `applyMoveT` | TR18a |
| Restaurar tira o `keep` com o histórico dela | `trilhaRestore` | TR18a (restauração) |
| Aval 08/11: a recolocação automática da semana final não tira de lá a etapa deixada em 01/01 | `trilhaFinalPlan` (`mine`/`kept`, teto `before`, âncora do modo guloso) e `placeChain` (`opt.before`) | TR18k (29/12 e 31/12), TR18j (30/12) |
| Aval 08/11: fio dentro da semana final, depois da recolocação automática e de restaurar | `trilhaFinalPlan`; `trilhaRestore` (só conta a data do app dada antes do 1º movimento dela) | TR18j |

### C.8 · Passagem pelos oito

| | Veto? | Por quê |
|---|---|---|
| 🧠 Psiquiatria | não | Nenhum texto novo fala de horário de medicação. O dia leve não muda e não pergunta: a etapa que cai nele mostra o 🌿 de sempre. |
| 📚 Pedagogia | não | O mesmo N mantém os intervalos que o motor montou. A ordem da cadeia nunca quebra (sem "Aplicar" quando quebraria). Intervalo fora da faixa aparece com ⚠️ antes de aplicar. |
| 😴 Sono | não | Plantão longo e pós-noturno perguntam. Deixar a etapa lá é escolha dela, marcada no bloco e no 🚑. A carga de cada dia novo aparece na prévia. |
| 🩺 Preceptor | não | A cadeia continua completa. Nada passa de 01/01, e o deslocamento parcial é explícito. A fila não muda. |
| 🏃 Corpo | não | Só blocos de etapa andam; academia e lazer ficam onde estão. |
| 🧩 TDAH/funções executivas | não | Um diálogo, curto quando nada quebra. Uma pergunta por dia bloqueado. "Aplicar" só quando está tudo respondido. Dá para voltar às outras opções. |
| 💬 Psicóloga TCC | não | Nenhum texto que culpe: "escolha sua", "não cabe antes do fim do acesso", e a linha do dia passado com o texto dela. |
| ⚙️ Dados/engenharia | não | Grava só no "Aplicar", só no módulo tocado. A `orig` fica, e o histórico ganha o motivo "fio". Restaurar volta à `orig`. "Cancelar" não grava nada. O histórico até 19/10 é idêntico. |

### C.9 · Limitações conhecidas
1. **O fio anda só dentro do módulo tocado.** Os outros módulos dos dias de destino ficam onde estão; a carga ⚠️ informa.
2. **As respostas se perdem ao "Voltar às outras opções":** a prévia recomeça sem respostas. Não há "desfazer" para uma resposta só.
3. **O seletor oferece esta semana e a próxima** para a etapa movida. As seguintes podem ir mais longe, até 01/01.
4. **Uma aula pode cair no dia leve pelo fio**, só por movimento dela (o motor nunca faz isso). Ela aparece com o 🌿.
5. **Etapa movida para um dia passado fica ⏳**, como decidido. O caminho para ela continua sendo marcar no bloco ou "Ver como recolocar".
6. **Semana final, depois de um "Pular" a partir de 01/01.** As etapas que ficaram sem dia são recolocadas pela recolocação automática do dia seguinte, que é a regra da semana final. Só o "Deixar" fica (C.11, TR18j).
7. **"Mover só esta etapa" para uma sexta de simulado continua virando ⏳, como antes do PR.** O mesmo vale para "Mover assim mesmo". Só o "Deixar neste dia" do fio (ou o próprio movimento do fio) fica guardado como escolha dela e não vira ⏳.
8. **"Pular +1 dia" numa etapa anterior pode cair no dia da etapa movida.** Ao adiantar, a prévia diz então que a ordem não pode ser preservada. O caminho é "Deixar neste dia" ou "Mover só esta etapa".

### C.10 · Revisão adversarial (4 lentes, cada achado verificado por um segundo revisor)
A revisão independente usou quatro lentes: motor, interface, interações com o resto do app, e pedido + textos + testes. Foram 27 achados, que viram 9 problemas distintos, todos corrigidos e testados:

| # | Problema confirmado | Correção | Teste |
|---|---|---|---|
| 1 | Resposta guardada pela posição: respondendo fora de ordem, um "Deixar" dado para QUI 12/11 valia para SEX 13/11 sem perguntar | respostas por dia (`ans[ts][dia]`) | TR18e |
| 2 | "⚠️ … — escolha sua" também em etapa que o app pôs (simulado religado depois) | a escolha fica guardada (`keep`); o ⚠️ só nela | TR18e (módulo 32 sem "escolha sua") |
| 3 | "Deixar" numa sexta de simulado virava ⏳ "que virou simulado" e escondia 🔓/⏩ | `pending` ignora a etapa guardada | TR18e (⏳ de 3 → 1) |
| 4 | Dia editado à mão: o bloco entrava sem ⚠️ e o 🚑 dizia "sem etapa de mesa" | `putIntoT` com o motivo e o 🚑 novo | TR18i |
| 5 | Linha 🗓️ dizia "nenhuma etapa de mesa hoje" / "sem etapa de módulo hoje" ao lado da etapa deixada | a linha diz "etapa deixada aqui por escolha sua" | TR18e, TR18i |
| 6 | Um par antigo fora de ordem, que o fio não toca, bloqueava o "Aplicar" e culpava o movimento | ordem conferida só nos pares com etapa do fio | TR18g |
| 7 | O empurrão "a partir de amanhã" de uma ⏳ se espalhava: as seguintes andavam N+k | o piso vale só para a ⏳; as outras seguem com N | TR18c (selagem +1, não +2) |
| 8 | Mover o bloco de uma etapa já marcada oferecia o fio | sem fio para etapa marcada | TR18b |
| 9 | A carga da prévia contava a etapa do módulo que sai do dia (⚠️ falso) | carga líquida do dia | TR18a (aula 3,4h, sem ⚠️) |
| — | Textos: "não podem voltar" (questões); "Responda à/às pergunta(s)"; "a etapa seguinte (selagem) fica sem dia"; "pulou 1 dia / 2 dias" | corrigidos | TR18e, TR18f |

Achados refutados pelo verificador:
- **A recolocação automática da semana final pode desfazer um "Deixar" em 01/01.** O verificador classificou como regra pedida por ela; ficou apresentado em C.6.6. **No aval de 08/11 a equipe decidiu o contrário:** a escolha agora é respeitada (C.11).
- **"Pular" numa etapa anterior pode cair no dia da etapa movida.** O invariante vale e a prévia diz que a ordem não pode ser preservada. Está em C.9.8.

### C.11 · Aval de 08/11 — a escolha 6 mudou e os testes da semana final
**Decisão (equipe, 08/11):**
- as escolhas 1 a 5 de C.6 ficam como estão;
- **a 6 muda:** uma etapa que ela deixou em 01/01 com "Deixar neste dia" não pode ser recolocada pela recolocação automática da semana final.

**Como ficou:**
- **A escolha fica registrada** em `trilhaPlan[id].keep` (C.3).
- **`trilhaFinalPlan` a trata como fixa**, como já fazia com a etapa que a restauração deixa no bloco do dia (`trilhaFinalKeep`). Ela não entra na recolocação e serve de âncora: as etapas antes dela só vão até o dia anterior a ela (teto `before`, também no `placeChain`), e as depois dela nunca vão para antes dela (modo guloso). Antes, o modo guloso ancorava só na etapa anterior.
- **Dia editado à mão** continua fora da recolocação, como antes.

**Ajuste na restauração** (achado ao testar o fio na semana final):
- **Antes:** a restauração mantinha toda data dada pela recolocação automática. Depois de um fio, ela misturava a data `orig` de uma etapa com a data que o app tinha dado em reação ao fio, e isso podia deixar duas etapas no mesmo dia.
- **Agora:** só conta a data do app dada **antes** do 1º movimento dela no módulo. A que veio depois foi reação ao movimento e sai junto com ele. É o que a decisão 75 já dizia ("o que ela moveu depois volta para lá").

**Testes pedidos:**
- **TR18k — "Deixar" em 01/01 e a recolocação diária.**
  - Em 22/12, a aula do módulo 21 vai de 27/12 para 29/12 (+2). A apostila iria para 01/01; ela toca "Deixar neste dia", e a selagem fica sem dia.
  - Em **29/12** e **31/12**, a recolocação automática rodou: a apostila continua em 01/01, com a escolha guardada e sem nenhuma entrada "final" para ela.
  - Em 29/12, a recolocação levou a aula para 30/12 (29/12 é o dia leve) e as questões para 31/12, em ordem. SEX 01/01 mostra a apostila com "⚠️ último dia de acesso — só selagem — escolha sua".
- **TR18j — fio dentro da semana final (29/12).** Dois módulos com a mesma cadeia: aula 28/12 feita, questões 29/12, apostila 30/12, selagem 01/01. Em 29/12, ela leva as questões dos dois para 31/12 (+2):
  - **módulo 18:** a apostila iria para 01/01 → "Deixar neste dia". Fica questões 31/12, apostila 01/01 (guardada) e selagem sem dia;
  - **módulo 20:** "Pular +1 dia" a partir de 01/01 é "não cabe". Ficam a apostila e a selagem sem dia.
  - **Depois da recolocação automática de 30/12:**
    - módulo 18: aula 28/12 · questões **30/12** · apostila **01/01 (ficou)** · selagem sem dia. A selagem não cabe depois de 01/01, como a prévia avisou;
    - módulo 20: aula 28/12 · questões 30/12 · apostila 31/12 · selagem 01/01, recolocadas pela regra da semana final (C.9.6).
  - **Depois de restaurar (em 30/12):** os dois módulos voltam ao plano original (28/12 · 29/12 · 30/12 · 01/01), sem a escolha guardada e sem o histórico dela nem a recolocação que veio por causa do fio. Nenhum dia fica com duas etapas.

### C.12 · Bateria e `cmp`

| Suíte | Checks |
|---|---|
| audit | 396 |
| trilha (com TR18a–k: mover o fio todo junto) | 410 |
| historico | 148 |
| coverage41 | 80 |
| coverageTrilha | 8 |
| intervalsTrilha | 11 |
| intervals16 | 7 |
| loads16 | 12 |
| simTrilha | 6 |

**1078 checks verdes.** `cmp planner_residencia_2026_offline.html index.html`: idênticos. O histórico até 19/10 continua idêntico (historico, 148).

Os testes novos (TR18a–k, 69 checks) mexem só pela interface:
- mover pelo seletor do bloco;
- os botões do diálogo e da prévia, e as perguntas dos dias bloqueados.

Cada um confere a prévia na tela, o `trilhaPlan` gravado (datas, `orig`, `hist`), o registro e os outros módulos. Os helpers de mover do TR17 e do TR17z passaram a clicar "Mover só esta etapa" quando o diálogo é o curto.

Telas (página do relatório):
- o diálogo curto;
- o caso A (aviso e prévia);
- o caso B;
- o dia passado;
- os dias bloqueados (as perguntas, a pergunta de novo, tudo respondido);
- 01/01 (parcial e "Deixar");
- a ordem que não pode ser preservada.


## B · Restaurar o plano ao estado da última atualização (pedido de 07/11/2026) — decisão 75

**Quem pede:** a paciente (💬), com o texto de uso da equipe. Ela não conseguiu cumprir a 1ª semana e foi movendo tarefas de dia até desorganizar o app. Ela quer o app idêntico ao da última atualização, como se não tivesse marcado nem movido nada, e depois marca à mão o que realmente fez. **Não fazer merge antes do aval.**

### B.1 · Onde estão os dados dela — e como fica o diagnóstico

Os dados dela ficam **só no navegador do aparelho dela** (`medplanner_config_v1`, `medplanner_schedule_v1`, `medplanner_trail_v1`, `medplanner_schedule_archive_v1`). Daqui eu não leio esses dados. Por isso o diagnóstico pedido no item 1 foi construído **dentro do app**, como prévia que não grava nada. Ela abre a aba Trilha, toca em **"Ver o que mudou desde a atualização"** e vê os itens abaixo. Se a equipe quiser o diagnóstico antes de ela abrir a versão nova, ela exporta um backup agora (aba Sono, 💾) e envia: eu rodo o mesmo diagnóstico sobre o arquivo, sem tocar no aparelho dela.

O diagnóstico, item a item do pedido:

| Lugar | O que a prévia mostra |
|---|---|
| como o plano está | "Como o plano está agora": quantas etapas estão fora da ordem, no mesmo dia que outra etapa do mesmo módulo, em dia bloqueado ou fora da faixa de intervalo — agora e depois de restaurar |
| `trilhaPlan` | cada etapa fora da data original: "CIR1 · Trauma I — questões: SÁB 31/10 → volta para QUI 29/10" |
| `orig` | "Data original guardada: em todas as etapas planejadas ✓", ou a lista das que não têm (essas ficam onde estão) |
| ⏩ e 🔓 | módulo adiantado e subida aplicados depois da atualização, e a cota com que a semana volta |
| dias editados | cada dia da Trilha editado à mão, com quantos blocos e ✓ e os blocos que ela criou. Os de antes da atualização vêm marcados "(de antes da atualização)" |
| `trail_v1` | "Registro da Trilha desde o 1º acesso à versão nova (27/10): N ✓ de etapa · % · áudio · revisões · módulos fechados", e por módulo **com a data e o %** ("aula 27/10 · questões 30/10 · % das questões 70%", "revisão D+7 01/11, 75%") |
| revisões | vencidas hoje: agora → depois de restaurar |
| fila, 📌, rampa, dia leve, "Agora não", simulados | cada escolha que volta ao padrão, com o valor de agora |
| fica como está | 1º acesso, semanas congeladas com a cota, o que a fila padrão daria em cada semana congelada e por quê, e o que o app registra sozinho |
| alcance | o alcance estimado até 01/01 agora → depois de restaurar, com "o ritmo da semana seguinte fica segurado até a semana anterior fechar" (e o bloco 04h30 sem subida) |
| depois de aplicar | quantas etapas aparecem como ⏳ (o mesmo número do banner), dias acima de 14,5h nas próximas 2 semanas, dias acima do limiar de estudo |

Exemplo real (cenário TR17 da bateria: a mesma bagunça feita pela interface, em 07/11):

```
1 · Etapas fora da data original: 2
   CIR1 · Trauma I — Avaliação Inicial e Trauma de Tórax — questões: SÁB 31/10 → volta para QUI 29/10
   CIR2 · Cicatrização de Feridas e Queimaduras — aula: DOM 08/11 → volta para SEG 09/11
Data original guardada: em todas as etapas planejadas ✓
2 · Dias da Trilha editados à mão: 2 — voltam a ser gerados
3 · Registro da Trilha desde o 1º acesso à versão nova (27/10): 4 ✓ de etapa · 1 % · 1 áudio · 0 revisão(ões) · 0 módulo(s) fechado(s)
   CIR1 · Trauma I …: aula 27/10 · questões 30/10 · % das questões 70%
   CIR1 · Trauma II …: aula 30/10
   CIR2 · Urologia: aula 02/11 · áudio 02/11
5 · fila: ordem mudada → volta à ordem padrão · 📌 CIR4 · Parte I → saem · rampa de 17/11: 3 → 4 ·
    dia sem remédio da semana de 26/10 → previsto · “Agora não”: 1 · % do simulado de 06/11 (62%) · simulado de 20/11 religado → regra
Fica como está: 1º acesso 27/10 · semanas congeladas 26/10 (3) · 03/11 (3, segurada)
   a semana de 03/11 congelou com CIR4 · Parte I, CIR2 · Cicatrização, CIR2 · Cirurgia Pediátrica — pela fila padrão seriam
   CIR2 · Cicatrização, CIR2 · Cirurgia Pediátrica, CIR3 · Preparo Pré-operatório; fica como congelou (com a fila e os 📌 que valiam na hora)
Depois de aplicar: 11 etapa(s) aparecem como ⏳ pendentes · nenhum dia acima de 14,5h · 📚 SEX 13/11 8,5h · SEG 16/11 5,3h
```

### B.2 · O que "Aplicar" faz

1. **Arquivo primeiro.** O estado inteiro (config, todos os dias editados, `trail_v1`) vai para `medplanner_schedule_archive_v1` → `restauracoes`, com data e hora e a escolha da prévia. Se o arquivo estiver ilegível ou não couber, nada muda e a tela avisa.
2. **Tudo ou nada.** As três chaves (dias, registro, config) são gravadas juntas. Se uma não couber no aparelho, as já gravadas e o arquivo voltam ao que eram, e a tela avisa: "Não consegui gravar no aparelho … — nada foi mudado. Faça um backup na aba Sono e avise a equipe."
3. **O que volta:**
   - etapas às datas `orig` (as de quando a semana congelou); o histórico de movimentos dela sai do plano (fica no arquivo);
   - ⏩ Adiantar e 🔓 subida aplicados depois da atualização saem. A semana volta à cota com que congelou (segurada, "fechamento"), e o 🔓 volta a ser oferecido quando a semana anterior fechar;
   - dias da Trilha editados à mão voltam a ser gerados (ver B.5.1 para os blocos que ela criou);
   - ✓, %, carimbos, áudio e revisões registrados **desde o 1º acesso à versão nova** saem (ficam no arquivo);
   - fila, 📌, rampa, "Agora não", % de simulado e simulado ligado/desligado voltam ao padrão;
   - o dia sem remédio escolhido por ela volta ao previsto **só se as duas datas ainda vão chegar**. Se o dia escolhido ou o previsto já passou ou é hoje, a escolha fica (ver B.5.6). A prévia mostra as duas datas.
4. **O que fica:**
   - `trilhaFirstOpen` e as semanas congeladas: composição e cota, nunca recalculadas;
   - o que o app registra sozinho: dias cheios para a revisão (`trilhaRevFull`, decisão 73) e a recolocação da semana final. Se ela tinha religado o simulado de 01/01, ele volta à regra, mas a recolocação de hoje não é refeita: o app refaria a recolocação sobre o registro sem as marcas dela, e as etapas dos dias passados perderiam a data. Se ela restaura na semana final, ou na semana antes dela (a partir de 22/12), a recolocação diária da semana final continua, mas só para as etapas do dia da restauração em diante. **As etapas dos dias anteriores ficam no bloco do dia, para ela marcar** (`trilhaFinalKeep`). O que ela não fez aparece no ⏳ ("Ver como recolocar"). Sem isso, no dia seguinte toda etapa ainda não remarcada iria para "depois de 01/01" e sairia dos blocos;
   - tudo o que é de antes da atualização: histórico do curso, dias de transição, e marcas sem data, de antes de 26/10, ou de antes do 1º acesso registradas assim no congelamento. Uma revisão conta pela data em que foi marcada, não pela data do bloco.
   - Junto com a revisão D+30 sai o reforço (R3), que depende dela.
5. **Grava o estado em que o app assenta.** Ao gravar, roda o congelamento sobre o estado restaurado. Por isso **restaurar de novo mostra "Nada a restaurar"** e o arquivo não cresce. Vale também num plantão longo com revisão vencida (10/11) e na semana final (30/12).

### B.3 · Desfazer e Refazer

- **"Desfazer a restauração"** reaplica o arquivo e mostra antes a lista do que volta e do que sai da tela, tudo o que foi feito depois da restauração:
  - marcas, com data;
  - etapas recolocadas ("mudada depois da restauração → volta para …");
  - dias editados;
  - escolhas;
  - ⏩/🔓 feitos depois.
  
  O estado de agora vai para o arquivo ("antes de desfazer").
- **Uma semana que congelou depois da restauração fica como está** (a cota não é recalculada), e a prévia diz isso. Se um módulo do ⏩/🔓 de antes já entrou nessa semana nova, ele não volta para a semana antiga, e a prévia também diz.
- **O dia sem remédio segue a mesma regra no Desfazer e no Refazer.** Se a troca mexeria num dia já vivido ou no de hoje, fica a escolha de agora, e a prévia mostra as duas datas.
- **Os dias de antes da Trilha não mudam.** O que ela marcou depois da restauração no histórico até 19/10 ou nos dias de transição fica, porque a restauração nunca toca nesses dias.
- **"Refazer a restauração"** aparece logo depois de desfazer, inclusive quando uma restauração anterior continua em vigor. Ele reaplica o estado de antes de desfazer: o plano restaurado e o que ela marcou depois. A prévia tem duas partes. **"Saem de novo"** lista o que o Desfazer tinha trazido de volta e a restauração volta a tirar: marcas, ⏩/🔓, escolhas, dia sem remédio. **"Mudanças suas depois de desfazer que saem"** compara com o estado que o Desfazer gravou e mostra só o que ela mudou de fato.
- Os dias cheios para a revisão seguem uma regra própria: até o dia do estado guardado voltam como estavam; depois dele, o que o app registrou fica.

### B.4 · Depois de restaurar (o uso pela paciente)

- As etapas dos dias que já passaram aparecem como **⏳ pendentes** — é esperado.
- **Marcar no bloco do dia passado carimba a data daquele dia** (`min(hoje, data do bloco)`) e a lista de pendentes encolhe (TR17: 11 → 9).
- **"Revisei" no bloco de um dia passado agora também carimba a data daquele dia** (antes carimbava hoje; só na Trilha — o histórico até 19/10 não muda). Sem isso, a revisão remarcada mudaria a data do D+30.
- **"Ver como recolocar"** propõe novos dias a partir de hoje, ancorado nos carimbos reais, e só grava com "Aplicar".
- O cartão mostra:
  - "✅ Plano restaurado em dd/mm às hh:mm";
  - o botão **"💾 Baixar backup agora"** com o pedido de backup novo antes de marcar;
  - os 3 passos da equipe;
  - **"O que estava marcado antes da restauração"** (datas e %, com ✓ no que ela já remarcou), para ela remarcar a partir da lista e não de memória.
- Se ela abrir "Ver o que mudou" depois de remarcar, o diagnóstico avisa as marcas feitas depois da restauração, e o botão vira **"Aplicar mesmo assim"**. Restaurar de novo fica como um link discreto.

**Observação para a equipe — a proposta de recolocar em 07/11 (cenário TR17).** Ela remarca a aula de 28/10 e as questões de 29/10 e toca em "Ver como recolocar". A proposta põe:

- a apostila de CIR1 · Trauma I em DOM 08/11, com o aviso "10 dias após as questões — fora de 1–2" (o intervalo ideal já passou);
- as cadeias de Trauma II e Urologia em SEX 13/11 (⚠️ 10,2h) · DOM 15/11 · SEG 16/11.

Os dias de 13 a 16/11 recebem também as 3 aulas da T2, que começam em 09/11. A proposta só grava com "Aplicar" — a escolha é dela.

### B.5 · Para a equipe decidir — conflitos apresentados, padrão aplicado

1. **Os blocos que ela criou nos dias da Trilha (compromissos).** O pedido diz "descarte as edições de dias da trilha". O padrão segue o pedido: saem da tela e ficam no arquivo. Mas "idêntico ao da última atualização" incluiria um dia editado antes da atualização (a migração de 26/10 manteve os blocos dela, TR16). **A prévia oferece "Manter nos dias regenerados os N bloco(s) que você criou", desmarcado**, e marca os blocos de antes da atualização. Marcado, o dia volta a ser o gerado com o bloco dela (sem ✓) antes do lazer. A prévia seguinte já abre com a escolha da restauração em vigor.
2. **⏩ e 🔓 aplicados depois da atualização saem.** São ações dela depois da atualização ("como se não tivesse marcado nem movido nada"). O congelamento da semana fica: mesma composição e a cota com que congelou. Se a equipe preferir manter o ⏩/🔓, as etapas desses módulos viram ⏳.
3. **"Desde a atualização" = desde o 1º acesso à versão nova (27/10 no exemplo).** Uma marca de antes do 1º acesso fica, se o congelamento a registrou assim. Exemplo: uma apostila marcada na versão anterior em 26/10.
4. **Além da lista do pedido, também voltam ao padrão** o liga/desliga de simulado (`simOverrides`) e o histórico de movimentos dentro do `trilhaPlan`. **Não voltam** o registro de dias cheios para a revisão e a recolocação automática da semana final: os dois são do app, e mexer neles fazia "restaurar duas vezes" mudar o estado.
5. **Uma semana congelada com 📌 ou ↑ fica como congelou.** Se ela congelou com menos módulos do que a cota (a cadeia do próximo não coube), o diagnóstico mostra "entraram N" e explica. "A cota não pode ser recalculada." O diagnóstico mostra o que a fila padrão daria e a razão (📌/fila da hora, um módulo começado por uma marca anterior, ou um ⏩/🔓 que volta para a fila). No exemplo, a T2 congelou com o 📌 CIR4 · Parte I.
6. **O dia sem remédio (🧠) — decidido em 07/11 (padrão mantido).** O pedido diz "volte o dia leve ao padrão". Na semana em curso, isso pode mudar o status de hoje ("🌿 Hoje sem Venvanse") ou reescrever um dia sem remédio que ela já viveu. Pode até deixar dois dias sem remédio na mesma semana. **Aplicado:** a escolha dela volta ao previsto só quando as duas datas ainda vão chegar. Quando uma delas já passou ou é hoje, a escolha fica e a prévia mostra as duas datas ("fica QUA 04/11 (a sua escolha — esse dia, ou o previsto, SÁB 07/11, já passou ou é hoje: o que você viveu não é reescrito)"). A equipe manteve esse padrão em 07/11. **Se a equipe preferir "sempre volta ao previsto", isso deve ser validado com a psiquiatra antes.**

### B.6 · Revisão adversarial — 1ª rodada (3 lentes, cada achado verificado): 15 achados, todos corrigidos

| # | Achado | Correção | Teste |
|---|---|---|---|
| 1, 7 | Restaurar de novo num plantão longo com revisão vencida (10/11) ou na semana final oferecia "Aplicar" outra vez (o app regrava o dia cheio e a recolocação final); um 2º "Aplicar" tirava o Desfazer do estado original | dia cheio e semana final não são tocados; "mudou?" compara com o estado em que o app assenta; o Desfazer pega a restauração em vigor | TR17c, TR17e |
| 2 | Revisões apagadas sem mostrar data e %; "Revisei" no bloco passado carimbava hoje | diagnóstico e cartão com datas e %; "Revisei" carimba o dia do bloco | TR17, TR17c |
| 3 | Desfazer descartava em silêncio o que ela fez depois; sem volta | prévia com a lista do que sai; "Refazer a restauração" | TR17 |
| 4 | Gravação sem conferência: falha parcial dizia "ok" | tudo ou nada, com volta do arquivo | TR17b |
| 5 | 🔓 de depois da atualização continuava (cota 4 em vez de 3 segurada) | sai; a semana volta ao congelado | TR17d |
| 6 | ⏩ de depois da atualização continuava, com ⏳ a mais | sai e volta para a fila | TR17d |
| 8 | Corte em 26/10, não no 1º acesso | corte no 1º acesso com prova do congelamento | TR17c |
| 9 | Blocos dela e dias de antes da atualização saíam sem opção | opção na prévia; os de antes marcados | TR17f |
| 10 | Campo sem carimbo contava como "depois" | sem carimbo = de antes (fica) | TR17c |
| 11 | Nota da semana congelada atribuía tudo aos 📌 | razões separadas | TR17, TR17c |
| 12 | Semana final: "Aplicar" apagava as datas de ~100 etapas | a recolocação final é do app; nada é refeito no registro vazio | TR17e |
| 13 | Confirmação do Desfazer escondia as semanas congeladas depois | listadas; ⏩/🔓 que já estão nelas não voltam | TR17d |
| 14 | Depois de remarcar, "Aplicar" tirava as marcas novas sem avisar | aviso, "Aplicar mesmo assim", link discreto | TR17 |
| 15 | ⏳ prometido ≠ banner (sexta que volta a ser simulado) | mesma conta do banner | TR17e |

**2ª rodada (3 lentes de novo, sobre as correções; cada achado verificado):** 17 achados confirmados, todos corrigidos e testados. Três foram recusados pelos verificadores.

| Achado | Correção | Teste |
|---|---|---|
| Semana final com o simulado de 01/01 religado: "Aplicar" refazia a recolocação no registro vazio (139 etapas sem data) | a marca do dia acompanha o simulado que volta à regra; nada é refeito hoje | TR17e |
| Refazer descartava sem listar o que ela mudou depois de desfazer (📌, rampa, etapas, dias) | a prévia do Refazer usa a mesma lista do Desfazer | TR17 |
| Depois de restaurar com "Manter os blocos", a prévia seguinte voltava desmarcada e oferecia "Aplicar" | a prévia abre com a escolha em vigor | TR17f |
| Desfazer/Refazer trocavam o schedule inteiro: marcas de depois no histórico e na transição sumiam | dias de antes de 26/10 ficam como estão | TR17c |
| Dia sem remédio: a restauração mudava o de hoje sem dizer as datas | regra das duas datas (B.5.6) | TR17, TR17f |
| Desfazer podia pôr o mesmo ⏩ em duas semanas | o conjunto "congelou depois" inclui ⏩/🔓 | TR17d (sem módulo em duas semanas) |
| Reforço R3 ficava sem o D+30 | sai junto com o D+30 | TR17c |
| Refazer sumia com uma restauração anterior em vigor | Refazer independe de haver restauração em vigor | TR17 |
| Revisão marcada num bloco anterior ao 1º acesso escapava da restauração | conta a data em que foi marcada (`r1MarkedAt`/`r2MarkedAt`) | TR17c (grava a data em que foi marcada) |
| Semana congelada com 0 de 3 módulos aparecia como "3" | "entraram N" e nota explicando | — |
| Nota da semana: razão "📌" em semana empurrada por um ⏩/🔓; concordância de "as questões"; frase de "amanhã" em 01/01; legenda "marque só o que você fez de verdade" (💬) | textos corrigidos; o texto da equipe ("sem mover tarefa à mão de novo") fica | TR17c |

Recusados pelos verificadores (comportamento pedido, sem perda):
- a rampa de uma semana já congelada "volta ao padrão" com a cota mantida. O texto agora diz "a cota da semana fica N";
- um dia editado antes da restauração volta como era numa semana que congelou depois;
- uma marca de antes da atualização que ela desmarcou depois não é recriada. A prévia agora informa.

**3ª rodada (2 lentes sobre as correções da 2ª; cada achado verificado):** 6 achados confirmados, todos corrigidos e testados.

| Achado | Correção | Teste |
|---|---|---|
| Prévia do Refazer comparava com o estado de antes da restauração: dizia "entrou no plano depois de desfazer" para um ⏩ que o Desfazer trouxe, e listava etapas "mudadas" para a mesma data | compara com o estado que o Desfazer gravou e só lista mudança real | TR17d |
| Prévia do Refazer dizia "nada" sai, mas tirava de novo as marcas, o ⏩/🔓 e o dia sem remédio | seção "Saem de novo" | TR17d |
| Desfazer/Refazer devolviam o dia sem remédio inteiro (podia virar hoje, ou reescrever o dia vivido) | mesma regra das duas datas da restauração | TR17g |
| Semana final: no dia seguinte à restauração, toda etapa ainda não remarcada ia para "depois de 01/01" | as etapas dos dias anteriores à restauração ficam no bloco do dia (`trilhaFinalKeep`) | TR17e |
| Prévia sem a data prevista do dia sem remédio numa semana ainda não congelada | data da prévia do plano | TR17f |

**4ª rodada (2 lentes sobre as correções da 3ª; cada achado verificado):** 12 achados confirmados, todos corrigidos. Quase todos eram textos das prévias de Desfazer e Refazer em sequências raras. Um era um furo de dados.

| Achado | Correção | Teste |
|---|---|---|
| Restaurar em 28/12 (véspera da semana final) não protegia as etapas: em 29/12, 137 iam para "depois de 01/01" | a proteção vale a partir de 22/12, e a prévia avisa | TR17i |
| A prévia do Refazer refazia a regra do dia sem remédio com a data de hoje e mostrava uma escolha que ela não fez | usa o dia do Desfazer | TR17h |
| "📌 → voltam ao padrão" quando o Refazer traz de volta o 📌 que ela fixou depois da restauração | separa "volta ao padrão" de "volta como você deixou" | — |
| A prévia do Desfazer dizia que o dia sem remédio "volta" quando ele fica | o resumo usa só o que muda; o dia sem remédio tem linha própria | TR17g |
| No Refazer, um dia sem remédio mantido aparecia em "Saem de novo" | vai para "Fica como está" | TR17h |
| A recolocação automática do app aparecia como mudança dela (semana final, Desfazer/Refazer em outro dia) | a mudança feita pelo app não é atribuída a ela; a prévia compara com o estado em que o app assenta | — |
| O Refazer não listava etapas e dias editados que o Desfazer tinha trazido e ele tira de novo | listados em "Saem de novo" | — |
| As prévias de Desfazer/Refazer não davam a data prevista do dia sem remédio numa semana ainda não congelada | data projetada | — |

**Limite conhecido.** Os textos das prévias de Desfazer e Refazer, em sequências longas de restaurar, desfazer e refazer misturadas com a recolocação diária da semana final, são o melhor esforço. Os dados estão sempre certos e guardados: tudo vai para o arquivo antes, e cada ação pode ser desfeita.

### B.7 · Passagem pelos oito

| | Veto? | Por quê |
|---|---|---|
| 🧠 Psiquiatria | não | Nenhum texto novo fala de horário de medicação. Um dia sem remédio já vivido, ou o de hoje, nunca é reescrito pela restauração, e a prévia mostra as duas datas (conflito apresentado em B.5.6). |
| 📚 Pedagogia | não | As datas reais voltam a ancorar os intervalos: marcar no bloco do dia passado e "Revisei" carimbam aquele dia. A recolocação avisa quando um intervalo ideal já passou. |
| 😴 Sono | não | A prévia mostra os dias acima de 14,5h nas próximas 2 semanas antes de aplicar, e a proposta de recolocar marca ⚠️ nos dias pesados. |
| 🩺 Preceptor | não | A fila e a ordem não mudam. A semana congelada fica como congelou. |
| 🏃 Corpo | não | Dias regenerados com a academia de sempre (sábado sem treino). |
| 🧩 TDAH/funções executivas | não | Os 3 passos e a lista do que estava marcado ficam no cartão. "Aplicar" só depois da prévia; nada some sem estar na lista. Uma decisão por vez no topo (⏳ > 🔓 > ⏩). |
| 💬 Psicóloga TCC | não | Nenhum texto que culpe: "é esperado: depois de restaurar nada está marcado". O ⏳ mantém o "sem culpa: posso propor novos dias". Desfazer e Refazer estão sempre à mão. |
| ⚙️ Dados/engenharia | não | Nada é apagado: tudo vai para o arquivo antes e a gravação é tudo ou nada. Restaurar duas vezes não muda nada. Desfazer e Refazer reaplicam o arquivo. O histórico até 19/10 não muda. |

### B.8 · Bateria e `cmp`

| Suíte | Checks |
|---|---|
| audit | 396 |
| trilha (com TR17, TR17b–i e o aceite TR17z: restauração; TR9c: recolocar com marca fora de ordem) | 341 |
| historico | 148 |
| coverage41 | 80 |
| coverageTrilha | 8 |
| intervalsTrilha | 11 |
| intervals16 | 7 |
| loads16 | 12 |
| simTrilha | 6 |

**1009 checks verdes.** `cmp planner_residencia_2026_offline.html index.html`: idênticos.

Os testes novos da restauração (TR17, TR17b–i, TR17z) mexem pela interface:
- mover etapas e blocos, marcar no bloco e no card;
- 📌, ↑, rampa, dia sem remédio, ⏩ e 🔓;
- restaurar duas vezes, Desfazer, Refazer;
- o plantão longo de 10/11, a semana final de 30/12 e a véspera de 28/12;
- o arquivo ilegível e a gravação que não cabe.

Cada um confere o plano, o registro, o arquivo e o que aparece na tela.

### B.9 · Teste de aceite ponta a ponta — a situação dela (TR17z)

A situação dela foi montada no navegador, toda pela interface (cenário `TR17z` da bateria). O resultado de cada passo:

1. **1º acesso em 27/10.** A semana 1 congela com CIR1 · Trauma I, CIR1 · Trauma II e CIR2 · Urologia (cota 3). Em 03/11, a semana 2 congela com CIR2 · Cicatrização, CIR2 · Cirurgia Pediátrica e CIR3 · Preparo Pré-operatório. A cota é 3, segurada, porque a semana 1 não fechou. Alcance na aba Trilha: **30**. Era 36 no 1º acesso; caiu porque a semana 1 não fechou.
2. **A bagunça, sem marcar nada (em 04/11):**
   - a aula de CIR2 · Cicatrização atrasada de SEG 09/11 para QUA 11/11, o dia das questões. O aviso foi "Mover assim mesmo";
   - a apostila de CIR2 · Cirurgia Pediátrica adiantada de SEX 13/11 para QUI 12/11, que é plantão longo;
   - a selagem de CIR1 · Trauma II levada para TER 10/11 (plantão longo);
   - a selagem de CIR2 · Urologia levada para SEX 06/11 (sexta de simulado);
   - Anki de 08/11 → 09/11 e academia de 09/11 → 08/11.
   
   Ficaram gravados: 4 etapas fora da data original, 2 dias editados, 0 marcas.
3. **Prévia.**
   - "Etapas fora da data original: 4", cada uma com a data de volta.
   - **"Como o plano está agora: 0 fora da ordem · 1 no mesmo dia que outra etapa do mesmo módulo · 3 em dia bloqueado · 2 fora da faixa de intervalo — em 4 módulo(s)"**, e "depois de restaurar: 0 · 0 · 0 · 0".
   - "Dias da Trilha editados à mão: 2"; "Registro…: 0 ✓".
   - **"alcance estimado: 30 módulos agora → 30 depois de restaurar"**, com a linha do ritmo segurado e do bloco 04h30.
4. **Aplicar.**
   - O plano volta exatamente ao que o motor gerou: a semana 1 como congelou em 27/10, a semana 2 como congelou em 03/11, sem histórico de movimentos e sem dia editado.
   - O arquivo guarda a versão anterior inteira, com data e hora.
   - **Uma 2ª restauração diz "Nada a restaurar"** e o arquivo não cresce.
5. **Marcar nos blocos de dias passados.** Aula de CIR1 · Trauma I no bloco de 28/10, aula de CIR2 · Urologia no de 02/11 e as questões dela no de 04/11, ou seja, nas semanas 1 e 2. Os carimbos ficam **28/10, 02/11 e 04/11**, as datas dos blocos. O ⏳ vai de **11 → 8**.
6. **"Ver como recolocar".** A proposta cobre os 3 módulos com ⏳:
   - Trauma I: questões DOM 08/11, apostila SEG 09/11, selagem QUA 11/11;
   - Trauma II: aula SEX 13/11 ⚠️ 10,2h, questões DOM 15/11, apostila SEG 16/11, selagem QUI 19/11;
   - Urologia: apostila DOM 08/11, selagem QUA 11/11.
   
   Conferido etapa a etapa:
   - a ordem é aula → questões → apostila → selagem e nenhum módulo tem duas etapas no mesmo dia;
   - entre as etapas recolocadas, as faixas são respeitadas;
   - nenhuma etapa recolocada cai em dia bloqueado nem antes de hoje;
   - o intervalo com uma etapa feita há muito tempo aparece **avisado** ("11 dias após a aula — fora de 1–2");
   - os ⚠️ de carga só informam: "Aplicar" está lá.
7. **Desfazer e Refazer.**
   - **Desfazer** devolve exatamente a bagunça de antes da restauração (plano, dias da Trilha, registro vazio). A prévia listou as 3 marcas e as recolocações feitas depois.
   - **Refazer** volta ao estado de antes de desfazer: restaurado, com as 3 marcas e a recolocação.

Telas (as mesmas da página do relatório): a prévia, o cartão depois de aplicar e a proposta de recolocar.

### B.10 · As causas da desorganização e o botão "Atrasei: retomar a partir de hoje"

**Contagens da causa — implementadas.** O diagnóstico ganhou a seção "Como o plano está agora", com quatro contagens, antes e depois da restauração (`trilhaPlanIssues`):
- etapas fora da ordem;
- no mesmo dia que outra etapa do mesmo módulo;
- em dia bloqueado (plantão longo, pós-noturno, sexta de simulado), contando só as etapas sem marca;
- fora da faixa de intervalo.

A conta usa a data efetiva: o carimbo, se marcada; a data do plano, se não. No teste de aceite: **0 · 1 · 3 · 2, em 4 módulos → 0 · 0 · 0 · 0**. Os números reais dela aparecem na prévia, no aparelho dela.

**"Atrasei: retomar a partir de hoje" — avaliação, sem implementar.**
- **O que "Ver como recolocar" já faz:** para cada módulo com etapa ⏳, refaz a cadeia a partir da 1ª etapa pendente. Ancora no carimbo da última etapa feita e põe de hoje em diante, com o mesmo agendador do plano: dias abertos, faixas, carga. Só grava com "Aplicar". Não mexe em módulo sem pendência nem na cota das semanas.
- **Sobreposição:** no caso principal ("fiquei para trás, quero retomar de hoje"), o recolocar já é exatamente isso, módulo a módulo.
- **O que ele não cobre:**
  - *Espalhar.* O recolocar encaixa o atrasado nos próximos dias, por cima do que já está planejado. Por isso aparecem dias com ⚠️, como SEX 13/11 com 10,2h. Um "retomar" global empurraria o plano inteiro, aliviando esses dias, mas atrasaria todos os módulos. Isso baixa o alcance e tira as etapas das semanas já congeladas, o que conflita com "a cota não é recalculada".
  - *Pausa à frente*, como 3 dias doente na semana que vem. Ainda não há nada pendente, então o recolocar não aparece. O "Mover o fio todo junto" (PR 2) cobre isso módulo a módulo.
- **Recomendação:** não criar o botão agora. Se as propostas de recolocar continuarem gerando dias pesados, considerar uma opção "espalhar" dentro do próprio recolocar, sem mexer nas semanas congeladas.

### B.11 · Conferência final — item pedido → código → teste

| Item pedido | Onde está (`planner_residencia_2026_offline.html`) | Teste que prova |
|---|---|---|
| Diagnóstico antes de qualquer mudança (`trilhaPlan` × `orig`, `orig` guardado, dias editados, `trail_v1`, revisões, fila, 📌, rampa, dia leve, "Agora não", `simResults`) | `trilhaRestore` (o `diag`) e `restoreEl`, vista "diag" | TR17 (diagnóstico e "não grava nada"), TR17c, TR17z passo 3 |
| Copiar o estado inteiro para `medplanner_schedule_archive_v1`, com data e hora | `restorePlan` (`restaurar`), `trilhaRestoreWrite` | TR17 (o arquivo é igual ao de antes), TR17z 4b |
| Etapas de volta às datas `orig` | `trilhaRestore` passo 1 | TR17, TR17z 4a |
| Descartar edições de dias da Trilha | `trilhaRestore` passo 2 (opção `keepOwn`) | TR17, TR17f, TR17z 4a |
| Limpar ✓, %, carimbos e áudio desde a atualização, depois de arquivar | `trilhaRestore` passo 3 (`preStage`, `preRev`) | TR17, TR17c |
| Fila, 📌, rampa e dia leve ao padrão | `trilhaRestore` passo 4 e regra do dia sem remédio | TR17, TR17f, TR17g, TR17h |
| `trilhaFirstOpen` e congelamento intactos; cota não recalculada | não tocados; só o ⏩/🔓 de depois sai (`trilhaWeekDrop`) | TR17 ("ficam intactos"), TR17d, TR17z 4a |
| Prévia; grava só com "Aplicar" | `restoreEl` "diag" → `run("apply")` | TR17 ("o diagnóstico não grava nada") |
| "Desfazer a restauração" reaplica o arquivo | `trilhaRestoreUndo`, `restorePlan("undo")` | TR17, TR17c, TR17d, TR17z 7a |
| Etapas de dias passados como ⏳ | `buildTrilhaPlan` (`pending`) | TR17 (11), TR17z passo 5 |
| Carimbo `min(hoje, data do bloco)`; o ⏳ encolhe | `toggleProgressField` (já existia); `markReviewDone` com `dayAt` | TR17, TR17c ("Revisei"), TR17z passo 5 |
| "Ver como recolocar" a partir de hoje, ancorado nos carimbos | `trilhaProposeRecolocar` (já existia) | TR17, TR17z passo 6 |
| Restaurar duas vezes não muda nada | `trilhaRestoreCalc`, `trilhaRestoreSame` | TR17, TR17c, TR17d, TR17e, TR17f, TR17z 4c |
| Teste de aceite ponta a ponta | — | TR17z (passos 1–7) |
| Contagens da causa da desorganização | `trilhaPlanIssues` e a seção "Como o plano está agora" | TR17z passo 3 |
| Alcance antes/depois, com a linha do ritmo segurado | `restoreEl` (`data-t="restore-reach"`) | TR17z passo 3 |
| Dia sem remédio: o vivido e o de hoje nunca reescritos | `trilhaRestore` (`lightKeep`), `trilhaRestoreUndo` (`light`) | TR17, TR17f, TR17g, TR17h |
| Gravação tudo ou nada | `trilhaWriteKeys`, `trilhaArchiveBack` | TR17b |
| Semana final e véspera | `trilhaFinalKeep` em `restorePlan` e `trilhaFinalPlan` | TR17e, TR17i |
| Refazer | `trilhaRestoreRedo`, `restorePlan("redo")` | TR17, TR17c, TR17d, TR17h, TR17z 7b |
| Texto de uso da equipe e backup novo no app | `restoreEl`, cartão "restore-done" | TR17 (cartão depois de aplicar) |
| Aval: módulo com etapa marcada fora de ordem nunca fica sem proposta nem aviso; duas saídas | `trilhaProposeRecolocar` (`gap`, `reopen`), aviso `data-t="trilha-gap"` no ⏳ | TR9c (as duas saídas) |
| Aval: código e título em toda linha da proposta | `modLbl` no texto do ⏳ e no topo quando o código se repete | TR9c, TR1, TR9 |

**Limitações conhecidas.**
1. **Os dados reais dela estão só no aparelho dela.** O diagnóstico com os números dela aparece na prévia, que ela pode fotografar antes de tocar em "Aplicar".
2. **A restauração não muda o alcance por si.** As semanas 1 e 2 não fecharam, por isso o alcance está em 30, e era 36 no 1º acesso. Fechar a semana libera o 🔓. No bloco 04h30 (16/11 a 11/12), o ritmo não sobe.
3. **"Ver como recolocar":** o intervalo com uma etapa feita há muitos dias fica fora da faixa, avisado ("fora de"). *(Os outros dois pontos desta linha — marca fora de ordem e nome só pelo código — foram corrigidos no aval, §B.12.)*
4. **Prévias de Desfazer/Refazer em sequências longas** (restaurar, desfazer, refazer, misturadas com a recolocação diária da semana final): os textos são o melhor esforço. Os dados estão sempre certos e no arquivo.
5. **"Manter os blocos" vira dia editado.** O dia regenerado com os blocos dela passa a ser um dia editado: a lista fica fixa, como qualquer dia editado.
6. **Marca feita em 26/10 com 1º acesso em 26/10.** Quando a marca é do mesmo dia do 1º acesso, não dá para saber se foi antes ou depois da atualização. Conta como depois.
7. **Restaurar a partir de 22/12.** As etapas dos dias anteriores ficam no bloco do dia e não entram na recolocação automática da semana final. O caminho para elas é o ⏳.
8. **A restauração é inteira.** Não dá para escolher partes, com exceção dos blocos dela.

### B.12 · Correções do aval (07/11)

1. **Módulo com etapa marcada fora de ordem no "Ver como recolocar"** — por exemplo, questões marcadas e a aula não. O módulo nunca fica sem proposta nem sem aviso. Aparece:

   `⚠️ CIR2 — Urologia tem questões marcadas, mas a aula não. Marque a aula se você a viu, ou o app propõe a aula primeiro.`

   Há duas saídas, e o app não decide:
   - **"Marquei a aula (carimbo SEX 30/10)"**: marca a aula com o dia planejado, desde que fique antes das questões; se não ficar, usa o dia anterior a elas. O módulo entra na proposta pelo que falta.
   - **"Propor a aula primeiro"**: reabre a cadeia a partir da aula, de hoje em diante. As questões marcadas ficam como estão e contam só como posição na cadeia. A proposta diz isso.

   Os outros módulos podem ser aplicados enquanto ela não escolhe; o aviso continua lá. Vale para qualquer etapa sem marca antes de uma marcada.
2. **Código e título em toda linha da proposta.** Por exemplo, "CIR1 · Trauma I — Avaliação Inicial e Trauma de Tórax · aula …". No topo do ⏳, quando dois módulos pendentes têm o mesmo código, aparece o título, uma vez para as etapas seguidas do módulo.

Testes: TR9c (os dois caminhos), com TR1 e TR9 ajustados ao novo texto.

## A · Início em 26/10 (pedido de 26/10/2026) — decisão 74

> **Nota de 11/11 (regra de 01/01, §D):** os números desta seção são do plano de 26/10 ("cabem 36 até 01/01", Sem.52 = T10 de 4 dias como última semana, "01/01 só selagem"). Com a regra de 01/01 a prévia de config nova dá 34 aulas até 01/01 = 34 cadeias completas, e, com as T1–T3 já congeladas no aparelho dela, 36 aulas e 36 cadeias (34 fecham até 01/01 e as 36 até 03/01); depois da T10 vêm as semanas da cauda (C1 = 02–04/01, depois TER→SEG) — §D.6. O texto abaixo fica como foi entregue.

A paciente não iniciou em 20/10. A Trilha começa **hoje, SEG 26/10**, com a 1ª aula da fila (**CIR1 · Trauma I**) à tarde, depois do plantão curto 06h–12h; **a ordem da fila não muda** — tudo só desliza para começar hoje. Nada que é ancorado no calendário se desloca: plantões nas datas reais, simulados de 06/11 e 18/12, bloco 04h30 de 16/11 a 11/12, feriados de 3h (24, 25 e 31/12) e o encerramento em 01/01.

### A.1 · O que mudou (e como)

1. **`TRILHA_START = "2026-10-26"`.** A fronteira do histórico ganhou nome próprio: **`POS_CURSO = "2026-10-20"`** — o 1º dia depois do curso. Tudo o que era "fronteira do histórico / motor antigo desligado / registro do curso × da trilha / rótulo pela data" fica em 20/10; tudo o que é "etapa, cota, 1º acesso, revisão" passa a 26/10. A fronteira sozinha não bastou para o histórico: o dia leve da Sem.41 lê a TER 20/10 (e a QUA 21/10), então a edição do tempo do curso desses dois dias é guardada na 1ª carga (`config.trilhaLegacyOv`) e o histórico nunca lê a lista viva deles (§A.7, §A.11).
2. **Semana de 20/10 descartada** (migração ao carregar, revisada pela revisão adversarial — §A.11):
   - **Config:** todo `trilhaWeeks`/`trilhaPlan` feito no calendário antigo (inclusive Adiantar, 🔓 e uma semana de 27/10, se a versão anterior tiver sido aberta depois de hoje) e o `trilhaFirstOpen` antigo saem do plano e ficam em `config.trilhaDescartes` (nada é apagado — ⚙️). `trilhaFirstOpen` passa a ser o dia em que ela abre a versão nova (hoje, 26/10). Escolhas gravadas para as semanas antigas (rampa, dia sem remédio, "Agora não" de 20/10 e de 27/10) **não passam para a T1** — a rampa foi recalculada hoje e a 1ª aula é hoje — e ficam em `trilhaDescartes` (§A.9).
   - **Dias gravados:** o original vai sempre para `medplanner_schedule_archive_v1`. Um dia de 20–25/10 gravado por uma versão anterior (ou com um bloco que não é desta versão nem dela, como um PLAN movido por uma aba antiga) vira transição e **ficam os ✓ dela e os blocos que ela criou** (ex.: uma consulta); o que ela editar nesta versão num dia de transição — tirar, mover ou reordenar blocos, inclusive a nota, ou esvaziar o dia — fica como ela deixou. A partir de 26/10, saem só as etapas do plano antigo e entram as do plano novo daquele dia.
   - **`trail_v1` não é tocado:** módulo com etapa marcada não reabre; módulo fechado não volta. Se houvesse um módulo começado (etapa marcada, sem plano), ele viria à frente da fila para continuar logo (📚 intervalos) — ⚙️ a confirmar (§A.9); com os dados reais nada foi executado, então a fila é a mesma (5, 6, 14…).
   - Idempotente: abrir de novo não faz nada; um backup antigo importado é limpo de novo.
3. **20–25/10 = dias de transição.** O dia tem só o **bloco do plantão** (quando há), **Anki**, **academia** e **lazer** (com a véspera), mais a nota **"🗓️ A trilha começa em 26/10 (segunda) — hoje sem etapa de módulo"**. Sem etapa, revisão, PLAN, 🌿, simulado (nem o botão na sexta 23/10). O painel da semana diz "SEMANA DE TRANSIÇÃO · 20/10–25/10 — a trilha começa na segunda 26/10 com o 1º módulo da fila", o selo diz "Transição" e a aba Trilha mostra "🗓️ Dias de transição (20/10–25/10) …". Nenhum plano, semana ou 1º acesso é gravado nesses dias (só as marcas da migração, `trilhaInicio` e `trilhaLegacyOv`).

   **A forma mais limpa (respondendo à pergunta) — as opções que pesei:**

   | Opção | O que exigiria / o que quebraria |
   |---|---|
   | Estender o regime do curso até 25/10 | o motor antigo voltaria a atuar em 20–25/10 (fios, cascata, DESAT) — você pediu "sem o motor antigo" — e as semanas QUA→TER da Sem.41/42 mudariam |
   | Uma "T0" da trilha com cota 0 | o gerador da trilha poria revisão, PLAN no sábado, 🌿 e o ⏩ Adiantar (que abriria módulo antes de 26/10); a T0 contaria para "fechar" e subir a rampa e para o 1º acesso/cota proporcional — cada um precisaria de um desliga |
   | Um terceiro regime (fase própria no `weekPhase`) | todo ponto que lê a fase ganharia um caso a mais, inclusive o motor antigo |
   | **Escolhida:** dias pós-curso (do lado de cá de `POS_CURSO`, motor antigo já desligado) com um **ramo de transição** | um caso próprio em **18 pontos do código** — gerador do dia, bloco do plantão (2), rótulo do dia, simulado (2), dia leve 🌿, mover (2), painel da semana, selo, identidade do bloco, revisões (3), card da academia, aviso da aba Trilha, saneamento —, **mais** o saneamento dos dias gravados a cada carga e o registro `trilhaLegacyOv` para a Sem.41. Não é pouco; é a que menos mexe no que já valia e a única em que nada da trilha nem do curso "vaza" para 20–25/10 |
4. **Semanas:** Sem.42 = transição 20–25/10 (TER→DOM, 6 dias) · **Sem.43 = T1 = SEG 26/10 → SEG 02/11 (8 dias, duas segundas)** · depois TER→SEG: T2 03–09/11 … **T10 = Sem.52 = 29/12–01/01** (4 dias) — **10 semanas**. A chave da T1 é "2026-10-26" (uma segunda). O dia ativo do Cronograma passou a distinguir as duas segundas (tocar na aba 02/11 abre o 02/11; ◀ a partir de SEG 09/11 cai na SEG 02/11, a mais perto); as 8 abas cabem num celular de 360px; o seletor 🌿, o "mover para" e a grade da academia levam a data quando a semana tem 8 dias.

### A.2 · Rampa semana a semana

Mesma forma aprovada (começa leve, travada no bloco 04h30, pico em 15–21/12, zero na semana final), com uma semana a menos: **3 · 4 · 4 · 4 · 4 · 4 · 4 · 5 · 4 · 0 = 36**. T3 (10–16/11, pelo 16/11) a T7 (08–14/12, pelo 08–11/12) tocam o bloco 04h30 — não sobem; a T8 (15/12) só vai a 5 se a T7 fechar.

| Semana | Datas | Dias | Rampa | Cota | Estado | Módulos novos |
|---|---|---|---|---|---|---|
| T1 (Sem.43) | 26/10–02/11 | 8 | 3 | 3 | congelada hoje | CIR1 Trauma I · CIR1 Trauma II · CIR2 Urologia |
| T2 (Sem.44) | 03/11–09/11 | 7 | 4 | 4 | prévia | CIR2 Cicatrização de Feridas e Queimaduras · CIR2 Cirurgia Pediátrica · CIR3 Preparo Pré-operatório e Risco Cirúrgico · CIR3 Hérnias da Parede Abdominal |
| T3 (Sem.45) | 10/11–16/11 | 7 | 4 | 4 | prévia | CIR4 Especialidade Cirúrgica — Parte I · CIR4 Especialidade Cirúrgica — Parte II · NEF1 Glomerulopatias I · GIN1 Ciclo Menstrual e Anticoncepção |
| T4 (Sem.46) | 17/11–23/11 | 7 | 4 | 4 | prévia | NEF1 Glomerulopatias II · GIN1 Amenorreia e Ovário Policístico · NEF2 Distúrbio Hidroeletrolítico · OBS1 Diagnóstico de Gravidez e Modificações do Organismo |
| T5 (Sem.47) | 24/11–30/11 | 7 | 4 | 4 | prévia | NEF3 Insuficiência Renal · NEF2 Distúrbio Ácido-Básico · PRE1 Medidas de Saúde Coletiva · PED1 Neonatologia I |
| T6 (Sem.48) | 01/12–07/12 | 7 | 4 | 4 | prévia | PRE2 Estudos Epidemiológicos · ANAT Bônus Anatomia · REU1 Intro à Reumatologia + Artrites · PED1 Neonatologia II |
| T7 (Sem.49) | 08/12–14/12 | 7 | 4 | 4 | prévia | REU1 Gota; Febre Reumática · PRE2 Epidemiologia Clínica · OBS2 Assistência Clínica ao Parto e Parto Prematuro · PRE3 Vigilância da Saúde |
| T8 (Sem.50) | 15/12–21/12 | 7 | 5 | 5 | prévia | REU2 Colagenoses · PRE3 Saúde do Trabalhador + Ética Médica · REU2 Vasculites · PED2 Aleitamento Materno · HEM1 Anemias I |
| T9 (Sem.51) | 22/12–28/12 | 7 | 4 | 4 | prévia | PED2 Crescimento e Desenvolvimento Normais · HEM1 Anemia II · HEM2 Leucemias Agudas e Crônicas · HEM2 Linfomas e Mieloma Múltiplo |
| T10 (Sem.52) | 29/12–01/01 | 4 | 0 | 0 | prévia | — |

Soma das cotas: 36. Alcance N = 36 (dentro, as 4 etapas datadas até 01/01); fila = 93; fora = 57.

### A.3 · Alcance

**N = 36 dentro** (as 4 etapas datadas até 01/01, supondo que cada semana feche — a prévia não é promessa) · **57 fora** (fila de 93) · 0 fechados. A sua conta (≈ 36) bate. Com a T1 em 3, se uma etapa da T1 ainda estiver sem marcar em 02/11, a T2 começa segurada em 3; marcando-a durante a T2 (até 09/11), o 🔓 propõe subir para 4 e, com "Aplicar", o alcance volta a 36. Fica em **30** só se a etapa não for marcada durante a T2 ou se você recusar o 🔓 — aí o bloco 04h30 trava T3–T7 em 3 (§A.9.1). Saem do alcance os 4 que eram #37–#40 no plano de 20/10: **HEM2 · Distúrbios da Hemostasia, GAS1 · Doenças do Esôfago, GIN2 · Sangramento Uterino Anormal, Endometriose e Infertilidade, GAS1 · Doenças do Estômago** (agora os primeiros fora). Últimos dentro: #33 PED2 · Crescimento e Desenvolvimento, #34 HEM1 · Anemia II, #35 HEM2 · Leucemias, #36 HEM2 · Linfomas e Mieloma.

### A.4 · Cota proporcional na 1ª semana (8 dias) — a escolha

A regra da decisão 71 fica como está: a semana do 1º acesso recebe `round(rampa × dias que restam ÷ dias da semana)`, contando o dia do 1º acesso, e só quando o 1º acesso cai **depois** do 1º dia da semana. Na T1 o denominador é **8**. Como o 1º acesso é hoje e hoje é o 1º dia, **restam 8 de 8 dias ⇒ cota cheia (3)**, sem marca de proporcional — e a T2 sobe a 4 se a T1 fechar. Por quê: a proporcionalidade existe para a semana não abrir acima do que os dias que sobram sustentam; com a semana inteira pela frente não há o que reduzir, e a T1 de 8 dias fica leve (pior dia de estudo: 4,3h, QUA 28/10; 27/10 é plantão longo). Se ela só abrisse depois: 27/10 → 3 (round 2,625) · 28, 29 e 30/10 → 2 (alcance 35) · 31/10 e 01/11 → 1 (34) · 02/11 → 0 (33). Abrindo em 27, 29 ou 30/10, a QUI 05/11 fica em **14,5h** — no limite, sem passar (testado: TR13 em 28/10, TR13b em 02/11, TR13c em 26/10, `simTrilha.js` para todas as datas).

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

**De 09/11 em diante a carga por dia é idêntica à do plano de 20/10** (mesmas semanas TER→SEG, mesma rampa — conferido dia a dia); só os módulos andam 4 posições. Em **04, 05 e 08/11** ficou mais leve (10,3h, 13,0h e 1,6h, contra 13,7h, 14,5h e 2,3h no plano de 20/10): a cauda da antiga semana de 27/10 saiu. Acima do 📚 (informativo, abaixo do tempo hábil): QUA 11/11 e SEX 13/11 (10,3h — decisão 70), TER 17/11 (5,3h num dia de 04h30), QUI 17/12 (8,7h — decisão 72) e as sextas de simulado (06/11, 18/12).

**Uso real (`tests/simTrilha.js`, o motor do app simulado dia a dia):** varredura de todas as datas possíveis de 1º acesso, **26/10 → 28/12 (64 datas): nenhuma deixa dia acima de 14,5h** — três ficam no limite (1º acesso em 27, 29 ou 30/10 põe a QUI 05/11 em 14,5h). Simulação progressiva com 1º acesso hoje, ela fazendo tudo no dia e as revisões vencidas no 1º dia com folga, com selagens a **50, 70 e 85%**: **36 módulos fechados até 01/01** nos três casos; nenhum dia acima de 14,5h (pior: 14,33h, TER 17/11); revisões deslizam no máximo 1 dia (decisão 73).

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
| 8 | CIR4 Especialidade Cirúrgica — Parte I | 10/11 | DOM 15/11 | SEG 16/11 | TER 17/11 | SEX 20/11 | 1 | 1 | 3 |
| 9 | CIR4 Especialidade Cirúrgica — Parte II | 10/11 | DOM 15/11 | TER 17/11 | QUA 18/11 | DOM 22/11 | 2 | 1 | 4 |
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
| 24 | REU1 Gota; Febre Reumática | 08/12 | QUA 09/12 | SEX 11/12 | SÁB 12/12 | TER 15/12 | 2 | 1 | 3 |
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

Ideais: questões→apostila em 1 dia 27/36 · apostila→selagem em 3 dias 31/36 · aula→questões em 1 dia 15/36 — nos 21 com 2 dias, o dia seguinte à aula é plantão longo em 6, o dia leve previsto em 6, sexta de simulado em 3 e dia de 04h30 em 6. Nenhum módulo com duas etapas no mesmo dia; nada em plantão longo (27/10, 03/11, 10/11, 12/11) nem em sexta de simulado; nenhuma aula no dia leve previsto nem em 24/25/31/12; 01/01 só selagem.

### A.7 · 20–25/10 sem etapa nenhuma e histórico até 19/10 idêntico

- **20–25/10:** nenhuma etapa, áudio, revisão, PLAN, 🌿 ou simulado em nenhum dos 6 dias — conferido pela tela, pela etiqueta e pelo texto de cada bloco (TR0, TR0b, S7b, intervalsTrilha, coverageTrilha) e também com o app chegando com a semana de 20/10 congelada pela versão anterior e dias gravados com etapa antiga, simulado religado ou PLAN (TR16, TR16c: o original vai para o arquivo e o dia fica de transição, com os ✓ dela) ou com o arquivo ilegível (TR16g: nada muda até o arquivo voltar). Cada dia: TER 20/10 plantão longo (🚑 só Anki no trajeto) · QUA 21/10 plantão 13h–18h · QUI 22/10 plantão 06h–12h · SEX 23/10 plantão 05h30–17h (sem simulado) · SÁB 24/10 Anki e lazer · DOM 25/10 Anki, academia e "dormir ~21h45" (plantão 06h de 26/10).
- **Histórico:** `historico.js` compara o app de antes da Trilha (git 11c65b8) com o novo, dia a dia de 07/01 a 19/10, em quatro modos — relógio na quarta de cada semana, relógio em 21/10 (agora transição), **relógio em 26/10 (hoje)** navegando ◀ até a Sem.1 e, no modo D, **20 e 21/10 gravados depois do curso**: (D1) pela versão de 20/10, com etapas e ✓; (D2) com ✓ marcado por ela num dia de transição na versão nova; (D3) uma edição de 20/10 feita no tempo do curso, que continua valendo — também depois de uma aba antiga apagar o registro (D3b) ou de um "↺ Voltar ao padrão" na versão de 20/10 (D5); (D4) nada gravado na 1ª carga e, depois, a TER 20/10 só com um bloco dela; (D6) o mesmo feito na versão de 20/10; (D7) a TER 20/10 esvaziada depois do curso, com e sem "↺"; (D8) bloco criado na noite de 19/10, com o aparelho em dois fusos. Em todos a Sem.41 é a do app de antes da Trilha: o dia leve histórico (que lê a TER 20/10) só usa uma lista do tempo do curso; lista gravada depois do curso nunca conta. Para contar como edição do curso, a lista precisa de prova: não vazia, sem campo da trilha, sem bloco criado a partir de 20/10 (meia-noite em Salvador, o mesmo corte em qualquer aparelho) e com ao menos um bloco do curso; uma TER 20/10 esvaziada depois do curso vale o gerado (D7), e um bloco criado na noite de 19/10 conta como do curso em qualquer fuso (D8). **Limite conhecido:** se, na versão de 20/10, ela tirou ou reordenou blocos de uma edição do tempo do curso da TER 20/10, a lista continua com cara de "curso" e não há como distinguir — vale a lista como ficou; e uma TER 20/10 esvaziada já no tempo do curso também vale o gerado. Única diferença, a de sempre: a TER 20/10 não está na Sem.41 (é o 1º dia pós-curso). Resultado na §A.10.

### A.8 · Passagem pelos oito

| | Veto? | Por quê |
|---|---|---|
| 🧠 Psiquiatria | não | Nenhum horário de medicação em nenhum dos 74 dias (6 de transição + 68 da Trilha), nem no bloco 04h30 ("janela do estimulante a validar com a psiquiatra"). A T1 começa leve (3 módulos em 8 dias); um dia leve previsto por semana (na T1: SÁB 31/10), nunca com aula nova. |
| 📚 Pedagogia | não | Cadeia completa e dentro das faixas da decisão 40 em todos os 36; a fila não muda; nenhuma etapa antes de 26/10. |
| 😴 Sono | não | Nenhum dia acima de 14,5h (prévia; varredura de 64 datas e simulação progressiva em `simTrilha.js` — três datas de 1º acesso, 27, 29 e 30/10, põem a QUI 05/11 em 14,5h, no limite). Plantão longo sem etapa de mesa; vésperas mantidas, inclusive nos dias de transição (21, 22 e 25/10). |
| 🩺 Preceptor | não | Cirurgia primeiro; CIR1 · Trauma I hoje, na tarde livre depois do plantão de 06h–12h. Os simulados de 06/11 e 18/12 têm a correção no mesmo dia; nada troca profundidade por volume (cadeia completa sempre); a T1 = 4 é escolha sua (§A.9.1). |
| 🏃 Corpo | não | Academia nos dias de transição como nos demais (sábado sem treino — ver §A.9). |
| 🧩 TDAH/funções executivas | não | Uma tela por dia, a nota de transição diz o que esperar; nada de ⏳ herdado da semana descartada; as 8 abas e as duas segundas distinguíveis. |
| 💬 Psicóloga TCC | não | Nenhum texto que culpe: a nota de transição só informa ("a trilha começa em 26/10"), e não ter começado em 20/10 não vira atraso (nada de ⏳ herdado da semana descartada). Lazer como bloco em todos os 74 dias (6 de transição + 68 da Trilha). Válvulas de escape mantidas (⏳ "sem culpa: posso propor novos dias", revisão de dia cheio opcional que desliza). O que é escolha sua está em §A.9, com o padrão aplicado e a alternativa. |
| ⚙️ Dados/engenharia | não | Nada apagado: semana de 20/10 e escolhas antigas em `trilhaDescartes`, originais dos dias gravados no arquivo (os ✓ e blocos dela ficam na tela; o que ela edita nesta versão fica como ela deixou; "↺" nunca apaga um dia que não conseguiu guardar), `trail_v1` intocado; migração idempotente e refeita se o arquivo falhar (arquivo ilegível nunca é sobrescrito); histórico idêntico ao app de antes da Trilha, também com 20 e 21/10 gravados depois do curso (limite conhecido em §A.7). |

### A.9 · Para você decidir — o padrão está aplicado; a alternativa, não

> **Decidido em 27/10 (aval do PR #17):**
> 1. **T1 = 3** — o padrão fica: a rampa começa abaixo da capacidade de propósito, para instalar o hábito antes do volume; o caminho de volta é o 🔓 (etapa marcada até 09/11 devolve o 36) e o ⏩ (com a semana fechada, chega aos 37).
> 2. **SÁB 24/10 sem academia** — a regra do sábado, que já era o comportamento do app (nenhuma mudança no código).
> 3. **Interpretações da migração (itens 3–5 abaixo)** — confirmadas como implementadas.
> 4. **Limite conhecido (§A.7)** — aceito e registrado.
>
> **Data do merge (27/10) — para você saber antes de abrir:** o 1º acesso à versão nova será em 27/10 ou depois (item 6). Abrindo **hoje, 27/10** (plantão longo): T1 = 3 (round 2,625), a aula de CIR1 · Trauma I vai para a QUA 28/10, alcance 36 — e a **QUI 05/11 fica em 14,5h**, no limite (o mesmo custo que pesou contra a T1 = 4; nenhum dia passa do teto). Abrindo **amanhã, 28/10**: T1 = 2 (proporcional), alcance 35, 05/11 em 13,0h. Abrir hoje ou amanhã fica com você; aberto hoje, a carga de 05/11 pode ser aliviada movendo uma etapa (o app avisa o espaçamento).

1. **Cota da T1 (8 dias).** Padrão: **3**, a forma "começar leve" aprovada. Alternativa: **4**. Medido no motor:

   | | T1 = 3 (padrão) | T1 = 4 |
   |---|---|---|
   | Alcance se a T1 fechar (todas as etapas marcadas até 02/11) | 36 | 37 |
   | Alcance se uma etapa da T1 ainda estiver sem marcar em 02/11 | a T2 começa em 3; marcando a etapa até 09/11, o 🔓 sobe a T2 para 4 → **36** (a proposta mostra ⚠️ em 11/11 e 13/11); sem marcar na T2 ou recusando o 🔓 → **30** (o bloco 04h30 trava T3–T7 em 3) | 37 — a T2 = 4 não é subida, vale sempre |
   | Pior dia de estudo da T1 | 4,3h (QUA 28/10) | 4,5h (SEG 02/11) |
   | Dias que mudam | — | SEG 02/11 2,8 → 4,5h de estudo; QUA 04/11 10,3 → 12,3h no total; QUI 05/11 13,0 → **14,5h** (no limite); DOM 08/11 1,6 → 2,3h |

   Com 3, se a T1 fechar, o ⏩ Adiantar de 02/11 oferece mais um módulo (CIR2 · Cicatrização de Feridas e Queimaduras, começando ali e terminando na T2) e chega aos mesmos 37 — o Adiantar não conta para "fechar". A T1 congela no 1º acesso à versão nova e, congelada, a rampa dela não muda mais na aba Trilha; então **o 4 "incondicional" só pode ser escolhido antes do merge**; o caminho do Adiantar continua aberto depois. A equipe não fecha questão: 3 é a forma que você aprovou, mas depende de fechar uma semana de 8 dias com o plantão longo de 27/10 (uma etapa que fique sem marcar também durante a T2 custa 6 módulos; marcada até 09/11, o 🔓 recupera); 4 é robusta e põe a QUI 05/11 no limite de 14,5h (😴 sem veto, abaixo do teto).
2. **SÁB 24/10 (transição).** Padrão: Anki e lazer — a regra de sempre tira o treino do sábado (descanso do treino). A sua lista dizia "plantão, Anki, academia e lazer". É um dia passado; se quiser academia no sábado de transição, é uma linha.
3. **Escolhas gravadas para as semanas antigas (⚙️, interpretação).** Padrão: rampa, dia sem remédio e "Agora não" gravados para as semanas de 20/10 ou 27/10 **não passam para a T1** e ficam em `config.trilhaDescartes`. Por quê: o pedido de hoje recalculou a rampa e põe a 1ª aula hoje — um dia sem remédio antigo que apontasse para SEG 26/10 tiraria a aula de hoje (TR16c). Alternativa: reaplicar alguma — o dia sem remédio pelo 🌿 da semana, a qualquer momento; a rampa da T1, só antes do merge (item 1). Não sei se havia alguma escolha assim na sua config; se houver, ela está guardada.
4. **Módulo começado na versão anterior (⚙️, interpretação).** Padrão: vem à frente da fila e continua logo — mesmo assim o intervalo aula → questões fica em ~5–6 dias (no máximo 7), acima da faixa de 1–2 dias. Alternativa: esperar a vez — ~12 dias. Com os seus dados não acontece (nada foi executado).
5. **Dias gravados a partir de 20/10 (⚙️, interpretação).** Padrão: o original vai para o arquivo do app; um dia de 20–25/10 gravado pela versão anterior vira dia de transição com os seus ✓ e os blocos que você criou (as outras mudanças que você tinha feito nele, como tirar ou reordenar blocos gerados, não voltam — estão no arquivo); o que você editar nesta versão num dia de transição (inclusive tirar a nota ou esvaziar o dia) fica como você deixou; de 26/10 em diante o dia perde só as etapas do plano antigo e recebe as do novo. Alternativa: deixar o dia gravado como estava (com as etapas antigas) — o original está no arquivo.
6. **(Informação) 1º acesso.** É o dia em que você abre a versão nova. Hoje → 3. Amanhã (27/10) → 3, com a QUI 05/11 em 14,5h (no limite). 28–30/10 → 2 (alcance 35; em 29 e 30/10, 05/11 também a 14,5h). 31/10–01/11 → 1 (34). 02/11 → 0 (33).

### A.10 · Bateria e `cmp`

Rodada no código final (commit `819e994`), todas com código de saída 0:

| Suíte | Checks | O que cobre |
|---|---|---|
| audit | 396/396 | S0–S20 adaptados à Trilha, + S7b (sexta 23/10 de transição) |
| trilha | 237/237 | transição, T1 de 8 dias (duas segundas, 360px), 1º acesso, plantões, simulados, adiantar, subida, recolocar, mover, migração (TR16–TR16g), revisão em dia cheio, semana final |
| historico | 148/148 | semanas 1–41 dia a dia × app de antes da Trilha, modos A, B, C e D (D1–D8, D3b) |
| coverage41 | 80/80 | todo módulo listado até 19/10 com aula, questões e apostila |
| coverageTrilha | 8/8 | transição sem módulo nem etapa; prévia = congelado; cobertura até 01/01 |
| intervalsTrilha | 11/11 | intervalos dos 36, carga dos 74 dias, nenhuma etapa em 20–25/10 |
| intervals16 | 7/7 | Sem.38 (3 blocos) |
| loads16 | 12/12 | cargas das Sem.38 e 39 |
| simTrilha | 6/6 | uso real: as 64 datas de 1º acesso e a simulação progressiva a 50, 70 e 85% |

**905 checks, todos verdes.** `cmp planner_residencia_2026_offline.html index.html`: idênticos.

### A.11 · Revisão adversarial antes do merge (5 lentes + verificação de cada achado)

Lentes: transição, calendário, migração, semana de 8 dias, docs/testes. Cada achado foi reproduzido (Playwright ou motor em node) e corrigido; depois, três verificações finais refizeram o ataque sobre o último código e conferiram este relatório contra o pedido — os achados delas entraram na tabela e no texto (§A.3, §A.5, §A.7, §A.9). As correções da 3ª verificação foram testadas (falham antes, passam depois), mas não passaram por uma 4ª verificação.

| Achado | Correção | Teste |
|---|---|---|
| Dia gravado pela versão de 20/10 com etapa era arquivado inteiro: uma consulta acrescentada por ela e os ✓ (Anki etc.) sumiam da tela | o original vai para o arquivo; o dia fica com os blocos e ✓ dela, sem as etapas antigas, e recebe as etapas do plano novo daquele dia | TR16c (QUA 28/10) |
| Dia de transição gravado **sem** etapa mantinha PLAN, simulado com o campo de %, texto antigo e ⚠️ de carga | dia de 20–25/10 gravado por uma versão anterior (sem a nota da transição) ou com etapa é refeito como transição na carga (ficam os ✓ e os blocos dela); o que ela edita nesta versão fica | TR16, TR16c (SÁB 24/10 com PLAN; SEX 23/10 com o simulado religado — sem D7, sem campo de %, sem ⚠️) |
| Versão anterior aberta em 27/10 ou depois congelaria a semana de 27/10 (19, 24, 32) por cima da T1 — 6 módulos, 8,7h de estudo em 30/10 | qualquer marca do calendário antigo descarta todo `trilhaWeeks`/`trilhaPlan` (enquanto o config não traz `trilhaInicio`) | TR16e |
| ✓ num dia de transição (20 ou 21/10), ou uma lista da versão de 20/10, mudava o dia leve histórico da Sem.41 (0,3h × 4,1h) | o dia leve histórico só lê edição do tempo do curso (`trilhaCourseList`: sem campo da trilha e sem bloco criado a partir de 20/10), guardada na 1ª carga da versão nova — também se o arquivo falhar, e recuperada do arquivo depois de um "↺" na versão de 20/10 ou de uma aba antiga que apagou o registro | `historico.js` modo D (D1–D6, D3b) |
| Rampa/dia leve/dispensa gravados nas chaves de 20/10 e 27/10 ficavam sem efeito e sem registro | vão para `trilhaDescartes` e não passam para a T1 (na 1ª versão desta correção passavam — a revisão final mostrou que um dia sem remédio antigo tirava a aula de hoje; §A.9.3) | TR16c (rampa 27/10, dia leve 20/10 e 27/10, "Agora não" 27/10) |
| Limpeza dos dias gravados só rodava junto com a do config e não repetia se o arquivo falhasse; um bloco antigo restante podia ser "movido" e reescrever o plano novo | marca própria (`config.trilhaInicio`), repete até gravar; arquivo ilegível ou que não é um objeto nunca é sobrescrito; "mover p/ dia" de um bloco que sobrou num dia de transição só oferece dias da própria semana | TR16d (prévia editada), TR16g (arquivo ilegível, depois legível; opções do mover em 21/10) |
| Módulo começado na versão anterior (ex.: aula feita pelo Adiantar) esperaria a vez na fila — 12 dias entre aula e questões | começado vem à frente da fila e continua logo (≤ 7 dias da aula); nos dados reais nada foi executado | TR16b, TR16f |
| ◀ a partir de SEG 09/11 abria SEG 26/10 (14 dias antes) | o dia ativo guarda a data; vai à segunda mais perto | TR0c |
| 8 abas da T1 não cabiam em celular de 360px (SEG 02/11 escondida) | abas de 36px com espaço de 4px na semana de 8 dias (316px) | TR0 (360px) |
| Título da academia na transição dizia "6 dos 7 dias" | texto sem contagem quando a semana não tem 7 dias | TR0b |
| (testes) Várias checagens de "nenhuma etapa em 20–25/10" liam só a marca `data-tm`, que o app não põe nos dias de transição — não podiam falhar | `transStage` no harness reconhece etapa, revisão, PLAN e simulado também pela etiqueta e pelo texto; usado em TR0, TR0b, TR16, TR16b, TR16c, S7b, intervalsTrilha e coverageTrilha (a). Prova: com o ramo de transição desligado ou a limpeza desligada, as checagens ficam vermelhas | mutantes m1/m2 |
| Bloco criado por ela com etiqueta diferente de "extra" num dia de transição sumiria | fica todo bloco dela (id `c-<hora>` do "adicionar"), qualquer etiqueta; nunca um bloco gerado | TR16c (SÁB 24/10) |
| ✓ na nota "a trilha começa em 26/10" era tirado ao abrir de novo | o ✓ da nota também fica | script fora da bateria (abrir 2×: nada muda, nada arquivado) |
| (testes) "Uso real" (varredura de 64 datas, simulação progressiva) só existia em scripts soltos | `tests/simTrilha.js` (o motor do app num vm do Node), na bateria | simTrilha (6 checks) |
| (2ª verificação) TER 20/10 esvaziada na versão de 20/10 (lista vazia, com ou sem "↺") virava "edição do curso" e mudava a Sem.41 (4,1h → 0,0h) | edição do curso exige prova positiva (não vazia, com bloco do curso) | historico D7a/D7b |
| (2ª verificação) "↺ Voltar ao padrão" com o arquivo ilegível apagava o dia sem guardar (os ✓ e a consulta dela sumiam) | "↺" grava pelo mesmo caminho da migração; se não conseguir, avisa e não apaga | TR16g |
| (2ª verificação) a cada carga, um dia de transição que ela editou nesta versão voltava ao gerado (academia tirada voltava, Anki 1h voltava a 20min) | só é refeito o dia com etapa ou com bloco que não é desta versão nem dela; a edição dela nesta versão fica | TR16c (QUA 21/10 editada, reaberta) |
| (3ª verificação) a regra acima usava a nota como marca "desta versão": tirar ou mover a nota, ou esvaziar o dia, fazia o dia ser refeito; e um PLAN movido por uma aba antiga para um dia já gravado sobrevivia | todo bloco gerado do dia de transição leva a marca `pc` (a nota, `tn`); o dia é refeito só se tiver etapa ou um bloco sem a marca que não seja dela | TR16c (21/10 sem academia e sem a nota, 24/10 vazio, 23/10 com o PLAN de uma aba antiga) |
| (3ª verificação) o aviso do "↺" com o arquivo ilegível dizia "tente de novo", o que não resolve | o aviso diz que o arquivo está ilegível e pede o backup e um aviso à equipe | TR16g |
| (3ª verificação) §A.3/§A.9.1 diziam que uma etapa esquecida na T1 custava 6 módulos sem citar o 🔓 | marcando a etapa durante a T2, o 🔓 sobe a T2 para 4 e o alcance volta a 36 (conferido na tela) | §A.3, §A.9.1 |
| (2ª verificação) o corte de 20/10 para "bloco criado depois do curso" usava a meia-noite do aparelho (outro fuso = outra resposta) | meia-noite de 20/10 em Salvador (−03:00), igual em qualquer aparelho | historico D8 (Salvador e Noronha) |

As checagens das linhas de teste falham na versão de antes de cada correção e passam na de agora, exceto as marcadas "fora da bateria" (conferidas por script) e a linha `transStage`, provada com mutantes (o ramo de transição ou a limpeza desligados de propósito). Várias lentes relataram os mesmos achados (semana de 27/10, arquivo do dia inteiro, limpeza junto com o config); cada um aparece uma vez acima.


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
