import React, { useState, useEffect } from 'react';
import {
  Sparkles, ArrowRight, ArrowDown, Check, X, Menu, ChevronDown,
  TrendingUp, Home, GraduationCap, Briefcase, Heart, Gift, Car,
  CreditCard, Scale, Receipt, KeyRound, Wallet, ShieldCheck,
  FolderOpen, Activity, Wind, Lock, Github, Mail, Calculator,
  Zap, Eye, FileJson, BarChart3, Layers
} from 'lucide-react';
import RetirementReadiness from './components/RetirementReadiness.jsx';

// Theme tokens shared with the calculator
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

const DISPLAY_FONT = "'Bowlby One SC', 'Sansita One', Georgia, serif";
const BODY_FONT = "'Inter', system-ui, -apple-system, sans-serif";
const MONO_FONT = "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace";

export default function App() {
  // Use URL hash to switch between landing and calculator
  const [route, setRoute] = useState(() => window.location.hash || '');

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash || '');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // When the user navigates to the calculator (or back home), scroll to the top.
  // The hash-based routing otherwise leaves the browser scrolled to wherever it was
  // before, which on landing→calculator transitions lands you mid-page.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [route]);

  if (route === '#calculator' || route === '#app') {
    return <CalculatorView />;
  }

  return <LandingPage />;
}

