// TRILHA AUTÔNOMA (paciente, 19–20/10/2026) — cenários TR0–TR14 + invariantes. Rodar: node trilha.js [TR0,TR1,…]
const H = require('./harness.js');
const { openPlanner, clickDay, clickTab, readDay, fmt, check, has, idx, listDayTabs, clickDate, reopen, navWeek, headerWeek, getLS, bodyText, clickTask, typeBlockPct, readCard, clickCardBtn, setLS, markUntil, banner, clickIn } = H;
const CFG = 'medplanner_config_v1', PRG = 'medplanner_progress_v1', TRL = 'medplanner_trail_v1', SCH = 'medplanner_schedule_v1';
const baseCfg = { startDate: '2026-01-07', manualWeek: null };
const only = process.argv[2] ? process.argv[2].split(',') : null;
const addDays = (iso, k) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + k); return d.toISOString().slice(0, 10); };
const dd = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);
const br = (iso) => iso.slice(8, 10) + '/' + iso.slice(5, 7);
const FIELD = { aula: 'aula', quest: 'questoesD2', apost: 'apostila', seal: 'smartcard' }, STAMP = { aula: 'aulaAt', quest: 'questoesD2At', apost: 'apostilaAt', seal: 'smartcardAt' };
const STG = ['aula', 'quest', 'apost', 'seal'];
const VENV_TIME = /Venvanse[^.\n]{0,40}\d{1,2}(h|:\d\d)|\d{1,2}(h|:\d\d)[^.\n]{0,40}Venvanse|estimulante[^.\n]{0,30}\d{1,2}(h\d*|:\d\d)/i;
async function scenario(browser, name, dateISO, seeds, fn) {
    if (only && !only.some(o => name.startsWith(o))) return;
    console.log(`\n══════════ ${name} · relógio=${dateISO} ══════════`);
    let { ctx, page } = await openPlanner(browser, dateISO, seeds);
    const S = { ctx, page, browser, async reopen(date) { const r = await reopen(browser, S.ctx, S.page, date); S.ctx = r.ctx; S.page = r.page; return S.page; } };
    try { await fn(S); } catch (e) { console.log('   💥 ERRO no cenário:', e.stack); H.results.push({ id: name + ' (erro)', ok: false, evidence: e.message }); }
    await S.ctx.close();
}
async function readWeekT(page) { const out = {}; for (const t of await listDayTabs(page)) { await clickDate(page, t.date); out[t.date] = await readDay(page); } return out; }
async function trailMap(page, nWeeks) { // navega da semana visível por n semanas e devolve { id: { aula, quest, apost, seal } } pelas etiquetas data-tm/data-ts e a data da aba
    const map = {}; const year = (dm) => (dm.slice(3) === '01' ? '2027' : '2026') + '-' + dm.slice(3) + '-' + dm.slice(0, 2);
    for (let k = 0; k < nWeeks; k++) { const w = await readWeekT(page); Object.entries(w).forEach(([dm, d]) => d.blocks.forEach(b => { if (b.tm != null && b.ts && !b.au) { (map[b.tm] = map[b.tm] || {}); if (map[b.tm][b.ts]) map[b.tm][b.ts + '_dup'] = year(dm); else map[b.tm][b.ts] = year(dm); } })); if (k < nWeeks - 1) await navWeek(page, 1); }
    return map;
}
const allText = (day) => [day.title, day.dayType, day.venv].concat(day.warn, day.blocks.map(b => b.text + ' ' + (b.notes || []).join(' '))).join(' | ');
async function trilhaRows(page) { await clickTab(page, 'TRILHA'); return page.evaluate(() => ({ rows: [...document.querySelectorAll('[data-t="trilha-row"]')].map(r => ({ id: Number(r.getAttribute('data-id')), pos: Number(r.getAttribute('data-pos')), planned: r.getAttribute('data-planned') === '1', pinned: r.getAttribute('data-pinned') === '1', text: r.innerText.replace(/\n/g, ' '), btns: [...r.querySelectorAll('button')].map(b => b.innerText.trim()) })), lineAfter: (() => { const l = document.querySelector('[data-t="trilha-line"]'); const p = l && l.previousElementSibling; return p ? Number(p.getAttribute('data-pos')) : null; })(), line: (document.querySelector('[data-t="trilha-line"]') || {}).innerText || '', counts: (document.querySelector('[data-t="trilha-counts"]') || {}).innerText || '', ramp: (document.querySelector('[data-t="trilha-ramp"]') || {}).innerText || '' })); }
async function clickRow(page, id, label) { const ok = await page.evaluate(([i, l]) => { const r = document.querySelector('[data-t="trilha-row"][data-id="' + i + '"]'); const b = r && [...r.querySelectorAll('button')].find(b => b.innerText.trim() === l); if (!b) return false; b.click(); return true; }, [id, label]); if (!ok) throw new Error('botão ' + label + ' da linha ' + id + ' não encontrado'); await page.waitForTimeout(300); }
const DEFAULT12 = [5, 6, 14, 19, 24, 32, 34, 85, 86, 1, 2, 3];

