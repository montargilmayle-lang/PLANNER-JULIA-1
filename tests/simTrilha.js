// USO REAL DA TRILHA (😴 ⚙️, início 26/10): o motor do app (o mesmo arquivo do planner, carregado num vm do Node, sem navegador) simulado dia a dia.
//   (1) varredura do 1º acesso: para cada data de 26/10 a 28/12, a prévia que ela vê ao abrir — cota da T1, alcance N e o dia mais carregado até o fim do
//       calendário visível (P.endISO: os dias de janeiro com etapa entram — regra de 01/01, S3b);
//   (2) progressiva: 1º acesso em 26/10, ela faz tudo no dia (carimbo = o dia), selagens a 50, 70 e 85%, revisões vencidas feitas no dia em que a
//       revisão não é opcional (decisão 73) — até não sobrar cadeia aberta (janeiro inclusive): aulas até 01/01, cadeias fechadas até 01/01 e no total, o dia
//       mais carregado e quantos dias uma revisão desliza.
// Rodar: node simTrilha.js   (PLANNER_FILE = outro arquivo do planner)
const fs = require('fs'), vm = require('vm');
const H = require('./harness.js');
function load(file, dateISO) { // o corpo de __bootApp num vm com stubs (React, DOM, localStorage) e o relógio fixo em dateISO
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    const s = lines.findIndex(l => l.startsWith('function __bootApp(){'));
    let e = -1; for (let i = s; i < lines.length; i++) if (lines[i].startsWith('  var el = document.getElementById("root");')) { e = i; break; }
    if (s < 0 || e < 0) throw new Error('corpo do app não encontrado em ' + file);
    const names = ['buildTrilhaPlan', 'trilhaListFor', 'dayLoadHours', 'addDaysISO', 'trilhaFreezePatch', 'computeReviews', 'moduleCompleteP'];
    const code = '(function(){"use strict";\n' + lines.slice(s + 1, e).join('\n').replace(/^"use strict";/m, '') + '\n;globalThis.__E = {' + names.map(n => `${n}: (typeof ${n} !== "undefined" ? ${n} : undefined)`).join(',') + '};\n})();';
    const F = new Date(dateISO + 'T12:00:00').getTime(), O = Date;
    class M extends O { constructor(...a) { a.length === 0 ? super(F) : super(...a); } static now() { return F; } }
    const noop = () => {}, store = {};
    const React = { useState: (v) => [typeof v === 'function' ? v() : v, noop], useEffect: noop, useCallback: (f) => f, useMemo: (f) => f(), useRef: (v) => ({ current: v }), createElement: () => null, Fragment: 'f' };
    const ctx = { React, ReactDOM: { createRoot: () => ({ render: noop }) }, Date: M, Math, JSON, console, setTimeout, clearTimeout,
        localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
        document: { getElementById: () => null, addEventListener: noop }, navigator: { userAgent: '' }, alert: noop, confirm: () => true };
    ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx); vm.runInContext(code, ctx);
    return ctx.__E;
}
const FILE = H.FILE, CAP = 14.5, END = '2027-01-01';
const fmt = (iso) => iso.slice(8, 10) + '/' + iso.slice(5, 7), h2 = (x) => x.toFixed(2).replace('.', ',') + 'h';
const T0 = load(FILE, '2026-10-26');
// (1) varredura do 1º acesso
console.log('\n══════════ VARREDURA DO 1º ACESSO (26/10 → 28/12): a prévia que ela vê ao abrir ══════════');
const sweep = [];
for (let f = '2026-10-26'; f <= '2026-12-28'; f = T0.addDaysISO(f, 1)) {
    const E = load(FILE, f); let cfg = { startDate: '2026-01-07', manualWeek: null };
    let P = E.buildTrilhaPlan(cfg, {}, f); const patch = E.trilhaFreezePatch(cfg, {}, f, P, {}); if (patch) { cfg = { ...cfg, ...patch }; P = E.buildTrilhaPlan(cfg, {}, f); }
    let mx = 0, md = ''; const X = { cfg, P, trail: {}, hoje: f };
    for (let d = f; d <= P.endISO; d = E.addDaysISO(d, 1)) { const t = E.dayLoadHours(E.trilhaListFor(d, X)); if (t > mx) { mx = t; md = d; } } // até o fim do calendário visível (S3b: a carga de janeiro também passa pelo 14,5h)
    const W1 = P.weeks['2026-10-26'] || {};
    sweep.push({ f, N: P.N, mx, md, q1: f <= '2026-11-02' ? W1.q : null });
}
sweep.filter(r => r.f <= '2026-11-03').forEach(r => console.log(`   1º acesso ${fmt(r.f)} · T1 = ${r.q1 == null ? '—' : r.q1} · alcance ${r.N} · dia mais carregado ${fmt(r.md)} ${h2(r.mx)}`));
const atCap = sweep.filter(r => Math.abs(r.mx - CAP) < 1e-9).map(r => fmt(r.f));
console.log(`   … ${sweep.length} datas; no limite de 14,5h (sem passar): ${atCap.join(', ') || 'nenhuma'}`);
H.check('varredura: 64 datas de 1º acesso (26/10 → 28/12), nenhuma deixa dia acima de 14,5h na prévia', sweep.length === 64 && sweep.every(r => r.mx <= CAP + 1e-9), sweep.filter(r => r.mx > CAP + 1e-9).map(r => fmt(r.f) + '→' + fmt(r.md)).join(', ') || 'pior ' + h2(Math.max(...sweep.map(r => r.mx))));
const q = (d) => sweep.find(r => r.f === d);
H.check('cota da T1 pelo dia do 1º acesso (decisão 71, 8 dias): 26 e 27/10 → 3 · 28–30/10 → 2 · 31/10 e 01/11 → 1 · 02/11 → 0', JSON.stringify(['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'].map(d => q(d).q1)) === '[3,3,2,2,2,1,1,0]', JSON.stringify(sweep.slice(0, 8).map(r => r.q1)));
H.check('alcance pelo dia do 1º acesso (re-medido no S3b: 1 aula por dia, K e as selagens de janeiro fora da conta "até 01/01" — o S5 troca a conta): 26 e 27/10 → 32 · 28–30/10 → 31 · 31/10, 01/11 e 02/11 → 30', JSON.stringify(sweep.slice(0, 8).map(r => r.N)) === '[32,32,31,31,31,30,30,30]', JSON.stringify(sweep.slice(0, 8).map(r => r.N)));
// (2) progressiva a partir de hoje
console.log('\n══════════ PROGRESSIVA: 1º acesso 26/10, ela faz tudo no dia ══════════');
const TS_FIELD = { aula: 'aula', quest: 'questoesD2', apost: 'apostila', seal: 'smartcard' }, STAMP = { aula: 'aulaAt', quest: 'questoesD2At', apost: 'apostilaAt', seal: 'smartcardAt' };
const prog = [];
for (const pct of [50, 70, 85]) {
    let cfg = { startDate: '2026-01-07', manualWeek: null }, trail = {}, mx = 0, md = '', maxSlip = 0, lastD = END, closedEnd = 0; const over = [];
    for (let d = '2026-10-26'; d <= '2027-03-31'; d = T0.addDaysISO(d, 1)) { // até não sobrar cadeia aberta (regra de 01/01, S3b: as cadeias fecham em janeiro)
        const E = load(FILE, d);
        let P = E.buildTrilhaPlan(cfg, trail, d); const patch = E.trilhaFreezePatch(cfg, trail, d, P, {}); if (patch) { cfg = { ...cfg, ...patch }; P = E.buildTrilhaPlan(cfg, trail, d); }
        if (d > END && Object.keys(cfg.trilhaPlan || {}).every(id => E.moduleCompleteP(trail, id))) break; lastD = d;
        const list = E.trilhaListFor(d, { cfg, P, trail, hoje: d, ov: {} });
        const tot = E.dayLoadHours(list); if (tot > mx) { mx = tot; md = d; } if (tot > CAP + 1e-9) over.push(fmt(d) + ' ' + h2(tot));
        const rev = list.find(b => b.d === 'REV'), due = E.computeReviews(trail, d), nt = JSON.parse(JSON.stringify(trail));
        list.forEach(b => { if (b.tm == null || b.au || b.gh) return; const t = nt[b.tm] = nt[b.tm] || {}; t[TS_FIELD[b.ts]] = true; t[STAMP[TS_FIELD[b.ts]]] = d; if (b.ts === 'seal') { t.completedAt = d; t.accSelagem = pct; } });
        if (rev && rev.time !== 'opcional') due.forEach(r => { const t = nt[r.id]; if (r.daysLate > maxSlip) maxSlip = r.daysLate; if (r.kind === 'D+7') { t.reviewD7Done = true; t.r1DoneAt = d; t.accR1 = pct; } else if (r.kind === 'D+30') { t.reviewD30Done = true; t.r2DoneAt = d; t.accR2 = pct; } else { t.reviewR3Done = true; } });
        trail = nt; if (d === END) closedEnd = Object.values(trail).filter(t => t.aula && t.questoesD2 && t.apostila && t.smartcard).length; // fechados até o fim de 01/01
    }
    const closed = Object.values(trail).filter(t => t.aula && t.questoesD2 && t.apostila && t.smartcard).length, aulas = Object.values(trail).filter(t => t.aula && t.aulaAt <= END).length, aulaJan = Object.values(trail).filter(t => t.aula && t.aulaAt > END).length;
    const lastSeal = Object.values(trail).map(t => t.completedAt).filter(Boolean).sort().pop(); // o dia da selagem (a simulação grava completedAt; os carimbos das etapas caem no dia planejado)
    prog.push({ pct, closed, closedEnd, aulas, aulaJan, lastSeal, mx, md, over, maxSlip });
    console.log(`   selagens a ${pct}% · ${aulas} aulas até 01/01 · ${closedEnd} módulos fechados até 01/01 e ${closed} no total (última selagem ${fmt(lastSeal)}; simulação até ${fmt(lastD)}) · dia mais carregado ${fmt(md)} ${h2(mx)} · revisão desliza no máximo ${maxSlip} dia(s)`);
}
H.check('progressiva (selagens a 50, 70 e 85%): 34 aulas até 01/01 e as 34 cadeias fecham (32 até 01/01 e 2 em janeiro, até 03/01 — teto por etapa e decisão 7; eram 36 até 01/01: 1 aula por dia e K), nenhuma aula depois de 01/01', prog.every(p => p.aulas === 34 && p.closed === 34 && p.closedEnd === 32 && !p.aulaJan && p.lastSeal <= '2027-01-03'), prog.map(p => p.pct + '%: ' + p.aulas + ' aulas · ' + p.closedEnd + '/' + p.closed + ' fechados · última ' + p.lastSeal).join(' · '));
H.check('progressiva: nenhum dia acima de 14,5h, com as revisões', prog.every(p => !p.over.length), prog.map(p => p.pct + '%: ' + (p.over.join(', ') || 'pior ' + fmt(p.md) + ' ' + h2(p.mx))).join(' · '));
H.check('progressiva: revisão vencida desliza no máximo 1 dia (decisão 73)', prog.every(p => p.maxSlip <= 1), prog.map(p => p.pct + '%: ' + p.maxSlip).join(' · '));
H.summary('simTrilha');