function CalculatorView() {
  return (
    <div style={{ background: T.bg, minHeight: '100vh' }}>
      <link rel="stylesheet" href={FONTS_HREF} />
      {/* Persistent back-to-home nav strip */}
      <div style={{
        background: T.ink, color: T.surface,
        padding: '10px 20px',
        position: 'sticky', top: 0, zIndex: 30,
        borderBottom: `1px solid ${T.ink}`
      }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="#" style={{
            color: T.surface, textDecoration: 'none',
            fontFamily: DISPLAY_FONT, fontSize: 16, fontWeight: 600,
            letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 6
          }}>
            ← <span>ackwak.com</span>
          </a>
          <a href="#" style={{
            color: '#A8C9B5', textDecoration: 'none',
            fontFamily: BODY_FONT, fontSize: 11,
            textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 500
          }}>
            Back to home
          </a>
        </div>
      </div>
      <RetirementReadiness />
    </div>
  );
}

// ============================================================================
// LANDING PAGE
// ============================================================================
function LandingPage() {
  return (
    <div style={{ background: T.bg, color: T.ink, fontFamily: BODY_FONT }}>
      <link rel="stylesheet" href={FONTS_HREF} />
      <style>{`
        html { scroll-behavior: smooth; }
        body { margin: 0; }
        a { text-decoration: none; }
      `}</style>

      <Nav />
      <Hero />
      <SocialProof />
      <FeatureOverview />
      <DeepDive />
      <Privacy />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

// ============================================================================
// NAV
// ============================================================================
function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header style={{
      borderBottom: `1px solid ${T.rule}`,
      position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(247, 244, 237, 0.9)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)'
    }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64
      }}>
        <a href="#" style={{
          color: T.ink, fontFamily: DISPLAY_FONT,
          fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <span style={{
            width: 28, height: 28, background: T.ink, color: T.surface,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: 16,
            letterSpacing: '-0.02em'
          }}>a</span>
          ackwak<span style={{ color: T.muted, fontWeight: 400 }}>.com</span>
        </a>

        <div className="hidden md:flex items-center gap-8" style={{ fontSize: 14, fontWeight: 500 }}>
          <a href="#features" style={{ color: T.inkSoft }}>Features</a>
          <a href="#how-it-works" style={{ color: T.inkSoft }}>How it works</a>
          <a href="#privacy" style={{ color: T.inkSoft }}>Privacy</a>
          <a href="#faq" style={{ color: T.inkSoft }}>FAQ</a>
          <a href="#calculator" style={{
            background: T.ink, color: T.surface,
            padding: '8px 16px', fontWeight: 600,
            fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase',
            display: 'inline-flex', alignItems: 'center', gap: 6
          }}>
            Launch calculator <ArrowRight size={13} strokeWidth={2} />
          </a>
        </div>

        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          style={{ background: 'transparent', color: T.ink, padding: 4 }}
          aria-label="Menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden" style={{
          borderTop: `1px solid ${T.rule}`,
          background: T.bg, padding: 20
        }}>
          <div className="flex flex-col gap-3" style={{ fontSize: 15, fontWeight: 500 }}>
            <a href="#features" onClick={() => setOpen(false)} style={{ color: T.inkSoft }}>Features</a>
            <a href="#how-it-works" onClick={() => setOpen(false)} style={{ color: T.inkSoft }}>How it works</a>
            <a href="#privacy" onClick={() => setOpen(false)} style={{ color: T.inkSoft }}>Privacy</a>
            <a href="#faq" onClick={() => setOpen(false)} style={{ color: T.inkSoft }}>FAQ</a>
            <a href="#calculator" onClick={() => setOpen(false)} style={{
              background: T.ink, color: T.surface,
              padding: '10px 16px', fontWeight: 600,
              fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase',
              textAlign: 'center', marginTop: 8,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6
            }}>
              Launch calculator <ArrowRight size={13} strokeWidth={2} />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

// ============================================================================
// HERO
// ============================================================================
function Hero() {
  return (
    <section style={{ borderBottom: `1px solid ${T.rule}` }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8" style={{ paddingTop: 80, paddingBottom: 100 }}>
        <div className="flex items-center gap-2 mb-5" style={{ color: T.muted }}>
          <Sparkles size={13} strokeWidth={1.5} />
          <span style={{
            fontSize: 11, fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '0.2em'
          }}>
            ackwak.com · retirement, net worth & expenditures
          </span>
        </div>

        <h1 style={{
          fontFamily: DISPLAY_FONT, fontWeight: 500,
          fontSize: 'clamp(40px, 8vw, 88px)',
          lineHeight: 0.95, letterSpacing: '-0.03em', color: T.ink,
          marginBottom: 28, fontVariationSettings: '"opsz" 144'
        }}>
          A dumb name.<br />
          The <em style={{ fontStyle: 'italic', fontWeight: 400, color: T.emerald }}>best darn calculator</em><br />
          on the planet.
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: 1.5,
          color: T.inkSoft, maxWidth: 720, marginBottom: 36
        }}>
          Three views of your financial life, one shared truth. Net worth today. When you can retire. How long you'd last if you lost your job. All on one page, with the same inputs feeding all three answers.
        </p>

        <div className="flex items-center gap-3 flex-wrap mb-12">
          <a href="#calculator" style={{
            background: T.ink, color: T.surface,
            padding: '14px 24px', fontWeight: 600,
            fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase',
            display: 'inline-flex', alignItems: 'center', gap: 8
          }}>
            Launch the calculator <ArrowRight size={15} strokeWidth={2} />
          </a>
          <a href="#features" style={{
            color: T.inkSoft, padding: '14px 8px',
            fontWeight: 500, fontSize: 14,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            borderBottom: `1px solid ${T.rule}`
          }}>
            See what makes it different <ArrowDown size={13} strokeWidth={2} />
          </a>
        </div>

        {/* Three-views feature strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mt-12 pt-10 mb-8" style={{ borderTop: `1px solid ${T.rule}` }}>
          <ViewPreviewCard
            number="01"
            icon={Scale}
            title="Net Worth"
            desc="Where you stand today. Total assets, liabilities, and the breakdown of how your wealth is composed."
            accentColor={T.ink}
          />
          <ViewPreviewCard
            number="02"
            icon={TrendingUp}
            title="Retirement Readiness"
            desc="When can you retire comfortably? Three risk scenarios projected year-by-year through life expectancy."
            accentColor={T.emerald}
          />
          <ViewPreviewCard
            number="03"
            icon={Wind}
            title="Job Loss Runway"
            desc="If you lost your job today, how long could you afford to be out of work? Stress-tests your liquid accounts."
            accentColor={T.amber}
          />
        </div>

        {/* Metric strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 mt-8 pt-6" style={{ borderTop: `1px solid ${T.rule}` }}>
          <HeroStat number="3" label="Views, one shared truth" />
          <HeroStat number="∞" label="Properties, kids, inheritances, vehicles" />
          <HeroStat number="100%" label="Private. Your data stays in your browser" />
          <HeroStat number="$0" label="Free forever, no signup, no email" />
        </div>
      </div>
    </section>
  );
}

function ViewPreviewCard({ number, icon: Icon, title, desc, accentColor }) {
  return (
    <a href="#calculator" className="block p-4 sm:p-5 transition-opacity hover:opacity-90" style={{
      background: T.surface, border: `1px solid ${T.rule}`,
      borderTop: `3px solid ${accentColor}`,
      textDecoration: 'none'
    }}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} strokeWidth={1.75} style={{ color: accentColor }} />
        <span style={{
          fontFamily: MONO_FONT, fontSize: 11, fontWeight: 600,
          color: T.muted, letterSpacing: '0.1em'
        }}>
          {number}
        </span>
      </div>
      <div style={{
        fontFamily: DISPLAY_FONT, fontSize: 'clamp(18px, 2.5vw, 22px)',
        fontWeight: 500, color: T.ink, letterSpacing: '-0.01em',
        marginBottom: 8, lineHeight: 1.15
      }}>
        {title}
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.5, color: T.inkSoft, margin: 0 }}>
        {desc}
      </p>
    </a>
  );
}

function HeroStat({ number, label }) {
  return (
    <div>
      <div style={{
        fontFamily: DISPLAY_FONT, fontSize: 'clamp(36px, 6vw, 56px)',
        fontWeight: 500, color: T.ink, lineHeight: 1, letterSpacing: '-0.03em',
        fontVariantNumeric: 'tabular-nums', marginBottom: 8
      }}>
        {number}
      </div>
      <div style={{
        fontSize: 12, color: T.muted, fontWeight: 500,
        lineHeight: 1.4, maxWidth: 200
      }}>
        {label}
      </div>
    </div>
  );
}

// ============================================================================
// SOCIAL PROOF / TRUST STRIP
// ============================================================================
function SocialProof() {
  const trustItems = [
    { icon: Lock, label: 'Your data never leaves your browser' },
    { icon: FileJson, label: 'Export to JSON, share with your advisor' },
    { icon: BarChart3, label: 'Audit any year, line by line' },
    { icon: Layers, label: 'Save unlimited what-if scenarios' }
  ];
  return (
    <section style={{ background: T.surfaceWarm, borderBottom: `1px solid ${T.rule}` }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8" style={{ paddingTop: 28, paddingBottom: 28 }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {trustItems.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5" style={{ color: T.inkSoft }}>
              <Icon size={16} strokeWidth={1.5} style={{ color: T.emerald, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FEATURE OVERVIEW
// ============================================================================
function FeatureOverview() {
  const features = [
    {
      icon: TrendingUp,
      title: 'Three scenarios, always running',
      desc: 'Conservative knocks 2 points off returns, raises expenses 12%, adds 3 years of life. Optimistic does the inverse. Moderate is your inputs as-is. Side-by-side comparison reveals the true range of outcomes.',
      color: T.emerald
    },
    {
      icon: Home,
      title: 'Real estate, modeled fully',
      desc: 'Add as many properties as you have. Primary, rentals, vacation homes. Each one with its own value, mortgage rate, payment, appreciation, property tax, and rental income with start/end ages.',
      color: T.navy
    },
    {
      icon: GraduationCap,
      title: 'Per-child education planning',
      desc: 'Each child has their own 529 balance and a list of education stages. Preschool through grad school. The simulation draws each kid\'s 529 against their own costs first.',
      color: T.amber
    },
    {
      icon: Car,
      title: 'Owned vehicles or leases',
      desc: 'Track depreciation on owned vehicles. Time-bound lease payments that disappear when the lease ends. Multiple vehicles, each with its own loan or lease terms.',
      color: T.navy
    },
    {
      icon: CreditCard,
      title: 'Debt with eyes open',
      desc: 'Credit cards, student loans, personal loans. Each one amortizes against your monthly payment. If you\'re not covering interest, the model warns you and shows the balance growing.',
      color: T.oxblood
    },
    {
      icon: Gift,
      title: 'Inheritances at specific ages',
      desc: 'Plan for expected lump sums from parents, trusts, or other sources. Specify the age you\'ll receive each one. The model treats them as tax-free and shows their actual impact on net worth.',
      color: T.amber
    },
    {
      icon: KeyRound,
      title: 'Renting & leasing accounted for',
      desc: 'Not everyone owns. Pay rent for any window of life with realistic rent inflation. Lease vehicles that disappear at lease end. The math respects how people actually live.',
      color: T.navy
    },
    {
      icon: Wallet,
      title: 'Custom income allocation',
      desc: 'Decide how surplus income is saved across cash, money market, CDs, brokerage, and 401(k). Use a preset or set your own percentages with auto-balancing.',
      color: T.emerald
    },
    {
      icon: Scale,
      title: 'Net worth at any age',
      desc: 'Slide to any year between today and life expectancy. See the breakdown (assets, liabilities, and the resulting net worth) in horizontal bar charts that update instantly.',
      color: T.ink
    },
    {
      icon: Receipt,
      title: 'Audit any year, line by line',
      desc: 'Click any year on the chart to open the audit drawer. See exactly what you spent, on what, and from which account. Income sources, expense categories, the buckets that funded a shortfall or absorbed a surplus. Every dollar traced.',
      color: T.amber
    }
  ];

  return (
    <section id="features" style={{ borderBottom: `1px solid ${T.rule}` }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8" style={{ paddingTop: 100, paddingBottom: 100 }}>
        <SectionHeading
          eyebrow="Features"
          title={<>Models your <em style={{ fontStyle: 'italic', fontWeight: 400, color: T.emerald }}>actual life</em>, not a simplified version.</>}
          subtitle="Every variable that meaningfully affects when you can retire (and most calculators ignore) is here."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-16">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="p-7" style={{
              background: T.surface, border: `1px solid ${T.rule}`
            }}>
              <Icon size={20} style={{ color, marginBottom: 16 }} strokeWidth={1.5} />
              <h3 style={{
                fontFamily: DISPLAY_FONT, fontSize: 22, fontWeight: 500,
                letterSpacing: '-0.01em', lineHeight: 1.2, color: T.ink,
                marginBottom: 10
              }}>
                {title}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: T.inkSoft }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 mb-4" style={{ color: T.muted }}>
        <Sparkles size={11} strokeWidth={1.5} />
        <span style={{
          fontSize: 11, fontWeight: 500,
          textTransform: 'uppercase', letterSpacing: '0.2em'
        }}>
          {eyebrow}
        </span>
      </div>
      <h2 style={{
        fontFamily: DISPLAY_FONT, fontWeight: 500,
        fontSize: 'clamp(32px, 5vw, 56px)',
        lineHeight: 1.05, letterSpacing: '-0.025em', color: T.ink,
        marginBottom: 16, fontVariationSettings: '"opsz" 144'
      }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: 'clamp(15px, 1.6vw, 18px)', lineHeight: 1.55, color: T.inkSoft }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// DEEP DIVE: feature walk-through with mocked screenshots
// ============================================================================
function DeepDive() {
  return (
    <section id="how-it-works" style={{ background: T.surfaceWarm, borderBottom: `1px solid ${T.rule}` }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8" style={{ paddingTop: 100, paddingBottom: 100 }}>
        <SectionHeading
          eyebrow="How it works"
          title={<>Five views that work <em style={{ fontStyle: 'italic', fontWeight: 400 }}>together</em>.</>}
          subtitle="Each section of the calculator is designed to answer a different question. Together, they paint a complete picture."
        />

        <div className="mt-20 space-y-32">
          <DeepDiveBlock
            number="01"
            eyebrow="The verdict"
            title="A clear answer at the top."
            body="As soon as you load your inputs, the headline tells you whether your money lasts under moderate assumptions, plus a recommendation for the safest age to retire, calculated against the conservative scenario, the one that survives bad markets and longer life."
            features={[
              'Risk badge: Low, Moderate, High, or Critical',
              'Three risk-band recommendations side-by-side',
              'Portfolio and net worth at retirement, in real dollars'
            ]}
            mockup={<HeadlineMockup />}
          />

          <DeepDiveBlock
            number="02"
            eyebrow="Net worth inspector"
            title="Scrub through your entire life."
            body="A single slider moves you from today through life expectancy. Every step shows your assets, liabilities, and net worth at that moment, broken down into proportional bars so you instantly see what's growing, what's shrinking, what's paid off."
            features={[
              'Switch between Conservative, Moderate, Optimistic',
              'See exactly when your mortgage hits zero',
              'Inheritance impact attribution that proves the value'
            ]}
            mockup={<NetWorthMockup />}
            reverse
          />

          <DeepDiveBlock
            number="03"
            eyebrow="Year audit drawer"
            title="See exactly what you spend, on what, and from where."
            body="Click any year on the chart, or the audit button in the inspector, and a drawer slides in with the full breakdown for that year. Income by source. Expenses by category. The exact accounts that funded a shortfall, or absorbed a surplus. End-of-year balances for every bucket. Every dollar traced."
            features={[
              'Income split: salary, Social Security, rental, alt income, inheritances',
              'Expenses by category: living, healthcare, taxes, mortgage, rent, college, debts',
              'Account flow: which buckets contributed or got drained, in what order',
              'End-of-year balances across cash, MM, CDs, brokerage, 401(k), 529',
              'Surplus or shortfall total, color-coded for instant read'
            ]}
            mockup={<AuditMockup />}
          />

          <DeepDiveBlock
            number="04"
            eyebrow="Custom income allocation"
            title="Decide where your savings go."
            body="A surplus of $30,000 doesn't just disappear. It gets allocated. You decide the percentages: cash, money market, CDs, brokerage, 401(k). Use a preset or set your own. The 401(k) honors the IRS cap automatically."
            features={[
              'Five sliders that add up to 100%',
              'Real-time balance check with auto-balance button',
              'Aggressive, Balanced, Conservative, Equal Split presets'
            ]}
            mockup={<AllocationMockup />}
            reverse
          />

          <DeepDiveBlock
            number="05"
            eyebrow="Save & share"
            title="Unlimited scenarios. Local-only. Portable."
            body="Save scenarios as 'Retire at 60', 'No college help', 'Recession case', whatever. Compare them by switching between them. Download any scenario as JSON to email an advisor or back up to your laptop."
            features={[
              'In-browser library, fast switching, persistent',
              'Download to JSON, portable, human-readable',
              'Upload from JSON, share between devices'
            ]}
            mockup={<ScenariosMockup />}
          />
        </div>
      </div>
    </section>
  );
}

function DeepDiveBlock({ number, eyebrow, title, body, features, mockup, reverse }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div className={`lg:col-span-5 ${reverse ? 'lg:order-2' : ''}`}>
        <div style={{
          fontFamily: DISPLAY_FONT, fontSize: 13, fontWeight: 600,
          letterSpacing: '0.15em', color: T.muted, marginBottom: 8
        }}>
          {number} · {eyebrow}
        </div>
        <h3 style={{
          fontFamily: DISPLAY_FONT, fontSize: 'clamp(26px, 3.5vw, 38px)',
          fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.02em',
          color: T.ink, marginBottom: 16
        }}>
          {title}
        </h3>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: T.inkSoft, marginBottom: 20 }}>
          {body}
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {features.map(f => (
            <li key={f} className="flex items-start gap-2.5 py-1.5" style={{ color: T.inkSoft }}>
              <Check size={14} strokeWidth={2.5} style={{ color: T.emerald, flexShrink: 0, marginTop: 4 }} />
              <span style={{ fontSize: 14, lineHeight: 1.5 }}>{f}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={`lg:col-span-7 ${reverse ? 'lg:order-1' : ''}`}>
        {mockup}
      </div>
    </div>
  );
}

// ============================================================================
// MOCKUPS: visual approximations of each section
// ============================================================================
function MockupFrame({ children, label }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.rule}`,
      boxShadow: '0 20px 40px rgba(23, 21, 19, 0.06), 0 4px 8px rgba(23, 21, 19, 0.04)'
    }}>
      <div style={{
        height: 26, background: T.ruleLight, borderBottom: `1px solid ${T.rule}`,
        display: 'flex', alignItems: 'center', paddingLeft: 8, gap: 4
      }}>
        <span style={{ width: 9, height: 9, borderRadius: 999, background: '#FF5F57' }} />
        <span style={{ width: 9, height: 9, borderRadius: 999, background: '#FEBC2E' }} />
        <span style={{ width: 9, height: 9, borderRadius: 999, background: '#28C840' }} />
        {label && (
          <span style={{
            marginLeft: 'auto', marginRight: 12,
            fontFamily: MONO_FONT, fontSize: 10, color: T.muted
          }}>
            {label}
          </span>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

function HeadlineMockup() {
  return (
    <MockupFrame label="ackwak.com/retirement">
      <div style={{ padding: '20px 24px', background: T.bg }}>
        <div className="grid grid-cols-12 gap-3">
          {/* Left card */}
          <div className="col-span-7 p-4" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
            <div className="flex items-center gap-1.5 mb-2">
              <ShieldCheck size={11} strokeWidth={1.5} style={{ color: T.emerald }} />
              <span style={{ fontSize: 9, fontWeight: 600, color: T.emerald, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Low risk at age 65
              </span>
            </div>
            <p style={{ fontFamily: DISPLAY_FONT, fontSize: 17, lineHeight: 1.25, color: T.ink, marginBottom: 14 }}>
              If you retire at <strong>65</strong>, your portfolio is projected to last through age <strong>92</strong> under moderate assumptions.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-3" style={{ borderTop: `1px solid ${T.ruleLight}` }}>
              <div>
                <div style={{ fontSize: 8, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Portfolio</div>
                <div style={{ fontFamily: DISPLAY_FONT, fontSize: 16, fontWeight: 500, color: T.ink }}>$2,847,221</div>
              </div>
              <div>
                <div style={{ fontSize: 8, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Net worth</div>
                <div style={{ fontFamily: DISPLAY_FONT, fontSize: 16, fontWeight: 500, color: T.ink }}>$3,492,108</div>
              </div>
              <div>
                <div style={{ fontSize: 8, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Years</div>
                <div style={{ fontFamily: DISPLAY_FONT, fontSize: 16, fontWeight: 500, color: T.ink }}>20</div>
              </div>
            </div>
          </div>
          {/* Right card */}
          <div className="col-span-5 p-4" style={{ background: T.ink, color: T.surface }}>
            <div className="flex items-center gap-1.5 mb-3" style={{ color: '#A8C9B5' }}>
              <Wind size={11} strokeWidth={1.5} />
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Recommendation</span>
            </div>
            <p style={{ fontFamily: DISPLAY_FONT, fontSize: 14, lineHeight: 1.3, marginBottom: 14 }}>
              Target retirement at age <strong style={{ color: '#9DD9B5' }}>62</strong>.
            </p>
            <RecRowMock label="Aggressive" age="58" hint="Money lasts under moderate" />
            <RecRowMock label="Balanced" age="60" hint="Comfortable margin" />
            <RecRowMock label="Conservative" age="62" hint="Survives bad markets" highlight />
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

function RecRowMock({ label, age, hint, highlight }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '6px 0', borderBottom: highlight ? 'none' : '1px solid rgba(255,255,255,0.08)'
    }}>
      <div>
        <div style={{ fontSize: 10, color: highlight ? '#9DD9B5' : '#C9C4BB', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 8, color: '#7A7568' }}>{hint}</div>
      </div>
      <span style={{
        fontFamily: DISPLAY_FONT, fontSize: 18, fontWeight: 500,
        color: highlight ? '#9DD9B5' : T.surface
      }}>{age}</span>
    </div>
  );
}

function NetWorthMockup() {
  const assets = [
    { label: 'Brokerage', pct: 32, color: T.emerald },
    { label: '401(k) / IRA', pct: 28, color: T.emerald },
    { label: 'Real estate', pct: 24, color: T.navy },
    { label: 'Money market', pct: 8, color: T.muted },
    { label: 'Vehicles', pct: 4, color: T.navy },
    { label: 'Cash', pct: 4, color: T.muted }
  ];
  const liabilities = [
    { label: 'Mortgages', pct: 78, color: T.oxblood },
    { label: 'Vehicle loans', pct: 18, color: T.oxblood },
    { label: 'Credit cards', pct: 4, color: T.oxblood }
  ];
  return (
    <MockupFrame label="Net worth · age 67">
      <div style={{ padding: '18px 22px', background: T.surface }}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <Scale size={11} strokeWidth={1.5} />
            <span style={{ fontFamily: DISPLAY_FONT, fontSize: 16, fontWeight: 500 }}>Projected at age 67</span>
          </div>
          <div style={{
            display: 'flex', border: `1px solid ${T.rule}`,
            background: T.surfaceWarm, fontSize: 9
          }}>
            <span style={{ padding: '4px 8px', color: T.oxblood, fontWeight: 500 }}>Conservative</span>
            <span style={{ padding: '4px 8px', background: T.ink, color: T.surface, fontWeight: 600 }}>Moderate</span>
            <span style={{ padding: '4px 8px', color: T.emerald, fontWeight: 500 }}>Optimistic</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4 pb-4" style={{ borderBottom: `1px solid ${T.ruleLight}` }}>
          <div>
            <div style={{ fontSize: 8, color: T.muted, textTransform: 'uppercase' }}>Total assets</div>
            <div style={{ fontFamily: DISPLAY_FONT, fontSize: 17, color: T.emerald, fontWeight: 500 }}>$3,142,800</div>
          </div>
          <div>
            <div style={{ fontSize: 8, color: T.muted, textTransform: 'uppercase' }}>Liabilities</div>
            <div style={{ fontFamily: DISPLAY_FONT, fontSize: 17, color: T.oxblood, fontWeight: 500 }}>$148,200</div>
          </div>
          <div>
            <div style={{ fontSize: 8, color: T.muted, textTransform: 'uppercase' }}>Net worth</div>
            <div style={{ fontFamily: DISPLAY_FONT, fontSize: 19, color: T.ink, fontWeight: 600 }}>$2,994,600</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <div style={{ fontSize: 9, color: T.emerald, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>Assets</div>
            {assets.map(a => (
              <div key={a.label} style={{ marginBottom: 6 }}>
                <div className="flex justify-between" style={{ fontSize: 10, marginBottom: 2 }}>
                  <span style={{ color: T.inkSoft }}>{a.label}</span>
                  <span style={{ fontFamily: MONO_FONT, color: T.ink }}>{a.pct}%</span>
                </div>
                <div style={{ height: 3, background: T.ruleLight }}>
                  <div style={{ width: `${a.pct}%`, height: '100%', background: a.color }} />
                </div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 9, color: T.oxblood, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>Liabilities</div>
            {liabilities.map(l => (
              <div key={l.label} style={{ marginBottom: 6 }}>
                <div className="flex justify-between" style={{ fontSize: 10, marginBottom: 2 }}>
                  <span style={{ color: T.inkSoft }}>{l.label}</span>
                  <span style={{ fontFamily: MONO_FONT, color: T.ink }}>{l.pct}%</span>
                </div>
                <div style={{ height: 3, background: T.ruleLight }}>
                  <div style={{ width: `${l.pct}%`, height: '100%', background: l.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

function AuditMockup() {
  const incomes = [
    { label: 'Social Security', value: '$54,000', pct: 38 },
    { label: 'Rental income', value: '$32,400', pct: 23 },
    { label: 'Pension', value: '$28,000', pct: 20 },
    { label: 'Alt income', value: '$26,000', pct: 19 }
  ];
  const expenses = [
    { label: 'Living expenses', value: '$72,000', pct: 35 },
    { label: 'Healthcare', value: '$24,000', pct: 12 },
    { label: 'Property tax', value: '$22,000', pct: 11 },
    { label: 'Income taxes', value: '$48,500', pct: 23 }
  ];
  // Where the shortfall got funded from
  const flows = [
    { label: 'Cash', delta: '−$2,000' },
    { label: 'Money market', delta: '−$8,000' },
    { label: 'Brokerage', delta: '−$16,100' }
  ];
  return (
    <MockupFrame label="Year audit · age 67">
      <div style={{ padding: '16px 20px', background: T.bg }}>
        <div style={{ fontSize: 9, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4, fontWeight: 600 }}>
          Early retirement · 22 yrs from now
        </div>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: 19, fontWeight: 500, color: T.ink, marginBottom: 14 }}>
          Year audit · age 67
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4 pb-3" style={{ borderBottom: `1px solid ${T.ruleLight}` }}>
          <div>
            <div style={{ fontSize: 8, color: T.muted, textTransform: 'uppercase' }}>Income</div>
            <div style={{ fontFamily: DISPLAY_FONT, fontSize: 15, color: T.emerald, fontWeight: 500 }}>$140,400</div>
          </div>
          <div>
            <div style={{ fontSize: 8, color: T.muted, textTransform: 'uppercase' }}>Expenses</div>
            <div style={{ fontFamily: DISPLAY_FONT, fontSize: 15, color: T.oxblood, fontWeight: 500 }}>$166,500</div>
          </div>
          <div>
            <div style={{ fontSize: 8, color: T.muted, textTransform: 'uppercase' }}>Shortfall</div>
            <div style={{ fontFamily: DISPLAY_FONT, fontSize: 15, color: T.oxblood, fontWeight: 600 }}>−$26,100</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <div style={{ fontSize: 9, color: T.emerald, fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Income sources</div>
            {incomes.map(i => (
              <div key={i.label} style={{ marginBottom: 6 }}>
                <div className="flex justify-between" style={{ fontSize: 10, marginBottom: 2 }}>
                  <span style={{ color: T.ink }}>{i.label}</span>
                  <span style={{ fontFamily: MONO_FONT, fontSize: 9, color: T.ink }}>{i.value}</span>
                </div>
                <div style={{ height: 2, background: T.ruleLight }}>
                  <div style={{ width: `${i.pct}%`, height: '100%', background: T.emerald }} />
                </div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 9, color: T.oxblood, fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Expense categories</div>
            {expenses.map(e => (
              <div key={e.label} style={{ marginBottom: 6 }}>
                <div className="flex justify-between" style={{ fontSize: 10, marginBottom: 2 }}>
                  <span style={{ color: T.ink }}>{e.label}</span>
                  <span style={{ fontFamily: MONO_FONT, fontSize: 9, color: T.ink }}>{e.value}</span>
                </div>
                <div style={{ height: 2, background: T.ruleLight }}>
                  <div style={{ width: `${e.pct}%`, height: '100%', background: T.oxblood }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Account flow: where the shortfall was drawn from */}
        <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${T.ruleLight}` }}>
          <div style={{ fontSize: 9, color: T.amber, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>
            Shortfall funded from
          </div>
          <div className="flex flex-wrap gap-2">
            {flows.map(f => (
              <div key={f.label} style={{
                padding: '4px 8px',
                background: T.amberSoft, border: `1px solid ${T.amber}30`,
                fontSize: 10, display: 'flex', alignItems: 'center', gap: 6
              }}>
                <span style={{ color: T.ink, fontWeight: 500 }}>{f.label}</span>
                <span style={{ fontFamily: MONO_FONT, color: T.amber, fontWeight: 600 }}>{f.delta}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 9, color: T.muted, fontStyle: 'italic', marginTop: 6 }}>
            Drawn in order: cash, then MM, then brokerage. CDs and 401(k) preserved.
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

function AllocationMockup() {
  const allocs = [
    { label: 'Cash', pct: 5, color: T.muted, opacity: 0.4 },
    { label: 'Money market', pct: 10, color: T.muted, opacity: 0.6 },
    { label: 'CDs', pct: 5, color: T.muted, opacity: 0.8 },
    { label: 'Brokerage', pct: 30, color: T.emerald, opacity: 1 },
    { label: '401(k) / IRA', pct: 50, color: T.emerald, opacity: 1 }
  ];
  return (
    <MockupFrame label="Savings allocation">
      <div style={{ padding: '20px 24px', background: T.surface }}>
        <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
          How surplus income is saved
        </div>
        {/* Mode tabs */}
        <div style={{
          display: 'flex', gap: 4, padding: 3, marginBottom: 14,
          background: T.surfaceWarm, border: `1px solid ${T.rule}`
        }}>
          <span style={{ padding: '4px 8px', fontSize: 9, color: T.ink, textTransform: 'uppercase', fontWeight: 500, flex: 1, textAlign: 'center' }}>Custom</span>
          <span style={{ padding: '4px 8px', fontSize: 9, color: T.surface, background: T.navy, textTransform: 'uppercase', fontWeight: 600, flex: 1, textAlign: 'center' }}>Balanced</span>
          <span style={{ padding: '4px 8px', fontSize: 9, color: T.amber, textTransform: 'uppercase', fontWeight: 500, flex: 1, textAlign: 'center' }}>Conservative</span>
        </div>
        {/* Banner */}
        <div style={{
          padding: '8px 12px', marginBottom: 14, display: 'flex',
          alignItems: 'center', gap: 8,
          background: T.emeraldSoft, border: `1px solid ${T.emerald}40`
        }}>
          <Check size={11} strokeWidth={2.5} style={{ color: T.emerald }} />
          <span style={{ fontFamily: MONO_FONT, fontSize: 13, fontWeight: 700, color: T.emerald }}>100%</span>
          <span style={{ fontSize: 10, color: T.emerald, fontWeight: 600 }}>Balanced, allocation totals 100%</span>
        </div>
        {/* Stacked bar */}
        <div style={{ display: 'flex', height: 6, marginBottom: 14, background: T.ruleLight, overflow: 'hidden' }}>
          {allocs.map(a => (
            <div key={a.label} style={{ width: `${a.pct}%`, background: a.color, opacity: a.opacity }} />
          ))}
        </div>
        {/* Sliders */}
        {allocs.map(a => (
          <div key={a.label} style={{ marginBottom: 8 }}>
            <div className="flex justify-between" style={{ fontSize: 10, marginBottom: 2 }}>
              <span style={{ color: T.ink, fontWeight: 500 }}>{a.label}</span>
              <span style={{ fontFamily: MONO_FONT, fontSize: 11, fontWeight: 600 }}>{a.pct}%</span>
            </div>
            <div style={{ height: 2, background: T.ruleLight, position: 'relative' }}>
              <div style={{ width: `${a.pct}%`, height: '100%', background: a.color, opacity: a.opacity }} />
              <div style={{
                width: 8, height: 8, borderRadius: 999,
                background: T.surface, border: `1.5px solid ${a.color}`,
                position: 'absolute', left: `calc(${a.pct}% - 4px)`, top: -3
              }} />
            </div>
          </div>
        ))}
      </div>
    </MockupFrame>
  );
}

function ScenariosMockup() {
  const scenarios = [
    { name: 'Base case 2026', age: '45 → retire at 65', props: '3 properties', date: 'Sep 12, 2026', active: true },
    { name: 'Retire at 60', age: '45 → retire at 60', props: '3 properties', date: 'Sep 12, 2026' },
    { name: 'No college help', age: '45 → retire at 65', props: '3 properties', date: 'Aug 28, 2026' },
    { name: 'Recession case', age: '45 → retire at 67', props: '2 properties', date: 'Aug 14, 2026' }
  ];
  return (
    <MockupFrame label="Scenarios library">
      <div style={{ padding: '20px 24px', background: T.bg }}>
        <div style={{ fontSize: 9, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4, fontWeight: 600 }}>
          What-if scenarios
        </div>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: 18, fontWeight: 500, color: T.ink, marginBottom: 14 }}>
          Save & manage scenarios
        </div>
        <div style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: '8px 10px', display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            disabled
            placeholder="e.g., 'Retire at 60'"
            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 11, color: T.muted, outline: 'none' }}
          />
          <span style={{
            background: T.emerald, color: T.surface, padding: '4px 8px',
            fontSize: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em'
          }}>
            Save as new
          </span>
        </div>
        <div style={{ fontSize: 8, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6, fontWeight: 600 }}>
          Your scenarios (4)
        </div>
        {scenarios.map(s => (
          <div key={s.name} className="mb-1" style={{
            background: s.active ? T.emeraldSoft : T.surface,
            border: `1px solid ${s.active ? T.emerald : T.rule}`,
            padding: '8px 10px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div>
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 11, fontWeight: 600, color: T.ink }}>{s.name}</span>
                {s.active && (
                  <span style={{ fontSize: 7, padding: '1px 4px', background: T.emerald, color: T.surface, fontWeight: 600, textTransform: 'uppercase' }}>
                    Active
                  </span>
                )}
              </div>
              <div style={{ fontFamily: MONO_FONT, fontSize: 8, color: T.muted, marginTop: 1 }}>
                {s.age} · {s.props} · {s.date}
              </div>
            </div>
          </div>
        ))}
      </div>
    </MockupFrame>
  );
}

// ============================================================================
// PRIVACY
// ============================================================================
function Privacy() {
  return (
    <section id="privacy" style={{ borderBottom: `1px solid ${T.rule}` }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8" style={{ paddingTop: 100, paddingBottom: 100 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionHeading
              eyebrow="Privacy"
              title={<>Your data <em style={{ fontStyle: 'italic', fontWeight: 400 }}>never</em> leaves your browser.</>}
            />
            <div className="mt-6 space-y-4" style={{ fontSize: 16, lineHeight: 1.6, color: T.inkSoft }}>
              <p>
                Most online financial calculators send your inputs to a server. This one doesn't. The entire app runs as JavaScript inside your browser. No backend, no database, no logs of what you typed.
              </p>
              <p>
                Saved scenarios live in your browser's localStorage, visible only to you, on your device. Want to share with an advisor? Use the JSON export to send a single file by email, edit it like any other document, or back it up.
              </p>
              <p>
                We don't ask for your email, your real name, or anything else. The site is free, ad-free, and tracker-free.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PrivacyCard icon={Lock} title="No backend" body="No server-side storage of your inputs. The app is a static page." />
            <PrivacyCard icon={Eye} title="No tracking" body="No analytics, no fingerprinting, no third-party scripts." />
            <PrivacyCard icon={FileJson} title="JSON export" body="Download your inputs as a portable file. You own your data." />
            <PrivacyCard icon={Mail} title="No signup" body="No account, no email, no password. Just open and use." />
          </div>
        </div>
      </div>
    </section>
  );
}

function PrivacyCard({ icon: Icon, title, body }) {
  return (
    <div className="p-5" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
      <Icon size={16} strokeWidth={1.5} style={{ color: T.emerald, marginBottom: 10 }} />
      <h4 style={{ fontFamily: DISPLAY_FONT, fontSize: 17, fontWeight: 500, color: T.ink, marginBottom: 6 }}>
        {title}
      </h4>
      <p style={{ fontSize: 13, lineHeight: 1.5, color: T.inkSoft }}>{body}</p>
    </div>
  );
}

// ============================================================================
// FAQ
// ============================================================================
function FAQ() {
  const faqs = [
    {
      q: "What's with the name?",
      a: "It's a dumb name. We told you. The calculator's the thing. The name is just a domain that was available. Don't overthink it."
    },
    {
      q: "Is this really free?",
      a: "Yes. Free, ad-free, no signup, no tracking. The site is hosted as a static page so the only cost is a domain registration."
    },
    {
      q: "How accurate is the math?",
      a: "Accurate enough to inform decisions, not accurate enough to file taxes. The model uses 2026 federal tax brackets, your state rate, capital gains, payroll tax, and 85% Social Security taxation. It runs deterministic year-by-year cashflow rather than Monte Carlo, so it doesn't capture sequence-of-returns risk. We're transparent about every assumption (see the footer of the calculator)."
    },
    {
      q: "Will it work on my phone?",
      a: "Yes. The calculator is fully responsive, works in portrait on iPhone, landscape on tablets, and at any desktop resolution. Save it to your home screen for an app-like experience."
    },
    {
      q: "Can I save multiple scenarios?",
      a: "Yes, unlimited. Save 'Retire at 60', 'Recession case', 'No college help', whatever you want. Switch between them with one click. Download any of them as a JSON file to back up or share."
    },
    {
      q: "What if I close my browser?",
      a: "Saved scenarios persist. They live in your browser's localStorage tied to ackwak.com. Clear your browser data and they're gone, so download important ones as JSON files for safekeeping."
    },
    {
      q: "Can I share with my financial advisor?",
      a: "Yes, three ways. Download your scenario as an Excel file (a multi-sheet workbook covering everything, opens in Excel, Google Sheets, or Numbers). Or open the printable summary in a new tab and use your browser's 'Save as PDF' to email a clean one-page snapshot. Or download the raw JSON for technical users. Excel is the most common choice for advisors."
    },
    {
      q: "Can I print my scenario?",
      a: "Yes. Click the Scenarios button, then 'Open print view' to get a clean, formatted summary in a new tab. Use Cmd+P / Ctrl+P to print or save as PDF. The page is designed for letter-sized paper and includes everything: assumptions, properties, vehicles, kids, debts, and projection milestones."
    },
    {
      q: "Is this financial advice?",
      a: "No. This is a planning tool, not a fiduciary recommendation. For real planning, run the numbers by a Certified Financial Planner who can stress-test against your tax situation, asset location, and Roth conversion strategy."
    }
  ];
  return (
    <section id="faq" style={{ background: T.surfaceWarm, borderBottom: `1px solid ${T.rule}` }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8" style={{ paddingTop: 100, paddingBottom: 100 }}>
        <SectionHeading
          eyebrow="FAQ"
          title="Questions, answered."
        />
        <div className="mt-12 space-y-1">
          {faqs.map((f, i) => <FAQItem key={i} {...f} defaultOpen={i === 0} />)}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ q, a, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: `1px solid ${T.rule}` }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '20px 0', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          background: 'transparent', cursor: 'pointer', textAlign: 'left'
        }}
      >
        <span style={{
          fontFamily: DISPLAY_FONT, fontSize: 'clamp(18px, 2.2vw, 22px)',
          fontWeight: 500, color: T.ink, paddingRight: 16
        }}>
          {q}
        </span>
        <ChevronDown size={18} strokeWidth={1.5} style={{
          color: T.muted, flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms'
        }} />
      </button>
      {open && (
        <p style={{
          paddingBottom: 24, fontSize: 15, lineHeight: 1.6,
          color: T.inkSoft, maxWidth: 760
        }}>
          {a}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// FINAL CTA
// ============================================================================
function FinalCTA() {
  return (
    <section style={{ background: T.ink, color: T.surface }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8" style={{ paddingTop: 100, paddingBottom: 100 }}>
        <div className="flex items-center gap-2 mb-5" style={{ color: '#A8C9B5' }}>
          <Calculator size={13} strokeWidth={1.5} />
          <span style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            Ready to find out?
          </span>
        </div>
        <h2 style={{
          fontFamily: DISPLAY_FONT, fontSize: 'clamp(40px, 7vw, 80px)',
          fontWeight: 500, lineHeight: 1, letterSpacing: '-0.03em',
          marginBottom: 24, fontVariationSettings: '"opsz" 144'
        }}>
          When can <em style={{ fontStyle: 'italic', fontWeight: 400, color: '#9DD9B5' }}>you</em><br />
          actually retire?
        </h2>
        <p style={{ fontSize: 'clamp(15px, 1.6vw, 18px)', lineHeight: 1.55, color: '#C9C4BB', maxWidth: 600, marginBottom: 36 }}>
          The default scenario takes about a minute to fill out. Adjust it to your numbers. The chart updates instantly. Save what you like, throw away what you don't.
        </p>
        <a href="#calculator" style={{
          background: '#9DD9B5', color: T.ink,
          padding: '16px 28px', fontWeight: 700,
          fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase',
          display: 'inline-flex', alignItems: 'center', gap: 8
        }}>
          Launch the calculator <ArrowRight size={16} strokeWidth={2.5} />
        </a>
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
      <div className="max-w-7xl mx-auto px-5 sm:px-8" style={{ paddingTop: 36, paddingBottom: 36 }}>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div style={{
              color: T.ink, fontFamily: DISPLAY_FONT,
              fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em',
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8
            }}>
              <span style={{
                width: 22, height: 22, background: T.ink, color: T.surface,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: 13
              }}>a</span>
              ackwak<span style={{ color: T.muted, fontWeight: 400 }}>.com</span>
            </div>
            <p style={{ fontSize: 12, color: T.muted, maxWidth: 320 }}>
              A dumb name. The best darn retirement, net worth, and expenditure calculator on the planet.
            </p>
          </div>
          <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.6, maxWidth: 480 }}>
            <strong style={{ color: T.inkSoft, fontWeight: 600 }}>This is not financial advice.</strong> The calculator is for informational purposes only. For real planning involving your specific tax situation, asset location, and risk tolerance, consult a Certified Financial Planner.
          </div>
        </div>
        <div className="mt-6 pt-5 flex flex-wrap items-center justify-between gap-3" style={{ borderTop: `1px solid ${T.rule}`, fontSize: 11, color: T.muted }}>
          <span>© {new Date().getFullYear()} SLAE Labs LLC. All rights reserved. ackwak.com is a product of SLAE Labs LLC.</span>
          <div className="flex items-center gap-4">
            <a href="#features" style={{ color: T.muted }}>Features</a>
            <a href="#privacy" style={{ color: T.muted }}>Privacy</a>
            <a href="#faq" style={{ color: T.muted }}>FAQ</a>
            <a href="#calculator" style={{ color: T.ink, fontWeight: 600 }}>Launch app →</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
