// ============================================================================
// TRANSITIONS HUB
// ============================================================================
// A short, scannable disambiguation page that routes the visitor to the
// guide that fits their situation. Lives at /transitions.
//
// Purpose: someone searching "career transition," "leaving job," or similar
// general phrases lands here and gets pointed at the right specific page in
// a couple of seconds. People who already know their situation can also
// land directly on /just-laid-off or /leaving-on-your-terms via search or
// sharing — the hub is for the uncertain.
//
// Intentionally thin. Two big tappable audience cards, brief framing,
// nothing else competing for attention.
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle, Sparkles, Zap, HandshakeIcon, Lock } from 'lucide-react';
import { SiteNav } from './App.jsx';

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

export default function TransitionsHubPage() {
  return (
    <div style={{ background: T.bg, minHeight: '100vh', fontFamily: BODY_FONT, color: T.ink }}>
      <SiteNav />
      <Hero />
      <AudienceCards />
      <NotSureGuidance />
      <WhatsHere />
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
            Transitions
          </span>
        </div>
        <h1 style={{
          fontFamily: DISPLAY_FONT, fontWeight: 500,
          fontSize: 'clamp(36px, 7vw, 72px)',
          lineHeight: 0.98, letterSpacing: '-0.02em', color: T.ink,
          marginBottom: 24
        }}>
          Where are you in this?
        </h1>
        <p style={{
          fontFamily: BODY_FONT, fontWeight: 400,
          fontSize: 'clamp(18px, 2.4vw, 26px)',
          lineHeight: 1.4, letterSpacing: '-0.01em', color: T.inkSoft,
          marginBottom: 0
        }}>
          Different work transitions need different things. Pick the one that fits, and we'll get out of your way.
        </p>
      </div>
    </section>
  );
}

