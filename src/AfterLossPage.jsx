// ============================================================================
// AFTER A LOSS — bereavement guide
// ============================================================================
// Practical guidance for someone whose family member has passed. Walks the
// reader through the timeline (first 72 hours -> first 2 weeks -> executor
// duties -> first months -> year of) and reinforces:
//
//   1. Recommendations, never absolutes ("things to think about")
//   2. Who to contact, when, and why ("an estate attorney typically...")
//   3. Strong, repeated disclaimer that this is not legal/financial/tax advice
//   4. Permission to delegate, take breaks, ask for help
//
// Tone: warm but clear. Some sections inevitably involve legal/tax precision
// (executor duties, IRS deadlines, estate tax thresholds). For those we use
// the right legal terminology with a clear "consult an estate attorney" or
// "consult a CPA" prompt nearby. Most of the page uses "passes" / "passed";
// formal/legal sections use "death" / "decedent" where precision matters.
//
// The religious/cultural section gives a high-level note on practical timing
// implications for major traditions (Christian, Catholic, Eastern Orthodox,
// Jewish, Muslim, Hindu, Buddhist, secular) and explicitly directs readers
// to clergy, community elders, or organizations for actual practice.
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Sparkles, ShieldCheck, Heart, Activity, Lock,
  ClipboardList, Users, FileText, Phone, Home, MessageSquare,
  ArrowRight, Briefcase, Receipt, Calendar
} from 'lucide-react';
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
const MONO_FONT = "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace";

