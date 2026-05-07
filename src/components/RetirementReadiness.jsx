import React, { useState, useMemo, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, Area, ComposedChart, ReferenceArea
} from 'recharts';
import {
  TrendingUp, AlertTriangle, CheckCircle2, Home, Briefcase, Heart,
  GraduationCap, PiggyBank, Receipt, ChevronDown, Info, Settings, User,
  Sparkles, ShieldCheck, Activity, Wind, Plus, Trash2, Gift,
  Save, Upload, Download, FolderOpen, Copy, X, Check,
  Car, CreditCard, Wallet, Scale, Package, KeyRound,
  FileSpreadsheet, Printer, FileText
} from 'lucide-react';
import { exportToExcel, importFromExcel } from '../excelExport.js';
import { openPrintView } from '../printView.js';
import {
  STATE_TAX_DATA, STATE_LIST, STATE_TAX_DATA_AS_OF,
  computeStateIncomeTax, topMarginalRate
} from '../data/stateTaxData.js';

// ============================================================================
// THEME, editorial financial aesthetic, warm cream + ink + emerald accents
// ============================================================================
// (legacy theme below replaced by navy/cream below)

// ============================================================================
// THEME, navy + cream editorial, chunky slab-display headlines
// ============================================================================
const T = {
  bg: '#F5F6F8',
  surface: '#FFFFFF',
  surfaceWarm: '#FAFAFC',
  ink: '#0F1A4D',
  inkSoft: '#2A3470',
  muted: '#6B6B7C',
  rule: '#DDDEE6',
  ruleLight: '#EAEBF1',
  emerald: '#0E5132',
  emeraldSoft: '#E0EBE3',
  amber: '#B25E00',
  amberSoft: '#FBEFD9',
  oxblood: '#8B1E2C',
  oxbloodSoft: '#F5E1E2',
  navy: '#0F1A4D',
  navySoft: '#DCE0EE',
  navyDeep: '#0A1338'
};

const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Bowlby+One+SC&family=Sansita+One&family=Inter:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap';

// Display font (chunky slab-display headlines). Falls back gracefully.
const DISPLAY_FONT = "'Bowlby One SC', 'Sansita One', Georgia, serif";
// Body font (clean sans).
const BODY_FONT = "'Inter', system-ui, -apple-system, sans-serif";
const MONO_FONT = "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace";

// Badges shown on input sections to indicate origin (Net Worth shared vs new for current view)
const BADGE_FROM_NW = { label: 'From Net Worth', color: '#0F1A4D', bg: '#DCE0EE' };
const BADGE_NEW_RET = { label: 'New for retirement', color: '#0E5132', bg: '#E0EBE3' };
const BADGE_NEW_RUN = { label: 'New for runway', color: '#B25E00', bg: '#FBEFD9' };

// ============================================================================
// SCHEMA VERSIONING
// ============================================================================
// Every saved scenario carries a schemaVersion. When the schema changes, we bump
// CURRENT_SCHEMA_VERSION and add a migration function. On load, we run all
// migrations from the saved version up to current. If anything required
// user attention, we log it to a warnings array surfaced as a banner.

const CURRENT_SCHEMA_VERSION = 3;

const APP_VERSION = '1.0';

// Each migration takes the input object and returns { inputs, warnings: [] }.
// Warnings are messages shown to the user about what changed.
const MIGRATIONS = {
  // v0/missing -> v1: legacy shape (single 529 balance, flat children fields)
  // → migrate to per-child structure
  1: (raw) => {
    const warnings = [];
    const inputs = { ...raw };
    // Legacy: numKids, collegeStartAge, collegeYears, collegeCostPerYear, c529 → children list
    if (inputs.numKids != null && !inputs.children) {
      const numKids = inputs.numKids || 0;
      const startAge = inputs.collegeStartAge || 50;
      const yrs = inputs.collegeYears || 4;
      const cost = inputs.collegeCostPerYear || 35000;
      const totalC529 = inputs.c529 || 0;
      // Split the legacy 529 evenly across kids
      const perKid529 = numKids > 0 ? totalC529 / numKids : 0;
      const children = [];
      for (let i = 0; i < numKids; i++) {
        children.push({
          id: 'k' + (Date.now() + i),
          name: `Child ${i + 1}`,
          c529Balance: perKid529,
          entries: [{
            id: 'e' + (Date.now() + i),
            type: 'college',
            parentAgeAtStart: startAge + i * 2,
            durationYears: yrs,
            annualCost: cost
          }]
        });
      }
      inputs.children = children;
      delete inputs.numKids;
      delete inputs.collegeStartAge;
      delete inputs.collegeYears;
      delete inputs.collegeCostPerYear;
      delete inputs.c529;
      if (numKids > 0) {
        warnings.push(
          `Education plan upgraded: each child now has their own 529 and a list of school stages. The legacy ` +
          `${numKids} child(ren) at $${cost.toLocaleString()}/yr have been converted to college entries. ` +
          `You may want to add additional stages (preschool, K-12, grad school) for each child.`
        );
      }
    }
    if (!inputs.children) inputs.children = [];
    return { inputs, warnings };
  },
  // v1 -> v2: rentals get start/end age fields; vehicles get lease flag
  2: (raw) => {
    const warnings = [];
    const inputs = { ...raw };
    if (Array.isArray(inputs.properties)) {
      inputs.properties = inputs.properties.map(p => ({
        rentalStartAge: null,
        rentalEndAge: null,
        ...p
      }));
    }
    if (Array.isArray(inputs.vehicles)) {
      inputs.vehicles = inputs.vehicles.map(v => ({
        lease: false,
        leaseEndAge: null,
        ...v
      }));
    }
    if (!inputs.savingsAllocation) {
      inputs.savingsAllocation = { cash: 0.05, mm: 0.10, cd: 0.05, brokerage: 0.30, k401: 0.50 };
      warnings.push('Income allocation defaults applied (Balanced preset). Review under Income & career.');
    }
    if (!inputs.inheritances) inputs.inheritances = [];
    if (!inputs.vehicles) inputs.vehicles = [];
    if (!inputs.debts) inputs.debts = [];
    if (!inputs.otherAssets) inputs.otherAssets = [];
    if (inputs.monthlyRent == null) inputs.monthlyRent = 0;
    if (inputs.rentInflation == null) inputs.rentInflation = 0.04;
    if (inputs.rentStartAge === undefined) inputs.rentStartAge = null;
    if (inputs.rentEndAge === undefined) inputs.rentEndAge = null;
    return { inputs, warnings };
  },
  // v2 -> v3: add stateCode for state-aware tax computation. The user can pick
  // their state from a dropdown and the calculator runs the right brackets.
  // The legacy stateRate field is preserved as a manual override option.
  3: (raw) => {
    const warnings = [];
    const inputs = { ...raw };
    if (inputs.stateCode === undefined) {
      inputs.stateCode = '';   // empty means "use the manual stateRate"
    }
    // useStateBrackets toggles between the bracketed engine and the legacy flat rate.
    // Default to using brackets if a stateCode is set; flat rate otherwise.
    if (inputs.useStateBrackets === undefined) {
      inputs.useStateBrackets = !!inputs.stateCode;
    }
    return { inputs, warnings };
  }
};

// Migrate a saved scenario's inputs to the current schema.
// Returns { inputs, warnings, fromVersion, toVersion, fromFuture }.
function migrateScenario(saved) {
  // Strip wrapping if it's a download-format file
  let inputs = saved.inputs ? saved.inputs : saved;
  const fromVersion = inputs.schemaVersion || 0;
  const warnings = [];

  // From the future? We can't migrate down, warn but try our best.
  if (fromVersion > CURRENT_SCHEMA_VERSION) {
    return {
      inputs,
      warnings: [
        `This scenario was created with a newer version of the calculator (schema v${fromVersion}, this app expects v${CURRENT_SCHEMA_VERSION}). ` +
        `Some fields may not display or calculate correctly. Visit ackwak.com for the latest version.`
      ],
      fromVersion,
      toVersion: CURRENT_SCHEMA_VERSION,
      fromFuture: true
    };
  }

  // Run each migration step in sequence
  let current = inputs;
  for (let v = fromVersion + 1; v <= CURRENT_SCHEMA_VERSION; v++) {
    const migrate = MIGRATIONS[v];
    if (migrate) {
      const result = migrate(current);
      current = result.inputs;
      if (result.warnings && result.warnings.length) {
        warnings.push(...result.warnings);
      }
    }
  }
  current.schemaVersion = CURRENT_SCHEMA_VERSION;
  return { inputs: current, warnings, fromVersion, toVersion: CURRENT_SCHEMA_VERSION, fromFuture: false };
}

// ============================================================================
// FINANCIAL CALCULATIONS
// ============================================================================

// 2026 single-filer federal brackets (approx). For married, brackets ~2x.
const FED_BRACKETS_SINGLE = [
  [11925, 0.10],
  [48475, 0.12],
  [103350, 0.22],
  [197300, 0.24],
  [250525, 0.32],
  [626350, 0.35],
  [Infinity, 0.37]
];

function federalTax(taxable, married = false) {
  if (taxable <= 0) return 0;
  const brackets = FED_BRACKETS_SINGLE.map(([l, r]) => [married ? l * 2 : l, r]);
  let tax = 0, prev = 0;
  for (const [limit, rate] of brackets) {
    if (taxable > limit) { tax += (limit - prev) * rate; prev = limit; }
    else { tax += (taxable - prev) * rate; return tax; }
  }
  return tax;
}

// Approximate total tax: federal + state composite + (payroll if working)
// Note: when stateCode is set and useStateBrackets is true, we use the proper
// bracketed engine; otherwise we fall back to the flat stateRate (legacy behavior
// + power-user manual override path). All callers continue to work unchanged.
function estimateTax({ ordinaryIncome = 0, capitalGains = 0, married = false, isWorking = true, stateRate = 0.05, stateCode = '', useStateBrackets = false }) {
  const fed = federalTax(ordinaryIncome, married);
  const lt = capitalGains > 0 ? capitalGains * 0.15 : 0; // simplified LTCG
  // State tax: bracketed if a state is selected and the engine is enabled,
  // otherwise the legacy flat-rate calculation.
  const stateTaxableIncome = ordinaryIncome + capitalGains;
  const state = (useStateBrackets && stateCode)
    ? computeStateIncomeTax(stateTaxableIncome, stateCode, married)
    : stateTaxableIncome * stateRate;
  const payroll = isWorking ? Math.min(ordinaryIncome, 168600) * 0.0765 : 0;
  return fed + lt + state + payroll;
}

// Default healthcare costs per HOUSEHOLD (rough national averages, 2026 dollars)
const HC_PRE_MEDICARE_DEFAULT = 18000; // ACA / private
const HC_MEDICARE_DEFAULT     = 9000;  // Part B + supplement + Part D + OOP

// ----- Core simulation -----
// Runs year-by-year from currentAge through lifeExpectancy.
// Returns full trajectory + summary.
function simulate(inp, scenario = 'mod') {
  // Scenario adjustments to capture uncertainty
  const adj = {
    cons: { ret: -0.02, exp: 1.12, life: 3 },   // worse returns, higher expenses, live longer
    mod:  { ret: 0,     exp: 1.0,  life: 0 },
    opt:  { ret: 0.015, exp: 0.92, life: -2 }
  }[scenario];

  const lifeEnd = inp.lifeExpectancy + adj.life;
  const years = lifeEnd - inp.currentAge;
  const traj = [];

  // Mutable balances
  let cash = inp.cash;
  let mm = inp.moneyMarket;
  let cd = inp.cd;
  let brokerage = inp.brokerage;
  let k401 = inp.k401;
  // Per-child 529 balances. Backward compat: if old `c529` field exists and no children, treat as a single pool.
  let children = (inp.children || []).map(c => ({
    ...c,
    c529Balance: c.c529Balance || 0,
    entries: (c.entries || []).map(e => ({ ...e }))
  }));
  // Aggregate 529 view (sum across all children), still useful for the trajectory record
  const get529Total = () => children.reduce((s, c) => s + Math.max(0, c.c529Balance || 0), 0);
  // Deep copy properties so the simulation can mutate them without touching React state
  let properties = inp.properties.map(p => ({ ...p }));
  let vehicles = (inp.vehicles || []).map(v => ({ ...v }));
  let debts = (inp.debts || []).map(d => ({ ...d }));
  let otherAssets = (inp.otherAssets || []).map(a => ({ ...a }));

  let runOutAge = null;
  let homeEquityTapAge = null;

  // ----- Year 0 snapshot -----
  // This is "today", inputs exactly as entered, before any payments, growth, or depreciation.
  // Lets the Net Worth Inspector show the user's actual current state at age = currentAge.
  {
    const liquidNow = cash + mm + cd + brokerage + k401;
    const c529Now = get529Total();
    const propValueNow = properties.reduce((s, p) => s + p.value, 0);
    const propMortNow = properties.reduce((s, p) => s + p.mortgage, 0);
    const equityNow = Math.max(0, propValueNow - propMortNow);
    const vehValNow = vehicles.reduce((s, v) => s + Math.max(0, v.value), 0);
    const vehLoanNow = vehicles.reduce((s, v) => s + Math.max(0, v.loanBalance), 0);
    const debtNow = debts.reduce((s, d) => s + Math.max(0, d.balance), 0);
    const otherAssetNow = otherAssets.reduce((s, a) => s + Math.max(0, a.value), 0);
    const totAssetsNow = liquidNow + c529Now + propValueNow + vehValNow + otherAssetNow;
    const totLiabNow = propMortNow + vehLoanNow + debtNow;
    traj.push({
      age: inp.currentAge, year: -1, isWorking: inp.currentAge < inp.retirementAge,
      isSnapshot: true,
      cash, mm, cd, brokerage, k401, c529: c529Now,
      from529: 0,
      liquid: liquidNow,
      mortgage: propMortNow,
      homeValue: propValueNow,
      equity: equityNow,
      vehicleValue: vehValNow,
      vehicleLoans: vehLoanNow,
      vehicleEquity: Math.max(0, vehValNow - vehLoanNow),
      otherDebts: debtNow,
      otherAssets: otherAssetNow,
      totalAssets: totAssetsNow,
      totalLiabilities: totLiabNow,
      netWorth: totAssetsNow - totLiabNow,
      grossIncome: 0, salary: 0, ssIncome: 0, altIncome: 0, rentalIncome: 0, inheritance: 0,
      taxes: 0, propertyTax: 0, vehicleLoanPayments: 0, debtPayments: 0, rentPayment: 0,
      livingExpenses: 0, totalSpend: 0, expenses: 0,
      healthcare: 0, college: 0, mortgagePayment: 0, netFlow: 0
    });
  }

  for (let y = 0; y <= years; y++) {
    const age = inp.currentAge + y;
    const isWorking = age < inp.retirementAge && y < inp.earningYears;
    const infl = Math.pow(1 + inp.inflation, y);

    // ----- Inheritances arriving this year -----
    // Tax-free to recipient (estate tax paid by estate, step-up basis on investments).
    // Deposited to brokerage; draws naturally apply when expenses exceed income.
    let inheritanceThisYear = 0;
    if (inp.inheritances && inp.inheritances.length > 0) {
      for (const inh of inp.inheritances) {
        if (inh.age === age && inh.amount > 0) {
          inheritanceThisYear += inh.amount;
          brokerage += inh.amount;
        }
      }
    }

    // ----- Income -----
    let salary = isWorking ? inp.income * Math.pow(1 + inp.salaryGrowth, y) : 0;
    let ssIncome = age >= inp.ssStartAge ? inp.socialSecurity * infl : 0;
    let altIncome = (age >= inp.altStartAge && age <= inp.altEndAge) ? inp.altIncome * infl : 0;

    // Properties: collect rental income, pay mortgages, pay property tax, grow values
    let rentalIncome = 0;
    let propertyTax = 0;
    let mortgagePayment = 0;
    for (const p of properties) {
      if (p.type === 'rental' && p.netRentalIncome > 0) {
        // Apply start/end age window. null means "no bound" (starts now / never ends).
        const rentalStart = p.rentalStartAge ?? inp.currentAge;
        const rentalEnd = p.rentalEndAge ?? inp.lifeExpectancy;
        if (age >= rentalStart && age <= rentalEnd) {
          // Growth compounds from the start of rental income, not from year 0
          const yearsActive = age - rentalStart;
          rentalIncome += p.netRentalIncome * Math.pow(1 + (p.rentalGrowth || 0.025), yearsActive);
        }
      }
      if (p.mortgage > 0 && p.mortgageMonthly > 0) {
        const annualPmt = p.mortgageMonthly * 12;
        const interest = p.mortgage * p.mortgageRate;
        const principal = Math.max(0, annualPmt - interest);
        const actualPmt = Math.min(annualPmt, p.mortgage + interest);
        p.mortgage = Math.max(0, p.mortgage - Math.min(principal, p.mortgage));
        mortgagePayment += actualPmt;
      }
      propertyTax += p.value * p.propertyTaxRate;
    }

    const grossIncome = salary + ssIncome + altIncome + rentalIncome;

    // ----- Expenses -----
    let expenses = inp.annualExpenses * infl * adj.exp;

    // Healthcare: covered by employer if working, otherwise out of pocket
    let healthcare = 0;
    if (!isWorking) {
      healthcare = (age < 65 ? inp.hcPreMedicare : inp.hcMedicare) * infl;
    }

    // ----- Education costs -----
    // For each child, walk their entries (preschool, K-12, college, etc).
    // Each entry costs annualCost (inflated) for durationYears, starting at parentAgeAtStart.
    // The child's 529 balance is drawn first (tax-free for qualified expenses); the rest hits the
    // expense pool and is funded from regular income/savings.
    let college = 0;
    let from529 = 0;
    for (const child of children) {
      let childYearCost = 0;
      for (const entry of (child.entries || [])) {
        const start = entry.parentAgeAtStart;
        const end = start + (entry.durationYears || 0);
        if (age >= start && age < end) {
          childYearCost += (entry.annualCost || 0) * infl;
        }
      }
      if (childYearCost > 0) {
        // Pay this child's costs from this child's 529 first
        const fromThisChild529 = Math.min(child.c529Balance, childYearCost);
        child.c529Balance -= fromThisChild529;
        from529 += fromThisChild529;
        college += (childYearCost - fromThisChild529); // remaining out-of-pocket
      }
    }

    // Mortgage payments and property taxes already aggregated above across all properties.

    // ----- Vehicle loans + leases -----
    // Loans amortize each year (paid off, then payments stop, vehicle is owned).
    // Leases are pure cash outflow until lease end; at that point the vehicle disappears entirely.
    let vehicleLoanPayments = 0;
    for (const v of vehicles) {
      if (v.lease) {
        const leaseEnd = v.leaseEndAge ?? Infinity;
        if (age <= leaseEnd && v.loanMonthly > 0) {
          vehicleLoanPayments += v.loanMonthly * 12;
        }
        if (age === leaseEnd) {
          // Lease ends this year, vehicle returns to lessor
          v.value = 0;
          v.loanBalance = 0;
          v.loanMonthly = 0;
          v.lease = false; // mark as ended so it doesn't keep coming back
          v._leaseEnded = true;
        }
      } else if (v.loanBalance > 0 && v.loanMonthly > 0) {
        const annualPmt = v.loanMonthly * 12;
        const interest = v.loanBalance * v.loanRate;
        const principal = Math.max(0, annualPmt - interest);
        const actualPmt = Math.min(annualPmt, v.loanBalance + interest);
        v.loanBalance = Math.max(0, v.loanBalance - Math.min(principal, v.loanBalance));
        vehicleLoanPayments += actualPmt;
      }
    }

    // ----- Other debts (credit cards, student loans, personal loans) -----
    // Capitalized interest if monthly payment is below interest charge, debt grows.
    let debtPayments = 0;
    for (const d of debts) {
      if (d.balance > 0) {
        const interest = d.balance * d.rate;
        const annualPmt = (d.monthlyPayment || 0) * 12;
        if (annualPmt <= 0) {
          // No payment configured, debt accrues
          d.balance += interest;
          continue;
        }
        const principal = annualPmt - interest;
        const actualPmt = Math.min(annualPmt, d.balance + interest);
        if (principal >= 0) {
          d.balance = Math.max(0, d.balance - Math.min(principal, d.balance));
        } else {
          // Payment doesn't cover interest, balance grows
          d.balance += -principal;
        }
        debtPayments += actualPmt;
      }
    }

    // ----- Rent (if user rents rather than owns, or during a phase of life) -----
    let rentPayment = 0;
    if (inp.monthlyRent > 0) {
      const rentStart = inp.rentStartAge ?? inp.currentAge;
      const rentEnd = inp.rentEndAge ?? inp.lifeExpectancy;
      if (age >= rentStart && age <= rentEnd) {
        // Rent grows at its own (typically faster than CPI) inflation rate, compounded from year 0
        rentPayment = inp.monthlyRent * 12 * Math.pow(1 + (inp.rentInflation || 0.04), y);
      }
    }

    const totalSpend = expenses + healthcare + college + mortgagePayment + propertyTax + vehicleLoanPayments + debtPayments + rentPayment;

    // ----- Taxes -----
    // Treat 85% of SS as taxable (simplified). Withdrawals from 401k counted as ordinary income.
    // Rental income is treated as ordinary (no depreciation modeled).
    const taxableOrdinary = salary + ssIncome * 0.85 + altIncome + rentalIncome;
    const taxes = estimateTax({
      ordinaryIncome: taxableOrdinary,
      married: inp.married,
      isWorking,
      stateRate: inp.stateRate,
      stateCode: inp.stateCode,
      useStateBrackets: inp.useStateBrackets
    });

    // ----- Net cashflow -----
    const netFlow = grossIncome - taxes - totalSpend;

    // Track movements per account for the audit drawer
    const flows = {
      surplusToCash: 0,
      surplusToMM: 0,
      surplusToCD: 0,
      surplusToBrokerage: 0,
      surplusToK401: 0,
      drawFromCash: 0,
      drawFromMM: 0,
      drawFromCD: 0,
      drawFromBrokerage: 0,
      drawFromK401: 0,
      tapFromHomeEquity: 0
    };

    if (netFlow >= 0) {
      // User-configured allocation across cash / MM / CD / brokerage / 401(k).
      // 401(k) honors the IRS cap; overflow gets redistributed proportionally to the others.
      const alloc = inp.savingsAllocation || {};
      const K401_CAP = 23500;

      let remainingSurplus = netFlow;

      // Step 1: Try to fill 401(k) up to the user's allocated share, capped by IRS limit.
      // 401(k) contributions only happen while working (employer plan).
      let k401Target = isWorking ? Math.min(netFlow * (alloc.k401 || 0), K401_CAP) : 0;
      k401 += k401Target;
      flows.surplusToK401 = k401Target;
      remainingSurplus -= k401Target;

      // Step 2: Split the remainder across non-401(k) buckets, scaled to their relative shares.
      // If the user's non-401(k) allocations are 0 (e.g., they put 100% in 401k but it capped),
      // overflow defaults to brokerage.
      const otherShares = {
        cash: alloc.cash || 0,
        mm: alloc.mm || 0,
        cd: alloc.cd || 0,
        brokerage: alloc.brokerage || 0
      };
      let otherSum = otherShares.cash + otherShares.mm + otherShares.cd + otherShares.brokerage;
      // If 401k didn't cap and we're not working, the user's intended allocations apply directly.
      // If 401k DID cap (or we're not working), we need to allocate the overflow.
      if (otherSum === 0) {
        // User wants 100% in 401(k) but it capped, overflow to brokerage.
        brokerage += remainingSurplus;
        flows.surplusToBrokerage = remainingSurplus;
      } else {
        const cashAdd = remainingSurplus * (otherShares.cash / otherSum);
        const mmAdd = remainingSurplus * (otherShares.mm / otherSum);
        const cdAdd = remainingSurplus * (otherShares.cd / otherSum);
        const brokAdd = remainingSurplus * (otherShares.brokerage / otherSum);
        cash += cashAdd; mm += mmAdd; cd += cdAdd; brokerage += brokAdd;
        flows.surplusToCash = cashAdd;
        flows.surplusToMM = mmAdd;
        flows.surplusToCD = cdAdd;
        flows.surplusToBrokerage = brokAdd;
      }
    } else {
      // Withdraw in order: cash → money market → CD → brokerage → 401k
      let need = -netFlow;
      const drawOrder = ['cash', 'mm', 'cd', 'brokerage', 'k401'];
      const buckets = { cash, mm, cd, brokerage, k401 };
      for (const b of drawOrder) {
        if (need <= 0) break;
        const take = Math.min(buckets[b], need);
        buckets[b] -= take;
        need -= take;
        if (b === 'cash') flows.drawFromCash += take;
        if (b === 'mm') flows.drawFromMM += take;
        if (b === 'cd') flows.drawFromCD += take;
        if (b === 'brokerage') flows.drawFromBrokerage += take;
        // 401k withdrawals incur additional ordinary income tax, pull a bit more
        if (b === 'k401' && take > 0) {
          const extraTax = take * 0.20;
          const extra = Math.min(buckets.k401, extraTax);
          buckets.k401 -= extra;
          flows.drawFromK401 += take + extra;
        }
      }
      cash = buckets.cash; mm = buckets.mm; cd = buckets.cd;
      brokerage = buckets.brokerage; k401 = buckets.k401;

      // If we still need cash, tap home equity (if allowed)
      // Order: non-primary properties first (rentals, vacations), then primary residence last
      if (need > 0 && inp.useHomeEquity) {
        const tapOrder = [...properties].sort((a, b) =>
          (a.type === 'primary' ? 1 : 0) - (b.type === 'primary' ? 1 : 0)
        );
        for (const p of tapOrder) {
          if (need <= 0) break;
          const equity = Math.max(0, p.value - p.mortgage);
          if (equity <= 0) continue;
          const take = Math.min(equity, need);
          // Find the property in our live array and reduce its value
          const live = properties.find(x => x.id === p.id);
          if (live) live.value -= take;
          need -= take;
          flows.tapFromHomeEquity += take;
          if (homeEquityTapAge === null) homeEquityTapAge = age;
        }
      }
      if (need > 0 && runOutAge === null) {
        runOutAge = age;
      }
    }

    // ----- Grow assets -----
    mm *= (1 + Math.max(0, inp.mmRate + adj.ret));
    cd *= (1 + inp.cdRate); // CDs locked, less affected by scenario
    brokerage *= (1 + Math.max(-0.5, inp.brokerageRate + adj.ret));
    k401 *= (1 + Math.max(-0.5, inp.k401Rate + adj.ret));
    // Each child's 529 grows at the shared 529 rate
    for (const child of children) {
      child.c529Balance = Math.max(0, child.c529Balance * (1 + Math.max(-0.5, inp.c529Rate + adj.ret)));
    }
    // Each property grows at its own appreciation rate
    for (const p of properties) {
      p.value *= (1 + p.appreciation);
    }
    // Vehicles depreciate (owned only, not leased); once they hit a low residual we hold the floor
    for (const v of vehicles) {
      if (v.lease) continue;
      const floor = (v.value && v.depreciation) ? Math.max(500, v.value * 0.10) : 500;
      v.value = Math.max(floor * 0, v.value * (1 - (v.depreciation || 0)));
    }
    // Other assets grow (or shrink) at their own rates
    for (const a of otherAssets) {
      a.value *= (1 + (a.growthRate || 0));
    }

    // ----- Net worth components -----
    const liquid = cash + mm + cd + brokerage + k401;
    const c529Total = get529Total();
    const totalPropertyValue = properties.reduce((s, p) => s + p.value, 0);
    const totalMortgageBalance = properties.reduce((s, p) => s + p.mortgage, 0);
    const equity = Math.max(0, totalPropertyValue - totalMortgageBalance);

    // Only owned vehicles contribute to net worth (leased vehicles have zero equity).
    const totalVehicleValue = vehicles.reduce((s, v) => s + (v.lease ? 0 : Math.max(0, v.value)), 0);
    const totalVehicleLoans = vehicles.reduce((s, v) => s + (v.lease ? 0 : Math.max(0, v.loanBalance)), 0);
    const vehicleEquity = Math.max(0, totalVehicleValue - totalVehicleLoans);

    const totalOtherDebts = debts.reduce((s, d) => s + Math.max(0, d.balance), 0);
    const totalOtherAssets = otherAssets.reduce((s, a) => s + Math.max(0, a.value), 0);

    const totalAssets = liquid + c529Total + totalPropertyValue + totalVehicleValue + totalOtherAssets;
    const totalLiabilities = totalMortgageBalance + totalVehicleLoans + totalOtherDebts;
    const netWorth = totalAssets - totalLiabilities;

    traj.push({
      age, year: y, isWorking,
      cash: Math.max(0, cash),
      mm: Math.max(0, mm),
      cd: Math.max(0, cd),
      brokerage: Math.max(0, brokerage),
      k401: Math.max(0, k401),
      c529: Math.max(0, c529Total),
      from529,
      liquid: Math.max(0, liquid),
      mortgage: Math.max(0, totalMortgageBalance),
      homeValue: totalPropertyValue,
      equity,
      // New: vehicle, debt, and other-asset breakdown
      vehicleValue: totalVehicleValue,
      vehicleLoans: totalVehicleLoans,
      vehicleEquity,
      otherDebts: totalOtherDebts,
      otherAssets: totalOtherAssets,
      totalAssets,
      totalLiabilities,
      netWorth,
      grossIncome,
      salary,
      ssIncome,
      altIncome,
      rentalIncome,
      inheritance: inheritanceThisYear,
      taxes,
      propertyTax,
      vehicleLoanPayments,
      debtPayments,
      rentPayment,
      livingExpenses: expenses,
      totalSpend,
      expenses: totalSpend, // backward compat
      healthcare,
      college,
      mortgagePayment,
      netFlow,
      flows
    });
  }

  // Final summary
  const atRet = traj.find(t => t.age === inp.retirementAge);
  const lastYear = traj[traj.length - 1];
  return {
    trajectory: traj,
    runOutAge,
    homeEquityTapAge,
    portfolioAtRetirement: atRet ? atRet.liquid : 0,
    netWorthAtRetirement: atRet ? atRet.netWorth : 0,
    finalLiquid: lastYear.liquid,
    finalNetWorth: lastYear.netWorth,
    survives: runOutAge === null || (inp.useHomeEquity && lastYear.equity > 0 && runOutAge === null)
  };
}

