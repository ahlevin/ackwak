// ============================================================================
// PRINT VIEW
// ============================================================================
// Generates a self-contained HTML document optimized for printing or
// saving as PDF. Opens in a new browser tab. The user clicks Print
// (or Ctrl+P / Cmd+P) and gets a clean, formatted document.
// ============================================================================

const SCHOOL_LABELS = {
  preschool: 'Preschool',
  elementary: 'Elementary',
  middle: 'Middle school',
  high: 'High school',
  college: 'College',
  grad: 'Grad school',
  other: 'Other'
};

const PROPERTY_TYPE_LABELS = {
  primary: 'Primary residence',
  rental: 'Rental property',
  vacation: 'Vacation home'
};

const fmt$ = (n) => n == null || isNaN(n) ? ',' : `$${Math.round(n).toLocaleString()}`;
const fmtPct = (n) => n == null || isNaN(n) ? ',' : `${(n * 100).toFixed(1)}%`;
const fmtAge = (n) => n == null ? ',' : String(n);
const yesNo = (b) => b ? 'Yes' : 'No';
const escape = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

export function openPrintView(inp, sims, scenarioName) {
  const html = buildPrintHtml(inp, sims, scenarioName);
  const win = window.open('', '_blank');
  if (!win) {
    alert('Please allow popups to open the print view.');
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

function buildPrintHtml(inp, sims, scenarioName) {
  const exportedAt = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const title = scenarioName ? `${scenarioName} · Retirement Snapshot` : 'Retirement Snapshot';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escape(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bowlby+One+SC&family=Inter:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #FFFFFF;
    --surface: #F5F6F8;
    --ink: #0F1A4D;
    --ink-soft: #2A3470;
    --muted: #6B6B7C;
    --rule: #DDDEE6;
    --rule-light: #EAEBF1;
    --emerald: #0E5132;
    --oxblood: #8B1E2C;
    --amber: #B25E00;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: white; }
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: var(--ink);
    font-size: 12px;
    line-height: 1.5;
    max-width: 8.5in;
    margin: 0 auto;
    padding: 0.5in;
  }
  .display { font-family: 'Bowlby One SC', Georgia, serif; font-weight: 400; letter-spacing: -0.01em; }
  .mono { font-family: 'Geist Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums; }

  h1 { font-family: 'Bowlby One SC', Georgia, serif; font-size: 32px; line-height: 1; margin: 0 0 4px 0; color: var(--ink); }
  h2 { font-family: 'Bowlby One SC', Georgia, serif; font-size: 18px; line-height: 1.1; margin: 32px 0 12px 0; color: var(--ink); padding-bottom: 6px; border-bottom: 2px solid var(--ink); }
  h3 { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted); margin: 16px 0 6px 0; }

  .header-meta { color: var(--muted); font-size: 11px; margin-bottom: 24px; }

  .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 16px 0; }
  .stat { padding: 12px; background: var(--surface); border-left: 3px solid var(--ink); }
  .stat .label { font-size: 9px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 4px; }
  .stat .value { font-family: 'Bowlby One SC', Georgia, serif; font-size: 18px; color: var(--ink); }
  .stat.good { border-left-color: var(--emerald); }
  .stat.good .value { color: var(--emerald); }
  .stat.bad { border-left-color: var(--oxblood); }
  .stat.bad .value { color: var(--oxblood); }

  table { width: 100%; border-collapse: collapse; margin: 8px 0 16px 0; font-size: 11px; }
  table th { text-align: left; font-weight: 600; padding: 6px 8px; background: var(--surface); border-bottom: 2px solid var(--ink); color: var(--ink); font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
  table td { padding: 6px 8px; border-bottom: 1px solid var(--rule-light); vertical-align: top; }
  table td.num, table th.num { text-align: right; font-family: 'Geist Mono', ui-monospace, monospace; }
  table tr:last-child td { border-bottom: 1px solid var(--rule); }
  table.dl td:first-child { color: var(--muted); width: 45%; padding-right: 12px; }
  table.dl td:last-child { font-weight: 500; }

  .empty { color: var(--muted); font-style: italic; padding: 8px; background: var(--surface); }

  .scenario-row { display: grid; grid-template-columns: 1.2fr 1fr 1fr 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid var(--rule-light); }
  .scenario-row.head { font-weight: 700; font-size: 10px; text-transform: uppercase; color: var(--muted); border-bottom: 2px solid var(--ink); }
  .scenario-row.head > div { padding: 4px 0; }
  .scenario-row > div { padding: 4px 0; }
  .scenario-row > div.num { text-align: right; font-family: 'Geist Mono', ui-monospace, monospace; }
  .scenario-row .cons { color: var(--oxblood); }
  .scenario-row .mod { color: var(--ink); font-weight: 600; }
  .scenario-row .opt { color: var(--emerald); }

  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid var(--rule); font-size: 10px; color: var(--muted); line-height: 1.5; }

  .toolbar {
    position: sticky; top: 0; background: white;
    padding: 12px 0; margin-bottom: 12px;
    border-bottom: 1px solid var(--rule);
    display: flex; gap: 8px; align-items: center;
  }
  .toolbar button {
    background: var(--ink); color: white; border: none;
    padding: 8px 14px; font-family: 'Inter', sans-serif; font-weight: 600;
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
    cursor: pointer;
  }
  .toolbar button.secondary { background: white; color: var(--ink); border: 1px solid var(--rule); }
  .toolbar .spacer { flex: 1; }
  .toolbar .info { font-size: 11px; color: var(--muted); }

  @media print {
    .toolbar, .no-print { display: none !important; }
    body { padding: 0; max-width: none; }
    h2 { page-break-after: avoid; }
    table { page-break-inside: avoid; }
    .stat { page-break-inside: avoid; }
    .scenario-row { page-break-inside: avoid; }
    @page { margin: 0.6in; }
  }
</style>
</head>
<body>
  <div class="toolbar no-print">
    <button onclick="window.print()">Print this page</button>
    <button class="secondary" onclick="window.close()">Close</button>
    <div class="spacer"></div>
    <div class="info">Tip: Use your browser's "Save as PDF" option in the print dialog</div>
  </div>

  <h1>Retirement Snapshot</h1>
  <div class="header-meta">
    <strong>${escape(scenarioName || 'Unnamed scenario')}</strong> &middot;
    Exported ${exportedAt} &middot;
    Generated by ackwak.com
  </div>

  ${renderHeadlineSummary(inp, sims)}
  ${renderAboutYou(inp)}
  ${renderIncomeAndSavings(inp)}
  ${renderProperties(inp)}
  ${renderVehicles(inp)}
  ${renderDebts(inp)}
  ${renderOtherAssets(inp)}
  ${renderChildren(inp)}
  ${renderInheritances(inp)}
  ${renderRentAndExpenses(inp)}
  ${renderAssumptions(inp)}
  ${sims ? renderProjectionMilestones(sims, inp) : ''}

  <div class="footer">
    <strong>This is not financial advice.</strong> The calculator is for informational purposes only.
    Projections use deterministic year-by-year cashflow simulation (not Monte Carlo) and do not capture
    sequence-of-returns risk. For real planning involving your specific tax situation, asset location,
    and risk tolerance, consult a Certified Financial Planner.
    <br><br>
    Generated by <strong>ackwak.com</strong> on ${exportedAt}.
  </div>
</body>
</html>`;
}

function renderHeadlineSummary(inp, sims) {
  if (!sims) return '';

  const survives = (sim) => sim.runOutAge === null;
  const rec = sims.cons.runOutAge === null ? 'Conservative survives, strong margin.'
            : sims.mod.runOutAge === null ? 'Moderate scenario survives, but conservative does not.'
            : `Money runs out under moderate at age ${sims.mod.runOutAge}.`;

  return `
    <h2>Verdict</h2>
    <p style="margin: 0 0 12px 0;">${escape(rec)}</p>
    <div class="scenario-row head">
      <div>Scenario</div>
      <div class="num">Money lasts</div>
      <div class="num">Portfolio at retirement</div>
      <div class="num">Net worth at retirement</div>
    </div>
    <div class="scenario-row">
      <div class="cons"><strong>Conservative</strong></div>
      <div class="num cons">${survives(sims.cons) ? 'Yes' : `Runs out at ${sims.cons.runOutAge}`}</div>
      <div class="num">${fmt$(sims.cons.portfolioAtRetirement)}</div>
      <div class="num">${fmt$(sims.cons.netWorthAtRetirement)}</div>
    </div>
    <div class="scenario-row">
      <div class="mod"><strong>Moderate</strong></div>
      <div class="num mod">${survives(sims.mod) ? 'Yes' : `Runs out at ${sims.mod.runOutAge}`}</div>
      <div class="num">${fmt$(sims.mod.portfolioAtRetirement)}</div>
      <div class="num">${fmt$(sims.mod.netWorthAtRetirement)}</div>
    </div>
    <div class="scenario-row">
      <div class="opt"><strong>Optimistic</strong></div>
      <div class="num opt">${survives(sims.opt) ? 'Yes' : `Runs out at ${sims.opt.runOutAge}`}</div>
      <div class="num">${fmt$(sims.opt.portfolioAtRetirement)}</div>
      <div class="num">${fmt$(sims.opt.netWorthAtRetirement)}</div>
    </div>
  `;
}

function renderAboutYou(inp) {
  return `
    <h2>About You</h2>
    <table class="dl">
      <tr><td>Current age</td><td>${fmtAge(inp.currentAge)}</td></tr>
      <tr><td>Retirement age</td><td>${fmtAge(inp.retirementAge)}</td></tr>
      <tr><td>Life expectancy</td><td>${fmtAge(inp.lifeExpectancy)}</td></tr>
      <tr><td>Married</td><td>${yesNo(inp.married)}</td></tr>
      <tr><td>State income tax rate</td><td>${fmtPct(inp.stateRate)}</td></tr>
    </table>
  `;
}

function renderIncomeAndSavings(inp) {
  const a = inp.savingsAllocation || {};
  return `
    <h2>Income & Savings</h2>
    <h3>Current income</h3>
    <table class="dl">
      <tr><td>Annual income (gross)</td><td>${fmt$(inp.income)}</td></tr>
      <tr><td>Annual income growth</td><td>${fmtPct(inp.incomeGrowth)}</td></tr>
      <tr><td>Earning years remaining</td><td>${fmtAge(inp.earningYears)}</td></tr>
    </table>
    <h3>Retirement income</h3>
    <table class="dl">
      <tr><td>Social Security (annual)</td><td>${fmt$(inp.socialSecurity)}</td></tr>
      <tr><td>Social Security start age</td><td>${fmtAge(inp.ssStartAge)}</td></tr>
      <tr><td>Other income (annual)</td><td>${fmt$(inp.altIncome)}</td></tr>
      <tr><td>Other income growth</td><td>${fmtPct(inp.altIncomeGrowth)}</td></tr>
      <tr><td>Other income age range</td><td>${fmtAge(inp.altStartAge)} to ${fmtAge(inp.altEndAge)}</td></tr>
    </table>
    <h3>Current balances</h3>
    <table>
      <tr><th>Bucket</th><th class="num">Balance</th><th class="num">Return</th></tr>
      <tr><td>Cash</td><td class="num">${fmt$(inp.cash)}</td><td class="num">,</td></tr>
      <tr><td>Money market</td><td class="num">${fmt$(inp.moneyMarket)}</td><td class="num">${fmtPct(inp.mmRate)}</td></tr>
      <tr><td>CDs</td><td class="num">${fmt$(inp.cd)}</td><td class="num">${fmtPct(inp.cdRate)}</td></tr>
      <tr><td>Brokerage</td><td class="num">${fmt$(inp.brokerage)}</td><td class="num">${fmtPct(inp.brokerageRate)}</td></tr>
      <tr><td>401(k) / IRA</td><td class="num">${fmt$(inp.k401)}</td><td class="num">${fmtPct(inp.k401Rate)}</td></tr>
    </table>
    <h3>Savings allocation</h3>
    <table>
      <tr><th>Bucket</th><th class="num">% of surplus income</th></tr>
      <tr><td>Cash</td><td class="num">${fmtPct(a.cash)}</td></tr>
      <tr><td>Money market</td><td class="num">${fmtPct(a.mm)}</td></tr>
      <tr><td>CDs</td><td class="num">${fmtPct(a.cd)}</td></tr>
      <tr><td>Brokerage</td><td class="num">${fmtPct(a.brokerage)}</td></tr>
      <tr><td>401(k) / IRA</td><td class="num">${fmtPct(a.k401)}</td></tr>
    </table>
  `;
}

function renderProperties(inp) {
  const props = inp.properties || [];
  if (!props.length) return `<h2>Properties</h2><div class="empty">No properties.</div>`;
  let rows = '';
  for (const p of props) {
    rows += `<tr>
      <td>${escape(p.label)}</td>
      <td>${escape(PROPERTY_TYPE_LABELS[p.type] || p.type)}</td>
      <td class="num">${fmt$(p.value)}</td>
      <td class="num">${fmt$(p.mortgage)}</td>
      <td class="num">${fmtPct(p.mortgageRate)}</td>
      <td class="num">${fmt$(p.mortgageMonthly)}</td>
      <td class="num">${fmtPct(p.appreciation)}</td>
      <td class="num">${fmtPct(p.propertyTaxRate)}</td>
      <td class="num">${p.type === 'rental' ? fmt$(p.netRentalIncome) : ','}</td>
      <td>${p.type === 'rental' ? `${p.rentalStartAge ?? 'now'}–${p.rentalEndAge ?? 'forever'}` : ','}</td>
    </tr>`;
  }
  return `
    <h2>Properties (${props.length})</h2>
    <table>
      <tr>
        <th>Label</th><th>Type</th>
        <th class="num">Value</th><th class="num">Mortgage</th>
        <th class="num">Rate</th><th class="num">Monthly</th>
        <th class="num">Appr.</th><th class="num">Tax</th>
        <th class="num">Rent</th><th>Window</th>
      </tr>
      ${rows}
    </table>
  `;
}

function renderVehicles(inp) {
  const vehs = inp.vehicles || [];
  if (!vehs.length) return `<h2>Vehicles</h2><div class="empty">No vehicles.</div>`;
  let rows = '';
  for (const v of vehs) {
    rows += `<tr>
      <td>${escape(v.label)}</td>
      <td>${v.lease ? 'Leased' : 'Owned'}</td>
      <td class="num">${v.lease ? ',' : fmt$(v.value)}</td>
      <td class="num">${v.lease ? ',' : fmtPct(v.depreciation)}</td>
      <td class="num">${v.lease ? ',' : fmt$(v.loanBalance)}</td>
      <td class="num">${fmt$(v.loanMonthly)}/mo</td>
      <td>${v.lease ? `Until age ${v.leaseEndAge ?? ','}` : ','}</td>
    </tr>`;
  }
  return `
    <h2>Vehicles (${vehs.length})</h2>
    <table>
      <tr>
        <th>Label</th><th>Status</th>
        <th class="num">Value</th><th class="num">Depr.</th>
        <th class="num">Loan</th><th class="num">Payment</th>
        <th>Lease end</th>
      </tr>
      ${rows}
    </table>
  `;
}

function renderDebts(inp) {
  const debts = inp.debts || [];
  if (!debts.length) return `<h2>Debts</h2><div class="empty">No debts.</div>`;
  let rows = '';
  for (const d of debts) {
    rows += `<tr>
      <td>${escape(d.label)}</td>
      <td class="num">${fmt$(d.balance)}</td>
      <td class="num">${fmtPct(d.rate)}</td>
      <td class="num">${fmt$(d.monthlyPayment)}/mo</td>
    </tr>`;
  }
  return `
    <h2>Debts (${debts.length})</h2>
    <table>
      <tr>
        <th>Label</th><th class="num">Balance</th>
        <th class="num">Rate</th><th class="num">Monthly</th>
      </tr>
      ${rows}
    </table>
  `;
}

function renderOtherAssets(inp) {
  const assets = inp.otherAssets || [];
  if (!assets.length) return `<h2>Other Assets</h2><div class="empty">No other assets tracked.</div>`;
  let rows = '';
  for (const a of assets) {
    rows += `<tr>
      <td>${escape(a.label)}</td>
      <td class="num">${fmt$(a.value)}</td>
      <td class="num">${fmtPct(a.growthRate)}</td>
    </tr>`;
  }
  return `
    <h2>Other Assets (${assets.length})</h2>
    <table>
      <tr><th>Label</th><th class="num">Value</th><th class="num">Growth</th></tr>
      ${rows}
    </table>
  `;
}

function renderChildren(inp) {
  const kids = inp.children || [];
  if (!kids.length) return `<h2>Children & Education</h2><div class="empty">No children added.</div>`;
  let html = `<h2>Children & Education (${kids.length})</h2>`;
  html += `<p style="font-size: 11px; color: var(--muted); margin: 0 0 12px 0;">529 expected return: <strong>${fmtPct(inp.c529Rate)}</strong></p>`;
  for (const c of kids) {
    const totalCost = (c.entries || []).reduce((s, e) => s + (e.annualCost || 0) * (e.durationYears || 0), 0);
    html += `<h3>${escape(c.name)} &middot; 529 balance: ${fmt$(c.c529Balance)} &middot; Total nominal cost: ${fmt$(totalCost)}</h3>`;
    if (!(c.entries || []).length) {
      html += `<div class="empty">No education stages added for this child.</div>`;
      continue;
    }
    let rows = '';
    for (const e of (c.entries || []).slice().sort((a,b) => a.parentAgeAtStart - b.parentAgeAtStart)) {
      rows += `<tr>
        <td>${escape(SCHOOL_LABELS[e.type] || e.type)}</td>
        <td>Your age ${e.parentAgeAtStart}–${e.parentAgeAtStart + e.durationYears - 1}</td>
        <td class="num">${e.durationYears} yrs</td>
        <td class="num">${fmt$(e.annualCost)}/yr</td>
        <td class="num">${fmt$((e.annualCost || 0) * (e.durationYears || 0))}</td>
      </tr>`;
    }
    html += `<table>
      <tr><th>Stage</th><th>When</th><th class="num">Duration</th><th class="num">Annual</th><th class="num">Total</th></tr>
      ${rows}
    </table>`;
  }
  return html;
}

function renderInheritances(inp) {
  const inhs = inp.inheritances || [];
  if (!inhs.length) return `<h2>Inheritances</h2><div class="empty">No expected inheritances.</div>`;
  let rows = '';
  for (const i of inhs) {
    rows += `<tr>
      <td>${escape(i.label || 'Inheritance')}</td>
      <td class="num">${fmt$(i.amount)}</td>
      <td class="num">Age ${fmtAge(i.age)}</td>
      <td class="num">${i.age - inp.currentAge} yrs from now</td>
    </tr>`;
  }
  return `
    <h2>Inheritances (${inhs.length})</h2>
    <table>
      <tr><th>Source</th><th class="num">Amount</th><th class="num">Receive at</th><th class="num">Years away</th></tr>
      ${rows}
    </table>
  `;
}

function renderRentAndExpenses(inp) {
  return `
    <h2>Rent & Living Expenses</h2>
    <table class="dl">
      <tr><td>Annual non-mortgage living expenses</td><td>${fmt$(inp.annualExpenses)}</td></tr>
      <tr><td>Healthcare per year, before Medicare</td><td>${fmt$(inp.hcPreMedicare)}</td></tr>
      <tr><td>Healthcare per year, on Medicare</td><td>${fmt$(inp.hcMedicare)}</td></tr>
    </table>
    ${(inp.monthlyRent || 0) > 0 ? `
      <h3>Rent</h3>
      <table class="dl">
        <tr><td>Monthly rent</td><td>${fmt$(inp.monthlyRent)}</td></tr>
        <tr><td>Annual rent growth</td><td>${fmtPct(inp.rentInflation)}</td></tr>
        <tr><td>Active period</td><td>Age ${inp.rentStartAge ?? inp.currentAge} to age ${inp.rentEndAge ?? inp.lifeExpectancy}</td></tr>
      </table>
    ` : ''}
  `;
}

function renderAssumptions(inp) {
  return `
    <h2>Assumptions</h2>
    <table class="dl">
      <tr><td>General inflation</td><td>${fmtPct(inp.inflation)}</td></tr>
      <tr><td>529 expected return</td><td>${fmtPct(inp.c529Rate)}</td></tr>
      <tr><td>Brokerage return</td><td>${fmtPct(inp.brokerageRate)}</td></tr>
      <tr><td>401(k) return</td><td>${fmtPct(inp.k401Rate)}</td></tr>
      <tr><td>Money market rate</td><td>${fmtPct(inp.mmRate)}</td></tr>
      <tr><td>CD rate</td><td>${fmtPct(inp.cdRate)}</td></tr>
    </table>
    <p style="font-size: 10px; color: var(--muted); margin-top: 8px;">
      Conservative scenario: returns reduced 2 pts, expenses +12%, life expectancy +3 yrs.
      Optimistic scenario: returns +2 pts, expenses -8%, life expectancy -3 yrs.
    </p>
  `;
}

function renderProjectionMilestones(sims, inp) {
  // Pick a few key ages to show: now, retirement, retirement+10, retirement+20, end of life
  const traj = sims.mod.trajectory.filter(t => !t.isSnapshot);
  const milestoneAges = [
    inp.currentAge + 5,
    inp.retirementAge,
    inp.retirementAge + 10,
    inp.lifeExpectancy
  ].filter(a => a <= inp.lifeExpectancy);

  const findYear = (age) => traj.find(t => t.age === age) || traj[traj.length - 1];

  let rows = '';
  for (const age of milestoneAges) {
    const t = findYear(age);
    if (!t) continue;
    const label = age === inp.retirementAge ? 'Retirement' :
                  age === inp.lifeExpectancy ? 'End of life' :
                  `Age ${age}`;
    rows += `<tr>
      <td>${label}</td>
      <td class="num">${fmt$(t.netWorth)}</td>
      <td class="num">${fmt$(t.liquid)}</td>
      <td class="num">${fmt$(t.homeValue)}</td>
      <td class="num">${fmt$(t.mortgage)}</td>
    </tr>`;
  }
  return `
    <h2>Projection Milestones (Moderate scenario)</h2>
    <table>
      <tr>
        <th>When</th>
        <th class="num">Net worth</th>
        <th class="num">Liquid assets</th>
        <th class="num">Home value</th>
        <th class="num">Mortgage</th>
      </tr>
      ${rows}
    </table>
  `;
}
