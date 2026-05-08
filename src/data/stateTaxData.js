// ============================================================================
// STATE INCOME TAX DATA (2026)
// ============================================================================
// 50 states + DC, with 2026 tax brackets where data is available, and a flat
// approximation otherwise.
//
// Sources: Tax Foundation 2026 State Income Tax Rates and Brackets, Tax
// Foundation 2026 inflation adjustments, IRS Revenue Procedure 2025-32,
// state DOR websites (verified through January 2026).
//
// This is a planning approximation, not tax preparation. Real returns include
// many factors this model does not capture: itemized deductions, state-specific
// credits, treatment of Social Security, retirement income exclusions for
// older filers, local taxes (NYC, Philadelphia, etc.), AMT, and reciprocity
// agreements. For tax preparation, consult a qualified tax professional.
//
// Schema:
//   noTax:       true if state has no income tax. Other fields ignored.
//   flat:        true if state uses a single flat rate. Use `flatRate` only.
//   flatRate:    Decimal (e.g. 0.0307 for 3.07%), used when flat=true.
//   brackets:    Array of { upTo, rate } pairs for progressive systems.
//                upTo = upper bound of the bracket in dollars (Infinity for
//                the top bracket). rate = decimal marginal rate within bracket.
//                When `married=true`, applies bracketsMfj if defined; otherwise
//                doubles the single-filer thresholds (rough approximation).
//   bracketsMfj: Optional override for married-filing-jointly brackets.
//   note:        Optional descriptive note shown in the UI.
// ============================================================================