// ============================================================================
// JOB LOSS RUNWAY SIMULATION
// ============================================================================
// Models a sudden loss of primary income. Different end condition than retirement:
// "how many months until liquid accounts hit zero?" rather than "money lasts through life expectancy?"
//
// Three preset scenarios:
//   bare     - Just liquid accounts, no severance, no UI, no expense reduction (worst case)
//   typical  - Severance + UI + COBRA + 15% expense reduction (realistic)
//   best     - All of typical PLUS partner income continues + max severance use
//
// The simulation works monthly (not yearly) since runway is usually measured in months.
// It draws from accounts in priority order: cash → MM → CDs → brokerage. 401(k) is treated
// as last-resort (penalty applies). The output is months of runway plus a per-month trajectory.
//
function simulateRunway(inp, mode = 'typical') {
  // Build monthly cashflow profile based on mode
  const adj = {
    bare:    { useSeverance: false, useUI: false, expenseCut: 0,    usePartner: false },
    typical: { useSeverance: true,  useUI: true,  expenseCut: inp.expenseReductionPct || 0.15, usePartner: inp.married && inp.partnerKeepsIncome },
    best:    { useSeverance: true,  useUI: true,  expenseCut: Math.max(inp.expenseReductionPct || 0.15, 0.25), usePartner: inp.married && inp.partnerKeepsIncome }
  }[mode];

  // Snapshot of liquid accounts at "today"
  let cash = inp.cash || 0;
  let mm = inp.moneyMarket || 0;
  let cd = inp.cd || 0;
  let brokerage = inp.brokerage || 0;
  // 401(k) is shown but not drawn from in the runway simulation; it's a penalty zone
  const k401Available = inp.k401 || 0;

  // Monthly expenses, current values (pre-retirement, no inflation applied in short window)
  const livingMonthly = (inp.annualExpenses || 0) / 12;
  // Healthcare: replaced by COBRA if employed-coverage was the source
  const cobraMonthly = inp.cobraMonthly || 1800;

  // Mortgage payments and rent (these continue regardless of employment)
  let mortgageMonthly = 0;
  for (const p of (inp.properties || [])) {
    if (p.mortgage > 0 && p.mortgageMonthly > 0) mortgageMonthly += p.mortgageMonthly;
  }
  const rentMonthly = (inp.monthlyRent || 0);

  // Property tax monthly (still due even if you lose your job)
  let propTaxMonthly = 0;
  for (const p of (inp.properties || [])) {
    propTaxMonthly += (p.value * (p.propertyTaxRate || 0)) / 12;
  }

  // Vehicle loan / lease payments (continue)
  let vehicleMonthly = 0;
  for (const v of (inp.vehicles || [])) {
    if (v.loanMonthly > 0) vehicleMonthly += v.loanMonthly;
  }

  // Other debt minimum payments (continue)
  let debtMonthly = 0;
  for (const d of (inp.debts || [])) {
    if (d.monthlyPayment > 0) debtMonthly += d.monthlyPayment;
  }

  // Education costs (active education stages continue regardless)
  let educationMonthly = 0;
  for (const child of (inp.children || [])) {
    for (const e of (child.entries || [])) {
      const start = e.parentAgeAtStart;
      const end = start + (e.durationYears || 0);
      if (inp.currentAge >= start && inp.currentAge < end) {
        // 529 covers some of this; assume 529 covers proportional to balance / total cost
        educationMonthly += (e.annualCost || 0) / 12;
      }
    }
  }
  // 529 helps offset (assume drawn at same rate)
  // Sum 529 across children, divide across active months for crude offset
  // Keep it simple: 529 funds count as available cash for education only (not for general expenses)
  // For runway purposes treat education as gross cost and 529 separately
  // Actually for clarity, exclude education costs from the runway model entirely if 529 covers them

  // Income side
  // Rental income (continues, doesn't depend on job)
  let rentalIncomeMonthly = 0;
  for (const p of (inp.properties || [])) {
    if (p.type === 'rental' && p.netRentalIncome > 0) {
      const rentalStart = p.rentalStartAge ?? inp.currentAge;
      const rentalEnd = p.rentalEndAge ?? inp.lifeExpectancy;
      if (inp.currentAge >= rentalStart && inp.currentAge <= rentalEnd) {
        rentalIncomeMonthly += (p.netRentalIncome || 0) / 12;
      }
    }
  }

  // Other income (pension, royalties, etc.) — continues if currently active
  let altIncomeMonthly = 0;
  if (inp.altIncome > 0) {
    const altStart = inp.altStartAge ?? inp.currentAge;
    const altEnd = inp.altEndAge ?? 999;
    if (inp.currentAge >= altStart && inp.currentAge <= altEnd) {
      altIncomeMonthly = (inp.altIncome || 0) / 12;
    }
  }

  // Partner income (assumed to continue if married and option is on)
  let partnerIncomeMonthly = 0;
  if (adj.usePartner && inp.income > 0) {
    partnerIncomeMonthly = (inp.income * (inp.partnerIncomePortion || 0.40)) / 12;
  }

  // Severance (paid out over N months)
  const severanceTotal = adj.useSeverance ? (inp.severanceAmount || 0) : 0;
  const severanceMonths = Math.max(1, inp.severancePaymentMonths || 1);
  const severancePerMonth = severanceTotal / severanceMonths;

  // Unemployment insurance benefits: weekly × 4.33 weeks/month
  const uiMonthly = adj.useUI ? ((inp.uiWeeklyBenefit || 0) * 4.33) : 0;
  const uiMaxMonths = adj.useUI ? Math.ceil((inp.uiMaxWeeks || 26) / 4.33) : 0;

  // Gig / freelance income while unemployed. Active during a window [start, end].
  // Note: in many states, gig income reduces unemployment benefits dollar-for-dollar
  // above a small earnings disregard. The model conservatively does NOT reduce UI
  // when gig income is reported, because (a) earnings disregards vary by state,
  // (b) many gig workers earn under reporting thresholds, and (c) users tend to
  // ask "what if I picked up X" not "what if I earned X but lost UI". If you want
  // a conservative model, set gigMonthlyIncome a bit lower than your true expected
  // earnings to roughly account for UI reduction.
  const gigMonthly = (inp.gigMonthlyIncome || 0);
  const gigStart = Math.max(1, inp.gigStartMonth || 1);
  const gigEnd = Math.max(gigStart, inp.gigEndMonth || 24);

  // Expense reduction: applied to discretionary living expenses only (not fixed costs)
  // Mortgage, rent, property tax, vehicle, debt, education, COBRA all stay full
  const livingMonthlyAdjusted = livingMonthly * (1 - adj.expenseCut);

  // Run month-by-month for up to 60 months (5 years)
  const trajectory = [];
  let monthsLasted = 0;
  for (let m = 1; m <= 60; m++) {
    // Income for this month
    const sevThisMonth = m <= severanceMonths ? severancePerMonth : 0;
    const uiThisMonth = m <= uiMaxMonths ? uiMonthly : 0;
    const gigThisMonth = (m >= gigStart && m <= gigEnd) ? gigMonthly : 0;
    const monthlyIncome = sevThisMonth + uiThisMonth + gigThisMonth + partnerIncomeMonthly + rentalIncomeMonthly + altIncomeMonthly;

    // Expenses for this month
    const monthlyExpenses = livingMonthlyAdjusted + cobraMonthly + mortgageMonthly + rentMonthly + propTaxMonthly + vehicleMonthly + debtMonthly + educationMonthly;

    const netFlow = monthlyIncome - monthlyExpenses;

    let drawnFrom = null;
    // If income covers expenses, surplus goes to cash (rare in unemployment but possible)
    if (netFlow >= 0) {
      cash += netFlow;
    } else {
      // Draw from accounts in priority order: cash → MM → CDs → brokerage
      let need = -netFlow;
      if (cash > 0) {
        const drawn = Math.min(cash, need);
        cash -= drawn;
        need -= drawn;
        if (drawn > 0) drawnFrom = 'cash';
      }
      if (need > 0 && mm > 0) {
        const drawn = Math.min(mm, need);
        mm -= drawn;
        need -= drawn;
        if (drawn > 0) drawnFrom = drawnFrom || 'mm';
      }
      if (need > 0 && cd > 0) {
        const drawn = Math.min(cd, need);
        cd -= drawn;
        need -= drawn;
        if (drawn > 0) drawnFrom = drawnFrom || 'cd';
      }
      if (need > 0 && brokerage > 0) {
        const drawn = Math.min(brokerage, need);
        brokerage -= drawn;
        need -= drawn;
        if (drawn > 0) drawnFrom = drawnFrom || 'brokerage';
      }
      // If need still > 0, we've exhausted liquid accounts
      if (need > 0) {
        // 401(k) would have to be tapped at penalty
        trajectory.push({
          month: m,
          age: inp.currentAge + (m - 1) / 12,
          income: monthlyIncome,
          expenses: monthlyExpenses,
          netFlow,
          cash, mm, cd, brokerage, k401: k401Available,
          totalLiquid: 0,
          severance: sevThisMonth,
          ui: uiThisMonth,
          gig: gigThisMonth,
          partnerIncome: partnerIncomeMonthly,
          rentalIncome: rentalIncomeMonthly,
          altIncome: altIncomeMonthly,
          livingExpenses: livingMonthlyAdjusted,
          cobra: cobraMonthly,
          mortgage: mortgageMonthly,
          rent: rentMonthly,
          propertyTax: propTaxMonthly,
          vehicleLoans: vehicleMonthly,
          debtPayments: debtMonthly,
          education: educationMonthly,
          drawnFrom: '401k_penalty',
          drawnAmount: -netFlow,
          exhausted: true
        });
        // First month of exhaustion is the runway end
        if (monthsLasted === 0) monthsLasted = m - 1;
        break;
      }
    }

    trajectory.push({
      month: m,
      age: inp.currentAge + (m - 1) / 12,
      income: monthlyIncome,
      expenses: monthlyExpenses,
      netFlow,
      cash: Math.max(0, cash),
      mm: Math.max(0, mm),
      cd: Math.max(0, cd),
      brokerage: Math.max(0, brokerage),
      k401: k401Available,
      totalLiquid: Math.max(0, cash) + Math.max(0, mm) + Math.max(0, cd) + Math.max(0, brokerage),
      // Income breakdown
      severance: sevThisMonth,
      ui: uiThisMonth,
      gig: gigThisMonth,
      partnerIncome: partnerIncomeMonthly,
      rentalIncome: rentalIncomeMonthly,
      altIncome: altIncomeMonthly,
      // Expense breakdown
      livingExpenses: livingMonthlyAdjusted,
      cobra: cobraMonthly,
      mortgage: mortgageMonthly,
      rent: rentMonthly,
      propertyTax: propTaxMonthly,
      vehicleLoans: vehicleMonthly,
      debtPayments: debtMonthly,
      education: educationMonthly,
      // Account flow
      drawnFrom,
      drawnAmount: netFlow < 0 ? -netFlow : 0,
      surplusToCash: netFlow > 0 ? netFlow : 0,
      exhausted: false
    });

    monthsLasted = m;
  }

  // Compute key metrics
  const lastEntry = trajectory[trajectory.length - 1];
  const surplusOrDeficitMonth1 = trajectory[0] ? trajectory[0].netFlow : 0;

  return {
    mode,
    monthsLasted,                                  // months until liquid is exhausted (or 60+ if fine)
    survivesAtCap: monthsLasted >= 60 && !lastEntry?.exhausted,
    trajectory,
    inputs: {
      severanceTotal,
      severanceMonths,
      uiMonthly,
      uiMaxMonths,
      gigMonthly,
      gigStart,
      gigEnd,
      partnerIncomeMonthly,
      cobraMonthly,
      expenseCut: adj.expenseCut,
      livingMonthlyAdjusted,
      mortgageMonthly,
      rentMonthly,
      propTaxMonthly,
      vehicleMonthly,
      debtMonthly,
      educationMonthly,
      rentalIncomeMonthly,
      altIncomeMonthly
    },
    monthlyBurn: surplusOrDeficitMonth1,
    startingLiquid: (inp.cash || 0) + (inp.moneyMarket || 0) + (inp.cd || 0) + (inp.brokerage || 0),
    k401Available
  };
}

// Find the earliest retirement age where the conservative scenario survives
function findSafeRetirementAge(inputs) {
  const startAge = Math.max(inputs.currentAge, 50);
  for (let a = startAge; a <= 75; a++) {
    const test = { ...inputs, retirementAge: a, earningYears: Math.max(0, a - inputs.currentAge) };
    const sim = simulate(test, 'cons');
    if (sim.runOutAge === null) return a;
  }
  return null; // never safe within range
}

function findModerateRetirementAge(inputs) {
  const startAge = Math.max(inputs.currentAge, 50);
  for (let a = startAge; a <= 75; a++) {
    const test = { ...inputs, retirementAge: a, earningYears: Math.max(0, a - inputs.currentAge) };
    const sim = simulate(test, 'mod');
    if (sim.runOutAge === null) return a;
  }
  return null;
}

