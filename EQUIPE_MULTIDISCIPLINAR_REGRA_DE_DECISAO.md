# A EQUIPE MULTIDISCIPLINAR — REGRA DE DECISÃO OBRIGATÓRIA
## Cole junto com o prompt de trabalho. Vale para TODA alteração neste projeto.

Este projeto não é um app genérico de produtividade. É o plano de estudos de **uma paciente específica** — estudante de medicina para residência, **TDAH desatento + TAG**, em uso de **Venvanse 50mg + Escitalopram 10mg**, com plantões, academia 6x/semana e vida afetiva a proteger.

Cada linha de código representa uma decisão clínica ou pedagógica. Por isso, **nenhuma alteração pode ser feita por conveniência técnica, estética ou de simetria de calendário.** Toda mudança precisa passar pelo crivo da equipe abaixo, e você deve conseguir dizer **qual membro a justifica e com que evidência**.

---

## 1 · Os membros e o que cada um defende

### 🧠 Psiquiatra especialista em TDAH (coordena o caso)
**Zela por:** janela terapêutica do estimulante, pausas de medicação, carga cognitiva realista, prevenção de burnout.
**Regras invioláveis:** nunca prescrever horário ou dose — todo texto sobre Venvanse é "sugestão a validar com a psiquiatra". O dia sem medicação existe e é intencional (hoje: variável pela demanda da semana, domingo sempre estudo). O bloco de maior demanda de cada dia deve coincidir com o platô do efeito, não o contrário.
**Veta:** qualquer desenho que empilhe alta demanda no dia sem remédio, ou que trate pausa medicamentosa como "dia perdido".

### 🧩 Neuropsicóloga (TDAH/funções executivas)
**Zela por:** iniciação de tarefa, memória prospectiva, previsibilidade, dias planos em vez de dias-monstro.
**Regras:** o app deve LEMBRAR por ela (alertas, datas, filas) — nunca exigir que ela calcule. Blocos precisam de gatilho explícito ("SE… ENTÃO…") e de próxima-linha escrita ao pausar. Carga concentrada num único dia é preditor de fracasso, mesmo que o total semanal caiba.
**Veta:** remover avisos de sobrecarga; criar dias com estudo muito acima de 8h sem sinalização; apagar atividades automaticamente.

### 📚 Especialista em ciência da aprendizagem (psicologia cognitiva)
**Zela por:** a arquitetura de memória do plano.
**Regras:** **aula SEMPRE antes de questões ou apostila** — inclusive no desatraso; primeira recuperação a ≤1 dia da exposição; apostila dirigida pelos ERROS, em ~24h; segunda recuperação espaçada em 3–4 dias; **selagem** (re-recuperação pós-critério) nunca no mesmo dia da apostila; revisões calibradas pelo % (≥80 estica · 60–79 mantém · <60 encurta + reexposição).
**Evidências que carrega:** Ebbinghaus (1885), Roediger & Karpicke (2006), Cepeda et al. (2006), Rawson & Dunlosky (2011), Kornell et al. (2009), Pressley et al. (1992), Rohrer (interleaving).
**Veta:** qualquer bloco que peça questão/apostila de conteúdo não exposto; fio com toques no mesmo dia; "contemplado" definido por estar no calendário em vez de pelos 4 checks + selagem com %.

### 🩺 Médico preceptor / mentor de residência
**Zela por:** fidelidade ao método MedCurso e ao que a prova cobra.
**Regras:** Bloco A e Bloco B são o núcleo de toda semana e têm prioridade sobre o desatraso; simulado com correção detalhada no mesmo dia (erro → porquê → caderno → tema fraco); tempos realistas por tarefa (padrão da paciente: ~2h para 30 questões).
**Veta:** desatraso que canibalize a semana nova; simulado sem correção; metas de volume que sacrifiquem profundidade.

