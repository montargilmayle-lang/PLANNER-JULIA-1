// USO REAL DA TRILHA (😴 ⚙️ 📚 🧠, início 26/10; regra de 01/01 — desenho final §10.3): o motor do app (o mesmo arquivo do planner, carregado num vm do Node,
// sem navegador) simulado dia a dia. Cinco partes:
//   (1) varredura do 1º acesso: para cada data de 26/10 a 28/12, a prévia que ela vê ao abrir — cota da T1, os dois números (aulas até 01/01 · cadeias
//       completas) e o dia mais carregado, com a carga conferida até PLAN_HZ (o laço para no fim do calendário visível, P.endISO, ou na última etapa da
//       prévia, o que vier depois: os dias de janeiro com etapa passam pelo 14,5h — testes I10);
//   (2) progressiva: 1º acesso em 26/10, ela faz tudo no dia (carimbo = o dia), selagens a 50, 70 e 85%, revisões vencidas feitas no dia em que a revisão
//       não é opcional (decisão 73), ⏳ aplicado se aparecer — até P.live ficar falso depois de 01/01. Invariantes no registro: nenhuma aula depois de 01/01,
//       toda cadeia fecha, nenhum dia acima de 14,5h, revisão desliza ≤ 1 dia, ≤ 2 aulas por dia (a 2ª só em dia permitido), questões no dia leve só no
//       P3, K ≤ 5 (inclusivo) em todo dia com cadeia nova, faixas GAP_T. Imprime aulas até 01/01, cadeias completas, última etapa, semanas da cauda, dia
//       mais carregado, deslize, "lembro até", carga dia a dia de 29/12 até o fim e os passos usados. Variante a 70% sem revisão desde 02/01 (R-a, S6);
//   (3) realista: T1–T3 congeladas pelo planner de 409e1f9 (git show; sem git o script FALHA — testes I10, como o historico.js) e o motor novo de 17/11
//       em diante; os mesmos invariantes de 17/11 em diante, menos o herdado (09/11 = 4 aulas, 15/11 = 2, picos de K antes de 17/11); imprime os dois
//       números, os dias com 2 aulas (esperado 22/11, 29/11 e 06/12) e a carga dia a dia de 29/12 até o fim. Variante "marcas incompletas": as 3
//       selagens da T1 sem ✓ (ela fez e não marcou; C2) — imprime a T4;
//   (4) unidades U1–U28 das regras de colocação (§10.3, item 4; U25–U26 da revisão S10rv1; U27 da S10rv2; U28 da S10rv3), em estados montados à mão (o U27 e o (c) do U28, numa linha do tempo curta);
//   (5) medições para o relatório (imprimem, não são checks): decisão 7 nos dois ramos (CLOSE_BY_ON true × false, por patch só no vm) no realista e nos
//       estresses S-a…S-d (I × II, confere com o measure7); C1: ofertas do ⏩ em cada dia do realista com a semana fechada (leitura adv × estrita, por
//       patch) e o alcance com a T10 de 0 a 4 (gatilho estrito × largo, por patch; confere com o M-c).
// Rodar: node simTrilha.js   (PLANNER_FILE = outro arquivo do planner · SIM_ONLY = varredura,progressiva,realista,unidades,medicoes · SIM_REF = commit
// do planner antigo do realista, padrão 409e1f9 · SIM_GIT_DIR = repositório, padrão a pasta acima de tests). Os patches do vm (instrumentação de placeChain, CLOSE_BY_ON, gatilho largo, ⏩ estrito) têm contagem exata
// e nunca tocam o arquivo; a instrumentação só registra o passo (P1…P4) de cada colocação.
const fs = require('fs'), vm = require('vm'), os = require('os'), path = require('path');
const { execSync, execFileSync } = require('child_process');
const NAMES = ['buildTrilhaPlan', 'trilhaListFor', 'dayLoadHours', 'studyHours', 'studyWarnFor', 'addDaysISO', 'diffDays', 'trilhaFreezePatch', 'computeReviews', 'moduleCompleteP', 'modById',
    'weekOfISO', 'weekStartISO', 'weekEndISO', 'dowOf', 'simForCfg', 'dayOpenT', 'trilhaRow', 'trilhaBlockedWhy', 'placeChain', 'chainEnum', 'cloneSt', 'trilhaFinalPlan', 'trilhaProposeAdvance',
    'trilhaProposeRecolocar', 'trilhaShiftPlan', 'trilhaCap', 'stAdd', 'stArea', 'stOpenSet', 'kCount', 'areaOf', 'aula2Ok', 'aulaDayOk', 'stageCap', 'trilhaQueue', 'shiftFor', 'postNight', 'HOLIDAY_LIGHT',
    'AULA_END', 'PLAN_HZ', 'K_OPEN', 'CLOSE_BY', 'CLOSE_BY_ON', 'GAP_T', 'HRS_T', 'STAGES_T', '__mkReorg'];
const SRC = {}, SCRIPT = {};
function compiled(file, patches) { // o corpo de __bootApp (com os patches de contagem exata) compilado uma vez por arquivo + patches
    const key = file + '|' + JSON.stringify((patches || []).map(p => [p[0], p[1], p[2]]));
    if (SCRIPT[key]) return SCRIPT[key];
    let src = SRC[file] || (SRC[file] = fs.readFileSync(file, 'utf8')); const skipped = [];
    (patches || []).forEach(([a, b, n, optional]) => { const k = src.split(a).length - 1; if (k !== n) { if (optional) { skipped.push(a.slice(0, 60)); return; } throw new Error('patch do vm: ' + k + ' ocorrência(s) (esperado ' + n + ') de ' + JSON.stringify(a.slice(0, 80))); } src = src.split(a).join(b); });
    const lines = src.split('\n'); const s = lines.findIndex(l => l.startsWith('function __bootApp(){'));
    let e = -1; for (let i = s; i < lines.length; i++) if (lines[i].startsWith('  var el = document.getElementById("root");')) { e = i; break; }
    if (s < 0 || e < 0) throw new Error('corpo do app não encontrado em ' + file);
    const body = '(function(){"use strict";\n' + lines.slice(s + 1, e).join('\n').replace(/^"use strict";/m, '') + '\n;globalThis.__E = {' + NAMES.map(n => `${n}: (typeof ${n} !== "undefined" ? ${n} : undefined)`).join(',') + '};\n})();';
    return (SCRIPT[key] = { script: new vm.Script(body, { filename: path.basename(file) }), skipped });
}
function load(file, dateISO, patches) { // um contexto vm com stubs (React, DOM, localStorage) e o relógio fixo em dateISO; E.__ctx = o global do contexto
    const C = compiled(file, patches);
    const F = new Date(dateISO + 'T12:00:00').getTime(), O = Date;
    class M extends O { constructor(...a) { a.length === 0 ? super(F) : super(...a); } static now() { return F; } }
    const noop = () => {}, store = {};
    const React = { useState: (v) => [typeof v === 'function' ? v() : v, noop], useEffect: noop, useCallback: (f) => f, useMemo: (f) => f(), useRef: (v) => ({ current: v }), createElement: () => null, Fragment: 'f' };
    const ctx = { React, ReactDOM: { createRoot: () => ({ render: noop }) }, Date: M, Math, JSON, console, setTimeout, clearTimeout,
        localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
        document: { getElementById: () => null, addEventListener: noop }, navigator: { userAgent: '' }, alert: noop, confirm: () => true };
    ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx); C.script.runInContext(ctx);
    const E = ctx.__E; E.__ctx = ctx; E.__skipped = C.skipped; return E;
}
if (require.main === module) main(); else module.exports = { load, NAMES }; // o U24 carrega o mesmo carregador num processo filho

function main() {
const H = require('./harness.js');
const FILE = H.FILE, CAP = 14.5, END = '2027-01-01', CLOSE = '2027-01-03', START = '2026-10-26', SWITCH = '2026-11-17', LAST_SWEEP = '2026-12-28';
const ONLY = (process.env.SIM_ONLY || '').split(',').filter(Boolean), ON = (k) => !ONLY.length || ONLY.includes(k);
const CFG0 = { startDate: '2026-01-07', manualWeek: null };
const STG = ['aula', 'quest', 'apost', 'seal'], TSF = { aula: 'aula', quest: 'questoesD2', apost: 'apostila', seal: 'smartcard' }, STAMP = { aula: 'aulaAt', quest: 'questoesD2At', apost: 'apostilaAt', seal: 'smartcardAt' }; // carimbo de CADA etapa (antes só a aula ganhava carimbo)
const add = (iso, k) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + k); return d.toISOString().slice(0, 10); };
const dd = (a, b) => Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 86400000);
const DOW = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'], dw = (iso) => DOW[new Date(iso + 'T12:00:00Z').getUTCDay()];
const fmt = (iso) => iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) : '—', fdw = (iso) => iso ? fmt(iso) + ' ' + dw(iso) : '—', h2 = (x) => x == null ? '—' : (Math.round(x * 100) / 100).toFixed(2).replace('.', ',') + 'h';
const J = (x) => JSON.stringify(x), clone = (x) => JSON.parse(JSON.stringify(x));
const check = (id, ok, ev) => H.check(id, ok, ev);
const section = (name, fn) => { try { fn(); } catch (e) { check('seção ' + name + ' · exceção', false, String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); } };
const E_REF = load(FILE, '2026-12-10'); // referência para funções puras (modById, aula2Ok, GAP_T, …)
const HZ = E_REF.PLAN_HZ || '2027-06-28', GAP = E_REF.GAP_T || { quest: [1, 2], apost: [1, 2], seal: [2, 5] };
const codeOf = (id) => { const m = E_REF.modById(id); return m ? m.code : '#' + id; }, lbl = (id) => { const m = E_REF.modById(id); return m ? m.code + ' ' + m.title.slice(0, 26) : '#' + id; };
console.log('planner: ' + FILE + ' · sha1 ' + require('crypto').createHash('sha1').update(fs.readFileSync(FILE)).digest('hex').slice(0, 12) + ' · AULA_END ' + (E_REF.AULA_END || '—') + ' · PLAN_HZ ' + (E_REF.PLAN_HZ || '—') + (ONLY.length ? ' · SIM_ONLY ' + ONLY.join(',') : ''));

// ── variantes do vm (patches de contagem exata; nunca no arquivo) ──
const P_LOG = ['function placeChain(st, rem, fixed, from, lastFirst, end, opt) {', 'function placeChain(st, rem, fixed, from, lastFirst, end, opt) { const __o = opt || {}, __i = __o.info || {}; const __r = __placeChain0(st, rem, fixed, from, lastFirst, end, __o.info ? __o : { ...__o, info: __i }); if (globalThis.__PCLOG) globalThis.__PCLOG.push({ id: __o.id, novo: !!__o.novo, adv: !!__o.adv, hard: !!__o.hard, compress: !!__o.compress, only: __o.only || null, pass: __i.pass || null, why: __i.why || null, r: __r ? { ...__r } : null }); return __r; } // SONDA simTrilha: registra o passo de cada colocação (não muda nada)\nfunction __placeChain0(st, rem, fixed, from, lastFirst, end, opt) {', 1, true];
const VAR = {
    V0: [P_LOG], // o planner como está (CLOSE_BY_ON = true, gatilho estrito, ⏩ adv)
    OFF: [P_LOG, ['const K_OPEN = 5, CLOSE_BY = "2027-01-03", CLOSE_BY_ON = true;', 'const K_OPEN = 5, CLOSE_BY = "2027-01-03", CLOSE_BY_ON = false;', 1]], // decisão 7, ramo I (intervalo ideal)
    LARGO: [P_LOG, ['const g2 = (q) => hasA && !E(1, q, true, 0, true) && (!!opt.adv || !!E(1, q, false, 0, true));', 'const g2 = (q) => hasA; // SONDA simTrilha (C1, leitura larga: qualquer falha do P1 libera a 2ª aula)', 1]],
    ESTRITO: [P_LOG, ['const o = { prot: P.prot, novo: true, k: K_OPEN, id, adv: true };', 'const o = { prot: P.prot, novo: true, k: K_OPEN, id }; // SONDA simTrilha (C1: ⏩ com o gatilho estrito)', 1]],
};
let HEADF = null, headErr = null; // planner antigo do realista (T1–T3 congeladas por ele)
const needHead = ON('realista') || ON('medicoes') || ON('unidades');
if (needHead) { const ref = process.env.SIM_REF || '409e1f9';
    try { HEADF = path.join(os.tmpdir(), 'planner_sim_' + ref + '.html'); fs.writeFileSync(HEADF, execSync('git -C ' + JSON.stringify(process.env.SIM_GIT_DIR || path.resolve(__dirname, '..')) + ' show ' + ref + ':planner_residencia_2026_offline.html', { stdio: ['ignore', 'pipe', 'pipe'] })); }
    catch (e) { headErr = String(e.message || e).split('\n')[0]; HEADF = null; } }
const varOk = {}; Object.keys(VAR).forEach(v => { try { compiled(FILE, VAR[v]); varOk[v] = true; } catch (e) { varOk[v] = String(e.message || e); } });
let ENGDAY = null, ENGS = {};
function eng(v, d) { if (d !== ENGDAY) { ENGDAY = d; ENGS = {}; } return ENGS[v] || (ENGS[v] = v === 'HEAD' ? load(HEADF, d) : load(FILE, d, VAR[v])); }

