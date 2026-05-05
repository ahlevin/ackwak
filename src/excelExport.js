// ============================================================================
// EXCEL EXPORT / IMPORT
// ============================================================================
// Multi-sheet .xlsx workbook used for human-readable export, advisor sharing,
// printing, and as a roundtrip-able re-entry format when JSON migration fails.
//
// The Excel format has its own version (FORMAT_VERSION) that's deliberately
// stable. Even when the internal schema changes, the Excel layout stays
// readable so users can reference it during manual re-entry.
// ============================================================================

import * as XLSX from 'xlsx';

const FORMAT_VERSION = '1.0';

// Format helpers
const fmtMoney = (n) => (n == null || isNaN(n)) ? '' : Number(n);
const fmtPct = (n) => (n == null || isNaN(n)) ? '' : Number((n * 100).toFixed(2));
const fmtAge = (n) => (n == null || n === '') ? '' : Number(n);
const fmtBool = (b) => b ? 'Yes' : 'No';

// School type labels
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

// ============================================================================
// EXPORT
// ============================================================================
export function exportToExcel(inp, sims, scenarioName) {
  const wb = XLSX.utils.book_new();
  const exportedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

  // ---------- Cover sheet ----------
  addSheet(wb, 'Cover', [
    ['Retirement Readiness Calculator'],
    [],
    ['Scenario name', scenarioName || '(unnamed)'],
    ['Exported', exportedAt],
    ['App URL', 'https://ackwak.com'],
    ['Format version', FORMAT_VERSION],
    ['Schema version', inp.schemaVersion || 1],
    [],
    ['About this file'],
    ['This workbook contains your full scenario inputs across multiple sheets.'],
    ['You can edit values in this file and re-import it into the calculator,'],
    ['or print/share it as a snapshot of your inputs and projected results.'],
    [],
    ['Sheets'],
    ['About You', 'Personal info: age, retirement age, life expectancy, marital status, state'],
    ['Income & Savings', 'Salary, retirement income, allocation across cash/MM/CD/brokerage/401k'],
    ['Properties', 'All real estate: primary, rentals, vacation homes'],
    ['Vehicles', 'Owned and leased vehicles'],
    ['Debts', 'Credit cards, student loans, personal loans'],
    ['Other Assets', 'Collectibles, business equity, crypto, etc.'],
    ['Children', 'Per-child 529 balances'],
    ['Education Stages', 'Per-child education plans (preschool through grad)'],
    ['Inheritances', 'Expected lump sums at specified ages'],
    ['Rent & Expenses', 'Rent payments, living expenses, healthcare'],
    ['Assumptions', 'Investment returns, inflation, tax rates'],
    ['Projected Results', 'Three-scenario summary (Conservative, Moderate, Optimistic)'],
    ['Year-by-Year', 'Full year-by-year projection from current age to life expectancy']
  ], { firstColWidth: 28, secondColWidth: 60, titleRow: true });

  // ---------- About You ----------
  addSheet(wb, 'About You', [
    ['Field', 'Value', 'Notes'],
    ['Current age', fmtAge(inp.currentAge), 'Years'],
    ['Retirement age', fmtAge(inp.retirementAge), 'Year salary stops, retirement income kicks in'],
    ['Life expectancy', fmtAge(inp.lifeExpectancy), 'Year simulation ends'],
    ['Married', fmtBool(inp.married), 'Affects tax brackets'],
    ['State income tax rate', fmtPct(inp.stateRate), '% (already converted from decimal)']
  ], { firstColWidth: 28, secondColWidth: 16, headerRow: true });

  // ---------- Income & Savings ----------
  const a = inp.savingsAllocation || {};
  addSheet(wb, 'Income & Savings', [
    ['CURRENT INCOME', '', ''],
    ['Field', 'Value', 'Notes'],
    ['Annual income (gross)', fmtMoney(inp.income), 'Pre-tax W-2 / self-employment'],
    ['Annual income growth', fmtPct(inp.incomeGrowth), '% per year'],
    ['Earning years remaining', fmtAge(inp.earningYears), 'Often = retirementAge - currentAge'],
    [],
    ['RETIREMENT INCOME', '', ''],
    ['Social Security (annual)', fmtMoney(inp.socialSecurity), 'Pre-tax'],
    ['Social Security start age', fmtAge(inp.ssStartAge), '62 to 70 (typically)'],
    ['Other income (annual)', fmtMoney(inp.altIncome), 'Pension, part-time, royalties'],
    ['Other income growth', fmtPct(inp.altIncomeGrowth), '%'],
    ['Other income start age', fmtAge(inp.altStartAge), ''],
    ['Other income end age', fmtAge(inp.altEndAge), ''],
    [],
    ['CURRENT BALANCES', '', ''],
    ['Cash', fmtMoney(inp.cash), 'Checking, no interest'],
    ['Money market', fmtMoney(inp.moneyMarket), ''],
    ['Money market rate', fmtPct(inp.mmRate), '%'],
    ['CDs', fmtMoney(inp.cd), ''],
    ['CD rate', fmtPct(inp.cdRate), '%'],
    ['Brokerage', fmtMoney(inp.brokerage), 'Taxable investment account'],
    ['Brokerage return', fmtPct(inp.brokerageRate), '%'],
    ['401(k) / IRA', fmtMoney(inp.k401), 'Tax-advantaged retirement'],
    ['401(k) return', fmtPct(inp.k401Rate), '%'],
    [],
    ['SAVINGS ALLOCATION (% of surplus income)', '', ''],
    ['Cash', fmtPct(a.cash), '%'],
    ['Money market', fmtPct(a.mm), '%'],
    ['CDs', fmtPct(a.cd), '%'],
    ['Brokerage', fmtPct(a.brokerage), '%'],
    ['401(k) / IRA', fmtPct(a.k401), '%'],
    ['Total', fmtPct((a.cash || 0) + (a.mm || 0) + (a.cd || 0) + (a.brokerage || 0) + (a.k401 || 0)), 'Should equal 100%']
  ], { firstColWidth: 36, secondColWidth: 16 });

  // ---------- Properties ----------
  const propRows = [['Label', 'Type', 'Value', 'Mortgage balance', 'Mortgage rate (%)', 'Monthly payment', 'Appreciation (%)', 'Property tax rate (%)', 'Net rental income (annual)', 'Rental growth (%)', 'Rental starts at age', 'Rental ends at age']];
  for (const p of (inp.properties || [])) {
    propRows.push([
      p.label || '',
      PROPERTY_TYPE_LABELS[p.type] || p.type || '',
      fmtMoney(p.value),
      fmtMoney(p.mortgage),
      fmtPct(p.mortgageRate),
      fmtMoney(p.mortgageMonthly),
      fmtPct(p.appreciation),
      fmtPct(p.propertyTaxRate),
      p.type === 'rental' ? fmtMoney(p.netRentalIncome) : '',
      p.type === 'rental' ? fmtPct(p.rentalGrowth) : '',
      p.type === 'rental' ? (p.rentalStartAge ?? 'Immediate') : '',
      p.type === 'rental' ? (p.rentalEndAge ?? 'Never') : ''
    ]);
  }
  if ((inp.properties || []).length === 0) propRows.push(['(no properties)', '', '', '', '', '', '', '', '', '', '', '']);
  addSheet(wb, 'Properties', propRows, { headerRow: true, autoColWidth: true });

  // ---------- Vehicles ----------
  const vehRows = [['Label', 'Owned or Leased', 'Current value', 'Annual depreciation (%)', 'Loan/Lease balance', 'Loan rate (%)', 'Monthly payment', 'Lease ends at age']];
  for (const v of (inp.vehicles || [])) {
    vehRows.push([
      v.label || '',
      v.lease ? 'Leased' : 'Owned',
      v.lease ? '' : fmtMoney(v.value),
      v.lease ? '' : fmtPct(v.depreciation),
      v.lease ? '' : fmtMoney(v.loanBalance),
      v.lease ? '' : fmtPct(v.loanRate),
      fmtMoney(v.loanMonthly),
      v.lease ? fmtAge(v.leaseEndAge) : ''
    ]);
  }
  if ((inp.vehicles || []).length === 0) vehRows.push(['(no vehicles)', '', '', '', '', '', '', '']);
  addSheet(wb, 'Vehicles', vehRows, { headerRow: true, autoColWidth: true });

  // ---------- Debts ----------
  const debtRows = [['Label', 'Balance', 'Interest rate (%)', 'Monthly payment']];
  for (const d of (inp.debts || [])) {
    debtRows.push([
      d.label || '',
      fmtMoney(d.balance),
      fmtPct(d.rate),
      fmtMoney(d.monthlyPayment)
    ]);
  }
  if ((inp.debts || []).length === 0) debtRows.push(['(no debts)', '', '', '']);
  addSheet(wb, 'Debts', debtRows, { headerRow: true, autoColWidth: true });

  // ---------- Other Assets ----------
  const assetRows = [['Label', 'Current value', 'Annual growth rate (%)']];
  for (const a of (inp.otherAssets || [])) {
    assetRows.push([a.label || '', fmtMoney(a.value), fmtPct(a.growthRate)]);
  }
  if ((inp.otherAssets || []).length === 0) assetRows.push(['(no other assets)', '', '']);
  addSheet(wb, 'Other Assets', assetRows, { headerRow: true, autoColWidth: true });

  // ---------- Children ----------
  const childRows = [['Child ID', 'Name', '529 balance', 'Number of education stages']];
  for (const c of (inp.children || [])) {
    childRows.push([
      c.id || '',
      c.name || '',
      fmtMoney(c.c529Balance),
      (c.entries || []).length
    ]);
  }
  if ((inp.children || []).length === 0) childRows.push(['(no children)', '', '', '']);
  addSheet(wb, 'Children', childRows, { headerRow: true, autoColWidth: true });

  // ---------- Education Stages ----------
  const eduRows = [['Child', 'Stage type', 'Your age when stage starts', 'Duration (years)', 'Annual cost', 'Total cost (nominal)']];
  for (const c of (inp.children || [])) {
    for (const e of (c.entries || [])) {
      eduRows.push([
        c.name || c.id,
        SCHOOL_LABELS[e.type] || e.type || '',
        fmtAge(e.parentAgeAtStart),
        fmtAge(e.durationYears),
        fmtMoney(e.annualCost),
        fmtMoney((e.annualCost || 0) * (e.durationYears || 0))
      ]);
    }
  }
  if (eduRows.length === 1) eduRows.push(['(no education stages)', '', '', '', '', '']);
  addSheet(wb, 'Education Stages', eduRows, { headerRow: true, autoColWidth: true });

  // ---------- Inheritances ----------
  const inhRows = [['Source', 'Amount', 'Receive at age']];
  for (const i of (inp.inheritances || [])) {
    inhRows.push([i.label || '', fmtMoney(i.amount), fmtAge(i.age)]);
  }
  if ((inp.inheritances || []).length === 0) inhRows.push(['(no inheritances)', '', '']);
  addSheet(wb, 'Inheritances', inhRows, { headerRow: true, autoColWidth: true });

  // ---------- Rent & Expenses ----------
  addSheet(wb, 'Rent & Expenses', [
    ['Field', 'Value', 'Notes'],
    ['Annual non-mortgage living expenses', fmtMoney(inp.annualExpenses), ''],
    ['Healthcare per year, before Medicare', fmtMoney(inp.hcPreMedicare), ''],
    ['Healthcare per year, on Medicare', fmtMoney(inp.hcMedicare), 'Kicks in at age 65'],
    [],
    ['RENT (if you rent rather than own)'],
    ['Monthly rent', fmtMoney(inp.monthlyRent), '0 if you don\'t rent'],
    ['Annual rent growth', fmtPct(inp.rentInflation), '%'],
    ['Rent starts at age', inp.rentStartAge ?? 'Immediate', ''],
    ['Rent ends at age', inp.rentEndAge ?? 'Never', '']
  ], { firstColWidth: 36, secondColWidth: 16 });

  // ---------- Assumptions ----------
  addSheet(wb, 'Assumptions', [
    ['Field', 'Value', 'Notes'],
    ['General inflation', fmtPct(inp.inflation), '% per year (for living expenses, healthcare, college)'],
    ['529 expected return', fmtPct(inp.c529Rate), '% per year'],
    ['Money market rate', fmtPct(inp.mmRate), '% per year'],
    ['CD rate', fmtPct(inp.cdRate), '% per year'],
    ['Brokerage return', fmtPct(inp.brokerageRate), '% per year'],
    ['401(k) return', fmtPct(inp.k401Rate), '% per year'],
    [],
    ['SCENARIO ADJUSTMENTS', '', ''],
    ['Conservative', '', 'Returns -2 pts, expenses +12%, life +3 yrs'],
    ['Moderate', '', 'Your inputs as entered'],
    ['Optimistic', '', 'Returns +2 pts, expenses -8%, life -3 yrs']
  ], { firstColWidth: 30, secondColWidth: 16 });

  // ---------- Projected Results ----------
  if (sims) {
    const finalCons = sims.cons.trajectory[sims.cons.trajectory.length - 1] || {};
    const finalMod = sims.mod.trajectory[sims.mod.trajectory.length - 1] || {};
    const finalOpt = sims.opt.trajectory[sims.opt.trajectory.length - 1] || {};
    addSheet(wb, 'Projected Results', [
      ['Metric', 'Conservative', 'Moderate', 'Optimistic'],
      ['Money lasts through life expectancy?',
        sims.cons.runOutAge === null ? 'Yes' : `No (runs out at age ${sims.cons.runOutAge})`,
        sims.mod.runOutAge === null ? 'Yes' : `No (runs out at age ${sims.mod.runOutAge})`,
        sims.opt.runOutAge === null ? 'Yes' : `No (runs out at age ${sims.opt.runOutAge})`
      ],
      ['Portfolio at retirement',
        fmtMoney(sims.cons.portfolioAtRetirement),
        fmtMoney(sims.mod.portfolioAtRetirement),
        fmtMoney(sims.opt.portfolioAtRetirement)
      ],
      ['Net worth at retirement',
        fmtMoney(sims.cons.netWorthAtRetirement),
        fmtMoney(sims.mod.netWorthAtRetirement),
        fmtMoney(sims.opt.netWorthAtRetirement)
      ],
      ['Final liquid (end of life)',
        fmtMoney(finalCons.liquid),
        fmtMoney(finalMod.liquid),
        fmtMoney(finalOpt.liquid)
      ],
      ['Final net worth',
        fmtMoney(finalCons.netWorth),
        fmtMoney(finalMod.netWorth),
        fmtMoney(finalOpt.netWorth)
      ]
    ], { headerRow: true, firstColWidth: 36, secondColWidth: 18 });

    // ---------- Year-by-Year (Moderate) ----------
    const yearRows = [['Age', 'Year', 'Working?', 'Income', 'Expenses', 'Surplus/Shortfall', 'Liquid', 'Net Worth', 'Mortgage Balance', 'Home Value', '401(k)', 'Brokerage']];
    for (const t of sims.mod.trajectory) {
      if (t.isSnapshot) continue;
      yearRows.push([
        t.age,
        t.year,
        t.isWorking ? 'Yes' : 'No',
        fmtMoney(t.grossIncome),
        fmtMoney(t.totalSpend),
        fmtMoney(t.netFlow),
        fmtMoney(t.liquid),
        fmtMoney(t.netWorth),
        fmtMoney(t.mortgage),
        fmtMoney(t.homeValue),
        fmtMoney(t.k401),
        fmtMoney(t.brokerage)
      ]);
    }
    addSheet(wb, 'Year-by-Year', yearRows, { headerRow: true, autoColWidth: true });
  }

  // ---------- Trigger download ----------
  const filename = (scenarioName || 'scenario').replace(/[^a-z0-9-_ ]/gi, '_') + '.retirement.xlsx';
  XLSX.writeFile(wb, filename);
  return filename;
}