export default function AfterLossPage() {
  return (
    <div style={{ background: T.bg, minHeight: '100vh', fontFamily: BODY_FONT, color: T.ink }}>
      <SiteNav />
      <Hero />
      <NotAdviceBanner />
      <Reassurance />

      <PhaseSection
        phaseNum={1}
        title="The first 72 hours"
        subtitle="The immediate aftermath"
        deadline="First 1 to 3 days"
        intro="Most things in these first days are about safety, basic decisions, and notifying people. You don't have to be perfect. You don't have to do it alone. A few things truly are time-sensitive (typically: body disposition arrangements and notifying immediate family), but most decisions, including financial and legal ones, can and should wait."
        actions={[
          {
            icon: Phone,
            tone: 'navy',
            heading: 'Pronouncement and immediate next call',
            body: <>If the person passed at home unexpectedly, in most states the call is 911. If they were in hospice, the call is to the hospice nurse, who handles the pronouncement. If they passed in a hospital or care facility, staff handle this. The funeral home (if one has been selected) typically arrives next to transport the body. <strong>Worth knowing:</strong> the death certificate gets started here, but you'll need actual paper certified copies later, more on that in Phase 2.</>
          },
          {
            icon: Users,
            tone: 'oxblood',
            heading: 'Notifying the immediate family',
            body: "Most people find that calling immediate family directly, in a quiet moment, lands better than texting. Many people also find it helps to ask one or two trusted people to make additional calls so you don't have to repeat the news dozens of times. There's no right way to do this. Some families gather; others scatter. Both are normal."
          },
          {
            icon: Home,
            heading: "Securing the deceased's home, pets, and vehicles",
            body: <>If the person lived alone or had pets or a vehicle, someone needs to handle the immediate practicals: feed and care for pets, secure the home, retrieve any medication that needs to be returned or destroyed, lock up cars, take in the mail. Many people find it helps to delegate this to a relative or close friend who isn't part of the immediate grieving circle. <em>Worth thinking about:</em> change of locks isn't usually necessary in the first days, but if multiple people had keys (housekeepers, neighbors, ex-partners), some families find it brings peace of mind.</>
          },
          {
            icon: Heart,
            tone: 'amber',
            heading: 'Body disposition: funeral home, transport, decisions',
            body: <>The funeral home handles transport from the place of death and will walk you through options for burial, cremation, or other disposition. <strong>Time pressure varies a lot by tradition.</strong> Some religious practices call for burial within 24 hours (Muslim, often Jewish); others have no time pressure at all (most secular and many Christian traditions). The "Religious and cultural traditions" section below has more on this. <em>Worth knowing:</em> the FTC's Funeral Rule requires funeral homes to give you itemized prices over the phone or in writing, you don't have to accept package pricing. Many people find it helps to bring a friend who isn't a primary mourner to the planning meeting.</>
          },
          {
            icon: AlertTriangle,
            tone: 'amber',
            heading: "Things you might think are urgent but aren't",
            body: "In the first 72 hours, almost no financial or legal decision is actually urgent, despite how it might feel. It's worth holding off on signing contracts, selling or giving away belongings, or making permanent decisions about the deceased's property or accounts. Funeral package pricing is worth checking against itemized prices before agreeing. Posting public details about services (date, time, address) is also worth a pause to think about scammers. The legal and financial work has time, and it benefits from a calmer mind."
          }
        ]}
      />

      <PhaseSection
        phaseNum={2}
        title="The first two weeks"
        subtitle="Notifications, services, paperwork"
        deadline="Days 4 through 14"
        intro="The most active phase, and the one where it helps most to ask for help. There's a lot to do, but most of it can be parceled out among family members and trusted friends. Many people find a shared document (a Google Doc or even just a paper notebook) keeps the list of who's contacted whom from getting tangled."
        actions={[
          {
            icon: FileText,
            tone: 'navy',
            heading: 'Death certificates: how many to order',
            body: <>The funeral home typically orders death certificates as part of their services. <strong>Most people find they need 5 to 10 certified copies.</strong> Banks, insurance companies, the IRS, the Social Security Administration, employers, retirement plans, brokerages, the DMV (for transferring vehicle titles), real estate (for deed transfers), and probate court each typically require an original, not a photocopy. Ordering more upfront is much easier than ordering more later. They typically cost $10 to $25 each depending on the state.</>
          },
          {
            icon: ClipboardList,
            heading: 'Funeral, memorial, wake, ceremony',
            body: <>Whether religious or secular, formal or informal, in a funeral home or at someone's house, the form of the service depends on the family, the deceased's wishes (if known), and tradition. The "Religious and cultural traditions" section below covers high-level patterns. <em>Worth thinking about:</em> not everyone wants a service, and that's a legitimate choice. Some families do an immediate small gathering and a larger memorial weeks or months later, that's also legitimate. Asking close family what they need, and what the deceased would have wanted, is often the best place to start.</>
          },
          {
            icon: MessageSquare,
            heading: 'Writing the obituary',
            body: "Many people find writing the obituary harder than expected. There's no required format. A typical obituary names the person, lists immediate family, mentions where and when services will be held (if public), and includes a few sentences about who they were as a person. Newspaper obituaries usually charge by the word; online options at Legacy.com, the local paper's website, or simply a social media post are often free. Many people find that writing the obituary together with another close family member helps."
          },
          {
            icon: ShieldCheck,
            heading: 'The notification list',
            body: <>This is the practical work that takes time but isn't conceptually hard. Each entity below typically requires a death certificate and a written request. Many estate attorneys provide a checklist. The big ones, in rough order:
              <ul style={{ margin: '8px 0 0 0', paddingLeft: 18, lineHeight: 1.55 }}>
                <li><strong>Social Security Administration</strong>: typically the funeral home reports this, but worth confirming. There's a one-time death benefit of $255 for surviving spouses (small, but worth filing for).</li>
                <li><strong>Employer</strong> (if working): for final paycheck, life insurance, retirement plan, COBRA decisions for surviving spouse.</li>
                <li><strong>Banks and credit unions</strong>: to freeze accounts and start the process for transferring or releasing them per the will, trust, or beneficiary designation.</li>
                <li><strong>Brokerage and retirement accounts</strong>: each has its own process. IRAs and 401(k)s usually transfer to named beneficiaries directly (not through probate), but require paperwork.</li>
                <li><strong>Life insurance companies</strong>: each policy needs a separate claim.</li>
                <li><strong>Health insurance</strong>: cancel coverage, but also check for unpaid claims.</li>
                <li><strong>Credit card companies</strong>: most have bereavement departments. They will often waive interest while the estate is settled.</li>
                <li><strong>Utilities, mortgage, rent, subscriptions</strong>: continue paying these from the estate; don't let them lapse.</li>
                <li><strong>The IRS</strong>: not immediately, but the executor will need to file the decedent's final tax return (more in the executor section below).</li>
                <li><strong>DMV</strong>: for vehicle title transfers.</li>
                <li><strong>Voter registration</strong>: notify to remove from rolls (helps prevent identity theft).</li>
                <li><strong>Pension or annuity providers</strong>: for survivor benefits.</li>
              </ul>
            </>
          },
          {
            icon: FileText,
            tone: 'emerald',
            heading: 'Locating the will, trust, beneficiary designations',
            body: <>This often happens earlier than people expect. Common places: a fireproof box at home, a safety deposit box at the bank, an attorney's office (often the attorney who drafted it), a digital storage service, or with a trusted family member. <em>Worth knowing:</em> bank safety deposit boxes can be tricky to access after a death; some states require a court order. The will and any trust documents will determine who is the executor (or trustee), and that person becomes the central figure for the legal/financial settlement. The "If you're the executor" phase below covers what that role involves.</>
          },
          {
            icon: Lock,
            tone: 'amber',
            heading: 'Watch for scams',
            body: "Death triggers a wave of scams targeting bereaved families. Common ones: fake debt collectors claiming the deceased owed money, fake genealogy services claiming the deceased had unclaimed inheritance, identity theft using personal information from obituaries, contractors approaching surviving spouses about \"urgent\" home repairs. A good rule: if anyone contacts you unprompted about the deceased's affairs, don't engage with them on the spot. Take their information, run it past a trusted family member or attorney, and only respond if it's confirmed legitimate."
          }
        ]}
      />

      <ExecutorSection />

      <PhaseSection
        phaseNum={4}
        title="The first few months"
        subtitle="Settling in"
        deadline="Months 1 to 6"
        intro="The active logistics ease, but new things come up. Cleaning out a home, transferring or selling property, going through belongings, navigating family dynamics. Some of this gets harder before it gets easier. Many people find this is when grief tends to land harder, after the immediate distractions of the first weeks."
        actions={[
          {
            icon: Home,
            heading: 'Cleaning out the home',
            body: <>One of the more emotionally heavy tasks. Many people find it helps to take it slowly, often over months rather than weeks. Common mistakes: rushing to empty the house before the family is ready, donating valuable items by accident (jewelry, watches, antiques, art often have value far above what families realize), throwing away important documents (tax returns, deeds, vital records). <em>Worth thinking about:</em> some families find it useful to have an estate sale or appraiser walk through before any major decisions. Even if most belongings have only sentimental value, an appraisal can flag the few items that are genuinely valuable.</>
          },
          {
            icon: Receipt,
            heading: 'Selling or transferring property',
            body: <>Real estate, vehicles, and other titled property usually transfer through probate or per a trust. Some can sit for months or longer, others (especially anything continuing to incur costs like a vacation home or a vehicle on a lease) may need attention sooner. <strong>If you're the executor</strong>, an estate attorney can advise on whether to sell now, hold, or transfer. Selling a primary residence within a tax-favorable window after death matters for the surviving spouse, this is a common case where a quick conversation with a CPA pays off.</>
          },
          {
            icon: Users,
            tone: 'amber',
            heading: 'Family dynamics',
            body: "Death often surfaces dynamics that have been simmering for years. Sibling conflict over belongings, accusations about caregiving roles, second-marriage friction with stepchildren, disagreements about money. Many people find this is the hardest part of the process, harder than the legal or financial work. Some patterns: the sibling who did most of the caregiving may feel under-recognized; the sibling who lives far away may feel left out of decisions; second spouses and adult children from a prior marriage often have different priorities. Family mediators (separate from estate attorneys) exist for this and can be worth their weight in gold."
          },
          {
            icon: Calendar,
            heading: 'Memorial events and anniversaries',
            body: "Some families do a smaller memorial weeks or months after the death, especially when family members live far apart, when burial is delayed, or when religious tradition includes a later observance (e.g., Jewish unveiling, Catholic month's mind mass, Hindu ceremonies at specific intervals). The first holidays, birthday, and anniversary of the death are often harder than expected. Many people find it helps to plan ahead for those days, whether that means gathering, traveling, or deliberately doing something quiet."
          },
          {
            icon: Activity,
            tone: 'emerald',
            heading: 'Your own grief',
            body: "Grief doesn't follow a timeline, and the cultural expectation that you should \"be okay\" within weeks or months often causes more pain than the loss itself. Common patterns: weeks 4 to 12 are often harder than the first weeks (the shock fades and the absence becomes more real); the first holiday season can knock people down unexpectedly; physical symptoms (sleep, appetite, energy) often persist for months. Grief counselors, therapists, and support groups (many run by hospice organizations or religious communities) can help. Online resources include What's Your Grief, Modern Loss, and the Center for Loss and Life Transition."
          }
        ]}
      />

      <PhaseSection
        phaseNum={5}
        title="Year-of-death considerations"
        subtitle="Things to know exist"
        deadline="First year and beyond"
        intro="A lighter phase, more for awareness than action. Several legal and tax considerations have implications that play out over the first year and sometimes longer. The list below isn't comprehensive, it's a sample of the kinds of things worth bringing to a CPA or estate attorney. None of this is tax advice; it's a list of things that exist."
        actions={[
          {
            icon: Receipt,
            tone: 'navy',
            heading: 'Step-up in basis',
            body: <>When someone passes, the cost basis of most inherited assets (stocks, real estate, etc.) typically resets to the fair market value on the date of death. This can be a significant tax benefit for heirs. The technical term is "stepped-up basis." <em>Why it matters:</em> selling inherited assets without understanding this can mean paying taxes that wouldn't have been owed. <strong>This is a clear case where a brief CPA conversation can save thousands.</strong></>
          },
          {
            icon: Briefcase,
            heading: 'Inherited IRAs and the 10-year rule',
            body: <>For most non-spouse heirs of IRAs, the SECURE Act requires the account to be fully distributed within 10 years of the original owner's death. There are exceptions (spouses, minor children, disabled or chronically ill heirs, heirs not more than 10 years younger), and there are different rules depending on whether the original owner had started taking required minimum distributions. <em>Why it matters:</em> the timing of those distributions has significant tax implications. <strong>A CPA or fee-only fiduciary advisor can help map out a withdrawal strategy.</strong></>
          },
          {
            icon: ShieldCheck,
            heading: 'Estate tax thresholds',
            body: "Federal estate tax only applies above a high threshold (currently in the millions per person). State estate taxes vary, some states have estate or inheritance taxes that kick in at much lower thresholds. Most estates don't owe federal estate tax, but it's worth verifying with a CPA. If the deceased was a high-net-worth individual, this becomes more involved and an estate attorney typically handles it."
          },
          {
            icon: Heart,
            heading: 'Survivor benefits',
            body: "Surviving spouses may be eligible for Social Security survivor benefits, pension survivor benefits, VA benefits (if the deceased was a veteran), and life insurance payouts. The rules around when to claim Social Security survivor benefits are complex, claiming early reduces the lifetime benefit, claiming at full retirement age maximizes it, and there are interactions with the surviving spouse's own benefit. The Social Security Administration's website has a calculator. Many people find that talking with a Social Security claims specialist or fee-only retirement planner helps make sense of the choice."
          },
          {
            icon: Calendar,
            heading: 'The first holidays and anniversary',
            body: "Practical heads-up that the first holidays, birthday, and anniversary often hit harder than expected. Many people find it helps to plan ahead, whether that means gathering with family, traveling away, or deliberately not doing anything in particular. There's no right way."
          }
        ]}
      />

      <ThingsToThinkTwice />
      <WhoToContactSection />
      <ReligiousTraditions />
      <CalculatorCTA />
      <CrossReferences />
      <FinalDisclaimer />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section style={{ background: T.surface, borderBottom: `1px solid ${T.rule}` }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8" style={{ paddingTop: 64, paddingBottom: 56 }}>
        <div className="flex items-center gap-2 mb-5" style={{ color: T.muted }}>
          <Sparkles size={12} strokeWidth={1.5} />
          <span className="text-[11px] uppercase tracking-[0.2em]" style={{ fontWeight: 500 }}>
            Transitions, loss of a family member
          </span>
        </div>
        <h1 style={{
          fontFamily: DISPLAY_FONT, fontWeight: 500,
          fontSize: 'clamp(36px, 7vw, 72px)',
          lineHeight: 0.98, letterSpacing: '-0.02em', color: T.ink,
          marginBottom: 24
        }}>
          After a loss.
        </h1>
        <p style={{
          fontFamily: BODY_FONT, fontWeight: 400,
          fontSize: 'clamp(18px, 2.4vw, 26px)',
          lineHeight: 1.4, letterSpacing: '-0.01em', color: T.inkSoft,
          marginBottom: 0
        }}>
          Practical things to think about when a family member passes, who to contact, and when. Not legal or financial advice, just guidance for one of life's hardest transitions.
        </p>
      </div>
    </section>
  );
}

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
            <p style={{ fontSize: 13, lineHeight: 1.55, color: T.ink, margin: 0, marginBottom: 8 }}>
              This page is informational only. It is not legal, tax, financial, or grief advice. The legal and tax aspects of settling someone's affairs are state-specific and personal-circumstance-specific, and mistakes can have permanent consequences (executor liability, tax penalties, family disputes that don't resolve).
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.55, color: T.ink, margin: 0 }}>
              For the legal and financial side, an estate attorney, a CPA familiar with estates, and a fee-only fiduciary financial advisor are the three professionals worth talking to. For the emotional side, grief counselors, faith leaders, and grief support groups (many free) help. None of these professionals are a luxury here, this is one of the situations where qualified guidance often pays for itself many times over.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

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
              You don't have to do this all at once
            </span>
          </div>
          <p style={{
            fontFamily: BODY_FONT, fontWeight: 400,
            fontSize: 'clamp(15px, 1.8vw, 18px)',
            lineHeight: 1.55, color: T.ink, marginBottom: 16
          }}>
            A small number of things in the first few days truly are time-sensitive: arrangements for the body, notifying immediate family, sometimes a religious tradition with a tight timeline. <strong>Almost everything else can wait, and benefits from waiting.</strong>
          </p>
          <p style={{
            fontSize: 14, lineHeight: 1.6, color: T.inkSoft, margin: 0, marginBottom: 12
          }}>
            You don't have to be the one to do every task. You don't have to make permanent decisions while you're in active grief. You don't have to respond to people on their timeline. The estate doesn't have to be settled in a month, or three, or even six. Most things have weeks or months, not days.
          </p>
          <p style={{
            fontSize: 14, lineHeight: 1.6, color: T.inkSoft, margin: 0
          }}>
            The phases below are organized chronologically, but think of them as a checklist you can dip into rather than a march you have to make. Take the breaks you need. Ask for help. Eat. Sleep when you can. None of this is failure.
          </p>
        </div>
      </div>
    </section>
  );
}