// ── um cenário = uma linha do tempo (config + registro) ──
function newScn(name, o) {
    return { name, v: o.v || 'V0', head: !!o.head, pct: o.pct || 70, stopRev: o.stopRev || null, away: o.away || null, stopFrom: o.stopFrom || null, skipT1: !!o.skipT1, applyFrom: o.applyFrom || START, checkFrom: o.checkFrom || START, newFrom: o.newFrom || null,
        offers: o.offers ? [] : null, cfg: { ...CFG0, ...(o.cfg || {}) }, trail: {}, active: true, days: [], passes: [], protAt: {}, frozenAt: {}, autoLogs: [], slips: [], maxEnd: null, hz02: null, hzLast: null, endDay: null,
        nums: {}, sobras: [], sobrasAll: -1, revAfter: 0, snap: {}, err: null, t1: null };
}
function fork(S, name, o) { const T = newScn(name, { ...o, v: o.v || S.v }); T.cfg = { ...clone(S.cfg), ...(o.cfg || {}) }; T.trail = clone(S.trail); T.days = S.days.slice(); T.protAt = { ...S.protAt }; T.frozenAt = { ...S.frozenAt }; T.passes = S.passes.slice(); T.slips = S.slips.slice(); T.snap = S.snap; T.t1 = S.t1; T.head = S.head; T.skipT1 = S.skipT1 && !o.noSkip; return T; }
const lastLog = (L, id, pred) => { for (let i = (L || []).length - 1; i >= 0; i--) { const x = L[i]; if (Number(x.id) === Number(id) && pred(x)) return x; } return null; };
function step(S, E, d) {
    const G = E.__ctx; const away = !!((S.away && S.away(d)) || (S.stopFrom && d >= S.stopFrom));
    G.__PCLOG = []; let P = E.buildTrilhaPlan(S.cfg, S.trail, d); const L1 = G.__PCLOG; G.__PCLOG = [];
    const patch = E.trilhaFreezePatch(S.cfg, S.trail, d, P, {}); const L2 = G.__PCLOG; G.__PCLOG = null;
    if (patch) {
        const prevW = S.cfg.trilhaWeeks || {};
        Object.keys(patch.trilhaWeeks || {}).filter(k => !prevW[k]).sort().forEach(tue => { S.frozenAt[tue] = d; (patch.trilhaWeeks[tue].mods || []).forEach(id => { const e = lastLog(L1, id, x => !x.hard && !!x.r); S.passes.push({ id: Number(id), via: 'rampa', at: d, pass: e ? e.pass : null, days: e ? e.r : null }); }); });
        if (patch.trilhaFinalLog && patch.trilhaFinalAutoAt && patch.trilhaFinalAutoAt !== S.cfg.trilhaFinalAutoAt) { const lg = patch.trilhaFinalLog; S.autoLogs.push({ d, lg });
            [...new Set((lg.moved || []).map(m => m.id))].forEach(id => { const e = lastLog(L2, id, x => x.hard && !!x.r); S.passes.push({ id: Number(id), via: 'auto', at: d, pass: e ? (e.compress ? 'comprimido ' : '') + e.pass : 'guloso', days: { ...(patch.trilhaPlan || {})[id] } }); }); }
        S.cfg = { ...S.cfg, ...patch }; P = E.buildTrilhaPlan(S.cfg, S.trail, d);
    }
    if (S.skipT1 && !S.t1 && (S.cfg.trilhaWeeks || {})['2026-10-26']) S.t1 = (S.cfg.trilhaWeeks['2026-10-26'].mods || []).map(Number);
    if (d > END && !P.live) return finalize(S, E, P, d);
    if (P.endISO && (!S.maxEnd || P.endISO > S.maxEnd)) S.maxEnd = P.endISO;
    if (d === '2027-01-02') S.hz02 = P.revEnd; if (d > END) S.hzLast = P.revEnd;
    if (['2026-11-17', '2026-12-15', '2026-12-29', '2027-01-01', '2027-01-02'].includes(d)) S.nums[d] = { N: P.N, NC: P.NC };
    S.protAt[d] = (P.prot || {})[d] || null;
    let applied = null; const pendN = (P.pending || []).length;
    if (pendN && !away && d >= S.applyFrom) { // ⏳ "Ver como recolocar" + Aplicar no 1º dia em que ela está (como o App grava: hist "recolocar")
        const jobs = E.trilhaProposeRecolocar(P, S.cfg, S.trail, d, {}); const plan = { ...(S.cfg.trilhaPlan || {}) }; applied = [];
        jobs.forEach(j => { if (!j.days) { applied.push(codeOf(j.id) + ' sem proposta'); return; } const p = { ...plan[j.id] }; const hist = (p.hist || []).slice();
            j.rem.forEach(ts => { const to = j.days[ts], fr = p[ts]; if (!to || to === fr) return; p[ts] = to; hist.push({ ts, from: fr || null, to, at: d, why: 'recolocar' }); }); p.hist = hist; plan[j.id] = p;
            S.passes.push({ id: Number(j.id), via: '⏳', at: d, pass: j.info ? j.info.pass || null : null, days: { ...j.days } }); applied.push(codeOf(j.id) + ' ' + j.rem.map(ts => ts + ' ' + fmt(j.days[ts])).join(',')); });
        S.cfg = { ...S.cfg, trilhaPlan: plan }; P = E.buildTrilhaPlan(S.cfg, S.trail, d); if (S.nums[d]) S.nums[d + ' depois do ⏳'] = { N: P.N, NC: P.NC };
    }
    const list = E.trilhaListFor(d, { cfg: S.cfg, P, trail: S.trail, hoje: d, ov: {} });
    const stg = list.filter(b => b.tm != null && !b.au && !b.gh), rev = list.find(b => b.d === 'REV');
    S.days.push({ d, away, prot: S.protAt[d], tot: E.dayLoadHours(list), study: E.studyHours ? E.studyHours(list) : null, warn: E.studyWarnFor ? E.studyWarnFor(d) : null, stg: stg.map(b => [Number(b.tm), b.ts]), pend: pendN, applied, rev: rev ? rev.time : null, sim: E.dowOf(d) === 5 && E.simForCfg(S.cfg, d) });
    if (S.offers && d >= SWITCH && d <= LAST_SWEEP) offersAt(S, E, P, d);
    if (d === '2026-11-10' || d === '2026-11-16') S.snap[d] = { cfg: clone(S.cfg), trail: clone(S.trail) }; // antes de marcar o dia
    if (!away) {
        const nt = clone(S.trail);
        stg.forEach(b => { if (S.skipT1 && d < SWITCH && b.ts === 'seal' && (S.t1 || []).includes(Number(b.tm))) return; const t = nt[b.tm] = nt[b.tm] || {}; t[TSF[b.ts]] = true; t[STAMP[b.ts]] = d; if (b.ts === 'seal') { t.completedAt = d; t.accSelagem = S.pct; } });
        const due = E.computeReviews(S.trail, d);
        if (rev && rev.time !== 'opcional' && !(S.stopRev && d >= S.stopRev)) due.forEach(r => { const t = nt[r.id]; S.slips.push({ d, late: r.daysLate || 0 }); if (r.kind === 'D+7') { t.reviewD7Done = true; t.r1DoneAt = d; t.accR1 = S.pct; } else if (r.kind === 'D+30') { t.reviewD30Done = true; t.r2DoneAt = d; t.accR2 = S.pct; } else { t.reviewR3Done = true; } });
        S.trail = nt;
    }
    if (d === '2026-11-16') S.snap['2026-11-16+'] = { cfg: clone(S.cfg), trail: clone(S.trail) }; // fim do dia 16/11 (o que o motor novo recebe em 17/11)
}
function finalize(S, E, P, d) {
    S.active = false; S.endDay = d || null;
    if (P && E) { S.N = P.N; S.NC = P.NC; S.endISO = P.endISO; S.sobras = E.computeReviews(S.trail, P.revEnd || d); S.sobrasAll = E.computeReviews(S.trail, HZ).length;
        const X = { cfg: S.cfg, P, trail: S.trail, hoje: d }; for (let k = d; k <= (P.endISO || d); k = add(k, 1)) if (E.trilhaListFor(k, X).some(b => b.d === 'REV')) S.revAfter++; }
}
// C1: na semana fechada (ela marca também o resto da semana, carimbo = o dia planejado), o que o ⏩ ofereceria — leitura adv (o planner) × estrita (patch)
function offersAt(S, E, P, d) {
    const w = E.weekOfISO(d), tue = E.weekStartISO(w), wEnd = E.weekEndISO(w); const t2 = clone(S.trail);
    Object.keys(P.plan).forEach(id => { if (!P.frozen.has(Number(id))) return; STG.forEach(ts => { const x = P.plan[id][ts]; if (x && x >= d && x <= wEnd) { const t = t2[id] = t2[id] || {}; t[TSF[ts]] = true; t[STAMP[ts]] = x; if (ts === 'seal') { t.completedAt = x; t.accSelagem = S.pct; } } }); });
    const P2 = E.buildTrilhaPlan(S.cfg, t2, d), W = P2.weeks[tue];
    const inW = (x) => x && x >= tue && x <= wEnd, has = Object.keys(P2.plan).some(id => STG.some(ts => inW(P2.plan[id][ts])));
    const all = Object.keys(P2.plan).every(id => STG.every(ts => !inW(P2.plan[id][ts]) || !!(t2[id] || {})[TSF[ts]]));
    const riseLike = W && W.held && W.why === 'fechamento' && W.base > W.q;
    if (!W || !W.frozen || !has || !all || (P2.pending || []).length || riseLike) return;
    const sum = (a) => a.kind === 'C' ? 'C ' + a.why : a.kind + ' ' + codeOf(a.id) + ' ' + ((a.info && a.info.pass) || '?') + (a.info && a.info.aula2 ? ' · 2ª aula ' + fmt(a.info.aula2) : '') + ' (aula ' + fmt(a.days.aula) + ')';
    const A = E.trilhaProposeAdvance(P2, S.cfg, t2, d); let B = null; try { B = eng('ESTRITO', d).trilhaProposeAdvance(P2, S.cfg, t2, d); } catch (e) { B = { kind: 'C', why: 'erro ' + String(e.message).slice(0, 40) }; }
    S.offers.push({ d, adv: A, est: B, sa: sum(A), sb: sum(B) });
}

// ── laço dia a dia: todos os cenários andam juntos (um contexto vm por variante por dia) ──
const sweep = [], scns = [];
if (ON('progressiva')) [[50, null], [70, null], [85, null], [70, '2027-01-02']].forEach(([pct, stopRev]) => scns.push(newScn('prog' + pct + (stopRev ? 'v' : ''), { pct, stopRev, v: 'V0' })));
const wantReal = (ON('realista') || ON('medicoes')) && !!HEADF;
let realBase = null, marcas = null;
if (wantReal) { realBase = newScn('realBase', { head: true, v: 'V0' }); scns.push(realBase); if (ON('realista')) { marcas = newScn('marcas', { head: true, v: 'V0', skipT1: true, applyFrom: SWITCH, checkFrom: SWITCH, newFrom: SWITCH }); scns.push(marcas); } }
const fam = {}; const rng = (a, b) => (x) => x >= a && x <= b;
const STRESS = { S0: {}, 'S-a': { away: rng('2026-12-29', '2026-12-30') }, 'S-b': { away: rng('2027-01-02', '2027-01-08') }, 'S-c': { stopFrom: '2027-01-04' }, 'S-d': { away: rng('2026-12-22', '2026-12-26') } };
const t0 = Date.now();
for (let d = START; ; d = add(d, 1)) {
    if (d > HZ) { scns.filter(s => s.active).forEach(s => finalize(s, null, null, null)); break; }
    if (!scns.some(s => s.active) && (!ON('varredura') || d > LAST_SWEEP)) break;
    if (d === SWITCH && realBase && realBase.active) { // o motor novo a partir de 17/11: a família do realista parte do mesmo estado (T1–T3 congeladas pelo 409e1f9)
        const o = { checkFrom: SWITCH, newFrom: SWITCH };
        if (ON('realista') || ON('medicoes')) fam.S0 = fork(realBase, 'S0', { ...o, v: 'V0', offers: ON('medicoes') });
        if (ON('medicoes')) { if (varOk.OFF === true) fam['S0|I'] = fork(realBase, 'S0 I', { ...o, v: 'OFF' });
            ['S-a', 'S-b', 'S-c', 'S-d'].forEach(k => { fam[k] = fork(realBase, k, { ...o, ...STRESS[k], v: 'V0' }); if (varOk.OFF === true) fam[k + '|I'] = fork(realBase, k + ' I', { ...o, ...STRESS[k], v: 'OFF' }); });
            [1, 2, 3, 4].forEach(n => { fam['T10e' + n] = fork(realBase, 'T10 = ' + n + ' estrito', { ...o, v: 'V0', cfg: { trilhaRamp: { '2026-12-29': n } } }); });
            if (varOk.LARGO === true) [0, 1, 2, 3, 4].forEach(n => { fam['T10l' + n] = fork(realBase, 'T10 = ' + n + ' largo', { ...o, v: 'LARGO', cfg: n ? { trilhaRamp: { '2026-12-29': n } } : {} }); }); }
        realBase.active = false; Object.values(fam).forEach(s => scns.push(s));
    }
    if (ON('varredura') && d <= LAST_SWEEP) sweep.push(sweepAt(eng('V0', d), d));
    for (const S of scns) { if (!S.active) continue; const v = S.head && d < SWITCH ? 'HEAD' : S.v;
        try { step(S, eng(v, d), d); } catch (e) { S.err = (S.err || '') + fmt(d) + ': ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | '); finalize(S, null, null, null); } }
}
console.log('(linha do tempo: ' + scns.length + ' cenários em ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s)');

function sweepAt(E, f) {
    let cfg = { ...CFG0 }; let P = E.buildTrilhaPlan(cfg, {}, f); const patch = E.trilhaFreezePatch(cfg, {}, f, P, {}); if (patch) { cfg = { ...cfg, ...patch }; P = E.buildTrilhaPlan(cfg, {}, f); }
    const X = { cfg, P, trail: {}, hoje: f }; let last = null; Object.values(P.plan).forEach(p => STG.forEach(ts => { if (p[ts] && (!last || p[ts] > last)) last = p[ts]; }));
    const endV = P.endISO || END; let mx = 0, md = '', upto = f;
    for (let d = f; d <= HZ; d = add(d, 1)) { if (d > endV && (!last || d > last)) break; const t = E.dayLoadHours(E.trilhaListFor(d, X)); if (t > mx) { mx = t; md = d; } upto = d; } // até PLAN_HZ, cortado no fim do calendário visível ou na última etapa (o que vier depois)
    const aulaJan = Object.keys(P.plan).filter(id => P.plan[id].aula && P.plan[id].aula > END).map(codeOf), beyond = []; Object.keys(P.plan).forEach(id => STG.forEach(ts => { const x = P.plan[id][ts]; if (x && x > endV) beyond.push(codeOf(id) + ' ' + ts + ' ' + fmt(x)); }));
    const W1 = P.weeks['2026-10-26'] || {};
    return { f, N: P.N, NC: P.NC, mx, md, upto, endISO: P.endISO, last, aulaJan, beyond, q1: f <= '2026-11-02' ? W1.q : null };
}

// ── métricas do registro (carimbos) ──
function metr(S) {
    const tr = S.trail, plan = S.cfg.trilhaPlan || {}, st = (id, ts) => { const t = tr[id] || {}; return t[TSF[ts]] ? (t[STAMP[ts]] || null) : null; };
    const ids = Object.keys(tr).filter(id => st(id, 'aula')), isNew = (id) => !S.newFrom || !!(plan[id] && plan[id].wk >= S.newFrom);
    const lastDay = S.days.length ? S.days[S.days.length - 1].d : END;
    const m = { aulas: ids.filter(id => st(id, 'aula') <= END).length, aulaJan: ids.filter(id => st(id, 'aula') > END).map(codeOf), compl: Object.keys(tr).filter(id => STG.every(ts => st(id, ts))).length };
    m.c0101 = Object.keys(tr).filter(id => STG.every(ts => st(id, ts) && st(id, ts) <= END)).length; m.c0301 = Object.keys(tr).filter(id => STG.every(ts => st(id, ts) && st(id, ts) <= CLOSE)).length;
    m.todas0301 = ids.every(id => st(id, 'seal') && st(id, 'seal') <= CLOSE); m.abertas = ids.filter(id => !st(id, 'seal')).map(id => lbl(id) + ' (aula ' + fmt(st(id, 'aula')) + ')');
    const allSt = []; Object.keys(tr).forEach(id => STG.forEach(ts => { const s = st(id, ts); if (s) allSt.push(s); })); allSt.sort(); m.last = allSt[allSt.length - 1] || null;
    m.planAulaJan = Object.keys(plan).filter(id => plan[id].aula && plan[id].aula > END).map(codeOf);
    m.naoAssist = Object.keys(plan).filter(id => !st(id, 'aula') && !(tr[id] || {}).smartcard).map(id => codeOf(id) + ' (aula ' + fmt(plan[id].aula) + ')');
    // aulas por dia (registro) e a 2ª só em dia permitido
    const byA = {}; ids.forEach(id => { const a = st(id, 'aula'); (byA[a] = byA[a] || []).push(Number(id)); });
    m.two = Object.keys(byA).sort().filter(x => x >= S.checkFrom && byA[x].length >= 2).map(x => ({ d: x, ids: byA[x], ok: byA[x].length <= 2 && dia2Ok(x, S.protAt[x]) }));
    m.twoAll = Object.keys(byA).sort().filter(x => byA[x].length >= 2).map(x => fmt(x) + ' ' + dw(x) + ': ' + byA[x].map(codeOf).join('+'));
    m.aulaProt = ids.filter(id => st(id, 'aula') >= S.checkFrom && S.protAt[st(id, 'aula')]).map(id => codeOf(id) + ' ' + fmt(st(id, 'aula')) + ' (' + S.protAt[st(id, 'aula')] + ')');
    // K (inclusivo) no registro: dias cobertos por cadeia nova
    const endK = m.last && m.last > lastDay ? m.last : lastDay; const iv = ids.map(id => ({ id, a: st(id, 'aula'), s: st(id, 'seal') || '9999-12-31', nw: isNew(id) }));
    let kmax = 0, kdays = [], ktail = 0; const kviol = [];
    for (let x = S.checkFrom; x <= endK; x = add(x, 1)) { const cov = iv.filter(c => c.a <= x && x <= c.s); if (!cov.some(c => c.nw)) continue; const n = cov.length; if (n > kmax) { kmax = n; kdays = [fmt(x)]; } else if (n === kmax) kdays.push(fmt(x)); if (x > END) ktail = Math.max(ktail, n); if (n > 5) kviol.push(fmt(x) + '=' + n); }
    m.kmax = kmax; m.kdays = kdays; m.ktail = ktail; m.kviol = kviol;
    // faixas GAP_T (cadeias novas) e ordem
    m.gap = []; ids.filter(isNew).forEach(id => { for (let i = 1; i < 4; i++) { const a = st(id, STG[i - 1]), b = st(id, STG[i]); if (a && b) { const g = dd(a, b); if (g < GAP[STG[i]][0] || g > GAP[STG[i]][1]) m.gap.push(codeOf(id) + ' ' + STG[i - 1] + '→' + STG[i] + ' ' + g + 'd (' + fmt(a) + '→' + fmt(b) + ')'); } } });
    // questões no dia leve (no dia em que ela fez): só com o P3 (o passo da colocação que pôs as questões ali)
    m.qLeve = []; ids.filter(isNew).forEach(id => { const q = st(id, 'quest'); if (!q || S.protAt[q] !== 'leve') return; const e = S.passes.filter(p => p.id === Number(id) && p.days && p.days.quest === q).pop(); m.qLeve.push({ id, q, pass: e ? e.pass : null, via: e ? e.via : null }); });
    // passos usados (colocações gravadas: rampa ao congelar, ⏳ aplicado, recolocação automática)
    m.passes = {}; S.passes.filter(p => isNew(p.id)).forEach(p => { const k = p.via + ' ' + (p.pass || '?'); m.passes[k] = (m.passes[k] || 0) + 1; });
    // carga e revisões
    const dz = S.days.filter(x => x.d >= S.checkFrom); m.over = dz.filter(x => x.tot > CAP + 1e-9).map(x => fmt(x.d) + ' ' + h2(x.tot)); const mx = dz.reduce((a, x) => x.tot > a.tot ? x : a, { tot: -1 }); m.mx = mx.tot; m.md = mx.d;
    const tz = S.days.filter(x => x.d > END); const mt = tz.reduce((a, x) => x.tot > a.tot ? x : a, { tot: -1 }); m.mxT = mt.tot; m.mdT = mt.d;
    m.slip = Math.max(0, ...S.slips.filter(x => x.d >= S.checkFrom).map(x => x.late)); m.pendDays = S.days.filter(x => x.pend).map(x => fmt(x.d));
    m.on0401 = []; Object.keys(tr).forEach(id => STG.forEach(ts => { if (st(id, ts) === '2027-01-04') m.on0401.push(codeOf(id) + ' ' + ts); }));
    m.tailW = S.maxEnd && S.maxEnd > END ? (E_REF.weekOfISO(S.maxEnd) - E_REF.weekOfISO('2027-01-02') + 1) : 0;
    m.late = ids.filter(id => !st(id, 'seal') || st(id, 'seal') > '2026-12-22').sort((a, b) => (st(a, 'seal') || '9') < (st(b, 'seal') || '9') ? -1 : 1).map(id => { const D = STG.map(ts => st(id, ts)); const g = [1, 2, 3].map(i => D[i - 1] && D[i] ? dd(D[i - 1], D[i]) : null); return lbl(id) + ': ' + D.map(fmt).join(' → ') + ' (' + g.join(' · ') + ')'; });
    return m;
}
function loadLines(S, from, to, compact) { // carga dia a dia: 📚 estudo/limiar · total/14,5h · etapas · revisão · ⏳
    const out = []; let run = null; const flush = () => { if (run) { out.push('      ' + fmt(run.a) + (run.b !== run.a ? '–' + fmt(run.b) : '') + ': sem etapa nem revisão (total ' + h2(run.lo) + (run.hi !== run.lo ? '–' + h2(run.hi) : '') + ')'); run = null; } };
    S.days.filter(x => x.d >= from && x.d <= to).forEach(x => { const empty = !x.stg.length && !x.rev && !x.pend && !x.applied && !x.prot && !x.sim && !x.away;
        if (compact && empty) { if (!run) run = { a: x.d, b: x.d, lo: x.tot, hi: x.tot }; else { run.b = x.d; run.lo = Math.min(run.lo, x.tot); run.hi = Math.max(run.hi, x.tot); } return; } flush();
        out.push('      ' + fdw(x.d) + (x.prot ? ' [' + x.prot + ']' : '') + (x.sim ? ' [simulado]' : '') + (x.away ? ' [fora]' : '') + ': 📚 ' + h2(x.study) + '/' + (x.warn == null ? '—' : x.warn + 'h') + ' · total ' + h2(x.tot) + '/14,5h · ' + (x.stg.length ? x.stg.map(([id, ts]) => codeOf(id) + ' ' + ts).join(', ') : '—') + (x.rev ? ' · revisão (' + x.rev + ')' : '') + (x.pend ? ' · ⏳ ' + x.pend : '') + (x.applied ? ' · Aplicar: ' + x.applied.join('; ') : '')); });
    flush(); return out;
}
// dia que aceita a 2ª aula pela regra dela (DELA 2), conferido pelas peças e não pelo aula2Ok do próprio planner: sem plantão (curto, longo, noite, 04h30), fora do pós-noturno, de 24, 25 e 31/12 e do dia leve
const dia2Ok = (d, prot) => typeof E_REF.shiftFor === 'function' && typeof E_REF.postNight === 'function' && !E_REF.shiftFor(d) && !E_REF.postNight(d) && !(E_REF.HOLIDAY_LIGHT || {})[d] && prot !== 'leve';
const passTxt = (o) => Object.keys(o).sort().map(k => k + ' ' + o[k]).join(' · ') || '—';

