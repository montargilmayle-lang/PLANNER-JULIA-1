// Tabela de intervalos — semanas com 3 blocos (A, B, C) nas duas configurações: normal (sem.43, 28/10→04/11) e simulado (sem.38, 23/09→30/09),
// com o agrupamento padrão (3 grupos), [A+B]+[C] e [A]+[B+C]. Lida do cronograma renderizado (2 semanas seguidas).
const H = require('./harness.js');
const CFG = 'medplanner_config_v1';
const base = { startDate: '2026-01-07', manualWeek: null, catchupPace: 2 };
const D = ['QUA', 'QUI', 'SEX', 'SAB', 'DOM', 'SEG', 'TER'];
async function twoWeeks(browser, clock1, clock2, cfg) {
  const out = {};
  for (const [k, clock] of [[0, clock1], [1, clock2]]) { const { ctx, page } = await H.openPlanner(browser, clock, { [CFG]: cfg }); for (let i = 0; i < 7; i++) { await H.clickDay(page, D[i]); const r = await H.readDay(page); out[7 * k + i] = r.blocks.map(b => b.text + '  ⇒ ' + ((b.mods && b.mods.length ? b.mods : [b.mod || '']).join(' / '))); } await ctx.close(); }
  return out;
}
const find = (wk, re, from = 0, to = 13) => { for (let d = from; d <= to; d++) if ((wk[d] || []).some(t => re.test(t))) return d; return null; };
const lbl = (d) => d == null ? '—' : D[d % 7] + (d >= 7 ? "'" : '');
function chain(name, wk, stages) {
  const days = []; let cur = 0;
  for (const [nm, re, fromAbs] of stages) { const d = find(wk, re, fromAbs != null ? fromAbs : cur); days.push([nm, d]); if (d != null) cur = d; }
  const parts = days.map(([nm, d], i) => (i ? ' →' + (d != null && days[i - 1][1] != null ? (d - days[i - 1][1]) + 'd' : '?') + '→ ' : '') + nm + ' ' + lbl(d));
  console.log('  ' + name.padEnd(30) + parts.join(''));
}
const blk = (L, sim) => [['presencial', /Aula presencial Medcurso/], ['aula 1.5x+D2', (sim && L === 'B') ? /deslocado da sexta/ : new RegExp('Aula online Bloco ' + L + ' \\(1\\.5x\\)|D2-' + L), 1], ['apostila', new RegExp('Apostila do Bloco ' + L), 1], ['banco', (sim && L === 'B') ? /Bloco B da semana passada \(semana de simulado/ : (L === 'C' ? /^D6 · Banco: questões por conteúdo do Bloco C da semana passada/ : new RegExp('questões por conteúdo Bloco ' + L)), 2], ['selagem', new RegExp('^Selar Bloco ' + L + ' da semana passada'), 7]];
(async () => {
  const browser = await H.pw.chromium.launch();
  for (const [phase, c1, c2, sim, wk, ids] of [['Sem.43 normal (28/10 → 04/11)', '2026-10-29', '2026-11-05', false, 43, [84, 93, 83]], ['Sem.38 simulado (23/09 → 30/09, plantões 26 e 27/09)', '2026-09-24', '2026-10-01', true, 38, [74, 92, 73]]]) {
    for (const [gname, groups] of [['padrão: A, B, C', null], ['[A+B] + [C]', [[ids[0], ids[1]], [ids[2]]]], ['[A] + [B+C]', [[ids[0]], [ids[1], ids[2]]]]]) {
      const cfg = { ...base }; if (groups) cfg.weekGroups = { [wk]: groups };
      const w = await twoWeeks(browser, c1, c2, cfg);
      console.log('\n## ' + phase + ' · agrupamento ' + gname);
      for (const L of (groups ? ['A', 'B'] : ['A', 'B', 'C'])) chain('Bloco ' + L, w, blk(L, sim));
      const mods = {}; for (let d = 0; d < 14; d++) w[d].forEach(t => { const ms = (t.split('  ⇒ ')[1] || '').split(' / ').filter(m => m && !/^Sem\./.test(m) && !/^\(/.test(m)); ms.forEach(m => { if (d >= 7 && !/da semana passada/.test(t)) return; (mods[m] = mods[m] || []).push(lbl(d) + ':' + (t.match(/^(D\d|Selar Bloco [A-H]|Semana de simulado · D\d|Semana de simulado · deslocado)/) || ['?'])[0]); }); });
      Object.entries(mods).forEach(([m, v]) => console.log('     ' + m.padEnd(40) + ' → ' + v.join(' · ')));
    }
  }
  await browser.close();
})();
