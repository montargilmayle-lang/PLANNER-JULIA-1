// USO REAL DA TRILHA (😴 ⚙️, início 26/10): o motor do app (o mesmo arquivo do planner, carregado num vm do Node, sem navegador) simulado dia a dia.
//   (1) varredura do 1º acesso: para cada data de 26/10 a 28/12, a prévia que ela vê ao abrir — cota da T1, alcance N e o dia mais carregado até o fim do
//       calendário visível (P.endISO: os dias de janeiro com etapa entram — regra de 01/01, S3b);
//   (2) progressiva: 1º acesso em 26/10, ela faz tudo no dia (carimbo = o dia), selagens a 50, 70 e 85%, revisões vencidas feitas no dia em que a
//       revisão não é opcional (decisão 73) — até a cauda acabar (P.live falso depois de 01/01: cadeias de janeiro e revisões até o horizonte R-a): aulas até 01/01,
//       cadeias fechadas até 01/01 e no total, o dia mais carregado, quantos dias uma revisão desliza, o "lembro até" (R-a, S6) e as revisões que sobraram;
//       variante a 70% sem fazer revisão desde 02/01 (as sobras vão para o balanço com a data).
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
H.check('alcance pelo dia do 1º acesso = "aulas até 01/01" (S5: a aula conta até 01/01; as selagens de PED2 e HEM1 em janeiro já não tiram o módulo da conta — no S3b eram 32 · 31 · 30): 26 e 27/10 → 34 · 28–30/10 → 33 · 31/10, 01/11 e 02/11 → 32', JSON.stringify(sweep.slice(0, 8).map(r => r.N)) === '[34,34,33,33,33,32,32,32]', JSON.stringify(sweep.slice(0, 8).map(r => r.N)));
// (2) progressiva a partir de hoje
console.log('\n══════════ PROGRESSIVA: 1º acesso 26/10, ela faz tudo no dia ══════════');
const TS_FIELD = { aula: 'aula', quest: 'questoesD2', apost: 'apostila', seal: 'smartcard' }, STAMP = { aula: 'aulaAt', quest: 'questoesD2At', apost: 'apostilaAt', seal: 'smartcardAt' };
const prog = [], progV = [];
for (const [pct, stopRev] of [[50, null], [70, null], [85, null], [70, '2027-01-02']]) { // stopRev: a variante que deixa de fazer revisão nessa data (R-a, S6)
    let cfg = { startDate: '2026-01-07', manualWeek: null }, trail = {}, mx = 0, md = '', maxSlip = 0, lastD = END, closedEnd = 0, hz02 = null, hzLast = null, endDay = null, sobras = [], sobrasAll = -1, revAfter = 0; const over = [];
    for (let d = '2026-10-26'; d <= '2027-06-28'; d = T0.addDaysISO(d, 1)) { // até a cauda acabar (P.live falso depois de 01/01): as cadeias fecham em janeiro (S3b) e as revisões seguem até o horizonte R-a (S6, §10.3)
        const E = load(FILE, d);
        let P = E.buildTrilhaPlan(cfg, trail, d); const patch = E.trilhaFreezePatch(cfg, trail, d, P, {}); if (patch) { cfg = { ...cfg, ...patch }; P = E.buildTrilhaPlan(cfg, trail, d); }
        if (d > END && !P.live) { endDay = d; sobras = E.computeReviews(trail, P.revEnd || d); sobrasAll = E.computeReviews(trail, '2027-06-28').length; const X = { cfg, P, trail, hoje: d }; for (let k = d; k <= P.endISO; k = E.addDaysISO(k, 1)) if (E.trilhaListFor(k, X).some(b => b.d === 'REV')) revAfter++; break; } // R-a (DELA 9): o que sobrou vai para o balanço com a data (computeReviews até o horizonte); dia além dele sem bloco de revisão
        lastD = d; if (d === '2027-01-02') hz02 = P.revEnd; if (d > END) hzLast = P.revEnd; // "lembro até" no 1º dia da cauda e o último horizonte com a cauda viva
        const list = E.trilhaListFor(d, { cfg, P, trail, hoje: d, ov: {} });
        const tot = E.dayLoadHours(list); if (tot > mx) { mx = tot; md = d; } if (tot > CAP + 1e-9) over.push(fmt(d) + ' ' + h2(tot));
        const rev = list.find(b => b.d === 'REV'), due = E.computeReviews(trail, d), nt = JSON.parse(JSON.stringify(trail));
        list.forEach(b => { if (b.tm == null || b.au || b.gh) return; const t = nt[b.tm] = nt[b.tm] || {}; t[TS_FIELD[b.ts]] = true; t[STAMP[TS_FIELD[b.ts]]] = d; if (b.ts === 'seal') { t.completedAt = d; t.accSelagem = pct; } });
        if (rev && rev.time !== 'opcional' && !(stopRev && d >= stopRev)) due.forEach(r => { const t = nt[r.id]; if (r.daysLate > maxSlip) maxSlip = r.daysLate; if (r.kind === 'D+7') { t.reviewD7Done = true; t.r1DoneAt = d; t.accR1 = pct; } else if (r.kind === 'D+30') { t.reviewD30Done = true; t.r2DoneAt = d; t.accR2 = pct; } else { t.reviewR3Done = true; } });
        trail = nt; if (d === END) closedEnd = Object.values(trail).filter(t => t.aula && t.questoesD2 && t.apostila && t.smartcard).length; // fechados até o fim de 01/01
    }
    const closed = Object.values(trail).filter(t => t.aula && t.questoesD2 && t.apostila && t.smartcard).length, aulas = Object.values(trail).filter(t => t.aula && t.aulaAt <= END).length, aulaJan = Object.values(trail).filter(t => t.aula && t.aulaAt > END).length;
    const lastSeal = Object.values(trail).map(t => t.completedAt).filter(Boolean).sort().pop(); // o dia da selagem (a simulação grava completedAt; os carimbos das etapas caem no dia planejado)
    (stopRev ? progV : prog).push({ pct, closed, closedEnd, aulas, aulaJan, lastSeal, mx, md, over, maxSlip, hz02, hzLast, endDay, sobras, sobrasAll, revAfter });
    console.log(`   selagens a ${pct}%${stopRev ? ' (sem fazer revisão desde ' + fmt(stopRev) + ')' : ''} · ${aulas} aulas até 01/01 · ${closedEnd} módulos fechados até 01/01 e ${closed} no total (última selagem ${fmt(lastSeal)}; simulação até ${fmt(lastD)}) · dia mais carregado ${fmt(md)} ${h2(mx)} · revisão desliza no máximo ${maxSlip} dia(s)`);
    console.log(`      R-a: lembro até (02/01) ${hz02 ? fmt(hz02) : '—'} (estimado) · último horizonte ${hzLast ? fmt(hzLast) : '—'} · a cauda acaba (P.live falso) em ${endDay ? fmt(endDay) : '—'} · blocos de revisão depois do horizonte: ${revAfter} · sobras ${sobras.length}${sobras.length ? ': ' + sobras.slice().sort((a, b) => a.due < b.due ? -1 : 1).map(r => r.code + ' ' + r.kind + ' (venceu ' + fmt(r.due) + ')').join(' · ') : ''}`);
}
H.check('progressiva (selagens a 50, 70 e 85%): 34 aulas até 01/01 e as 34 cadeias fecham (32 até 01/01 e 2 em janeiro, até 03/01 — teto por etapa e decisão 7; eram 36 até 01/01: 1 aula por dia e K), nenhuma aula depois de 01/01', prog.every(p => p.aulas === 34 && p.closed === 34 && p.closedEnd === 32 && !p.aulaJan && p.lastSeal <= '2027-01-03'), prog.map(p => p.pct + '%: ' + p.aulas + ' aulas · ' + p.closedEnd + '/' + p.closed + ' fechados · última ' + p.lastSeal).join(' · '));
H.check('progressiva: nenhum dia acima de 14,5h, com as revisões', prog.every(p => !p.over.length), prog.map(p => p.pct + '%: ' + (p.over.join(', ') || 'pior ' + fmt(p.md) + ' ' + h2(p.mx))).join(' · '));
H.check('progressiva: revisão vencida desliza no máximo 1 dia (decisão 73)', prog.every(p => p.maxSlip <= 1), prog.map(p => p.pct + '%: ' + p.maxSlip).join(' · '));
const raOk = (p) => p.hz02 === '2027-02-02' && !!p.endDay && !!p.hzLast && p.endDay > p.hzLast && p.revAfter === 0 && p.sobras.length === p.sobrasAll && p.sobras.every(r => r.due <= p.hzLast); // R-a (DELA 9; S6)
H.check('progressiva (R-a, DELA 9; S6): em 02/01 o app lembra até 02/02 (estimado) nos três % e na variante; a cauda acaba (P.live falso) depois do último horizonte, e dali até o fim da última semana visível nenhum dia tem bloco de revisão; as sobras são TODAS as revisões pendentes, vencidas até o horizonte (vão para o balanço com a data) — na variante sem revisão desde 02/01 o app lembra até 02/02 e as pendentes viram sobras', prog.every(raOk) && progV.every(p => raOk(p) && p.hzLast === '2027-02-02' && p.sobras.length > 0), prog.concat(progV).map(p => p.pct + '%: 02/01 ' + p.hz02 + ' · horizonte ' + p.hzLast + ' · fim ' + p.endDay + ' · blocos depois ' + p.revAfter + ' · sobras ' + p.sobras.length + '/' + p.sobrasAll).join(' · '));
H.summary('simTrilha');