// ============================================================================
// AUDIENCE CARDS — the actual disambiguation
// ============================================================================
function AudienceCards() {
  return (
    <section style={{ background: T.bg }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8" style={{ paddingTop: 48, paddingBottom: 24 }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AudienceCard
            to="/just-laid-off"
            accent={T.oxblood}
            icon={Zap}
            label="It happened to me"
            title="Just laid off"
            blurb="Involuntary, sudden, often emotionally hard. The first week, in order: severance, unemployment, COBRA, the immediate financial scaffolding."
            sample={[
              'Day-by-day playbook for the first week',
              'State-specific unemployment data',
              'What to think twice about right now'
            ]}
          />
          <AudienceCard
            to="/leaving-on-your-terms"
            accent={T.emerald}
            icon={HandshakeIcon}
            label="It was my call"
            title="Leaving on your terms"
            blurb="Voluntary, planned. From months out (thinking about it) through giving notice and the first weeks free. Different financial dynamics than a layoff."
            sample={[
              'Four-phase timeline from months out to after',
              'Counter-offers, vesting, equity windows',
              'No severance and limited UI: planning matters more'
            ]}
          />
        </div>
      </div>
    </section>
  );
}

function AudienceCard({ to, accent, icon: Icon, label, title, blurb, sample, disabled }) {
  const card = (
    <div
      style={{
        background: disabled ? T.surfaceWarm : T.surface,
        border: `1px solid ${T.rule}`,
        borderTop: `4px solid ${accent}`,
        padding: 'clamp(20px, 3vw, 32px)',
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'default' : 'pointer',
        height: '100%',
        display: 'flex', flexDirection: 'column',
        transition: 'transform 120ms ease, border-color 120ms ease, box-shadow 120ms ease'
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 8px 24px ${accent}15`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="flex items-center gap-2 mb-3" style={{ color: accent }}>
        <Icon size={14} strokeWidth={2} />
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.18em',
          textTransform: 'uppercase'
        }}>
          {label}
        </span>
      </div>
      <h3 style={{
        fontFamily: DISPLAY_FONT, fontWeight: 500,
        fontSize: 'clamp(24px, 3.5vw, 36px)',
        letterSpacing: '-0.02em', color: T.ink, lineHeight: 1.05,
        marginBottom: 12
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: 'clamp(13px, 1.6vw, 15px)', lineHeight: 1.55,
        color: T.inkSoft, marginBottom: 20
      }}>
        {blurb}
      </p>
      {sample && (
        <ul style={{
          listStyle: 'none', padding: 0, margin: 0,
          fontSize: 12, color: T.muted, lineHeight: 1.5,
          marginBottom: 20
        }}>
          {sample.map((item, i) => (
            <li key={i} style={{ marginBottom: 4, paddingLeft: 14, position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 0, top: 8,
                width: 4, height: 4, background: accent, borderRadius: 0
              }} />
              {item}
            </li>
          ))}
        </ul>
      )}
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6, color: accent, fontWeight: 600, fontSize: 13 }}>
        {disabled ? (
          <>
            <Lock size={12} strokeWidth={2} />
            <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Coming soon
            </span>
          </>
        ) : (
          <>
            Read this guide
            <ArrowRight size={14} strokeWidth={2} />
          </>
        )}
      </div>
    </div>
  );

  if (disabled || !to) return card;
  return <Link to={to} style={{ textDecoration: 'none', color: 'inherit' }}>{card}</Link>;
}

// ============================================================================
// NOT SURE GUIDANCE
// ============================================================================
function NotSureGuidance() {
  return (
    <section style={{ background: T.bg }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8" style={{ paddingTop: 24, paddingBottom: 48 }}>
        <div style={{
          background: T.navySoft, border: `1px solid ${T.navy}30`,
          padding: 'clamp(16px, 3vw, 24px)'
        }}>
          <div style={{
            fontSize: 11, color: T.navy, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8
          }}>
            Not sure which one fits?
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.55, color: T.ink, margin: 0, marginBottom: 8 }}>
            Some situations sit between the two. If you're <strong>worried about an upcoming layoff but it hasn't happened yet</strong>, the Just Laid Off guide is mostly forward-looking advice and is probably more useful. If you're <strong>quitting because you think you're about to be laid off</strong>, both guides have content that applies; start with Leaving on Your Terms.
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.55, color: T.inkSoft, margin: 0 }}>
            The financial topics overlap a lot (health insurance, 401(k), runway, taxes), so reading both is reasonable if your situation is messy.
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// WHAT'S HERE — quick preview of what's in each guide for the curious
// ============================================================================
function WhatsHere() {
  return (
    <section style={{ background: T.surfaceWarm, borderTop: `1px solid ${T.rule}`, borderBottom: `1px solid ${T.rule}` }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8" style={{ paddingTop: 56, paddingBottom: 56 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{
            fontSize: 11, color: T.muted, fontWeight: 600,
            letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8
          }}>
            What's on these pages
          </div>
          <h2 style={{
            fontFamily: DISPLAY_FONT, fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 500, color: T.ink, letterSpacing: '-0.02em',
            lineHeight: 1.05, margin: 0
          }}>
            A look inside each guide
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PreviewCard
            title="Just laid off"
            to="/just-laid-off"
            accent={T.oxblood}
            sections={[
              'Day 1: paperwork, severance, final paycheck',
              'Day 2: filing for unemployment',
              'Day 3: health insurance decisions',
              'Day 4-5: severance negotiation, runway',
              'Days 6-7: 401(k), LinkedIn, network',
              'Things to think twice about'
            ]}
          />
          <PreviewCard
            title="Leaving on your terms"
            to="/leaving-on-your-terms"
            accent={T.emerald}
            sections={[
              'Months out: should you leave?',
              'A few weeks out: setting yourself up',
              'Giving notice: counter-offers, non-competes',
              'After your last day: the first weeks free',
              'Things to think twice about'
            ]}
          />
        </div>

        <div style={{ marginTop: 32 }}>
          <div style={{
            background: T.ink, color: T.surface,
            padding: 'clamp(20px, 3.5vw, 28px)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 16, flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 11, color: '#9DD9B5', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
                Both guides cross-link to
              </div>
              <h3 style={{
                fontFamily: DISPLAY_FONT, fontSize: 'clamp(18px, 2.4vw, 24px)',
                fontWeight: 500, color: T.surface, letterSpacing: '-0.01em',
                margin: 0, lineHeight: 1.2
              }}>
                The wealth calculator
              </h3>
              <p style={{ fontSize: 13, color: '#C9C4BB', margin: '8px 0 0 0', lineHeight: 1.5 }}>
                Net worth, retirement readiness, and job loss runway. All free, all private, all in your browser.
              </p>
            </div>
            <Link to="/calculator" style={{
              background: T.surface, color: T.ink, textDecoration: 'none',
              padding: '12px 20px', fontWeight: 600,
              fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
              display: 'inline-flex', alignItems: 'center', gap: 8
            }}>
              Open calculator <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviewCard({ title, to, accent, sections }) {
  return (
    <Link to={to} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        background: T.surface, border: `1px solid ${T.rule}`,
        borderLeft: `3px solid ${accent}`,
        padding: 'clamp(16px, 2.5vw, 24px)',
        height: '100%',
        transition: 'border-color 120ms ease'
      }}>
        <h4 style={{
          fontFamily: DISPLAY_FONT, fontWeight: 500,
          fontSize: 'clamp(18px, 2.4vw, 22px)',
          letterSpacing: '-0.01em', color: T.ink,
          marginBottom: 12, marginTop: 0
        }}>
          {title}
        </h4>
        <ul style={{
          listStyle: 'none', padding: 0, margin: 0,
          fontSize: 13, color: T.inkSoft, lineHeight: 1.7
        }}>
          {sections.map((s, i) => (
            <li key={i} style={{ paddingLeft: 14, position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 0, top: 9,
                width: 4, height: 4, background: accent, borderRadius: 0
              }} />
              {s}
            </li>
          ))}
        </ul>
      </div>
    </Link>
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
            <Link to="/transitions" style={{ display: 'block', fontSize: 13, color: T.ink, textDecoration: 'none', marginBottom: 6 }}>
              Transitions
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
