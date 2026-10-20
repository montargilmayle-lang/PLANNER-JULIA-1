# Bateria Playwright do planner

Rodar a partir desta pasta, com o Chromium pré-instalado (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`). `PLANNER_FILE` aponta para o arquivo a testar (padrão: `planner_residencia_2026_offline.html` do repositório). Todo script sai com código ≠ 0 em qualquer falha.

```bash
node audit.js            # S0–S20, adaptados à Trilha em 20/10 (393 checks) · audit.js NOME[,NOME…] roda só os cenários listados
node trilha.js           # Trilha autônoma: TR0–TR15 (+TR13b, TR15b–e) + invariantes (155 checks) · trilha.js TR1,TR5 roda só esses
node historico.js        # histórico intacto: app de antes da Trilha (git 11c65b8, ou PLANNER_BASE/HIST_REF) × novo, semanas 1–41 dia a dia, modos A e B (82 checks) · historico.js 40,41 A
node coverage41.js       # semanas 1–41 com módulos: todo módulo listado tem aula+questões+apostila (80 checks)
node coverageTrilha.js   # Trilha: prévia = congelado, cobertura até 01/01, dia editado + "↺ Voltar ao padrão" (7 checks)
node intervalsTrilha.js  # Trilha: tabela de intervalos dos módulos planejados + carga por dia das 11 semanas (10 checks)
node intervals16.js      # Sem.38 (3 blocos, simulado): tabela de intervalos (7 checks)
node loads16.js          # Sem.38/39: cargas por dia (12 checks)
cmp ../planner_residencia_2026_offline.html ../index.html
```

`harness.js` espera o Playwright em `/opt/node22/lib/node_modules/playwright` (ambiente Claude Code web); ajuste o `require` se rodar em outro lugar. Utilitários: abas por data (`listDayTabs`, `clickDate`), `navWeek`, `headerWeek`, `reopen` (troca o relógio mantendo o localStorage), `markUntil` (marca no registro da Trilha tudo planejado até uma data), `banner`/`clickIn` (avisos `data-t` da Trilha), `summary`.