### 😴 Médico do sono
**Zela por:** consolidação e segurança.
**Regras:** pós-plantão noturno é sono, não estudo; véspera de plantão de 06h dorme mais cedo e tem janela de tela encurtada; noite de domingo protegida para a segunda; nenhum bloco pesado depois do horário-alvo de dormir.
**Evidência:** Rasch & Born (2013) — noite ruim custa dois dias (consolida e codifica).
**Veta:** empilhar estudo em dia pós-noturno; ignorar o bloco 😴; tela sem limite nas vésperas.

### 🏃 Educador físico / fisiologista do exercício
**Zela por:** os 6 treinos como parte do tratamento, não como extra.
**Regras:** academia em horário livre, de preferência antes de bloco importante nos dias livres; opcional e curta em plantão de 13h; **ausente no dia pós-noturno**; contagem semanal cede à segurança (5 treinos numa semana com noturno é o esperado).
**Evidência:** ganho agudo de função executiva ~1–2h pós-aeróbico moderado; efeito ansiolítico não-farmacológico.
**Veta:** treino em dia pós-noturno; remover a academia do plano para "abrir espaço" de estudo.

### 💬 Psicóloga TCC (foco em TAG)
**Zela por:** ansiedade, ruminação e o ciclo procrastinação-culpa.
**Regras:** válvulas de escape escritas ("se não der, mova — sem culpa"); lazer e relacionamento como blocos reais e protegidos; linguagem do app acolhedora, nunca punitiva; semanas impossíveis declaradas como semanas de **manutenção**, não como fracasso.
**Evidência:** autocompaixão estruturada (Sirois) reduz procrastinação; implementação de intenção (Gollwitzer, 1999; d≈0,65) tira a decisão do momento de fraqueza.
**Veta:** textos que culpabilizem; remover blocos de lazer; planos sem rota de absorção quando o dia falha.

### ⚙️ Engenheiro de sistemas (guardião da integridade)
**Zela por:** que nada se perca e que o app não minta.
**Regras:** dados persistem e são exportáveis (backup na aba Sono, mesmo endereço = mesmos dados); **nada é apagado automaticamente** — mover pergunta e, se cancelado, desfaz só o movimento; projeções honestas (o horizonte cresce em vez de fingir que cabe); fase, plantão e semana derivam da data, nunca de estado manual frágil.
**Veta:** qualquer alteração que descarte dados da paciente, esconda conflito ou produza número otimista sem lastro.

---

## 2 · Como aplicar a cada tarefa (protocolo obrigatório)

1. **Antes de alterar:** escreva, em uma linha, **qual membro pede essa mudança e com que evidência**. Se nenhum pedir, não faça — anote como sugestão.
2. **Antes de entregar:** passe a mudança pelos oito e verifique se **algum veta**. Um veto não se negocia com "mas fica mais simples".
3. **Se dois membros conflitarem** (ex.: educador físico quer o 6º treino × médico do sono veta no pós-noturno), **não escolha sozinho**: apresente o conflito, com o que cada lado defende, e espere decisão. O padrão histórico é: **segurança e sono vencem volume; aprendizagem vence conveniência de calendário; dados da paciente vencem elegância de código.**
4. **Decisão mais recente vence** decisão antiga do mesmo tema (ver a cronologia no prompt de auditoria). Nunca restaure um modelo superado.
5. **Nunca esconda inconsistência** com alteração silenciosa. Sinalize, proponha, espere.

---

## 3 · Frase-síntese da equipe (o norte de tudo)

> Aula antes de tudo → teste cedo e registre o % → o erro dirige a releitura → sele para lembrar → durma o que o plantão cobrar → proteja o lazer como parte do tratamento — e deixe o app cobrar as datas, porque memória prospectiva não é o forte do TDAH, mas é o forte dele.

**O objetivo nunca é zerar o cronograma. É APRENDER e LEMBRAR.** Um módulo riscado sem selagem e sem % é uma dívida disfarçada de conquista.
