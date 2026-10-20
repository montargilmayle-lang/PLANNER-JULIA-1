// TRILHA — tabela de intervalos de todos os módulos planejados (prévia de 19/10, sem registros) + cargas por dia + invariantes.
// Lida do cronograma renderizado (etiquetas data-tm/data-ts e a data da aba), Sem.42 a Sem.52.
const H = require('./harness.js');
const { openPlanner, readDay, check, listDayTabs, clickDate, navWeek } = H;
const RAMP = [3, 4, 4, 4, 4, 4, 4, 4, 5, 4, 0];
const STG = ['aula', 'quest', 'apost', 'seal'];
const GAP = { quest: [1, 2], apost: [1, 2], seal: [2, 5] };
const BLOCKED = ['2026-10-20', '2026-10-27', '2026-11-03', '2026-11-06', '2026-11-10', '2026-11-12', '2026-12-18']; // plantões longos e sextas de simulado
const HOLI = ['2026-12-24', '2026-12-25', '2026-12-31'];
const iso = (dm) => (dm.slice(3) === '01' ? '2027' : '2026') + '-' + dm.slice(3) + '-' + dm.slice(0, 2);
const dd = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);
const br = (x) => x ? x.slice(8, 10) + '/' + x.slice(5, 7) : '—';
const VENV_TIME = /Venvanse[^.\n]{0,40}\d{1,2}(h|:\d\d)|\d{1,2}(h|:\d\d)[^.\n]{0,40}Venvanse|estimulante[^.\n]{0,30}\d{1,2}(h\d*|:\d\d)/i;
(async () => {
    const browser = await H.pw.chromium.launch();
    const { ctx, page } = await openPlanner(browser, '2026-10-19', {});
    await navWeek(page, 1);
    const map = {}, days = {}, opens = [], lights = [], order = [];
    for (let k = 0; k < 11; k++) {
        const panel = await page.evaluate(() => [...document.querySelectorAll('[data-t="trilha-panel"] [data-mod]')].map(e => ({ kind: e.getAttribute('data-kind'), mod: e.getAttribute('data-mod') })));
        opens.push(panel.filter(p => p.kind === 'novo').length);
        for (const t of await listDayTabs(page)) {
            await clickDate(page, t.date); const d = await readDay(page); const di = iso(t.date); days[di] = d;
            if (d.light && !lights.includes(d.light.note.slice(4, 9))) lights.push(d.light.note.slice(4, 9));
            d.blocks.forEach(b => { if (b.tm == null || b.au) return; const m = (map[b.tm] = map[b.tm] || { code: (b.mod || '').split(' · ')[0] }); if (m[b.ts]) m[b.ts + '_dup'] = di; else m[b.ts] = di; if (!order.includes(b.tm) && b.ts === 'aula') order.push(b.tm); });
        }
        if (k < 10) await navWeek(page, 1);
    }
    console.log('\n## TABELA DE INTERVALOS — módulos planejados na prévia de 19/10 (aula →Nd→ questões →Nd→ apostila →Nd→ selagem)');
    let k = 0, qp1 = 0, ps3 = 0, aq1 = 0; const bad = [];
    order.forEach(id => { const m = map[id]; k++;
        const g = (a, b) => m[a] && m[b] ? dd(m[a], m[b]) : null;
        console.log(`   #${String(k).padStart(2)} ${String(id).padStart(3)} ${m.code.padEnd(5)} | aula ${br(m.aula)} →${g('aula', 'quest')}d→ questões ${br(m.quest)} →${g('quest', 'apost')}d→ apostila ${br(m.apost)} →${g('apost', 'seal')}d→ selagem ${br(m.seal)}`);
        if (g('quest', 'apost') === 1) qp1++; if (g('apost', 'seal') === 3) ps3++; if (g('aula', 'quest') === 1) aq1++;
        STG.forEach((ts, i) => { if (!m[ts]) bad.push(id + ' sem ' + ts); if (m[ts + '_dup']) bad.push(id + ' ' + ts + ' duplicada'); if (i > 0 && m[ts] && m[STG[i - 1]]) { const x = dd(m[STG[i - 1]], m[ts]); if (x < GAP[ts][0] || x > GAP[ts][1]) bad.push(id + ' ' + STG[i - 1] + '→' + ts + ' ' + x + 'd'); } });
    });
    console.log(`   questões→apostila no ideal (1 dia): ${qp1}/${order.length} · apostila→selagem no ideal (3 dias): ${ps3}/${order.length} · aula→questões em 1 dia: ${aq1}/${order.length}`);
    check('40 módulos planejados até 01/01 (prévia de 19/10)', order.length === 40, order.length);
    check('aberturas por semana = rampa [' + RAMP.join(',') + ']', JSON.stringify(opens) === JSON.stringify(RAMP), JSON.stringify(opens));
    check('cadeia completa e dentro das faixas em todos (aula→questões 1–2 · questões→apostila 1–2 · apostila→selagem 2–5), nunca duas etapas do módulo no mesmo dia', !bad.length, bad.join(', '));
    const onBlocked = Object.entries(map).flatMap(([id, m]) => STG.filter(ts => BLOCKED.includes(m[ts])).map(ts => id + ' ' + ts + ' ' + br(m[ts])));
    check('nada em plantão longo (20/10, 27/10, 03/11, 10/11, 12/11) nem em sexta de simulado (06/11, 18/12)', !onBlocked.length, onBlocked.join(', '));
    const on0101 = Object.entries(map).flatMap(([id, m]) => STG.filter(ts => m[ts] === '2027-01-01' && ts !== 'seal').map(ts => id + ' ' + ts));
    check('01/01: só selagem', !on0101.length, on0101.join(', '));
    const aulaProt = Object.entries(map).filter(([, m]) => HOLI.includes(m.aula) || lights.includes(br(m.aula))).map(([id, m]) => id + ' ' + br(m.aula));
    check('nenhuma aula nova em dia leve previsto (' + lights.join(', ') + ') nem em 24, 25 e 31/12', !aulaProt.length, aulaProt.join(', '));
    check('última selagem até 01/01', Object.values(map).every(m => m.seal && m.seal <= '2027-01-01'));
    console.log('\n## CARGA POR DIA (estudo / limiar · total do dia) — prévia de 19/10, sem revisões vencidas');
    const over = [], overH = [];
    Object.entries(days).forEach(([di, d]) => {
        const st = H.hoursOf(d); const tot = d.blocks.reduce((s, b) => s + H.parseH(b.time), 0);
        const lim = /📚 a partir de 3h/.test(d.dayType) ? 3 : /📚 a partir de 5h/.test(d.dayType) ? 5 : 8;
        const sim = d.blocks.some(b => /SIMULADO NA ÍNTEGRA/.test(b.text));
        const stages = d.blocks.filter(b => b.tm != null && !b.au).map(b => ({ aula: 'a', quest: 'Q', apost: 'P', seal: 'S' })[b.ts] + (b.mod || '').split(' · ')[0]);
        if (st > lim + 1e-9 && !sim) over.push(d.date + ' ' + st.toFixed(1) + '/' + lim);
        if (tot > 14.5 + 1e-9) overH.push(d.date + ' ' + tot.toFixed(1));
        console.log(`   ${d.title.split(' ·')[0].slice(0, 3).toUpperCase()} ${d.date}  estudo ${st.toFixed(2).replace('.', ',')}h / ${lim}h · total ${tot.toFixed(2).replace('.', ',')}h${st > lim + 1e-9 ? (sim ? ' (simulado)' : ' 📚') : ''}${d.lightBadge ? ' 🌿' : ''}  | ${stages.join(' ')}`);
    });
    console.log('   dias acima do 📚 (fora a sexta de simulado): ' + (over.join(' · ') || 'nenhum'));
    check('nenhum dia acima do tempo hábil (14,5h)', !overH.length, overH.join(' · '));
    const txt = Object.values(days).map(d => [d.title, d.dayType, d.venv].concat(d.warn, d.blocks.map(b => b.text)).join(' | ')).join('\n');
    check('nenhum texto do motor antigo nos 74 dias (Fio N, Bloco X, Selar, toque N, bloco antigo, D5/D6 ·, presencial, faculdade, Resumo rápido, 📌)', !/Fio \d|Bloco [A-H]\b|^Selar|toque \d|bloco antigo|D5 ·|D6 ·|presencial|faculdade|Resumo rápido|📌/m.test(Object.values(days).map(d => d.blocks.map(b => b.text).join('\n')).join('\n')));
    check('nenhum horário de Venvanse/estimulante em texto algum dos 74 dias', !VENV_TIME.test(txt));
    await ctx.close(); await browser.close();
    H.summary('intervalsTrilha');
})();