// ============================================================================
// FORMATTING
// ============================================================================
const fmt$ = (n) => {
  if (n == null || isNaN(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${n < 0 ? '-' : ''}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${n < 0 ? '-' : ''}$${(abs / 1_000).toFixed(0)}K`;
  return `${n < 0 ? '-' : ''}$${abs.toFixed(0)}`;
};
const fmt$Full = (n) => n == null || isNaN(n) ? '—' : `$${Math.round(n).toLocaleString()}`;
const fmtPct = (n) => `${(n * 100).toFixed(1)}%`;

// ============================================================================
// REUSABLE INPUTS
// ============================================================================
// Slider with a click-to-edit value display. Tap or click the number on the
// right to type a value directly — useful when the slider is hard to nudge
// precisely on touch screens, or when the user knows the exact value they want.
// The two controls stay synced; whichever is easier in the moment.
function Slider({ label, value, onChange, min, max, step, fmt = (v) => v, suffix = '', help }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  // Begin editing — initialize the input with the current value as a clean string.
  const startEditing = () => {
    setDraft(String(value));
    setEditing(true);
  };

  // Commit the edit — clamp to range, snap to step, fall back to current value if invalid.
  const commit = () => {
    const parsed = parseFloat(draft);
    if (!isNaN(parsed)) {
      let v = parsed;
      // Clamp to the slider's bounds so the user can't enter values outside them.
      if (v < min) v = min;
      if (v > max) v = max;
      // Snap to step. We treat step as a precision hint: round to it relative to min.
      if (step) {
        v = min + Math.round((v - min) / step) * step;
        // Avoid floating point fuzz like 0.30000000000000004
        const decimals = (String(step).split('.')[1] || '').length;
        v = parseFloat(v.toFixed(Math.max(decimals, 4)));
      }
      onChange(v);
    }
    setEditing(false);
  };

  // Allow Enter to commit, Escape to cancel.
  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditing(false);
    }
  };

  return (
    <div className="mb-5">
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-[12px] uppercase tracking-[0.12em]" style={{ color: T.muted, fontFamily: BODY_FONT, fontWeight: 500 }}>
          {label}
        </label>
        {editing ? (
          <div className="flex items-baseline" style={{ minWidth: 80 }}>
            <input
              autoFocus
              type="text"
              inputMode="decimal"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={onKeyDown}
              style={{
                fontFamily: DISPLAY_FONT, fontWeight: 500, fontSize: 18,
                color: T.ink, fontVariantNumeric: 'tabular-nums',
                background: T.surface, border: `1px solid ${T.ink}`,
                padding: '2px 6px', borderRadius: 0,
                width: 80, textAlign: 'right', outline: 'none'
              }}
            />
            {suffix && (
              <span style={{
                fontFamily: DISPLAY_FONT, fontWeight: 500, fontSize: 18, color: T.ink,
                marginLeft: 2
              }}>
                {suffix}
              </span>
            )}
          </div>
        ) : (
          <button
            onClick={startEditing}
            type="button"
            // Style the value as a button that doesn't look like a button until hover/focus.
            // Click to edit; on touch devices a tap also opens the editor.
            style={{
              fontFamily: DISPLAY_FONT, fontWeight: 500, fontSize: 18, color: T.ink,
              fontVariantNumeric: 'tabular-nums',
              background: 'transparent', border: 'none',
              borderBottom: `1px dashed ${T.ruleLight}`,
              padding: '0 2px', cursor: 'text',
              transition: 'border-color 120ms ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = T.ink}
            onMouseLeave={(e) => e.currentTarget.style.borderBottomColor = T.ruleLight}
            title="Click to type a value"
          >
            {fmt(value)}{suffix}
          </button>
        )}
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
        style={{
          accentColor: T.emerald,
          height: 4
        }}
      />
      {help && (
        <p className="text-[11px] mt-1.5" style={{ color: T.muted, fontStyle: 'italic' }}>{help}</p>
      )}
    </div>
  );
}

// Compact editable percentage display, used in the income allocation buckets.
// Click/tap the percentage to type a value directly. Commits on Enter or blur,
// cancels on Escape. Clamps to 0-100 and snaps to integer.
function EditablePct({ pct, onCommit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const start = () => {
    setDraft(String(pct));
    setEditing(true);
  };

  const commit = () => {
    const parsed = parseInt(draft, 10);
    if (!isNaN(parsed)) {
      let v = parsed;
      if (v < 0) v = 0;
      if (v > 100) v = 100;
      onCommit(v);
    }
    setEditing(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'baseline' }}>
        <input
          autoFocus
          type="text"
          inputMode="numeric"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={onKeyDown}
          style={{
            fontFamily: MONO_FONT, fontSize: 13, fontWeight: 600, color: T.ink,
            background: T.surface, border: `1px solid ${T.ink}`,
            padding: '1px 4px', borderRadius: 0,
            width: 40, textAlign: 'right', outline: 'none'
          }}
        />
        <span style={{
          fontFamily: MONO_FONT, fontSize: 13, fontWeight: 600,
          color: T.ink, marginLeft: 1
        }}>%</span>
      </span>
    );
  }
  return (
    <button
      onClick={start}
      type="button"
      style={{
        fontFamily: MONO_FONT, fontSize: 13, fontWeight: 600,
        color: T.ink, minWidth: 40, textAlign: 'right',
        background: 'transparent', border: 'none',
        borderBottom: `1px dashed ${T.ruleLight}`,
        padding: '0 2px', cursor: 'text',
        transition: 'border-color 120ms ease',
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = T.ink}
      onMouseLeave={(e) => e.currentTarget.style.borderBottomColor = T.ruleLight}
      title="Click to type a value"
    >
      {pct}%
    </button>
  );
}

// ============================================================================
// StateTaxPicker
// ============================================================================
// State dropdown (50 states + DC + "use manual rate"), with a contextual
// note about each state's tax structure. When a state is picked, we use the
// bracketed engine. The user can also flip a toggle to ignore the state
// dropdown and enter a flat rate manually (useful for power users who want
// precise control or want to model a different state).
//
// Shows the user's *effective* state tax rate at their actual income, not
// the top marginal rate, since the top marginal rate is misleading for
// most users (it's the rate on income above hundreds of thousands of dollars).
function StateTaxPicker({ stateCode, useStateBrackets, stateRate, married = false, income = 0, onStateCodeChange, onUseBracketsChange, onStateRateChange }) {
  const data = stateCode ? STATE_TAX_DATA[stateCode] : null;

  // When a state is picked, switch to bracket engine automatically (more accurate).
  // When state is cleared, fall back to the manual flat rate.
  const handleStateChange = (e) => {
    const code = e.target.value;
    onStateCodeChange(code);
    onUseBracketsChange(!!code);
  };

  // What the user actually pays at their income — far more meaningful than top marginal.
  let stateDesc = null;
  let effectiveLine = null;
  if (data) {
    if (data.noTax) {
      stateDesc = `${data.name} has no state income tax.`;
    } else if (data.flat) {
      stateDesc = `${data.name}: flat ${(data.flatRate * 100).toFixed(2).replace(/\.?0+$/,'')}% on income.`;
    } else {
      const top = topMarginalRate(stateCode);
      stateDesc = `${data.name}: progressive brackets, top rate ${(top * 100).toFixed(2).replace(/\.?0+$/,'')}% (applies only to income in the highest bracket).`;
    }
    // Compute the effective rate at the user's income, if income > 0.
    if (!data.noTax && income > 0) {
      const tax = computeStateIncomeTax(income, stateCode, married);
      const effRate = (tax / income) * 100;
      effectiveLine = `At $${(income).toLocaleString()} ${married ? 'married filing jointly' : 'single'}: ~$${Math.round(tax).toLocaleString()} state tax (effective ${effRate.toFixed(2)}%).`;
    }
  }

  return (
    <div className="mb-5">
      {/* State dropdown */}
      <div className="mb-3">
        <label className="text-[12px] uppercase tracking-[0.12em] block mb-1.5" style={{ color: T.muted, fontFamily: BODY_FONT, fontWeight: 500 }}>
          State of residence (for tax)
        </label>
        <select
          value={stateCode || ''}
          onChange={handleStateChange}
          style={{
            width: '100%', padding: '8px 10px',
            background: T.surface, border: `1px solid ${T.rule}`,
            fontFamily: BODY_FONT, fontSize: 14, color: T.ink,
            fontWeight: 500, cursor: 'pointer', borderRadius: 0
          }}
        >
          <option value="">Pick a state to use the right brackets</option>
          {STATE_LIST.map(s => (
            <option key={s.code} value={s.code}>{s.name}</option>
          ))}
        </select>
        {stateDesc && (
          <p className="text-[11px] mt-1.5" style={{ color: T.muted, fontStyle: 'italic', lineHeight: 1.45 }}>
            {stateDesc}
          </p>
        )}
        {effectiveLine && (
          <p className="text-[11px] mt-1.5" style={{ color: T.ink, lineHeight: 1.45, fontWeight: 500 }}>
            {effectiveLine}
          </p>
        )}
        {data?.note && (
          <p className="text-[10px] mt-1" style={{ color: T.muted, fontStyle: 'italic', lineHeight: 1.45 }}>
            Note: {data.note}
          </p>
        )}
        {!stateCode && (
          <p className="text-[11px] mt-1.5" style={{ color: T.muted, fontStyle: 'italic', lineHeight: 1.45 }}>
            Pick your state and the calculator runs your income through that state's actual brackets. Or skip this and enter a flat rate below.
          </p>
        )}
        {stateCode && data && !data.noTax && (
          <p className="text-[10px] mt-1" style={{ color: T.muted, fontStyle: 'italic', lineHeight: 1.45 }}>
            Data as of {STATE_TAX_DATA_AS_OF}. Planning estimate only — does not include local/city taxes, deductions, credits, or special rules for retirement income. For tax preparation, consult a tax professional.
          </p>
        )}
      </div>

      {/* Manual flat-rate override — disabled when a state is picked, but visible
          so the user can see what's being used. Toggle to enable manual control. */}
      <div style={{
        background: useStateBrackets ? T.surfaceWarm : 'transparent',
        opacity: useStateBrackets ? 0.55 : 1,
        padding: useStateBrackets ? 8 : 0,
        border: useStateBrackets ? `1px dashed ${T.ruleLight}` : 'none',
        transition: 'opacity 120ms'
      }}>
        <Slider
          label={useStateBrackets ? "Manual rate (override, currently disabled)" : "State income tax rate (manual)"}
          value={stateRate}
          onChange={onStateRateChange}
          min={0} max={0.13} step={0.005}
          fmt={(v) => fmtPct(v)}
        />
        {stateCode && (
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="use-manual-rate"
              checked={!useStateBrackets}
              onChange={(e) => onUseBracketsChange(!e.target.checked)}
              style={{ accentColor: T.ink }}
            />
            <label htmlFor="use-manual-rate" className="text-[11px]" style={{ color: T.muted, cursor: 'pointer' }}>
              Use my manual rate instead of {STATE_TAX_DATA[stateCode]?.name}'s brackets
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

function NumInput({ label, value, onChange, prefix = '$', step = 1000 }) {
  const [focused, setFocused] = useState(false);
  // Show raw number while editing, comma-formatted when not focused
  const display = focused ? String(value) : Number(value).toLocaleString();
  return (
    <div className="mb-4">
      <label className="text-[12px] uppercase tracking-[0.12em] block mb-1.5" style={{ color: T.muted, fontFamily: BODY_FONT, fontWeight: 500 }}>
        {label}
      </label>
      <div className="flex items-center" style={{ borderBottom: `1px solid ${T.rule}` }}>
        <span className="pr-1.5 text-[14px]" style={{ color: T.muted, fontFamily: MONO_FONT }}>{prefix}</span>
        <input
          type="text"
          inputMode="numeric"
          value={display}
          onChange={(e) => {
            const cleaned = e.target.value.replace(/[^0-9.-]/g, '');
            onChange(parseFloat(cleaned) || 0);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="bg-transparent outline-none w-full py-1.5 text-[16px]"
          style={{ color: T.ink, fontFamily: MONO_FONT, fontWeight: 500 }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// NET WORTH VIEW
// ============================================================================
// Pure snapshot of "today". No projections, no scenario toggles. The foundation
// view: where you stand right now, broken down clearly.
function NetWorthView({ inp, sims }) {
  // Use the year-0 snapshot (the "today" entry that comes before year 0 in trajectory)
  const today = sims.mod.trajectory.find(t => t.isSnapshot) || sims.mod.trajectory[0];

  if (!today) {
    return <div style={{ color: T.muted, padding: 20 }}>No data available.</div>;
  }

  const totalAssets = today.totalAssets;
  const totalLiabilities = today.totalLiabilities;
  const netWorth = today.netWorth;
  const ratio = totalAssets > 0 ? totalLiabilities / totalAssets : 0;

  // Asset breakdown
  const totalProperty = today.homeValue;
  const totalVehicle = today.vehicleValue || 0;
  const totalOther = today.otherAssets || 0;
  const total529 = today.c529 || 0;

  const assetBreakdown = [
    { label: 'Cash', value: today.cash, color: T.muted, opacity: 0.4 },
    { label: 'Money market', value: today.mm, color: T.muted, opacity: 0.55 },
    { label: 'CDs', value: today.cd, color: T.muted, opacity: 0.7 },
    { label: 'Brokerage', value: today.brokerage, color: T.emerald, opacity: 0.85 },
    { label: '401(k) / IRA', value: today.k401, color: T.emerald, opacity: 1 },
    { label: '529 plans', value: total529, color: T.amber, opacity: 1 },
    { label: 'Real estate', value: totalProperty, color: T.navy, opacity: 1 },
    { label: 'Vehicles', value: totalVehicle, color: T.navy, opacity: 0.6 },
    { label: 'Other assets', value: totalOther, color: T.muted, opacity: 0.85 }
  ].filter(a => a.value > 0).sort((a, b) => b.value - a.value);

  // Liability breakdown
  const liabilityBreakdown = [
    { label: 'Mortgages', value: today.mortgage, color: T.oxblood, opacity: 1 },
    { label: 'Vehicle loans', value: today.vehicleLoans, color: T.oxblood, opacity: 0.75 },
    { label: 'Other debts', value: today.otherDebts, color: T.oxblood, opacity: 0.5 }
  ].filter(l => l.value > 0).sort((a, b) => b.value - a.value);

  // Liquid vs illiquid breakdown
  const liquid = today.liquid;
  const liquidShare = totalAssets > 0 ? (liquid / totalAssets) : 0;

  // Debt-to-asset ratio classification
  const debtRatioStatus = ratio < 0.20 ? { label: 'Low leverage', color: T.emerald, soft: T.emeraldSoft, hint: 'Strong, conservative position' }
                        : ratio < 0.50 ? { label: 'Moderate leverage', color: T.ink, soft: T.surfaceWarm, hint: 'Typical for working-age households' }
                        : ratio < 0.80 ? { label: 'High leverage', color: T.amber, soft: T.amberSoft, hint: 'Worth a closer look at debt paydown' }
                        : { label: 'Critical leverage', color: T.oxblood, soft: T.oxbloodSoft, hint: 'Liabilities are a major portion of assets' };

  return (
    <>
      {/* Headline net worth */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Verdict card */}
        <div className="col-span-12 lg:col-span-7 p-5 sm:p-8" style={{
          background: T.surface, border: `1px solid ${T.rule}`,
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 240, height: 240,
            background: `radial-gradient(circle at top right, ${debtRatioStatus.soft}, transparent 70%)`,
            opacity: 0.6, pointerEvents: 'none'
          }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Scale size={14} style={{ color: debtRatioStatus.color }} strokeWidth={1.5} />
              <span className="text-[11px] uppercase tracking-[0.2em]" style={{ color: debtRatioStatus.color, fontWeight: 600 }}>
                Where you stand today, age {inp.currentAge}
              </span>
            </div>
            <p style={{
              fontFamily: BODY_FONT, fontWeight: 400,
              fontSize: 'clamp(20px, 2.6vw, 30px)',
              lineHeight: 1.2, letterSpacing: '-0.01em',
              color: T.ink, marginBottom: 24
            }}>
              Your net worth is <strong style={{ color: netWorth >= 0 ? T.ink : T.oxblood, fontWeight: 700 }}>{fmt$Full(netWorth)}</strong>
              {netWorth >= 0 && totalLiabilities > 0 && (
                <>{` — `}<em style={{ fontStyle: 'italic' }}>{fmt$Full(totalAssets)} in assets minus {fmt$Full(totalLiabilities)} in liabilities</em>.</>
              )}
              {netWorth >= 0 && totalLiabilities === 0 && (
                <>, fully unencumbered with <em style={{ fontStyle: 'italic' }}>no liabilities</em>.</>
              )}
              {netWorth < 0 && (
                <> — liabilities currently exceed assets.</>
              )}
            </p>
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 sm:pt-6" style={{ borderTop: `1px solid ${T.ruleLight}` }}>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: T.muted, fontWeight: 500 }}>Total assets</div>
                <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 500, fontSize: 'clamp(16px, 4vw, 26px)', color: T.emerald, fontVariantNumeric: 'tabular-nums', wordBreak: 'break-word' }}>
                  {fmt$Full(totalAssets)}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: T.muted, fontWeight: 500 }}>Total liabilities</div>
                <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 500, fontSize: 'clamp(16px, 4vw, 26px)', color: T.oxblood, fontVariantNumeric: 'tabular-nums', wordBreak: 'break-word' }}>
                  {fmt$Full(totalLiabilities)}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: T.muted, fontWeight: 500 }}>Net worth</div>
                <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 600, fontSize: 'clamp(18px, 5vw, 30px)', color: netWorth >= 0 ? T.ink : T.oxblood, fontVariantNumeric: 'tabular-nums', wordBreak: 'break-word' }}>
                  {fmt$Full(netWorth)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Health card */}
        <div className="col-span-12 lg:col-span-5 p-5 sm:p-8" style={{ background: T.ink, color: T.surface }}>
          <div className="flex items-center gap-2 mb-4" style={{ color: '#A8C9B5' }}>
            <Activity size={13} strokeWidth={1.5} />
            <span className="text-[11px] uppercase tracking-[0.2em]" style={{ fontWeight: 600 }}>
              Position health check
            </span>
          </div>
          <p className="text-[14px] mb-5" style={{ color: '#C9C4BB', lineHeight: 1.55 }}>
            Quick read of leverage, liquidity, and concentration.
          </p>
          <HealthRow
            label="Debt-to-asset ratio"
            value={fmtPct(ratio)}
            sub={debtRatioStatus.label}
            highlight
          />
          <HealthRow
            label="Liquid share of assets"
            value={fmtPct(liquidShare)}
            sub={liquidShare < 0.10 ? 'Mostly illiquid' : liquidShare < 0.30 ? 'Reasonable mix' : 'Heavy liquid position'}
          />
          <HealthRow
            label="Real estate concentration"
            value={totalAssets > 0 ? fmtPct(totalProperty / totalAssets) : '—'}
            sub={totalProperty / totalAssets > 0.50 ? 'Concentrated in property' : 'Diversified'}
          />
          <HealthRow
            label="Retirement-tax-advantaged"
            value={totalAssets > 0 ? fmtPct((today.k401 + total529) / totalAssets) : '—'}
            sub="401(k) + 529, percent of assets"
          />
        </div>
      </div>

      {/* Asset & liability breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10">
        {/* Assets */}
        <div className="p-5 sm:p-7" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
          <div className="flex items-baseline justify-between mb-4">
            <h3 style={{ fontFamily: DISPLAY_FONT, fontSize: 18, fontWeight: 500, color: T.emerald, letterSpacing: '-0.01em' }}>
              Assets
            </h3>
            <span style={{ fontFamily: MONO_FONT, fontSize: 13, fontWeight: 600, color: T.emerald, fontVariantNumeric: 'tabular-nums' }}>
              {fmt$Full(totalAssets)}
            </span>
          </div>
          {assetBreakdown.length === 0 ? (
            <p className="text-[12px]" style={{ color: T.muted, fontStyle: 'italic' }}>No assets entered.</p>
          ) : (
            <div className="space-y-3">
              {assetBreakdown.map(a => {
                const pct = totalAssets > 0 ? (a.value / totalAssets) * 100 : 0;
                return (
                  <div key={a.label}>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[12px]" style={{ color: T.ink, fontWeight: 500 }}>{a.label}</span>
                      <span className="text-[12px]" style={{ color: T.inkSoft, fontFamily: MONO_FONT, fontVariantNumeric: 'tabular-nums' }}>
                        {fmt$Full(a.value)} <span style={{ color: T.muted, fontSize: 10 }}>({pct.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div style={{ height: 6, background: T.ruleLight }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: a.color, opacity: a.opacity, transition: 'width 200ms' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Liabilities */}
        <div className="p-5 sm:p-7" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
          <div className="flex items-baseline justify-between mb-4">
            <h3 style={{ fontFamily: DISPLAY_FONT, fontSize: 18, fontWeight: 500, color: T.oxblood, letterSpacing: '-0.01em' }}>
              Liabilities
            </h3>
            <span style={{ fontFamily: MONO_FONT, fontSize: 13, fontWeight: 600, color: T.oxblood, fontVariantNumeric: 'tabular-nums' }}>
              {fmt$Full(totalLiabilities)}
            </span>
          </div>
          {liabilityBreakdown.length === 0 ? (
            <p className="text-[12px]" style={{ color: T.muted, fontStyle: 'italic' }}>No liabilities — fully unencumbered.</p>
          ) : (
            <div className="space-y-3">
              {liabilityBreakdown.map(l => {
                const pct = totalLiabilities > 0 ? (l.value / totalLiabilities) * 100 : 0;
                return (
                  <div key={l.label}>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[12px]" style={{ color: T.ink, fontWeight: 500 }}>{l.label}</span>
                      <span className="text-[12px]" style={{ color: T.inkSoft, fontFamily: MONO_FONT, fontVariantNumeric: 'tabular-nums' }}>
                        {fmt$Full(l.value)} <span style={{ color: T.muted, fontSize: 10 }}>({pct.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div style={{ height: 6, background: T.ruleLight }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: l.color, opacity: l.opacity, transition: 'width 200ms' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state placeholder when no liabilities — keeps layout balanced */}
          {liabilityBreakdown.length === 0 && (
            <div style={{ marginTop: 12, padding: 16, background: T.emeraldSoft, border: `1px solid ${T.emerald}30` }}>
              <Check size={14} strokeWidth={2} style={{ color: T.emerald, marginBottom: 8 }} />
              <div style={{ fontSize: 12, color: T.emerald, fontWeight: 600 }}>Debt-free position</div>
              <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 4 }}>
                You report no mortgages, vehicle loans, or other debts. Net worth equals total assets.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Snapshot composition strip */}
      <div className="mb-10 p-5 sm:p-7" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
        <h3 style={{ fontFamily: DISPLAY_FONT, fontSize: 18, fontWeight: 500, color: T.ink, letterSpacing: '-0.01em', marginBottom: 4 }}>
          Composition at a glance
        </h3>
        <p className="text-[12px] mb-5" style={{ color: T.muted, fontStyle: 'italic' }}>
          How your wealth is distributed across categories.
        </p>

        {/* Stacked bar — assets vs liabilities scaled to a common axis */}
        <div className="mb-2 flex items-baseline justify-between">
          <span style={{ fontSize: 10, color: T.emerald, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Assets</span>
          <span style={{ fontFamily: MONO_FONT, fontSize: 11, color: T.ink }}>{fmt$Full(totalAssets)}</span>
        </div>
        <div className="flex mb-5" style={{ height: 14, background: T.ruleLight, overflow: 'hidden' }}>
          {assetBreakdown.map((a, i) => {
            const pct = totalAssets > 0 ? (a.value / totalAssets) * 100 : 0;
            if (pct < 0.5) return null;
            return (
              <div
                key={i}
                title={`${a.label}: ${fmt$Full(a.value)} (${pct.toFixed(1)}%)`}
                style={{ width: `${pct}%`, background: a.color, opacity: a.opacity, transition: 'width 200ms' }}
              />
            );
          })}
        </div>

        <div className="mb-2 flex items-baseline justify-between">
          <span style={{ fontSize: 10, color: T.oxblood, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Liabilities</span>
          <span style={{ fontFamily: MONO_FONT, fontSize: 11, color: T.ink }}>{fmt$Full(totalLiabilities)}</span>
        </div>
        <div className="flex" style={{ height: 14, background: T.ruleLight, overflow: 'hidden' }}>
          {/* Liabilities scaled to same width as assets bar so the visual proportion holds */}
          {totalAssets > 0 ? liabilityBreakdown.map((l, i) => {
            const pct = (l.value / totalAssets) * 100;
            if (pct < 0.5) return null;
            return (
              <div
                key={i}
                title={`${l.label}: ${fmt$Full(l.value)}`}
                style={{ width: `${pct}%`, background: l.color, opacity: l.opacity, transition: 'width 200ms' }}
              />
            );
          }) : null}
        </div>
        <p className="text-[10px] mt-2" style={{ color: T.muted, fontStyle: 'italic' }}>
          Liabilities bar is scaled to the same axis as assets — width visually represents debt as a fraction of total assets ({fmtPct(ratio)}).
        </p>
      </div>
    </>
  );
}

// Rendered after inputs panel on Net Worth tab. Acts as a transition from
// "you've seen and edited your current state" to "here's what we do with it."
function WhatThisPowers({ onSwitchView }) {
  const cardStyle = {
    background: T.surface, border: `1px solid ${T.rule}`,
    cursor: 'pointer', textAlign: 'left', padding: 14,
    transition: 'all 200ms', position: 'relative'
  };
  return (
    <div className="mt-10 mb-4 p-5 sm:p-7" style={{ background: T.surfaceWarm, border: `1px solid ${T.ruleLight}` }}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={12} strokeWidth={1.75} style={{ color: T.muted }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: T.muted, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          What this powers
        </span>
      </div>
      <p className="text-[14px] mb-3" style={{ color: T.inkSoft, lineHeight: 1.55 }}>
        Your current position is the foundation for the other two views. Click either to dive in.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => onSwitchView('retirement')}
          className="hover:opacity-90 hover:shadow-sm"
          style={{ ...cardStyle, borderTop: `3px solid ${T.emerald}` }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <TrendingUp size={12} strokeWidth={1.75} style={{ color: T.emerald }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: T.ink, letterSpacing: '0.05em' }}>RETIREMENT READINESS</span>
            </div>
            <span style={{ fontSize: 10, color: T.emerald, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Open →
            </span>
          </div>
          <div className="text-[12px]" style={{ color: T.inkSoft, lineHeight: 1.5 }}>
            Projects this position forward through life expectancy. Tells you when you can comfortably retire under three risk scenarios.
          </div>
        </button>
        <button
          onClick={() => onSwitchView('runway')}
          className="hover:opacity-90 hover:shadow-sm"
          style={{ ...cardStyle, borderTop: `3px solid ${T.amber}` }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Wind size={12} strokeWidth={1.75} style={{ color: T.amber }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: T.ink, letterSpacing: '0.05em' }}>JOB LOSS RUNWAY</span>
            </div>
            <span style={{ fontSize: 10, color: T.amber, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Open →
            </span>
          </div>
          <div className="text-[12px]" style={{ color: T.inkSoft, lineHeight: 1.5 }}>
            Stress-tests this position against a sudden income loss. Tells you how many months you could afford to be out of work.
          </div>
        </button>
      </div>
    </div>
  );
}

function HealthRow({ label, value, sub, highlight }) {
  return (
    <div className="flex items-center justify-between py-2.5" style={{
      borderBottom: highlight ? 'none' : '1px solid rgba(255,255,255,0.08)'
    }}>
      <div className="min-w-0">
        <div className="text-[11px] sm:text-[12px]" style={{ color: highlight ? '#9DD9B5' : '#C9C4BB', fontWeight: 500 }}>
          {label}
        </div>
        <div className="text-[10px] mt-0.5" style={{ color: '#7A7568' }}>{sub}</div>
      </div>
      <div style={{
        fontFamily: DISPLAY_FONT, fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 500,
        color: highlight ? '#9DD9B5' : T.surface,
        fontVariantNumeric: 'tabular-nums', flexShrink: 0
      }}>
        {value}
      </div>
    </div>
  );
}

// ============================================================================
// JOB LOSS RUNWAY VIEW
// ============================================================================
function RunwayView({ inp, setInp, set, runways, auditMonth, setAuditMonth, runwayAuditScenario, setRunwayAuditScenario }) {
  const [scenario, setScenario] = useState('typical');
  const sim = runways[scenario];

  const monthsLasted = sim.monthsLasted;
  const survives = sim.survivesAtCap;
  const runwayLabel = survives
    ? '60+ months'
    : monthsLasted === 0
      ? 'Less than 1 month'
      : `${monthsLasted} ${monthsLasted === 1 ? 'month' : 'months'}`;
  const runwayLabelLong = survives
    ? 'Money lasts at least 5 years (simulation cap)'
    : `Liquid accounts exhausted after ${monthsLasted} ${monthsLasted === 1 ? 'month' : 'months'}`;

  // Tone for the headline based on months lasted
  const tone = survives ? 'good' : monthsLasted >= 12 ? 'good' : monthsLasted >= 6 ? 'med' : 'bad';
  const toneColor = tone === 'good' ? T.emerald : tone === 'med' ? T.amber : T.oxblood;
  const toneSoft = tone === 'good' ? T.emeraldSoft : tone === 'med' ? T.amberSoft : T.oxbloodSoft;

  return (
    <>
      {/* Headline runway result */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Verdict card */}
        <div className="col-span-12 lg:col-span-7 p-5 sm:p-8" style={{
          background: T.surface, border: `1px solid ${T.rule}`,
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 240, height: 240,
            background: `radial-gradient(circle at top right, ${toneSoft}, transparent 70%)`,
            opacity: 0.6, pointerEvents: 'none'
          }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Wind size={14} style={{ color: toneColor }} strokeWidth={1.5} />
              <span className="text-[11px] uppercase tracking-[0.2em]" style={{ color: toneColor, fontWeight: 600 }}>
                Income loss stress test, {scenario === 'typical' ? 'realistic' : scenario} scenario
              </span>
            </div>
            <p style={{
              fontFamily: BODY_FONT, fontWeight: 400,
              fontSize: 'clamp(20px, 2.6vw, 30px)',
              lineHeight: 1.2, letterSpacing: '-0.01em',
              color: T.ink, marginBottom: 24
            }}>
              {survives ? (
                <>If you lost your job today, your liquid accounts would last <strong style={{ color: toneColor, fontWeight: 700 }}>5+ years</strong> under the {scenario} scenario.</>
              ) : monthsLasted === 0 ? (
                <>Your monthly expenses already exceed available income and savings can't cover the gap, even for a single month.</>
              ) : (
                <>If you lost your job today, your liquid accounts would last <strong style={{ color: toneColor, fontWeight: 700 }}>{runwayLabel}</strong> before you'd need to tap your 401(k) at penalty.</>
              )}
            </p>
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 sm:pt-6" style={{ borderTop: `1px solid ${T.ruleLight}` }}>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: T.muted, fontWeight: 500 }}>Starting liquid</div>
                <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 500, fontSize: 'clamp(16px, 4vw, 26px)', color: T.ink, fontVariantNumeric: 'tabular-nums', wordBreak: 'break-word' }}>
                  {fmt$Full(sim.startingLiquid)}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: T.muted, fontWeight: 500 }}>Monthly burn (mo. 1)</div>
                <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 500, fontSize: 'clamp(16px, 4vw, 26px)', color: sim.monthlyBurn >= 0 ? T.emerald : T.oxblood, fontVariantNumeric: 'tabular-nums', wordBreak: 'break-word' }}>
                  {sim.monthlyBurn >= 0 ? '+' : ''}{fmt$Full(sim.monthlyBurn)}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: T.muted, fontWeight: 500 }}>Runway</div>
                <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 500, fontSize: 'clamp(16px, 4vw, 26px)', color: toneColor, fontVariantNumeric: 'tabular-nums' }}>
                  {runwayLabel}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3-scenario comparison */}
        <div className="col-span-12 lg:col-span-5 p-5 sm:p-8" style={{ background: T.ink, color: T.surface }}>
          <div className="flex items-center gap-2 mb-4" style={{ color: '#A8C9B5' }}>
            <Activity size={13} strokeWidth={1.5} />
            <span className="text-[11px] uppercase tracking-[0.2em]" style={{ fontWeight: 600 }}>
              Three-scenario comparison
            </span>
          </div>
          <p className="text-[13px] mb-4" style={{ color: '#C9C4BB', lineHeight: 1.55 }}>
            Click a scenario to make it active above.
          </p>
          <RunwayScenarioRow
            label="Bare bones"
            sub="Just your liquid savings, no benefits"
            sim={runways.bare}
            active={scenario === 'bare'}
            onClick={() => setScenario('bare')}
          />
          <RunwayScenarioRow
            label="Realistic"
            sub="Severance + UI + 15% expense cut"
            sim={runways.typical}
            active={scenario === 'typical'}
            onClick={() => setScenario('typical')}
            highlight
          />
          <RunwayScenarioRow
            label="Best case"
            sub="All of realistic + 25% expense cut"
            sim={runways.best}
            active={scenario === 'best'}
            onClick={() => setScenario('best')}
          />
        </div>
      </div>

      {/* Auto-stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-4 sm:gap-6 mb-8 pb-6" style={{ borderBottom: `1px solid ${T.ruleLight}` }}>
        <AutoStat
          label="Severance available"
          value={fmt$Full(sim.inputs.severanceTotal)}
          help="Total severance dollars, paid over selected duration"
        />
        <AutoStat
          label="UI weekly benefit"
          value={fmt$Full((inp.uiWeeklyBenefit || 0))}
          help={`Maximum ${inp.uiMaxWeeks || 26} weeks; varies by state`}
        />
        <AutoStat
          label="Gig / freelance monthly"
          value={fmt$Full(sim.inputs.gigMonthly)}
          help={
            (sim.inputs.gigMonthly || 0) > 0
              ? `Active months ${sim.inputs.gigStart}–${sim.inputs.gigEnd}`
              : 'Set above to model freelance / contract income while job hunting'
          }
          tone={(sim.inputs.gigMonthly || 0) > 0 ? 'good' : undefined}
        />
        <AutoStat
          label="COBRA / health monthly"
          value={fmt$Full(sim.inputs.cobraMonthly)}
          help="Replaces employer-provided coverage"
        />
        <AutoStat
          label="Adjusted living expenses"
          value={fmt$Full(sim.inputs.livingMonthlyAdjusted * 12)}
          help={`Living expenses with ${Math.round(sim.inputs.expenseCut * 100)}% reduction applied`}
        />
        <AutoStat
          label="Partner income (if applicable)"
          value={fmt$Full(sim.inputs.partnerIncomeMonthly * 12)}
          help={inp.married ? 'Partner income continues during job loss' : 'Single-income household'}
        />
        <AutoStat
          label="401(k) penalty zone"
          value={fmt$Full(sim.k401Available)}
          help="Available but only at 10% penalty + ordinary income tax before 59½"
          tone={inp.currentAge >= 59.5 ? undefined : 'bad'}
        />
      </div>

      {/* Month-by-month chart */}
      <div className="mb-8 p-4 sm:p-6" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
        <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
          <h3 style={{ fontFamily: DISPLAY_FONT, fontSize: 18, fontWeight: 500, color: T.ink, letterSpacing: '-0.01em' }}>
            Month-by-month liquid runway
          </h3>
          <div className="text-[12px]" style={{ color: T.muted, fontStyle: 'italic' }}>
            {scenario === 'typical' ? 'Realistic' : scenario === 'best' ? 'Best case' : 'Bare bones'} scenario
          </div>
        </div>
        <RunwayChart sim={sim} onMonthClick={(m) => { setAuditMonth({ month: m }); setRunwayAuditScenario(scenario); }} />
        <p className="text-[11px] mt-3" style={{ color: T.muted, lineHeight: 1.5 }}>
          The bars show liquid accounts (cash, money market, CDs, brokerage) over time. The chart caps at 60 months. <strong style={{ color: T.ink }}>Click any month</strong> to see income, expenses, and account flows for that month.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="mb-10 p-4" style={{ background: T.surfaceWarm, border: `1px solid ${T.ruleLight}` }}>
        <div className="text-[11px]" style={{ color: T.inkSoft, lineHeight: 1.6 }}>
          <strong style={{ color: T.ink }}>About this stress test.</strong> The runway calculation assumes a hard, immediate income loss. It draws from liquid accounts in priority order: cash, money market, CDs, then taxable brokerage. The 401(k) is treated as a "penalty zone" since accessing it before age 59½ triggers a 10% penalty plus ordinary income tax. Mortgage, rent, property tax, vehicle loans, debt minimums, and active education costs continue regardless of employment. Severance and unemployment benefits are modeled as taxable but the simulation uses gross amounts for simplicity. For a more accurate picture, account for taxes on UI benefits (federal + most states) and consult an employment attorney about negotiable severance terms.
        </div>
      </div>
    </>
  );
}

function RunwayScenarioRow({ label, sub, sim, active, onClick, highlight }) {
  const lasted = sim.survivesAtCap ? '60+ mo' : sim.monthsLasted === 0 ? '<1 mo' : `${sim.monthsLasted} mo`;
  const tone = sim.survivesAtCap || sim.monthsLasted >= 12 ? '#9DD9B5' : sim.monthsLasted >= 6 ? '#F2C97A' : '#F2A4A4';
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between py-2.5 transition-opacity hover:opacity-90"
      style={{
        borderBottom: highlight ? 'none' : '1px solid rgba(255,255,255,0.08)',
        background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
        margin: active ? '0 -8px' : '0',
        padding: active ? '10px 8px' : '10px 0',
        cursor: 'pointer'
      }}
    >
      <div className="text-left">
        <div className="text-[12px] flex items-center gap-2" style={{ color: highlight || active ? '#9DD9B5' : '#C9C4BB', fontWeight: 600 }}>
          {label}
          {active && <span className="text-[8px] px-1.5 py-0.5" style={{ background: '#9DD9B5', color: T.ink, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Active</span>}
        </div>
        <div className="text-[10px] mt-0.5" style={{ color: '#7A7568' }}>{sub}</div>
      </div>
      <div style={{
        fontFamily: DISPLAY_FONT, fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 500,
        color: tone, fontVariantNumeric: 'tabular-nums', flexShrink: 0
      }}>
        {lasted}
      </div>
    </button>
  );
}

function RunwayChart({ sim, onMonthClick }) {
  const trajectory = sim.trajectory;
  if (!trajectory.length) return <div style={{ color: T.muted, padding: 20 }}>No data.</div>;

  // Build chart data
  const data = trajectory.map(t => ({
    month: t.month,
    cash: t.cash,
    mm: t.mm,
    cd: t.cd,
    brokerage: t.brokerage,
    ui: t.ui * 4.33,        // weekly to monthly approximation, but already monthly here so just use as-is
    severance: t.severance,
    expenses: t.expenses
  }));

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
          onClick={(state) => {
            // Recharts passes the activeLabel (the X-axis value) when a chart is clicked
            if (state && state.activeLabel != null && onMonthClick) {
              const m = parseInt(state.activeLabel, 10);
              if (!isNaN(m)) onMonthClick(m);
            }
          }}
          style={{ cursor: onMonthClick ? 'pointer' : 'default' }}
        >
          <CartesianGrid stroke={T.ruleLight} strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: T.muted, fontSize: 10, fontFamily: MONO_FONT }}
            tickLine={false}
            axisLine={{ stroke: T.rule }}
            label={{ value: 'Months from job loss', position: 'insideBottom', offset: -4, fill: T.muted, fontSize: 10 }}
          />
          <YAxis
            tick={{ fill: T.muted, fontSize: 10, fontFamily: MONO_FONT }}
            tickLine={false}
            axisLine={{ stroke: T.rule }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<RunwayTooltip />} />
          <Area type="monotone" dataKey="cash" stackId="liquid" stroke="none" fill={T.muted} fillOpacity={0.4} />
          <Area type="monotone" dataKey="mm" stackId="liquid" stroke="none" fill={T.muted} fillOpacity={0.6} />
          <Area type="monotone" dataKey="cd" stackId="liquid" stroke="none" fill={T.muted} fillOpacity={0.8} />
          <Area type="monotone" dataKey="brokerage" stackId="liquid" stroke={T.emerald} fill={T.emerald} fillOpacity={0.85} />
          {sim.monthsLasted > 0 && sim.monthsLasted < 60 && (
            <ReferenceLine x={sim.monthsLasted} stroke={T.oxblood} strokeWidth={2} strokeDasharray="4 2"
              label={{ value: 'Liquid exhausted', fill: T.oxblood, fontSize: 10, fontWeight: 600, position: 'top' }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function RunwayTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  const total = d.cash + d.mm + d.cd + d.brokerage;
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.rule}`, padding: '8px 12px',
      fontFamily: BODY_FONT, fontSize: 11
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: T.ink }}>Month {label}</div>
      <div style={{ color: T.inkSoft }}>Cash: <span style={{ fontFamily: MONO_FONT }}>{fmt$Full(d.cash)}</span></div>
      <div style={{ color: T.inkSoft }}>MM: <span style={{ fontFamily: MONO_FONT }}>{fmt$Full(d.mm)}</span></div>
      <div style={{ color: T.inkSoft }}>CDs: <span style={{ fontFamily: MONO_FONT }}>{fmt$Full(d.cd)}</span></div>
      <div style={{ color: T.inkSoft }}>Brokerage: <span style={{ fontFamily: MONO_FONT }}>{fmt$Full(d.brokerage)}</span></div>
      <div style={{ marginTop: 6, paddingTop: 6, borderTop: `1px solid ${T.ruleLight}`, fontWeight: 600, color: T.ink }}>
        Total liquid: <span style={{ fontFamily: MONO_FONT }}>{fmt$Full(total)}</span>
      </div>
      <div style={{ marginTop: 4, color: T.muted, fontSize: 10 }}>
        Monthly expenses: {fmt$Full(d.expenses)}
      </div>
    </div>
  );
}

function ViewTab({ active, onClick, icon: Icon, label, sublabel }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-left transition-colors"
      style={{
        background: active ? T.surface : 'transparent',
        border: `1px solid ${active ? T.rule : 'transparent'}`,
        borderBottom: active ? `2px solid ${T.surface}` : '2px solid transparent',
        marginBottom: active ? -2 : 0,
        cursor: 'pointer'
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} strokeWidth={1.75} style={{ color: active ? T.ink : T.muted, flexShrink: 0 }} />
        <span style={{
          fontFamily: BODY_FONT,
          fontWeight: active ? 700 : 600,
          fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: active ? T.ink : T.muted
        }}>
          {label}
        </span>
      </div>
      <div className="text-[11px] sm:text-[12px]" style={{ color: active ? T.inkSoft : T.muted, fontWeight: 400 }}>
        {sublabel}
      </div>
    </button>
  );
}

function Toggle({ label, value, onChange, help }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="text-[12px] uppercase tracking-[0.12em]" style={{ color: T.muted, fontFamily: BODY_FONT, fontWeight: 500 }}>
          {label}
        </div>
        {help && <p className="text-[11px] mt-1" style={{ color: T.muted, fontStyle: 'italic' }}>{help}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative shrink-0"
        style={{
          width: 44, height: 24, borderRadius: 999,
          background: value ? T.emerald : T.rule,
          transition: 'background 200ms'
        }}
      >
        <span style={{
          position: 'absolute', top: 2, left: value ? 22 : 2,
          width: 20, height: 20, borderRadius: 999, background: T.surface,
          transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }} />
      </button>
    </div>
  );
}

// Compact inline checkbox for use inside cards (smaller than Toggle, fits next to sliders)
function Checkbox({ label, value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex items-center gap-2 transition-opacity hover:opacity-80"
      style={{ background: 'transparent', cursor: 'pointer' }}
    >
      <span style={{
        width: 16, height: 16,
        border: `1.5px solid ${value ? T.emerald : T.rule}`,
        background: value ? T.emerald : T.surface,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 150ms'
      }}>
        {value && <Check size={11} style={{ color: T.surface }} strokeWidth={3} />}
      </span>
      <span className="text-[12px]" style={{ color: T.ink, fontFamily: BODY_FONT, fontWeight: 500 }}>
        {label}
      </span>
    </button>
  );
}

function Section({ icon: Icon, title, children, defaultOpen = false, badge = null }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderTop: `1px solid ${T.rule}` }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 transition-opacity hover:opacity-70"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Icon size={16} style={{ color: T.emerald, flexShrink: 0 }} strokeWidth={1.5} />
          <span style={{
            fontFamily: BODY_FONT, fontWeight: 500,
            fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase',
            color: T.ink
          }}>
            {title}
          </span>
          {badge && (
            <span style={{
              fontFamily: BODY_FONT, fontWeight: 600,
              fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: badge.color, background: badge.bg,
              padding: '2px 6px', flexShrink: 0,
              border: `1px solid ${badge.color}30`
            }}>
              {badge.label}
            </span>
          )}
        </div>
        <ChevronDown size={16} style={{
          color: T.muted, transition: 'transform 200ms',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          flexShrink: 0
        }} strokeWidth={1.5} />
      </button>
      {open && <div className="pb-6 pt-1">{children}</div>}
    </div>
  );
}

