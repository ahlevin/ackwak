// ============================================================================
// LEAVING ON YOUR TERMS, voluntary departure guide
// ============================================================================
// Combined audience page for two related but distinct readers:
//   1. People thinking about leaving voluntarily (months out, planning)
//   2. People who've decided and are giving notice soon (weeks out, executing)
//
// Earlier design considered building these as two separate pages, but the content
// overlap was estimated at ~70% so we consolidated into a single narrative-arc
// page that walks the reader through the timeline of a voluntary departure:
// Months out → A few weeks out → Giving notice → After your last day.
//
// Tone: hedged "things to consider" framing, same as the softened /just-laid-off
// page. No imperatives. Repeatedly suggests professional input (employment
// attorney, financial advisor, tax pro) where stakes are real.
//
// Voluntary unemployment eligibility note: most states do not pay UI to
// workers who quit voluntarily without "good cause." Some "good cause"
// exceptions exist and vary by state. The page makes this clear without
// discouraging readers from researching their specific situation.
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SiteNav } from './App.jsx';
import {
  ArrowRight, AlertTriangle, Sparkles, ShieldCheck, Calendar,
  ExternalLink, Wallet, Heart, Briefcase, Receipt, Lock,
  Activity, MessageSquare, TrendingUp, Compass, ClipboardList,
  HandshakeIcon, FileText
} from 'lucide-react';
import { STATE_DATA, ALL_STATES, DOL_DIRECTORY, DATA_AS_OF } from './data/stateData.js';

// Reuse the same theme tokens as App.jsx and JustLaidOffPage so the look stays consistent.
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

// Reuse the same localStorage key as /just-laid-off so a user who picked their
// state on one transitions page doesn't have to pick again on another.
const STORAGE_KEY = 'ackwak.userState';

