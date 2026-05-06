// ============================================================================
// US STATE UNEMPLOYMENT INSURANCE DATA
// ============================================================================
// Top 15 states by population, with verified 2026 unemployment insurance data
// (where available). For states not in this dataset, the UI shows a "verify on
// your state's website" prompt with a link to the official state portal.
//
// Sources: state Department of Labor websites, US Department of Labor data,
// remotelaws.com (Mar 2026), savingtoinvest.com (Mar 2026), Equifax 2026 Wage
// Base Information (Mar 2026). Numbers verified to that point. UI maximums
// typically adjust annually around July 1 — users should always verify their
// state's current figures on the official state portal before relying on them.
//
// Schema:
//   code:        Two-letter postal code (also used as data key)
//   name:        Full state name
//   uiMax:       Maximum weekly UI benefit (excluding dependency allowances)
//   uiMaxNote:   Optional note about dependency allowances or special cases
//   uiWeeks:     Maximum weeks of regular UI benefits
//   waitingWeek: Whether the state has an unpaid waiting week (true = yes)
//   incomeTax:   Whether the state has income tax (true = yes)
//   taxesUI:     Whether state income tax applies to UI benefits (true = yes)
//   portal:      Direct URL to the state's UI filing portal
//   portalLabel: Human-readable label for the portal (state agency name)
//
// ============================================================================

