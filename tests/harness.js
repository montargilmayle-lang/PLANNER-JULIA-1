// Harness Playwright para auditar o planner. Extrai BLOCOS (tag/texto/tempo/matéria) por dia, não a página inteira.
const pw = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');

const FILE = process.env.PLANNER_FILE || path.resolve('/home/user/PLANNER-JULIA-1/planner_residencia_2026_offline.html');

async function openPlanner(browser, dateISO, seeds = {}) {
    const ctx = await browser.newContext({ viewport: { width: 420, height: 900 }, locale: 'pt-BR', timezoneId: 'America/Bahia' });
    const page = await ctx.newPage();
    page.on('pageerror', e => console.log('  [pageerror]', e.message));
    await page.addInitScript((dd) => {
        const F = new Date(dd + 'T12:00:00').getTime(); const O = Date;
        class M extends O { constructor(...a) { a.length === 0 ? super(F) : super(...a); } static now() { return F; } }
        window.Date = M;
    }, dateISO);
    await page.addInitScript((s) => {
        // evita o seed da semana da prova (27/06) interferir: marca como já aplicado
        localStorage.setItem('medplanner_seed_weekend_20260627', 'true');
        for (const k of Object.keys(s)) localStorage.setItem(k, JSON.stringify(s[k]));
    }, seeds);
    await page.route('**/*', r => r.request().url().startsWith('file://') ? r.continue() : r.abort());
    await page.goto('file://' + FILE, { waitUntil: 'load' });
    await page.waitForTimeout(1200);
    return { ctx, page };
}

async function clickDay(page, code) {
    // botões das abas de dia: "⭐\nQUA\n09/09"
    const ok = await page.evaluate((code) => {
        const bs = [...document.querySelectorAll('button')].filter(b => {
            const t = b.innerText.split('\n').map(s => s.trim());
            return t.length >= 3 && t[1] === code && /\d\d\/\d\d/.test(t[2]);
        });
        if (!bs.length) return false; bs[0].click(); return true;
    }, code);
    if (!ok) throw new Error('aba de dia não encontrada: ' + code);
    await page.waitForTimeout(150);
}

async function clickTab(page, label) { // CRONOGRAMA, MÓDULOS, DESATRASO, DOPAMINE, SONO
    const ok = await page.evaluate((label) => {
        const bs = [...document.querySelectorAll('button')].filter(b => b.innerText.trim().split('\n').pop().trim() === label);
        if (!bs.length) return false; bs[0].click(); return true;
    }, label);
    if (!ok) throw new Error('aba não encontrada: ' + label);
    await page.waitForTimeout(200);
}