export default function LeavingOnYourTermsPage() {
  // Persist state selection across pages and sessions.
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
  const stateName = useMemo(() => {
    if (!selectedState) return '';
    return ALL_STATES.find(s => s.code === selectedState)?.name || '';
  }, [selectedState]);

  return (
    <div style={{ background: T.bg, minHeight: '100vh', fontFamily: BODY_FONT, color: T.ink }}>
      <SiteNav />
      <Hero />
      <NotAdviceBanner />
      <Reassurance />
      <StatePicker
        selectedState={selectedState}
        onChange={setSelectedState}
      />
      <PhaseSection
        phaseNum={1}
        title="Months out"
        subtitle="Should you leave?"
        deadline="Anytime, no rush"
        intro="The earliest phase, and arguably the most consequential. Decisions made here shape everything that follows. There's no urgency, which is itself a feature. Most people benefit from sitting with these questions for weeks before acting."
        actions={[
          {
            icon: Compass,
            tone: 'navy',
            heading: 'Why are you leaving?',
            body: "Sounds basic, but the answer shapes everything else. Pay, growth, work-life balance, manager, role fit, values, life circumstances. Many people find it useful to write down the actual reasons, ranked, before doing anything else. The reasons inform what you're looking for next, what counter-offers you'd actually consider, and how to talk about the departure later. If the answer is mostly about a single fixable problem (one bad manager, one stalled project), some people find a candid internal conversation surfaces options they hadn't considered."
          },
          {
            icon: TrendingUp,
            tone: 'emerald',
            heading: 'Building a financial buffer',
            body: <>Voluntary departures usually mean no severance and (in most states) no unemployment benefits. More on that in the state section. Many people aim to have several months of expenses set aside before leaving, particularly if the next job isn't lined up yet. The <Link to="/calculator" style={{ color: T.ink, textDecoration: 'underline' }}>Job Loss Runway calculator</Link> can help you see what your own buffer looks like in practice. Building this buffer in the months before leaving (rather than after) is often easier because you still have full income coming in.</>
          },
          {
            icon: Briefcase,
            heading: 'Vesting and timing windows',
            body: "Equity vesting cliffs, annual bonus dates, 401(k) match true-ups, and PTO accrual policies can each shift the value of leaving by thousands of dollars depending on timing. Looking at your offer letter and your benefits portal can surface things worth waiting for, or things that argue for leaving sooner. A few weeks of patience to clear a vesting cliff is often worth it. For larger or more complex compensation arrangements, a brief consultation with a financial advisor or tax professional can be valuable."
          },
          {
            icon: Heart,
            heading: 'Health insurance: what changes',
            body: <>Employer-provided health insurance ends either at separation or at the end of that month, depending on the plan. The two common bridges are continuing the same plan through COBRA (you pay the full premium, often a multiple of what you paid as an employee) or shopping the ACA marketplace at <a href="https://www.healthcare.gov" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: 'underline' }}>healthcare.gov</a>, where lower projected income may qualify you for premium subsidies. Many people find ACA the better deal, especially with reduced income. Worth looking into now so the costs don't surprise you later.</>
          },
          {
            icon: ClipboardList,
            heading: 'Quietly preparing the practical stuff',
            body: "Personal copies of files, contacts, and records you might want later. Anything you're contractually allowed to take. References lined up. Updated resume and LinkedIn (subtly, no broadcasts). Personal email forwarding. Setting these up in the months before is much calmer than scrambling in the last week."
          }
        ]}
      />
      <PhaseSection
        phaseNum={2}
        title="A few weeks out"
        subtitle="Setting yourself up"
        deadline="2 to 4 weeks before"
        intro="Once the decision feels real, this is the phase where preparation gets specific. Different from 'months out' planning. These are concrete to-dos with deadlines that matter."
        actions={[
          {
            icon: Wallet,
            tone: 'emerald',
            heading: 'Confirming your runway numbers',
            body: <>Now that timing is real, run the actual numbers. The <Link to="/calculator" style={{ color: T.ink, textDecoration: 'underline' }}>Job Loss Runway calculator</Link> will show you a month-by-month picture using your real account balances, monthly expenses, and (if you have one lined up) start date for the next role. Many people find this is the moment they realize they're either more or less ready than they thought.</>
          },
          {
            icon: Heart,
            heading: 'Health insurance, decided',
            body: "If you haven't yet, pick the bridge plan and price it out. Both COBRA election windows and ACA marketplace special enrollment periods are typically 60 days from your loss-of-coverage date, so there's some flexibility on timing, but knowing what you'll do (and roughly what it costs) before you give notice helps. A licensed broker can walk through tradeoffs at no cost; many people find it useful to talk to one."
          },
          {
            icon: Receipt,
            heading: 'Subscriptions, recurring expenses, lifestyle',
            body: "Going through credit card statements and listing every recurring charge surfaces savings most months don't notice. Streaming, fitness, productivity tools, news, software you used at work. Some easy to pause; some worth keeping. Doing this before income stops makes the transition smoother."
          },
          {
            icon: Briefcase,
            heading: 'Your last paycheck and PTO',
            body: "Final paycheck rules vary by state. Many states require payment within a specific window after separation, sometimes including unused PTO if your state mandates payout. Looking at your accrued PTO balance and your state's PTO laws now (and your employer's written policy) tells you whether to use up time off before leaving or expect a payout afterward. The math is sometimes meaningful: a few weeks of PTO at full salary can be worth thousands."
          },
          {
            icon: TrendingUp,
            heading: '401(k) and equity decisions',
            body: "Decisions about what to do with your 401(k) (leave it, roll to a new employer's plan, roll to an IRA) usually don't have to be made before separation. Equity is different. Vested options often have a 90-day post-separation exercise window, after which they expire. Knowing what's vested, what isn't, and what your exercise costs would be is worth a careful look. If exercise costs are significant, this is one of the clearest cases where a brief consultation with a financial advisor or tax professional can pay for itself."
          }
        ]}
      />
      <PhaseSection
        phaseNum={3}
        title="Giving notice"
        subtitle="The actual exit"
        deadline="Day of notice + 2 weeks (typical)"
        intro="The act of resigning. Most of this is short-duration but important. It shapes how the next few weeks go and what people remember about you afterward."
        showStateInfo
        stateInfo={stateInfo}
        stateName={stateName}
        selectedState={selectedState}
        actions={[
          {
            icon: MessageSquare,
            tone: 'navy',
            heading: 'How and when to give notice',
            body: "Two weeks is the conventional standard in the US, though it's not legally required in most circumstances (most US employment is at-will). A short, calm conversation with your manager, followed by a brief written notice, is what most workplaces expect. Many people find it works to have the conversation early in the day, early in the week, so there's time to handle the immediate logistics and so it doesn't dominate the weekend. Whatever you say in that meeting tends to be what gets remembered, so keeping it short and forward-focused (rather than detailed about why) often serves you better."
          },
          {
            icon: HandshakeIcon,
            tone: 'amber',
            heading: 'Counter-offers, what to expect',
            body: "If you're a strong performer, expect one. The conversation often opens with manager surprise, possibly real distress. Pay increases, role changes, accelerated promotion timelines, and retention bonuses are all common levers. Worth knowing in advance: industry research suggests most people who accept counter-offers leave anyway within a year, often because the underlying reasons that prompted the search remain. That doesn't mean they're always wrong to accept. Sometimes the counter genuinely addresses the real issue. But going in knowing what's on the table, and what your actual reasons for leaving are (Phase 1 again), helps you make a clearer call rather than just reacting to flattering numbers."
          },
          {
            icon: FileText,
            heading: 'Non-competes, NDAs, and what you signed',
            body: "Many employment agreements contain non-compete, non-solicitation, and confidentiality language that can affect what you do next. Enforceability of non-competes varies significantly by state. Some states ban them entirely; others enforce them strictly. If your next role is in the same field, or you're thinking about consulting or starting something on your own, having an employment attorney review your agreements is often money well spent. A 30-minute consultation can clarify what's actually enforceable in your situation."
          },
          {
            icon: ClipboardList,
            heading: 'A clean transition',
            body: "Most people find a clean transition is its own small reward, leaving good documentation, good handoff notes, and a list of in-flight items. Beyond being decent to your colleagues, it preserves references and goodwill that compound over years. There's almost never a benefit to walking out scorched-earth, even when leaving for hard reasons. The exception is situations involving harassment, discrimination, or potentially unlawful behavior, where pre-departure documentation may matter and an employment attorney's input is especially valuable."
          },
          {
            icon: Activity,
            heading: 'Mental and emotional space',
            body: "Even chosen departures come with mixed feelings. Relief, anxiety, grief for what you're leaving, excitement, second-guessing. All common, all normal. Many people find it helps to keep some structure in the last two weeks (regular sleep, one or two social events, time outside) rather than treating it as either a victory lap or a long sad goodbye."
          }
        ]}
      />
      <PhaseSection
        phaseNum={4}
        title="After your last day"
        subtitle="The first weeks free"
        deadline="First 30 days"
        intro="The transitional period. Different from a layoff (you chose this), but the financial logistics are similar. Some things must happen in specific windows; others can wait."
        actions={[
          {
            icon: Heart,
            tone: 'emerald',
            heading: 'Health insurance, executed',
            body: "Whichever bridge you picked in earlier phases, this is when it gets activated. COBRA election typically must happen within 60 days of loss of coverage and (importantly) is usually retroactive. You can shop ACA first, and elect COBRA later if needed without a coverage gap. ACA marketplace special enrollment is also typically a 60-day window. Don't let either window pass without a decision."
          },
          {
            icon: TrendingUp,
            heading: '401(k), leave it, roll it, or move it',
            body: "The four common paths for an employer 401(k) after separation: leave it where it is (usually available if the balance is over a plan-set threshold), roll it into a future employer's plan, roll it into a traditional IRA, or cash it out. Each has tax implications. Cashing out before retirement age generally triggers federal and state income tax plus an additional penalty. There's typically no rush, funds can sit at the former employer for an extended period. Rollover services like Capitalize handle the paperwork at no cost; for the tax tradeoffs, a financial advisor or tax pro is worth talking to."
          },
          {
            icon: Briefcase,
            heading: 'Vested equity, exercised or expired',
            body: "If you have vested stock options, the post-separation exercise window is typically 90 days, after which unexercised options expire. The math (cost to exercise, current fair value, tax implications) varies a lot. Restricted stock units (RSUs) usually don't have an exercise, vested shares are yours, but unvested shares are forfeited at separation. For larger or more complex equity situations, this is one of the clearer cases where a financial advisor or tax pro can prevent expensive mistakes."
          },
          {
            icon: ShieldCheck,
            heading: 'Unemployment benefits, the voluntary case',
            body: "Most states do not pay unemployment benefits to workers who quit voluntarily without 'good cause.' What counts as 'good cause' varies by state and is sometimes narrower than people expect, generally limited to circumstances like documented unsafe conditions, certain medical reasons, accompanying a relocating spouse, or constructive discharge. If you think your situation might qualify, the state portal is the authoritative place to check. Even if you don't end up qualifying, the application doesn't cost anything, and the state's determination is the only definitive answer."
          },
          {
            icon: Activity,
            heading: 'The shape of your days',
            body: "Some people who leave voluntarily are surprised by how much the loss of structure affects them, especially if there's a gap before the next thing starts. Treating the gap as a real thing (with intentional rhythm, projects, and social contact) rather than as 'free time that I'll figure out' tends to land better. If the gap is several months and feels heavier than expected, talking to someone about it isn't unreasonable."
          }
        ]}
      />
      <ThingsToThinkTwice />
      <UseTheCalculator />
      <CrossReferences />
      <FinalDisclaimer />
      <Footer />
    </div>
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
            Transitions, leaving by choice
          </span>
        </div>
        <h1 style={{
          fontFamily: DISPLAY_FONT, fontWeight: 500,
          fontSize: 'clamp(36px, 7vw, 72px)',
          lineHeight: 0.98, letterSpacing: '-0.02em', color: T.ink,
          marginBottom: 24
        }}>
          Leaving on your terms?
        </h1>
        <p style={{
          fontFamily: BODY_FONT, fontWeight: 400,
          fontSize: 'clamp(18px, 2.4vw, 26px)',
          lineHeight: 1.4, letterSpacing: '-0.01em', color: T.inkSoft,
          marginBottom: 0
        }}>
          Whether you're months out and thinking, or weeks out and giving notice, here are the things to consider, in roughly the order they tend to come up. Use whatever fits your situation.
        </p>
      </div>
    </section>
  );
}