// ══════════ (1) VARREDURA ══════════
if (ON('varredura')) section('(1) varredura', () => {
    console.log('\n══════════ (1) VARREDURA DO 1º ACESSO (26/10 → 28/12): a prévia que ela vê ao abrir ══════════');
    sweep.filter(r => r.f <= '2026-11-03').forEach(r => console.log(`   1º acesso ${fmt(r.f)} · T1 = ${r.q1 == null ? '—' : r.q1} · aulas até 01/01 ${r.N} · cadeias completas ${r.NC} · dia mais carregado ${fmt(r.md)} ${h2(r.mx)} · carga conferida até ${fmt(r.upto)} (calendário até ${fmt(r.endISO)}, última etapa ${fmt(r.last)})`));
    const atCap = sweep.filter(r => Math.abs(r.mx - CAP) < 1e-9).map(r => fmt(r.f)), uptoJan = sweep.filter(r => r.upto > END).length;
    console.log(`   … ${sweep.length} datas; no limite de 14,5h (sem passar): ${atCap.join(', ') || 'nenhuma'} · ${uptoJan} prévias com carga conferida em janeiro (última: ${fmt(sweep.map(r => r.upto).sort().pop())})`);
    console.log('   N · NC por data: ' + sweep.map(r => fmt(r.f) + ' ' + r.N + '·' + r.NC).join(' '));
    check('varredura: 64 datas de 1º acesso (26/10 → 28/12), nenhuma deixa dia acima de 14,5h na prévia — a carga é conferida até PLAN_HZ (o laço para no fim do calendário visível ou na última etapa da prévia: os dias de janeiro passam pelo 14,5h)', sweep.length === 64 && sweep.every(r => r.mx <= CAP + 1e-9) && sweep.every(r => r.upto >= (r.endISO || END)), sweep.filter(r => r.mx > CAP + 1e-9).map(r => fmt(r.f) + '→' + fmt(r.md)).join(', ') || 'pior ' + h2(Math.max(...sweep.map(r => r.mx))));
    const q = (d) => sweep.find(r => r.f === d) || {};
    check('cota da T1 pelo dia do 1º acesso (decisão 71, 8 dias): 26 e 27/10 → 3 · 28–30/10 → 2 · 31/10 e 01/11 → 1 · 02/11 → 0', J(['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'].map(d => q(d).q1)) === '[3,3,2,2,2,1,1,0]', J(sweep.slice(0, 8).map(r => r.q1)));
    check('alcance pelo dia do 1º acesso = "aulas até 01/01" (S5: a aula conta até 01/01; re-medido com a regra de 01/01 — 1 aula por dia, K e teto por etapa; no HEAD eram 36 · 35 · 34 · 33): 26 e 27/10 → 34 · 28–30/10 → 33 · 31/10, 01/11 e 02/11 → 32', J(sweep.slice(0, 8).map(r => r.N)) === '[34,34,33,33,33,32,32,32]', J(sweep.slice(0, 8).map(r => r.N)));
    check('varredura (AULA_END; 0b): em nenhuma das 64 prévias há aula depois de 01/01, e nenhuma etapa da prévia fica depois do fim do calendário visível (P.endISO) — nada some calado', sweep.length === 64 && sweep.every(r => !r.aulaJan.length && !r.beyond.length && !!r.endISO), sweep.filter(r => r.aulaJan.length || r.beyond.length || !r.endISO).slice(0, 4).map(r => fmt(r.f) + ': ' + J({ aulaJan: r.aulaJan, alem: r.beyond.slice(0, 3), endISO: r.endISO })).join(' · ') || 'ok');
});

// ══════════ (2) PROGRESSIVA ══════════
const progRows = scns.filter(s => /^prog/.test(s.name));
if (ON('progressiva')) section('(2) progressiva', () => {
    console.log('\n══════════ (2) PROGRESSIVA: 1º acesso 26/10, ela faz tudo no dia, até P.live ficar falso ══════════');
    const prog = [], progV = [];
    progRows.forEach(S => { const m = metr(S); const p = { S, m, pct: S.pct, v: !!S.stopRev }; (S.stopRev ? progV : prog).push(p);
        console.log(`   selagens a ${S.pct}%${S.stopRev ? ' (sem fazer revisão desde ' + fmt(S.stopRev) + ')' : ''} · ${m.aulas} aulas até 01/01 · ${m.c0101} cadeias completas até 01/01 e ${m.compl} no total (${m.c0301} até 03/01) · última etapa ${fdw(m.last)} · semanas da cauda ${m.tailW} (calendário até ${fmt(S.maxEnd)}) · dia mais carregado ${fdw(m.md)} ${h2(m.mx)} (na cauda: ${fdw(m.mdT)} ${h2(m.mxT)}) · revisão desliza no máximo ${m.slip} dia(s)${S.err ? ' · ERRO ' + S.err : ''}`);
        console.log(`      dois números (o que ela vê): 17/11 ${J(S.nums['2026-11-17'])} · 02/01 ${J(S.nums['2027-01-02'])} · fim ${S.N}·${S.NC} — R-a: lembro até (02/01) ${fmt(S.hz02)} (estimado) · último horizonte ${fmt(S.hzLast)} · a cauda acaba (P.live falso) em ${fmt(S.endDay)} · blocos de revisão depois do horizonte: ${S.revAfter} · sobras ${S.sobras.length}${S.sobras.length ? ': ' + S.sobras.slice().sort((a, b) => a.due < b.due ? -1 : 1).map(r => r.code + ' ' + r.kind + ' (venceu ' + fmt(r.due) + ')').join(' · ') : ''}`);
        console.log(`      passos usados: ${passTxt(m.passes)} · dias com 2 aulas: ${m.twoAll.join(' · ') || '—'} · questões no dia leve: ${m.qLeve.map(x => codeOf(x.id) + ' ' + fmt(x.q) + ' (' + x.pass + ')').join(' · ') || '—'} · K máx. ${m.kmax} (${m.kdays.slice(0, 6).join(',')}) · ⏳ em ${m.pendDays.length} dia(s)`);
        if (!S.stopRev) { console.log('      carga dia a dia de 29/12 até o fim da cauda (' + fmt(S.endDay ? add(S.endDay, -1) : null) + '):'); loadLines(S, '2026-12-29', S.endDay ? add(S.endDay, -1) : HZ, true).forEach(l => console.log(l)); } });
    const P3 = (r) => ['P3a', 'P3b'].includes(r.pass);
    check('progressiva (selagens a 50, 70 e 85%): 34 aulas até 01/01 e as 34 cadeias fecham (32 até 01/01 e 2 em janeiro, até 03/01 — teto por etapa e decisão 7; eram 36 até 01/01: 1 aula por dia e K), nenhuma aula depois de 01/01 (carimbo nem plano)', prog.length === 3 && prog.every(p => p.m.aulas === 34 && p.m.compl === 34 && p.m.c0101 === 32 && !p.m.aulaJan.length && !p.m.planAulaJan.length && p.m.last <= CLOSE), prog.map(p => p.pct + '%: ' + p.m.aulas + ' aulas · ' + p.m.c0101 + '/' + p.m.compl + ' completas · última ' + p.m.last + (p.m.aulaJan.length + p.m.planAulaJan.length ? ' · aula em janeiro ' + J([p.m.aulaJan, p.m.planAulaJan]) : '')).join(' · '));
    check('progressiva: toda cadeia fecha (aula marcada ⇒ selagem marcada) e nada fica planejado sem fazer, até a cauda acabar', prog.length === 3 && prog.every(p => !p.m.abertas.length && !p.m.naoAssist.length && !!p.S.endDay && !p.S.err), prog.map(p => p.pct + '%: abertas ' + J(p.m.abertas) + ' · não assistidas ' + J(p.m.naoAssist) + ' · fim ' + p.S.endDay + (p.S.err ? ' · ' + p.S.err : '')).join(' · '));
    check('progressiva: nenhum dia acima de 14,5h, com as revisões (de 26/10 até o fim da cauda)', prog.length === 3 && prog.every(p => !p.m.over.length), prog.map(p => p.pct + '%: ' + (p.m.over.join(', ') || 'pior ' + fmt(p.m.md) + ' ' + h2(p.m.mx))).join(' · '));
    check('progressiva: revisão vencida desliza no máximo 1 dia (decisão 73)', prog.length === 3 && prog.every(p => p.m.slip <= 1), prog.map(p => p.pct + '%: ' + p.m.slip).join(' · '));
    check('progressiva (DELA 2): no máximo 2 aulas novas por dia, e a 2ª só em dia permitido (sem plantão, fora do dia leve, do pós-noturno e de 24, 25 e 31/12); nenhuma aula em dia protegido', prog.length === 3 && prog.every(p => p.m.two.every(x => x.ok) && !p.m.aulaProt.length), prog.map(p => p.pct + '%: ' + (p.m.two.map(x => fmt(x.d) + ' ' + x.ids.map(codeOf).join('+') + (x.ok ? '' : ' ❌')).join(' · ') || 'nenhum dia com 2') + (p.m.aulaProt.length ? ' · aula em dia protegido ' + J(p.m.aulaProt) : '')).join(' · '));
    check('progressiva (DELA 2; 🧠): questões no dia leve só quando a colocação usou o P3 (última saída) — o passo de cada colocação gravada vem da instrumentação de placeChain', prog.length === 3 && prog.every(p => p.m.qLeve.every(P3)) && prog.every(p => Object.keys(p.m.passes).length > 0 && !Object.keys(p.m.passes).some(k => / \?$/.test(k))), prog.map(p => p.pct + '%: ' + (p.m.qLeve.map(x => codeOf(x.id) + ' ' + fmt(x.q) + ' ' + x.pass).join(', ') || '0 questões no dia leve') + ' · passos ' + passTxt(p.m.passes)).join(' · '));
    check('progressiva (DELA 1): K ≤ 5 (inclusivo, aula e selagem contam no mesmo dia) em todo dia coberto por cadeia nova, no registro', prog.length === 3 && prog.every(p => !p.m.kviol.length && p.m.kmax > 0), prog.map(p => p.pct + '%: máx. ' + p.m.kmax + (p.m.kviol.length ? ' · ' + p.m.kviol.slice(0, 6).join(' ') : '')).join(' · '));
    check('progressiva (📚): os intervalos do registro ficam nas faixas GAP_T (aula→questões 1–2 · questões→apostila 1–2 · apostila→selagem 2–5 dias)', prog.length === 3 && prog.every(p => !p.m.gap.length), prog.map(p => p.pct + '%: ' + (p.m.gap.slice(0, 4).join(' · ') || '0 fora')).join(' · '));
    const raOk = (p) => p.S.hz02 === '2027-02-02' && !!p.S.endDay && !!p.S.hzLast && p.S.endDay > p.S.hzLast && p.S.revAfter === 0 && p.S.sobras.length === p.S.sobrasAll && p.S.sobras.every(r => r.due <= p.S.hzLast); // R-a (DELA 9; S6)
    check('progressiva (R-a, DELA 9; S6): em 02/01 o app lembra até 02/02 (estimado) nos três % e na variante; a cauda acaba (P.live falso) depois do último horizonte, e dali até o fim da última semana visível nenhum dia tem bloco de revisão; as sobras são TODAS as revisões pendentes, vencidas até o horizonte (vão para o balanço com a data) — na variante sem revisão desde 02/01 o app lembra até 02/02 e as pendentes viram sobras', prog.length === 3 && progV.length === 1 && prog.every(raOk) && progV.every(p => raOk(p) && p.S.hzLast === '2027-02-02' && p.S.sobras.length > 0), prog.concat(progV).map(p => p.pct + '%: 02/01 ' + p.S.hz02 + ' · horizonte ' + p.S.hzLast + ' · fim ' + p.S.endDay + ' · blocos depois ' + p.S.revAfter + ' · sobras ' + p.S.sobras.length + '/' + p.S.sobrasAll).join(' · '));
});