export const STATE_DATA = {
  CA: {
    code: 'CA',
    name: 'California',
    uiMax: 450,
    uiWeeks: 26,
    waitingWeek: true,
    incomeTax: true,
    taxesUI: false,         // California does not tax UI benefits
    portal: 'https://edd.ca.gov/en/Unemployment/Filing_a_Claim',
    portalLabel: 'EDD (Employment Development Department)'
  },
  TX: {
    code: 'TX',
    name: 'Texas',
    uiMax: 591,
    uiWeeks: 26,
    waitingWeek: true,
    incomeTax: false,
    taxesUI: false,
    portal: 'https://www.twc.texas.gov/jobseekers/applying-unemployment-benefits',
    portalLabel: 'Texas Workforce Commission'
  },
  FL: {
    code: 'FL',
    name: 'Florida',
    uiMax: 275,
    uiWeeks: 12,
    uiWeeksNote: 'Variable: 12 weeks when state unemployment rate is below 5.5%, scales up to 23 weeks during higher unemployment.',
    waitingWeek: true,
    incomeTax: false,
    taxesUI: false,
    portal: 'https://connect.myflorida.com/Claimant/Core/Login.ASPX',
    portalLabel: 'Florida Department of Commerce (Reemployment Assistance)'
  },
  NY: {
    code: 'NY',
    name: 'New York',
    uiMax: 504,
    uiWeeks: 26,
    waitingWeek: true,
    incomeTax: true,
    taxesUI: true,
    portal: 'https://dol.ny.gov/unemployment/file-your-first-claim-benefits',
    portalLabel: 'NY Department of Labor'
  },
  PA: {
    code: 'PA',
    name: 'Pennsylvania',
    uiMax: 605,
    uiMaxNote: 'Up to $613 with one dependent, $621 with two dependents.',
    uiWeeks: 26,
    waitingWeek: false,
    incomeTax: true,
    taxesUI: false,         // Pennsylvania does not tax UI benefits
    portal: 'https://www.uc.pa.gov/Pages/default.aspx',
    portalLabel: 'PA Department of Labor & Industry'
  },
  IL: {
    code: 'IL',
    name: 'Illinois',
    uiMax: 669,
    uiMaxNote: 'Up to $797 with non-working spouse, $912 with dependent child.',
    uiWeeks: 26,
    waitingWeek: true,
    incomeTax: true,
    taxesUI: true,
    portal: 'https://ides.illinois.gov/unemployment.html',
    portalLabel: 'Illinois Department of Employment Security (IDES)'
  },
  OH: {
    code: 'OH',
    name: 'Ohio',
    uiMax: 583,
    uiMaxNote: 'Higher with dependents (up to $786 with 3+ dependents).',
    uiWeeks: 26,
    waitingWeek: true,
    incomeTax: true,
    taxesUI: true,
    portal: 'https://unemployment.ohio.gov/',
    portalLabel: 'Ohio Department of Job and Family Services'
  },
  GA: {
    code: 'GA',
    name: 'Georgia',
    uiMax: 365,
    uiWeeks: 14,
    uiWeeksNote: 'Variable: 14 weeks at low statewide unemployment, up to 26 weeks at higher levels.',
    waitingWeek: false,
    incomeTax: true,
    taxesUI: true,
    portal: 'https://dol.georgia.gov/unemployment-services',
    portalLabel: 'Georgia Department of Labor'
  },
  NC: {
    code: 'NC',
    name: 'North Carolina',
    uiMax: 350,
    uiWeeks: 12,
    uiWeeksNote: 'Variable: 12 weeks at low unemployment, up to 20 weeks at high unemployment.',
    waitingWeek: true,
    incomeTax: true,
    taxesUI: true,
    portal: 'https://des.nc.gov/des/file-your-claim',
    portalLabel: 'NC Division of Employment Security'
  },
  MI: {
    code: 'MI',
    name: 'Michigan',
    uiMax: 446,
    uiMaxNote: 'Up to $666 with maximum 5 dependents ($6 per dependent up to 5).',
    uiWeeks: 26,
    waitingWeek: true,
    incomeTax: true,
    taxesUI: true,
    portal: 'https://www.michigan.gov/leo/bureaus-agencies/uia',
    portalLabel: 'Michigan Unemployment Insurance Agency'
  },
  NJ: {
    code: 'NJ',
    name: 'New Jersey',
    uiMax: 854,
    uiWeeks: 26,
    waitingWeek: true,
    incomeTax: true,
    taxesUI: false,         // New Jersey does not tax UI benefits
    portal: 'https://www.nj.gov/labor/myunemployment/',
    portalLabel: 'NJ Department of Labor & Workforce Development'
  },
  VA: {
    code: 'VA',
    name: 'Virginia',
    uiMax: 378,
    uiWeeks: 26,
    waitingWeek: true,
    incomeTax: true,
    taxesUI: true,
    portal: 'https://www.vec.virginia.gov/unemployed',
    portalLabel: 'Virginia Employment Commission'
  },
  WA: {
    code: 'WA',
    name: 'Washington',
    uiMax: 1152,
    uiWeeks: 26,
    waitingWeek: true,
    incomeTax: false,
    taxesUI: false,
    portal: 'https://esd.wa.gov/unemployment',
    portalLabel: 'WA Employment Security Department'
  },
  AZ: {
    code: 'AZ',
    name: 'Arizona',
    uiMax: 320,
    uiWeeks: 26,
    waitingWeek: true,
    incomeTax: true,
    taxesUI: true,
    portal: 'https://des.az.gov/services/employment/unemployment-individual',
    portalLabel: 'Arizona Department of Economic Security'
  },
  MA: {
    code: 'MA',
    name: 'Massachusetts',
    uiMax: 1015,
    uiMaxNote: 'Up to $1,105 with dependency allowances.',
    uiWeeks: 30,
    uiWeeksNote: 'Massachusetts allows up to 30 weeks at higher unemployment rates; otherwise 26 weeks.',
    waitingWeek: true,
    incomeTax: true,
    taxesUI: true,
    portal: 'https://www.mass.gov/how-to/apply-for-unemployment-benefits',
    portalLabel: 'MA Department of Unemployment Assistance'
  }
};

// All US states + DC, used to populate the state picker dropdown.
// States without entries in STATE_DATA show a "verify on state website" prompt.
export const ALL_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'District of Columbia' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
];

// US Department of Labor's unemployment insurance directory.
// Fallback link for states not in STATE_DATA.
export const DOL_DIRECTORY = 'https://www.dol.gov/general/topic/unemployment-insurance';

// Last-verified date for the data above. Surfaced in UI as "as of [date]".
export const DATA_AS_OF = 'March 2026';
