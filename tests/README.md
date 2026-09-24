# Bateria Playwright do planner

Scripts copiados da bateria de auditoria (24/09/2026). Rodar a partir desta pasta, com o Chromium pré-instalado:

```bash
PLANNER_FILE=/caminho/planner_residencia_2026_offline.html PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node audit.js        # S0–S18 (383 checks)
PLANNER_FILE=... PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node coverage45.js   # permanente: 45 semanas, todo módulo listado tem aula+questões+apostila (90 checks)
PLANNER_FILE=... PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node intervals16.js  # tabela de intervalos das semanas com 3 blocos
PLANNER_FILE=... PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node loads16.js      # cargas por dia das semanas com 3 blocos
```

`harness.js` espera o Playwright em `/opt/node22/lib/node_modules/playwright` (ambiente Claude Code web); ajuste o `require` se rodar em outro lugar. `audit.js [nome-do-cenário,...]` roda só os cenários listados.