// ══════════ (3) REALISTA ══════════
if (ON('realista')) section('(3) realista', () => {
    console.log('\n══════════ (3) REALISTA: T1–T3 congeladas pelo planner de ' + (process.env.SIM_REF || '409e1f9') + ' (git show), motor novo de 17/11 em diante ══════════');
    check('realista: o planner antigo vem do git (git show ' + (process.env.SIM_REF || '409e1f9') + ':planner_residencia_2026_offline.html) — sem git o script falha (testes I10), não pula', !!HEADF && !!fam.S0, headErr || (fam.S0 ? 'ok: ' + HEADF : 'cenário não rodou'));
    if (fam.S0) {
        const S = fam.S0, m = metr(S), base = S.snap['2026-11-16+'] || { cfg: {}, trail: {} };
        const old = Object.keys(base.cfg.trilhaPlan || {}), same = old.every(id => STG.every(ts => (S.cfg.trilhaPlan[id] || {})[ts] === base.cfg.trilhaPlan[id][ts]));
        const aulasOn = (d) => Object.keys(S.trail).filter(id => S.trail[id].aula && S.trail[id].aulaAt === d).map(codeOf).sort();
        console.log(`   ${m.aulas} aulas até 01/01 · ${m.compl} cadeias completas (${m.c0101} até 01/01, ${m.c0301} até 03/01) · última etapa ${fdw(m.last)} · semanas da cauda ${m.tailW} (calendário até ${fmt(S.maxEnd)}) · a cauda acaba em ${fmt(S.endDay)}${S.err ? ' · ERRO ' + S.err : ''}`);
        console.log(`   os dois números (o que ela vê): 17/11 ${J(S.nums['2026-11-17'])} · 15/12 ${J(S.nums['2026-12-15'])} · 01/01 ${J(S.nums['2027-01-01'])} · 02/01 ${J(S.nums['2027-01-02'])} → "Aulas até 01/01: ${(S.nums['2027-01-02'] || {}).N} · Cadeias completas (com janeiro): ${(S.nums['2027-01-02'] || {}).NC}"`);
        console.log(`   lembro até (02/01) ${fmt(S.hz02)} (estimado) · último horizonte ${fmt(S.hzLast)} · dia mais carregado desde 17/11 ${fdw(m.md)} ${h2(m.mx)} · na cauda ${fdw(m.mdT)} ${h2(m.mxT)} · revisão desliza no máximo ${m.slip} dia(s) · ⏳ em ${m.pendDays.length} dia(s)`);
        console.log(`   dias com 2 aulas (todos): ${m.twoAll.join(' · ')} · a partir de 17/11: ${m.two.map(x => fdw(x.d) + ' ' + x.ids.map(codeOf).join('+')).join(' · ') || '—'}`);
        console.log(`   K máx. desde 17/11 (dias com cadeia nova) ${m.kmax} (${m.kdays.slice(0, 8).join(',')}) · K na cauda ${m.ktail} · passos usados (desde 17/11): ${passTxt(m.passes)} · questões no dia leve: ${m.qLeve.length}`);
        console.log('   cadeias que terminam depois de 22/12:'); m.late.forEach(l => console.log('      ' + l));
        console.log('   carga dia a dia de 29/12 até o fim da cauda (' + fmt(S.endDay ? add(S.endDay, -1) : null) + '):'); loadLines(S, '2026-12-29', S.endDay ? add(S.endDay, -1) : HZ, false).forEach(l => console.log(l));
        check('realista (premissa, herdado do 409e1f9 — só reportado, nunca alterado): 09/11 com 4 aulas (CIR2, CIR2, CIR3, CIR3) e 15/11 com 2 (CIR4, CIR4); o motor novo não muda nenhuma data das T1–T3 congeladas', J(aulasOn('2026-11-09')) === '["CIR2","CIR2","CIR3","CIR3"]' && J(aulasOn('2026-11-15')) === '["CIR4","CIR4"]' && old.length > 0 && same, '09/11 ' + J(aulasOn('2026-11-09')) + ' · 15/11 ' + J(aulasOn('2026-11-15')) + ' · ' + old.length + ' módulos de T1–T3, datas iguais: ' + same);
        check('realista: os dias com 2 aulas a partir de 17/11 são DOM 22/11, 29/11 e 06/12 (MEDIDO measure7/M-c), cada um em dia permitido; nunca 3; nenhuma aula em dia protegido', J(m.two.map(x => x.d)) === '["2026-11-22","2026-11-29","2026-12-06"]' && m.two.every(x => x.ok) && !m.aulaProt.length, m.two.map(x => fdw(x.d) + ' ' + x.ids.map(codeOf).join('+') + (x.ok ? '' : ' ❌')).join(' · ') + (m.aulaProt.length ? ' · em dia protegido ' + J(m.aulaProt) : ''));
        check('realista: nenhuma aula depois de 01/01 (carimbo nem plano) e toda cadeia fecha, até a cauda acabar', !m.aulaJan.length && !m.planAulaJan.length && !m.abertas.length && !m.naoAssist.length && !!S.endDay && !S.err, J({ aulaJan: m.aulaJan, plano: m.planAulaJan, abertas: m.abertas, naoAssist: m.naoAssist, fim: S.endDay, err: S.err }));
        check('realista (de 17/11 em diante): nenhum dia acima de 14,5h e revisão desliza no máximo 1 dia', !m.over.length && m.slip <= 1, (m.over.join(', ') || 'pior ' + fdw(m.md) + ' ' + h2(m.mx)) + ' · deslize ' + m.slip);
        check('realista (cadeias novas, desde 17/11): questões no dia leve só com o P3; K ≤ 5 (inclusivo) em todo dia coberto por cadeia nova; intervalos nas faixas GAP_T', m.qLeve.every(x => ['P3a', 'P3b'].includes(x.pass)) && !m.kviol.length && m.kmax > 0 && !m.gap.length && Object.keys(m.passes).length > 0, 'questões no dia leve ' + J(m.qLeve) + ' · K máx. ' + m.kmax + (m.kviol.length ? ' VIOL ' + m.kviol.join(' ') : '') + ' · faixas ' + (m.gap.join(' · ') || '0 fora') + ' · passos ' + passTxt(m.passes));
    }
    if (marcas) { const S = marcas, W4 = (S.cfg.trilhaWeeks || {})['2026-11-17'] || null, W3 = (S.cfg.trilhaWeeks || {})['2026-11-10'] || null, m = metr(S), t1 = S.t1 || [], sn = S.snap['2026-11-16+'] || { trail: {}, cfg: {} };
        const wTxt = (W) => W ? J({ q: W.q, base: W.base, held: W.held, why: W.why, mods: (W.mods || []).map(lbl), short: W.short, shortWhy: W.shortWhy || null, at: W.at }) : '—';
        console.log('\n   variante "marcas incompletas" (C2): as 3 selagens da T1 (' + t1.map(id => lbl(id) + ', planejada ' + fmt(((sn.cfg.trilhaPlan || {})[id] || {}).seal)).join(' · ') + ') feitas e não marcadas até 16/11; de 17/11 em diante ela segue o app (⏳ + Aplicar)');
        console.log('      T3 (congelada em 10/11): ' + wTxt(W3)); console.log('      T4 (congelada em 17/11): ' + wTxt(W4));
        console.log('      T4 sem a falha (realista): ' + wTxt(((fam.S0 || { cfg: {} }).cfg.trilhaWeeks || {})['2026-11-17']));
        console.log(`      os dois números: 17/11 ${J(S.nums['2026-11-17'])} (sem a falha: ${J((fam.S0 || { nums: {} }).nums['2026-11-17'])}; depois de ela aplicar o ⏳ das 3 selagens em 17/11: ${J(S.nums['2026-11-17 depois do ⏳'])}) · 02/01 ${J(S.nums['2027-01-02'])} · registro: ${m.aulas} aulas até 01/01, ${m.compl} cadeias completas · última etapa ${fdw(m.last)}${S.err ? ' · ERRO ' + S.err : ''}`);
        check('realista, variante "marcas incompletas" (premissa, testes I11): as 3 selagens da T1 seguem sem ✓ no fim de 16/11 (planejadas antes de 17/11) e a T4 congela em 17/11', t1.length === 3 && t1.every(id => !(sn.trail[id] || {}).smartcard && ((sn.cfg.trilhaPlan || {})[id] || {}).seal < SWITCH) && !!W4 && W4.at === SWITCH, J({ t1, seals: t1.map(id => ((sn.cfg.trilhaPlan || {})[id] || {}).seal), marcadas: t1.map(id => !!(sn.trail[id] || {}).smartcard), W4: W4 && W4.at }));
    }
});

// ══════════ (4) UNIDADES U1–U28 ══════════
if (ON('unidades')) { console.log('\n══════════ (4) UNIDADES U1–U28: regras de colocação em estados montados à mão ══════════'); units(); }

// ══════════ (5) MEDIÇÕES (imprimem, não são checks) ══════════
if (ON('medicoes')) section('(5) medições', () => {
    console.log('\n══════════ (5) MEDIÇÕES PARA O RELATÓRIO (não são checks) ══════════');
    if (!HEADF) console.log('   sem o planner antigo (git): ' + headErr);
    if (varOk.OFF !== true) console.log('   ramo I (CLOSE_BY_ON = false) não se aplica a este arquivo: ' + varOk.OFF);
    console.log('   Decisão 7 — I = intervalo ideal (CLOSE_BY_ON = false, patch só no vm) × II = fechar até 03/01 (o planner, CLOSE_BY_ON = true). Realista (T1–T3 pelo 409e1f9) e estresses (fora = abre o app, não marca nem aplica):');
    console.log('   cenário | ramo | aulas ≤01/01 | completas | ≤01/01 | ≤03/01 | todas ≤03/01 | última etapa | abertas | ⏳ (dias) | etapas em 04/01 | K cauda | lembro até (02/01 → último) | fora das faixas | fim da cauda');
    const M7 = { S0: ['36 · 36 · 34 · 35 · NÃO · 04/01 SEG · R-a 01/02', '36 · 36 · 34 · 36 · SIM · 03/01 DOM · R-a 31/01'], 'S-a': ['36 · 36 · 34 · 34 · NÃO · 05/01 TER', '36 · 36 · 34 · 35 · NÃO · 05/01 TER'], 'S-b': ['36 · 36 · 34 · 34 · NÃO · 09/01 SÁB', 'igual a I · 09/01 SÁB'], 'S-c': ['36 · 35 · HEM1 Anemia II aberta · ⏳ sem fim', '36 · 36 · SIM · 03/01 DOM'], 'S-d': ['36 · 36 · 31 · 32 · NÃO · 07/01 QUI', '36 · 36 · 32 · 34 · NÃO · 06/01 QUA'] };
    const row = (k, ramo, S) => { if (!S) return '   ' + k + ' | ' + ramo + ' | (não rodou)'; const m = metr(S); return '   ' + k + ' | ' + ramo + ' | ' + m.aulas + ' | ' + m.compl + ' | ' + m.c0101 + ' | ' + m.c0301 + ' | ' + (m.todas0301 ? 'SIM' : 'NÃO') + ' | ' + fdw(m.last) + ' | ' + (m.abertas.join('; ') || '0') + ' | ' + (m.pendDays.length ? m.pendDays.length + ' (' + m.pendDays.slice(0, 8).join(',') + (m.pendDays.length > 8 ? '…' : '') + ')' : '0') + ' | ' + (m.on0401.join(', ') || '—') + ' | ' + m.ktail + ' | ' + fmt(S.hz02) + ' → ' + fmt(S.hzLast) + ' | ' + (m.gap.length ? m.gap.length + ': ' + m.gap.slice(0, 3).join('; ') : '0') + ' | ' + (S.endDay ? fmt(S.endDay) : 'não acabou até ' + fmt(HZ)) + (m.naoAssist.length ? ' | não assistida: ' + m.naoAssist.join(', ') : '') + (S.err ? ' | ERRO ' + S.err : ''); };
    ['S0', 'S-a', 'S-b', 'S-c', 'S-d'].forEach(k => { console.log(row(k, 'I ', fam[k + '|I'])); console.log(row(k, 'II', fam[k])); console.log('      measure7: I ' + M7[k][0] + ' · II ' + M7[k][1]); });
    if (fam.S0 && fam['S0|I']) { const a = fam['S0|I'].cfg.trilhaPlan || {}, b = fam.S0.cfg.trilhaPlan || {}; const diff = Object.keys(b).filter(id => STG.some(ts => (a[id] || {})[ts] !== b[id][ts]));
        console.log('   S0, cadeias que diferem entre I e II (plano): ' + (diff.map(id => lbl(id) + ': I ' + STG.map(ts => fmt((a[id] || {})[ts])).join(' → ') + ' · II ' + STG.map(ts => fmt(b[id][ts])).join(' → ')).join(' | ') || 'nenhuma'));
        const firstDiff = Object.keys(b).map(id => STG.filter(ts => (a[id] || {})[ts] !== b[id][ts]).map(ts => [b[id][ts], (a[id] || {})[ts]].filter(Boolean).sort()[0])).flat().sort()[0];
        console.log('   S0, primeira data diferente entre I e II: ' + fmt(firstDiff) + ' (measure7: sempre de 27/12 em diante; nada antes de 22/12)');
        console.log('   S0, carga dia a dia de 29/12 até a última etapa — I (intervalo ideal):'); loadLines(fam['S0|I'], '2026-12-29', metr(fam['S0|I']).last || END, false).forEach(l => console.log(l));
        console.log('   S0, carga dia a dia de 29/12 até a última etapa — II (fechar até 03/01):'); loadLines(fam.S0, '2026-12-29', metr(fam.S0).last || END, false).forEach(l => console.log(l)); }
    // C1 — ofertas do ⏩
    if (fam.S0 && fam.S0.offers) { const O = fam.S0.offers; const cnt = (k) => { const c = {}; O.forEach(o => { const a = o[k]; const key = a.kind === 'C' ? 'C ' + a.why : a.kind + (a.info && a.info.aula2 ? ' com 2ª aula' : ' sem 2ª aula'); c[key] = (c[key] || 0) + 1; }); return passTxt(c); };
        console.log('\n   C1 — ofertas do ⏩ no realista (17/11–28/12), nos dias em que a semana fica fechada se ela marcar também o resto da semana (carimbo = dia planejado; sem ⏳): ' + O.length + ' dia(s)');
        console.log('      leitura adv (o planner; item 3): ' + cnt('adv')); console.log('      leitura estrita (patch: ⏩ sem adv): ' + cnt('est'));
        O.forEach(o => console.log('      ' + fdw(o.d) + ': adv ' + o.sa + ' · estrita ' + o.sb + (o.sa === o.sb ? ' (igual)' : ''))); }
    // C1 — alcance com a T10 de 0 a 4
    const cell = (S) => { if (!S) return 'não rodou'; const m = metr(S); return m.aulas + '/' + m.compl + (m.naoAssist.length ? ' + ' + m.naoAssist.length + ' não assistida' : '') + (m.two.length ? ' · 2 aulas: ' + m.two.map(x => fmt(x.d)).join(',') : '') + ' · última ' + fmt(m.last) + ' · app 15/12 ' + ((S.nums['2026-12-15'] || {}).N) + '·' + ((S.nums['2026-12-15'] || {}).NC); };
    const MC = ['36/36 | 36/36', '37/37 | 37/37', '38/38 | 38/38', '38/38 | 39/39', '38/38 | 39/39'];
    console.log('\n   C1 — alcance no realista com a T10 de 0 a 4 (aulas até 01/01 / cadeias completas, no registro): gatilho estrito (o planner) | largo (patch: qualquer falha do P1 libera a 2ª aula)');
    [0, 1, 2, 3, 4].forEach(n => console.log('      T10 = ' + n + ': estrito ' + cell(n ? fam['T10e' + n] : fam.S0) + ' | largo ' + cell(fam['T10l' + n]) + '   (M-c: ' + MC[n] + ')'));
});
H.summary('simTrilha');