export const STATE_TAX_DATA = {
  // ---------------- No income tax ----------------
  AK: { name: 'Alaska', noTax: true },
  FL: { name: 'Florida', noTax: true },
  NV: { name: 'Nevada', noTax: true },
  NH: { name: 'New Hampshire', noTax: true,
    note: 'No tax on wages or salary. (Note: NH historically taxed interest and dividends; that tax was repealed effective Jan 1, 2025.)'
  },
  SD: { name: 'South Dakota', noTax: true },
  TN: { name: 'Tennessee', noTax: true },
  TX: { name: 'Texas', noTax: true },
  WA: { name: 'Washington', noTax: true,
    note: 'No regular wage income tax. WA does levy a 7% capital gains tax on long-term gains over a high threshold (~$270K for 2025), not modeled here.'
  },
  WY: { name: 'Wyoming', noTax: true },

  // ---------------- Flat rate states ----------------
  AZ: { name: 'Arizona', flat: true, flatRate: 0.025,
    note: 'Flat 2.5% as of 2026.' },
  CO: { name: 'Colorado', flat: true, flatRate: 0.044,
    note: 'Flat 4.4% as of 2026.' },
  ID: { name: 'Idaho', flat: true, flatRate: 0.053,
    note: 'Flat 5.3% as of 2026.' },
  IL: { name: 'Illinois', flat: true, flatRate: 0.0495,
    note: 'Flat 4.95% as of 2026.' },
  IN: { name: 'Indiana', flat: true, flatRate: 0.0305,
    note: 'Flat 3.05% as of 2026 (state). Local income taxes (LIT) typically add ~1% to ~3.5% on top, not modeled here.' },
  KY: { name: 'Kentucky', flat: true, flatRate: 0.04,
    note: 'Flat 4% as of 2026.' },
  MI: { name: 'Michigan', flat: true, flatRate: 0.0405,
    note: 'Flat 4.05% as of 2026 (state). Some Michigan cities levy local income taxes, not modeled here.' },
  MS: { name: 'Mississippi', flat: true, flatRate: 0.044,
    note: 'Flat 4.4% as of 2026; phasing down toward elimination.' },
  NC: { name: 'North Carolina', flat: true, flatRate: 0.0399,
    note: 'Flat 3.99% as of 2026 (final step of phasedown).' },
  PA: { name: 'Pennsylvania', flat: true, flatRate: 0.0307,
    note: 'Flat 3.07% as of 2026 (state). Some Pennsylvania cities (Philadelphia in particular) levy local income taxes of ~3% to 4%, not modeled here.' },
  UT: { name: 'Utah', flat: true, flatRate: 0.045,
    note: 'Flat 4.5% as of 2026.' },

  // Ohio: technically has 2 brackets but functions as flat above $26K threshold
  OH: { name: 'Ohio', flat: false,
    brackets: [
      { upTo: 26050, rate: 0.0 },
      { upTo: Infinity, rate: 0.0275 }
    ],
    note: 'Effectively flat 2.75% on income above $26,050 as of 2026.'
  },

  // ---------------- Progressive bracketed states ----------------
  // California: famously high top rate, deep bracket structure
  CA: { name: 'California', flat: false,
    brackets: [
      { upTo: 10756,   rate: 0.01 },
      { upTo: 25499,   rate: 0.02 },
      { upTo: 40245,   rate: 0.04 },
      { upTo: 55866,   rate: 0.06 },
      { upTo: 70606,   rate: 0.08 },
      { upTo: 360659,  rate: 0.093 },
      { upTo: 432787,  rate: 0.103 },
      { upTo: 721314,  rate: 0.113 },
      { upTo: Infinity, rate: 0.123 }
    ],
    bracketsMfj: [
      { upTo: 21512,   rate: 0.01 },
      { upTo: 50998,   rate: 0.02 },
      { upTo: 80490,   rate: 0.04 },
      { upTo: 111732,  rate: 0.06 },
      { upTo: 141212,  rate: 0.08 },
      { upTo: 721318,  rate: 0.093 },
      { upTo: 865574,  rate: 0.103 },
      { upTo: 1442628, rate: 0.113 },
      { upTo: Infinity, rate: 0.123 }
    ],
    note: 'CA also has a 1% Mental Health Services Tax on income over $1M (top effective marginal rate 13.3%), not modeled in detail.'
  },

  NY: { name: 'New York', flat: false,
    brackets: [
      { upTo: 8500,    rate: 0.04 },
      { upTo: 11700,   rate: 0.045 },
      { upTo: 13900,   rate: 0.0525 },
      { upTo: 80650,   rate: 0.055 },
      { upTo: 215400,  rate: 0.06 },
      { upTo: 1077550, rate: 0.0685 },
      { upTo: 5000000, rate: 0.0965 },
      { upTo: 25000000, rate: 0.103 },
      { upTo: Infinity, rate: 0.109 }
    ],
    bracketsMfj: [
      { upTo: 17150,   rate: 0.04 },
      { upTo: 23600,   rate: 0.045 },
      { upTo: 27900,   rate: 0.0525 },
      { upTo: 161550,  rate: 0.055 },
      { upTo: 323200,  rate: 0.06 },
      { upTo: 2155350, rate: 0.0685 },
      { upTo: 5000000, rate: 0.0965 },
      { upTo: 25000000, rate: 0.103 },
      { upTo: Infinity, rate: 0.109 }
    ],
    note: 'NYC residents pay an additional NYC income tax of ~3% to ~3.876% (top), not modeled here.'
  },

  NJ: { name: 'New Jersey', flat: false,
    brackets: [
      { upTo: 20000,   rate: 0.014 },
      { upTo: 35000,   rate: 0.0175 },
      { upTo: 40000,   rate: 0.035 },
      { upTo: 75000,   rate: 0.05525 },
      { upTo: 500000,  rate: 0.0637 },
      { upTo: 1000000, rate: 0.0897 },
      { upTo: Infinity, rate: 0.1075 }
    ],
    bracketsMfj: [
      { upTo: 20000,   rate: 0.014 },
      { upTo: 50000,   rate: 0.0175 },
      { upTo: 70000,   rate: 0.0245 },
      { upTo: 80000,   rate: 0.035 },
      { upTo: 150000,  rate: 0.05525 },
      { upTo: 500000,  rate: 0.0637 },
      { upTo: 1000000, rate: 0.0897 },
      { upTo: Infinity, rate: 0.1075 }
    ],
    note: 'NJ does not tax pension or 401(k) income for retirees with income under $150K.'
  },

  MA: { name: 'Massachusetts', flat: false,
    brackets: [
      { upTo: 1000000, rate: 0.05 },
      { upTo: Infinity, rate: 0.09 }
    ],
    note: 'Effectively flat 5% on most income; an additional 4% surtax (the "millionaire tax") applies to income over $1M, for a top rate of 9%.'
  },

  // Washington DC
  DC: { name: 'District of Columbia', flat: false,
    brackets: [
      { upTo: 10000,   rate: 0.04 },
      { upTo: 40000,   rate: 0.06 },
      { upTo: 60000,   rate: 0.065 },
      { upTo: 250000,  rate: 0.085 },
      { upTo: 500000,  rate: 0.0925 },
      { upTo: 1000000, rate: 0.0975 },
      { upTo: Infinity, rate: 0.1075 }
    ]
  },

  HI: { name: 'Hawaii', flat: false,
    brackets: [
      { upTo: 9600,    rate: 0.014 },
      { upTo: 14400,   rate: 0.032 },
      { upTo: 19200,   rate: 0.055 },
      { upTo: 24000,   rate: 0.064 },
      { upTo: 36000,   rate: 0.068 },
      { upTo: 48000,   rate: 0.072 },
      { upTo: 150000,  rate: 0.076 },
      { upTo: 175000,  rate: 0.079 },
      { upTo: 200000,  rate: 0.0825 },
      { upTo: 300000,  rate: 0.09 },
      { upTo: 350000,  rate: 0.10 },
      { upTo: Infinity, rate: 0.11 }
    ]
  },

  OR: { name: 'Oregon', flat: false,
    brackets: [
      { upTo: 4400,    rate: 0.0475 },
      { upTo: 11050,   rate: 0.0675 },
      { upTo: 125000,  rate: 0.0875 },
      { upTo: Infinity, rate: 0.099 }
    ]
  },

  MN: { name: 'Minnesota', flat: false,
    brackets: [
      { upTo: 32570,   rate: 0.0535 },
      { upTo: 106990,  rate: 0.068 },
      { upTo: 198630,  rate: 0.0785 },
      { upTo: Infinity, rate: 0.0985 }
    ]
  },

  WI: { name: 'Wisconsin', flat: false,
    brackets: [
      { upTo: 14320,   rate: 0.035 },
      { upTo: 28640,   rate: 0.044 },
      { upTo: 315310,  rate: 0.053 },
      { upTo: Infinity, rate: 0.0765 }
    ]
  },

  IA: { name: 'Iowa', flat: true, flatRate: 0.038,
    note: 'Iowa moved to a flat 3.8% as of 2026.' },

  GA: { name: 'Georgia', flat: true, flatRate: 0.0519,
    note: 'Flat 5.19% as of mid-2025.' },

  VA: { name: 'Virginia', flat: false,
    brackets: [
      { upTo: 3000,    rate: 0.02 },
      { upTo: 5000,    rate: 0.03 },
      { upTo: 17000,   rate: 0.05 },
      { upTo: Infinity, rate: 0.0575 }
    ]
  },

  MD: { name: 'Maryland', flat: false,
    brackets: [
      { upTo: 1000,    rate: 0.02 },
      { upTo: 2000,    rate: 0.03 },
      { upTo: 3000,    rate: 0.04 },
      { upTo: 100000,  rate: 0.0475 },
      { upTo: 125000,  rate: 0.05 },
      { upTo: 150000,  rate: 0.0525 },
      { upTo: 250000,  rate: 0.055 },
      { upTo: Infinity, rate: 0.0575 }
    ],
    note: 'Maryland counties also levy local income taxes of 2.25% to 3.20%, not modeled here.'
  },

  CT: { name: 'Connecticut', flat: false,
    brackets: [
      { upTo: 10000,   rate: 0.02 },
      { upTo: 50000,   rate: 0.045 },
      { upTo: 100000,  rate: 0.055 },
      { upTo: 200000,  rate: 0.06 },
      { upTo: 250000,  rate: 0.065 },
      { upTo: 500000,  rate: 0.069 },
      { upTo: Infinity, rate: 0.0699 }
    ]
  },

  // Other progressive states, top-rate-only approximations to start.
  // These can be expanded with full brackets later when data verification time allows.
  AL: { name: 'Alabama', flat: false,
    brackets: [
      { upTo: 500,    rate: 0.02 },
      { upTo: 3000,   rate: 0.04 },
      { upTo: Infinity, rate: 0.05 }
    ]
  },
  AR: { name: 'Arkansas', flat: false,
    brackets: [
      { upTo: 5300,   rate: 0.02 },
      { upTo: 10600,  rate: 0.04 },
      { upTo: Infinity, rate: 0.0399 }
    ],
    note: 'AR top rate is 3.99% as of 2026.'
  },
  DE: { name: 'Delaware', flat: false,
    brackets: [
      { upTo: 5000,   rate: 0.022 },
      { upTo: 10000,  rate: 0.039 },
      { upTo: 20000,  rate: 0.048 },
      { upTo: 25000,  rate: 0.052 },
      { upTo: 60000,  rate: 0.0555 },
      { upTo: Infinity, rate: 0.066 }
    ]
  },
  KS: { name: 'Kansas', flat: false,
    brackets: [
      { upTo: 23000,  rate: 0.0531 },
      { upTo: Infinity, rate: 0.0575 }
    ]
  },
  LA: { name: 'Louisiana', flat: true, flatRate: 0.03,
    note: 'Flat 3% as of 2025 (replaced previous bracketed system).'
  },
  ME: { name: 'Maine', flat: false,
    brackets: [
      { upTo: 26800,  rate: 0.058 },
      { upTo: 63450,  rate: 0.0675 },
      { upTo: Infinity, rate: 0.0715 }
    ]
  },
  MO: { name: 'Missouri', flat: false,
    brackets: [
      { upTo: 1207,   rate: 0.02 },
      { upTo: 2414,   rate: 0.025 },
      { upTo: 3621,   rate: 0.03 },
      { upTo: 4828,   rate: 0.035 },
      { upTo: 6035,   rate: 0.04 },
      { upTo: 7242,   rate: 0.045 },
      { upTo: 8449,   rate: 0.0475 },
      { upTo: Infinity, rate: 0.0495 }
    ]
  },
  MT: { name: 'Montana', flat: false,
    brackets: [
      { upTo: 21100,  rate: 0.047 },
      { upTo: Infinity, rate: 0.059 }
    ]
  },
  NE: { name: 'Nebraska', flat: false,
    brackets: [
      { upTo: 4030,   rate: 0.0246 },
      { upTo: 24120,  rate: 0.0351 },
      { upTo: 38870,  rate: 0.0501 },
      { upTo: Infinity, rate: 0.0455 }
    ],
    note: 'NE top rate dropped to 4.55% in 2026; phasing down to 3.99% by 2027.'
  },
  NM: { name: 'New Mexico', flat: false,
    brackets: [
      { upTo: 5500,   rate: 0.017 },
      { upTo: 11000,  rate: 0.032 },
      { upTo: 16000,  rate: 0.047 },
      { upTo: 210000, rate: 0.049 },
      { upTo: Infinity, rate: 0.059 }
    ]
  },
  ND: { name: 'North Dakota', flat: false,
    brackets: [
      { upTo: 47150,  rate: 0.0 },
      { upTo: 230000, rate: 0.0195 },
      { upTo: Infinity, rate: 0.025 }
    ],
    note: 'ND has effectively zero state tax on the first ~$47K for single filers.'
  },
  OK: { name: 'Oklahoma', flat: false,
    brackets: [
      { upTo: 1000,   rate: 0.0025 },
      { upTo: 2500,   rate: 0.0075 },
      { upTo: 3750,   rate: 0.0175 },
      { upTo: 4900,   rate: 0.0275 },
      { upTo: 7200,   rate: 0.0375 },
      { upTo: Infinity, rate: 0.045 }
    ],
    note: 'OK top rate dropped to 4.5% in 2026.'
  },
  RI: { name: 'Rhode Island', flat: false,
    brackets: [
      { upTo: 79900,  rate: 0.0375 },
      { upTo: 181650, rate: 0.0475 },
      { upTo: Infinity, rate: 0.0599 }
    ]
  },
  SC: { name: 'South Carolina', flat: false,
    brackets: [
      { upTo: 3460,   rate: 0.0 },
      { upTo: 17330,  rate: 0.03 },
      { upTo: Infinity, rate: 0.06 }
    ],
    note: 'SC top rate temporarily at 6% for FY 2026 (down from 6.2%).'
  },
  VT: { name: 'Vermont', flat: false,
    brackets: [
      { upTo: 47900,  rate: 0.0335 },
      { upTo: 116000, rate: 0.066 },
      { upTo: 242000, rate: 0.076 },
      { upTo: Infinity, rate: 0.0875 }
    ]
  },
  WV: { name: 'West Virginia', flat: false,
    brackets: [
      { upTo: 10000,  rate: 0.0236 },
      { upTo: 25000,  rate: 0.0315 },
      { upTo: 40000,  rate: 0.0354 },
      { upTo: 60000,  rate: 0.0472 },
      { upTo: Infinity, rate: 0.0512 }
    ]
  }
};