// Helper: add a sheet with sensible defaults
function addSheet(wb, name, rows, opts = {}) {
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Column widths
  if (opts.autoColWidth) {
    const widths = [];
    for (let col = 0; col < (rows[0] || []).length; col++) {
      let max = 8;
      for (const row of rows) {
        const v = row[col];
        if (v != null) {
          const s = String(v);
          if (s.length > max) max = Math.min(s.length + 2, 50);
        }
      }
      widths.push({ wch: max });
    }
    ws['!cols'] = widths;
  } else {
    const widths = [];
    if (opts.firstColWidth) widths.push({ wch: opts.firstColWidth });
    if (opts.secondColWidth) widths.push({ wch: opts.secondColWidth });
    if (widths.length) ws['!cols'] = widths;
  }

  XLSX.utils.book_append_sheet(wb, ws, name);
}

// ============================================================================
// IMPORT
// ============================================================================
// Read an exported .xlsx and reconstruct the inputs object.
// This intentionally tolerates manual edits — missing fields use defaults,
// extra fields are ignored, blank cells become null/0 as appropriate.
export function importFromExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const inputs = parseWorkbook(wb);
        resolve(inputs);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function parseWorkbook(wb) {
  const inputs = {};

  const getRows = (sheetName) => {
    const ws = wb.Sheets[sheetName];
    if (!ws) return [];
    return XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' });
  };

  const findValue = (rows, label) => {
    for (const row of rows) {
      if (row[0] && String(row[0]).trim().toLowerCase() === label.toLowerCase()) {
        return row[1];
      }
    }
    return undefined;
  };

  const num = (v) => {
    if (v === '' || v == null) return undefined;
    const n = Number(v);
    return isNaN(n) ? undefined : n;
  };
  const pct = (v) => {
    const n = num(v);
    return n === undefined ? undefined : n / 100;
  };
  const ageOrNull = (v) => {
    if (v === 'Immediate' || v === 'Never' || v === '' || v == null) return null;
    return num(v);
  };
  const yesNo = (v) => v === 'Yes' || v === true || String(v).toLowerCase() === 'yes';

  // About You
  {
    const rows = getRows('About You');
    inputs.currentAge = num(findValue(rows, 'Current age'));
    inputs.retirementAge = num(findValue(rows, 'Retirement age'));
    inputs.lifeExpectancy = num(findValue(rows, 'Life expectancy'));
    inputs.married = yesNo(findValue(rows, 'Married'));
    inputs.stateRate = pct(findValue(rows, 'State income tax rate'));
  }

  // Income & Savings
  {
    const rows = getRows('Income & Savings');
    inputs.income = num(findValue(rows, 'Annual income (gross)'));
    inputs.incomeGrowth = pct(findValue(rows, 'Annual income growth'));
    inputs.earningYears = num(findValue(rows, 'Earning years remaining'));
    inputs.socialSecurity = num(findValue(rows, 'Social Security (annual)'));
    inputs.ssStartAge = num(findValue(rows, 'Social Security start age'));
    inputs.altIncome = num(findValue(rows, 'Other income (annual)'));
    inputs.altIncomeGrowth = pct(findValue(rows, 'Other income growth'));
    inputs.altStartAge = num(findValue(rows, 'Other income start age'));
    inputs.altEndAge = num(findValue(rows, 'Other income end age'));
    inputs.cash = num(findValue(rows, 'Cash'));
    inputs.moneyMarket = num(findValue(rows, 'Money market'));
    inputs.mmRate = pct(findValue(rows, 'Money market rate'));
    inputs.cd = num(findValue(rows, 'CDs'));
    inputs.cdRate = pct(findValue(rows, 'CD rate'));
    inputs.brokerage = num(findValue(rows, 'Brokerage'));
    inputs.brokerageRate = pct(findValue(rows, 'Brokerage return'));
    inputs.k401 = num(findValue(rows, '401(k) / IRA'));
    inputs.k401Rate = pct(findValue(rows, '401(k) return'));

    // Allocation
    inputs.savingsAllocation = {
      cash: pct(findValueAfterHeader(rows, 'SAVINGS ALLOCATION (% of surplus income)', 'Cash')) ?? 0.05,
      mm: pct(findValueAfterHeader(rows, 'SAVINGS ALLOCATION (% of surplus income)', 'Money market')) ?? 0.10,
      cd: pct(findValueAfterHeader(rows, 'SAVINGS ALLOCATION (% of surplus income)', 'CDs')) ?? 0.05,
      brokerage: pct(findValueAfterHeader(rows, 'SAVINGS ALLOCATION (% of surplus income)', 'Brokerage')) ?? 0.30,
      k401: pct(findValueAfterHeader(rows, 'SAVINGS ALLOCATION (% of surplus income)', '401(k) / IRA')) ?? 0.50
    };
  }

  // Properties
  {
    const rows = getRows('Properties');
    inputs.properties = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r[0] || r[0] === '(no properties)') continue;
      const typeLabel = r[1];
      const type = Object.entries(PROPERTY_TYPE_LABELS).find(([k, v]) => v === typeLabel)?.[0] || 'primary';
      inputs.properties.push({
        id: 'p' + (Date.now() + i),
        label: r[0],
        type,
        value: num(r[2]) ?? 0,
        mortgage: num(r[3]) ?? 0,
        mortgageRate: pct(r[4]) ?? 0,
        mortgageMonthly: num(r[5]) ?? 0,
        appreciation: pct(r[6]) ?? 0.03,
        propertyTaxRate: pct(r[7]) ?? 0.012,
        netRentalIncome: num(r[8]) ?? 0,
        rentalGrowth: pct(r[9]) ?? 0.025,
        rentalStartAge: ageOrNull(r[10]),
        rentalEndAge: ageOrNull(r[11])
      });
    }
  }

  // Vehicles
  {
    const rows = getRows('Vehicles');
    inputs.vehicles = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r[0] || r[0] === '(no vehicles)') continue;
      const isLease = String(r[1]).toLowerCase() === 'leased';
      inputs.vehicles.push({
        id: 'v' + (Date.now() + i),
        label: r[0],
        lease: isLease,
        value: isLease ? 0 : (num(r[2]) ?? 0),
        depreciation: isLease ? 0 : (pct(r[3]) ?? 0.15),
        loanBalance: isLease ? 0 : (num(r[4]) ?? 0),
        loanRate: isLease ? 0 : (pct(r[5]) ?? 0),
        loanMonthly: num(r[6]) ?? 0,
        leaseEndAge: isLease ? num(r[7]) : null
      });
    }
  }

  // Debts
  {
    const rows = getRows('Debts');
    inputs.debts = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r[0] || r[0] === '(no debts)') continue;
      inputs.debts.push({
        id: 'd' + (Date.now() + i),
        label: r[0],
        balance: num(r[1]) ?? 0,
        rate: pct(r[2]) ?? 0,
        monthlyPayment: num(r[3]) ?? 0
      });
    }
  }

  // Other Assets
  {
    const rows = getRows('Other Assets');
    inputs.otherAssets = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r[0] || r[0] === '(no other assets)') continue;
      inputs.otherAssets.push({
        id: 'a' + (Date.now() + i),
        label: r[0],
        value: num(r[1]) ?? 0,
        growthRate: pct(r[2]) ?? 0
      });
    }
  }

  // Children + Education Stages
  {
    const childRows = getRows('Children');
    const eduRows = getRows('Education Stages');
    const childMap = new Map(); // name -> child
    inputs.children = [];
    for (let i = 1; i < childRows.length; i++) {
      const r = childRows[i];
      if (!r[0] || r[0] === '(no children)') continue;
      const child = {
        id: r[0] || ('k' + (Date.now() + i)),
        name: r[1] || `Child ${i}`,
        c529Balance: num(r[2]) ?? 0,
        entries: []
      };
      childMap.set(child.name, child);
      inputs.children.push(child);
    }
    for (let i = 1; i < eduRows.length; i++) {
      const r = eduRows[i];
      if (!r[0] || r[0] === '(no education stages)') continue;
      const child = childMap.get(r[0]);
      if (!child) continue;
      const typeKey = Object.entries(SCHOOL_LABELS).find(([k, v]) => v === r[1])?.[0] || 'other';
      child.entries.push({
        id: 'e' + (Date.now() + i),
        type: typeKey,
        parentAgeAtStart: num(r[2]) ?? 50,
        durationYears: num(r[3]) ?? 4,
        annualCost: num(r[4]) ?? 30000
      });
    }
  }

  // Inheritances
  {
    const rows = getRows('Inheritances');
    inputs.inheritances = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r[0] || r[0] === '(no inheritances)') continue;
      inputs.inheritances.push({
        id: 'i' + (Date.now() + i),
        label: r[0],
        amount: num(r[1]) ?? 0,
        age: num(r[2]) ?? 70
      });
    }
  }

  // Rent & Expenses
  {
    const rows = getRows('Rent & Expenses');
    inputs.annualExpenses = num(findValue(rows, 'Annual non-mortgage living expenses'));
    inputs.hcPreMedicare = num(findValue(rows, 'Healthcare per year, before Medicare'));
    inputs.hcMedicare = num(findValue(rows, 'Healthcare per year, on Medicare'));
    inputs.monthlyRent = num(findValue(rows, 'Monthly rent')) ?? 0;
    inputs.rentInflation = pct(findValue(rows, 'Annual rent growth')) ?? 0.04;
    inputs.rentStartAge = ageOrNull(findValue(rows, 'Rent starts at age'));
    inputs.rentEndAge = ageOrNull(findValue(rows, 'Rent ends at age'));
  }

  // Assumptions (overrides Income & Savings rates if more specific)
  {
    const rows = getRows('Assumptions');
    const inflation = pct(findValue(rows, 'General inflation'));
    if (inflation !== undefined) inputs.inflation = inflation;
    const c529Rate = pct(findValue(rows, '529 expected return'));
    if (c529Rate !== undefined) inputs.c529Rate = c529Rate;
  }

  // Strip undefined values so they fall through to defaults during merge
  for (const k of Object.keys(inputs)) {
    if (inputs[k] === undefined) delete inputs[k];
  }

  return inputs;
}

// Helper: find value in rows after a section header (used for the allocation block)
function findValueAfterHeader(rows, header, label) {
  let inSection = false;
  for (const row of rows) {
    const k = row[0] ? String(row[0]).trim() : '';
    if (k === header) { inSection = true; continue; }
    if (inSection && k && k.toUpperCase() === k && k.length > 5 && k !== header) inSection = false; // hit next header
    if (inSection && k.toLowerCase() === label.toLowerCase()) return row[1];
  }
  return undefined;
}
