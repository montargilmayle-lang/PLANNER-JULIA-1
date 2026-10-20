// HISTÓRICO INTACTO (⚙️, Trilha 20/10): compara o app ANTES da Trilha (PLANNER_BASE ou o commit HIST_REF) com o novo (PLANNER_FILE),
// semanas 1–41, dia a dia (07/01–19/10), lendo os BLOCOS da tela. Dois modos:
//   A · relógio na quarta de cada semana (semana corrente = a comparada)
//   B · relógio em 21/10 (já na Trilha), navegando ◀ até a Sem.1
// Diferença aceita (lista explícita): a TER 20/10 sai da Sem.41 (vira o 1º dia da Trilha) — e só ela.
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
const ALLOWED = new Set(['20/10']); // TER 20/10: deixou a Sem.41 (1º dia da Trilha)
const norm = (d) => JSON.stringify({ title: d.title, venv: d.venv, warn: d.warn, simBtn: d.simBtn, weekBadge: d.weekBadge, light: d.light, lightBadge: d.lightBadge, breatherBadge: d.breatherBadge, blocks: d.blocks.map(b => ({ tag: b.tag, text: b.text, time: b.time, mod: b.mod, mods: b.mods, tasks: b.tasks, done: b.done, pctInputs: b.pctInputs })) });
async function readWeek(page) { const out = {}; for (const t of await H.listDayTabs(page)) { await H.clickDate(page, t.date); out[t.date] = await H.readDay(page); } return out; }
async function openWith(browser, file, dateISO) { // openPlanner com arquivo explícito (o harness lê FILE na carga do módulo)
    const ctx = await browser.newContext({ viewport: { width: 420, height: 900 }, locale: 'pt-BR', timezoneId: 'America/Bahia' });
    const page = await ctx.newPage();
    page.on('pageerror', e => H.results.push({ id: 'pageerror (' + path.basename(file) + ' ' + dateISO + '): ' + e.message, ok: false, evidence: '' }));
    await page.addInitScript((dd) => { const F = new Date(dd + 'T12:00:00').getTime(); const O = Date; class M extends O { constructor(...a) { a.length === 0 ? super(F) : super(...a); } static now() { return F; } } window.Date = M; }, dateISO);
    await page.addInitScript(() => { if (sessionStorage.getItem('__s')) return; sessionStorage.setItem('__s', '1'); localStorage.setItem('medplanner_seed_weekend_20260627', 'true'); });
    await page.route('**/*', r => r.request().url().startsWith('file://') ? r.continue() : r.abort());
    await page.goto('file://' + file, { waitUntil: 'load' }); await page.waitForTimeout(900);
    return { ctx, page };
}
function compareWeek(tag, w, base, neu) {
    const dates = Object.keys(base);
    let same = 0; const diffs = [];
    for (const d of dates) {
        if (!(d in neu)) { if (ALLOWED.has(d)) continue; diffs.push(d + ' ausente no novo'); continue; }
        if (norm(base[d]) === norm(neu[d])) same++; else diffs.push(d);
    }
    Object.keys(neu).forEach(d => { if (!(d in base)) diffs.push(d + ' só no novo'); });
    const expectN = w === LCW ? dates.length - 1 : dates.length;
    H.check(tag + ' Sem.' + w + ': ' + same + '/' + expectN + ' dias idênticos ao histórico' + (w === LCW ? ' (TER 20/10 saiu: 1º dia da Trilha)' : ''), !diffs.length && same === expectN, diffs.join(', ') || 'ok');
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
        console.log('\n══════════ MODO B · relógio em 21/10 (Trilha), navegando ◀ ══════════');
        const b = await openWith(browser, BASE, '2026-10-21'), n = await openWith(browser, NEW, '2026-10-21');
        await H.navWeek(b.page, -1); await H.navWeek(n.page, -1);
        for (let w = LCW; w >= 1; w--) {
            if (!weeks.length || weeks.includes(w)) { const wb = await readWeek(b.page), wn = await readWeek(n.page); compareWeek('B', w, wb, wn); }
            if (w > 1) { await H.navWeek(b.page, -1); await H.navWeek(n.page, -1); }
        }
        await b.ctx.close(); await n.ctx.close();
    }
    await browser.close();
    H.summary('historico');
})();
