// ============================================================================
// JUST LAID OFF — page for someone who just lost their job
// ============================================================================
// First page in the planned "Transitions" content section. Designed for the
// reader who's rattled, scared, and needs a clear sequenced playbook for
// what to do this week — paired with calm reassurance that they have more
// time than they think.
//
// The page is also intentionally usable by readers who quit voluntarily or
// are planning ahead. About 80% of the content applies to all three audiences.
// Audience-specific content lives in callout cards and footer cross-references
// to /leaving-by-choice and /planning-exit (those pages are backlogged for
// future iterations — for now those links go to the homepage).
//
// State picker: drives state-specific UI guidance (weekly max, weeks of
// benefits, waiting week, taxation of UI). Top 15 states have full data;
// other states fall back to a "verify on your state's UI portal" prompt with
// a direct portal link from the data file.
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowDown, AlertTriangle, CheckCircle2, Sparkles,
  ShieldCheck, Calendar, ExternalLink, Wallet, Heart,
  Briefcase, Receipt, X, Activity, Lock
} from 'lucide-react';
import { STATE_DATA, ALL_STATES, DOL_DIRECTORY, DATA_AS_OF } from './data/stateData.js';

// Reuse the same theme tokens as App.jsx so the look stays consistent.
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

const DISPLAY_FONT = "'Bowlby One SC', 'Sansita One', Georgia, serif";
const BODY_FONT = "'Inter', system-ui, -apple-system, sans-serif";
const MONO_FONT = "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace";

const STORAGE_KEY = 'ackwak.userState';

export default function JustLaidOffPage() {
  // Persist state selection so a returning user doesn't have to pick again.
  const [selectedState, setSelectedState] = useState(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(STORAGE_KEY) || '';
  });

  useEffect(() => {
    if (selectedState) {
      window.localStorage.setItem(STORAGE_KEY, selectedState);
    }
  }, [selectedState]);

  const stateInfo = selectedState ? STATE_DATA[selectedState] : null;
  // For states not in our top-15 dataset, we know the full name but lack
  // the detailed UI/tax data — fall back to a generic prompt.
  const stateName = useMemo(() => {
    if (!selectedState) return '';
    return ALL_STATES.find(s => s.code === selectedState)?.name || '';
  }, [selectedState]);

  return (
    <div style={{ background: T.bg, minHeight: '100vh', fontFamily: BODY_FONT, color: T.ink }}>
      <PageNav />
      <Hero />
      <NotAdviceBanner />
      <Reassurance />
      <StatePicker
        selectedState={selectedState}
        onChange={setSelectedState}
      />
      <Playbook stateInfo={stateInfo} stateName={stateName} selectedState={selectedState} />
      <ThingsNotToDo />
      <UseTheCalculator />
      <CrossReferences />
      <FinalDisclaimer />
      <Footer />
    </div>
  );
}