// Sanity: verify all 50 + DC are present.
// Returns the full ordered list for dropdown rendering.
export const STATE_LIST = [
  { code: 'AL', name: 'Alabama' },     { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },     { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'District of Columbia' },
  { code: 'FL', name: 'Florida' },     { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },      { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },    { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },        { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },    { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },       { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },   { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },    { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },    { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },        { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },      { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },       { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },     { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },   { code: 'WY', name: 'Wyoming' }
];

export const STATE_TAX_DATA_AS_OF = 'January 2026';

// ============================================================================
// computeStateIncomeTax: run a taxable income through the right state's brackets
// ============================================================================
// Returns a dollar amount of state income tax owed.
//
// This is a simplified planning calculation. It does NOT account for:
//   - State-specific deductions/exemptions/credits
//   - Different treatment of Social Security, pensions, retirement income
//   - Local (city/county) income taxes
//   - State AMT
//   - Reciprocity agreements
//   - Capital gains treatment differences (most states tax LTCG as ordinary)
//
// The first parameter is the assumed taxable income (post-federal-deductions).
// We use the simpler approximation that state taxable income roughly equals
// federal taxable income for ordinary planning purposes.
//
export function computeStateIncomeTax(taxableIncome, stateCode, married = false) {
  if (!stateCode) return 0;
  const data = STATE_TAX_DATA[stateCode];
  if (!data) return 0;
  if (data.noTax) return 0;
  if (data.flat) return Math.max(0, taxableIncome) * data.flatRate;

  // Bracketed: pick MFJ if married and a separate MFJ table is provided,
  // otherwise approximate by doubling single thresholds. Doubling is rough
  // but an honest approximation for states that don't publish MFJ separately.
  const brackets = married && data.bracketsMfj
    ? data.bracketsMfj
    : married
      ? data.brackets.map(b => ({ upTo: b.upTo === Infinity ? Infinity : b.upTo * 2, rate: b.rate }))
      : data.brackets;

  let tax = 0;
  let remaining = Math.max(0, taxableIncome);
  let lastBound = 0;
  for (const b of brackets) {
    const inThisBracket = Math.min(remaining, b.upTo - lastBound);
    if (inThisBracket > 0) {
      tax += inThisBracket * b.rate;
      remaining -= inThisBracket;
    }
    lastBound = b.upTo;
    if (remaining <= 0) break;
  }
  return tax;
}

// Returns the user-facing top marginal rate as a decimal.
// Used to populate the manual override slider when a state is picked.
export function topMarginalRate(stateCode) {
  if (!stateCode) return 0;
  const data = STATE_TAX_DATA[stateCode];
  if (!data) return 0;
  if (data.noTax) return 0;
  if (data.flat) return data.flatRate;
  const brackets = data.brackets;
  return brackets[brackets.length - 1].rate;
}
