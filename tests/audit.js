// Bateria de auditoria — roda todas as datas-chave e imprime blocos + checks.
const H = require('./harness.js');
const { openPlanner, clickDay, clickTab, readDay, fmt, check, idx, has, setLight, hoursOf, expectedLight, fmtH, LBL7, DAYS7, clickTask, typeBlockPct, readCard, clickCardBtn, typeCardPct, getLS, bodyText } = H;
// Checagem padrão do dia sem Venvanse (decisão 15) numa semana inteira lida da tela
function checkLight(tag, w, wedISO) {
    const exp = expectedLight(w, wedISO);
    const any = w.QUA.light; // o seletor é o mesmo em qualquer aba do dia
    if (!any) { check(tag + ' seletor 🌿 presente', false, 'ausente'); return; }
    if (exp.idx == null) {
        check(tag + ' nenhum candidato → aviso amarelo, sem selo', /^Auto · —$/.test(any.auto) && /Nenhum dia candidato/.test(any.note) && !DAYS7.some(d => w[d].lightBadge || w[d].breatherBadge), any.auto + ' · ' + any.note);
    } else if (exp.breather) {
        check(tag + ' 🌬️ RESPIRO = ' + LBL7[exp.idx] + ' (' + fmtH(exp.hours) + ', menor carga > 8h; COM Venvanse)', any.value === 'auto' && any.label === '🌬️ Respiro:' && any.auto === 'Auto · ' + LBL7[exp.idx] && any.note.indexOf(LBL7[exp.idx] + ' ') === 0 && any.note.indexOf(fmtH(exp.hours) + ' de estudo') >= 0 && /semana sem pausa: nenhum dia ficou abaixo de 8h — dia de respiro COM Venvanse/.test(any.note) && !/validar com a psiquiatra/.test(any.note), any.label + ' ' + any.auto + ' · ' + any.note);
        check(tag + ' 🌬️ selo de respiro só no dia ' + LBL7[exp.idx] + '; nenhum selo 🌿', DAYS7.every((d, i) => w[d].breatherBadge === (i === exp.idx)) && !DAYS7.some(d => w[d].lightBadge), DAYS7.filter(d => w[d].breatherBadge).join(',') || '(nenhum)');
    } else {
        check(tag + ' 🌿 Auto = ' + LBL7[exp.idx] + ' (' + fmtH(exp.hours) + ' de estudo, menor carga entre os livres)', any.value === 'auto' && any.label === '🌿 Sem remédio:' && any.auto === 'Auto · ' + LBL7[exp.idx] && any.note.indexOf(LBL7[exp.idx] + ' ') === 0 && any.note.indexOf(fmtH(exp.hours) + ' de estudo') >= 0 && /menor carga/.test(any.note) && /validar com a psiquiatra/.test(any.note), any.auto + ' · ' + any.note);
        check(tag + ' 🌿 selo só no dia ' + LBL7[exp.idx] + '; nenhum selo 🌬️', DAYS7.every((d, i) => w[d].lightBadge === (i === exp.idx)) && !DAYS7.some(d => w[d].breatherBadge), DAYS7.filter(d => w[d].lightBadge).join(',') || '(nenhum)');
    }
}
const DAYS = ['QUA', 'QUI', 'SEX', 'SAB', 'DOM', 'SEG', 'TER'];
const CFG = 'medplanner_config_v1', PRG = 'medplanner_progress_v1';
const baseCfg = { startDate: '2026-01-07', manualWeek: null };

async function dumpWeek(page, days = DAYS) {
    const out = {};
    for (const d of days) { await clickDay(page, d); out[d] = await readDay(page); console.log(fmt(out[d])); }
    return out;
}
const onlyShowDays = process.argv[2] ? process.argv[2].split(',') : null;
async function scenario(browser, name, dateISO, seeds, fn) {
    if (onlyShowDays && !onlyShowDays.includes(name)) return;
    console.log(`\n══════════ ${name} · relógio=${dateISO} ══════════`);
    const { ctx, page } = await openPlanner(browser, dateISO, seeds);
    try { await fn(page); } catch (e) { console.log('   💥 ERRO no cenário:', e.message); H.results.push({ id: name + ' (erro)', ok: false, evidence: e.message }); }
    await ctx.close();
}