async function readDay(page) {
    return page.evaluate(() => {
        const blocks = [...document.querySelectorAll('div')].filter(el => el.style && /^3px solid/.test(el.style.borderLeft));
        const list = blocks.map(el => {
            const row = el.children[0];
            const tag = row.children[1] ? row.children[1].textContent.trim() : '';
            const body = row.children[2];
            const text = body && body.querySelector('span') ? body.querySelector('span').textContent.trim() : '';
            const timeEl = row.children[3];
            const time = timeEl ? timeEl.textContent.trim() : '';
            let mod = null;
            if (body) {
                const ref = [...body.querySelectorAll('div')].find(d => /^↳/.test(d.textContent.trim()));
                if (ref) mod = ref.textContent.replace(/^↳\s*/, '').trim();
                const mat = [...body.querySelectorAll('div')].find(d => d.style && d.style.background === 'rgb(19, 33, 46)');
                if (mat) {
                    const t = mat.querySelector('div:nth-child(2)');
                    const badges = [...mat.querySelectorAll('span')].map(s => s.textContent.trim());
                    mod = (badges.filter(b => /^Sem\./.test(b))[0] || '') + ' ' + (t ? t.textContent.trim() : '');
                    const act = mat.querySelector('div:nth-child(3)');
                    if (act) mod += ' | ' + act.textContent.trim();
                }
                const none = [...body.querySelectorAll('div')].find(d => /Sem desatraso pendente/.test(d.textContent));
                if (none) mod = '(sem desatraso pendente)';
            }
            const mods = body ? [...body.querySelectorAll('div')].filter(d => /^↳/.test(d.textContent.trim())).map(d => d.textContent.replace(/^↳\s*/, '').trim()) : []; // grupo com N módulos: uma linha ↳ por módulo
            // T1/T2: tarefas marcáveis do bloco (botões "… (toque N) ✓" / "Selagem ✓"), ✓ principal e inputs de %
            const tasks = [...el.querySelectorAll('button')].map(b => b.innerText.trim()).filter(t => /\(toque \d\) ✓|Selagem ✓|Aula presencial ✓/.test(t));
            const done = !!(row.children[0] && row.children[0].textContent.trim() === '✓');
            const pctInputs = [...el.querySelectorAll('input[placeholder="%"]')].map(i => i.value);
            return { tag, text, time, mod, mods, tasks, done, pctInputs };
        });
        // cabeçalho do dia
        const venvEl = [...document.querySelectorAll('div')].find(d => d.style && d.style.color === 'rgb(245, 197, 24)' && /^💊/.test(d.textContent.trim()));
        const venv = venvEl ? venvEl.textContent.replace(/^💊\s*/, '').trim() : '';
        const titleEl = venvEl ? venvEl.previousElementSibling : null;
        const title = titleEl ? titleEl.textContent.trim() : '';
        const warn = [...document.querySelectorAll('div')].filter(d => d.style && (d.style.color === 'rgb(248, 113, 113)' || d.style.color === 'rgb(245, 197, 24)') && /acima d[eo]/.test(d.textContent) && d.style.fontSize === '9px').map(d => d.textContent.trim());
        const simBtn = [...document.querySelectorAll('button')].map(b => b.innerText.trim()).find(t => /Simulado marcado|Sexta de estudo ativo|Sexta de plantão/.test(t)) || null;
        const weekBadge = ([...document.querySelectorAll('span')].map(s => s.textContent.trim()).find(t => /^Sem\.\d+$/.test(t))) || '';
        const hdr = [...document.querySelectorAll('span')].map(s => s.textContent.trim()).find(t => /% das semanas/.test(t)) || '';
        const lsel = [...document.querySelectorAll('select')].find(s => [...s.options].some(o => /^Auto · /.test(o.textContent)));
        const light = lsel ? { value: lsel.value, auto: (([...lsel.options].find(o => o.value === 'auto') || {}).textContent || ''), note: (lsel.nextElementSibling ? lsel.nextElementSibling.textContent.trim() : '') } : null;
        const lightBadge = !![...document.querySelectorAll('div')].find(d => d.children.length === 0 && /^🌿 Hoje sem Venvanse/.test(d.textContent.trim()));
        const breatherBadge = !![...document.querySelectorAll('div')].find(d => d.children.length === 0 && /^🌬️ Dia de respiro/.test(d.textContent.trim()));
        if (light) light.label = lsel.previousElementSibling ? lsel.previousElementSibling.textContent.trim() : '';
        return { title, venv, warn, simBtn, weekBadge, pct: hdr, blocks: list, light, lightBadge, breatherBadge };
    });
}

function fmt(day) {
    const out = [];
    out.push(`  ▸ ${day.title} · 💊 ${day.venv}` + (day.warn.length ? ' · ' + day.warn.join(' · ') : '') + (day.simBtn ? ' · [btn] ' + day.simBtn : '') + (day.lightBadge ? ' · 🌿 SELO' : '') + (day.breatherBadge ? ' · 🌬️ RESPIRO' : '') + (day.light ? ` · [🌿 ${day.light.value === 'auto' ? day.light.auto : 'manual ' + day.light.value} · ${day.light.note}]` : ''));
    day.blocks.forEach((b, i) => out.push(`     ${String(i + 1).padStart(2)}. [${b.tag}] ${b.text}${b.time ? ' {' + b.time + '}' : ''}${b.mod ? '  ⇒ ' + b.mod : ''}`));
    return out.join('\n');
}