// ============================================================================
// NOT ADVICE BANNER
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
              This page is informational only and is not financial, legal, or tax advice. Voluntary departures involve specific contractual and tax considerations that depend on your situation. For decisions involving employment contracts, equity, significant money, or taxes, consult a qualified employment attorney, financial advisor, or tax professional who knows your circumstances.
            </p>
          </div>
        </div>
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
              You have time
            </span>
          </div>
          <p style={{
            fontFamily: BODY_FONT, fontWeight: 400,
            fontSize: 'clamp(15px, 1.8vw, 18px)',
            lineHeight: 1.55, color: T.ink, marginBottom: 16
          }}>
            Voluntary departures are different from layoffs in one big way: <strong style={{ color: T.ink }}>you set the timeline</strong>. That means you can plan, optimize, and prepare in ways that aren't possible when the decision is made for you. Many people find the months before leaving, and the choice of when to leave, matter more than they expected.
          </p>
          <p style={{
            fontSize: 14, lineHeight: 1.6, color: T.inkSoft, margin: 0
          }}>
            The flip side: voluntary departures usually mean no severance, and in most states, no unemployment benefits. The financial buffer matters more here than in a layoff. The phases below are organized by timeline so you can find the one that matches where you are.
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// STATE PICKER (same component pattern as /just-laid-off)
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
                Pick your state to see your specific unemployment portal, paycheck rules, and tax context. Your selection is saved in this browser only.
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
// PHASE SECTION (used 4 times, one per phase)
// ============================================================================
function PhaseSection({ phaseNum, title, subtitle, deadline, intro, actions, showStateInfo, stateInfo, stateName, selectedState }) {
  return (
    <section style={{ background: T.bg }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8" style={{ paddingTop: 24, paddingBottom: 24 }}>
        <div style={{
          background: T.surface, border: `1px solid ${T.rule}`,
          padding: 'clamp(20px, 3vw, 32px)'
        }}>
          {/* Phase header */}
          <div className="flex items-baseline gap-3 mb-1 flex-wrap">
            <div style={{
              fontFamily: MONO_FONT, fontSize: 11, fontWeight: 600,
              letterSpacing: '0.15em', color: T.muted
            }}>
              PHASE {phaseNum} · {title.toUpperCase()}
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
            marginBottom: 12, marginTop: 4
          }}>
            {subtitle}
          </h3>
          {intro && (
            <p style={{
              fontSize: 14, lineHeight: 1.55, color: T.inkSoft,
              marginBottom: 24, marginTop: 0
            }}>
              {intro}
            </p>
          )}

          {/* Phase 3 (Giving notice) shows state-specific paycheck info inline */}
          {showStateInfo && (
            <StateContextBlock stateInfo={stateInfo} stateName={stateName} selectedState={selectedState} />
          )}

          {/* Action items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {actions.map((action, i) => (
              <ActionItem key={i} {...action} />
            ))}
          </div>
        </div>
      </div>
    </section>
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
// STATE CONTEXT BLOCK
// ============================================================================
// Shows state-specific notes in Phase 3 (Giving notice). Voluntary departures
// usually don't qualify for UI, so this block focuses on paycheck rules and
// the "good cause" caveat, different emphasis from the /just-laid-off page.
function StateContextBlock({ stateInfo, stateName, selectedState }) {
  if (!selectedState) {
    return (
      <div style={{
        background: T.surfaceWarm, border: `1px solid ${T.rule}`,
        padding: 12, marginBottom: 20
      }}>
        <p style={{ fontSize: 12, lineHeight: 1.55, color: T.inkSoft, margin: 0, fontStyle: 'italic' }}>
          Pick your state above to see your state's final paycheck rules and unemployment portal.
        </p>
      </div>
    );
  }
  if (!stateInfo) {
    return (
      <div style={{
        background: T.surfaceWarm, border: `1px solid ${T.rule}`,
        padding: 14, marginBottom: 20
      }}>
        <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
          {stateName}
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.55, color: T.ink, margin: 0 }}>
          Detailed data for {stateName} isn't yet in this guide. Check the <a href={DOL_DIRECTORY} target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: 'underline' }}>federal directory</a> for your state's unemployment portal and your state Department of Labor's website for final-paycheck rules.
        </p>
      </div>
    );
  }
  return (
    <div style={{
      background: T.surfaceWarm, border: `1px solid ${T.rule}`,
      padding: 16, marginBottom: 20
    }}>
      <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
        {stateName} context
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.55, color: T.ink, margin: 0, marginBottom: 8 }}>
        For voluntary departures, unemployment benefits are typically not available unless you can demonstrate "good cause" under {stateName} rules. The state portal is the authoritative source: <a href={stateInfo.portal} target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: 'underline' }}>{stateInfo.portalLabel}</a>.
      </p>
      <p style={{ fontSize: 12, lineHeight: 1.5, color: T.muted, margin: 0, fontStyle: 'italic' }}>
        Final paycheck rules vary by state and are best confirmed with the {stateName} Department of Labor. Information here is general and as of {DATA_AS_OF}.
      </p>
    </div>
  );
}

// ============================================================================
// THINGS TO THINK TWICE ABOUT
// ============================================================================
function ThingsToThinkTwice() {
  const items = [
    {
      title: "Think twice about leaving without a financial buffer",
      body: "Voluntary departures rarely come with severance, and in most states they don't qualify for unemployment. The cushion that softens a layoff isn't there for a voluntary exit. Many people who left without a buffer found themselves taking the next available role rather than the right one. If the buffer isn't there yet, sometimes waiting a few more months to build it is the more valuable move."
    },
    {
      title: "Think twice about accepting a counter-offer reflexively",
      body: "Counter-offers can be genuinely good, but a meaningful share of people who accept them leave anyway within a year. The reasons they were leaving in the first place often outlast the new compensation. Going in knowing what your actual reasons for leaving were (Phase 1 again) helps you evaluate the counter on its merits rather than just the dollar figure."
    },
    {
      title: "Think twice about burning bridges, even when leaving for hard reasons",
      body: "Industries are smaller than they look. The colleague today is the hiring manager in three years, the customer in five, and the investor in ten. References, recommendations, and word-of-mouth compound across decades. There's almost never a benefit to a public exit, even when the situation genuinely justifies anger. The exception is documented harassment, discrimination, or unlawful behavior. Those can warrant a different approach, ideally with an employment attorney's guidance."
    },
    {
      title: "Think twice about cashing out your 401(k) for the gap",
      body: "Cashing out before retirement age generally triggers federal and state income tax plus an additional early-withdrawal penalty, which together can take a substantial portion of the balance. Beyond the immediate cost, it forfeits decades of potential compounding. For most people facing a temporary income gap, other options carry less long-term cost. A financial advisor can walk through what makes sense for your specific situation."
    },
    {
      title: "Think twice about signing a release without reading it carefully",
      body: "Voluntary departures sometimes come with separation agreements, non-disparagement clauses, broad releases of claims, ongoing confidentiality. These are different from severance agreements but can have similar weight. An employment attorney consultation can highlight clauses worth questioning before you sign anything."
    },
    {
      title: "Think twice about treating the gap as 'free time'",
      body: "Some people thrive in unstructured gaps; others find them harder than expected, especially after a long stretch of structured work. If the gap is more than a few weeks, intentional rhythm (regular sleep, social contact, projects, time outside) tends to land better than the 'I'll figure it out' approach. If the gap stretches and starts feeling heavy, talking to someone about it isn't unreasonable."
    }
  ];

  return (
    <section style={{ background: T.surfaceWarm, borderTop: `1px solid ${T.rule}`, borderBottom: `1px solid ${T.rule}` }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8" style={{ paddingTop: 56, paddingBottom: 56 }}>
        <SectionHeading
          eyebrow="Common second-guesses"
          title="Things to think twice about"
          desc="Decisions that often look reasonable in the moment but tend to cost more in hindsight. None of these are universal rules; each depends on your specific situation."
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
                See your buffer
              </span>
            </div>
            <h3 style={{
              fontFamily: DISPLAY_FONT, fontWeight: 500,
              fontSize: 'clamp(24px, 4vw, 38px)',
              letterSpacing: '-0.01em', lineHeight: 1.05,
              color: T.surface, marginBottom: 16
            }}>
              How much runway do you actually have?
            </h3>
            <p style={{
              fontSize: 'clamp(14px, 1.6vw, 16px)',
              lineHeight: 1.55, color: '#C9C4BB', marginBottom: 24, maxWidth: 600
            }}>
              The Job Loss Runway calculator can show you a rough month-by-month picture using your real account balances, monthly expenses, and the income you expect (or don't) during a transition. Three scenarios let you see a range of outcomes. It's a thinking tool, not advice for your specific situation.
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
          desc="This guide is for people leaving voluntarily. If your circumstances are different, these guides may be more useful."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CrossRefCard
            label="Available now"
            title="Just laid off"
            body="Involuntary, urgent. The first week after a layoff: severance, unemployment, COBRA, the immediate financial scaffolding."
            to="/just-laid-off"
          />
          <CrossRefCard
            label="Hub"
            title="Transitions"
            body="The starting point for all transitions guides on the site. If your situation doesn't quite fit a layoff or a voluntary departure, the hub helps you find the right page."
            to="/transitions"
          />
        </div>
      </div>
    </section>
  );
}

function CrossRefCard({ label, title, body, disabled, to }) {
  const card = (
    <div style={{
      background: disabled ? T.surfaceWarm : T.surface,
      border: `1px solid ${T.rule}`,
      padding: 'clamp(16px, 3vw, 24px)',
      opacity: disabled ? 0.65 : 1,
      cursor: disabled ? 'default' : 'pointer',
      transition: 'transform 120ms ease, border-color 120ms ease'
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
  if (disabled || !to) return card;
  return <Link to={to} style={{ textDecoration: 'none' }}>{card}</Link>;
}

// ============================================================================
// FINAL DISCLAIMER
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
            Voluntary departures often involve specific considerations, non-competes, equity exercise windows, separation agreement language, tax timing, where qualified guidance can change outcomes. For employment agreements or separation language, consider speaking with an employment attorney. For decisions about retirement accounts, equity, or significant financial choices, consider speaking with a fiduciary financial advisor or a tax professional.
          </p>
        </div>
      </div>
    </section>
  );
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
              Free, private calculators and a growing library of guides for people in life transitions. No accounts, no tracking.
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
            <Link to="/leaving-on-your-terms" style={{ display: 'block', fontSize: 13, color: T.ink, textDecoration: 'none', marginBottom: 6 }}>
              Leaving on your terms
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