// ══════════ unidades (estados montados à mão; base: as sondas do S3a/S3b, impl/vm/s3a/probe_s3a.js e impl/vm/s3b/probe_s3b.js) ══════════
function units() {
    const src = fs.readFileSync(FILE, 'utf8'); const a0 = src.indexOf('    const endedAtT = (id) =>') >= 0 ? src.indexOf('    const endedAtT = (id) =>') : src.indexOf('    const reorganizeT = (st, fixedD, movable, D0'), b0 = src.indexOf('    const analyzeMoveT = (', a0);
    const REORG = a0 >= 0 && b0 > a0 ? ['function trilhaFinalPlan(P, cfg, trail, hoje, edited) {', 'function __mkReorg(P, hojeT, config) { // SONDA: o reorganizeT do componente (com o teto do encerrado, endedAtT), copiado do próprio arquivo (só no vm)\n' + src.slice(a0, b0) + '    return reorganizeT;\n}\nfunction trilhaFinalPlan(P, cfg, trail, hoje, edited) {', 1, true] : null;
    const cache = {}; const UL = (date, extra) => { const key = date + '|' + J(extra || []); return cache[key] || (cache[key] = load(FILE, date, [REORG].filter(Boolean).concat(extra || []))); };
    const CFG = { ...CFG0 }, R4 = STG, TSFf = { aula: 'aula', quest: 'questoesD2', apost: 'apostila', seal: 'smartcard' }, STF = { aula: 'aulaAt', questoesD2: 'questoesD2At', apostila: 'apostilaAt', smartcard: 'smartcardAt' };
    const mkSt = (hoje) => ({ load: {}, kinds: {}, cfg: CFG, capMemo: {}, hoje, open: {}, areas: {} });
    const capH = (E, st, d) => E.trilhaCap(st, d).h;
    const aulaOn = (E, st, d, n, ids) => { st.kinds[d] = { ...(st.kinds[d] || {}), aula: ((st.kinds[d] || {}).aula || 0) + n }; st.load[d] = (st.load[d] || 0) + 1.7 * n; (ids || []).forEach(id => E.stArea(st, d, id, 1)); };
    const overload = (E, st, d) => { st.load[d] = capH(E, st, d) - 1.0; }; // aula (1,7h), questões (2h) e apostila (1,5h) passam de 14,5h; a selagem (0,67h) ainda cabe
    const run = (u, fn) => { try { fn(); } catch (e) { check(u + ' · exceção', false, String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); } };
    const PROT = { '2026-12-24': 'feriado', '2026-12-25': 'feriado', '2026-12-31': 'feriado', '2026-12-29': 'leve' }; // como o buildTrilhaPlan: 01/01 NÃO é protegido (DELA 5)
    const mkP = (st, plan, prot) => { const byDay = {}; Object.keys(plan).forEach(id => R4.forEach(ts => { const d = plan[id][ts]; if (d) (byDay[d] = byDay[d] || []).push({ id: Number(id), ts }); }));
        return { plan, frozen: new Set(Object.keys(plan).map(Number)), qpos: Object.fromEntries(Object.keys(plan).map((id, i) => [id, i])), stNow: st, prot: prot || PROT, byDay, pending: [] }; };
    const inBands = (E, d) => { const g = (a, b) => d[a] && d[b] ? E.diffDays(d[a], d[b]) : null; return ['quest', 'apost', 'seal'].every((ts, i) => { const x = g(R4[i], ts); return x == null || (x >= E.GAP_T[ts][0] && x <= E.GAP_T[ts][1]); }); };
    function greedyCase(E, nAulas30, protCustom) { // P montado à mão; módulo 27: aula 29/12 atrasada, questões 30/12, apostila 31/12, selagem DEIXADA por ela em 01/01 (teto before = 01/01)
        const hoje = '2026-12-30', st = mkSt(hoje); aulaOn(E, st, '2026-12-30', nAulas30);
        const p = { wk: '2026-12-22', via: 'ramp', aula: '2026-12-29', quest: '2026-12-30', apost: '2026-12-31', seal: '2027-01-01', orig: {}, hist: [], keep: { seal: '2027-01-01' } };
        ['quest', 'apost', 'seal'].forEach(ts => E.stAdd(st, p[ts], ts)); E.stAdd(st, p.aula, 'aula');
        const cfg = { ...CFG, trilhaPlan: { 27: p } }, prot = protCustom || { '2026-12-29': 'leve', '2026-12-24': 'feriado', '2026-12-25': 'feriado', '2026-12-31': 'feriado' };
        const out = E.trilhaFinalPlan({ plan: { 27: { ...p } }, frozen: new Set([27]), qpos: { 27: 0 }, stNow: st, prot }, cfg, {}, hoje, {}); const np = out.patch[27] || {};
        return { aula: np.aula === undefined ? p.aula : np.aula, quest: np.quest, apost: np.apost, log: out.log };
    }
    function progress(file, from, to, mark) { let cfg = { ...CFG }, trail = {}; for (let d = from; d <= to; d = add(d, 1)) { const E = load(file, d); let P = E.buildTrilhaPlan(cfg, trail, d); const patch = E.trilhaFreezePatch(cfg, trail, d, P, {}); if (patch) { cfg = { ...cfg, ...patch }; P = E.buildTrilhaPlan(cfg, trail, d); }
        if (mark) { const list = E.trilhaListFor(d, { cfg, P, trail, hoje: d, ov: {} }); const nt = clone(trail); list.forEach(b => { if (b.tm == null || b.au || b.gh) return; const t = nt[b.tm] = nt[b.tm] || {}; t[TSFf[b.ts]] = true; t[STF[TSFf[b.ts]]] = d; if (b.ts === 'seal') { t.completedAt = d; t.accSelagem = 70; } }); trail = nt; } } return { cfg, trail }; }
    const E0 = UL('2026-12-10'), E30 = UL('2026-12-30'), PLAN_HZ = E30.PLAN_HZ || '2027-06-28';
    if (REORG === null) check('unidades: o reorganizeT do componente foi encontrado no arquivo (U15, U22)', false, 'não encontrado');

    run('U1', () => { const st = mkSt('2026-12-14'), info = {};
        const r = E0.placeChain(st, R4, {}, '2026-12-15', '2026-12-17', '2027-01-01', { prot: {}, novo: true, k: 5, id: 27, info });
        const r1 = E0.chainEnum(st, R4, {}, '2026-12-15', '2026-12-17', '2027-01-01', { prot: {}, id: 27 }, { maxA: 1, qLeve: 0, capH: true, k: 5 });
        check('U1 · P1 escolhido quando cabe: passo P1, o mesmo resultado do P1 sozinho (chainEnum), sem 2ª aula, gatilho falso, sem motivo', !!r && info.pass === 'P1' && J(r) === J(r1) && info.aula2 === null && info.g2 === false && info.why === null, J(r) + ' ' + J(info)); });

    run('U2', () => { const E = E0;
        { const st = mkSt('2026-12-14'); aulaOn(E, st, '2026-12-15', 1, [14]); overload(E, st, '2026-12-16'); aulaOn(E, st, '2026-12-17', 1, [1]); const info = {};
          const r = E.placeChain(st, R4, {}, '2026-12-15', '2026-12-17', '2027-01-01', { prot: {}, novo: true, k: 5, id: 27, info });
          const p1 = E.chainEnum(st, R4, {}, '2026-12-15', '2026-12-17', '2027-01-01', { prot: {} }, { maxA: 1, qLeve: 0, capH: true, k: 0 }), p1sem = E.chainEnum(st, R4, {}, '2026-12-15', '2026-12-17', '2027-01-01', { prot: {} }, { maxA: 1, qLeve: 0, capH: false, k: 0 });
          check('U2a · gatilho estrito (com 1 aula/dia nada cabe em 14,5h, algo cabe passando) → P2: a 2ª aula num dia com 1 aula e permitido; info.aula2 = esse dia', !!r && !p1 && !!p1sem && info.pass === 'P2' && info.aula2 === r.aula && (st.kinds[r.aula] || {}).aula === 1 && E.aula2Ok(r.aula, {}) && info.g2 === true, J(r) + ' ' + J(info)); }
        const EPN = UL('2026-12-10', [['    "2026-11-12": { label: "Plantão", hours: "06h–19h", start: "06:00", end: "19:00", kind: "longo" },\n', '    "2026-11-12": { label: "Plantão", hours: "06h–19h", start: "06:00", end: "19:00", kind: "longo" },\n    "2026-12-14": { label: "SONDA", hours: "18h–07h", kind: "noite" },\n', 1]]);
        const dir = { '09/11 plantão curto': E.aula2Ok('2026-11-09', {}), '17/11 bloco 04h30': E.aula2Ok('2026-11-17', {}), 'dia leve': E.aula2Ok('2026-12-15', { '2026-12-15': 'leve' }), 'pós-noturno (noite sondada em 14/12)': EPN.aula2Ok('2026-12-15', {}), '24/12': E.aula2Ok('2026-12-24', {}), '25/12': E.aula2Ok('2026-12-25', {}), '31/12': E.aula2Ok('2026-12-31', {}) };
        check('U2a · a 2ª aula é recusada em plantão curto (09/11), bloco 04h30 (17/11), dia leve, pós-noturno, 24, 25 e 31/12; 01/01 e um dia comum aceitam', Object.values(dir).every(v => v === false) && E.aula2Ok('2027-01-01', {}) === true && E.aula2Ok('2026-12-15', {}) === true, J(dir));
        const integ = (label, free, two, extraOver) => { const st = mkSt(add(free, -1)); overload(E, st, free); (extraOver || []).forEach(d => overload(E, st, d)); aulaOn(E, st, two, 1); const info = {};
            const r = E.placeChain(st, R4, {}, free, two, '2027-01-10', { prot: {}, novo: true, k: 5, id: 27, info }); return { label, r, info }; };
        const ints = [integ('09/11 (curto)', '2026-11-08', '2026-11-09'), integ('17/11 (04h30)', '2026-11-15', '2026-11-17', ['2026-11-16']), integ('24/12', '2026-12-23', '2026-12-24'), integ('25/12', '2026-12-24', '2026-12-25'), integ('31/12', '2026-12-30', '2026-12-31')], ctl = integ('15/12 (controle)', '2026-12-14', '2026-12-15');
        check('U2a · integrado: com o gatilho valendo e o único dia com 1 aula proibido (09/11, 17/11, 24, 25, 31/12) → nenhuma 2ª aula ali (nulo, gatilho verdadeiro); o controle em dia permitido (15/12) → P2 põe a 2ª aula lá', ints.every(x => x.r === null && x.info.g2 === true) && !!ctl.r && ctl.r.aula === '2026-12-15' && ctl.info.pass === 'P2', ints.concat([ctl]).map(x => x.label + ': ' + J(x.r) + ' ' + x.info.pass + ' g2 ' + x.info.g2).join(' · '));
        const stB = () => { const st = mkSt('2026-12-14'); ['2026-12-15', '2026-12-16', '2026-12-17'].forEach(d => aulaOn(E, st, d, 1)); return st; };
        const call = (opt) => { const info = {}; const r = E.placeChain(stB(), R4, {}, '2026-12-15', '2026-12-17', '2027-01-01', { prot: {}, ...opt, info }); return { r, info }; };
        const ram = call({ novo: true, k: 5, id: 27 }), rec = call({ id: 27 }), fin = call({ hard: true, id: 27 });
        check('U2b · 1 aula/dia falha SÓ por falta de dia sem aula (14,5h folgado): rampa, ⏳ e recolocação automática → nulo, why "cap", sem P2 (gatilho falso)', [ram, rec, fin].every(x => x.r === null && x.info.why === 'cap' && x.info.g2 === false && x.info.pass === null), [ram, rec, fin].map(x => J(x.r) + ' ' + J(x.info)).join(' · ')); });

    run('U3', () => { const E = E0;
        const st = mkSt('2026-12-14'); aulaOn(E, st, '2026-12-15', 2); overload(E, st, '2026-12-16'); aulaOn(E, st, '2026-12-17', 2); const info = {};
        const r = E.placeChain(st, R4, {}, '2026-12-15', '2026-12-17', '2027-01-01', { prot: {}, id: 27, info });
        const st2 = mkSt('2026-12-14'); ['2026-12-15', '2026-12-16', '2026-12-17'].forEach(d => aulaOn(E, st2, d, 2)); const i2 = {};
        const r2 = E.placeChain(st2, R4, {}, '2026-12-15', '2026-12-17', '2027-01-01', { prot: {}, id: 27, info: i2 }), r2n = E.placeChain(st2, R4, {}, '2026-12-15', '2026-12-17', '2027-01-01', { prot: {}, novo: true, k: 5, id: 27 });
        check('U3 · nunca 3 aulas no P4: com 15 e 17/12 já com 2 aulas, a cadeia aberta vai para o dia SEM aula (16/12, acima de 14,5h como penalidade); com todo dia da janela com 2 aulas → nulo (aberta e nova)', !!r && r.aula === '2026-12-16' && info.pass === 'P4' && r2 === null && r2n === null, J(r) + ' ' + J(info) + ' · ' + J(r2) + ' ' + J(r2n));
        const g = greedyCase(E30, 2);
        check('U3 · nunca 3 aulas no guloso (recolocação automática): 30/12 com 2 aulas → a aula atrasada de 29/12 NÃO vai para 30/12', g.aula !== '2026-12-30', J(g)); });

    run('U4', () => { const E = E0;
        const mk = (sameOn) => { const st = mkSt('2026-12-14'); aulaOn(E, st, '2026-12-15', 1, [sameOn === 15 ? 29 : 1]); overload(E, st, '2026-12-16'); aulaOn(E, st, '2026-12-17', 1, [sameOn === 17 ? 29 : 1]); const info = {};
            const r = E.placeChain(st, ['aula'], {}, '2026-12-15', '2026-12-17', '2027-01-01', { prot: {}, novo: true, k: 5, id: 27, info }); return { r, info }; }; // 27 e 29 = HEM; 1 = NEF
        const a = mk(15), b = mk(17), c = mk(0);
        check('U4 · área diferente desempata entre opções do P2 empatadas até clash: HEM1 vai para o dia com aula de NEF (17/12, não 15/12 com HEM); invertido → 15/12; sem área igual → 15/12 ("1ª cedo")', !!a.r && a.r.aula === '2026-12-17' && a.info.pass === 'P2' && a.info.aula2 === '2026-12-17' && !!b.r && b.r.aula === '2026-12-15' && !!c.r && c.r.aula === '2026-12-15', J([a, b, c]));
        check('U4 · areaOf: "HEM1" → "HEM", "CIR2" → "CIR", "ANAT" → "ANAT", módulo inexistente → null', E.areaOf(27) === 'HEM' && E.areaOf(14) === 'CIR' && E.areaOf(91) === 'ANAT' && E.areaOf(99999) === null, [E.areaOf(27), E.areaOf(14), E.areaOf(91), E.areaOf(99999)].join(',')); });

    run('U5', () => { const E = E0;
        const mk = (over16) => { const st = mkSt('2026-12-14'); if (over16) overload(E, st, '2026-12-16'); const info = {};
            const r = E.placeChain(st, ['quest', 'apost', 'seal'], { aula: '2026-12-14' }, '2026-12-15', '2026-12-16', '2027-01-01', { prot: { '2026-12-15': 'leve' }, id: 27, info }); return { r, info }; };
        const a = mk(true), b = mk(false);
        check('U5 · P3a só quando P1 e P2 falham: 15/12 dia leve e 16/12 passaria de 14,5h → questões no dia leve (P3a, info.questLeve = 15/12); com 16/12 folgado → P1, fora do dia leve', !!a.r && a.r.quest === '2026-12-15' && a.info.pass === 'P3a' && a.info.questLeve === '2026-12-15' && !!b.r && b.r.quest === '2026-12-16' && b.info.pass === 'P1' && b.info.questLeve === null, J(a) + ' · ' + J(b));
        const st = mkSt('2026-12-18'); overload(E, st, '2026-12-21'); aulaOn(E, st, '2026-12-22', 1, [1]); const pr = { '2026-12-20': 'leve' }, info = {};
        const r = E.placeChain(st, R4, {}, '2026-12-19', '2026-12-22', '2027-01-01', { prot: pr, novo: true, k: 5, id: 27, info });
        const p3a = E.chainEnum(st, R4, {}, '2026-12-19', '2026-12-22', '2027-01-01', { prot: pr, id: 27 }, { maxA: 1, qLeve: 1, capH: true, k: 5 });
        check('U5 · com aula: o P2 (2ª aula, sem questões no dia leve) vem antes do P3a, que também acharia (questões no dia leve)', !!r && info.pass === 'P2' && info.questLeve === null && r.aula === '2026-12-22' && !!p3a && p3a.quest === '2026-12-20', J(r) + ' ' + J(info) + ' · P3a sozinho: ' + J(p3a)); });

    run('U6', () => { const E = E0; const mk = () => { const st = mkSt('2026-12-14'); ['2026-12-15', '2026-12-16', '2026-12-17'].forEach(d => overload(E, st, d)); return st; };
        const iN = {}, rN = E.placeChain(mk(), R4, {}, '2026-12-15', '2026-12-17', '2027-01-01', { prot: {}, novo: true, k: 5, id: 27, info: iN });
        const iA = {}, rA = E.placeChain(mk(), R4, {}, '2026-12-15', '2026-12-17', '2027-01-01', { prot: {}, id: 27, info: iA });
        check('U6 · P4 só para cadeia aberta: tudo passaria de 14,5h → cadeia NOVA devolve nulo com why "cap" (C3: não entra); a mesma cadeia JÁ aberta → P4 (14,5h como penalidade, 1 aula por dia)', rN === null && iN.why === 'cap' && iN.pass === null && !!rA && iA.pass === 'P4' && (mk().kinds[rA.aula] || {}).aula === undefined, J(rN) + ' ' + J(iN) + ' · ' + J(rA) + ' ' + J(iA)); });

    run('U7', () => { const E = E0; const base = () => { const st = mkSt('2026-12-15'); [101, 102, 103, 104].forEach(i => E.stOpenSet(st, i, '2026-12-10', '2026-12-31')); return st; };
        const mk5 = (s5) => { const st = base(); E.stOpenSet(st, 105, '2026-12-10', s5); return st; }, pc = (st, k) => E.placeChain(st, R4, {}, '2026-12-19', '2026-12-21', '2027-01-01', { prot: {}, novo: true, k, id: 27 });
        const sA = mk5('2026-12-19'), rA = pc(sA, 5), r0 = pc(mk5('2026-12-19'), 0), rB = pc(mk5('2026-12-18'), 5);
        check('U7 · K inclusivo na ponta da AULA: a 5ª cadeia sela em 19/12 → a aula nova não fica em 19/12 (5 + 1 > 5; sem K ficaria); se a 5ª selasse em 18/12, ficaria em 19/12', !!rA && rA.aula > '2026-12-19' && !!r0 && r0.aula === '2026-12-19' && !!rB && rB.aula === '2026-12-19' && E.kCount(sA, '2026-12-19', '2026-12-15', 27) === 5 && E.kCount(sA, '2026-12-20', '2026-12-15', 27) === 4, J(rA) + ' · sem K ' + J(r0) + ' · 5ª sela 18/12: ' + J(rB));
        { const st = base(); E.stOpenSet(st, 106, '2026-12-20', '2026-12-31'); const r = E.placeChain(st, R4, {}, '2026-12-15', '2026-12-15', '2027-01-01', { prot: {}, novo: true, k: 5, id: 27 }), r0b = E.placeChain(st, R4, {}, '2026-12-15', '2026-12-15', '2027-01-01', { prot: {}, novo: true, k: 0, id: 27 });
          check('U7 · K inclusivo na ponta da SELAGEM: outra cadeia abre em 20/12 → a selagem nova fica antes de 20/12; sem K iria para 20/12', !!r && r.seal < '2026-12-20' && !!r0b && r0b.seal >= '2026-12-20', J(r) + ' sem K ' + J(r0b)); }
        { const st = base(); E.stOpenSet(st, 107, '2026-12-01', '2027-01-20'); const info = {}; const r = E.placeChain(st, R4, {}, '2026-12-15', '2026-12-17', '2027-01-01', { prot: {}, novo: true, k: 5, id: 27, info });
          check('U7 · 5 cadeias abertas em todo o período → nulo, why "k" (só o K impediu); kCount não conta o próprio módulo', r === null && info.why === 'k' && E.kCount(st, '2026-12-16', '2026-12-15', 107) === 4, J(r) + ' ' + J(info)); } });

    run('U8', () => { const E = E0; const st = mkSt('2026-12-15'); [101, 102, 103, 104].forEach(i => E.stOpenSet(st, i, '2026-12-01', '2026-12-31')); E.stOpenSet(st, 108, '2026-12-01', '2026-12-10'); // 108: selagem planejada 10/12, sem marca
        const late = E.kCount(st, '2026-12-20', '2026-12-15', 27), inPast = E.kCount(st, '2026-12-20', '2026-12-05', 27);
        const info = {}, r = E.placeChain(st, R4, {}, '2026-12-15', '2026-12-17', '2027-01-01', { prot: {}, novo: true, k: 5, id: 27, info });
        const iP = {}, rP = E.placeChain(st, R4, {}, '2026-12-15', '2026-12-17', '2027-01-01', { prot: {}, novo: true, k: 5, id: 27, kRef: '2026-12-05', info: iP });
        check('U8 · selagem atrasada no dia de referência conta como aberta (C2): kCount(20/12) = 5 com ref 15/12 e 4 com ref 05/12; a colocação com ref = min(from, hoje) = 15/12 dá nulo "k", com kRef 05/12 cabe', late === 5 && inPast === 4 && r === null && info.why === 'k' && !!rP, J({ late, inPast }) + ' · ' + J(r) + ' ' + J(info) + ' · kRef 05/12: ' + J(rP));
        const st2 = mkSt('2026-12-15'); E.stOpenSet(st2, 109, null, null);
        check('U8 · aula sem dia e sem marca conta de hoje em diante (st.hoje); selagem sem dia = aberta até ganhar data', E.kCount(st2, '2026-12-14', '2026-12-15', 27) === 0 && E.kCount(st2, '2026-12-15', '2026-12-15', 27) === 1 && E.kCount(st2, '2027-03-01', '2026-12-15', 27) === 1, ''); });

    run('U9', () => { const E = E0; const mk = () => { const st = mkSt('2026-12-15'); [101, 102, 103, 104, 105, 106].forEach(i => E.stOpenSet(st, i, '2026-12-01', '2027-01-20')); return st; };
        const info = {}, r = E.placeChain(mk(), R4, {}, '2026-12-15', '2026-12-17', '2027-01-01', { prot: {}, k: 5, id: 27, info });
        const p = { wk: '2026-12-08', via: 'ramp', aula: '2026-12-14', quest: '2026-12-15', apost: '2026-12-16', seal: '2026-12-19', orig: {}, hist: [] };
        const st = mk(); R4.forEach(ts => E.stAdd(st, p[ts], ts)); E.stOpenSet(st, 27, p.aula, p.seal);
        const jobs = E.trilhaProposeRecolocar({ pending: [{ id: 27, ts: 'aula', iso: '2026-12-14', why: 'atrasada' }], plan: { 27: p }, qpos: { 27: 0 }, stNow: st, prot: {} }, CFG, {}, '2026-12-15');
        const st3 = mk(); st3.hoje = '2026-12-30'; const p3 = { wk: '2026-12-22', via: 'ramp', aula: '2026-12-29', quest: '2026-12-30', apost: '2026-12-31', seal: '2027-01-01', orig: {}, hist: [] }; R4.forEach(ts => E30.stAdd(st3, p3[ts], ts));
        const fin = E30.trilhaFinalPlan({ plan: { 27: p3 }, frozen: new Set([27]), qpos: { 27: 0 }, stNow: st3, prot: { '2026-12-29': 'leve', '2026-12-31': 'feriado' } }, CFG, {}, '2026-12-30', {});
        check('U9 · o K não atua em cadeia já aberta: placeChain sem "novo" com 6 abertas → P1; o ⏳ propõe a cadeia; a recolocação automática recoloca', !!r && info.pass === 'P1' && jobs.length === 1 && !!jobs[0].days && !!jobs[0].days.aula && !!fin.patch[27] && fin.log.moved.length > 0, J(r) + ' ' + J(info) + ' · ⏳ ' + J(jobs.map(j => j.days)) + ' · auto ' + J(fin.log.moved)); });

    run('U10', () => { const E = E30;
        { const st = mkSt('2026-12-30'); aulaOn(E, st, '2026-12-30', 1); aulaOn(E, st, '2027-01-01', 1); const info = {};
          const r = E.placeChain(st, R4, {}, '2026-12-30', '2027-01-10', PLAN_HZ, { prot: PROT, id: 27, info }); const ce = E.chainEnum(st, R4, {}, '2026-12-30', '2027-01-10', PLAN_HZ, { prot: PROT, id: 27 }, { maxA: 1, qLeve: 1, capH: false, k: 0 });
          const st2 = mkSt('2026-12-30'); aulaOn(E, st2, '2026-12-30', 1); const i2 = {}; const r2 = E.placeChain(st2, R4, {}, '2026-12-30', '2027-01-10', PLAN_HZ, { prot: PROT, novo: true, k: 5, id: 27, info: i2 });
          const r3 = E.placeChain(mkSt('2027-01-02'), R4, {}, '2027-01-02', '2027-01-08', PLAN_HZ, { prot: {}, id: 27 }), r4 = E.chainEnum(mkSt('2026-12-30'), ['aula'], {}, '2026-12-30', '2027-03-01', PLAN_HZ, { prot: {} }, { maxA: 2, qLeve: 1, capH: false, k: 0 });
          check('U10 · aula em 02/01 recusada em placeChain (janela presa): sem dia ≤ 01/01 → nulo em todos os passos (P1–P4, o enumerador também); cadeia nova de 30/12 → aula em 01/01 (dia comum); de 02/01 em diante → nulo; só a aula com janela até 01/03 → ≤ 01/01', r === null && ce === null && !!r2 && r2.aula === '2027-01-01' && i2.pass === 'P1' && r3 === null && !!r4 && r4.aula <= '2027-01-01', J({ r, ce, r2, r3, r4 })); } });

    run('U11', () => { const E = E30;
        { const st = mkSt('2026-12-30'); const p = { wk: '2026-12-22', via: 'ramp', aula: '2027-01-01', quest: '2027-01-02', apost: '2027-01-03', seal: '2027-01-06', orig: {}, hist: [] }; R4.forEach(ts => E.stAdd(st, p[ts], ts));
          const out = E.trilhaFinalPlan(mkP(st, { 27: { ...p } }), CFG, {}, '2026-12-30', {});
          const st2 = mkSt('2026-12-30'); const q = { wk: '2026-12-22', via: 'ramp', aula: '2027-01-02', quest: '2027-01-03', apost: '2027-01-04', seal: '2027-01-07', orig: {}, hist: [] }; R4.forEach(ts => E.stAdd(st2, q[ts], ts)); // dado sintético (aula depois de 01/01 nunca é gravada)
          const out2 = E.trilhaFinalPlan(mkP(st2, { 27: { ...q } }), CFG, {}, '2026-12-30', {}); const np2 = out2.patch[27] || {};
          check('U11 · valid: aula em 01/01 + o resto em janeiro, nas faixas → válido, nada se move; aula em 02/01 (sintético) é inválida pelo teto (stageCap) → recolocada para ≤ 01/01', !out.patch[27] && out.log.moved.length === 0 && !!out2.patch[27] && np2.aula <= '2027-01-01', J(out.log) + ' · ' + J(np2)); }
        { const hoje = '2026-12-31', st = mkSt(hoje); const p = { wk: '2026-12-22', via: 'ramp', aula: '2026-12-30', quest: '2027-01-01', apost: '2027-01-02', seal: '2027-01-02', orig: {}, hist: [], keep: { seal: '2027-01-02' } };
          ['aula', 'quest', 'seal'].forEach(ts => E.stAdd(st, p[ts], ts)); const out = E.trilhaFinalPlan(mkP(st, { 27: { ...p } }), { ...CFG, trilhaPlan: { 27: p } }, {}, hoje, {}); const np = out.patch[27] || {};
          // S10aj-greedy-log (aprovado no S10-ajustes): o guloso fica nas faixas e não entra em "compressed"; o que não cabe antes da selagem deixada fica sem dia (nocabe → ⚠️ e ⏳)
          check('U11 · guloso (teto before = 02/01, deixada por ela): a aula vai para 01/01 — nunca depois — e as questões e a apostila, que não cabem antes de 02/01, ficam sem dia (nocabe; nada encurtado: compressed vazio)', np.aula === '2027-01-01' && np.quest === null && np.apost === null && np.seal === '2027-01-02' && (out.log.nocabe || []).filter(x => x.id === 27).map(x => x.ts).sort().join() === 'apost,quest' && !out.log.compressed.includes(27), J(np) + ' ' + J(out.log)); }
        { const hoje = '2026-12-31', st = mkSt(hoje); aulaOn(E, st, '2027-01-01', 1); const p = { wk: '2026-12-22', via: 'ramp', aula: '2026-12-30', quest: '2027-01-01', apost: '2027-01-02', seal: '2027-01-05', orig: {}, hist: [], keep: { seal: '2027-01-05' } };
          R4.forEach(ts => E.stAdd(st, p[ts], ts)); const out = E.trilhaFinalPlan(mkP(st, { 27: { ...p } }), { ...CFG, trilhaPlan: { 27: p } }, {}, hoje, {}); const np = out.patch[27] || {};
          check('U11 · guloso com 01/01 já com aula (sem o gatilho): a aula NÃO vai para 02/01 nem vira 2ª aula — fica em 30/12 (C4), log.noAula', np.aula === '2026-12-30' && np.quest === null && out.log.noAula.includes(27), J(np) + ' ' + J(out.log)); } });

    run('U12', () => { const E = UL('2027-01-02');
        const st = mkSt('2027-01-02'); const p = { wk: '2026-12-22', via: 'ramp', aula: '2026-12-30', quest: '2026-12-31', apost: '2027-01-02', seal: '2027-01-05', orig: {}, hist: [] }; R4.forEach(ts => E.stAdd(st, p[ts], ts));
        const P = { ...mkP(st, { 27: p }), pending: [{ id: 27, ts: 'aula', iso: '2026-12-30', why: 'atrasada' }, { id: 27, ts: 'quest', iso: '2026-12-31', why: 'atrasada' }] };
        const jobs = E.trilhaProposeRecolocar(P, CFG, {}, '2027-01-02');
        const j2 = E.trilhaProposeRecolocar({ ...P, pending: [{ id: 27, ts: 'quest', iso: '2026-12-31', why: 'atrasada' }] }, CFG, { 27: { aula: true, aulaAt: '2026-12-30' } }, '2027-01-02');
        check('U12 · ⏳ em 02/01 com a aula atrasada: sem proposta (a aula não tem dia depois de 01/01; X17)', jobs.length === 1 && jobs[0].days === null && jobs[0].rem[0] === 'aula', J(jobs.map(j => ({ rem: j.rem, days: j.days }))));
        check('U12/U15 · ⏳ em 02/01 com a aula marcada (30/12): questões, apostila e selagem propostas em janeiro, de hoje em diante, em ordem', j2.length === 1 && !!j2[0].days && j2[0].days.quest >= '2027-01-02' && j2[0].days.seal > j2[0].days.apost && j2[0].days.apost > j2[0].days.quest, J(j2.map(j => ({ rem: j.rem, days: j.days, pass: j.info && j.info.pass })))); });

    run('U13', () => { const E = E30; const st = mkSt('2026-12-29'); const p = { wk: '2026-12-22', via: 'ramp', aula: '2026-12-30', quest: '2027-01-01', apost: '2027-01-02', seal: '2027-01-05', orig: {}, hist: [] }; const P = mkP(st, { 27: p });
        const SP = E.trilhaShiftPlan(P, CFG, {}, 27, 'aula', '2026-12-30', '2027-01-02', '2026-12-29', {}), SP2 = E.trilhaShiftPlan(P, CFG, {}, 27, 'aula', '2026-12-30', '2027-01-01', '2026-12-29', {});
        check('U13 · trilhaShiftPlan com a aula para 02/01: aulaFim, ready falso, nenhuma linha anda, sem pergunta nem "sem dia" (RM10); para 01/01: aceito, as seguintes andam para janeiro; sem leftOnEnd/leftAfter', SP.aulaFim === true && SP.ready === false && SP.rows.length > 0 && SP.rows.every(r => r.to === r.from && !r.q && !r.nofit) && SP.pendingQ === 0 && SP.nofit.length === 0 && SP2.aulaFim === false && SP2.ready === true && SP2.rows.find(r => r.ts === 'aula').to === '2027-01-01' && SP2.rows.filter(r => r.ts !== 'aula').every(r => r.to > '2027-01-01') && !('leftOnEnd' in SP2) && !('leftAfter' in SP2), J({ a: [SP.aulaFim, SP.ready, SP.rows.map(r => [r.ts, r.from, r.to])], b: SP2.rows.map(r => [r.ts, r.from, r.to]) })); });

    run('U14', () => { const E = E30; const st = mkSt('2026-12-29'); const cfg = { ...CFG, simOverrides: { '2027-01-01': true } }; // 01/01 com simulado religado
        const p = { wk: '2026-12-22', via: 'ramp', aula: '2027-01-03', quest: '2027-01-04', apost: '2027-01-05', seal: '2027-01-08', orig: {}, hist: [] }; const P = mkP(st, { 27: p }); // dado sintético
        const q = E.trilhaShiftPlan(P, cfg, {}, 27, 'quest', '2027-01-04', '2027-01-02', '2026-12-29', {}), qa = q.rows.find(r => r.ts === 'aula') || {};
        const SP = E.trilhaShiftPlan(P, cfg, {}, 27, 'quest', '2027-01-04', '2027-01-02', '2026-12-29', { aula: { '2027-01-01': 'skip' } });
        check('U14 · linha anterior de aula (eRows) empurrada por "Pular" para depois de 01/01 (seed montado: a aula iria para 01/01, sexta de simulado religado → pergunta; "Pular +1 dia" → 02/01): aulaFim, ready falso, nenhuma linha anda', !!qa.q && qa.q.d === '2027-01-01' && SP.aulaFim === true && SP.ready === false && SP.rows.every(r => r.to === r.from), J({ premissa: q.rows.map(r => [r.ts, r.to, r.q && r.q.d]), rows: SP.rows.map(r => [r.ts, r.from, r.to]), aulaFim: SP.aulaFim })); });

    run('U15', () => { const E = E30;
        { const st = mkSt('2026-12-30'); const info = {}; const r = E.placeChain(st, R4, {}, '2026-12-30', '2027-01-01', PLAN_HZ, { prot: PROT, novo: true, k: 5, id: 27, info });
          check('U15 · placeChain (cadeia nova de 30/12): aula ≤ 01/01 e a cadeia fecha em janeiro, nas faixas', !!r && r.aula <= '2027-01-01' && r.seal > '2027-01-01' && inBands(E, r), J(r) + ' ' + J(info)); }
        { const hoje = '2026-12-31', st = mkSt(hoje); const p = { wk: '2026-12-22', via: 'ramp', aula: '2026-12-30', quest: '2026-12-31', apost: '2027-01-01', seal: '2027-01-01', orig: {}, hist: [] }; ['quest', 'apost', 'seal'].forEach(ts => E.stAdd(st, p[ts], ts));
          const out = E.trilhaFinalPlan(mkP(st, { 27: { ...p } }), CFG, { 27: { aula: true, aulaAt: '2026-12-30' } }, hoje, {}); const np = out.patch[27] || {};
          check('U15 · recolocação automática (31/12, aula marcada em 30/12; apostila e selagem no mesmo dia): questões/apostila/selagem em janeiro se preciso, nas faixas, com hist "final"', !!out.patch[27] && np.seal > '2027-01-01' && inBands(E, { aula: '2026-12-30', quest: np.quest, apost: np.apost, seal: np.seal }) && (np.hist || []).some(h => h.why === 'final'), J(np)); }
        { const st = mkSt('2026-12-30'); const p = { wk: '2026-12-22', via: 'ramp', aula: '2026-12-28', quest: '2026-12-30', apost: '2027-01-01', seal: '2027-01-04', orig: {}, hist: [] };
          const SP = E.trilhaShiftPlan(mkP(st, { 27: p }), CFG, { 27: { aula: true, aulaAt: '2026-12-28' } }, 27, 'quest', '2026-12-30', '2026-12-31', '2026-12-30', {});
          const st2 = mkSt('2026-12-31'); const p2 = { wk: '2026-12-22', via: 'ramp', aula: '2026-12-30', quest: '2027-01-01', apost: '2027-01-02', seal: '2027-01-05', orig: {}, hist: [] };
          const SP2 = E.trilhaShiftPlan(mkP(st2, { 27: p2 }), CFG, { 27: { aula: true, aulaAt: '2026-12-30' } }, 27, 'quest', '2027-01-01', '2027-01-11', '2026-12-31', {}); const sr = SP2.rows.find(r => r.ts === 'seal');
          check('U15 · "Mover o fio todo": apostila e selagem andam para janeiro sem "sem dia"; em janeiro a selagem que cairia na SEX 15/01 (simulado pela quinzena) leva a pergunta, como antes de 01/01', SP.ready === true && SP.nofit.length === 0 && SP.rows.find(r => r.ts === 'seal').to === '2027-01-05' && !!sr.q && sr.q.d === '2027-01-15' && /simulado/.test(sr.q.why) && SP2.ready === false, J({ a: SP.rows.map(r => [r.ts, r.to]), b: SP2.rows.map(r => [r.ts, r.to, r.q && r.q.d]) })); }
        { const reorg = E.__mkReorg({ prot: PROT }, '2026-12-30', CFG); const r = reorg(mkSt('2026-12-30'), { aula: '2026-12-30', quest: '2027-01-01' }, ['apost', 'seal'], { aula: '2026-12-30', quest: '2027-01-01', apost: '2027-01-01', seal: '2027-01-01' }, 27);
          check('U15 · "Ver como reorganizar": apostila e selagem podem ir para janeiro (okDay com stageCap)', !!r && r.days.apost > '2027-01-01' && r.days.seal > r.days.apost, J(r)); } });

    run('U16', () => { const E = E30, hoje = '2026-12-31';
        const mk = () => { const st = mkSt(hoje); aulaOn(E, st, '2027-01-01', 1, [1]); const p = { wk: '2026-12-22', via: 'ramp', aula: '2026-12-30', quest: '2027-01-01', apost: '2027-01-02', seal: '2027-01-05', orig: {}, hist: [] }; R4.forEach(ts => E.stAdd(st, p[ts], ts)); E.stArea(st, p.aula, 27, 1); return { st, p }; };
        const { st, p } = mk(); const out = E.trilhaFinalPlan(mkP(st, { 27: { ...p } }), CFG, {}, hoje, {}); const np = out.patch[27] || {};
        check('U16 · trilhaFinalPlan com a aula sem outro dia (30/12 atrasada, 31/12 feriado, 01/01 já com aula, sem gatilho): a aula FICA em 30/12, sem hist; questões/apostila/selagem nulas com hist "final" (to: null); log.noAula = [27]; nada em compressed', np.aula === '2026-12-30' && np.quest === null && np.apost === null && np.seal === null && !(np.hist || []).some(h => h.ts === 'aula') && (np.hist || []).filter(h => h.to === null && h.why === 'final').length === 3 && J(out.log.noAula) === '[27]' && out.log.nocabe.length === 3 && out.log.compressed.length === 0, J(np) + ' ' + J(out.log));
        const Eb = UL('2026-12-31'); const cfgOld = { ...CFG, trilhaFirstOpen: '2026-10-26', trilhaWeeks: { '2026-12-22': { q: 1, base: 4, mods: [27], adv: [], rise: [], light: null, at: '2026-12-22' } }, trilhaPlan: { 27: { wk: '2026-12-22', via: 'ramp', aula: null, quest: null, apost: null, seal: null, orig: { aula: '2026-12-30', quest: '2026-12-31', apost: '2027-01-01', seal: '2027-01-01' }, hist: [{ ts: 'aula', from: '2026-12-30', to: null, at: '2026-12-30', why: 'final' }, { ts: 'quest', from: '2026-12-31', to: null, at: '2026-12-30', why: 'final' }] } } };
        const snap = J(cfgOld); const P = Eb.buildTrilhaPlan(cfgOld, {}, '2026-12-31');
        check('U16 · (RM11) dado antigo com a aula nula: P.plan[27].aula = 30/12 (do hist "final") só na memória; o config não muda', P.plan[27].aula === '2026-12-30' && J(cfgOld) === snap && cfgOld.trilhaPlan[27].aula === null, J(P.plan[27])); });

    const headProg = (mark) => { if (!HEADF) throw new Error('sem o planner antigo (git): ' + headErr); return progress(HEADF, START, '2026-11-10', mark); };
    run('U17', () => { const S = headProg(true); const E = UL('2026-11-11'); const P = E.buildTrilhaPlan(S.cfg, S.trail, '2026-11-11');
        const frozenOpen = Object.keys(S.cfg.trilhaPlan).filter(id => !(S.trail[id] || {}).smartcard), inOpen = frozenOpen.every(id => !!P.stNow.open[id]);
        const prof = {}; ['2026-11-13', '2026-11-14', '2026-11-15', '2026-11-16'].forEach(d => { prof[d.slice(5)] = Object.values(S.cfg.trilhaPlan).filter(p => p.aula && p.seal && p.aula <= d && d <= p.seal).length; });
        const iv = []; Object.keys(P.plan).forEach(id => { const p = P.plan[id], t = S.trail[id] || {}; if (t.smartcard && !p.preview) return; const a = (t.aula && t.aulaAt) || p.aula; if (!a && !p.preview) return; let s = p.seal; if (!p.preview && (!s || s < '2026-11-11')) s = '9999-12-31'; iv.push({ a: a || '2026-11-11', s: s || '9999-12-31', pre: !!p.preview }); });
        const days = new Set(); iv.filter(x => x.pre).forEach(x => { for (let d = x.a; d <= x.s && d <= '2027-06-28'; d = add(d, 1)) days.add(d); }); let max = 0; const viol = [];
        [...days].sort().forEach(d => { const n = iv.filter(x => x.a <= d && d <= x.s).length; if (n > max) max = n; if (n > 5) viol.push(d.slice(5) + '=' + n); });
        const T4 = P.weeks['2026-11-17'] || {};
        check('U17 · semeadura do K: com T1–T3 congeladas pelo 409e1f9 (ela fez tudo até 10/11), as cadeias congeladas sem selagem marcada estão em st.open, e nenhum dia coberto por cadeia de prévia (T4 em diante) passa de 5 abertas', frozenOpen.length > 0 && inOpen && max > 0 && viol.length === 0, 'abertas congeladas ' + frozenOpen.length + ' · perfil do plano congelado 13–16/11 ' + J(prof) + ' · T4 q ' + T4.q + ' mods ' + J(T4.mods) + ' short ' + T4.short + (T4.shortWhy ? ' (' + T4.shortWhy + ')' : '') + ' · K máx. nos dias de prévia ' + max + (viol.length ? ' VIOL ' + viol.slice(0, 5).join(' ') : '')); });

    run('U18', () => { const S = headProg(false); const ids = Object.keys(S.cfg.trilhaPlan).map(Number), pl = S.cfg.trilhaPlan;
        const A = ids.find(id => pl[id].seal >= '2026-11-12'), B = ids.find(id => id !== A && pl[id].aula >= '2026-11-12'); const E = UL('2026-11-11'); const C = E.trilhaQueue(S.cfg, {}).find(id => !pl[id]);
        const trail = { [A]: { smartcard: true, smartcardAt: '2026-11-11' }, [B]: { aula: true, aulaAt: '2026-11-05' }, [C]: { aula: true, aulaAt: '2026-11-11' } };
        const P = E.buildTrilhaPlan(S.cfg, trail, '2026-11-11'), o = P.stNow.open, P0 = E.buildTrilhaPlan(S.cfg, { [A]: trail[A], [B]: trail[B] }, '2026-11-11'); const k0 = P0.stNow.kinds['2026-11-11'] || {}, k1 = P.stNow.kinds['2026-11-11'] || {}; const pc = P.plan[C] || {};
        check('U18 · selagem marcada (módulo ' + A + ') não conta; aula marcada (' + B + ', planejada ' + (pl[B] || {}).aula + ') conta do carimbo 05/11 até a selagem planejada; começado sem plano com a aula marcada (' + C + ') conta do carimbo 11/11 (sem carga), e a rampa o coloca como cadeia já aberta', !o[A] && !!o[B] && o[B].a === '2026-11-05' && o[B].s === pl[B].seal && !!o[C] && o[C].a === '2026-11-11' && o[C].s === null && (k1.aula || 0) === (k0.aula || 0) + 1 && (P.stNow.load['2026-11-11'] || 0) === (P0.stNow.load['2026-11-11'] || 0) && !!pc.seal && pc.aula === '2026-11-11', J({ A: o[A] || null, B: o[B], C: o[C], kinds: [k0, k1], planC: pc })); });

    run('U19', () => { const E = E0; const P0 = (st) => ({ Q: [27], frozen: new Set(), stNow: st, prot: {} });
        const st = mkSt('2026-12-15'); ['2026-12-15', '2026-12-16', '2026-12-17', '2026-12-19', '2026-12-20', '2026-12-21'].forEach(d => aulaOn(E, st, d, 1, [1]));
        const a = E.trilhaProposeAdvance(P0(st), CFG, {}, '2026-12-15'); const info = {}, n = E.placeChain(st, R4, {}, '2026-12-15', '2026-12-21', '2026-12-21', { prot: {}, novo: true, k: 5, id: 27, info });
        check('U19 · ⏩ (adv): semana sem dia livre de aula (14,5h folgado) → proposta com a 2ª aula (passo P2), info.aula2 = dia da aula; sem adv (gatilho estrito) a mesma janela dá nulo "cap"', (a.kind === 'A' || a.kind === 'B') && !!a.info && a.info.pass === 'P2' && a.info.aula2 === a.days.aula && n === null && info.why === 'cap', J(a) + ' · estrito ' + J(info));
        const stK = mkSt('2026-12-15'); [101, 102, 103, 104, 105].forEach(i => E.stOpenSet(stK, i, '2026-12-01', '2027-01-20')); const aK = E.trilhaProposeAdvance(P0(stK), CFG, {}, '2026-12-15');
        const aL = E.trilhaProposeAdvance(P0(mkSt('2026-12-15')), CFG, {}, '2026-12-15'); const st2 = mkSt('2026-12-15'); ['2026-12-15', '2026-12-16', '2026-12-17', '2026-12-19', '2026-12-20', '2026-12-21'].forEach(d => aulaOn(E, st2, d, 2)); const a2 = E.trilhaProposeAdvance(P0(st2), CFG, {}, '2026-12-15');
        check('U19 · ⏩ não usa a 2ª aula quando só o K impede (C "k"); semana livre → A no P1 sem 2ª aula; 2 aulas em todo dia → C "semdia"', aK.kind === 'C' && aK.why === 'k' && aL.kind === 'A' && aL.info.pass === 'P1' && aL.info.aula2 === null && a2.kind === 'C' && a2.why === 'semdia', J([aK, { kind: aL.kind, pass: aL.info && aL.info.pass }, a2])); });

    run('U20', () => { const E = E0, fixed = { aula: '2026-12-28', quest: '2026-12-30', apost: '2027-01-01' };
        const call = (Ex, o) => { const st = mkSt('2027-01-01'), info = {}; const r = Ex.placeChain(st, ['seal'], fixed, '2027-01-01', PLAN_HZ, PLAN_HZ, { prot: {}, id: 27, info, ...o }); return { r, info }; };
        const n = call(E, {}), c = call(E, { compress: true }), off = call(UL('2026-12-10', [['const K_OPEN = 5, CLOSE_BY = "2027-01-03", CLOSE_BY_ON = true;', 'const K_OPEN = 5, CLOSE_BY = "2027-01-03", CLOSE_BY_ON = false;', 1]]), {});
        const st = mkSt('2027-01-01'); st.load['2027-01-03'] = capH(E, st, '2027-01-03') - 0.3; const info = {}; const r = E.placeChain(st, ['seal'], fixed, '2027-01-01', PLAN_HZ, PLAN_HZ, { prot: {}, id: 27, info });
        check('U20 · LATE03: entre opções nas faixas, a selagem ≤ 03/01 vence (apostila 01/01 → selagem 03/01, não o ideal 04/01); no comprimido o termo vale 0 (04/01); com CLOSE_BY_ON = false (patch) → 04/01; se 03/01 passaria de 14,5h → volta o ideal (04/01, P1)', !!n.r && n.r.seal === '2027-01-03' && !!c.r && c.r.seal === '2027-01-04' && !!off.r && off.r.seal === '2027-01-04' && !!r && r.seal === '2027-01-04' && info.pass === 'P1', J({ normal: n.r, comprimido: c.r, off: off.r, cheio: r })); });

    run('U21', () => { const S = progress(FILE, START, '2026-11-16', true); // T1–T3 congeladas por ESTE arquivo; ela fez tudo até 16/11; depois o app fica fechado
        const at = (patches, hoje) => { const E = load(FILE, hoje, patches); const P = E.buildTrilhaPlan(S.cfg, S.trail, hoje); const patch = E.trilhaFreezePatch(S.cfg, S.trail, hoje, P, {}) || {}; const W = (patch.trilhaWeeks || {})['2026-11-17'] || null; const plan = {}; (W ? W.mods : []).forEach(id => { const p = patch.trilhaPlan[id]; plan[id] = [p.aula, p.quest, p.apost, p.seal]; }); return { W, plan }; };
        const strip = (W) => W ? { q: W.q, mods: W.mods, short: W.short, shortWhy: W.shortWhy || null } : null;
        const X = at([], '2026-11-17'), Y = at([], '2026-11-24'); let Ym = null, mErr = null; try { Ym = at([['const ref = opt.kRef || (st.hoje && st.hoje < from ? st.hoje : from), kc = {};', 'const ref = opt.kRef || st.hoje || from, kc = {};', 1]], '2026-11-24'); } catch (e) { mErr = String(e.message).slice(0, 120); }
        check('U21 · ref do K: a T4 congelada em 24/11 (app fechado 17–23/11, sem marcas novas) = a T4 congelada em 17/11 — mesma cota, mesmos módulos, mesmas datas; dentes: com ref = hoje (mutante só no vm) a T4 de 24/11 muda', !!X.W && J(strip(X.W)) === J(strip(Y.W)) && J(X.plan) === J(Y.plan) && !!Ym && (J(strip(Ym.W)) !== J(strip(X.W)) || J(Ym.plan) !== J(X.plan)), '17/11: ' + J(strip(X.W)) + ' ' + J(X.plan) + ' · 24/11: ' + J(strip(Y.W)) + ' · mutante: ' + (Ym ? J(strip(Ym.W)) + ' ' + J(Ym.plan) : mErr)); });

    run('U22', () => { const E = E0; const reorg = (prot, st, fixedD, movable, D0) => E.__mkReorg({ prot }, '2026-12-10', CFG)(st, fixedD, movable, D0, 27);
        const fx = { quest: '2026-12-15', apost: '2026-12-17', seal: '2026-12-20' }, D0 = { aula: '2026-12-16', ...fx };
        const s1 = mkSt('2026-12-10'); aulaOn(E, s1, '2026-12-13', 1); const r1 = reorg({}, s1, fx, ['aula'], D0);
        const s2 = mkSt('2026-12-10'); aulaOn(E, s2, '2026-12-13', 1); overload(E, s2, '2026-12-14'); const r2 = reorg({}, s2, fx, ['aula'], D0);
        const s3 = mkSt('2026-12-10'); aulaOn(E, s3, '2026-12-13', 1); const r3 = reorg({ '2026-12-14': 'feriado' }, s3, fx, ['aula'], D0);
        check('U22 · reorganizeT: a aula movível vai para o dia SEM aula (R1, 14/12); com 14/12 acima de 14,5h (gatilho estrito) → 2ª aula em 13/12 (R2); sem o gatilho (14/12 protegido) → sem proposta, a aula não vai para 13/12', !!r1 && r1.days.aula === '2026-12-14' && !!r2 && r2.days.aula === '2026-12-13' && r3 === null, J([r1, r2, r3]));
        const fq = { aula: '2026-12-14', apost: '2026-12-17', seal: '2026-12-20' }, Dq = { quest: '2026-12-13', ...fq };
        const s4 = mkSt('2026-12-10'); overload(E, s4, '2026-12-16'); const r4 = reorg({ '2026-12-15': 'leve' }, s4, fq, ['quest'], Dq); const r5 = reorg({ '2026-12-15': 'leve' }, mkSt('2026-12-10'), fq, ['quest'], Dq);
        check('U22 · reorganizeT: questões no dia leve só no R3 — com 16/12 acima de 14,5h vão para o dia leve (15/12, última saída); com 16/12 folgado ficam fora dele', !!r4 && r4.days.quest === '2026-12-15' && !!r5 && r5.days.quest === '2026-12-16', J([r4, r5])); });

    run('U23', () => { const E = E30; const a = greedyCase(E, 1), b = greedyCase(E, 1, { '2026-12-29': 'leve' }); // b: 31/12 sem proteção (sonda) = dia sem aula
        check('U23 · guloso: sem o gatilho (30/12 com 1 aula, nenhum outro dia sem aula até 01/01) a aula NÃO vira 2ª aula em 30/12; com 31/12 livre, a aula vai primeiro para o dia sem aula (31/12)', a.aula !== '2026-12-30' && b.aula === '2026-12-31', J({ a, b }));
        const hoje = '2026-12-30', st = mkSt(hoje); st.load['2026-12-30'] = capH(E, st, '2026-12-30') - 1.0; aulaOn(E, st, '2027-01-01', 1, [1]);
        const p = { wk: '2026-12-22', via: 'ramp', aula: '2026-12-29', quest: '2026-12-30', apost: '2027-01-01', seal: '2027-01-03', orig: {}, hist: [], keep: { seal: '2027-01-03' } }; R4.forEach(ts => E.stAdd(st, p[ts], ts));
        const out = E.trilhaFinalPlan(mkP(st, { 27: { ...p } }), { ...CFG, trilhaPlan: { 27: p } }, {}, hoje, {}); const np = out.patch[27] || {};
        // S10aj-greedy-log: o guloso não entra em "compressed" (fica nas faixas); a apostila que não cabe antes da selagem deixada fica sem dia (nocabe)
        check('U23 · guloso em duas varreduras: a 2ª (2ª aula) só roda com info.g2 — normal e comprimido falham (teto before = 03/01, deixada por ela), 30/12 passaria de 14,5h e 01/01 tem 1 aula → aula em 01/01 (2ª aula, log.aula2 = [01/01]), questões 02/01, apostila sem dia (nocabe), nada em compressed', np.aula === '2027-01-01' && np.quest === '2027-01-02' && np.apost === null && J(out.log.aula2) === '["2027-01-01"]' && out.log.noAula.length === 0 && (out.log.nocabe || []).some(x => x.id === 27 && x.ts === 'apost') && !out.log.compressed.includes(27), J(np) + ' ' + J(out.log)); });

    run('U24', () => { const LIM = 2000, TO = 20000; // ESCOLHA (S3a): teto de 2 s por chamada; o processo filho é morto em 20 s
        const code = `const { load } = require(${J(__filename)}); const E = load(${J(FILE)}, '2026-12-29');
          const PLAN_HZ = E.PLAN_HZ || '2027-06-28'; const st = { load: {}, kinds: {}, cfg: ${J(CFG)}, capMemo: {}, hoje: '2026-12-29', open: {}, areas: {} };
          const prot = { '2026-12-29': 'leve', '2026-12-31': 'feriado' }; const t0 = Date.now();
          const r = E.placeChain(st, ['aula', 'quest', 'apost', 'seal'], {}, '2026-12-29', PLAN_HZ, PLAN_HZ, { prot, hard: true, compress: true, id: 27, info: {} });
          console.log(JSON.stringify({ ms: Date.now() - t0, r }));`;
        let out = null, err = null; try { out = JSON.parse(execFileSync(process.execPath, ['-e', code], { timeout: TO, encoding: 'utf8' }).trim().split('\n').pop()); } catch (e) { err = e.killed ? 'morto em ' + TO / 1000 + ' s' : String(e.message).slice(0, 200); }
        const g = (a, b) => out && out.r && out.r[a] && out.r[b] ? dd(out.r[a], out.r[b]) : null;
        check('U24 · comprimido com end = lastFirst = PLAN_HZ (pior caso montado, as 4 etapas a partir de 29/12): termina em ≤ ' + LIM + ' ms (janela limitada), aula ≤ 01/01 e janelas de no máximo 2× a faixa', !!out && out.ms <= LIM && !!out.r && out.r.aula <= '2027-01-01' && g('aula', 'quest') <= 4 && g('quest', 'apost') <= 4 && g('apost', 'seal') <= 10, err || J(out)); });

    // U25 · S10rv1-pend-carga (😴 14,5h; SPEC "Leitura operacional" P1; §3.3 linha 5; revisão r1-C-motor-1): no ⏳ "Ver como recolocar", o módulo que fica SEM proposta
    // mantém as datas antigas — a carga dele continua no dia para os outros. Estado mínimo da fuzz (sementes 267/725, reduzido): 03/11, CIR1 (6) e CIR2 (14) congelados, o 14
    // com aula e questões ✓ e a apostila de 02/11 no ⏳, sem proposta (ancorada nas questões marcadas de 01/11, não tem dia nas faixas; a selagem fica em 05/11); o 6 inteiro no ⏳; simulado de 06/11 desligado por ela.
    // Antes: o P1 do 6 punha as questões em QUI 05/11, onde fica a selagem do 14 → 15,00h depois de Aplicar. Agora: ≤ 14,5h em todo dia da proposta P1–P3.
    // Rodada 4 (r4-E-codigo-1, lacuna do TESTE — o planner não mudou): o mesmo estado roda nas DUAS ordens da fila do ⏳ (mods da semana de 26/10). [6, 14], o módulo sem proposta
    // por último: só passa pelo ramo "a carga dele fica no st para os que vêm ANTES". [14, 6], o módulo sem proposta ANTES do outro: na vez dele ele tira as próprias etapas e,
    // sem proposta de novo, tem de DEVOLVÊ-LAS (`else if (F.has(j.id)) old(st, j, 1)` de trilhaProposeRecolocar) para o 6, que vem depois — sem esse ramo, só nessa ordem as questões
    // do 6 voltam para QUI 05/11 com 15,00h (o teste de uma ordem só ficava ✅). Uma só linha de check, que exige o mesmo nas duas e que a fila tenha saído na ordem pedida.
    run('U25', () => { const S0 = {"d":"2026-11-03","cfg":{"startDate":"2026-01-07","manualWeek":null,"trilhaFirstOpen":"2026-10-26","trilhaWeeks":{"2026-10-26":{"q":2,"base":3,"held":false,"why":null,"mods":[6,14],"adv":[],"rise":[],"short":0,"light":"2026-10-31","at":"2026-10-26"},"2026-11-03":{"q":0,"base":0,"held":false,"why":null,"mods":[],"adv":[],"rise":[],"short":0,"light":"2026-11-07","at":"2026-11-03"}},"trilhaPlan":{"6":{"wk":"2026-10-26","via":"ramp","aula":"2026-11-02","quest":"2026-11-04","apost":"2026-11-05","seal":"2026-11-08","orig":{"aula":"2026-10-28","quest":"2026-10-29","apost":"2026-10-30","seal":"2026-11-02"},"hist":[{"ts":"aula","from":"2026-10-28","to":"2026-11-02","at":"2026-10-29","why":"recolocar"},{"ts":"quest","from":"2026-10-29","to":"2026-11-04","at":"2026-10-29","why":"recolocar"},{"ts":"apost","from":"2026-10-30","to":"2026-11-05","at":"2026-10-29","why":"recolocar"},{"ts":"seal","from":"2026-11-02","to":"2026-11-08","at":"2026-10-29","why":"recolocar"}]},"14":{"wk":"2026-10-26","via":"ramp","aula":"2026-10-30","quest":"2026-11-01","apost":"2026-11-02","seal":"2026-11-05","orig":{"aula":"2026-10-30","quest":"2026-11-01","apost":"2026-11-02","seal":"2026-11-05"},"hist":[]}},"trilhaRamp":{"2026-11-10":0,"2026-11-17":0,"2026-11-24":0,"2026-12-01":0,"2026-12-08":0,"2026-12-15":0,"2026-12-22":0,"2026-12-29":0},"simOverrides":{"2026-11-06":false}},"trail":{"14":{"aula":true,"aulaAt":"2026-10-30","questoesD2":true,"questoesD2At":"2026-11-01"}}}, d = S0.d, E = UL(d);
        const R = [[6, 14], [14, 6]].map(ord => { const S = clone(S0); S.cfg.trilhaWeeks['2026-10-26'].mods = ord; // r4-E-codigo-1: as duas ordens da fila (a 2ª exercita o ramo que devolve a carga)
            const P = E.buildTrilhaPlan(S.cfg, S.trail, d), jobs = E.trilhaProposeRecolocar(P, S.cfg, S.trail, d, {}); const j6 = jobs.find(j => j.id === 6), j14 = jobs.find(j => j.id === 14);
            const plan = clone(S.cfg.trilhaPlan); jobs.forEach(j => { if (!j.days) return; j.rem.forEach(x => { plan[j.id][x] = j.days[x]; }); }); const cfg2 = { ...S.cfg, trilhaPlan: plan }, P2 = E.buildTrilhaPlan(cfg2, S.trail, d);
            const days = [...new Set(jobs.filter(j => j.days && /^P[123]/.test((j.info || {}).pass || '')).flatMap(j => Object.values(j.days)))].sort(), ld = days.map(x => [x, E.dayLoadHours(E.trilhaListFor(x, { cfg: cfg2, P: P2, trail: S.trail, hoje: d }))]);
            return { ok: J(jobs.map(j => j.id)) === J(ord) && !!j14 && !j14.days && !!j6 && !!j6.days && /^P[123]/.test((j6.info || {}).pass || '') && ld.length > 0 && ld.every(([, h]) => h <= CAP + 1e-9),
                ev: { fila: jobs.map(j => j.id), j6: j6 && j6.days, pass: j6 && j6.info && j6.info.pass, j14: j14 && j14.days, ld: ld.map(([x, h]) => fmt(x) + ' ' + h2(h)) } }; });
        check('U25 · ⏳ com um módulo sem proposta (CIR2, as datas antigas ficam), nas duas ordens da fila (CIR1 antes do CIR2 e CIR2 antes do CIR1): a proposta P1–P3 do outro (CIR1) não põe nenhum dia acima de 14,5h depois de Aplicar — antes, as questões iam para QUI 05/11 (com a selagem do CIR2) e o dia ficava com 15,00h',
            R.length === 2 && R.every(r => r.ok), J(R.map(r => r.ev))); });

    // U26 · S10rv1-leve-feriado (🧠 DELA 2 "questões só como última saída e com aviso 🌿"; §3.6; X18; revisão r1-A-fidelidade-1 — CONFLITO apresentado: o §3.6 escreve
    // prot === "leve" e os feriados "seguem como hoje"): o dia leve que ela escolhe no seletor 🌿 em 24, 25 ou 31/12 vale como dia leve. 1º acesso 22/12, ela faz tudo até
    // 23/12; CIR2 · Cicatrização (19) com a aula ✓ 23/12 e as questões de 24/12 no ⏳; dia leve da T9 = SEX 25/12 (lightDayOverrides). As questões só cabem em 25/12
    // (faixa 1–2 dias): antes, entravam pelo P1, sem a nota 🌿; agora P.prot = "leve", passo P3 e info.questLeve = 25/12 (a nota X18 da proposta).
    run('U26', () => { const S = progress(FILE, '2026-12-22', '2026-12-23', true), id = Object.keys(S.cfg.trilhaPlan).map(Number).find(i => (S.trail[i] || {}).aulaAt === '2026-12-23' && !(S.trail[i] || {}).questoesD2);
        const cfg = clone(S.cfg), trail = clone(S.trail), hoje = '2026-12-25'; if (id != null) { const p = cfg.trilhaPlan[id]; p.quest = '2026-12-24'; p.orig = { ...p.orig, quest: '2026-12-24' }; } cfg.lightDayOverrides = { '2026-12-22': 3 };
        const E = UL(hoje), P = E.buildTrilhaPlan(cfg, trail, hoje), j = id != null ? E.trilhaProposeRecolocar(P, cfg, trail, hoje, {}).find(x => x.id === id) : null, inf = (j && j.info) || {};
        check('U26 · dia leve escolhido por ela em SEX 25/12 (feriado): vale como dia leve — P.prot = "leve", as questões do ⏳ (só cabem nele) entram pelo P3 com info.questLeve = 25/12 (nota 🌿 "última saída"), não pelo P1 sem aviso; a 2ª aula continua fora (aula2Ok falso)',
            id != null && P.prot['2026-12-25'] === 'leve' && !!j && !!j.days && j.days.quest === '2026-12-25' && /^P3/.test(inf.pass || '') && inf.questLeve === '2026-12-25' && !E.aula2Ok('2026-12-25', P.prot), J({ id, prot: P.prot['2026-12-25'], days: j && j.days, pass: inf.pass, questLeve: inf.questLeve })); });
    // U27 · S10rv2-comprimido-ancora (🧩 o que o 📦 anunciou não some no dia seguinte sem ação dela · 📚 · SPEC "Leitura operacional" P4 "nunca sem proposta numa cadeia
    // JÁ aberta"; §4.1 "com a cauda sempre há dia em janeiro"; revisão r2-D-tela-1 — CONFLITO apresentado): 1º acesso 08/12, ela faz tudo no dia do plano, T10 = 3
    // (escolhida em 22/12), simulado de 01/01 ligado em 30/12. Em 30/12 o comprimido põe em janeiro a cadeia de um módulo com a aula em 30/12; ela marca a aula de 30/12.
    // Em 31/12 a faixa da aula fixa → questões é 31/12–01/01 (feriado com 📚 3h e simulado): a recolocação não pode deixar as três sem dia — o comprimido da âncora fixa
    // (até 2× a faixa) as põe de novo em datas, em ordem. Antes: questões, apostila e selagem ficavam sem dia (nocabe ×3) e o ⏳ de 01/01 não tinha proposta.
    let U27E = null; // S10rv3: a linha do tempo do U27 (semente E) também serve ao U28
    run('U27', () => { let cfg = { ...CFG }, trail = {}; const snap = {};
        const markP = (lim) => { const tr = clone(trail); Object.entries(cfg.trilhaPlan || {}).forEach(([id, p]) => { for (const ts of STG) { const r0 = tr[id] || {}; if (r0[TSFf[ts]]) continue; if (!p[ts] || p[ts] > lim) break; const r = (tr[id] = tr[id] || {}); r[TSFf[ts]] = true; r[STF[TSFf[ts]]] = p[ts]; } const r = tr[id]; if (r && STG.every(ts => r[TSFf[ts]]) && !r.completedAt) { r.completedAt = r.smartcardAt; r.accSelagem = 70; } }); trail = tr; }; // marca pela data do plano, em ordem
        for (let d = '2026-12-08'; d <= '2026-12-31'; d = add(d, 1)) { if (d > '2026-12-08') markP(add(d, -1)); if (d === '2026-12-22') cfg = { ...cfg, trilhaRamp: { ...(cfg.trilhaRamp || {}), '2026-12-29': 3 } };
            const E = load(FILE, d), settle = () => { const P = E.buildTrilhaPlan(cfg, trail, d), pt = E.trilhaFreezePatch(cfg, trail, d, P, {}); if (pt) cfg = { ...cfg, ...pt }; }; settle();
            if (d === '2026-12-30') { cfg = { ...cfg, simOverrides: { ...(cfg.simOverrides || {}), '2027-01-01': true } }; settle(); }
            snap[d] = { plan: clone(cfg.trilhaPlan || {}), log: clone(cfg.trilhaFinalLog || null), trail: clone(trail) }; }
        const s30 = snap['2026-12-30'], s31 = snap['2026-12-31']; U27E = { s30, s31 };
        // S10rv3-encurtado (r3-A-fidelidade-1): o módulo do comprimido de 30/12 vem do "recoloquei" (moved) — o `compressed` agora só tem o módulo com algum intervalo abaixo
        // do mínimo da faixa; aula em 30/12 com as questões depois de 01/01 só sai do comprimido (a faixa normal é 1–2 dias). A expectativa do U27 não muda.
        const ids = [...new Set(((s30.log || {}).moved || []).map(m => Number(m.id)))].filter(id => { const p = s30.plan[id]; return !!p && p.aula === '2026-12-30' && ['quest', 'apost', 'seal'].every(ts => p[ts] && p[ts] > '2027-01-01'); });
        const r31 = ids.map(id => { const p = s31.plan[id] || {}, t = s31.trail[id] || {}, a = t.aula ? (t.aulaAt || p.aula) : null, q = p.quest || null, ap = p.apost || null, s = p.seal || null;
            return { id, a, q, ap, s, ok: a === '2026-12-30' && !!q && !!ap && !!s && q >= '2026-12-31' && dd(a, q) >= 1 && dd(a, q) <= 2 * GAP.quest[1] && dd(q, ap) >= 1 && dd(q, ap) <= 2 * GAP.apost[1] && dd(ap, s) >= 1 && dd(ap, s) <= 2 * GAP.seal[1] && !(((s31.log || {}).nocabe) || []).some(x => x.id === id) }; });
        check('U27 · semana final com o simulado de 01/01 ligado em 30/12: a cadeia que o comprimido de 30/12 pôs em janeiro (aula em 30/12, marcada no dia) não fica sem dia em 31/12 — questões, apostila e selagem continuam com data, em ordem, até 2× a faixa da etapa anterior (comprimido também da etapa fixa), sem nocabe',
            ids.length > 0 && r31.every(x => x.ok), J({ ids, d30: ids.map(id => { const p = s30.plan[id]; return [p.aula, p.quest, p.apost, p.seal]; }), d31: r31, nocabe31: (s31.log || {}).nocabe, compressed31: (s31.log || {}).compressed })); });
    // U28 · S10rv3-encurtado (🧩 o 📦 não diz o contrário do que o app gravou · 📚 intervalos; X23; revisão r3-A-fidelidade-1): "Intervalos encurtados: CÓD" só para o
    // módulo em que a recolocação automática gravou algum intervalo ABAIXO do mínimo da faixa. O comprimido de agora (1 dia até 2× o máximo da faixa, RM22; compressA
    // do S10rv2) também ALONGA. (a) encurta: aula ✓ 28/12, questões ✓ 29/12, apostila e selagem a recolocar em 30/12, 01–05/01 editados (a faixa normal da selagem
    // não tem dia) → apostila 30/12, selagem 31/12 (1 dia; faixa 2–5) → compressed [27]; (b) alonga: 31/12 também editado → selagem QUA 06/01 (7 dias) → fora de
    // compressed, com a data nova no moved; (c) a semente E do U27: em 30/12 e em 31/12 o módulo da cadeia posta em janeiro (aula 30/12, questões a 3–4 dias) está no
    // moved e fora de compressed. Antes (103a6715): (b) e (c) em compressed — o 📦 dizia "Intervalos encurtados" com todo intervalo na faixa ou acima dela.
    run('U28', () => { const E = E30, hoje = '2026-12-30', ED5 = ['2027-01-01', '2027-01-02', '2027-01-03', '2027-01-04', '2027-01-05'];
        const caseR = (edDays) => { const st = mkSt(hoje), p = { wk: '2026-12-22', via: 'ramp', aula: '2026-12-28', quest: '2026-12-29', apost: '2026-12-29', seal: '2027-01-01', orig: {}, hist: [] }, trail = { 27: { aula: true, aulaAt: '2026-12-28', questoesD2: true, questoesD2At: '2026-12-29' } };
            ['apost', 'seal'].forEach(ts => E.stAdd(st, p[ts], ts)); const out = E.trilhaFinalPlan(mkP(st, { 27: { ...p } }, {}), { ...CFG, trilhaPlan: { 27: p } }, trail, hoje, Object.fromEntries(edDays.map(d => [d, true]))); const np = out.patch[27] || {};
            return { apost: np.apost, seal: np.seal, g: np.apost && np.seal ? dd(np.apost, np.seal) : null, log: out.log }; };
        const a = caseR(ED5), b = caseR(['2026-12-31'].concat(ED5)), mvd = (lg, id, ts, to) => (lg.moved || []).some(m => m.id === id && m.ts === ts && m.to === to);
        const e = U27E, longOf = (s, day) => [...new Set(((s.log || {}).moved || []).map(m => Number(m.id)))].filter(id => { const t = s.trail[id] || {}, p = s.plan[id] || {}, A = t.aula ? (t.aulaAt || p.aula) : p.aula; return A === '2026-12-30' && !t.questoesD2 && !!p.quest && dd(A, p.quest) > GAP.quest[1] && (s.log || {}).at === day; });
        const c30 = e ? longOf(e.s30, '2026-12-30') : [], c31 = e ? longOf(e.s31, '2026-12-31') : [], outC = (s, ids) => ids.every(id => !((s.log || {}).compressed || []).includes(id));
        check('U28 · "Intervalos encurtados" (X23) só com intervalo abaixo do mínimo da faixa: (a) selagem 1 dia depois da apostila (faixa 2–5) → compressed [27]; (b) selagem 7 dias depois (só alongada) → fora de compressed, com a data nova no moved; (c) semente E (U27) em 30/12 e 31/12: o módulo com a aula em 30/12 e as questões a mais de 2 dias está no moved e fora de compressed',
            a.seal === '2026-12-31' && a.g === 1 && J(a.log.compressed) === '[27]' && b.seal === '2027-01-06' && b.g === 7 && J(b.log.compressed) === '[]' && mvd(b.log, 27, 'seal', '2027-01-06') && c30.length > 0 && c31.length > 0 && outC(e.s30, c30) && outC(e.s31, c31),
            J({ a: [a.apost, a.seal, a.g, a.log.compressed], b: [b.apost, b.seal, b.g, b.log.compressed], c30, c31, comp30: e && (e.s30.log || {}).compressed, comp31: e && (e.s31.log || {}).compressed, d31: e ? c31.map(id => { const p = e.s31.plan[id]; return [(e.s31.trail[id] || {}).aulaAt, p.quest, p.apost, p.seal]; }) : null })); });
}
}