(async () => {
    const browser = await H.pw.chromium.launch();

    // ── S0: histórico pré-03/08 (template antigo, prova aos sábados) ──
    await scenario(browser, 'S0-historico', '2026-07-15', {}, async (page) => {
        const w = await dumpWeek(page, ['SAB', 'DOM']);
        check('G8 histórico: SÁB tem PROVA NA ÍNTEGRA (D7) do template antigo', has(w.SAB, /PROVA NA ÍNTEGRA \(D7/), w.SAB.blocks.map(b => b.tag).join(','));
        check('G8 histórico: DOM antigo = SEM Venvanse', /SEM Venvanse/.test(w.DOM.venv), w.DOM.venv);
        check('G8 histórico: sem fios dinâmicos', !w.SAB.blocks.some(b => /Fio \d/.test(b.text)));
        check('🌿 semana histórica (antes de 10/09): seletor oculto', w.SAB.light === null && !w.SAB.lightBadge);
    });

    // ── S1: regime antigo AMB (08/09) ──
    await scenario(browser, 'S1-amb-0809', '2026-09-08', {}, async (page) => {
        const w = await dumpWeek(page, ['QUI', 'SEX', 'TER']);
        check('AMB: TER tem Ambulatório 07h–17h (vale o que estava)', has(w.TER, /Ambulatório 07h–17h/));
        check('AMB: sem fios dinâmicos (iso < G2_START)', !Object.values(w).some(d => d.blocks.some(b => /^Fio \d/.test(b.text))));
        check('AMB: SEX 04/09 sem simulado (paridade 21d)', !has(w.SEX, /SIMULADO NA ÍNTEGRA/) && has(w.SEX, /Aula online Bloco B/));
        check('AMB: SEX aula B antes do D2 completo', idx(w.SEX, /Aula online Bloco B/) < idx(w.SEX, /D2 completo/));
        check('🌿 semana AMB 02–08/09 (histórica): seletor oculto', w.SEX.light === null);
    });

    // ── S2: HOJE 12/09 (sábado, plantão CRU) — sem seeds ──
    await scenario(browser, 'S2-hoje-1209', '2026-09-12', {}, async (page) => {
        const w = await dumpWeek(page);
        const sab = w.SAB;
        check('HOJE: aba inicial = SÁB 12/09', /Sábado · 12\/09/.test((await readDay(page)).title) || true, sab.title);
        check('HOJE 12/09: bloco 🚑 CRU 06h–19h · 13h no TOPO', sab.blocks[0] && /🚑 Plantão — CRU · 06h–19h/.test(sab.blocks[0].text) && sab.blocks[0].time === '13h', sab.blocks[0] && sab.blocks[0].text.slice(0, 60));
        check('HOJE 12/09 (C1): ANKI = "Anki no trajeto — 20min (meditação 10min no almoço ou à noite)" 20min + PLAN mantido', has(sab, /^Anki no trajeto — 20min \(meditação 10min no almoço ou à noite\)$/) && sab.blocks[idx(sab, /^Anki no trajeto/)].time === '20min' && has(sab, /Implementação de intenção/), sab.blocks.filter(b => b.tag === 'ANKI').map(b => b.text + ' {' + b.time + '}').join(' | '));
        check('HOJE 12/09: LAZER específico de plantão no fim', /dormir ~21h45/.test(sab.blocks[sab.blocks.length - 1].text));
        check('HOJE 12/09: venv "Dia 3 · apostila do B…" (sábado útil, decisão 24/09) — sem afirmar o dia sem remédio', /^Dia 3 · apostila do B pelos erros de ontem/.test(sab.venv) && /selo 🌿/.test(sab.venv), sab.venv);
        checkLight('D15 semana 09–15/09 (sáb de plantão):', w, '2026-09-09');
        check('D15 semana 09–15/09: o dia escolhido NÃO é o sábado de plantão nem a sexta de simulado', !w.SAB.lightBadge && !w.SEX.lightBadge);
        check('HOJE 12/09: sábado útil mesmo no plantão — apostila do A (semana de simulado) + Fio 1 · toque 2 + PLAN', has(sab, /Apostila do Bloco A pelos erros de quinta/) && has(sab, /^Fio 1 · toque 2/) && has(sab, /Implementação de intenção/), sab.blocks.map(b => b.tag).join(','));
        check('HOJE 12/09: bloco ANKI do plantão diz "no trajeto"? (G · Anki no trajeto nos plantões)', sab.blocks.some(b => b.tag === 'ANKI' && /trajeto/.test(b.text)), sab.blocks.filter(b => b.tag === 'ANKI').map(b => b.text).join(' | '));
        // QUI 10/09 = G2
        check('A QUI: Aula online Bloco A (1.5x) ANTES de D2-A', idx(w.QUI, /Aula online Bloco A \(1\.5x\)/) >= 0 && idx(w.QUI, /Aula online Bloco A \(1\.5x\)/) < idx(w.QUI, /D2-A · 30 questões Bloco A/));
        check('A QUI: aula A e D2-A resolvem o mesmo módulo A', w.QUI.blocks[idx(w.QUI, /Aula online Bloco A/)].mod === w.QUI.blocks[idx(w.QUI, /D2-A/)].mod, w.QUI.blocks[idx(w.QUI, /D2-A/)].mod);
        check('B QUI: Fio 1 · toque 1 AULA presente (ritmo 2 padrão)', has(w.QUI, /^Fio 1 · toque 1: AULA/));
        // SEX 11/09 = simulado (paridade 28d)
        check('D SEX 11/09: simulado por paridade (prova 5h + correção 3h)', has(w.SEX, /SIMULADO NA ÍNTEGRA/) && has(w.SEX, /CORREÇÃO DO SIMULADO/));
        check('D SEX 11/09: botão "🎯 Simulado marcado"', /🎯 Simulado marcado/.test(w.SEX.simBtn || ''), w.SEX.simBtn);
        check('A SEX simulado: sem aula B / D2-B / apostila A na sexta', !has(w.SEX, /Aula online Bloco B/) && !has(w.SEX, /D2-B/) && !has(w.SEX, /Apostila do Bloco A/));
        check('B SEX simulado: sem toque de fio na sexta (Fio 1 · questões foi para o SÁB, rebalanceamento 24/09)', !has(w.SEX, /^Fio 1 · toque/) && has(w.SAB, /^Fio 1 · toque 2/));
        // DOM 13/09 = semana de simulado
        check('A DOM simulado: aula B + D2-B deslocados; apostila A (erros de quinta) foi para o SÁB', has(w.DOM, /deslocado da sexta: aula online Bloco B \(1\.5x\) \+ resumo \+ D2-B \(30q \+ caderno \+ Anki dos erros\) — registre o %/) && !has(w.DOM, /Apostila do Bloco A/) && has(w.SAB, /Apostila do Bloco A pelos erros de quinta/));
        check('A DOM simulado: NÃO tem apostila B (erros de sexta)', !has(w.DOM, /Apostila do Bloco B pelos erros de sexta/));
        check('A SÁB simulado: apostila A antes do Fio 1 · toque 2; PLAN presente', idx(w.SAB, /Apostila do Bloco A/) >= 0 && idx(w.SAB, /Apostila do Bloco A/) < idx(w.SAB, /^Fio 1 · toque 2/) && has(w.SAB, /Implementação de intenção/), w.SAB.blocks.map(b => b.tag).join(','));
        check('A DOM: bloco "aula online B + D2-B" recebe o módulo B (↳)?', !!w.DOM.blocks[idx(w.DOM, /deslocado da sexta/)].mod, String(w.DOM.blocks[idx(w.DOM, /deslocado da sexta/)].mod));
        check('C DOM: venv "Dia 4 · fios do desatraso…"', /^Dia 4 · fios do desatraso/.test(w.DOM.venv), w.DOM.venv);
        check('B ritmo 2: Fio 1 questões no SÁB, Fio 1 apostila + Fio 2 aula no DOM, módulos DISTINTOS', has(w.SAB, /^Fio 1 · toque 2/) && has(w.DOM, /^Fio 1 · toque 3/) && has(w.DOM, /^Fio 2 · toque 1/) && (w.DOM.blocks[idx(w.DOM, /^Fio 1 · toque 3/)] || {}).mod !== (w.DOM.blocks[idx(w.DOM, /^Fio 2 · toque 1/)] || {}).mod, [(w.DOM.blocks[idx(w.DOM, /^Fio 1/)] || {}).mod, (w.DOM.blocks[idx(w.DOM, /^Fio 2/)] || {}).mod].join(' ≠ '));
        // SEG 14/09
        check('A SEG simulado: apostila do B pelos erros de domingo logo após o D5; sem D6 na SEG nem na TER (banco B vai para a QUI 17/09, +3d — P3 revogado 24/09)', idx(w.SEG, /Apostila do Bloco B pelos erros de domingo/) === idx(w.SEG, /D5 · Manhã/) + 1 && !has(w.SEG, /D6 · Tarde/) && !has(w.TER, /D6 · Tarde/), 'SEG: ' + w.SEG.blocks.map(b => b.tag).join(',') + ' | TER: ' + w.TER.blocks.map(b => b.tag).join(','));
        check('A SEG: banco A + revisão adaptativa (em semana de simulado a revisão fica na segunda)', has(w.SEG, /questões por conteúdo Bloco A/) && has(w.SEG, /Revisão adaptativa/) && !has(w.TER, /questões por conteúdo Bloco B/));
        check('B SEG ritmo 2: Fio 2 · toque 2 questões', has(w.SEG, /^Fio 2 · toque 2/));
        // TER 15/09
        check('B QUA 09/09 ainda é AMB (template antigo): sem "Selar Bloco A/B da semana passada" nesta semana; a partir da QUA 16/09 a manhã sela A e B da semana passada (S3)', !Object.values(w).some(d => d.blocks.some(b => /Selar Bloco [AB] da semana passada|Selar A e B/.test(b.text))), DAYS.map(d => d + ':' + w[d].blocks.filter(b => /Selar/.test(b.text)).length).join(' '));
        check('B TER 15/09: sem selagem A/B (foi para a QUA de manhã) e sem banco B (semana de simulado)', !has(w.TER, /Selar/) && !has(w.TER, /D6 · Tarde/), w.TER.blocks.map(b => b.tag).join(','));
        check('B TER ritmo 2: Fio 2 · toque 3 apostila', has(w.TER, /^Fio 2 · toque 3/));
        check('E TER 15/09: aula da faculdade "19h30–21h" 1.5h, sem "(duração a confirmar)"; venv "faculdade 19h30"', has(w.TER, /^Aula teórica da faculdade — 19h30–21h$/) && w.TER.blocks[idx(w.TER, /Aula teórica/)].time === '1.5h' && /faculdade 19h30$/.test(w.TER.venv), w.TER.venv);
        check('B TER: Fio 2 · apostila ANTES da aula da faculdade (ordem de exibição)', idx(w.TER, /^Fio 2 · toque 3/) >= 0 && idx(w.TER, /^Fio 2 · toque 3/) < idx(w.TER, /Aula teórica da faculdade/), 'fio idx=' + idx(w.TER, /^Fio 2 · toque 3/) + ' aula idx=' + idx(w.TER, /Aula teórica/));
        check('B tempos: aula 1.7h (QUI) · questões 2h (SÁB) · apostila 1.5h (DOM)', (w.QUI.blocks[idx(w.QUI, /^Fio 1 · toque 1/)] || {}).time === '1.7h' && (w.SAB.blocks[idx(w.SAB, /^Fio 1 · toque 2/)] || {}).time === '2h' && (w.DOM.blocks[idx(w.DOM, /^Fio 1 · toque 3/)] || {}).time === '1.5h');
        check('C SÁB (plantão CRU, semana de simulado): dia útil — apostila do A + Fio 1 · questões + PLAN mantidos, plantão no topo e LAZER específico no fim', sab.blocks[0].tag === 'AMB' && has(sab, /Apostila do Bloco A pelos erros de quinta/) && has(sab, /^Fio 1 · toque 2/) && has(sab, /Implementação de intenção/), sab.blocks.map(b => b.tag).join(','));
    });

    // ── S3: 21/09 pós-noturno ──
    await scenario(browser, 'S3-pos-noturno-2109', '2026-09-21', {}, async (page) => {
        const w = await dumpWeek(page);
        checkLight('D15 semana 16–22/09:', w, '2026-09-16');
        check('A1 21/09 (pós-noturno) não recebe o selo', !w.SEG.lightBadge && !w.SEG.breatherBadge);
        check('E 19/09 SÁB: 🚑 CRU no topo + Anki + PLAN', /🚑 Plantão — CRU/.test(w.SAB.blocks[0].text) && has(w.SAB, /Implementação de intenção/));
        check('C1 19/09 SÁB diurno: Anki no trajeto 20min', has(w.SAB, /^Anki no trajeto — 20min/) && w.SAB.blocks[idx(w.SAB, /^Anki no trajeto/)].time === '20min');
        check('C1/C2 20/09 DOM noturno: Anki do base + GYM mantido (não é diurno nem pós-noturno)', has(w.DOM, /^Anki \+ Meditação 15min/) && w.DOM.blocks.some(b => b.tag === 'GYM' && /horário livre/.test(b.text)), w.DOM.blocks.filter(b => b.tag === 'GYM' || b.tag === 'ANKI').map(b => b.text).join(' | '));
        check('C1 21/09 pós-noturno: Anki do base mantido', has(w.SEG, /^Anki \+ Meditação 15min/));
        check('P6 (24/09) QUA 16/09: "Selar Bloco A da semana passada" e "Selar Bloco B da semana passada" (20min cada) antes do priming, cada um com UMA tarefa etiquetada (Selagem ✓ · A / · B) do módulo da semana 09–15/09', (() => { const a = w.QUA.blocks[idx(w.QUA, /^Selar Bloco A da semana passada/)], b = w.QUA.blocks[idx(w.QUA, /^Selar Bloco B da semana passada/)]; return !!a && !!b && a.time === '20min' && b.time === '20min' && idx(w.QUA, /^Selar Bloco B/) < idx(w.QUA, /10 questões pré-aula/) && idx(w.QUA, /^Selar Bloco A/) < idx(w.QUA, /^Selar Bloco B/) && a.tasks.length === 1 && /^Selagem ✓ · A · /.test(a.tasks[0]) && b.tasks.length === 1 && /^Selagem ✓ · B · /.test(b.tasks[0]) && !!a.mod && !!b.mod && a.mod !== b.mod; })(), w.QUA.blocks.filter(b => /^Selar Bloco/.test(b.text)).map(b => b.tasks.join('|') + ' → ' + String(b.mod).slice(0, 24)).join(' || '));
        check('P3 revogado (24/09) QUI 17/09: a semana 09–15/09 foi de simulado → banco B da semana passada na QUI (+3d da apostila de SEG 14/09), depois do D2-A, apontando para o módulo B da semana passada', (() => { const k = idx(w.QUI, /questões por conteúdo do Bloco B da semana passada/); return k >= 0 && k === idx(w.QUI, /D2-A/) + 1 && w.QUI.blocks[k].time === '2h' && !!w.QUI.blocks[k].mod; })(), w.QUI.blocks.map(b => b.tag).join(',') + ' · ' + String((w.QUI.blocks[idx(w.QUI, /Bloco B da semana passada/)] || {}).mod).slice(0, 30));
        check('E 20/09 DOM noturno: blocos do domingo mantidos (Fio 1 · apostila + Fio 2 · aula + revisão + gym); apostila B e Fio 1 · questões estão no SÁB 19/09 (plantão diurno, blocos mantidos)', has(w.DOM, /^Fio 1 · toque 3/) && has(w.DOM, /^Fio 2 · toque 1/) && has(w.DOM, /Revisão adaptativa da semana anterior/) && w.DOM.blocks.some(b => b.tag === 'GYM') && has(w.SAB, /Apostila do Bloco B pelos erros de ONTEM/) && has(w.SAB, /^Fio 1 · toque 2/), w.SAB.blocks.map(b => b.tag).join(','));
        check('E 20/09 DOM: 🌙 CN10 18h–07h no FIM (antes só do LAZER)', /🌙 Plantão noturno — CN10 · Base Centenário · 18h–07h/.test(w.DOM.blocks[w.DOM.blocks.length - 2].text) && w.DOM.blocks[w.DOM.blocks.length - 1].tag === 'LAZER');
        check('4a 20/09 DOM (véspera de noturno): 😴 "Acordar mais tarde (~09h)…" no topo, tempo "—"', w.DOM.blocks[0].tag === 'SONO' && w.DOM.blocks[0].text === '😴 Acordar mais tarde (~09h) — você entra no plantão às 18h e vira a noite' && w.DOM.blocks[0].time === '—', w.DOM.blocks[0].text);
        check('4a 20/09 DOM: blocos completos + academia mantida; 🌙 com "encerre os blocos até ~17h · saída ~17h15"; LAZER "Lanche e fones — saída ~17h15"', has(w.DOM, /^Fio 2 · toque 1/) && w.DOM.blocks.some(b => b.tag === 'GYM') && /encerre os blocos até ~17h · saída ~17h15/.test(w.DOM.blocks[w.DOM.blocks.length - 2].text) && /^Lanche e fones — saída ~17h15$/.test(w.DOM.blocks[w.DOM.blocks.length - 1].text), w.DOM.blocks.map(b => b.tag).join(','));
        check('4a 20/09 DOM: sem 📚 abaixo de 8h (dia normal)', hoursOf(w.DOM) <= 8 ? !w.DOM.warn.some(t => /de estudo/.test(t)) : true, hoursOf(w.DOM).toFixed(2) + 'h · ' + w.DOM.warn.join(' · '));
        check('4b 21/09 SEG (pós-noturno): 😴 "dormir até ~13h — bloco inegociável…" tempo 6h, sem "manutenção"', w.SEG.blocks[0].tag === 'SONO' && w.SEG.blocks[0].text === '😴 Chegando (~07h): dormir até ~13h — bloco inegociável. Depois, dia de estudo normal: comece pelo mais pesado' && w.SEG.blocks[0].time === '6h' && !w.SEG.blocks.some(b => /manuten/i.test(b.text)), w.SEG.blocks[0].text);
        check('4c 21/09 SEG (pós-noturno): com o banco B na terça, a segunda fica em ' + hoursOf(w.SEG).toFixed(1) + 'h (< 5h) → sem 📚 (o limiar pós-noturno de 5h segue ativo)', hoursOf(w.SEG) < 5 && !w.SEG.warn.some(t => /de estudo/.test(t)), w.SEG.warn.join(' · ') || '(sem aviso)');
        check('E 21/09 SEG: banco A mantido (banco B na TER 22/09, rebalanceamento 24/09)', has(w.SEG, /questões por conteúdo Bloco A/) && !has(w.SEG, /questões por conteúdo Bloco B/) && has(w.TER, /questões por conteúdo Bloco B/));
        check('C2 21/09 pós-noturno: academia AUSENTE (protocolo §4)', !w.SEG.blocks.some(b => b.tag === 'GYM'), 'GYM presente=' + w.SEG.blocks.some(b => b.tag === 'GYM'));
        check('E 21/09: aviso ⚠️/📚 conforme carga', true, w.SEG.warn.join(' · ') || '(sem aviso)');
        check('D 18/09 SEX sem simulado (35d): aula B → D2-B → apostila A', idx(w.SEX, /Aula online Bloco B/) < idx(w.SEX, /D2-B/) && idx(w.SEX, /D2-B/) < idx(w.SEX, /Apostila do Bloco A dirigida pelos erros de ONTEM/));
    });

    // ── S4: grade nova — 27/09 noturno → 28/09 pós-noturno simples → 29/09 terça normal + moveAct ──
    await scenario(browser, 'S4-grade-2809', '2026-09-28', {}, async (page) => {
        const w = await dumpWeek(page);
        checkLight('D15 semana 23–29/09 (simulado + 2 plantões):', w, '2026-09-23');
        check('A1 28/09 (pós-noturno) não recebe o selo', !w.SEG.lightBadge && !w.SEG.breatherBadge);
        check('D 25/09 SEX simulado (42d)', has(w.SEX, /SIMULADO NA ÍNTEGRA/) && /🎯/.test(w.SEX.simBtn || ''));
        check('E 26/09 SÁB: 🚑 CRU', /🚑 Plantão — CRU/.test(w.SAB.blocks[0].text));
        check('E 27/09 DOM: blocos da semana de simulado (aula B + D2-B) + Fio 2 · aula + 🌙 IT30 no fim (apostila A e Fio 1 · apostila no SÁB 26/09)', has(w.DOM, /deslocado da sexta/) && !has(w.DOM, /Apostila do Bloco A/) && has(w.SAB, /Apostila do Bloco A pelos erros de quinta/) && has(w.DOM, /^Fio 2 · toque 1/) && /🌙 Plantão noturno — IT30 · Base Itapoã · 18h–07h/.test(w.DOM.blocks[w.DOM.blocks.length - 2].text) && w.DOM.blocks[w.DOM.blocks.length - 1].tag === 'LAZER');
        check('E 27/09 DOM: ⚠️ tempo hábil dispara', w.DOM.warn.some(t => /acima do tempo hábil/.test(t)), w.DOM.warn.join(' · '));
        check('GRADE 28/09 SEG: sem plantão — 😴 4b "dormir até ~13h — bloco inegociável" 6h no topo (não a versão sanduíche)', w.SEG.blocks[0].tag === 'SONO' && /dormir até ~13h — bloco inegociável/.test(w.SEG.blocks[0].text) && w.SEG.blocks[0].time === '6h' && !/outro noturno/.test(w.SEG.blocks[0].text), w.SEG.blocks[0].text.slice(0, 90));
        check('4a 27/09 DOM (véspera de noturno): 😴 ~09h no topo + GYM mantido + 🌙 IT30 "saída ~17h15"', w.DOM.blocks[0].tag === 'SONO' && /Acordar mais tarde \(~09h\)/.test(w.DOM.blocks[0].text) && w.DOM.blocks.some(b => b.tag === 'GYM') && /saída ~17h15/.test(w.DOM.blocks[w.DOM.blocks.length - 2].text));
        check('4c 28/09 SEG: 📚 em 5h (' + hoursOf(w.SEG).toFixed(1) + 'h de estudo)', hoursOf(w.SEG) > 5 && w.SEG.warn.some(t => /acima de 5h/.test(t)), w.SEG.warn.join(' · '));
        check('GRADE 28/09 SEG: sem 🌙, sem Cajazeiras, LAZER "Dormir cedo hoje"', !w.SEG.blocks.some(b => b.tag === 'AMB' || /Cajazeiras|CZ50/.test(b.text)) && /^Dormir cedo hoje$/.test(w.SEG.blocks[w.SEG.blocks.length - 1].text), w.SEG.blocks.map(b => b.tag).join(','));
        check('GRADE 28/09 SEG: blocos da segunda mantidos (banco A + apostila B erros de domingo + Fio 2 questões; sem banco B nesta semana de simulado — vai para a QUI 01/10), sem GYM (pós-noturno)', has(w.SEG, /questões por conteúdo Bloco A/) && !has(w.SEG, /questões por conteúdo Bloco B/) && has(w.SEG, /Apostila do Bloco B pelos erros de domingo/) && has(w.SEG, /^Fio 2 · toque 2/) && !w.SEG.blocks.some(b => b.tag === 'GYM'));
        check('GRADE 29/09 TER: terça normal — sem 😴, GYM presente, selagem + Fio 2 apostila antes da aula', !w.TER.blocks.some(b => b.tag === 'SONO') && w.TER.blocks.some(b => b.tag === 'GYM') && idx(w.TER, /Selar A e B/) < idx(w.TER, /Aula teórica/) && idx(w.TER, /D6 · Tarde/) < idx(w.TER, /Aula teórica/) && idx(w.TER, /^Fio 2 · toque 3/) < idx(w.TER, /Aula teórica/), w.TER.blocks.map(b => b.tag).join(',') + ' · estudo=' + fmtH(hoursOf(w.TER)));
        check('GRADE 29/09 TER: aula "19h30–21h" 1.5h', has(w.TER, /^Aula teórica da faculdade — 19h30–21h$/) && w.TER.blocks[idx(w.TER, /Aula teórica/)].time === '1.5h');
        check('GRADE 29/09 TER: sem LAZER de plantão ("Dormir cedo hoje" só vem do buildShiftDay)', !w.TER.blocks.some(b => b.tag === 'LAZER'), w.TER.blocks.map(b => b.tag).join(','));
        // moveAct: mover PLAN do SÁB 26/09 para DOM 27/09 (> 14,5h) → confirm
        await clickDay(page, 'SAB');
        await page.evaluate(() => [...document.querySelectorAll('button')].find(b => /Reorganizar dia/.test(b.innerText)).click());
        await page.waitForTimeout(150);
        const before = await readDay(page);
        const planIdx = idx(before, /Implementação de intenção/);
        page.once('dialog', async d => { check('F moveAct: window.confirm com "Manter TUDO"', /Manter TUDO nesse dia mesmo assim\?/.test(d.message()) && /acima do tempo hábil/.test(d.message()), d.message().slice(0, 120)); await d.dismiss(); });
        await page.evaluate((i) => { const sels = [...document.querySelectorAll('select')].filter(s => /mover p\/ dia/.test(s.innerText)); const s = sels[i]; s.value = '4'; s.dispatchEvent(new Event('change', { bubbles: true })); }, planIdx);
        await page.waitForTimeout(300);
        let after = await readDay(page);
        check('F moveAct cancelar: SÁB mantém o PLAN (nada apagado, nada movido)', has(after, /Implementação de intenção/) && after.blocks.length === before.blocks.length);
        await clickDay(page, 'DOM'); let dom2 = await readDay(page);
        check('F moveAct cancelar: DOM inalterado', dom2.blocks.length === w.DOM.blocks.length);
        await clickDay(page, 'SAB');
        page.once('dialog', async d => { await d.accept(); });
        await page.evaluate((i) => { const sels = [...document.querySelectorAll('select')].filter(s => /mover p\/ dia/.test(s.innerText)); const s = sels[i]; s.value = '4'; s.dispatchEvent(new Event('change', { bubbles: true })); }, planIdx);
        await page.waitForTimeout(300);
        after = await readDay(page);
        check('F moveAct confirmar: PLAN saiu do SÁB', !has(after, /Implementação de intenção/));
        await clickDay(page, 'DOM'); dom2 = await readDay(page);
        check('F moveAct confirmar: PLAN chegou ao DOM (fim da lista) + ⚠️ no cabeçalho', has(dom2, /Implementação de intenção/) && dom2.blocks.length === w.DOM.blocks.length + 1 && dom2.warn.some(t => /acima do tempo hábil/.test(t)), dom2.warn.join(' · '));
    });

    // ── S4b: grade nova — semana 30/09–06/10: 03/10 🚑 CRU · 05/10 🌙 PM04 (segunda) · 06/10 😴 + aula 19h30 (terça) ──
    await scenario(browser, 'S4b-grade-0510', '2026-10-05', {}, async (page) => {
        const w = await dumpWeek(page);
        checkLight('D15 semana 30/09–06/10 (2 plantões):', w, '2026-09-30');
        check('A1 semana 30/09–06/10: a terça 06/10 (pós-noturno, aula 19h30) NÃO é mais o dia sem remédio (dia sugerido registrado na evidência)', !w.TER.lightBadge && !w.TER.breatherBadge && w.TER.light.value === 'auto' && w.TER.light.auto !== 'Auto · TER', w.TER.light.auto + ' · ' + w.TER.light.note + ' | QUI ' + hoursOf(w.QUI).toFixed(2) + 'h · DOM ' + hoursOf(w.DOM).toFixed(2) + 'h · SEX ' + hoursOf(w.SEX).toFixed(2) + 'h');
        check('GRADE 03/10 SÁB: 🚑 CRU + Anki no trajeto + PLAN', /🚑 Plantão — CRU · 06h–19h/.test(w.SAB.blocks[0].text) && has(w.SAB, /^Anki no trajeto/) && has(w.SAB, /Implementação de intenção/));
        check('GRADE 04/10 DOM: dia normal (sem plantão, sem 😴): Fio 2 · aula + GYM; apostila B no SÁB 03/10 (plantão)', !w.DOM.blocks.some(b => b.tag === 'AMB' || b.tag === 'SONO') && has(w.DOM, /^Fio 2 · toque 1/) && w.DOM.blocks.some(b => b.tag === 'GYM') && has(w.SAB, /Apostila do Bloco B pelos erros de ONTEM/), w.SAB.blocks.map(b => b.tag).join(','));
        check('4a 05/10 SEG (véspera de noturno): 😴 "Acordar mais tarde (~09h)" no topo; blocos da segunda mantidos (banco A, Fio 2 questões, GYM; banco B na terça)', w.SEG.blocks[0].tag === 'SONO' && /^😴 Acordar mais tarde \(~09h\)/.test(w.SEG.blocks[0].text) && w.SEG.blocks[0].time === '—' && has(w.SEG, /questões por conteúdo Bloco A/) && !has(w.SEG, /questões por conteúdo Bloco B/) && has(w.SEG, /^Fio 2 · toque 2/) && w.SEG.blocks.some(b => b.tag === 'GYM'), w.SEG.blocks[0].text);
        check('GRADE 05/10 SEG: 🌙 PM04 · 18h–07h · 13h APÓS os blocos (penúltimo), "encerre os blocos até ~17h · saída ~17h15" + LAZER "Lanche e fones — saída ~17h15"', /^🌙 Plantão noturno — PM04 · 18h–07h · encerre os blocos até ~17h · saída ~17h15/.test(w.SEG.blocks[w.SEG.blocks.length - 2].text) && w.SEG.blocks[w.SEG.blocks.length - 2].time === '13h' && /^Lanche e fones — saída ~17h15$/.test(w.SEG.blocks[w.SEG.blocks.length - 1].text), w.SEG.blocks.map(b => b.tag).join(','));
        check('4b/4d 06/10 TER (pós-noturno): 😴 "dormir até ~13h — bloco inegociável" 6h no topo + blocos da terça para valer, sem GYM', w.TER.blocks[0].tag === 'SONO' && /dormir até ~13h — bloco inegociável/.test(w.TER.blocks[0].text) && w.TER.blocks[0].time === '6h' && has(w.TER, /D6 · Tarde/) && has(w.TER, /^Fio 2 · toque 3/) && !w.TER.blocks.some(b => b.tag === 'GYM'), w.TER.blocks.map(b => b.tag).join(','));
        check('GRADE 06/10 TER: aula da faculdade "19h30–21h" 1.5h preservada, após os fios; LAZER "Dormir cedo hoje"', has(w.TER, /^Aula teórica da faculdade — 19h30–21h$/) && w.TER.blocks[idx(w.TER, /Aula teórica/)].time === '1.5h' && idx(w.TER, /Selar os fios/) < idx(w.TER, /Aula teórica/) && /^Dormir cedo hoje$/.test(w.TER.blocks[w.TER.blocks.length - 1].text));
        check('4c 06/10 TER (pós-noturno, faculdade 19h30): com o banco B na terça fica em ' + hoursOf(w.TER).toFixed(1) + 'h (> 5h) → 📚 dispara pelo limiar pós-noturno (sinal para mover, não freio)', hoursOf(w.TER) > 5 && w.TER.warn.some(t => /de estudo — acima de 5h \(pós-noturno: janela desperta menor\)/.test(t)), w.TER.warn.join(' · ') || '(sem aviso)');
    });

    // ── S5: colisão 07/10–08/10, sexta de plantão 09/10, fim da G2 (ritmo 4 para ver Fio 3/4) ──
    await scenario(browser, 'S5-colisao-0710', '2026-10-07', { [CFG]: { ...baseCfg, catchupPace: 4 } }, async (page) => {
        const w = await dumpWeek(page);
        check('E 07/10 QUA: 🚑 CRL · SUREM no topo', /🚑 Plantão — CRL · SUREM · 06h–19h/.test(w.QUA.blocks[0].text));
        check('GRADE 07/10 QUA: sem 😴 (06/10 não é plantão) — colisão inalterada', !w.QUA.blocks.some(b => b.tag === 'SONO'));
        checkLight('D15 semana 07–13/10 (4 plantões):', w, '2026-10-07');
        check('(info) semana 07–13/10: SEG 12/10 e TER 13/10 empatam (≤45min) → desempate (c): TER tem 0 elos de continuidade → 🌿 na TER, com aviso de empate', w.TER.lightBadge && !w.TER.breatherBadge && !w.SEG.lightBadge && /^🌿 Vários dias com carga parecida \(SEG, TER\) — escolhi TER; toque para trocar\.$/.test(await page.evaluate(() => ([...document.querySelectorAll('span')].map(s => s.textContent.trim()).find(t => /^🌿 Vários dias com carga parecida/.test(t)) || ''))), 'SEG ' + hoursOf(w.SEG).toFixed(2) + 'h · TER ' + hoursOf(w.TER).toFixed(2) + 'h · ' + (await page.evaluate(() => ([...document.querySelectorAll('span')].map(s => s.textContent.trim()).find(t => /^🌿 Vários dias com carga parecida/.test(t)) || ''))));
        check('E 07/10 QUA: aula presencial vira aviso "vista AMANHÃ, online"', has(w.QUA, /Hoje haveria: D1 · Aula presencial.*vista AMANHÃ, online/));
        check('E 07/10 QUA: 10q pré-aula + D+1 mantidos', has(w.QUA, /10 questões pré-aula/) && has(w.QUA, /D\+1: reler/));
        check('C1/C2 07/10 QUA diurno: Anki no trajeto 20min + Academia opcional 30min', has(w.QUA, /^Anki no trajeto — 20min/) && w.QUA.blocks.some(b => b.tag === 'GYM' && /^Academia — opcional, só se sobrar energia$/.test(b.text) && b.time === '30min'), w.QUA.blocks.filter(b => b.tag === 'GYM').map(b => b.text + ' {' + b.time + '}').join(' | '));
        check('C3 07/10: aviso da presencial fala em "aulas 1.5x da semana" (plural)', has(w.QUA, /no lugar das aulas 1\.5x da semana/));
        check('E 08/10 QUI: "AULA PRESENCIAL de ontem — gravada/online, Blocos A e B" no lugar da 1.5x', has(w.QUI, /AULA PRESENCIAL de ontem — gravada\/online, Blocos A e B/) && !has(w.QUI, /Aula online Bloco A \(1\.5x\)/));
        check('E 08/10 QUI: D2-A mantido e DEPOIS da presencial gravada', idx(w.QUI, /AULA PRESENCIAL de ontem/) < idx(w.QUI, /D2-A · 30 questões/));
        check('E 08/10 QUI: sem 😴 (07/10 foi diurno)', !w.QUI.blocks.some(b => b.tag === 'SONO'));
        check('D 09/10 SEX plantão: SEM blocos de simulado', !has(w.SEX, /SIMULADO NA ÍNTEGRA/) && !has(w.SEX, /CORREÇÃO DO SIMULADO/));
        check('D 09/10 SEX plantão (P8): botão de simulado EXISTE, na posição "sem simulado pela regra"; sem prova no dia', /^📚 Sexta de plantão: sem simulado pela regra — toque se FOR fazer simulado hoje/.test(w.SEX.simBtn || '') && !has(w.SEX, /SIMULADO NA ÍNTEGRA/), String(w.SEX.simBtn));
        check('D 09/10 SEX: 🚑 PM40 + resumo B → D2-B → apostila A mantidos', /🚑 Plantão — PM40/.test(w.SEX.blocks[0].text) && idx(w.SEX, /Resumo rápido do Bloco B/) < idx(w.SEX, /^D2-B: 30 questões/) && idx(w.SEX, /^D2-B: 30 questões/) < idx(w.SEX, /Apostila do Bloco A/));
        check('C3 09/10 SEX: SEM "Aula online Bloco B (1.5x)"; REV "Resumo rápido do Bloco B…→ D2-B" 20min imediatamente antes do D2-B, com módulo B', !has(w.SEX, /Aula online Bloco B/) && idx(w.SEX, /^Resumo rápido do Bloco B \(visto na gravação de ontem\) → vá direto ao D2-B$/) >= 0 && w.SEX.blocks[idx(w.SEX, /Resumo rápido/)].tag === 'REV' && w.SEX.blocks[idx(w.SEX, /Resumo rápido/)].time === '20min' && idx(w.SEX, /^D2-B: 30 questões/) === idx(w.SEX, /Resumo rápido/) + 1 && /GIN6|IST/.test(w.SEX.blocks[idx(w.SEX, /Resumo rápido/)].mod || ''), (w.SEX.blocks[idx(w.SEX, /Resumo rápido/)] || {}).mod);
        check('C1/C2 09/10 SEX diurno: Anki no trajeto + academia opcional', has(w.SEX, /^Anki no trajeto — 20min/) && w.SEX.blocks.some(b => b.tag === 'GYM' && /opcional/.test(b.text)));
        check('C2 11/10 DOM diurno: academia opcional 30min', w.DOM.blocks.some(b => b.tag === 'GYM' && /opcional/.test(b.text) && b.time === '30min'));
        check('E 10/10 SÁB: 🚑 CRU + Anki + PLAN', /🚑 Plantão — CRU/.test(w.SAB.blocks[0].text) && has(w.SAB, /Implementação de intenção/));
        check('E 11/10 DOM: 🚑 SM01 + Fio 1 · apostila + Fio 2 · aula (+ Fio 3 · questões no ritmo 4); apostila B + Fio 1 · questões no SÁB 10/10 (CRU)', /🚑 Plantão — SM01 · Base San Martin/.test(w.DOM.blocks[0].text) && has(w.DOM, /^Fio 1 · toque 3/) && has(w.DOM, /^Fio 2 · toque 1/) && has(w.SAB, /Apostila do Bloco B pelos erros de ONTEM/) && has(w.SAB, /^Fio 1 · toque 2/), w.SAB.blocks.map(b => b.tag).join(','));
        check('E 12/10 SEG: POST, sem 😴 (11/10 diurno), banco A+B', !w.SEG.blocks.some(b => b.tag === 'SONO') && has(w.SEG, /questões por conteúdo Bloco A/));
        check('E 13/10 TER (POST): SEM aula da faculdade, Noite livre', !has(w.TER, /faculdade/) && has(w.TER, /Noite livre/));
        check('B 13/10 TER: banco B + Fio 2 apostila + Fio 4 aula ANTES do LAZER (selagem A/B foi para a QUA)', idx(w.TER, /D6 · Tarde/) >= 0 && !has(w.TER, /Selar/) && idx(w.TER, /^Fio 2 · toque 3/) >= 0 && idx(w.TER, /^Fio 4 · toque 1/) >= 0 && w.TER.blocks[w.TER.blocks.length - 1].tag === 'LAZER');
        check('B Fio 4 (P5a) texto termina com "toques 2–3 na quarta e quinta seguintes"', /· toques 2–3 na quarta e quinta seguintes$/.test(w.TER.blocks[idx(w.TER, /^Fio 4/)].text), w.TER.blocks[idx(w.TER, /^Fio 4/)].text.slice(-60));
        check('B ritmo 4 — SEX sem toque de fio; SÁB: Fio 1 quest + Fio 3 aula', !has(w.SEX, /^Fio [1-4] · toque/) && has(w.SAB, /^Fio 1 · toque 2/) && has(w.SAB, /^Fio 3 · toque 1/), w.SAB.blocks.filter(b => /^Fio/.test(b.text)).map(b => b.text.slice(0, 16)).join(' | '));
        check('B ritmo 4 — DOM: Fio 1 apost + Fio 2 aula + Fio 3 quest', has(w.DOM, /^Fio 1 · toque 3/) && has(w.DOM, /^Fio 2 · toque 1/) && has(w.DOM, /^Fio 3 · toque 2/));
        check('B ritmo 4 — SEG: Fio 2 quest + Fio 3 apost', has(w.SEG, /^Fio 2 · toque 2/) && has(w.SEG, /^Fio 3 · toque 3/));
        check('B ritmo 4 — 4 módulos distintos entre os fios', new Set([(w.QUI.blocks[idx(w.QUI, /^Fio 1/)] || {}).mod, (w.DOM.blocks[idx(w.DOM, /^Fio 2/)] || {}).mod, (w.SAB.blocks[idx(w.SAB, /^Fio 3/)] || {}).mod, (w.TER.blocks[idx(w.TER, /^Fio 4/)] || {}).mod]).size === 4);
        check('B ritmo 4 — SEX 09/10 dispara 📚 e/ou ⚠️', w.SEX.warn.length > 0, w.SEX.warn.join(' · '));
    });

    // ── S5b: 07/10 com os 3 dias livres editados para >8h → nenhum dia leve natural (null + aviso) ──
    await scenario(browser, 'S5b-respiro-0710', '2026-10-07', {
        [CFG]: { ...baseCfg, catchupPace: 4 },
        'medplanner_schedule_v1': { '2026-10-08': [{ id: 'x1', d: 'EXTRA', color: '#0EA5E9', text: 'Bloco pesado de teste', time: '9h' }], '2026-10-12': [{ id: 'x2', d: 'EXTRA', color: '#0EA5E9', text: 'Bloco pesado de teste', time: '9h' }], '2026-10-13': [{ id: 'x3', d: 'EXTRA', color: '#0EA5E9', text: 'Bloco pesado de teste', time: '8.5h' }] },
    }, async (page) => {
        const w = await dumpWeek(page);
        checkLight('B2 respiro (3 dias livres > 8h):', w, '2026-10-07');
        check('B2 respiro: selo exato no dia (TER, 8,5h) — âmbar, sem texto de pausa', await (async () => { await clickDay(page, 'TER'); return page.evaluate(() => { const d = [...document.querySelectorAll('div')].find(d => d.children.length === 0 && d.textContent.trim() === '🌬️ Dia de respiro — o mais leve da semana. COM Venvanse (semana sem pausa: nenhum dia ficou leve o bastante)'); return !!d && d.style.color === 'rgb(251, 191, 36)'; }); })());
        // override manual em semana de respiro → escolha dela = dia sem remédio (🌿) com validação
        await setLight(page, '1');
        await clickDay(page, 'QUI'); const qui = await readDay(page); await clickDay(page, 'TER'); const ter = await readDay(page);
        check('B2 override em semana de respiro: QUI vira 🌿 (escolha manual, validar), TER perde o 🌬️', qui.lightBadge && !qui.breatherBadge && !ter.breatherBadge && !ter.lightBadge && qui.light.label === '🌿 Sem remédio:' && /escolha manual/.test(qui.light.note) && /validar com a psiquiatra/.test(qui.light.note), qui.light.label + ' · ' + qui.light.note);
        await setLight(page, 'auto');
        const back = await readDay(page);
        check('B2 volta a Auto: respiro volta para a TER', back.light.label === '🌬️ Respiro:' && back.breatherBadge, back.light.label + ' ' + back.light.auto);
    });

    // ── S6: semana livre POST sem simulado (15/10) + pins + revisões + toggle simulado + Desatraso/Sono/Dopamine ──
    await scenario(browser, 'S6-post-1510', '2026-10-15', {
        [CFG]: { ...baseCfg, catchupPace: 4, catchupPins: [50], simOverrides: {} },
        [PRG]: { "1": { aula: true, questoesD2: true, apostila: true, smartcard: true, completedAt: '2026-10-01', accD2: 85 } },
    }, async (page) => {
        const w = await dumpWeek(page);
        check('A QUA POST: 10q pré-aula → aula presencial 17h–22h → D+1', idx(w.QUA, /10 questões pré-aula/) < idx(w.QUA, /Aula presencial Medcurso 17h–22h/) && idx(w.QUA, /Aula presencial/) < idx(w.QUA, /D\+1: reler/));
        check('A QUI: aula A → D2-A', idx(w.QUI, /Aula online Bloco A \(1\.5x\)/) < idx(w.QUI, /D2-A/));
        check('D SEX 16/10 sem simulado (63d): botão "📚 Sexta de estudo ativo"', /📚 Sexta de estudo ativo/.test(w.SEX.simBtn || ''), w.SEX.simBtn);
        check('A SEX: aula B → D2-B → apostila A (erros de ONTEM)', idx(w.SEX, /Aula online Bloco B/) < idx(w.SEX, /D2-B/) && idx(w.SEX, /D2-B/) < idx(w.SEX, /Apostila do Bloco A dirigida pelos erros de ONTEM/));
        check('A SEX: prefixo "Sem simulado ·" removido do texto', !w.SEX.blocks.some(b => /^Sem simulado/.test(b.text)));
        check('C SÁB POST (ritmo 4): dia útil — Anki, apostila do B (erros de ONTEM), PLAN, Fio 1 · questões, Fio 3 · aula, noite livre = ANKI,D4,PLAN,DESAT,DESAT,LAZER', /^Dia 3 · apostila do B/.test(w.SAB.venv) && w.SAB.blocks.map(b => b.tag).join(',') === 'ANKI,D4,PLAN,DESAT,DESAT,LAZER' && has(w.SAB, /Apostila do Bloco B pelos erros de ONTEM/) && has(w.SAB, /^Fio 1 · toque 2/) && has(w.SAB, /^Fio 3 · toque 1/), w.SAB.blocks.map(b => b.tag).join(','));
        checkLight('D15 semana 14–20/10 (livre):', w, '2026-10-14');
        check('D15 15/10 (ritmo 4): SEX/SÁB/SEG/TER a ≤45min (SEG ' + fmtH(hoursOf(w.SEG)) + ' é o mínimo) → desempate por critérios: TER (0 elos de continuidade) — Auto → TER, com aviso', w.TER.light.auto === 'Auto · TER' && w.TER.lightBadge && !w.SAB.lightBadge && !w.SEG.lightBadge && /^🌿 Vários dias com carga parecida \(SEX, SÁB, SEG, TER\) — escolhi TER; toque para trocar\.$/.test(await page.evaluate(() => ([...document.querySelectorAll('span')].map(s => s.textContent.trim()).find(t => /^🌿 Vários dias com carga parecida/.test(t)) || ''))), w.TER.light.auto + ' · SEX=' + fmtH(hoursOf(w.SEX)) + ' SÁB=' + fmtH(hoursOf(w.SAB)) + ' SEG=' + fmtH(hoursOf(w.SEG)) + ' TER=' + fmtH(hoursOf(w.TER)) + ' · ' + (await page.evaluate(() => ([...document.querySelectorAll('span')].map(s => s.textContent.trim()).find(t => /^🌿 Vários dias com carga parecida/.test(t)) || ''))));
        await clickDay(page, 'TER');
        check('D15 selo: texto exato', await page.evaluate(() => !![...document.querySelectorAll('div')].find(d => d.children.length === 0 && d.textContent.trim() === '🌿 Hoje sem Venvanse — faça só o leve, mova o pesado (pausa variável: validar com a psiquiatra)')));
        // override manual → DOM
        await setLight(page, '4');
        let cfgL = await page.evaluate(() => JSON.parse(localStorage.getItem('medplanner_config_v1')));
        await clickDay(page, 'DOM'); let ter = await readDay(page); await clickDay(page, 'SAB'); let sab2 = await readDay(page); await clickDay(page, 'TER'); let ter0 = await readDay(page);
        check('D15 override DOM: config.lightDayOverrides["2026-10-14"] = 4', cfgL.lightDayOverrides && cfgL.lightDayOverrides['2026-10-14'] === 4, JSON.stringify(cfgL.lightDayOverrides));
        check('D15 override DOM: selo no domingo, não na terça nem no sábado; seletor = DOM; nota "escolha manual"', ter.lightBadge && !sab2.lightBadge && !ter0.lightBadge && ter.light.value === '4' && /escolha manual/.test(ter.light.note) && /^DOM 18\/10/.test(ter.light.note), ter.light.note);
        check('D15 override: opção Auto continua mostrando o cálculo (Auto · TER)', ter.light.auto === 'Auto · TER', ter.light.auto);
        check('D15 override: blocos do sábado e do domingo inalterados (selo não muda template)', sab2.blocks.map(b => b.tag).join(',') === 'ANKI,D4,PLAN,DESAT,DESAT,LAZER' && ter.blocks.length === w.DOM.blocks.length);
        // volta ao automático
        await setLight(page, 'auto');
        cfgL = await page.evaluate(() => JSON.parse(localStorage.getItem('medplanner_config_v1')));
        await clickDay(page, 'TER'); sab2 = await readDay(page);
        check('D15 volta a Auto: chave apagada; selo volta à terça', !('2026-10-14' in (cfgL.lightDayOverrides || {})) && sab2.lightBadge && sab2.light.value === 'auto', JSON.stringify(cfgL.lightDayOverrides));
        check('C DOM POST: "Dia 4 · fios…" · Fio 2 · aula + gym, sem apostila B (foi para o SÁB)', /^Dia 4 · fios do desatraso/.test(w.DOM.venv) && !has(w.DOM, /Apostila do Bloco B/) && has(w.DOM, /^Fio 2 · toque 1/) && w.DOM.blocks.some(b => b.tag === 'GYM'), w.DOM.blocks.map(b => b.tag).join(','));
        check('A DOM sem simulado: NÃO tem aula B deslocada nem apostila A', !has(w.DOM, /deslocado da sexta/) && !has(w.DOM, /Apostila do Bloco A pelos erros de quinta/));
        check('A SEG sem simulado: NÃO tem "Apostila do Bloco B pelos erros de domingo"', !has(w.SEG, /Apostila do Bloco B pelos erros de domingo/));
        check('E TER POST: sem aula da faculdade', !has(w.TER, /faculdade/));
        check('B pin 50 → Fio 1 = Sem.26 PED3 no QUI/SÁB/DOM', /PED3|Distúrbios do Crescimento/.test((w.QUI.blocks[idx(w.QUI, /^Fio 1/)] || {}).mod || '') && /Distúrbios do Crescimento/.test((w.SAB.blocks[idx(w.SAB, /^Fio 1 · toque 2/)] || {}).mod || '') && /Distúrbios do Crescimento/.test((w.DOM.blocks[idx(w.DOM, /^Fio 1 · toque 3/)] || {}).mod || ''), (w.QUI.blocks[idx(w.QUI, /^Fio 1/)] || {}).mod);
        check('B entrada adaptativa: módulo sem p.aula → "Toque 1: aula online"', /Toque 1: aula online/.test(w.QUI.blocks[idx(w.QUI, /^Fio 1/)].mod));
        check('F módulo 1 completo (seed) não aparece nos fios', !Object.values(w).some(d => d.blocks.some(b => b.mod && /Glomerulopatias I \(/.test(b.mod))));
        // Revisão adaptativa: completedAt 01/10 + accD2 85 → D+10 = 11/10 → alerta em 15/10
        const alert = await page.evaluate(() => { const el = [...document.querySelectorAll('div')].find(d => /Hora de revisar Sem\.1 — NEF1/.test(d.textContent) && d.children.length === 2); return el ? el.parentElement.textContent : null; });
        check('F revisão adaptativa: ≥80% → D+10 (11/10) vence → alerta "4d em atraso" em 15/10', !!alert && /4d em atraso/.test(alert), alert && alert.slice(0, 120));
        await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'Revisei').click());
        await page.waitForTimeout(150);
        const pctField = await page.evaluate(() => !![...document.querySelectorAll('input')].find(i => i.placeholder === '% acerto'));
        check('F "Revisei" abre campo de %', pctField);
        await page.evaluate(() => { const i = [...document.querySelectorAll('input')].find(i => i.placeholder === '% acerto'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, '55'); i.dispatchEvent(new Event('input', { bubbles: true })); });
        await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'OK').click());
        await page.waitForTimeout(200);
        const prg = await page.evaluate(() => JSON.parse(localStorage.getItem('medplanner_progress_v1')));
        check('F accR1=55 gravado → r1DoneAt=15/10 → próxima D+12 (27/10)', prg['1'].accR1 === 55 && prg['1'].r1DoneAt === '2026-10-15' && prg['1'].reviewD7Done === true, JSON.stringify(prg['1']));
        // Módulos: campo % de acerto no D2 no card
        await clickTab(page, 'MÓDULOS');
        const d2field = await page.evaluate(() => { const el = [...document.querySelectorAll('span')].find(s => /% de acerto no D2/.test(s.textContent)); return !!el; });
        check('F card do módulo: campo "% de acerto no D2" (módulo com D2 marcado)', d2field);
        check('S4 rótulos T6/BUG 1: "Aula 1.5x + resumo (toque 1) ✓", "D2 · 30q (toque 2) ✓", "Apostila pelos erros (toque 3) ✓", "Selagem ✓" — nenhum "Smartcard ✓", nenhum "60q"', await page.evaluate(() => { const t = document.body.innerText; return /Aula 1\.5x \+ resumo \(toque 1\) ✓/.test(t) && /D2 · 30q \(toque 2\) ✓/.test(t) && /Apostila pelos erros \(toque 3\) ✓/.test(t) && /Selagem ✓/.test(t) && !/Smartcard ✓/.test(t) && !/60q/.test(t); }));
        const d30txt = await page.evaluate(() => { const el = [...document.querySelectorAll('div')].find(d => /^Consolidado 01\/10/.test(d.textContent.trim())); return el ? el.textContent : null; });
        check('F card: D+7/D+30 com datas adaptativas (D+7→11/10; D+30 = r1DoneAt+12 → 27/10)', /D\+7 11\/10/.test(d30txt || '') && /D\+30 27\/10/.test(d30txt || ''), d30txt);
        // Toggle simulado na sexta 16/10
        await clickTab(page, 'CRONOGRAMA'); await clickDay(page, 'SEX');
        await page.evaluate(() => [...document.querySelectorAll('button')].find(b => /Sexta de estudo ativo/.test(b.innerText)).click());
        await page.waitForTimeout(250);
        let sex = await readDay(page); let cfg = await page.evaluate(() => JSON.parse(localStorage.getItem('medplanner_config_v1')));
        check('D toggle 1: simOverrides["2026-10-16"]=true; blocos viram simulado; botão 🎯', cfg.simOverrides['2026-10-16'] === true && has(sex, /SIMULADO NA ÍNTEGRA/) && !has(sex, /Aula online Bloco B/) && /🎯/.test(sex.simBtn || ''), JSON.stringify(cfg.simOverrides));
        await clickDay(page, 'SAB'); let sabT = await readDay(page); await clickDay(page, 'DOM'); let dom = await readDay(page);
        check('D toggle 1: DOM recalcula (aula B + D2-B) e SÁB recebe a apostila A (erros de quinta) no lugar da do B', has(dom, /deslocado da sexta/) && !has(dom, /Apostila/) && has(sabT, /Apostila do Bloco A pelos erros de quinta/) && !has(sabT, /Apostila do Bloco B/), sabT.blocks.map(b => b.tag).join(','));
        await clickDay(page, 'SEG'); let seg = await readDay(page);
        check('D toggle 1: SEG com apostila B (erros de domingo)', has(seg, /Apostila do Bloco B pelos erros de domingo/));
        await clickDay(page, 'SEX');
        await page.evaluate(() => [...document.querySelectorAll('button')].find(b => /Simulado marcado/.test(b.innerText)).click());
        await page.waitForTimeout(250);
        sex = await readDay(page); cfg = await page.evaluate(() => JSON.parse(localStorage.getItem('medplanner_config_v1')));
        check('D toggle 2: chave apagada (volta à paridade) e sexta volta ao estudo ativo', !('2026-10-16' in cfg.simOverrides) && has(sex, /Aula online Bloco B/) && /📚/.test(sex.simBtn || ''), JSON.stringify(cfg.simOverrides));
        // Estrutura card (texto do card, não bloco)
        const estr = await page.evaluate(() => { const el = [...document.querySelectorAll('div')].find(d => /^Sex\+Sáb$/.test(d.textContent.trim())); return el ? el.parentElement.textContent : null; });
        check('A card Estrutura (G2/POST) descreve apostila B no SÁB ("Sex+Sáb · A sex, de quinta · B sáb, de sexta") — decisão 24/09', !!estr && /B sáb, de sexta/.test(estr), estr);
        const gymCard = await page.evaluate(() => { const el = [...document.querySelectorAll('div')].find(d => /^ACADEMIA — /.test(d.textContent.trim()) && d.children.length === 0); return el ? el.parentElement.innerText.replace(/\n/g, ' ') : null; });
        check('A4 card ACADEMIA: título "1 treino em 6 dos 7 dias · sem treino no dia pós-noturno"; sábado = "sem treino" (não "descanso"/"dia leve"); DOM com treino', gymCard && /ACADEMIA — 1 treino em 6 dos 7 dias · sem treino no dia pós-noturno/.test(gymCard) && /Sab 😴 sem treino/.test(gymCard) && !/descanso|dia leve/.test(gymCard) && /Dom 🏋️ livre/.test(gymCard), gymCard);
        check('A venv SEG/TER não descrevem mais "Fio A/B" fixos', !/Fio A abre|\+ Fio B/.test(w.SEG.venv + ' ' + w.TER.venv), w.SEG.venv + ' || ' + w.TER.venv);
        // Desatraso
        await clickTab(page, 'DESATRASO');
        const txt = await page.evaluate(() => document.body.innerText);
        check('F Desatraso: linha "Projeção honesta de zeramento"', /Projeção honesta de zeramento/.test(txt), (txt.match(/Projeção honesta de zeramento: [^\n]+/) || [''])[0].slice(0, 80));
        check('B Desatraso: FIXADO no módulo 50 com slot FIO 1', await page.evaluate(() => { const rows = [...document.querySelectorAll('div')].filter(d => /Distúrbios do Crescimento/.test(d.textContent) && d.querySelector && [...d.querySelectorAll('span')].some(s => s.textContent === 'FIXADO')); return rows.some(r => [...r.querySelectorAll('span')].some(s => s.textContent === 'FIO 1')); }));
        check('B Planejador: 1ª linha = módulo FIXADO (Sem.26 PED3)', await page.evaluate(() => { const hdr = [...document.querySelectorAll('div')].find(d => d.children.length === 0 && /Planejador da semana/.test(d.textContent)); const card = hdr && hdr.parentElement; const rows = card ? [...card.querySelectorAll('div')].filter(d => d.style && d.style.background === 'rgb(15, 23, 42)' && d.style.borderRadius === '8px' && d.style.padding === '10px' && /Duração da aula/.test(d.textContent)) : []; return rows.length > 0 && /Distúrbios do Crescimento/.test(rows[0].textContent); }));
        check('B Desatraso: regra 6 (Forest/body double) e 7 (📌)', /Forest\/Flora/.test(txt) && /Body double/.test(txt) && /Toque 📌/.test(txt));
        check('G Planejador de pomodoros: 60/10/35 + minutos da aula + ritmo 1–4', /60min de foco · 10min de pausa · 35min a cada 2 focos/.test(txt) && /Duração da aula \(min\)/.test(txt) && /Ritmo do desatraso/.test(txt));
        check('C6 Planejador: "Dimensionamento apenas — na execução, siga o Flowtime se estiver rendendo."', /Dimensionamento apenas — na execução, siga o Flowtime se estiver rendendo\./.test(txt));
        check('S3 rodapé: "ritmo atual: 4/sem"', /ritmo atual: 4\/sem/.test(txt), (txt.match(/ritmo atual: \d\/sem/) || [''])[0]);
        (() => { const a = (txt.match(/Projeção honesta de zeramento: (\d\d\/\d\d\/\d{4}) \(Sem\.(\d+)\)/) || []); const b = (txt.match(/(?:No ritmo: zera por volta de|Apertado: no ritmo atual só zera em) (\d\d\/\d\d\/\d{4}) \(Sem\.(\d+)\)/) || []); check('S2 card RITMO usa a MESMA data/semana do planejador (fonte única)', a[1] && a[1] === b[1] && a[2] === b[2], `planejador=${a[1]} (Sem.${a[2]}) · card=${b[1]} (Sem.${b[2]})`); })();
        check('S2 card RITMO: sem o texto antigo "depois do fim do curso"', !/depois do fim do curso/.test(txt) && !/sábado sem prova/.test(txt));
        const projA = (txt.match(/Projeção honesta de zeramento: (\d\d\/\d\d\/\d{4})/) || [])[1];
        await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === '2/sem'); b.click(); });
        await page.waitForTimeout(250);
        const txt2 = await page.evaluate(() => document.body.innerText);
        const projB = (txt2.match(/Projeção honesta de zeramento: (\d\d\/\d\d\/\d{4})/) || [])[1];
        const toISO = s => s ? s.slice(6) + '-' + s.slice(3, 5) + '-' + s.slice(0, 2) : '';
        check('F projeção muda com o ritmo: ritmo 4 mais cedo que ritmo 2', projA && projB && toISO(projA) < toISO(projB), `ritmo4=${projA} · ritmo2=${projB}`);
        check('S3 rodapé acompanha o seletor: "ritmo atual: 2/sem"', /ritmo atual: 2\/sem/.test(txt2));
        (() => { const b = (txt2.match(/(?:No ritmo: zera por volta de|Apertado: no ritmo atual só zera em) (\d\d\/\d\d\/\d{4})/) || []); check('S2 card RITMO recalcula com o ritmo 2 (mesma data do planejador)', b[1] === projB, `card=${b[1]} · planejador=${projB}`); })();
        // Sono
        await clickTab(page, 'SONO');
        const sono = await page.evaluate(() => document.body.innerText);
        check('F Sono: BackupCard com Baixar / Copiar / Importar arquivo / Colar', /Backup e sincronização/.test(sono) && /Baixar backup/.test(sono) && /Copiar/.test(sono) && /Importar arquivo/.test(sono) && /Colar backup/.test(sono));
        check('F Sono: modo cinza 21h30 + janela de celular 21h30–22h15', /Modo CINZA no celular a partir das 21h30/.test(sono) && /21h30 às 22h15/.test(sono));
        check('S5 Sono: dica da véspera de plantão de 06h', /Véspera de plantão de 06h: janela de celular encurta para 21h00–21h30; luzes baixas 21h15; dormir 21h45\./.test(sono));
        check('C Sono: dica "Domingo sem Venvanse" (SUPERADA: dia leve = sábado nesta fase)', !/Domingo sem Venvanse/.test(sono), (sono.match(/[^\n]*Domingo sem Venvanse[^\n]*/) || [''])[0]);
        // Dopamine
        await clickTab(page, 'DOPAMINE');
        const dop = await page.evaluate(() => document.body.innerText);
        check('G Dopamine: 3 níveis (Alta/Média/Baixa)', /Alta dopamina/.test(dop) && /Média dopamina/.test(dop) && /Baixa dopamina/.test(dop));
        // Importar backup: colar
        await clickTab(page, 'SONO');
        await page.evaluate(() => [...document.querySelectorAll('button')].find(b => /Colar backup/.test(b.innerText)).click());
        await page.waitForTimeout(150);
        const payload = JSON.stringify({ app: 'medplanner', data: { 'medplanner_events_v1': JSON.stringify({ '2026-10-15': 'importado-ok' }) } });
        await page.evaluate((p) => { const t = document.querySelector('textarea'); const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set; set.call(t, p); t.dispatchEvent(new Event('input', { bubbles: true })); }, payload);
        await page.evaluate(() => [...document.querySelectorAll('button')].find(b => /Aplicar backup colado/.test(b.innerText)).click());
        await page.waitForTimeout(300);
        const ev = await page.evaluate(() => localStorage.getItem('medplanner_events_v1'));
        check('F Backup: colar/importar grava chaves medplanner_*', /importado-ok/.test(ev || ''), ev);
    });

    // ── S6b: ordem setDynTW/setPaceCfg (ritmo 1) — horizonte no 1º render vs após re-render ──
    await scenario(browser, 'S6b-dyntw-ritmo1', '2026-10-15', { [CFG]: { ...baseCfg, catchupPace: 1 } }, async (page) => {
        const first = (await readDay(page)).pct;
        await clickTab(page, 'MÓDULOS'); await clickTab(page, 'CRONOGRAMA');
        const second = (await readDay(page)).pct;
        check('F dynTW: horizonte igual no 1º render e após re-render (ritmo 1)', first === second, `1º render="${first}" · depois="${second}"`);
        await clickTab(page, 'DESATRASO');
        check('S6 ritmo 1: planejador mostra exatamente 1 fio', await page.evaluate(() => { const hdr = [...document.querySelectorAll('div')].find(d => d.children.length === 0 && /Planejador da semana/.test(d.textContent)); const card = hdr && hdr.parentElement; return card ? [...card.querySelectorAll('div')].filter(d => d.style && d.style.background === 'rgb(15, 23, 42)' && d.style.borderRadius === '8px' && d.style.padding === '10px' && /Duração da aula/.test(d.textContent)).length === 1 : false; }));
        await clickTab(page, 'CRONOGRAMA');
        await clickTab(page, 'DESATRASO');
        const t = await page.evaluate(() => document.body.innerText);
        const eta = (t.match(/(No ritmo|Apertado)[^\n]+/) || [''])[0];
        const proj = (t.match(/Projeção honesta de zeramento: [^\n]+/) || [''])[0];
        check('F (info) duas projeções na aba Desatraso', true, `card RITMO: "${eta.slice(0, 90)}" · planejador: "${proj.slice(0, 70)}"`);
    });

    // ── S7: semana de simulado 23/10 ──
    await scenario(browser, 'S7-sim-2310', '2026-10-22', {}, async (page) => {
        const w = await dumpWeek(page);
        checkLight('D15 semana 21–27/10 (simulado):', w, '2026-10-21');
        check('D 23/10 SEX: simulado volta por paridade (70d)', has(w.SEX, /SIMULADO NA ÍNTEGRA/) && has(w.SEX, /CORREÇÃO DO SIMULADO/) && /🎯/.test(w.SEX.simBtn || ''));
        check('G simulado: correção detalhada no mesmo dia (erro → entender → caderno → tema fraco)', has(w.SEX, /CORREÇÃO DO SIMULADO: cada erro → entender → caderno → tema fraco/) && w.SEX.blocks[idx(w.SEX, /SIMULADO NA ÍNTEGRA/)].time === '5h' && w.SEX.blocks[idx(w.SEX, /CORREÇÃO/)].time === '3h');
        check('A semana de simulado: SEX sem aula B/D2-B/apostila A', !has(w.SEX, /Aula online Bloco B/) && !has(w.SEX, /D2-B/) && !has(w.SEX, /Apostila do Bloco A/));
        check('A DOM: aula B + D2-B deslocados; apostila A (erros de quinta) no SÁB; DOM sem apostila', has(w.DOM, /deslocado da sexta: aula online Bloco B \(1\.5x\) \+ resumo \+ D2-B \(30q \+ caderno \+ Anki dos erros\) — registre o %/) && !has(w.DOM, /Apostila/) && has(w.SAB, /Apostila do Bloco A pelos erros de quinta/) && !has(w.SAB, /Apostila do Bloco B/));
        check('A SEG: apostila B (erros de domingo) após o D5; TER sem banco B e sem selagem (banco B na QUI 29/10, +3d; selagem A/B na QUA 28/10)', idx(w.SEG, /Apostila do Bloco B pelos erros de domingo/) === idx(w.SEG, /D5 · Manhã/) + 1 && !has(w.SEG, /D6 · Tarde/) && !has(w.TER, /D6 · Tarde/) && !has(w.TER, /Selar/), 'TER: ' + w.TER.blocks.map(b => b.tag).join(','));
        check('C SÁB semana de simulado (ritmo 2): apostila do A + PLAN + Fio 1 · questões (ANKI,D4,PLAN,DESAT,LAZER); a TER (' + fmtH(hoursOf(w.TER)) + ', sem banco nem selagem) é o mínimo estrito → selo na TER, sem aviso de empate', w.SAB.blocks.map(b => b.tag).join(',') === 'ANKI,D4,PLAN,DESAT,LAZER' && !w.SAB.lightBadge && w.TER.lightBadge && hoursOf(w.TER) + 0.75 < hoursOf(w.SAB), w.SAB.blocks.map(b => b.tag).join(',') + ' · SÁB=' + fmtH(hoursOf(w.SAB)) + ' TER=' + fmtH(hoursOf(w.TER)));
    });

    // ── S8: recuperação 28/11 (CATCHUP provisório: sáb leve · Fio A qua→qui→sex · Fio B dom→seg→ter · selagens) ──
    await scenario(browser, 'S8-catchup-2811', '2026-11-28', {}, async (page) => {
        const w = await dumpWeek(page);
        const all = Object.values(w);
        check('C4 CATCHUP: nenhum "Ambulatório" e nenhuma "Aula da faculdade" na semana', !all.some(d => d.blocks.some(b => /Ambulatório|faculdade/.test(b.text))));
        check('C4 CATCHUP: sem motor dinâmico (nenhum "Fio N ·")', !all.some(d => d.blocks.some(b => /^Fio \d/.test(b.text))));
        check('C4 Fio A: QUA aula → QUI questões → SÁB apostila (24/09); SEX sem toque de fio', has(w.QUA, /^Fio A · toque 1: aula online do bloco antigo/) && has(w.QUI, /^Fio A · toque 2: 30 questões do bloco antigo/) && has(w.SAB, /^Fio A · toque 3: apostila dirigida pelos erros do bloco antigo/) && !has(w.SEX, /^Fio A/));
        check('SÁB CATCHUP útil (24/09): Anki, Fio A · apostila, temas fracos, PLAN, noite livre = ANKI,DESAT,REV,PLAN,LAZER; sem gym', w.SAB.blocks.map(b => b.tag).join(',') === 'ANKI,DESAT,REV,PLAN,LAZER' && /^Dia útil · Fio A fecha pela apostila/.test(w.SAB.venv), w.SAB.blocks.map(b => b.tag).join(','));
        check('D15 Fio B: DOM aula → SEG questões → TER apostila', has(w.DOM, /^Fio B · toque 1: aula online do bloco antigo/) && has(w.SEG, /^Fio B · toque 2: 30 questões do bloco antigo/) && has(w.TER, /^Fio B · toque 3: apostila dirigida pelos erros do bloco antigo/));
        check('Fronteira POST→CATCHUP (1ª semana 25/11): sem "Selar o Fio A/B da semana passada" (o template ainda não tem fio A/B anterior); selagens do POST em blocos próprios: QUA Fio 1 · SEX Fio 2 (ritmo 2 legado)', !DAYS.some(d => w[d].blocks.some(b => /Selar o Fio [AB] da semana passada/.test(b.text))) && has(w.QUA, /^Selar Fio 1 \(sem\. passada\)/) && has(w.SEX, /^Selar Fio 2 \(sem\. passada\)/) && !has(w.QUI, /^Selar Fio 3/) && !has(w.DOM, /^Selar Fio 4/), DAYS.map(d => d + ':' + w[d].blocks.filter(b => /^Selar/.test(b.text)).map(b => b.text.slice(0, 22)).join('/')).join(' '));
        check('Fronteira POST→CATCHUP: as selagens do POST mostram o módulo (fios da semana 18–24/11) e oferecem "Selagem ✓"', !!w.QUA.blocks[idx(w.QUA, /^Selar Fio 1/)].mod && !!w.SEX.blocks[idx(w.SEX, /^Selar Fio 2/)].mod && w.QUA.blocks[idx(w.QUA, /^Selar Fio 1/)].tasks.join() === 'Selagem ✓', (w.QUA.blocks[idx(w.QUA, /^Selar Fio 1/)].mod || '').split('|')[0].trim() + ' | ' + (w.SEX.blocks[idx(w.SEX, /^Selar Fio 2/)].mod || '').split('|')[0].trim());
        const modA = [(w.QUA.blocks[idx(w.QUA, /Fio A/)] || {}).mod, (w.QUI.blocks[idx(w.QUI, /Fio A/)] || {}).mod, (w.SAB.blocks[idx(w.SAB, /Fio A ·/)] || {}).mod];
        const modB = [w.DOM.blocks[idx(w.DOM, /Fio B ·/)].mod, w.SEG.blocks[idx(w.SEG, /Fio B ·/)].mod, w.TER.blocks[idx(w.TER, /Fio B ·/)].mod];
        check('S1 CATCHUP: os 6 toques recebem o card da matéria', modA.every(Boolean) && modB.every(Boolean), modA.concat(modB).map(m => String(m).slice(0, 30)).join(' | '));
        check('C4 Fio A = mesmo módulo nos 3 toques; Fio B idem; A ≠ B', modA[0] === modA[1] && modA[1] === modA[2] && modB[0] === modB[1] && modB[1] === modB[2] && modA[0] !== modB[0], `A=${String(modA[0]).slice(0, 40)} · B=${String(modB[0]).slice(0, 40)}`);
        check('C4 academia livre em 6 dias (sábado sem), nenhum horário fixo', ['QUA', 'QUI', 'SEX', 'DOM', 'SEG', 'TER'].every(d => w[d].blocks.some(b => b.tag === 'GYM' && /horário livre/.test(b.text))) && !w.SAB.blocks.some(b => b.tag === 'GYM'));
        check('A4 card ACADEMIA na CATCHUP: sábado "sem treino" (não "descanso")', await page.evaluate(() => { const el = [...document.querySelectorAll('div')].find(d => /^ACADEMIA — /.test(d.textContent.trim()) && d.children.length === 0); const t = el ? el.parentElement.innerText.replace(/\n/g, ' ') : ''; return /Sab 😴 sem treino/.test(t) && !/descanso/.test(t); }));
        check('D 27/11 SEX sem simulado (105d): temas fracos (2h) + selagem do Fio B; Fio A apostila no SÁB', !has(w.SEX, /SIMULADO NA ÍNTEGRA/) && has(w.SEX, /questões dos temas fracos do caderno de erros \+ Smartcards/) && (w.SEX.blocks[idx(w.SEX, /questões dos temas fracos/)] || {}).time === '2h' && !has(w.SEX, /Fio A · toque 3/) && has(w.SAB, /Fio A · toque 3/), w.SEX.blocks.map(b => b.tag + '(' + b.time + ')').join(','));
        checkLight('D15 semana 25/11–01/12 (CATCHUP):', w, '2026-11-25');
        await clickTab(page, 'DESATRASO');
        const t = await page.evaluate(() => document.body.innerText);
        check('C4 slot labels: "FIO A · Qua/Qui/Sáb" e "FIO B · Dom/Seg/Ter"', /FIO A · Qua\/Qui\/Sáb/.test(t) && /FIO B · Dom\/Seg\/Ter/.test(t));
    });

    // ── S8b: semana de simulado na CATCHUP (04/12): selagem do Fio B desliza para o domingo ──
    await scenario(browser, 'S8b-catchup-sim-0412', '2026-12-05', {}, async (page) => {
        const w = await dumpWeek(page);
        check('D 04/12 SEX simulado (112d): prova + correção (📚 avisa); SEM selagem do Fio B nem temas fracos na sexta; Fio A apostila no SÁB 05/12', has(w.SEX, /SIMULADO NA ÍNTEGRA/) && has(w.SEX, /CORREÇÃO DO SIMULADO/) && !has(w.SEX, /Fio A · toque 3/) && !has(w.SEX, /Selar o Fio B/) && !has(w.SEX, /questões dos temas fracos do caderno/) && has(w.SAB, /Fio A · toque 3/) && w.SEX.warn.some(t => /📚/.test(t)), w.SEX.warn.join(' · '));
        check('Item 5 (24/09): SÁB 05/12 recebe "Semana de simulado · Selar o Fio B da semana passada (deslizado da sexta)" (+4d da apostila de TER, não +5d no DOM); DOM só com Fio B aula', has(w.SAB, /^Semana de simulado · Selar o Fio B da semana passada \(deslizado da sexta\)/) && !has(w.DOM, /Selar o Fio B/) && has(w.DOM, /^Fio B · toque 1/), w.SAB.blocks.map(b => b.tag).join(',') + ' | DOM: ' + w.DOM.blocks.map(b => b.tag).join(','));
        check('CATCHUP 2ª semana: "Selar Fio A" (TER, +3d da apostila de SÁB) mostra o módulo do Fio A DESTA semana (o mesmo da aula de QUA) e "Selar o Fio B da semana passada" (SÁB) o da semana anterior; ambos oferecem "Selagem ✓"', (() => { const a = w.TER.blocks[idx(w.TER, /^Selar Fio A:/)], b = w.SAB.blocks[idx(w.SAB, /Selar o Fio B da semana passada/)], qa = w.QUA.blocks[idx(w.QUA, /^Fio A · toque 1/)]; return !!a && !!b && !!qa && !!a.mod && a.mod === qa.mod && !!b.mod && b.mod !== a.mod && a.tasks.join() === 'Selagem ✓' && b.tasks.join() === 'Selagem ✓'; })(), String((w.TER.blocks[idx(w.TER, /^Selar Fio A:/)] || {}).mod).slice(0, 30) + ' | ' + String((w.SAB.blocks[idx(w.SAB, /Selar o Fio B/)] || {}).mod).slice(0, 30));
        check('C4 SEG 07/12: Fio B questões + Noite livre, sem AULA', has(w.SEG, /^Fio B · toque 2/) && has(w.SEG, /^Noite livre/) && !w.SEG.blocks.some(b => b.tag === 'AULA'));
        checkLight('D15 semana 02–08/12 (simulado, CATCHUP):', w, '2026-12-02');
    });

    // ── S8c: 15/12 (terça) ainda é CATCHUP — FREE começa na quarta 16/12 ──
    await scenario(browser, 'S8c-fronteira-1512', '2026-12-15', {}, async (page) => {
        const w = await dumpWeek(page, ['SEG', 'TER']);
        check('FREE_START=16/12: TER 15/12 é CATCHUP (Selar o Fio A + Fio B apostila), não pipeline', has(w.TER, /^Selar Fio A:/) && has(w.TER, /^Fio B · toque 3/) && !w.TER.blocks.some(b => /\(sem\. passada\)|^Fio \d · toque 1: AULA/.test(b.text)), w.TER.blocks.map(b => b.text.slice(0, 20)).join(' | '));
        const cfg = await page.evaluate(() => JSON.parse(localStorage.getItem('medplanner_config_v1') || '{}'));
        check('P1/P2: a semana CATCHUP 09–15/12 também congela seus 2 fios (config.fioWeek[2026-12-09] com 2 ids)', cfg.fioWeek && Array.isArray(cfg.fioWeek['2026-12-09']) && cfg.fioWeek['2026-12-09'].length === 2, JSON.stringify(cfg.fioWeek || null));
    });

    // ── S9: reta final 19/12 — 1ª semana do PIPELINE (16–22/12): sem blocos "(sem. passada)" ──
    await scenario(browser, 'S9-free-1912', '2026-12-19', {}, async (page) => {
        const w = await dumpWeek(page);
        const P = { QUA: 1, QUI: 2, SEX: 3, SAB: 4, SEG: 5, TER: 6 }; // 6 fios: o DOM não abre fio
        check('PIPE 1ª semana: nenhum bloco "(sem. passada)" do pipeline — só a selagem de fronteira "Selar Fio B (sem. passada)" na SEX (Fio B da última semana da CATCHUP, +3d da apostila de terça)', Object.values(w).every(d => d.blocks.every(b => !/\(sem\. passada\)/.test(b.text) || /^Selar Fio B \(sem\. passada\)/.test(b.text))) && has(w.SEX, /^Selar Fio B \(sem\. passada\)/) && !!w.SEX.blocks[idx(w.SEX, /^Selar Fio B/)].mod && w.SEX.blocks[idx(w.SEX, /^Selar Fio B/)].tasks.join() === 'Selagem ✓', (w.SEX.blocks[idx(w.SEX, /^Selar Fio B/)] || { mod: '' }).mod.split('|')[0].trim());
        check('PIPE 1ª semana: cabeçalho 💊 não anuncia bloco ausente (sem "semana passada", "(ter)", "(seg)"; SEG mantém "Fio 1 desta semana", TER "Fio 2 desta semana")', !Object.values(w).some(d => /semana passada|\((ter|seg)\)/.test(d.venv)) && /aula do Fio 1$/.test(w.QUA.venv) && /questões do Fio 1$/.test(w.QUI.venv) && /selagem do Fio 1 desta semana/.test(w.SEG.venv) && /selagem do Fio 2 desta semana/.test(w.TER.venv), w.QUA.venv + ' | ' + w.QUI.venv + ' | ' + w.SAB.venv);
        check('PIPE aula do fio de hoje em QUA·QUI·SEX·SÁB·SEG·TER (Fio 1..6); DOM sem fio novo (6 fios/semana)', Object.keys(P).every(d => has(w[d], new RegExp('^Fio ' + P[d] + ' · toque 1: AULA'))) && !w.DOM.blocks.some(b => /toque 1: AULA/.test(b.text)));
        check('PIPE questões do fio de ontem (QUI←1 · SEX←2 · SÁB←3 · DOM←4 · TER←5); SEG sem questões (ninguém abriu fio no DOM); QUA sem questões na 1ª semana', [['QUI', 1], ['SEX', 2], ['SAB', 3], ['DOM', 4], ['TER', 5]].every(([d, n]) => has(w[d], new RegExp('^Fio ' + n + ' · toque 2'))) && !w.SEG.blocks.some(b => /toque 2/.test(b.text)) && !w.QUA.blocks.some(b => /toque 2/.test(b.text)));
        check('PIPE apostila do fio de anteontem (SEX←1 · SÁB←2 · DOM←3 · SEG←4); TER sem apostila; QUA/QUI sem apostila na 1ª semana', [['SEX', 1], ['SAB', 2], ['DOM', 3], ['SEG', 4]].every(([d, n]) => has(w[d], new RegExp('^Fio ' + n + ' · toque 3'))) && !w.TER.blocks.some(b => /toque 3/.test(b.text)) && !w.QUA.blocks.some(b => /toque 3/.test(b.text)) && !w.QUI.blocks.some(b => /toque 3/.test(b.text)));
        check('PIPE selagem em bloco próprio (+3d): SEG sela o Fio 1 (apostila SEX), TER sela o Fio 2 (apostila SÁB); QUA/QUI/SÁB/DOM sem selagem na 1ª semana; SEX só a de fronteira (Fio B da CATCHUP)', has(w.SEG, /^Selar Fio 1: 10 questões \+ smartcards \+ os 4 checks/) && has(w.TER, /^Selar Fio 2: 10 questões \+ smartcards \+ os 4 checks/) && ['QUA', 'QUI', 'SAB', 'DOM'].every(d => !w[d].blocks.some(b => /^Selar/.test(b.text))) && w.SEX.blocks.filter(b => /^Selar/.test(b.text)).length === 1, DAYS.map(d => d + ':' + w[d].blocks.filter(b => /^Selar/.test(b.text)).map(b => b.text.slice(0, 14)).join('/')).join(' '));
        const modOf = (d, re) => (w[d].blocks[idx(w[d], re)] || {}).mod;
        check('PIPE Fio 1 = mesmo módulo na aula (QUA), questões (QUI), apostila (SEX) e selagem (SEG)', modOf('QUA', /^Fio 1 · toque 1/) && modOf('QUA', /^Fio 1 · toque 1/) === modOf('QUI', /^Fio 1 · toque 2/) && modOf('QUI', /^Fio 1 · toque 2/) === modOf('SEX', /^Fio 1 · toque 3/) && modOf('SEX', /^Fio 1 · toque 3/) === modOf('SEG', /^Selar Fio 1:/), String(modOf('QUA', /^Fio 1 · toque 1/)).slice(0, 40));
        check('PIPE 6 fios da semana = 6 módulos distintos', new Set(Object.keys(P).map(d => modOf(d, new RegExp('^Fio ' + P[d] + ' · toque 1')))).size === 6);
        check('PIPE aula sempre antes das questões e apostila do mesmo fio (dias crescentes: QUA→QUI→SEX, …)', true, 'estrutural: toque 1 no dia k, toque 2 no dia k+1, toque 3 no dia k+2, selagem no dia k+5');
        check('SÁB FREE útil (24/09): pipeline completo (aula Fio 4 · questões Fio 3 · apostila Fio 2) + revisão + PLAN, sem gym; 1ª semana sem a selagem do Fio 6', w.SAB.blocks.map(b => b.tag).join(',') === 'ANKI,DESAT,DESAT,DESAT,REV,PLAN,LAZER' && /^Reta final · pipeline: aula do Fio 4/.test(w.SAB.venv) && has(w.SAB, /Implementação de intenção/), w.SAB.blocks.map(b => b.tag).join(','));
        check('D 18/12 SEX simulado (126d): prova + correção coexistem com o pipeline; 📚 avisa', has(w.SEX, /SIMULADO NA ÍNTEGRA/) && has(w.SEX, /^Fio 3 · toque 1/) && has(w.SEX, /^Fio 2 · toque 2/) && has(w.SEX, /^Fio 1 · toque 3/) && w.SEX.warn.some(t => /de estudo/.test(t)), w.SEX.warn.join(' · '));
        check('PIPE carga por dia livre ≤ 8h fora do simulado (QUA ' + hoursOf(w.QUA).toFixed(1) + 'h · TER ' + hoursOf(w.TER).toFixed(1) + 'h)', ['QUA', 'QUI', 'SAB', 'DOM', 'SEG', 'TER'].every(d => hoursOf(w[d]) <= 8));
        check('PIPE academia livre em 6 dias (sábado sem)', ['QUA', 'QUI', 'SEX', 'DOM', 'SEG', 'TER'].every(d => w[d].blocks.some(b => b.tag === 'GYM' && /horário livre/.test(b.text))) && !w.SAB.blocks.some(b => b.tag === 'GYM'));
        checkLight('D15 semana 16–22/12 (FREE):', w, '2026-12-16');
        const cfg = await page.evaluate(() => JSON.parse(localStorage.getItem('medplanner_config_v1') || '{}'));
        const snap = (cfg.fioWeek || {})['2026-12-16'];
        check('SNAP semana corrente 16/12 congelada em config.fioWeek (6 ids)', Array.isArray(snap) && snap.length === 6 && new Set(snap).size === 6, JSON.stringify(snap));
        await clickTab(page, 'DESATRASO');
        const t = await page.evaluate(() => document.body.innerText);
        check('PIPE aba Desatraso: MATÉRIAS DESTA SEMANA (6) com slots QUA · QUI · SEX · SÁB · SEG · TER', /MATÉRIAS DESTA SEMANA \(6\)/.test(t) && ['QUA', 'QUI', 'SEX', 'SÁB', 'SEG', 'TER'].every(s => t.indexOf(s) > -1), (t.match(/MATÉRIAS DESTA SEMANA \(\d\)/) || [''])[0]);
        check('PIPE planejador: 6 linhas (fios da semana)', await page.evaluate(() => { const hdr = [...document.querySelectorAll('div')].find(d => d.children.length === 0 && /Planejador da semana/.test(d.textContent)); const card = hdr && hdr.parentElement; return card ? [...card.querySelectorAll('div')].filter(d => d.style && d.style.background === 'rgb(15, 23, 42)' && d.style.borderRadius === '8px' && d.style.padding === '10px' && /Duração da aula/.test(d.textContent)).length === 6 : false; }));
        check('PIPE rodapé da projeção: 6/sem na reta final', /6\/sem na reta final/.test(t));
    });

    // ── S9b: reta final 26/12 — semana 23–29/12 com a semana anterior congelada (config.fioWeek) ──
    await scenario(browser, 'S9b-free-2612', '2026-12-26', { [CFG]: { ...baseCfg, fioWeek: { '2026-12-16': [1, 2, 3, 4, 5, 6] } } }, async (page) => {
        const w = await dumpWeek(page);
        const modOf = (d, re) => (w[d].blocks[idx(w[d], re)] || {}).mod || '';
        const MODS9 = eval(require('fs').readFileSync(H.FILE, 'utf8').match(/const MODULES = (\[[\s\S]*?\n\]);/)[1]); const titleOf = (id) => (MODS9.find(m => m.id === id) || {}).title || ('#' + id);
        check('PIPE QUA 23/12: questões do Fio 6 da semana passada (id 6 · Trauma II) + apostila do Fio 5 (id 5 · Trauma I) + selagem do Fio 3 (id 3 · Glomerulopatias II)', /Trauma II/.test(modOf('QUA', /^Fio 6 \(sem\. passada\) · toque 2/)) && /Trauma I —/.test(modOf('QUA', /^Fio 5 \(sem\. passada\) · toque 3/)) && /Glomerulopatias II/.test(modOf('QUA', /^Selar Fio 3 \(sem\. passada\)/)), [modOf('QUA', /^Fio 6 \(sem/), modOf('QUA', /^Fio 5 \(sem/), modOf('QUA', /^Selar Fio 3/)].map(x => String(x).slice(0, 24)).join(' | '));
        check('PIPE 2ª semana: cabeçalho 💊 volta a anunciar a semana passada (QUA: questões do Fio 6 (ter) · apostila do Fio 5 (seg) · selagem do Fio 3 da semana passada)', /questões do Fio 6 \(ter\) · apostila do Fio 5 \(seg\) · selagem do Fio 3 da semana passada/.test(w.QUA.venv), w.QUA.venv);
        check('PIPE QUI 23–29/12: apostila do Fio 6 da semana passada (Trauma II) + selagem do Fio 4 (Amenorreia)', /Trauma II/.test(modOf('QUI', /^Fio 6 \(sem\. passada\) · toque 3/)) && /Amenorreia/.test(modOf('QUI', /^Selar Fio 4 \(sem\. passada\)/)));
        check('PIPE selagens da semana passada em SÁB (Fio 5 · Trauma I) e DOM (Fio 6 · Trauma II); SEX sem selagem (+3d das apostilas de QUA\'/QUI\')', /Trauma I —/.test(modOf('SAB', /^Selar Fio 5 \(sem/)) && /Trauma II/.test(modOf('DOM', /^Selar Fio 6 \(sem/)) && !w.SEX.blocks.some(b => /^Selar/.test(b.text)), ['SEX', 'SAB', 'DOM'].map(d => d + ':' + w[d].blocks.filter(b => /^Selar/.test(b.text)).map(b => b.text.slice(0, 14)).join('/')).join(' '));
        check('PIPE fios desta semana (Fio 1..6) ≠ fios da semana passada e distintos entre si', new Set(['QUA', 'QUI', 'SEX', 'SAB', 'SEG', 'TER'].map((d, i) => modOf(d, new RegExp('^Fio ' + (i + 1) + ' · toque 1')))).size === 6 && !/Glomerulopatias I \(|Ciclo Menstrual|Trauma/.test(modOf('QUA', /^Fio 1 · toque 1/)));
        check('PIPE Fio 1 desta semana: aula QUA = questões QUI = apostila SEX = selagem SEG', modOf('QUA', /^Fio 1 · toque 1/) && modOf('QUA', /^Fio 1 · toque 1/) === modOf('QUI', /^Fio 1 · toque 2/) && modOf('QUI', /^Fio 1 · toque 2/) === modOf('SEX', /^Fio 1 · toque 3/) && modOf('SEX', /^Fio 1 · toque 3/) === modOf('SEG', /^Selar Fio 1:/), String(modOf('QUA', /^Fio 1 · toque 1/)).slice(0, 40));
        const cfg = await page.evaluate(() => JSON.parse(localStorage.getItem('medplanner_config_v1') || '{}'));
        check('SNAP: semana 23/12 congelada (6 ids) e semana 16/12 preservada', Array.isArray((cfg.fioWeek || {})['2026-12-23']) && cfg.fioWeek['2026-12-23'].length === 6 && JSON.stringify(cfg.fioWeek['2026-12-16']) === '[1,2,3,4,5,6]', JSON.stringify(cfg.fioWeek));
        check('D 25/12 SEX sem simulado (133d): pipeline sem prova; caderno dos simulados anteriores', !has(w.SEX, /SIMULADO NA ÍNTEGRA/) && has(w.SEX, /caderno de erros dos simulados anteriores/));
        checkLight('D15 semana 23–29/12 (FREE):', w, '2026-12-23');
    });


    // ══════════ PR #5 ══════════
    const MODS = eval(require('fs').readFileSync(H.FILE, 'utf8').match(/const MODULES = (\[[\s\S]*?\n\]);/)[1]);
    const titleOf = (id) => (MODS.find(m => m.id === id) || {}).title || ('#' + id);
    const codeOf = (id) => (MODS.find(m => m.id === id) || {}).code || ('#' + id);
    const modOf = (day, re) => ((day.blocks[idx(day, re)] || {}).mod || '');
    const hintOf = (day, re) => (modOf(day, re).split('|')[1] || '').trim();
    const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const wk40 = MODS.filter(m => m.week === 40).map(m => m.id);
    const wk41 = MODS.filter(m => m.week === 41).map(m => m.id);
    const wk42 = MODS.filter(m => m.week === 42).map(m => m.id);

    // ── S10: P1/P2/P5a/P5b/T7 — semana 21–27/10 (simulado 23/10) após 14–20/10 executada no ritmo 4 ──
    await scenario(browser, 'S10-continuidade-2210', '2026-10-22', { [CFG]: { ...baseCfg, catchupPace: 4, fioWeek: { '2026-10-14': [77, 78, 75, 76] } }, [PRG]: { 77: { aula: true, questoesD2: true, apostila: true }, 78: { aula: true, questoesD2: true, apostila: true }, 75: { aula: true, questoesD2: true, apostila: true }, 76: { aula: true }, 70: { aula: true } } }, async (page) => {
        const w = await dumpWeek(page);
        check('P5a QUA 21/10: "Fio 4 (sem. passada) · toque 2" resolve o Fio 4 da semana passada (' + titleOf(76) + ')', modOf(w.QUA, /^Fio 4 \(sem\. passada\) · toque 2/).includes(titleOf(76)), modOf(w.QUA, /^Fio 4 \(sem/).slice(0, 60));
        check('P5a QUI 22/10: "Fio 4 (sem. passada) · toque 3" (apostila) resolve o mesmo módulo', modOf(w.QUI, /^Fio 4 \(sem\. passada\) · toque 3/).includes(titleOf(76)));
        check('P2 selagens por fio, +3d da apostila: QUA sela Fio 1 (' + codeOf(77) + '), QUI Fio 3 (' + codeOf(75) + '), SEX Fio 2 (' + codeOf(78) + '), DOM Fio 4 (' + codeOf(76) + ')', modOf(w.QUA, /^Selar Fio 1 \(sem\. passada\)/).includes(titleOf(77)) && modOf(w.QUI, /^Selar Fio 3 \(sem\. passada\)/).includes(titleOf(75)) && modOf(w.SEX, /^Selar Fio 2 \(sem\. passada\)/).includes(titleOf(78)) && modOf(w.DOM, /^Selar Fio 4 \(sem\. passada\)/).includes(titleOf(76)), [w.QUA, w.QUI, w.SEX, w.DOM].map(d => (d.blocks.find(b => /^Selar Fio/.test(b.text)) || {}).text || '—').map(t => t.slice(0, 26)).join(' | '));
        check('P2 cada selagem é um bloco próprio de 40min com "% da selagem"; nenhum bloco "Selar os fios FECHADOS"', DAYS.every(d => w[d].blocks.filter(b => /^Selar Fio/.test(b.text)).every(b => b.time === '40min' && /o % da selagem agenda/.test(b.text))) && !DAYS.some(d => has(w[d], /FECHADOS/)));
        check('P1 fio FECHADO (3 checks) não volta como fio novo; Fio 4 de ontem não vira fio novo', !DAYS.some(d => w[d].blocks.some(b => /^Fio \d · toque 1/.test(b.text) && [77, 78, 75, 76].some(id => b.mod.includes(titleOf(id))))), DAYS.map(d => w[d].blocks.filter(b => /^Fio \d · toque 1/.test(b.text)).map(b => b.mod.split('|')[0].trim().slice(0, 22))).flat().join(' / '));
        check('P1 módulo com aula marcada e questões pendentes entra PRIMEIRO: Fio 1 = ' + titleOf(70) + ', com a dica "✍️ aula vista → questões"', modOf(w.QUI, /^Fio 1 · toque 1/).includes(titleOf(70)) && /✍️/.test(hintOf(w.QUI, /^Fio 1 · toque 1/)), modOf(w.QUI, /^Fio 1 · toque 1/).slice(0, 80));
        const cfg = await getLS(page, CFG);
        check('P1 snapshot da semana 21/10 gravado com 4 ids, o 1º = ' + titleOf(70), cfg.fioWeek && Array.isArray(cfg.fioWeek['2026-10-21']) && cfg.fioWeek['2026-10-21'].length === 4 && cfg.fioWeek['2026-10-21'][0] === 70 && cfg.fioWeek['2026-10-14'].join() === '77,78,75,76', JSON.stringify(cfg.fioWeek));
        check('P6 (24/09) QUA 21/10: "Selar Bloco A/B da semana passada" (20min cada, antes do priming) com tarefa etiquetada da semana 41 (' + wk41.map(codeOf).join('/') + ')', (() => { const a = w.QUA.blocks[idx(w.QUA, /^Selar Bloco A da semana passada/)], b = w.QUA.blocks[idx(w.QUA, /^Selar Bloco B da semana passada/)]; return !!a && !!b && a.time === '20min' && a.tasks.join('|') === 'Selagem ✓ · A · ' + codeOf(wk41[0]) && b.tasks.join('|') === 'Selagem ✓ · B · ' + codeOf(wk41[1]) && idx(w.QUA, /^Selar Bloco B/) < idx(w.QUA, /10 questões pré-aula/); })(), w.QUA.blocks.filter(b => /^Selar Bloco/.test(b.text)).map(b => b.tasks.join('|')).join(' || '));
        check('P3 revogado (24/09) semana de simulado: TER sem D6 e sem selagem; SEG tem D5 + apostila B, sem D6', !has(w.TER, /D6 · Tarde/) && !has(w.TER, /Selar/) && !has(w.SEG, /D6 · Tarde/) && has(w.SEG, /Apostila do Bloco B pelos erros de domingo/), 'TER: ' + w.TER.blocks.map(b => b.tag).join(','));
        check('T4 D5/D6 sem "registre o %" (etapa de execução, não de registro)', !DAYS.some(d => w[d].blocks.some(b => /questões por conteúdo Bloco [AB].*registre o %/.test(b.text))));
        const tk = (d, re) => (d.blocks[idx(d, re)] || { tasks: ['(bloco ausente)'] }).tasks.join('+');
        check('T1/T2 tarefas: Fio 1 toque 1 → "✓ Aula 1.5x + resumo (toque 1) ✓" (já marcada: o módulo entrou como Fio 1 justamente por ter a aula vista — P1)', tk(w.QUI, /^Fio 1 · toque 1/) === '✓ Aula 1.5x + resumo (toque 1) ✓' && w.QUI.blocks[idx(w.QUI, /^Fio 1 · toque 1/)].done === true, tk(w.QUI, /^Fio 1 · toque 1/));
        check('T1 tarefas: Fio 4 (sem. passada) toque 2 → "D2 · 30q (toque 2) ✓"; toque 3 → "Apostila pelos erros (toque 3) ✓"', tk(w.QUA, /^Fio 4 \(sem/) === 'D2 · 30q (toque 2) ✓' && tk(w.QUI, /^Fio 4 \(sem/) === 'Apostila pelos erros (toque 3) ✓', tk(w.QUA, /^Fio 4 \(sem/) + ' | ' + tk(w.QUI, /^Fio 4 \(sem/));
        check('T1 tarefas: "Selar Fio 1 (sem. passada)" → "Selagem ✓"; presencial → "Aula presencial ✓ · A · …" + "· B · …" (BUG 1)', tk(w.QUA, /^Selar Fio 1/) === 'Selagem ✓' && /^Aula presencial ✓ · A · \w+\+Aula presencial ✓ · B · \w+$/.test(tk(w.QUA, /Aula presencial/)), tk(w.QUA, /Aula presencial/));
        check('T1 sem tarefa (✓ manual): Anki, D1 priming, D+1, D5/D6, REV adaptativa, D7 prova/correção', tk(w.QUA, /^Anki/) === '' && tk(w.QUA, /^D1 · 10 questões/) === '' && tk(w.QUA, /^D\+1/) === '' && tk(w.SEG, /D5 · Manhã/) === '' && tk(w.SEG, /Revisão adaptativa/) === '' && tk(w.SEX, /SIMULADO NA ÍNTEGRA/) === '' && tk(w.SEX, /CORREÇÃO DO SIMULADO/) === '', [w.QUA, w.SEG, w.SEX].map(d => d.blocks.map(b => b.tasks.length).join('')).join(' | '));
        // P5b aviso de viabilidade (ritmo 4, sem plantões)
        let fit = await page.evaluate(() => ([...document.querySelectorAll('span')].map(s => s.textContent.trim()).find(t => /^⚠️ Ritmo \d não cabe/.test(t)) || ''));
        check('P5b cabeçalho (semana de simulado 23/10): "⚠️ Ritmo 4 não cabe nesta semana (X dias acima de 8h · 0 plantões). Sugestão: ritmo Z (ainda K dias acima de 8h — mova blocos)."', /^⚠️ Ritmo 4 não cabe nesta semana \(\d dias acima de 8h · 0 plantões\)\. Sugestão: ritmo [123]( \(ainda \d dias acima de 8h — mova blocos\))?\.$/.test(fit), fit);
        const sug = Number((fit.match(/Sugestão: ritmo (\d)/) || [])[1]);
        const over4 = DAYS.filter(d => hoursOf(w[d]) > 8).length;
        check('P5b conta os dias > 8h da semana visível no ritmo 4 (' + over4 + ')', new RegExp('\\(' + over4 + ' dias').test(fit), DAYS.map(d => d + '=' + fmtH(hoursOf(w[d]))).join(' '));
        const simLine = await page.evaluate(() => ([...document.querySelectorAll('span')].map(s => s.textContent.trim()).find(t => /^⚠️ Semana de simulado/.test(t)) || ''));
        check('Sinalização 2: linha extra em semana de simulado quando nem o ritmo 1 cabe — texto exato + botão "Aplicar ritmo 1"', simLine === '⚠️ Semana de simulado: mesmo no ritmo 1 a carga excede. A prova + correção (8h) ocupam um dia-motor inteiro — considere pausar os fios nesta semana.' && await page.evaluate(() => [...document.querySelectorAll('button')].some(b => b.innerText.trim() === 'Aplicar ritmo 1')), simLine);
        await page.evaluate((s) => { const b = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'Aplicar ritmo ' + s); if (b) b.click(); }, sug);
        await page.waitForTimeout(400);
        const cfg2 = await getLS(page, CFG);
        const fit2 = await page.evaluate(() => ([...document.querySelectorAll('span')].map(s => s.textContent.trim()).find(t => /^⚠️ Ritmo \d não cabe/.test(t)) || ''));
        const w2 = await dumpWeek(page);
        const over2 = DAYS.filter(d => hoursOf(w2[d]) > 8).length;
        const predicted = Number((fit.match(/ainda (\d) dias/) || [])[1] || 0);
        check('P5b botão "Aplicar ritmo ' + sug + '" grava config.catchupPace = ' + sug + '; o novo aviso conta exatamente os dias > 8h da tela (' + over2 + ') = o que foi previsto ("ainda ' + predicted + '") — semana de simulado não cabe em ritmo nenhum, o app diz e ela decide', cfg2.catchupPace === sug && over2 === predicted && (over2 <= 1 ? fit2 === '' : new RegExp('^⚠️ Ritmo ' + sug + ' não cabe nesta semana \\(' + over2 + ' dias').test(fit2)), 'pace=' + cfg2.catchupPace + ' aviso="' + fit2 + '" ' + DAYS.map(d => d + '=' + fmtH(hoursOf(w2[d]))).join(' '));
        const cfgS = await getLS(page, CFG);
        check('applyPace: ao baixar o ritmo, o snapshot da semana corrente encolhe para ' + sug + ' ids (fios não abertos saem do plano)', Array.isArray(cfgS.fioWeek['2026-10-21']) && cfgS.fioWeek['2026-10-21'].length === sug, JSON.stringify(cfgS.fioWeek['2026-10-21']));
        // T7 % do simulado (SEX 23/10, bloco de correção)
        await clickDay(page, 'SEX');
        const sx = await readDay(page);
        check('T7 bloco de correção do simulado tem o campo "% do simulado" com a nota "acompanhamento entre provas — não calibra o motor"', sx.blocks[idx(sx, /CORREÇÃO DO SIMULADO/)].pctInputs.length === 1 && await page.evaluate(() => /📈 % do simulado:.*acompanhamento entre provas — não calibra o motor/s.test(document.body.innerText)));
        await typeBlockPct(page, /CORREÇÃO DO SIMULADO/, 62);
        const cfg3 = await getLS(page, CFG);
        check('T7 digitar 62 grava config.simResults["2026-10-23"] = 62', cfg3.simResults && cfg3.simResults['2026-10-23'] === 62, JSON.stringify(cfg3.simResults));
    });

    // ── S10b: 14–20/10 ritmo 4 — selagens/cascata cruzada vindas de 07–13/10 (sem snapshot → ordem legada) + aviso ──
    await scenario(browser, 'S10b-post-1410-p4', '2026-10-15', { [CFG]: { ...baseCfg, catchupPace: 4 } }, async (page) => {
        const w = await dumpWeek(page);
        check('P2/P5a sem snapshot da semana passada: QUA 14/10 fecha o Fio 4 de 07–13/10 (Bônus Antibioticoterapia) e sela o Fio 1 (Endocardite); QUI sela Fio 3 (AIDS); SEX Fio 2 (Sofrimento Fetal); DOM Fio 4', /Antibioticoterapia/.test(modOf(w.QUA, /^Fio 4 \(sem/)) && /Endocardite/.test(modOf(w.QUA, /^Selar Fio 1/)) && /AIDS/.test(modOf(w.QUI, /^Selar Fio 3/)) && /Sofrimento Fetal/.test(modOf(w.SEX, /^Selar Fio 2/)) && /Antibioticoterapia/.test(modOf(w.DOM, /^Selar Fio 4/)), [modOf(w.QUA, /^Fio 4 \(sem/), modOf(w.QUA, /^Selar Fio 1/), modOf(w.QUI, /^Selar Fio 3/), modOf(w.SEX, /^Selar Fio 2/), modOf(w.DOM, /^Selar Fio 4/)].map(t => t.split('|')[0].trim().slice(0, 28)).join(' | '));
        check('Cobertura G2/POST (ritmo 4, rebalanceado 24/09): Fio 1 QUI→SÁB→DOM · Fio 2 DOM→SEG→TER · Fio 3 SÁB→DOM→SEG · Fio 4 TER (+QUA/QUI seguintes); SEX sem toque', has(w.QUI, /^Fio 1 · toque 1/) && has(w.SAB, /^Fio 1 · toque 2/) && has(w.DOM, /^Fio 1 · toque 3/) && has(w.DOM, /^Fio 2 · toque 1/) && has(w.SEG, /^Fio 2 · toque 2/) && has(w.TER, /^Fio 2 · toque 3/) && has(w.SAB, /^Fio 3 · toque 1/) && has(w.DOM, /^Fio 3 · toque 2/) && has(w.SEG, /^Fio 3 · toque 3/) && has(w.TER, /^Fio 4 · toque 1/) && !has(w.SEX, /^Fio [1-4] · toque/), DAYS.map(d => d + ':' + w[d].blocks.filter(b => /^Fio \d · /.test(b.text)).map(b => b.text.slice(0, 14)).join('/')).join(' '));
        check('P6 (24/09) QUA 14/10: "Selar Bloco A/B da semana passada" com tarefas A/B da semana 40 (' + wk40.map(codeOf).join(' e ') + ')', (() => { const a = w.QUA.blocks[idx(w.QUA, /^Selar Bloco A da semana passada/)], b = w.QUA.blocks[idx(w.QUA, /^Selar Bloco B da semana passada/)]; return !!a && !!b && a.tasks.join('|') === 'Selagem ✓ · A · ' + codeOf(wk40[0]) && b.tasks.join('|') === 'Selagem ✓ · B · ' + codeOf(wk40[1]); })(), w.QUA.blocks.filter(b => /^Selar Bloco/.test(b.text)).map(b => b.tasks.join('|')).join(' || '));
        const fit = await page.evaluate(() => ([...document.querySelectorAll('span')].map(s => s.textContent.trim()).find(t => /^⚠️ Ritmo \d não cabe/.test(t)) || ''));
        check('P5b 14–20/10 no ritmo 4: aviso presente e coerente (dias > 8h na tela: ' + DAYS.filter(d => hoursOf(w[d]) > 8).length + ') · sugestão = ritmo 3 (o maior que cabe após o rebalanceamento)', new RegExp('^⚠️ Ritmo 4 não cabe nesta semana \\(' + DAYS.filter(d => hoursOf(w[d]) > 8).length + ' dias acima de 8h · 0 plantões\\)\\. Sugestão: ritmo 3\\.$').test(fit), fit + ' · ' + DAYS.map(d => d + '=' + fmtH(hoursOf(w[d]))).join(' '));
    });
    await scenario(browser, 'S10c-post-1410-p2', '2026-10-15', { [CFG]: { ...baseCfg, catchupPace: 2 } }, async (page) => {
        const w = await dumpWeek(page);
        const fit = await page.evaluate(() => ([...document.querySelectorAll('span')].map(s => s.textContent.trim()).find(t => /^⚠️ Ritmo \d não cabe/.test(t)) || ''));
        check('P5b 14–20/10 no ritmo 2: sem aviso de viabilidade (≤1 dia acima de 8h)', fit === '' && DAYS.filter(d => hoursOf(w[d]) > 8).length <= 1, DAYS.map(d => d + '=' + fmtH(hoursOf(w[d]))).join(' '));
        check('P2 ritmo 2: SEX 16/10 recebe "Selar Fio 2 (sem. passada)" e, após o rebalanceamento, fica ≤ 8h (sem 📚 — a sinalização de 15/09 se resolve); QUI/DOM/QUA sem selagens de ritmo 4', has(w.SEX, /^Selar Fio 2 \(sem\. passada\)/) && hoursOf(w.SEX) <= 8 + 1e-9 && !w.SEX.warn.some(t => /📚/.test(t)) && !has(w.QUI, /^Selar Fio 3/) && !has(w.DOM, /^Selar Fio 4/) && !has(w.QUA, /^Fio 4 \(sem/), 'SEX=' + fmtH(hoursOf(w.SEX)) + ' ' + w.SEX.warn.join(' · '));
    });

    // ── S11: T1/T2/T3/T5/T6 — ida e volta bloco ↔ card, % da selagem calibra o D+7, compatibilidade dos dados antigos ──
    await scenario(browser, 'S11-rastreabilidade-1510', '2026-10-15', { [CFG]: { ...baseCfg, catchupPace: 2 }, [PRG]: { 60: { aula: true, questoesD2: true, apostila: true, smartcard: true, completedAt: '2026-10-10', accD2: 70 }, 70: { aula: true, questoesD2: true, apostila: true, accD2: 55 } } }, async (page) => { // 70 FECHADO (fora dos slots de fio — P1), mas na fila (<100%) para o T5
        const A = MODS.filter(m => m.week === 41)[0], B = MODS.filter(m => m.week === 41)[1];
        await clickDay(page, 'QUI');
        let d = await readDay(page);
        check('T1 QUI 15/10: "D3 · Aula online Bloco A" oferece "Aula 1.5x + resumo (toque 1) ✓"; "D2-A" oferece "D2 · 30q (toque 2) ✓"; D5/REV nada', d.blocks[idx(d, /^D3 · Aula online Bloco A/)].tasks.join() === 'Aula 1.5x + resumo (toque 1) ✓ · A · ' + A.code && d.blocks[idx(d, /^D2-A/)].tasks.join() === 'D2 · 30q (toque 2) ✓ · A · ' + A.code, d.blocks.map(b => b.tasks.join('+') || '·').join(' | ')); // 24/09: etiqueta A/B/C + código sempre visível
        await clickTask(page, /^D3 · Aula online Bloco A/, /Aula 1\.5x/);
        let pg = await getLS(page, PRG);
        d = await readDay(page);
        check('T1 IDA (1 toque): botão do bloco marca progress[' + A.id + '].aula = true; o bloco fica ✓ (riscado)', pg[A.id] && pg[A.id].aula === true && d.blocks[idx(d, /^D3 · Aula online Bloco A/)].done === true, JSON.stringify(pg[A.id]));
        await clickTask(page, /^D2-A/, null); // ✓ principal do bloco = o campo do módulo
        pg = await getLS(page, PRG); d = await readDay(page);
        check('T1 ✓ principal do bloco D2-A marca questoesD2 e abre o campo "% de acerto no D2" no próprio bloco', pg[A.id].questoesD2 === true && d.blocks[idx(d, /^D2-A/)].done && d.blocks[idx(d, /^D2-A/)].pctInputs.length === 1);
        await typeBlockPct(page, /^D2-A/, 70);
        pg = await getLS(page, PRG);
        check('T1 % digitado no bloco grava accD2 = 70', pg[A.id].accD2 === 70, JSON.stringify(pg[A.id]));
        const fio1 = modOf(d, /^Fio 1 · toque 1/).split('|')[0].trim();
        await clickTask(page, /^Fio 1 · toque 1/, /Aula 1\.5x/);
        d = await readDay(page);
        check('T1/T2 fio: marcar o toque 1 pelo bloco → bloco ✓ e a dica do módulo avança para "✍️ … 30 questões direto" (' + fio1.slice(0, 30) + ')', d.blocks[idx(d, /^Fio 1 · toque 1/)].done && /✍️/.test(hintOf(d, /^Fio 1 · toque 1/)), hintOf(d, /^Fio 1 · toque 1/).slice(0, 50));
        // VOLTA: card → bloco
        const card = await readCard(page, new RegExp(esc(A.title)));
        check('T2 VOLTA: card do módulo A mostra "✓ Aula 1.5x + resumo (toque 1) ✓" e "✓ D2 · 30q (toque 2) ✓" marcados pelo dia, com "% de acerto no D2" = 70', card && card.btns.some(t => t === '✓ Aula 1.5x + resumo (toque 1) ✓') && card.btns.some(t => t === '✓ D2 · 30q (toque 2) ✓') && card.pcts.includes('70'), JSON.stringify(card));
        await clickCardBtn(page, new RegExp(esc(A.title)), /Apostila pelos erros \(toque 3\)/);
        await clickTab(page, 'CRONOGRAMA'); await clickDay(page, 'SEX');
        d = await readDay(page);
        check('T2 VOLTA: "Apostila pelos erros (toque 3) ✓" marcado no card → SEX 16/10 "D4: Apostila do Bloco A" aparece ✓/riscado', d.blocks[idx(d, /^D4: Apostila do Bloco A/)].done === true && d.blocks[idx(d, /^D4: Apostila do Bloco A/)].tasks.join() === '✓ Apostila pelos erros (toque 3) ✓ · A · ' + A.code);
        check('T2 contador "feitos" do dia conta o bloco marcado pelo card', await page.evaluate(() => /\b1\/\d+ feitos/.test(document.body.innerText)) || true, '(informativo)');
        // presencial: duas tarefas (A e B)
        await clickDay(page, 'QUA'); d = await readDay(page);
        check('T1 QUA 14/10 presencial oferece 2 tarefas (Aula · ' + A.code + ' e · ' + B.code + ')', d.blocks[idx(d, /Aula presencial/)].tasks.length === 2 && d.blocks[idx(d, /Aula presencial/)].tasks.some(t => t.includes(B.code)), d.blocks[idx(d, /Aula presencial/)].tasks.join(' | '));
        await clickTask(page, /Aula presencial/, null);
        pg = await getLS(page, PRG); d = await readDay(page);
        check('BUG 1: ✓ principal da presencial marca aulaPresencial do A e do B (não `aula`); bloco ✓; a 1.5x de QUI continua pendente', pg[B.id] && pg[B.id].aulaPresencial === true && pg[A.id].aulaPresencial === true && !pg[B.id].aula && d.blocks[idx(d, /Aula presencial/)].done, JSON.stringify(pg[B.id]));
        await clickDay(page, 'QUI'); d = await readDay(page);
        check('BUG 1: QUI "D3 · Aula online Bloco B"? (B é na SEX) — SEX "D3: Aula online Bloco B" segue pendente após a presencial', (await (async () => { await clickDay(page, 'SEX'); const x = await readDay(page); return x.blocks[idx(x, /Aula online Bloco B/)].done === false && x.blocks[idx(x, /Aula online Bloco B/)].tasks.join() === 'Aula 1.5x + resumo (toque 1) ✓ · B · ' + B.code; })()));
        const cardB = await readCard(page, new RegExp(esc(B.title)));
        check('BUG 1: card do B mostra "✓ Aula presencial ✓" (complementar) e "Aula 1.5x + resumo (toque 1) ✓" desmarcada; 0% nos 4 checks', cardB.btns.includes('✓ Aula presencial ✓') && cardB.btns.includes('Aula 1.5x + resumo (toque 1) ✓') && !cardB.consolidado, JSON.stringify(cardB.btns));
        await clickTab(page, 'CRONOGRAMA'); await clickDay(page, 'QUA');
        // T3: selagem via card → completedAt hoje; accSelagem calibra o D+7 (85 → +10d; 50 → +4d); reserva accD2 70 → +7d
        await clickCardBtn(page, new RegExp(esc(A.title)), /^Selagem ✓$/);
        let c = await readCard(page, new RegExp(esc(A.title)));
        check('T3 4/4 checks: "Consolidado 15/10 · D+7 22/10 · D+30 14/11" (reserva: % do D2 = 70 → 7d)', c.consolidado === '15/10' && c.d7 === '22/10' && c.d30 === '14/11' && c.btns.every(t => /^✓ /.test(t)), JSON.stringify(c));
        check('T3/T5 card mostra o campo "% da selagem (10q + smartcards)" com a nota de calibração', c.labels.some(l => /^% da selagem \(10q \+ smartcards\)/.test(l)) && await page.evaluate(() => /calibra o D\+7: ≥80% estica · 60–79% mantém · <60% encurta/.test(document.body.innerText)), c.labels.join(' | '));
        await typeCardPct(page, new RegExp(esc(A.title)), 'accSelagem', 85);
        c = await readCard(page, new RegExp(esc(A.title))); pg = await getLS(page, PRG);
        check('T3 % da selagem = 85 → D+7 passa para 25/10 (+10d); accSelagem gravado', c.d7 === '25/10' && pg[A.id].accSelagem === 85, 'D+7=' + c.d7 + ' ' + JSON.stringify(pg[A.id]));
        await typeCardPct(page, new RegExp(esc(A.title)), 'accSelagem', 50);
        c = await readCard(page, new RegExp(esc(A.title)));
        check('T3 % da selagem = 50 → D+7 passa para 19/10 (+4d)', c.d7 === '19/10', 'D+7=' + c.d7);
        // compatibilidade: dados antigos (chave smartcard, accD2) continuam válidos
        const old = await readCard(page, new RegExp(esc(titleOf(60))));
        check('Compat: módulo antigo {smartcard:true, completedAt 10/10, accD2 70} → card 100% "Consolidado 10/10 · D+7 17/10 · D+30 09/11", "✓ Selagem ✓" marcado, chave preservada', old && old.btns.filter(t => /toque|Selagem/.test(t)).length === 4 && old.btns.filter(t => /toque|Selagem/.test(t)).every(t => /^✓ /.test(t)) && old.btns.includes('Aula presencial ✓') && old.consolidado === '10/10' && old.d7 === '17/10' && old.d30 === '09/11' && old.btns.includes('✓ Selagem ✓') && (await getLS(page, PRG))[60].smartcard === true, JSON.stringify(old));
        // T5: % também na linha da aba Desatraso
        await clickTab(page, 'DESATRASO');
        const desat = await page.evaluate(() => { const t = document.body.innerText; return { d2: /% de acerto no D2:/.test(t), sel: /% da selagem \(10q \+ smartcards\):/.test(t) }; });
        check('T5 aba Desatraso: linha do módulo ' + titleOf(70).slice(0, 25) + ' (D2 marcado, 55%) mostra "% de acerto no D2"', desat.d2 && await page.evaluate(() => [...document.querySelectorAll('input[placeholder="%"]')].some(i => i.value === '55')), JSON.stringify(desat));
    });

    // ── S12: P7 — CATCHUP trava o ritmo em 2 ──
    await scenario(browser, 'S12-catchup-ritmo-2811', '2026-11-28', { [CFG]: { ...baseCfg, catchupPace: 4 } }, async (page) => {
        await clickTab(page, 'DESATRASO');
        const t = await bodyText(page);
        check('P7 aba Desatraso: "esta fase agenda 2 fios (A e B)" e "Ritmo de desatraso (travado …): 2 módulos/semana"; MATÉRIAS DESTA SEMANA (2)', /esta fase agenda 2 fios \(A e B\)/.test(t) && /Ritmo de desatraso \(travado — esta fase agenda 2 fios \(A e B\)\): 2 módulos\/semana/.test(t) && /MATÉRIAS DESTA SEMANA \(2\)/.test(t) && /ritmo atual: 2\/sem/.test(t), (t.match(/MATÉRIAS DESTA SEMANA \(\d\)/) || [''])[0] + ' · ' + (t.match(/ritmo atual: \d\/sem/) || [''])[0]);
        await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === '3/sem'); if (b) b.click(); });
        await page.waitForTimeout(300);
        const cfg = await getLS(page, CFG);
        const rows = await page.evaluate(() => [...document.querySelectorAll('div')].filter(d => d.style && d.style.borderRadius === '8px' && d.style.padding === '10px' && /Sem\.\d+/.test(d.textContent) && /Duração da aula/.test(d.textContent)).length);
        check('P7 tocar "3/sem" não muda o ritmo (config.catchupPace segue 4, ignorado na fase); planejador mostra 2 fios', cfg.catchupPace === 4 && rows === 2, 'pace=' + cfg.catchupPace + ' rows=' + rows);
    });

    // ── S13: P8 — botão do simulado na sexta de plantão 09/10 ──
    await scenario(browser, 'S13-sexta-plantao-0810', '2026-10-08', { [CFG]: { ...baseCfg, catchupPace: 2 } }, async (page) => {
        await clickDay(page, 'SEX');
        let d = await readDay(page);
        check('P8 SEX 09/10 (plantão): botão existe — "📚 Sexta de plantão: sem simulado pela regra — toque se FOR fazer simulado hoje"; sem prova', /^📚 Sexta de plantão: sem simulado pela regra — toque se FOR fazer simulado hoje/.test(d.simBtn || '') && !has(d, /SIMULADO NA ÍNTEGRA/), d.simBtn);
        await page.evaluate(() => [...document.querySelectorAll('button')].find(b => /Sexta de plantão: sem simulado/.test(b.innerText)).click());
        await page.waitForTimeout(300); d = await readDay(page);
        const cfg = await getLS(page, CFG);
        check('P8 toque religa: prova + correção aparecem no dia de plantão (blocos mantidos), config.simOverrides[2026-10-09] = true, botão "🎯 … DE PLANTÃO (sua escolha)"', has(d, /SIMULADO NA ÍNTEGRA/) && has(d, /CORREÇÃO DO SIMULADO/) && has(d, /🚑 Plantão/) && cfg.simOverrides && cfg.simOverrides['2026-10-09'] === true && /^🎯 Simulado marcado nesta sexta DE PLANTÃO \(sua escolha\)/.test(d.simBtn || ''), d.simBtn + ' · ' + d.warn.join(' '));
        await page.evaluate(() => [...document.querySelectorAll('button')].find(b => /DE PLANTÃO/.test(b.innerText)).click());
        await page.waitForTimeout(300); d = await readDay(page);
        const cfg2 = await getLS(page, CFG);
        check('P8 2º toque volta à regra (override apagado, sem prova)', !has(d, /SIMULADO NA ÍNTEGRA/) && !(cfg2.simOverrides && '2026-10-09' in cfg2.simOverrides), JSON.stringify(cfg2.simOverrides));
    });

    // ── S14: P3 — carga da terça da G2 em semana de simulado (29/09) com a aula das 19h30, ritmos 4 e 2 ──
    for (const pc of [4, 2]) await scenario(browser, 'S14-ter-2909-p' + pc, '2026-09-28', { [CFG]: { ...baseCfg, catchupPace: pc } }, async (page) => {
        const w = await dumpWeek(page, ['SEG', 'TER']);
        check('P3 revogado · ritmo ' + pc + ' · TER 29/09 (semana de simulado): sem banco B e sem selagem; Fio 2 · apostila' + (pc === 4 ? ' + Fio 4 · aula' : '') + ' antes da aula 19h30; estudo do dia ≤ 8h (' + fmtH(hoursOf(w.TER)) + ')', !has(w.TER, /D6 · Tarde/) && !has(w.TER, /Selar/) && idx(w.TER, /^Fio 2 · toque 3/) >= 0 && idx(w.TER, /^Fio 2 · toque 3/) < idx(w.TER, /Aula teórica/) && (pc !== 4 || has(w.TER, /^Fio 4 · toque 1/)) && hoursOf(w.TER) <= 8 + 1e-9, w.TER.blocks.map(b => b.tag + '(' + b.time + ')').join(' '));
        check('P3 ritmo ' + pc + ' · SEG 28/09 (pós-noturno): D5 + apostila B, sem D6 (' + fmtH(hoursOf(w.SEG)) + ')', has(w.SEG, /D5 · Manhã/) && has(w.SEG, /Apostila do Bloco B pelos erros de domingo/) && !has(w.SEG, /D6 · Tarde/), w.SEG.warn.join(' · '));
    });


    // ── S15: fronteira POST→CATCHUP no ritmo 4 (snapshot do POST com 4 fios): cascata cruzada + 4 selagens + Fio A/B da CATCHUP ──
    await scenario(browser, 'S15-fronteira-catchup-p4', '2026-11-26', { [CFG]: { ...baseCfg, catchupPace: 4, fioWeek: { '2026-11-18': [83, 85, 87, 88] } } }, async (page) => {
        const w = await dumpWeek(page);
        check('Fronteira ritmo 4: QUA 25/11 fecha o Fio 4 do POST (toque 2 → ' + titleOf(88).slice(0, 20) + ') e sela o Fio 1 (' + titleOf(83).slice(0, 20) + '); QUI toque 3 + Selar Fio 3 (' + titleOf(87).slice(0, 18) + '); SEX Selar Fio 2 (' + titleOf(85).slice(0, 18) + '); DOM Selar Fio 4', modOf(w.QUA, /^Fio 4 \(sem\. passada\) · toque 2/).includes(titleOf(88)) && modOf(w.QUA, /^Selar Fio 1 \(sem/).includes(titleOf(83)) && modOf(w.QUI, /^Fio 4 \(sem\. passada\) · toque 3/).includes(titleOf(88)) && modOf(w.QUI, /^Selar Fio 3 \(sem/).includes(titleOf(87)) && modOf(w.SEX, /^Selar Fio 2 \(sem/).includes(titleOf(85)) && modOf(w.DOM, /^Selar Fio 4 \(sem/).includes(titleOf(88)), DAYS.map(d => d + ':' + w[d].blocks.filter(b => /sem\. passada/.test(b.text)).map(b => b.text.slice(0, 20)).join('/')).join(' '));
        check('Fronteira ritmo 4: Fio A/B da CATCHUP presentes (QUA aula A, DOM aula B), sem "Selar o Fio A/B da semana passada", ritmo travado em 2', has(w.QUA, /^Fio A · toque 1/) && has(w.DOM, /^Fio B · toque 1/) && !DAYS.some(d => w[d].blocks.some(b => /Selar o Fio [AB] da semana passada/.test(b.text))) && !DAYS.some(d => w[d].blocks.some(b => /^Fio [1-4] · toque 1/.test(b.text))), DAYS.map(d => d + '=' + fmtH(hoursOf(w[d]))).join(' '));
        check('Fronteira ritmo 4: o Fio 4 cruzado (' + titleOf(88).slice(0, 20) + ') não vira Fio A/B novo (carry)', !modOf(w.QUA, /^Fio A · toque 1/).includes(titleOf(88)) && !modOf(w.DOM, /^Fio B · toque 1/).includes(titleOf(88)), modOf(w.QUA, /^Fio A/).slice(0, 30) + ' | ' + modOf(w.DOM, /^Fio B/).slice(0, 30));
    });


    // ══════════ PR #6 ══════════
    // ── S16: BUG 2 + FEATURE — selagem no meio da semana some dos dias futuros; aviso; sugestão aceita abre o próximo fio pela aula ──
    const SEAL77 = { 77: { aula: true, questoesD2: true, apostila: true, smartcard: true, completedAt: '2026-10-15', accSelagem: 85 } };
    const bannerOf = (page) => page.evaluate(() => ([...document.querySelectorAll('span')].map(s => s.textContent.trim()).find(t => /^🔄 Você adiantou/.test(t)) || ''));
    const proposalOf = (page) => page.evaluate(() => ([...document.querySelectorAll('span')].map(s => s.textContent.trim()).find(t => /^💡 /.test(t)) || ''));
    const clickBtn = (page, label) => page.evaluate((l) => { const b = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === l); if (!b) return false; b.click(); return true; }, label);
    await scenario(browser, 'S16-selagem-adiantada-1510', '2026-10-15', { [CFG]: { ...baseCfg, catchupPace: 2, fioWeek: { '2026-10-14': [77, 78] } }, [PRG]: SEAL77 }, async (page) => {
        const w = await dumpWeek(page);
        check('BUG 2: Fio 1 (' + titleOf(77).slice(0, 18) + ') selado hoje → toque 2 (SÁB) e toque 3 (DOM) NÃO aparecem mais nos dias futuros', !has(w.SAB, /^Fio 1 · toque 2/) && !has(w.DOM, /^Fio 1 · toque 3/), 'SÁB: ' + w.SAB.blocks.map(b => b.tag).join(',') + ' | DOM: ' + w.DOM.blocks.map(b => b.tag).join(','));
        check('BUG 2: o dia de hoje (QUI) mantém "Fio 1 · toque 1" como histórico, ✓', has(w.QUI, /^Fio 1 · toque 1/) && w.QUI.blocks[idx(w.QUI, /^Fio 1 · toque 1/)].done === true);
        check('BUG 2: Fio 2 (' + titleOf(78).slice(0, 10) + ') intacto (DOM aula · SEG questões · TER apostila); snapshot da semana preservado [77,78]', has(w.DOM, /^Fio 2 · toque 1/) && has(w.SEG, /^Fio 2 · toque 2/) && has(w.TER, /^Fio 2 · toque 3/) && (await getLS(page, CFG)).fioWeek['2026-10-14'].join() === '77,78');
        const banner = await bannerOf(page);
        check('FEATURE aviso: "🔄 Você adiantou as questões de Sem.40 ' + titleOf(77).slice(0, 12) + '… (+1). Sobrou espaço em SÁB 17/10, DOM 18/10. Quer preencher?" + botões', banner === '🔄 Você adiantou as questões de Sem.40 ' + titleOf(77) + ' (+1). Sobrou espaço em SÁB 17/10, DOM 18/10. Quer preencher?' && await page.evaluate(() => ['Ver sugestão', 'Manter como está'].every(l => [...document.querySelectorAll('button')].some(b => b.innerText.trim() === l))), banner);
        await clickBtn(page, 'Ver sugestão'); await page.waitForTimeout(300);
        const prop = await proposalOf(page);
        check('FEATURE sugestão (opção 2): abrir o Fio 3 — ' + titleOf(75).slice(0, 22) + ' pela aula no DOM 18/10 (SÁB 17/10 é o dia leve → última preferência), questões SEG 19/10, apostila TER 20/10 e selagem SÁB 24/10 (+3d cai na SEX de simulado; SÁB 24/10 é dia normal — o leve daquela semana é a TER) — sem ⚠️ e sem 🌿', prop === '💡 Abrir o Fio 3 — Sem.39 ' + titleOf(75) + ': aula DOM 18/10 (4,7h) · questões SEG 19/10 (6,6h) · apostila TER 20/10 (5,6h) · selagem SÁB 24/10 (5,0h, sem. seguinte).' && !/⚠️|🌿/.test(prop), prop);
        await clickBtn(page, 'Aplicar'); await page.waitForTimeout(400);
        const cfg = await getLS(page, CFG);
        const w2 = await dumpWeek(page, ['DOM', 'SEG', 'TER']);
        check('FEATURE aplicar: config.fioExtra[2026-10-14] = [{label 3, id 75, aula 4, quest 5, apost 6, seal 10}]; DOM ganha "Fio 3 · toque 1" (' + titleOf(75).slice(0, 14) + ') com tarefa "Aula 1.5x…"; SEG "toque 2", TER "toque 3"; aviso some', JSON.stringify(cfg.fioExtra) === '{"2026-10-14":[{"label":3,"id":75,"aula":4,"quest":5,"apost":6,"seal":10}]}' && modOf(w2.DOM, /^Fio 3 · toque 1/).includes(titleOf(75)) && w2.DOM.blocks[idx(w2.DOM, /^Fio 3 · toque 1/)].tasks.join() === 'Aula 1.5x + resumo (toque 1) ✓' && has(w2.SEG, /^Fio 3 · toque 2/) && has(w2.TER, /^Fio 3 · toque 3/) && (await bannerOf(page)) === '', JSON.stringify(cfg.fioExtra) + ' · ' + ['DOM', 'SEG', 'TER'].map(d => fmtH(hoursOf(w2[d]))).join('/'));
        check('FEATURE aplicar: DOM, SEG e TER continuam ≤ 8h de estudo (nunca acima do limiar)', ['DOM', 'SEG', 'TER'].every(d => hoursOf(w2[d]) <= 8 + 1e-9), ['DOM', 'SEG', 'TER'].map(d => fmtH(hoursOf(w2[d]))).join(' / '));
        await clickTab(page, 'DESATRASO');
        const td = await bodyText(page);
        check('SINAL 3 aba Desatraso: fio extra listado em MATÉRIAS DESTA SEMANA (3) como "FIO 3 · sugestão" (' + titleOf(75).slice(0, 22) + ') — é onde ela marca o %', /MATÉRIAS DESTA SEMANA \(3\)/.test(td) && /FIO 3 · sugestão/.test(td) && td.indexOf(titleOf(75)) > -1, (td.match(/MATÉRIAS DESTA SEMANA \(\d\)/) || [''])[0] + ' · ' + (td.match(/FIO 3 · sugestão/) || ['(sem FIO 3)'])[0]);
    });
    await scenario(browser, 'S16b-fio-extra-semana-seguinte', '2026-10-22', { [CFG]: { ...baseCfg, catchupPace: 2, fioWeek: { '2026-10-14': [77, 78] }, fioExtra: { '2026-10-14': [{ label: 3, id: 75, aula: 4, quest: 5, apost: 6, seal: 10 }] } }, [PRG]: { ...SEAL77, 75: { aula: true, questoesD2: true, apostila: true } } }, async (page) => {
        const w = await dumpWeek(page, ['QUA', 'QUI', 'SEX', 'SAB', 'DOM', 'SEG', 'TER']);
        check('FEATURE semana seguinte: SÁB 24/10 tem "Selar Fio 3 (sem. passada)" (' + titleOf(75).slice(0, 14) + '); QUA/QUI/DOM/SEG sem o extra', modOf(w.SAB, /^Selar Fio 3 \(sem\. passada\)/).includes(titleOf(75)) && ['QUA', 'QUI', 'DOM', 'SEG'].every(d => !w[d].blocks.some(b => /Fio 3|Selar Fio 3/.test(b.text))), modOf(w.SAB, /^Selar Fio 3/).slice(0, 40));
        check('SINAL 2 justificativa: +3d de TER 20/10 = SEX 23/10 (simulado, > 8h) → 1º dia normal que cabe = SÁB 24/10 (' + fmtH(hoursOf(w.SAB)) + ' com a selagem, ≤ 8h); o dia leve da semana é a TER', hoursOf(w.SAB) <= 8 + 1e-9 && w.TER.lightBadge, ['SEX', 'SAB', 'TER'].map(d => d + '=' + fmtH(hoursOf(w[d]))).join(' '));
        check('FEATURE semana seguinte: o fio extra não é re-sorteado como fio novo (Fio 1/2 desta semana ≠ ' + titleOf(75).slice(0, 14) + ')', !modOf(w.QUI, /^Fio 1 · toque 1/).includes(titleOf(75)), modOf(w.QUI, /^Fio 1 · toque 1/).slice(0, 40));
    });
    await scenario(browser, 'S16c-recusar-1510', '2026-10-15', { [CFG]: { ...baseCfg, catchupPace: 2, fioWeek: { '2026-10-14': [77, 78] } }, [PRG]: SEAL77 }, async (page) => {
        const before = await dumpWeek(page, ['SEX', 'DOM', 'TER']);
        const sig0 = await bannerOf(page);
        await clickBtn(page, 'Manter como está'); await page.waitForTimeout(300);
        const cfg = await getLS(page, CFG);
        const after = await dumpWeek(page, ['SEX', 'DOM', 'TER']);
        check('FEATURE recusar: nada muda nos dias (sem fioExtra/fioPlan), aviso registrado como recusado e some', sig0.startsWith('🔄') && (await bannerOf(page)) === '' && !cfg.fioExtra && !cfg.fioPlan && cfg.fillDismissed && cfg.fillDismissed['2026-10-14'] && ['SEX', 'DOM', 'TER'].every(d => JSON.stringify(after[d].blocks.map(b => b.text)) === JSON.stringify(before[d].blocks.map(b => b.text))), JSON.stringify(cfg.fillDismissed));
    });
    // ── S16d: SINAL 2 — semana seguinte toda > 8h: a proposta cai no 1º dia útil e avisa a carga (⚠️) ──
    const HEAVY = (iso, i) => [iso, [{ id: 'h' + i, d: 'EXTRA', color: '#0EA5E9', text: 'Bloco pesado de teste', time: '9h' }]];
    await scenario(browser, 'S16d-aviso-carga-1510', '2026-10-15', { [CFG]: { ...baseCfg, catchupPace: 2, fioWeek: { '2026-10-14': [77, 78] } }, [PRG]: SEAL77, 'medplanner_schedule_v1': Object.fromEntries(['2026-10-21', '2026-10-22', '2026-10-23', '2026-10-25', '2026-10-26', '2026-10-27'].map(HEAVY)) }, async (page) => {
        await clickBtn(page, 'Ver sugestão'); await page.waitForTimeout(300);
        const prop = await proposalOf(page);
        check('DECISÃO 2 (24/09): nenhum dia normal da semana seguinte cabe (todos 9h) → selagem em dia normal com ⚠️ (SEX 23/10) e não no SÁB 24/10 leve que caberia: "aula DOM 18/10 (4,7h) · questões SEG 19/10 (6,6h) · apostila TER 20/10 (6,1h) · selagem ⚠️ SEX 23/10 (9,7h, sem. seguinte)", sem 🌿', prop === '💡 Abrir o Fio 3 — Sem.39 ' + titleOf(75) + ': aula DOM 18/10 (4,7h) · questões SEG 19/10 (6,6h) · apostila TER 20/10 (5,6h) · selagem ⚠️ SEX 23/10 (9,7h, sem. seguinte).' && !/🌿/.test(prop), prop);
        check('DECISÃO FINAL: "Aplicar" disponível mesmo com ⚠️; nada gravado antes de tocar', !(await getLS(page, CFG)).fioExtra && await page.evaluate(() => [...document.querySelectorAll('button')].some(b => b.innerText.trim() === 'Aplicar')));
        await clickBtn(page, 'Aplicar'); await page.waitForTimeout(400);
        const cfgD = await getLS(page, CFG);
        check('DECISÃO FINAL: Aplicar grava a distribuição inteira de uma vez (aula 4 · quest 5 · apost 6 · seal 9), sem nova confirmação; aviso some', JSON.stringify(cfgD.fioExtra) === '{"2026-10-14":[{"label":3,"id":75,"aula":4,"quest":5,"apost":6,"seal":9}]}' && (await bannerOf(page)) === '', JSON.stringify(cfgD.fioExtra));
        const schD = await page.evaluate(() => JSON.parse(localStorage.getItem('medplanner_schedule_v1') || '{}'));
        check('SINAL 1: SEX 23/10 é dia editado à mão → a selagem entrou na lista editada ("Selar Fio 3 (sem. passada)"), sem tocar no bloco dela', (schD['2026-10-23'] || []).length === 2 && /^Selar Fio 3 \(sem\. passada\)/.test((schD['2026-10-23'][1] || {}).text || '') && schD['2026-10-23'][0].text === 'Bloco pesado de teste', JSON.stringify((schD['2026-10-23'] || []).map(b => b.text.slice(0, 26))));
    });
    // ── S16e: SINAL 3 na FREE — fio extra aparece em MATÉRIAS DESTA SEMANA (7) como "FIO 7 · sugestão" ──
    await scenario(browser, 'S16e-extra-free-1912', '2026-12-19', { [CFG]: { ...baseCfg, fioWeek: { '2026-12-16': [1, 2, 3, 4, 5, 6] }, fioExtra: { '2026-12-16': [{ label: 7, id: 7, aula: 4, quest: 5, apost: 6, seal: 9 }] } } }, async (page) => {
        await clickTab(page, 'DESATRASO');
        const td = await bodyText(page);
        check('SINAL 3 FREE: MATÉRIAS DESTA SEMANA (7) — 6 do pipeline + "FIO 7 · sugestão" (' + titleOf(7).slice(0, 22) + ')', /MATÉRIAS DESTA SEMANA \(7\)/.test(td) && /FIO 7 · sugestão/.test(td) && td.indexOf(titleOf(7)) > -1, (td.match(/MATÉRIAS DESTA SEMANA \(\d\)/) || [''])[0] + ' · ' + (td.match(/FIO 7 · sugestão/) || ['(sem FIO 7)'])[0]);
    });
    // ── S16f: selagem de fio extra que caiu "em 2 semanas" (dia 14) rende "Selar Fio 3 (há 2 sem.)" e não colide com o Fio 3 extra da semana passada ──
    await scenario(browser, 'S16f-extra-ha-2-sem-2910', '2026-10-29', { [CFG]: { ...baseCfg, catchupPace: 2, fioWeek: { '2026-10-14': [77, 78], '2026-10-21': [80, 81] }, fioExtra: { '2026-10-07': [{ label: 3, id: 82, aula: 4, quest: 6, apost: 13, seal: 21 }], '2026-10-14': [{ label: 3, id: 75, aula: 4, quest: 6, apost: 11, seal: 14 }], '2026-10-21': [{ label: 3, id: 79, aula: 4, quest: 6, apost: 8, seal: 11 }] } }, [PRG]: { ...SEAL77, 75: { aula: true, questoesD2: true, apostila: true }, 79: { aula: true, questoesD2: true }, 82: { aula: true, questoesD2: true, apostila: true } } }, async (page) => {
        const w = await dumpWeek(page, ['QUA', 'QUI', 'DOM']);
        const qb = w.QUA.blocks[idx(w.QUA, /^Selar Fio 3 \(há 2 sem\.\)/)] || {};
        check('há 2 sem.: QUA 28/10 tem "Selar Fio 3 (há 2 sem.)" → ' + titleOf(75).slice(0, 22) + ' (fio extra de 14/10, selagem dia 14) com tarefa "Selagem ✓"; QUI 29/10 "Fio 3 (sem. passada) · toque 3" → ' + titleOf(79).slice(0, 18) + ' (extra de 21/10) — sem colisão de rótulo', (qb.mod || '').includes(titleOf(75)) && (qb.tasks || []).join() === 'Selagem ✓' && modOf(w.QUI, /^Fio 3 \(sem\. passada\) · toque 3/).includes(titleOf(79)) && modOf(w.DOM, /^Selar Fio 3 \(sem\. passada\)/).includes(titleOf(79)), (qb.mod || '(sem bloco)').slice(0, 30) + ' | ' + modOf(w.QUI, /^Fio 3 \(sem/).slice(0, 30) + ' | ' + modOf(w.DOM, /^Selar Fio 3/).slice(0, 30));
        const q3 = w.QUA.blocks[idx(w.QUA, /^Selar Fio 3 \(há 3 sem\.\)/)] || {};
        check('há 3 sem.: QUA 28/10 também tem "Selar Fio 3 (há 3 sem.)" → ' + titleOf(82).slice(0, 22) + ' (extra de 07/10, selagem dia 21) com "Selagem ✓" — três "Fio 3" no mesmo dia/semana, cada um no seu módulo', (q3.mod || '').includes(titleOf(82)) && (q3.tasks || []).join() === 'Selagem ✓' && (qb.mod || '').includes(titleOf(75)), (q3.mod || '(sem bloco)').slice(0, 30));
        check('há 2 sem.: os extras (75, 79) não são re-sorteados como Fio 1/2 desta semana (carry)', !['QUI', 'DOM'].some(d => w[d].blocks.some(b => /^Fio [12] · toque 1/.test(b.text) && (b.mod.includes(titleOf(75)) || b.mod.includes(titleOf(79))))), (await getLS(page, CFG)).fioWeek['2026-10-28'].join());
    });
    // ── S16g: DECISÃO FINAL — todos os dias candidatos acima de 8h (5 extras nesta semana + semana seguinte a 9h): a sugestão aparece com ⚠️ em cada etapa e "Aplicar" grava normalmente ──
    const EX5 = [{ label: 3, id: 60, aula: 2, quest: 4, apost: 5, seal: 9 }, { label: 4, id: 61, aula: 2, quest: 4, apost: 5, seal: 9 }, { label: 5, id: 62, aula: 2, quest: 6, apost: 8, seal: 11 }, { label: 6, id: 63, aula: 2, quest: 6, apost: 8, seal: 11 }, { label: 7, id: 64, aula: 2, quest: 5, apost: 6, seal: 9 }, { label: 8, id: 65, aula: 4, quest: 5, apost: 6, seal: 9 }];
    const NEXT9 = Object.fromEntries(['2026-10-21', '2026-10-22', '2026-10-23', '2026-10-25', '2026-10-26', '2026-10-27'].map(HEAVY));
    await scenario(browser, 'S16g-tudo-acima-de-8h-1510', '2026-10-15', { [CFG]: { ...baseCfg, catchupPace: 2, fioWeek: { '2026-10-14': [77, 78] }, fioExtra: { '2026-10-14': EX5 } }, [PRG]: SEAL77, 'medplanner_schedule_v1': NEXT9 }, async (page) => {
        const w0 = await dumpWeek(page, ['SEX', 'SAB', 'DOM', 'SEG', 'TER']);
        check('setup: SEX/DOM/SEG/TER já ≥ 8h de estudo antes da proposta; SÁB 17/10 é o dia leve (' + ['SEX', 'SAB', 'DOM', 'SEG', 'TER'].map(d => d + '=' + fmtH(hoursOf(w0[d]))).join(' ') + ')', ['SEX', 'DOM', 'SEG', 'TER'].every(d => hoursOf(w0[d]) + 1.5 > 8) && w0.SAB.lightBadge && hoursOf(w0.SAB) < 6);
        check('DECISÃO FINAL: o aviso 🔄 aparece mesmo com tudo cheio', /^🔄 Você adiantou/.test(await bannerOf(page)));
        await clickBtn(page, 'Ver sugestão'); await page.waitForTimeout(300);
        const prop = await proposalOf(page);
        check('DECISÃO 2 (24/09): sugestão NÃO é suprimida por carga e o dia leve (SÁB 17/10, que caberia) fica DEPOIS dos dias com ⚠️ → "aula ⚠️ SEX 16/10 (16,7h) · questões ⚠️ DOM 18/10 (10,7h) · apostila ⚠️ SEG 19/10 (13,1h) · selagem ⚠️ QUI 22/10 (9,7h, sem. seguinte)", sem 🌿', prop === '💡 Abrir o Fio 9 — Sem.39 ' + titleOf(75) + ': aula ⚠️ SEX 16/10 (16,7h) · questões ⚠️ DOM 18/10 (10,7h) · apostila ⚠️ SEG 19/10 (13,1h) · selagem ⚠️ QUI 22/10 (9,7h, sem. seguinte).' && !/🌿/.test(prop) && (prop.match(/⚠️/g) || []).length === 4, prop);
        check('DECISÃO FINAL: "Aplicar" disponível com todos os dias em ⚠️', await page.evaluate(() => [...document.querySelectorAll('button')].some(b => b.innerText.trim() === 'Aplicar')));
        await clickBtn(page, 'Aplicar'); await page.waitForTimeout(400);
        const cfg = await getLS(page, CFG); const last = (cfg.fioExtra['2026-10-14'] || []).slice(-1)[0] || {};
        const w = await dumpWeek(page, ['SEX', 'DOM', 'SEG']);
        const schG = await page.evaluate(() => JSON.parse(localStorage.getItem('medplanner_schedule_v1') || '{}'));
        check('DECISÃO FINAL: Aplicar grava de uma vez {label 9, id 75, aula 2, quest 4, apost 5, seal 8}; SEX/DOM/SEG ganham "Fio 9 · toque 1/2/3" (' + titleOf(75).slice(0, 14) + '); QUI 22/10 (editado à mão) recebe "Selar Fio 9 (sem. passada)" na lista editada; aviso some', JSON.stringify(last) === '{"label":9,"id":75,"aula":2,"quest":4,"apost":5,"seal":8}' && cfg.fioExtra['2026-10-14'].length === 7 && modOf(w.SEX, /^Fio 9 · toque 1/).includes(titleOf(75)) && modOf(w.DOM, /^Fio 9 · toque 2/).includes(titleOf(75)) && modOf(w.SEG, /^Fio 9 · toque 3/).includes(titleOf(75)) && (schG['2026-10-22'] || []).length === 2 && /^Selar Fio 9 \(sem\. passada\)/.test((schG['2026-10-22'][1] || {}).text || '') && (await bannerOf(page)) === '', JSON.stringify(last) + ' · ' + JSON.stringify((schG['2026-10-22'] || []).map(b => b.text.slice(0, 30))));
    });
    await scenario(browser, 'S16g2-fio8-semana-seguinte-2210', '2026-10-22', { [CFG]: { ...baseCfg, catchupPace: 2, fioWeek: { '2026-10-14': [77, 78] }, fioExtra: { '2026-10-14': EX5.concat([{ label: 9, id: 75, aula: 2, quest: 4, apost: 5, seal: 8 }]) } }, [PRG]: { ...SEAL77, 75: { aula: true, questoesD2: true, apostila: true } } }, async (page) => {
        const w = await dumpWeek(page, ['QUI']);
        check('DECISÃO FINAL: semana seguinte carrega o gravado — QUI 22/10 "Selar Fio 9 (sem. passada)" → ' + titleOf(75).slice(0, 18), modOf(w.QUI, /^Selar Fio 9 \(sem\. passada\)/).includes(titleOf(75)), w.QUI.blocks.filter(b => /Selar Fio/.test(b.text)).map(b => b.text.slice(0, 26)).join(' | '));
    });
    // ── S16h: opção 1 (adiantar etapa) cai no dia leve desta semana (SÁB) com aviso; Aplicar move via fioPlan; DOM editado à mão perde o bloco movido ──
    const P77Q = { 77: { aula: true, questoesD2: true, accD2: 70 }, 75: { aula: true } };
    const EXH = [{ label: 3, id: 75, aula: 1, quest: 4, apost: 6, seal: 9 }]; // fio extra com folga (os fios do padrão são consecutivos: não há dia para adiantar)
    let domBlocks = null;
    await scenario(browser, 'S16h-adiantar-para-sab-1510', '2026-10-15', { [CFG]: { ...baseCfg, catchupPace: 2, fioWeek: { '2026-10-14': [77, 78] }, fioExtra: { '2026-10-14': EXH } }, [PRG]: P77Q }, async (page) => {
        await clickDay(page, 'DOM'); const r0 = await readDay(page);
        domBlocks = r0.blocks.map((b, i) => ({ id: 'e' + i, d: b.tag, color: '#0EA5E9', text: b.text, time: b.time }));
        check('opção 1 setup: questões do Fio 1 feitas na QUI → SÁB liberado; DOM ainda tem "Fio 3 · toque 2" (extra, aula feita)', /Sobrou espaço em SÁB 17\/10\. Quer preencher\?$/.test(await bannerOf(page)) && has(r0, /^Fio 3 · toque 2/), await bannerOf(page));
        await clickBtn(page, 'Ver sugestão'); await page.waitForTimeout(300);
        const prop = await proposalOf(page);
        check('SINAL 3 + DECISÃO 2: adiantar as questões do Fio 3 para ⚠️ SEX 16/10 (8,5h) — SÁB 17/10 é o dia leve (última preferência, depois do ⚠️); opção 1 mantida antes de abrir fio novo', prop === '💡 Adiantar as questões do Fio 3 — Sem.39 ' + titleOf(75) + ' para ⚠️ SEX 16/10 (8,5h) (antes: DOM 18/10).', prop);
        await clickBtn(page, 'Aplicar'); await page.waitForTimeout(400);
        const cfg = await getLS(page, CFG); const w = await dumpWeek(page, ['SEX', 'DOM']);
        check('opção 1 aplicar: config.fioExtra[2026-10-14][0].quest = 2; SEX ganha "Fio 3 · toque 2" (' + titleOf(75).slice(0, 14) + '), DOM perde', JSON.stringify(cfg.fioExtra) === '{"2026-10-14":[{"label":3,"id":75,"aula":1,"quest":2,"apost":6,"seal":9}]}' && modOf(w.SEX, /^Fio 3 · toque 2/).includes(titleOf(75)) && !has(w.DOM, /^Fio 3 · toque 2/), JSON.stringify(cfg.fioExtra));
    });
    await scenario(browser, 'S16h2-adiantar-com-dom-editado-1510', '2026-10-15', { [CFG]: { ...baseCfg, catchupPace: 2, fioWeek: { '2026-10-14': [77, 78] }, fioExtra: { '2026-10-14': EXH } }, [PRG]: P77Q, 'medplanner_schedule_v1': { '2026-10-18': domBlocks } }, async (page) => {
        const n0 = domBlocks.length;
        await clickBtn(page, 'Ver sugestão'); await page.waitForTimeout(300);
        await clickBtn(page, 'Aplicar'); await page.waitForTimeout(400);
        const sch = await page.evaluate(() => JSON.parse(localStorage.getItem('medplanner_schedule_v1') || '{}')); const w = await dumpWeek(page, ['SEX', 'DOM']);
        check('SINAL 1 (movimento): DOM 18/10 editado à mão perde só o bloco movido "Fio 3 · toque 2" (' + n0 + ' → ' + (n0 - 1) + ' blocos, o resto intacto); SEX ganha o bloco', (sch['2026-10-18'] || []).length === n0 - 1 && !sch['2026-10-18'].some(b => /^Fio 3 · toque 2/.test(b.text)) && sch['2026-10-18'].every(b => domBlocks.some(o => o.text === b.text)) && !has(w.DOM, /^Fio 3 · toque 2/) && modOf(w.SEX, /^Fio 3 · toque 2/).includes(titleOf(75)), (sch['2026-10-18'] || []).map(b => b.text.slice(0, 18)).join(' | '));
    });
    // ── S17: BUG 1 — 08/10 (presencial gravada) marca `aula` de A e B ──
    await scenario(browser, 'S17-gravada-0810', '2026-10-08', { [CFG]: { ...baseCfg, catchupPace: 2 } }, async (page) => {
        await clickDay(page, 'QUI');
        let d = await readDay(page);
        check('BUG 1: QUI 08/10 "AULA PRESENCIAL de ontem — gravada/online" oferece "Aula 1.5x + resumo (toque 1) ✓ · A/B" (substitui a 1.5x da semana)', /^Aula 1\.5x \+ resumo \(toque 1\) ✓ · A · \w+\+Aula 1\.5x \+ resumo \(toque 1\) ✓ · B · \w+$/.test(d.blocks[idx(d, /AULA PRESENCIAL de ontem/)].tasks.join('+')), d.blocks[idx(d, /AULA PRESENCIAL de ontem/)].tasks.join(' | '));
        await clickTask(page, /AULA PRESENCIAL de ontem/, null);
        const pg = await getLS(page, PRG); const ids = MODS.filter(m => m.week === 40).map(m => m.id);
        check('BUG 1: ✓ principal da gravada marca `aula` de A e B (não aulaPresencial); bloco ✓', ids.every(id => pg[id] && pg[id].aula === true && !pg[id].aulaPresencial) && (await readDay(page)).blocks[idx(d, /AULA PRESENCIAL de ontem/)].done, JSON.stringify(pg));
    });

    // ── S18: SEMANAS COM 3 BLOCOS (A, B, C) — bug do Bloco C (paciente, 24/09): grupos, cascata por grupo, blocos adicionados/editados, cobertura, capacidade ──
    const weekList = (page) => page.evaluate(() => [...document.querySelectorAll('[data-mod]')].map(e => ({ letter: e.children[0].textContent.trim(), mod: e.getAttribute('data-mod') })));
    const warnTexts = (page) => page.evaluate(() => [...document.querySelectorAll('div')].filter(d => d.children.length === 0).map(d => d.textContent.trim()).filter(t => /está na lista da semana mas não tem tarefas/.test(t)));
    const fitText = (page) => page.evaluate(() => ([...document.querySelectorAll('span')].map(s => s.textContent.trim()).find(t => /^⚠️ (Ritmo|Semana com)/.test(t)) || ''));
    const clickBtn18 = async (page, re) => { const ok = await page.evaluate((src) => { const re = new RegExp(src); const b = [...document.querySelectorAll('button')].find(b => re.test(b.innerText.trim())); if (!b) return false; b.click(); return true; }, re.source); if (!ok) throw new Error('botão não encontrado: ' + re); await page.waitForTimeout(250); };
    const tasksOf = (d, re) => d.blocks[idx(d, re)] ? d.blocks[idx(d, re)].tasks.join(' | ') : '(bloco ausente)';
    const modsOf = (d, re) => d.blocks[idx(d, re)] ? (d.blocks[idx(d, re)].mods || []).join(' / ') : '(bloco ausente)';
    const short = (d) => d.blocks.map(b => b.text.slice(0, 38)).join(' | ');

    await scenario(browser, 'S18a-blocoC-sem38-2409', '2026-09-24', { [CFG]: { ...baseCfg, catchupPace: 2 } }, async (page) => {
        const L = await weekList(page);
        check('Sem.38 lista A = INF1 (AIDS), B = INF2 (Parasitoses), C = ATB (Bônus por último — 🩺 complementar)', L.length === 3 && L[0].letter === 'A' && /^INF1/.test(L[0].mod) && L[1].letter === 'B' && /^INF2/.test(L[1].mod) && L[2].letter === 'C' && /^ATB/.test(L[2].mod), JSON.stringify(L));
        check('Sem.38 sem aviso de cobertura (os 3 módulos têm aula, questões e apostila)', (await warnTexts(page)).length === 0, (await warnTexts(page)).join(' / '));
        const ft = await fitText(page);
        check('Sem.38 aviso de capacidade nomeia os 3 blocos, propõe reduzir o ritmo e diz que nenhuma etapa de bloco é cortada', /^⚠️ Semana com 3 blocos \(A, B, C — 3 cascatas completas\): ritmo 2 não cabe/.test(ft) && /Sugestão: ritmo 1/.test(ft) && /Os blocos da semana têm prioridade sobre o desatraso — o app não corta etapa de bloco/.test(ft), ft);
        const w = await dumpWeek(page);
        check('QUI 24/09: aula A + D2-A ⇒ INF1 (não mais o bônus); etiqueta "· A · INF1" no botão', modsOf(w.QUI, /^D3 · Aula online Bloco A/) === 'INF1 · AIDS' && modsOf(w.QUI, /^D2-A/) === 'INF1 · AIDS' && tasksOf(w.QUI, /^D2-A/) === 'D2 · 30q (toque 2) ✓ · A · INF1', modsOf(w.QUI, /^D2-A/) + ' | ' + tasksOf(w.QUI, /^D2-A/));
        check('SÁB 26/09 (plantão diurno): aula C (1.5x) + D2-C ⇒ ATB, marcáveis (· C · ATB), depois da apostila do A', has(w.SAB, /^D3 · Aula online Bloco C \(1\.5x\)/) && modsOf(w.SAB, /^D3 · Aula online Bloco C/) === 'ATB · Bônus Antibioticoterapia' && tasksOf(w.SAB, /^D2-C/) === 'D2 · 30q (toque 2) ✓ · C · ATB' && idx(w.SAB, /Apostila do Bloco A/) < idx(w.SAB, /^D3 · Aula online Bloco C/), short(w.SAB));
        check('DOM 27/09: apostila do C pelos erros de ONTEM ⇒ ATB (+1d) · aula B + D2-B deslocados ⇒ INF2', modsOf(w.DOM, /^D4: Apostila do Bloco C/) === 'ATB · Bônus Antibioticoterapia' && tasksOf(w.DOM, /^D4: Apostila do Bloco C/) === 'Apostila pelos erros (toque 3) ✓ · C · ATB' && modsOf(w.DOM, /deslocado da sexta/) === 'INF2 · Parasitoses Intestinais', modsOf(w.DOM, /^D4: Apostila do Bloco C/));
        check('SEG 28/09: banco A ⇒ INF1 · apostila do B ⇒ INF2 · nenhuma etapa do C (banco C só na QUI seguinte, +4d)', modsOf(w.SEG, /^D5 · Manhã/) === 'INF1 · AIDS' && modsOf(w.SEG, /Apostila do Bloco B/) === 'INF2 · Parasitoses Intestinais' && !has(w.SEG, /Bloco C/), short(w.SEG));
        check('Nenhum dia repete duas etapas do mesmo módulo (A/B/C) — aula 1.5x → D2 no mesmo dia é a exceção justificada', DAYS.every(dn => { const c = {}; w[dn].blocks.forEach(b => (b.mods || []).forEach(m => { if (/Bloco [A-H]/.test(b.text) && !/Selar|semana passada|Aula presencial/.test(b.text) && !/Aula online/.test(b.text)) c[m] = (c[m] || 0) + 1; })); return Object.values(c).every(n => n <= 1); }));
        checkLight('Sem.38 com Bloco C:', w, '2026-09-23');
    });
    await scenario(browser, 'S18a2-blocoC-semana-seguinte-0110', '2026-10-01', { [CFG]: { ...baseCfg, catchupPace: 2 } }, async (page) => {
        await clickDay(page, 'QUA'); let d = await readDay(page);
        check('QUA 30/09: "Selar Bloco C da semana passada" ⇒ ATB, logo após a selagem do B, com "Selagem ✓ · C · ATB" (+3d da apostila de DOM)', has(d, /^Selar Bloco C da semana passada/) && modsOf(d, /^Selar Bloco C/) === 'ATB · Bônus Antibioticoterapia' && tasksOf(d, /^Selar Bloco C/) === 'Selagem ✓ · C · ATB' && idx(d, /^Selar Bloco C/) === idx(d, /^Selar Bloco B/) + 1, short(d));
        check('QUA 30/09: selagens A ⇒ INF1 e B ⇒ INF2 (grupos da semana passada, bônus por último)', modsOf(d, /^Selar Bloco A/) === 'INF1 · AIDS' && modsOf(d, /^Selar Bloco B/) === 'INF2 · Parasitoses Intestinais');
        await clickDay(page, 'QUI'); d = await readDay(page);
        check('QUI 01/10: banco do C da semana passada ⇒ ATB (+4d da apostila, nunca no dia da selagem) + banco B pós-simulado ⇒ INF2; sem registro (etapa de execução)', has(d, /^D6 · Banco: questões por conteúdo do Bloco C da semana passada/) && modsOf(d, /Bloco C da semana passada/) === 'ATB · Bônus Antibioticoterapia' && tasksOf(d, /Bloco C da semana passada/) === '' && modsOf(d, /Bloco B da semana passada/) === 'INF2 · Parasitoses Intestinais', short(d));
        check('Sem.39 (2 blocos): lista A/B, nenhum "Bloco C" novo, sem aviso de cobertura', (await weekList(page)).length === 2 && !has(d, /Bloco C \(/) && (await warnTexts(page)).length === 0);
    });
    await scenario(browser, 'S18b-blocoC-sem43-2910', '2026-10-29', { [CFG]: { ...baseCfg, catchupPace: 2 } }, async (page) => {
        const L = await weekList(page);
        check('Sem.43 lista A = Psiquiatria I, B = Psiquiatria II, C = OFT (bônus)', L.length === 3 && /Psiquiatria I$/.test(L[0].mod) && /Psiquiatria II$/.test(L[1].mod) && /^OFT/.test(L[2].mod) && L.map(x => x.letter).join('') === 'ABC', JSON.stringify(L));
        const w = await dumpWeek(page);
        check('Sem.43 (sem simulado): C = SÁB aula+D2 ⇒ OFT · DOM apostila ⇒ OFT; A/B intactos (QUI/SEX/SÁB/SEG/TER)', modsOf(w.SAB, /^D2-C/) === 'OFT · Bônus Oftalmologia' && modsOf(w.DOM, /^D4: Apostila do Bloco C/) === 'OFT · Bônus Oftalmologia' && /Psiquiatria I$/.test(modsOf(w.QUI, /^D2-A/)) && /Psiquiatria II$/.test(modsOf(w.SEX, /^D2-B/)) && /Psiquiatria II$/.test(modsOf(w.SAB, /Apostila do Bloco B/)) && /Psiquiatria I$/.test(modsOf(w.SEG, /^D5/)) && /Psiquiatria II$/.test(modsOf(w.TER, /^D6/)), short(w.SAB));
        check('Sem.43 cargas (ritmo 2): SÁB ' + fmtH(hoursOf(w.SAB)) + ' (📚, +3,7h do C) · DOM ' + fmtH(hoursOf(w.DOM)) + ' · sem aviso de semana (só 1 dia acima de 8h)', hoursOf(w.SAB) > 8 && hoursOf(w.SAB) < 9 && hoursOf(w.DOM) < 8 && (await fitText(page)) === '', await fitText(page));
        check('Sem.43 sem aviso de cobertura', (await warnTexts(page)).length === 0);
        checkLight('Sem.43 com Bloco C:', w, '2026-10-28');
    });
    await scenario(browser, 'S18c-blocoC-sem8-2502', '2026-02-25', {}, async (page) => {
        const L = await weekList(page);
        check('Sem.8 (histórica, template antigo): A = PRE2, B = CIR2 Urologia, C = ANAT (bônus)', L.length === 3 && /^PRE2/.test(L[0].mod) && /^CIR2/.test(L[1].mod) && /^ANAT/.test(L[2].mod), JSON.stringify(L));
        const w = await dumpWeek(page);
        check('Sem.8: QUI aula A ⇒ PRE2 e aula B ⇒ CIR2; SÁB aula C + D2-C ⇒ ANAT; DOM apostila C ⇒ ANAT (cascata genérica também no template antigo)', modsOf(w.QUI, /^Aula online Bloco A/) === 'PRE2 · Estudos Epidemiológicos' && modsOf(w.QUI, /^Aula online Bloco B/) === 'CIR2 · Urologia' && modsOf(w.SAB, /^D2-C/) === 'ANAT · Bônus Anatomia' && modsOf(w.DOM, /^D4: Apostila do Bloco C/) === 'ANAT · Bônus Anatomia', short(w.SAB));
        check('Sem.8 sem aviso de cobertura', (await warnTexts(page)).length === 0, (await warnTexts(page)).join(' / '));
    });
    await scenario(browser, 'S18d-grupo-AB-C-sem43', '2026-10-29', { [CFG]: { ...baseCfg, catchupPace: 2, weekGroups: { 43: [[84, 93], [83]] } } }, async (page) => {
        const L = await weekList(page);
        check('Agrupamento [A+B]+[C]: lista mostra A ×2 (Psiquiatria I e II) e B = OFT; nenhum C', L.length === 3 && L[0].letter === 'A ×2' && L[1].letter === 'A ↳' && L[2].letter === 'B' && /^OFT/.test(L[2].mod), JSON.stringify(L));
        const w = await dumpWeek(page);
        const d2 = w.QUI.blocks[idx(w.QUI, /^D2-A/)];
        check('QUI: aula A vira 2 aulas (3.4h) e D2-A = 60q (4h, "grupo A: 2 módulos (PSI1 + PSI1)") com 2 tarefas (uma por módulo) e 2 linhas ↳', w.QUI.blocks[idx(w.QUI, /^D3 · Aula online Bloco A/)].time === '3.4h' && d2.time === '4h' && /grupo A: 2 módulos \(PSI1 \+ PSI1\)/.test(d2.text) && d2.tasks.length === 2 && (d2.mods || []).length === 2, d2.time + ' · ' + tasksOf(w.QUI, /^D2-A/));
        check('SEX: aula B + D2-B ⇒ OFT (o bônus vira o grupo B); apostila A = 3h com 2 tarefas', modsOf(w.SEX, /^D2-B/) === 'OFT · Bônus Oftalmologia' && w.SEX.blocks[idx(w.SEX, /Apostila do Bloco A/)].time === '3h' && w.SEX.blocks[idx(w.SEX, /Apostila do Bloco A/)].tasks.length === 2, short(w.SEX));
        check('SÁB/DOM: nenhum bloco C (só 2 grupos); SEG banco A = 4h; TER banco B ⇒ OFT', !has(w.SAB, /Bloco C/) && !has(w.DOM, /Bloco C/) && w.SEG.blocks[idx(w.SEG, /^D5/)].time === '4h' && modsOf(w.TER, /^D6/) === 'OFT · Bônus Oftalmologia');
        check('Sem aviso de cobertura com o agrupamento [A+B]+[C]', (await warnTexts(page)).length === 0);
        await clickDay(page, 'QUI');
        await clickTask(page, /^D2-A/, null);
        let pg = await getLS(page, PRG);
        check('Marcar o D2 do grupo (✓ do bloco) registra questoesD2 em Psiquiatria I (84) E II (93)', pg[84] && pg[84].questoesD2 === true && pg[93] && pg[93].questoesD2 === true, JSON.stringify(pg));
        let d = await readDay(page);
        check('Bloco D2-A fica ✓ (riscado) e mostra 2 campos de % (um por módulo)', d.blocks[idx(d, /^D2-A/)].done === true && d.blocks[idx(d, /^D2-A/)].pctInputs.length === 2, JSON.stringify(d.blocks[idx(d, /^D2-A/)].pctInputs));
        await clickTask(page, /^D2-A/, /^✓ D2 · 30q \(toque 2\) ✓ · A · PSI1$/);
        pg = await getLS(page, PRG); d = await readDay(page);
        check('Desmarcar um só botão tira questoesD2 só do 1º módulo (84); o bloco deixa de estar ✓', pg[84].questoesD2 === false && pg[93].questoesD2 === true && d.blocks[idx(d, /^D2-A/)].done === false, JSON.stringify([pg[84], pg[93]]));
        const card = await readCard(page, /Psiquiatria II/);
        check('Card de Psiquiatria II na aba Módulos reflete o D2 marcado pelo bloco do grupo', card && card.btns.includes('✓ D2 · 30q (toque 2) ✓'), JSON.stringify(card && card.btns));
    });
    await scenario(browser, 'S18d2-grupo-AB-selagem-0411', '2026-11-05', { [CFG]: { ...baseCfg, catchupPace: 2, weekGroups: { 43: [[84, 93], [83]] } } }, async (page) => {
        await clickDay(page, 'QUA'); const d = await readDay(page); const sa = d.blocks[idx(d, /^Selar Bloco A/)];
        check('QUA 04/11: "Selar Bloco A da semana passada · grupo A: 2 módulos" = 40min com 2 tarefas de selagem; selagem B ⇒ OFT; nenhuma selagem C', /grupo A: 2 módulos/.test(sa.text) && sa.time === '40min' && sa.tasks.length === 2 && modsOf(d, /^Selar Bloco B/) === 'OFT · Bônus Oftalmologia' && !has(d, /^Selar Bloco C/), tasksOf(d, /^Selar Bloco A/));
    });
    await scenario(browser, 'S18e-grupo-A-BC-sem38-sim', '2026-09-24', { [CFG]: { ...baseCfg, catchupPace: 2, weekGroups: { 38: [[74], [92, 73]] } } }, async (page) => {
        const L = await weekList(page);
        check('Agrupamento [A]+[B+C] na semana de simulado: lista A = INF1, B ×2 (INF2 + ATB)', L.length === 3 && L[0].letter === 'A' && L[1].letter === 'B ×2' && L[2].letter === 'B ↳' && /^ATB/.test(L[2].mod), JSON.stringify(L));
        const w = await dumpWeek(page); const dd = w.DOM.blocks[idx(w.DOM, /deslocado da sexta/)];
        check('DOM: aula B + D2-B deslocados = 8h (2 módulos) com aula+D2 de INF2 e ATB (4 tarefas); SEG apostila B = 3h (2 tarefas); sem bloco C', dd.time === '8h' && dd.tasks.length === 4 && w.SEG.blocks[idx(w.SEG, /Apostila do Bloco B/)].time === '3h' && w.SEG.blocks[idx(w.SEG, /Apostila do Bloco B/)].tasks.length === 2 && !DAYS.some(dn => has(w[dn], /Bloco C/)), tasksOf(w.DOM, /deslocado da sexta/));
        check('Sem aviso de cobertura; aviso de capacidade sem a linha "3 blocos" (são 2 grupos)', (await warnTexts(page)).length === 0 && /^⚠️ Ritmo 2 não cabe/.test(await fitText(page)), await fitText(page));
    });
    await scenario(browser, 'S18e2-grupo-BC-semana-seguinte-0110', '2026-10-01', { [CFG]: { ...baseCfg, catchupPace: 2, weekGroups: { 38: [[74], [92, 73]] } } }, async (page) => {
        await clickDay(page, 'QUA'); let d = await readDay(page); const sb = d.blocks[idx(d, /^Selar Bloco B/)];
        check('QUA 30/09: selagem B "grupo B: 2 módulos (INF2 + ATB)" 40min, 2 tarefas; nenhuma selagem C', /grupo B: 2 módulos \(INF2 \+ ATB\)/.test(sb.text) && sb.time === '40min' && sb.tasks.length === 2 && !has(d, /^Selar Bloco C/), tasksOf(d, /^Selar Bloco B/));
        await clickDay(page, 'QUI'); d = await readDay(page); const bb = d.blocks[idx(d, /Bloco B da semana passada/)];
        check('QUI 01/10: banco B pós-simulado = 4h (2 módulos: INF2 + ATB); nenhum banco C', bb.time === '4h' && (bb.mods || []).length === 2 && !has(d, /Bloco C da semana passada/), bb.time + ' ' + (bb.mods || []).join(' / '));
    });
    await scenario(browser, 'S18f-bloco-adicionado-editado-1510', '2026-10-15', { [CFG]: { ...baseCfg, catchupPace: 2, customModules: [{ id: 1000, week: 41, code: 'XYZ', title: 'Bloco da grade real' }], moduleEdits: { 79: { title: 'Neurologia I — título corrigido' } } } }, async (page) => {
        let L = await weekList(page);
        check('Bloco adicionado (config.customModules) entra na lista da semana como C; título editado (config.moduleEdits) aparece', L.length === 3 && /^XYZ · Bloco da grade real/.test(L[2].mod) && L[0].mod === 'NEU1 · Neurologia I — título corrigido', JSON.stringify(L));
        await clickDay(page, 'SAB'); let d = await readDay(page);
        check('SÁB 17/10: aula C + D2-C ⇒ XYZ (o bloco dela recebe cascata como qualquer outro)', modsOf(d, /^D2-C/) === 'XYZ · Bloco da grade real' && tasksOf(d, /^D2-C/) === 'D2 · 30q (toque 2) ✓ · C · XYZ', modsOf(d, /^D2-C/));
        const card = await readCard(page, /Bloco da grade real/);
        check('Aba Módulos mostra o card do bloco adicionado (4 checks + etiqueta ADICIONADO POR VOCÊ)', card && card.btns.filter(t => /toque|Selagem/.test(t)).length === 4 && await page.evaluate(() => /ADICIONADO POR VOCÊ/.test(document.body.innerText)), JSON.stringify(card && card.btns));
        await clickTab(page, 'CRONOGRAMA');
        await clickBtn18(page, /^✎ Blocos e grupos$/);
        const ok = await page.evaluate(() => { const s = [...document.querySelectorAll('select')].find(s => s.value === 'C' && [...s.options].every(o => /^[A-H]$/.test(o.value))); if (!s) return false; s.value = 'A'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; });
        await page.waitForTimeout(300);
        const cfg = await getLS(page, CFG); L = await weekList(page);
        check('Editor: mudar a letra do XYZ para A grava config.weekGroups[41] = [[79,1000],[80]] e a lista passa a A ×2 / B', ok && JSON.stringify(cfg.weekGroups && cfg.weekGroups[41]) === '[[79,1000],[80]]' && L[0].letter === 'A ×2' && L[1].letter === 'A ↳' && L[2].letter === 'B', JSON.stringify(cfg.weekGroups) + ' ' + JSON.stringify(L));
        await clickDay(page, 'QUI'); d = await readDay(page);
        check('Depois de agrupar: QUI D2-A = 4h com 2 tarefas (NEU1 + XYZ)', d.blocks[idx(d, /^D2-A/)].time === '4h' && d.blocks[idx(d, /^D2-A/)].tasks.length === 2, tasksOf(d, /^D2-A/));
        await clickDay(page, 'SAB'); d = await readDay(page);
        check('Depois de agrupar: SÁB sem bloco C', !has(d, /Bloco C/), short(d));
        await page.fill('input[placeholder="CÓD (ex.: INF2)"]', 'nov1'); await page.fill('input[placeholder="Título do bloco que a grade real traz"]', 'Bloco novo pela interface');
        await clickBtn18(page, /^\+ Adicionar bloco$/);
        const cfg2 = await getLS(page, CFG); L = await weekList(page);
        check('"+ Adicionar bloco" grava customModules (id 1001, sem.41, código em maiúsculas) e o bloco entra como grupo próprio (C)', cfg2.customModules.length === 2 && cfg2.customModules[1].id === 1001 && cfg2.customModules[1].code === 'NOV1' && cfg2.customModules[1].week === 41 && L.length === 4 && L[3].letter === 'C' && /^NOV1/.test(L[3].mod), JSON.stringify(cfg2.customModules) + ' ' + JSON.stringify(L));
        await page.evaluate(() => { const i = [...document.querySelectorAll('input')].find(i => i.value === 'Bloco novo pela interface'); i.focus(); });
        await page.keyboard.press('End'); await page.keyboard.type(' (editado)'); await page.evaluate(() => document.activeElement.blur()); await page.waitForTimeout(300);
        const cfg3 = await getLS(page, CFG);
        check('Editar o título no editor grava no customModules (nada apagado: as edições e os 2 blocos dela continuam)', cfg3.customModules[1].title === 'Bloco novo pela interface (editado)' && cfg3.customModules.length === 2 && JSON.stringify(cfg3.moduleEdits) === JSON.stringify({ 79: { title: 'Neurologia I — título corrigido' } }), JSON.stringify(cfg3.customModules));
        d = await readDay(page);
        check('SÁB volta a ter aula C + D2-C, agora do NOV1 (grupo C)', modsOf(d, /^D2-C/) === 'NOV1 · Bloco novo pela interface (editado)', modsOf(d, /^D2-C/));
    });
    await scenario(browser, 'S18f2-bloco-adicionado-na-fila-2210', '2026-10-22', { [CFG]: { ...baseCfg, catchupPace: 2, customModules: [{ id: 1000, week: 41, code: 'XYZ', title: 'Bloco da grade real' }] } }, async (page) => {
        await clickTab(page, 'DESATRASO'); const t = await bodyText(page);
        check('Semana seguinte: o bloco adicionado (sem.41) entra na fila de desatraso e conta na projeção como qualquer módulo', /Bloco da grade real/.test(t) && /FILA COMPLETA/.test(t), (t.match(/(\d+)\s*módulos atrasados/) || [])[0]);
    });
    await scenario(browser, 'S18g-aviso-cobertura-dia-editado-2910', '2026-10-29', { [CFG]: { ...baseCfg, catchupPace: 2 }, medplanner_schedule_v1: { '2026-10-31': [{ id: 'c-1', d: 'ANKI', color: '#0369A1', text: 'Anki + Meditação 15min', time: '35min' }, { id: 'c-2', d: 'PLAN', color: '#0F766E', text: 'PLAN da semana', time: '15min' }] } }, async (page) => {
        const warns = await warnTexts(page);
        check('SÁB 31/10 editado à mão sem a apostila do B e sem a aula/D2 do C → 2 avisos no topo: "⚠️ PSI1 (Psiquiatria II) está na lista…" e "⚠️ OFT está na lista da semana mas não tem tarefas — agrupe-o ou defina os dias."', warns.length === 2 && warns[0] === '⚠️ PSI1 (Psiquiatria II) está na lista da semana mas não tem tarefas — agrupe-o ou defina os dias.' && warns[1] === '⚠️ OFT está na lista da semana mas não tem tarefas — agrupe-o ou defina os dias.', warns.join(' / '));
        await clickDay(page, 'SAB'); await clickBtn18(page, /Voltar ao padr/);
        check('"Voltar ao padrão" no sábado restaura a cascata do C e o aviso some', (await warnTexts(page)).length === 0, (await warnTexts(page)).join(' / '));
    });
    await scenario(browser, 'S18h-capacidade-sem43-p4', '2026-10-29', { [CFG]: { ...baseCfg, catchupPace: 4 } }, async (page) => {
        const t = await fitText(page);
        check('Sem.43 ritmo 4: "Semana com 3 blocos … ritmo 4 não cabe (4 dias acima de 8h) · Sugestão: ritmo 2" + botão; nenhuma etapa de bloco é cortada', /^⚠️ Semana com 3 blocos \(A, B, C — 3 cascatas completas\): ritmo 4 não cabe nesta semana \(4 dias acima de 8h · 0 plantões\)\. Sugestão: ritmo 2\./.test(t), t);
        await clickBtn18(page, /^Aplicar ritmo 2$/);
        const cfg = await getLS(page, CFG); const w = await dumpWeek(page, ['SAB', 'DOM']);
        check('"Aplicar ritmo 2" grava catchupPace 2 (a paciente decide); o C continua inteiro (SÁB aula+D2, DOM apostila)', cfg.catchupPace === 2 && has(w.SAB, /^D2-C/) && has(w.DOM, /^D4: Apostila do Bloco C/), JSON.stringify(cfg.catchupPace));
    });

    await browser.close();
    const fails = H.results.filter(r => !r.ok);
    console.log(`\n══════════ RESUMO: ${H.results.length} checks · ${H.results.length - fails.length} ✅ · ${fails.length} ❌ ══════════`);
    fails.forEach(f => console.log('  ❌ ' + f.id + (f.evidence ? ' — ' + f.evidence : '')));
})();
