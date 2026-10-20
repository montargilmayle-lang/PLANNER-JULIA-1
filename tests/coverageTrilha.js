// COBERTURA DA TRILHA (⚙️ a tela não pode prometer o que não entrega):
// (a) prévia de 19/10: todo módulo marcado NOVO no painel tem as 4 etapas em dias até 01/01; aberturas por semana = rampa; nenhum aviso ⚠️
// (b) o que congela = a prévia: relógio em 20/10 (T1) e, com a T1 feita, em 27/10 (T2) — mesmas datas da prévia de 19/10
// (c) dia editado sem a etapa planejada ⇒ aviso 📝; "↺ Voltar ao padrão" ⇒ o aviso some e a edição fica guardada no arquivo
const H = require('./harness.js');
const { openPlanner, readDay, check, listDayTabs, clickDate, navWeek, getLS, reopen } = H;
const CFG = 'medplanner_config_v1', TRL = 'medplanner_trail_v1', SCH = 'medplanner_schedule_v1';
const RAMP = [3, 4, 4, 4, 4, 4, 4, 4, 5, 4, 0];
const STG = ['aula', 'quest', 'apost', 'seal'];
const iso = (dm) => (dm.slice(3) === '01' ? '2027' : '2026') + '-' + dm.slice(3) + '-' + dm.slice(0, 2);
async function previewMap(page) {
    const map = {}, novos = [], warn = [];
    for (let k = 0; k < 11; k++) {
        const panel = await page.evaluate(() => [...document.querySelectorAll('[data-t="trilha-panel"] [data-mod]')].map(e => ({ kind: e.getAttribute('data-kind'), mod: e.getAttribute('data-mod') })));
        novos.push(panel.filter(p => p.kind === 'novo').map(p => p.mod));
        const cov = await page.evaluate(() => (document.querySelector('[data-t="trilha-coverage"]') || {}).innerText || ''); if (cov) warn.push(cov);
        for (const t of await listDayTabs(page)) { await clickDate(page, t.date); (await readDay(page)).blocks.forEach(b => { if (b.tm != null && !b.au) { const m = (map[b.mod] = map[b.mod] || { id: b.tm }); m[b.ts] = iso(t.date); } }); }
        if (k < 10) await navWeek(page, 1);
    }
    return { map, novos, warn };
}
(async () => {
    const browser = await H.pw.chromium.launch();
    // (a)
    let { ctx, page } = await openPlanner(browser, '2026-10-19', {});
    await navWeek(page, 1);
    const pv = await previewMap(page);
    check('(a) aberturas por semana na prévia = rampa [' + RAMP.join(',') + ']', JSON.stringify(pv.novos.map(n => n.length)) === JSON.stringify(RAMP), JSON.stringify(pv.novos.map(n => n.length)));
    const incompl = pv.novos.flat().filter(m => !pv.map[m] || !STG.every(ts => pv.map[m][ts] && pv.map[m][ts] <= '2027-01-01'));
    check('(a) todo módulo NOVO tem aula, questões, apostila e selagem marcáveis em dias até 01/01', !incompl.length, incompl.join(' | '));
    check('(a) nenhum aviso de cobertura na prévia', !pv.warn.length, pv.warn.join(' / '));
    await ctx.close();
    const byId = {}; Object.values(pv.map).forEach(m => { byId[m.id] = m; });
    // (b)
    ({ ctx, page } = await openPlanner(browser, '2026-10-20', {}));
    let plan = (await getLS(page, CFG)).trilhaPlan;
    const eq = (ids) => ids.every(id => STG.every(ts => plan[id] && plan[id][ts] === byId[id][ts]));
    check('(b) relógio 20/10: a T1 congela igual à prévia de 19/10 (5, 6, 14)', eq([5, 6, 14]), JSON.stringify([5, 6, 14].map(id => [plan[id], byId[id]])));
    const tr = {}; Object.entries(plan).forEach(([id, p]) => { tr[id] = {}; STG.forEach(ts => { const f = { aula: 'aula', quest: 'questoesD2', apost: 'apostila', seal: 'smartcard' }[ts]; tr[id][f] = true; tr[id][f + 'At'] = p[ts]; }); tr[id].completedAt = p.seal; });
    await page.evaluate((v) => localStorage.setItem('medplanner_trail_v1', JSON.stringify(v)), tr);
    ({ ctx, page } = await reopen(browser, ctx, page, '2026-10-27'));
    plan = (await getLS(page, CFG)).trilhaPlan; const W2 = (await getLS(page, CFG)).trilhaWeeks['2026-10-27'];
    check('(b) relógio 27/10 com a T1 feita: a T2 congela igual à prévia de 19/10 (' + (W2 && W2.mods.join(', ')) + ')', W2 && W2.mods.length === 4 && eq(W2.mods), JSON.stringify(W2 && W2.mods.map(id => [plan[id], byId[id]])));
    await ctx.close();
    // (c)
    ({ ctx, page } = await openPlanner(browser, '2026-10-20', { [SCH]: { '2026-10-22': [{ id: 'k1', d: 'ANKI', color: '#0369A1', text: 'Anki + Meditação 15min', time: '35min' }] } }));
    await clickDate(page, '22/10');
    const cov = await page.evaluate(() => (document.querySelector('[data-t="trilha-coverage"]') || {}).innerText || '');
    check('(c) QUI 22/10 editado só com Anki ⇒ "📝 QUI 22/10: a lista editada deste dia não traz questões de CIR1 …"', /📝 QUI 22\/10: a lista editada deste dia não traz questões de CIR1 Trauma I/.test(cov), cov);
    await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Voltar ao padr/.test(x.innerText)); b.click(); }); await page.waitForTimeout(400);
    const cov2 = await page.evaluate(() => (document.querySelector('[data-t="trilha-coverage"]') || {}).innerText || '');
    const arc = JSON.parse(await page.evaluate(() => localStorage.getItem('medplanner_schedule_archive_v1')) || '{}');
    const d22 = await readDay(page);
    check('(c) "↺ Voltar ao padrão": o aviso some, as questões de CIR1 voltam ao dia e a edição fica em medplanner_schedule_archive_v1', !cov2 && d22.blocks.some(b => b.tm === 5 && b.ts === 'quest') && arc['2026-10-22'] && arc['2026-10-22'][0].list.length === 1, cov2);
    await ctx.close(); await browser.close();
    H.summary('coverageTrilha');
})();