// ============================================================================
// PAGE NAV
// ============================================================================
function PageNav() {
  return (
    <nav style={{
      borderBottom: `1px solid ${T.rule}`,
      background: T.surface,
      position: 'sticky', top: 0, zIndex: 30
    }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
        <Link to="/" style={{
          color: T.ink, textDecoration: 'none',
          fontFamily: DISPLAY_FONT, fontSize: 18, fontWeight: 500,
          letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 6
        }}>
          ackwak.com
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/calculator" style={{
            color: T.inkSoft, textDecoration: 'none',
            fontSize: 12, fontWeight: 500,
            letterSpacing: '0.05em', textTransform: 'uppercase',
            padding: '8px 12px'
          }}>
            Calculators
          </Link>
          <Link to="/calculator" style={{
            background: T.ink, color: T.surface, textDecoration: 'none',
            padding: '8px 14px', fontWeight: 600,
            fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase'
          }}>
            Launch app
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ============================================================================
// HERO
// ============================================================================
function Hero() {
  return (
    <section style={{
      background: T.surface,
      borderBottom: `1px solid ${T.rule}`
    }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8" style={{ paddingTop: 64, paddingBottom: 56 }}>
        <div className="flex items-center gap-2 mb-5" style={{ color: T.muted }}>
          <Sparkles size={12} strokeWidth={1.5} />
          <span className="text-[11px] uppercase tracking-[0.2em]" style={{ fontWeight: 500 }}>
            Transitions, the first week
          </span>
        </div>
        <h1 style={{
          fontFamily: DISPLAY_FONT, fontWeight: 500,
          fontSize: 'clamp(36px, 7vw, 72px)',
          lineHeight: 0.98, letterSpacing: '-0.02em', color: T.ink,
          marginBottom: 24
        }}>
          Just got laid off?
        </h1>
        <p style={{
          fontFamily: BODY_FONT, fontWeight: 400,
          fontSize: 'clamp(18px, 2.4vw, 26px)',
          lineHeight: 1.4, letterSpacing: '-0.01em', color: T.inkSoft,
          marginBottom: 0
        }}>
          Take a breath. Here are some things to think about this week, roughly in order. None of this is advice for your specific situation; it's context to help you ask better questions.
        </p>
      </div>
    </section>
  );
}

// ============================================================================
// REASSURANCE
// ============================================================================
function Reassurance() {
  return (
    <section style={{ background: T.bg }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8" style={{ paddingTop: 32, paddingBottom: 24 }}>
        <div style={{
          background: T.surface, border: `1px solid ${T.rule}`,
          padding: 'clamp(20px, 4vw, 36px)', position: 'relative',
          borderLeft: `4px solid ${T.emerald}`
        }}>
          <div className="flex items-center gap-2 mb-3" style={{ color: T.emerald }}>
            <ShieldCheck size={14} strokeWidth={1.75} />
            <span className="text-[11px] uppercase tracking-[0.18em]" style={{ fontWeight: 700 }}>
              Before you do anything
            </span>
          </div>
          <p style={{
            fontFamily: BODY_FONT, fontWeight: 400,
            fontSize: 'clamp(15px, 1.8vw, 18px)',
            lineHeight: 1.55, color: T.ink, marginBottom: 16
          }}>
            Many people find they have more time than they expect once they actually look at the numbers. Severance, unemployment benefits, partner income, savings, and modest expense reductions can stretch further than the panic suggests. The first week often goes better when it's spent <strong style={{ color: T.ink }}>understanding your situation</strong> rather than rushing into a job search.
          </p>
          <p style={{
            fontSize: 14, lineHeight: 1.6, color: T.inkSoft, margin: 0
          }}>
            How much time you really have depends on details that are specific to you. The Job Loss Runway calculator on this site can help you see your own numbers. For decisions that involve law, taxes, or significant amounts of money, talking to a qualified professional is worth the cost.
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// STATE PICKER
// ============================================================================
function StatePicker({ selectedState, onChange }) {
  return (
    <section style={{ background: T.bg }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <div style={{
          background: T.navySoft, border: `1px solid ${T.navy}30`,
          padding: 'clamp(16px, 3vw, 24px)'
        }}>
          <div className="flex items-start gap-3 flex-wrap">
            <div className="flex-1 min-w-0" style={{ minWidth: 240 }}>
              <div className="flex items-center gap-2 mb-2" style={{ color: T.navy }}>
                <Activity size={12} strokeWidth={1.75} />
                <span className="text-[10px] uppercase tracking-[0.18em]" style={{ fontWeight: 700 }}>
                  Personalize this guide
                </span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.5, color: T.ink, margin: 0 }}>
                Pick your state to see your specific unemployment benefits, taxes, and filing portal. Your selection is saved in this browser only.
              </p>
            </div>
            <div className="shrink-0" style={{ minWidth: 200 }}>
              <select
                value={selectedState}
                onChange={(e) => onChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: T.surface,
                  border: `1px solid ${T.rule}`,
                  fontFamily: BODY_FONT, fontSize: 14,
                  color: T.ink, fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                <option value="">Select your state...</option>
                {ALL_STATES.map(s => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PLAYBOOK — the seven days
// ============================================================================
function Playbook({ stateInfo, stateName, selectedState }) {
  return (
    <section style={{ background: T.bg }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8" style={{ paddingTop: 24, paddingBottom: 56 }}>
        <SectionHeading
          eyebrow="A rough first week"
          title="Things to think about, in order"
          desc="A loose timeline of topics that often come up in the first week. Skip anything that doesn't apply to you. Most items are quick to research; many benefit from professional guidance."
        />

        <Day
          number={1}
          title="The day it happens"
          deadline="Before you leave the building"
          actions={[
            {
              icon: Briefcase,
              tone: 'navy',
              heading: 'Getting separation paperwork in writing',
              body: "Many people find it's helpful to leave with a written letter that confirms the last day of work, the reason for separation (layoff vs termination can affect unemployment eligibility), and the severance terms being offered. Login or PIN information for COBRA paperwork, the final pay statement, and any 401(k) plan documents may also be useful. Personal contact info for someone in HR can be helpful in case questions come up later."
            },
            {
              icon: AlertTriangle,
              tone: 'amber',
              heading: 'Whether to sign anything that day',
              body: "Severance agreements often contain release-of-claims language and other terms that vary in significance. Many employment lawyers suggest treating any document offered during a separation meeting as something to read carefully, not necessarily to sign immediately. The specifics of how much time you have to review, and what your rights are, depend on your age, your state, the size of the layoff, and the agreement itself. If significant money or broad legal language is involved, a brief consultation with an employment attorney is something many people consider worth the cost."
            },
            {
              icon: Wallet,
              heading: 'Your final paycheck',
              body: "Final paycheck rules vary considerably by state. Some states require payment immediately at separation; others allow until the next regular payday. Whether unused PTO must be paid out also varies by state and by employer policy. Writing down what you believe you're owed (accrued vacation, sick time, commissions, bonuses) before you leave gives you something to verify against later."
            }
          ]}
        />

        <Day
          number={2}
          title="The day after"
          deadline="Within 24 hours, when you're ready"
          actions={[
            {
              icon: ShieldCheck,
              tone: 'emerald',
              heading: 'Looking into unemployment insurance',
              body: stateInfo
                ? <>For {stateInfo.name}, the official portal is <a href={stateInfo.portal} target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: 'underline' }}>{stateInfo.portalLabel}</a>. Eligibility, timing, and whether to file before or after receiving severance are decisions that depend on your specific circumstances. Many states do not pay benefits retroactively for time before a claim is filed, which is why some people choose to file early and let the state determine eligibility. Your state's portal is the authoritative source for what applies to you.</>
                : selectedState
                  ? <>For <strong>{stateName}</strong>, the official state unemployment portal is the authoritative source for filing requirements, eligibility, and benefit amounts. You can find it through a search like "{stateName} unemployment apply online" or via the <a href={DOL_DIRECTORY} target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: 'underline' }}>federal directory</a>. Detailed data for {stateName} isn't yet in this guide, so the state portal is the best place to verify current weekly benefit amounts and duration.</>
                  : "Pick your state above to get a direct link to the official filing portal. Eligibility, timing, and the interplay between severance and unemployment benefits are decisions that depend on your specific circumstances. Your state's portal is the authoritative source for what applies to you."
            },
            stateInfo && {
              icon: ShieldCheck,
              heading: `${stateName} unemployment data`,
              body: <StateUiDetails state={stateInfo} />
            },
            {
              icon: Wallet,
              heading: 'Writing things down',
              body: "Keeping a single document with the basic facts of your situation (separation date, severance amount and structure, COBRA premium being quoted, current account balances, monthly fixed expenses) can make later decisions easier. People often find that decisions feel less overwhelming when the underlying numbers are visible in one place."
            }
          ].filter(Boolean)}
        />

        <Day
          number={3}
          title="Day 2 to 3"
          deadline="In the first 72 hours"
          actions={[
            {
              icon: Heart,
              tone: 'amber',
              heading: 'Health insurance options worth comparing',
              body: <>Employer health insurance typically ends either at separation or at the end of the month, depending on the plan. Two common paths to bridge coverage are continuing the same plan through COBRA (which often runs more than people expect, since you pay the full premium) or shopping the ACA marketplace at <a href="https://www.healthcare.gov" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: 'underline' }}>healthcare.gov</a>, where reduced income may qualify you for subsidies. There's typically a 60-day window to elect COBRA, so some people compare the two before deciding. Which option is right depends on your family situation, prescription needs, and provider preferences. A licensed broker can walk through tradeoffs at no cost to you. <strong>Bottom line:</strong> these are personal decisions worth thinking through, not rushing.</>
            },
            {
              icon: Receipt,
              heading: 'Looking at recurring expenses',
              body: "Going through credit card statements and listing every recurring charge is a low-stress evening task that often surfaces savings. Streaming services, fitness apps, productivity tools you used at work, and trial subscriptions that auto-renewed quietly. Some are easy to pause; others may be worth keeping. The point isn't to slash everything; it's to know what you're spending."
            }
          ]}
        />

        <Day
          number={4}
          title="Day 4 to 5"
          deadline="As the first week settles"
          actions={[
            {
              icon: Briefcase,
              tone: 'navy',
              heading: 'Severance, and whether to negotiate',
              body: "Severance offers vary widely between companies, and there's often more flexibility than the initial offer suggests. Things people sometimes ask about include additional weeks of pay, an extension of medical coverage, accelerated equity vesting, a written reference letter, and adjustments to non-compete or non-disparagement language. Whether any of these is realistic depends on your role, your tenure, and the specifics of the package. For agreements involving significant money or broad legal language, an employment attorney consultation (often a flat fee in the $300 to $800 range for a severance review) is something many people consider worth the cost. This is genuinely a situation where qualified legal advice can make a real difference."
            },
            {
              icon: ShieldCheck,
              heading: 'Running your own runway numbers',
              body: <>Once you have actual numbers (severance amount, expected unemployment benefits, COBRA quote, current account balances), the <Link to="/calculator" style={{ color: T.ink, textDecoration: 'underline' }}>Job Loss Runway calculator</Link> can show you a rough month-by-month picture of how long your savings last under different scenarios. This is for your own understanding only; it doesn't account for everything (taxes on severance, unexpected expenses, market volatility) and isn't a substitute for talking to a financial professional about decisions involving significant amounts of money.</>
            }
          ]}
        />

        <Day
          number={5}
          title="Days 6 to 7"
          deadline="End of the first week"
          actions={[
            {
              icon: Wallet,
              heading: 'Thinking about your 401(k)',
              body: "There are typically four paths for an employer 401(k) after separation: leave it where it is (often available if the balance exceeds a threshold set by the plan), roll it into a future employer's plan, roll it into an IRA at a brokerage like Fidelity, Vanguard, or Schwab, or cash it out. Each has tax implications. Cashing out before retirement age generally triggers ordinary income tax plus an additional penalty, which can take a substantial portion of the balance. There's usually no rush to decide; funds can often sit at a former employer for an extended period. This is an area where talking with a financial advisor or tax professional, even for a single consultation, can be especially valuable given how the tax math compounds over decades."
            },
            {
              icon: Briefcase,
              heading: 'LinkedIn and your network, gently',
              body: 'Whether and how to update LinkedIn is a personal call. Some people change their headline to something neutral and reach out to a few trusted contacts; others wait until they feel less raw before posting publicly. Whatever feels right is fine. The most useful network outreach is often to a small number of people you trust, with a low-key "wanted to let you know I\'m looking" rather than a public announcement.'
            },
            {
              icon: Calendar,
              heading: 'Coffee, conversation, low pressure',
              body: 'Reaching out to two or three former colleagues you trust, just to talk, helps many people more than they expect. Not for job leads, not yet. Activating a network gently in week one tends to pay off later, when you have more clarity on what you\'re looking for and people are already aware that you\'re open to opportunities.'
            }
          ]}
        />
      </div>
    </section>
  );
}

function Day({ number, title, deadline, actions }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.rule}`,
      padding: 'clamp(20px, 3vw, 32px)', marginBottom: 16
    }}>
      <div className="flex items-baseline gap-3 mb-1 flex-wrap">
        <div style={{
          fontFamily: MONO_FONT, fontSize: 11, fontWeight: 600,
          letterSpacing: '0.15em', color: T.muted
        }}>
          DAY {number}
        </div>
        <div style={{
          fontFamily: BODY_FONT, fontSize: 11, fontWeight: 500,
          letterSpacing: '0.05em', textTransform: 'uppercase',
          color: T.amber
        }}>
          {deadline}
        </div>
      </div>
      <h3 style={{
        fontFamily: DISPLAY_FONT, fontWeight: 500,
        fontSize: 'clamp(22px, 3vw, 30px)',
        letterSpacing: '-0.01em', color: T.ink, lineHeight: 1.1,
        marginBottom: 20, marginTop: 4
      }}>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {actions.map((action, i) => (
          <ActionItem key={i} {...action} />
        ))}
      </div>
    </div>
  );
}

function ActionItem({ icon: Icon, tone, heading, body }) {
  const accent = tone === 'oxblood' ? T.oxblood
              : tone === 'emerald' ? T.emerald
              : tone === 'amber' ? T.amber
              : tone === 'navy' ? T.navy
              : T.muted;
  return (
    <div style={{
      borderLeft: `3px solid ${accent}`,
      paddingLeft: 'clamp(12px, 2vw, 16px)',
      paddingTop: 4, paddingBottom: 4
    }}>
      <div className="flex items-start gap-2 mb-2">
        {Icon && <Icon size={14} strokeWidth={1.75} style={{ color: accent, marginTop: 4, flexShrink: 0 }} />}
        <h4 style={{
          fontFamily: BODY_FONT, fontWeight: 700,
          fontSize: 'clamp(14px, 1.8vw, 16px)',
          color: T.ink, lineHeight: 1.4, margin: 0
        }}>
          {heading}
        </h4>
      </div>
      <div style={{
        fontSize: 14, lineHeight: 1.6, color: T.inkSoft, marginLeft: 22
      }}>
        {body}
      </div>
    </div>
  );
}

// ============================================================================
// STATE-SPECIFIC UI DETAILS
// ============================================================================
function StateUiDetails({ state }) {
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        <DataCell label="Max weekly benefit" value={`$${state.uiMax.toLocaleString()}`} note={state.uiMaxNote} />
        <DataCell label="Maximum weeks" value={`${state.uiWeeks} weeks`} note={state.uiWeeksNote} />
        <DataCell label="Waiting week" value={state.waitingWeek ? 'Yes (1 week unpaid)' : 'No'} />
        <DataCell label="State taxes UI?" value={state.taxesUI ? 'Yes' : (state.incomeTax ? 'No' : 'No state income tax')} />
      </div>
      <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, fontStyle: 'italic' }}>
        Figures verified as of {DATA_AS_OF}. Maximum benefits adjust annually around July 1. Always verify current figures on the official state portal before relying on them for planning.
      </div>
    </div>
  );
}

function DataCell({ label, value, note }) {
  return (
    <div>
      <div style={{
        fontSize: 9, color: T.muted, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.12em',
        marginBottom: 4
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: DISPLAY_FONT, fontSize: 'clamp(15px, 2vw, 18px)',
        fontWeight: 500, color: T.ink, lineHeight: 1.2,
        fontVariantNumeric: 'tabular-nums'
      }}>
        {value}
      </div>
      {note && (
        <div style={{
          fontSize: 10, color: T.muted, marginTop: 4,
          lineHeight: 1.4
        }}>
          {note}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// THINGS NOT TO DO
// ============================================================================
function ThingsNotToDo() {
  const items = [
    {
      title: "Think twice about cashing out your 401(k)",
      body: "Cashing out before retirement age generally triggers federal and state income tax on the full amount, plus an additional early-withdrawal penalty, which together can take a substantial portion of the balance. Beyond the immediate tax cost, money pulled out now loses decades of potential compounding. For most people facing a temporary income gap, other options (severance, savings, partial expense reductions, brokerage funds) carry less long-term cost. A financial advisor can walk through what makes sense for your specific situation."
    },
    {
      title: "Think twice about a heated layoff post on day one",
      body: "Whatever feels true today often reads differently in two years when a hiring manager finds it. Many people give themselves a few days before posting publicly, which lets the message land in a calmer place. If posting feels right, focusing on what you're looking for next tends to age better than focusing on what the company did wrong."
    },
    {
      title: "Think twice about signing without reading carefully",
      body: "Severance agreements often contain non-compete, non-disparagement, and release-of-claims language. Some clauses may not be enforceable in your state; others may limit options you'd want to keep. An employment attorney consultation, often a flat fee, can highlight clauses worth questioning. For agreements involving meaningful money or broad legal language, this is one of the clearest cases where qualified legal advice can change outcomes."
    },
    {
      title: "Think twice about skipping the unemployment filing",
      body: "Some people assume that having severance disqualifies them from unemployment benefits, or that the amounts aren't worth the effort. Eligibility rules vary by state, and the interaction between severance and unemployment is more nuanced than people often expect. Filing through your state's portal lets the system determine what you're eligible for; the state is the authoritative source on this, not friends or coworkers."
    },
    {
      title: "Think twice about tapping home equity in week one",
      body: "Home equity lines and cash-out refinances are flexible tools, but they convert what is currently a job-loss situation into ongoing debt service that outlasts the gap. If other liquid options exist (cash, taxable investments, severance), most people prefer to use those first. A conversation with a financial advisor can clarify which sources make sense in what order, given your specific circumstances."
    },
    {
      title: "Think twice about jumping straight into all-day applications",
      body: "It can feel productive to start firing off applications the day after a layoff. People who pause first to understand their financial situation often end up making better decisions, including being able to wait for the right opportunity instead of accepting the first acceptable offer. The first few days spent setting up financial scaffolding tend to pay back in the weeks that follow."
    }
  ];

  return (
    <section style={{ background: T.surfaceWarm, borderTop: `1px solid ${T.rule}`, borderBottom: `1px solid ${T.rule}` }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8" style={{ paddingTop: 56, paddingBottom: 56 }}>
        <SectionHeading
          eyebrow="Common second-guesses"
          title="Things to think twice about"
          desc="Decisions that often look reasonable in a panic but tend to cost more in hindsight. None of these are universal rules; each depends on your specific situation."
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((item, i) => (
            <div key={i} style={{
              background: T.surface, border: `1px solid ${T.rule}`,
              borderLeft: `3px solid ${T.amber}`,
              padding: 'clamp(14px, 2.5vw, 20px)'
            }}>
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle size={14} strokeWidth={2} style={{ color: T.amber, marginTop: 4, flexShrink: 0 }} />
                <h4 style={{
                  fontFamily: BODY_FONT, fontWeight: 700,
                  fontSize: 'clamp(14px, 1.8vw, 16px)',
                  color: T.ink, margin: 0, lineHeight: 1.3
                }}>
                  {item.title}
                </h4>
              </div>
              <p style={{
                fontSize: 13, lineHeight: 1.6, color: T.inkSoft,
                margin: 0, marginLeft: 22
              }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// USE THE CALCULATOR
// ============================================================================
function UseTheCalculator() {
  return (
    <section style={{ background: T.bg }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8" style={{ paddingTop: 56, paddingBottom: 24 }}>
        <div style={{
          background: T.ink, color: T.surface,
          padding: 'clamp(28px, 5vw, 48px)', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 280, height: 280,
            background: `radial-gradient(circle at top right, ${T.emerald}40, transparent 70%)`,
            opacity: 0.6, pointerEvents: 'none'
          }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3" style={{ color: '#9DD9B5' }}>
              <Sparkles size={12} strokeWidth={1.5} />
              <span style={{
                fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600
              }}>
                Run your numbers
              </span>
            </div>
            <h3 style={{
              fontFamily: DISPLAY_FONT, fontWeight: 500,
              fontSize: 'clamp(24px, 4vw, 38px)',
              letterSpacing: '-0.01em', lineHeight: 1.05,
              color: T.surface, marginBottom: 16
            }}>
              See your own runway numbers.
            </h3>
            <p style={{
              fontSize: 'clamp(14px, 1.6vw, 16px)',
              lineHeight: 1.55, color: '#C9C4BB', marginBottom: 24, maxWidth: 600
            }}>
              The Job Loss Runway calculator can help you map out a rough month-by-month picture using your actual numbers (severance, expected unemployment, COBRA estimate, partner income). Three scenarios let you see a range of outcomes. It's a thinking tool, not advice for your specific situation.
            </p>
            <Link to="/calculator" style={{
              background: T.surface, color: T.ink, textDecoration: 'none',
              padding: '12px 20px', fontWeight: 600,
              fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
              display: 'inline-flex', alignItems: 'center', gap: 8
            }}>
              Open the calculator <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CROSS-REFERENCES
// ============================================================================
function CrossReferences() {
  return (
    <section style={{ background: T.bg }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8" style={{ paddingTop: 32, paddingBottom: 64 }}>
        <SectionHeading
          eyebrow="Different situation?"
          title="Other paths through a transition"
          desc="This guide assumes a sudden, involuntary layoff. If your circumstances are different, these guides will be more useful (coming soon)."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CrossRefCard
            label="Coming soon"
            title="Leaving by choice"
            body="Quit, fired-for-cause, retired early. UI eligibility nuances, gap-coverage timing, no severance to negotiate but more time to plan."
            disabled
          />
          <CrossRefCard
            label="Coming soon"
            title="Planning your exit"
            body="Months out from leaving. Negotiation tactics, optimal timing for severance and equity vesting, tax-smart exit calendar."
            disabled
          />
        </div>
      </div>
    </section>
  );
}

function CrossRefCard({ label, title, body, disabled }) {
  const card = (
    <div style={{
      background: disabled ? T.surfaceWarm : T.surface,
      border: `1px solid ${T.rule}`,
      padding: 'clamp(16px, 3vw, 24px)',
      opacity: disabled ? 0.65 : 1,
      cursor: disabled ? 'default' : 'pointer'
    }}>
      <div className="flex items-baseline gap-2 mb-2">
        <span style={{
          fontSize: 10, color: disabled ? T.muted : T.emerald,
          fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase'
        }}>
          {label}
        </span>
        {disabled && <Lock size={10} strokeWidth={2} style={{ color: T.muted }} />}
      </div>
      <h4 style={{
        fontFamily: DISPLAY_FONT, fontSize: 'clamp(18px, 2.5vw, 22px)',
        fontWeight: 500, color: T.ink, letterSpacing: '-0.01em',
        marginBottom: 8, lineHeight: 1.15
      }}>
        {title}
      </h4>
      <p style={{ fontSize: 13, lineHeight: 1.5, color: T.inkSoft, margin: 0 }}>
        {body}
      </p>
    </div>
  );
  return card;
}

// ============================================================================
// FOOTER
// ============================================================================
function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${T.rule}`, background: T.bg }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8" style={{ paddingTop: 48, paddingBottom: 56 }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="sm:col-span-2">
            <Link to="/" style={{
              fontFamily: DISPLAY_FONT, fontSize: 22, fontWeight: 500, color: T.ink,
              textDecoration: 'none'
            }}>
              ackwak.com
            </Link>
            <p style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.55, marginTop: 12, maxWidth: 420 }}>
              A free, private wealth calculator and a growing library of guides for people in work transitions. No accounts, no tracking.
            </p>
          </div>
          <div>
            <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
              Tools
            </div>
            <Link to="/calculator" style={{ display: 'block', fontSize: 13, color: T.ink, textDecoration: 'none', marginBottom: 6 }}>
              Calculators
            </Link>
            <Link to="/just-laid-off" style={{ display: 'block', fontSize: 13, color: T.ink, textDecoration: 'none', marginBottom: 6 }}>
              Just laid off
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-5 flex flex-wrap items-center justify-between gap-3" style={{ borderTop: `1px solid ${T.rule}`, fontSize: 11, color: T.muted }}>
          <span>© {new Date().getFullYear()} SLAE Labs LLC. All rights reserved. ackwak.com is a product of SLAE Labs LLC.</span>
          <div style={{ fontSize: 11, color: T.muted, fontStyle: 'italic' }}>
            This page is informational. It is not financial, legal, or tax advice.
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// NOT ADVICE BANNER (shown near the top of the page)
// ============================================================================
function NotAdviceBanner() {
  return (
    <section style={{ background: T.bg }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8" style={{ paddingTop: 24, paddingBottom: 0 }}>
        <div style={{
          background: T.amberSoft, border: `1px solid ${T.amber}40`,
          padding: 'clamp(14px, 2.5vw, 20px)',
          display: 'flex', gap: 12, alignItems: 'flex-start'
        }}>
          <AlertTriangle size={18} strokeWidth={2} style={{ color: T.amber, flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{
              fontSize: 11, color: T.amber, fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6
            }}>
              Read this first
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.55, color: T.ink, margin: 0 }}>
              This page is informational only and is not financial, legal, or tax advice. Every situation is different. For decisions that involve significant money, contracts, or taxes, consult a qualified employment attorney, financial advisor, or tax professional who knows your specific circumstances.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FINAL DISCLAIMER (shown near the bottom, before the footer)
// ============================================================================
function FinalDisclaimer() {
  return (
    <section style={{ background: T.bg }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8" style={{ paddingTop: 32, paddingBottom: 56 }}>
        <div style={{
          background: T.surface, border: `1px solid ${T.rule}`,
          padding: 'clamp(20px, 3.5vw, 28px)'
        }}>
          <div style={{
            fontSize: 11, color: T.muted, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10
          }}>
            One more time, because it matters
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: T.inkSoft, margin: 0, marginBottom: 10 }}>
            Everything on this page is general information meant to help you ask better questions. It is not legal advice, financial advice, tax advice, or a substitute for talking with a qualified professional who knows your specific circumstances.
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: T.inkSoft, margin: 0 }}>
            For severance agreements, employment contracts, or anything involving the law, consider speaking with an employment attorney. For decisions about retirement accounts, taxes, or significant financial choices, consider speaking with a fiduciary financial advisor or a tax professional. Many offer initial consultations at no cost or for a flat fee.
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// SHARED HELPERS
// ============================================================================
function SectionHeading({ eyebrow, title, desc }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{
        fontSize: 11, color: T.muted, fontWeight: 600,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        marginBottom: 8
      }}>
        {eyebrow}
      </div>
      <h2 style={{
        fontFamily: DISPLAY_FONT, fontSize: 'clamp(28px, 4.5vw, 44px)',
        fontWeight: 500, color: T.ink, letterSpacing: '-0.02em',
        lineHeight: 1.05, marginBottom: 12
      }}>
        {title}
      </h2>
      {desc && (
        <p style={{ fontSize: 'clamp(14px, 1.7vw, 17px)', lineHeight: 1.55, color: T.inkSoft, margin: 0, maxWidth: 640 }}>
          {desc}
        </p>
      )}
    </div>
  );
}