function ExecutorSection() {
  return (
    <section style={{ background: T.bg }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8" style={{ paddingTop: 24, paddingBottom: 24 }}>
        <div style={{
          background: T.surface, border: `1px solid ${T.rule}`,
          padding: 'clamp(20px, 3vw, 32px)',
          borderTop: `4px solid ${T.oxblood}`
        }}>
          <div className="flex items-baseline gap-3 mb-1 flex-wrap">
            <div style={{
              fontFamily: MONO_FONT, fontSize: 11, fontWeight: 600,
              letterSpacing: '0.15em', color: T.muted
            }}>
              PHASE 3 · IF YOU'RE THE EXECUTOR OR TRUSTEE
            </div>
            <div style={{
              fontFamily: BODY_FONT, fontSize: 11, fontWeight: 500,
              letterSpacing: '0.05em', textTransform: 'uppercase',
              color: T.oxblood
            }}>
              Spans many months
            </div>
          </div>
          <h3 style={{
            fontFamily: DISPLAY_FONT, fontWeight: 500,
            fontSize: 'clamp(22px, 3vw, 30px)',
            letterSpacing: '-0.01em', color: T.ink, lineHeight: 1.1,
            marginBottom: 12, marginTop: 4
          }}>
            What that role actually involves
          </h3>
          <p style={{
            fontSize: 14, lineHeight: 1.55, color: T.inkSoft,
            marginBottom: 24, marginTop: 0
          }}>
            If the will (or trust) names you as the executor (or trustee), you have a legal duty to settle the deceased's affairs. <strong>It's a real job</strong>, often months of work, sometimes much longer for complex estates. You're personally liable for mistakes. The right help (estate attorney, CPA) makes this manageable; trying to do it alone usually doesn't.
          </p>

          <div style={{
            background: T.surfaceWarm, border: `1px solid ${T.rule}`,
            padding: 16, marginBottom: 24
          }}>
            <p style={{ fontSize: 13, lineHeight: 1.55, color: T.ink, margin: 0 }}>
              <strong>You can decline the role.</strong> If you've been named executor and it's not feasible (you live in another state, you have your own crisis, you don't have the bandwidth, you don't trust your own judgment for the role), you can decline. The court will appoint someone else, often the named alternate, otherwise a professional fiduciary. Declining is not abandonment, it's a legitimate choice.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ActionItem
              icon={ClipboardList}
              tone="navy"
              heading="What an executor's typical duties look like"
              body={<>The legal term varies by state (executor, personal representative, administrator), but the core duties are similar:
                <ul style={{ margin: '8px 0 0 0', paddingLeft: 18, lineHeight: 1.55 }}>
                  <li>File the will with probate court (in states that require probate; most do)</li>
                  <li>Inventory the estate's assets and obtain valuations as of the date of death</li>
                  <li>Notify creditors (often through a published notice) and pay valid debts from the estate</li>
                  <li>File the decedent's final personal income tax return (Form 1040)</li>
                  <li>File the estate's income tax return (Form 1041), if the estate generates income during settlement</li>
                  <li>File any state estate tax or federal estate tax returns, if applicable</li>
                  <li>Distribute remaining assets to beneficiaries per the will (or per state intestacy law if no will)</li>
                  <li>Keep meticulous records of every transaction</li>
                  <li>File a final accounting with the court before the estate is closed</li>
                </ul>
                Most of this happens over 6 to 18 months. Complex estates take longer.</>
              }
            />
            <ActionItem
              icon={AlertTriangle}
              tone="amber"
              heading="Why this needs an estate attorney"
              body={<>Executors are personally liable for distributing assets to the wrong people, paying creditors out of order, missing tax deadlines, or mismanaging estate funds. State probate laws are detailed and unforgiving. <strong>An estate attorney is not optional for most executors.</strong> Many estate attorneys work on a flat fee or as a percentage of the estate (typically 1 to 3%), paid from the estate, not your personal funds. This is one of the clearest cases on this site where professional help isn't a luxury, it's a basic requirement of the job.</>}
            />
            <ActionItem
              icon={Receipt}
              heading="The tax piece"
              body={<>Several different tax returns may apply:
                <ul style={{ margin: '8px 0 0 0', paddingLeft: 18, lineHeight: 1.55 }}>
                  <li><strong>The decedent's final 1040:</strong> covers income from January 1 of the year of death through the date of death. Due by the standard April 15 deadline of the following year.</li>
                  <li><strong>Estate income tax return (1041):</strong> covers income the estate earns during settlement (interest, dividends, capital gains on assets that haven't yet been distributed). Filed annually until the estate closes.</li>
                  <li><strong>Federal estate tax return (706):</strong> only required if the estate exceeds the federal threshold. Most estates don't owe.</li>
                  <li><strong>State estate or inheritance tax returns:</strong> varies by state. Some states tax estates above their own (often lower) thresholds.</li>
                </ul>
                A CPA familiar with estates handles these. Most executors find this is one place where trying to file solo isn't worth it.</>
              }
            />
            <ActionItem
              icon={Lock}
              heading="The mistakes that hurt"
              body={<>Common executor mistakes that cause real problems: distributing assets before paying creditors (the creditor can come after you personally), missing the federal estate tax deadline (9 months from date of death; the IRS doesn't forgive easily), losing track of estate assets or commingling them with personal funds, distributing before the will has actually been admitted to probate, paying yourself executor fees that the will doesn't authorize. <strong>Documentation is your friend.</strong> Keep every receipt, every bank statement, every email. An estate attorney can guide you through this; without one, mistakes become much more likely.</>}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function PhaseSection({ phaseNum, title, subtitle, deadline, intro, actions }) {
  return (
    <section style={{ background: T.bg }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8" style={{ paddingTop: 24, paddingBottom: 24 }}>
        <div style={{
          background: T.surface, border: `1px solid ${T.rule}`,
          padding: 'clamp(20px, 3vw, 32px)'
        }}>
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

function ThingsToThinkTwice() {
  const items = [
    {
      title: "Think twice before signing anything in the first 30 days",
      body: "Decisions about belongings, real estate, financial accounts, and contracts are almost never urgent in the first month. Funeral home contracts are often the exception, but even there, you have time to ask questions and compare prices. People in active grief sometimes sign things they later wish they hadn't, sometimes things that are quite expensive. When in doubt, waiting is usually fine."
    },
    {
      title: "Be cautious about permanent decisions on belongings while in active grief",
      body: "Cleaning out the house, selling the car, donating clothes, distributing jewelry — all of these can wait. Many people regret things they donated or threw away in the first weeks. There's no rule against keeping things in storage for a year while the family figures out what to do. Some families do exactly this."
    },
    {
      title: "Be wary of unsolicited contact about the estate",
      body: "Death triggers a wave of scams. If anyone calls out of the blue claiming the deceased had unclaimed assets, owed money, or had legal issues that need addressing, it's worth taking their information, ending the call, and verifying through a trusted source (estate attorney, the company they claim to represent). Legitimate creditors and institutions work through formal channels."
    },
    {
      title: "Think twice before taking on the executor role",
      body: "If the will names you, taking a beat before saying yes is worth it. Read what the role involves. Talk to an estate attorney about what they think the estate will require. The role is a legal duty with personal liability and often months of work. Saying no, or asking for a co-executor, is a legitimate choice."
    },
    {
      title: "Worth resisting the urge to do this all yourself",
      body: "There's a cultural tendency to soldier through grief alone, especially for people in caregiving roles. It rarely works well. Many people find that delegating tasks (notification calls, paperwork, food coordination, house tasks) to siblings, friends, or hired help creates more space to actually grieve, rather than less. Asking for help isn't weakness."
    },
    {
      title: "Your own grief deserves attention too",
      body: "Grief shows up physically (sleep, appetite, energy), cognitively (memory, focus, decisions), and emotionally (irritability, numbness, sadness, sometimes unexpected joy). All of these are normal. None of them go on a schedule. Many people find that the weeks 4 to 12 after a death are harder than the first weeks, as the shock fades and the absence becomes more real. Talking with someone — a counselor, a friend, a faith leader, a support group — isn't optional luxury. It's often what keeps people from getting stuck."
    },
    {
      title: "Try not to let family arguments harden into permanent rifts",
      body: "Death surfaces longstanding family dynamics. Sibling conflict, second-marriage friction, accusations about caregiving roles, disagreements about money. Many people regret what was said in the first weeks. Family mediators (separate from estate attorneys) exist for this and can be worth the cost."
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

function WhoToContactSection() {
  const contacts = [
    { role: 'Funeral director', when: 'First 24 to 72 hours', why: 'Body transport and arrangements. Required to file the death certificate in most cases. Worth knowing: you can compare itemized prices across funeral homes; the FTC requires them to provide pricing.' },
    { role: 'Estate attorney', when: 'First 2 weeks', why: 'Especially if you\'re named executor. Walks you through probate, executor duties, will or trust administration, and tax filings. Often paid from the estate (1 to 3% of estate value), not your personal funds.' },
    { role: 'CPA familiar with estates', when: 'First 60 to 90 days', why: 'Decedent\'s final 1040, estate income tax (1041), step-up in basis questions, inherited IRA distributions, state estate tax. Don\'t try to file these yourself.' },
    { role: 'Fee-only fiduciary financial advisor', when: 'Once initial logistics settle (first 3 to 6 months)', why: 'Especially helpful for surviving spouses figuring out long-term planning, Social Security claiming strategy, retirement projection updates, and decisions about inherited assets.' },
    { role: 'Grief counselor or therapist', when: 'Anytime, often more useful starting weeks 4 to 12', why: 'Grief doesn\'t follow a timeline. Many people find that the weeks after the immediate logistics calm down are harder, not easier. A grief specialist (different from a general therapist) understands the patterns.' },
    { role: 'Faith leader or clergy', when: 'Anytime', why: 'Religious traditions vary widely; community-specific guidance on services, observances, and longer-term ritual is often best from someone who knows your tradition.' },
    { role: 'Insurance agents', when: 'First 2 weeks', why: 'Each life insurance policy needs a separate claim. Health insurance needs to be canceled. Property insurance on the deceased\'s home or car may need to be transferred or modified.' },
    { role: 'Social Security Administration', when: 'First 2 weeks', why: 'Death benefit ($255 lump sum to surviving spouses). Survivor benefits for spouses and minor children. Can be done online or in person.' },
    { role: 'Hospice and grief support organizations', when: 'Anytime', why: 'Many hospice organizations run free grief support groups, including for families they didn\'t directly serve. Local community mental health centers, religious communities, and hospice grief programs are often free.' },
    { role: 'Family mediator', when: 'If conflict emerges', why: 'Separate from an estate attorney. Helps families work through disputes about belongings, decisions, or longstanding dynamics that the death has surfaced.' }
  ];

  return (
    <section style={{ background: T.bg }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8" style={{ paddingTop: 56, paddingBottom: 24 }}>
        <SectionHeading
          eyebrow="Who to contact"
          title="People who can help, and when"
          desc="A quick reference for when each kind of professional or resource is typically most useful. None of these are mandatory; some apply to everyone, others only in certain situations."
        />
        <div style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: 0 }}>
          {contacts.map((c, i) => (
            <div key={i} style={{
              padding: 'clamp(16px, 2.5vw, 20px)',
              borderBottom: i < contacts.length - 1 ? `1px solid ${T.ruleLight}` : 'none'
            }}>
              <div className="flex items-baseline justify-between gap-3 flex-wrap mb-2">
                <h4 style={{
                  fontFamily: BODY_FONT, fontWeight: 700,
                  fontSize: 'clamp(14px, 1.8vw, 16px)',
                  color: T.ink, margin: 0, lineHeight: 1.3
                }}>
                  {c.role}
                </h4>
                <span style={{
                  fontFamily: MONO_FONT, fontSize: 11, fontWeight: 600,
                  letterSpacing: '0.05em', color: T.amber
                }}>
                  {c.when.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.55, color: T.inkSoft, margin: 0 }}>
                {c.why}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReligiousTraditions() {
  const traditions = [
    { name: 'Christian (general Protestant)', timing: 'Typically a service within 1 to 2 weeks', notes: 'Burial or cremation are both common; varies by denomination and family. Many denominations have specific service traditions; clergy at the family\'s church or chapel can guide.' },
    { name: 'Catholic', timing: 'Wake or vigil before, funeral mass within days, burial after', notes: 'Includes specific rites: vigil (wake), funeral mass, rite of committal at the gravesite. Cremation is permitted but the ashes are typically kept whole and buried or interred. The parish priest is the central guide. Some families also observe a "month\'s mind" mass and an anniversary mass.' },
    { name: 'Eastern Orthodox', timing: 'Burial typically within 2 to 3 days', notes: 'Traditions include the trisagion (memorial service) at the funeral home, the funeral service itself, and memorials at 40 days, 6 months, 1 year, and on subsequent anniversaries. Cremation is generally not practiced. The parish priest guides.' },
    { name: 'Jewish', timing: 'Burial typically within 24 to 48 hours', notes: <>Traditions vary by movement (Orthodox, Conservative, Reform, Reconstructionist) but commonly include: a watcher (shomer) staying with the body, a quick burial, sitting shiva (typically 7 days of mourning at home), and a year of formal mourning for a parent. <strong>Cremation is generally not practiced</strong> in traditional observance. A Jewish funeral home and the family rabbi are the central guides; <em>kvod hamet</em> (honor of the dead) shapes many practical decisions.</> },
    { name: 'Muslim', timing: 'Burial typically within 24 hours', notes: <>The body is washed (ghusl) and shrouded (kafan), prayers (Salat al-Janazah) are said, and burial follows quickly, typically the same or next day. <strong>Cremation is not practiced.</strong> Mosque imams and local Muslim funeral organizations guide families through the specific rites. Mourning continues for 3 days; spouses traditionally observe a longer period.</> },
    { name: 'Hindu', timing: 'Cremation typically within 24 to 48 hours', notes: 'Cremation is the standard practice. Specific rites (antyesti) involve the family, sometimes with a priest, and may include later ceremonies at 13 days, 1 month, and 1 year. Practices vary considerably by region and tradition. A family priest or local Hindu temple is the guide. Some traditions involve scattering ashes in a sacred river, including the Ganges, which can mean travel.' },
    { name: 'Buddhist', timing: 'Varies; often 3 to 7 days before cremation', notes: 'Practice varies enormously across Buddhist traditions (Theravada, Mahayana, Vajrayana, Tibetan, Zen). Common elements include chanting, sometimes by monks, and a focus on the deceased\'s journey. Cremation is most common but not universal. The family\'s sangha or Buddhist community is the best guide; Tibetan traditions especially have specific timeline observances over 49 days.' },
    { name: 'Secular / no religious tradition', timing: 'No fixed timing', notes: 'Many secular families hold a memorial service, celebration of life, or no service at all. Some plan a memorial weeks or months later, often when extended family can travel. Funeral homes can guide on disposition (burial, cremation, alternatives like green burial or aquamation). The Funeral Consumers Alliance (a non-profit) is a useful resource for itemized pricing and consumer rights.' }
  ];

  return (
    <section style={{ background: T.bg }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8" style={{ paddingTop: 24, paddingBottom: 56 }}>
        <SectionHeading
          eyebrow="Religious and cultural traditions"
          title="A note on different traditions"
          desc="High-level patterns only. Each tradition has variation by family, community, and individual circumstance. For actual practice, the people who know your specific community (clergy, family elders, cultural organizations) are the right guides. The notes below focus on practical timing implications, since that's most actionable for grieving families."
        />
        <div style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: 0 }}>
          {traditions.map((t, i) => (
            <div key={i} style={{
              padding: 'clamp(16px, 2.5vw, 20px)',
              borderBottom: i < traditions.length - 1 ? `1px solid ${T.ruleLight}` : 'none'
            }}>
              <div className="flex items-baseline justify-between gap-3 flex-wrap mb-2">
                <h4 style={{
                  fontFamily: BODY_FONT, fontWeight: 700,
                  fontSize: 'clamp(14px, 1.8vw, 16px)',
                  color: T.ink, margin: 0, lineHeight: 1.3
                }}>
                  {t.name}
                </h4>
                <span style={{
                  fontFamily: MONO_FONT, fontSize: 11, fontWeight: 600,
                  letterSpacing: '0.05em', color: T.amber
                }}>
                  {t.timing.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: T.inkSoft, margin: 0 }}>
                {t.notes}
              </p>
            </div>
          ))}
        </div>
        <p style={{
          fontSize: 12, color: T.muted, fontStyle: 'italic', lineHeight: 1.5,
          marginTop: 16
        }}>
          Important: this is a general overview, not a guide to actual practice. Practices vary significantly within each tradition. Clergy, religious community leaders, and cultural organizations specific to your family's tradition are the right sources for any actual decisions.
        </p>
      </div>
    </section>
  );
}

function CalculatorCTA() {
  return (
    <section style={{ background: T.bg }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8" style={{ paddingTop: 32, paddingBottom: 24 }}>
        <div style={{
          background: T.ink, color: T.surface,
          padding: 'clamp(24px, 4vw, 36px)', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 240, height: 240,
            background: `radial-gradient(circle at top right, ${T.emerald}40, transparent 70%)`,
            opacity: 0.6, pointerEvents: 'none'
          }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3" style={{ color: '#9DD9B5' }}>
              <Sparkles size={12} strokeWidth={1.5} />
              <span style={{
                fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600
              }}>
                If you're inheriting assets
              </span>
            </div>
            <h3 style={{
              fontFamily: DISPLAY_FONT, fontWeight: 500,
              fontSize: 'clamp(22px, 3.5vw, 32px)',
              letterSpacing: '-0.01em', lineHeight: 1.05,
              color: T.surface, marginBottom: 14
            }}>
              The calculators can help you see how it changes your projection.
            </h3>
            <p style={{
              fontSize: 'clamp(13px, 1.5vw, 15px)',
              lineHeight: 1.55, color: '#C9C4BB', marginBottom: 20, maxWidth: 600
            }}>
              An inheritance changes the picture. The Net Worth and Retirement Readiness calculators can help you think about what it means for your own long-term plan, when you can retire, what your runway looks like, what tax implications matter. Worth running once the immediate logistics settle.
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

function CrossReferences() {
  return (
    <section style={{ background: T.bg }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8" style={{ paddingTop: 32, paddingBottom: 64 }}>
        <SectionHeading
          eyebrow="Different transition?"
          title="Other guides on this site"
          desc="If your situation is different, these guides may be more useful."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CrossRefCard label="Hub" title="Transitions" body="The starting point for all transitions guides on the site. If you'd rather see what else is here, the hub disambiguates." to="/transitions" />
          <CrossRefCard label="Available now" title="Just laid off" body="Involuntary work transitions. The first week after a layoff: severance, unemployment, COBRA, the immediate financial scaffolding." to="/just-laid-off" />
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
  if (disabled || !to) return card;
  return <Link to={to} style={{ textDecoration: 'none' }}>{card}</Link>;
}

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
            One more time, because it really matters
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: T.inkSoft, margin: 0, marginBottom: 10 }}>
            Everything on this page is general information meant to help you ask better questions during one of life's hardest transitions. It is not legal advice, financial advice, tax advice, grief counseling, or a substitute for professional guidance from someone who knows your specific circumstances.
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: T.inkSoft, margin: 0, marginBottom: 10 }}>
            For the legal and financial side, three professionals are worth their weight in gold: an estate attorney (for probate, executor duties, will or trust administration), a CPA familiar with estates (for the tax filings and inherited asset questions), and a fee-only fiduciary financial advisor (for the longer-term planning, especially for surviving spouses). Mistakes in any of these areas can have permanent consequences.
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: T.inkSoft, margin: 0 }}>
            For the emotional side, grief counselors, faith leaders, support groups, and trusted friends and family all matter. Grief doesn't follow a schedule, and what works for one person doesn't always work for another. If you find yourself struggling, talking to someone, anyone, often helps.
          </p>
        </div>
      </div>
    </section>
  );
}

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
            <Link to="/calculator" style={{ display: 'block', fontSize: 13, color: T.ink, textDecoration: 'none', marginBottom: 6 }}>Calculators</Link>
            <Link to="/transitions" style={{ display: 'block', fontSize: 13, color: T.ink, textDecoration: 'none', marginBottom: 6 }}>Transitions</Link>
            <Link to="/just-laid-off" style={{ display: 'block', fontSize: 13, color: T.ink, textDecoration: 'none', marginBottom: 6 }}>Just laid off</Link>
            <Link to="/leaving-on-your-terms" style={{ display: 'block', fontSize: 13, color: T.ink, textDecoration: 'none', marginBottom: 6 }}>Leaving on your terms</Link>
            <Link to="/loss" style={{ display: 'block', fontSize: 13, color: T.ink, textDecoration: 'none', marginBottom: 6 }}>After a loss</Link>
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
