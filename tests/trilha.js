// TRILHA AUTÔNOMA (paciente, 19–20/10 e 26/10/2026: a trilha começa em 26/10; 20–25/10 = transição) — cenários TR0–TR16 + invariantes. Rodar: node trilha.js [TR0,TR1,…]
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
async function scenario(browser, name, dateISO, seeds, fn, opts) {
    if (only && !only.some(o => name.startsWith(o))) return;
    console.log(`\n══════════ ${name} · relógio=${dateISO} ══════════`);
    let { ctx, page } = await openPlanner(browser, dateISO, seeds, opts || {});
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
async function revStatus(page) { return page.evaluate(() => [...document.querySelectorAll('[data-t="rev-status"]')].map(e => ({ text: e.innerText.trim(), fits: e.scrollWidth <= e.clientWidth + 1 && e.offsetHeight > 0 }))); } // linha de estado da revisão da Trilha (decisão 73)
async function trilhaRows(page) { await clickTab(page, 'TRILHA'); return page.evaluate(() => ({ rows: [...document.querySelectorAll('[data-t="trilha-row"]')].map(r => ({ id: Number(r.getAttribute('data-id')), pos: Number(r.getAttribute('data-pos')), planned: r.getAttribute('data-planned') === '1', pinned: r.getAttribute('data-pinned') === '1', text: r.innerText.replace(/\n/g, ' '), btns: [...r.querySelectorAll('button')].map(b => b.innerText.trim()) })), lineAfter: (() => { const l = document.querySelector('[data-t="trilha-line"]'); const p = l && l.previousElementSibling; return p ? Number(p.getAttribute('data-pos')) : null; })(), line: (document.querySelector('[data-t="trilha-line"]') || {}).innerText || '', counts: (document.querySelector('[data-t="trilha-counts"]') || {}).innerText || '', ramp: (document.querySelector('[data-t="trilha-ramp"]') || {}).innerText || '' })); }
async function clickRow(page, id, label) { const ok = await page.evaluate(([i, l]) => { const r = document.querySelector('[data-t="trilha-row"][data-id="' + i + '"]'); const b = r && [...r.querySelectorAll('button')].find(b => b.innerText.trim() === l); if (!b) return false; b.click(); return true; }, [id, label]); if (!ok) throw new Error('botão ' + label + ' da linha ' + id + ' não encontrado'); await page.waitForTimeout(300); }
const DEFAULT12 = [5, 6, 14, 19, 24, 32, 34, 85, 86, 1, 2, 3];

(async () => {
    const browser = await H.pw.chromium.launch();


    // ── TR0 · fronteira 19/10 (sem seeds): Sem.41 = 14–19/10 (6 abas) · Sem.42 = transição 20–25/10 · Sem.43 = T1 26/10–02/11 (8 abas) · nada gravado da Trilha ──
    await scenario(browser, 'TR0-fronteira-1910', '2026-10-19', {}, async (S) => {
        const page = S.page;
        const tabs = await listDayTabs(page); const hw = await headerWeek(page);
        check('Sem.41 tem 6 abas, QUA 14/10 a SEG 19/10 (sem a TER 20/10)', tabs.length === 6 && tabs[0].code === 'QUA' && tabs[0].date === '14/10' && tabs[5].code === 'SEG' && tabs[5].date === '19/10', JSON.stringify(tabs));
        check('cabeçalho Sem.41 · 14/10–19/10', hw.week === 41 && hw.range === '14/10–19/10', JSON.stringify(hw));
        const cfg0 = await getLS(page, CFG);
        check('nada da Trilha gravado antes de 20/10 (sem trilhaWeeks/trilhaPlan/trilhaFirstOpen) e nenhum fioWeek ≥ 20/10', !cfg0 || (!cfg0.trilhaWeeks && !cfg0.trilhaPlan && !cfg0.trilhaFirstOpen && !Object.keys(cfg0.fioWeek || {}).some(k => k >= '2026-10-20')), JSON.stringify(cfg0));
        check('aba ainda se chama DESATRASO', /DESATRASO/.test(await bodyText(page)));
        await navWeek(page, 1);
        const t2 = await listDayTabs(page); const h2 = await headerWeek(page); let body = await bodyText(page);
        check('▶ leva à Sem.42 = transição 20/10–25/10: 6 abas, TER 20/10 a DOM 25/10', h2.week === 42 && h2.range === '20/10–25/10' && t2.length === 6 && t2[0].code === 'TER' && t2[0].date === '20/10' && t2[5].code === 'DOM' && t2[5].date === '25/10', JSON.stringify(t2));
        const tp = await page.evaluate(() => (document.querySelector('[data-t="trilha-panel"]') || {}).innerText || '');
        check('badge "Transição" (sem "Trilha N/…") e painel "SEMANA DE TRANSIÇÃO · 20/10–25/10 — A trilha começa na segunda 26/10 com o 1º módulo da fila"', /(^|\n)Transição(\n|$)/.test(body) && !/Trilha \d+\/\d+/.test(body) && /SEMANA DE TRANSIÇÃO · 20\/10–25\/10/.test(tp) && /A trilha começa na segunda 26\/10 com o 1º módulo da fila/.test(tp) && /só o plantão \(quando há\), Anki, academia e lazer/.test(tp), tp.replace(/\n/g, ' | '));
        await clickDate(page, '20/10'); const ter = await readDay(page); console.log(fmt(ter));
        check('TER 20/10 (transição, plantão longo): 🚑 06h–19h "só Anki no trajeto" + Anki + nota "a trilha começa em 26/10" + academia opcional + jantar/sono — sem áudio e sem etapa', has(ter, /^🚑 Plantão 06h–19h — sem etapa de mesa hoje: só Anki no trajeto$/) && has(ter, /^Anki no trajeto — 20min/) && has(ter, /^🗓️ A trilha começa em 26\/10 \(segunda\) — hoje sem etapa de módulo$/) && has(ter, /^Academia — opcional/) && has(ter, /dormir ~21h45/) && !ter.blocks.some(H.transStage));
        const wk = await readWeekT(page);
        check('Sem.42 (transição): nenhuma etapa, nenhuma revisão, nenhum PLAN, nenhum simulado, nenhum texto do motor antigo', !Object.values(wk).some(d => d.blocks.some(b => H.transStage(b) || /Fio \d|Bloco [A-H]\b|^Selar|toque \d|bloco antigo/.test(b.text))), JSON.stringify(Object.fromEntries(Object.entries(wk).map(([d, x]) => [d, x.blocks.map(b => b.tag)]))));
        await navWeek(page, 1);
        const t3 = await listDayTabs(page); const h3 = await headerWeek(page); body = await bodyText(page);
        check('▶ leva à Sem.43 = T1 26/10–02/11: 8 abas, SEG 26/10 a SEG 02/11 (duas segundas)', h3.week === 43 && h3.range === '26/10–02/11' && t3.length === 8 && t3[0].code === 'SEG' && t3[0].date === '26/10' && t3[7].code === 'SEG' && t3[7].date === '02/11', JSON.stringify(t3));
        check('badge "Trilha 1/10" e rótulo de prévia', /Trilha 1\/10/.test(body) && /prévia — congela quando a semana começar/.test(body));
        const panel = await page.evaluate(() => [...document.querySelectorAll('[data-t="trilha-panel"] [data-mod]')].map(e => e.getAttribute('data-kind') + ':' + e.getAttribute('data-mod')));
        check('painel da semana: 3 NOVOS na prévia — CIR1 Trauma I, CIR1 Trauma II, CIR2 Urologia', panel.length === 3 && panel.every(p => p.startsWith('novo:')) && /Trauma I —/.test(panel[0]) && /Trauma II/.test(panel[1]) && /Urologia/.test(panel[2]), panel.join(' | '));
        await clickDate(page, '26/10'); const seg = await readDay(page);
        check('SEG 26/10 (plantão curto 06h–12h): a aula de CIR1 · Trauma I, a 1ª da fila, já está na prévia', seg.blocks.some(b => b.tm === 5 && b.ts === 'aula' && !b.au), fmt(seg));
        await clickDate(page, '02/11'); const seg2 = await readDay(page);
        check('a aba SEG 02/11 (2ª segunda da semana) abre o 02/11 — não o 26/10', /02\/11/.test(seg2.title) && /Feriado \(Finados\)/.test(seg2.dayType), seg2.title + ' | ' + seg2.dayType);
        const tabsW = await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => /\d\d\/\d\d$/.test(b.innerText.trim())); return { right: Math.max(...bs.map(b => b.getBoundingClientRect().right)), vw: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth }; });
        check('as 8 abas cabem na largura do celular (420px), sem rolagem horizontal da página', tabsW.right <= tabsW.vw && tabsW.sw <= tabsW.vw, JSON.stringify(tabsW));
        await page.setViewportSize({ width: 360, height: 900 }); await page.waitForTimeout(200);
        const row360 = await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => /\d\d\/\d\d$/.test(b.innerText.trim())); const row = bs[0].parentElement; const r = row.getBoundingClientRect(); return { n: bs.length, last: Math.round(bs[bs.length - 1].getBoundingClientRect().right), rowRight: Math.round(r.right), sw: row.scrollWidth, cw: row.clientWidth }; });
        check('num celular de 360px as 8 abas também cabem: a SEG 02/11 aparece inteira, sem rolar a faixa', row360.n === 8 && row360.sw <= row360.cw && row360.last <= row360.rowRight, JSON.stringify(row360));
        await page.setViewportSize({ width: 420, height: 900 });
        await navWeek(page, 9); const h52 = await headerWeek(page); const t52 = await listDayTabs(page);
        check('Sem.52 = 29/12–01/01, 4 abas (TER a SEX), badge "Trilha 10/10"', h52.week === 52 && h52.range === '29/12–01/01' && t52.length === 4 && t52.map(t => t.code).join() === 'TER,QUA,QUI,SEX' && /Trilha 10\/10/.test(await bodyText(page)), JSON.stringify([h52, t52]));
        await navWeek(page, 1); const h53 = await headerWeek(page);
        check('▶ além da Sem.52 continua na 52 (o acesso termina em 01/01)', h53.week === 52, JSON.stringify(h53));
    });

    // ── TR0c · as duas segundas da T1 ao navegar: de SEG 09/11 ◀ cai na SEG 02/11 (a mais perto), de 02/11 ▶ volta a 09/11; tocar 26/10 fica em 26/10 ──
    await scenario(browser, 'TR0c-duas-segundas-0911', '2026-11-09', {}, async (S) => {
        const page = S.page; const t0 = (await readDay(page)).title;
        await navWeek(page, -1); const a = (await readDay(page)).title;
        check('SEG 09/11 ◀ ⇒ a T1 abre na SEG 02/11 (a segunda mais perto do dia que ela via), não na SEG 26/10', /09\/11/.test(t0) && /02\/11/.test(a), t0 + ' → ' + a);
        await navWeek(page, 1); const b = (await readDay(page)).title;
        check('SEG 02/11 ▶ ⇒ SEG 09/11', /09\/11/.test(b), b);
        await navWeek(page, -1); await clickDate(page, '26/10'); const c = (await readDay(page)).title; await clickDate(page, '29/10'); await clickDate(page, '26/10'); const d = (await readDay(page)).title;
        check('na T1, tocar SEG 26/10 abre 26/10 (também depois de tocar outro dia)', /26\/10/.test(c) && /26\/10/.test(d), c + ' | ' + d);
        await navWeek(page, -1); await navWeek(page, 1); const e = (await readDay(page)).title;
        check('SEG 26/10 ◀ (transição, sem segunda) ▶ ⇒ volta à SEG 26/10', /26\/10/.test(e), e);
    });

    // ── TR0b · transição 20–25/10 (relógio QUI 22/10 — paciente, 26/10): só plantão, Anki, academia e lazer + a nota; nada gravado; sem 🌿, simulado, revisão, PLAN ──
    await scenario(browser, 'TR0b-transicao-2210', '2026-10-22', {}, async (S) => {
        const page = S.page; const hw = await headerWeek(page); const tabs = await listDayTabs(page);
        check('relógio 22/10: Sem.42 = 20/10–25/10 (6 abas, TER a DOM)', hw.week === 42 && hw.range === '20/10–25/10' && tabs.map(t => t.code).join() === 'TER,QUA,QUI,SEX,SAB,DOM', JSON.stringify([hw, tabs]));
        const cfg = await getLS(page, CFG);
        check('nada da Trilha é gravado na transição (sem trilhaFirstOpen, trilhaWeeks ou trilhaPlan)', !cfg || (!cfg.trilhaFirstOpen && !cfg.trilhaWeeks && !cfg.trilhaPlan), JSON.stringify(cfg));
        check('a aba já se chama TRILHA (registro da Trilha a partir de 20/10)', /TRILHA/.test(await bodyText(page)));
        const bt0 = await bodyText(page);
        check('card da academia na semana de 6 dias: "ACADEMIA — sem treino no sábado (descanso) nem no dia pós-noturno" (sem "6 dos 7 dias")', /ACADEMIA — sem treino no sábado \(descanso\) nem no dia pós-noturno/.test(bt0) && !/6 dos 7 dias/.test(bt0), (bt0.match(/ACADEMIA —[^\n]*/) || [''])[0]);
        const w = await readWeekT(page); Object.values(w).forEach(d => console.log(fmt(d)));
        const days = Object.values(w);
        check('os 6 dias: nenhuma etapa (tm), revisão, PLAN, simulado ou bloco do motor antigo', !days.some(d => d.blocks.some(H.transStage)), JSON.stringify(Object.fromEntries(Object.entries(w).map(([d, x]) => [d, x.blocks.map(b => b.tag)]))));
        check('os 6 dias trazem a nota "🗓️ A trilha começa em 26/10 (segunda) — hoje sem etapa de módulo" e o 🗓️ do dia diz "Transição — a trilha começa em 26/10"', days.every(d => has(d, /^🗓️ A trilha começa em 26\/10 \(segunda\) — hoje sem etapa de módulo$/) && /Transição — a trilha começa em 26\/10: sem etapa de módulo hoje/.test(d.dayType)), days.map(d => d.dayType).join(' | '));
        check('QUA 21/10: 🚑 Plantão 13h–18h {5h} (sem "estude antes ou depois") + Anki no trajeto + academia + véspera "plantão 06h amanhã: dormir ~21h45"', w['21/10'].blocks.some(b => b.text === '🚑 Plantão 13h–18h' && b.time === '5h') && has(w['21/10'], /^Anki no trajeto — 20min$/) && has(w['21/10'], /^Academia — horário livre$/) && has(w['21/10'], /^Noite leve — plantão 06h amanhã: dormir ~21h45$/));
        check('QUI 22/10 (véspera do plantão 05h30): "dormir ~21h45"', has(w['22/10'], /plantão 05h30 amanhã: dormir ~21h45/));
        check('SEX 23/10 (paridade de simulado, com plantão): sem SIMULADO e sem o botão do simulado', !has(w['23/10'], /SIMULADO/) && !w['23/10'].simBtn, String(w['23/10'].simBtn));
        check('SÁB 24/10: só Anki, a nota e lazer (sábado sem treino, sem PLAN)', w['24/10'].blocks.map(b => b.tag).join() === 'ANKI,EXTRA,LAZER', w['24/10'].blocks.map(b => b.tag).join());
        check('DOM 25/10 (véspera do plantão 06h de 26/10): "Noite leve — plantão 06h amanhã: dormir ~21h45"', has(w['25/10'], /^Noite leve — plantão 06h amanhã: dormir ~21h45$/));
        check('sem seletor 🌿 na transição (nenhum dia leve: não há etapa)', days.every(d => !d.light), JSON.stringify(days.map(d => d.light)));
        check('seção REVISÕES do dia: "Dia de transição: sem revisão e sem etapa — a trilha começa em 26/10."', /Dia de transição: sem revisão e sem etapa — a trilha começa em 26\/10\./.test(await bodyText(page)));
        check('sem ⏳, 🔓 nem ⏩ na transição', !(await banner(page, 'trilha-pending')) && !(await banner(page, 'trilha-rise')) && !(await banner(page, 'trilha-adv')));
        check('nenhum texto com horário de Venvanse/estimulante na transição', !days.some(d => VENV_TIME.test(allText(d))));
        const t = await trilhaRows(page); const trn = await banner(page, 'trilha-transition');
        check('aba Trilha na transição: aviso "🗓️ Dias de transição (20/10–25/10): a trilha começa na segunda 26/10 — a fila, a rampa e o alcance abaixo são a prévia."', !!trn && trn.text === '🗓️ Dias de transição (20/10–25/10): a trilha começa na segunda 26/10 — a fila, a rampa e o alcance abaixo são a prévia.', trn && trn.text);
        check('aba Trilha na transição: "No ritmo atual cabem 36 módulos" e a rampa tem 10 semanas, T1 = 26/10–02/11, todas editáveis (nada congelado)', /cabem 36 módulos/.test(t.counts) && (t.ramp.match(/^T\d+ · /gm) || []).length === 10 && /T1 · 26\/10–02\/11/.test(t.ramp) && /T10 · 29\/12–01\/01/.test(t.ramp) && !/congelada/.test(t.ramp), t.ramp.split('\n').slice(0, 6).join(' | '));
    });

    // ── TR1 · semana de 26/10 (1º acesso no 1º dia da T1, 8 dias): congelamento, cota cheia, plantões, aula em áudio, simulado religado ──
    await scenario(browser, 'TR1-semana-2610', '2026-10-26', {}, async (S) => {
        const page = S.page;
        const cfg = await getLS(page, CFG); const W = (cfg.trilhaWeeks || {})['2026-10-26'] || {};
        check('congelou a T1: trilhaWeeks[26/10] = { q: 3, base: 3, held: false, mods: [5, 6, 14] }, sem cota proporcional (26/10 é o 1º dia), e trilhaFirstOpen = 26/10', W.q === 3 && W.base === 3 && W.held === false && !W.prop && JSON.stringify(W.mods) === '[5,6,14]' && cfg.trilhaFirstOpen === '2026-10-26' && Object.keys(cfg.trilhaWeeks).join() === '2026-10-26', JSON.stringify(cfg.trilhaWeeks));
        const p5 = cfg.trilhaPlan[5];
        check('trilhaPlan[5] (CIR1 · Trauma I) = aula HOJE 26/10 · questões 28/10 · apostila 29/10 · selagem 01/11 (orig = atual)', p5.aula === '2026-10-26' && p5.quest === '2026-10-28' && p5.apost === '2026-10-29' && p5.seal === '2026-11-01' && JSON.stringify(p5.orig) === JSON.stringify({ aula: p5.aula, quest: p5.quest, apost: p5.apost, seal: p5.seal }), JSON.stringify(p5));
        check('nenhuma etapa planejada antes de 26/10', !Object.values(cfg.trilhaPlan).some(p => STG.some(ts => p[ts] && p[ts] < '2026-10-26')), JSON.stringify(cfg.trilhaPlan));
        check('progress_v1 não é criado pela Trilha (registro próprio)', (await getLS(page, PRG)) === null);
        check('a aba se chama TRILHA', /TRILHA/.test(await bodyText(page)));
        const hdr = await page.evaluate(() => ((document.querySelector('[data-t="trilha-panel"]') || {}).innerText || '').split('\n')[0]);
        check('painel: "MÓDULOS DESTA SEMANA DA TRILHA · ritmo 3" (sem texto de proporcional)', /MÓDULOS DESTA SEMANA DA TRILHA · ritmo 3$/.test(hdr), hdr);
        const w = await readWeekT(page); Object.values(w).forEach(d => console.log(fmt(d)));
        const seg = w['26/10'], ter = w['27/10'], qua = w['28/10'], qui = w['29/10'], sex = w['30/10'], seg2 = w['02/11'];
        check('8 dias na semana: 26/10 a 02/11', Object.keys(w).join() === '26/10,27/10,28/10,29/10,30/10,31/10,01/11,02/11', Object.keys(w).join());
        check('SEG 26/10: 🚑 Plantão 06h–12h {6h} (a tarde livre) + a aula de CIR1 com "Aula 1.5x…" e "🎧 Aula feita em áudio ✓" + nota do conteúdo visual', seg.blocks.some(b => /^🚑 Plantão 06h–12h · estude antes ou depois/.test(b.text) && b.time === '6h') && (() => { const a = seg.blocks.find(b => b.tm === 5 && b.ts === 'aula' && !b.au); return !!a && JSON.stringify(a.tasks) === JSON.stringify(['Aula 1.5x + resumo (toque 1) ✓', '🎧 Aula feita em áudio ✓']) && a.notes.some(n => /conteúdo visual.*precisa do vídeo/.test(n)); })(), fmt(seg));
        check('SEG 26/10 (véspera de plantão 06h): "dormir ~21h45"', has(seg, /Noite leve — plantão 06h amanhã: dormir ~21h45/));
        check('TER 27/10: 🗓️ "só Anki + áudio", sem 📚 nem ⚠️, e o áudio aponta para a aula de CIR1 · Trauma II (planejada QUA 28/10)', /só Anki \+ áudio/.test(ter.dayType) && !ter.warn.length && ter.blocks.some(b => b.au && b.tm === 6 && /planejada QUA 28\/10/.test(b.text)), ter.dayType + ' | ' + ter.warn.join());
        check('QUA 28/10 (véspera do plantão 06h–15h): "dormir ~21h45"', has(qua, /plantão 06h amanhã: dormir ~21h45/));
        check('QUI 29/10: 🚑 Plantão 06h–15h {9h}', qui.blocks.some(b => /^🚑 Plantão 06h–15h/.test(b.text) && b.time === '9h'));
        check('SEX 30/10 (sem paridade): botão "📚 Sexta de estudo ativo", sem SIMULADO, com a aula de CIR2 e a apostila de CIR1 · Trauma II', /Sexta de estudo ativo — toque se FOR fazer simulado hoje/.test(sex.simBtn || '') && !has(sex, /SIMULADO NA ÍNTEGRA/) && sex.blocks.some(b => b.tm === 14 && b.ts === 'aula') && sex.blocks.some(b => b.tm === 6 && b.ts === 'apost'), (sex.simBtn || '') + ' | ' + fmt(sex));
        check('SEG 02/11: Finados (dia comum) + véspera do plantão longo 03/11 "dormir ~21h45"', /Feriado \(Finados\)/.test(seg2.dayType) && has(seg2, /plantão 06h amanhã: dormir ~21h45/), seg2.dayType);
        check('nenhum texto com horário de Venvanse/estimulante na semana', !Object.values(w).some(d => VENV_TIME.test(allText(d))));
        // simulado religado numa sexta sem paridade → as etapas do dia viram pendentes ⏳ → recolocar
        await clickTab(page, 'CRONOGRAMA'); await clickDate(page, '30/10');
        await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Sexta de estudo ativo/.test(x.innerText)); b.click(); }); await page.waitForTimeout(400);
        const cfg2 = await getLS(page, CFG); const sex2 = await readDay(page);
        check('religar o simulado em 30/10: simOverrides[30/10] = true e a sexta ganha SIMULADO (manhã) + CORREÇÃO', cfg2.simOverrides && cfg2.simOverrides['2026-10-30'] === true && has(sex2, /SIMULADO NA ÍNTEGRA \(quinzenal\): manhã/) && has(sex2, /CORREÇÃO DO SIMULADO/));
        const pend = await banner(page, 'trilha-pending');
        check('⏳ cita as 2 etapas da sexta que virou simulado (apostila de CIR1 · Trauma II e aula de CIR2)', !!pend && /Ficaram para trás 2 etapas/.test(pend.text) && /CIR1 · apostila de SEX 30\/10, que virou simulado/.test(pend.text) && /CIR2 · aula de SEX 30\/10, que virou simulado/.test(pend.text) && /sem culpa/.test(pend.text), pend && pend.text);
        await clickIn(page, 'trilha-pending', 'Ver como recolocar');
        const pv = await banner(page, 'trilha-pending'); console.log('   💡', pv.text.replace(/\n/g, ' '));
        check('proposta de recolocar (nada gravado antes do Aplicar)', /💡 CIR1 · apostila/.test(pv.text) && pv.btns.includes('Aplicar') && pv.btns.includes('Cancelar') && (await getLS(page, CFG)).trilhaPlan[6].apost === '2026-10-30');
        await clickIn(page, 'trilha-pending', 'Aplicar');
        const cfg3 = await getLS(page, CFG); const p63 = cfg3.trilhaPlan[6], p143 = cfg3.trilhaPlan[14];
        check('Aplicar: apostila de CIR1 · Trauma II e aula de CIR2 saem de 30/10 (orig fica 30/10; hist "recolocar"); nada gravado em schedule_v1', p63.apost !== '2026-10-30' && p63.orig.apost === '2026-10-30' && p63.hist.some(h => h.why === 'recolocar' && h.from === '2026-10-30') && p143.aula !== '2026-10-30' && p143.orig.aula === '2026-10-30' && !(await getLS(page, SCH)), JSON.stringify([p63, p143]));
        check('intervalos das cadeias recolocadas dentro das faixas', dd(p63.quest, p63.apost) >= 1 && dd(p63.quest, p63.apost) <= 2 && dd(p63.apost, p63.seal) >= 2 && dd(p63.apost, p63.seal) <= 5 && dd(p143.aula, p143.quest) >= 1 && dd(p143.aula, p143.quest) <= 2 && dd(p143.quest, p143.apost) >= 1 && dd(p143.quest, p143.apost) <= 2 && dd(p143.apost, p143.seal) >= 2 && dd(p143.apost, p143.seal) <= 5, JSON.stringify([p63, p143]));
        const sex3 = await readDay(page);
        check('SEX 30/10 mostra as linhas "↷ … recolocada para …" (sem tarefa)', has(sex3, /^↷ Trilha · CIR1 — apostila recolocada para (SÁB|DOM|SEG) \d\d\/1[01]/) && has(sex3, /^↷ Trilha · CIR2 — aula recolocada para (SÁB|DOM|SEG|QUA|QUI) \d\d\/1[01]/), fmt(sex3));
        // 🎧 marcar a aula em áudio no plantão longo, no próprio dia (ela marcou a SEG 26/10)
        await markUntil(page, '2026-10-26'); await page.evaluate(() => { const c = JSON.parse(localStorage.getItem('medplanner_config_v1')); c.manualWeek = null; localStorage.setItem('medplanner_config_v1', JSON.stringify(c)); });
        const pg = await S.reopen('2026-10-27');
        await clickDate(pg, '27/10'); await clickTask(pg, /^🎧 Áudio \(opcional/, /Aula feita em áudio/);
        const tr = await getLS(pg, TRL);
        check('🎧 no plantão: trail_v1[6] = { aula, aulaAt 27/10, aulaAudio, aulaAudioAt 27/10 }', tr && tr[6] && tr[6].aula === true && tr[6].aulaAt === '2026-10-27' && tr[6].aulaAudio === true && tr[6].aulaAudioAt === '2026-10-27', JSON.stringify(tr));
        const ter2 = await readDay(pg);
        check('o bloco de áudio continua apontando para CIR1 Trauma II, marcado (identidade estável)', ter2.blocks.some(b => b.au && b.tm === 6 && b.done), fmt(ter2));
        await clickDate(pg, '28/10'); const qua2 = await readDay(pg);
        check('a aula de CIR1 Trauma II some da QUA 28/10 (já feita em áudio — BUG 2)', !qua2.blocks.some(b => b.tm === 6 && b.ts === 'aula'));
        await clickDate(pg, '29/10'); const qui2 = await readDay(pg);
        check('QUI 29/10: questões de CIR1 Trauma II com "🎬 antes das questões: veja no vídeo as partes visuais"', qui2.blocks.some(b => b.tm === 6 && b.ts === 'quest' && b.notes.some(n => /^🎬 antes das questões/.test(n))));
        const card = await readCard(pg, /Trauma II — Abdome/);
        check('card de Módulos mostra "🎧 aula em áudio em 27/10" e a aula marcada', !!card && card.btns.some(b => /^✓ Aula 1\.5x/.test(b)) && /🎧 aula em áudio em 27\/10/.test(await bodyText(pg)), JSON.stringify(card));
    });

    // ── TR10 · fila, linha de alcance, ↑↓, 📌 e rampa pela interface (26/10) ──
    await scenario(browser, 'TR10-fila-2610', '2026-10-26', {}, async (S) => {
        const page = S.page;
        const t = await trilhaRows(page);
        check('fila começa por cirurgia e segue a ordem do curso: [' + DEFAULT12.join(',') + '] (a ordem não muda com o início em 26/10)', JSON.stringify(t.rows.slice(0, 12).map(r => r.id)) === JSON.stringify(DEFAULT12), t.rows.slice(0, 12).map(r => r.id).join(','));
        check('#1 a #3 = NESTA SEMANA, sem ↑↓ nem 📌 (já planejados)', t.rows.slice(0, 3).every(r => r.planned && /NESTA SEMANA/.test(r.text) && !r.btns.length));
        const N = Number((t.counts.match(/cabem (\d+) módulos/) || [])[1]);
        check('"No ritmo atual cabem N módulos até 01/01/2027" com N = 36 (10 semanas: 3·4·4·4·4·4·4·5·4·0) e a linha de alcance depois do #36', N === 36 && t.lineAfter === 36 && /LINHA DE ALCANCE — até 01\/01: 36 módulos/.test(t.line), t.counts.split('\n').slice(0, 6).join(' | '));
        check('contagem: fechados 0 · dentro 36 · fora ' + (t.rows.length - 36), /0\nFechados na Trilha/.test(t.counts) && /36\nDentro do alcance/.test(t.counts) && new RegExp((t.rows.length - 36) + '\\nFora').test(t.counts), t.counts.slice(0, 160));
        check('cabeçalho "🛤️ TRILHA AUTÔNOMA — 26/10/2026 → 01/01/2027"', /🛤️ TRILHA AUTÔNOMA — 26\/10\/2026 → 01\/01\/2027/.test(t.counts));
        const rampRows = await page.evaluate(() => [...document.querySelectorAll('[data-t="trilha-ramp"] [data-tue]')].map(r => r.getAttribute('data-tue') + ' ' + r.innerText.replace(/\n/g, ' ')));
        check('rampa: 10 semanas, 1º dia 26/10 (8 dias) e depois as terças 03/11 … 29/12; valores 3·4·4·4·4·4·4·5·4·0', rampRows.length === 10 && rampRows[0].startsWith('2026-10-26 T1 · 26/10–02/11') && rampRows[1].startsWith('2026-11-03 T2 · 03/11–09/11') && rampRows[9].startsWith('2026-12-29 T10 · 29/12–01/01') && JSON.stringify(rampRows.map(r => Number((r.match(/^\S+ T\d+ · \S+ (?:− )?(\d)/) || [])[1]))) === '[3,4,4,4,4,4,4,5,4,0]', rampRows.join(' | '));
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
        check('+ na T8 (15/12) ⇒ trilhaRamp[15/12] = 6 e a conta muda (' + rampBefore + ' → ' + t3.counts.match(/cabem (\d+)/)[1] + ')', cfgC.trilhaRamp && cfgC.trilhaRamp['2026-12-15'] === 6 && Number(t3.counts.match(/cabem (\d+)/)[1]) === Number(rampBefore) + 1, JSON.stringify(cfgC.trilhaRamp));
        const frozenRow = await page.evaluate(() => { const r = document.querySelector('[data-t="trilha-ramp"] [data-tue="2026-10-26"]'); return r ? [...r.querySelectorAll('button')].map(b => b.innerText.trim()) : null; });
        check('semana congelada (T1, chave 26/10) não tem − / +', Array.isArray(frozenRow) && !frozenRow.length, JSON.stringify(frozenRow));
        check('nenhuma linha de rampa para a semana de transição (20/10)', !(await page.evaluate(() => !!document.querySelector('[data-t="trilha-ramp"] [data-tue="2026-10-20"]'))));
        check('nenhum texto de horário de Venvanse na aba Trilha', !VENV_TIME.test(await bodyText(page)));
    });

    // ── TR10b · bloco adicionado por ela (semana 41) entra na fila logo depois de 80 ──
    await scenario(browser, 'TR10b-bloco-adicionado', '2026-10-26', { [CFG]: { ...baseCfg, customModules: [{ id: 1000, week: 41, code: 'XYZ', title: 'Bloco da grade real' }] } }, async (S) => {
        const t = await trilhaRows(S.page); const ids = t.rows.map(r => r.id);
        check('customModules XYZ (semana 41) entra logo depois de 80; total ' + ids.length, ids.indexOf(1000) === ids.indexOf(80) + 1 && ids.length === 94, ids.slice(ids.indexOf(79) - 1, ids.indexOf(79) + 4).join(','));
    });

    // ── TR2 · semana de 03/11 (encadeada desde 26/10): T2 congela, simulado 06/11, plantões longos sem etapa de mesa, revisão vencida no tempo morto (12/11) ──
    await scenario(browser, 'TR2-semana-0311', '2026-10-26', { [PRG]: { 60: { aula: true, questoesD2: true, apostila: true, smartcard: true, completedAt: '2026-10-01', accSelagem: 70 } } }, async (S) => {
        await markUntil(S.page, '2026-11-02'); await S.page.evaluate(() => { const t = JSON.parse(localStorage.getItem('medplanner_trail_v1')); t[5].accSelagem = 85; t[6].accSelagem = 85; localStorage.setItem('medplanner_trail_v1', JSON.stringify(t)); });
        let page = await S.reopen('2026-11-03');
        const cfg = await getLS(page, CFG); const W = cfg.trilhaWeeks['2026-11-03'] || {};
        check('T2 congelada: trilhaWeeks[03/11] = { q: 4, base: 4, held: false, mods: [19, 24, 32, 34] } (a T1 de 8 dias fechou)', W.q === 4 && W.base === 4 && W.held === false && JSON.stringify(W.mods) === '[19,24,32,34]', JSON.stringify(W));
        check('sem ⏳ (tudo marcado até 02/11)', !(await banner(page, 'trilha-pending')));
        const w = await readWeekT(page); Object.values(w).forEach(d => console.log(fmt(d)));
        const ter = w['03/11'], sex = w['06/11'];
        check('TER 03/11 (plantão longo): só 🚑, Anki no trajeto, áudio, academia opcional e jantar/sono — nenhuma etapa de mesa', ter.blocks.every(b => b.tag === 'AMB' || b.tag === 'ANKI' || b.au || b.tag === 'GYM' || b.tag === 'LAZER') && !ter.blocks.some(b => b.tm != null && !b.au), ter.blocks.map(b => b.tag).join(','));
        check('SEX 06/11: SIMULADO + CORREÇÃO, nenhuma etapa de módulo, botão "🎯 Simulado marcado nesta sexta"', has(sex, /SIMULADO NA ÍNTEGRA \(quinzenal\): manhã/) && has(sex, /CORREÇÃO DO SIMULADO/) && !sex.blocks.some(b => b.tm != null) && /🎯 Simulado marcado nesta sexta/.test(sex.simBtn || ''));
        const map = await trailMap(page, 2);
        const bad = Object.entries(map).filter(([, m]) => ['2026-11-03', '2026-11-06', '2026-11-10', '2026-11-12'].some(d => Object.values(m).includes(d)));
        check('nenhuma etapa em 03/11, 06/11, 10/11 e 12/11 (plantões longos e simulado)', !bad.length, JSON.stringify(bad));
        const okChain = [19, 24, 32, 34].every(id => { const m = map[id] || {}; return m.aula && m.quest && m.apost && m.seal && !Object.keys(m).some(k => /_dup/.test(k)) && dd(m.aula, m.quest) >= 1 && dd(m.aula, m.quest) <= 2 && dd(m.quest, m.apost) >= 1 && dd(m.quest, m.apost) <= 2 && dd(m.apost, m.seal) >= 2 && dd(m.apost, m.seal) <= 5; });
        check('módulos novos (19, 24, 32, 34): 4 etapas em dias distintos, dentro das faixas', okChain, JSON.stringify([19, 24, 32, 34].map(id => [id, map[id]])));
        // CIR1 · Trauma II selado em 02/11 com 85% ⇒ D+7 em +10 dias = QUI 12/11 (plantão longo)
        await page.evaluate(() => { const c = JSON.parse(localStorage.getItem('medplanner_config_v1')); c.manualWeek = null; localStorage.setItem('medplanner_config_v1', JSON.stringify(c)); });
        page = await S.reopen('2026-11-10'); await markUntil(page, '2026-11-11'); page = await S.reopen('2026-11-12');
        const alerts = await page.evaluate(() => { const t = document.body.innerText; const i = t.indexOf('Revisões no prazo'); return i < 0 ? '' : t.slice(i, i + 400); });
        check('revisões vêm só do registro da Trilha: CIR1 vencido aparece; o GIN5 do curso (progress_v1) não', /Hora de revisar \(Trilha\) — CIR1/.test(alerts) && !/GIN5/.test(alerts), alerts.replace(/\n/g, ' | ').slice(0, 200));
        const qui = await readDay(page); console.log(fmt(qui));
        const rv = qui.blocks.find(b => /^📱 revisão no tempo morto — 10 questões \+ smartcards/.test(b.text));
        check('QUI 12/11 (plantão longo): a revisão vencida vira "📱 revisão no tempo morto" (opcional), sem etapa de mesa', !!rv && rv.time === 'opcional' && !qui.blocks.some(b => b.tm != null && !b.au), fmt(qui));
        await clickDate(page, '13/11'); const sx = await readDay(page);
        check('SEX 13/11: a revisão não marcada aparece como revisão normal (desliza, fora do ⏳)', has(sx, /^Revisão adaptativa \(o app avisa pelo seu %\)/) && !(await banner(page, 'trilha-pending')));
    });
    // ── TR3 · bloco 04h30 (25/11): ritmo não sobe, 📚 a 5h, véspera "~20h30", nada de horário de medicação ──
    const plan3 = { 5: ['2026-11-17', '2026-11-18', '2026-11-19', '2026-11-22'], 6: ['2026-11-18', '2026-11-19', '2026-11-20', '2026-11-23'], 14: ['2026-11-20', '2026-11-21', '2026-11-22', '2026-11-25'], 19: ['2026-11-21', '2026-11-22', '2026-11-23', '2026-11-26'] };
    const mkPlan = (pl, wk) => { const o = {}; Object.entries(pl).forEach(([id, d]) => { const x = { aula: d[0], quest: d[1], apost: d[2], seal: d[3] }; o[id] = { wk, via: 'ramp', ...x, orig: { ...x }, hist: [] }; }); return o; };
    const mkTrail = (pl, ate) => { const o = {}; Object.entries(pl).forEach(([id, d]) => { STG.forEach((ts, i) => { if (d[i] <= ate) { (o[id] = o[id] || {})[FIELD[ts]] = true; o[id][STAMP[ts]] = d[i]; } }); if (o[id] && STG.every(ts => o[id][FIELD[ts]])) o[id].completedAt = d[3]; }); return o; };
    const cfg3 = { ...baseCfg, trilhaRamp: { '2026-11-24': 5 }, trilhaWeeks: { '2026-11-17': { q: 4, base: 4, held: false, why: null, mods: [5, 6, 14, 19], adv: [], rise: [] } }, trilhaPlan: mkPlan(plan3, '2026-11-17') };
    await scenario(browser, 'TR3-madrugada-2511', '2026-11-25', { [CFG]: cfg3, [TRL]: mkTrail(plan3, '2026-11-24'), [SCH]: { '2026-11-26': [{ id: 'x1', d: 'ANKI', color: '#0369A1', text: 'Anki no trajeto — 20min', time: '20min' }, { id: 'x2', d: 'AMB', color: '#6B7280', text: '🚑 Plantão 04h30–12h30', time: '8h' }, { id: 'x3', d: 'EXTRA', color: '#0EA5E9', text: 'Estudo extra que ela pôs', time: '4h' }, { id: 'x4', d: 'EXTRA', color: '#0EA5E9', text: 'Mais um bloco', time: '1h' }, { id: 'x5', d: 'LAZER', color: '#6B7280', text: 'Noite leve', time: 'livre' }] } }, async (S) => {
        const page = S.page;
        const cfg = await getLS(page, CFG); const W = cfg.trilhaWeeks['2026-11-24'] || {};
        check('T5 (24/11) congelada SEGURADA pelo bloco 04h30: { q: 4, base: 5, held: true, why: "madrugada", mods: [24, 32, 34, 85] }', W.q === 4 && W.base === 5 && W.held === true && W.why === 'madrugada' && JSON.stringify(W.mods) === '[24,32,34,85]', JSON.stringify(W));
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
        check('T8 (15/12) sobe para 5: { q: 5, base: 5, held: false, mods: [24, 32, 34, 85, 86] }', W.q === 5 && W.base === 5 && W.held === false && JSON.stringify(W.mods) === '[24,32,34,85,86]', JSON.stringify(W));
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
        check('TR5b 02/01/2027: o Cronograma mostra a tela de encerramento com o balanço (fechados com %, fora do alcance, lembrete do backup)', !!bal && /🏁 Encerramento da Trilha \(26\/10\/2026 → 01\/01\/2027\)/.test(bal.text) && /Módulos fechados \(as 4 etapas\): \d+/.test(bal.text) && /✓ CIR1 · Trauma I/.test(bal.text) && /Fora do alcance \(seguem no novo cursinho a partir de 04\/01\)/.test(bal.text) && /💾 Lembrete/.test(bal.text), bal && bal.text.slice(0, 300));
        const after = await page.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
        check('TR5b: depois de 01/01 nada novo é gravado (config igual)', after[CFG] === S.lastLS[CFG]);
    });


    // ── Simulados na janela = exatamente 06/11 e 18/12 (20/11 e 04/12 caem em plantão; 01/01 sem simulado; 23/10, na transição, nem tem botão) ──
    await scenario(browser, 'TRsim-simulados-janela', '2026-10-19', {}, async (S) => {
        const page = S.page; await navWeek(page, 1); const sims = [], btn = {};
        for (let k = 0; k < 11; k++) { const w = await readWeekT(page); Object.entries(w).forEach(([d, x]) => { if (has(x, /SIMULADO NA ÍNTEGRA/)) sims.push(d); if (x.simBtn) btn[d] = x.simBtn; }); if (k < 10) await navWeek(page, 1); }
        check('simulados de 20/10 a 01/01 = exatamente 06/11 e 18/12', sims.join() === '06/11,18/12', sims.join());
        check('20/11 e 04/12: "Sexta de plantão: sem simulado pela regra"; 01/01: "último dia de acesso: sem simulado pela regra"; 23/10 (transição): sem botão', ['20/11', '04/12'].every(d => /Sexta de plantão: sem simulado pela regra/.test(btn[d] || '')) && /01\/01 — último dia de acesso: sem simulado pela regra/.test(btn['01/01'] || '') && !btn['23/10'], JSON.stringify(btn));
    });

    // ── TR6 · fechar a semana pela interface e Adiantar (cadeia inserida nos dias, linha de alcance +1, Cancelar não grava) ──
    await scenario(browser, 'TR6-adiantar-cabe', '2026-10-26', {}, async (S) => {
        const cfg0 = await getLS(S.page, CFG); const T1 = cfg0.trilhaWeeks['2026-10-26'];
        const stagesT1 = []; Object.entries(cfg0.trilhaPlan).forEach(([id, p]) => STG.forEach(ts => { if (p[ts] >= '2026-10-26' && p[ts] <= '2026-11-02') stagesT1.push([Number(id), ts, p[ts]]); }));
        stagesT1.sort((a, b) => a[2] < b[2] ? -1 : 1); const last = stagesT1[stagesT1.length - 1];
        await markUntil(S.page, '2026-11-02', [[last[0], last[1]]]); let page = await S.reopen('2026-10-28');
        const t0 = await trilhaRows(page); const N0 = Number(t0.counts.match(/cabem (\d+)/)[1]); await clickTab(page, 'CRONOGRAMA');
        check('com uma etapa da semana (8 dias, até SEG 02/11) ainda aberta, o ⏩ não aparece', !(await banner(page, 'trilha-adv')));
        await clickDate(page, br(last[2]));
        const dayL = await readDay(page); const blk = dayL.blocks.find(b => b.tm === last[0] && b.ts === last[1]);
        await clickTask(page, new RegExp('^' + blk.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 60)), null);
        const tr = await getLS(page, TRL);
        check('marcar a última etapa pelo bloco (SEG 02/11, dia futuro — a 2ª segunda da semana) carimba hoje (28/10): min(hoje, data do bloco)', tr[last[0]][STAMP[last[1]]] === '2026-10-28', JSON.stringify(tr[last[0]]));
        const adv = await banner(page, 'trilha-adv');
        check('semana fechada ⇒ "⏩ Adiantar próximo módulo"', !!adv && adv.btns.includes('⏩ Adiantar próximo módulo'), adv && adv.text);
        await clickIn(page, 'trilha-adv', '⏩ Adiantar próximo módulo');
        const pr = await banner(page, 'trilha-adv'); console.log('   💡', pr.text.replace(/\n/g, ' '));
        check('proposta A: "Adiantar #4 CIR2 Cicatrização de Feridas e Queimaduras: aula … · questões … · apostila … · selagem …" com Aplicar/Cancelar', /💡 Adiantar #4 CIR2 Cicatrização de Feridas e Queimaduras: aula (QUA|QUI|SEX|SÁB|DOM|SEG) \d\d\/1[01] \([\d,]+h.*\) · questões .* · apostila .* · selagem .*\./.test(pr.text) && pr.btns.includes('Aplicar') && pr.btns.includes('Cancelar'), pr.text);
        const before = await getLS(page, CFG);
        await clickIn(page, 'trilha-adv', 'Cancelar');
        check('Cancelar não grava nada', JSON.stringify(await getLS(page, CFG)) === JSON.stringify(before));
        await clickIn(page, 'trilha-adv', '⏩ Adiantar próximo módulo'); await clickIn(page, 'trilha-adv', 'Aplicar');
        const cfg = await getLS(page, CFG); const p19 = cfg.trilhaPlan[19] || {};
        check('Aplicar: trilhaPlan[19] = { wk: 26/10, via: "adv", 4 datas de 28/10 a 02/11 } e trilhaWeeks[26/10].adv = [19]', p19.wk === '2026-10-26' && p19.via === 'adv' && STG.every(ts => p19[ts] && p19[ts] >= '2026-10-28' && p19[ts] <= '2026-11-02') && JSON.stringify(cfg.trilhaWeeks['2026-10-26'].adv) === '[19]' && JSON.stringify(T1.mods) === '[5,6,14]', JSON.stringify(p19));
        await clickDate(page, br(p19.aula)); const dA = await readDay(page);
        check('a aula de CIR2 Cicatrização aparece no dia proposto (cadeia inserida nos dias)', dA.blocks.some(b => b.tm === 19 && b.ts === 'aula'));
        check('o ⏩ some (a semana tem etapa aberta de novo)', !(await banner(page, 'trilha-adv')));
        const t1 = await trilhaRows(page); const N1 = Number(t1.counts.match(/cabem (\d+)/)[1]);
        check('linha de alcance avança um: N ' + N0 + ' → ' + N1, N1 === N0 + 1 && N0 === 36 && t1.lineAfter === N1, t1.line);
    });

    // ── TR7 · Adiantar com dias insuficientes (SEG 02/11, último dia da T1): desfecho B "Começar agora"; na terça a T2 abre sem o 19 ──
    await scenario(browser, 'TR7-adiantar-B', '2026-10-26', {}, async (S) => {
        await markUntil(S.page, '2026-11-02'); let page = await S.reopen('2026-11-02');
        await clickIn(page, 'trilha-adv', '⏩ Adiantar próximo módulo');
        const pr = await banner(page, 'trilha-adv'); console.log('   💡', pr.text.replace(/\n/g, ' '));
        check('desfecho B: "A cadeia completa de #4 CIR2 Cicatrização … não cabe nos dias que restam nesta semana … Posso começar agora: aula SEG 02/11 …" + "Começar agora"', /A cadeia completa de #4 CIR2 Cicatrização de Feridas e Queimaduras não cabe nos dias que restam nesta semana sem quebrar os intervalos/.test(pr.text) && /Posso começar agora: aula (⚠️ )?SEG 02\/11 \([\d,]+h\)/.test(pr.text) && /para a semana seguinte\./.test(pr.text) && pr.btns.includes('Começar agora'), pr.text);
        await clickIn(page, 'trilha-adv', 'Começar agora');
        const cfg = await getLS(page, CFG);
        check('Começar agora: trilhaPlan[19].via = "adv", aula 02/11', cfg.trilhaPlan[19] && cfg.trilhaPlan[19].via === 'adv' && cfg.trilhaPlan[19].aula === '2026-11-02', JSON.stringify(cfg.trilhaPlan[19]));
        page = await S.reopen('2026-11-03');
        const W = (await getLS(page, CFG)).trilhaWeeks['2026-11-03'];
        check('na terça 03/11 a T2 abre os próximos da fila: mods [24, 32, 34, 85] (o adiantado não conta para fechar a semana)', W && JSON.stringify(W.mods) === '[24,32,34,85]' && W.q === 4, JSON.stringify(W));
    });

    // ── TR8 · subida destravada 🔓 (a semana passada fechou depois do congelamento) ──
    await scenario(browser, 'TR8-subida-0311', '2026-10-26', {}, async (S) => {
        await markUntil(S.page, '2026-11-02', [[5, 'seal']]); let page = await S.reopen('2026-11-03');
        const W = (await getLS(page, CFG)).trilhaWeeks['2026-11-03'];
        check('T2 congela SEGURADA: { q: 3, base: 4, held: true, why: "fechamento", mods: [19, 24, 32] }', W.q === 3 && W.base === 4 && W.held === true && W.why === 'fechamento' && JSON.stringify(W.mods) === '[19,24,32]', JSON.stringify(W));
        check('sem 🔓 enquanto a semana passada não fecha (só o ⏳ da selagem pendente)', !(await banner(page, 'trilha-rise')) && !!(await banner(page, 'trilha-pending')));
        await clickCardBtn(page, /Trauma I — Avaliação Inicial/, /^Selagem/); await clickTab(page, 'CRONOGRAMA');
        const rise = await banner(page, 'trilha-rise');
        check('marcar a selagem de CIR1 no card ⇒ "🔓 A semana passada fechou — o ritmo desta semana pode subir para 4."', !!rise && /🔓 A semana passada fechou — o ritmo desta semana pode subir para 4\./.test(rise.text) && rise.btns.includes('Ver proposta') && rise.btns.includes('Agora não'), rise && rise.text);
        await clickIn(page, 'trilha-rise', 'Ver proposta'); const pv = await banner(page, 'trilha-rise'); console.log('   💡', pv.text.replace(/\n/g, ' '));
        await clickIn(page, 'trilha-rise', 'Aplicar');
        const cfg = await getLS(page, CFG); const W2 = cfg.trilhaWeeks['2026-11-03'];
        check('Aplicar: q 4, held false, rise [34], trilhaPlan[34].via = "rise"', W2.q === 4 && W2.held === false && JSON.stringify(W2.rise) === '[34]' && cfg.trilhaPlan[34] && cfg.trilhaPlan[34].via === 'rise', JSON.stringify(W2));
    });
    await scenario(browser, 'TR8b-subida-agora-nao', '2026-10-26', {}, async (S) => {
        await markUntil(S.page, '2026-11-02', [[5, 'seal']]); let page = await S.reopen('2026-11-03');
        await clickCardBtn(page, /Trauma I — Avaliação Inicial/, /^Selagem/); await clickTab(page, 'CRONOGRAMA');
        await clickIn(page, 'trilha-rise', 'Agora não');
        const cfg = await getLS(page, CFG);
        check('"Agora não" ⇒ trilhaDismiss["2026-11-03|rise"] = 03/11 e o 🔓 some', cfg.trilhaDismiss && cfg.trilhaDismiss['2026-11-03|rise'] === '2026-11-03' && !(await banner(page, 'trilha-rise')), JSON.stringify(cfg.trilhaDismiss));
    });

    // ── TR9 · ficou para trás ⏳ → "Ver como recolocar" (só grava com Aplicar; origem e histórico guardados) ──
    await scenario(browser, 'TR9-recolocar-3110', '2026-10-26', {}, async (S) => {
        const tr = { 5: { aula: true, aulaAt: '2026-10-26', questoesD2: true, questoesD2At: '2026-10-28' }, 6: { aula: true, aulaAt: '2026-10-28', questoesD2: true, questoesD2At: '2026-10-29', apostila: true, apostilaAt: '2026-10-30' }, 14: { aula: true, aulaAt: '2026-10-30' } }; await setLS(S.page, TRL, tr);
        const page = await S.reopen('2026-10-31');
        const pend = await banner(page, 'trilha-pending');
        check('⏳ "Ficaram para trás 1 etapa (CIR1 · apostila de QUI 29/10) — sem culpa: posso propor novos dias."', !!pend && /Ficaram para trás 1 etapa \(CIR1 · apostila de QUI 29\/10\) — sem culpa: posso propor novos dias\./.test(pend.text), pend && pend.text);
        await clickIn(page, 'trilha-pending', 'Ver como recolocar'); const pv = await banner(page, 'trilha-pending'); console.log('   💡', pv.text.replace(/\n/g, ' '));
        check('a proposta diz o dia novo, o antigo e o intervalo fora da faixa (o SÁB 31/10 é o dia leve)', /CIR1 · apostila DOM 01\/11 \([\d,]+h\) \(antes: QUI 29\/10; 4 dias após as questões — fora de 1–2\)/.test(pv.text) && !/TER 03\/11/.test(pv.text), pv.text);
        await clickIn(page, 'trilha-pending', 'Aplicar');
        const p5 = (await getLS(page, CFG)).trilhaPlan[5];
        check('Aplicar: apostila 01/11 (orig 29/10), selagem recolocada, hist "recolocar"; nada em 03/11 (plantão longo)', p5.apost === '2026-11-01' && p5.orig.apost === '2026-10-29' && p5.hist.every(h => h.why === 'recolocar') && p5.seal !== '2026-11-03' && dd(p5.apost, p5.seal) >= 2 && dd(p5.apost, p5.seal) <= 5, JSON.stringify(p5));
        await clickDate(page, '29/10'); const qi = await readDay(page);
        check('QUI 29/10 guarda a linha "↷ Trilha · CIR1 — apostila recolocada para DOM 01/11"', has(qi, /^↷ Trilha · CIR1 — apostila recolocada para DOM 01\/11$/));
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

    await scenario(browser, 'TR11-mover-2610', '2026-10-26', {}, async (S) => {
        let page = S.page;
        await clickDate(page, '29/10'); await moveT(page, /^Trilha · CIR1 — Trauma II .*30 questões/, '2026-11-01');
        const ask = await readAsk(page); console.log('   ', ask && ask.text.replace(/\n/g, ' | '));
        check('mover as questões de CIR1 · Trauma II de QUI 29/10 para DOM 01/11 ⇒ aviso "a apostila 2 dias ANTES das questões" com Mover assim mesmo / Ver como reorganizar o fio / Cancelar', !!ask && /a apostila 2 dias ANTES das questões/.test(ask.text) && ['Mover assim mesmo', 'Ver como reorganizar o fio', 'Cancelar'].every(b => ask.btns.includes(b)), ask && ask.text);
        const before = await getLS(page, CFG);
        await clickAsk(page, 'Cancelar');
        check('Cancelar não grava nada', JSON.stringify(await getLS(page, CFG)) === JSON.stringify(before) && !(await getLS(page, SCH)));
        await moveT(page, /^Trilha · CIR1 — Trauma II .*30 questões/, '2026-11-01'); await clickAsk(page, 'Ver como reorganizar o fio');
        const ask2 = await readAsk(page); console.log('   ', ask2.text.replace(/\n/g, ' | '));
        check('"Ver como reorganizar" nunca propõe a TER 03/11 (plantão longo) nem a SEX 06/11 (simulado)', /💡 Reorganizar CIR1 Trauma II/.test(ask2.text) && !/03\/11|06\/11/.test(ask2.text.split('💡')[1] || ''), ask2.text);
        await clickAsk(page, 'Aplicar');
        const p6 = (await getLS(page, CFG)).trilhaPlan[6];
        check('Aplicar: trilhaPlan[6].quest = 01/11 + aula/apostila/selagem reorganizadas (hist "reorganizar"), sem dias novos no schedule_v1', p6.quest === '2026-11-01' && p6.aula < '2026-11-01' && p6.apost > '2026-11-01' && !['2026-11-03', '2026-11-06'].includes(p6.seal) && p6.hist.length >= 2 && p6.hist.every(h => h.why === 'reorganizar') && dd(p6.aula, p6.quest) >= 1 && dd(p6.aula, p6.quest) <= 2 && !(await getLS(page, SCH)), JSON.stringify(p6));
        await clickDate(page, '01/11'); const dm = await readDay(page);
        check('DOM 01/11 mostra as questões de CIR1 · Trauma II', dm.blocks.some(b => b.tm === 6 && b.ts === 'quest'));
        // cruzar a semana: a selagem de CIR1 · Trauma I sai da T1 (DOM 01/11) para a T2 (QUI 05/11, fora da faixa) ⇒ aviso; "Mover assim mesmo" grava só ela (hist "mover")
        await moveT(page, /^Trilha · CIR1 — Trauma I .*selagem/, '2026-11-05');
        const ask3 = await readAsk(page);
        check('mover a selagem de CIR1 · Trauma I para QUI 05/11 (semana seguinte) avisa "a selagem a 7 dias da apostila (ideal: ~3 dias)"', !!ask3 && /a selagem a 7 dias da apostila \(ideal: ~3 dias\)/.test(ask3.text), ask3 && ask3.text);
        await clickAsk(page, 'Mover assim mesmo');
        const p5c = (await getLS(page, CFG)).trilhaPlan[5];
        check('"Mover assim mesmo": trilhaPlan[5].seal = 05/11 (cruzou a semana), hist "mover", sem dias no schedule_v1', p5c.seal === '2026-11-05' && p5c.hist[p5c.hist.length - 1].why === 'mover' && !(await getLS(page, SCH)), JSON.stringify(p5c.hist.slice(-1)));
        await navWeek(page, 1); await clickDate(page, '05/11'); const q5 = await readDay(page);
        check('a selagem aparece na QUI 05/11', q5.blocks.some(b => b.tm === 5 && b.ts === 'seal'));
    });

    // ── TR12 · registro separado: o card mostra a Trilha; o curso fica guardado; backup leva trail_v1 ──
    await scenario(browser, 'TR12-registro-2610', '2026-10-26', { [PRG]: { 5: { aula: true, questoesD2: true, apostila: true, smartcard: true, completedAt: '2026-03-01', accSelagem: 90, aulaPresencial: true, aulaPresencialAt: '2026-01-21' } } }, async (S) => {
        const page = S.page;
        check('nenhum alerta de revisão do registro antigo (o CIR1 do curso está vencido desde março)', !/Revisões no prazo/.test(await bodyText(page)));
        await clickDate(page, '26/10'); const q = await readDay(page);
        check('cadeia completa sempre: a aula de CIR1 Trauma I está na SEG 26/10 mesmo com o curso marcado', q.blocks.some(b => b.tm === 5 && b.ts === 'aula'));
        const card = await readCard(page, /Trauma I — Avaliação Inicial/); const body = await bodyText(page);
        check('card: 0% na Trilha + "Curso (até 19/10, guardado): ✓ aula · ✓ D2 · ✓ apostila · ✓ selagem · presencial 21/01"', card && card.pct === '0' && /Curso \(até 19\/10, guardado\): ✓ aula · ✓ D2 · ✓ apostila · ✓ selagem · presencial 21\/01/.test(body), JSON.stringify(card));
        check('card na Trilha: badges "Curso S3", "TRILHA #1", "ATÉ 01/01"; sem ATUAL/DESATRASO; presencial só leitura', /Curso S3/.test(body) && /TRILHA #1/.test(body) && /ATÉ 01\/01/.test(body) && !/DESATRASO\n/.test(body) && !card.btns.some(b => /Aula presencial/.test(b)));
        const prg0 = await getLS(page, PRG);
        await clickCardBtn(page, /Trauma I — Avaliação Inicial/, /D2 · 30q/);
        const tr = await getLS(page, TRL);
        check('marcar D2 no card ⇒ trail_v1[5].questoesD2 + questoesD2At = 26/10; progress_v1 intocado', tr[5] && tr[5].questoesD2 === true && tr[5].questoesD2At === '2026-10-26' && JSON.stringify(await getLS(page, PRG)) === JSON.stringify(prg0), JSON.stringify(tr));
        const filt = await page.evaluate(() => [...document.querySelectorAll('button')].map(b => b.innerText.trim()).filter(t => /Nesta semana da Trilha|No alcance até 01\/01|Fora do alcance/.test(t)));
        check('filtros da aba Módulos na Trilha: Nesta semana da Trilha · No alcance até 01/01 · Fora do alcance', filt.length === 3, filt.join(' | '));
        await clickTab(page, 'SONO');
        const [dl] = await Promise.all([page.waitForEvent('download'), page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Baixar backup/.test(x.innerText)); b.click(); })]);
        const data = JSON.parse(require('fs').readFileSync(await dl.path(), 'utf8'));
        check('backup da aba Sono traz medplanner_trail_v1 (e o progress_v1 guardado)', !!data.data['medplanner_trail_v1'] && !!data.data['medplanner_progress_v1']);
    });

    // ── TR13 · primeiro acesso real no meio da 1ª semana (QUA 28/10, 6 dos 8 dias) com localStorage antigo realista ──
    await scenario(browser, 'TR13-primeiro-acesso-2810', '2026-10-28', {
        [CFG]: { ...baseCfg, catchupPace: 2, fioWeek: { '2026-10-07': [75, 76], '2026-10-14': [77, 78] }, lightDayOverrides: { '2026-10-14': 6 }, weekGroups: { 38: [[74, 92], [73]] } },
        [PRG]: { 77: { aula: true, questoesD2: true }, 79: { aulaPresencial: true, aulaPresencialAt: '2026-10-14' } },
        [SCH]: { '2026-10-29': [{ id: 'o1', d: 'ANKI', color: '#0369A1', text: 'Anki + Meditação 15min', time: '35min' }, { id: 'o2', d: 'DESAT', color: '#B91C1C', text: 'Fio 1 · toque 3: apostila dirigida pelos erros (bloco antigo) + Feynman — fecha o fio', time: '1.5h' }, { id: 'o3', d: 'LAZER', color: '#6B7280', text: 'Lazer à noite ❤️', time: 'livre' }] },
    }, async (S) => {
        const page = S.page; const cfg = await getLS(page, CFG); const p = cfg.trilhaPlan || {};
        const W1 = cfg.trilhaWeeks['2026-10-26'] || {};
        check('1º acesso em QUA 28/10: trilhaFirstOpen = 28/10 e a T1 (8 dias) congela com a cota proporcional aos 6 de 8 dias que restam — round(3 × 6/8) = 2 (prop { full 3, days 6, len 8 }), nenhuma aula antes de 28/10', cfg.trilhaFirstOpen === '2026-10-28' && W1.q === 2 && W1.base === 3 && !W1.held && JSON.stringify(W1.prop) === '{"full":3,"days":6,"len":8}' && JSON.stringify(W1.mods) === '[5,6]' && Object.values(p).every(x => x.aula >= '2026-10-28'), JSON.stringify(W1));
        check('sem migração: não havia semana da trilha gravada (nenhum trilhaDescartes)', !cfg.trilhaDescartes, JSON.stringify(cfg.trilhaDescartes));
        const hdr = await page.evaluate(() => (document.querySelector('[data-t="trilha-panel"]') || {}).innerText || '');
        check('painel da semana: "ritmo 2 — 1º acesso: proporcional aos 6 de 8 dias que restavam (a rampa previa 3)"', /ritmo 2 — 1º acesso: proporcional aos 6 de 8 dias que restavam \(a rampa previa 3\)/.test(hdr), hdr.split('\n')[0]);
        await navWeek(page, 1); const nT2 = await page.evaluate(() => [...document.querySelectorAll('[data-t="trilha-panel"] [data-mod]')].filter(e => e.getAttribute('data-kind') === 'novo').length); await navWeek(page, -1);
        check('a semana proporcional não segura a seguinte: prévia da T2 com 4 novos (a subida usa a cota cheia, 3 → 4)', nT2 === 4, 'T2 novos=' + nT2);
        check('o histórico do curso fica: fioWeek, weekGroups, progress_v1 e schedule_v1 intactos', JSON.stringify(cfg.fioWeek) === JSON.stringify({ '2026-10-07': [75, 76], '2026-10-14': [77, 78] }) && cfg.weekGroups[38] && (await getLS(page, PRG))[77].aula === true && !!(await getLS(page, SCH))['2026-10-29']);
        await clickDate(page, '29/10'); const qi = await readDay(page); console.log(fmt(qi));
        const old = qi.blocks.find(b => /^Fio 1 · toque 3/.test(b.text));
        check('dia editado ANTES da Trilha (29/10) continua valendo; o bloco antigo vira nota (sem tarefa, sem cartão)', !!old && !old.tasks.length && !old.mod);
        const cov = await banner(page, 'trilha-coverage');
        const planned29 = Object.entries(p).filter(([, x]) => STG.some(ts => x[ts] === '2026-10-29'));
        check('aviso de etapa da Trilha ausente na lista editada de 29/10' + (planned29.length ? '' : ' (nada planejado para 29/10)'), planned29.length ? (!!cov && /📝 QUI 29\/10: a lista editada deste dia não traz/.test(cov.text) && /↺ Voltar ao padrão traz a Trilha \(sua edição fica guardada\)/.test(cov.text)) : true, cov && cov.text);
        await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Voltar ao padr/.test(x.innerText)); b.click(); }); await page.waitForTimeout(400);
        const arc = JSON.parse(await page.evaluate(() => localStorage.getItem('medplanner_schedule_archive_v1')) || '{}');
        check('"↺ Voltar ao padrão" guarda a edição em medplanner_schedule_archive_v1 e traz a Trilha', arc['2026-10-29'] && arc['2026-10-29'][0].list.length === 3 && !(await getLS(page, SCH))['2026-10-29'] && !(await banner(page, 'trilha-coverage')), JSON.stringify(arc).slice(0, 120));
        await navWeek(page, -2); const w41 = await readDay(page); const h41 = await headerWeek(page);
        check('Sem.41: lightDayOverrides["2026-10-14"] = 6 apontava para a TER 20/10 → ignorado (Auto)', h41.week === 41 && w41.light && w41.light.value === 'auto', JSON.stringify([h41, w41.light]));
        // semana seguinte à proporcional, sem a T1 fechada: a regra de subida conta a cota cheia (3) e a tela explica
        await page.evaluate(() => { const c = JSON.parse(localStorage.getItem('medplanner_config_v1')); c.manualWeek = null; localStorage.setItem('medplanner_config_v1', JSON.stringify(c)); }); // volta a semana visível para "auto" (o ◀ acima a deixou manual)
        const p3 = await S.reopen('2026-11-03'); const W2 = (await getLS(p3, CFG)).trilhaWeeks['2026-11-03'] || {};
        const hdr2 = await p3.evaluate(() => ((document.querySelector('[data-t="trilha-panel"]') || {}).innerText || '').split('\n')[0]);
        check('T1 aberta ⇒ T2 segura na cota cheia da T1: { q 3, base 4, held, why "fechamento" } e o painel explica "a semana do 1º acesso teve 2 módulos em 6 dias; para subir ou segurar, conta a cota cheia dela (3)"', W2.q === 3 && W2.base === 4 && W2.held === true && W2.why === 'fechamento' && /ritmo 3 · a semana do 1º acesso teve 2 módulos em 6 dias; para subir ou segurar, conta a cota cheia dela \(3\) — semana de manutenção do ritmo/.test(hdr2), JSON.stringify(W2) + ' | ' + hdr2);
    });
    // ── TR13b · 1º acesso no último dia da T1 (SEG 02/11): cota proporcional 0 — nenhum ⏩ numa semana sem etapa, texto no singular ──
    await scenario(browser, 'TR13b-primeiro-acesso-ultimo-dia-0211', '2026-11-02', {}, async (S) => {
        const page = S.page; const W1 = (await getLS(page, CFG)).trilhaWeeks['2026-10-26'] || {};
        const hdr = await page.evaluate(() => ((document.querySelector('[data-t="trilha-panel"]') || {}).innerText || '').split('\n')[0]);
        check('1º acesso SEG 02/11: T1 = { q 0, prop { full 3, days 1, len 8 } }; painel "proporcional ao único dia que restava (1 de 8)"', W1.q === 0 && JSON.stringify(W1.prop) === '{"full":3,"days":1,"len":8}' && /ritmo 0 — 1º acesso: proporcional ao único dia que restava \(1 de 8\) \(a rampa previa 3\)/.test(hdr), JSON.stringify(W1) + ' | ' + hdr);
        check('semana sem etapa não diz "Todas as etapas desta semana estão marcadas" nem oferece ⏩', !(await banner(page, 'trilha-adv')));
        await navWeek(page, 1); const n2 = await page.evaluate(() => [...document.querySelectorAll('[data-t="trilha-panel"] [data-mod]')].filter(e => e.getAttribute('data-kind') === 'novo').length);
        check('a T2 volta à rampa: prévia com 4 novos', n2 === 4, 'T2 novos=' + n2);
    });
    // ── TR13c · 1º acesso no 1º dia da T1 (SEG 26/10, decisão 74): os 8 de 8 dias restam ⇒ cota cheia, sem texto de proporcional ──
    await scenario(browser, 'TR13c-primeiro-acesso-primeiro-dia-2610', '2026-10-26', {}, async (S) => {
        const page = S.page; const cfg = await getLS(page, CFG); const W1 = cfg.trilhaWeeks['2026-10-26'] || {};
        const hdr = await page.evaluate(() => ((document.querySelector('[data-t="trilha-panel"]') || {}).innerText || '').split('\n')[0]);
        check('1º acesso SEG 26/10 = 1º dia da T1: cota cheia 3 (sem prop), painel sem "proporcional"', W1.q === 3 && !W1.prop && cfg.trilhaFirstOpen === '2026-10-26' && !/proporcional/.test(hdr), JSON.stringify(W1) + ' | ' + hdr);
        await navWeek(page, 1); const hdr2 = await page.evaluate(() => ((document.querySelector('[data-t="trilha-panel"]') || {}).innerText || '').split('\n')[0]);
        check('a T2 não traz a nota "a semana do 1º acesso teve …" (não houve proporcional)', !/semana do 1º acesso/.test(hdr2), hdr2);
    });

    // ── TR15 · decisão 73 (paciente, 20/10): revisão vencida que passaria o dia de 14,5h vira opcional e desliza, sem ⏳ e sem tom de atraso ──
    // registro da Trilha com um módulo selado em 22/10 (70% ⇒ D+7 em +7 dias = QUI 29/10, plantão 06h–15h, dia já com 13,8h)
    const tr60 = { 60: { aula: true, questoesD2: true, apostila: true, smartcard: true, completedAt: '2026-10-22', accSelagem: 70 } };
    const chain2910 = async (S, seeds) => { let page = S.page;
        await markUntil(page, '2026-10-28');
        if (seeds) await page.evaluate((v) => localStorage.setItem('medplanner_schedule_v1', JSON.stringify(v)), seeds);
        return S.reopen('2026-10-29'); };
    await scenario(browser, 'TR15-revisao-dia-cheio-2910', '2026-10-26', { [TRL]: tr60 }, async (S) => {
        let page = await chain2910(S);
        const qui = await readDay(page); const rv = qui.blocks.find(b => /^Revisão adaptativa/.test(b.text));
        const tot = qui.blocks.reduce((a, b) => a + H.parseH(b.time), 0);
        check('QUI 29/10 (13,8h sem a revisão; com ela, 14,6h): o bloco vira "Revisão adaptativa — opcional hoje: o dia já está cheio; se não fizer, ela passa para SEX 30/10" (opcional), o dia fica em ' + tot.toFixed(2).replace('.', ',') + 'h e sem ⚠️ de tempo hábil', !!rv && rv.text === 'Revisão adaptativa — opcional hoje: o dia já está cheio; se não fizer, ela passa para SEX 30/10' && rv.time === 'opcional' && tot <= 14.5 + 1e-9 && !qui.warn.some(x => /tempo hábil/.test(x)), (rv && rv.text) + ' | ' + qui.warn.join());
        check('o bloco opcional mantém "Revisei" + % (como no plantão longo)', /Revisei/.test(await bodyText(page)));
        const st = await revStatus(page);
        check('alerta e seção do dia sem tom de atraso, em linha própria visível no celular (420px, sem reticências): "Opcional hoje: o dia está cheio; passa para SEX 30/10." — nunca "em atraso"', st.length >= 2 && st.every(x => x.text === 'Opcional hoje: o dia está cheio; passa para SEX 30/10.' && x.fits) && !/em atraso/.test(await bodyText(page)), JSON.stringify(st));
        check('o dia cheio fica registrado: trilhaRevFull["2026-10-29"] = true', ((await getLS(page, CFG)).trilhaRevFull || {})['2026-10-29'] === true);
        await clickDate(page, '30/10'); const stF = await revStatus(page); await clickDate(page, '29/10');
        check('navegando para a SEX 30/10 (futuro): a seção do dia diz "Passa para este dia (o dia em que venceu está cheio)." — nunca "Passou para hoje"', stF.some(x => x.text === 'Passa para este dia (o dia em que venceu está cheio).') && !stF.some(x => /^Passou para hoje/.test(x.text)), JSON.stringify(stF));
        check('nenhum ⏳ (revisão não é etapa pendente)', !(await banner(page, 'trilha-pending')));
        await markUntil(page, '2026-10-29'); page = await S.reopen('2026-10-30');
        const sx = await readDay(page); const rv2 = sx.blocks.find(b => /^Revisão adaptativa/.test(b.text));
        const st2 = await revStatus(page);
        check('SEX 30/10 (1º dia com folga): revisão normal de 45min e "Passou para hoje (o dia em que venceu estava cheio)." visível, sem "em atraso"', !!rv2 && rv2.text === 'Revisão adaptativa (o app avisa pelo seu %)' && rv2.time === '45min' && st2.length >= 2 && st2.every(x => x.text === 'Passou para hoje (o dia em que venceu estava cheio).' && x.fits) && !/em atraso/.test(await bodyText(page)), (rv2 && rv2.text) + ' | ' + JSON.stringify(st2));
    });
    // ── TR15c · o passado é julgado como foi: depois de "Recolocar" (as etapas saem do dia cheio), a revisão continua "passou", nunca "em atraso" ──
    await scenario(browser, 'TR15c-revisao-depois-de-recolocar-3010', '2026-10-26', { [TRL]: tr60 }, async (S) => {
        let page = await chain2910(S);
        check('29/10 aberto com a revisão opcional ⇒ trilhaRevFull["2026-10-29"] = true', ((await getLS(page, CFG)).trilhaRevFull || {})['2026-10-29'] === true, JSON.stringify((await getLS(page, CFG)).trilhaRevFull));
        page = await S.reopen('2026-10-30'); // as etapas de 29/10 ficaram sem marcar ⇒ ⏳
        await clickIn(page, 'trilha-pending', 'Ver como recolocar'); await clickIn(page, 'trilha-pending', 'Aplicar');
        const st = await revStatus(page);
        check('depois de "Recolocar" tirar as etapas de 29/10, a revisão segue "Passou para hoje (o dia em que venceu estava cheio)." — nunca "em atraso"', st.length >= 1 && st.every(x => x.text === 'Passou para hoje (o dia em que venceu estava cheio).') && !/em atraso/.test(await bodyText(page)), JSON.stringify(st));
    });
    // ── TR15d · a folga é medida na lista REAL: SEX 30/10 editada à mão a 14h ⇒ o app aponta o SÁB 31/10 ──
    await scenario(browser, 'TR15d-revisao-dia-editado-2910', '2026-10-26', { [TRL]: tr60 }, async (S) => {
        const page = await chain2910(S, { '2026-10-30': [{ id: 'e1', d: 'EXTRA', color: '#0EA5E9', text: 'Compromisso longo (editado)', time: '14h' }] });
        const rv = (await readDay(page)).blocks.find(b => /^Revisão adaptativa/.test(b.text));
        check('QUI 29/10: "… se não fizer, ela passa para SÁB 31/10" (a SEX 30/10 editada não tem folga)', !!rv && rv.text === 'Revisão adaptativa — opcional hoje: o dia já está cheio; se não fizer, ela passa para SÁB 31/10', rv && rv.text);
    });
    // ── TR15f · revisão que venceu na transição (antes de 26/10): passa para o 1º dia da trilha com o motivo certo (não "dia cheio") ──
    await scenario(browser, 'TR15f-revisao-venceu-na-transicao-2610', '2026-10-26', { [TRL]: { 60: { aula: true, questoesD2: true, apostila: true, smartcard: true, completedAt: '2026-10-16', accSelagem: 75 } } }, async (S) => {
        const page = S.page; const st = await revStatus(page); const sg = await readDay(page);
        check('SEG 26/10: D+7 do GIN5 (id 60; 75% → 7 dias: venceu 23/10, na transição) ⇒ "Passou para hoje (venceu antes de a trilha começar)." — nem "em atraso", nem "dia cheio"', st.length >= 1 && st.every(x => x.text === 'Passou para hoje (venceu antes de a trilha começar).') && !/em atraso|o dia em que venceu estava cheio/.test(await bodyText(page)) && sg.blocks.some(b => /^Revisão adaptativa \(o app avisa pelo seu %\)/.test(b.text)), JSON.stringify(st));
        await navWeek(page, -1); await clickDate(page, '23/10'); const sx = await readDay(page);
        check('SEX 23/10 (transição): sem bloco de revisão', !sx.blocks.some(b => b.tag === 'REV'), fmt(sx));
    });
    // ── TR15e · depois de 01/01 a regra da Trilha para: a revisão volta ao texto de sempre (nada de "o dia está cheio") ──
    await scenario(browser, 'TR15e-revisao-depois-de-0101', '2027-01-04', { [TRL]: { 5: { aula: true, questoesD2: true, apostila: true, smartcard: true, aulaAt: '2026-12-15', questoesD2At: '2026-12-16', apostilaAt: '2026-12-17', smartcardAt: '2026-12-23', completedAt: '2026-12-23', accSelagem: 85 } } }, async (S) => {
        const st = await revStatus(S.page);
        check('04/01/2027 (revisão D+7 venceu 02/01): "2d em atraso." como antes — nenhum "o dia está cheio" depois do fim da Trilha', st.length >= 1 && st.every(x => x.text === '2d em atraso.') && !/o dia está cheio/.test(await bodyText(S.page)), JSON.stringify(st));
    });
    // ── TR15b · decisão 73 no limiar reduzido: dia de 04h30 (📚 a 5h) — a revisão que passaria de 5h de estudo vira opcional ──
    const tr15b = { ...mkTrail(plan3, '2026-11-24'), 60: { aula: true, questoesD2: true, apostila: true, smartcard: true, aulaAt: '2026-11-05', questoesD2At: '2026-11-06', apostilaAt: '2026-11-07', smartcardAt: '2026-11-15', completedAt: '2026-11-15', accSelagem: 85 } };
    await scenario(browser, 'TR15b-revisao-limiar-reduzido-2511', '2026-11-25', { [CFG]: cfg3, [TRL]: tr15b }, async (S) => {
        const page = S.page; const qua = await readDay(page); const rv = qua.blocks.find(b => /^Revisão adaptativa/.test(b.text));
        const st = H.hoursOf(qua);
        check('QUA 25/11 (04h30): com a revisão o estudo passaria de 5h ⇒ "Revisão adaptativa — opcional hoje…" (opcional), estudo do dia ' + st.toFixed(2).replace('.', ',') + 'h ≤ 5h', !!rv && /^Revisão adaptativa — opcional hoje: o dia já está cheio; se não fizer, ela passa para (SÁB|DOM) \d\d\/11$/.test(rv.text) && rv.time === 'opcional' && st <= 5 + 1e-9, (rv && rv.text) + ' · estudo ' + st.toFixed(2));
    });


    // ── TR14 · registro em 1 toque no bloco e "Revisei" no registro da Trilha ──
    await scenario(browser, 'TR14-um-toque-2910', '2026-10-26', { [TRL]: { 60: { aula: true, questoesD2: true, apostila: true, smartcard: true, completedAt: '2026-10-19', accSelagem: 75 } } }, async (S) => {
        let page = S.page;
        const sg = await readDay(page); const rv = sg.blocks.find(b => /^Revisão adaptativa/.test(b.text));
        check('SEG 26/10: bloco "Revisão adaptativa" (D+7 do GIN5, id 60, % 75 → 7 dias: vence hoje)', !!rv && (await revStatus(page)).some(x => x.text === 'Vence hoje.'), fmt(sg));
        await page.evaluate(() => { const blocks = [...document.querySelectorAll('div')].filter(el => el.style && /^3px solid/.test(el.style.borderLeft)); const el = blocks.find(b => /^Revisão adaptativa/.test((b.querySelector('span:nth-of-type(2)') || b).innerText) || /Revisão adaptativa/.test(b.innerText.split('\n').slice(0, 3).join(' '))); const b = [...el.querySelectorAll('button')].find(x => x.innerText.trim() === 'Revisei'); b.click(); });
        await page.fill('input[placeholder="% acerto"]', '85'); await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.innerText.trim() === 'OK'); b.click(); }); await page.waitForTimeout(300);
        let tr = await getLS(page, TRL);
        check('"Revisei" + 85% ⇒ trail_v1[60] { reviewD7Done, r1DoneAt 26/10, accR1 85 } (registro da Trilha, não o do curso)', tr[60].reviewD7Done === true && tr[60].r1DoneAt === '2026-10-26' && tr[60].accR1 === 85 && !(await getLS(page, PRG)), JSON.stringify(tr[60]));
        page = await S.reopen('2026-10-29');
        await clickDate(page, '26/10'); await clickTask(page, /^Trilha · CIR1 — Trauma I .*aula online/, null);
        tr = await getLS(page, TRL);
        check('✓ do bloco de aula (SEG 26/10, dia passado) ⇒ trail_v1[5].aula com carimbo 26/10 (min(hoje, data do bloco))', tr[5] && tr[5].aula === true && tr[5].aulaAt === '2026-10-26', JSON.stringify(tr[5]));
        await clickDate(page, '28/10'); await clickTask(page, /^Trilha · CIR1 — Trauma I .*30 questões/, /D2 · 30q/); await typeBlockPct(page, /^Trilha · CIR1 — Trauma I .*30 questões/, 72);
        tr = await getLS(page, TRL);
        check('"D2 · 30q (toque 2) ✓" + % no bloco ⇒ questoesD2 (28/10) e accD2 72 no trail_v1', tr[5].questoesD2 === true && tr[5].questoesD2At === '2026-10-28' && tr[5].accD2 === 72, JSON.stringify(tr[5]));
        const card = await readCard(page, /Trauma I — Avaliação Inicial/);
        check('o card reflete (aula e D2 marcados, 72%)', card.btns.some(b => /^✓ Aula 1\.5x/.test(b)) && card.btns.some(b => /^✓ D2 · 30q/.test(b)) && card.pcts.includes('72'), JSON.stringify(card));
        await clickCardBtn(page, /Trauma I — Avaliação Inicial/, /Apostila pelos erros/); await clickTab(page, 'CRONOGRAMA'); await clickDate(page, '29/10');
        const qi = await readDay(page);
        check('caminho inverso: apostila marcada no card aparece ✓ no bloco de QUI 29/10', qi.blocks.some(b => b.tm === 5 && b.ts === 'apost' && b.done));
    });

    // ── dia leve previsto: aula nunca no dia leve; etapa ali só de menor demanda e sinalizada (10 semanas da Trilha; a transição não tem 🌿) ──
    await scenario(browser, 'TRleve-dia-leve-previsto', '2026-10-19', {}, async (S) => {
        const page = S.page; await navWeek(page, 2); const bad = [], flagged = [], lights = [];
        for (let k = 0; k < 10; k++) { const w = await readWeekT(page); const any = Object.values(w)[0]; const L = any.light && any.light.note ? any.light.note.slice(0, 9) : null; lights.push(L);
            Object.entries(w).forEach(([d, x]) => { if (x.lightBadge || x.breatherBadge || (L && L.slice(4) === d)) { x.blocks.forEach(b => { if (b.ts === 'aula' && !b.au) bad.push(d); if (b.tm != null && !b.au) { if (/🌿 dia leve — etapa de menor demanda/.test(b.text)) flagged.push(d + ' ' + b.ts); else bad.push(d + ' sem sinal'); } }); } });
            if (k < 9) await navWeek(page, 1); }
        console.log('   dias leves previstos:', lights.join(' · '));
        check('um dia leve previsto em cada uma das 10 semanas (a 1ª, de 8 dias: SÁB 31/10)', lights.length === 10 && lights.every(Boolean) && lights[0] === 'SÁB 31/10', lights.join(' · '));
        check('nenhuma aula no dia leve previsto; etapa no dia leve só sinalizada "🌿 dia leve — etapa de menor demanda"', !bad.length, bad.join(', ') + ' | sinalizadas: ' + flagged.join(', '));
    });

    // ── startDate 14/01: a numeração do curso muda, a Trilha não ──
    await scenario(browser, 'TRstart-1401', '2026-10-26', { [CFG]: { startDate: '2026-01-14', manualWeek: null } }, async (S) => {
        const page = S.page; const hw = await headerWeek(page); const body = await bodyText(page);
        const cfg = await getLS(page, CFG);
        check('startDate 14/01: Sem.42 = T1 26/10–02/11, badge "Trilha 1/10", trilhaWeeks["2026-10-26"].mods = [5, 6, 14]', hw.week === 42 && hw.range === '26/10–02/11' && /Trilha 1\/10/.test(body) && JSON.stringify(cfg.trilhaWeeks['2026-10-26'].mods) === '[5,6,14]', JSON.stringify(hw));
        await navWeek(page, -1); const h0 = await headerWeek(page);
        check('◀ Sem.41 = transição 20/10–25/10', h0.week === 41 && h0.range === '20/10–25/10' && /(^|\n)Transição(\n|$)/.test(await bodyText(page)), JSON.stringify(h0));
        await navWeek(page, 12); const h2 = await headerWeek(page);
        check('▶ para na Sem.51 = 29/12–01/01', h2.week === 51 && h2.range === '29/12–01/01', JSON.stringify(h2));
    });

    // ── TR16 · início em 26/10 (paciente, 26/10): o app chega com a semana de 20/10 congelada pela versão anterior (nada executado) ──
    const oldW = { q: 3, base: 3, held: false, why: null, mods: [5, 6, 14], adv: [], rise: [], short: 0, light: '2026-10-24', at: '2026-10-20' };
    const oldPlan = { 5: { wk: '2026-10-20', via: 'ramp', aula: '2026-10-21', quest: '2026-10-22', apost: '2026-10-23', seal: '2026-10-26', orig: { aula: '2026-10-21', quest: '2026-10-22', apost: '2026-10-23', seal: '2026-10-26' }, hist: [] }, 6: { wk: '2026-10-20', via: 'ramp', aula: '2026-10-22', quest: '2026-10-24', apost: '2026-10-25', seal: '2026-10-28', orig: { aula: '2026-10-22', quest: '2026-10-24', apost: '2026-10-25', seal: '2026-10-28' }, hist: [] }, 14: { wk: '2026-10-20', via: 'ramp', aula: '2026-10-24', quest: '2026-10-26', apost: '2026-10-28', seal: '2026-10-31', orig: { aula: '2026-10-24', quest: '2026-10-26', apost: '2026-10-28', seal: '2026-10-31' }, hist: [] } };
    const oldCfg = { ...baseCfg, trilhaFirstOpen: '2026-10-20', trilhaWeeks: { '2026-10-20': oldW }, trilhaPlan: oldPlan, lightDayOverrides: { '2026-10-20': 4 } };
    const edited22 = [{ id: 'k1', d: 'ANKI', color: '#0369A1', text: 'Anki no trajeto — 20min', time: '20min' }, { id: 'k2', d: 'D2', color: '#C2410C', text: 'Trilha · CIR1 — Trauma I — Avaliação Inicial e Trauma de Tórax: 30 questões + caderno de erros + Anki dos erros — registre o %', time: '2h', tm: 5, ts: 'quest' }, { id: 'k3', d: 'LAZER', color: '#6B7280', text: 'Lazer à noite ❤️', time: 'livre' }];
    const edited05 = [{ id: 'm1', d: 'ANKI', color: '#0369A1', text: 'Anki + Meditação 15min', time: '35min' }, { id: 'm2', d: 'EXTRA', color: '#0EA5E9', text: 'Consulta (editado por ela)', time: '2h' }];
    await scenario(browser, 'TR16-inicio-2610-migracao', '2026-10-26', { [CFG]: oldCfg, [SCH]: { '2026-10-22': edited22, '2026-11-05': edited05 } }, async (S) => {
        let page = S.page; const cfg = await getLS(page, CFG);
        const dsc = (cfg.trilhaDescartes || [])[0] || {};
        check('a semana congelada de 20/10 sai do plano e fica guardada em trilhaDescartes (trilhaWeeks, trilhaPlan de 5/6/14 e o 1º acesso antigo) — nada apagado', (cfg.trilhaDescartes || []).length === 1 && JSON.stringify(dsc.trilhaWeeks['2026-10-20']) === JSON.stringify(oldW) && JSON.stringify(dsc.trilhaPlan) === JSON.stringify(oldPlan) && dsc.trilhaFirstOpen === '2026-10-20' && /início da trilha em 26\/10/.test(dsc.why) && dsc.at === '2026-10-26', JSON.stringify(cfg.trilhaDescartes).slice(0, 300));
        check('trilhaFirstOpen passa a ser hoje (26/10) e só existe a semana de 26/10: { q 3, mods [5, 6, 14] } — a fila não muda', cfg.trilhaFirstOpen === '2026-10-26' && Object.keys(cfg.trilhaWeeks).join() === '2026-10-26' && cfg.trilhaWeeks['2026-10-26'].q === 3 && JSON.stringify(cfg.trilhaWeeks['2026-10-26'].mods) === '[5,6,14]', JSON.stringify(cfg.trilhaWeeks));
        const p5 = cfg.trilhaPlan[5];
        check('CIR1 · Trauma I recomeça HOJE: aula 26/10 · questões 28/10 · apostila 29/10 · selagem 01/11 (wk 26/10)', p5.wk === '2026-10-26' && p5.aula === '2026-10-26' && p5.quest === '2026-10-28' && p5.apost === '2026-10-29' && p5.seal === '2026-11-01', JSON.stringify(p5));
        check('nenhuma etapa planejada antes de 26/10', !Object.values(cfg.trilhaPlan).some(p => STG.some(ts => p[ts] && p[ts] < '2026-10-26')), JSON.stringify(cfg.trilhaPlan));
        check('lightDayOverrides antigo (20/10 → SÁB 24/10, dia de transição) sai da config e fica guardado em trilhaDescartes (não vale para semana nenhuma)', !(cfg.lightDayOverrides || {})['2026-10-20'] && !(cfg.lightDayOverrides || {})['2026-10-26'] && dsc.lightDayOverrides && dsc.lightDayOverrides['2026-10-20'] === 4, JSON.stringify([cfg.lightDayOverrides, dsc.lightDayOverrides]));
        const sch = await getLS(page, SCH); const arc = JSON.parse(await page.evaluate(() => localStorage.getItem('medplanner_schedule_archive_v1')) || '{}');
        check('dia de transição gravado com etapa do plano descartado (22/10): o original vai para medplanner_schedule_archive_v1 e o dia vira a lista de transição (sem etapa, com a nota); o editado sem etapa de 05/11 fica como ela deixou', arc['2026-10-22'] && JSON.stringify(arc['2026-10-22'][0].list) === JSON.stringify(edited22) && /dia de transição \(a trilha começa em 26\/10\)/.test(arc['2026-10-22'][0].why) && Array.isArray(sch['2026-10-22']) && !sch['2026-10-22'].some(a => a.tm != null) && sch['2026-10-22'].some(a => /^🗓️ A trilha começa em 26\/10/.test(a.text)) && JSON.stringify(sch['2026-11-05']) === JSON.stringify(edited05) && cfg.trilhaInicio === '2026-10-26', JSON.stringify([Object.keys(sch), Object.keys(arc), cfg.trilhaInicio]));
        check('sem ⏳: as etapas antigas de 21–25/10 não viram pendentes', !(await banner(page, 'trilha-pending')));
        await navWeek(page, -1); const w = await readWeekT(page);
        check('20–25/10 (transição): nenhuma etapa em nenhum dos 6 dias, nem a de 22/10 que estava na edição antiga', Object.keys(w).length === 6 && !Object.values(w).some(d => d.blocks.some(H.transStage)) && has(w['22/10'], /^🗓️ A trilha começa em 26\/10/), JSON.stringify(Object.fromEntries(Object.entries(w).map(([d, x]) => [d, x.blocks.map(b => b.tag)]))));
        check('sem 🌿 na transição, mesmo com o lightDayOverrides antigo de 20/10', Object.values(w).every(d => !d.light && !d.lightBadge));
        await page.evaluate(() => { const c = JSON.parse(localStorage.getItem('medplanner_config_v1')); c.manualWeek = null; localStorage.setItem('medplanner_config_v1', JSON.stringify(c)); });
        const arcN = JSON.stringify(JSON.parse(await page.evaluate(() => localStorage.getItem('medplanner_schedule_archive_v1')) || '{}')); const schN = JSON.stringify(await getLS(page, SCH));
        page = await S.reopen('2026-10-26'); const cfg2 = await getLS(page, CFG);
        check('abrir de novo não migra outra vez (um só registro em trilhaDescartes; plano, dias gravados e arquivo iguais)', (cfg2.trilhaDescartes || []).length === 1 && JSON.stringify(cfg2.trilhaPlan) === JSON.stringify(cfg.trilhaPlan) && JSON.stringify(await getLS(page, SCH)) === schN && JSON.stringify(JSON.parse(await page.evaluate(() => localStorage.getItem('medplanner_schedule_archive_v1')) || '{}')) === arcN, (cfg2.trilhaDescartes || []).length);
    });
    // ── TR16c · ela marcou ✓ na versão anterior em dias de 20–25/10 (o app grava o dia inteiro), religou o simulado de 23/10 e escolheu dia sem remédio, rampa e "Agora não" das semanas antigas ──
    const head21 = [{ id: 'g-2026-10-21-0', d: 'ANKI', color: '#0369A1', text: 'Anki no trajeto — 20min', time: '20min', done: true }, { id: 'g-2026-10-21-1', d: 'AMB', color: '#6B7280', text: '🚑 Plantão 13h–18h · estude antes ou depois · nos tempos mortos a aula pode ser em áudio (o visual precisa do vídeo depois)', time: '5h' }, { id: 't-5-aula', d: 'D3', color: '#7E22CE', text: 'Trilha · CIR1 — Trauma I — Avaliação Inicial e Trauma de Tórax: aula online 1.5x + resumo — aula antes das questões, sempre', time: '1.7h', tm: 5, ts: 'aula' }, { id: 'u1', d: 'EXTRA', color: '#0EA5E9', text: 'Dentista (meu)', time: '1h', done: true }, { id: 'g-2026-10-21-4', d: 'GYM', color: '#1D4ED8', text: 'Academia — horário livre', time: '1h', done: true }, { id: 'g-2026-10-21-5', d: 'LAZER', color: '#6B7280', text: 'Noite leve — plantão 06h amanhã: dormir ~21h45', time: 'livre' }];
    const head24 = [{ id: 'g-2026-10-24-0', d: 'ANKI', color: '#0369A1', text: 'Anki + Meditação 15min', time: '35min', done: true }, { id: 'g-2026-10-24-1', d: 'PLAN', color: '#0F766E', text: 'Implementação de intenção + RECOMPENSA por escrito · pomodoros: aba Trilha · backup semanal', time: '15min' }, { id: 'c-1761318000000', d: 'GYM', color: '#1D4ED8', text: 'Caminhada na praia (minha)', time: '1h', done: true }, { id: 'g-2026-10-24-2', d: 'LAZER', color: '#6B7280', text: 'Lazer à noite ❤️', time: 'livre' }];
    const head23 = [{ id: 'g-2026-10-23-0', d: 'ANKI', color: '#0369A1', text: 'Anki no trajeto — 20min', time: '20min', done: true }, { id: 'g-2026-10-23-1', d: 'AMB', color: '#6B7280', text: '🚑 Plantão 05h30–17h · estude antes ou depois · nos tempos mortos a aula pode ser em áudio (o visual precisa do vídeo depois)', time: '11.5h' }, { id: 'g-2026-10-23-2', d: 'D7', color: '#B91C1C', text: 'SIMULADO NA ÍNTEGRA (quinzenal) — 100 questões, cronometrado', time: '5h' }, { id: 'g-2026-10-23-3', d: 'D7', color: '#B91C1C', text: 'CORREÇÃO DO SIMULADO — registre o %', time: '3h' }, { id: 'g-2026-10-23-4', d: 'LAZER', color: '#6B7280', text: 'Noite leve', time: 'livre' }];
    const head28 = [{ id: 'g-2026-10-28-0', d: 'ANKI', color: '#0369A1', text: 'Anki + Meditação 15min', time: '35min', done: true }, { id: 'c-1', d: 'EXTRA', color: '#0EA5E9', text: 'Consulta psiquiatra 16h', time: '1h' }, { id: 't-14-quest', d: 'D2', color: '#C2410C', text: 'Trilha · CIR2 — Urologia: 30 questões + caderno de erros + Anki dos erros — registre o %', time: '2h', tm: 14, ts: 'quest' }, { id: 'g-2026-10-28-3', d: 'GYM', color: '#1D4ED8', text: 'Academia — horário livre', time: '1h' }, { id: 'g-2026-10-28-4', d: 'LAZER', color: '#6B7280', text: 'Noite leve — plantão 06h amanhã: dormir ~21h45', time: 'livre' }];
    await scenario(browser, 'TR16c-inicio-2610-dias-marcados', '2026-10-26', { [CFG]: { ...oldCfg, lightDayOverrides: { '2026-10-20': 6, '2026-10-27': 4 }, trilhaRamp: { '2026-10-27': 2 }, trilhaDismiss: { '2026-10-27|rise': '2026-10-27' }, simOverrides: { '2026-10-23': true } }, [SCH]: { '2026-10-21': head21, '2026-10-23': head23, '2026-10-24': head24, '2026-10-28': head28 } }, async (S) => {
        let page = S.page; const cfg = await getLS(page, CFG); const sch = await getLS(page, SCH); const dsc = (cfg.trilhaDescartes || [])[0] || {};
        check('a rampa gravada para a antiga semana de 27/10 (2) NÃO passa para a T1 (a rampa foi recalculada em 26/10): a T1 congela com 3 e a chave antiga fica em trilhaDescartes', cfg.trilhaRamp['2026-10-26'] === undefined && cfg.trilhaRamp['2026-10-27'] === undefined && dsc.trilhaRamp['2026-10-27'] === 2 && cfg.trilhaWeeks['2026-10-26'].q === 3, JSON.stringify([cfg.trilhaRamp, cfg.trilhaWeeks['2026-10-26']]));
        check('os dias sem remédio gravados para as semanas antigas (20/10 → SEG 26/10 · 27/10 → SÁB 31/10) NÃO passam para a T1: ficam em trilhaDescartes, e a aula de CIR1 · Trauma I fica hoje (26/10)', ['2026-10-20', '2026-10-26', '2026-10-27'].every(k => cfg.lightDayOverrides[k] === undefined) && dsc.lightDayOverrides['2026-10-20'] === 6 && dsc.lightDayOverrides['2026-10-27'] === 4 && cfg.trilhaPlan[5].aula === '2026-10-26', JSON.stringify([cfg.lightDayOverrides, dsc.lightDayOverrides, cfg.trilhaPlan[5]]));
        check('"Agora não" da semana antiga (trilhaDismiss["2026-10-27|rise"]) vai para trilhaDescartes', !(cfg.trilhaDismiss || {})['2026-10-27|rise'] && (dsc.trilhaDismiss || {})['2026-10-27|rise'] === '2026-10-27', JSON.stringify([cfg.trilhaDismiss, dsc.trilhaDismiss]));
        const d26 = await readDay(page);
        check('SEG 26/10 sem escolha manual de dia sem remédio e com a aula de CIR1 · Trauma I', !(d26.light && /escolha manual/.test(d26.light.note)) && d26.blocks.some(b => b.tm === 5 && b.ts === 'aula' && !b.au), JSON.stringify(d26.light));
        check('QUA 21/10 (gravado pela versão anterior com a aula antiga e os ✓ dela): vira dia de transição — sem etapa, com a nota — e mantém o ✓ do Anki, da academia e o bloco "Dentista (meu)" com o ✓', !sch['2026-10-21'].some(a => a.tm != null) && sch['2026-10-21'].some(a => /^🗓️ A trilha começa em 26\/10/.test(a.text)) && sch['2026-10-21'].find(a => a.d === 'ANKI').done === true && sch['2026-10-21'].find(a => a.d === 'GYM').done === true && sch['2026-10-21'].some(a => a.text === 'Dentista (meu)' && a.done) && sch['2026-10-21'].find(a => a.d === 'AMB').text === '🚑 Plantão 13h–18h', JSON.stringify(sch['2026-10-21']));
        check('SÁB 24/10 gravado com o PLAN antigo e um bloco que ela criou ("Caminhada na praia (minha)", etiqueta academia): vira Anki ✓ + nota + lazer, sem PLAN, e o bloco dela fica com o ✓', sch['2026-10-24'].map(a => a.d + (a.done ? '✓' : '')).join() === 'ANKI✓,EXTRA,LAZER,GYM✓' && sch['2026-10-24'][3].text === 'Caminhada na praia (minha)', JSON.stringify(sch['2026-10-24']));
        const arc = JSON.parse(await page.evaluate(() => localStorage.getItem('medplanner_schedule_archive_v1')) || '{}');
        check('os originais de 21/10, 23/10, 24/10 e 28/10 ficam no arquivo', JSON.stringify(arc['2026-10-21'][0].list) === JSON.stringify(head21) && JSON.stringify(arc['2026-10-23'][0].list) === JSON.stringify(head23) && JSON.stringify(arc['2026-10-24'][0].list) === JSON.stringify(head24) && JSON.stringify(arc['2026-10-28'][0].list) === JSON.stringify(head28), Object.keys(arc).join());
        check('SEX 23/10 gravada com o simulado religado (prova + correção): vira Anki ✓ + plantão + nota + academia + lazer — sem D7', sch['2026-10-23'].map(a => a.d + (a.done ? '✓' : '')).join() === 'ANKI✓,AMB,EXTRA,GYM,LAZER', JSON.stringify(sch['2026-10-23'].map(a => a.d)));
        const s28 = sch['2026-10-28'] || [];
        check('QUA 28/10 (dia da T1 gravado na versão anterior com a consulta dela e uma etapa antiga): fica com o Anki ✓, a "Consulta psiquiatra 16h", a academia e o lazer; sai a etapa antiga (CIR2 · questões) e entram as do plano novo daquele dia', s28.find(a => a.d === 'ANKI').done === true && s28.some(a => a.text === 'Consulta psiquiatra 16h') && !s28.some(a => a.tm === 14) && STG.every(ts => Object.entries(cfg.trilhaPlan).filter(([, p]) => p[ts] === '2026-10-28').every(([id]) => s28.some(a => a.tm === Number(id) && a.ts === ts))) && s28[s28.length - 1].d === 'LAZER', JSON.stringify(s28.map(a => a.d + (a.tm ? '#' + a.tm + a.ts : ''))));
        check('a lista de 21/10 gravada pela versão anterior (Trilha desde 20/10) não entra no dia leve histórico da Sem.41: config.trilhaLegacyOv[21/10] = null (vale o gerado do curso, como no app de antes da Trilha)', cfg.trilhaLegacyOv && cfg.trilhaLegacyOv['2026-10-21'] === null, JSON.stringify(cfg.trilhaLegacyOv || {}));
        await navWeek(page, -1); await clickDate(page, '23/10'); const s23 = await readDay(page);
        check('na tela, SEX 23/10: sem simulado, sem botão do simulado, sem campo de % e sem ⚠️/📚 de carga', !s23.blocks.some(H.transStage) && !s23.simBtn && !s23.warn.length && !s23.blocks.some(b => (b.pctInputs || []).length), fmt(s23) + ' | ' + s23.warn.join());
        await clickDate(page, '21/10'); const q21 = await readDay(page); console.log(fmt(q21));
        check('na tela, QUA 21/10: Anki ✓, 🚑 Plantão 13h–18h, nota, academia ✓, lazer, Dentista ✓ — nenhuma etapa', q21.blocks.map(b => b.tag + (b.done ? '✓' : '')).join() === 'ANKI✓,AMB,EXTRA,GYM✓,LAZER,EXTRA✓' && !q21.blocks.some(H.transStage), q21.blocks.map(b => b.tag + (b.done ? '✓' : '')).join());
        await page.evaluate(() => { const c = JSON.parse(localStorage.getItem('medplanner_config_v1')); c.manualWeek = null; localStorage.setItem('medplanner_config_v1', JSON.stringify(c)); });
        const schB = JSON.stringify(await getLS(page, SCH)), arcB = await page.evaluate(() => localStorage.getItem('medplanner_schedule_archive_v1'));
        page = await S.reopen('2026-10-27');
        check('abrir de novo (27/10) não reescreve nem arquiva de novo os dias de transição', JSON.stringify(await getLS(page, SCH)) === schB && (await page.evaluate(() => localStorage.getItem('medplanner_schedule_archive_v1'))) === arcB);
    });
    // ── TR16d · edição feita na prévia da versão anterior ANTES de 20/10 (nada congelado): sem migração da config, mas os dias com etapa antiga são limpos ──
    await scenario(browser, 'TR16d-inicio-2610-previa-editada', '2026-10-26', { [CFG]: { ...baseCfg }, [SCH]: { '2026-10-21': head21, '2026-10-28': head28 } }, async (S) => {
        const page = S.page; const cfg = await getLS(page, CFG); const sch = await getLS(page, SCH);
        check('sem dado antigo da trilha na config: nenhum trilhaDescartes, mas trilhaInicio = 26/10 e os dias 21/10 (transição) e 28/10 (T1) limpos da etapa antiga (a consulta dela fica)', !cfg.trilhaDescartes && cfg.trilhaInicio === '2026-10-26' && !sch['2026-10-21'].some(a => a.tm != null) && !sch['2026-10-28'].some(a => a.tm === 14) && sch['2026-10-28'].some(a => a.text === 'Consulta psiquiatra 16h'), JSON.stringify([cfg.trilhaInicio, Object.keys(sch)]));
        await clickDate(page, '28/10'); const q = await readDay(page);
        check('QUA 28/10 mostra as etapas do plano novo (questões de CIR1 · Trauma I e aula de CIR1 · Trauma II), não a etapa antiga de CIR2', q.blocks.some(b => b.tm === 5 && b.ts === 'quest') && q.blocks.some(b => b.tm === 6 && b.ts === 'aula') && !q.blocks.some(b => b.tm === 14 && b.ts === 'quest'), fmt(q));
    });
    // ── TR16g · arquivo ilegível (ex.: backup importado com a chave corrompida): sem arquivo, nenhum dia gravado muda; o registro da Sem.41 vale já; a etapa que sobrou num dia de transição não "move" o plano; com o arquivo de volta, a limpeza roda ──
    await scenario(browser, 'TR16g-inicio-arquivo-ilegivel', '2026-10-26', {}, async (S) => {
        let page = S.page; const cfg = await getLS(page, CFG); const sch = await getLS(page, SCH);
        check('arquivo ilegível ("{corrompido"): fica como estava, e 21/10 e 28/10 continuam como ela deixou (nada sai sem arquivo)', (await page.evaluate(() => localStorage.getItem('medplanner_schedule_archive_v1'))) === '{corrompido' && JSON.stringify(sch['2026-10-21']) === JSON.stringify(head21) && JSON.stringify(sch['2026-10-28']) === JSON.stringify(head28), JSON.stringify(Object.keys(sch)));
        check('mesmo sem arquivo, o registro da Sem.41 é feito (trilhaLegacyOv = { 20/10: null, 21/10: null }) e trilhaInicio ainda não (a limpeza tenta de novo)', cfg.trilhaLegacyOv && cfg.trilhaLegacyOv['2026-10-20'] === null && cfg.trilhaLegacyOv['2026-10-21'] === null && cfg.trilhaInicio === undefined, JSON.stringify([cfg.trilhaLegacyOv, cfg.trilhaInicio]));
        await navWeek(page, -1); await clickDate(page, '21/10');
        await page.evaluate(() => { const e = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === '✎ Reorganizar dia'); if (e) e.click(); }); await page.waitForTimeout(250);
        const opts = await page.evaluate(() => { const blocks = [...document.querySelectorAll('div')].filter(el => el.style && /^3px solid/.test(el.style.borderLeft)); const el = blocks.find(b => /^Trilha · CIR1 — Trauma I/.test((b.innerText || '').trim().split('\n').find(t => /Trilha ·/.test(t)) || '')); if (!el) return null; const sel = [...el.querySelectorAll('select')].find(s => [...s.options].some(o => /mover p\/ dia/.test(o.textContent))); return sel ? [...sel.options].map(o => o.value + '=' + o.textContent.trim()) : []; });
        check('QUA 21/10 (etapa antiga que sobrou, mostrada como nota): "→ mover p/ dia" só oferece dias da própria semana de transição — nenhum dia da Trilha (≥ 26/10)', Array.isArray(opts) && opts.length > 1 && !opts.some(o => /2026-1[01]-\d\d/.test(o) && (o.match(/2026-1[01]-\d\d/)[0] >= '2026-10-26')) && !opts.some(o => /(26|27|28|29|30|31)\/10|0[12]\/11/.test(o)), JSON.stringify(opts));
        await page.evaluate(() => localStorage.setItem('medplanner_schedule_archive_v1', '"texto"')); page = await S.reopen('2026-10-26');
        check('arquivo que não é um objeto ("texto"): também fica como estava, e nada muda nos dias', (await page.evaluate(() => localStorage.getItem('medplanner_schedule_archive_v1'))) === '"texto"' && JSON.stringify((await getLS(page, SCH))['2026-10-21']) === JSON.stringify(head21) && (await getLS(page, CFG)).trilhaInicio === undefined);
        await page.evaluate(() => localStorage.setItem('medplanner_schedule_archive_v1', '{}')); page = await S.reopen('2026-10-26');
        const cfg2 = await getLS(page, CFG), sch2 = await getLS(page, SCH), arc2 = JSON.parse(await page.evaluate(() => localStorage.getItem('medplanner_schedule_archive_v1')));
        check('com o arquivo legível de novo: 21/10 vira dia de transição, 28/10 perde só a etapa antiga, os originais vão para o arquivo e trilhaInicio = 26/10', !sch2['2026-10-21'].some(a => a.tm != null) && sch2['2026-10-21'].some(a => a.pc) && !sch2['2026-10-28'].some(a => a.tm === 14) && sch2['2026-10-28'].some(a => a.text === 'Consulta psiquiatra 16h') && JSON.stringify(arc2['2026-10-21'][0].list) === JSON.stringify(head21) && JSON.stringify(arc2['2026-10-28'][0].list) === JSON.stringify(head28) && cfg2.trilhaInicio === '2026-10-26', JSON.stringify([Object.keys(arc2), cfg2.trilhaInicio]));
    }, { raw: { 'medplanner_schedule_archive_v1': '{corrompido', [CFG]: JSON.stringify({ ...oldCfg }), [SCH]: JSON.stringify({ '2026-10-21': head21, '2026-10-28': head28 }) } });
    // ── TR16e · a versão anterior ficou aberta e congelou também a semana de 27/10 (o merge veio depois): tudo do calendário antigo sai, a T1 volta a 5, 6, 14 ──
    const oldW27 = { q: 3, base: 4, held: true, why: 'fechamento', mods: [19, 24, 32], adv: [], rise: [], short: 0, light: '2026-10-31', at: '2026-10-27' };
    const plan27 = {}; [19, 24, 32].forEach((id, i) => { const d = { aula: '2026-10-2' + (8 + i), quest: '2026-10-30', apost: '2026-10-31', seal: '2026-11-0' + (2 + i) }; plan27[id] = { wk: '2026-10-27', via: 'ramp', ...d, orig: { ...d }, hist: [] }; });
    await scenario(browser, 'TR16e-inicio-semana-27-congelada', '2026-10-27', { [CFG]: { ...oldCfg, trilhaWeeks: { '2026-10-20': oldW, '2026-10-27': oldW27 }, trilhaPlan: { ...oldPlan, ...plan27 }, trilhaRevFull: { '2026-10-29': true } } }, async (S) => {
        const cfg = await getLS(S.page, CFG); const dsc = (cfg.trilhaDescartes || [])[0] || {};
        check('as semanas de 20/10 e de 27/10 e os 6 planos da versão anterior vão para trilhaDescartes (com o "dia cheio" antigo); só existe a T1 de 26/10, com 5, 6, 14 — a fila não muda', JSON.stringify(Object.keys(dsc.trilhaWeeks || {}).sort()) === '["2026-10-20","2026-10-27"]' && Object.keys(dsc.trilhaPlan || {}).length === 6 && dsc.trilhaRevFull && !cfg.trilhaRevFull && Object.keys(cfg.trilhaWeeks).join() === '2026-10-26' && JSON.stringify(cfg.trilhaWeeks['2026-10-26'].mods) === '[5,6,14]' && !Object.values(cfg.trilhaPlan).some(p => p.wk !== '2026-10-26'), JSON.stringify([Object.keys(cfg.trilhaWeeks), cfg.trilhaWeeks['2026-10-26'], Object.keys(cfg.trilhaPlan)]));
        check('1º acesso na versão nova em 27/10: 7 de 8 dias ⇒ round(2,625) = 3 (cota cheia, sem proporcional gravada)', cfg.trilhaFirstOpen === '2026-10-27' && cfg.trilhaWeeks['2026-10-26'].q === 3 && !cfg.trilhaWeeks['2026-10-26'].prop, JSON.stringify(cfg.trilhaWeeks['2026-10-26']));
    });
    // ── TR16f · módulo começado na versão anterior fora das 3 da T1 (Adiantar: aula de CIR2 Cicatrização feita em 23/10): entra logo, sem esperar a vez ──
    await scenario(browser, 'TR16f-inicio-modulo-comecado', '2026-10-26', { [CFG]: { ...oldCfg, trilhaWeeks: { '2026-10-20': { ...oldW, adv: [19] } }, trilhaPlan: { ...oldPlan, 19: { wk: '2026-10-20', via: 'adv', aula: '2026-10-23', quest: '2026-10-24', apost: '2026-10-25', seal: '2026-10-28', orig: { aula: '2026-10-23', quest: '2026-10-24', apost: '2026-10-25', seal: '2026-10-28' }, hist: [] } } }, [TRL]: { 19: { aula: true, aulaAt: '2026-10-23' } } }, async (S) => {
        const cfg = await getLS(S.page, CFG); const p = cfg.trilhaPlan[19] || {};
        check('o 19 (aula feita) entra na T1 e continua a cadeia já: questões a partir de 26/10, no máximo 7 dias depois da aula (âncora atrasada), apostila e selagem em ordem', JSON.stringify(cfg.trilhaWeeks['2026-10-26'].mods) === '[19,5,6]' && p.aula === '2026-10-23' && p.quest >= '2026-10-26' && dd(p.aula, p.quest) <= 7 && p.apost > p.quest && p.seal > p.apost, JSON.stringify([cfg.trilhaWeeks['2026-10-26'].mods, p]));
    });
    // ── TR16b · registro preservado: módulo com etapa marcada na versão anterior não reabre (o que fez fica); módulo fechado não volta à fila ──
    await scenario(browser, 'TR16b-inicio-2610-registro-preservado', '2026-10-26', { [CFG]: oldCfg, [TRL]: { 6: { aula: true, aulaAt: '2026-10-22' }, 14: { aula: true, aulaAt: '2026-10-21', questoesD2: true, questoesD2At: '2026-10-22', apostila: true, apostilaAt: '2026-10-23', smartcard: true, smartcardAt: '2026-10-25', completedAt: '2026-10-25' } } }, async (S) => {
        const page = S.page; const cfg = await getLS(page, CFG); const tr = await getLS(page, TRL);
        check('trail_v1 intocado (o registro de 6 e de 14 fica como estava)', tr[6].aula === true && tr[6].aulaAt === '2026-10-22' && tr[14].completedAt === '2026-10-25' && Object.keys(tr).join() === '6,14', JSON.stringify(tr));
        const W = cfg.trilhaWeeks['2026-10-26'] || {};
        check('T1 = { q 3, mods [6, 5, 19] }: o 14 (fechado) não volta; o 6 (começado) vem à frente e continua com o que já fez; os outros seguem a ordem da fila', W.q === 3 && JSON.stringify(W.mods) === '[6,5,19]', JSON.stringify(W));
        const p6 = cfg.trilhaPlan[6];
        check('CIR1 · Trauma II: a aula fica no dia em que foi feita (22/10) e as questões/apostila/selagem vêm de 26/10 em diante, em ordem', p6.aula === '2026-10-22' && p6.quest >= '2026-10-26' && p6.apost > p6.quest && p6.seal > p6.apost && !cfg.trilhaPlan[14], JSON.stringify(p6));
        await navWeek(page, -1); await clickDate(page, '22/10'); const qi = await readDay(page);
        check('QUI 22/10 (transição): a aula feita não aparece como etapa do dia (nem como nota; o registro fica no card)', !qi.blocks.some(H.transStage), fmt(qi));
        const t = await trilhaRows(page);
        check('aba Trilha: 1 fechado (CIR2 Urologia, do registro)', /1\nFechados na Trilha/.test(t.counts), t.counts.slice(0, 160));
    });

    await browser.close();
    H.summary('trilha');
})();
