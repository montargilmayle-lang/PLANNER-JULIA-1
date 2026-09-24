// Cargas por dia (estudo) — semanas com 3 blocos, nos 3 agrupamentos e ritmos 2/4, mais a semana seguinte (selagem C na QUA', banco C na QUI')
const H = require('./harness.js');
const CFG = 'medplanner_config_v1';
const base = { startDate: '2026-01-07', manualWeek: null };
const weeks = [['Sem.38 G2 sim 23/09 (plantões 26/27)', '2026-09-24', 38, [74, 92, 73]], ['Sem.39 seguinte 30/09', '2026-10-01', 38, [74, 92, 73]], ['Sem.43 POST 28/10', '2026-10-29', 43, [84, 93, 83]], ['Sem.44 seguinte 04/11 (sim)', '2026-11-05', 43, [84, 93, 83]]];
(async () => {
  const browser = await H.pw.chromium.launch();
  for (const [name, clock, wk, ids] of weeks) for (const [gname, groups] of [['A,B,C', null], ['[A+B]+[C]', [[ids[0], ids[1]], [ids[2]]]], ['[A]+[B+C]', [[ids[0]], [ids[1], ids[2]]]]]) for (const pc of [2, 4]) {
    const cfg = { ...base, catchupPace: pc }; if (groups) cfg.weekGroups = { [wk]: groups };
    const { ctx, page } = await H.openPlanner(browser, clock, { [CFG]: cfg });
    const out = [];
    for (const d of H.DAYS7) { await H.clickDay(page, d); const r = await H.readDay(page); out.push(d + '=' + H.fmtH(H.hoursOf(r)) + (r.lightBadge ? '🌿' : '') + (r.breatherBadge ? '🌬️' : '') + (r.warn.some(x => /estudo/.test(x)) ? '📚' : '')); }
    const fit = await page.evaluate(() => ([...document.querySelectorAll('span')].map(s => s.textContent.trim()).find(t => /^⚠️ (Ritmo|Semana com)/.test(t)) || ''));
    console.log((name + ' · ' + gname + ' · p' + pc).padEnd(62) + out.join(' ') + (fit ? '\n      ' + fit : ''));
    await ctx.close();
  }
  await browser.close();
})();