// Wrapper for a labeled cluster of input sections.
// Shows a header (title + subtext) above a stack of sections.
function SectionGroup({ title, subtext, accentColor, children }) {
  return (
    <div className="mb-8">
      <div className="mb-2 pb-3" style={{ borderBottom: `2px solid ${accentColor}` }}>
        <div className="flex items-baseline gap-2 mb-1">
          <span style={{
            width: 8, height: 8, borderRadius: 999,
            background: accentColor, display: 'inline-block', flexShrink: 0,
            transform: 'translateY(-1px)'
          }} />
          <span style={{
            fontFamily: BODY_FONT, fontWeight: 700,
            fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase',
            color: accentColor
          }}>
            {title}
          </span>
        </div>
        <div style={{ fontSize: 12, color: T.inkSoft, lineHeight: 1.5, paddingLeft: 14 }}>
          {subtext}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

// ============================================================================
// MAIN
// ============================================================================
export default function RetirementReadiness() {
  // --- Default inputs (sensible mid-career household) ---
  const [inp, setInp] = useState({
    schemaVersion: CURRENT_SCHEMA_VERSION,
    // About you
    currentAge: 45,
    retirementAge: 65,
    lifeExpectancy: 92,
    married: true,
    stateRate: 0.05,
    stateCode: '',          // empty = use manual stateRate; otherwise run state brackets
    useStateBrackets: false,

    // Income
    income: 175000,
    earningYears: 20,
    salaryGrowth: 0.03,

    // Savings allocation: how surplus income is split across accounts.
    // These are percentages (0-1) that should sum to 1.0.
    // 401(k) honors the IRS contribution cap regardless; if that fills up, the overflow
    // is redistributed proportionally across the remaining buckets.
    savingsAllocation: {
      cash: 0.05,
      mm: 0.10,
      cd: 0.05,
      brokerage: 0.30,
      k401: 0.50
    },

    // Family, each child has a list of school entries (preschool, K-12, college, grad, etc.)
    // Each entry has: type, parentAgeAtStart, durationYears, annualCost, c529Balance.
    // 529 balances are per-child (since they're typically beneficiary-specific) but the return rate
    // is a single shared assumption. 529 funds for a child are pooled across that child's entries
    // (e.g. saving for preschool can pay for college if the K-12 stuff comes out of pocket).
    children: [
      {
        id: 'k1',
        name: 'First child',
        c529Balance: 40000,
        entries: [
          { id: 'k1-college', type: 'college', parentAgeAtStart: 50, durationYears: 4, annualCost: 40000 }
        ]
      },
      {
        id: 'k2',
        name: 'Second child',
        c529Balance: 20000,
        entries: [
          { id: 'k2-college', type: 'college', parentAgeAtStart: 52, durationYears: 4, annualCost: 40000 }
        ]
      }
    ],
    c529Rate: 0.06,

    // Savings
    cash: 25000,
    moneyMarket: 50000, mmRate: 0.045,
    cd: 30000, cdRate: 0.045,
    brokerage: 150000, brokerageRate: 0.07,
    k401: 450000, k401Rate: 0.07,

    // Properties (homes, rentals, vacations), array of independent properties
    properties: [
      {
        id: 'p1',
        label: 'Primary residence',
        type: 'primary',          // 'primary' | 'rental' | 'vacation'
        value: 650000,
        mortgage: 280000,
        mortgageRate: 0.0625,
        mortgageMonthly: 2400,
        appreciation: 0.03,
        propertyTaxRate: 0.0125,
        netRentalIncome: 0,
        rentalGrowth: 0.025,
        rentalStartAge: null,  // null = starts immediately
        rentalEndAge: null     // null = never ends
      }
    ],
    useHomeEquity: false,

    // Retirement income
    socialSecurity: 36000,
    ssStartAge: 67,
    altIncome: 0,
    altStartAge: 65,
    altEndAge: 80,

    // Inheritances, array of expected lump sums at specified ages
    inheritances: [],

    // Vehicles, depreciate ~15%/yr, may carry a loan
    vehicles: [
      { id: 'v1', label: 'Primary vehicle', value: 28000, depreciation: 0.15, loanBalance: 14000, loanRate: 0.069, loanMonthly: 425 }
    ],

    // Other debts, credit cards, student loans, personal loans, etc.
    debts: [
      { id: 'd1', label: 'Credit card', balance: 4500, rate: 0.219, monthlyPayment: 250 }
    ],

    // Other assets, collectibles, business equity, jewelry, crypto, etc.
    otherAssets: [],

    // Expenses
    annualExpenses: 90000,
    hcPreMedicare: HC_PRE_MEDICARE_DEFAULT,
    hcMedicare: HC_MEDICARE_DEFAULT,

    // Rent, for users who rent rather than own (or rent during a phase of life)
    monthlyRent: 0,
    rentInflation: 0.04,
    rentStartAge: null,
    rentEndAge: null,

    // Job loss stress test inputs
    // These only apply to the Job Loss Runway view, not the retirement projection.
    severanceAmount: 0,             // total severance dollars
    severancePaymentMonths: 1,      // 1 = lump sum, 6 = stretched over 6 months
    uiWeeklyBenefit: 500,           // unemployment insurance, weekly benefit (US average ~$385, NJ ~$830 max)
    uiMaxWeeks: 26,                 // most states cap at 26 weeks
    cobraMonthly: 1800,             // COBRA / ACA marketplace replacement health insurance, family
    expenseReductionPct: 0.15,      // typical 15% trim of discretionary spending
    partnerKeepsIncome: true,       // if married, partner's income continues
    partnerIncomePortion: 0.40,     // 40% of household income comes from partner (default)
    // Gig / freelance income earned WHILE unemployed, e.g. consulting, rideshare,
    // delivery, contract work. Distinct from `altIncome` (which represents
    // pre-existing passive income like pensions or royalties).
    gigMonthlyIncome: 0,            // how much you'd earn per month from gig work
    gigStartMonth: 1,               // realistic: takes a couple months to ramp up; 1 = day one
    gigEndMonth: 24,                // when gig income tapers off (or you find permanent work)

    // Assumptions
    inflation: 0.03
  });

  const set = (k) => (v) => setInp(prev => ({ ...prev, [k]: v }));

  // Property list handlers
  const updateProperty = (id, newProp) => {
    setInp(prev => ({
      ...prev,
      properties: prev.properties.map(p => p.id === id ? newProp : p)
    }));
  };
  const addProperty = () => {
    const newId = 'p' + Date.now();
    setInp(prev => ({
      ...prev,
      properties: [...prev.properties, {
        id: newId,
        label: 'Investment property',
        type: 'rental',
        value: 400000,
        mortgage: 250000,
        mortgageRate: 0.07,
        mortgageMonthly: 1700,
        appreciation: 0.03,
        propertyTaxRate: 0.018,
        netRentalIncome: 24000,
        rentalGrowth: 0.025,
        rentalStartAge: null,
        rentalEndAge: null
      }]
    }));
  };
  const removeProperty = (id) => {
    setInp(prev => ({
      ...prev,
      properties: prev.properties.filter(p => p.id !== id)
    }));
  };

  // Inheritance list handlers
  const updateInheritance = (id, newInh) => {
    setInp(prev => ({
      ...prev,
      inheritances: prev.inheritances.map(i => i.id === id ? newInh : i)
    }));
  };
  const addInheritance = () => {
    const newId = 'i' + Date.now();
    setInp(prev => ({
      ...prev,
      inheritances: [...prev.inheritances, {
        id: newId,
        label: 'Inheritance',
        amount: 250000,
        age: Math.min(75, prev.currentAge + 15)
      }]
    }));
  };
  const removeInheritance = (id) => {
    setInp(prev => ({
      ...prev,
      inheritances: prev.inheritances.filter(i => i.id !== id)
    }));
  };

  // Child + education entry handlers
  const updateChild = (id, next) => {
    setInp(prev => ({
      ...prev,
      children: prev.children.map(c => c.id === id ? next : c)
    }));
  };
  const addChild = () => {
    const newId = 'k' + Date.now();
    setInp(prev => ({
      ...prev,
      children: [
        ...(prev.children || []),
        {
          id: newId,
          name: `Child ${(prev.children || []).length + 1}`,
          c529Balance: 0,
          entries: []
        }
      ]
    }));
  };
  const removeChild = (id) => {
    setInp(prev => ({
      ...prev,
      children: prev.children.filter(c => c.id !== id)
    }));
  };
  const addEducationEntry = (childId, type = 'college') => {
    const newId = 'e' + Date.now();
    const defaults = {
      preschool:    { durationYears: 2, annualCost: 18000, parentAgeOffset: -2 },  // start 2 yrs before now
      elementary:   { durationYears: 5, annualCost: 25000, parentAgeOffset: 0 },
      middle:       { durationYears: 3, annualCost: 30000, parentAgeOffset: 5 },
      high:         { durationYears: 4, annualCost: 35000, parentAgeOffset: 8 },
      college:      { durationYears: 4, annualCost: 40000, parentAgeOffset: 12 },
      grad:         { durationYears: 2, annualCost: 50000, parentAgeOffset: 16 },
      other:        { durationYears: 1, annualCost: 10000, parentAgeOffset: 0 }
    };
    const d = defaults[type] || defaults.other;
    setInp(prev => ({
      ...prev,
      children: prev.children.map(c => c.id !== childId ? c : {
        ...c,
        entries: [
          ...(c.entries || []),
          {
            id: newId,
            type,
            parentAgeAtStart: prev.currentAge + d.parentAgeOffset,
            durationYears: d.durationYears,
            annualCost: d.annualCost
          }
        ]
      })
    }));
  };
  const updateEducationEntry = (childId, entryId, next) => {
    setInp(prev => ({
      ...prev,
      children: prev.children.map(c => c.id !== childId ? c : {
        ...c,
        entries: c.entries.map(e => e.id === entryId ? next : e)
      })
    }));
  };
  const removeEducationEntry = (childId, entryId) => {
    setInp(prev => ({
      ...prev,
      children: prev.children.map(c => c.id !== childId ? c : {
        ...c,
        entries: c.entries.filter(e => e.id !== entryId)
      })
    }));
  };

  // Vehicle list handlers
  const updateVehicle = (id, next) => {
    setInp(prev => ({ ...prev, vehicles: prev.vehicles.map(v => v.id === id ? next : v) }));
  };
  const addVehicle = () => {
    const newId = 'v' + Date.now();
    setInp(prev => ({
      ...prev,
      vehicles: [...prev.vehicles, {
        id: newId, label: `Vehicle ${prev.vehicles.length + 1}`,
        value: 25000, depreciation: 0.15,
        loanBalance: 0, loanRate: 0.07, loanMonthly: 0
      }]
    }));
  };
  const removeVehicle = (id) => {
    setInp(prev => ({ ...prev, vehicles: prev.vehicles.filter(v => v.id !== id) }));
  };

  // Debt list handlers
  const updateDebt = (id, next) => {
    setInp(prev => ({ ...prev, debts: prev.debts.map(d => d.id === id ? next : d) }));
  };
  const addDebt = () => {
    const newId = 'd' + Date.now();
    setInp(prev => ({
      ...prev,
      debts: [...prev.debts, {
        id: newId, label: 'New debt',
        balance: 5000, rate: 0.20, monthlyPayment: 200
      }]
    }));
  };
  const removeDebt = (id) => {
    setInp(prev => ({ ...prev, debts: prev.debts.filter(d => d.id !== id) }));
  };

  // Other asset handlers
  const updateOtherAsset = (id, next) => {
    setInp(prev => ({ ...prev, otherAssets: prev.otherAssets.map(a => a.id === id ? next : a) }));
  };
  const addOtherAsset = () => {
    const newId = 'a' + Date.now();
    setInp(prev => ({
      ...prev,
      otherAssets: [...prev.otherAssets, {
        id: newId, label: 'New asset', value: 10000, growthRate: 0.0
      }]
    }));
  };
  const removeOtherAsset = (id) => {
    setInp(prev => ({ ...prev, otherAssets: prev.otherAssets.filter(a => a.id !== id) }));
  };

  // ============= SCENARIO MANAGEMENT =============
  // Saved scenarios live in localStorage as { [name]: inputs }.
  // We also support download-to-file (JSON) and upload-from-file for portability.
  const STORAGE_KEY = 'retirementReadiness:scenarios';
  const ACTIVE_KEY = 'retirementReadiness:active';

  const [savedScenarios, setSavedScenarios] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });
  const [activeName, setActiveName] = useState(() => {
    try { return localStorage.getItem(ACTIVE_KEY) || ''; } catch { return ''; }
  });
  const [scenarioPanelOpen, setScenarioPanelOpen] = useState(false);
  const [saveAsName, setSaveAsName] = useState('');
  const [toast, setToast] = useState(null);
  // Migration notice, shown as a dismissable banner after loading a scenario from older/newer schema
  const [migrationNotice, setMigrationNotice] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const persistScenarios = (next) => {
    setSavedScenarios(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };
  const persistActive = (name) => {
    setActiveName(name);
    try { localStorage.setItem(ACTIVE_KEY, name); } catch {}
  };

  const saveScenarioAs = (name) => {
    const trimmed = (name || '').trim();
    if (!trimmed) { showToast('Please enter a name'); return; }
    const next = { ...savedScenarios, [trimmed]: { ...inp, _savedAt: new Date().toISOString() } };
    persistScenarios(next);
    persistActive(trimmed);
    showToast(`Saved "${trimmed}"`);
    setSaveAsName('');
  };
  const overwriteActive = () => {
    if (!activeName) { showToast('No active scenario, use Save As'); return; }
    const next = { ...savedScenarios, [activeName]: { ...inp, _savedAt: new Date().toISOString() } };
    persistScenarios(next);
    showToast(`Updated "${activeName}"`);
  };
  const loadScenario = (name) => {
    const s = savedScenarios[name];
    if (!s) return;
    const { _savedAt, ...rest } = s;
    const result = migrateScenario(rest);
    setInp(result.inputs);
    persistActive(name);
    if (result.warnings.length > 0) {
      setMigrationNotice({
        scenarioName: name,
        fromVersion: result.fromVersion,
        toVersion: result.toVersion,
        fromFuture: result.fromFuture,
        warnings: result.warnings
      });
    } else if (result.fromVersion < result.toVersion && result.fromVersion > 0) {
      // Migrated cleanly with no user-visible changes, short toast suffices
      showToast(`Loaded & upgraded "${name}" (schema v${result.fromVersion}→v${result.toVersion})`);
    } else {
      showToast(`Loaded "${name}"`);
    }
  };
  const deleteScenario = (name) => {
    if (!confirm(`Delete scenario "${name}"? This cannot be undone.`)) return;
    const next = { ...savedScenarios };
    delete next[name];
    persistScenarios(next);
    if (activeName === name) persistActive('');
    showToast(`Deleted "${name}"`);
  };
  const duplicateScenario = (name) => {
    const s = savedScenarios[name];
    if (!s) return;
    let copyName = `${name} (copy)`;
    let i = 2;
    while (savedScenarios[copyName]) { copyName = `${name} (copy ${i++})`; }
    const next = { ...savedScenarios, [copyName]: { ...s, _savedAt: new Date().toISOString() } };
    persistScenarios(next);
    showToast(`Duplicated as "${copyName}"`);
  };

  // Download current inputs as a JSON file
  const downloadScenario = () => {
    const name = activeName || saveAsName.trim() || 'scenario';
    const payload = {
      _format: 'retirement-readiness/v2',
      _name: name,
      _exportedAt: new Date().toISOString(),
      _appVersion: APP_VERSION,
      _schemaVersion: CURRENT_SCHEMA_VERSION,
      inputs: { ...inp, schemaVersion: CURRENT_SCHEMA_VERSION }
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/[^a-z0-9-_ ]/gi, '_')}.retirement.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded "${a.download}"`);
  };

  // Download current inputs as a multi-sheet Excel workbook
  const downloadAsExcel = () => {
    const name = activeName || saveAsName.trim() || 'scenario';
    try {
      const filename = exportToExcel(inp, sims, name);
      showToast(`Downloaded "${filename}"`);
    } catch (err) {
      console.error('Excel export failed:', err);
      showToast('Excel export failed');
    }
  };

  // Open the print view in a new tab
  const openPrintableSummary = () => {
    const name = activeName || saveAsName.trim() || 'scenario';
    try {
      openPrintView(inp, sims, name);
    } catch (err) {
      console.error('Print view failed:', err);
      showToast('Could not open print view');
    }
  };

  // Excel upload handler
  const excelInputRef = React.useRef(null);
  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const inputs = await importFromExcel(file);
      const name = file.name.replace(/\.(retirement\.)?xlsx$/i, '');
      // Excel imports always run through the migration framework too — they may
      // be missing newer fields, but the migration adds defaults safely.
      const result = migrateScenario({ ...inputs, schemaVersion: 1 });
      setInp(result.inputs);
      const next = { ...savedScenarios, [name]: { ...result.inputs, _savedAt: new Date().toISOString() } };
      persistScenarios(next);
      persistActive(name);
      if (result.warnings.length > 0) {
        setMigrationNotice({
          scenarioName: name,
          fromVersion: result.fromVersion,
          toVersion: result.toVersion,
          fromFuture: false,
          warnings: ['Imported from Excel. ' + result.warnings.join(' ')]
        });
      } else {
        showToast(`Imported "${name}" from Excel`);
      }
    } catch (err) {
      console.error('Excel import failed:', err);
      showToast('Could not parse Excel file');
    }
    e.target.value = '';
  };

  // Upload a JSON file and load (or also save to library)
  const fileInputRef = React.useRef(null);
  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        const inputs = parsed.inputs || parsed;
        const name = parsed._name || file.name.replace(/\.(retirement\.)?json$/i, '');
        if (!inputs || typeof inputs !== 'object' || !('currentAge' in inputs)) {
          showToast('Invalid scenario file');
          return;
        }
        // Run migrations to bring the file's schema up to current
        const result = migrateScenario(inputs);
        setInp(result.inputs);
        const next = { ...savedScenarios, [name]: { ...result.inputs, _savedAt: new Date().toISOString() } };
        persistScenarios(next);
        persistActive(name);
        if (result.warnings.length > 0 || result.fromFuture) {
          setMigrationNotice({
            scenarioName: name,
            fromVersion: result.fromVersion,
            toVersion: result.toVersion,
            fromFuture: result.fromFuture,
            warnings: result.warnings
          });
        } else if (result.fromVersion < result.toVersion && result.fromVersion > 0) {
          showToast(`Loaded & upgraded "${name}" (schema v${result.fromVersion}→v${result.toVersion})`);
        } else {
          showToast(`Loaded "${name}"`);
        }
      } catch (err) {
        showToast('Failed to parse file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const startFresh = () => {
    if (!confirm('Reset all inputs to defaults? Unsaved changes will be lost.')) return;
    location.reload();
  };

  // Run all three retirement scenarios
  const sims = useMemo(() => ({
    cons: simulate(inp, 'cons'),
    mod: simulate(inp, 'mod'),
    opt: simulate(inp, 'opt')
  }), [inp]);

  // Run all three job-loss-runway scenarios
  const runways = useMemo(() => ({
    bare: simulateRunway(inp, 'bare'),
    typical: simulateRunway(inp, 'typical'),
    best: simulateRunway(inp, 'best')
  }), [inp]);

  // Top-level tab: which view is active?
  const [activeView, setActiveView] = useState('networth'); // 'networth' | 'retirement' | 'runway'

  // Scroll to top whenever the user switches tabs. Without this, switching
  // from a long-scrolled page on one tab dumps you mid-page on the next.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeView]);

  const safeAge = useMemo(() => findSafeRetirementAge(inp), [inp]);
  const moderateAge = useMemo(() => findModerateRetirementAge(inp), [inp]);

  // Net worth inspector, pick any age along the timeline to see the breakdown
  const [inspectorAge, setInspectorAge] = useState(null);
  const [inspectorScenario, setInspectorScenario] = useState('mod'); // 'cons' | 'mod' | 'opt'

  // Year-audit drawer: when set, shows a detailed breakdown for that year
  const [auditAge, setAuditAge] = useState(null);
  const [auditScenario, setAuditScenario] = useState('mod');
  const auditYear = useMemo(() => {
    if (auditAge === null) return null;
    return sims[auditScenario].trajectory.find(t => !t.isSnapshot && t.age === auditAge);
  }, [auditAge, auditScenario, sims]);

  // Month-audit drawer for the Job Loss Runway view
  const [runwayAuditMonth, setRunwayAuditMonth] = useState(null); // { month: number } | null
  const [runwayAuditScenario, setRunwayAuditScenario] = useState('typical');
  const effectiveInspectorAge = inspectorAge ?? inp.currentAge;
  const inspectorSim = sims[inspectorScenario];
  const nwSnapshot = useMemo(() => {
    return inspectorSim.trajectory.find(t => t.age === effectiveInspectorAge) || inspectorSim.trajectory[0];
  }, [inspectorSim, effectiveInspectorAge]);

  // Counterfactual: same scenario without inheritances (so user can see what each is worth in real terms)
  const simNoInheritance = useMemo(() => {
    if (!inp.inheritances || inp.inheritances.length === 0) return null;
    return simulate({ ...inp, inheritances: [] }, inspectorScenario);
  }, [inp, inspectorScenario]);
  const nwSnapshotNoInh = useMemo(() => {
    if (!simNoInheritance) return null;
    return simNoInheritance.trajectory.find(t => t.age === effectiveInspectorAge) || simNoInheritance.trajectory[0];
  }, [simNoInheritance, effectiveInspectorAge]);
  // Sum of inheritances received up to (and including) the inspector age
  const inheritanceReceivedToDate = useMemo(() => {
    if (!inp.inheritances) return 0;
    return inp.inheritances
      .filter(i => i.age <= effectiveInspectorAge && i.age >= inp.currentAge)
      .reduce((s, i) => s + i.amount, 0);
  }, [inp.inheritances, effectiveInspectorAge, inp.currentAge]);
  // Reset inspector to current age when life expectancy or current age changes out from under it
  useEffect(() => {
    if (inspectorAge !== null && (inspectorAge < inp.currentAge || inspectorAge > inp.lifeExpectancy)) {
      setInspectorAge(null);
    }
  }, [inp.currentAge, inp.lifeExpectancy, inspectorAge]);

  // Build chart data: net worth over time across scenarios.
  // The snapshot entry (year -1, current age before any simulation runs) is excluded
  //, the chart shows year-by-year evolution starting from year 0.
  const chartData = useMemo(() => {
    const consT = sims.cons.trajectory.filter(t => !t.isSnapshot);
    const modT = sims.mod.trajectory.filter(t => !t.isSnapshot);
    const optT = sims.opt.trajectory.filter(t => !t.isSnapshot);
    const len = Math.max(consT.length, modT.length, optT.length);
    const data = [];
    for (let i = 0; i < len; i++) {
      const c = consT[i];
      const m = modT[i];
      const o = optT[i];
      const age = (c || m || o).age;
      data.push({
        age,
        cons: c ? c.liquid : null,
        mod: m ? m.liquid : null,
        opt: o ? o.liquid : null,
        consNet: c ? c.netWorth : null,
        modNet: m ? m.netWorth : null,
      });
    }
    return data;
  }, [sims]);

  // Risk assessment for current retirement age
  const risk = useMemo(() => {
    const consOK = sims.cons.runOutAge === null;
    const modOK = sims.mod.runOutAge === null;
    const optOK = sims.opt.runOutAge === null;
    if (consOK) return { level: 'low', label: 'Low risk', color: T.emerald, soft: T.emeraldSoft, icon: ShieldCheck };
    if (modOK) return { level: 'med', label: 'Moderate risk', color: T.amber, soft: T.amberSoft, icon: Activity };
    if (optOK) return { level: 'high', label: 'High risk', color: T.oxblood, soft: T.oxbloodSoft, icon: AlertTriangle };
    return { level: 'critical', label: 'Critical risk', color: T.oxblood, soft: T.oxbloodSoft, icon: AlertTriangle };
  }, [sims]);

  // Auto-calc snapshot at retirement
  const atRetMod = sims.mod.trajectory.find(t => !t.isSnapshot && t.age === inp.retirementAge);
  const firstRetYear = sims.mod.trajectory.find(t => !t.isSnapshot && t.age >= inp.retirementAge);
  const estTaxesAtRet = firstRetYear ? firstRetYear.taxes : 0;
  const estPropTaxAtRet = firstRetYear ? firstRetYear.propertyTax : 0;
  const estHealthcareAtRet = firstRetYear ? firstRetYear.healthcare : 0;
  const estRentalAtRet = firstRetYear ? firstRetYear.rentalIncome : 0;
  const hasRentals = inp.properties.some(p => p.type === 'rental' && p.netRentalIncome > 0);

  // 529 coverage: total cost across all children's school entries vs total 529 contributions used
  const collegeYearsTraj = sims.mod.trajectory.filter(t => t.from529 > 0 || (t.college > 0 && t.from529 === 0));
  const total529Used = sims.mod.trajectory.reduce((s, t) => s + (t.from529 || 0), 0);
  const totalCollegeNeeded = (inp.children || []).reduce((s, c) => {
    const childCost = (c.entries || []).reduce(
      (cs, e) => cs + (e.annualCost || 0) * (e.durationYears || 0), 0
    );
    return s + childCost;
  }, 0);
  const coveragePct = totalCollegeNeeded > 0 ? Math.min(100, Math.round((total529Used / totalCollegeNeeded) * 100)) : null;
  const totalChildren = (inp.children || []).length;
  const totalEducationEntries = (inp.children || []).reduce((s, c) => s + (c.entries || []).length, 0);

  // Inheritance summary
  const upcomingInheritances = inp.inheritances
    .filter(i => i.age >= inp.currentAge && i.amount > 0)
    .sort((a, b) => a.age - b.age);
  const totalInheritances = upcomingInheritances.reduce((s, i) => s + i.amount, 0);
  const nextInheritance = upcomingInheritances[0];

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.ink }}>
      <link rel="stylesheet" href={FONTS_HREF} />
      <style>{`
        body { margin: 0; }
        input[type=range] { -webkit-appearance: none; background: transparent; }
        input[type=range]::-webkit-slider-runnable-track {
          background: ${T.rule}; height: 2px; border-radius: 2px;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 16px; height: 16px; border-radius: 999px;
          background: ${T.surface}; border: 2px solid ${T.emerald};
          margin-top: -7px; cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }
        input[type=range]::-moz-range-track {
          background: ${T.rule}; height: 2px; border-radius: 2px;
        }
        input[type=range]::-moz-range-thumb {
          width: 16px; height: 16px; border-radius: 999px;
          background: ${T.surface}; border: 2px solid ${T.emerald};
          cursor: pointer;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10" style={{ fontFamily: BODY_FONT }}>

        {/* ============= MASTHEAD ============= */}
        <header className="mb-8 sm:mb-10" style={{ borderBottom: `1px solid ${T.rule}`, paddingBottom: 20 }}>
          <div className="flex items-start justify-between gap-3 sm:gap-6 flex-wrap sm:flex-nowrap">
            <div className="flex-1 min-w-0 order-1">
              <div className="flex items-center gap-2 mb-2" style={{ color: T.muted }}>
                <Sparkles size={12} strokeWidth={1.5} />
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em]" style={{ fontWeight: 500 }}>
                  Personal Wealth Projection
                </span>
              </div>
              <h1 style={{
                fontFamily: DISPLAY_FONT, fontWeight: 500,
                fontSize: 'clamp(28px, 7vw, 56px)',
                letterSpacing: '-0.02em', lineHeight: 1.0, color: T.ink,
                fontVariationSettings: '"opsz" 144'
              }}>
                {activeView === 'networth' && (<>Net <em style={{ fontStyle: 'italic', fontWeight: 400 }}>Worth</em></>)}
                {activeView === 'retirement' && (<>Retirement <em style={{ fontStyle: 'italic', fontWeight: 400 }}>Readiness</em></>)}
                {activeView === 'runway' && (<>Job Loss <em style={{ fontStyle: 'italic', fontWeight: 400 }}>Runway</em></>)}
              </h1>
              <p className="mt-3 max-w-2xl text-[13px] sm:text-[14px] leading-relaxed" style={{ color: T.inkSoft }}>
                {activeView === 'networth' && (
                  <>
                    A snapshot of where you stand today. Add up everything you own (cash, retirement accounts, properties, vehicles, 529 plans, other assets), subtract everything you owe (mortgages, loans, credit cards), and see your net worth with a clean breakdown of how it's composed. <strong style={{ color: T.ink }}>This is the foundation</strong> — your inputs here power the Retirement Readiness and Job Loss Runway calculators.
                  </>
                )}
                {activeView === 'retirement' && (
                  <>
                    Will your money last through retirement? This calculator projects your finances year-by-year from today through your full life expectancy, simulating income, expenses, taxes, account growth, mortgage paydown, education costs, and inheritances along the way. <strong style={{ color: T.ink }}>Three risk scenarios</strong> (conservative, moderate, optimistic) run in parallel so you see your full range of outcomes — not just one rosy projection.
                  </>
                )}
                {activeView === 'runway' && (
                  <>
                    If you lost your job today, how long could you afford to be out of work? This calculator stress-tests your liquid accounts month-by-month, accounting for severance, unemployment benefits, COBRA, gig income, partner income, and reduced expenses. <strong style={{ color: T.ink }}>Three scenarios</strong> (bare bones, realistic, best case) tell you the difference between having no plan and having a thoughtful one.
                  </>
                )}
              </p>
            </div>

            {/* Scenario chip + actions */}
            <div className="shrink-0 flex flex-col items-end gap-2 order-0 sm:order-2 ml-auto">
              <button
                onClick={() => setScenarioPanelOpen(true)}
                className="flex items-center gap-2 px-3 py-2 transition-opacity hover:opacity-70"
                style={{ background: T.ink, color: T.surface, border: `1px solid ${T.ink}` }}
              >
                <FolderOpen size={13} strokeWidth={1.5} />
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em]" style={{ fontWeight: 600 }}>
                  Scenarios
                </span>
                {Object.keys(savedScenarios).length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5" style={{
                    background: T.surface, color: T.ink, fontFamily: MONO_FONT,
                    fontWeight: 600
                  }}>
                    {Object.keys(savedScenarios).length}
                  </span>
                )}
              </button>
              {activeName && (
                <div className="text-[11px] flex items-center gap-1.5" style={{ color: T.muted, fontFamily: BODY_FONT }}>
                  <span>Editing</span>
                  <span style={{ color: T.ink, fontWeight: 600 }}>{activeName}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ============= VIEW TABS ============= */}
        <div className="mb-8" style={{ borderBottom: `2px solid ${T.rule}` }}>
          <div className="flex items-stretch gap-0 -mb-px">
            <ViewTab
              active={activeView === 'networth'}
              onClick={() => setActiveView('networth')}
              icon={Scale}
              label="Net Worth"
              sublabel="Where you stand today"
            />
            <ViewTab
              active={activeView === 'retirement'}
              onClick={() => setActiveView('retirement')}
              icon={TrendingUp}
              label="Retirement Readiness"
              sublabel="When can you retire comfortably?"
            />
            <ViewTab
              active={activeView === 'runway'}
              onClick={() => setActiveView('runway')}
              icon={Wind}
              label="Job Loss Runway"
              sublabel="How long could you last out of work?"
            />
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            background: T.ink, color: T.surface, padding: '10px 18px',
            fontFamily: BODY_FONT, fontSize: 13, fontWeight: 500,
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)', zIndex: 100,
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <Check size={14} style={{ color: '#9DD9B5' }} strokeWidth={2} />
            {toast}
          </div>
        )}

        {/* Migration notice, appears when scenario was loaded from a different schema */}
        {migrationNotice && (
          <MigrationNotice
            notice={migrationNotice}
            onDismiss={() => setMigrationNotice(null)}
          />
        )}

        {/* Scenario panel modal */}
        {scenarioPanelOpen && (
          <ScenarioPanel
            onClose={() => setScenarioPanelOpen(false)}
            scenarios={savedScenarios}
            activeName={activeName}
            saveAsName={saveAsName}
            setSaveAsName={setSaveAsName}
            saveScenarioAs={saveScenarioAs}
            overwriteActive={overwriteActive}
            loadScenario={loadScenario}
            deleteScenario={deleteScenario}
            duplicateScenario={duplicateScenario}
            downloadScenario={downloadScenario}
            handleUpload={handleUpload}
            fileInputRef={fileInputRef}
            downloadAsExcel={downloadAsExcel}
            handleExcelUpload={handleExcelUpload}
            excelInputRef={excelInputRef}
            openPrintableSummary={openPrintableSummary}
            startFresh={startFresh}
          />
        )}

        {/* Year audit drawer (Retirement view) */}
        {auditAge !== null && auditYear && (
          <YearAuditDrawer
            year={auditYear}
            scenario={auditScenario}
            onClose={() => setAuditAge(null)}
            onScenarioChange={setAuditScenario}
            currentAge={inp.currentAge}
            retirementAge={inp.retirementAge}
          />
        )}

        {/* Month audit drawer (Job Loss Runway view) */}
        {runwayAuditMonth !== null && (
          <MonthAuditDrawer
            month={runwayAuditMonth}
            scenario={runwayAuditScenario}
            onClose={() => setRunwayAuditMonth(null)}
            onScenarioChange={setRunwayAuditScenario}
            runways={runways}
            inp={inp}
          />
        )}

        {activeView === 'retirement' && (<>

        {/* ============= HEADLINE RESULT ============= */}
        <div className="grid grid-cols-12 gap-6 mb-10">
          {/* Verdict card */}
          <div className="col-span-12 lg:col-span-7 p-5 sm:p-8" style={{
            background: T.surface, border: `1px solid ${T.rule}`,
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', top: 0, right: 0, width: 240, height: 240,
              background: `radial-gradient(circle at top right, ${risk.soft}, transparent 70%)`,
              opacity: 0.6, pointerEvents: 'none'
            }} />

            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <risk.icon size={14} style={{ color: risk.color }} strokeWidth={1.5} />
                <span className="text-[11px] uppercase tracking-[0.2em]" style={{ color: risk.color, fontWeight: 600 }}>
                  {risk.label} at age {inp.retirementAge}
                </span>
              </div>

              <p style={{
                fontFamily: DISPLAY_FONT, fontWeight: 400,
                fontSize: 'clamp(22px, 2.6vw, 32px)',
                lineHeight: 1.2, letterSpacing: '-0.01em',
                color: T.ink, marginBottom: 24
              }}>
                {sims.mod.runOutAge === null ? (
                  <>If you retire at <strong style={{ fontWeight: 600 }}>{inp.retirementAge}</strong>, your portfolio is projected to last through age <strong style={{ fontWeight: 600 }}>{inp.lifeExpectancy}</strong> under moderate assumptions.</>
                ) : (
                  <>If you retire at <strong style={{ fontWeight: 600 }}>{inp.retirementAge}</strong>, your liquid savings run out at age <strong style={{ fontWeight: 600, color: risk.color }}>{sims.mod.runOutAge}</strong>, <em style={{ fontStyle: 'italic' }}>{sims.mod.runOutAge - inp.retirementAge} years into retirement</em>.</>
                )}
              </p>

              <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 sm:pt-6" style={{ borderTop: `1px solid ${T.ruleLight}` }}>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: T.muted, fontWeight: 500 }}>Portfolio at retirement</div>
                  <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 500, fontSize: 'clamp(16px, 4vw, 26px)', color: T.ink, fontVariantNumeric: 'tabular-nums', wordBreak: 'break-word' }}>
                    {fmt$Full(sims.mod.portfolioAtRetirement)}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: T.muted, fontWeight: 500 }}>Net worth at retirement</div>
                  <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 500, fontSize: 'clamp(16px, 4vw, 26px)', color: T.ink, fontVariantNumeric: 'tabular-nums', wordBreak: 'break-word' }}>
                    {fmt$Full(sims.mod.netWorthAtRetirement)}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: T.muted, fontWeight: 500 }}>Years to retirement</div>
                  <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 500, fontSize: 'clamp(16px, 4vw, 26px)', color: T.ink, fontVariantNumeric: 'tabular-nums' }}>
                    {Math.max(0, inp.retirementAge - inp.currentAge)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation card */}
          <div className="col-span-12 lg:col-span-5 p-5 sm:p-8" style={{
            background: T.ink, color: T.surface
          }}>
            <div className="flex items-center gap-2 mb-4" style={{ color: '#A8C9B5' }}>
              <Wind size={14} strokeWidth={1.5} />
              <span className="text-[11px] uppercase tracking-[0.2em]" style={{ fontWeight: 600 }}>
                Our recommendation
              </span>
            </div>

            <p style={{
              fontFamily: DISPLAY_FONT, fontWeight: 400,
              fontSize: 22, lineHeight: 1.3, marginBottom: 24
            }}>
              {safeAge !== null ? (
                <>To retire with <strong style={{ fontWeight: 600, color: '#9DD9B5' }}>low risk</strong> of running out of money, target retirement at age <strong style={{ fontWeight: 600 }}>{safeAge}</strong>.</>
              ) : (
                <>Even working until 75, the conservative scenario doesn't survive, consider increasing savings, reducing expenses, or both.</>
              )}
            </p>

            <div className="space-y-3">
              <RecRow label="Aggressive (high risk)" age={moderateAge && moderateAge < (safeAge || 999) ? moderateAge : '—'} hint="Money lasts under moderate assumptions" />
              <RecRow label="Balanced (moderate risk)" age={moderateAge !== null ? moderateAge : '—'} hint="Comfortable margin in normal markets" />
              <RecRow label="Conservative (low risk)" age={safeAge !== null ? safeAge : '—'} hint="Survives bad markets & longer life" highlight />
            </div>
          </div>
        </div>

        {/* ============= NET WORTH INSPECTOR ============= */}
        <NetWorthInspector
          snapshot={nwSnapshot}
          snapshotNoInh={nwSnapshotNoInh}
          inheritanceReceived={inheritanceReceivedToDate}
          inspectorAge={effectiveInspectorAge}
          minAge={inp.currentAge}
          maxAge={inp.lifeExpectancy}
          onAgeChange={setInspectorAge}
          isCurrent={effectiveInspectorAge === inp.currentAge}
          scenario={inspectorScenario}
          onScenarioChange={setInspectorScenario}
          onAuditYear={() => { setAuditAge(effectiveInspectorAge); setAuditScenario(inspectorScenario); }}
        />

        {/* ============= SCENARIO TRIPTYCH ============= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <ScenarioCard scenario="cons" sim={sims.cons} label="Conservative" subtitle="Returns −2pts · expenses +12% · life +3 yrs" inp={inp} />
          <ScenarioCard scenario="mod" sim={sims.mod} label="Moderate" subtitle="Your inputs as-is" inp={inp} />
          <ScenarioCard scenario="opt" sim={sims.opt} label="Optimistic" subtitle="Returns +1.5pts · expenses −8% · life −2 yrs" inp={inp} />
        </div>

        {/* ============= CHART ============= */}
        <div className="mb-10 p-4 sm:p-6" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
          <div className="flex items-baseline justify-between mb-2 flex-wrap gap-3">
            <h2 style={{ fontFamily: DISPLAY_FONT, fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>
              Liquid portfolio over time
            </h2>
            <div className="flex items-center gap-4 text-[11px]" style={{ color: T.muted }}>
              <LegendDot color={T.oxblood} label="Conservative" />
              <LegendDot color={T.ink} label="Moderate" />
              <LegendDot color={T.emerald} label="Optimistic" />
            </div>
          </div>
          <p className="text-[11px] mb-4" style={{ color: T.muted, fontStyle: 'italic' }}>
            Click any year on the chart to see a detailed breakdown of income, expenses, and account flows for that year.
          </p>
          <div style={{ width: '100%', height: 360 }}>
            <ResponsiveContainer>
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 24, left: 0, bottom: 12 }}
                onClick={(state) => {
                  if (state && state.activeLabel != null) {
                    setAuditAge(parseInt(state.activeLabel, 10));
                    setAuditScenario(inspectorScenario);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <defs>
                  <linearGradient id="modGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={T.ink} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={T.ink} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={T.ruleLight} strokeDasharray="0" vertical={false} />
                <XAxis
                  dataKey="age"
                  tick={{ fill: T.muted, fontSize: 11, fontFamily: 'Geist Mono' }}
                  axisLine={{ stroke: T.rule }}
                  tickLine={false}
                  label={{ value: 'Age', position: 'insideBottom', offset: -5, fill: T.muted, fontSize: 11 }}
                />
                <YAxis
                  tick={{ fill: T.muted, fontSize: 11, fontFamily: 'Geist Mono' }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v) => fmt$(v)}
                  width={60}
                />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine x={inp.retirementAge} stroke={T.muted} strokeDasharray="3 3" label={{ value: 'Retirement', fill: T.muted, fontSize: 10, position: 'top' }} />
                {inp.inheritances.filter(i => i.age >= inp.currentAge && i.age <= inp.lifeExpectancy).map(i => (
                  <ReferenceLine
                    key={i.id}
                    x={i.age}
                    stroke={T.amber}
                    strokeDasharray="2 4"
                    strokeWidth={1}
                    label={{ value: '🎁', fill: T.amber, fontSize: 12, position: 'top' }}
                  />
                ))}
                <ReferenceLine y={0} stroke={T.ink} strokeWidth={1} />
                <Area type="monotone" dataKey="mod" stroke="none" fill="url(#modGrad)" />
                <Line type="monotone" dataKey="cons" stroke={T.oxblood} strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="mod" stroke={T.ink} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="opt" stroke={T.emerald} strokeWidth={1.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Auto-calc strip */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-4 sm:gap-6 mt-6 pt-6" style={{ borderTop: `1px solid ${T.ruleLight}` }}>
            <AutoStat label="Income taxes, yr 1 retired" value={fmt$Full(estTaxesAtRet)} help="Federal + state + LTCG. Payroll tax stops at retirement. Rental income is taxed as ordinary." />
            <AutoStat label="Property tax, yr 1 retired" value={fmt$Full(estPropTaxAtRet)} help="Total across all properties. Scales with home value, never goes away." />
            <AutoStat label="Healthcare, yr 1 retired" value={fmt$Full(estHealthcareAtRet)} />
            {hasRentals && (
              <AutoStat label="Rental income, yr 1 retired" value={fmt$Full(estRentalAtRet)} tone="good" help="Net rental income across all rental properties." />
            )}
            {upcomingInheritances.length > 0 && (
              <AutoStat
                label={upcomingInheritances.length === 1 ? 'Inheritance incoming' : `Inheritances (${upcomingInheritances.length})`}
                value={fmt$Full(totalInheritances)}
                tone="good"
                help={nextInheritance ? `Next: ${fmt$Full(nextInheritance.amount)} at age ${nextInheritance.age} (${nextInheritance.age - inp.currentAge} yrs away)` : ''}
              />
            )}
            <AutoStat label="Liquid runway"
              value={sims.mod.runOutAge === null ? `≥${inp.lifeExpectancy - inp.retirementAge} yrs` : `${sims.mod.runOutAge - inp.retirementAge} yrs`}
              tone={sims.mod.runOutAge === null ? 'good' : 'bad'}
            />
            <AutoStat label="Home equity tap age"
              value={inp.useHomeEquity ? (sims.mod.homeEquityTapAge || 'Not needed') : 'Disabled'}
            />
            {totalChildren > 0 && (
              <AutoStat
                label="529 covers college"
                value={coveragePct !== null ? `${coveragePct}%` : '—'}
                tone={coveragePct >= 90 ? 'good' : coveragePct >= 50 ? undefined : 'bad'}
              />
            )}
          </div>
        </div>

        </>)}

        {activeView === 'networth' && (
          <NetWorthView
            inp={inp}
            sims={sims}
          />
        )}

        {activeView === 'runway' && (
          <RunwayView
            inp={inp}
            setInp={setInp}
            set={set}
            runways={runways}
            auditMonth={runwayAuditMonth}
            setAuditMonth={setRunwayAuditMonth}
            runwayAuditScenario={runwayAuditScenario}
            setRunwayAuditScenario={setRunwayAuditScenario}
          />
        )}

        {/* ============= INPUTS ============= */}
        <div style={{ borderTop: `1px solid ${T.rule}`, marginTop: 8, paddingTop: 24 }}>
          <div className="flex items-baseline justify-between mb-5 flex-wrap gap-2">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: T.muted, fontWeight: 600 }}>
                Inputs
              </div>
              <h3 style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 500, color: T.ink, letterSpacing: '-0.01em', marginTop: 4 }}>
                {activeView === 'networth' && 'Your current financial picture'}
                {activeView === 'retirement' && 'Variables that affect retirement'}
                {activeView === 'runway' && 'Variables that affect job loss runway'}
              </h3>
            </div>
            <div className="text-[11px]" style={{ color: T.muted, fontStyle: 'italic', maxWidth: 420 }}>
              {activeView === 'networth' && 'These describe what you own and owe. Edits here update all three views.'}
              {activeView === 'retirement' && 'All inputs are shared across views. Edits here update Net Worth and Job Loss too.'}
              {activeView === 'runway' && 'Stress test assumptions only affect this view. Other inputs are shared.'}
            </div>
          </div>
        </div>

        {/* Extract each section's JSX into a const so we can render in different layouts per tab. */}
        {(() => {
          // Decide badges and defaultOpen based on active view.
          //
          // Approach: each section gets its own defaultOpen value. We collapse most
          // sections by default to keep the page calm; only the FIRST section in each
          // group on each tab opens by default to give the user an obvious entry point.
          //
          //   Net Worth tab:
          //     - "About you" opens (first of left column)
          //     - "Current savings & investments" opens (first of right column)
          //     - All other sections collapsed
          //
          //   Retirement tab:
          //     - "Income & career" opens (first of "New for retirement" group)
          //     - All other sections collapsed (including all "From Net Worth" sections)
          //
          //   Job Loss tab:
          //     - "Stress test assumptions" opens (first of "New for job loss" group, and
          //       the most important runway-specific input)
          //     - All other sections collapsed
          //
          const isRet = activeView === 'retirement';
          const isRun = activeView === 'runway';
          const isNW = activeView === 'networth';

          const sharedBadge = isNW ? null : BADGE_FROM_NW;
          const newBadge = isRet ? BADGE_NEW_RET : isRun ? BADGE_NEW_RUN : null;

          // Per-section "open by default" flags. Specific to each tab.
          const open = {
            aboutYou: isNW,                                   // first of left column on NW
            children: false,
            savings: isNW,                                    // first of right column on NW
            properties: false,
            vehicles: false,
            debts: false,
            otherAssets: false,
            income: isRet,                                    // first of "New for retirement"
            expenses: false,
            rent: false,
            retirementIncome: false,
            inheritances: false,
            macro: false,
            stressTest: isRun                                 // first of "New for job loss"
          };

          // ---------- SHARED SECTIONS (live in Net Worth) ----------
          const aboutYouSection = (
            <Section icon={User} title="About you" defaultOpen={open.aboutYou} badge={sharedBadge}>
              <Slider label="Current age" value={inp.currentAge} onChange={set('currentAge')} min={25} max={75} step={1} />
              <Slider label="Target retirement age" value={inp.retirementAge} onChange={set('retirementAge')} min={Math.max(inp.currentAge, 50)} max={80} step={1} />
              <Slider label="Life expectancy" value={inp.lifeExpectancy} onChange={set('lifeExpectancy')} min={75} max={105} step={1}
                help="Plan for longer than the average, a 65-year-old has a meaningful chance of living past 90." />
              <Toggle label="Married / filing jointly" value={inp.married} onChange={set('married')} />
            </Section>
          );

          const childrenSection = (
            <Section icon={GraduationCap} title={`Children & education${totalChildren > 0 ? ` (${totalChildren})` : ''}`} defaultOpen={open.children} badge={sharedBadge}>
              {totalChildren === 0 && (
                <p className="text-[12px] mb-4" style={{ color: T.muted, fontStyle: 'italic' }}>
                  No children added. Add a child to track education costs (preschool through grad school) and 529 balances. Each child can have multiple education stages.
                </p>
              )}
              {(inp.children || []).map(child => (
                <ChildCard
                  key={child.id}
                  child={child}
                  onUpdate={(nc) => updateChild(child.id, nc)}
                  onRemove={() => removeChild(child.id)}
                  onAddEntry={(type) => addEducationEntry(child.id, type)}
                  onUpdateEntry={(entryId, ne) => updateEducationEntry(child.id, entryId, ne)}
                  onRemoveEntry={(entryId) => removeEducationEntry(child.id, entryId)}
                  currentAge={inp.currentAge}
                  lifeExpectancy={inp.lifeExpectancy}
                />
              ))}
              <button
                onClick={addChild}
                className="w-full py-3 text-[11px] uppercase tracking-[0.15em] mt-2"
                style={{
                  border: `1px dashed ${T.rule}`, color: T.amber,
                  fontWeight: 600, fontFamily: BODY_FONT,
                  background: 'transparent'
                }}
              >
                + Add child
              </button>
              {totalChildren > 0 && (
                <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${T.ruleLight}` }}>
                  <Slider
                    label="529 expected return (shared across all children)"
                    value={inp.c529Rate}
                    onChange={set('c529Rate')}
                    min={0} max={0.10} step={0.005} fmt={fmtPct}
                    help="Single assumption for all 529 accounts. Typically 5–7% for a balanced age-based portfolio."
                  />
                  <p className="text-[11px] mt-2" style={{ color: T.muted, fontStyle: 'italic' }}>
                    Each child's 529 balance is applied to their own education costs first (tax-free for qualified expenses). Any shortfall draws from regular savings.
                  </p>
                </div>
              )}
            </Section>
          );

          const savingsSection = (
            <Section icon={PiggyBank} title="Current savings & investments" defaultOpen={open.savings} badge={sharedBadge}>
              <NumInput label="Cash (checking, no interest)" value={inp.cash} onChange={set('cash')} />
              <div className="grid grid-cols-2 gap-4">
                <NumInput label="Money market value" value={inp.moneyMarket} onChange={set('moneyMarket')} />
                <Slider label="MM rate" value={inp.mmRate} onChange={set('mmRate')} min={0} max={0.07} step={0.0025} fmt={fmtPct} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <NumInput label="CD value" value={inp.cd} onChange={set('cd')} />
                <Slider label="CD rate" value={inp.cdRate} onChange={set('cdRate')} min={0} max={0.07} step={0.0025} fmt={fmtPct} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <NumInput label="Brokerage value" value={inp.brokerage} onChange={set('brokerage')} step={5000} />
                <Slider label="Brokerage return" value={inp.brokerageRate} onChange={set('brokerageRate')} min={0} max={0.12} step={0.005} fmt={fmtPct} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <NumInput label="401(k) / IRA value" value={inp.k401} onChange={set('k401')} step={5000} />
                <Slider label="401(k) return" value={inp.k401Rate} onChange={set('k401Rate')} min={0} max={0.12} step={0.005} fmt={fmtPct} />
              </div>
            </Section>
          );

          const propertiesSection = (
            <Section icon={Home} title={`Properties & mortgages (${inp.properties.length})`} defaultOpen={open.properties} badge={sharedBadge}>
              {inp.properties.map(p => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  onUpdate={(np) => updateProperty(p.id, np)}
                  onRemove={() => removeProperty(p.id)}
                  canRemove={inp.properties.length > 1}
                  currentAge={inp.currentAge}
                  lifeExpectancy={inp.lifeExpectancy}
                />
              ))}
              <button
                onClick={addProperty}
                className="w-full py-3 mb-4 text-[11px] uppercase tracking-[0.15em]"
                style={{
                  border: `1px dashed ${T.rule}`, color: T.emerald,
                  fontWeight: 600, fontFamily: BODY_FONT,
                  background: 'transparent'
                }}
              >
                + Add property
              </button>
              <Toggle
                label="Tap home equity if I run out of liquid"
                value={inp.useHomeEquity}
                onChange={set('useHomeEquity')}
                help="When liquid assets are exhausted, draws on equity from non-primary properties first (rentals/vacations), then primary residence last."
              />
            </Section>
          );

          const vehiclesSection = (
            <Section icon={Car} title={`Vehicles${inp.vehicles.length > 0 ? ` (${inp.vehicles.length})` : ''}`} defaultOpen={open.vehicles} badge={sharedBadge}>
              {inp.vehicles.length === 0 && (
                <p className="text-[12px] mb-4" style={{ color: T.muted, fontStyle: 'italic' }}>
                  No vehicles added. Add cars, motorcycles, boats, or RVs to track their value, depreciation, and any associated loans.
                </p>
              )}
              {inp.vehicles.map(v => (
                <VehicleCard
                  key={v.id}
                  vehicle={v}
                  onUpdate={(nv) => updateVehicle(v.id, nv)}
                  onRemove={() => removeVehicle(v.id)}
                  currentAge={inp.currentAge}
                  lifeExpectancy={inp.lifeExpectancy}
                />
              ))}
              <button
                onClick={addVehicle}
                className="w-full py-3 text-[11px] uppercase tracking-[0.15em]"
                style={{
                  border: `1px dashed ${T.rule}`, color: T.navy,
                  fontWeight: 600, fontFamily: BODY_FONT,
                  background: 'transparent'
                }}
              >
                + Add vehicle
              </button>
            </Section>
          );

          const debtsSection = (
            <Section icon={CreditCard} title={`Credit cards & other debts${inp.debts.length > 0 ? ` (${inp.debts.length})` : ''}`} defaultOpen={open.debts} badge={sharedBadge}>
              {inp.debts.length === 0 && (
                <p className="text-[12px] mb-4" style={{ color: T.muted, fontStyle: 'italic' }}>
                  No debts added. Add credit cards, student loans, personal loans, or any other balances you carry.
                </p>
              )}
              {inp.debts.map(d => (
                <DebtCard
                  key={d.id}
                  debt={d}
                  onUpdate={(nd) => updateDebt(d.id, nd)}
                  onRemove={() => removeDebt(d.id)}
                />
              ))}
              <button
                onClick={addDebt}
                className="w-full py-3 text-[11px] uppercase tracking-[0.15em]"
                style={{
                  border: `1px dashed ${T.rule}`, color: T.oxblood,
                  fontWeight: 600, fontFamily: BODY_FONT,
                  background: 'transparent'
                }}
              >
                + Add debt
              </button>
            </Section>
          );

          const otherAssetsSection = (
            <Section icon={Package} title={`Other assets${inp.otherAssets.length > 0 ? ` (${inp.otherAssets.length})` : ''}`} defaultOpen={open.otherAssets} badge={sharedBadge}>
              {inp.otherAssets.length === 0 && (
                <p className="text-[12px] mb-4" style={{ color: T.muted, fontStyle: 'italic' }}>
                  Optional. Add collectibles, business equity, jewelry, crypto, or any miscellaneous assets you'd want reflected in net worth.
                </p>
              )}
              {inp.otherAssets.map(a => (
                <OtherAssetCard
                  key={a.id}
                  asset={a}
                  onUpdate={(na) => updateOtherAsset(a.id, na)}
                  onRemove={() => removeOtherAsset(a.id)}
                />
              ))}
              <button
                onClick={addOtherAsset}
                className="w-full py-3 text-[11px] uppercase tracking-[0.15em]"
                style={{
                  border: `1px dashed ${T.rule}`, color: T.muted,
                  fontWeight: 600, fontFamily: BODY_FONT,
                  background: 'transparent'
                }}
              >
                + Add other asset
              </button>
            </Section>
          );

          // ---------- NEW-FOR-THIS-VIEW SECTIONS ----------
          const incomeSection = (
            <Section icon={Briefcase} title="Income & career" defaultOpen={open.income} badge={newBadge}>
              <NumInput label="Current annual income" value={inp.income} onChange={set('income')} step={5000} />
              <Slider label="Years of expected earnings remaining" value={inp.earningYears} onChange={set('earningYears')} min={0} max={50} step={1} />
              <Slider label="Annual salary growth" value={inp.salaryGrowth} onChange={set('salaryGrowth')} min={0} max={0.08} step={0.005} fmt={(v) => fmtPct(v)} />
              <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${T.ruleLight}` }}>
                <StateTaxPicker
                  stateCode={inp.stateCode}
                  useStateBrackets={inp.useStateBrackets}
                  stateRate={inp.stateRate}
                  married={inp.married}
                  income={inp.income}
                  onStateCodeChange={set('stateCode')}
                  onUseBracketsChange={set('useStateBrackets')}
                  onStateRateChange={set('stateRate')}
                />
              </div>
              {isRet && (
                <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${T.ruleLight}` }}>
                  <SavingsAllocationEditor
                    allocation={inp.savingsAllocation}
                    onChange={set('savingsAllocation')}
                  />
                </div>
              )}
            </Section>
          );

          const expensesSection = (
            <Section icon={Receipt} title="Living expenses & healthcare" defaultOpen={open.expenses} badge={newBadge}>
              <NumInput label="Annual non-mortgage expenses" value={inp.annualExpenses} onChange={set('annualExpenses')} step={2500} />
              <NumInput label="Healthcare per year, before Medicare" value={inp.hcPreMedicare} onChange={set('hcPreMedicare')} step={1000} />
              <NumInput label="Healthcare per year, on Medicare" value={inp.hcMedicare} onChange={set('hcMedicare')} step={500} />
              <p className="text-[11px] mt-2" style={{ color: T.muted, fontStyle: 'italic' }}>
                Defaults reflect 2026 averages: ACA marketplace coverage for a couple ≈ $18K/yr, Medicare with supplement & Part D + out-of-pocket ≈ $9K/yr.
              </p>
            </Section>
          );

          const rentSection = (
            <Section icon={KeyRound} title={`Rent${inp.monthlyRent > 0 ? ` ($${(inp.monthlyRent).toLocaleString()}/mo)` : ''}`} defaultOpen={open.rent} badge={newBadge}>
              <NumInput
                label="Monthly rent payment"
                value={inp.monthlyRent}
                onChange={set('monthlyRent')}
                step={50}
              />
              {inp.monthlyRent > 0 && (
                <>
                  <Slider
                    label="Annual rent growth"
                    value={inp.rentInflation}
                    onChange={set('rentInflation')}
                    min={0} max={0.10} step={0.005} fmt={fmtPct}
                    help="U.S. rent typically rises 3–5% annually, often outpacing CPI."
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Slider
                      label="Rent starts at age"
                      value={inp.rentStartAge ?? inp.currentAge}
                      onChange={(v) => set('rentStartAge')(v === inp.currentAge ? null : v)}
                      min={inp.currentAge} max={inp.lifeExpectancy} step={1}
                      help="Default: now"
                    />
                    <Slider
                      label="Rent ends at age"
                      value={inp.rentEndAge ?? inp.lifeExpectancy}
                      onChange={(v) => set('rentEndAge')(v === inp.lifeExpectancy ? null : v)}
                      min={inp.rentStartAge ?? inp.currentAge} max={inp.lifeExpectancy} step={1}
                      help="If you plan to buy later, set this to the age you'd stop renting."
                    />
                  </div>
                </>
              )}
              <p className="text-[11px] mt-2" style={{ color: T.muted, fontStyle: 'italic' }}>
                Use this if you rent your primary residence or expect to during a phase of life. You can still own properties (rentals, vacation homes) in the Properties section while renting where you live.
              </p>
            </Section>
          );

          const retirementIncomeSection = (
            <Section icon={Heart} title="Retirement income" defaultOpen={open.retirementIncome} badge={newBadge}>
              <NumInput label="Social Security, annual" value={inp.socialSecurity} onChange={set('socialSecurity')} step={1000} />
              <Slider label="Social Security start age" value={inp.ssStartAge} onChange={set('ssStartAge')} min={62} max={70} step={1}
                help="Delaying to 70 increases benefits by ~8% per year over full retirement age." />
              <NumInput label="Other income (pension, rental, part-time)" value={inp.altIncome} onChange={set('altIncome')} step={1000} />
              {inp.altIncome > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <Slider label="Other income starts at age" value={inp.altStartAge} onChange={set('altStartAge')} min={inp.currentAge} max={85} step={1} />
                  <Slider label="Other income ends at age" value={inp.altEndAge} onChange={set('altEndAge')} min={inp.altStartAge} max={100} step={1} />
                </div>
              )}
            </Section>
          );

          const inheritancesSection = (
            <Section icon={Gift} title={`Expected inheritances${inp.inheritances.length > 0 ? ` (${inp.inheritances.length})` : ''}`} defaultOpen={open.inheritances} badge={newBadge}>
              {inp.inheritances.length === 0 && (
                <p className="text-[12px] mb-4" style={{ color: T.muted, fontStyle: 'italic' }}>
                  No inheritances added. If you reasonably expect a lump sum from a parent, grandparent, or other source, add it below with the age you expect to receive it.
                </p>
              )}
              {[...inp.inheritances].sort((a, b) => a.age - b.age).map(i => (
                <InheritanceCard
                  key={i.id}
                  inheritance={i}
                  onUpdate={(ni) => updateInheritance(i.id, ni)}
                  onRemove={() => removeInheritance(i.id)}
                  currentAge={inp.currentAge}
                  lifeExpectancy={inp.lifeExpectancy}
                />
              ))}
              <button
                onClick={addInheritance}
                className="w-full py-3 text-[11px] uppercase tracking-[0.15em]"
                style={{
                  border: `1px dashed ${T.rule}`, color: T.amber,
                  fontWeight: 600, fontFamily: BODY_FONT,
                  background: 'transparent'
                }}
              >
                + Add inheritance
              </button>
            </Section>
          );

          const macroSection = (
            <Section icon={Settings} title="Macro assumptions" defaultOpen={open.macro} badge={isNW ? null : newBadge}>
              <Slider label="Annual inflation" value={inp.inflation} onChange={set('inflation')} min={0} max={0.07} step={0.0025} fmt={fmtPct}
                help="Long-run U.S. average ≈ 3%. Healthcare inflation typically runs higher; for simplicity it's bundled here." />
            </Section>
          );

          // Stress test assumptions — only relevant on Job Loss Runway tab.
          // Severance, UI, COBRA, expense reduction, gig income, partner income.
          const stressTestSection = (
            <Section icon={Wind} title="Stress test assumptions" defaultOpen={open.stressTest} badge={newBadge}>
              <div className="text-[11px] uppercase tracking-[0.12em] mb-3 mt-1" style={{ color: T.muted, fontWeight: 600 }}>
                Severance
              </div>
              <NumInput label="Severance amount (total)" value={inp.severanceAmount} onChange={set('severanceAmount')} step={5000} />
              <Slider label="Severance paid over (months)" value={inp.severancePaymentMonths} onChange={set('severancePaymentMonths')} min={1} max={12} step={1}
                help="1 = lump sum at separation. Some companies stretch over several months." />

              <div className="text-[11px] uppercase tracking-[0.12em] mb-3 mt-5" style={{ color: T.muted, fontWeight: 600 }}>
                Unemployment insurance
              </div>
              <NumInput label="Weekly benefit" value={inp.uiWeeklyBenefit} onChange={set('uiWeeklyBenefit')} step={50}
                help="US average ~$385. NJ max ~$830, CA ~$450, FL ~$275." />
              <Slider label="Maximum weeks" value={inp.uiMaxWeeks} onChange={set('uiMaxWeeks')} min={0} max={52} step={1}
                help="Most states cap at 26 weeks; some extend in recessions." />

              <div className="text-[11px] uppercase tracking-[0.12em] mb-3 mt-5" style={{ color: T.muted, fontWeight: 600 }}>
                Health insurance replacement
              </div>
              <NumInput label="Monthly COBRA / ACA premium" value={inp.cobraMonthly} onChange={set('cobraMonthly')} step={100}
                help="Family ACA marketplace ~$1,500-2,200/mo without subsidies. Subsidies available based on reduced income." />

              <div className="text-[11px] uppercase tracking-[0.12em] mb-3 mt-5" style={{ color: T.muted, fontWeight: 600 }}>
                Belt tightening
              </div>
              <Slider label="Discretionary expense reduction" value={inp.expenseReductionPct} onChange={set('expenseReductionPct')} min={0} max={0.50} step={0.05} fmt={fmtPct}
                help="Most people can cut 15-25% of expenses temporarily without hardship." />

              <div className="text-[11px] uppercase tracking-[0.12em] mb-3 mt-5" style={{ color: T.muted, fontWeight: 600 }}>
                Gig / freelance income while job hunting
              </div>
              <NumInput label="Monthly gig income" value={inp.gigMonthlyIncome} onChange={set('gigMonthlyIncome')} step={250}
                help="Consulting, rideshare, delivery, contract work, freelance projects. Pre-tax, monthly. Set to 0 if you wouldn't pursue gig work." />
              {(inp.gigMonthlyIncome || 0) > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <Slider label="Starts in month" value={inp.gigStartMonth} onChange={set('gigStartMonth')} min={1} max={12} step={1}
                    help="Realistic ramp-up: month 2-3 to set up profiles, find clients, get first paychecks." />
                  <Slider label="Continues through month" value={inp.gigEndMonth} onChange={set('gigEndMonth')} min={Math.max(1, inp.gigStartMonth || 1)} max={60} step={1}
                    help="When you'd stop gig work — typically when you find permanent employment." />
                </div>
              )}
              <p className="text-[11px] mt-1 mb-2" style={{ color: T.muted, fontStyle: 'italic', lineHeight: 1.5 }}>
                Note: in many states, gig earnings reduce unemployment benefits dollar-for-dollar above a small disregard. The model does not auto-reduce UI for gig income — set gig income slightly below your true expected earnings if you want to be conservative.
              </p>

              {inp.married && (
                <>
                  <div className="text-[11px] uppercase tracking-[0.12em] mb-3 mt-5" style={{ color: T.muted, fontWeight: 600 }}>
                    Partner income
                  </div>
                  <Toggle label="Partner keeps working during job loss" value={inp.partnerKeepsIncome} onChange={set('partnerKeepsIncome')} />
                  {inp.partnerKeepsIncome && (
                    <Slider label="Partner's share of household income" value={inp.partnerIncomePortion} onChange={set('partnerIncomePortion')} min={0} max={1} step={0.05} fmt={fmtPct}
                      help="What fraction of household income comes from your partner. Default 40%." />
                  )}
                </>
              )}
            </Section>
          );

          // ---------- LAYOUT PER TAB ----------
          if (isNW) {
            // Net Worth tab keeps the existing 2-column layout, no grouping.
            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12">
                <div>
                  <SectionHeader>Personal & Income</SectionHeader>
                  {aboutYouSection}
                  {childrenSection}
                </div>
                <div>
                  <SectionHeader>Assets & Liabilities</SectionHeader>
                  {savingsSection}
                  {propertiesSection}
                  {vehiclesSection}
                  {debtsSection}
                  {otherAssetsSection}
                </div>
              </div>
            );
          }

          if (isRet) {
            return (
              <>
                <SectionGroup
                  title="New for retirement"
                  subtext="These inputs only matter for the retirement projection. They don't affect the Net Worth or Job Loss views. Fill these in to get your projection."
                  accentColor={BADGE_NEW_RET.color}
                >
                  {incomeSection}
                  {expensesSection}
                  {rentSection}
                  {retirementIncomeSection}
                  {inheritancesSection}
                  {macroSection}
                </SectionGroup>
                <SectionGroup
                  title="From Net Worth"
                  subtext="Already filled from your Net Worth view. Edits here flow back to Net Worth automatically. Sections start collapsed since you've seen them — expand if you need to revise."
                  accentColor={BADGE_FROM_NW.color}
                >
                  {aboutYouSection}
                  {savingsSection}
                  {propertiesSection}
                  {vehiclesSection}
                  {debtsSection}
                  {otherAssetsSection}
                  {childrenSection}
                </SectionGroup>
              </>
            );
          }

          if (isRun) {
            return (
              <>
                <SectionGroup
                  title="New for job loss runway"
                  subtext="These inputs feed the runway calculation only. The stress test assumptions section covers severance, unemployment, COBRA, gig income, and partner income."
                  accentColor={BADGE_NEW_RUN.color}
                >
                  {stressTestSection}
                  {incomeSection}
                  {expensesSection}
                  {rentSection}
                </SectionGroup>
                <SectionGroup
                  title="From Net Worth"
                  subtext="Already filled from your Net Worth view. Edits here flow back to Net Worth automatically. Sections start collapsed since you've seen them — expand if you need to revise."
                  accentColor={BADGE_FROM_NW.color}
                >
                  {aboutYouSection}
                  {savingsSection}
                  {propertiesSection}
                  {vehiclesSection}
                  {debtsSection}
                  {otherAssetsSection}
                  {childrenSection}
                </SectionGroup>
              </>
            );
          }

          return null;
        })()}

        {/* Net Worth tab: transition to other views, shown after inputs */}
        {activeView === 'networth' && <WhatThisPowers onSwitchView={setActiveView} />}

        {/* ============= FOOTER NOTE ============= */}
        <div className="mt-12 pt-6 text-[11px] leading-relaxed" style={{ borderTop: `1px solid ${T.rule}`, color: T.muted, maxWidth: 720 }}>
          <p className="mb-2">
            <strong style={{ color: T.inkSoft }}>About this model.</strong> Projections use deterministic year-by-year cashflow simulation (not Monte Carlo). The conservative scenario reduces investment returns by 2 points, increases expenses by 12%, and extends life expectancy by 3 years; the optimistic scenario does the inverse. <strong style={{ color: T.inkSoft }}>Real estate:</strong> any number of properties with independent values, mortgages, rates, payments, appreciation, and property tax rates. Rental properties contribute net rental income (after vacancy/maintenance/management) which is taxed as ordinary. When liquid runs out and equity tapping is enabled, non-primary properties are tapped first (rentals/vacations), primary residence last. <strong style={{ color: T.inkSoft }}>Vehicles:</strong> depreciate at their specified rate; loan payments amortize down each year and reduce cashflow; once owned outright, payments stop. <strong style={{ color: T.inkSoft }}>Other debts:</strong> credit cards and loans amortize against monthly payments, if the payment doesn't cover annual interest, the balance grows over time. <strong style={{ color: T.inkSoft }}>Inheritances:</strong> any number of expected lump sums at specified ages, deposited tax-free into the brokerage account at receipt (federal estate tax is paid by the estate, and inherited investments receive a step-up in cost basis, no inheritance tax in most states). <strong style={{ color: T.inkSoft }}>Net worth:</strong> total assets (liquid + 529 + properties + vehicles + other) minus total liabilities (mortgages + vehicle loans + other debts) at any chosen age. <strong style={{ color: T.inkSoft }}>Taxes captured:</strong> federal income (2026 brackets), state income, 7.65% payroll while working, 15% LTCG, 85% of Social Security treated as taxable, and per-property property tax assessed annually on current value (always, even after the mortgage is paid off). 529 funds are applied to college costs first; any remaining college shortfall, and all retirement spending, draws from cash → money market → CDs → brokerage → 401(k), with home equity tapped last when enabled.
          </p>
          <p>
            <strong style={{ color: T.inkSoft }}>This is not financial advice.</strong> A real plan benefits from a fiduciary advisor running stochastic simulations against your tax situation, asset location, and Roth conversion strategy.
          </p>
          <p className="mt-3" style={{ fontSize: 10, color: T.muted }}>
            © {new Date().getFullYear()} SLAE Labs LLC. All rights reserved. ackwak.com is a product of SLAE Labs LLC.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================
function SectionHeader({ children }) {
  return (
    <h2 style={{
      fontFamily: DISPLAY_FONT, fontSize: 18, fontWeight: 500,
      letterSpacing: '-0.01em', marginBottom: 8, marginTop: 8,
      paddingBottom: 8
    }}>
      {children}
    </h2>
  );
}

function ScenarioCard({ scenario, sim, label, subtitle, inp }) {
  const config = {
    cons: { color: T.oxblood, soft: T.oxbloodSoft, accent: 'Conservative' },
    mod: { color: T.ink, soft: T.surfaceWarm, accent: 'Moderate' },
    opt: { color: T.emerald, soft: T.emeraldSoft, accent: 'Optimistic' }
  }[scenario];

  const survives = sim.runOutAge === null;
  const yearsLasted = sim.runOutAge !== null
    ? sim.runOutAge - inp.retirementAge
    : (inp.lifeExpectancy + (scenario === 'cons' ? 3 : scenario === 'opt' ? -2 : 0)) - inp.retirementAge;

  return (
    <div className="p-6" style={{
      background: T.surface, border: `1px solid ${T.rule}`,
      borderTop: `3px solid ${config.color}`
    }}>
      <div className="flex items-baseline justify-between mb-1">
        <span style={{
          fontFamily: BODY_FONT, fontWeight: 600, fontSize: 11,
          letterSpacing: '0.15em', textTransform: 'uppercase', color: config.color
        }}>
          {label}
        </span>
        {survives ? (
          <CheckCircle2 size={14} style={{ color: T.emerald }} strokeWidth={2} />
        ) : (
          <AlertTriangle size={14} style={{ color: T.oxblood }} strokeWidth={2} />
        )}
      </div>
      <div className="text-[11px] mb-4" style={{ color: T.muted, fontStyle: 'italic' }}>{subtitle}</div>

      <div style={{
        fontFamily: DISPLAY_FONT, fontSize: 32, fontWeight: 500,
        color: T.ink, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums'
      }}>
        {survives ? 'Survives' : `Age ${sim.runOutAge}`}
      </div>
      <div className="text-[12px] mt-1" style={{ color: T.muted }}>
        {survives
          ? `Money lasts through life expectancy`
          : `Liquid assets exhausted in retirement year ${yearsLasted}`}
      </div>

      <div className="mt-5 pt-5 grid grid-cols-2 gap-3" style={{ borderTop: `1px solid ${T.ruleLight}` }}>
        <div>
          <div className="text-[10px] uppercase tracking-[0.1em]" style={{ color: T.muted, fontWeight: 500 }}>At retirement</div>
          <div style={{ fontFamily: MONO_FONT, fontSize: 13, fontWeight: 500, marginTop: 2 }}>
            {fmt$Full(sim.portfolioAtRetirement)}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.1em]" style={{ color: T.muted, fontWeight: 500 }}>Final liquid</div>
          <div style={{ fontFamily: MONO_FONT, fontSize: 13, fontWeight: 500, marginTop: 2 }}>
            {fmt$Full(sim.finalLiquid)}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecRow({ label, age, hint, highlight }) {
  return (
    <div className="flex items-center justify-between py-2.5 gap-3" style={{
      borderBottom: highlight ? 'none' : '1px solid rgba(255,255,255,0.08)'
    }}>
      <div className="min-w-0">
        <div className="text-[11px] sm:text-[12px]" style={{ color: highlight ? '#9DD9B5' : '#C9C4BB', fontWeight: 500 }}>{label}</div>
        <div className="text-[10px] mt-0.5" style={{ color: '#7A7568' }}>{hint}</div>
      </div>
      <div style={{
        fontFamily: DISPLAY_FONT, fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 500,
        color: highlight ? '#9DD9B5' : T.surface,
        fontVariantNumeric: 'tabular-nums', flexShrink: 0
      }}>
        {age}
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ width: 8, height: 8, borderRadius: 999, background: color, display: 'inline-block' }} />
      <span style={{ fontFamily: BODY_FONT }}>{label}</span>
    </div>
  );
}

function PropertyCard({ property, onUpdate, onRemove, canRemove, currentAge, lifeExpectancy }) {
  const [open, setOpen] = useState(false);
  const equity = Math.max(0, property.value - property.mortgage);
  const update = (k, v) => onUpdate({ ...property, [k]: v });

  const typeColors = {
    primary: T.navy,
    rental: T.emerald,
    vacation: T.amber
  };
  const typeColor = typeColors[property.type];

  return (
    <div className="mb-3" style={{ background: T.surfaceWarm, border: `1px solid ${T.rule}` }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3"
        style={{ background: 'transparent' }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span
            className="px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] shrink-0"
            style={{ background: typeColor, color: T.surface, fontWeight: 600 }}
          >
            {property.type}
          </span>
          <span
            className="text-[14px] truncate text-left"
            style={{ fontWeight: 500, color: T.ink, fontFamily: BODY_FONT }}
          >
            {property.label}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[12px]" style={{ color: T.ink, fontFamily: MONO_FONT, fontVariantNumeric: 'tabular-nums' }}>
              {fmt$Full(property.value)}
            </div>
            <div className="text-[10px]" style={{ color: T.muted, fontFamily: MONO_FONT, fontVariantNumeric: 'tabular-nums' }}>
              {fmt$Full(equity)} equity
            </div>
          </div>
          <ChevronDown
            size={14}
            style={{
              color: T.muted,
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 200ms'
            }}
            strokeWidth={1.5}
          />
        </div>
      </button>

      {open && (
        <div className="px-4 pt-3 pb-4" style={{ borderTop: `1px solid ${T.ruleLight}` }}>
          {/* Label */}
          <div className="mb-4">
            <label className="text-[12px] uppercase tracking-[0.12em] block mb-1.5" style={{ color: T.muted, fontWeight: 500 }}>
              Label
            </label>
            <input
              type="text"
              value={property.label}
              onChange={e => update('label', e.target.value)}
              className="bg-transparent outline-none w-full py-1.5 text-[14px]"
              style={{
                color: T.ink, fontFamily: BODY_FONT, fontWeight: 500,
                borderBottom: `1px solid ${T.rule}`
              }}
            />
          </div>

          {/* Type selector */}
          <div className="mb-5">
            <label className="text-[12px] uppercase tracking-[0.12em] block mb-2" style={{ color: T.muted, fontWeight: 500 }}>
              Type
            </label>
            <div className="flex gap-2">
              {['primary', 'rental', 'vacation'].map(t => {
                const active = property.type === t;
                return (
                  <button
                    key={t}
                    onClick={() => update('type', t)}
                    className="px-3 py-1.5 text-[10px] uppercase tracking-[0.12em]"
                    style={{
                      background: active ? typeColors[t] : 'transparent',
                      color: active ? T.surface : T.muted,
                      border: `1px solid ${active ? typeColors[t] : T.rule}`,
                      fontWeight: 600,
                      fontFamily: BODY_FONT
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <NumInput label="Current value" value={property.value} onChange={v => update('value', v)} step={10000} />
            <NumInput label="Mortgage balance" value={property.mortgage} onChange={v => update('mortgage', v)} step={5000} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Slider label="Mortgage rate" value={property.mortgageRate} onChange={v => update('mortgageRate', v)} min={0} max={0.10} step={0.0025} fmt={fmtPct} />
            <NumInput label="Monthly P+I payment" value={property.mortgageMonthly} onChange={v => update('mortgageMonthly', v)} step={50} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Slider
              label="Property tax rate"
              value={property.propertyTaxRate}
              onChange={v => update('propertyTaxRate', v)}
              min={0} max={0.03} step={0.001}
              fmt={fmtPct}
              help="NJ ~2.2%, TX ~1.8%, FL ~1.0%, CA ~0.8% (Prop 13)."
            />
            <Slider label="Annual appreciation" value={property.appreciation} onChange={v => update('appreciation', v)} min={-0.02} max={0.07} step={0.005} fmt={fmtPct} />
          </div>

          {property.type === 'rental' && (
            <>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <NumInput label="Net annual rental income" value={property.netRentalIncome} onChange={v => update('netRentalIncome', v)} step={1000} />
                <Slider label="Rental income growth" value={property.rentalGrowth} onChange={v => update('rentalGrowth', v)} min={0} max={0.06} step={0.005} fmt={fmtPct} />
              </div>
              <p className="text-[11px] mb-3" style={{ color: T.muted, fontStyle: 'italic' }}>
                Net rent = gross rent − vacancy, maintenance, insurance, HOA, and management fees. Mortgage and property tax are tracked separately.
              </p>

              {/* Rental income timing, when does this stream begin & end? */}
              {property.netRentalIncome > 0 && (
                <div className="mt-2 mb-3 px-3 py-3" style={{
                  background: T.bg, border: `1px solid ${T.ruleLight}`
                }}>
                  <div className="text-[11px] uppercase tracking-[0.12em] mb-3" style={{ color: T.muted, fontWeight: 500 }}>
                    When is this rental income active?
                  </div>

                  {/* Start age */}
                  <div className="mb-3">
                    <Checkbox
                      label="Starts immediately"
                      value={property.rentalStartAge == null}
                      onChange={(checked) => update('rentalStartAge', checked ? null : (property.rentalStartAge ?? currentAge + 1))}
                    />
                    {property.rentalStartAge != null && (
                      <div className="mt-2">
                        <Slider
                          label="Rental income starts at age"
                          value={property.rentalStartAge}
                          onChange={(v) => update('rentalStartAge', v)}
                          min={currentAge}
                          max={lifeExpectancy}
                          step={1}
                          help="The age you begin receiving rental income. Use this if you plan to buy this property in the future or convert it to a rental later."
                        />
                      </div>
                    )}
                  </div>

                  {/* End age */}
                  <div>
                    <Checkbox
                      label="Never ends"
                      value={property.rentalEndAge == null}
                      onChange={(checked) => update('rentalEndAge', checked ? null : (property.rentalEndAge ?? lifeExpectancy - 5))}
                    />
                    {property.rentalEndAge != null && (
                      <div className="mt-2">
                        <Slider
                          label="Rental income ends at age"
                          value={property.rentalEndAge}
                          onChange={(v) => update('rentalEndAge', v)}
                          min={property.rentalStartAge ?? currentAge}
                          max={lifeExpectancy}
                          step={1}
                          help="The age the rental income stops. Use this if you plan to sell this property, move into it, or stop renting it out."
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {canRemove && (
            <button
              onClick={onRemove}
              className="flex items-center gap-1.5 mt-3 py-1 text-[11px] uppercase tracking-[0.12em]"
              style={{ color: T.oxblood, fontWeight: 500, background: 'transparent' }}
            >
              <Trash2 size={12} strokeWidth={1.5} />
              Remove this property
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const SCHOOL_TYPE_LABELS = {
  preschool: 'Preschool',
  elementary: 'Elementary',
  middle: 'Middle school',
  high: 'High school',
  college: 'College',
  grad: 'Grad school',
  other: 'Other'
};

function ChildCard({ child, onUpdate, onRemove, onAddEntry, onUpdateEntry, onRemoveEntry, currentAge, lifeExpectancy }) {
  const [open, setOpen] = useState(true); // children open by default since they're top-level entities
  const update = (k, v) => onUpdate({ ...child, [k]: v });

  const totalLifetimeCost = (child.entries || []).reduce(
    (s, e) => s + (e.annualCost || 0) * (e.durationYears || 0), 0
  );
  const entryCount = (child.entries || []).length;
  // Sort entries by start age for display
  const sortedEntries = [...(child.entries || [])].sort((a, b) => a.parentAgeAtStart - b.parentAgeAtStart);

  return (
    <div className="mb-4" style={{ background: T.surfaceWarm, border: `1px solid ${T.rule}` }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3"
        style={{ background: 'transparent' }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <GraduationCap size={14} style={{ color: T.amber }} strokeWidth={1.5} />
          <span className="text-[14px] truncate text-left" style={{ fontWeight: 600, color: T.ink, fontFamily: BODY_FONT }}>
            {child.name}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 shrink-0" style={{
            background: T.rule, color: T.muted, fontFamily: MONO_FONT, fontWeight: 600
          }}>
            {entryCount} {entryCount === 1 ? 'stage' : 'stages'}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[12px]" style={{ color: T.ink, fontFamily: MONO_FONT, fontVariantNumeric: 'tabular-nums' }}>
              {fmt$Full(totalLifetimeCost)}
            </div>
            <div className="text-[10px]" style={{ color: T.muted, fontFamily: MONO_FONT }}>
              529: {fmt$Full(child.c529Balance || 0)}
            </div>
          </div>
          <ChevronDown size={14} style={{ color: T.muted, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }} strokeWidth={1.5} />
        </div>
      </button>

      {open && (
        <div className="px-4 pt-3 pb-4" style={{ borderTop: `1px solid ${T.ruleLight}` }}>
          {/* Name + 529 balance */}
          <div className="mb-4">
            <label className="text-[12px] uppercase tracking-[0.12em] block mb-1.5" style={{ color: T.muted, fontWeight: 500 }}>
              Name
            </label>
            <input
              type="text"
              value={child.name}
              onChange={e => update('name', e.target.value)}
              placeholder="e.g., Emma"
              className="bg-transparent outline-none w-full py-1.5 text-[14px]"
              style={{ color: T.ink, fontFamily: BODY_FONT, fontWeight: 500, borderBottom: `1px solid ${T.rule}` }}
            />
          </div>
          <NumInput
            label="529 balance for this child"
            value={child.c529Balance || 0}
            onChange={v => update('c529Balance', v)}
            step={2500}
          />

          {/* Education entries */}
          <div className="mt-5 mb-2">
            <div className="text-[11px] uppercase tracking-[0.12em] mb-2" style={{ color: T.muted, fontWeight: 500 }}>
              Education stages
            </div>
            {sortedEntries.length === 0 ? (
              <p className="text-[12px] mb-3 px-3 py-3" style={{
                color: T.muted, fontStyle: 'italic',
                background: T.bg, border: `1px dashed ${T.rule}`
              }}>
                No education stages added yet. Add one for each phase you'll fund, preschool, elementary, college, etc.
              </p>
            ) : (
              <div className="space-y-2">
                {sortedEntries.map(entry => (
                  <EducationEntryRow
                    key={entry.id}
                    entry={entry}
                    onUpdate={(ne) => onUpdateEntry(entry.id, ne)}
                    onRemove={() => onRemoveEntry(entry.id)}
                    currentAge={currentAge}
                    lifeExpectancy={lifeExpectancy}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Add stage buttons, quick presets */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {Object.entries(SCHOOL_TYPE_LABELS).map(([type, label]) => (
              <button
                key={type}
                onClick={() => onAddEntry(type)}
                className="px-2.5 py-1.5 text-[10px] uppercase tracking-[0.1em] transition-opacity hover:opacity-80"
                style={{
                  background: T.surface, color: T.amber,
                  border: `1px solid ${T.rule}`,
                  fontFamily: BODY_FONT, fontWeight: 600
                }}
              >
                + {label}
              </button>
            ))}
          </div>

          <button
            onClick={onRemove}
            className="flex items-center gap-1.5 mt-4 py-1 text-[11px] uppercase tracking-[0.12em]"
            style={{ color: T.oxblood, fontWeight: 500, background: 'transparent' }}
          >
            <Trash2 size={12} strokeWidth={1.5} />
            Remove this child
          </button>
        </div>
      )}
    </div>
  );
}

function EducationEntryRow({ entry, onUpdate, onRemove, currentAge, lifeExpectancy }) {
  const [open, setOpen] = useState(false);
  const update = (k, v) => onUpdate({ ...entry, [k]: v });
  const totalCost = (entry.annualCost || 0) * (entry.durationYears || 0);
  const yearsAway = entry.parentAgeAtStart - currentAge;
  const startEnd = `your age ${entry.parentAgeAtStart}–${entry.parentAgeAtStart + entry.durationYears - 1}`;
  const timing = yearsAway < 0 ? 'started already' : yearsAway === 0 ? 'starts this year' : `${yearsAway} yrs from now`;

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.ruleLight}` }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2"
        style={{ background: 'transparent' }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-[10px] px-1.5 py-0.5 uppercase tracking-[0.08em] shrink-0" style={{
            background: T.amberSoft, color: T.amber, fontWeight: 600, fontFamily: BODY_FONT
          }}>
            {SCHOOL_TYPE_LABELS[entry.type] || 'Other'}
          </span>
          <span className="text-[11px] truncate text-left" style={{ color: T.inkSoft, fontFamily: BODY_FONT }}>
            {startEnd} · {timing}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span style={{ color: T.ink, fontFamily: MONO_FONT, fontWeight: 500, fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
            {fmt$Full(totalCost)}
          </span>
          <ChevronDown size={12} style={{ color: T.muted, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }} strokeWidth={1.5} />
        </div>
      </button>

      {open && (
        <div className="px-3 pt-2 pb-3" style={{ borderTop: `1px solid ${T.ruleLight}` }}>
          <div className="mb-3">
            <label className="text-[12px] uppercase tracking-[0.12em] block mb-1.5" style={{ color: T.muted, fontWeight: 500 }}>
              Type
            </label>
            <select
              value={entry.type}
              onChange={e => update('type', e.target.value)}
              className="w-full px-2 py-1.5 text-[13px] outline-none"
              style={{
                background: T.surface, color: T.ink,
                border: `1px solid ${T.rule}`,
                fontFamily: BODY_FONT, fontWeight: 500
              }}
            >
              {Object.entries(SCHOOL_TYPE_LABELS).map(([type, label]) => (
                <option key={type} value={type}>{label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Slider
              label="Your age when this stage starts"
              value={entry.parentAgeAtStart}
              onChange={v => update('parentAgeAtStart', v)}
              min={Math.max(0, currentAge - 20)}
              max={lifeExpectancy}
              step={1}
            />
            <Slider
              label="Duration (years)"
              value={entry.durationYears}
              onChange={v => update('durationYears', v)}
              min={1} max={10} step={1}
            />
          </div>
          <NumInput
            label="Annual cost"
            value={entry.annualCost}
            onChange={v => update('annualCost', v)}
            step={1000}
          />
          <button
            onClick={onRemove}
            className="flex items-center gap-1.5 mt-2 py-1 text-[11px] uppercase tracking-[0.12em]"
            style={{ color: T.oxblood, fontWeight: 500, background: 'transparent' }}
          >
            <Trash2 size={11} strokeWidth={1.5} />
            Remove stage
          </button>
        </div>
      )}
    </div>
  );
}

function InheritanceCard({ inheritance, onUpdate, onRemove, currentAge, lifeExpectancy }) {
  const [open, setOpen] = useState(false);
  const update = (k, v) => onUpdate({ ...inheritance, [k]: v });
  const yearsAway = inheritance.age - currentAge;
  const timing =
    yearsAway < 0 ? 'Already received' :
    yearsAway === 0 ? 'This year' :
    `${yearsAway} years from now`;

  return (
    <div className="mb-3" style={{ background: T.surfaceWarm, border: `1px solid ${T.rule}` }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3"
        style={{ background: 'transparent' }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Gift size={14} style={{ color: T.amber }} strokeWidth={1.5} />
          <span
            className="text-[14px] truncate text-left"
            style={{ fontWeight: 500, color: T.ink, fontFamily: BODY_FONT }}
          >
            {inheritance.label}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[12px]" style={{ color: T.ink, fontFamily: MONO_FONT, fontVariantNumeric: 'tabular-nums' }}>
              {fmt$Full(inheritance.amount)}
            </div>
            <div className="text-[10px]" style={{ color: T.muted, fontFamily: MONO_FONT }}>
              age {inheritance.age} · {timing}
            </div>
          </div>
          <ChevronDown
            size={14}
            style={{
              color: T.muted,
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 200ms'
            }}
            strokeWidth={1.5}
          />
        </div>
      </button>

      {open && (
        <div className="px-4 pt-3 pb-4" style={{ borderTop: `1px solid ${T.ruleLight}` }}>
          <div className="mb-4">
            <label className="text-[12px] uppercase tracking-[0.12em] block mb-1.5" style={{ color: T.muted, fontWeight: 500 }}>
              Source / label
            </label>
            <input
              type="text"
              value={inheritance.label}
              onChange={e => update('label', e.target.value)}
              placeholder="e.g., From parents"
              className="bg-transparent outline-none w-full py-1.5 text-[14px]"
              style={{
                color: T.ink, fontFamily: BODY_FONT, fontWeight: 500,
                borderBottom: `1px solid ${T.rule}`
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <NumInput label="Expected amount" value={inheritance.amount} onChange={v => update('amount', v)} step={10000} />
            <Slider label="Your age at receipt" value={inheritance.age} onChange={v => update('age', v)} min={currentAge} max={lifeExpectancy} step={1} />
          </div>
          <p className="text-[11px] mt-1 mb-3" style={{ color: T.muted, fontStyle: 'italic' }}>
            Tax-free at the federal level. Treated as a lump sum deposited to your brokerage account at the chosen age. Enter the amount you expect to receive in then-current dollars.
          </p>
          <button
            onClick={onRemove}
            className="flex items-center gap-1.5 mt-1 py-1 text-[11px] uppercase tracking-[0.12em]"
            style={{ color: T.oxblood, fontWeight: 500, background: 'transparent' }}
          >
            <Trash2 size={12} strokeWidth={1.5} />
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

function SavingsAllocationEditor({ allocation, onChange }) {
  const buckets = [
    { key: 'cash', label: 'Cash', color: T.muted },
    { key: 'mm', label: 'Money market', color: T.muted },
    { key: 'cd', label: 'CDs', color: T.muted },
    { key: 'brokerage', label: 'Brokerage', color: T.emerald },
    { key: 'k401', label: '401(k) / IRA', color: T.emerald }
  ];

  const presets = {
    aggressive: { cash: 0.02, mm: 0.05, cd: 0, brokerage: 0.43, k401: 0.50, label: 'Aggressive growth' },
    balanced:   { cash: 0.05, mm: 0.10, cd: 0.05, brokerage: 0.30, k401: 0.50, label: 'Balanced' },
    conservative: { cash: 0.10, mm: 0.20, cd: 0.20, brokerage: 0.20, k401: 0.30, label: 'Conservative' },
    equal:      { cash: 0.20, mm: 0.20, cd: 0.20, brokerage: 0.20, k401: 0.20, label: 'Equal split' }
  };

  // The active tab is governed by an explicit flag the user sets by clicking.
  // When the user clicks Custom, we lock to Custom even if the current values match a preset.
  // Touching any slider also implicitly locks Custom (deviating from preset values does that anyway).
  const [forceCustom, setForceCustom] = useState(false);

  // Detect which preset (if any) the current allocation matches, within rounding tolerance.
  const matchesPreset = () => {
    for (const [key, p] of Object.entries(presets)) {
      const matches = buckets.every(b =>
        Math.abs((allocation[b.key] || 0) - p[b.key]) < 0.005
      );
      if (matches) return key;
    }
    return null;
  };
  const matchedPreset = matchesPreset();
  const activeMode = forceCustom || matchedPreset === null ? 'custom' : matchedPreset;

  const totalPct = Math.round(buckets.reduce((s, b) => s + (allocation[b.key] || 0) * 100, 0));
  const delta = totalPct - 100;
  const isBalanced = delta === 0;

  // In custom mode: sliders move independently, no auto-redistribution.
  const handleSliderChange = (changedKey, newPctRaw) => {
    const newPct = Math.max(0, Math.min(100, newPctRaw));
    setForceCustom(true); // any manual edit puts us in Custom mode explicitly
    onChange({ ...allocation, [changedKey]: newPct / 100 });
  };

  const autoBalance = () => {
    if (totalPct === 0) {
      const equal = 1 / buckets.length;
      const next = {};
      for (const b of buckets) next[b.key] = equal;
      onChange(next);
      return;
    }
    const scale = 100 / totalPct;
    const next = {};
    for (const b of buckets) {
      next[b.key] = ((allocation[b.key] || 0) * scale);
    }
    onChange(next);
  };

  const applyPreset = (key) => {
    const p = presets[key];
    setForceCustom(false); // selecting a preset exits Custom mode
    onChange({ cash: p.cash, mm: p.mm, cd: p.cd, brokerage: p.brokerage, k401: p.k401 });
  };

  const selectCustom = () => {
    // Clicking Custom locks us into Custom mode. Values are preserved as-is.
    setForceCustom(true);
  };

  // Status colors for the balance banner
  const bannerColor = isBalanced ? T.emerald : delta < 0 ? T.amber : T.oxblood;
  const bannerSoft = isBalanced ? T.emeraldSoft : delta < 0 ? T.amberSoft : T.oxbloodSoft;
  const bannerMessage = isBalanced
    ? 'Balanced, allocation totals 100%'
    : delta < 0
      ? `${Math.abs(delta)}% remaining to allocate`
      : `Over-allocated by ${delta}%`;

  return (
    <div className="mb-4">
      <div className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
        <div className="text-[11px] uppercase tracking-[0.12em]" style={{ color: T.muted, fontWeight: 500 }}>
          How surplus income is saved
        </div>
      </div>

      {/* Mode tabs, Custom + presets */}
      <div className="flex flex-wrap gap-1 mb-4 p-1" style={{
        background: T.surfaceWarm, border: `1px solid ${T.rule}`
      }}>
        <ModeTab
          label="Custom"
          active={activeMode === 'custom'}
          onClick={selectCustom}
          activeColor={T.ink}
        />
        <ModeTab
          label="Aggressive"
          active={activeMode === 'aggressive'}
          onClick={() => applyPreset('aggressive')}
          activeColor={T.emerald}
        />
        <ModeTab
          label="Balanced"
          active={activeMode === 'balanced'}
          onClick={() => applyPreset('balanced')}
          activeColor={T.navy}
        />
        <ModeTab
          label="Conservative"
          active={activeMode === 'conservative'}
          onClick={() => applyPreset('conservative')}
          activeColor={T.amber}
        />
        <ModeTab
          label="Equal split"
          active={activeMode === 'equal'}
          onClick={() => applyPreset('equal')}
          activeColor={T.muted}
        />
      </div>

      {/* Balance status banner, visible at all times in custom mode */}
      <div
        className="mb-4 px-3 py-2.5 flex items-center justify-between gap-3 flex-wrap"
        style={{ background: bannerSoft, border: `1px solid ${bannerColor}40` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {isBalanced ? (
            <Check size={14} style={{ color: bannerColor, flexShrink: 0 }} strokeWidth={2} />
          ) : (
            <AlertTriangle size={14} style={{ color: bannerColor, flexShrink: 0 }} strokeWidth={1.75} />
          )}
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span style={{
                fontFamily: MONO_FONT, fontSize: 16, fontWeight: 700,
                color: bannerColor, fontVariantNumeric: 'tabular-nums'
              }}>
                {totalPct}%
              </span>
              <span className="text-[11px]" style={{ color: bannerColor, fontWeight: 600 }}>
                {bannerMessage}
              </span>
            </div>
          </div>
        </div>
        {!isBalanced && (
          <button
            onClick={autoBalance}
            className="px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] transition-opacity hover:opacity-80 shrink-0"
            style={{
              background: bannerColor, color: T.surface,
              fontFamily: BODY_FONT, fontWeight: 600
            }}
          >
            Auto-balance to 100%
          </button>
        )}
      </div>

      {/* Stacked bar visualization, shows actual proportions */}
      <div className="flex mb-4" style={{ height: 8, background: T.ruleLight, overflow: 'hidden' }}>
        {buckets.map(b => {
          const pct = (allocation[b.key] || 0) * 100;
          if (pct <= 0) return null;
          // Cap individual bar widths to total so the bar never overflows visually
          const cappedWidth = Math.min(pct, totalPct > 0 ? 100 * (pct / Math.max(totalPct, 100)) : pct);
          return (
            <div
              key={b.key}
              title={`${b.label}: ${pct.toFixed(0)}%`}
              style={{
                width: `${cappedWidth}%`,
                background: b.color,
                opacity: b.key === 'cash' ? 0.4 : b.key === 'mm' ? 0.6 : b.key === 'cd' ? 0.8 : 1,
                transition: 'width 200ms'
              }}
            />
          );
        })}
      </div>

      {/* Per-bucket sliders */}
      <div className="space-y-3">
        {buckets.map(b => {
          const pct = Math.round((allocation[b.key] || 0) * 100);
          // Effective share of currently allocated total (helpful when not at 100%)
          const effectiveShare = totalPct > 0 ? Math.round((pct / totalPct) * 100) : 0;
          return (
            <div key={b.key}>
              <div className="flex items-center justify-between mb-1 gap-2">
                <span className="text-[12px]" style={{ color: T.ink, fontWeight: 500, fontFamily: BODY_FONT }}>
                  {b.label}
                </span>
                <div className="flex items-baseline gap-1.5 shrink-0">
                  {!isBalanced && pct > 0 && (
                    <span className="text-[10px]" style={{
                      color: T.muted, fontFamily: MONO_FONT
                    }}>
                      ({effectiveShare}% of allocated)
                    </span>
                  )}
                  <EditablePct
                    pct={pct}
                    onCommit={(next) => handleSliderChange(b.key, next)}
                  />
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={pct}
                onChange={(e) => handleSliderChange(b.key, parseInt(e.target.value, 10))}
                className="w-full"
                style={{ accentColor: b.color }}
              />
            </div>
          );
        })}
      </div>

      <p className="text-[11px] mt-4" style={{ color: T.muted, fontStyle: 'italic', lineHeight: 1.5 }}>
        Each slider moves independently, adjust them to your own allocation. The banner above shows whether you're balanced; click "Auto-balance" to scale them proportionally to 100%, or pick a preset above. The 401(k) honors the IRS contribution cap (~$23.5K/yr) regardless of allocation; any overflow shifts to brokerage. While retired, 401(k) contributions stop and that share goes to brokerage.
      </p>
    </div>
  );
}

function ModeTab({ label, active, onClick, activeColor }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] transition-colors flex-1 sm:flex-none"
      style={{
        fontFamily: BODY_FONT,
        fontWeight: active ? 600 : 500,
        background: active ? activeColor : 'transparent',
        color: active ? T.surface : activeColor,
        cursor: 'pointer',
        minWidth: 'fit-content'
      }}
    >
      {label}
    </button>
  );
}

function VehicleCard({ vehicle, onUpdate, onRemove, currentAge, lifeExpectancy }) {
  const [open, setOpen] = useState(false);
  const update = (k, v) => onUpdate({ ...vehicle, [k]: v });
  const isLease = !!vehicle.lease;
  const equity = Math.max(0, (vehicle.value || 0) - (vehicle.loanBalance || 0));
  const hasLoan = vehicle.loanBalance > 0;

  return (
    <div className="mb-3" style={{ background: T.surfaceWarm, border: `1px solid ${T.rule}` }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3"
        style={{ background: 'transparent' }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Car size={14} style={{ color: isLease ? T.amber : T.navy }} strokeWidth={1.5} />
          <span className="text-[14px] truncate text-left" style={{ fontWeight: 500, color: T.ink, fontFamily: BODY_FONT }}>
            {vehicle.label}
          </span>
          {isLease && (
            <span className="text-[9px] px-1.5 py-0.5 uppercase tracking-[0.1em] shrink-0" style={{
              background: T.amberSoft, color: T.amber, fontWeight: 600, fontFamily: BODY_FONT
            }}>
              Lease
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            {isLease ? (
              <>
                <div className="text-[12px]" style={{ color: T.ink, fontFamily: MONO_FONT, fontVariantNumeric: 'tabular-nums' }}>
                  ${vehicle.loanMonthly}/mo
                </div>
                <div className="text-[10px]" style={{ color: T.muted, fontFamily: MONO_FONT }}>
                  thru age {vehicle.leaseEndAge ?? '—'}
                </div>
              </>
            ) : (
              <>
                <div className="text-[12px]" style={{ color: T.ink, fontFamily: MONO_FONT, fontVariantNumeric: 'tabular-nums' }}>
                  {fmt$Full(vehicle.value)}
                </div>
                <div className="text-[10px]" style={{ color: T.muted, fontFamily: MONO_FONT }}>
                  {hasLoan ? `${fmt$Full(equity)} equity` : 'owned outright'}
                </div>
              </>
            )}
          </div>
          <ChevronDown size={14} style={{ color: T.muted, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }} strokeWidth={1.5} />
        </div>
      </button>

      {open && (
        <div className="px-4 pt-3 pb-4" style={{ borderTop: `1px solid ${T.ruleLight}` }}>
          <div className="mb-4">
            <label className="text-[12px] uppercase tracking-[0.12em] block mb-1.5" style={{ color: T.muted, fontWeight: 500 }}>
              Label
            </label>
            <input
              type="text"
              value={vehicle.label}
              onChange={e => update('label', e.target.value)}
              placeholder="e.g., 2023 Toyota RAV4"
              className="bg-transparent outline-none w-full py-1.5 text-[14px]"
              style={{ color: T.ink, fontFamily: BODY_FONT, fontWeight: 500, borderBottom: `1px solid ${T.rule}` }}
            />
          </div>

          {/* Own vs lease toggle */}
          <div className="mb-4 flex items-stretch" style={{ border: `1px solid ${T.rule}`, background: T.surface }}>
            <button
              onClick={() => onUpdate({ ...vehicle, lease: false })}
              className="flex-1 px-3 py-2 text-[11px] uppercase tracking-[0.1em] transition-colors"
              style={{
                fontWeight: !isLease ? 600 : 500,
                fontFamily: BODY_FONT,
                background: !isLease ? T.navy : 'transparent',
                color: !isLease ? T.surface : T.navy,
                cursor: 'pointer'
              }}
            >
              Owned
            </button>
            <button
              onClick={() => onUpdate({ ...vehicle, lease: true, leaseEndAge: vehicle.leaseEndAge ?? Math.min(currentAge + 3, lifeExpectancy) })}
              className="flex-1 px-3 py-2 text-[11px] uppercase tracking-[0.1em] transition-colors"
              style={{
                fontWeight: isLease ? 600 : 500,
                fontFamily: BODY_FONT,
                background: isLease ? T.amber : 'transparent',
                color: isLease ? T.surface : T.amber,
                borderLeft: `1px solid ${T.rule}`,
                cursor: 'pointer'
              }}
            >
              Leased
            </button>
          </div>

          {isLease ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <NumInput label="Monthly lease payment" value={vehicle.loanMonthly} onChange={v => update('loanMonthly', v)} step={25} />
                <Slider
                  label="Lease ends at age"
                  value={vehicle.leaseEndAge ?? (currentAge + 3)}
                  onChange={v => update('leaseEndAge', v)}
                  min={currentAge}
                  max={lifeExpectancy}
                  step={1}
                  help="Age at which the lease ends. Vehicle returns to lessor."
                />
              </div>
              <p className="text-[11px] mt-2" style={{ color: T.muted, fontStyle: 'italic' }}>
                Leased vehicles don't appear in your net worth (you don't own them). Monthly payments stop when the lease ends. If you plan to lease another vehicle after this one, add a new vehicle below.
              </p>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <NumInput label="Current value" value={vehicle.value} onChange={v => update('value', v)} step={1000} />
                <Slider label="Annual depreciation" value={vehicle.depreciation} onChange={v => update('depreciation', v)} min={0} max={0.30} step={0.01} fmt={fmtPct}
                  help="Cars typically depreciate 15–20% per year for the first few years." />
              </div>
              <div className="text-[11px] uppercase tracking-[0.12em] mt-3 mb-2" style={{ color: T.muted, fontWeight: 500 }}>
                Loan (if any)
              </div>
              <div className="grid grid-cols-2 gap-4">
                <NumInput label="Loan balance" value={vehicle.loanBalance} onChange={v => update('loanBalance', v)} step={500} />
                <Slider label="Loan rate" value={vehicle.loanRate} onChange={v => update('loanRate', v)} min={0} max={0.15} step={0.0025} fmt={fmtPct} />
              </div>
              <NumInput label="Monthly payment" value={vehicle.loanMonthly} onChange={v => update('loanMonthly', v)} step={25} />
            </>
          )}

          <button
            onClick={onRemove}
            className="flex items-center gap-1.5 mt-2 py-1 text-[11px] uppercase tracking-[0.12em]"
            style={{ color: T.oxblood, fontWeight: 500, background: 'transparent' }}
          >
            <Trash2 size={12} strokeWidth={1.5} />
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

function DebtCard({ debt, onUpdate, onRemove }) {
  const [open, setOpen] = useState(false);
  const update = (k, v) => onUpdate({ ...debt, [k]: v });
  const annualInterest = debt.balance * debt.rate;
  const annualPayment = debt.monthlyPayment * 12;
  const principalCoverage = annualPayment - annualInterest;
  const isUnderwater = principalCoverage < 0 && debt.balance > 0;

  return (
    <div className="mb-3" style={{ background: T.surfaceWarm, border: `1px solid ${isUnderwater ? T.oxblood : T.rule}` }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3"
        style={{ background: 'transparent' }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <CreditCard size={14} style={{ color: T.oxblood }} strokeWidth={1.5} />
          <span className="text-[14px] truncate text-left" style={{ fontWeight: 500, color: T.ink, fontFamily: BODY_FONT }}>
            {debt.label}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[12px]" style={{ color: T.ink, fontFamily: MONO_FONT, fontVariantNumeric: 'tabular-nums' }}>
              {fmt$Full(debt.balance)}
            </div>
            <div className="text-[10px]" style={{ color: isUnderwater ? T.oxblood : T.muted, fontFamily: MONO_FONT }}>
              {(debt.rate * 100).toFixed(1)}% APR{isUnderwater ? ' · growing' : ''}
            </div>
          </div>
          <ChevronDown size={14} style={{ color: T.muted, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }} strokeWidth={1.5} />
        </div>
      </button>

      {open && (
        <div className="px-4 pt-3 pb-4" style={{ borderTop: `1px solid ${T.ruleLight}` }}>
          <div className="mb-4">
            <label className="text-[12px] uppercase tracking-[0.12em] block mb-1.5" style={{ color: T.muted, fontWeight: 500 }}>
              Label
            </label>
            <input
              type="text"
              value={debt.label}
              onChange={e => update('label', e.target.value)}
              placeholder="e.g., Chase Sapphire, Student loan"
              className="bg-transparent outline-none w-full py-1.5 text-[14px]"
              style={{ color: T.ink, fontFamily: BODY_FONT, fontWeight: 500, borderBottom: `1px solid ${T.rule}` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <NumInput label="Current balance" value={debt.balance} onChange={v => update('balance', v)} step={100} />
            <Slider label="APR" value={debt.rate} onChange={v => update('rate', v)} min={0} max={0.30} step={0.0025} fmt={fmtPct}
              help="Credit cards: 18–25%. Student loans: 5–8%. Personal loans: 8–15%." />
          </div>
          <NumInput label="Monthly payment" value={debt.monthlyPayment} onChange={v => update('monthlyPayment', v)} step={25} />
          {isUnderwater && (
            <p className="text-[11px] mt-2 p-2" style={{ color: T.oxblood, background: T.oxbloodSoft, fontStyle: 'italic' }}>
              Warning: monthly payment {fmt$Full(annualPayment)} doesn't cover annual interest {fmt$Full(annualInterest)}. Balance will grow over time.
            </p>
          )}
          <button
            onClick={onRemove}
            className="flex items-center gap-1.5 mt-2 py-1 text-[11px] uppercase tracking-[0.12em]"
            style={{ color: T.oxblood, fontWeight: 500, background: 'transparent' }}
          >
            <Trash2 size={12} strokeWidth={1.5} />
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

function OtherAssetCard({ asset, onUpdate, onRemove }) {
  const [open, setOpen] = useState(false);
  const update = (k, v) => onUpdate({ ...asset, [k]: v });

  return (
    <div className="mb-3" style={{ background: T.surfaceWarm, border: `1px solid ${T.rule}` }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3"
        style={{ background: 'transparent' }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Package size={14} style={{ color: T.muted }} strokeWidth={1.5} />
          <span className="text-[14px] truncate text-left" style={{ fontWeight: 500, color: T.ink, fontFamily: BODY_FONT }}>
            {asset.label}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[12px]" style={{ color: T.ink, fontFamily: MONO_FONT, fontVariantNumeric: 'tabular-nums' }}>
              {fmt$Full(asset.value)}
            </div>
            <div className="text-[10px]" style={{ color: T.muted, fontFamily: MONO_FONT }}>
              {asset.growthRate > 0 ? `+${(asset.growthRate * 100).toFixed(1)}%/yr` : asset.growthRate < 0 ? `${(asset.growthRate * 100).toFixed(1)}%/yr` : 'flat'}
            </div>
          </div>
          <ChevronDown size={14} style={{ color: T.muted, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }} strokeWidth={1.5} />
        </div>
      </button>

      {open && (
        <div className="px-4 pt-3 pb-4" style={{ borderTop: `1px solid ${T.ruleLight}` }}>
          <div className="mb-4">
            <label className="text-[12px] uppercase tracking-[0.12em] block mb-1.5" style={{ color: T.muted, fontWeight: 500 }}>
              Label
            </label>
            <input
              type="text"
              value={asset.label}
              onChange={e => update('label', e.target.value)}
              placeholder="e.g., Art collection, Crypto, Business stake"
              className="bg-transparent outline-none w-full py-1.5 text-[14px]"
              style={{ color: T.ink, fontFamily: BODY_FONT, fontWeight: 500, borderBottom: `1px solid ${T.rule}` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <NumInput label="Current value" value={asset.value} onChange={v => update('value', v)} step={1000} />
            <Slider label="Annual growth" value={asset.growthRate} onChange={v => update('growthRate', v)} min={-0.10} max={0.15} step={0.005} fmt={fmtPct}
              help="Use 0% for stable assets like jewelry, positive for appreciating, negative for depreciating." />
          </div>
          <button
            onClick={onRemove}
            className="flex items-center gap-1.5 mt-2 py-1 text-[11px] uppercase tracking-[0.12em]"
            style={{ color: T.oxblood, fontWeight: 500, background: 'transparent' }}
          >
            <Trash2 size={12} strokeWidth={1.5} />
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

function AutoStat({ label, value, tone, help }) {
  const color = tone === 'good' ? T.emerald : tone === 'bad' ? T.oxblood : T.ink;
  return (
    <div title={help || undefined} className="min-w-0">
      <div className="text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: T.muted, fontWeight: 500, lineHeight: 1.3 }}>
        {label}
      </div>
      <div style={{
        fontFamily: DISPLAY_FONT, fontSize: 'clamp(15px, 3.5vw, 20px)', fontWeight: 500,
        color, fontVariantNumeric: 'tabular-nums', wordBreak: 'break-word', lineHeight: 1.15
      }}>
        {value}
      </div>
    </div>
  );
}

function NetWorthInspector({ snapshot, snapshotNoInh, inheritanceReceived, inspectorAge, minAge, maxAge, onAgeChange, isCurrent, scenario, onScenarioChange, onAuditYear }) {
  if (!snapshot) return null;

  const hasInheritances = snapshotNoInh !== null && snapshotNoInh !== undefined;
  const inheritanceImpact = hasInheritances ? snapshot.netWorth - snapshotNoInh.netWorth : 0;

  const scenarioMeta = {
    cons: { label: 'Conservative', color: T.oxblood, blurb: 'Returns −2pts · expenses +12% · life +3 yrs' },
    mod:  { label: 'Moderate',     color: T.ink,     blurb: 'Your inputs as-is' },
    opt:  { label: 'Optimistic',   color: T.emerald, blurb: 'Returns +1.5pts · expenses −8% · life −2 yrs' }
  };
  const meta = scenarioMeta[scenario];

  const assets = [
    { label: 'Cash', value: snapshot.cash, color: T.muted },
    { label: 'Money market', value: snapshot.mm, color: T.muted },
    { label: 'CDs', value: snapshot.cd, color: T.muted },
    { label: 'Brokerage', value: snapshot.brokerage, color: T.emerald },
    { label: '401(k) / IRA', value: snapshot.k401, color: T.emerald },
    { label: '529 (college)', value: snapshot.c529, color: T.amber },
    { label: 'Real estate', value: snapshot.homeValue, color: T.navy },
    { label: 'Vehicles', value: snapshot.vehicleValue, color: T.navy },
    { label: 'Other assets', value: snapshot.otherAssets, color: T.navy }
  ].filter(a => a.value > 0);

  const liabilities = [
    { label: 'Mortgages', value: snapshot.mortgage, color: T.oxblood },
    { label: 'Vehicle loans', value: snapshot.vehicleLoans, color: T.oxblood },
    { label: 'Other debts', value: snapshot.otherDebts, color: T.oxblood }
  ].filter(l => l.value > 0);

  // When viewing "today" (currentAge) the values are inputs as-entered, identical across all scenarios.
  // The scenario toggle only matters for projected views, so we visually de-emphasize it when viewing today.
  const scenarioMattersHere = !isCurrent;

  return (
    <div className="mb-10 p-4 sm:p-7" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
      <div className="flex items-start justify-between mb-1 gap-3 sm:gap-4 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Scale size={14} style={{ color: T.ink, flexShrink: 0 }} strokeWidth={1.5} />
          <h2 style={{
            fontFamily: DISPLAY_FONT, fontSize: 'clamp(17px, 4vw, 22px)', fontWeight: 500,
            letterSpacing: '-0.01em', color: T.ink, lineHeight: 1.2
          }}>
            {isCurrent ? 'Current net worth' : `Projected net worth at age ${inspectorAge}`}
          </h2>
        </div>

        {/* Scenario toggle, segmented control */}
        <div className="flex flex-col items-stretch sm:items-end gap-1 w-full sm:w-auto">
          <div className="flex items-stretch w-full sm:w-auto" style={{
            border: `1px solid ${T.rule}`, background: T.surfaceWarm,
            opacity: scenarioMattersHere ? 1 : 0.5
          }}>
            {[
              { key: 'cons', label: 'Conservative', color: T.oxblood },
              { key: 'mod',  label: 'Moderate',     color: T.ink },
              { key: 'opt',  label: 'Optimistic',   color: T.emerald }
            ].map((s, i) => {
              const active = scenario === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => onScenarioChange(s.key)}
                  className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 text-[10px] sm:text-[11px] uppercase tracking-[0.08em] sm:tracking-[0.1em] transition-colors"
                  style={{
                    fontWeight: active ? 600 : 500,
                    fontFamily: BODY_FONT,
                    background: active ? s.color : 'transparent',
                    color: active ? T.surface : s.color,
                    borderLeft: i > 0 ? `1px solid ${T.rule}` : 'none',
                    cursor: 'pointer'
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          <div className="text-[10px] hidden sm:block" style={{
            color: meta.color, fontFamily: MONO_FONT,
            opacity: scenarioMattersHere ? 1 : 0.5, fontStyle: 'italic'
          }}>
            {meta.blurb}
          </div>
        </div>
      </div>

      <p className="text-[12px] mb-5" style={{ color: T.muted, fontStyle: 'italic' }}>
        Drag the slider to inspect any age. {isCurrent ? 'Showing today, values exactly as entered, before any simulation runs. Scenario choice does not affect today\'s view.' : `Showing the ${meta.label.toLowerCase()} scenario, values reflect projected balances after growth, depreciation, and debt paydown.`}
      </p>

      {/* Age slider */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-2 text-[10px] uppercase tracking-[0.12em]" style={{ color: T.muted, fontWeight: 500 }}>
          <span>Age {minAge}</span>
          <span style={{ color: T.ink, fontFamily: DISPLAY_FONT, fontSize: 16, fontWeight: 500, textTransform: 'none', letterSpacing: '-0.01em' }}>
            Inspecting age {inspectorAge}
          </span>
          <span>Age {maxAge}</span>
        </div>
        <input
          type="range"
          min={minAge}
          max={maxAge}
          step={1}
          value={inspectorAge}
          onChange={(e) => onAgeChange(parseInt(e.target.value, 10))}
          className="w-full"
          style={{ accentColor: T.ink }}
        />
        <div className="flex items-center justify-between mt-1.5">
          <button
            onClick={() => onAgeChange(minAge)}
            className="text-[11px] transition-opacity hover:opacity-60"
            style={{ color: T.muted, background: 'transparent' }}
          >
            ← Now
          </button>
          <button
            onClick={() => onAgeChange(null)}
            className="text-[11px] transition-opacity hover:opacity-60"
            style={{ color: T.emerald, background: 'transparent', fontWeight: 500 }}
          >
            Reset to current
          </button>
          <button
            onClick={() => onAgeChange(maxAge)}
            className="text-[11px] transition-opacity hover:opacity-60"
            style={{ color: T.muted, background: 'transparent' }}
          >
            End of life →
          </button>
        </div>
        {!isCurrent && onAuditYear && (
          <button
            onClick={onAuditYear}
            className="mt-3 w-full py-2 flex items-center justify-center gap-2 transition-opacity hover:opacity-80"
            style={{
              background: T.ink, color: T.surface,
              fontFamily: BODY_FONT, fontWeight: 600,
              fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase'
            }}
          >
            <Receipt size={12} strokeWidth={1.5} />
            Audit income & expenses for age {inspectorAge}
          </button>
        )}
      </div>

      {/* Headline net worth + ratio bar */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6 pb-6" style={{ borderBottom: `1px solid ${T.ruleLight}` }}>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: T.muted, fontWeight: 500 }}>Total assets</div>
          <div style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(16px, 4.5vw, 28px)', fontWeight: 500, color: T.emerald, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em', wordBreak: 'break-word' }}>
            {fmt$Full(snapshot.totalAssets)}
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: T.muted, fontWeight: 500 }}>Total liabilities</div>
          <div style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(16px, 4.5vw, 28px)', fontWeight: 500, color: T.oxblood, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em', wordBreak: 'break-word' }}>
            {fmt$Full(snapshot.totalLiabilities)}
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: T.muted, fontWeight: 500 }}>Net worth</div>
          <div style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(18px, 5vw, 32px)', fontWeight: 600, color: snapshot.netWorth >= 0 ? T.ink : T.oxblood, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em', wordBreak: 'break-word' }}>
            {fmt$Full(snapshot.netWorth)}
          </div>
        </div>
      </div>

      {/* Inheritance impact attribution */}
      {hasInheritances && inheritanceReceived > 0 && !isCurrent && (
        <div className="mb-6 p-4" style={{ background: T.amberSoft, border: `1px solid ${T.amber}30` }}>
          <div className="flex items-start gap-3">
            <Gift size={14} style={{ color: T.amber, marginTop: 2 }} strokeWidth={1.5} />
            <div className="flex-1">
              <div className="text-[11px] uppercase tracking-[0.12em] mb-2" style={{ color: T.amber, fontWeight: 600 }}>
                Inheritance impact at this age
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-2">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.1em] mb-0.5" style={{ color: T.muted, fontWeight: 500 }}>Received to date</div>
                  <div style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(15px, 3.5vw, 18px)', fontWeight: 500, color: T.ink, fontVariantNumeric: 'tabular-nums', wordBreak: 'break-word' }}>
                    {fmt$Full(inheritanceReceived)}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.1em] mb-0.5" style={{ color: T.muted, fontWeight: 500 }}>Net worth without inheritances</div>
                  <div style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(15px, 3.5vw, 18px)', fontWeight: 500, color: T.inkSoft, fontVariantNumeric: 'tabular-nums', wordBreak: 'break-word' }}>
                    {fmt$Full(snapshotNoInh.netWorth)}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.1em] mb-0.5" style={{ color: T.muted, fontWeight: 500 }}>Net worth difference</div>
                  <div style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(15px, 3.5vw, 18px)', fontWeight: 600, color: T.emerald, fontVariantNumeric: 'tabular-nums', wordBreak: 'break-word' }}>
                    +{fmt$Full(inheritanceImpact)}
                  </div>
                </div>
              </div>
              {inheritanceImpact < inheritanceReceived * 0.95 && (
                <p className="text-[11px] mt-2" style={{ color: T.inkSoft, lineHeight: 1.5 }}>
                  Net worth went up by less than the inheritance amount because some of it has already been spent on retirement living costs that would otherwise have drained other accounts. The full {fmt$Full(inheritanceReceived)} did arrive, it's funding {fmt$Full(inheritanceReceived - inheritanceImpact)} of cumulative spending plus adding {fmt$Full(inheritanceImpact)} of lasting net worth (after market growth).
                </p>
              )}
              {inheritanceImpact > inheritanceReceived * 1.05 && (
                <p className="text-[11px] mt-2" style={{ color: T.inkSoft, lineHeight: 1.5 }}>
                  Net worth went up by more than the inheritance amount because the funds have been invested and grown since arrival, plus you've avoided drawing down other accounts that would have otherwise been spent (those balances have continued to grow too).
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assets / Liabilities side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] uppercase tracking-[0.15em]" style={{ color: T.emerald, fontWeight: 600 }}>
              Assets
            </div>
            <div className="text-[11px]" style={{ color: T.muted, fontFamily: MONO_FONT }}>
              {fmt$Full(snapshot.totalAssets)}
            </div>
          </div>
          {assets.length === 0 ? (
            <p className="text-[12px]" style={{ color: T.muted, fontStyle: 'italic' }}>None</p>
          ) : (
            <div className="space-y-2">
              {assets.map(a => {
                const pct = snapshot.totalAssets > 0 ? (a.value / snapshot.totalAssets) * 100 : 0;
                return (
                  <div key={a.label}>
                    <div className="flex items-center justify-between text-[12px] mb-1">
                      <span style={{ color: T.inkSoft, fontWeight: 500 }}>{a.label}</span>
                      <span style={{ color: T.ink, fontFamily: MONO_FONT, fontVariantNumeric: 'tabular-nums' }}>
                        {fmt$Full(a.value)}
                      </span>
                    </div>
                    <div style={{ height: 4, background: T.ruleLight, position: 'relative' }}>
                      <div style={{
                        width: `${pct}%`, height: '100%',
                        background: a.color, transition: 'width 200ms'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] uppercase tracking-[0.15em]" style={{ color: T.oxblood, fontWeight: 600 }}>
              Liabilities
            </div>
            <div className="text-[11px]" style={{ color: T.muted, fontFamily: MONO_FONT }}>
              {fmt$Full(snapshot.totalLiabilities)}
            </div>
          </div>
          {liabilities.length === 0 ? (
            <p className="text-[12px]" style={{ color: T.muted, fontStyle: 'italic' }}>Debt-free</p>
          ) : (
            <div className="space-y-2">
              {liabilities.map(l => {
                const pct = snapshot.totalLiabilities > 0 ? (l.value / snapshot.totalLiabilities) * 100 : 0;
                return (
                  <div key={l.label}>
                    <div className="flex items-center justify-between text-[12px] mb-1">
                      <span style={{ color: T.inkSoft, fontWeight: 500 }}>{l.label}</span>
                      <span style={{ color: T.ink, fontFamily: MONO_FONT, fontVariantNumeric: 'tabular-nums' }}>
                        {fmt$Full(l.value)}
                      </span>
                    </div>
                    <div style={{ height: 4, background: T.ruleLight, position: 'relative' }}>
                      <div style={{
                        width: `${pct}%`, height: '100%',
                        background: l.color, transition: 'width 200ms'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function YearAuditDrawer({ year, scenario, onClose, onScenarioChange, currentAge, retirementAge }) {
  if (!year) return null;

  const scenarioMeta = {
    cons: { label: 'Conservative', color: T.oxblood },
    mod:  { label: 'Moderate', color: T.ink },
    opt:  { label: 'Optimistic', color: T.emerald }
  };

  const yearsFromNow = year.age - currentAge;
  const phase = year.age < retirementAge
    ? 'Working years'
    : year.age < (retirementAge + 5) ? 'Early retirement'
    : year.age < 75 ? 'Retirement'
    : 'Late retirement';

  // Income lines
  const incomes = [
    { label: 'Salary', value: year.salary, hint: year.isWorking ? 'From employment' : null },
    { label: 'Social Security', value: year.ssIncome, hint: 'Inflation-adjusted from your benefit' },
    { label: 'Other income', value: year.altIncome, hint: 'Pension, part-time, etc.' },
    { label: 'Rental income', value: year.rentalIncome, hint: 'Net of vacancy & maintenance' },
    { label: 'Inheritance received', value: year.inheritance, hint: year.inheritance > 0 ? 'Tax-free, deposited to brokerage' : null }
  ].filter(i => i.value > 0);

  const totalIncome = incomes.reduce((s, i) => s + i.value, 0);

  // Expense lines
  const expenses = [
    { label: 'Living expenses', value: year.livingExpenses, hint: 'Groceries, utilities, transport, etc.' },
    { label: 'Healthcare', value: year.healthcare, hint: year.age < 65 ? 'Pre-Medicare (private/ACA)' : 'Medicare + supplement + Part D' },
    { label: 'College', value: year.college, hint: 'Out-of-pocket after 529' },
    { label: 'Rent', value: year.rentPayment, hint: 'Increases yearly with rent inflation' },
    { label: 'Mortgage payments', value: year.mortgagePayment, hint: 'Principal + interest only' },
    { label: 'Property tax', value: year.propertyTax, hint: 'On all properties' },
    { label: 'Vehicle loan payments', value: year.vehicleLoanPayments },
    { label: 'Other debt payments', value: year.debtPayments, hint: 'Credit cards, student loans, etc.' },
    { label: 'Income taxes', value: year.taxes, hint: 'Federal + state + payroll + LTCG' }
  ].filter(e => e.value > 0);

  const totalExpenses = expenses.reduce((s, e) => s + e.value, 0);
  const surplus = totalIncome - totalExpenses;

  // Asset flows
  const flows = year.flows || {};
  const surplusFlows = [
    { label: 'Saved to cash', value: flows.surplusToCash, color: T.emerald },
    { label: 'Saved to money market', value: flows.surplusToMM, color: T.emerald },
    { label: 'Saved to CDs', value: flows.surplusToCD, color: T.emerald },
    { label: 'Saved to brokerage', value: flows.surplusToBrokerage, color: T.emerald },
    { label: 'Saved to 401(k)', value: flows.surplusToK401, color: T.emerald, hint: year.isWorking ? null : '401(k) only accepts contributions while employed' }
  ].filter(f => f.value > 0);
  const drawFlows = [
    { label: 'Drawn from cash', value: flows.drawFromCash, color: T.oxblood },
    { label: 'Drawn from money market', value: flows.drawFromMM, color: T.oxblood },
    { label: 'Drawn from CDs', value: flows.drawFromCD, color: T.oxblood },
    { label: 'Drawn from brokerage', value: flows.drawFromBrokerage, color: T.oxblood },
    { label: 'Drawn from 401(k)', value: flows.drawFromK401, color: T.oxblood, hint: 'Includes ~20% extra to cover ordinary income tax' },
    { label: 'Tapped from home equity', value: flows.tapFromHomeEquity, color: T.oxblood }
  ].filter(f => f.value > 0);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(23, 21, 19, 0.5)',
        zIndex: 50, display: 'flex', justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.bg, width: '100%', maxWidth: 560,
          height: '100%', overflowY: 'auto', position: 'relative',
          boxShadow: '-12px 0 32px rgba(0,0,0,0.15)'
        }}
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 px-5 sm:px-7 py-4 sm:py-5" style={{
          background: T.bg, borderBottom: `1px solid ${T.rule}`
        }}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1" style={{ color: T.muted }}>
                <Receipt size={11} strokeWidth={1.5} />
                <span className="text-[10px] uppercase tracking-[0.2em]" style={{ fontWeight: 600 }}>
                  {phase} · {yearsFromNow === 0 ? 'today' : yearsFromNow < 0 ? `${-yearsFromNow} yrs ago` : `${yearsFromNow} yrs from now`}
                </span>
              </div>
              <h2 style={{
                fontFamily: DISPLAY_FONT, fontSize: 26, fontWeight: 500,
                letterSpacing: '-0.01em', color: T.ink, lineHeight: 1.1
              }}>
                Year audit · age {year.age}
              </h2>
            </div>
            <button onClick={onClose} className="p-1 hover:opacity-60" style={{ background: 'transparent' }}>
              <X size={18} style={{ color: T.muted }} strokeWidth={1.5} />
            </button>
          </div>

          {/* Scenario toggle inside drawer */}
          <div className="flex items-stretch mt-3" style={{
            border: `1px solid ${T.rule}`, background: T.surface
          }}>
            {['cons', 'mod', 'opt'].map((s, i) => {
              const active = scenario === s;
              const m = scenarioMeta[s];
              return (
                <button
                  key={s}
                  onClick={() => onScenarioChange(s)}
                  className="flex-1 px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] transition-colors"
                  style={{
                    fontWeight: active ? 600 : 500,
                    fontFamily: BODY_FONT,
                    background: active ? m.color : 'transparent',
                    color: active ? T.surface : m.color,
                    borderLeft: i > 0 ? `1px solid ${T.rule}` : 'none',
                    cursor: 'pointer'
                  }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="px-5 sm:px-7 py-5 sm:py-6">
          {/* Headline summary */}
          <div className="mb-7 grid grid-cols-3 gap-2 sm:gap-4 pb-6" style={{ borderBottom: `1px solid ${T.rule}` }}>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: T.muted, fontWeight: 500 }}>Income</div>
              <div style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(14px, 4vw, 22px)', fontWeight: 500, color: T.emerald, fontVariantNumeric: 'tabular-nums', wordBreak: 'break-word', lineHeight: 1.15 }}>
                {fmt$Full(totalIncome)}
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: T.muted, fontWeight: 500 }}>Expenses</div>
              <div style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(14px, 4vw, 22px)', fontWeight: 500, color: T.oxblood, fontVariantNumeric: 'tabular-nums', wordBreak: 'break-word', lineHeight: 1.15 }}>
                {fmt$Full(totalExpenses)}
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: T.muted, fontWeight: 500 }}>{surplus >= 0 ? 'Surplus' : 'Shortfall'}</div>
              <div style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(14px, 4vw, 22px)', fontWeight: 600, color: surplus >= 0 ? T.emerald : T.oxblood, fontVariantNumeric: 'tabular-nums', wordBreak: 'break-word', lineHeight: 1.15 }}>
                {surplus >= 0 ? '+' : ''}{fmt$Full(surplus)}
              </div>
            </div>
          </div>

          {/* Income breakdown */}
          <div className="mb-8">
            <div className="text-[11px] uppercase tracking-[0.15em] mb-3" style={{ color: T.emerald, fontWeight: 600 }}>
              Income sources
            </div>
            {incomes.length === 0 ? (
              <p className="text-[12px]" style={{ color: T.muted, fontStyle: 'italic' }}>No income this year.</p>
            ) : (
              <div className="space-y-2">
                {incomes.map(i => (
                  <BreakdownRow key={i.label} label={i.label} value={i.value} total={totalIncome} hint={i.hint} color={T.emerald} />
                ))}
              </div>
            )}
          </div>

          {/* Expense breakdown */}
          <div className="mb-8">
            <div className="text-[11px] uppercase tracking-[0.15em] mb-3" style={{ color: T.oxblood, fontWeight: 600 }}>
              Expense categories
            </div>
            {expenses.length === 0 ? (
              <p className="text-[12px]" style={{ color: T.muted, fontStyle: 'italic' }}>No expenses this year.</p>
            ) : (
              <div className="space-y-2">
                {expenses.map(e => (
                  <BreakdownRow key={e.label} label={e.label} value={e.value} total={totalExpenses} hint={e.hint} color={T.oxblood} />
                ))}
              </div>
            )}
          </div>

          {/* Account flows */}
          {(surplusFlows.length > 0 || drawFlows.length > 0) && (
            <div className="mb-8 p-4" style={{ background: T.surfaceWarm, border: `1px solid ${T.rule}` }}>
              <div className="text-[11px] uppercase tracking-[0.15em] mb-3" style={{ color: T.ink, fontWeight: 600 }}>
                {surplus >= 0 ? 'Where the surplus went' : 'Where the shortfall came from'}
              </div>
              <div className="space-y-2">
                {[...surplusFlows, ...drawFlows].map(f => (
                  <div key={f.label} className="flex items-center justify-between text-[13px]">
                    <div>
                      <span style={{ color: T.ink, fontWeight: 500 }}>{f.label}</span>
                      {f.hint && (
                        <div className="text-[10px] mt-0.5" style={{ color: T.muted, fontStyle: 'italic' }}>{f.hint}</div>
                      )}
                    </div>
                    <span style={{ color: f.color, fontFamily: MONO_FONT, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                      {surplus >= 0 ? '+' : '−'}{fmt$Full(f.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* End-of-year balances */}
          <div>
            <div className="text-[11px] uppercase tracking-[0.15em] mb-3" style={{ color: T.muted, fontWeight: 600 }}>
              End-of-year balances
            </div>
            <div className="space-y-1.5">
              <BalanceRow label="Cash" value={year.cash} />
              <BalanceRow label="Money market" value={year.mm} />
              <BalanceRow label="CDs" value={year.cd} />
              <BalanceRow label="Brokerage" value={year.brokerage} />
              <BalanceRow label="401(k) / IRA" value={year.k401} />
              {year.c529 > 0 && <BalanceRow label="529" value={year.c529} />}
              <BalanceRow label="Real estate value" value={year.homeValue} />
              <BalanceRow label="Mortgages remaining" value={-year.mortgage} negative />
              {year.vehicleValue > 0 && <BalanceRow label="Vehicles" value={year.vehicleValue} />}
              {year.vehicleLoans > 0 && <BalanceRow label="Vehicle loans" value={-year.vehicleLoans} negative />}
              {year.otherAssets > 0 && <BalanceRow label="Other assets" value={year.otherAssets} />}
              {year.otherDebts > 0 && <BalanceRow label="Other debts" value={-year.otherDebts} negative />}
              <div className="pt-2 mt-2 flex items-center justify-between" style={{ borderTop: `1px solid ${T.rule}` }}>
                <span className="text-[12px] uppercase tracking-[0.12em]" style={{ color: T.ink, fontWeight: 600 }}>Net worth</span>
                <span style={{ fontFamily: DISPLAY_FONT, fontSize: 18, fontWeight: 600, color: T.ink, fontVariantNumeric: 'tabular-nums' }}>
                  {fmt$Full(year.netWorth)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-5" style={{ borderTop: `1px solid ${T.rule}` }}>
            <p className="text-[11px]" style={{ color: T.muted, fontStyle: 'italic', lineHeight: 1.6 }}>
              All values are nominal (i.e., in then-current dollars), already adjusted for inflation from today. Switch the scenario toggle above to see how this year would look under different assumptions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MONTH AUDIT DRAWER (Job Loss Runway)
// ============================================================================
// Shown when the user clicks a month in the runway chart. Shows income,
// expenses, account balances, and which account got drawn from that month.
// Accepts a scenario toggle so the user can compare bare/typical/best for
// the same month without closing the drawer.
function MonthAuditDrawer({ month, scenario, onClose, onScenarioChange, runways, inp }) {
  if (!month) return null;

  const sim = runways[scenario];
  // Find the corresponding month in the active scenario's trajectory.
  // (User clicked month X in one scenario; show that same month X in whichever scenario is active.)
  const monthData = sim.trajectory.find(t => t.month === month.month);
  if (!monthData) {
    return (
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(23,21,19,0.5)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
        <div onClick={(e) => e.stopPropagation()} style={{ background: T.bg, width: '100%', maxWidth: 560, height: '100%', overflowY: 'auto', position: 'relative', boxShadow: '-12px 0 32px rgba(0,0,0,0.15)', padding: 32 }}>
          <div className="flex justify-between mb-4">
            <h2 style={{ fontFamily: DISPLAY_FONT, fontSize: 22, color: T.ink }}>Month not reached</h2>
            <button onClick={onClose}><X size={18} style={{ color: T.muted }} strokeWidth={1.5} /></button>
          </div>
          <p className="text-[13px]" style={{ color: T.inkSoft, lineHeight: 1.5 }}>
            In the <strong>{scenario}</strong> scenario, your liquid accounts were exhausted before month {month.month}. Switch to a more optimistic scenario to see further into the runway, or pick an earlier month.
          </p>
          <div className="flex items-stretch mt-4" style={{ border: `1px solid ${T.rule}`, background: T.surface }}>
            {['bare', 'typical', 'best'].map((s, i) => {
              const meta = { bare: 'Bare', typical: 'Realistic', best: 'Best' }[s];
              const active = scenario === s;
              return (
                <button key={s} onClick={() => onScenarioChange(s)} className="flex-1 py-2 transition-opacity hover:opacity-80" style={{
                  background: active ? T.ink : 'transparent',
                  color: active ? T.surface : T.muted,
                  fontFamily: BODY_FONT, fontWeight: active ? 700 : 500,
                  fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                  borderLeft: i > 0 ? `1px solid ${T.rule}` : 'none'
                }}>{meta}</button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const ageDecimal = monthData.age || (inp.currentAge + (monthData.month - 1) / 12);
  const ageDisplay = ageDecimal.toFixed(1);
  const yearsIntoLoss = ((monthData.month - 1) / 12).toFixed(1);

  // Income lines
  const incomeLines = [
    { label: 'Severance', value: monthData.severance, hint: monthData.severance > 0 ? `Month ${monthData.month} of severance schedule` : null },
    { label: 'Unemployment insurance', value: monthData.ui, hint: monthData.ui > 0 ? `Within UI eligibility window` : 'UI exhausted or not eligible' },
    { label: 'Gig / freelance', value: monthData.gig, hint: monthData.gig > 0 ? 'Pre-tax, monthly' : null },
    { label: 'Partner income', value: monthData.partnerIncome, hint: monthData.partnerIncome > 0 ? `${Math.round((inp.partnerIncomePortion || 0) * 100)}% of household income` : null },
    { label: 'Rental income (net)', value: monthData.rentalIncome, hint: 'After vacancy & maintenance' },
    { label: 'Other income', value: monthData.altIncome, hint: 'Pension, royalties, etc.' }
  ].filter(i => i.value > 0);
  const totalIncome = incomeLines.reduce((s, i) => s + i.value, 0);

  // Expense lines
  const expenseLines = [
    { label: 'Living expenses (adjusted)', value: monthData.livingExpenses, hint: 'After belt-tightening' },
    { label: 'COBRA / ACA premium', value: monthData.cobra, hint: 'Replaces employer health insurance' },
    { label: 'Mortgage payments', value: monthData.mortgage, hint: 'Principal + interest, all properties' },
    { label: 'Rent', value: monthData.rent },
    { label: 'Property tax', value: monthData.propertyTax, hint: 'Annual / 12, all properties' },
    { label: 'Vehicle loans/leases', value: monthData.vehicleLoans },
    { label: 'Other debt payments', value: monthData.debtPayments, hint: 'Credit cards, student loans' },
    { label: 'Active education costs', value: monthData.education, hint: 'Children currently in school' }
  ].filter(e => e.value > 0);
  const totalExpenses = expenseLines.reduce((s, e) => s + e.value, 0);

  const netFlow = totalIncome - totalExpenses;

  // Account state
  const accountLines = [
    { label: 'Cash', value: monthData.cash, color: T.muted, drawn: monthData.drawnFrom === 'cash' },
    { label: 'Money market', value: monthData.mm, color: T.muted, drawn: monthData.drawnFrom === 'mm' },
    { label: 'CDs', value: monthData.cd, color: T.muted, drawn: monthData.drawnFrom === 'cd' },
    { label: 'Brokerage', value: monthData.brokerage, color: T.emerald, drawn: monthData.drawnFrom === 'brokerage' },
  ];
  const totalLiquidEnd = monthData.totalLiquid;

  // Assumption summary chips
  const sevWindowEnd = sim.inputs.severanceMonths;
  const uiWindowEnd = sim.inputs.uiMaxMonths;
  const gigStart = sim.inputs.gigStart;
  const gigEnd = sim.inputs.gigEnd;
  const inSevWindow = monthData.month <= sevWindowEnd && sim.inputs.severanceTotal > 0;
  const inUiWindow = monthData.month <= uiWindowEnd && sim.inputs.uiMonthly > 0;
  const inGigWindow = monthData.month >= gigStart && monthData.month <= gigEnd && sim.inputs.gigMonthly > 0;

  // Runway proximity: how many months left in this scenario
  const monthsRemaining = sim.survivesAtCap
    ? '60+ months remaining'
    : sim.monthsLasted >= monthData.month
      ? `${sim.monthsLasted - monthData.month} months remaining`
      : 'Runway exhausted';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(23, 21, 19, 0.5)',
        zIndex: 50, display: 'flex', justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.bg, width: '100%', maxWidth: 560,
          height: '100%', overflowY: 'auto', position: 'relative',
          boxShadow: '-12px 0 32px rgba(0,0,0,0.15)'
        }}
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 px-5 sm:px-7 py-4 sm:py-5" style={{
          background: T.bg, borderBottom: `1px solid ${T.rule}`
        }}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1" style={{ color: T.muted }}>
                <Wind size={11} strokeWidth={1.5} />
                <span className="text-[10px] uppercase tracking-[0.2em]" style={{ fontWeight: 600 }}>
                  {yearsIntoLoss === '0.0' ? 'First month after job loss' : `${yearsIntoLoss} years into job loss`} · age {ageDisplay}
                </span>
              </div>
              <h2 style={{
                fontFamily: DISPLAY_FONT, fontSize: 26, fontWeight: 500,
                letterSpacing: '-0.01em', color: T.ink, lineHeight: 1.1
              }}>
                Month {monthData.month} audit
              </h2>
              <p className="text-[12px] mt-1" style={{ color: monthData.exhausted ? T.oxblood : T.muted }}>
                {monthData.exhausted ? 'Liquid exhausted this month — only 401(k) penalty zone remains' : monthsRemaining}
              </p>
            </div>
            <button onClick={onClose} className="p-1 hover:opacity-60" style={{ background: 'transparent' }}>
              <X size={18} style={{ color: T.muted }} strokeWidth={1.5} />
            </button>
          </div>

          {/* Scenario toggle inside drawer */}
          <div className="flex items-stretch mt-3" style={{
            border: `1px solid ${T.rule}`, background: T.surface
          }}>
            {['bare', 'typical', 'best'].map((s, i) => {
              const meta = {
                bare: { label: 'Bare bones', color: T.oxblood },
                typical: { label: 'Realistic', color: T.ink },
                best: { label: 'Best case', color: T.emerald }
              }[s];
              const active = scenario === s;
              return (
                <button
                  key={s}
                  onClick={() => onScenarioChange(s)}
                  className="flex-1 py-2 transition-opacity hover:opacity-80"
                  style={{
                    background: active ? meta.color : 'transparent',
                    color: active ? T.surface : T.muted,
                    fontFamily: BODY_FONT, fontWeight: active ? 700 : 500,
                    fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                    borderLeft: i > 0 ? `1px solid ${T.rule}` : 'none'
                  }}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>

          {/* Active windows chips */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            <Chip active={inSevWindow} label="Severance" />
            <Chip active={inUiWindow} label="UI active" />
            <Chip active={inGigWindow} label="Gig income" />
            <Chip active={monthData.partnerIncome > 0} label="Partner income" />
            <Chip active={monthData.exhausted} label="Exhausted" tone="bad" />
          </div>
        </div>

        <div className="px-5 sm:px-7 py-5">
          {/* Cashflow summary */}
          <div className="mb-6 p-4" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.12em]" style={{ color: T.muted, fontWeight: 600 }}>Income</div>
                <div style={{ fontFamily: DISPLAY_FONT, fontSize: 20, fontWeight: 500, color: T.emerald, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
                  {fmt$Full(totalIncome)}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.12em]" style={{ color: T.muted, fontWeight: 600 }}>Expenses</div>
                <div style={{ fontFamily: DISPLAY_FONT, fontSize: 20, fontWeight: 500, color: T.oxblood, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
                  {fmt$Full(totalExpenses)}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.12em]" style={{ color: T.muted, fontWeight: 600 }}>Net flow</div>
                <div style={{ fontFamily: DISPLAY_FONT, fontSize: 20, fontWeight: 600, color: netFlow >= 0 ? T.emerald : T.oxblood, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
                  {netFlow >= 0 ? '+' : ''}{fmt$Full(netFlow)}
                </div>
              </div>
            </div>
          </div>

          {/* Income breakdown */}
          <h3 style={{ fontFamily: DISPLAY_FONT, fontSize: 16, fontWeight: 500, color: T.ink, letterSpacing: '-0.01em', marginBottom: 12 }}>
            Income this month
          </h3>
          {incomeLines.length === 0 ? (
            <div className="text-[12px] mb-6" style={{ color: T.muted, fontStyle: 'italic' }}>No income this month — running entirely off liquid savings.</div>
          ) : (
            <div className="mb-6">
              {incomeLines.map(line => (
                <BreakdownRow key={line.label} label={line.label} value={line.value} total={totalIncome} hint={line.hint} color={T.emerald} />
              ))}
            </div>
          )}

          {/* Expense breakdown */}
          <h3 style={{ fontFamily: DISPLAY_FONT, fontSize: 16, fontWeight: 500, color: T.ink, letterSpacing: '-0.01em', marginBottom: 12 }}>
            Expenses this month
          </h3>
          <div className="mb-6">
            {expenseLines.map(line => (
              <BreakdownRow key={line.label} label={line.label} value={line.value} total={totalExpenses} hint={line.hint} color={T.oxblood} />
            ))}
          </div>

          {/* Account state */}
          <h3 style={{ fontFamily: DISPLAY_FONT, fontSize: 16, fontWeight: 500, color: T.ink, letterSpacing: '-0.01em', marginBottom: 4 }}>
            Liquid accounts at end of month
          </h3>
          <p className="text-[12px] mb-3" style={{ color: T.muted, fontStyle: 'italic' }}>
            {netFlow < 0 ? `Drew ${fmt$Full(-netFlow)} from ${labelForAccount(monthData.drawnFrom)} this month.` : 'Surplus this month — no draws needed.'}
          </p>
          <div className="mb-6">
            {accountLines.map(line => (
              <div key={line.label} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${T.ruleLight}` }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 12, color: T.ink, fontWeight: 500 }}>{line.label}</span>
                  {line.drawn && (
                    <span style={{ fontSize: 9, color: T.oxblood, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: T.oxbloodSoft, padding: '2px 5px' }}>
                      Drew this month
                    </span>
                  )}
                </div>
                <span style={{ fontFamily: MONO_FONT, fontSize: 13, color: line.value > 0 ? T.ink : T.muted, fontVariantNumeric: 'tabular-nums', fontWeight: line.drawn ? 700 : 500 }}>
                  {fmt$Full(line.value)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between py-3 mt-1" style={{ borderTop: `2px solid ${T.ink}` }}>
              <span style={{ fontSize: 13, color: T.ink, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total liquid</span>
              <span style={{ fontFamily: DISPLAY_FONT, fontSize: 18, color: T.ink, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                {fmt$Full(totalLiquidEnd)}
              </span>
            </div>
          </div>

          {/* 401(k) penalty zone */}
          <div className="p-3" style={{ background: T.amberSoft, border: `1px solid ${T.amber}40` }}>
            <div className="flex items-baseline justify-between mb-1">
              <span style={{ fontSize: 11, color: T.amber, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                401(k) — penalty zone {monthData.exhausted ? '(now in play)' : '(untouched)'}
              </span>
              <span style={{ fontFamily: MONO_FONT, fontSize: 13, color: T.amber, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                {fmt$Full(monthData.k401)}
              </span>
            </div>
            <p className="text-[11px]" style={{ color: T.inkSoft, lineHeight: 1.5 }}>
              {inp.currentAge >= 59.5
                ? 'You\'re past 59½ — withdrawals are allowed without the 10% penalty, but still taxed as ordinary income.'
                : 'Withdrawing before age 59½ triggers a 10% federal penalty plus ordinary income tax — typically 30–40% combined. Consider a 401(k) loan instead if your plan allows it.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ active, label, tone }) {
  const color = !active ? T.muted : tone === 'bad' ? T.oxblood : T.emerald;
  const bg = !active ? 'transparent' : tone === 'bad' ? T.oxbloodSoft : T.emeraldSoft;
  return (
    <span style={{
      fontSize: 9, color, background: bg,
      padding: '3px 7px', fontWeight: 600,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      border: `1px solid ${color}40`, opacity: active ? 1 : 0.4
    }}>
      {label}
    </span>
  );
}

function labelForAccount(key) {
  return {
    cash: 'cash',
    mm: 'money market',
    cd: 'CDs (early withdrawal)',
    brokerage: 'taxable brokerage',
    '401k_penalty': '401(k) at penalty'
  }[key] || 'savings';
}

function BreakdownRow({ label, value, total, hint, color }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-[13px] mb-1">
        <div>
          <span style={{ color: T.ink, fontWeight: 500 }}>{label}</span>
          {hint && (
            <div className="text-[10px] mt-0.5" style={{ color: T.muted, fontStyle: 'italic' }}>{hint}</div>
          )}
        </div>
        <div className="text-right shrink-0 ml-3">
          <div style={{ color: T.ink, fontFamily: MONO_FONT, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
            {fmt$Full(value)}
          </div>
          <div className="text-[10px]" style={{ color: T.muted, fontFamily: MONO_FONT }}>
            {pct.toFixed(0)}%
          </div>
        </div>
      </div>
      <div style={{ height: 3, background: T.ruleLight, position: 'relative' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 200ms' }} />
      </div>
    </div>
  );
}

function BalanceRow({ label, value, negative }) {
  return (
    <div className="flex items-center justify-between text-[12px]">
      <span style={{ color: T.inkSoft }}>{label}</span>
      <span style={{
        color: negative ? T.oxblood : T.ink,
        fontFamily: MONO_FONT, fontVariantNumeric: 'tabular-nums', fontWeight: 500
      }}>
        {fmt$Full(value)}
      </span>
    </div>
  );
}

function MigrationNotice({ notice, onDismiss }) {
  const isFromFuture = notice.fromFuture;
  const accentColor = isFromFuture ? T.oxblood : T.amber;
  const accentSoft = isFromFuture ? T.oxbloodSoft : T.amberSoft;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15, 26, 77, 0.4)',
        zIndex: 60, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        padding: 20
      }}
      onClick={onDismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.bg, maxWidth: 560, width: '100%',
          border: `1px solid ${T.rule}`,
          boxShadow: '0 24px 48px rgba(0,0,0,0.18)'
        }}
      >
        <div style={{
          padding: '20px 24px',
          background: accentSoft,
          borderBottom: `1px solid ${accentColor}30`
        }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} strokeWidth={1.75} style={{ color: accentColor }} />
            <span style={{
              fontSize: 11, fontWeight: 700, color: accentColor,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              fontFamily: BODY_FONT
            }}>
              {isFromFuture ? 'Newer version detected' : 'Scenario upgraded'}
            </span>
          </div>
          <h2 style={{
            fontFamily: DISPLAY_FONT, fontSize: 24, fontWeight: 400,
            letterSpacing: '-0.01em', color: T.ink, lineHeight: 1.15
          }}>
            "{notice.scenarioName}" {isFromFuture ? 'is from a newer app' : 'has been upgraded'}
          </h2>
        </div>

        <div style={{ padding: '20px 24px' }}>
          <p style={{
            fontSize: 14, lineHeight: 1.55,
            color: T.inkSoft, marginBottom: 16
          }}>
            {isFromFuture ? (
              <>
                This scenario was created with schema <strong>v{notice.fromVersion}</strong>, but this app expects <strong>v{notice.toVersion}</strong>.
                Some calculations may not be 100% accurate. We recommend visiting <a href="https://ackwak.com" style={{ color: T.ink, fontWeight: 600 }}>ackwak.com</a> for the latest version.
              </>
            ) : (
              <>
                Migrated from schema <strong>v{notice.fromVersion}</strong> to <strong>v{notice.toVersion}</strong>. Your scenario was loaded successfully, please review the changes below to make sure everything looks right.
              </>
            )}
          </p>

          <div style={{
            background: T.surface, border: `1px solid ${T.rule}`,
            padding: '14px 16px', marginBottom: 18
          }}>
            <div style={{
              fontSize: 10, color: T.muted, fontWeight: 600,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              marginBottom: 10
            }}>
              {isFromFuture ? 'Compatibility notes' : 'What changed'}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {notice.warnings.map((w, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 mb-2"
                  style={{ fontSize: 13, lineHeight: 1.55, color: T.ink }}
                >
                  <span style={{
                    width: 4, height: 4, borderRadius: 999,
                    background: accentColor, marginTop: 8, flexShrink: 0
                  }} />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onDismiss}
              style={{
                background: T.ink, color: T.surface,
                padding: '10px 18px',
                fontFamily: BODY_FONT, fontWeight: 600,
                fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
                cursor: 'pointer', border: 'none'
              }}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScenarioPanel({
  onClose, scenarios, activeName,
  saveAsName, setSaveAsName,
  saveScenarioAs, overwriteActive,
  loadScenario, deleteScenario, duplicateScenario,
  downloadScenario, handleUpload, fileInputRef,
  downloadAsExcel, handleExcelUpload, excelInputRef,
  openPrintableSummary,
  startFresh
}) {
  const names = Object.keys(scenarios).sort((a, b) => {
    const aTime = scenarios[a]._savedAt || '';
    const bTime = scenarios[b]._savedAt || '';
    return bTime.localeCompare(aTime); // most recent first
  });

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(23, 21, 19, 0.5)',
        zIndex: 50, display: 'flex', alignItems: 'flex-start',
        justifyContent: 'center', padding: '60px 20px', overflowY: 'auto'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.bg, maxWidth: 720, width: '100%',
          border: `1px solid ${T.rule}`, position: 'relative'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 sm:py-5" style={{ borderBottom: `1px solid ${T.rule}` }}>
          <div>
            <div className="flex items-center gap-2 mb-1" style={{ color: T.muted }}>
              <FolderOpen size={11} strokeWidth={1.5} />
              <span className="text-[10px] uppercase tracking-[0.2em]" style={{ fontWeight: 600 }}>
                What-if scenarios
              </span>
            </div>
            <h2 style={{
              fontFamily: DISPLAY_FONT, fontSize: 26, fontWeight: 500,
              letterSpacing: '-0.01em', color: T.ink, lineHeight: 1.1
            }}>
              Save & manage scenarios
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:opacity-60" style={{ background: 'transparent' }}>
            <X size={18} style={{ color: T.muted }} strokeWidth={1.5} />
          </button>
        </div>

        {/* Save as new */}
        <div className="px-5 sm:px-7 py-4 sm:py-5" style={{ borderBottom: `1px solid ${T.rule}` }}>
          <div className="text-[11px] uppercase tracking-[0.15em] mb-3" style={{ color: T.muted, fontWeight: 600 }}>
            Save current inputs as
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g., 'Retire at 60' or 'No college help'"
              value={saveAsName}
              onChange={(e) => setSaveAsName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveScenarioAs(saveAsName); }}
              className="flex-1 px-3 py-2.5 outline-none text-[14px]"
              style={{
                background: T.surface, border: `1px solid ${T.rule}`,
                color: T.ink, fontFamily: BODY_FONT
              }}
            />
            <button
              onClick={() => saveScenarioAs(saveAsName)}
              className="px-4 py-2.5 flex items-center gap-2 transition-opacity hover:opacity-80"
              style={{
                background: T.emerald, color: T.surface,
                fontFamily: BODY_FONT, fontWeight: 600,
                fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase'
              }}
            >
              <Save size={13} strokeWidth={1.5} />
              Save as new
            </button>
          </div>
          {activeName && (
            <button
              onClick={overwriteActive}
              className="mt-3 text-[12px] flex items-center gap-1.5 transition-opacity hover:opacity-70"
              style={{ color: T.emerald, fontWeight: 500, background: 'transparent' }}
            >
              <Save size={11} strokeWidth={1.5} />
              Or update "{activeName}" with current inputs
            </button>
          )}
        </div>

        {/* Saved scenarios list */}
        <div className="px-5 sm:px-7 py-4 sm:py-5" style={{ borderBottom: `1px solid ${T.rule}` }}>
          <div className="text-[11px] uppercase tracking-[0.15em] mb-3" style={{ color: T.muted, fontWeight: 600 }}>
            Your scenarios ({names.length})
          </div>
          {names.length === 0 ? (
            <p className="text-[13px] py-4" style={{ color: T.muted, fontStyle: 'italic' }}>
              No saved scenarios yet. Enter a name above and click Save As to create your first one.
            </p>
          ) : (
            <div className="space-y-1.5">
              {names.map(name => {
                const s = scenarios[name];
                const isActive = name === activeName;
                const saved = s._savedAt ? new Date(s._savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                return (
                  <div
                    key={name}
                    className="flex items-center justify-between p-3 transition-colors"
                    style={{
                      background: isActive ? T.emeraldSoft : T.surface,
                      border: `1px solid ${isActive ? T.emerald : T.rule}`
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] truncate" style={{
                          fontWeight: 600, color: T.ink, fontFamily: BODY_FONT
                        }}>
                          {name}
                        </span>
                        {isActive && (
                          <span className="text-[9px] px-1.5 py-0.5 uppercase tracking-[0.12em]"
                            style={{ background: T.emerald, color: T.surface, fontWeight: 600 }}>
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: T.muted, fontFamily: MONO_FONT }}>
                        Age {s.currentAge} → retire at {s.retirementAge} · {s.properties?.length || 0} {s.properties?.length === 1 ? 'property' : 'properties'} · saved {saved}{s.schemaVersion && s.schemaVersion < CURRENT_SCHEMA_VERSION ? ` · v${s.schemaVersion} (will upgrade)` : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-3">
                      <IconBtn onClick={() => loadScenario(name)} title="Load" icon={Upload} color={T.emerald} />
                      <IconBtn onClick={() => duplicateScenario(name)} title="Duplicate" icon={Copy} color={T.muted} />
                      <IconBtn onClick={() => deleteScenario(name)} title="Delete" icon={Trash2} color={T.oxblood} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* File-based portability */}
        <div className="px-5 sm:px-7 py-4 sm:py-5" style={{ borderBottom: `1px solid ${T.rule}` }}>
          <div className="text-[11px] uppercase tracking-[0.15em] mb-3" style={{ color: T.muted, fontWeight: 600 }}>
            Share, print, or back up
          </div>
          <p className="text-[12px] mb-4" style={{ color: T.inkSoft, lineHeight: 1.5 }}>
            Browser-saved scenarios live in this browser only. Export to a file to back up, print, share, or move between devices.
          </p>

          {/* Format groups */}
          <div className="space-y-3">
            {/* Excel — recommended */}
            <div className="p-3" style={{ background: T.emeraldSoft, border: `1px solid ${T.emerald}30` }}>
              <div className="flex items-start gap-2 mb-2">
                <FileSpreadsheet size={14} strokeWidth={1.5} style={{ color: T.emerald, marginTop: 2, flexShrink: 0 }} />
                <div className="flex-1">
                  <div className="text-[12px]" style={{ color: T.emerald, fontWeight: 700 }}>
                    Excel <span style={{ fontWeight: 500, opacity: 0.85 }}>· recommended for sharing & re-entry</span>
                  </div>
                  <div className="text-[11px]" style={{ color: T.inkSoft, lineHeight: 1.5, marginTop: 2 }}>
                    Multi-sheet workbook. Readable, printable, editable. Opens in Excel, Google Sheets, or Numbers. Roundtrip-able.
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  onClick={downloadAsExcel}
                  className="px-3 py-1.5 flex items-center gap-1.5 transition-opacity hover:opacity-80"
                  style={{
                    background: T.emerald, color: T.surface, border: 'none',
                    fontFamily: BODY_FONT, fontWeight: 600, fontSize: 11,
                    letterSpacing: '0.05em', textTransform: 'uppercase'
                  }}
                >
                  <Download size={12} strokeWidth={2} />
                  Download Excel
                </button>
                <button
                  onClick={() => excelInputRef.current?.click()}
                  className="px-3 py-1.5 flex items-center gap-1.5 transition-opacity hover:opacity-80"
                  style={{
                    background: T.surface, color: T.emerald, border: `1px solid ${T.emerald}`,
                    fontFamily: BODY_FONT, fontWeight: 600, fontSize: 11,
                    letterSpacing: '0.05em', textTransform: 'uppercase'
                  }}
                >
                  <Upload size={12} strokeWidth={2} />
                  Load Excel
                </button>
                <input
                  ref={excelInputRef}
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleExcelUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {/* Print view */}
            <div className="p-3" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
              <div className="flex items-start gap-2 mb-2">
                <Printer size={14} strokeWidth={1.5} style={{ color: T.ink, marginTop: 2, flexShrink: 0 }} />
                <div className="flex-1">
                  <div className="text-[12px]" style={{ color: T.ink, fontWeight: 700 }}>
                    Printable summary
                  </div>
                  <div className="text-[11px]" style={{ color: T.inkSoft, lineHeight: 1.5, marginTop: 2 }}>
                    Opens a clean one-page summary in a new tab. Use your browser's Print or "Save as PDF" to share.
                  </div>
                </div>
              </div>
              <button
                onClick={openPrintableSummary}
                className="px-3 py-1.5 flex items-center gap-1.5 transition-opacity hover:opacity-80 mt-2"
                style={{
                  background: T.ink, color: T.surface, border: 'none',
                  fontFamily: BODY_FONT, fontWeight: 600, fontSize: 11,
                  letterSpacing: '0.05em', textTransform: 'uppercase'
                }}
              >
                <Printer size={12} strokeWidth={2} />
                Open print view
              </button>
            </div>

            {/* JSON */}
            <div className="p-3" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
              <div className="flex items-start gap-2 mb-2">
                <FileText size={14} strokeWidth={1.5} style={{ color: T.muted, marginTop: 2, flexShrink: 0 }} />
                <div className="flex-1">
                  <div className="text-[12px]" style={{ color: T.ink, fontWeight: 700 }}>
                    JSON <span style={{ fontWeight: 500, color: T.muted }}>· for technical users / scripting</span>
                  </div>
                  <div className="text-[11px]" style={{ color: T.inkSoft, lineHeight: 1.5, marginTop: 2 }}>
                    Compact, lossless format used internally by the calculator. Hard to read, but perfect for backups.
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  onClick={downloadScenario}
                  className="px-3 py-1.5 flex items-center gap-1.5 transition-opacity hover:opacity-80"
                  style={{
                    background: T.surface, color: T.inkSoft, border: `1px solid ${T.rule}`,
                    fontFamily: BODY_FONT, fontWeight: 500, fontSize: 11,
                    letterSpacing: '0.05em', textTransform: 'uppercase'
                  }}
                >
                  <Download size={12} strokeWidth={1.5} />
                  Download JSON
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 flex items-center gap-1.5 transition-opacity hover:opacity-80"
                  style={{
                    background: T.surface, color: T.inkSoft, border: `1px solid ${T.rule}`,
                    fontFamily: BODY_FONT, fontWeight: 500, fontSize: 11,
                    letterSpacing: '0.05em', textTransform: 'uppercase'
                  }}
                >
                  <Upload size={12} strokeWidth={1.5} />
                  Load JSON
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reset */}
        <div className="px-5 sm:px-7 py-4 flex items-center justify-between">
          <button
            onClick={startFresh}
            className="text-[12px] flex items-center gap-1.5 transition-opacity hover:opacity-70"
            style={{ color: T.oxblood, fontWeight: 500, background: 'transparent' }}
          >
            <Trash2 size={11} strokeWidth={1.5} />
            Reset all inputs to defaults
          </button>
          <button
            onClick={onClose}
            className="text-[12px] uppercase tracking-[0.12em]"
            style={{ color: T.muted, fontWeight: 500, background: 'transparent' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ onClick, title, icon: Icon, color }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-2 transition-opacity hover:opacity-60"
      style={{ background: 'transparent', color }}
    >
      <Icon size={14} strokeWidth={1.5} />
    </button>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.rule}`,
      padding: '10px 14px', fontFamily: BODY_FONT, fontSize: 12,
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
    }}>
      <div style={{ fontFamily: DISPLAY_FONT, fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
        Age {label}
      </div>
      {payload.map((p, i) => p.value != null && (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span style={{ width: 8, height: 8, borderRadius: 999, background: p.color, display: 'inline-block' }} />
          <span style={{ color: T.muted, minWidth: 76 }}>
            {p.dataKey === 'cons' ? 'Conservative' : p.dataKey === 'mod' ? 'Moderate' : 'Optimistic'}
          </span>
          <span style={{ fontFamily: MONO_FONT, fontWeight: 500, color: T.ink }}>
            {fmt$Full(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
