// HISTÓRICO INTACTO (⚙️, fim do curso 19/10 · pós-curso 20/10 · Trilha 26/10): compara o app ANTES da Trilha (PLANNER_BASE ou o commit HIST_REF)
// com o novo (PLANNER_FILE), semanas 1–41, dia a dia (07/01–19/10), lendo os BLOCOS da tela. Quatro modos:
//   A · relógio na quarta de cada semana (semana corrente = a comparada)
//   B · relógio em 21/10 (transição, Sem.42), navegando ◀ até a Sem.1
//   C · relógio em 26/10 (hoje: 1º dia da Trilha, Sem.43), navegando ◀ até a Sem.1 — a base está na sua Sem.42 (21–27/10): ◀1 na base, ◀2 no novo
//   D · dias 20 e 21/10 gravados depois do curso não mudam a Sem.41 (o dia leve histórico lê a TER 20/10): D1 gravados pela versão de 20/10 (Trilha
//       desde 20/10, com etapas e ✓); D2 ela marca ✓ nos dias de transição na versão nova; D3 uma edição de 20/10 feita no tempo do curso (no app de
//       antes da Trilha, em 15/10) continua valendo, também depois de uma aba antiga apagar o registro (D3b) ou de um "↺" na versão de 20/10 (D5);
//       D4 nada gravado na 1ª carga e depois a TER 20/10 só com um bloco dela; D6 o mesmo feito na versão de 20/10; D7 a TER 20/10 esvaziada depois do curso
//       (lista vazia não prova nada: vale o gerado); D8 bloco criado na noite de 19/10 conta como do curso em qualquer fuso — sempre × o app de antes da Trilha
// Diferença aceita (lista explícita): a TER 20/10 sai da Sem.41 (vira o 1º dia pós-curso — a transição) — e só ela.
const H = require('./harness.js');
const { execSync } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');
const NEW = H.FILE;
let BASE = process.env.PLANNER_BASE;
if (!BASE) {
    const ref = process.env.HIST_REF || '11c65b8';
    BASE = path.join(os.tmpdir(), 'planner_base_' + ref + '.html');
    fs.writeFileSync(BASE, execSync('git -C ' + JSON.stringify(path.resolve(__dirname, '..')) + ' show ' + ref + ':planner_residencia_2026_offline.html'));
}
const START = '2026-01-07', LCW = 41;
const addDays = (iso, k) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + k); return d.toISOString().slice(0, 10); };
const ALLOWED = new Set(['20/10']); // TER 20/10: deixou a Sem.41 (1º dia pós-curso / transição)
const norm = (d) => JSON.stringify({ title: d.title, venv: d.venv, warn: d.warn, simBtn: d.simBtn, weekBadge: d.weekBadge, light: d.light, lightBadge: d.lightBadge, breatherBadge: d.breatherBadge, blocks: d.blocks.map(b => ({ tag: b.tag, text: b.text, time: b.time, mod: b.mod, mods: b.mods, tasks: b.tasks, done: b.done, pctInputs: b.pctInputs })) });
async function readWeek(page) { const out = {}; for (const t of await H.listDayTabs(page)) { await H.clickDate(page, t.date); out[t.date] = await H.readDay(page); } return out; }
async function openWith(browser, file, dateISO, seeds, tz) { // openPlanner com arquivo explícito (o harness lê FILE na carga do módulo)
    const ctx = await browser.newContext({ viewport: { width: 420, height: 900 }, locale: 'pt-BR', timezoneId: tz || 'America/Bahia' });
    const page = await ctx.newPage();
    page.on('pageerror', e => H.results.push({ id: 'pageerror (' + path.basename(file) + ' ' + dateISO + '): ' + e.message, ok: false, evidence: '' }));
    await page.addInitScript((dd) => { const F = new Date(dd + 'T12:00:00').getTime(); const O = Date; class M extends O { constructor(...a) { a.length === 0 ? super(F) : super(...a); } static now() { return F; } } window.Date = M; }, dateISO);
    await page.addInitScript((sd) => { if (sessionStorage.getItem('__s')) return; sessionStorage.setItem('__s', '1'); localStorage.setItem('medplanner_seed_weekend_20260627', 'true'); Object.keys(sd || {}).forEach(k => localStorage.setItem(k, JSON.stringify(sd[k]))); }, seeds || null);
    await page.route('**/*', r => r.request().url().startsWith('file://') ? r.continue() : r.abort());
    await page.goto('file://' + file, { waitUntil: 'load' }); await page.waitForTimeout(900);
    return { ctx, page };
}
function compareWeek(tag, w, base, neu, sameLen) {
    const dates = Object.keys(base);
    let same = 0; const diffs = [];
    for (const d of dates) {
        if (!(d in neu)) { if (ALLOWED.has(d)) continue; diffs.push(d + ' ausente no novo'); continue; }
        if (norm(base[d]) === norm(neu[d])) same++; else diffs.push(d);
    }
    Object.keys(neu).forEach(d => { if (!(d in base)) diffs.push(d + ' só no novo'); });
    const expectN = w === LCW && !sameLen ? dates.length - 1 : dates.length; // a base de antes da Trilha tem a TER 20/10 na Sem.41; a versão anterior (modo D) não
    H.check(tag + ' Sem.' + w + ': ' + same + '/' + expectN + ' dias idênticos ao histórico' + (w === LCW ? ' (TER 20/10 saiu: 1º dia de transição; Trilha em 26/10)' : ''), !diffs.length && same === expectN, diffs.join(', ') || 'ok');
    if (diffs.length) diffs.slice(0, 2).forEach(d => { const k = d.slice(0, 5); if (base[k] && neu[k]) { console.log('      BASE ' + k + ':\n' + H.fmt(base[k])); console.log('      NOVO ' + k + ':\n' + H.fmt(neu[k])); } });
}
(async () => {
    const browser = await H.pw.chromium.launch();
    const weeks = (process.argv[2] || '').split(',').filter(Boolean).map(Number);
    const list = weeks.length ? weeks : Array.from({ length: LCW }, (_, i) => i + 1);
    if (!process.argv[3] || process.argv[3] === 'A') {
        console.log('\n══════════ MODO A · relógio na quarta de cada semana ══════════');
        for (const w of list) {
            const wed = addDays(START, 7 * (w - 1));
            const b = await openWith(browser, BASE, wed), n = await openWith(browser, NEW, wed);
            const wb = await readWeek(b.page), wn = await readWeek(n.page);
            compareWeek('A', w, wb, wn);
            await b.ctx.close(); await n.ctx.close();
        }
    }
    if (!process.argv[3] || process.argv[3] === 'B') {
        console.log('\n══════════ MODO B · relógio em 21/10 (transição), navegando ◀ ══════════');
        const b = await openWith(browser, BASE, '2026-10-21'), n = await openWith(browser, NEW, '2026-10-21');
        await H.navWeek(b.page, -1); await H.navWeek(n.page, -1);
        for (let w = LCW; w >= 1; w--) {
            if (!weeks.length || weeks.includes(w)) { const wb = await readWeek(b.page), wn = await readWeek(n.page); compareWeek('B', w, wb, wn); }
            if (w > 1) { await H.navWeek(b.page, -1); await H.navWeek(n.page, -1); }
        }
        await b.ctx.close(); await n.ctx.close();
    }
    if (!process.argv[3] || process.argv[3] === 'C') {
        console.log('\n══════════ MODO C · relógio em 26/10 (1º dia da Trilha), navegando ◀ ══════════');
        const b = await openWith(browser, BASE, '2026-10-26'), n = await openWith(browser, NEW, '2026-10-26');
        await H.navWeek(b.page, -1); await H.navWeek(n.page, -2); // base: Sem.42 (21–27/10) → 41 · novo: Sem.43 (T1) → 42 (transição) → 41
        const hb = await H.headerWeek(b.page), hn = await H.headerWeek(n.page);
        H.check('C · os dois chegam à Sem.41 (base ' + hb.range + ' · novo ' + hn.range + ')', hb.week === LCW && hn.week === LCW && hn.range === '14/10–19/10', JSON.stringify([hb, hn]));
        for (let w = LCW; w >= 1; w--) {
            if (!weeks.length || weeks.includes(w)) { const wb = await readWeek(b.page), wn = await readWeek(n.page); compareWeek('C', w, wb, wn); }
            if (w > 1) { await H.navWeek(b.page, -1); await H.navWeek(n.page, -1); }
        }
        await b.ctx.close(); await n.ctx.close();
    }
    if (!process.argv[3] || process.argv[3] === 'D') {
        console.log('\n══════════ MODO D · 20 e 21/10 gravados depois do curso × a Sem.41 do app de antes da Trilha ══════════');
        const mk = (iso, items) => items.map((x, i) => ({ id: 'g-' + iso + '-' + i, color: '#475569', time: '1h', ...x }));
        const seeds = {
            medplanner_config_v1: { startDate: START, manualWeek: null, trilhaFirstOpen: '2026-10-20', trilhaWeeks: { '2026-10-20': { q: 3, base: 3, held: false, why: null, mods: [5, 6, 14], adv: [], rise: [], short: 0, light: '2026-10-24', at: '2026-10-20' } }, trilhaPlan: { 5: { wk: '2026-10-20', via: 'ramp', aula: '2026-10-21', quest: '2026-10-22', apost: '2026-10-23', seal: '2026-10-26', orig: { aula: '2026-10-21', quest: '2026-10-22', apost: '2026-10-23', seal: '2026-10-26' }, hist: [] } } },
            medplanner_schedule_v1: {
                '2026-10-20': mk('2026-10-20', [{ d: 'AMB', text: '🚑 Plantão 06h–19h — sem etapa de mesa hoje: só Anki e áudio nos tempos mortos', time: '13h' }, { d: 'ANKI', text: 'Anki no trajeto — 20min (meditação 10min no almoço ou à noite)', time: '20min', done: true }, { d: 'D3', text: '🎧 Áudio (opcional, nos tempos mortos) — aula de CIR1 Trauma I — Avaliação Inicial e Trauma de Tórax (planejada QUA 21/10). O conteúdo visual (imagens, ECG, dermatoscopia) precisa do vídeo depois.', time: 'opcional', tm: 5, ts: 'aula', au: 1 }, { d: 'GYM', text: 'Academia — opcional, só se sobrar energia', time: '30min' }, { d: 'LAZER', text: 'Jantar, banho, sono cedo (plantão de 13h: dormir ~21h45)', time: 'livre' }]),
                '2026-10-21': mk('2026-10-21', [{ d: 'ANKI', text: 'Anki no trajeto — 20min', time: '20min', done: true }, { d: 'AMB', text: '🚑 Plantão 13h–18h · estude antes ou depois · nos tempos mortos a aula pode ser em áudio (o visual precisa do vídeo depois)', time: '5h' }, { d: 'D3', text: 'Trilha · CIR1 — Trauma I — Avaliação Inicial e Trauma de Tórax: aula online 1.5x + resumo — aula antes das questões, sempre', time: '1.7h', tm: 5, ts: 'aula' }, { d: 'GYM', text: 'Academia — horário livre', time: '1h' }, { d: 'LAZER', text: 'Noite leve — plantão 06h amanhã: dormir ~21h45', time: 'livre' }]),
            },
        };
        const toS41 = async (page, back) => { await H.navWeek(page, -back); const h = await H.headerWeek(page); return h; };
        // D1 · listas de 20 e 21/10 gravadas pela versão de 20/10 (ela marcou ✓): a nova lê o gerado do curso, como o app de antes da Trilha
        let b = await openWith(browser, BASE, '2026-10-19'), n = await openWith(browser, NEW, '2026-10-26', seeds);
        const hn = await toS41(n.page, 2); const hb = await H.headerWeek(b.page);
        H.check('D1 · os dois na Sem.41 (base ' + hb.range + ' · nova ' + hn.range + ')', hb.week === LCW && hn.week === LCW && hn.range === '14/10–19/10', JSON.stringify([hb, hn]));
        const wb = await readWeek(b.page); compareWeek('D1', LCW, wb, await readWeek(n.page));
        const lo = (await H.getLS(n.page, 'medplanner_config_v1')).trilhaLegacyOv || {};
        H.check('D1 · as listas da versão de 20/10 não entram no histórico: trilhaLegacyOv = { 20/10: null, 21/10: null }', lo['2026-10-20'] === null && lo['2026-10-21'] === null, JSON.stringify(lo));
        // D2 · na versão nova ela marca ✓ nos dias de transição 20 e 21/10 (o dia é gravado): a Sem.41 não muda
        await H.navWeek(n.page, 1); await H.clickDate(n.page, '20/10'); await H.clickTask(n.page, /Academia/); await H.clickDate(n.page, '21/10'); await H.clickTask(n.page, /Academia/);
        const sov = await H.getLS(n.page, 'medplanner_schedule_v1') || {};
        H.check('D2 · 20 e 21/10 gravados com o ✓ da academia (e o ✓ do Anki que veio da versão de 20/10)', [20, 21].every(d => ['GYM', 'ANKI'].every(t => (sov['2026-10-' + d] || []).some(a => a.d === t && a.done))), JSON.stringify([20, 21].map(d => (sov['2026-10-' + d] || []).map(a => a.d + (a.done ? '✓' : '')).join(' '))));
        await H.navWeek(n.page, -1); compareWeek('D2', LCW, wb, await readWeek(n.page));
        await b.ctx.close(); await n.ctx.close();
        // D3 · no tempo do curso (app de antes da Trilha, 15/10) ela tirou um bloco de estudo da TER 20/10: o dia leve da Sem.41 que ela via continua o mesmo
        const e = await openWith(browser, BASE, '2026-10-15'); await H.clickDate(e.page, '20/10');
        const d20 = await H.readDay(e.page); const first = d20.blocks[0];
        await H.clickTask(e.page, new RegExp('^' + first.text.slice(0, 12).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
        const sovE = await H.getLS(e.page, 'medplanner_schedule_v1') || {}; let l20 = sovE['2026-10-20'] || [];
        const heavy = l20.map((a, k) => [k, H.parseH(a.time)]).filter(([k]) => /^D\d/.test(l20[k].d)).sort((x, y) => y[1] - x[1])[0];
        H.check('D3 · a edição do tempo do curso tem ids do curso (g-41-6-…) e um bloco de estudo a tirar', l20.length > 0 && l20.every(a => /^g-41-6-|^c-/.test(a.id)) && !!heavy, JSON.stringify(l20.map(a => a.id + ':' + a.d)));
        l20 = l20.filter((_, k) => !heavy || k !== heavy[0]); await e.ctx.close();
        const seedsC = { medplanner_config_v1: { startDate: START, manualWeek: null }, medplanner_schedule_v1: { '2026-10-20': l20 } };
        b = await openWith(browser, BASE, '2026-10-19', seedsC); n = await openWith(browser, NEW, '2026-10-26', seedsC);
        await toS41(n.page, 2); const wb3 = await readWeek(b.page);
        H.check('D3 · a edição muda o dia leve da Sem.41 no app de antes da Trilha (o caso testa algo)', JSON.stringify(Object.values(wb3).map(d => d.light)) !== JSON.stringify(Object.values(wb).map(d => d.light)), JSON.stringify(Object.values(wb3)[0].light));
        compareWeek('D3', LCW, wb3, await readWeek(n.page));
        const cfg3 = await H.getLS(n.page, 'medplanner_config_v1'), sov3 = await H.getLS(n.page, 'medplanner_schedule_v1');
        H.check('D3 · a edição do curso fica em trilhaLegacyOv[20/10] e a TER 20/10 vira dia de transição', JSON.stringify((cfg3.trilhaLegacyOv || {})['2026-10-20']) === JSON.stringify(l20) && (sov3['2026-10-20'] || []).some(a => a.pc), JSON.stringify(Object.keys(cfg3.trilhaLegacyOv || {})));
        // D3b · uma aba da versão de 20/10 que ficou aberta regrava a config sem trilhaLegacyOv: ao abrir de novo, a edição do curso volta do arquivo
        await n.page.evaluate(() => { const c = JSON.parse(localStorage.getItem('medplanner_config_v1')); delete c.trilhaLegacyOv; delete c.trilhaInicio; c.manualWeek = null; localStorage.setItem('medplanner_config_v1', JSON.stringify(c)); });
        const r3 = await H.reopen(browser, n.ctx, n.page, '2026-10-26'); n = r3;
        const lo3b = ((await H.getLS(n.page, 'medplanner_config_v1')) || {}).trilhaLegacyOv || {};
        H.check('D3b · trilhaLegacyOv apagado por uma aba antiga: a edição do curso de 20/10 volta do arquivo', JSON.stringify(lo3b['2026-10-20']) === JSON.stringify(l20), JSON.stringify(lo3b['2026-10-20'] || null).slice(0, 120));
        await toS41(n.page, 2); compareWeek('D3b', LCW, wb3, await readWeek(n.page));
        await b.ctx.close(); await n.ctx.close();
        // D5 · a versão de 20/10 tirou a edição do curso de 20/10 com "↺ Voltar ao padrão" (o original foi para o arquivo): a Sem.41 que ela via continua a mesma
        const seedsR = { medplanner_config_v1: { startDate: START, manualWeek: null }, medplanner_schedule_archive_v1: { '2026-10-20': [{ at: '2026-10-20', list: l20 }] } };
        const n5 = await openWith(browser, NEW, '2026-10-26', seedsR);
        const lo5 = ((await H.getLS(n5.page, 'medplanner_config_v1')) || {}).trilhaLegacyOv || {};
        H.check('D5 · ↺ na versão de 20/10: a edição do curso vem do arquivo para trilhaLegacyOv[20/10]', JSON.stringify(lo5['2026-10-20']) === JSON.stringify(l20) && lo5['2026-10-21'] === null, JSON.stringify(Object.keys(lo5)));
        await toS41(n5.page, 2); compareWeek('D5', LCW, wb3, await readWeek(n5.page));
        await n5.ctx.close();
        // D6 · na versão de 20/10 ela tirou tudo de TER 20/10 e deixou só um bloco dela (id c-<hora> de 20/10): não é edição do curso
        const seeds6 = { medplanner_config_v1: { startDate: START, manualWeek: null }, medplanner_schedule_v1: { '2026-10-20': [{ id: 'c-1792508400000', d: 'EXTRA', color: '#0EA5E9', text: 'Revisar anotações do plantão (meu)', time: '3h' }] } };
        const n6 = await openWith(browser, NEW, '2026-10-26', seeds6);
        const lo6 = ((await H.getLS(n6.page, 'medplanner_config_v1')) || {}).trilhaLegacyOv || {};
        H.check('D6 · bloco criado em 20/10 (versão de 20/10) não vira edição do curso: trilhaLegacyOv[20/10] = null', lo6['2026-10-20'] === null, JSON.stringify(lo6));
        await toS41(n6.page, 2); compareWeek('D6', LCW, wb, await readWeek(n6.page));
        await n6.ctx.close();
        // D7 · na versão de 20/10 ela esvaziou a TER 20/10 (lista vazia) — com e sem "↺" depois: lista vazia não prova edição do curso, vale o gerado
        for (const [tag, sd] of [['D7a (↺: [] no arquivo)', { medplanner_schedule_archive_v1: { '2026-10-20': [{ at: '2026-10-20', list: [] }] } }], ['D7b ([] gravado)', { medplanner_schedule_v1: { '2026-10-20': [] } }]]) {
            const n7 = await openWith(browser, NEW, '2026-10-26', { medplanner_config_v1: { startDate: START, manualWeek: null }, ...sd });
            const lo7 = ((await H.getLS(n7.page, 'medplanner_config_v1')) || {}).trilhaLegacyOv || {};
            H.check(tag.slice(0, 3) + ' · TER 20/10 esvaziada depois do curso ' + tag.slice(3) + ': trilhaLegacyOv[20/10] = null', lo7['2026-10-20'] === null, JSON.stringify(lo7));
            await toS41(n7.page, 2); compareWeek(tag.slice(0, 3), LCW, wb, await readWeek(n7.page));
            await n7.ctx.close();
        }
        // D8 · bloco que ela criou no tempo do curso, na noite de 19/10 (23h30 em Salvador = 00h30 de 20/10 em Fernando de Noronha): é do curso em qualquer fuso
        const own19 = [{ id: 'c-1792463400000', d: 'EXTRA', color: '#0EA5E9', text: 'Plano da semana (meu, 19/10 à noite)', time: '2h' }];
        for (const tz of ['America/Bahia', 'America/Noronha']) {
            const n8 = await openWith(browser, NEW, '2026-10-26', { medplanner_config_v1: { startDate: START, manualWeek: null }, medplanner_schedule_v1: { '2026-10-20': own19 } }, tz);
            const lo8 = ((await H.getLS(n8.page, 'medplanner_config_v1')) || {}).trilhaLegacyOv || {};
            H.check('D8 · bloco criado em 19/10 às 23h30 (Salvador) conta como edição do curso com o aparelho em ' + tz, JSON.stringify(lo8['2026-10-20']) === JSON.stringify(own19), JSON.stringify(lo8));
            await n8.ctx.close();
        }
        // D4 · 1ª carga da versão nova sem 20 e 21/10 gravados; depois ela tira tudo de TER 20/10 e deixa só um bloco dela: ao abrir de novo, a Sem.41 não muda
        const m4 = await openWith(browser, NEW, '2026-10-26');
        const lo4 = ((await H.getLS(m4.page, 'medplanner_config_v1')) || {}).trilhaLegacyOv || {};
        H.check('D4 · 1ª carga da versão nova (nada gravado em 20 e 21/10): trilhaLegacyOv = { 20/10: null, 21/10: null }', lo4['2026-10-20'] === null && lo4['2026-10-21'] === null, JSON.stringify(lo4));
        await m4.page.evaluate(() => { const s = JSON.parse(localStorage.getItem('medplanner_schedule_v1') || '{}'); s['2026-10-20'] = [{ id: 'c-1793026800000', d: 'EXTRA', color: '#0EA5E9', text: 'Revisar anotações do plantão (meu)', time: '3h' }]; localStorage.setItem('medplanner_schedule_v1', JSON.stringify(s)); });
        const r4 = await H.reopen(browser, m4.ctx, m4.page, '2026-10-26');
        await toS41(r4.page, 2); compareWeek('D4', LCW, wb, await readWeek(r4.page));
        const s4 = (await H.getLS(r4.page, 'medplanner_schedule_v1')) || {};
        H.check('D4 · a TER 20/10 fica como ela deixou nesta versão (só o bloco dela — dia editado continua valendo)', JSON.stringify((s4['2026-10-20'] || []).map(a => a.id)) === '["c-1793026800000"]', JSON.stringify((s4['2026-10-20'] || []).map(a => a.id)));
        await r4.ctx.close();
    }
    await browser.close();
    H.summary('historico');
})();