const results = [];
function check(id, cond, evidence) { results.push({ id, ok: !!cond, evidence }); console.log(`   ${cond ? '✅' : '❌'} ${id}${evidence ? ' — ' + evidence : ''}`); }
function idx(day, re) { return day.blocks.findIndex(b => re.test(b.text)); }
function has(day, re) { return idx(day, re) >= 0; }

async function setLight(page, value) {
    const ok = await page.evaluate((v) => { const s = [...document.querySelectorAll('select')].find(s => [...s.options].some(o => /^Auto · /.test(o.textContent))); if (!s) return false; s.value = v; s.dispatchEvent(new Event('change', { bubbles: true })); return true; }, value);
    if (!ok) throw new Error('seletor 🌿 não encontrado');
    await page.waitForTimeout(250);
}
function parseH(t) { if (!t || t === 'livre') return 0; let m = t.match(/^(\d+(?:[\.,]\d+)?)h(\d{1,2})?$/); if (m) return parseFloat(m[1].replace(',', '.')) + (m[2] ? Number(m[2]) / 60 : 0); m = t.match(/^(\d+)\s*min$/); if (m) return Number(m[1]) / 60; return 0; }
function hoursOf(day) { return day.blocks.filter(b => !['GYM', 'AMB', 'LAZER', 'SONO'].includes(b.tag)).reduce((s, b) => s + parseH(b.time), 0); }
const SHIFTS = new Set(['2026-09-12', '2026-09-19', '2026-09-20', '2026-09-26', '2026-09-27', '2026-10-03', '2026-10-05', '2026-10-07', '2026-10-09', '2026-10-10', '2026-10-11']);
const NIGHTS = new Set(['2026-09-20', '2026-09-27', '2026-10-05']);
const DAYS7 = ['QUA', 'QUI', 'SEX', 'SAB', 'DOM', 'SEG', 'TER'];
const LBL7 = ['QUA', 'QUI', 'SEX', 'SÁB', 'DOM', 'SEG', 'TER'];
function addDays(iso, k) { const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + k); return d.toISOString().slice(0, 10); }
// Replica a regra da decisão 15 a partir dos BLOCOS lidos da tela: candidatos, menor carga, empate → sábado, >8h → null
function expectedLight(w, wedISO) {
    // espelha lightDayFor do app (24/09): menor carga estrita; cargas a ≤ 45min = empate → (a) sem AULA · (b) não véspera de plantão/segunda · (c) menos elos de continuidade · (d) mais longe de um plantão · 1º dia
    const isSim = w.SEX.blocks.some(b => /SIMULADO NA ÍNTEGRA/.test(b.text));
    const shiftDates = [...SHIFTS, ...NIGHTS];
    const dd = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);
    const distToShift = (iso) => shiftDates.length ? Math.min(...shiftDates.map(d => Math.abs(dd(d, iso)))) : 99;
    const nextStageRe = (t) => { const m = t.match(/^(Fio [^·]+?) · toque (\d)/); if (m) return new RegExp('^' + m[1].replace(' (sem. passada)', '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '( \\(sem\\. passada\\))? · toque ' + (Number(m[2]) + 1)); const lm = t.match(/D2-([A-H])|Aula online Bloco ([A-H]) \(1\.5x\)/); if (lm) return new RegExp('Apostila do Bloco ' + (lm[1] || lm[2])); if (/deslocado da sexta/.test(t)) return /Apostila do Bloco B/; return null; };
    const contLinks = (i) => { const cur = w[DAYS7[i]].blocks, nxt = i < 6 ? w[DAYS7[i + 1]].blocks : w.QUA.blocks; /* TER → QUA da semana seguinte: a QUA desta semana é o espelho (template periódico) */ return cur.reduce((k, a) => { const re = nextStageRe(a.text); return k + (re && nxt.some(x => re.test(x.text)) ? 1 : 0); }, 0); };
    const cands = [];
    for (let i = 0; i < 7; i++) {
        const iso = addDays(wedISO, i);
        if (i === 0 && iso <= '2026-11-24') continue;
        if (SHIFTS.has(iso)) continue;
        if (NIGHTS.has(addDays(iso, -1))) continue; // pós-noturno (veto 🧠)
        if (i === 2 && isSim) continue;
        cands.push({ idx: i, hours: hoursOf(w[DAYS7[i]]), iso });
    }
    if (!cands.length) return { idx: null, min: null, breather: false, tie: [] };
    const minH = Math.min(...cands.map(c => c.hours));
    const group = cands.filter(c => c.hours <= minH + 0.75 + 1e-9);
    const score = (c) => [w[DAYS7[c.idx]].blocks.some(a => a.tag === 'AULA') ? 1 : 0, (SHIFTS.has(addDays(c.iso, 1)) || NIGHTS.has(addDays(c.iso, 1)) || (c.idx + 1) % 7 === 5) ? 1 : 0, contLinks(c.idx), -distToShift(c.iso), c.idx];
    const best = group.slice().sort((x, y) => { const a = score(x), b = score(y); for (let j = 0; j < a.length; j++) if (a[j] !== b[j]) return a[j] - b[j]; return 0; })[0];
    const tie = group.length > 1 ? group.map(c => c.idx) : [];
    if (best.hours > 8) return { idx: best.idx, hours: best.hours, min: minH, breather: true, tie };
    return { idx: best.idx, hours: best.hours, min: minH, breather: false, tie };
}
const fmtH = (x) => (Math.round(x * 10) / 10).toFixed(1).replace('.', ',') + 'h';
// ── T1/T2 helpers ──
async function findBlockBtn(page, blockRe, labelRe) { // marca com data-pw o botão (rótulo) do bloco (texto) no dia ativo; labelRe null = ✓ principal
    const r = await page.evaluate(([bs, ls]) => {
        document.querySelectorAll('[data-pw]').forEach(e => e.removeAttribute('data-pw'));
        const bre = new RegExp(bs), lre = ls ? new RegExp(ls) : null;
        const blocks = [...document.querySelectorAll('div')].filter(el => el.style && /^3px solid/.test(el.style.borderLeft));
        const el = blocks.find(b => { const body = b.children[0] && b.children[0].children[2]; const s = body && body.querySelector('span'); return s && bre.test(s.textContent.trim()); });
        if (!el) return 'bloco não encontrado: ' + bs;
        const btn = lre ? [...el.querySelectorAll('button')].find(b => lre.test(b.innerText.trim())) : el.children[0].children[0];
        if (!btn) return 'botão não encontrado: ' + ls;
        btn.setAttribute('data-pw', '1'); return true;
    }, [blockRe.source, labelRe ? labelRe.source : null]);
    if (r !== true) throw new Error(r);
}
async function clickTask(page, blockRe, labelRe) { await findBlockBtn(page, blockRe, labelRe || null); await page.click('[data-pw="1"]'); await page.waitForTimeout(250); }
async function typeBlockPct(page, blockRe, value, nth = 0) { // digita no nº-ésimo input % do bloco
    const r = await page.evaluate(([bs, n]) => {
        document.querySelectorAll('[data-pw]').forEach(e => e.removeAttribute('data-pw'));
        const bre = new RegExp(bs);
        const blocks = [...document.querySelectorAll('div')].filter(el => el.style && /^3px solid/.test(el.style.borderLeft));
        const el = blocks.find(b => { const body = b.children[0] && b.children[0].children[2]; const s = body && body.querySelector('span'); return s && bre.test(s.textContent.trim()); });
        if (!el) return 'bloco não encontrado: ' + bs;
        const inp = [...el.querySelectorAll('input[placeholder="%"]')][n]; if (!inp) return 'input % não encontrado';
        inp.setAttribute('data-pw', '1'); return true;
    }, [blockRe.source, nth]);
    if (r !== true) throw new Error(r);
    await page.fill('[data-pw="1"]', String(value)); await page.waitForTimeout(250);
}
async function readCard(page, titleRe) { // aba MÓDULOS: busca pelo título e lê o card (botões, consolidado/D+7/D+30, inputs %)
    await clickTab(page, 'MÓDULOS');
    await page.fill('input[placeholder*="Buscar"]', '');
    return page.evaluate((ts) => {
        const tre = new RegExp(ts);
        const cards = [...document.querySelectorAll('div')].filter(d => d.style && d.style.borderRadius === '10px' && d.style.padding === '14px' && tre.test(d.textContent) && [...d.querySelectorAll('button')].some(b => /toque 1/.test(b.innerText)));
        if (!cards.length) return null;
        const c = cards.sort((a, b) => a.textContent.length - b.textContent.length)[0];
        const btns = [...c.querySelectorAll('button')].map(b => b.innerText.trim()).filter(t => /toque \d|Selagem|Aula presencial/.test(t));
        const m = c.textContent.match(/Consolidado (\d\d\/\d\d)(?: · D\+7 (\d\d\/\d\d))?(?: · D\+30 (\d\d\/\d\d))?/);
        const pcts = [...c.querySelectorAll('input[placeholder="%"]')].map(i => i.value);
        const labels = [...c.querySelectorAll('span')].map(s => s.textContent.trim()).filter(t => /^% /.test(t));
        return { btns, consolidado: m ? m[1] : null, d7: m ? m[2] : null, d30: m ? m[3] : null, pcts, labels, pct: (c.textContent.match(/(\d+)%\s*(Completo|Em progresso|Não iniciado)/) || [])[1] };
    }, titleRe.source);
}
async function clickCardBtn(page, titleRe, labelRe) {
    await clickTab(page, 'MÓDULOS');
    const r = await page.evaluate(([ts, ls]) => {
        document.querySelectorAll('[data-pw]').forEach(e => e.removeAttribute('data-pw'));
        const tre = new RegExp(ts), lre = new RegExp(ls);
        const cards = [...document.querySelectorAll('div')].filter(d => d.style && d.style.borderRadius === '10px' && d.style.padding === '14px' && tre.test(d.textContent) && [...d.querySelectorAll('button')].some(b => /toque 1/.test(b.innerText)));
        if (!cards.length) return 'card não encontrado';
        const c = cards.sort((a, b) => a.textContent.length - b.textContent.length)[0];
        const btn = [...c.querySelectorAll('button')].find(b => lre.test(b.innerText.trim())); if (!btn) return 'botão do card não encontrado';
        btn.setAttribute('data-pw', '1'); return true;
    }, [titleRe.source, labelRe.source]);
    if (r !== true) throw new Error(r);
    await page.click('[data-pw="1"]'); await page.waitForTimeout(250);
}
async function typeCardPct(page, titleRe, field, value) { // field: 'accD2' | 'accSelagem' (pelo rótulo)
    await clickTab(page, 'MÓDULOS');
    const lab = field === 'accD2' ? '% de acerto no D2' : '% da selagem';
    const r = await page.evaluate(([ts, lab]) => {
        document.querySelectorAll('[data-pw]').forEach(e => e.removeAttribute('data-pw'));
        const tre = new RegExp(ts);
        const cards = [...document.querySelectorAll('div')].filter(d => d.style && d.style.borderRadius === '10px' && d.style.padding === '14px' && tre.test(d.textContent) && [...d.querySelectorAll('button')].some(b => /toque 1/.test(b.innerText)));
        if (!cards.length) return 'card não encontrado';
        const c = cards.sort((a, b) => a.textContent.length - b.textContent.length)[0];
        const row = [...c.querySelectorAll('div')].find(d => d.children.length && [...d.children].some(ch => ch.tagName === 'SPAN' && ch.textContent.trim().startsWith(lab)));
        const inp = row && row.querySelector('input[placeholder="%"]'); if (!inp) return 'input não encontrado: ' + lab;
        inp.setAttribute('data-pw', '1'); return true;
    }, [titleRe.source, lab]);
    if (r !== true) throw new Error(r);
    await page.fill('[data-pw="1"]', String(value)); await page.waitForTimeout(250);
}
async function getLS(page, key) { return page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), key); }
async function bodyText(page) { return page.evaluate(() => document.body.innerText); }
module.exports = { pw, openPlanner, clickDay, clickTab, readDay, fmt, check, idx, has, results, FILE, setLight, hoursOf, expectedLight, fmtH, LBL7, DAYS7, clickTask, typeBlockPct, readCard, clickCardBtn, typeCardPct, getLS, bodyText, parseH };
