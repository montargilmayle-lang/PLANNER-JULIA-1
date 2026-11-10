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
    const map = {}; const year = (dm) => (dm.slice(3) <= '06' ? '2027' : '2026') + '-' + dm.slice(3) + '-' + dm.slice(0, 2); // jan–jun = 2027 (cauda até 28/06/2027; §10.1 a, testes I1)
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
        await navWeek(page, 1); const h53 = await headerWeek(page); const t53 = await listDayTabs(page); const b53 = await bodyText(page); const c1 = await readWeekT(page);
        const seals = Object.entries(c1).flatMap(([d, x]) => x.blocks.filter(b => b.ts === 'seal' && !b.au).map(b => d + ' ' + (b.mod || '').split(' · ')[0])); // a prévia de 19/10 tem etapa em janeiro: teto por etapa + decisão 7 (selagens até 03/01)
        check('▶ além da Sem.52 vai para a C1 = Sem.53, SÁB 02/01 a SEG 04/01 (3 abas, badge "Janeiro · C1"), porque a prévia de 19/10 tem selagem em janeiro (HEM1 em 03/01, pela decisão 7)', h53.week === 53 && h53.range === '02/01–04/01' && t53.map(t => t.code + ' ' + t.date).join() === 'SAB 02/01,DOM 03/01,SEG 04/01' && /Janeiro · C1/.test(b53) && seals.includes('03/01 HEM1'), JSON.stringify([h53, t53.map(t => t.code + ' ' + t.date), seals]));
        await navWeek(page, 1); const h54 = await headerWeek(page);
        check('▶ além da última semana visível (a C1) fica nela', h54.week === 53, JSON.stringify(h54));
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
        check('aba Trilha na transição: "No ritmo atual cabem 32 módulos" (1 aula por dia: a T2 fica com 1 "não coube"; K: a T3 com 1 "espera"; teto por etapa: as selagens de PED2 e HEM1 vão para janeiro e saem da conta "até 01/01" — o S5 troca a conta) e a rampa tem 10 semanas, T1 = 26/10–02/11, todas editáveis (nada congelado)', /cabem 32 módulos/.test(t.counts) && (t.ramp.match(/^T\d+ · /gm) || []).length === 10 && /T1 · 26\/10–02\/11/.test(t.ramp) && /T10 · 29\/12–01\/01/.test(t.ramp) && !/congelada/.test(t.ramp), t.ramp.split('\n').slice(0, 6).join(' | '));
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
        check('proposta de recolocar (nada gravado antes do Aplicar)', /💡 CIR1 · Trauma II — Abdome, Pelve e TCE · apostila/.test(pv.text) && pv.btns.includes('Aplicar') && pv.btns.includes('Cancelar') && (await getLS(page, CFG)).trilhaPlan[6].apost === '2026-10-30');
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
        check('"No ritmo atual cabem N módulos até 01/01/2027" com N = 32 (rampa 3·4·4·4·4·4·4·5·4·0; 1 aula por dia: T2 "1 não coube"; K: T3 "1 espera"; teto por etapa: selagens de PED2 e HEM1 em janeiro, fora da conta "até 01/01" até o S5) e a linha de alcance depois do #32', N === 32 && t.lineAfter === 32 && /LINHA DE ALCANCE — até 01\/01: 32 módulos/.test(t.line), t.counts.split('\n').slice(0, 6).join(' | '));
        check('contagem: fechados 0 · dentro 32 · fora ' + (t.rows.length - 32), /0\nFechados na Trilha/.test(t.counts) && /32\nDentro do alcance/.test(t.counts) && new RegExp((t.rows.length - 32) + '\\nFora').test(t.counts), t.counts.slice(0, 160));
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
        const t8row = await page.evaluate(() => ((document.querySelector('[data-t="trilha-ramp"] [data-tue="2026-12-15"]') || {}).innerText || '').replace(/\n/g, ' '));
        check('+ na T8 (15/12) ⇒ trilhaRamp[15/12] = 6; com 1 aula por dia a 6ª aula não cabe na T8 (15, 16, 17, 19 e 20/12 já têm aula; 18/12 é simulado e 21/12 o dia leve) e o gatilho estrito não vale ⇒ a linha da T8 diz "1 não coube" e a conta fica (' + rampBefore + ' → ' + t3.counts.match(/cabem (\d+)/)[1] + ')', cfgC.trilhaRamp && cfgC.trilhaRamp['2026-12-15'] === 6 && Number(t3.counts.match(/cabem (\d+)/)[1]) === Number(rampBefore) && /1 não coube/.test(t8row), JSON.stringify(cfgC.trilhaRamp) + ' · ' + t8row);
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
        check('T2 congelada: trilhaWeeks[03/11] = { q: 4, base: 4, held: false, mods: [19, 24, 32], short 1 } (a T1 de 8 dias fechou; 1 aula por dia: o 4º não coube — 03/11 plantão longo, a cadeia por 04 ou 05/11 passaria de 14,5h em 05/11, 06/11 simulado, 07/11 dia leve, 09/11 com aula e plantão; o gatilho estrito só valeu para a 2ª aula de 08/11)', W.q === 4 && W.base === 4 && W.held === false && JSON.stringify(W.mods) === '[19,24,32]' && W.short === 1 && !W.shortWhy, JSON.stringify(W));
        check('sem ⏳ (tudo marcado até 02/11)', !(await banner(page, 'trilha-pending')));
        const w = await readWeekT(page); Object.values(w).forEach(d => console.log(fmt(d)));
        const ter = w['03/11'], sex = w['06/11'];
        check('TER 03/11 (plantão longo): só 🚑, Anki no trajeto, áudio, academia opcional e jantar/sono — nenhuma etapa de mesa', ter.blocks.every(b => b.tag === 'AMB' || b.tag === 'ANKI' || b.au || b.tag === 'GYM' || b.tag === 'LAZER') && !ter.blocks.some(b => b.tm != null && !b.au), ter.blocks.map(b => b.tag).join(','));
        check('SEX 06/11: SIMULADO + CORREÇÃO, nenhuma etapa de módulo, botão "🎯 Simulado marcado nesta sexta"', has(sex, /SIMULADO NA ÍNTEGRA \(quinzenal\): manhã/) && has(sex, /CORREÇÃO DO SIMULADO/) && !sex.blocks.some(b => b.tm != null) && /🎯 Simulado marcado nesta sexta/.test(sex.simBtn || ''));
        const map = await trailMap(page, 2);
        const bad = Object.entries(map).filter(([, m]) => ['2026-11-03', '2026-11-06', '2026-11-10', '2026-11-12'].some(d => Object.values(m).includes(d)));
        check('nenhuma etapa em 03/11, 06/11, 10/11 e 12/11 (plantões longos e simulado)', !bad.length, JSON.stringify(bad));
        const okChain = [19, 24, 32].every(id => { const m = map[id] || {}; return m.aula && m.quest && m.apost && m.seal && !Object.keys(m).some(k => /_dup/.test(k)) && dd(m.aula, m.quest) >= 1 && dd(m.aula, m.quest) <= 2 && dd(m.quest, m.apost) >= 1 && dd(m.quest, m.apost) <= 2 && dd(m.apost, m.seal) >= 2 && dd(m.apost, m.seal) <= 5; }); // 1 aula por dia (S3b): a T2 abre 3
        check('módulos novos (19, 24, 32): 4 etapas em dias distintos, dentro das faixas', okChain, JSON.stringify([19, 24, 32].map(id => [id, map[id]])));
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
        const inWin = (ts, d) => d == null || (d >= '2026-12-29' && (ts !== 'aula' || d <= '2027-01-01')); // regra de 01/01 (S3b; DELA 8): aula só até 01/01; questões, apostila e selagem podem ir para janeiro
        check('etapas abertas de 6, 14 e 19 recolocadas a partir de 29/12 — aula até 01/01; questões, apostila e selagem podem ir para janeiro (ou sem dia) — com hist "final"', [6, 14, 19].every(id => STG.every(ts => (tr5[id] && tr5[id][FIELD[ts]]) || inWin(ts, P[id][ts]))) && [6, 14, 19].every(id => (P[id].hist || []).some(h => h.why === 'final')), JSON.stringify([6, 14, 19].map(id => [id, P[id].hist])));
        check('nada em ordem errada: datas crescentes na cadeia de cada módulo', [6, 14, 19].every(id => { const ds = STG.map(ts => (tr5[id] && tr5[id][STAMP[ts]]) || P[id][ts]).filter(Boolean); return ds.every((d, i) => i === 0 || d > ds[i - 1]); }));
        const log = cfg.trilhaFinalLog || {}; const fin = await banner(page, 'trilha-final');
        check('aviso 📦 da semana final com o que mudou e a carga dia a dia, de 29/12 até o último dia com etapa das cadeias abertas (janeiro inclusive; X23, sem "01/01 só selagem")', !!fin && /📦 Semana final \(29\/12\)/.test(fin.text) && /Carga dia a dia: TER 29\/12 [\d,]+h · QUA 30\/12 [\d,]+h · QUI 31\/12 [\d,]+h · SEX 01\/01 [\d,]+h( · (SÁB|DOM|SEG|TER|QUA|QUI|SEX) \d\d\/01 [\d,]+h)*\.$/.test(fin.text.trim()) && !/só selagem/.test(fin.text), fin && fin.text);
        const w = await readWeekT(page); Object.values(w).forEach(d => console.log(fmt(d)));
        check('nenhuma aula no dia leve (29/12) nem no feriado 31/12; nenhum módulo novo na semana', !w['29/12'].blocks.some(b => b.ts === 'aula' && !b.au) && !w['31/12'].blocks.some(b => b.ts === 'aula') && !Object.values(w).some(d => d.blocks.some(b => b.tm != null && ![5, 6, 14, 19].includes(b.tm))));
        check('TER 29/12: bloco 📦 da última semana de aula nova (X05: o que segue em janeiro e o que continua disponível; nada a exportar)', has(w['29/12'], /^📦 Última semana de aula nova \(até 01\/01\)/) && !has(w['29/12'], /Exportar/));
        check('QUI 31/12: feriado mais leve (🎄, 📚 a partir de 3h)', /🎄 Feriado \(véspera de Ano-Novo\) — dia mais leve, só o que couber sem estragar o dia · 📚 a partir de 3h/.test(w['31/12'].dayType), w['31/12'].dayType);
        const sexta = w['01/01'];
        check('SEX 01/01 é dia comum (aceita qualquer etapa) e sem simulado pela regra: 🏁 "Último dia de aula nova…" (X06), botão "01/01 — último dia de aula nova" (X32), dayType "Último dia de aula nova — sem simulado pela regra…" (X07)', has(sexta, /^🏁 Último dia de aula nova: confira as cadeias que seguem abertas para janeiro · 💾 backup do app — o balanço das aulas está na aba Trilha$/) && !has(sexta, /SIMULADO NA ÍNTEGRA/) && /01\/01 — último dia de aula nova: sem simulado pela regra/.test(sexta.simBtn || '') && /^Último dia de aula nova — sem simulado pela regra: etapas planejadas abaixo/.test(sexta.dayType), sexta.simBtn + ' | ' + sexta.dayType + ' | etapas: ' + sexta.blocks.filter(b => b.tm != null && !b.au).map(b => b.tm + ':' + b.ts).join(' '));
        // 💾 backup pelo banner 📦
        const [dl] = await Promise.all([page.waitForEvent('download'), clickIn(page, 'trilha-export', '💾 Baixar backup do app')]);
        const data = JSON.parse(require('fs').readFileSync(await dl.path(), 'utf8'));
        check('💾 pelo 📦: medplanner_last_backup = 29/12 e o arquivo traz medplanner_trail_v1', (await page.evaluate(() => localStorage.getItem('medplanner_last_backup'))) === '2026-12-29' && !!data.data['medplanner_trail_v1'], Object.keys(data.data).join(','));
        // ligar o simulado de 01/01 ⇒ a recolocação roda de novo (chave |1) e nenhuma etapa fica em 01/01
        await clickDate(page, '01/01'); await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /01\/01 — último dia de aula nova/.test(x.innerText)); b.click(); }); await page.waitForTimeout(400); // X32
        page = await S.reopen('2026-12-29');
        const cfgB = await getLS(page, CFG);
        const on0101 = Object.entries(cfgB.trilhaPlan).filter(([, p]) => STG.some(ts => p[ts] === '2027-01-01')).map(([id, p]) => id + ':' + STG.filter(ts => p[ts] === '2027-01-01').join('+')); console.log('   plano em 01/01 com o simulado religado:', on0101.join(' · ') || 'nada', '·', JSON.stringify(Object.fromEntries([6, 14, 19].map(id => [id, STG.map(ts => cfgB.trilhaPlan[id][ts]).join(' ')]))));
        const pendB = (await banner(page, 'trilha-pending')) || { text: '' }, aulas0101 = Object.entries(cfgB.trilhaPlan).filter(([id, p]) => p.aula === '2027-01-01' && !(tr5[id] || {}).aula).map(([id]) => id); // testes I3 (S3b): aula em 01/01 só de módulo sem outro dia até 01/01 (C4), e então como ⏳ "que virou simulado"
        check('simulado em 01/01 ligado ⇒ trilhaFinalAutoAt = "2026-12-29|1" e nenhuma questão, apostila ou selagem em 01/01; aula em 01/01 só de módulo sem outro dia até 01/01, como ⏳ "que virou simulado" (C4)', cfgB.trilhaFinalAutoAt === '2026-12-29|1' && !Object.values(cfgB.trilhaPlan).some(p => ['quest', 'apost', 'seal'].some(ts => p[ts] === '2027-01-01')) && (!aulas0101.length || /aula de SEX 01\/01, que virou simulado/.test(pendB.text)), cfgB.trilhaFinalAutoAt + ' · em 01/01: ' + (on0101.join(' · ') || 'nada'));
        // Adiantar na semana final = desfecho C (sem botão Aplicar)
        await markUntil(page, '2027-01-01'); page = await S.reopen('2026-12-29');
        const adv = await banner(page, 'trilha-adv');
        if (adv) { await clickIn(page, 'trilha-adv', '⏩ Adiantar próximo módulo'); }
        const adv2 = await banner(page, 'trilha-adv');
        check('Adiantar na semana final: "Semana de 29/12: o ⏩ não abre módulo novo (o ritmo desta semana é o da rampa: 0)." (X20 "final") e só "Fechar"', !!adv2 && /Semana de 29\/12: o ⏩ não abre módulo novo \(o ritmo desta semana é o da rampa: 0\)\./.test(adv2.text) && !adv2.btns.includes('Aplicar') && adv2.btns.includes('Fechar'), adv2 && adv2.text);
        S.lastLS = await page.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
        // TR5b · 02/01/2027 (cauda; regra de 01/01, S2): o Cronograma abre na C1 ("Janeiro · C1"), ainda com a tela de encerramento (o balanço muda no S5);
        // a C1 congela (q 0) e o trilhaPlan não muda; "nada mais é gravado" passa para o dia depois do fim da cauda (horizonte de revisões R-a, §2.2 e §5)
        page = await S.reopen('2027-01-02');
        const bal = await banner(page, 'trilha-balanco');
        check('TR5b 02/01/2027: o Cronograma mostra a tela de encerramento com o balanço (fechados com %, fora do alcance, lembrete do backup)', !!bal && /🏁 Encerramento da Trilha \(26\/10\/2026 → 01\/01\/2027\)/.test(bal.text) && /Módulos fechados \(as 4 etapas\): \d+/.test(bal.text) && /✓ CIR1 · Trauma I/.test(bal.text) && /Fora do alcance \(seguem no novo cursinho a partir de 04\/01\)/.test(bal.text) && /💾 Lembrete/.test(bal.text), bal && bal.text.slice(0, 300));
        const hwC1 = await headerWeek(page), tabsC1 = await listDayTabs(page), bodyC1 = await bodyText(page);
        check('TR5b 02/01/2027: o Cronograma abre na C1 (Sem.53 = SÁB 02/01 a SEG 04/01, 3 abas) com o badge "Janeiro · C1" e sem "prévia — congela quando a semana começar"', hwC1.week === 53 && hwC1.range === '02/01–04/01' && tabsC1.map(t => t.code + ' ' + t.date).join() === 'SAB 02/01,DOM 03/01,SEG 04/01' && /Janeiro · C1/.test(bodyC1) && !/prévia — congela quando a semana começar/.test(bodyC1), JSON.stringify([hwC1, tabsC1.map(t => t.code + ' ' + t.date)]));
        const after = await page.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
        const cA = JSON.parse(after[CFG]), cB = JSON.parse(S.lastLS[CFG]); const chg = [...new Set(Object.keys(cA).concat(Object.keys(cB)))].filter(k => JSON.stringify(cA[k]) !== JSON.stringify(cB[k])); const C1 = (cA.trilhaWeeks || {})['2027-01-02'] || null;
        check('TR5b: em 02/01 a C1 congela com q 0 (nenhum módulo, sem dia leve previsto) e o trilhaPlan não muda — o config só ganha a C1 em trilhaWeeks; o registro não muda', JSON.stringify(chg) === '["trilhaWeeks"]' && !!C1 && C1.q === 0 && JSON.stringify(C1.mods) === '[]' && C1.light === null && JSON.stringify(Object.keys(cA.trilhaWeeks).filter(k => !(k in (cB.trilhaWeeks || {})))) === '["2027-01-02"]' && JSON.stringify(cA.trilhaPlan) === JSON.stringify(cB.trilhaPlan) && after[TRL] === S.lastLS[TRL], JSON.stringify({ chg, C1 }));
        // fim da cauda: cadeia aberta mantém a cauda viva (o simulado religado em 01/01 deixou etapas sem dia); ela fecha em 02/01 o que ficou aberto (carimbo 02/01) —
        // então o último lembrete é a revisão D+30 mais tardia (sem a R1: fechamento + 30) e, no dia seguinte, nada é gravado
        const trF = JSON.parse(after[TRL] || '{}'); const openIds = Object.keys(cA.trilhaPlan).filter(id => !STG.every(ts => (trF[id] || {})[FIELD[ts]]));
        openIds.forEach(id => { const r = (trF[id] = trF[id] || {}); STG.forEach(ts => { if (!r[FIELD[ts]]) { r[FIELD[ts]] = true; r[STAMP[ts]] = '2027-01-02'; } }); if (!r.completedAt) r.completedAt = '2027-01-02'; });
        await setLS(page, TRL, trF);
        const revEnd = Object.values(trF).filter(r => r.completedAt && !r.reviewD30Done && !r.r1DoneAt).map(r => addDays(r.completedAt, 30)).sort().pop() || null, dEnd = revEnd ? addDays(revEnd, 1) : null;
        check('TR5b (premissa): ' + Object.keys(cA.trilhaPlan).length + ' cadeias no plano, abertas em 02/01: ' + (openIds.join(', ') || 'nenhuma') + ' (fechadas por ela em 02/01); nenhuma revisão feita; último lembrete (D+30) = ' + (revEnd ? br(revEnd) : '—'), !!revEnd && Object.values(trF).every(r => !r.reviewD7Done && !r.reviewD30Done) && Object.keys(cA.trilhaPlan).every(id => STG.every(ts => (trF[id] || {})[FIELD[ts]])), 'abertas: ' + openIds.join(','));
        if (dEnd) { page = await S.reopen(dEnd); const lsEnd = await page.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
            check('TR5b: no dia depois do fim da cauda (' + br(dEnd) + ') nada é gravado (config igual ao de 02/01; registro igual ao que ela marcou)', lsEnd[CFG] === after[CFG] && JSON.stringify(JSON.parse(lsEnd[TRL])) === JSON.stringify(trF), lsEnd[CFG] === after[CFG] ? 'config igual' : 'config mudou: ' + Object.keys(JSON.parse(lsEnd[CFG])).filter(k => JSON.stringify(JSON.parse(lsEnd[CFG])[k]) !== JSON.stringify(cA[k])).join(',')); }
    });


    // ── Simulados na janela = exatamente 06/11 e 18/12 (20/11 e 04/12 caem em plantão; 01/01 sem simulado; 23/10, na transição, nem tem botão) ──
    await scenario(browser, 'TRsim-simulados-janela', '2026-10-19', {}, async (S) => {
        const page = S.page; await navWeek(page, 1); const sims = [], btn = {}; let nW = 0;
        for (let k = 0; k < 40; k++) { const h0 = await headerWeek(page); const w = await readWeekT(page); nW++; Object.entries(w).forEach(([d, x]) => { if (has(x, /SIMULADO NA ÍNTEGRA/)) sims.push(d); if (x.simBtn) btn[d] = x.simBtn; }); await navWeek(page, 1); if ((await headerWeek(page)).week === h0.week) break; } // até a última semana visível (§10.1 a; regra de 01/01, S3b)
        const jan = sims.filter(d => d.slice(3) === '01');
        check('simulados de 20/10 a 01/01 = exatamente 06/11 e 18/12; em janeiro, pela mesma quinzena, só 15/01 e 29/01 (se a semana estiver no calendário) — ' + nW + ' semanas lidas', sims.filter(d => d.slice(3) !== '01').join() === '06/11,18/12' && jan.every(d => ['15/01', '29/01'].includes(d)) && (!btn['08/01'] || /📚 Sexta de estudo ativo/.test(btn['08/01'])), sims.join());
        check('20/11 e 04/12: "Sexta de plantão: sem simulado pela regra"; 01/01: "último dia de aula nova: sem simulado pela regra" (X32); 23/10 (transição): sem botão', ['20/11', '04/12'].every(d => /Sexta de plantão: sem simulado pela regra/.test(btn[d] || '')) && /01\/01 — último dia de aula nova: sem simulado pela regra/.test(btn['01/01'] || '') && !btn['23/10'], JSON.stringify(btn));
    });

    // ── TR6 · fechar a semana pela interface e Adiantar (cadeia inserida nos dias, linha de alcance +1, Cancelar não grava) ──
    await scenario(browser, 'TR6-adiantar-cabe', '2026-10-26', {}, async (S) => {
        const cfg0 = await getLS(S.page, CFG); const T1 = cfg0.trilhaWeeks['2026-10-26'];
        const stagesT1 = []; Object.entries(cfg0.trilhaPlan).forEach(([id, p]) => STG.forEach(ts => { if (p[ts] >= '2026-10-26' && p[ts] <= '2026-11-02') stagesT1.push([Number(id), ts, p[ts]]); }));
        stagesT1.sort((a, b) => a[2] < b[2] ? -1 : 1); const last = stagesT1[stagesT1.length - 1];
        await markUntil(S.page, '2026-11-02', [[last[0], last[1]]]); await S.page.evaluate(() => { const t = JSON.parse(localStorage.getItem('medplanner_trail_v1') || '{}'); Object.values(t).forEach(r => Object.keys(r).forEach(k => { if (/At$/.test(k) && r[k] > '2026-10-28') r[k] = '2026-10-28'; })); localStorage.setItem('medplanner_trail_v1', JSON.stringify(t)); }); let page = await S.reopen('2026-10-28'); // premissa (S3b): ela marcou a T1 até hoje (28/10) — carimbo = min(data do bloco, hoje), a regra do app. Com o carimbo nos dias futuros planejados (28 e 30/10 com aula, 29/10 de plantão), a cadeia do #4 não caberia na semana com 1 aula por dia e o ⏩ daria B (B-P1 ganha de A-P2; DELA 2) — o TR7 cobre o B
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
        check('linha de alcance avança um: N ' + N0 + ' → ' + N1 + ' (N = 32 na prévia: 1 aula por dia, K e as selagens de janeiro fora da conta "até 01/01")', N1 === N0 + 1 && N0 === 32 && t1.lineAfter === N1, t1.line);
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
        check('na terça 03/11 a T2 abre os próximos da fila: mods [24, 32, 34], q 4 e 1 "não coube" (o adiantado não conta para fechar a semana; 1 aula por dia — a 4ª aula não cabe na T2)', W && JSON.stringify(W.mods) === '[24,32,34]' && W.q === 4 && W.short === 1 && !W.shortWhy, JSON.stringify(W));
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
        const cfgP = await getLS(page, CFG); // regra de 01/01 (S3b): 1 aula por dia + gatilho estrito no 🔓 (C1) — a 4ª aula da T2 não cabe (como no TR2): 04 e 05/11 passariam de 14,5h (plantões curtos), 08/11 já tem 2 aulas, 09/11 tem plantão (sem 2ª aula)
        check('🔓 "Ver proposta": #7 CIR3 Hérnias da Parede Abdominal não cabe com 1 aula por dia (X19 "cap": "não cabe nos dias desta semana sem quebrar os intervalos ou passar de 14,5h"), sem "Aplicar"', /#7 CIR3 Hérnias da Parede Abdominal: não cabe nos dias desta semana sem quebrar os intervalos ou passar de 14,5h/.test(pv.text) && !pv.btns.includes('Aplicar') && pv.btns.includes('Cancelar'), pv.text);
        await clickIn(page, 'trilha-rise', 'Cancelar');
        const cfg = await getLS(page, CFG); const W2 = cfg.trilhaWeeks['2026-11-03'];
        check('Cancelar: nada gravado — a T2 continua { q 3, held true } e o 34 fica fora do plano', JSON.stringify(cfg) === JSON.stringify(cfgP) && W2.q === 3 && W2.held === true && !cfg.trilhaPlan[34], JSON.stringify(W2));
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
        check('a proposta diz o módulo (código e título), o dia novo, o antigo e o intervalo fora da faixa (o SÁB 31/10 é o dia leve)', /CIR1 · Trauma I — Avaliação Inicial e Trauma de Tórax · apostila DOM 01\/11 \([\d,]+h\) \(antes: QUI 29\/10; 4 dias após as questões — fora de 1–2\)/.test(pv.text) && !/TER 03\/11/.test(pv.text), pv.text);
        await clickIn(page, 'trilha-pending', 'Aplicar');
        const p5 = (await getLS(page, CFG)).trilhaPlan[5];
        check('Aplicar: apostila 01/11 (orig 29/10), selagem recolocada, hist "recolocar"; nada em 03/11 (plantão longo)', p5.apost === '2026-11-01' && p5.orig.apost === '2026-10-29' && p5.hist.every(h => h.why === 'recolocar') && p5.seal !== '2026-11-03' && dd(p5.apost, p5.seal) >= 2 && dd(p5.apost, p5.seal) <= 5, JSON.stringify(p5));
        await clickDate(page, '29/10'); const qi = await readDay(page);
        check('QUI 29/10 guarda a linha "↷ Trilha · CIR1 — apostila recolocada para DOM 01/11"', has(qi, /^↷ Trilha · CIR1 — apostila recolocada para DOM 01\/11$/));
        check('o ⏳ some depois de Aplicar', !(await banner(page, 'trilha-pending')));
    });
    // ── TR9c · ⏳ recolocar com etapa marcada fora de ordem (aval do PR #18): CIR2 · Urologia tem as questões marcadas e a aula não. O módulo nunca fica de
    //    fora: aparece no aviso com as duas saídas (marcar a aula, ou o app propor a aula primeiro); cada linha da proposta traz código e título ──
    const seedGap = { 14: { questoesD2: true, questoesD2At: '2026-11-01' } };
    const gapCheck = async (page) => {
        const pend = await banner(page, 'trilha-pending');
        check('⏳: com dois módulos CIR1 pendentes, o topo nomeia o módulo com o título, uma vez para as etapas seguidas dele (o código sozinho confundiria)', !!pend && /Ficaram para trás \d+ etapas \(CIR1 · Trauma I — Avaliação Inicial e Trauma de Tórax · aula de SEG 26\/10, questões de QUA 28\/10, apostila de QUI 29\/10, selagem de DOM 01\/11, …\)/.test(pend.text), pend && pend.text.slice(0, 300));
        await clickIn(page, 'trilha-pending', 'Ver como recolocar'); const pv = await banner(page, 'trilha-pending'); console.log('   💡', pv.text.replace(/\n/g, ' '));
        const lines = ((pv.text.match(/💡 ([^\n]*)/) || [])[1] || '').split(' | ');
        check('cada linha da proposta traz código e título (CIR1 · Trauma I — …, CIR1 · Trauma II — …)', lines.length >= 2 && lines.every(l => /^(CIR1 · Trauma I — Avaliação Inicial e Trauma de Tórax|CIR1 · Trauma II — Abdome, Pelve e TCE|CIR2 · [^·]+) · /.test(l)), JSON.stringify(lines.map(l => l.slice(0, 70))));
        const gap = await page.evaluate(() => { const el = document.querySelector('[data-t="trilha-gap"]'); return el ? { id: el.getAttribute('data-id'), text: el.innerText, btns: [...el.querySelectorAll('button')].map(b => b.innerText.trim()) } : null; });
        check('CIR2 · Urologia (questões marcadas, aula não) não some: aviso "⚠️ CIR2 — Urologia tem questões marcadas, mas a aula não. Marque a aula se você a viu, ou o app propõe a aula primeiro." com as duas saídas', !!gap && gap.id === '14' && /⚠️ CIR2 — Urologia tem questões marcadas, mas a aula não\. Marque a aula se você a viu, ou o app propõe a aula primeiro\./.test(gap.text) && gap.btns.includes('Marquei a aula (carimbo SEX 30/10)') && gap.btns.includes('Propor a aula primeiro') && !/CIR2 · Urologia ·/.test(lines.join(' | ')) && !/não cabe/.test(pv.text), JSON.stringify(gap));
        return pv;
    };
    await scenario(browser, 'TR9c-recolocar-marca-fora-de-ordem-propor', '2026-10-26', {}, async (S) => {
        await setLS(S.page, TRL, seedGap); let page = await S.reopen('2026-11-04'); // 1º acesso 26/10; depois ela marca as questões de CIR2 · Urologia (01/11) sem a aula await clickTab(page, 'CRONOGRAMA');
        await gapCheck(page);
        const before = await getLS(page, CFG);
        await page.evaluate(() => { const b = [...document.querySelectorAll('[data-t="trilha-gap"] button')].find(x => /^Propor a aula primeiro$/.test(x.innerText.trim())); b.click(); }); await page.waitForTimeout(350);
        const pv2 = await banner(page, 'trilha-pending'); console.log('   💡', pv2.text.replace(/\n/g, ' '));
        check('"Propor a aula primeiro": a cadeia de CIR2 · Urologia é reaberta a partir da aula, mas com 1 aula por dia a aula não tem dia nos próximos 7 dias (04 e 05/11 ficam com as aulas de CIR1 · Trauma I e II; 06/11 simulado; 07/11 dia leve; 08/11 já tem 2 aulas e 09/11 uma; 10/11 plantão longo) ⇒ X17 "a aula não cabe nos próximos 7 dias com 1 aula por dia…", sem a linha ↺; nada gravado ainda', /CIR2 · Urologia: a aula não cabe nos próximos 7 dias com 1 aula por dia sem passar de 14,5h — mova o bloco da aula para o dia que quiser \(o app avisa se ela ficar como 2ª aula do dia\)\./.test(pv2.text) && !/↺ CIR2 · Urologia/.test(pv2.text) && !(await page.$('[data-t="trilha-gap"]')) && JSON.stringify(await getLS(page, CFG)) === JSON.stringify(before), pv2.text.slice(0, 600));
        await clickIn(page, 'trilha-pending', 'Aplicar');
        const p14 = (await getLS(page, CFG)).trilhaPlan[14], t14 = (await getLS(page, TRL))[14], c14 = await getLS(page, CFG);
        check('Aplicar grava só as propostas com dia (CIR1 · Trauma I e II, hist "recolocar"); CIR2 · Urologia fica como estava: aula 30/10 (⏳), questões marcadas (01/11), sem histórico', p14.aula === '2026-10-30' && JSON.stringify(p14.hist) === '[]' && t14.questoesD2 === true && t14.questoesD2At === '2026-11-01' && !t14.aula && [5, 6].every(id => c14.trilhaPlan[id].hist.some(h => h.why === 'recolocar')), JSON.stringify({ p14, t14 }));
    });
    await scenario(browser, 'TR9c-recolocar-marca-fora-de-ordem-marcar', '2026-10-26', {}, async (S) => {
        await setLS(S.page, TRL, seedGap); let page = await S.reopen('2026-11-04'); await clickTab(page, 'CRONOGRAMA');
        await gapCheck(page);
        await page.evaluate(() => { const b = [...document.querySelectorAll('[data-t="trilha-gap"] button')].find(x => /^Marquei a aula/.test(x.innerText.trim())); b.click(); }); await page.waitForTimeout(400);
        const t14 = (await getLS(page, TRL))[14], pv = await banner(page, 'trilha-pending');
        check('"Marquei a aula": a aula fica marcada com o carimbo do dia planejado (SEX 30/10, antes das questões); o aviso some e CIR2 · Urologia entra na proposta pelo que falta (apostila e selagem)', t14.aula === true && t14.aulaAt === '2026-10-30' && !(await page.$('[data-t="trilha-gap"]')) && /CIR2 · Urologia · apostila/.test(pv.text), JSON.stringify({ t14, pv: pv && pv.text.slice(0, 300) }));
    });
    // ── TR9c (regra de 01/01, S3b; §10.1 a, RM9, X16): depois de 01/01, com a aula em "missing", só "Marquei a aula (carimbo …)" — sem "Propor a aula primeiro" (seria aula nova);
    //    com questões e selagem marcadas e a apostila não, "Propor a apostila primeiro" continua e propõe dias em janeiro ──
    const gapT9 = (dt) => { const x = { aula: dt[0], quest: dt[1], apost: dt[2], seal: dt[3] }; return { wk: '2026-12-22', via: 'ramp', ...x, orig: { ...x }, hist: [] }; };
    const cfgGap = { ...baseCfg, trilhaFirstOpen: '2026-10-26', trilhaWeeks: { '2026-12-22': { q: 2, base: 4, held: false, why: null, mods: [26, 27], adv: [], rise: [], short: 0, light: '2026-12-26', at: '2026-12-22' } }, trilhaPlan: { 26: gapT9(['2026-12-27', '2026-12-28', '2026-12-30', '2027-01-02']), 27: gapT9(['2026-12-28', '2026-12-30', '2027-01-01', '2027-01-03']) } };
    const trGap = { 26: { questoesD2: true, questoesD2At: '2026-12-30' }, 27: { aula: true, aulaAt: '2026-12-28', questoesD2: true, questoesD2At: '2026-12-30', smartcard: true, smartcardAt: '2027-01-02' } };
    await scenario(browser, 'TR9c-0301-aula-sem-marca-depois-de-0101', '2027-01-03', { [CFG]: cfgGap, [TRL]: trGap }, async (S) => {
        const page = S.page; await clickIn(page, 'trilha-pending', 'Ver como recolocar'); const pv = await banner(page, 'trilha-pending'); console.log('   💡', pv.text.replace(/\n/g, ' '));
        const gaps = await page.evaluate(() => [...document.querySelectorAll('[data-t="trilha-gap"]')].map(el => ({ id: el.getAttribute('data-id'), text: el.innerText, btns: [...el.querySelectorAll('button')].map(b => b.innerText.trim()) })));
        const g26 = gaps.find(g => g.id === '26'), g27 = gaps.find(g => g.id === '27');
        check('03/01 · PED2 (questões marcadas, aula não): X16 "⚠️ PED2 — Aleitamento Materno tem questões marcadas, mas a aula não. Se você assistiu, marque a aula no bloco do dia em que assistiu (aula nova só até 01/01)." — só "Marquei a aula (carimbo …)", sem "Propor a aula primeiro"', !!g26 && /^⚠️ PED2 — Aleitamento Materno tem questões marcadas, mas a aula não\. Se você assistiu, marque a aula no bloco do dia em que assistiu \(aula nova só até 01\/01\)\./.test(g26.text) && g26.btns.length === 1 && /^Marquei a aula \(carimbo /.test(g26.btns[0]) && !gaps.some(g => g.btns.some(b => /^Propor a aula primeiro$/.test(b))), JSON.stringify(gaps));
        check('03/01 · HEM1 (selagem marcada, apostila não): o texto de sempre e "Propor a apostila primeiro" continua (RM9: o botão só some com a aula em missing)', !!g27 && /⚠️ HEM1 — Anemias I — Ferropriva, Megaloblástica, Doença Crônica tem selagem marcada, mas a apostila não\. Marque a apostila se você a fez, ou o app propõe a apostila primeiro\./.test(g27.text) && g27.btns.includes('Propor a apostila primeiro'), JSON.stringify(g27));
        await page.evaluate(() => { const b = [...document.querySelectorAll('[data-t="trilha-gap"][data-id="27"] button')].find(x => /^Propor a apostila primeiro$/.test(x.innerText.trim())); b.click(); }); await page.waitForTimeout(350);
        const pv2 = await banner(page, 'trilha-pending'); console.log('   💡', pv2.text.replace(/\n/g, ' '));
        check('03/01 · "Propor a apostila primeiro": a cadeia de HEM1 reabre a partir da apostila, com dia em janeiro (teto por etapa), e diz que a selagem marcada fica', /💡 HEM1 · Anemias I — Ferropriva, Megaloblástica, Doença Crônica · apostila \S+ \d\d\/01 /.test(pv2.text) && /↺ HEM1 · Anemias I — Ferropriva, Megaloblástica, Doença Crônica: cadeia reaberta a partir de a apostila — selagem \(já marcada\) fica como está/.test(pv2.text), pv2.text.slice(0, 700));
    });
    // ── TR11 · mover etapa da Trilha com aviso de espaçamento (pode cruzar semanas; grava no plano, não materializa dias) ──
    const moveT = async (page, blockRe, toISO) => {
        await page.evaluate(() => { if (![...document.querySelectorAll('button')].some(b => b.innerText.trim() === '✓ Pronto')) { const e = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === '✎ Reorganizar dia'); if (e) e.click(); } }); await page.waitForTimeout(200);
        const r = await page.evaluate(([bs, to]) => { const bre = new RegExp(bs); const blocks = [...document.querySelectorAll('div')].filter(el => el.style && /^3px solid/.test(el.style.borderLeft)); const el = blocks.find(b => { const body = b.children[0] && b.children[0].children[2]; const s = body && body.querySelector('span'); return s && bre.test(s.textContent.trim()); }); if (!el) return 'bloco não encontrado'; const sel = [...el.querySelectorAll('select')].find(s => [...s.options].some(o => /mover p\/ dia/.test(o.textContent))); if (!sel) return 'select não encontrado'; if (![...sel.options].some(o => o.value === to)) return 'opção ' + to + ' ausente: ' + [...sel.options].map(o => o.value).join(','); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(sel, to); sel.dispatchEvent(new Event('change', { bubbles: true })); return true; }, [blockRe.source, toISO]);
        if (r !== true) throw new Error(r); await page.waitForTimeout(350);
    };
    const readAsk = (page) => page.evaluate(() => { const el = document.querySelector('[data-pw="move-ask"]'); if (!el) return null; return { text: el.innerText, btns: [...el.querySelectorAll('button')].map(b => b.innerText.trim()) }; });
    const clickAsk = async (page, label) => { const ok = await page.evaluate((l) => { const el = document.querySelector('[data-pw="move-ask"]'); const b = el && [...el.querySelectorAll('button')].find(b => b.innerText.trim() === l); if (!b) return false; b.click(); return true; }, label); if (!ok) throw new Error('botão do diálogo: ' + label); await page.waitForTimeout(350); };
    const clickMove = async (page) => { const a = await readAsk(page); await clickAsk(page, a && a.btns.includes('Mover só esta etapa') ? 'Mover só esta etapa' : 'Mover assim mesmo'); }; // só esta etapa (o diálogo curto do PR 2 diz "Mover só esta etapa")
    // ── TR18 · "Mover o fio todo junto" (paciente, 07/11 — PR 2): mover uma etapa com etapas sem marca depois dela abre o diálogo (curto, se os intervalos
    //    ficam); "Mover o fio todo (±N)" leva a etapa e as seguintes sem marca o mesmo N dias; dia bloqueado pergunta; nada depois de 01/01; grava só com "Aplicar" ──
    const T_STARTS = (() => { const a = ['2026-10-20', '2026-10-26']; for (let d = '2026-11-03'; d <= '2026-12-29'; d = addDays(d, 7)) a.push(d); a.push('2027-01-02'); for (let d = '2027-01-05'; d <= '2027-06-28'; d = addDays(d, 7)) a.push(d); return a; })(); // inícios de POST_WEEKS do planner: transição, T1 (8 dias), terças até a T10 (29/12), C1 (SÁB 02/01–SEG 04/01) e as terças da cauda até PLAN_HZ (§10.1 a, testes I2)
    const wiT = (iso) => T_STARTS.filter(s => s <= iso).length - 2; // semana da Trilha pela grade (T1 = 0, T10 = 9, C1 = 10): igual à conta antiga em 26/10–01/01; antes, wiT('2027-01-02') = wiT('2026-12-29') = 9
    const mkNav = (page, today) => { let off = 0; return async (iso) => { await clickTab(page, 'CRONOGRAMA'); const k = wiT(iso) - wiT(today); if (k !== off) { await navWeek(page, k - off); off = k; } await clickDate(page, br(iso)); }; };
    const escT = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const prepT = async (S, clock, mut, via) => { if (via) await S.reopen(via); let page = await S.reopen(clock); const c = await getLS(page, CFG); const t = (await getLS(page, TRL)) || {}; mut(c, t); await setLS(page, CFG, c); await setLS(page, TRL, t); return S.reopen(clock); };
    const setP = (c, id, d) => { c.trilhaPlan[id] = { ...c.trilhaPlan[id], aula: d[0], quest: d[1], apost: d[2], seal: d[3] }; };
    const walkT = async (S, until) => { let page = S.page; for (let d = '2026-11-03'; d <= until; d = addDays(d, 7)) { await markUntil(page, addDays(d, -1)); page = await S.reopen(d); } return page; }; // premissa (S3b): "ela fez tudo no dia" até a terça `until` (como o TR17e). Com o app fechado desde 26/10 e nada marcado, as selagens atrasadas contam como cadeias abertas e o K (5) segura a rampa (C2/R10) — o NEF1 nem entraria na T4
    const moveStageT = async (page, nav, id, ts, fromIso, to) => { await nav(fromIso); const day = await readDay(page); const b = day.blocks.find(x => x.tm === id && x.ts === ts && !x.au); if (!b) throw new Error('bloco ' + id + '.' + ts + ' não está em ' + fromIso); await moveT(page, new RegExp('^' + escT(b.text.slice(0, 60))), to); return b; };
    const pronto = async (page) => { await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(y => y.innerText.trim() === '✓ Pronto'); if (x) x.click(); }); await page.waitForTimeout(200); };
    const readShift = (page) => page.evaluate(() => { const el = document.querySelector('[data-t="shift-prev"]'); if (!el) return null; const tx = (s) => { const e = el.querySelector(s); return e ? e.innerText.trim() : null; };
        return { text: el.innerText, rows: [...el.querySelectorAll('[data-t="shift-row"]')].map(r => ({ ts: r.getAttribute('data-ts'), text: r.innerText.trim() })), qs: [...el.querySelectorAll('[data-t="shift-q"]')].map(r => ({ ts: r.getAttribute('data-ts'), text: r.innerText.trim(), btns: [...r.querySelectorAll('button')].map(b => b.innerText.trim()) })),
            gaps: tx('[data-t="shift-gaps"]'), order: tx('[data-t="shift-order"]'), nofit: tx('[data-t="shift-nofit"]'), end: tx('[data-t="shift-end"]'), past: tx('[data-t="shift-past"]'), btns: [...document.querySelectorAll('[data-pw="move-ask"] > div:last-child button')].map(b => b.innerText.trim()) }; });
    const answerQ = async (page, ts, label) => { const ok = await page.evaluate(([t, l]) => { const q = document.querySelector('[data-t="shift-q"][data-ts="' + t + '"]'); const b = q && [...q.querySelectorAll('button')].find(x => x.innerText.trim() === l); if (!b) return false; b.click(); return true; }, [ts, label]); if (!ok) throw new Error('pergunta ' + ts + ': ' + label); await page.waitForTimeout(300); };
    const rowT = (sh, ts) => ((sh && sh.rows.find(r => r.ts === ts)) || {}).text || '';
    const others = (a, b, id) => Object.keys(a.trilhaPlan).filter(k => k !== String(id)).every(k => JSON.stringify(a.trilhaPlan[k]) === JSON.stringify(b.trilhaPlan[k]));
    const logSh = (sh) => console.log('   💡', sh ? sh.text.replace(/\n/g, ' | ') : '(sem prévia)');

    // TR18a · caso A (aula QUA, questões QUI, apostila SEX, selagem na TER seguinte): diálogo curto quando os intervalos ficam; aula → QUI com "+1 dia" leva tudo,
    //          intervalos idênticos; Cancelar não grava; orig preservado; hist "fio"; outro módulo intacto
    await scenario(browser, 'TR18a-fio-caso-A', '2026-10-26', {}, async (S) => {
        await walkT(S, '2026-11-17'); let page = await prepT(S, '2026-11-17', (c) => setP(c, 1, ['2026-11-18', '2026-11-19', '2026-11-20', '2026-11-24'])); // premissa (S3b): walkT — o NEF1 congela na T4 com 17, 18, 19 e 22/11
        const nav = mkNav(page, '2026-11-17'); const c0 = await getLS(page, CFG), t0 = await getLS(page, TRL);
        const b = await moveStageT(page, nav, 1, 'aula', '2026-11-18', '2026-11-17');
        let ask = await readAsk(page); console.log('   ', b.text.slice(0, 70), '|', ask && ask.text.replace(/\n/g, ' | '));
        check('TR18a · mover a aula de QUA 18/11 para TER 17/11 (aula → questões 2d, dentro de 1–2) ⇒ diálogo curto "Este movimento mantém os intervalos." com Mover só esta etapa / Mover o fio todo (−1 dia) / Cancelar', !!ask && /Este movimento mantém os intervalos\./.test(ask.text) && JSON.stringify(ask.btns) === JSON.stringify(['Mover só esta etapa', 'Mover o fio todo (−1 dia)', 'Cancelar']) && !/⚠️ Isso deixa/.test(ask.text), ask && JSON.stringify(ask));
        await clickAsk(page, 'Cancelar');
        check('TR18a · Cancelar no diálogo curto não grava nada', JSON.stringify(await getLS(page, CFG)) === JSON.stringify(c0) && JSON.stringify(await getLS(page, TRL)) === JSON.stringify(t0) && !(await getLS(page, SCH)));
        await moveStageT(page, nav, 1, 'aula', '2026-11-18', '2026-11-19'); ask = await readAsk(page); console.log('   ', ask && ask.text.replace(/\n/g, ' | '));
        check('TR18a · caso A: aula de QUA 18/11 para QUI 19/11 (dia das questões) ⇒ o aviso atual continua (mesmo dia) + a opção nova "Mover o fio todo (+1 dia)"', !!ask && /⚠️ Isso deixa/.test(ask.text) && ['Mover assim mesmo', 'Ver como reorganizar o fio', 'Mover o fio todo (+1 dia)', 'Cancelar'].every(x => ask.btns.includes(x)), ask && JSON.stringify(ask.btns));
        await clickAsk(page, 'Mover o fio todo (+1 dia)'); let sh = await readShift(page); logSh(sh);
        const qRow18a = rowT(sh, 'quest'), qH18a = Number(((qRow18a.match(/SEX 20\/11 \(([\d,]+)h/) || [])[1] || 'NaN').replace(',', '.')); // premissa (S3b, walkT): SEX 20/11 (📚 5h) já tem a aula de outro módulo da T4 (1 aula por dia), a apostila de outro e uma selagem — o ⚠️ das questões ali é real
        check('TR18a · prévia: aula QUI 19/11 (seu movimento), questões SEX 20/11, apostila SÁB 21/11 (dia leve: 🌿, sem pergunta), selagem QUA 25/11 — cada uma com dia e carga; a carga já tira a etapa do módulo que sai do dia (sem ⚠️ falso: a aula em QUI 19/11 sem ⚠️; nas questões o ⚠️ só se SEX 20/11 passar do 📚 de 5h mesmo sem a apostila do módulo)', !!sh && /^· Aula: QUA 18\/11 → QUI 19\/11 \(.*\) \(seu movimento\)$/.test(rowT(sh, 'aula')) && /^· Questões: QUI 19\/11 → (⚠️ )?SEX 20\/11 \(/.test(qRow18a) && /⚠️/.test(qRow18a) === (qH18a > 5) && /^· Apostila: SEX 20\/11 → .*🌿 SÁB 21\/11 \(/.test(rowT(sh, 'apost')) && /^· Selagem: TER 24\/11 → .*QUA 25\/11 \(/.test(rowT(sh, 'seal')) && sh.qs.length === 0 && /🌿 SÁB 21\/11 é o dia leve da semana/.test(sh.text), sh && JSON.stringify(sh.rows));
        check('TR18a · intervalos antes → depois idênticos (1d → 1d · 1d → 1d · 4d → 4d), sem ⚠️; "Aplicar" disponível', !!sh && sh.gaps === 'Intervalos (antes → depois): aula → questões 1d → 1d · questões → apostila 1d → 1d · apostila → selagem 4d → 4d' && !sh.order && JSON.stringify(sh.btns) === JSON.stringify(['Aplicar', 'Voltar às outras opções', 'Cancelar']), sh && sh.gaps + ' ' + JSON.stringify(sh.btns));
        check('TR18a · a prévia não grava nada', JSON.stringify(await getLS(page, CFG)) === JSON.stringify(c0));
        await clickAsk(page, 'Cancelar');
        check('TR18a · Cancelar na prévia do fio não grava nada', JSON.stringify(await getLS(page, CFG)) === JSON.stringify(c0) && JSON.stringify(await getLS(page, TRL)) === JSON.stringify(t0) && !(await getLS(page, SCH)));
        await moveStageT(page, nav, 1, 'aula', '2026-11-18', '2026-11-19'); await clickAsk(page, 'Mover o fio todo (+1 dia)'); await clickAsk(page, 'Aplicar'); await pronto(page);
        const c1 = await getLS(page, CFG), p1 = c1.trilhaPlan[1], h = p1.hist.slice(-4);
        check('TR18a · Aplicar: trilhaPlan[1] = 19/11, 20/11, 21/11, 25/11; orig preservado; hist com 4 entradas de motivo "fio" (de → para, em 17/11)', p1.aula === '2026-11-19' && p1.quest === '2026-11-20' && p1.apost === '2026-11-21' && p1.seal === '2026-11-25' && JSON.stringify(p1.orig) === JSON.stringify(c0.trilhaPlan[1].orig) && p1.hist.length === (c0.trilhaPlan[1].hist || []).length + 4 && h.every(x => x.why === 'fio' && x.at === '2026-11-17') && h.map(x => x.ts + ':' + x.from + '>' + x.to).join() === 'aula:2026-11-18>2026-11-19,quest:2026-11-19>2026-11-20,apost:2026-11-20>2026-11-21,seal:2026-11-24>2026-11-25', JSON.stringify(p1));
        check('TR18a · só o módulo tocado muda: os outros módulos do plano, o registro e as semanas ficam iguais; nenhum dia materializado', others(c1, c0, 1) && JSON.stringify(c1.trilhaWeeks) === JSON.stringify(c0.trilhaWeeks) && JSON.stringify(await getLS(page, TRL)) === JSON.stringify(t0) && !(await getLS(page, SCH)));
        await nav('2026-11-21'); const d21 = await readDay(page);
        check('TR18a · SÁB 21/11 mostra a apostila do módulo com o selo 🌿', d21.blocks.some(x => x.tm === 1 && x.ts === 'apost' && /🌿 dia leve/.test(x.text)), JSON.stringify(d21.blocks.filter(x => x.tm === 1).map(x => x.text.slice(-60))));
        const btnRe = async (re) => { const ok = await page.evaluate((src) => { const b = [...document.querySelectorAll('button')].find(x => new RegExp(src).test(x.innerText.trim())); if (!b) return false; b.click(); return true; }, re.source); if (!ok) throw new Error('botão não encontrado: ' + re); await page.waitForTimeout(450); };
        await clickTab(page, 'TRILHA'); await btnRe(/^Ver o que mudou desde a atualização$/); const dg = await page.evaluate(() => { const el = document.querySelector('[data-t="restore-diag"]'); return el ? el.innerText : ''; });
        check('TR18a · a restauração vê as etapas do fio fora da data original', /Etapas fora da data original: 4/.test(dg), dg.slice(0, 400));
        await btnRe(/^Aplicar a restauração$/); if (await page.evaluate(() => [...document.querySelectorAll('button')].some(b => b.innerText.trim() === 'Aplicar mesmo assim'))) await btnRe(/^Aplicar mesmo assim$/);
        const pr = (await getLS(page, CFG)).trilhaPlan[1];
        check('TR18a · Restaurar devolve o módulo ao orig (17/11, 18/11, 19/11, 22/11)', ['aula', 'quest', 'apost', 'seal'].map(x => pr[x]).join() === ['aula', 'quest', 'apost', 'seal'].map(x => c0.trilhaPlan[1].orig[x]).join() && pr.aula === '2026-11-17', JSON.stringify(pr));
        await moveStageT(page, nav, 1, 'apost', '2026-11-19', '2026-11-20'); const askS = await readAsk(page);
        check('TR18a · apostila QUI 19/11 → SEX 20/11 (questões → apostila 2d, apostila → selagem 2d): diálogo curto', !!askS && /Este movimento mantém os intervalos\./.test(askS.text) && askS.btns.includes('Mover só esta etapa') && askS.btns.includes('Mover o fio todo (+1 dia)'), askS && JSON.stringify(askS.btns));
        await clickAsk(page, 'Mover só esta etapa'); await pronto(page); const ps = (await getLS(page, CFG)).trilhaPlan[1];
        check('TR18a · "Mover só esta etapa": só a apostila muda (20/11), hist "mover"; selagem fica em 22/11', ps.apost === '2026-11-20' && ps.seal === '2026-11-22' && ps.quest === '2026-11-18' && ps.hist.slice(-1)[0].why === 'mover' && ps.hist.slice(-1)[0].ts === 'apost', JSON.stringify(ps));
    });

    // TR18b · caso B (aula e questões marcadas, apostila SEX, selagem TER): apostila → DOM só leva apostila e selagem (+2); questões → apostila vira 3 dias, com ⚠️
    await scenario(browser, 'TR18b-fio-caso-B', '2026-10-26', {}, async (S) => {
        let page = await prepT(S, '2026-11-19', (c, t) => { setP(c, 1, ['2026-11-18', '2026-11-19', '2026-11-20', '2026-11-24']); t[1] = { aula: true, aulaAt: '2026-11-18', questoesD2: true, questoesD2At: '2026-11-19' }; });
        const nav = mkNav(page, '2026-11-19'); const c0 = await getLS(page, CFG), t0 = await getLS(page, TRL);
        await moveStageT(page, nav, 1, 'apost', '2026-11-20', '2026-11-22'); const ask = await readAsk(page); console.log('   ', ask && ask.text.replace(/\n/g, ' | '));
        check('TR18b · apostila de SEX 20/11 para DOM 22/11 ⇒ aviso (3 dias após as questões) + "Mover o fio todo (+2 dias)"', !!ask && /⚠️ Isso deixa/.test(ask.text) && ask.btns.includes('Mover o fio todo (+2 dias)'), ask && JSON.stringify(ask.btns));
        await clickAsk(page, 'Mover o fio todo (+2 dias)'); const sh = await readShift(page); logSh(sh);
        check('TR18b · prévia: só apostila (DOM 22/11, seu movimento) e selagem (TER 24/11 → QUI 26/11); aula e questões marcadas não andam', !!sh && sh.rows.map(r => r.ts).join() === 'apost,seal' && /DOM 22\/11 .*\(seu movimento\)/.test(rowT(sh, 'apost')) && /^· Selagem: TER 24\/11 → .*QUI 26\/11 \(/.test(rowT(sh, 'seal')), sh && JSON.stringify(sh.rows));
        check('TR18b · intervalos: questões → apostila 1d → 3d com ⚠️ fora de 1–2; apostila → selagem 4d → 4d; o ⚠️ só informa ("Aplicar" está lá)', !!sh && sh.gaps === 'Intervalos (antes → depois): aula → questões 1d → 1d · questões → apostila 1d → 3d ⚠️ fora de 1–2 · apostila → selagem 4d → 4d' && sh.btns.includes('Aplicar'), sh && sh.gaps);
        await clickAsk(page, 'Aplicar'); const c1 = await getLS(page, CFG), p1 = c1.trilhaPlan[1];
        check('TR18b · Aplicar: apostila 22/11 e selagem 26/11; aula/questões e seus carimbos intactos; hist "fio" só das duas', p1.aula === '2026-11-18' && p1.quest === '2026-11-19' && p1.apost === '2026-11-22' && p1.seal === '2026-11-26' && JSON.stringify(await getLS(page, TRL)) === JSON.stringify(t0) && p1.hist.filter(x => x.why === 'fio').map(x => x.ts).join() === 'apost,seal' && others(c1, c0, 1), JSON.stringify(p1));
        await moveStageT(page, nav, 1, 'quest', '2026-11-19', '2026-11-21'); const askM = await readAsk(page); console.log('   ', askM && askM.text.replace(/\n/g, ' | '));
        check('TR18b · mover o bloco das questões já marcadas não oferece "Mover o fio todo" (etapa marcada nunca anda)', !askM || !askM.btns.some(b => /^Mover o fio todo/.test(b)), askM && JSON.stringify(askM.btns));
        if (askM) await clickAsk(page, 'Cancelar'); await pronto(page);
    });

    // TR18c · etapa posterior que já passou sem marca anda com o fio, a partir de amanhã; mover para um dia passado mostra a linha do ⏳
    await scenario(browser, 'TR18c-fio-passado', '2026-10-26', {}, async (S) => {
        await walkT(S, '2026-11-17'); let page = await prepT(S, '2026-11-19', (c, t) => { Object.entries(c.trilhaPlan).forEach(([id, pl]) => { if (id === '1') return; STG.forEach(x => { if (pl[x] && pl[x] < '2026-11-19') { t[id] = t[id] || {}; t[id][FIELD[x]] = true; t[id][STAMP[x]] = pl[x]; } }); }); }); // premissa (S3b): walkT até a T4 (17/11) // a semana congela em 17/11 // plano do motor: aula TER 17/11, questões QUA 18/11, apostila QUI 19/11, selagem DOM 22/11 — nada marcado no módulo 1 (os outros, feitos em dia)
        const nav = mkNav(page, '2026-11-19'); const c0 = await getLS(page, CFG);
        check('TR18c · premissa: módulo 1 com aula 17/11, questões 18/11, apostila 19/11, selagem 22/11, sem marca', ['aula', 'quest', 'apost', 'seal'].map(x => c0.trilhaPlan[1][x]).join() === '2026-11-17,2026-11-18,2026-11-19,2026-11-22', JSON.stringify(c0.trilhaPlan[1]));
        await moveStageT(page, nav, 1, 'aula', '2026-11-17', '2026-11-18'); const ask = await readAsk(page); console.log('   ', ask && ask.text.replace(/\n/g, ' | '));
        check('TR18c · mover a aula para QUA 18/11 (dia passado) mostra a linha: "Esse dia já passou. Se você fez a etapa nele, marque o ✓ no bloco desse dia, assim o carimbo fica com a data certa. Mover para um dia passado só deixa a etapa como pendente (⏳)."', !!ask && ask.text.includes('Esse dia já passou. Se você fez a etapa nele, marque o ✓ no bloco desse dia, assim o carimbo fica com a data certa. Mover para um dia passado só deixa a etapa como pendente (⏳).') && ask.btns.includes('Mover o fio todo (+1 dia)'), ask && ask.text);
        await clickAsk(page, 'Mover o fio todo (+1 dia)'); const sh = await readShift(page); logSh(sh);
        check('TR18c · as questões (QUA 18/11, ⏳ sem marca) andam junto, a partir de amanhã (SEX 20/11); a apostila (+1 cairia no dia delas) vai logo depois (SÁB 21/11); a selagem só +1 (SEG 23/11 — o empurrão do ⏳ não se espalha); a linha do dia passado continua na prévia', !!sh && /^· Questões: QUA 18\/11 → .*SEX 20\/11 \(.*a partir de amanhã/.test(rowT(sh, 'quest')) && /^· Apostila: QUI 19\/11 → .*SÁB 21\/11 \(.*logo depois da etapa anterior/.test(rowT(sh, 'apost')) && /^· Selagem: DOM 22\/11 → .*SEG 23\/11 \(/.test(rowT(sh, 'seal')) && !/a partir de amanhã/.test(rowT(sh, 'seal')) && /^Esse dia já passou\./.test(sh.past || '') && sh.btns.includes('Aplicar'), sh && JSON.stringify(sh.rows));
        await clickAsk(page, 'Aplicar'); await pronto(page); const p1 = (await getLS(page, CFG)).trilhaPlan[1];
        check('TR18c · Aplicar: aula 18/11 (fica ⏳), questões 20/11, apostila 21/11, selagem 23/11; orig intacto', ['aula', 'quest', 'apost', 'seal'].map(x => p1[x]).join() === '2026-11-18,2026-11-20,2026-11-21,2026-11-23' && JSON.stringify(p1.orig) === JSON.stringify(c0.trilhaPlan[1].orig), JSON.stringify(p1));
        const pend = await banner(page, 'trilha-pending');
        check('TR18c · a aula movida para o dia passado fica no ⏳ (1 etapa pendente: a aula de QUA 18/11); as que andaram não', !!pend && /Ficaram para trás 1 etapa \(.*aula de QUA 18\/11\)/.test(pend.text), pend && pend.text.slice(0, 300));
    });

    // TR18d · etapa posterior já marcada: o fio não anda além dela, e o app avisa; se a ordem quebra, diz e as outras opções continuam
    await scenario(browser, 'TR18d-fio-marcada-segura', '2026-10-26', {}, async (S) => {
        let page = await prepT(S, '2026-11-21', (c, t) => { setP(c, 1, ['2026-11-17', '2026-11-20', '2026-11-21', '2026-11-24']); t[1] = { questoesD2: true, questoesD2At: '2026-11-20' }; }); // questões feitas em 20/11; aula ⏳ de 17/11
        const nav = mkNav(page, '2026-11-21'); const c0 = await getLS(page, CFG);
        await moveStageT(page, nav, 1, 'aula', '2026-11-17', '2026-11-18'); await clickAsk(page, 'Mover o fio todo (+1 dia)'); let sh = await readShift(page); logSh(sh);
        check('TR18d · questões marcadas depois da aula: a prévia só leva a aula; aviso "⚠️ As questões já estão marcadas: o fio não anda além delas."', !!sh && sh.rows.map(r => r.ts).join() === 'aula' && /⚠️ As questões já estão marcadas: o fio não anda além delas\./.test(sh.text) && !sh.order && sh.btns.includes('Aplicar'), sh && sh.text);
        await clickAsk(page, 'Aplicar'); await pronto(page); const p1 = (await getLS(page, CFG)).trilhaPlan[1];
        check('TR18d · Aplicar grava só a aula (18/11); apostila 21/11 e selagem 24/11, depois da marcada, não andam', p1.aula === '2026-11-18' && p1.apost === '2026-11-21' && p1.seal === '2026-11-24' && p1.hist.filter(x => x.why === 'fio').length === 1, JSON.stringify(p1));
        await moveStageT(page, nav, 1, 'aula', '2026-11-18', '2026-11-22'); const ask = await readAsk(page);
        await clickAsk(page, 'Mover o fio todo (+4 dias)'); sh = await readShift(page); logSh(sh); const c2 = await getLS(page, CFG);
        check('TR18d · aula para DOM 22/11, depois das questões marcadas (20/11): "⚠️ A ordem não pode ser preservada: as questões ficariam antes da aula. As outras opções continuam." — sem "Aplicar"', !!sh && sh.order === '⚠️ A ordem não pode ser preservada: as questões ficariam antes da aula. As outras opções continuam.' && JSON.stringify(sh.btns) === JSON.stringify(['Voltar às outras opções', 'Cancelar']), sh && JSON.stringify([sh.order, sh.btns]));
        await clickAsk(page, 'Voltar às outras opções'); const ask2 = await readAsk(page);
        check('TR18d · "Voltar às outras opções" devolve o diálogo com Mover assim mesmo / Mover o fio todo / Cancelar; nada gravado', !!ask2 && JSON.stringify(ask2.btns) === JSON.stringify(ask.btns) && ask2.btns.includes('Mover assim mesmo') && JSON.stringify(await getLS(page, CFG)) === JSON.stringify(c2), ask2 && JSON.stringify(ask2.btns));
        await clickAsk(page, 'Cancelar');
    });

    // TR18e · dias bloqueados: o app pergunta ("Deixar neste dia" / "Pular +1 dia"); pular empurra as seguintes e pergunta de novo se o próximo também é bloqueado
    //          (SEX 13/11 com o simulado religado: QUI 12/11 plantão longo e SEX 13/11 simulado, dois bloqueados em sequência). A resposta vale para o dia perguntado:
    //          se a etapa cair em outro dia bloqueado, o app pergunta de novo. "Deixar" na sexta de simulado é escolha dela: não vira ⏳; a etapa que o app pôs lá continua ⏳
    const markBefore = (c, t, iso) => Object.entries(c.trilhaPlan).forEach(([id, pl]) => STG.forEach(x => { if (pl[x] && pl[x] < iso) { t[id] = t[id] || {}; t[id][FIELD[x]] = true; t[id][STAMP[x]] = pl[x]; } })); // o que já passou, feito em dia
    await scenario(browser, 'TR18e-fio-dias-bloqueados', '2026-10-26', {}, async (S) => {
        await walkT(S, '2026-11-03'); let page = await prepT(S, '2026-11-07', (c, t) => { c.simOverrides = { ...(c.simOverrides || {}), '2026-11-13': true }; [24, 32].forEach(id => { const x = { aula: '2026-11-09', quest: '2026-11-11', apost: '2026-11-13', seal: '2026-11-16' }; c.trilhaPlan[id] = { ...c.trilhaPlan[id], ...x, orig: { ...x }, hist: [] }; }); markBefore(c, t, '2026-11-07'); }); // CIR2 · 19, 24 e CIR3 · 32: aula SEG 09/11, questões QUA 11/11, apostila SEX 13/11, selagem SEG 16/11 — premissa (S3b): walkT até a T2 e as cadeias de 24 e 32 gravadas no seed (com 1 aula por dia o motor novo põe as aulas delas em 08/11); o TR18e testa o fio, não a colocação
        const nav = mkNav(page, '2026-11-07'); const c0 = await getLS(page, CFG), t0 = await getLS(page, TRL);
        check('TR18e · premissa: módulo 19 com aula 09/11, questões 11/11, apostila 13/11, selagem 16/11', ['aula', 'quest', 'apost', 'seal'].map(x => c0.trilhaPlan[19][x]).join() === '2026-11-09,2026-11-11,2026-11-13,2026-11-16', JSON.stringify(c0.trilhaPlan[19]));
        let pend = await banner(page, 'trilha-pending'); console.log('   ⏳', pend && pend.text.slice(0, 200));
        check('TR18e · premissa: com o simulado religado em SEX 13/11, as 3 apostilas que o app pôs lá aparecem no ⏳ ("que virou simulado")', !!pend && /Ficaram para trás 3 etapas/.test(pend.text), pend && pend.text.slice(0, 300));
        await moveStageT(page, nav, 19, 'aula', '2026-11-09', '2026-11-08'); await clickAsk(page, 'Mover o fio todo (−1 dia)'); let sh = await readShift(page); logSh(sh);
        check('TR18e · questões iriam para TER 10/11 (plantão longo): "⛔ As questões iriam para TER 10/11, que é plantão longo." com Deixar neste dia / Pular +1 dia; sem "Aplicar" até responder', !!sh && sh.qs.length === 2 && sh.qs[0].ts === 'quest' && sh.qs[0].text.startsWith('⛔ As questões iriam para TER 10/11, que é plantão longo.') && JSON.stringify(sh.qs[0].btns) === JSON.stringify(['Deixar neste dia', 'Pular +1 dia']) && sh.qs[1].ts === 'apost' && /⛔ A apostila iria para QUI 12\/11, que é plantão longo\./.test(sh.qs[1].text) && !sh.btns.includes('Aplicar') && /Responda às perguntas acima para aplicar\./.test(sh.text), sh && JSON.stringify(sh.qs));
        // fora de ordem: "Deixar" na apostila (QUI 12/11) e depois "Pular" nas questões — a apostila passa a cair em SEX 13/11, outro dia: o app pergunta de novo
        await answerQ(page, 'apost', 'Deixar neste dia'); await answerQ(page, 'quest', 'Pular +1 dia'); sh = await readShift(page); logSh(sh);
        check('TR18e · respondendo fora de ordem: o "Deixar" da apostila valia para QUI 12/11; empurrada para SEX 13/11 (sexta de simulado), ela é perguntada de novo — sem "Aplicar"', !!sh && sh.qs.length === 1 && sh.qs[0].ts === 'apost' && /⛔ A apostila iria para SEX 13\/11, que é sexta de simulado\./.test(sh.qs[0].text) && !sh.btns.includes('Aplicar'), sh && JSON.stringify([sh.rows, sh.qs]));
        await clickAsk(page, 'Voltar às outras opções'); await clickAsk(page, 'Mover o fio todo (−1 dia)'); sh = await readShift(page);
        check('TR18e · "Voltar às outras opções" e de novo "Mover o fio todo": as perguntas recomeçam', !!sh && sh.qs.length === 2, sh && JSON.stringify(sh.qs));
        await answerQ(page, 'quest', 'Deixar neste dia'); sh = await readShift(page); logSh(sh);
        check('TR18e · "Deixar neste dia": as questões ficam em TER 10/11 com ⚠️ plantão longo — escolha sua; a pergunta da apostila continua (independente)', !!sh && /^· Questões: QUA 11\/11 → .*TER 10\/11 .*⚠️ plantão longo — escolha sua/.test(rowT(sh, 'quest')) && sh.qs.length === 1 && sh.qs[0].ts === 'apost' && !sh.btns.includes('Aplicar'), sh && JSON.stringify(sh.rows));
        await answerQ(page, 'apost', 'Pular +1 dia'); sh = await readShift(page); logSh(sh);
        check('TR18e · "Pular +1 dia" na apostila cai em SEX 13/11, também bloqueada (sexta de simulado): o app pergunta de novo', !!sh && sh.qs.length === 1 && sh.qs[0].ts === 'apost' && /⛔ A apostila iria para SEX 13\/11, que é sexta de simulado\./.test(sh.qs[0].text), sh && JSON.stringify(sh.qs));
        await answerQ(page, 'apost', 'Pular +1 dia'); sh = await readShift(page); logSh(sh);
        check('TR18e · pulou de novo: apostila SÁB 14/11 (dia leve: 🌿, sem pergunta), "pulou 2 dias"; a selagem também é empurrada (SEG 16/11 → TER 17/11); "Aplicar" liberado', !!sh && sh.qs.length === 0 && /^· Apostila: SEX 13\/11 → .*🌿 SÁB 14\/11 .*pulou 2 dias/.test(rowT(sh, 'apost')) && /^· Selagem: SEG 16\/11 → .*TER 17\/11 /.test(rowT(sh, 'seal')) && sh.btns.includes('Aplicar') && /questões → apostila 2d → 4d ⚠️ fora de 1–2/.test(sh.gaps), sh && JSON.stringify(sh.rows) + sh.gaps);
        await clickAsk(page, 'Aplicar'); await pronto(page); const c1 = await getLS(page, CFG), p = c1.trilhaPlan[19];
        check('TR18e · Aplicar: 08/11, 10/11, 14/11, 17/11; orig preservado; hist "fio"; a escolha "Deixar" guardada (keep: questões em 10/11); módulos 24 e 32 (mesma semana) intactos', ['aula', 'quest', 'apost', 'seal'].map(x => p[x]).join() === '2026-11-08,2026-11-10,2026-11-14,2026-11-17' && JSON.stringify(p.orig) === JSON.stringify(c0.trilhaPlan[19].orig) && p.hist.slice(-4).every(x => x.why === 'fio') && JSON.stringify(p.keep) === JSON.stringify({ quest: '2026-11-10' }) && others(c1, c0, 19) && JSON.stringify(await getLS(page, TRL)) === JSON.stringify(t0), JSON.stringify(p));
        await nav('2026-11-10'); const d10 = await readDay(page);
        check('TR18e · TER 10/11 (plantão longo) mostra o bloco das questões deixado ali, com "⚠️ plantão longo — escolha sua"; o 🚑 diz "etapa deixada aqui por escolha sua (⚠️ no bloco)" e a linha 🗓️ também (não "nenhuma etapa de mesa hoje")', d10.blocks.some(x => x.tm === 19 && x.ts === 'quest' && /⚠️ plantão longo — escolha sua/.test(x.text)) && d10.blocks.some(x => /^🚑 Plantão 06h–19h — etapa deixada aqui por escolha sua \(⚠️ no bloco\); fora ela, só Anki e áudio nos tempos mortos/.test(x.text)) && /etapa deixada aqui por escolha sua \(⚠️ no bloco\)/.test(d10.dayType) && !/nenhuma etapa de mesa/.test(d10.dayType), JSON.stringify([d10.dayType, d10.blocks.map(x => x.text.slice(0, 90))]));
        // o outro caminho: "Pular +1 dia" nas questões empurra a apostila para SEX 13/11 (bloqueada) → pergunta → "Deixar neste dia" → Aplicar
        await moveStageT(page, nav, 24, 'aula', '2026-11-09', '2026-11-08'); await clickAsk(page, 'Mover o fio todo (−1 dia)');
        await answerQ(page, 'quest', 'Pular +1 dia'); sh = await readShift(page); logSh(sh);
        check('TR18e · módulo 24: "Pular +1 dia" nas questões (QUA 11/11) leva a apostila de volta para SEX 13/11, bloqueada — o app pergunta por ela', !!sh && /^· Questões: QUA 11\/11 → .*QUA 11\/11 .*pulou 1 dia$/.test(rowT(sh, 'quest')) && sh.qs.length === 1 && sh.qs[0].ts === 'apost' && /⛔ A apostila iria para SEX 13\/11, que é sexta de simulado\./.test(sh.qs[0].text), sh && JSON.stringify([sh.rows, sh.qs]));
        await answerQ(page, 'apost', 'Deixar neste dia'); sh = await readShift(page); logSh(sh);
        check('TR18e · "Deixar neste dia": apostila fica em SEX 13/11 com ⚠️ sexta de simulado — escolha sua; selagem SEG 16/11; "Aplicar" liberado', !!sh && /SEX 13\/11 .*⚠️ sexta de simulado — escolha sua/.test(rowT(sh, 'apost')) && /^· Selagem: SEG 16\/11 → .*SEG 16\/11/.test(rowT(sh, 'seal')) && sh.btns.includes('Aplicar'), sh && JSON.stringify(sh.rows));
        await clickAsk(page, 'Aplicar'); await pronto(page); const p24 = (await getLS(page, CFG)).trilhaPlan[24];
        check('TR18e · Aplicar (módulo 24): 08/11, 11/11, 13/11, 16/11; keep = apostila em 13/11', ['aula', 'quest', 'apost', 'seal'].map(x => p24[x]).join() === '2026-11-08,2026-11-11,2026-11-13,2026-11-16' && JSON.stringify(p24.keep) === JSON.stringify({ apost: '2026-11-13' }), JSON.stringify(p24));
        await nav('2026-11-13'); const d13 = await readDay(page);
        check('TR18e · SEX 13/11: a apostila que ela deixou tem "⚠️ sexta de simulado — escolha sua"; a que o app pôs lá (módulo 32, simulado religado depois) não tem "escolha sua"; a linha 🗓️ diz "etapa deixada aqui por escolha sua"', d13.blocks.some(x => x.tm === 24 && x.ts === 'apost' && /⚠️ sexta de simulado — escolha sua/.test(x.text)) && d13.blocks.some(x => x.tm === 32 && x.ts === 'apost' && !/escolha sua/.test(x.text)) && /etapa deixada aqui por escolha sua/.test(d13.dayType), JSON.stringify([d13.dayType, d13.blocks.filter(x => x.tm != null).map(x => x.tm + ':' + x.text.slice(-60))]));
        await nav('2026-11-07'); pend = await banner(page, 'trilha-pending'); console.log('   ⏳', pend && pend.text.slice(0, 200)); // o ⏳ fica no topo da semana de hoje
        check('TR18e · ⏳: só a apostila do módulo 32 (o app pôs, o simulado veio depois); a que ela deixou não vira pendente', !!pend && /Ficaram para trás 1 etapa \(CIR3 · apostila de SEX 13\/11/.test(pend.text), pend && pend.text.slice(0, 300));
    });

    // TR18i · dia editado à mão: "Deixar neste dia" põe o bloco com o mesmo ⚠️ e o mesmo 🚑 do dia gerado
    await scenario(browser, 'TR18i-fio-dia-editado', '2026-10-26', {}, async (S) => {
        let page = await prepT(S, '2026-11-07', (c, t) => markBefore(c, t, '2026-11-07'));
        const nav = mkNav(page, '2026-11-07');
        await nav('2026-11-10'); await moveT(page, /^Anki/, '2026-11-11'); await pronto(page); // TER 10/11 vira dia editado à mão (o Anki foi para QUA 11/11)
        check('TR18i · premissa: TER 10/11 e QUA 11/11 editados à mão', !!((await getLS(page, SCH)) || {})['2026-11-10'], JSON.stringify(Object.keys((await getLS(page, SCH)) || {})));
        await moveStageT(page, nav, 19, 'aula', '2026-11-09', '2026-11-08'); await clickAsk(page, 'Mover o fio todo (−1 dia)'); await answerQ(page, 'quest', 'Deixar neste dia'); await answerQ(page, 'apost', 'Deixar neste dia'); await clickAsk(page, 'Aplicar'); await pronto(page);
        await nav('2026-11-10'); const d10 = await readDay(page);
        check('TR18i · TER 10/11 (editado, plantão longo): o bloco das questões entra com "⚠️ plantão longo — escolha sua", o 🚑 diz "etapa deixada aqui por escolha sua" e a linha 🗓️ também', d10.blocks.some(x => x.tm === 19 && x.ts === 'quest' && /⚠️ plantão longo — escolha sua/.test(x.text)) && d10.blocks.some(x => /^🚑 Plantão 06h–19h — etapa deixada aqui por escolha sua/.test(x.text)) && /etapa deixada aqui por escolha sua/.test(d10.dayType) && !d10.blocks.some(x => /^Anki/.test(x.text)), JSON.stringify([d10.dayType, d10.blocks.map(x => x.text.slice(0, 90))]));
    });

    // TR18f · 01/01 é dia comum (regra de 01/01, S3b — reescrito): com o simulado religado em 01/01, a pergunta vem por "sexta de simulado"; "Pular +1 dia" leva a apostila
    //          para SÁB 02/01 e a selagem para janeiro — nada fica sem dia; "Deixar neste dia" guarda a escolha (keep). Premissa: "ela fez tudo no dia" até a T9 (walkT);
    //          o PED2 · Aleitamento Materno (26) da T9 tem aula DOM 27/12, questões SEG 28/12, apostila QUA 30/12 e selagem SÁB 02/01 (teto por etapa + decisão 7)
    await scenario(browser, 'TR18f-fio-01-01', '2026-10-26', {}, async (S) => {
        await walkT(S, '2026-12-22'); let page = await prepT(S, '2026-12-22', (c) => { c.simOverrides = { ...(c.simOverrides || {}), '2027-01-01': true }; }); // ela religa o simulado de 01/01
        const nav = mkNav(page, '2026-12-22'); const c0 = await getLS(page, CFG);
        check('TR18f · premissa: módulo 26 com aula 27/12, questões 28/12, apostila 30/12, selagem 02/01; simulado religado em 01/01', ['aula', 'quest', 'apost', 'seal'].map(x => (c0.trilhaPlan[26] || {})[x]).join() === '2026-12-27,2026-12-28,2026-12-30,2027-01-02' && c0.simOverrides['2027-01-01'] === true, JSON.stringify(c0.trilhaPlan[26]));
        await moveStageT(page, nav, 26, 'aula', '2026-12-27', '2026-12-29'); await clickAsk(page, 'Mover o fio todo (+2 dias)'); let sh = await readShift(page); logSh(sh);
        check('TR18f · apostila iria para SEX 01/01: "⛔ A apostila iria para SEX 01/01, que é sexta de simulado." com Deixar neste dia / Pular +1 dia; a aula no dia leve (29/12) só informa (X14)', !!sh && sh.qs.length === 1 && sh.qs[0].ts === 'apost' && sh.qs[0].text.startsWith('⛔ A apostila iria para SEX 01/01, que é sexta de simulado.') && JSON.stringify(sh.qs[0].btns) === JSON.stringify(['Deixar neste dia', 'Pular +1 dia']) && !sh.nofit && /🌿 A aula iria para o dia leve da semana \(TER 29\/12\) — o app não põe aula nova nele; se você aplicar, fica assim \(só informa\)\./.test(sh.text), sh && JSON.stringify(sh.qs) + ' | ' + sh.text);
        await answerQ(page, 'apost', 'Pular +1 dia'); sh = await readShift(page); logSh(sh);
        check('TR18f · "Pular +1 dia": apostila SÁB 02/01 e selagem empurrada em janeiro (02/01 → 05/01); nada sem dia, sem aviso de "não cabe"; "Aplicar" liberado', !!sh && /^· Apostila: QUA 30\/12 → .*SÁB 02\/01 .*pulou 1 dia/.test(rowT(sh, 'apost')) && /^· Selagem: SÁB 02\/01 → .*TER 05\/01/.test(rowT(sh, 'seal')) && !/sem dia/.test(sh.text) && !sh.nofit && JSON.stringify(sh.btns) === JSON.stringify(['Aplicar', 'Voltar às outras opções', 'Cancelar']), sh && JSON.stringify([sh.rows, sh.nofit, sh.btns]));
        await clickAsk(page, 'Voltar às outras opções'); await clickAsk(page, 'Mover o fio todo (+2 dias)'); await answerQ(page, 'apost', 'Deixar neste dia'); sh = await readShift(page); logSh(sh);
        check('TR18f · "Deixar neste dia": a apostila fica em SEX 01/01 com "⚠️ sexta de simulado — escolha sua" e a selagem anda para SEG 04/01; nada sem dia', !!sh && /SEX 01\/01 .*⚠️ sexta de simulado — escolha sua/.test(rowT(sh, 'apost')) && /^· Selagem: SÁB 02\/01 → .*SEG 04\/01/.test(rowT(sh, 'seal')) && !/sem dia/.test(sh.text) && sh.btns.includes('Aplicar'), sh && JSON.stringify(sh.rows));
        await clickAsk(page, 'Voltar às outras opções'); await clickAsk(page, 'Mover o fio todo (+2 dias)'); await answerQ(page, 'apost', 'Pular +1 dia'); await clickAsk(page, 'Aplicar'); await pronto(page);
        const p = (await getLS(page, CFG)).trilhaPlan[26];
        check('TR18f · Aplicar ("Pular"): aula 29/12, questões 30/12, apostila 02/01, selagem 05/01, registradas no hist "fio"; orig intacto; nada nulo', p.aula === '2026-12-29' && p.quest === '2026-12-30' && p.apost === '2027-01-02' && p.seal === '2027-01-05' && p.hist.filter(x => x.why === 'fio').map(x => x.ts + '>' + x.to).join() === 'aula>2026-12-29,quest>2026-12-30,apost>2027-01-02,seal>2027-01-05' && JSON.stringify(p.orig) === JSON.stringify(c0.trilhaPlan[26].orig) && !p.keep, JSON.stringify(p));
    });

    // TR18g · a selagem (nada depois dela) segue movendo direto, sem diálogo
    await scenario(browser, 'TR18g-fio-selagem-direto', '2026-10-26', {}, async (S) => {
        await walkT(S, '2026-11-17'); let page = await prepT(S, '2026-11-17', () => {}); const nav = mkNav(page, '2026-11-17'); const c0 = await getLS(page, CFG); // premissa (S3b): walkT — o NEF1 congela na T4
        await moveStageT(page, nav, 1, 'seal', '2026-11-22', '2026-11-23'); const ask = await readAsk(page); await pronto(page);
        const p = (await getLS(page, CFG)).trilhaPlan[1];
        check('TR18g · selagem de DOM 22/11 para SEG 23/11 (apostila → selagem 4d, na faixa): move direto, sem diálogo; hist "mover"', !ask && p.seal === '2026-11-23' && p.hist.slice(-1)[0].why === 'mover' && p.aula === c0.trilhaPlan[1].aula && p.apost === c0.trilhaPlan[1].apost, JSON.stringify({ ask, p }));
        // mover para hoje: as questões vão para TER 17/11; a aula (sem marca, de hoje) teria de ir para antes de amanhã — o app diz que não pode voltar
        await moveStageT(page, nav, 1, 'quest', '2026-11-18', '2026-11-17'); await clickAsk(page, 'Mover o fio todo (−1 dia)'); const sh = await readShift(page); logSh(sh); const c1 = await getLS(page, CFG);
        check('TR18g · questões para hoje (TER 17/11): a aula teria de ir para SEG 16/11 — "⚠️ A ordem não pode ser preservada: a aula iria para antes de amanhã — não pode voltar. As outras opções continuam." (sem "Aplicar"); apostila e selagem andam a partir de amanhã', !!sh && /^· Aula: TER 17\/11 → .*SEG 16\/11/.test(rowT(sh, 'aula')) && /TER 17\/11 .*\(seu movimento\)/.test(rowT(sh, 'quest')) && /^· Apostila: QUI 19\/11 → .*QUA 18\/11/.test(rowT(sh, 'apost')) && sh.order === '⚠️ A ordem não pode ser preservada: a aula iria para antes de amanhã — não pode voltar. As outras opções continuam.' && !sh.btns.includes('Aplicar'), sh && JSON.stringify([sh.rows, sh.order]));
        await clickAsk(page, 'Cancelar');
        check('TR18g · Cancelar: nada gravado', JSON.stringify(await getLS(page, CFG)) === JSON.stringify(c1));
        // um par fora de ordem que o fio não toca (questões no dia da aula, por "Mover assim mesmo") não bloqueia o fio da apostila — premissa (S3b): o NEF1 II da T4 tem aula QUA 18/11, questões 19/11, apostila 20/11, selagem 23/11 (antes 20, 22, 23 e 26/11)
        await moveStageT(page, nav, 2, 'quest', '2026-11-19', '2026-11-18'); await clickAsk(page, 'Mover assim mesmo'); await pronto(page);
        const p2a = (await getLS(page, CFG)).trilhaPlan[2];
        check('TR18g · premissa: módulo 2 com aula e questões no mesmo dia (QUA 18/11), apostila 20/11, selagem 23/11', p2a.aula === '2026-11-18' && p2a.quest === '2026-11-18' && p2a.apost === '2026-11-20' && p2a.seal === '2026-11-23', JSON.stringify(p2a));
        await moveStageT(page, nav, 2, 'apost', '2026-11-20', '2026-11-19'); const ask2 = await readAsk(page); const fio2 = ask2 && ask2.btns.find(b => /^Mover o fio todo/.test(b)); if (fio2) await clickAsk(page, fio2); const sh2 = await readShift(page); logSh(sh2);
        check('TR18g · fio da apostila (−1 dia) com o par antigo aula/questões no mesmo dia: a prévia não culpa o movimento ("A ordem não pode ser preservada" não aparece) e "Aplicar" está lá', !!sh2 && !sh2.order && sh2.btns.includes('Aplicar') && sh2.rows.map(r => r.ts).join() === 'apost,seal', sh2 && JSON.stringify([sh2.rows, sh2.order, sh2.btns]));
        if (sh2 && sh2.btns.includes('Aplicar')) await clickAsk(page, 'Aplicar'); await pronto(page); const p2b = (await getLS(page, CFG)).trilhaPlan[2];
        check('TR18g · Aplicar: apostila 19/11, selagem 22/11; aula e questões como estavam (18/11)', p2b.apost === '2026-11-19' && p2b.seal === '2026-11-22' && p2b.aula === '2026-11-18' && p2b.quest === '2026-11-18', JSON.stringify(p2b));
    });

    // TR18h · a selagem para um dia passado: sem etapa depois dela, não há "fio"; o diálogo abre só para a linha do dia passado (Mover assim mesmo / Cancelar)
    await scenario(browser, 'TR18h-selagem-dia-passado', '2026-10-26', {}, async (S) => {
        let page = await prepT(S, '2026-11-21', (c, t) => { setP(c, 1, ['2026-11-14', '2026-11-15', '2026-11-17', '2026-11-22']); t[1] = { aula: true, aulaAt: '2026-11-14', questoesD2: true, questoesD2At: '2026-11-15', apostila: true, apostilaAt: '2026-11-17' }; }, '2026-11-17');
        const nav = mkNav(page, '2026-11-21');
        await moveStageT(page, nav, 1, 'seal', '2026-11-22', '2026-11-20'); const ask = await readAsk(page); console.log('   ', ask && ask.text.replace(/\n/g, ' | '));
        check('TR18h · selagem de DOM 22/11 para SEX 20/11 (já passou; apostila → selagem 3d, na faixa): o diálogo mostra só a linha do dia passado, com Mover assim mesmo / Cancelar (sem "fio")', !!ask && ask.text.includes('Esse dia já passou. Se você fez a etapa nele, marque o ✓ no bloco desse dia') && JSON.stringify(ask.btns) === JSON.stringify(['Mover assim mesmo', 'Cancelar']) && !/Este movimento mantém/.test(ask.text), ask && JSON.stringify(ask));
        await clickAsk(page, 'Mover assim mesmo'); await pronto(page); const p = (await getLS(page, CFG)).trilhaPlan[1];
        check('TR18h · "Mover assim mesmo": selagem 20/11 (fica ⏳), hist "mover"', p.seal === '2026-11-20' && p.hist.slice(-1)[0].why === 'mover', JSON.stringify(p));
    });

    // TR18k · aval de 08/11 (escolha 6): a etapa que ela deixou em 01/01 com "Deixar neste dia" não sai de lá com a recolocação automática da semana final
    const markExcept = (c, t, iso, skip) => Object.entries(c.trilhaPlan).forEach(([id, pl]) => { if (skip.includes(Number(id))) return; STG.forEach(x => { if (pl[x] && pl[x] < iso) { t[id] = t[id] || {}; t[id][FIELD[x]] = true; t[id][STAMP[x]] = pl[x]; } }); });
    const chainOk = (p) => { const ds = STG.map(x => p[x]).filter(Boolean); return ds.every((d, k) => k === 0 || d > ds[k - 1]) && (!p.aula || p.aula <= '2027-01-01'); }; // datas crescentes; só a aula até 01/01 (regra de 01/01, S3b: questões, apostila e selagem podem ir para janeiro)
    // (S3b — reescrito) a escolha de 01/01 passa a ser feita num 01/01 com o simulado religado (01/01 é dia comum); a selagem vai para janeiro e a recolocação diária não a tira de lá
    await scenario(browser, 'TR18k-deixar-0101-recolocacao-diaria', '2026-10-26', {}, async (S) => {
        await walkT(S, '2026-12-22'); let page = await prepT(S, '2026-12-22', (c, t) => { c.simOverrides = { ...(c.simOverrides || {}), '2027-01-01': true }; markExcept(c, t, '2026-12-29', [26]); }); // tudo antes de 29/12 feito, menos o módulo 26 (aula DOM 27/12, questões SEG 28/12, apostila QUA 30/12, selagem SÁB 02/01); simulado religado em 01/01
        const nav = mkNav(page, '2026-12-22');
        await moveStageT(page, nav, 26, 'aula', '2026-12-27', '2026-12-29'); await clickAsk(page, 'Mover o fio todo (+2 dias)'); await answerQ(page, 'apost', 'Deixar neste dia'); await clickAsk(page, 'Aplicar'); await pronto(page);
        let p = (await getLS(page, CFG)).trilhaPlan[26];
        check('TR18k · 22/12: "Deixar neste dia" com a apostila em 01/01 (sexta de simulado) — aula 29/12, questões 30/12, apostila 01/01 (escolha guardada: keep), selagem 04/01 (janeiro; nada sem dia)', p.aula === '2026-12-29' && p.quest === '2026-12-30' && p.apost === '2027-01-01' && p.seal === '2027-01-04' && JSON.stringify(p.keep) === JSON.stringify({ apost: '2027-01-01' }), JSON.stringify(p));
        for (const day of ['2026-12-29', '2026-12-31']) {
            if (day === '2026-12-31') { const c0 = await getLS(page, CFG), t0 = (await getLS(page, TRL)) || {}; const q = c0.trilhaPlan[26]; t0[26] = { ...(t0[26] || {}), aula: true, aulaAt: q.aula, questoesD2: true, questoesD2At: q.quest }; await setLS(page, TRL, t0); } // ela fez a aula e as questões nos dias delas
            page = await S.reopen(day); const c = await getLS(page, CFG); p = c.trilhaPlan[26]; console.log('   📦', day, JSON.stringify({ aula: p.aula, quest: p.quest, apost: p.apost, seal: p.seal, hist: p.hist.filter(h => h.why === 'final') }));
            check('TR18k · ' + br(day) + ': a recolocação automática da semana final rodou (' + c.trilhaFinalAutoAt + ') e a apostila continua em 01/01, com a escolha guardada; a selagem em janeiro, nas faixas; aula até 01/01 e ordem mantida', new RegExp('^' + day + '\\|1$').test(c.trilhaFinalAutoAt || '') && p.apost === '2027-01-01' && JSON.stringify(p.keep) === JSON.stringify({ apost: '2027-01-01' }) && !p.hist.some(h => h.why === 'final' && h.ts === 'apost') && chainOk(p) && p.seal > '2027-01-01' && dd(p.apost, p.seal) >= 2 && dd(p.apost, p.seal) <= 5, JSON.stringify(p));
        }
        await mkNav(page, '2026-12-31')('2027-01-01'); const d1 = await readDay(page);
        check('TR18k · SEX 01/01 mostra a apostila deixada por ela, com "⚠️ sexta de simulado — escolha sua"', d1.blocks.some(x => x.tm === 26 && x.ts === 'apost' && /⚠️ sexta de simulado — escolha sua/.test(x.text)), JSON.stringify(d1.blocks.map(x => x.text.slice(0, 80))));
    });

    // TR18j · fio aplicado dentro da semana final (29/12), com o simulado religado em 01/01 (S3b — reescrito: 01/01 é dia comum): módulo 18 com a apostila deixada
    //          em 01/01, módulo 20 com a apostila pulando +1 dia (para SÁB 02/01; nada sem dia). Depois, a recolocação automática de 30/12 e a restauração do plano.
    //          Premissa gravada no seed (trilhaPlan explícito, orig igual), porque o motor novo pode pôr a selagem em 02/01: "ela fez tudo no dia" até a T9 (walkT)
    await scenario(browser, 'TR18j-fio-semana-final', '2026-10-26', {}, async (S) => {
        await walkT(S, '2026-12-22'); let page = await S.reopen('2026-12-28');
        { const c = await getLS(page, CFG), t = (await getLS(page, TRL)) || {}; const d = ['2026-12-28', '2026-12-29', '2026-12-30', '2027-01-02'];
          [18, 20].forEach(id => { const x = { aula: d[0], quest: d[1], apost: d[2], seal: d[3] }; c.trilhaPlan[id] = { ...c.trilhaPlan[id], ...x, orig: { ...x }, hist: [] }; }); // seed explícito (orig igual)
          delete t[18]; delete t[20]; // premissa: as cadeias de 18 e 20 são as do seed (registro limpo) — com o walkT elas já tinham sido feitas em dezembro
          c.simOverrides = { ...(c.simOverrides || {}), '2027-01-01': true }; markExcept(c, t, '2026-12-29', []); await setLS(page, CFG, c); await setLS(page, TRL, t); }
        page = await S.reopen('2026-12-29'); const nav = mkNav(page, '2026-12-29');
        let c = await getLS(page, CFG);
        check('TR18j · premissa: em 29/12 a recolocação automática rodou (simulado religado em 01/01: "…|1") e não mexeu nos módulos 18 e 20 (aula 28/12 feita, questões 29/12, apostila 30/12, selagem 02/01)', /^2026-12-29\|1$/.test(c.trilhaFinalAutoAt || '') && [18, 20].every(id => ['quest', 'apost', 'seal'].map(x => c.trilhaPlan[id][x]).join() === '2026-12-29,2026-12-30,2027-01-02' && !c.trilhaPlan[id].hist.length), JSON.stringify([c.trilhaPlan[18], c.trilhaPlan[20]]));
        await moveStageT(page, nav, 18, 'quest', '2026-12-29', '2026-12-31'); await clickAsk(page, 'Mover o fio todo (+2 dias)'); let sh = await readShift(page); logSh(sh);
        check('TR18j · módulo 18: questões para QUI 31/12 (+2): a apostila iria para SEX 01/01 (sexta de simulado) — o app pergunta', !!sh && sh.qs.length === 1 && sh.qs[0].ts === 'apost' && /⛔ A apostila iria para SEX 01\/01, que é sexta de simulado\./.test(sh.qs[0].text), sh && JSON.stringify(sh.qs));
        await answerQ(page, 'apost', 'Deixar neste dia'); await clickAsk(page, 'Aplicar'); await pronto(page);
        await moveStageT(page, nav, 20, 'quest', '2026-12-29', '2026-12-31'); await clickAsk(page, 'Mover o fio todo (+2 dias)'); await answerQ(page, 'apost', 'Pular +1 dia'); sh = await readShift(page); logSh(sh);
        check('TR18j · módulo 20: "Pular +1 dia" a partir de 01/01 leva a apostila para SÁB 02/01 e a selagem para TER 05/01 — nada sem dia; "Aplicar"', !!sh && /SÁB 02\/01/.test(rowT(sh, 'apost')) && /TER 05\/01/.test(rowT(sh, 'seal')) && !/sem dia/.test(sh.text) && sh.btns.includes('Aplicar'), sh && JSON.stringify(sh.rows));
        await clickAsk(page, 'Aplicar'); await pronto(page);
        c = await getLS(page, CFG); const a18 = c.trilhaPlan[18], a20 = c.trilhaPlan[20];
        check('TR18j · aplicado em 29/12: 18 = questões 31/12, apostila 01/01 (keep), selagem 04/01; 20 = questões 31/12, apostila 02/01, selagem 05/01 (sem keep)', a18.quest === '2026-12-31' && a18.apost === '2027-01-01' && a18.seal === '2027-01-04' && JSON.stringify(a18.keep) === JSON.stringify({ apost: '2027-01-01' }) && a20.quest === '2026-12-31' && a20.apost === '2027-01-02' && a20.seal === '2027-01-05' && !a20.keep, JSON.stringify([a18, a20]));
        page = await S.reopen('2026-12-30'); c = await getLS(page, CFG); const b18 = c.trilhaPlan[18], b20 = c.trilhaPlan[20];
        const show = (p) => ['aula', 'quest', 'apost', 'seal'].map(x => x + ' ' + (p[x] ? br(p[x]) : 'sem dia')).join(', ');
        console.log('   📦 30/12, depois da recolocação automática · 18:', show(b18), '· 20:', show(b20), '· log:', JSON.stringify(c.trilhaFinalLog && { moved: c.trilhaFinalLog.moved.filter(m => [18, 20].includes(m.id)), nocabe: c.trilhaFinalLog.nocabe.filter(m => [18, 20].includes(m.id)) }));
        check('TR18j · 30/12, recolocação automática: a apostila do módulo 18 continua em 01/01 (escolha dela); as etapas dele seguem em ordem (questões ficam até 31/12, aula até 01/01) e a selagem segue em janeiro, nas faixas', /^2026-12-30\|1$/.test(c.trilhaFinalAutoAt || '') && b18.apost === '2027-01-01' && JSON.stringify(b18.keep) === JSON.stringify({ apost: '2027-01-01' }) && !b18.hist.some(h => h.why === 'final' && h.ts === 'apost') && chainOk(b18) && b18.quest < '2027-01-01' && b18.seal > '2027-01-01' && dd(b18.apost, b18.seal) >= 2 && dd(b18.apost, b18.seal) <= 5, JSON.stringify(b18));
        check('TR18j · 30/12, recolocação automática: o módulo 20 (questões a 3 dias da aula depois do fio) é recolocado pela regra da semana final — as questões do 18 voltam para 30/12 (📚 8h cheio), 31/12 é 🎄 (📚 3h) e 01/01 é simulado: sem dia nas faixas, vai pelo guloso (uma etapa por dia livre, em ordem, em janeiro) e o 📦 o lista entre os comprimidos; em ordem, sem etapa em 01/01, com hist "final"', chainOk(b20) && b20.hist.some(h => h.why === 'final') && !STG.some(x => b20[x] === '2027-01-01') && b20.quest > '2027-01-01' && ((c.trilhaFinalLog || {}).compressed || []).includes(20), JSON.stringify(b20) + ' · 📦 ' + JSON.stringify(c.trilhaFinalLog));
        const btnRe = async (re) => { const ok = await page.evaluate((src) => { const b = [...document.querySelectorAll('button')].find(x => new RegExp(src).test(x.innerText.trim())); if (!b) return false; b.click(); return true; }, re.source); if (!ok) throw new Error('botão não encontrado: ' + re); await page.waitForTimeout(450); };
        await clickTab(page, 'TRILHA'); await btnRe(/^Ver o que mudou desde a atualização$/); await btnRe(/^Aplicar a restauração$/); if (await page.evaluate(() => [...document.querySelectorAll('button')].some(b => b.innerText.trim() === 'Aplicar mesmo assim'))) await btnRe(/^Aplicar mesmo assim$/);
        c = await getLS(page, CFG); const r18 = c.trilhaPlan[18], r20 = c.trilhaPlan[20]; console.log('   🧹 restaurado · 18:', show(r18), '· 20:', show(r20));
        check('TR18j · restaurar (em 30/12): os dois módulos voltam ao plano original (28/12, 29/12, 30/12, 02/01), sem a escolha guardada e sem o histórico dela nem a recolocação que veio por causa do fio; nenhum dia com duas etapas', [r18, r20].every(p => ['aula', 'quest', 'apost', 'seal'].map(x => p[x]).join() === '2026-12-28,2026-12-29,2026-12-30,2027-01-02' && !p.keep && !(p.hist || []).length && chainOk(p)), JSON.stringify([r18, r20]));
    });


    // ── TR19 · regra de 01/01 (desenho final §10.2) — entram no S4: TR19l (0b adaptado) e TR19d (cadeia que não fecha). As asserções que dependem do S5
    //    (texto X39 do balanço, partição = fila, "Aulas até 01/01" sobe 1) aparecem como "⏸ PENDENTE S5" na saída e viram check no S5 ──
    const WT = { aula: 'aula', quest: 'questões', apost: 'apostila', seal: 'selagem' };
    const semDiaT = (c, t, day) => Object.entries((c && c.trilhaPlan) || {}).map(([id, p]) => { const x = (t || {})[id] || {}; if (STG.every(s => x[FIELD[s]]) || (day > '2027-01-01' && !STG.some(s => x[FIELD[s]]))) return null; const miss = STG.filter(s => !x[FIELD[s]] && !p[s]); return miss.length ? { id: Number(id), miss } : null; }).filter(Boolean); // re-derivado do config e do registro (§1.3): congelado aberto com etapa sem marca e sem dia; depois de 01/01, fora o módulo sem marca nenhuma (noAula, §4.3)
    const goDateT = async (page, iso) => { await clickTab(page, 'CRONOGRAMA'); for (let k = 0; k < 12; k++) { const tabs = await listDayTabs(page); if (tabs.some(t => t.date === br(iso))) { await clickDate(page, br(iso)); return true; } const f = tabs[0].date, fIso = (f.slice(3) <= '06' ? '2027' : '2026') + '-' + f.slice(3) + '-' + f.slice(0, 2); const h0 = await headerWeek(page); await navWeek(page, iso < fIso ? -1 : 1); if ((await headerWeek(page)).week === h0.week) return false; } return false; }; // anda ◀▶ até a semana do dia (a semana que abre depende do horizonte visível)
    const screenT = async (page, ids) => { await clickTab(page, 'CRONOGRAMA'); // o que a semana de hoje mostra: ⚠️, 📦, ⏳, balanço, painel; e, na aba Trilha, o cartão de cada módulo em "módulos desta semana"
        const tx = async (k) => { const b = await banner(page, k); return b ? b.text : ''; };
        const v = { cov: await tx('trilha-coverage'), fin: await tx('trilha-final'), pend: await tx('trilha-pending'), bal: await tx('trilha-balanco') };
        v.panel = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-t="trilha-panel"] [data-mod]')].map(e => [e.getAttribute('data-mod'), e.innerText.replace(/\n/g, ' | ')])));
        await clickTab(page, 'TRILHA'); v.cards = await page.evaluate((is) => Object.fromEntries(is.map(i => { const el = document.querySelector('[data-id="' + i + '"]:not([data-t])'); return [i, el ? el.innerText.split('\n').map(s => s.trim()).filter(Boolean) : null]; })), ids); await clickTab(page, 'CRONOGRAMA');
        return v; };
    const dayT = async (S, day, skip) => { const c = await getLS(S.page, CFG), t = (await getLS(S.page, TRL)) || {}; markExcept(c, t, day, skip); await setLS(S.page, TRL, t); if (c.manualWeek != null) { c.manualWeek = null; await setLS(S.page, CFG, c); } return S.reopen(day); }; // ela fez tudo até o dia, menos `skip`; o ◀▶ do teste (manualWeek) volta ao automático, para o Cronograma abrir na semana de hoje
    const covLine = (code, title, miss) => '⚠️ ' + code + ' (' + title + ') aberto — ' + miss.map(s => WT[s]).join(', ') + ' sem dia.';
    const SUF_AULA = ' A aula só tem dia até 01/01: se você assistiu, marque no bloco do dia em que assistiu.';
    // checks do TR19l em cada dia de 29/12 a 01/01 (o mesmo para A′ e B′): toda etapa sem dia aparece — ⚠️ (X22), painel e aba Trilha ("sem dia", X31), 📦 (X23), ⏳ (X25/aula atrasada)
    const tr19lDay = async (S, tag, day, M, lbl) => { const page = S.page; const c = await getLS(page, CFG), t = (await getLS(page, TRL)) || {}; const sd = semDiaT(c, t, day), pM = c.trilhaPlan[M], sM = sd.find(x => x.id === M);
        const v = await screenT(page, sd.map(x => x.id).concat([M]));
        console.log('   📋 ' + tag + ' ' + br(day) + ' · plano ' + M + ': ' + STG.map(s => WT[s] + ' ' + (pM[s] ? br(pM[s]) : 'sem dia')).join(', ') + ' · sem dia (config): ' + JSON.stringify(sd) + ' · log noAula: ' + JSON.stringify(((c.trilhaFinalLog || {}).noAula) || []));
        console.log('      ⚠️ ' + (v.cov.replace(/\n/g, ' / ') || '(nenhum)')); console.log('      📦 ' + (v.fin || '(nenhum)')); console.log('      ⏳ ' + (v.pend.split('\n')[0] || '(nenhum)')); console.log('      🗂️ painel ' + lbl + ': ' + (v.panel[lbl] || '(fora)') + ' · aba Trilha: ' + JSON.stringify(v.cards[M]));
        if (!sd.length) return 0;
        const bad = sd.filter(x => { const cd = v.cards[x.id]; if (!cd || cd.length < 2) return true; const line = covLine(cd[0], cd[1], x.miss); return !v.cov.includes(line) || !x.miss.every(s => cd.join(' ').includes(WT[s] + ' sem dia')); });
        check('TR19l-' + tag + ' · ' + br(day) + ': as ' + sd.reduce((a, x) => a + x.miss.length, 0) + ' etapa(s) sem dia do plano (' + sd.map(x => x.id + ':' + x.miss.map(s => WT[s]).join('+')).join(', ') + ') estão TODAS no aviso ⚠️ ("CÓD (título) aberto — … sem dia.", X22) e no cartão da aba Trilha ("… sem dia", X31) — nenhuma some calada', !bad.length, JSON.stringify({ bad, cov: v.cov, cards: v.cards }));
        if (sM) {
            const stuck = !(t[M] || {}).aula && (!pM.aula || pM.aula < day);
            check('TR19l-' + tag + ' · ' + br(day) + ': ' + lbl + ' — o ⚠️ diz "' + covLine(lbl.split(' · ')[0], lbl.split(' · ')[1], sM.miss) + (stuck ? SUF_AULA : '') + '" (sufixo do X22: a aula sem marca não tem dia novo até 01/01)', v.cov.includes(covLine(lbl.split(' · ')[0], lbl.split(' · ')[1], sM.miss) + (stuck ? SUF_AULA : '')), v.cov);
            const pn = v.panel[lbl] || '';
            check('TR19l-' + tag + ' · ' + br(day) + ': o painel da semana mostra ' + lbl + ' com "sem dia" (não "—") nas etapas sem dia (X31)', !!pn && sM.miss.every(s => pn.includes(WT[s] + ' sem dia')) && !/ —( ·|$)/.test(pn), pn);
            check('TR19l-' + tag + ' · ' + br(day) + ': o ⏳ traz o módulo (a aula de ' + br(pM.aula || day) + ' sem marca)', v.pend.includes(lbl.split(' · ')[0] + ' · '), v.pend.split('\n')[0]); }
        if (v.fin) { check('TR19l-' + tag + ' · ' + br(day) + ': o 📦 da semana final não diz "o que estava aberto já está nos dias planejados" com etapa sem dia (X23)', !/já está nos dias planejados/.test(v.fin), v.fin);
            if ((((c.trilhaFinalLog || {}).noAula) || []).includes(M)) check('TR19l-' + tag + ' · ' + br(day) + ': o 📦 diz "Aula sem outro dia até 01/01: ' + lbl.split(' · ')[0] + '" (log noAula, C4)', new RegExp('Aula sem outro dia até 01/01: ([A-Z0-9]+(?:, | e ))*' + escT(lbl.split(' · ')[0]) + '[ ,]').test(v.fin), v.fin); }
        return sM ? 1 : 0; };
    // em 02/01 (depois de 01/01): o módulo sem nenhuma marca vira "aula não assistida até 01/01" (§4.3) — sai do ⚠️, do ⏳ e dos dias; o bloco da aula fica; vai para o balanço
    const tr19lAfter = async (S, tag, M, lbl, aulaIso, hiddenIso) => { const page = S.page; const code = lbl.split(' · ')[0], title = lbl.split(' · ')[1]; const v = await screenT(page, [M]);
        console.log('   📋 ' + tag + ' 02/01 · ⚠️ ' + (v.cov.replace(/\n/g, ' / ') || '(nenhum)') + ' · ⏳ ' + (v.pend.split('\n')[0] || '(nenhum)') + ' · balanço: ' + v.bal.replace(/\n/g, ' / ').slice(0, 600));
        check('TR19l-' + tag + ' · 02/01: ' + lbl + ' (nenhuma etapa marcada) sai do aviso ⚠️ e do ⏳ — aula não assistida até 01/01 (§4.3)', !v.cov.includes(code + ' (' + title + ')') && !v.pend.includes(code + ' · '), JSON.stringify([v.cov, v.pend]));
        console.log('   ⏸ PENDENTE S5 (TR19l-' + tag + '): ' + lbl + ' no balanço com "Aula não assistida até 01/01: ' + code + ' (planejada …)" (X39) e partição closed+ended+open+noAula+preAula+out = fila — o balanço de antes do S5 lista a fila toda em "Fora do alcance", então o código ali não prova nada (check tirado: conferência S4, menor 5)');
        const okA = await goDateT(page, aulaIso); const dA = okA ? await readDay(page) : { blocks: [] };
        check('TR19l-' + tag + ' · 02/01: o bloco da aula de ' + lbl + ' continua em ' + br(aulaIso) + ' (C4: é por ali que ela marca)', okA && dA.blocks.some(b => b.tm === M && b.ts === 'aula' && !b.au), JSON.stringify(dA.blocks.map(b => (b.tm || '') + ':' + (b.ts || '') + ' ' + b.text.slice(0, 50))));
        for (const h of hiddenIso) { const ok = await goDateT(page, h); const d = ok ? await readDay(page) : { blocks: [] };
            check('TR19l-' + tag + ' · 02/01: ' + br(h) + ' não mostra mais etapa nem linha ↷ de ' + lbl + ' (sem questões sem aula)', ok && !d.blocks.some(b => b.tm === M) && !d.blocks.some(b => new RegExp('^↷ Trilha · ' + escT(code) + ' — ').test(b.text)), JSON.stringify([ok, d.blocks.map(b => (b.tm || '') + ':' + (b.ts || '') + ' ' + b.text.slice(0, 60))])); }
    };
    // TR19l A′ · simulado religado em 01/01 + "Deixar neste dia" na apostila de PED2 (26) em 01/01; aula e questões do 26 sem marca, de 29/12 a 02/01
    await scenario(browser, 'TR19l-a-simulado-0101-deixar-apostila', '2026-10-26', {}, async (S) => {
        await walkT(S, '2026-12-22'); let page = await prepT(S, '2026-12-22', (c, t) => { c.simOverrides = { ...(c.simOverrides || {}), '2027-01-01': true }; markExcept(c, t, '2026-12-29', [26]); });
        const nav = mkNav(page, '2026-12-22');
        await moveStageT(page, nav, 26, 'aula', '2026-12-27', '2026-12-29'); await clickAsk(page, 'Mover o fio todo (+2 dias)'); await answerQ(page, 'apost', 'Deixar neste dia'); await clickAsk(page, 'Aplicar'); await pronto(page);
        const p0 = (await getLS(page, CFG)).trilhaPlan[26];
        check('TR19l-a · premissa (22/12): PED2 (26) com a apostila deixada em SEX 01/01 (sexta de simulado, keep) e aula/questões antes', p0.apost === '2027-01-01' && JSON.stringify(p0.keep) === JSON.stringify({ apost: '2027-01-01' }) && p0.aula < '2027-01-01' && p0.quest < '2027-01-01', JSON.stringify(p0));
        let n = 0;
        for (const day of ['2026-12-29', '2026-12-30', '2026-12-31', '2027-01-01']) { await dayT(S, day, [26]); n += await tr19lDay(S, 'a', day, 26, 'PED2 · Aleitamento Materno'); }
        check('TR19l-a · PREMISSA (testes I11): em pelo menos um dia de 29/12 a 01/01 o PED2 tem etapa sem dia no plano (senão o teste não prova nada)', n > 0, n + ' dia(s)');
        await dayT(S, '2027-01-02', [26]);
        const p2 = (await getLS(S.page, CFG)).trilhaPlan[26]; await tr19lAfter(S, 'a', 26, 'PED2 · Aleitamento Materno', p2.aula, ['2026-12-31', p2.apost].filter(Boolean)); // 31/12: as linhas ↷ das questões (→ sem dia); 01/01: a apostila deixada por ela
    });
    // TR19l B′ · 30/12 e 01/01 editados à mão; a aula de HEM1 Anemias I (27) de SEG 28/12 sem marca: a recolocação não acha dia até 01/01 (29/12 dia leve, 31/12 feriado) — de 29/12 a 02/01
    await scenario(browser, 'TR19l-b-dias-editados-aula-2812', '2026-10-26', {}, async (S) => {
        await walkT(S, '2026-12-22'); let page = await prepT(S, '2026-12-22', (c, t) => { markExcept(c, t, '2026-12-29', [27]); });
        { const ed = [{ id: 'e1', d: 'ANKI', color: '#0369A1', text: 'Anki + Meditação 15min', time: '35min' }, { id: 'e2', d: 'LAZER', color: '#6B7280', text: 'Noite livre', time: 'livre' }]; const sch = (await getLS(page, SCH)) || {}; sch['2026-12-30'] = ed; sch['2027-01-01'] = ed; await setLS(page, SCH, sch); }
        const p0 = (await getLS(page, CFG)).trilhaPlan[27];
        check('TR19l-b · premissa (22/12): HEM1 Anemias I (27) com a aula em SEG 28/12 e o resto depois; 30/12 e 01/01 editados à mão', p0.aula === '2026-12-28' && p0.quest > '2026-12-28', JSON.stringify(p0));
        let n = 0;
        for (const day of ['2026-12-29', '2026-12-30', '2026-12-31', '2027-01-01']) { await dayT(S, day, [27]); n += await tr19lDay(S, 'b', day, 27, 'HEM1 · Anemias I — Ferropriva, Megaloblástica, Doença Crônica');
            if (day === '2026-12-29') { const p = (await getLS(S.page, CFG)).trilhaPlan[27]; const okA = await goDateT(S.page, '2026-12-28'); const dA = okA ? await readDay(S.page) : { blocks: [] };
                check('TR19l-b · 29/12: a aula sem outro dia até 01/01 FICA no bloco de SEG 28/12 (C4), sem hist, e as seguintes ficam sem dia com hist "final"', p.aula === '2026-12-28' && !p.hist.some(h => h.ts === 'aula' && h.why === 'final') && ['quest', 'apost', 'seal'].every(s => p[s] === null && p.hist.some(h => h.ts === s && h.why === 'final' && h.to === null)) && dA.blocks.some(b => b.tm === 27 && b.ts === 'aula'), JSON.stringify(p));
                const okS = await goDateT(S.page, p0.seal); const dS = okS ? await readDay(S.page) : { blocks: [] };
                check('TR19l-b · 29/12: no dia em que a selagem estava (' + br(p0.seal) + '), a linha ↷ diz "↷ Trilha · HEM1 — selagem sem dia (veja o aviso ⚠️ e o ⏳)" (X03)', okS && dS.blocks.some(b => b.text === '↷ Trilha · HEM1 — selagem sem dia (veja o aviso ⚠️ e o ⏳)'), JSON.stringify([okS, dS.blocks.filter(b => /^↷/.test(b.text)).map(b => b.text)])); } }
        check('TR19l-b · PREMISSA (testes I11): em pelo menos um dia de 29/12 a 01/01 o HEM1 Anemias I tem etapa sem dia no plano', n > 0, n + ' dia(s)');
        await dayT(S, '2027-01-02', [27]);
        await tr19lAfter(S, 'b', 27, 'HEM1 · Anemias I — Ferropriva, Megaloblástica, Doença Crônica', '2026-12-28', [p0.seal]);
    });

    // TR19d · cadeia que não fecha (§10.2). (i) aula feita em 30/12 e o resto não → abre em 02/01, 05/01 e 20/01; (ii) aula não feita até 01/01 → 02/01; depois ela marca a aula no bloco
    const plan19d = (pl) => ({ ...baseCfg, trilhaWeeks: { '2026-12-22': { q: Object.keys(pl).length, base: 4, held: false, why: null, mods: Object.keys(pl).map(Number), adv: [], rise: [] } }, trilhaPlan: mkPlan(pl, '2026-12-22') });
    const CH19d = ['2026-12-30', '2026-12-31', '2027-01-01', '2027-01-04'];
    await scenario(browser, 'TR19d-i-aula-feita-3012-resto-nao', '2026-12-29', { [CFG]: plan19d({ 19: CH19d }) }, async (S) => {
        let page = S.page; const c0 = await getLS(page, CFG);
        check('TR19d-i · premissa (29/12): CIR2 Cicatrização (19) com aula 30/12, questões 31/12, apostila 01/01, selagem 04/01 (a recolocação de 29/12 não mexe: tudo válido)', ['aula', 'quest', 'apost', 'seal'].map(s => c0.trilhaPlan[19][s]).join() === '2026-12-30,2026-12-31,2027-01-01,2027-01-04', JSON.stringify(c0.trilhaPlan[19]));
        { const t = (await getLS(page, TRL)) || {}; t[19] = { aula: true, aulaAt: '2026-12-30' }; await setLS(page, TRL, t); } // ela assistiu a aula em 30/12 e não fez o resto
        for (const day of ['2027-01-02', '2027-01-05', '2027-01-20']) { page = await S.reopen(day); await clickTab(page, 'CRONOGRAMA');
            const hw = await headerWeek(page), tabs = await listDayTabs(page); const pend = await banner(page, 'trilha-pending');
            let pv = null; if (pend) { await clickIn(page, 'trilha-pending', 'Ver como recolocar'); pv = await banner(page, 'trilha-pending'); }
            console.log('   ⏳ ' + br(day) + ' · Sem.' + hw.week + ' ' + hw.range + ' · ' + (pv ? pv.text.replace(/\n/g, ' / ').slice(0, 400) : '(sem ⏳)'));
            check('TR19d-i · ' + br(day) + ': a semana de hoje está visível (garantia a: Sem. com ' + br(day) + ')', tabs.some(t => t.date === br(day)), JSON.stringify([hw, tabs.map(t => t.date)]));
            check('TR19d-i · ' + br(day) + ': ⏳ com CIR2 · Cicatrização e "Ver como recolocar" propõe questões, apostila e selagem em janeiro, a partir de hoje', !!pv && /CIR2 · Cicatrização de Feridas e Queimaduras · questões \S+ (\d\d)\/01 .*apostila \S+ \d\d\/01 .*selagem \S+ \d\d\/0[12]/.test(pv.text) && pv.btns.includes('Aplicar'), pv && pv.text.slice(0, 500));
            if (pv) await clickIn(page, 'trilha-pending', 'Cancelar'); }
        const c1 = await getLS(page, CFG);
        check('TR19d-i: sem Aplicar, o plano do 19 não muda (nada se move sozinho depois de 01/01)', JSON.stringify(['aula', 'quest', 'apost', 'seal'].map(s => c1.trilhaPlan[19][s])) === JSON.stringify(['aula', 'quest', 'apost', 'seal'].map(s => c0.trilhaPlan[19][s])), JSON.stringify(c1.trilhaPlan[19]));
    });
    await scenario(browser, 'TR19d-ii-aula-nao-assistida-ate-0101', '2026-12-29', { [CFG]: plan19d({ 14: CH19d, 26: ['2026-12-28', '2026-12-30', '2027-01-01', '2027-01-04'] }), [TRL]: { 26: { aula: true, aulaAt: '2026-12-28' } } }, async (S) => { // + PED2 (26) com a aula de 28/12 feita: a cauda fica viva e a semana de hoje (C1) aparece, com o ⏳ dele — assim o "CIR2 fora do ⏳" confere de verdade
        let page = S.page; const c0 = await getLS(page, CFG); const pl = c0.trilhaPlan[14];
        check('TR19d-ii · premissa (29/12): CIR2 Urologia (14) com aula 30/12, questões 31/12, apostila 01/01, selagem 04/01, nada marcado; PED2 (26) com a aula de 28/12 marcada e o resto planejado (30/12, 01/01, 04/01)', ['aula', 'quest', 'apost', 'seal'].map(s => pl[s]).join() === '2026-12-30,2026-12-31,2027-01-01,2027-01-04' && ['quest', 'apost', 'seal'].map(s => c0.trilhaPlan[26][s]).join() === '2026-12-30,2027-01-01,2027-01-04', JSON.stringify([pl, c0.trilhaPlan[26]]));
        page = await S.reopen('2027-01-02'); // o app ficou fechado de 30/12 a 01/01
        const cov = (await banner(page, 'trilha-coverage')) || { text: '' }, pend = (await banner(page, 'trilha-pending')) || { text: '' }, bal = (await banner(page, 'trilha-balanco')) || { text: '' };
        console.log('   📋 02/01 · ⚠️ ' + (cov.text || '(nenhum)') + ' · ⏳ ' + (pend.text.split('\n')[0] || '(nenhum)') + ' · balanço: ' + bal.text.replace(/\n/g, ' / ').slice(0, 500));
        check('TR19d-ii · 02/01: o ⏳ da semana de hoje (C1) traz o PED2 (cadeia aberta) e NÃO traz o CIR2 Urologia, que também não está no aviso ⚠️ (aula não assistida até 01/01: não é cadeia aberta)', /PED2 · /.test(pend.text) && !/CIR2/.test(pend.text) && !/CIR2/.test(cov.text), JSON.stringify([pend.text, cov.text]));
        const seen = []; for (const d of ['2026-12-30', '2026-12-31', '2027-01-01', '2027-01-04']) { const ok = await goDateT(page, d); const dy = ok ? await readDay(page) : { blocks: [] }; seen.push([d, ok, dy.blocks.filter(b => b.tm === 14 || /^↷ Trilha · CIR2/.test(b.text)).map(b => b.ts || b.text.slice(0, 40))]); }
        console.log('   🗓️ blocos do 14 em 30/12, 31/12, 01/01 e 04/01:', JSON.stringify(seen));
        check('TR19d-ii · 02/01: o bloco da aula continua em QUA 30/12 (C4) e questões (31/12), apostila (01/01) e selagem (04/01) não aparecem em nenhum dia', seen.every(([, ok]) => ok) && JSON.stringify(seen[0][2]) === '["aula"]' && seen.slice(1).every(([, , b]) => !b.length), JSON.stringify(seen));
        console.log('   ⏸ PENDENTE S5 (TR19d-ii): o balanço diz "Aula não assistida até 01/01: CIR2 (planejada QUA 30/12)" (X39) — o balanço de antes do S5 lista a fila toda em "Fora do alcance" e "CIR2" também é a Cicatrização (check tirado: conferência S4, menor 5)');
        // ela assistiu e marca a aula no bloco de 30/12 (carimbo = dia do bloco)
        await goDateT(page, '2026-12-30'); const dA = await readDay(page); const bA = dA.blocks.find(b => b.tm === 14 && b.ts === 'aula');
        await clickTask(page, new RegExp('^' + escT(bA.text.slice(0, 60))), null);
        const t1 = (await getLS(page, TRL)) || {};
        check('TR19d-ii · ✓ no bloco de 30/12: aula marcada com carimbo 30/12 (o dia do bloco)', !!(t1[14] || {}).aula && t1[14].aulaAt === '2026-12-30', JSON.stringify(t1[14]));
        await goDateT(page, '2027-01-02'); const pend2 = await banner(page, 'trilha-pending');
        if (pend2) await clickIn(page, 'trilha-pending', 'Ver como recolocar'); const pv = await banner(page, 'trilha-pending');
        console.log('   💡 depois da marca: ' + (pv ? pv.text.replace(/\n/g, ' / ').slice(0, 500) : '(sem ⏳)'));
        check('TR19d-ii · depois da marca a cadeia volta: o ⏳ traz CIR2 · Urologia e "Ver como recolocar" propõe questões, apostila e selagem em janeiro', !!pv && /CIR2 · Urologia · questões \S+ \d\d\/01 [^|]*apostila \S+ \d\d\/01 [^|]*selagem \S+ \d\d\/0[12]/.test(pv.text) && pv.btns.includes('Aplicar'), pv && pv.text.slice(0, 500));
        if (pv) await clickIn(page, 'trilha-pending', 'Aplicar');
        const p2 = (await getLS(page, CFG)).trilhaPlan[14];
        check('TR19d-ii · Aplicar grava questões, apostila e selagem a partir de 02/01, em ordem, com hist "recolocar"; a aula fica em 30/12', p2.aula === '2026-12-30' && p2.quest >= '2027-01-02' && p2.quest < p2.apost && p2.apost < p2.seal && ['quest', 'apost', 'seal'].every(s => p2.hist.some(h => h.ts === s && h.why === 'recolocar')), JSON.stringify(p2));
        console.log('   ⏸ PENDENTE S5 (TR19d-ii): "Aulas até 01/01" sobe 1 depois da marca (carimbo 30/12)');
    });
    // TR19d-iii · semana T que NÃO congelou até 01/01 (conferência S4, bloqueante; S4_fix1): o app ficou fechado de 22/12 a 02/01, então a T9 e a T10 nunca congelam (guarda do S2_fix1)
    //   e a prévia da T9 fica no plano com a aula no passado sem marca. Depois de 01/01 ela é "aula não assistida até 01/01" como o congelado (§4.3): só o bloco da aula fica (C4),
    //   questões/apostila/selagem não aparecem em dia nenhum (sem questões sem aula), nada é gravado; se ela marcar a aula no bloco, a cadeia volta. PED2 (26) aberto mantém a cauda viva.
    await scenario(browser, 'TR19d-iii-semana-T9-sem-congelar', '2027-01-02', { [CFG]: { ...baseCfg, trilhaFirstOpen: '2026-12-15', trilhaWeeks: { '2026-12-15': { q: 1, base: 5, held: false, why: null, mods: [26], adv: [], rise: [] } }, trilhaPlan: mkPlan({ 26: ['2026-12-16', '2026-12-17', '2026-12-30', '2027-01-04'] }, '2026-12-15') }, [TRL]: { 26: { aula: true, aulaAt: '2026-12-16', questoesD2: true, questoesD2At: '2026-12-17' } } }, async (S) => {
        const page = S.page; const c0 = await getLS(page, CFG); const pk = (c) => JSON.stringify([Object.keys(c.trilhaWeeks || {}).filter(k => k <= '2027-01-01').sort(), Object.keys(c.trilhaPlan || {})]);
        check('TR19d-iii · premissa (02/01): a T9 (22/12) e a T10 (29/12) não congelaram e o trilhaPlan só tem o PED2 (26) — app fechado de 22/12 a 02/01', pk(c0) === '[["2026-12-15"],["26"]]', pk(c0));
        await clickTab(page, 'CRONOGRAMA'); const hw = await headerWeek(page); const jan = {};
        for (const t of await listDayTabs(page)) { await clickDate(page, t.date); const d = await readDay(page); jan[t.date] = d.blocks.filter(b => (b.tm != null && b.tm !== 26) || (/^↷ Trilha/.test(b.text) && !/^↷ Trilha · PED2/.test(b.text))).map(b => (b.tm || '') + ':' + (b.ts || '') + ' ' + b.text.slice(0, 60)); }
        const panel = await page.evaluate(() => [...document.querySelectorAll('[data-t="trilha-panel"] [data-mod]')].map(e => e.getAttribute('data-mod')));
        const cov = (await banner(page, 'trilha-coverage')) || { text: '' }, pend = (await banner(page, 'trilha-pending')) || { text: '' };
        console.log('   📋 02/01 · Sem.' + hw.week + ' ' + hw.range + ' · outros blocos: ' + JSON.stringify(jan) + ' · painel: ' + JSON.stringify(panel) + ' · ⚠️ ' + (cov.text || '(nenhum)') + ' · ⏳ ' + (pend.text.split('\n')[0] || '(nenhum)'));
        check('TR19d-iii · 02/01: nenhum dia da semana de hoje (' + hw.range + ') mostra bloco ou linha ↷ de módulo com a aula sem marca — só o PED2 (sem "selagem sem aula")', Object.keys(jan).includes('02/01') && Object.values(jan).every(x => !x.length), JSON.stringify(jan));
        check('TR19d-iii · 02/01: o painel da semana de hoje traz só o PED2 (nenhum módulo da prévia da T9 como "CONTINUA")', panel.length > 0 && panel.every(m => /^PED2 · /.test(m)), JSON.stringify(panel));
        check('TR19d-iii · 02/01: o ⏳ traz o PED2 e nem o ⏳ nem o aviso ⚠️ citam módulo da prévia da T9', /PED2 · /.test(pend.text) && !/CIR\d/.test(pend.text) && !/CIR\d/.test(cov.text), JSON.stringify([pend.text, cov.text]));
        const old = {}; for (const iso of ['2026-12-29', '2026-12-22']) { if (!(await goDateT(page, iso))) { old[iso] = null; continue; } Object.entries(await readWeekT(page)).forEach(([dm, d]) => { d.blocks.filter(b => b.tm != null && b.tm !== 26).forEach(b => { (old[b.tm] = old[b.tm] || []).push(b.ts + ' ' + dm + (b.au ? ' (au)' : '')); }); }); }
        console.log('   🗓️ T9/T10, blocos de outros módulos: ' + JSON.stringify(old));
        const mods = Object.keys(old).filter(k => /^\d+$/.test(k));
        console.log('   ⏸ PARA O ORQUESTRADOR (S4_fix2, LOG — conflito antes do S5): quantos módulos da prévia da T9/T10 mostram o bloco da aula depois de 01/01 depende da decisão (i)/(ii)/(iii) — aqui ' + mods.length + ' (' + mods.join(', ') + '); não travado por check');
        check('TR19d-iii · 02/01: na T9 e na T10, dos módulos da prévia só pode aparecer o bloco da AULA (C4: é por ali que ela marca) — nenhuma questões, apostila ou selagem', mods.every(k => old[k].every(x => /^aula /.test(x))) && !Object.values(old).some(v => v === null), JSON.stringify(old));
        const c1 = await getLS(page, CFG);
        check('TR19d-iii · 02/01: nada gravado — T9/T10 continuam sem congelar e o trilhaPlan só tem o PED2 (sem Aplicar)', pk(c1) === '[["2026-12-15"],["26"]]' && JSON.stringify(c1.trilhaPlan[26]) === JSON.stringify(c0.trilhaPlan[26]), pk(c1));
        // ela assistiu a aula de um módulo da prévia e marca no bloco do dia (carimbo = dia do bloco): a cadeia volta (§4.3, 💬)
        const M = Number(mods[0]); const dA = old[M] && old[M][0] ? old[M][0].split(' ')[1] : null; let back = null;
        if (dA) { const iso = (dA.slice(3) <= '06' ? '2027' : '2026') + '-' + dA.slice(3) + '-' + dA.slice(0, 2); await goDateT(page, iso); const d = await readDay(page); const b = d.blocks.find(x => x.tm === M && x.ts === 'aula');
            if (b) { await clickTask(page, new RegExp('^' + escT(b.text.slice(0, 60))), null); const t1 = (await getLS(page, TRL)) || {}; back = { stamp: (t1[M] || {}).aulaAt, seen: [] };
                for (const w of ['2026-12-22', '2026-12-29', '2027-01-02']) { await goDateT(page, w); Object.entries(await readWeekT(page)).forEach(([dm, dd2]) => dd2.blocks.filter(x => x.tm === M).forEach(x => back.seen.push(x.ts + ' ' + dm))); } } }
        console.log('   💡 depois de marcar a aula do ' + M + ' em ' + dA + ': ' + JSON.stringify(back) + ' · ⏳ ' + (((await banner(page, 'trilha-pending')) || { text: '(nenhum)' }).text.split('\n')[0]));
        if (mods.length) check('TR19d-iii · ✓ da aula do módulo ' + M + ' no bloco de ' + dA + ' (carimbo = dia do bloco): a cadeia volta — questões, apostila e selagem aparecem de novo nos dias (§4.3)', !!back && back.stamp && ['quest', 'apost', 'seal'].every(s => back.seen.some(x => x.startsWith(s + ' '))), JSON.stringify(back));
        else console.log('   ⏸ PENDENTE (S4_fix2, decisão do orquestrador): nenhum bloco de aula de prévia na T9/T10 — o ✓ da aula que traz a cadeia de volta não pôde ser conferido neste cenário');
        console.log('   ⏸ PARA O ORQUESTRADOR (S4_fix1, LOG): a semana T9 continua prévia (não congela depois de 01/01) — as etapas da cadeia que voltou ficam nos dias da prévia, mesmo os que já passaram, e não entram no ⏳ (pending só vê módulo congelado)');
    });

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
        check('"Ver como reorganizar" com 1 aula por dia: a aula de CIR1 · Trauma II teria de ir para 30/10 (já tem a aula de CIR2 · Urologia) ou 31/10 (dia leve) e a 2ª aula só entra pelo gatilho estrito (RM7) ⇒ "💡 Não consigo reacomodar sem quebrar outra regra…", sem "Aplicar" — e nada com TER 03/11 (plantão longo) nem SEX 06/11 (simulado)', /💡 Não consigo reacomodar sem quebrar outra regra/.test(ask2.text) && !ask2.btns.includes('Aplicar') && !/03\/11|06\/11/.test(ask2.text.split('💡')[1] || ''), ask2.text);
        const p6a = (await getLS(page, CFG)).trilhaPlan[6]; await clickAsk(page, 'Mover assim mesmo');
        const p6 = (await getLS(page, CFG)).trilhaPlan[6];
        check('"Mover assim mesmo": trilhaPlan[6].quest = 01/11 (hist "mover"); aula, apostila e selagem ficam; sem dias novos no schedule_v1', p6.quest === '2026-11-01' && p6.aula === p6a.aula && p6.apost === p6a.apost && p6.seal === p6a.seal && p6.hist.slice(-1)[0].why === 'mover' && !(await getLS(page, SCH)), JSON.stringify(p6));
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
        await navWeek(page, 1); const nT2 = await page.evaluate(() => [...document.querySelectorAll('[data-t="trilha-panel"] [data-mod]')].filter(e => e.getAttribute('data-kind') === 'novo').length); const hT2 = await page.evaluate(() => ((document.querySelector('[data-t="trilha-panel"]') || {}).innerText || '').split('\n')[0]); await navWeek(page, -1);
        check('a semana proporcional não segura a seguinte: prévia da T2 com ritmo 4 (a subida usa a cota cheia, 3 → 4) — e, com 1 aula por dia, 3 novos (o 4º não coube)', nT2 === 3 && /ritmo 4/.test(hT2) && !/semana de manutenção/.test(hT2), 'T2 novos=' + nT2 + ' · ' + hT2);
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
    // ── TR15e · 04/01 (cauda; regra de 01/01, S2): a decisão 73 vale até o fim do calendário — 02/01 e 03/01 tinham folga, então "2d em atraso." (mesmo resultado de antes) ──
    await scenario(browser, 'TR15e-revisao-depois-de-0101', '2027-01-04', { [TRL]: { 5: { aula: true, questoesD2: true, apostila: true, smartcard: true, aulaAt: '2026-12-15', questoesD2At: '2026-12-16', apostilaAt: '2026-12-17', smartcardAt: '2026-12-23', completedAt: '2026-12-23', accSelagem: 85 } } }, async (S) => {
        const st = await revStatus(S.page);
        check('04/01/2027 (cauda; revisão D+7 venceu 02/01): a decisão 73 vale na cauda — 02/01 e 03/01 tinham folga ⇒ "2d em atraso." (mesmo resultado); nenhum "o dia está cheio"', st.length >= 1 && st.every(x => x.text === '2d em atraso.') && !/o dia está cheio/.test(await bodyText(S.page)), JSON.stringify(st));
    });
    // ── TR15b · decisão 73 no limiar reduzido: dia de 04h30 (📚 a 5h) — a revisão que passaria de 5h de estudo vira opcional ──
    const tr15b = { ...mkTrail(plan3, '2026-11-24'), 60: { aula: true, questoesD2: true, apostila: true, smartcard: true, aulaAt: '2026-11-05', questoesD2At: '2026-11-06', apostilaAt: '2026-11-07', smartcardAt: '2026-11-15', completedAt: '2026-11-15', accSelagem: 85 } };
    const plan15b = { 24: ['2026-11-25', '2026-11-26', '2026-11-27', '2026-11-30'], 32: ['2026-11-27', '2026-11-29', '2026-11-30', '2026-12-03'], 34: ['2026-11-29', '2026-11-30', '2026-12-01', '2026-12-04'], 85: ['2026-11-25', '2026-11-26', '2026-11-27', '2026-11-30'] }; // premissa (S3b): a T5 exatamente como o motor anterior a congelava em 25/11 (medido no vm com o planner do S2: 24 e 85 com aula em 25/11 → 4,40h de estudo). O cenário testa a decisão 73 no limiar de 5h, não a colocação: com 1 aula por dia o congelamento de 25/11 deixa o dia com 3,45h e a revisão cabe
    const cfg15b = { ...cfg3, trilhaWeeks: { ...cfg3.trilhaWeeks, '2026-11-24': { q: 4, base: 5, held: true, why: 'madrugada', mods: [24, 32, 34, 85], adv: [], rise: [], short: 0, light: '2026-11-28', at: '2026-11-25' } }, trilhaPlan: { ...cfg3.trilhaPlan, ...mkPlan(plan15b, '2026-11-24') } };
    await scenario(browser, 'TR15b-revisao-limiar-reduzido-2511', '2026-11-25', { [CFG]: cfg15b, [TRL]: tr15b }, async (S) => {
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

    // ── dia leve previsto: aula nunca no dia leve; etapa ali só de menor demanda e sinalizada (10 semanas da Trilha; a transição não tem 🌿) ·
    //    semanas da cauda (regra de 01/01, S2 — 🧠 DELA 6): nenhum dia leve previsto, seletor "Auto · —" com o aviso X27; reaberto em 10/12 para a cauda existir ──
    const X27 = '🌿 Nas semanas de janeiro nenhum dia leve é previsto — se quiser, escolha um dia no seletor.';
    await scenario(browser, 'TRleve-dia-leve-previsto', '2026-10-19', {}, async (S) => {
        let page = S.page; await navWeek(page, 2); const bad = [], flagged = [], lights = [], tail = [];
        for (let k = 0; k < 10; k++) { const w = await readWeekT(page); const any = Object.values(w)[0]; const L = any.light && any.light.note ? any.light.note.slice(0, 9) : null; lights.push(L);
            Object.entries(w).forEach(([d, x]) => { if (x.lightBadge || x.breatherBadge || (L && L.slice(4) === d)) { x.blocks.forEach(b => { if (b.ts === 'aula' && !b.au) bad.push(d); if (b.tm != null && !b.au) { if ((b.ts === 'quest' ? /🌿 dia leve — questões no dia leve só como última saída: se der, mova para outro dia/ : /🌿 dia leve — etapa de menor demanda/).test(b.text)) flagged.push(d + ' ' + b.ts); else bad.push(d + ' sem sinal'); } }); } }); // X02 (S3a/S3b; testes I4): questões no dia leve só com o aviso da última saída
            if (k < 9) await navWeek(page, 1); }
        console.log('   dias leves previstos:', lights.join(' · '));
        check('um dia leve previsto em cada uma das 10 semanas (a 1ª, de 8 dias: SÁB 31/10)', lights.length === 10 && lights.every(Boolean) && lights[0] === 'SÁB 31/10', lights.join(' · '));
        check('nenhuma aula no dia leve previsto; etapa no dia leve só sinalizada ("🌿 dia leve — etapa de menor demanda"; questões: "🌿 dia leve — questões no dia leve só como última saída…", X02)', !bad.length, bad.join(', ') + ' | sinalizadas: ' + flagged.join(', '));
        // cauda: em 10/12 (1º acesso; a T7 congela e as selagens dela + 30 levam o calendário a janeiro), ▶ até a última semana visível
        page = await S.reopen('2026-12-10');
        for (let g = 0; g < 30; g++) { const h0 = await headerWeek(page); await navWeek(page, 1); const h1 = await headerWeek(page); if (h1.week === h0.week) break; if (h1.week <= 52) continue;
            const w = await readWeekT(page); const any = Object.values(w)[0]; tail.push({ week: h1.week, range: h1.range, auto: any.light && any.light.auto, value: any.light && any.light.value, note: any.light && any.light.note, selo: Object.values(w).some(x => x.lightBadge || x.breatherBadge) }); }
        console.log('   semanas da cauda (em 10/12):', tail.map(t => 'Sem.' + t.week + ' ' + t.range + ' · ' + t.auto).join(' · '));
        check('semanas da cauda até a última visível (em 10/12: ' + tail.length + ', a 1ª = C1 02/01–04/01): nenhum dia leve previsto — seletor "Auto · —" com o aviso "' + X27 + '", sem selo de dia leve', tail.length >= 1 && tail[0].range === '02/01–04/01' && tail.every(t => t.auto === 'Auto · —' && t.value === 'auto' && t.note === X27 && !t.selo), JSON.stringify(tail));
    });

    // ── startDate 14/01: a numeração do curso muda, a Trilha não ──
    await scenario(browser, 'TRstart-1401', '2026-10-26', { [CFG]: { startDate: '2026-01-14', manualWeek: null } }, async (S) => {
        const page = S.page; const hw = await headerWeek(page); const body = await bodyText(page);
        const cfg = await getLS(page, CFG);
        check('startDate 14/01: Sem.42 = T1 26/10–02/11, badge "Trilha 1/10", trilhaWeeks["2026-10-26"].mods = [5, 6, 14]', hw.week === 42 && hw.range === '26/10–02/11' && /Trilha 1\/10/.test(body) && JSON.stringify(cfg.trilhaWeeks['2026-10-26'].mods) === '[5,6,14]', JSON.stringify(hw));
        await navWeek(page, -1); const h0 = await headerWeek(page);
        check('◀ Sem.41 = transição 20/10–25/10', h0.week === 41 && h0.range === '20/10–25/10' && /(^|\n)Transição(\n|$)/.test(await bodyText(page)), JSON.stringify(h0));
        await navWeek(page, 12); const h2 = await headerWeek(page);
        check('▶ para na última semana visível: Sem.52 = C1, 02/01–04/01 (a prévia tem selagem em janeiro — teto por etapa e decisão 7)', h2.week === 52 && h2.range === '02/01–04/01', JSON.stringify(h2));
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
        // nesta versão ela tira a academia E a nota de QUA 21/10 e muda o Anki para 30min e esvazia o SÁB 24/10; e uma aba
        // antiga (versão de 20/10) move o PLAN para a SEX 23/10, já gravada por esta versão: ao abrir de novo, as edições dela ficam e só a 23/10 é refeita
        await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('medplanner_schedule_v1'));
            s['2026-10-21'] = s['2026-10-21'].filter(a => a.d !== 'GYM' && !a.tn).map(a => a.d === 'ANKI' ? { ...a, time: '30min' } : a);
            s['2026-10-24'] = [];
            s['2026-10-23'] = s['2026-10-23'].concat([{ id: 'g-2026-10-24-1', d: 'PLAN', color: '#0F766E', text: 'Implementação de intenção + RECOMPENSA por escrito · pomodoros: aba Trilha · backup semanal', time: '15min' }]);
            localStorage.setItem('medplanner_schedule_v1', JSON.stringify(s)); const c = JSON.parse(localStorage.getItem('medplanner_config_v1')); c.manualWeek = null; localStorage.setItem('medplanner_config_v1', JSON.stringify(c)); });
        const schE = await getLS(page, SCH), arcC = JSON.parse(await page.evaluate(() => localStorage.getItem('medplanner_schedule_archive_v1')));
        page = await S.reopen('2026-10-27'); const schR = await getLS(page, SCH), arcR = JSON.parse(await page.evaluate(() => localStorage.getItem('medplanner_schedule_archive_v1')));
        check('QUA 21/10 editada nesta versão (sem a academia, sem a nota, Anki 30min) e SÁB 24/10 esvaziado: abrir de novo não desfaz as edições dela', JSON.stringify(schR['2026-10-21']) === JSON.stringify(schE['2026-10-21']) && !schR['2026-10-21'].some(a => a.d === 'GYM' || a.tn) && JSON.stringify(schR['2026-10-24']) === '[]', JSON.stringify([schR['2026-10-21'].map(a => a.d), schR['2026-10-24']]));
        check('SEX 23/10 com o PLAN que uma aba antiga moveu para lá: é refeita (sem PLAN, com o ✓ do Anki), o original vai para o arquivo; nenhum outro dia é arquivado de novo', !schR['2026-10-23'].some(a => a.d === 'PLAN') && schR['2026-10-23'].find(a => a.d === 'ANKI').done === true && (arcR['2026-10-23'] || []).length === (arcC['2026-10-23'] || []).length + 1 && ['2026-10-21', '2026-10-24', '2026-10-28'].every(d => (arcR[d] || []).length === (arcC[d] || []).length), JSON.stringify([schR['2026-10-23'].map(a => a.d), Object.fromEntries(Object.entries(arcR).map(([k, v]) => [k, v.length]))]));
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
        const msgs = []; page.on('dialog', d => { msgs.push(d.message()); d.dismiss().catch(() => {}); });
        const hasReset = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Voltar ao padr/.test(x.innerText)); if (!b) return false; b.click(); return true; }); await page.waitForTimeout(400);
        check('"↺ Voltar ao padrão" em QUA 21/10 com o arquivo ilegível: avisa e não apaga nada (a lista dela e o arquivo ficam como estavam)', hasReset && msgs.some(m => /não consegui guardar a edição deste dia/i.test(m)) && JSON.stringify((await getLS(page, SCH))['2026-10-21']) === JSON.stringify(head21) && (await page.evaluate(() => localStorage.getItem('medplanner_schedule_archive_v1'))) === '{corrompido', JSON.stringify([hasReset, msgs]));
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

    // ── TR17 · RESTAURAR O PLANO AO ESTADO DA ÚLTIMA ATUALIZAÇÃO (paciente, 07/11): ela não cumpriu a 1ª semana e foi movendo tarefas até desorganizar o
    //    app. Bagunça pela interface (mover etapas e blocos, marcar no bloco e no card, ↑ e 📌 na fila, rampa, dia sem remédio) + o que só se grava no
    //    fim da semana ("Agora não", % e religar simulado) → diagnóstico → "Aplicar" → o plano volta ao congelado; arquivo com o estado anterior inteiro;
    //    restaurar de novo não muda nada; "Desfazer" devolve o estado de antes; depois: ⏳, marcar no bloco do dia passado, recolocar e 🔓 ──
    const rCard = (page) => page.evaluate(() => { const el = document.querySelector('[data-t="restore-card"]'); return el ? { text: el.innerText, btns: [...el.querySelectorAll('button')].map(b => b.innerText.trim()) } : null; });
    const rClick = async (page, re) => { const ok = await page.evaluate((src) => { const b = [...document.querySelectorAll('button')].find(x => new RegExp(src).test(x.innerText.trim())); if (!b) return false; b.click(); return true; }, re.source); if (!ok) throw new Error('botão não encontrado: ' + re); await page.waitForTimeout(450); };
    const rArc = async (page) => (JSON.parse(await page.evaluate(() => localStorage.getItem('medplanner_schedule_archive_v1')) || '{}').restauracoes || []);
    const rDiag = (page) => page.evaluate(() => { const el = document.querySelector('[data-t="restore-diag"]'); return el ? el.innerText : ''; });
    const RKX = ['trilhaPlan', 'trilhaOrder', 'trilhaPins', 'trilhaRamp', 'lightDayOverrides', 'trilhaDismiss', 'simResults', 'simOverrides', 'trilhaRevFull', 'trilhaFinalAutoAt', 'trilhaFinalLog', 'trilhaWeeks', 'trilhaFirstOpen'];
    const canon = (v) => Array.isArray(v) ? '[' + v.map(canon).join(',') + ']' : (v && typeof v === 'object') ? '{' + Object.keys(v).filter(k => v[k] !== undefined).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}' : JSON.stringify(v === undefined ? null : v);
    const subX = (c) => canon(RKX.map(k => c[k] === undefined ? null : c[k])); // a navegação (manualWeek) não conta; ordem das chaves também não
    await scenario(browser, 'TR17-restaurar', '2026-10-27', {}, async (S) => {
        let page = S.page;
        const restoreCard = () => rCard(page);
        const clickBtn = (re) => rClick(page, re);
        const arcList = () => rArc(page);
        const moveAny = async (re, to) => { await moveT(page, re, to); const ask = await readAsk(page); if (ask) await clickMove(page); await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.innerText.trim() === '✓ Pronto'); if (b) b.click(); }); await page.waitForTimeout(250); };
        const sub = subX;
        const cfgA = await getLS(page, CFG); // 1º acesso 27/10: a T1 congela (CIR1 · Trauma I, Trauma II, CIR2 · Urologia)
        check('ponto de partida: 1º acesso 27/10, T1 congelada com 5, 6, 14', cfgA.trilhaFirstOpen === '2026-10-27' && JSON.stringify(cfgA.trilhaWeeks['2026-10-26'].mods) === '[5,6,14]', JSON.stringify(cfgA.trilhaWeeks));
        // ── a bagunça da 1ª semana, pela interface ──
        await clickDate(page, '28/10'); await clickTask(page, /^Trilha · CIR1 — Trauma I .*aula online/, null); // marca a aula no bloco
        await moveAny(/^Academia/, '2026-10-30'); // move um bloco comum (vira dia editado em 28 e 30/10)
        await clickDate(page, '29/10'); await moveAny(/^Trilha · CIR1 — Trauma I .*30 questões/, '2026-10-31'); // move uma etapa
        page = await S.reopen('2026-10-30');
        await clickDate(page, '30/10'); await clickTask(page, /^Trilha · CIR1 — Trauma II .*aula online/, null);
        await clickTab(page, 'MÓDULOS'); await clickCardBtn(page, /Trauma I — Avaliação Inicial/, /D2 · 30q/); // marca pelo card (carimba hoje)
        await clickTab(page, 'TRILHA'); await clickRow(page, 85, '📌'); await clickRow(page, 34, '↑');
        await page.evaluate(() => { const r = document.querySelector('[data-t="trilha-ramp"] [data-tue="2026-11-17"]'); const b = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === '−'); b.click(); }); await page.waitForTimeout(350);
        await clickTab(page, 'CRONOGRAMA'); await H.setLight(page, '6');
        page = await S.reopen('2026-11-03'); // a T2 congela segurada (a T1 não fechou)
        const cfgB = await getLS(page, CFG);
        const T2 = (cfgB.trilhaWeeks['2026-11-03'] || {}).mods || [];
        check('03/11: a T2 congela segurada em 3 (a T1 não fechou) com a fila que valia na hora — o 📌 de 30/10 (85) entra: 85, 19, 24', cfgB.trilhaWeeks['2026-11-03'] && cfgB.trilhaWeeks['2026-11-03'].q === 3 && cfgB.trilhaWeeks['2026-11-03'].held && JSON.stringify(T2) === '[85,19,24]', JSON.stringify(cfgB.trilhaWeeks['2026-11-03']));
        await clickDate(page, '08/11'); await moveAny(/^Trilha · CIR2 — Cicatrização .*aula online/, '2026-11-07'); // premissa (S3b): na T2 congelada pela regra nova a aula está em 08/11 (antes 09/11); move −1 dia, como antes
        await page.evaluate(() => { const c = JSON.parse(localStorage.getItem('medplanner_config_v1')); c.trilhaDismiss = { '2026-11-03|rise': '2026-11-03' }; c.simResults = { ...(c.simResults || {}), '2026-11-06': 62 }; c.simOverrides = { ...(c.simOverrides || {}), '2026-11-20': true }; c.manualWeek = null; localStorage.setItem('medplanner_config_v1', JSON.stringify(c));
            const t = JSON.parse(localStorage.getItem('medplanner_trail_v1') || '{}'); t[5] = { ...(t[5] || {}), accD2: 70 }; t[14] = { aulaAudio: true, aulaAudioAt: '2026-11-02', aula: true, aulaAt: '2026-11-02' }; localStorage.setItem('medplanner_trail_v1', JSON.stringify(t)); });
        page = await S.reopen('2026-11-07');
        const pre = { cfg: await getLS(page, CFG), sch: (await getLS(page, SCH)) || {}, tr: (await getLS(page, TRL)) || {} };
        const movedPre = Object.values(pre.cfg.trilhaPlan).filter(p => STG.some(ts => p[ts] !== p.orig[ts])).length;
        check('a bagunça está gravada: etapas fora da data original (questões de CIR1 · Trauma I em 31/10, aula de CIR2 · Cicatrização em 07/11), dias da Trilha editados, ✓ e % no registro, 📌, ↑, rampa, dia sem remédio, "Agora não", % e religar do simulado', movedPre === 2 && pre.cfg.trilhaPlan[5].quest === '2026-10-31' && pre.cfg.trilhaPlan[19].aula === '2026-11-07' && Object.keys(pre.sch).some(d => d >= '2026-10-26') && pre.tr[5] && pre.tr[5].aula && pre.tr[5].questoesD2 && pre.tr[6] && pre.tr[6].aula && (pre.cfg.trilhaPins || []).includes(85) && Array.isArray(pre.cfg.trilhaOrder) && pre.cfg.trilhaRamp && pre.cfg.trilhaRamp['2026-11-17'] === 3 && pre.cfg.lightDayOverrides && pre.cfg.lightDayOverrides['2026-10-26'] !== undefined, JSON.stringify([movedPre, Object.keys(pre.sch), pre.tr, pre.cfg.trilhaPins, pre.cfg.trilhaRamp, pre.cfg.lightDayOverrides]));
        // ── diagnóstico (nada gravado) ──
        await clickTab(page, 'TRILHA');
        const c0 = await restoreCard(); check('aba Trilha: cartão "🧹 RESTAURAR O PLANO AO ESTADO DA ÚLTIMA ATUALIZAÇÃO" com "Ver o que mudou desde a atualização"', !!c0 && /RESTAURAR O PLANO AO ESTADO DA ÚLTIMA ATUALIZAÇÃO/.test(c0.text) && c0.btns.includes('Ver o que mudou desde a atualização'), c0 && c0.text.slice(0, 120));
        await clickBtn(/^Ver o que mudou desde a atualização$/);
        const diag = await page.evaluate(() => document.querySelector('[data-t="restore-diag"]').innerText); console.log('   ' + diag.replace(/\n/g, '\n   '));
        check('diagnóstico: etapas fora da data original (com a data de volta), data original guardada em todas, dias da Trilha editados, ✓/%/áudio do registro, fila, 📌, rampa, "Agora não", simulado; o dia sem remédio da 1ª semana (DOM 01/11, já vivido) fica, com as duas datas; fica o 1º acesso 27/10 e as semanas congeladas 26/10 (3) e 03/11 (3, segurada)',
            new RegExp('Etapas fora da data original: ' + movedPre).test(diag) && /CIR1 · Trauma I — Avaliação Inicial e Trauma de Tórax — questões: SÁB 31\/10 → volta para QUI 29\/10/.test(diag) && /em todas as etapas planejadas ✓/.test(diag) && /CIR1 · Trauma I — Avaliação Inicial e Trauma de Tórax: aula 27\/10 · questões 30\/10 · % das questões 70%/.test(diag) && /marcas de antes do 1º acesso, ou sem data, ficam/.test(diag) && /Dias da Trilha editados à mão: [1-9]/.test(diag) && /Registro da Trilha desde o 1º acesso à versão nova \(27\/10\): [1-9]\d* ✓ de etapa · 1 % · 1 áudio/.test(diag) && /fila: ordem mudada/.test(diag) && /📌 fixados: .* → saem/.test(diag) && /rampa da semana de 17\/11: 3 → volta ao padrão \(4\)/.test(diag) && /dia sem remédio da semana de 26\/10: fica DOM 01\/11 \(a sua escolha — esse dia, ou o previsto, SÁB 31\/10, já passou ou é hoje: o que você viveu não é reescrito\)/.test(diag) && /“Agora não”: 1/.test(diag) && /% do simulado de 06\/11 \(62%\)/.test(diag) && /simulado de 20\/11 religado/.test(diag) && /1º acesso: 27\/10/.test(diag) && /26\/10 \(3\) · 03\/11 \(3, segurada\)/.test(diag) && /11 etapa\(s\) aparecem como ⏳ pendentes — é esperado/.test(diag), diag.slice(0, 300));
        check('diagnóstico: a semana de 03/11 congelou com o 📌 de 30/10 (85) — fica como congelou, e o diagnóstico mostra o que a fila padrão daria (19, 24, 32) e por quê (a fila e os 📌 da hora)', /a semana de 03\/11 congelou com CIR4[^\n]* — pela fila padrão seriam CIR2 · Cicatrização[^\n]*; fica como congelou \(com a fila e os 📌 que valiam na hora\)/.test(diag) && !/a semana de 26\/10 congelou/.test(diag), (diag.match(/a semana de 03\/11 congelou[^\n]*/) || [''])[0]);
        check('o diagnóstico não grava nada', JSON.stringify(await getLS(page, CFG)) === JSON.stringify(pre.cfg) && JSON.stringify((await getLS(page, SCH)) || {}) === JSON.stringify(pre.sch) && JSON.stringify((await getLS(page, TRL)) || {}) === JSON.stringify(pre.tr) && (await arcList()).length === 0);
        // ── Aplicar ──
        await clickBtn(/^Aplicar a restauração$/);
        const cfg = await getLS(page, CFG), sch = (await getLS(page, SCH)) || {}, tr = (await getLS(page, TRL)) || {};
        const want = {}; [5, 6, 14].forEach(id => { want[id] = cfgA.trilhaPlan[id]; }); T2.forEach(id => { want[id] = { ...cfgB.trilhaPlan[id], hist: [] }; });
        check('trilhaPlan volta ao congelado: T1 = como congelou em 27/10, T2 = como congelou em 03/11 (datas = orig, sem histórico de movimentos)', Object.keys(want).every(id => JSON.stringify(cfg.trilhaPlan[id]) === JSON.stringify({ ...want[id], hist: [] })) && Object.keys(cfg.trilhaPlan).length === 6, JSON.stringify(Object.fromEntries(Object.entries(cfg.trilhaPlan).map(([id, p]) => [id, STG.map(ts => p[ts]).join(' ')]))));
        check('ficam intactos o 1º acesso e o congelamento das semanas (cota não recalculada)', cfg.trilhaFirstOpen === '2026-10-27' && JSON.stringify(cfg.trilhaWeeks) === JSON.stringify(pre.cfg.trilhaWeeks), JSON.stringify(cfg.trilhaWeeks));
        check('dias da Trilha editados descartados; registro da Trilha sem ✓, %, carimbo nem áudio de depois da atualização', !Object.keys(sch).some(d => d >= '2026-10-26') && JSON.stringify(tr) === '{}', JSON.stringify([Object.keys(sch), tr]));
        check('fila, 📌, rampa, "Agora não", % e religar do simulado de volta ao padrão; o dia sem remédio já vivido (01/11) fica', cfg.trilhaOrder === undefined && cfg.trilhaPins === undefined && !Object.keys(cfg.trilhaRamp || {}).some(k => k >= '2026-10-20') && canon(cfg.lightDayOverrides) === canon(pre.cfg.lightDayOverrides) && cfg.trilhaDismiss === undefined && !Object.keys(cfg.simResults || {}).some(k => k >= '2026-10-26') && !Object.keys(cfg.simOverrides || {}).some(k => k >= '2026-10-26'), JSON.stringify([cfg.trilhaOrder, cfg.trilhaPins, cfg.trilhaRamp, cfg.lightDayOverrides, cfg.trilhaDismiss, cfg.simResults, cfg.simOverrides]));
        const L1 = await arcList();
        check('o arquivo guarda o estado anterior inteiro, com data e hora: config, dias editados e registro da Trilha idênticos aos de antes', L1.length === 1 && L1[0].why === 'restaurar' && L1[0].opts && L1[0].opts.keepOwn === false && /^2026-11-07T\d\d:\d\d$/.test(L1[0].at) && JSON.stringify(L1[0].config) === JSON.stringify(pre.cfg) && JSON.stringify(L1[0].schedule) === JSON.stringify(pre.sch) && JSON.stringify(L1[0].trail) === JSON.stringify(pre.tr), JSON.stringify(L1.map(e => e.why + ' ' + e.at)));
        const c1 = await restoreCard();
        check('cartão depois de aplicar: "✅ Plano restaurado em 07/11", backup novo antes de marcar, os 3 passos (marcar no bloco do dia, ⏳ "Ver como recolocar", 🔓) e "Desfazer a restauração"', /✅ Plano restaurado em 07\/11 às/.test(c1.text) && c1.btns.includes('💾 Baixar backup agora') && /1\. Marque o que você fez dentro do bloco de cada dia, voltando com ◀/.test(c1.text) && /Não use o card da aba Módulos/.test(c1.text) && /2\. O que ficar pendente aparece no topo como ⏳/.test(c1.text) && /3\. Se uma semana não fechar/.test(c1.text) && c1.btns.includes('Desfazer a restauração') && c1.btns.includes('Ir para o Cronograma'), c1.text.slice(0, 200));
        const was0 = await page.evaluate(() => (document.querySelector('[data-t="restore-was"]') || {}).textContent || '');
        check('cartão depois de aplicar: "O que estava marcado antes da restauração" com as datas e o % (para conferir ao remarcar) — a aula marcada em 27/10 no bloco de 28/10 (dia futuro) tem o carimbo de 27/10', /O que estava marcado antes da restauração/.test(was0) && /CIR1 · Trauma I — Avaliação Inicial e Trauma de Tórax: aula 27\/10 · questões 30\/10 · % das questões 70%/.test(was0) && /CIR2 · Urologia[^:\n]*: aula 02\/11 · áudio 02\/11/.test(was0) && !/✓ ·|✓$/.test(was0.split('✓ = já remarcada')[0]), was0.slice(0, 300));
        // ── o plano na tela = o congelado (T1 e T2), dia a dia ──
        await clickTab(page, 'CRONOGRAMA'); await navWeek(page, -1);
        const map = await trailMap(page, 3);
        check('na tela (T1 a T3), cada etapa dos módulos da T1 e da T2 está no dia congelado (o plano que o motor gerou)', Object.keys(want).every(id => STG.every(ts => (map[id] || {})[ts] === want[id][ts])) && !Object.values(map).some(m => Object.keys(m).some(k => k.endsWith('_dup'))), JSON.stringify(map));
        await page.evaluate(() => { const c = JSON.parse(localStorage.getItem('medplanner_config_v1')); c.manualWeek = null; localStorage.setItem('medplanner_config_v1', JSON.stringify(c)); });
        page = await S.reopen('2026-11-07'); // volta à semana de hoje
        // ── restaurar de novo não muda nada ──
        await clickTab(page, 'TRILHA'); await clickBtn(/^Ver o que mudou desde a atualização$/);
        const c2 = await restoreCard();
        check('restaurar de novo: "Nada a restaurar", sem "Aplicar"; nada gravado e o arquivo não cresce', /Nada a restaurar: o plano já está como na última atualização/.test(c2.text) && !c2.btns.includes('Aplicar a restauração') && sub(await getLS(page, CFG)) === sub(cfg) && JSON.stringify((await getLS(page, SCH)) || {}) === JSON.stringify(sch) && (await arcList()).length === 1, c2.text.slice(0, 160));
        await clickBtn(/^Fechar$/);
        // ── Desfazer devolve o estado de antes ──
        await clickBtn(/^Desfazer a restauração$/); const cu = await restoreCard();
        check('"Desfazer a restauração" pede confirmação (volta para como estava antes da restauração de 07/11)', /Desfazer volta o plano para como estava antes da restauração de 07\/11/.test(cu.text) && cu.btns.includes('Confirmar: desfazer'), cu.text.slice(0, 200));
        await clickBtn(/^Confirmar: desfazer$/);
        const cfgU = await getLS(page, CFG), schU = (await getLS(page, SCH)) || {}, trU = (await getLS(page, TRL)) || {}, L2 = await arcList();
        check('Desfazer: config (as chaves da restauração, as semanas e o 1º acesso), dias editados e registro da Trilha voltam exatamente ao estado de antes da restauração; o arquivo marca a restauração como desfeita e guarda o estado restaurado', sub(cfgU) === sub(pre.cfg) && JSON.stringify(schU) === JSON.stringify(pre.sch) && JSON.stringify(trU) === JSON.stringify(pre.tr) && L2.length === 2 && !!L2[0].undoneAt && L2[1].why === 'antes de desfazer' && JSON.stringify(L2[1].trail) === '{}', JSON.stringify(L2.map(e => e.why + (e.undoneAt ? ' (desfeita)' : ''))));
        const c3 = await restoreCard(); check('depois de desfazer: sem "Desfazer"; o cartão diz que a restauração foi desfeita e oferece "Refazer a restauração"', !c3.btns.includes('Desfazer a restauração') && c3.btns.includes('Refazer a restauração') && /A restauração de 07\/11 às \d\d:\d\d foi desfeita em 07\/11 às \d\d:\d\d/.test(c3.text), c3.text.slice(0, 300));
        await clickRow(page, 86, '📌'); // depois de desfazer ela fixa um módulo
        await clickBtn(/^Refazer a restauração$/); const cr = await restoreCard();
        check('a prévia do Refazer lista o que sai da tela, inclusive escolhas feitas depois de desfazer (📌)', /Mudanças suas depois de desfazer que saem \(ficam no arquivo\)/.test(cr.text) && /escolhas feitas depois de desfazer \(📌\) → voltam a como estavam/.test(cr.text), cr.text.slice(0, 400));
        check('"Refazer a restauração" pede confirmação (volta para como estava antes de desfazer)', !!cr && /Refazer volta para como estava antes de desfazer \(07\/11 às/.test(cr.text) && cr.btns.includes('Confirmar: refazer'), cr && cr.text.slice(0, 200));
        await clickBtn(/^Confirmar: refazer$/);
        const cfgRR = await getLS(page, CFG), L3 = await arcList();
        check('Refazer: o plano restaurado volta exatamente (config, dias, registro); o arquivo fica restaurar (de novo em vigor) · antes de desfazer (refeito) · antes de refazer (o estado desfeito)', sub(cfgRR) === sub(cfg) && canon((await getLS(page, SCH)) || {}) === canon(sch) && JSON.stringify((await getLS(page, TRL)) || {}) === '{}' && L3.length === 3 && !L3[0].undoneAt && !!L3[1].redoneAt && L3[2].why === 'antes de refazer' && canon(L3[2].trail) === canon(pre.tr) && JSON.stringify(L3[2].config.trilhaPins) === JSON.stringify([...(pre.cfg.trilhaPins || []), 86].filter((v, i, a) => a.indexOf(v) === i)), JSON.stringify(L3.map(e => e.why + (e.undoneAt ? ' (desfeita)' : '') + (e.redoneAt ? ' (refeito)' : ''))));
        const c4 = await restoreCard(); check('depois de refazer: "Desfazer a restauração" de volta, sem "Refazer"', c4.btns.includes('Desfazer a restauração') && !c4.btns.includes('Refazer a restauração'), c4.btns.join(' | '));
        await clickTab(page, 'CRONOGRAMA');
        const pend0 = await banner(page, 'trilha-pending');
        check('depois de restaurar: as 11 etapas de dias que já passaram aparecem como ⏳ pendentes (esperado)', !!pend0 && /Ficaram para trás 11 etapas/.test(pend0.text), pend0 && pend0.text.slice(0, 120));
        await navWeek(page, -1); await clickDate(page, '28/10'); await clickTask(page, /^Trilha · CIR1 — Trauma I .*aula online/, null);
        await clickDate(page, '29/10'); await clickTask(page, /^Trilha · CIR1 — Trauma I .*30 questões/, /D2 · 30q/);
        await navWeek(page, 1); // de volta à semana atual (o ⏳ fica no topo da semana de hoje)
        const trM = await getLS(page, TRL);
        check('marcar no bloco do dia passado: carimbo = a data daquele dia (aula 28/10, questões 29/10), não hoje', trM[5].aulaAt === '2026-10-28' && trM[5].questoesD2At === '2026-10-29', JSON.stringify(trM[5]));
        const pend1 = await banner(page, 'trilha-pending');
        check('a lista de pendentes encolhe: 11 → 9', !!pend1 && /Ficaram para trás 9 etapas/.test(pend1.text), pend1 && pend1.text.slice(0, 120));
        await clickTab(page, 'TRILHA');
        const was1 = await page.evaluate(() => (document.querySelector('[data-t="restore-was"]') || {}).textContent || '');
        check('a lista "O que estava marcado antes" marca com ✓ o que ela já remarcou (aula e questões de CIR1 · Trauma I)', /aula 27\/10 ✓ · questões 30\/10 ✓/.test(was1), was1.slice(0, 200));
        await clickBtn(/^Ver o que mudou desde a atualização$/);
        const warn = await page.evaluate(() => (document.querySelector('[data-t="restore-after-warn"]') || {}).innerText || ''); const cw = await restoreCard();
        check('restaurar de novo depois de remarcar: o diagnóstico avisa as 2 marcas feitas depois da restauração (com as datas) e o botão vira "Aplicar mesmo assim"', /⚠️ Depois da restauração de 07\/11 às \d\d:\d\d você marcou 2 coisa\(s\): CIR1 \(aula 28\/10, questões 29\/10\)/.test(warn) && cw.btns.includes('Aplicar mesmo assim') && !/você ainda não marcou nada/.test(cw.text), warn);
        await clickBtn(/^Cancelar$/);
        await clickBtn(/^Desfazer a restauração$/); const cu2 = await page.evaluate(() => document.querySelector('[data-t="restore-undo"]').innerText);
        check('a prévia do Desfazer lista o que sai da tela: as 2 marcas feitas depois da restauração (ficam no arquivo) e o que volta', /Saem da tela \(ficam no arquivo\)/.test(cu2) && /marcas feitas depois da restauração \(2\): CIR1 — aula 28\/10, questões 29\/10/.test(cu2) && /Voltam/.test(cu2) && /2 etapa\(s\) para as datas de antes/.test(cu2), cu2);
        await clickBtn(/^Cancelar$/); await clickTab(page, 'CRONOGRAMA');
        await clickIn(page, 'trilha-pending', 'Ver como recolocar'); const pv = await banner(page, 'trilha-pending'); console.log('   💡', pv.text.replace(/\n/g, ' '));
        await clickIn(page, 'trilha-pending', 'Aplicar');
        const cfgR = await getLS(page, CFG), p5 = cfgR.trilhaPlan[5];
        const rem = []; [5, 6, 14].forEach(id => STG.forEach(ts => { const done = (trM[id] || {})[{ aula: 'aula', quest: 'questoesD2', apost: 'apostila', seal: 'smartcard' }[ts]]; if (!done && cfgA.trilhaPlan[id][ts] < '2026-11-07') rem.push([id, ts, cfgR.trilhaPlan[id][ts]]); }));
        check('"Ver como recolocar" → Aplicar: as 9 etapas que ficaram vão para hoje (07/11) em diante, com histórico "recolocar"; CIR1 · Trauma I continua da questão carimbada em 29/10 (apostila e selagem depois, em ordem)', rem.length === 9 && rem.every(r => r[2] && r[2] >= '2026-11-07') && p5.apost >= '2026-11-07' && p5.seal > p5.apost && p5.hist.some(h => h.why === 'recolocar') && !(await banner(page, 'trilha-pending')), JSON.stringify(rem));
        await clickTab(page, 'TRILHA'); await clickBtn(/^Desfazer a restauração$/); const cu3 = await page.evaluate(() => document.querySelector('[data-t="restore-undo"]').innerText);
        check('a prévia do Desfazer também lista as etapas recolocadas depois da restauração (mudada depois da restauração → volta para a data de antes)', /CIR1 · Trauma I — Avaliação Inicial e Trauma de Tórax — apostila: \S+ \d\d\/11 \(mudada depois da restauração\) → volta para/.test(cu3), cu3.slice(0, 600));
        await clickBtn(/^Cancelar$/); await clickTab(page, 'CRONOGRAMA');
        // 🔓: ela marca o que faltava da T1 (no bloco de cada dia) ainda na T2 — a semana passada fecha e o ritmo pode subir
        await markUntil(page, '2026-11-30', [[19, 'aula'], [19, 'quest'], [19, 'apost'], [19, 'seal'], [24, 'aula'], [24, 'quest'], [24, 'apost'], [24, 'seal'], [32, 'aula'], [32, 'quest'], [32, 'apost'], [32, 'seal']]);
        page = await S.reopen('2026-11-07');
        const rise = await banner(page, 'trilha-rise');
        check('com a T1 toda marcada (ainda na T2), o app oferece o 🔓 "A semana passada fechou — o ritmo desta semana pode subir para 4"', !!rise && /🔓 A semana passada fechou — o ritmo desta semana pode subir para 4/.test(rise.text), rise && rise.text.slice(0, 160));
        await clickTab(page, 'TRILHA'); await clickBtn(/^Ver o que mudou desde a atualização$/); await clickBtn(/^Aplicar mesmo assim$/); // uma 2ª restauração por cima das marcas dela
        const trX = await getLS(page, TRL); await clickBtn(/^Desfazer a restauração$/); await clickBtn(/^Confirmar: desfazer$/);
        const c5 = await restoreCard(), trY = await getLS(page, TRL);
        check('desfeita a 2ª restauração: as marcas dela voltam; a 1ª continua em vigor ("Desfazer") e a 2ª pode ser refeita ("Refazer")', JSON.stringify(trX || {}) === '{}' && Object.keys(trY || {}).length > 0 && c5.btns.includes('Desfazer a restauração') && c5.btns.includes('Refazer a restauração'), c5.btns.join(' | '));
    });
    // ── TR17b · arquivo ilegível: "Aplicar" avisa e não muda nada (nada sai sem guardar) ──
    await scenario(browser, 'TR17b-restaurar-arquivo-ilegivel', '2026-11-07', {}, async (S) => {
        const page = S.page; const before = { cfg: await getLS(page, CFG), tr: await getLS(page, TRL) };
        await clickTab(page, 'TRILHA');
        await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Ver o que mudou desde a atualização/.test(x.innerText)); b.click(); }); await page.waitForTimeout(400);
        await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^Aplicar a restauração$/.test(x.innerText.trim())); b.click(); }); await page.waitForTimeout(450);
        const msg = await page.evaluate(() => (document.querySelector('[data-t="restore-msg"]') || {}).innerText || '');
        check('arquivo ilegível: "Não consegui gravar no aparelho … — nada foi mudado"; config, registro e arquivo como estavam', /Não consegui gravar no aparelho \(sem espaço ou arquivo do app ilegível\) — nada foi mudado/.test(msg) && JSON.stringify(await getLS(page, CFG)) === JSON.stringify(before.cfg) && JSON.stringify(await getLS(page, TRL)) === JSON.stringify(before.tr) && (await page.evaluate(() => localStorage.getItem('medplanner_schedule_archive_v1'))) === '{corrompido', msg);
        // gravação que falha no meio (aparelho sem espaço): a config não cabe → o arquivo e as chaves já gravadas voltam ao que eram, e a tela avisa
        await page.evaluate(() => { localStorage.setItem('medplanner_schedule_archive_v1', '{}'); const orig = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k === 'medplanner_config_v1' && window.__failCfg) throw new DOMException('cheio', 'QuotaExceededError'); return orig.call(this, k, v); }; window.__failCfg = true; });
        const raw0 = await page.evaluate(() => ({ s: localStorage.getItem('medplanner_schedule_v1'), t: localStorage.getItem('medplanner_trail_v1'), c: localStorage.getItem('medplanner_config_v1') }));
        await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Ver o que mudou desde a atualização/.test(x.innerText)); b.click(); }); await page.waitForTimeout(400);
        await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^Aplicar a restauração$/.test(x.innerText.trim())); b.click(); }); await page.waitForTimeout(450);
        const msg2 = await page.evaluate(() => (document.querySelector('[data-t="restore-msg"]') || {}).innerText || '');
        const raw1 = await page.evaluate(() => ({ s: localStorage.getItem('medplanner_schedule_v1'), t: localStorage.getItem('medplanner_trail_v1'), c: localStorage.getItem('medplanner_config_v1'), a: localStorage.getItem('medplanner_schedule_archive_v1') }));
        check('a config não coube no aparelho: a tela avisa, o registro e os dias editados voltam ao que eram (tudo ou nada) e o arquivo não ganha entrada', /Não consegui gravar no aparelho/.test(msg2) && raw1.s === raw0.s && raw1.t === raw0.t && raw1.c === raw0.c && raw1.a === '{}' && !!(await rCard(page)).btns.includes('Ver o que mudou desde a atualização') && !(await rCard(page)).btns.includes('Desfazer a restauração'), JSON.stringify({ msg2, a: raw1.a, t: raw1.t }));
        await page.evaluate(() => { window.__failCfg = false; });
        await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Ver o que mudou desde a atualização/.test(x.innerText)); b.click(); }); await page.waitForTimeout(400);
        await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^Aplicar a restauração$/.test(x.innerText.trim())); b.click(); }); await page.waitForTimeout(450);
        check('com espaço de novo, "Aplicar" grava: 📌 sai, registro vazio, 1 entrada no arquivo', (await getLS(page, CFG)).trilhaPins === undefined && JSON.stringify((await getLS(page, TRL)) || {}) === '{}' && (await rArc(page)).length === 1);
    }, { raw: { 'medplanner_schedule_archive_v1': '{corrompido', [CFG]: JSON.stringify({ ...baseCfg, trilhaFirstOpen: '2026-10-27', trilhaInicio: '2026-10-26', trilhaLegacyOv: { '2026-10-20': null, '2026-10-21': null }, trilhaPins: [85] }), [TRL]: JSON.stringify({ 5: { aula: true, aulaAt: '2026-10-28' } }) } });
    // ── TR17c · restaurar num dia de plantão longo (10/11) com revisão vencida: o app registra o dia cheio logo depois de "Aplicar" — restaurar de novo
    //    continua "Nada a restaurar" e o arquivo não cresce; "Desfazer" devolve 📌, marcas e a revisão; marcas de antes do 1º acesso (26/10, com 1º acesso
    //    em 27/10) e sem data ficam; "Revisei" no bloco de um dia passado carimba a data daquele dia ──
    const tr60u = { aula: true, questoesD2: true, apostila: true, smartcard: true, completedAt: '2026-10-22', accSelagem: 70 }; // fechado antes da atualização, sem carimbo por etapa (dado antigo)
    await scenario(browser, 'TR17c-restaurar-plantao-1011', '2026-10-27', { [TRL]: { 60: tr60u, 5: { aula: true, aulaAt: '2026-10-22', questoesD2: true, questoesD2At: '2026-10-23', apostila: true, apostilaAt: '2026-10-26' } } }, async (S) => {
        let page = S.page;
        const cfgA = await getLS(page, CFG);
        check('ponto de partida: 1º acesso 27/10; CIR1 · Trauma I começado antes (aula 22/10, questões 23/10, apostila 26/10) congela com essas datas', cfgA.trilhaFirstOpen === '2026-10-27' && cfgA.trilhaPlan[5] && cfgA.trilhaPlan[5].orig.apost === '2026-10-26', JSON.stringify(cfgA.trilhaPlan[5]));
        page = await S.reopen('2026-11-01');
        await page.evaluate(() => { const t = JSON.parse(localStorage.getItem('medplanner_trail_v1')); t[60] = { ...t[60], reviewD7Done: true, r1DoneAt: '2026-11-01', accR1: 75, reviewD30Done: true, r2DoneAt: '2026-11-08', accR2: 80, reviewR3Done: true }; t[6] = { aula: true, aulaAt: '2026-10-28' }; t[85] = { aula: true, aulaAt: '2026-10-30' }; localStorage.setItem('medplanner_trail_v1', JSON.stringify(t));
            const c = JSON.parse(localStorage.getItem('medplanner_config_v1')); c.trilhaPins = [86]; localStorage.setItem('medplanner_config_v1', JSON.stringify(c)); });
        page = await S.reopen('2026-11-10');
        const pre = { cfg: await getLS(page, CFG), sch: (await getLS(page, SCH)) || {}, tr: (await getLS(page, TRL)) || {} };
        check('10/11 (plantão longo): sem revisão vencida, o dia não está registrado como cheio', !(pre.cfg.trilhaRevFull || {})['2026-11-10'], JSON.stringify(pre.cfg.trilhaRevFull));
        await clickTab(page, 'TRILHA'); await rClick(page, /^Ver o que mudou desde a atualização$/);
        const diag = await rDiag(page);
        check('diagnóstico: a revisão D+7 aparece com a data e o % (01/11, 75%); a apostila de 26/10 (antes do 1º acesso) e os ✓ sem data de GIN5 não saem', /GIN5 · Lesões Precursoras[^:\n]*: revisão D\+7 01\/11, 75%/.test(diag) && /CIR1 · Trauma II[^:\n]*: aula 28\/10/.test(diag) && !/CIR1 · Trauma I — Avaliação Inicial e Trauma de Tórax: /.test(diag) && !/GIN5[^\n]*selagem/.test(diag) && /Registro da Trilha desde o 1º acesso à versão nova \(27\/10\)/.test(diag), diag.slice(0, 400));
        check('diagnóstico: a semana de 03/11 congelou com CIR4 · Parte I (aula marcada pelo card em 30/10, antes) e CIR4 · Parte II (📌) — a nota dá as duas razões: a fila e os 📌 da hora, e a aula que fica em 30/10 e conta para a semana de 26/10 fechar', /a semana de 03\/11 congelou com [^\n]*CIR4 · Especialidade Cirúrgica — Parte I[^\n]*; fica como congelou \(com a fila e os 📌 que valiam na hora\)\. A aula de CIR4 fica em SEX 30\/10: se você a fez, marque no bloco desse dia — ela conta para a semana de 26\/10 fechar/.test(diag), (diag.match(/a semana de 03\/11 congelou[^\n]*/) || [''])[0]);
        await rClick(page, /^Aplicar a restauração$/);
        const cfg1 = await getLS(page, CFG), tr1 = (await getLS(page, TRL)) || {};
        check('depois de aplicar: GIN5 continua fechado (✓ sem data e fechamento de 22/10 ficam), sem as revisões D+7 e D+30 e sem o reforço (R3 depende do D+30); a apostila de 26/10 de CIR1 · Trauma I fica; o app registra 10/11 como cheio (revisão vencida num plantão longo)', tr1[60] && tr1[60].aula && tr1[60].smartcard && tr1[60].completedAt === '2026-10-22' && tr1[60].accSelagem === 70 && !tr1[60].reviewD7Done && !tr1[60].r1DoneAt && !tr1[60].reviewD30Done && !tr1[60].reviewR3Done && tr1[5] && tr1[5].apostila && tr1[5].apostilaAt === '2026-10-26' && !tr1[6] && (cfg1.trilhaRevFull || {})['2026-11-10'] === true && cfg1.trilhaPins === undefined, JSON.stringify([tr1, cfg1.trilhaRevFull]));
        await rClick(page, /^Ver o que mudou desde a atualização$/); const c2 = await rCard(page);
        check('restaurar de novo no plantão longo: "Nada a restaurar" (o dia cheio é registro do app, não mudança dela) e o arquivo continua com 1 entrada', /Nada a restaurar: o plano já está como na última atualização/.test(c2.text) && !c2.btns.some(b => /^Aplicar/.test(b)) && (await rArc(page)).length === 1, c2.text.slice(0, 200));
        await rClick(page, /^Fechar$/);
        await clickTab(page, 'CRONOGRAMA'); await navWeek(page, -3); await clickDate(page, '22/10'); await clickTask(page, /^Anki/, null); await navWeek(page, 3); // depois da restauração ela marca o Anki de QUI 22/10 (dia de transição)
        const s22 = ((await getLS(page, SCH)) || {})['2026-10-22'];
        check('marcar o Anki de 22/10 (transição) depois da restauração grava o dia', Array.isArray(s22) && s22.some(a => a.d === 'ANKI' && a.done), JSON.stringify(s22 && s22.map(a => a.d + (a.done ? '✓' : ''))));
        await clickTab(page, 'TRILHA'); await rClick(page, /^Desfazer a restauração$/);
        const up = await page.evaluate(() => document.querySelector('[data-t="restore-undo"]').innerText);
        check('a prévia do Desfazer não lista o dia de transição (o Desfazer não mexe em dia de antes da Trilha)', /nada — você não mudou nada depois da restauração/.test(up), up.slice(0, 300));
        await rClick(page, /^Confirmar: desfazer$/);
        const cfgU = await getLS(page, CFG), trU = (await getLS(page, TRL)) || {}, schU = (await getLS(page, SCH)) || {};
        const trilhaDays = (o) => Object.fromEntries(Object.entries(o || {}).filter(([k]) => k >= '2026-10-26'));
        check('Desfazer no mesmo dia devolve o estado de antes inteiro: 📌 86, a aula de 28/10, as revisões e o reforço, os dias cheios como estavam; o Anki de 22/10 (transição, marcado depois) fica', subX(cfgU) === subX(pre.cfg) && canon(trU) === canon(pre.tr) && canon(trilhaDays(schU)) === canon(trilhaDays(pre.sch)) && canon(schU['2026-10-22']) === canon(s22), JSON.stringify([cfgU.trilhaPins, cfgU.trilhaRevFull, trU[60], Object.keys(schU)]));
        await rClick(page, /^Refazer a restauração$/); await rClick(page, /^Confirmar: refazer$/);
        await clickTab(page, 'CRONOGRAMA'); await navWeek(page, -2); await clickDate(page, '01/11');
        await clickTask(page, /^Revisão adaptativa/, /^Revisei$/); await page.fill('input[placeholder="% acerto"]', '75'); await clickTask(page, /^Revisão adaptativa/, /^OK$/);
        const trR = await getLS(page, TRL);
        check('"Revisei" no bloco de DOM 01/11 (dia que já passou) carimba 01/11, não hoje — o D+30 continua a contar de 01/11; o dia em que ela marcou (10/11) fica em r1MarkedAt (a restauração usa)', trR[60].reviewD7Done === true && trR[60].r1DoneAt === '2026-11-01' && trR[60].accR1 === 75 && trR[60].r1MarkedAt === '2026-11-10', JSON.stringify(trR[60]));
    });
    // ── TR17d · 🔓 e ⏩ aplicados depois da atualização: a restauração os tira (a semana volta à cota com que congelou, segurada) e diz isso; "Desfazer"
    //    os devolve; remarcando o que faltava, o 🔓 volta a ser oferecido ──
    await scenario(browser, 'TR17d-restaurar-subida-adiantar', '2026-10-27', {}, async (S) => {
        let page = S.page;
        await markUntil(page, '2026-11-02', [[5, 'seal']]); page = await S.reopen('2026-11-03');
        const W0 = (await getLS(page, CFG)).trilhaWeeks['2026-11-03'];
        check('T2 congela segurada em 3 (a selagem de CIR1 · Trauma I ficou aberta)', W0.q === 3 && W0.held === true && W0.why === 'fechamento', JSON.stringify(W0));
        await clickCardBtn(page, /Trauma I — Avaliação Inicial/, /^Selagem/); await clickTab(page, 'CRONOGRAMA');
        await page.evaluate(() => { const c = JSON.parse(localStorage.getItem('medplanner_config_v1')); const r = { aula: '2026-11-04', quest: '2026-11-05', apost: '2026-11-07', seal: '2026-11-09' }; c.trilhaPlan[34] = { wk: '2026-11-03', via: 'rise', ...r, orig: { ...r }, hist: [] }; const W = c.trilhaWeeks['2026-11-03']; c.trilhaWeeks['2026-11-03'] = { ...W, rise: [34], q: W.q + 1, held: W.q + 1 < W.base, why: W.q + 1 < W.base ? W.why : null }; localStorage.setItem('medplanner_config_v1', JSON.stringify(c)); }); // premissa (S3b): como o applyTProp grava o 🔓 — com 1 aula por dia o 🔓 da T2 não tem proposta (TR8)
        await page.evaluate(() => { const c = JSON.parse(localStorage.getItem('medplanner_config_v1')); const d = { aula: '2026-11-05', quest: '2026-11-07', apost: '2026-11-08', seal: '2026-11-11' }; c.trilhaPlan[85] = { wk: '2026-11-03', via: 'adv', ...d, orig: { ...d }, hist: [] }; c.trilhaWeeks['2026-11-03'] = { ...c.trilhaWeeks['2026-11-03'], adv: [85] }; localStorage.setItem('medplanner_config_v1', JSON.stringify(c)); });
        page = await S.reopen('2026-11-07');
        const pre = { cfg: await getLS(page, CFG), tr: (await getLS(page, TRL)) || {} }, W1 = pre.cfg.trilhaWeeks['2026-11-03'];
        check('antes: a T2 subiu para 4 pelo 🔓 (rise [34]) e tem um ⏩ (85)', W1.q === 4 && W1.held === false && JSON.stringify(W1.rise) === '[34]' && JSON.stringify(W1.adv) === '[85]' && pre.cfg.trilhaPlan[34].via === 'rise' && pre.cfg.trilhaPlan[85].via === 'adv', JSON.stringify(W1));
        await clickTab(page, 'TRILHA'); await rClick(page, /^Ver o que mudou desde a atualização$/);
        const diag = await rDiag(page);
        check('diagnóstico: "⏩ CIR4 · Especialidade Cirúrgica — Parte I (adiantado na semana de 03/11) → sai do plano" e "🔓 semana de 03/11: +1 (CIR3 · Hérnias…) → sai; a semana volta a 3, segurada"; nas semanas congeladas, 03/11 (3, segurada)', /⏩ CIR4 · Especialidade Cirúrgica — Parte I \(adiantado na semana de 03\/11\) → sai do plano e volta para a fila/.test(diag) && /🔓 semana de 03\/11: \+1 \(CIR3 · Hérnias da Parede Abdominal\) → sai; a semana volta a 3, segurada/.test(diag) && /03\/11 \(3, segurada\)/.test(diag), diag.slice(0, 600));
        await rClick(page, /^Aplicar a restauração$/);
        const cfg1 = await getLS(page, CFG), W2 = cfg1.trilhaWeeks['2026-11-03'];
        check('depois: a T2 volta exatamente a como congelou em 03/11 (cota 3, segurada, "fechamento", sem ⏩ nem 🔓) e os módulos 34 e 85 saem do plano (ficam no arquivo)', canon(W2) === canon({ ...W0, adv: [], rise: [] }) && !cfg1.trilhaPlan[34] && !cfg1.trilhaPlan[85], JSON.stringify(W2));
        await rClick(page, /^Ver o que mudou desde a atualização$/); const c2 = await rCard(page);
        check('restaurar de novo: "Nada a restaurar"', /Nada a restaurar/.test(c2.text) && (await rArc(page)).length === 1, c2.text.slice(0, 160)); await rClick(page, /^Fechar$/);
        await rClick(page, /^Desfazer a restauração$/); await rClick(page, /^Confirmar: desfazer$/);
        const cfgU = await getLS(page, CFG);
        check('Desfazer devolve a T2 com o 🔓 e o ⏩ (cota 4) e os módulos 34 e 85 no plano', subX(cfgU) === subX(pre.cfg) && canon((await getLS(page, TRL)) || {}) === canon(pre.tr), JSON.stringify(cfgU.trilhaWeeks['2026-11-03']));
        await rClick(page, /^Refazer a restauração$/); const rp = await page.evaluate(() => document.querySelector('[data-t="restore-redo"]').innerText);
        check('a prévia do Refazer (nada mudado depois de desfazer): "Saem de novo" lista o ⏩ e o 🔓 que o Desfazer tinha trazido e as marcas; nas mudanças dela, "nada"', /Saem de novo \(a restauração volta a valer/.test(rp) && /CIR4 · Especialidade Cirúrgica — Parte I \(⏩\/🔓\) sai de novo do plano/.test(rp) && /CIR3 · Hérnias da Parede Abdominal \(⏩\/🔓\) sai de novo do plano/.test(rp) && /marcação\(ões\) que o Desfazer tinha trazido de volta/.test(rp) && /nada — você não mudou nada depois de desfazer/.test(rp) && !/entrou no plano depois de desfazer/.test(rp), rp.slice(0, 600));
        await rClick(page, /^Confirmar: refazer$/);
        await markUntil(page, '2026-11-06'); page = await S.reopen('2026-11-07'); // ela remarca o que fez (T1 e os dias já vividos da T2) — sem ⏳ na frente, o 🔓 aparece
        const rise = await banner(page, 'trilha-rise');
        check('depois de restaurar, com a T1 remarcada (nos dias dela), o 🔓 volta a ser oferecido para a T2', !!rise && /🔓 A semana passada fechou — o ritmo desta semana pode subir para 4/.test(rise.text), rise && rise.text.slice(0, 120));
        page = await S.reopen('2026-11-10'); const cT3 = await getLS(page, CFG), T3 = cT3.trilhaWeeks['2026-11-10'];
        await clickTab(page, 'TRILHA'); await rClick(page, /^Desfazer a restauração$/); const up = await page.evaluate(() => document.querySelector('[data-t="restore-undo"]').innerText);
        const inT3 = [34, 85].filter(id => (T3.mods || []).includes(id));
        check('a semana de 10/11 congelou depois da restauração: a prévia do Desfazer diz que ela fica como está' + (inT3.length ? ' e que o ⏩/🔓 que já está nela não volta para a de 03/11' : ''), /a semana de 10\/11 congelou depois da restauração e fica como está \(cota \d\)/.test(up) && (!inT3.length || /não volta\(m\) para a semana de 03\/11: o módulo já está numa semana que congelou depois/.test(up)), up.slice(0, 500) + ' · T3 ' + JSON.stringify(T3.mods));
        await rClick(page, /^Confirmar: desfazer$/); const cU2 = await getLS(page, CFG);
        const seen = {}; let dup = []; Object.entries(cU2.trilhaWeeks).forEach(([k, w]) => (w.mods || []).concat(w.adv || [], w.rise || []).forEach(id => { if (seen[id]) dup.push(id + '@' + seen[id] + '+' + k); seen[id] = k; }));
        const orphan = Object.entries(cU2.trilhaPlan).filter(([id, p]) => !((cU2.trilhaWeeks[p.wk] || {}).mods || []).concat((cU2.trilhaWeeks[p.wk] || {}).adv || [], (cU2.trilhaWeeks[p.wk] || {}).rise || []).map(Number).includes(Number(id))).map(([id]) => id);
        check('Desfazer depois de uma semana congelar: a semana de 10/11 fica igual; nenhum módulo em duas semanas e todo módulo do plano está na lista da sua semana', canon(cU2.trilhaWeeks['2026-11-10']) === canon(T3) && !dup.length && !orphan.length, JSON.stringify({ dup, orphan, T2: cU2.trilhaWeeks['2026-11-03'] }));
    });
    // ── TR17e · semana final (30/12): a recolocação automática é do app — a restauração devolve só o que ela moveu, não apaga as datas das etapas, não
    //    refaz a recolocação no registro vazio; ⏳ = o que a prévia disse; as etapas dos dias passados continuam marcáveis no bloco; restaurar de novo não muda nada ──
    await scenario(browser, 'TR17e-restaurar-semana-final-3012', '2026-10-27', {}, async (S) => {
        let page = S.page;
        const tues = []; for (let d = '2026-11-03'; d <= '2026-12-29'; d = addDays(d, 7)) tues.push(d);
        for (const tu of tues) {
            let except = [];
            if (tu === '2026-12-29') { const c = await getLS(page, CFG); const st = []; Object.entries(c.trilhaPlan).forEach(([id, p]) => STG.forEach(ts => { if (p[ts] >= '2026-12-22' && p[ts] <= '2026-12-28') st.push([Number(id), ts, p[ts]]); })); st.sort((a, b) => a[2] < b[2] ? -1 : 1); except = st.slice(0, 2).map(x => [x[0], x[1]]); }
            await markUntil(page, addDays(tu, -1), except); page = await S.reopen(tu);
        }
        await markUntil(page, '2026-12-29'); page = await S.reopen('2026-12-30');
        const c0 = await getLS(page, CFG);
        const finalMoved = Object.values(c0.trilhaPlan).filter(p => (p.hist || []).some(h => h.why === 'final')).length;
        check('30/12: a recolocação automática da semana final rodou (trilhaFinalAutoAt de hoje) e moveu etapas (histórico "final")', /^2026-12-30\|/.test(c0.trilhaFinalAutoAt || '') && finalMoved > 0, c0.trilhaFinalAutoAt + ' · ' + finalMoved);
        // ela move uma etapa (pelo plano, com histórico "mover")
        const mv = Object.entries(c0.trilhaPlan).find(([id, p]) => !(p.hist || []).length && p.apost && p.apost >= '2026-12-15' && p.apost <= '2026-12-20');
        await page.evaluate(([id]) => { const c = JSON.parse(localStorage.getItem('medplanner_config_v1')); const p = c.trilhaPlan[id]; p.hist = [{ ts: 'apost', from: p.apost, to: '2026-12-21', at: '2026-12-30', why: 'mover' }]; p.apost = '2026-12-21'; c.simOverrides = { ...(c.simOverrides || {}), '2027-01-01': true }; localStorage.setItem('medplanner_config_v1', JSON.stringify(c)); }, mv); // e religa o simulado de 01/01
        page = await S.reopen('2026-12-30');
        const pre = { cfg: await getLS(page, CFG), tr: (await getLS(page, TRL)) || {} };
        check('com o simulado de 01/01 religado, o app refez a recolocação de hoje (marca "2026-12-30|1")', pre.cfg.trilhaFinalAutoAt === '2026-12-30|1', pre.cfg.trilhaFinalAutoAt);
        const nulls = (c) => Object.values(c.trilhaPlan).reduce((s, p) => s + STG.filter(ts => !p[ts]).length, 0);
        await clickTab(page, 'TRILHA'); await rClick(page, /^Ver o que mudou desde a atualização$/);
        const diag = await rDiag(page); const nPend = Number((diag.match(/(\d+) etapa\(s\) aparecem como ⏳ pendentes/) || [])[1]);
        check('diagnóstico na semana final: só a etapa que ela moveu está "fora da data original" (a recolocação do app não conta); avisa que as etapas dos dias passados ficam no bloco do dia', /Etapas fora da data original: 1\n/.test(diag) && /apostila: SEG 21\/12 → volta para/.test(diag) && /📦 semana final: as etapas dos dias que já passaram ficam no bloco de cada dia, para você marcar o que fez/.test(diag) && nPend > 0, diag.slice(0, 300));
        await rClick(page, /^Aplicar a restauração$/);
        const cfg1 = await getLS(page, CFG);
        check('depois de aplicar: o simulado de 01/01 volta à regra e a recolocação de hoje não é refeita no registro vazio (marca do dia acompanha: "2026-12-30|0", mesmo registro da recolocação, nenhuma etapa a mais sem data) e a etapa movida volta', cfg1.trilhaFinalAutoAt === '2026-12-30|0' && !(cfg1.simOverrides || {})['2027-01-01'] && canon(cfg1.trilhaFinalLog) === canon(pre.cfg.trilhaFinalLog) && nulls(cfg1) === nulls(pre.cfg) && cfg1.trilhaPlan[mv[0]].apost === mv[1].apost, JSON.stringify([cfg1.trilhaFinalAutoAt, nulls(cfg1), nulls(pre.cfg)]));
        await rClick(page, /^Ver o que mudou desde a atualização$/); const c2 = await rCard(page);
        check('restaurar de novo na semana final: "Nada a restaurar" e o arquivo com 1 entrada', /Nada a restaurar/.test(c2.text) && (await rArc(page)).length === 1, c2.text.slice(0, 200)); await rClick(page, /^Fechar$/);
        await clickTab(page, 'CRONOGRAMA');
        const pend = await banner(page, 'trilha-pending');
        check('⏳ no topo = o número que a prévia mostrou (' + nPend + ')', !!pend && new RegExp('Ficaram para trás ' + nPend + ' etapas').test(pend.text), pend && pend.text.slice(0, 100));
        let lastD = null; Object.values(cfg1.trilhaPlan).forEach(p => STG.forEach(ts => { if (p[ts] && p[ts] < '2026-12-30' && (!lastD || p[ts] > lastD)) lastD = p[ts]; }));
        let kBack = 0; while (addDays('2026-12-29', -7 * kBack) > lastD) kBack++; if (kBack) await navWeek(page, -kBack);
        await clickDate(page, br(lastD)); const dL = await readDay(page); const bL = dL.blocks.find(b => b.tm != null && b.ts && !b.au);
        check('o último dia que já passou com etapa no plano (' + br(lastD) + ') mostra a etapa marcável no bloco (as datas não foram apagadas)', !!bL, JSON.stringify(dL.blocks.map(b => b.text.slice(0, 40))));
        if (bL) { await clickTask(page, new RegExp('^' + bL.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 60)), null); const t = await getLS(page, TRL); check('marcar a etapa no bloco de ' + br(lastD) + ' carimba ' + br(lastD), (t[bL.tm] || {})[STAMP[bL.ts]] === lastD, JSON.stringify(t[bL.tm])); }
        await clickTab(page, 'TRILHA'); await rClick(page, /^Desfazer a restauração$/); await rClick(page, /^Confirmar: desfazer$/);
        check('Desfazer na semana final devolve o estado de antes (plano, marca da semana final, registro)', subX(await getLS(page, CFG)) === subX(pre.cfg) && canon((await getLS(page, TRL)) || {}) === canon(pre.tr));
        await rClick(page, /^Refazer a restauração$/); await rClick(page, /^Confirmar: refazer$/);
        const cR = await getLS(page, CFG); const pastD = (c) => { const o = {}; Object.entries(c.trilhaPlan).forEach(([id, p]) => STG.forEach(ts => { const d0 = (p.orig || {})[ts]; if (d0 && d0 < '2026-12-30') o[id + '.' + ts] = p[ts]; })); return o; };
        check('Refazer na semana final: a restauração volta a valer, com a marca "as etapas dos dias passados ficam no bloco" (trilhaFinalKeep = 30/12)', cR.trilhaFinalKeep === '2026-12-30', cR.trilhaFinalKeep);
        await page.evaluate(() => { const c = JSON.parse(localStorage.getItem('medplanner_config_v1')); c.manualWeek = null; localStorage.setItem('medplanner_config_v1', JSON.stringify(c)); }); // volta à semana de hoje (a navegação ◀ ficou na semana anterior)
        page = await S.reopen('2026-12-31'); const c31 = await getLS(page, CFG);
        const lost = Object.entries(pastD(cR)).filter(([k, v]) => v && v < '2026-12-30' && (pastD(c31)[k] || null) !== v).map(([k]) => k);
        check('no dia seguinte (31/12) a recolocação automática roda, mas as etapas dos dias que já passaram ficam no bloco do dia (nenhuma vai para "depois de 01/01"); o ⏳ continua', /^2026-12-31\|/.test(c31.trilhaFinalAutoAt || '') && !lost.length && !!(await banner(page, 'trilha-pending')), JSON.stringify({ key: c31.trilhaFinalAutoAt, lost: lost.slice(0, 6), n: lost.length }));
    });
    // ── TR17f · blocos que ela criou nos dias da Trilha: por padrão saem da tela (ficam no arquivo); a prévia oferece mantê-los no dia regenerado ──
    const own12 = { id: 'c-1794200000000', d: 'EXTRA', color: '#0EA5E9', text: 'Consulta médica 14h', time: '3h', done: true }, own05 = { id: 'c-1761000000000', d: 'EXTRA', color: '#0EA5E9', text: 'Consulta (editado por ela)', time: '1h' };
    const cfgF = { ...baseCfg, trilhaFirstOpen: '2026-10-27', trilhaInicio: '2026-10-26', trilhaLegacyOv: { '2026-10-20': null, '2026-10-21': null }, lightDayOverrides: { '2026-11-03': 1, '2026-11-10': 2 } }; // dia sem remédio: QUA 04/11 (já vivido) e QUI 12/11 (ainda vai chegar)
    await scenario(browser, 'TR17f-restaurar-meus-blocos', '2026-11-07', { [CFG]: cfgF, [SCH]: { '2026-11-12': [{ id: 'g-2026-11-12-0', d: 'ANKI', color: '#0369A1', text: 'Anki + Meditação 15min', time: '35min', done: true }, own12], '2026-11-05': [own05] } }, async (S) => {
        const page = S.page;
        await clickTab(page, 'TRILHA'); await rClick(page, /^Ver o que mudou desde a atualização$/);
        const diag = await rDiag(page);
        check('prévia: os blocos dela aparecem por dia (o de 05/11 marcado "de antes da atualização") e a opção de mantê-los, desmarcada', /QUI 05\/11 · 1 bloco\(s\), 0 ✓ · seus: “Consulta \(editado por ela\)” \(de antes da atualização\) — sai\(em\) da tela, fica\(m\) no arquivo/.test(diag) && /QUI 12\/11 · 2 bloco\(s\), 2 ✓ · seus: “Consulta médica 14h” — sai/.test(diag) && /Manter nos dias regenerados os 2 bloco\(s\) que você criou/.test(diag) && !(await page.evaluate(() => document.querySelector('[data-t="restore-keepown"] input').checked)), diag.slice(0, 500));
        check('dia sem remédio (🧠): a escolha da semana de 10/11 (QUI 12/11, ainda vai chegar) volta ao previsto; a da semana de 03/11 (QUA 04/11, já vivida) fica, com as duas datas', /dia sem remédio da semana de 10\/11: QUI 12\/11 \(sua escolha\) → \S+ \d\d\/11 \(o previsto\)/.test(diag) && /dia sem remédio da semana de 03\/11: fica QUA 04\/11 \(a sua escolha — esse dia, ou o previsto, \S+ \d\d\/11, já passou ou é hoje/.test(diag), (diag.match(/dia sem remédio[^\n]*/g) || []).join(' | '));
        await page.evaluate(() => document.querySelector('[data-t="restore-keepown"] input').click()); await page.waitForTimeout(300);
        const diag2 = await rDiag(page);
        check('marcando "Manter…", a prévia diz que eles ficam no dia, sem ✓', /“Consulta médica 14h” — fica\(m\) no dia, sem ✓/.test(diag2), (diag2.match(/QUI 12\/11[^\n]*/) || [''])[0]);
        await rClick(page, /^Aplicar a restauração$/);
        const sch = (await getLS(page, SCH)) || {}, L = await rArc(page);
        const d12 = sch['2026-11-12'] || [];
        check('aplicado com "Manter": 12/11 e 05/11 voltam a ser gerados com o bloco dela (sem ✓) antes do lazer; o resto do dia é o gerado (sem ✓); o arquivo guarda a escolha', d12.some(a => a.text === 'Consulta médica 14h' && !a.done) && !d12.some(a => a.done) && d12[d12.length - 1].d === 'LAZER' && (sch['2026-11-05'] || []).some(a => a.text === 'Consulta (editado por ela)') && L.length === 1 && L[0].opts.keepOwn === true && canon((await getLS(page, CFG)).lightDayOverrides) === canon({ '2026-11-03': 1 }), JSON.stringify(d12.map(a => a.text.slice(0, 30) + (a.done ? '✓' : ''))));
        await rClick(page, /^Ver o que mudou desde a atualização$/); const c2 = await rCard(page);
        check('restaurar de novo: a prévia começa com a escolha da restauração em vigor ("Manter" marcado) — "Nada a restaurar"', /Nada a restaurar/.test(c2.text) && (await page.evaluate(() => document.querySelector('[data-t="restore-keepown"] input').checked)), c2.text.slice(0, 200));
        await page.evaluate(() => document.querySelector('[data-t="restore-keepown"] input').click()); await page.waitForTimeout(300);
        const c3 = await rCard(page); check('… desmarcando "Manter" (escolha dela), a prévia oferece "Aplicar"', c3.btns.includes('Aplicar a restauração'), c3.btns.join(' | '));
    });
    // ── TR17g · dia sem remédio no Desfazer (🧠): a troca que mexeria num dia já vivido ou no de hoje não acontece — fica como está, com as duas datas ──
    await scenario(browser, 'TR17g-restaurar-dia-sem-remedio-desfazer', '2026-10-27', {}, async (S) => {
        let page = await S.reopen('2026-11-04');
        await page.evaluate(() => { const c = JSON.parse(localStorage.getItem('medplanner_config_v1')); c.lightDayOverrides = { ...(c.lightDayOverrides || {}), '2026-11-03': 5 }; localStorage.setItem('medplanner_config_v1', JSON.stringify(c)); }); // em 04/11 ela escolhe DOM 08/11
        page = await S.reopen('2026-11-04'); const T2l = (await getLS(page, CFG)).trilhaWeeks['2026-11-03'].light;
        await clickTab(page, 'TRILHA'); await rClick(page, /^Ver o que mudou desde a atualização$/); const diag = await rDiag(page);
        check('04/11: a escolha DOM 08/11 e o previsto (' + br(T2l) + ') ainda vão chegar → volta ao previsto, com as duas datas', new RegExp('dia sem remédio da semana de 03\\/11: DOM 08\\/11 \\(sua escolha\\) → \\S+ ' + br(T2l).replace('/', '\\/') + ' \\(o previsto\\)').test(diag), (diag.match(/dia sem remédio[^\n]*/) || [''])[0]);
        await rClick(page, /^Aplicar a restauração$/);
        check('depois de aplicar: sem a escolha (vale o previsto, ' + br(T2l) + ')', ((await getLS(page, CFG)).lightDayOverrides || {})['2026-11-03'] === undefined);
        page = await S.reopen('2026-11-08'); // o previsto (07/11) já foi vivido como dia sem remédio; hoje é 08/11
        await clickTab(page, 'TRILHA'); await rClick(page, /^Desfazer a restauração$/); const up = await page.evaluate(() => document.querySelector('[data-t="restore-undo"]').innerText);
        check('Desfazer em 08/11: a prévia diz que o dia sem remédio fica como está (o previsto já foi vivido e a escolha de antes seria hoje)', new RegExp('dia sem remédio da semana de 03\\/11: fica \\S+ ' + br(T2l).replace('/', '\\/') + ' \\(esse dia, ou o que voltaria, DOM 08\\/11, já passou ou é hoje').test(up), up.slice(0, 500));
        await rClick(page, /^Confirmar: desfazer$/);
        check('… e grava assim: a escolha de antes não volta (hoje não vira dia sem remédio; o dia vivido não é reescrito)', ((await getLS(page, CFG)).lightDayOverrides || {})['2026-11-03'] === undefined);
    });
    // ── TR17h · Refazer e o dia sem remédio: a prévia compara com o que o Desfazer gravou (no dia dele) e não atribui a ela uma escolha que ela não fez ──
    await scenario(browser, 'TR17h-restaurar-refazer-dia-sem-remedio', '2026-10-27', {}, async (S) => {
        let page = await S.reopen('2026-11-04');
        await page.evaluate(() => { const c = JSON.parse(localStorage.getItem('medplanner_config_v1')); c.lightDayOverrides = { ...(c.lightDayOverrides || {}), '2026-11-03': 5 }; localStorage.setItem('medplanner_config_v1', JSON.stringify(c)); });
        page = await S.reopen('2026-11-04'); const T2l = (await getLS(page, CFG)).trilhaWeeks['2026-11-03'].light;
        await clickTab(page, 'TRILHA'); await rClick(page, /^Ver o que mudou desde a atualização$/); await rClick(page, /^Aplicar a restauração$/);
        await rClick(page, /^Desfazer a restauração$/); const up = await page.evaluate(() => document.querySelector('[data-t="restore-undo"]').innerText);
        check('Desfazer no mesmo dia (04/11, as duas datas ainda vão chegar): "Voltam" mostra o dia sem remédio com as duas datas', new RegExp('Voltam[\\s\\S]*dia sem remédio da semana de 03\\/11: \\S+ ' + br(T2l).replace('/', '\\/') + ' → DOM 08\\/11').test(up), up.slice(0, 400));
        await rClick(page, /^Confirmar: desfazer$/);
        check('… e a escolha DOM 08/11 volta', canon(((await getLS(page, CFG)).lightDayOverrides || {})['2026-11-03']) === '5');
        page = await S.reopen('2026-11-08'); // ela viveu 07/11 com o remédio; hoje (08/11) é o dia sem remédio escolhido
        await clickTab(page, 'TRILHA'); await rClick(page, /^Refazer a restauração$/); const rp = await page.evaluate(() => document.querySelector('[data-t="restore-redo"]').innerText);
        check('Refazer em 08/11: nenhuma "escolha feita depois de desfazer" que ela não fez; o dia sem remédio fica (DOM 08/11 é hoje), em "Fica como está"', !/escolhas feitas depois de desfazer/.test(rp) && /nada — você não mudou nada depois de desfazer/.test(rp) && /Fica como está[\s\S]*dia sem remédio da semana de 03\/11: fica DOM 08\/11/.test(rp) && !/Saem de novo[^]*dia sem remédio[^]*Mudanças suas/.test(rp), rp.slice(0, 600));
        await rClick(page, /^Confirmar: refazer$/);
        check('… e grava assim: a escolha de hoje fica', canon(((await getLS(page, CFG)).lightDayOverrides || {})['2026-11-03']) === '5');
    });
    // ── TR17i · restaurar na semana antes da final (28/12): no dia 29/12 a recolocação da semana final não tira dos blocos as etapas dos dias que já passaram ──
    await scenario(browser, 'TR17i-restaurar-antes-da-semana-final-2812', '2026-10-27', {}, async (S) => {
        let page = S.page;
        for (let tu = '2026-11-03'; tu <= '2026-12-22'; tu = addDays(tu, 7)) { await markUntil(page, addDays(tu, -1)); page = await S.reopen(tu); }
        await markUntil(page, '2026-12-27'); page = await S.reopen('2026-12-28');
        await clickTab(page, 'TRILHA'); await rClick(page, /^Ver o que mudou desde a atualização$/); const diag = await rDiag(page);
        check('28/12: a prévia avisa que, a partir de 29/12, as etapas dos dias que já passaram ficam no bloco de cada dia', /📦 a partir de 29\/12 \(semana final\): as etapas dos dias que já passaram ficam no bloco de cada dia/.test(diag), (diag.match(/📦[^\n]*/) || [''])[0]);
        await rClick(page, /^Aplicar a restauração$/); const c1 = await getLS(page, CFG);
        check('Aplicar em 28/12 grava trilhaFinalKeep = 28/12', c1.trilhaFinalKeep === '2026-12-28', c1.trilhaFinalKeep);
        await page.evaluate(() => { const c = JSON.parse(localStorage.getItem('medplanner_config_v1')); c.manualWeek = null; localStorage.setItem('medplanner_config_v1', JSON.stringify(c)); });
        page = await S.reopen('2026-12-29'); const c2 = await getLS(page, CFG);
        const lost = []; Object.entries(c1.trilhaPlan).forEach(([id, p]) => STG.forEach(ts => { if (p[ts] && p[ts] < '2026-12-28' && ((c2.trilhaPlan[id] || {})[ts] || null) !== p[ts]) lost.push(id + '.' + ts); }));
        check('29/12: a recolocação da semana final roda e nenhuma etapa de dia anterior à restauração sai do seu bloco; o ⏳ continua', /^2026-12-29\|/.test(c2.trilhaFinalAutoAt || '') && !lost.length && !!(await banner(page, 'trilha-pending')), JSON.stringify({ key: c2.trilhaFinalAutoAt, n: lost.length, lost: lost.slice(0, 5) }));
    });
    // ── TR17z · ACEITE PONTA A PONTA (a situação dela, 07/11): 1º acesso 27/10, semanas 1 e 2 congeladas; ela move etapas e blocos à mão sem marcar nada;
    //    prévia → Aplicar → o plano volta ao do motor, o arquivo guarda, 2ª vez "Nada a restaurar"; ela marca nos blocos de dias passados; ⏳ recolocar
    //    respeita ordem, faixas e dias bloqueados; Desfazer e Refazer. Cada passo imprime o resultado (relatório §B.9). SHOTS=<pasta> salva as telas. ──
    await scenario(browser, 'TR17z-aceite-ponta-a-ponta', '2026-10-27', {}, async (S) => {
        let page = S.page; const shot = async (name, sel) => { if (!process.env.SHOTS) return; const f = require('path').join(process.env.SHOTS, name + '.png'); const h = await page.evaluate(() => { const hid = []; document.querySelectorAll('body *').forEach(e => { const p = getComputedStyle(e).position; if (p === 'fixed' || p === 'sticky') { hid.push(e); e.dataset.shotHide = e.style.visibility || '-'; e.style.visibility = 'hidden'; } }); return hid.length; }); const el = sel ? await page.$(sel) : null; if (el) await el.screenshot({ path: f }); else await page.screenshot({ path: f }); await page.evaluate(() => document.querySelectorAll('[data-shot-hide]').forEach(e => { e.style.visibility = e.dataset.shotHide === '-' ? '' : e.dataset.shotHide; delete e.dataset.shotHide; })); }; // telas para o relatório: sem o cabeçalho e a barra fixos por cima
        const say = (txt) => console.log('   📋 ' + txt); const TS_W = (ts) => ({ aula: 'aula', quest: 'questões', apost: 'apostila', seal: 'selagem' })[ts];
        const BLOCKED = new Set(['2026-10-20', '2026-10-27', '2026-11-03', '2026-11-10', '2026-11-12', '2026-11-06', '2026-12-18']); // plantão longo (20/10, 27/10, 03/11, 10/11, 12/11) e sexta de simulado (06/11, 18/12); 20–25/10 transição
        const isBlocked = (d, ts) => BLOCKED.has(d) || (d >= '2026-10-20' && d <= '2026-10-25'); // regra de 01/01 (S3b; §10.1 a, trilha.js:1366): 01/01 é dia comum — saiu o "01/01 só selagem"
        // 1 · 1º acesso 27/10; a semana 2 congela em 03/11
        const cfg27 = await getLS(page, CFG);
        page = await S.reopen('2026-11-03'); const cfgF = await getLS(page, CFG);
        const T1 = cfgF.trilhaWeeks['2026-10-26'], T2 = cfgF.trilhaWeeks['2026-11-03'];
        say('passo 1 · 1º acesso ' + cfgF.trilhaFirstOpen + ' · semana 1 = ' + JSON.stringify(T1.mods) + ' (cota ' + T1.q + ') · semana 2 = ' + JSON.stringify(T2.mods) + ' (cota ' + T2.q + (T2.held ? ', segurada' : '') + ')');
        check('passo 1: 1º acesso 27/10; semanas 1 e 2 congeladas', cfgF.trilhaFirstOpen === '2026-10-27' && !!T1 && !!T2 && T1.mods.length === 3, JSON.stringify({ T1: T1.mods, T2: T2.mods }));
        page = await S.reopen('2026-11-04'); // a bagunça acontece durante a semana 2 (aqui, em 04/11)
        await clickTab(page, 'TRILHA'); const reach0 = await page.evaluate(() => (document.body.innerText.match(/No ritmo atual cabem (\d+) módulos/) || [])[1]); say('alcance na aba Trilha antes da bagunça: ' + reach0);
        // 2 · a bagunça, pela interface, sem marcar nada
        let off = 0; const wk = (iso) => iso < '2026-11-03' ? -1 : iso < '2026-11-10' ? 0 : iso < '2026-11-17' ? 1 : 2; // em relação à semana de hoje (03–09/11)
        const goto = async (iso) => { await clickTab(page, 'CRONOGRAMA'); const k = wk(iso); if (k !== off) { await navWeek(page, k - off); off = k; } await clickDate(page, br(iso)); };
        const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const moveStage = async (id, ts, to) => { const c = await getLS(page, CFG); const from = c.trilhaPlan[id][ts]; await goto(from); const day = await readDay(page); const b = day.blocks.find(x => x.tm === id && x.ts === ts && !x.au); if (!b) throw new Error('bloco ' + id + '.' + ts + ' não está em ' + from); await moveT(page, new RegExp('^' + esc(b.text.slice(0, 60))), to); const ask = await readAsk(page); if (ask) await clickMove(page); await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(y => y.innerText.trim() === '✓ Pronto'); if (x) x.click(); }); await page.waitForTimeout(250); return { from, ask: ask ? ask.text.split('\n')[0] : '(sem aviso)' }; };
        const moveBlock = async (re, fromIso, to) => { await goto(fromIso); await moveT(page, re, to); const ask = await readAsk(page); if (ask) await clickMove(page); await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(y => y.innerText.trim() === '✓ Pronto'); if (x) x.click(); }); await page.waitForTimeout(250); };
        const P0 = cfgF.trilhaPlan; const stg = []; Object.keys(P0).forEach(id => STG.forEach(ts => stg.push({ id: Number(id), ts, d: P0[id][ts], q: P0[id].quest })));
        const inRange = (d) => d >= '2026-11-03' && d <= '2026-11-16';
        const aMod = Object.keys(P0).map(Number).find(id => P0[id].aula >= '2026-11-05' && inRange(P0[id].aula) && inRange(P0[id].quest));
        const r1 = await moveStage(aMod, 'aula', P0[aMod].quest); say('passo 2a · aula de ' + aMod + ' atrasada ' + br(r1.from) + ' → ' + br(P0[aMod].quest) + ' (dia das questões) · aviso: ' + r1.ask);
        const bMod = Object.keys(P0).map(Number).find(id => id !== aMod && P0[id].apost >= '2026-11-06' && inRange(P0[id].apost) && addDays(P0[id].apost, -1) > P0[id].quest);
        const bTo = bMod ? addDays(P0[bMod].apost, -1) : null; if (bMod) { const r = await moveStage(bMod, 'apost', bTo); say('passo 2b · apostila de ' + bMod + ' adiantada ' + br(r.from) + ' → ' + br(bTo) + ' · aviso: ' + r.ask); }
        const cS = stg.find(x => x.id !== aMod && x.id !== bMod && x.d >= '2026-11-05' && inRange(x.d) && x.d !== '2026-11-10' && x.ts !== 'aula'); const rc = await moveStage(cS.id, cS.ts, '2026-11-10'); say('passo 2c · ' + TS_W(cS.ts) + ' de ' + cS.id + ' → TER 10/11 (plantão longo) · aviso: ' + rc.ask);
        const dS = stg.find(x => x.id !== aMod && x.id !== bMod && x.id !== cS.id && x.d >= '2026-11-07' && inRange(x.d)); const rd = await moveStage(dS.id, dS.ts, '2026-11-06'); say('passo 2d · ' + TS_W(dS.ts) + ' de ' + dS.id + ' → SEX 06/11 (sexta de simulado, dia bloqueado) · aviso: ' + rd.ask);
        await moveBlock(/^Anki/, '2026-11-08', '2026-11-09'); await moveBlock(/^Academia/, '2026-11-09', '2026-11-08'); say('passo 2e · blocos comuns movidos: Anki de 08/11 → 09/11, academia de 09/11 → 08/11');
        await page.evaluate(() => { const c = JSON.parse(localStorage.getItem('medplanner_config_v1')); c.manualWeek = null; localStorage.setItem('medplanner_config_v1', JSON.stringify(c)); }); off = 0;
        page = await S.reopen('2026-11-07');
        const pre = { cfg: await getLS(page, CFG), sch: (await getLS(page, SCH)) || {}, tr: (await getLS(page, TRL)) || {} };
        const movedPre = []; Object.entries(pre.cfg.trilhaPlan).forEach(([id, p]) => STG.forEach(ts => { if (p[ts] !== p.orig[ts]) movedPre.push(id + '.' + ts); }));
        check('passo 2: a bagunça está gravada — 4 etapas fora da data original, dias editados, nada marcado', movedPre.length === (bMod ? 4 : 3) && Object.keys(pre.sch).some(d => d >= '2026-10-26') && JSON.stringify(pre.tr) === '{}', JSON.stringify({ movedPre, days: Object.keys(pre.sch) }));
        // 3 · prévia
        await clickTab(page, 'TRILHA'); await rClick(page, /^Ver o que mudou desde a atualização$/); const diag = await rDiag(page);
        await shot('aceite-1-previa', '[data-t="restore-card"]');
        const issues = await page.evaluate(() => (document.querySelector('[data-t="restore-issues"]') || {}).innerText || ''); const reach = await page.evaluate(() => (document.querySelector('[data-t="restore-reach"]') || {}).innerText || '');
        say('passo 3 · ' + issues.replace(/\n/g, ' | ')); say('passo 3 · ' + reach.replace(/\n/g, ' | '));
        const nn = (re) => Number((issues.match(re) || [])[1]);
        check('passo 3: prévia — etapas fora da data original = ' + movedPre.length + '; o retrato da desorganização (no mesmo dia, em dia bloqueado, fora da faixa) e "depois de restaurar: 0 · 0 · 0 · 0"; 0 ✓ no registro', new RegExp('Etapas fora da data original: ' + movedPre.length + '\\n').test(diag) && nn(/(\d+) no mesmo dia/) >= 1 && nn(/(\d+) em dia bloqueado/) >= 2 && /depois de restaurar: 0 fora da ordem · 0 no mesmo dia que outra etapa do mesmo módulo · 0 em dia bloqueado [^·]*· 0 fora da faixa de intervalo/.test(issues) && /Dias da Trilha editados à mão: [1-9]/.test(diag) && /Registro da Trilha desde o 1º acesso à versão nova \(27\/10\): 0 ✓ de etapa/.test(diag), issues);
        check('passo 3: prévia do alcance — antes → depois, com "o ritmo da semana seguinte fica segurado até a semana anterior fechar"', /alcance estimado: \d+ módulos agora → \d+ depois de restaurar/.test(reach) && /o ritmo da semana seguinte fica segurado até a semana anterior fechar/.test(reach) && /bloco 04h30 \(16\/11 a 11\/12\) o ritmo não sobe/.test(reach), reach);
        // 4 · Aplicar
        await rClick(page, /^Aplicar a restauração$/);
        const cfgA = await getLS(page, CFG), schA = (await getLS(page, SCH)) || {}, trA = (await getLS(page, TRL)) || {}, LA = await rArc(page);
        const engine = (id) => { const f = (T1.mods.includes(Number(id)) ? cfg27 : cfgF).trilhaPlan[id]; return STG.map(ts => f[ts]).join(' '); };
        const same = Object.keys(cfgA.trilhaPlan).every(id => STG.map(ts => cfgA.trilhaPlan[id][ts]).join(' ') === engine(id) && !(cfgA.trilhaPlan[id].hist || []).length);
        say('passo 4 · plano depois de aplicar: ' + Object.keys(cfgA.trilhaPlan).map(id => id + ' ' + STG.map(ts => br(cfgA.trilhaPlan[id][ts])).join('·')).join(' | '));
        check('passo 4a: o plano volta ao que o motor gerou (T1 como congelou em 27/10, T2 como congelou em 03/11), sem histórico de movimentos; dias da Trilha sem edição', same && !Object.keys(schA).some(d => d >= '2026-10-26') && JSON.stringify(trA) === '{}');
        check('passo 4b: o arquivo guarda a versão anterior inteira (config, dias, registro), com data e hora', LA.length === 1 && LA[0].why === 'restaurar' && canon(LA[0].config) === canon(pre.cfg) && canon(LA[0].schedule) === canon(pre.sch) && canon(LA[0].trail) === canon(pre.tr) && /^2026-11-07T/.test(LA[0].at));
        await rClick(page, /^Ver o que mudou desde a atualização$/); const c2 = await rCard(page);
        check('passo 4c: uma 2ª restauração diz "Nada a restaurar" e o arquivo não cresce', /Nada a restaurar/.test(c2.text) && (await rArc(page)).length === 1, c2.text.slice(0, 120)); await rClick(page, /^Fechar$/);
        await shot('aceite-2-restaurado', '[data-t="restore-card"]');
        // 5 · ela marca nos blocos de dias passados das semanas 1 e 2
        await clickTab(page, 'CRONOGRAMA'); const pend0 = await banner(page, 'trilha-pending'); const n0 = Number((pend0.text.match(/Ficaram para trás (\d+) etapas/) || [])[1]);
        const pastT = []; Object.entries(cfgA.trilhaPlan).forEach(([id, p]) => STG.forEach(ts => { if (p[ts] && p[ts] < '2026-11-07') pastT.push({ id: Number(id), ts, d: p[ts] }); })); pastT.sort((a, b) => a.d < b.d ? -1 : 1);
        const w2 = pastT.find(x => x.d >= '2026-11-03' && STG.indexOf(x.ts) === 1), w2a = w2 && pastT.find(x => x.id === w2.id && x.ts === 'aula'), w1 = pastT.find(x => x.d < '2026-11-03' && x.ts === 'aula' && (!w2 || x.id !== w2.id)); // na ordem: a aula antes das questões
        const marks = [w1, w2a, w2].filter(Boolean);
        for (const x of marks) { await goto(x.d); const day = await readDay(page); const b = day.blocks.find(y => y.tm === x.id && y.ts === x.ts && !y.au); await clickTask(page, new RegExp('^' + esc(b.text.slice(0, 60))), x.ts === 'quest' ? /D2 · 30q/ : null); }
        await goto('2026-11-07'); const trM = await getLS(page, TRL); const pend1 = await banner(page, 'trilha-pending'); const n1 = Number((pend1.text.match(/Ficaram para trás (\d+) etapas/) || [])[1]);
        say('passo 5 · marcou ' + marks.map(x => TS_W(x.ts) + ' de ' + x.id + ' no bloco de ' + br(x.d) + ' → carimbo ' + br(trM[x.id][STAMP[x.ts]])).join('; ') + ' · ⏳ ' + n0 + ' → ' + n1);
        check('passo 5: marcar no bloco do dia passado (semana 1 e semana 2) carimba a data do bloco, e o ⏳ diminui', marks.length === 3 && marks.some(x => x.d >= '2026-11-03') && marks.some(x => x.d < '2026-11-03') && marks.every(x => trM[x.id][STAMP[x.ts]] === x.d) && n1 === n0 - marks.length, JSON.stringify({ n0, n1 }));
        // 6 · ⏳ Ver como recolocar
        await clickIn(page, 'trilha-pending', 'Ver como recolocar'); const pv = await banner(page, 'trilha-pending'); say('passo 6 · proposta: ' + pv.text.replace(/\n/g, ' ').slice(0, 900));
        await shot('aceite-3-recolocar', '[data-t="trilha-pending"]');
        const cBefore = await getLS(page, CFG); await clickIn(page, 'trilha-pending', 'Aplicar'); const cR = await getLS(page, CFG);
        const bad = []; Object.entries(cR.trilhaPlan).forEach(([id, p]) => { if (!(p.hist || []).some(h => h.why === 'recolocar')) return; const t = trM[id] || {}; const D = {}; STG.forEach(ts => { D[ts] = t[FIELD[ts]] ? t[STAMP[ts]] : p[ts]; });
            const moved = STG.filter(ts => !t[FIELD[ts]] && p[ts] !== cBefore.trilhaPlan[id][ts]);
            for (let i = 1; i < 4; i++) { const a = D[STG[i - 1]], b = D[STG[i]]; if (a && b && b <= a) bad.push(id + ' ordem/mesmo dia ' + STG[i - 1] + '→' + STG[i]); }
            moved.forEach(ts => { if (isBlocked(p[ts], ts)) bad.push(id + '.' + ts + ' em dia bloqueado ' + p[ts]); if (p[ts] < '2026-11-07') bad.push(id + '.' + ts + ' antes de hoje'); });
            const gap = { quest: [1, 2], apost: [1, 2], seal: [2, 5] };
            for (let i = 1; i < 4; i++) { const x = STG[i - 1], y = STG[i]; if (!moved.includes(y) || !D[x] || !D[y]) continue; const g = dd(D[x], D[y]); if (g < gap[y][0] || g > gap[y][1]) { if (moved.includes(x)) bad.push(id + ' fora da faixa ' + x + '→' + y + ' (' + g + 'd)'); else if (!/fora de/.test(pv.text)) bad.push(id + ' faixa com a etapa feita fora (' + g + 'd) sem aviso'); } } });
        say('passo 6 · aplicada; conferência: ' + (bad.length ? bad.join('; ') : 'ordem, faixas e dias bloqueados ok; nenhum módulo com duas etapas no mesmo dia'));
        check('passo 6: a proposta cobre todos os módulos com ⏳ e respeita a ordem, as faixas entre as etapas recolocadas e os dias bloqueados; nenhum módulo com duas etapas no mesmo dia; o intervalo com uma etapa feita há muito tempo aparece avisado ("fora de"); ⚠️ de carga só informa (Aplicar existe)', !bad.length && pv.btns.includes('Aplicar') && !/não cabe/.test(pv.text), bad.join('; '));
        // 7 · Desfazer e Refazer
        const beforeUndo = { cfg: cR, sch: (await getLS(page, SCH)) || {}, tr: await getLS(page, TRL) };
        await clickTab(page, 'TRILHA'); await rClick(page, /^Desfazer a restauração$/); const up = await page.evaluate(() => document.querySelector('[data-t="restore-undo"]').innerText); await rClick(page, /^Confirmar: desfazer$/);
        const cU = await getLS(page, CFG), tU = (await getLS(page, TRL)) || {}, sU = (await getLS(page, SCH)) || {};
        const trilhaDays = (o) => Object.fromEntries(Object.entries(o || {}).filter(([k]) => k >= '2026-10-26'));
        say('passo 7 · Desfazer — prévia: ' + up.replace(/\n/g, ' | ').slice(0, 500));
        check('passo 7a: Desfazer devolve a bagunça de antes da restauração (plano, dias da Trilha, registro vazio); a prévia listou as marcas e as recolocações feitas depois', subX(cU) === subX(pre.cfg) && canon(tU) === canon(pre.tr) && canon(trilhaDays(sU)) === canon(trilhaDays(pre.sch)) && /marcas feitas depois da restauração \(3\)/.test(up) && /mudada depois da restauração/.test(up), up.slice(0, 300));
        await rClick(page, /^Refazer a restauração$/); await rClick(page, /^Confirmar: refazer$/);
        const cRR = await getLS(page, CFG), tRR = await getLS(page, TRL), sRR = (await getLS(page, SCH)) || {};
        say('passo 7 · Refazer — plano: ' + Object.keys(cRR.trilhaPlan).filter(id => (cRR.trilhaPlan[id].hist || []).length).map(id => id + ' ' + STG.map(ts => br(cRR.trilhaPlan[id][ts] || '----------')).join('·')).join(' | '));
        check('passo 7b: Refazer volta ao estado de antes de desfazer (restaurado + as 3 marcas + a recolocação)', subX(cRR) === subX(beforeUndo.cfg) && canon(tRR) === canon(beforeUndo.tr) && canon(trilhaDays(sRR)) === canon(trilhaDays(beforeUndo.sch)));
    });

    await browser.close();
    H.summary('trilha');
})();