(async () => {
    const browser = await H.pw.chromium.launch();

    // ── TR0 · fronteira 19/10 (sem seeds): Sem.41 = 14–19/10 (6 abas), prévia da Trilha a partir de 20/10, nada gravado da Trilha ──
    await scenario(browser, 'TR0-fronteira-1910', '2026-10-19', {}, async (S) => {
        const page = S.page;
        const tabs = await listDayTabs(page); const hw = await headerWeek(page);
        check('Sem.41 tem 6 abas, QUA 14/10 a SEG 19/10 (sem a TER 20/10)', tabs.length === 6 && tabs[0].code === 'QUA' && tabs[0].date === '14/10' && tabs[5].code === 'SEG' && tabs[5].date === '19/10', JSON.stringify(tabs));
        check('cabeçalho Sem.41 · 14/10–19/10', hw.week === 41 && hw.range === '14/10–19/10', JSON.stringify(hw));
        const cfg0 = await getLS(page, CFG);
        check('nada da Trilha gravado antes de 20/10 (sem trilhaWeeks/trilhaPlan/trilhaFirstOpen) e nenhum fioWeek ≥ 20/10', !cfg0 || (!cfg0.trilhaWeeks && !cfg0.trilhaPlan && !cfg0.trilhaFirstOpen && !Object.keys(cfg0.fioWeek || {}).some(k => k >= '2026-10-20')), JSON.stringify(cfg0));
        check('aba ainda se chama DESATRASO', /DESATRASO/.test(await bodyText(page)));
        await navWeek(page, 1);
        const t2 = await listDayTabs(page); const h2 = await headerWeek(page);
        check('▶ leva à Sem.42 20/10–26/10, 7 abas começando na TER 20/10', h2.week === 42 && h2.range === '20/10–26/10' && t2.length === 7 && t2[0].code === 'TER' && t2[0].date === '20/10' && t2[6].code === 'SEG', JSON.stringify(t2));
        const body = await bodyText(page);
        check('badge "Trilha 1/11" e rótulo de prévia', /Trilha 1\/11/.test(body) && /prévia — congela quando a semana começar/.test(body));
        const panel = await page.evaluate(() => [...document.querySelectorAll('[data-t="trilha-panel"] [data-mod]')].map(e => e.getAttribute('data-kind') + ':' + e.getAttribute('data-mod')));
        check('painel da semana: 3 NOVOS na prévia — CIR1 Trauma I, CIR1 Trauma II, CIR2 Urologia', panel.length === 3 && panel.every(p => p.startsWith('novo:')) && /Trauma I —/.test(panel[0]) && /Trauma II/.test(panel[1]) && /Urologia/.test(panel[2]), panel.join(' | '));
        await clickDate(page, '20/10'); const ter = await readDay(page); console.log(fmt(ter));
        check('TER 20/10 (plantão longo): 🚑 06h–19h + Anki no trajeto + áudio (tm=5) + academia opcional + jantar/sono', has(ter, /^🚑 Plantão 06h–19h — sem etapa de mesa/) && has(ter, /^Anki no trajeto — 20min/) && ter.blocks.some(b => b.au && b.tm === 5) && has(ter, /^Academia — opcional/) && has(ter, /dormir ~21h45/));
        check('TER 20/10: nenhuma etapa de mesa (nenhum bloco de questões/apostila/selagem; aula só em áudio)', !ter.blocks.some(b => b.ts && b.ts !== 'aula') && !ter.blocks.some(b => b.ts === 'aula' && !b.au));
        const wk = await readWeekT(page);
        check('Sem.42: nenhum texto do motor antigo (Fio N, Bloco X, Selar, toque N, DESAT)', !Object.values(wk).some(d => d.blocks.some(b => /Fio \d|Bloco [A-H]\b|^Selar|toque \d|bloco antigo/.test(b.text) || b.tag === 'DESAT')));
        await navWeek(page, 10); const h52 = await headerWeek(page); const t52 = await listDayTabs(page);
        check('Sem.52 = 29/12–01/01, 4 abas (TER a SEX)', h52.week === 52 && h52.range === '29/12–01/01' && t52.length === 4 && t52.map(t => t.code).join() === 'TER,QUA,QUI,SEX', JSON.stringify([h52, t52]));
        await navWeek(page, 1); const h53 = await headerWeek(page);
        check('▶ além da Sem.52 continua na 52 (o acesso termina em 01/01)', h53.week === 52, JSON.stringify(h53));
    });

    // ── TR1 · semana de 20/10 (1º acesso no dia): congelamento, plantões, prova, aula em áudio ──
    await scenario(browser, 'TR1-semana-2010', '2026-10-20', {}, async (S) => {
        const page = S.page;
        const cfg = await getLS(page, CFG); const W = (cfg.trilhaWeeks || {})['2026-10-20'] || {};
        check('congelou a T1: trilhaWeeks[20/10] = { q: 3, base: 3, held: false, mods: [5, 6, 14] } e trilhaFirstOpen = 20/10', W.q === 3 && W.base === 3 && W.held === false && JSON.stringify(W.mods) === '[5,6,14]' && cfg.trilhaFirstOpen === '2026-10-20', JSON.stringify(W));
        const p5 = cfg.trilhaPlan[5];
        check('trilhaPlan[5] = aula 21/10 · questões 22/10 · apostila 23/10 · selagem 26/10 (orig = atual)', p5.aula === '2026-10-21' && p5.quest === '2026-10-22' && p5.apost === '2026-10-23' && p5.seal === '2026-10-26' && JSON.stringify(p5.orig) === JSON.stringify({ aula: p5.aula, quest: p5.quest, apost: p5.apost, seal: p5.seal }), JSON.stringify(p5));
        check('progress_v1 não é criado pela Trilha (registro próprio)', (await getLS(page, PRG)) === null);
        check('a aba se chama TRILHA', /TRILHA/.test(await bodyText(page)));
        const w = await readWeekT(page); Object.values(w).forEach(d => console.log(fmt(d)));
        const ter = w['20/10'], qua = w['21/10'], qui = w['22/10'], sex = w['23/10'], dom = w['25/10'];
        check('TER: 🗓️ "só Anki + áudio", sem 📚 nem ⚠️', /só Anki \+ áudio/.test(ter.dayType) && !ter.warn.length, ter.dayType + ' | ' + ter.warn.join());
        check('QUA 21/10: 🚑 Plantão 13h–18h {5h}', ter && qua.blocks.some(b => /^🚑 Plantão 13h–18h/.test(b.text) && b.time === '5h'));
        const aula5 = qua.blocks.find(b => b.tm === 5 && b.ts === 'aula' && !b.au);
        check('QUA 21/10: bloco de aula de CIR1 com "Aula 1.5x…" e "🎧 Aula feita em áudio ✓" + nota do conteúdo visual', !!aula5 && JSON.stringify(aula5.tasks) === JSON.stringify(['Aula 1.5x + resumo (toque 1) ✓', '🎧 Aula feita em áudio ✓']) && aula5.notes.some(n => /conteúdo visual.*precisa do vídeo/.test(n)), JSON.stringify(aula5));
        check('QUA 21/10 (véspera de plantão 06h): "dormir ~21h45"', has(qua, /Noite leve — plantão 06h amanhã: dormir ~21h45/));
        check('QUI 22/10 (véspera de plantão 05h30): "dormir ~21h45"', has(qui, /plantão 05h30 amanhã: dormir ~21h45/));
        check('SEX 23/10: botão "Sexta de plantão: sem simulado pela regra", sem SIMULADO, com a apostila de CIR1 (sem ⚠️ de tempo hábil)', /Sexta de plantão: sem simulado pela regra/.test(sex.simBtn || '') && !has(sex, /SIMULADO NA ÍNTEGRA/) && sex.blocks.some(b => b.tm === 5 && b.ts === 'apost') && !sex.warn.some(x => /tempo hábil/.test(x)), (sex.simBtn || '') + ' | ' + sex.warn.join());
        check('nenhum texto com horário de Venvanse/estimulante na semana', !Object.values(w).some(d => VENV_TIME.test(allText(d))));
        // 🎧 marcar a aula em áudio no plantão longo
        await clickDate(page, '20/10'); await clickTask(page, /^🎧 Áudio \(opcional/, /Aula feita em áudio/);
        const tr = await getLS(page, TRL);
        check('🎧 no plantão: trail_v1[5] = { aula, aulaAt 20/10, aulaAudio, aulaAudioAt 20/10 }', tr && tr[5] && tr[5].aula === true && tr[5].aulaAt === '2026-10-20' && tr[5].aulaAudio === true && tr[5].aulaAudioAt === '2026-10-20', JSON.stringify(tr));
        const ter2 = await readDay(page);
        check('o bloco de áudio continua apontando para CIR1 Trauma I, marcado (identidade estável)', ter2.blocks.some(b => b.au && b.tm === 5 && b.done));
        await clickDate(page, '21/10'); const qua2 = await readDay(page);
        check('a aula de CIR1 some da QUA 21/10 (já feita em áudio — BUG 2)', !qua2.blocks.some(b => b.tm === 5 && b.ts === 'aula'));
        await clickDate(page, '22/10'); const qui2 = await readDay(page);
        check('QUI 22/10: questões de CIR1 com "🎬 antes das questões: veja no vídeo as partes visuais"', qui2.blocks.some(b => b.tm === 5 && b.ts === 'quest' && b.notes.some(n => /^🎬 antes das questões/.test(n))));
        const card = await readCard(page, /Trauma I — Avaliação Inicial/);
        check('card de Módulos mostra "🎧 aula em áudio em 20/10" e a aula marcada', !!card && card.btns.some(b => /^✓ Aula 1\.5x/.test(b)) && /🎧 aula em áudio em 20\/10/.test(await bodyText(page)), JSON.stringify(card));
        // simulado religado na sexta de plantão → etapa do dia vira pendente ⏳ → recolocar
        await clickTab(page, 'CRONOGRAMA'); await clickDate(page, '23/10');
        await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Sexta de plantão: sem simulado/.test(x.innerText)); b.click(); }); await page.waitForTimeout(400);
        const cfg2 = await getLS(page, CFG); const sex2 = await readDay(page);
        check('religar o simulado em 23/10: simOverrides[23/10] = true e a sexta ganha SIMULADO + CORREÇÃO', cfg2.simOverrides && cfg2.simOverrides['2026-10-23'] === true && has(sex2, /SIMULADO NA ÍNTEGRA \(quinzenal\): fora do horário do plantão/) && has(sex2, /CORREÇÃO DO SIMULADO/));
        const pend = await banner(page, 'trilha-pending');
        check('⏳ aparece citando a apostila de CIR1 na sexta que virou simulado', !!pend && /Ficaram para trás 1 etapa/.test(pend.text) && /CIR1 · apostila de SEX 23\/10, que virou simulado/.test(pend.text) && /sem culpa/.test(pend.text), pend && pend.text);
        await clickIn(page, 'trilha-pending', 'Ver como recolocar');
        const pv = await banner(page, 'trilha-pending'); console.log('   💡', pv.text.replace(/\n/g, ' '));
        check('proposta de recolocar (nada gravado antes do Aplicar)', /💡 CIR1 · apostila/.test(pv.text) && pv.btns.includes('Aplicar') && pv.btns.includes('Cancelar') && (await getLS(page, CFG)).trilhaPlan[5].apost === '2026-10-23');
        await clickIn(page, 'trilha-pending', 'Aplicar');
        const cfg3 = await getLS(page, CFG); const p53 = cfg3.trilhaPlan[5];
        check('Aplicar: apostila de CIR1 sai de 23/10 (orig fica 23/10; hist "recolocar"); nada gravado em schedule_v1', p53.apost !== '2026-10-23' && p53.orig.apost === '2026-10-23' && p53.hist.length >= 1 && p53.hist[0].why === 'recolocar' && p53.hist[0].from === '2026-10-23' && !(await getLS(page, SCH)), JSON.stringify(p53));
        check('intervalos da cadeia recolocada dentro das faixas (questões→apostila 1–2, apostila→selagem 2–5)', dd(p53.quest, p53.apost) >= 1 && dd(p53.quest, p53.apost) <= 2 && dd(p53.apost, p53.seal) >= 2 && dd(p53.apost, p53.seal) <= 5, JSON.stringify(p53));
        const sex3 = await readDay(page);
        check('SEX 23/10 mostra a linha "↷ … apostila recolocada para …" (sem tarefa)', has(sex3, /^↷ Trilha · CIR1 — apostila recolocada para (SÁB|DOM|SEG) \d\d\/10/));
    });

    // ── TR10 · fila, linha de alcance, ↑↓, 📌 e rampa pela interface (20/10) ──
    await scenario(browser, 'TR10-fila-2010', '2026-10-20', {}, async (S) => {
        const page = S.page;
        const t = await trilhaRows(page);
        check('fila começa por cirurgia e segue a ordem do curso: [' + DEFAULT12.join(',') + ']', JSON.stringify(t.rows.slice(0, 12).map(r => r.id)) === JSON.stringify(DEFAULT12), t.rows.slice(0, 12).map(r => r.id).join(','));
        check('#1 a #3 = NESTA SEMANA, sem ↑↓ nem 📌 (já planejados)', t.rows.slice(0, 3).every(r => r.planned && /NESTA SEMANA/.test(r.text) && !r.btns.length));
        const N = Number((t.counts.match(/cabem (\d+) módulos/) || [])[1]);
        check('"No ritmo atual cabem N módulos até 01/01/2027" com N = 40 e a linha de alcance depois do #40', N === 40 && t.lineAfter === 40 && /LINHA DE ALCANCE — até 01\/01: 40 módulos/.test(t.line), t.counts.split('\n').slice(0, 6).join(' | '));
        check('contagem: fechados 0 · dentro 40 · fora ' + (t.rows.length - 40), /0\nFechados na Trilha/.test(t.counts) && /40\nDentro do alcance/.test(t.counts) && new RegExp((t.rows.length - 40) + '\\nFora').test(t.counts), t.counts.slice(0, 120));
        const ids = t.rows.map(r => r.id); const p = (id) => ids.indexOf(id);
        check('bônus por último dentro da semana do curso: 13 antes de 91; 74 e 92 antes de 73; 84 e 93 antes de 83', p(13) < p(91) && p(74) < p(73) && p(92) < p(73) && p(84) < p(83) && p(93) < p(83));
        await clickRow(page, 3, '↑');
        const cfgA = await getLS(page, CFG); const oA = cfgA.trilhaOrder || [];
        check('↑ no NEF1 Glomerulopatias II (id 3) ⇒ trilhaOrder com 3 antes de 2', oA.indexOf(3) >= 0 && oA.indexOf(3) < oA.indexOf(2), oA.slice(0, 14).join(','));
        await clickRow(page, 70, '📌');
        const t2 = await trilhaRows(page); const cfgB = await getLS(page, CFG);
        check('📌 no PED5 Nefrologia Pediátrica (70) ⇒ trilhaPins [70] e ele vira #4 (próximo a abrir)', JSON.stringify(cfgB.trilhaPins) === '[70]' && t2.rows[3].id === 70 && t2.rows[3].pinned, t2.rows.slice(0, 5).map(r => r.id).join(','));
        const rampBefore = t2.counts.match(/cabem (\d+)/)[1];
        await page.evaluate(() => { const r = document.querySelector('[data-t="trilha-ramp"] [data-tue="2026-12-15"]'); const b = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === '+'); b.click(); }); await page.waitForTimeout(400);
        const cfgC = await getLS(page, CFG); const t3 = await trilhaRows(page);
        check('+ na T9 (15/12) ⇒ trilhaRamp[15/12] = 6 e a conta muda (' + rampBefore + ' → ' + t3.counts.match(/cabem (\d+)/)[1] + ')', cfgC.trilhaRamp && cfgC.trilhaRamp['2026-12-15'] === 6 && Number(t3.counts.match(/cabem (\d+)/)[1]) === Number(rampBefore) + 1, JSON.stringify(cfgC.trilhaRamp));
        const frozenRow = await page.evaluate(() => { const r = document.querySelector('[data-t="trilha-ramp"] [data-tue="2026-10-20"]'); return r ? [...r.querySelectorAll('button')].map(b => b.innerText.trim()) : null; });
        check('semana congelada (T1) não tem − / +', Array.isArray(frozenRow) && !frozenRow.length, JSON.stringify(frozenRow));
        check('nenhum texto de horário de Venvanse na aba Trilha', !VENV_TIME.test(await bodyText(page)));
    });

    // ── TR10b · bloco adicionado por ela (semana 41) entra na fila logo depois de 80 ──
    await scenario(browser, 'TR10b-bloco-adicionado', '2026-10-20', { [CFG]: { ...baseCfg, customModules: [{ id: 1000, week: 41, code: 'XYZ', title: 'Bloco da grade real' }] } }, async (S) => {
        const t = await trilhaRows(S.page); const ids = t.rows.map(r => r.id);
        check('customModules XYZ (semana 41) entra logo depois de 80; total ' + ids.length, ids.indexOf(1000) === ids.indexOf(80) + 1 && ids.length === 94, ids.slice(ids.indexOf(79) - 1, ids.indexOf(79) + 4).join(','));
    });

    // ── TR2 · semana de 03/11 (encadeada desde 20/10): simulado 06/11, plantões longos sem etapa de mesa, revisão vencida no tempo morto ──
    await scenario(browser, 'TR2-semana-0311', '2026-10-20', { [PRG]: { 60: { aula: true, questoesD2: true, apostila: true, smartcard: true, completedAt: '2026-10-01', accSelagem: 70 } } }, async (S) => {
        await markUntil(S.page, '2026-10-26'); await S.reopen('2026-10-27');
        await markUntil(S.page, '2026-11-02'); const page = await S.reopen('2026-11-03');
        const cfg = await getLS(page, CFG); const W = cfg.trilhaWeeks['2026-11-03'] || {};
        check('T3 congelada: trilhaWeeks[03/11] = { q: 4, base: 4, held: false, mods: [85, 86, 1, 2] } (semana passada fechou)', W.q === 4 && W.base === 4 && W.held === false && JSON.stringify(W.mods) === '[85,86,1,2]', JSON.stringify(W));
        const alerts = await page.evaluate(() => { const t = document.body.innerText; const i = t.indexOf('Revisões no prazo'); return i < 0 ? '' : t.slice(i, i + 400); });
        check('revisões vêm só do registro da Trilha: CIR1 vencido aparece; o GIN5 do curso (progress_v1) não', /Hora de revisar \(Trilha\) — CIR1/.test(alerts) && !/GIN5/.test(alerts), alerts.replace(/\n/g, ' | ').slice(0, 200));
        check('sem ⏳ (tudo marcado até 02/11)', !(await banner(page, 'trilha-pending')));
        const w = await readWeekT(page); Object.values(w).forEach(d => console.log(fmt(d)));
        const ter = w['03/11'], sex = w['06/11'], qua = w['04/11'];
        check('TER 03/11 (plantão longo): só 🚑, Anki no trajeto, áudio, revisão no tempo morto, academia opcional e jantar/sono', ter.blocks.every(b => b.tag === 'AMB' || b.tag === 'ANKI' || b.au || /^📱 revisão no tempo morto/.test(b.text) || b.tag === 'GYM' || b.tag === 'LAZER') && !ter.blocks.some(b => b.tm != null && !b.au), ter.blocks.map(b => b.tag).join(','));
        const rv = ter.blocks.find(b => /^📱 revisão no tempo morto — 10 questões \+ smartcards/.test(b.text));
        check('revisão vencida no plantão longo vira "📱 revisão no tempo morto" (opcional)', !!rv && rv.time === 'opcional');
        check('QUA 04/11: a revisão não marcada aparece como revisão normal (desliza, fora do ⏳)', has(qua, /^Revisão adaptativa \(o app avisa pelo seu %\)/));
        check('SEX 06/11: SIMULADO + CORREÇÃO, nenhuma etapa de módulo, botão "🎯 Simulado marcado nesta sexta"', has(sex, /SIMULADO NA ÍNTEGRA \(quinzenal\): manhã/) && has(sex, /CORREÇÃO DO SIMULADO/) && !sex.blocks.some(b => b.tm != null) && /🎯 Simulado marcado nesta sexta/.test(sex.simBtn || ''));
        const map = await trailMap(page, 2);
        const bad = Object.entries(map).filter(([, m]) => ['2026-11-03', '2026-11-06', '2026-11-10', '2026-11-12'].some(d => Object.values(m).includes(d)));
        check('nenhuma etapa em 03/11, 06/11, 10/11 e 12/11 (plantões longos e simulado)', !bad.length, JSON.stringify(bad));
        const okChain = [85, 86, 1, 2].every(id => { const m = map[id] || {}; return m.aula && m.quest && m.apost && m.seal && !Object.keys(m).some(k => /_dup/.test(k)) && dd(m.aula, m.quest) >= 1 && dd(m.aula, m.quest) <= 2 && dd(m.quest, m.apost) >= 1 && dd(m.quest, m.apost) <= 2 && dd(m.apost, m.seal) >= 2 && dd(m.apost, m.seal) <= 5; });
        check('módulos novos (85, 86, 1, 2): 4 etapas em dias distintos, dentro das faixas', okChain, JSON.stringify([85, 86, 1, 2].map(id => [id, map[id]])));
    });

    // ── TR3 · bloco 04h30 (25/11): ritmo não sobe, 📚 a 5h, véspera "~20h30", nada de horário de medicação ──
    const plan3 = { 5: ['2026-11-17', '2026-11-18', '2026-11-19', '2026-11-22'], 6: ['2026-11-18', '2026-11-19', '2026-11-20', '2026-11-23'], 14: ['2026-11-20', '2026-11-21', '2026-11-22', '2026-11-25'], 19: ['2026-11-21', '2026-11-22', '2026-11-23', '2026-11-26'] };
    const mkPlan = (pl, wk) => { const o = {}; Object.entries(pl).forEach(([id, d]) => { const x = { aula: d[0], quest: d[1], apost: d[2], seal: d[3] }; o[id] = { wk, via: 'ramp', ...x, orig: { ...x }, hist: [] }; }); return o; };
    const mkTrail = (pl, ate) => { const o = {}; Object.entries(pl).forEach(([id, d]) => { STG.forEach((ts, i) => { if (d[i] <= ate) { (o[id] = o[id] || {})[FIELD[ts]] = true; o[id][STAMP[ts]] = d[i]; } }); if (o[id] && STG.every(ts => o[id][FIELD[ts]])) o[id].completedAt = d[3]; }); return o; };
    const cfg3 = { ...baseCfg, trilhaRamp: { '2026-11-24': 5 }, trilhaWeeks: { '2026-11-17': { q: 4, base: 4, held: false, why: null, mods: [5, 6, 14, 19], adv: [], rise: [] } }, trilhaPlan: mkPlan(plan3, '2026-11-17') };
    await scenario(browser, 'TR3-madrugada-2511', '2026-11-25', { [CFG]: cfg3, [TRL]: mkTrail(plan3, '2026-11-24'), [SCH]: { '2026-11-26': [{ id: 'x1', d: 'ANKI', color: '#0369A1', text: 'Anki no trajeto — 20min', time: '20min' }, { id: 'x2', d: 'AMB', color: '#6B7280', text: '🚑 Plantão 04h30–12h30', time: '8h' }, { id: 'x3', d: 'EXTRA', color: '#0EA5E9', text: 'Estudo extra que ela pôs', time: '4h' }, { id: 'x4', d: 'EXTRA', color: '#0EA5E9', text: 'Mais um bloco', time: '1h' }, { id: 'x5', d: 'LAZER', color: '#6B7280', text: 'Noite leve', time: 'livre' }] } }, async (S) => {
        const page = S.page;
        const cfg = await getLS(page, CFG); const W = cfg.trilhaWeeks['2026-11-24'] || {};
        check('T6 congelada SEGURADA pelo bloco 04h30: { q: 4, base: 5, held: true, why: "madrugada", mods: [24, 32, 34, 85] }', W.q === 4 && W.base === 5 && W.held === true && W.why === 'madrugada' && JSON.stringify(W.mods) === '[24,32,34,85]', JSON.stringify(W));
        check('nenhum 🔓 (o bloco 04h30 nunca sobe o ritmo)', !(await banner(page, 'trilha-rise')));
        const w = await readWeekT(page); Object.values(w).forEach(d => console.log(fmt(d)));
        const qua = w['25/11'], qui = w['26/11'], sab = w['28/11'], dom = w['29/11'];
        check('QUA 25/11: 🚑 Plantão 04h30–12h30 (acorda 03:30) {8h} + Anki no trajeto; 🗓️ "Acorda 03:30 … estudo à tarde · 📚 a partir de 5h"', qua.blocks.some(b => /^🚑 Plantão 04h30–12h30 \(acorda 03:30\) · estudo concentra à tarde/.test(b.text) && b.time === '8h') && has(qua, /^Anki no trajeto — 20min$/) && /Acorda 03:30 · plantão 04h30–12h30 · estudo à tarde · 📚 a partir de 5h/.test(qua.dayType), qua.dayType);
        check('💊 nos dias de 04h30 = só "janela do estimulante a validar com a psiquiatra" (nenhum horário)', qua.venv === 'Janela do estimulante a validar com a psiquiatra (bloco de plantão de madrugada)');
        const stH = qua.blocks.filter(b => b.tm != null && !b.au).reduce((s, b) => s + H.parseH(b.time), 0);
        check('etapas de QUA 25/11 cabem na janela da tarde (≤ 4,67h)', stH <= 4.67 + 1e-9, stH.toFixed(2) + 'h');
        check('QUI 26/11 editado com 5,3h de estudo: "📚 5,3h de estudo — acima de 5h (plantão 04h30: janela menor)"', qui.warn.some(x => /^📚 5,3h de estudo — acima de 5h \(plantão 04h30: janela menor\)/.test(x)), qui.warn.join(' | '));
        check('SÁB 28/11: sem plantão, com PLAN, sem academia', !qui.blocks.length || (!sab.blocks.some(b => b.tag === 'AMB') && sab.blocks.some(b => b.tag === 'PLAN') && !sab.blocks.some(b => b.tag === 'GYM')));
        check('DOM 29/11 (véspera de 04h30): "Noite leve — amanhã acorda 03:30 (plantão 04h30–12h30): dormir ~20h30"', has(dom, /^Noite leve — amanhã acorda 03:30 \(plantão 04h30–12h30\): dormir ~20h30$/));
        check('🌿 da semana = SÁB 28/11 (únicos candidatos: SÁB e DOM)', qua.light && qua.light.auto === 'Auto · SÁB' && /^SÁB 28\/11/.test(qua.light.note), JSON.stringify(qua.light));
        check('nenhum texto com horário de Venvanse/estimulante na semana 04h30', !Object.values(w).some(d => VENV_TIME.test(allText(d))));
        await clickTab(page, 'TRILHA'); const ramp = (await page.evaluate(() => (document.querySelector('[data-t="trilha-ramp"]') || {}).innerText || ''));
        check('aba Trilha mostra o motivo: "travado: bloco 04h30"', /travado: bloco 04h30/.test(ramp), ramp.split('\n').slice(0, 3).join(' | '));
    });

    // ── TR4 · 15/12, ritmo 5 (semana anterior fechou, fora do bloco 04h30): simulado 18/12, 📦 desde 15/12 ──
    const plan4 = { 5: ['2026-12-08', '2026-12-09', '2026-12-10', '2026-12-13'], 6: ['2026-12-09', '2026-12-10', '2026-12-11', '2026-12-14'], 14: ['2026-12-11', '2026-12-12', '2026-12-13', '2026-12-16'], 19: ['2026-12-12', '2026-12-13', '2026-12-14', '2026-12-17'] };
    await scenario(browser, 'TR4-ritmo5-1512', '2026-12-15', { [CFG]: { ...baseCfg, trilhaWeeks: { '2026-12-08': { q: 4, base: 4, held: false, why: null, mods: [5, 6, 14, 19], adv: [], rise: [] } }, trilhaPlan: mkPlan(plan4, '2026-12-08') }, [TRL]: mkTrail(plan4, '2026-12-14') }, async (S) => {
        const page = S.page; const cfg = await getLS(page, CFG); const W = cfg.trilhaWeeks['2026-12-15'] || {};
        check('T9 sobe para 5: { q: 5, base: 5, held: false, mods: [24, 32, 34, 85, 86] }', W.q === 5 && W.base === 5 && W.held === false && JSON.stringify(W.mods) === '[24,32,34,85,86]', JSON.stringify(W));
        check('📦 no Cronograma desde 15/12 (exportar da plataforma + 💾 backup)', !!(await banner(page, 'trilha-export')));
        const w = await readWeekT(page); Object.values(w).forEach(d => console.log(fmt(d)));
        check('SEX 18/12: simulado, nenhuma etapa de módulo', has(w['18/12'], /SIMULADO NA ÍNTEGRA/) && !w['18/12'].blocks.some(b => b.tm != null));
        const map = await trailMap(page, 2);
        check('nenhum módulo com duas etapas no mesmo dia; selagens até 31/12', !Object.values(map).some(m => Object.keys(m).some(k => /_dup/.test(k)) || new Set(STG.map(t => m[t]).filter(Boolean)).size !== STG.filter(t => m[t]).length) && Object.values(map).every(m => !m.seal || m.seal <= '2026-12-31'), JSON.stringify(map));
        console.log('   CARGA 15–21/12 (estudo / limiar): ' + Object.entries(w).map(([d, x]) => d + ' ' + H.hoursOf(x).toFixed(2).replace('.', ',') + 'h').join(' · '));
        await clickTab(page, 'TRILHA'); check('📦 também na aba Trilha', !!(await banner(page, 'trilha-export')));
    });

    // ── TR5 · semana final (29/12): sem módulo novo, recolocação automática, 24/25/31 mais leves, 01/01 só selagem + encerramento ──
    const plan5 = { 5: ['2026-12-22', '2026-12-23', '2026-12-24', '2026-12-27'], 6: ['2026-12-23', '2026-12-24', '2026-12-25', '2026-12-28'], 14: ['2026-12-24', '2026-12-25', '2026-12-26', '2026-12-29'], 19: ['2026-12-25', '2026-12-26', '2026-12-27', '2026-12-30'] };
    const tr5 = mkTrail({ 5: plan5[5] }, '2026-12-28'); tr5[6] = { aula: true, aulaAt: '2026-12-23', questoesD2: true, questoesD2At: '2026-12-24' }; tr5[14] = { aula: true, aulaAt: '2026-12-24' };
    await scenario(browser, 'TR5-fim-2912', '2026-12-29', { [CFG]: { ...baseCfg, trilhaWeeks: { '2026-12-22': { q: 4, base: 4, held: false, why: null, mods: [5, 6, 14, 19], adv: [], rise: [] } }, trilhaPlan: mkPlan(plan5, '2026-12-22') }, [TRL]: tr5 }, async (S) => {
        let page = S.page;
        const tabs = await listDayTabs(page);
        check('4 abas: TER 29, QUA 30, QUI 31, SEX 01', tabs.map(t => t.code + ' ' + t.date).join() === 'TER 29/12,QUA 30/12,QUI 31/12,SEX 01/01', JSON.stringify(tabs));
        const cfg = await getLS(page, CFG); const W = cfg.trilhaWeeks['2026-12-29'] || {};
        check('Sem.52 congela com q 0 (nenhum módulo novo) e a recolocação automática roda: trilhaFinalAutoAt = "2026-12-29|0"', W.q === 0 && JSON.stringify(W.mods) === '[]' && cfg.trilhaFinalAutoAt === '2026-12-29|0', JSON.stringify([W, cfg.trilhaFinalAutoAt]));
        const P = cfg.trilhaPlan; console.log('   plano final:', JSON.stringify({ 6: P[6], 14: P[14], 19: P[19] }));
        const inWin = (d) => d == null || (d >= '2026-12-29' && d <= '2027-01-01');
        check('etapas abertas de 6, 14 e 19 recolocadas entre 29/12 e 01/01 (ou listadas como fora), com hist "final"', [6, 14, 19].every(id => STG.every(ts => (tr5[id] && tr5[id][FIELD[ts]]) || inWin(P[id][ts]))) && [6, 14, 19].every(id => (P[id].hist || []).some(h => h.why === 'final')), JSON.stringify([6, 14, 19].map(id => [id, P[id].hist])));
        check('nada em ordem errada: datas crescentes na cadeia de cada módulo', [6, 14, 19].every(id => { const ds = STG.map(ts => (tr5[id] && tr5[id][STAMP[ts]]) || P[id][ts]).filter(Boolean); return ds.every((d, i) => i === 0 || d > ds[i - 1]); }));
        const log = cfg.trilhaFinalLog || {}; const fin = await banner(page, 'trilha-final');
        check('aviso 📦 da semana final com o que mudou e a carga dia a dia', !!fin && /📦 Semana final \(29\/12\)/.test(fin.text) && /Carga dia a dia: TER 29\/12 [\d,]+h · QUA 30\/12 [\d,]+h · QUI 31\/12 [\d,]+h · SEX 01\/01 [\d,]+h/.test(fin.text), fin && fin.text);
        const w = await readWeekT(page); Object.values(w).forEach(d => console.log(fmt(d)));
        check('nenhuma aula no dia leve (29/12) nem no feriado 31/12; nenhum módulo novo na semana', !w['29/12'].blocks.some(b => b.ts === 'aula' && !b.au) && !w['31/12'].blocks.some(b => b.ts === 'aula') && !Object.values(w).some(d => d.blocks.some(b => b.tm != null && ![5, 6, 14, 19].includes(b.tm))));
        check('TER 29/12: bloco 📦 de exportação', has(w['29/12'], /^📦 Exportar da plataforma o que é seu/));
        check('QUI 31/12: feriado mais leve (🎄, 📚 a partir de 3h)', /🎄 Feriado \(véspera de Ano-Novo\) — dia mais leve, só o que couber sem estragar o dia · 📚 a partir de 3h/.test(w['31/12'].dayType), w['31/12'].dayType);
        const sexta = w['01/01'];
        check('SEX 01/01: só selagens + 🏁 Encerramento; sem simulado pela regra (último dia)', sexta.blocks.filter(b => b.tm != null).every(b => b.ts === 'seal') && has(sexta, /^🏁 Encerramento: conferir selagens pendentes · exportar os materiais da plataforma · 💾 backup final/) && !has(sexta, /SIMULADO NA ÍNTEGRA/) && /01\/01 — último dia de acesso: sem simulado pela regra/.test(sexta.simBtn || '') && /Último dia de acesso à plataforma/.test(sexta.dayType), sexta.simBtn + ' | ' + sexta.dayType);
        // 💾 backup pelo banner 📦
        const [dl] = await Promise.all([page.waitForEvent('download'), clickIn(page, 'trilha-export', '💾 Baixar backup do app')]);
        const data = JSON.parse(require('fs').readFileSync(await dl.path(), 'utf8'));
        check('💾 pelo 📦: medplanner_last_backup = 29/12 e o arquivo traz medplanner_trail_v1', (await page.evaluate(() => localStorage.getItem('medplanner_last_backup'))) === '2026-12-29' && !!data.data['medplanner_trail_v1'], Object.keys(data.data).join(','));
        // ligar o simulado de 01/01 ⇒ a recolocação roda de novo (chave |1) e nenhuma etapa fica em 01/01
        await clickDate(page, '01/01'); await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /01\/01 — último dia de acesso/.test(x.innerText)); b.click(); }); await page.waitForTimeout(400);
        page = await S.reopen('2026-12-29');
        const cfgB = await getLS(page, CFG);
        check('simulado em 01/01 ligado ⇒ trilhaFinalAutoAt = "2026-12-29|1" e nenhuma etapa planejada em 01/01', cfgB.trilhaFinalAutoAt === '2026-12-29|1' && !Object.values(cfgB.trilhaPlan).some(p => STG.some(ts => p[ts] === '2027-01-01')), cfgB.trilhaFinalAutoAt);
        // Adiantar na semana final = desfecho C (sem botão Aplicar)
        await markUntil(page, '2027-01-01'); page = await S.reopen('2026-12-29');
        const adv = await banner(page, 'trilha-adv');
        if (adv) { await clickIn(page, 'trilha-adv', '⏩ Adiantar próximo módulo'); }
        const adv2 = await banner(page, 'trilha-adv');
        check('Adiantar na semana final: "Semana final: sem módulo novo — o acesso termina em 01/01/2027" e só "Fechar"', !!adv2 && /Semana final: sem módulo novo — o acesso termina em 01\/01\/2027/.test(adv2.text) && !adv2.btns.includes('Aplicar') && adv2.btns.includes('Fechar'), adv2 && adv2.text);
        S.lastLS = await page.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
        // TR5b · 02/01/2027: tela de encerramento com o balanço, nada novo gravado
        page = await S.reopen('2027-01-02');
        const bal = await banner(page, 'trilha-balanco');
        check('TR5b 02/01/2027: o Cronograma mostra a tela de encerramento com o balanço (fechados com %, fora do alcance, lembrete do backup)', !!bal && /🏁 Encerramento da Trilha \(20\/10\/2026 → 01\/01\/2027\)/.test(bal.text) && /Módulos fechados \(as 4 etapas\): \d+/.test(bal.text) && /✓ CIR1 · Trauma I/.test(bal.text) && /Fora do alcance \(seguem no novo cursinho a partir de 04\/01\)/.test(bal.text) && /💾 Lembrete/.test(bal.text), bal && bal.text.slice(0, 300));
        const after = await page.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
        check('TR5b: depois de 01/01 nada novo é gravado (config igual)', after[CFG] === S.lastLS[CFG]);
    });

    // ── Simulados na janela = exatamente 06/11 e 18/12 (23/10, 20/11 e 04/12 caem em plantão; 01/01 sem simulado) ──
    await scenario(browser, 'TRsim-simulados-janela', '2026-10-19', {}, async (S) => {
        const page = S.page; await navWeek(page, 1); const sims = [], btn = {};
        for (let k = 0; k < 11; k++) { const w = await readWeekT(page); Object.entries(w).forEach(([d, x]) => { if (has(x, /SIMULADO NA ÍNTEGRA/)) sims.push(d); if (x.simBtn) btn[d] = x.simBtn; }); if (k < 10) await navWeek(page, 1); }
        check('simulados de 20/10 a 01/01 = exatamente 06/11 e 18/12', sims.join() === '06/11,18/12', sims.join());
        check('23/10, 20/11 e 04/12: "Sexta de plantão: sem simulado pela regra"; 01/01: "último dia de acesso: sem simulado pela regra"', ['23/10', '20/11', '04/12'].every(d => /Sexta de plantão: sem simulado pela regra/.test(btn[d] || '')) && /01\/01 — último dia de acesso: sem simulado pela regra/.test(btn['01/01'] || ''), JSON.stringify(btn));
    });

    // ── TR6 · fechar a semana pela interface e Adiantar (cadeia inserida nos dias, linha de alcance +1, Cancelar não grava) ──
    await scenario(browser, 'TR6-adiantar-cabe', '2026-10-20', {}, async (S) => {
        await markUntil(S.page, '2026-10-26'); await S.reopen('2026-10-27');
        const cfg0 = await getLS(S.page, CFG); const T2 = cfg0.trilhaWeeks['2026-10-27'];
        const stagesT2 = []; Object.entries(cfg0.trilhaPlan).forEach(([id, p]) => STG.forEach(ts => { if (p[ts] >= '2026-10-27' && p[ts] <= '2026-11-02') stagesT2.push([Number(id), ts, p[ts]]); }));
        stagesT2.sort((a, b) => a[2] < b[2] ? -1 : 1); const last = stagesT2[stagesT2.length - 1];
        await markUntil(S.page, '2026-11-02', [[last[0], last[1]]]); let page = await S.reopen('2026-10-28');
        const t0 = await trilhaRows(page); const N0 = Number(t0.counts.match(/cabem (\d+)/)[1]); await clickTab(page, 'CRONOGRAMA');
        check('com uma etapa da semana ainda aberta, o ⏩ não aparece', !(await banner(page, 'trilha-adv')));
        await clickDate(page, br(last[2])); const lastRe = new RegExp('^Trilha · \\S+ — ' + (await page.evaluate(() => '')) );
        const dayL = await readDay(page); const blk = dayL.blocks.find(b => b.tm === last[0] && b.ts === last[1]);
        await clickTask(page, new RegExp('^' + blk.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 60)), null);
        const tr = await getLS(page, TRL);
        check('marcar a última etapa pelo bloco (dia futuro) carimba hoje (28/10): min(hoje, data do bloco)', tr[last[0]][STAMP[last[1]]] === '2026-10-28', JSON.stringify(tr[last[0]]));
        const adv = await banner(page, 'trilha-adv');
        check('semana fechada ⇒ "⏩ Adiantar próximo módulo"', !!adv && adv.btns.includes('⏩ Adiantar próximo módulo'), adv && adv.text);
        await clickIn(page, 'trilha-adv', '⏩ Adiantar próximo módulo');
        const pr = await banner(page, 'trilha-adv'); console.log('   💡', pr.text.replace(/\n/g, ' '));
        check('proposta A: "Adiantar #8 CIR4 Especialidade Cirúrgica — Parte I: aula … · questões … · apostila … · selagem …" com Aplicar/Cancelar', /💡 Adiantar #8 CIR4 Especialidade Cirúrgica — Parte I: aula (QUA|QUI|SEX|SÁB|DOM|SEG) \d\d\/1[01] \([\d,]+h.*\) · questões .* · apostila .* · selagem .*\./.test(pr.text) && pr.btns.includes('Aplicar') && pr.btns.includes('Cancelar'), pr.text);
        const before = await getLS(page, CFG);
        await clickIn(page, 'trilha-adv', 'Cancelar');
        check('Cancelar não grava nada', JSON.stringify(await getLS(page, CFG)) === JSON.stringify(before));
        await clickIn(page, 'trilha-adv', '⏩ Adiantar próximo módulo'); await clickIn(page, 'trilha-adv', 'Aplicar');
        const cfg = await getLS(page, CFG); const p85 = cfg.trilhaPlan[85] || {};
        check('Aplicar: trilhaPlan[85] = { wk: 27/10, via: "adv", 4 datas até 02/11 } e trilhaWeeks[27/10].adv = [85]', p85.wk === '2026-10-27' && p85.via === 'adv' && STG.every(ts => p85[ts] && p85[ts] >= '2026-10-28' && p85[ts] <= '2026-11-02') && JSON.stringify(cfg.trilhaWeeks['2026-10-27'].adv) === '[85]', JSON.stringify(p85));
        await clickDate(page, br(p85.aula)); const dA = await readDay(page);
        check('a aula de CIR4 Parte I aparece no dia proposto (cadeia inserida nos dias)', dA.blocks.some(b => b.tm === 85 && b.ts === 'aula'));
        check('o ⏩ some (a semana tem etapa aberta de novo)', !(await banner(page, 'trilha-adv')));
        const t1 = await trilhaRows(page); const N1 = Number(t1.counts.match(/cabem (\d+)/)[1]);
        check('linha de alcance avança um: N ' + N0 + ' → ' + N1, N1 === N0 + 1 && t1.lineAfter === N1, t1.line);
    });

    // ── TR7 · Adiantar com dias insuficientes (SEG 02/11): desfecho B "Começar agora"; na terça a T3 abre sem o 85 ──
    await scenario(browser, 'TR7-adiantar-B', '2026-10-20', {}, async (S) => {
        await markUntil(S.page, '2026-10-26'); await S.reopen('2026-10-27'); await markUntil(S.page, '2026-11-02'); let page = await S.reopen('2026-11-02');
        await clickIn(page, 'trilha-adv', '⏩ Adiantar próximo módulo');
        const pr = await banner(page, 'trilha-adv'); console.log('   💡', pr.text.replace(/\n/g, ' '));
        check('desfecho B: "A cadeia completa de #8 CIR4 … não cabe nos dias que restam nesta semana … Posso começar agora: aula SEG 02/11 …" + "Começar agora"', /A cadeia completa de #8 CIR4 Especialidade Cirúrgica — Parte I não cabe nos dias que restam nesta semana sem quebrar os intervalos/.test(pr.text) && /Posso começar agora: aula (⚠️ )?SEG 02\/11 \([\d,]+h\)/.test(pr.text) && /para a semana seguinte\./.test(pr.text) && pr.btns.includes('Começar agora'), pr.text);
        await clickIn(page, 'trilha-adv', 'Começar agora');
        const cfg = await getLS(page, CFG);
        check('Começar agora: trilhaPlan[85].via = "adv", aula 02/11', cfg.trilhaPlan[85] && cfg.trilhaPlan[85].via === 'adv' && cfg.trilhaPlan[85].aula === '2026-11-02', JSON.stringify(cfg.trilhaPlan[85]));
        page = await S.reopen('2026-11-03');
        const W = (await getLS(page, CFG)).trilhaWeeks['2026-11-03'];
        check('na terça 03/11 a T3 abre os próximos da fila: mods [86, 1, 2, 3] (o adiantado não conta para fechar a semana)', W && JSON.stringify(W.mods) === '[86,1,2,3]' && W.q === 4, JSON.stringify(W));
    });

    // ── TR8 · subida destravada 🔓 (a semana passada fechou depois do congelamento) ──
    await scenario(browser, 'TR8-subida-2710', '2026-10-20', {}, async (S) => {
        await markUntil(S.page, '2026-10-26', [[5, 'seal']]); let page = await S.reopen('2026-10-27');
        const W = (await getLS(page, CFG)).trilhaWeeks['2026-10-27'];
        check('T2 congela SEGURADA: { q: 3, base: 4, held: true, why: "fechamento", mods: [19, 24, 32] }', W.q === 3 && W.base === 4 && W.held === true && W.why === 'fechamento' && JSON.stringify(W.mods) === '[19,24,32]', JSON.stringify(W));
        check('sem 🔓 enquanto a semana passada não fecha (só o ⏳ da selagem pendente)', !(await banner(page, 'trilha-rise')) && !!(await banner(page, 'trilha-pending')));
        await clickCardBtn(page, /Trauma I — Avaliação Inicial/, /^Selagem/); await clickTab(page, 'CRONOGRAMA');
        const rise = await banner(page, 'trilha-rise');
        check('marcar a selagem de CIR1 no card ⇒ "🔓 A semana passada fechou — o ritmo desta semana pode subir para 4."', !!rise && /🔓 A semana passada fechou — o ritmo desta semana pode subir para 4\./.test(rise.text) && rise.btns.includes('Ver proposta') && rise.btns.includes('Agora não'), rise && rise.text);
        await clickIn(page, 'trilha-rise', 'Ver proposta'); const pv = await banner(page, 'trilha-rise'); console.log('   💡', pv.text.replace(/\n/g, ' '));
        await clickIn(page, 'trilha-rise', 'Aplicar');
        const cfg = await getLS(page, CFG); const W2 = cfg.trilhaWeeks['2026-10-27'];
        check('Aplicar: q 4, held false, rise [34], trilhaPlan[34].via = "rise"', W2.q === 4 && W2.held === false && JSON.stringify(W2.rise) === '[34]' && cfg.trilhaPlan[34] && cfg.trilhaPlan[34].via === 'rise', JSON.stringify(W2));
    });
    await scenario(browser, 'TR8b-subida-agora-nao', '2026-10-20', {}, async (S) => {
        await markUntil(S.page, '2026-10-26', [[5, 'seal']]); let page = await S.reopen('2026-10-27');
        await clickCardBtn(page, /Trauma I — Avaliação Inicial/, /^Selagem/); await clickTab(page, 'CRONOGRAMA');
        await clickIn(page, 'trilha-rise', 'Agora não');
        const cfg = await getLS(page, CFG);
        check('"Agora não" ⇒ trilhaDismiss["2026-10-27|rise"] = 27/10 e o 🔓 some', cfg.trilhaDismiss && cfg.trilhaDismiss['2026-10-27|rise'] === '2026-10-27' && !(await banner(page, 'trilha-rise')), JSON.stringify(cfg.trilhaDismiss));
    });

    // ── TR9 · ficou para trás ⏳ → "Ver como recolocar" (só grava com Aplicar; origem e histórico guardados) ──
    await scenario(browser, 'TR9-recolocar-2510', '2026-10-20', {}, async (S) => {
        const tr = { 5: { aula: true, aulaAt: '2026-10-21', questoesD2: true, questoesD2At: '2026-10-22' } }; await setLS(S.page, TRL, tr);
        const page = await S.reopen('2026-10-25');
        const pend = await banner(page, 'trilha-pending');
        check('⏳ "Ficaram para trás 1 etapa (CIR1 · apostila de SEX 23/10) — sem culpa: posso propor novos dias."', !!pend && /Ficaram para trás 1 etapa \(CIR1 · apostila de SEX 23\/10\) — sem culpa: posso propor novos dias\./.test(pend.text), pend && pend.text);
        await clickIn(page, 'trilha-pending', 'Ver como recolocar'); const pv = await banner(page, 'trilha-pending'); console.log('   💡', pv.text.replace(/\n/g, ' '));
        check('a proposta diz o dia novo, o antigo e o intervalo fora da faixa', /CIR1 · apostila DOM 25\/10 \([\d,]+h\) \(antes: SEX 23\/10; 3 dias após as questões — fora de 1–2\)/.test(pv.text) && !/TER 27\/10/.test(pv.text), pv.text);
        await clickIn(page, 'trilha-pending', 'Aplicar');
        const p5 = (await getLS(page, CFG)).trilhaPlan[5];
        check('Aplicar: apostila 25/10 (orig 23/10), selagem recolocada, hist "recolocar"; nada em 27/10', p5.apost === '2026-10-25' && p5.orig.apost === '2026-10-23' && p5.hist.every(h => h.why === 'recolocar') && p5.seal !== '2026-10-27' && dd(p5.apost, p5.seal) >= 2 && dd(p5.apost, p5.seal) <= 5, JSON.stringify(p5));
        await clickDate(page, '23/10'); const sx = await readDay(page);
        check('SEX 23/10 guarda a linha "↷ Trilha · CIR1 — apostila recolocada para DOM 25/10"', has(sx, /^↷ Trilha · CIR1 — apostila recolocada para DOM 25\/10$/));
        check('o ⏳ some depois de Aplicar', !(await banner(page, 'trilha-pending')));
    });

    // ── TR11 · mover etapa da Trilha com aviso de espaçamento (pode cruzar semanas; grava no plano, não materializa dias) ──
    const moveT = async (page, blockRe, toISO) => {
        await page.evaluate(() => { if (![...document.querySelectorAll('button')].some(b => b.innerText.trim() === '✓ Pronto')) { const e = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === '✎ Reorganizar dia'); if (e) e.click(); } }); await page.waitForTimeout(200);
        const r = await page.evaluate(([bs, to]) => { const bre = new RegExp(bs); const blocks = [...document.querySelectorAll('div')].filter(el => el.style && /^3px solid/.test(el.style.borderLeft)); const el = blocks.find(b => { const body = b.children[0] && b.children[0].children[2]; const s = body && body.querySelector('span'); return s && bre.test(s.textContent.trim()); }); if (!el) return 'bloco não encontrado'; const sel = [...el.querySelectorAll('select')].find(s => [...s.options].some(o => /mover p\/ dia/.test(o.textContent))); if (!sel) return 'select não encontrado'; if (![...sel.options].some(o => o.value === to)) return 'opção ' + to + ' ausente: ' + [...sel.options].map(o => o.value).join(','); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(sel, to); sel.dispatchEvent(new Event('change', { bubbles: true })); return true; }, [blockRe.source, toISO]);
        if (r !== true) throw new Error(r); await page.waitForTimeout(350);
    };
    const readAsk = (page) => page.evaluate(() => { const el = document.querySelector('[data-pw="move-ask"]'); if (!el) return null; return { text: el.innerText, btns: [...el.querySelectorAll('button')].map(b => b.innerText.trim()) }; });
    const clickAsk = async (page, label) => { const ok = await page.evaluate((l) => { const el = document.querySelector('[data-pw="move-ask"]'); const b = el && [...el.querySelectorAll('button')].find(b => b.innerText.trim() === l); if (!b) return false; b.click(); return true; }, label); if (!ok) throw new Error('botão do diálogo: ' + label); await page.waitForTimeout(350); };
    await scenario(browser, 'TR11-mover-2010', '2026-10-20', {}, async (S) => {
        let page = S.page;
        await clickDate(page, '22/10'); await moveT(page, /^Trilha · CIR1 — Trauma I .*30 questões/, '2026-10-26');
        const ask = await readAsk(page); console.log('   ', ask && ask.text.replace(/\n/g, ' | '));
        check('mover as questões de CIR1 de QUI 22/10 para SEG 26/10 ⇒ aviso "a apostila 3 dias ANTES das questões" com Mover assim mesmo / Ver como reorganizar o fio / Cancelar', !!ask && /a apostila 3 dias ANTES das questões/.test(ask.text) && ['Mover assim mesmo', 'Ver como reorganizar o fio', 'Cancelar'].every(b => ask.btns.includes(b)), ask && ask.text);
        const before = await getLS(page, CFG);
        await clickAsk(page, 'Cancelar');
        check('Cancelar não grava nada', JSON.stringify(await getLS(page, CFG)) === JSON.stringify(before) && !(await getLS(page, SCH)));
        await moveT(page, /^Trilha · CIR1 — Trauma I .*30 questões/, '2026-10-26'); await clickAsk(page, 'Ver como reorganizar o fio');
        const ask2 = await readAsk(page); console.log('   ', ask2.text.replace(/\n/g, ' | '));
        check('"Ver como reorganizar" nunca propõe a TER 27/10 (plantão longo)', /💡 Reorganizar CIR1 Trauma I/.test(ask2.text) && !/27\/10/.test(ask2.text.split('💡')[1] || ''), ask2.text);
        await clickAsk(page, 'Aplicar');
        const p5 = (await getLS(page, CFG)).trilhaPlan[5];
        check('Aplicar: trilhaPlan[5].quest = 26/10 + apostila/selagem reorganizadas (hist "reorganizar"), sem dias novos no schedule_v1', p5.quest === '2026-10-26' && p5.apost > '2026-10-26' && p5.hist.length >= 2 && p5.hist.every(h => h.why === 'reorganizar') && !(await getLS(page, SCH)), JSON.stringify(p5));
        await clickDate(page, '26/10'); const sg = await readDay(page);
        check('SEG 26/10 mostra as questões de CIR1', sg.blocks.some(b => b.tm === 5 && b.ts === 'quest'));
        // cruzar a semana: a selagem de CIR1 Trauma I sai da T2 para a T3 (fora da faixa) ⇒ aviso; "Mover assim mesmo" grava só ela (hist "mover")
        await navWeek(page, 1); await clickDate(page, '30/10'); await moveT(page, /^Trilha · CIR1 — Trauma I .*selagem/, '2026-11-04');
        const ask3 = await readAsk(page);
        check('mover a selagem para QUA 04/11 (semana seguinte) avisa "a selagem a 7 dias da apostila (ideal: ~3 dias)"', !!ask3 && /a selagem a 7 dias da apostila \(ideal: ~3 dias\)/.test(ask3.text), ask3 && ask3.text);
        await clickAsk(page, 'Mover assim mesmo');
        const p5c = (await getLS(page, CFG)).trilhaPlan[5];
        check('"Mover assim mesmo": trilhaPlan[5].seal = 04/11 (cruzou a semana), hist "mover", sem dias no schedule_v1', p5c.seal === '2026-11-04' && p5c.hist[p5c.hist.length - 1].why === 'mover' && !(await getLS(page, SCH)), JSON.stringify(p5c.hist.slice(-1)));
        await navWeek(page, 1); await clickDate(page, '04/11'); const q4 = await readDay(page);
        check('a selagem aparece na QUA 04/11', q4.blocks.some(b => b.tm === 5 && b.ts === 'seal'));
    });

    // ── TR12 · registro separado: o card mostra a Trilha; o curso fica guardado; backup leva trail_v1 ──
    await scenario(browser, 'TR12-registro-2110', '2026-10-21', { [PRG]: { 5: { aula: true, questoesD2: true, apostila: true, smartcard: true, completedAt: '2026-03-01', accSelagem: 90, aulaPresencial: true, aulaPresencialAt: '2026-01-21' } } }, async (S) => {
        const page = S.page;
        check('nenhum alerta de revisão do registro antigo (o CIR1 do curso está vencido desde março)', !/Revisões no prazo/.test(await bodyText(page)));
        await clickDate(page, '21/10'); const q = await readDay(page);
        check('cadeia completa sempre: a aula de CIR1 Trauma I está na QUA 21/10 mesmo com o curso marcado', q.blocks.some(b => b.tm === 5 && b.ts === 'aula'));
        const card = await readCard(page, /Trauma I — Avaliação Inicial/); const body = await bodyText(page);
        check('card: 0% na Trilha + "Curso (até 19/10, guardado): ✓ aula · ✓ D2 · ✓ apostila · ✓ selagem · presencial 21/01"', card && card.pct === '0' && /Curso \(até 19\/10, guardado\): ✓ aula · ✓ D2 · ✓ apostila · ✓ selagem · presencial 21\/01/.test(body), JSON.stringify(card));
        check('card na Trilha: badges "Curso S3", "TRILHA #1", "ATÉ 01/01"; sem ATUAL/DESATRASO; presencial só leitura', /Curso S3/.test(body) && /TRILHA #1/.test(body) && /ATÉ 01\/01/.test(body) && !/DESATRASO\n/.test(body) && !card.btns.some(b => /Aula presencial/.test(b)));
        const prg0 = await getLS(page, PRG);
        await clickCardBtn(page, /Trauma I — Avaliação Inicial/, /D2 · 30q/);
        const tr = await getLS(page, TRL);
        check('marcar D2 no card ⇒ trail_v1[5].questoesD2 + questoesD2At = 21/10; progress_v1 intocado', tr[5] && tr[5].questoesD2 === true && tr[5].questoesD2At === '2026-10-21' && JSON.stringify(await getLS(page, PRG)) === JSON.stringify(prg0), JSON.stringify(tr));
        const filt = await page.evaluate(() => [...document.querySelectorAll('button')].map(b => b.innerText.trim()).filter(t => /Nesta semana da Trilha|No alcance até 01\/01|Fora do alcance/.test(t)));
        check('filtros da aba Módulos na Trilha: Nesta semana da Trilha · No alcance até 01/01 · Fora do alcance', filt.length === 3, filt.join(' | '));
        await clickTab(page, 'SONO');
        const [dl] = await Promise.all([page.waitForEvent('download'), page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Baixar backup/.test(x.innerText)); b.click(); })]);
        const data = JSON.parse(require('fs').readFileSync(await dl.path(), 'utf8'));
        check('backup da aba Sono traz medplanner_trail_v1 (e o progress_v1 guardado)', !!data.data['medplanner_trail_v1'] && !!data.data['medplanner_progress_v1']);
    });

    // ── TR13 · primeiro acesso real no meio da semana (QUI 22/10) com localStorage antigo realista ──
    await scenario(browser, 'TR13-primeiro-acesso-2210', '2026-10-22', {
        [CFG]: { ...baseCfg, catchupPace: 2, fioWeek: { '2026-10-07': [75, 76], '2026-10-14': [77, 78] }, lightDayOverrides: { '2026-10-14': 6 }, weekGroups: { 38: [[74, 92], [73]] } },
        [PRG]: { 77: { aula: true, questoesD2: true }, 79: { aulaPresencial: true, aulaPresencialAt: '2026-10-14' } },
        [SCH]: { '2026-10-26': [{ id: 'o1', d: 'ANKI', color: '#0369A1', text: 'Anki + Meditação 15min', time: '35min' }, { id: 'o2', d: 'DESAT', color: '#B91C1C', text: 'Fio 1 · toque 3: apostila dirigida pelos erros (bloco antigo) + Feynman — fecha o fio', time: '1.5h' }, { id: 'o3', d: 'LAZER', color: '#6B7280', text: 'Lazer à noite ❤️', time: 'livre' }] },
    }, async (S) => {
        const page = S.page; const cfg = await getLS(page, CFG); const p = cfg.trilhaPlan || {};
        check('1º acesso em 22/10: trilhaFirstOpen = 22/10 e a T1 congela a partir de hoje (nenhuma aula antes de 22/10)', cfg.trilhaFirstOpen === '2026-10-22' && cfg.trilhaWeeks['2026-10-20'] && cfg.trilhaWeeks['2026-10-20'].q === 3 && Object.values(p).every(x => x.aula >= '2026-10-22'), JSON.stringify(cfg.trilhaWeeks['2026-10-20']));
        check('o histórico do curso fica: fioWeek, weekGroups, progress_v1 e schedule_v1 intactos', JSON.stringify(cfg.fioWeek) === JSON.stringify({ '2026-10-07': [75, 76], '2026-10-14': [77, 78] }) && cfg.weekGroups[38] && (await getLS(page, PRG))[77].aula === true && !!(await getLS(page, SCH))['2026-10-26']);
        await clickDate(page, '26/10'); const sg = await readDay(page); console.log(fmt(sg));
        const old = sg.blocks.find(b => /^Fio 1 · toque 3/.test(b.text));
        check('dia editado ANTES da Trilha (26/10) continua valendo; o bloco antigo vira nota (sem tarefa, sem cartão)', !!old && !old.tasks.length && !old.mod);
        const cov = await banner(page, 'trilha-coverage');
        const planned26 = Object.entries(p).filter(([, x]) => STG.some(ts => x[ts] === '2026-10-26'));
        check('aviso de etapa da Trilha ausente na lista editada de 26/10' + (planned26.length ? '' : ' (nada planejado para 26/10)'), planned26.length ? (!!cov && /📝 SEG 26\/10: a lista editada deste dia não traz/.test(cov.text) && /↺ Voltar ao padrão traz a Trilha \(sua edição fica guardada\)/.test(cov.text)) : true, cov && cov.text);
        await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Voltar ao padr/.test(x.innerText)); b.click(); }); await page.waitForTimeout(400);
        const arc = JSON.parse(await page.evaluate(() => localStorage.getItem('medplanner_schedule_archive_v1')) || '{}');
        check('"↺ Voltar ao padrão" guarda a edição em medplanner_schedule_archive_v1 e traz a Trilha', arc['2026-10-26'] && arc['2026-10-26'][0].list.length === 3 && !(await getLS(page, SCH))['2026-10-26'] && !(await banner(page, 'trilha-coverage')), JSON.stringify(arc).slice(0, 120));
        await navWeek(page, -1); const w41 = await readDay(page);
        check('Sem.41: lightDayOverrides["2026-10-14"] = 6 apontava para a TER 20/10 → ignorado (Auto)', w41.light && w41.light.value === 'auto', JSON.stringify(w41.light));
    });

    // ── TR14 · registro em 1 toque no bloco e "Revisei" no registro da Trilha ──
    await scenario(browser, 'TR14-um-toque-2610', '2026-10-20', {}, async (S) => {
        await setLS(S.page, TRL, { 60: { aula: true, questoesD2: true, apostila: true, smartcard: true, completedAt: '2026-10-16', accSelagem: 75 } });
        let page = await S.reopen('2026-10-26');
        await clickDate(page, '21/10'); await clickTask(page, /^Trilha · CIR1 — Trauma I .*aula online/, null);
        let tr = await getLS(page, TRL);
        check('✓ do bloco de aula (QUA 21/10, dia passado) ⇒ trail_v1[5].aula com carimbo 21/10 (min(hoje, data do bloco))', tr[5] && tr[5].aula === true && tr[5].aulaAt === '2026-10-21', JSON.stringify(tr[5]));
        await clickDate(page, '22/10'); await clickTask(page, /^Trilha · CIR1 — Trauma I .*30 questões/, /D2 · 30q/); await typeBlockPct(page, /^Trilha · CIR1 — Trauma I .*30 questões/, 72);
        tr = await getLS(page, TRL);
        check('"D2 · 30q (toque 2) ✓" + % no bloco ⇒ questoesD2 (22/10) e accD2 72 no trail_v1', tr[5].questoesD2 === true && tr[5].questoesD2At === '2026-10-22' && tr[5].accD2 === 72, JSON.stringify(tr[5]));
        const card = await readCard(page, /Trauma I — Avaliação Inicial/);
        check('o card reflete (aula e D2 marcados, 72%)', card.btns.some(b => /^✓ Aula 1\.5x/.test(b)) && card.btns.some(b => /^✓ D2 · 30q/.test(b)) && card.pcts.includes('72'), JSON.stringify(card));
        await clickCardBtn(page, /Trauma I — Avaliação Inicial/, /Apostila pelos erros/); await clickTab(page, 'CRONOGRAMA'); await clickDate(page, '23/10');
        const sx = await readDay(page);
        check('caminho inverso: apostila marcada no card aparece ✓ no bloco de SEX 23/10', sx.blocks.some(b => b.tm === 5 && b.ts === 'apost' && b.done));
        await clickDate(page, '26/10'); const sg = await readDay(page);
        const rv = sg.blocks.find(b => /^Revisão adaptativa/.test(b.text));
        check('SEG 26/10: bloco "Revisão adaptativa" (D+7 do PED5 Nefrologia Pediátrica, % 75 → 7 dias: venceu 23/10)', !!rv);
        await page.evaluate(() => { const blocks = [...document.querySelectorAll('div')].filter(el => el.style && /^3px solid/.test(el.style.borderLeft)); const el = blocks.find(b => /^Revisão adaptativa/.test((b.querySelector('span:nth-of-type(2)') || b).innerText) || /Revisão adaptativa/.test(b.innerText.split('\n').slice(0, 3).join(' '))); const b = [...el.querySelectorAll('button')].find(x => x.innerText.trim() === 'Revisei'); b.click(); }); await page.waitForTimeout(250);
        await page.fill('input[placeholder="% acerto"]', '85'); await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.innerText.trim() === 'OK'); b.click(); }); await page.waitForTimeout(300);
        tr = await getLS(page, TRL);
        check('"Revisei" + 85% ⇒ trail_v1[60] { reviewD7Done, r1DoneAt 26/10, accR1 85 } (registro da Trilha, não o do curso)', tr[60].reviewD7Done === true && tr[60].r1DoneAt === '2026-10-26' && tr[60].accR1 === 85 && !(await getLS(page, PRG)), JSON.stringify(tr[60]));
    });

    // ── dia leve previsto: aula nunca no dia leve; etapa ali só de menor demanda e sinalizada ──
    await scenario(browser, 'TRleve-dia-leve-previsto', '2026-10-19', {}, async (S) => {
        const page = S.page; await navWeek(page, 1); const bad = [], flagged = [], lights = [];
        for (let k = 0; k < 11; k++) { const w = await readWeekT(page); const any = Object.values(w)[0]; const L = any.light && any.light.note ? any.light.note.slice(0, 9) : null; lights.push(L);
            Object.entries(w).forEach(([d, x]) => { if (x.lightBadge || x.breatherBadge || (L && L.slice(4) === d)) { x.blocks.forEach(b => { if (b.ts === 'aula' && !b.au) bad.push(d); if (b.tm != null && !b.au) { if (/🌿 dia leve — etapa de menor demanda/.test(b.text)) flagged.push(d + ' ' + b.ts); else bad.push(d + ' sem sinal'); } }); } });
            if (k < 10) await navWeek(page, 1); }
        console.log('   dias leves previstos:', lights.join(' · '));
        check('nenhuma aula no dia leve previsto; etapa no dia leve só sinalizada "🌿 dia leve — etapa de menor demanda"', !bad.length, bad.join(', ') + ' | sinalizadas: ' + flagged.join(', '));
    });

    // ── startDate 14/01: a numeração do curso muda, a Trilha não ──
    await scenario(browser, 'TRstart-1401', '2026-10-20', { [CFG]: { startDate: '2026-01-14', manualWeek: null } }, async (S) => {
        const page = S.page; const hw = await headerWeek(page); const body = await bodyText(page);
        const cfg = await getLS(page, CFG);
        check('startDate 14/01: Sem.41 = 20/10–26/10, badge "Trilha 1/11", trilhaWeeks["2026-10-20"].mods = [5, 6, 14]', hw.week === 41 && hw.range === '20/10–26/10' && /Trilha 1\/11/.test(body) && JSON.stringify(cfg.trilhaWeeks['2026-10-20'].mods) === '[5,6,14]', JSON.stringify(hw));
        await navWeek(page, 12); const h2 = await headerWeek(page);
        check('▶ para na Sem.51 = 29/12–01/01', h2.week === 51 && h2.range === '29/12–01/01', JSON.stringify(h2));
    });

    await browser.close();
    H.summary('trilha');
})();
