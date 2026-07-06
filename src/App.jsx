import React, { useState, useEffect, useRef } from 'react'

/* ============================================================================
   MCCTI CoopEco - single-file application (src/App.jsx)
   Stage 1: Landing and brand
   Lagos State Ministry of Commerce, Cooperatives, Trade and Investment
   Deep forest-green and charcoal, restrained brass-gold, Fraunces serif,
   an official State register as the signature element.
   ==========================================================================*/

/* ---- Illustrative content (marketing teaser; live data arrives in Stage 3) ---- */

const AREA_LENS = [
  {
    id: 'state',
    label: 'State-wide',
    tag: 'All 21 area offices',
    coops: '13,000',
    members: '150,000+',
    active: '~15%',
    corridor: false,
  },
  {
    id: 'ikeja',
    label: 'Ikeja',
    tag: 'Headquarters, Alausa',
    coops: '2,140',
    members: '31,400',
    active: '31%',
    corridor: false,
  },
  {
    id: 'ikorodu',
    label: 'Ikorodu',
    tag: 'Underserved corridor',
    coops: '1,080',
    members: '12,600',
    active: '9%',
    corridor: true,
  },
  {
    id: 'epe',
    label: 'Epe',
    tag: 'Underserved corridor',
    coops: '640',
    members: '7,300',
    active: '6%',
    corridor: true,
  },
  {
    id: 'badagry',
    label: 'Badagry',
    tag: 'Underserved corridor',
    coops: '520',
    members: '5,900',
    active: '5%',
    corridor: true,
  },
  {
    id: 'ibeju',
    label: 'Ibeju-Lekki',
    tag: 'Underserved corridor',
    coops: '410',
    members: '4,700',
    active: '4%',
    corridor: true,
  },
]

const REGISTER = [
  { name: 'Ọmọlúàbí Traders Multipurpose Coop', office: 'Ikeja', id: 'LAG-CS-24-018842', status: 'Approved' },
  { name: 'Ìdẹra Market Women Cooperative Society', office: 'Mushin', id: 'LAG-CS-24-019110', status: 'Under review' },
  { name: 'Ajọ Ìṣọ̀kan Savings Coop', office: 'Ikorodu', id: 'LAG-CS-24-019204', status: 'Annual returns due' },
  { name: 'Eko Artisans Thrift and Credit Coop', office: 'Lagos Island', id: 'LAG-CS-24-019260', status: 'Approved' },
  { name: 'Badagry Fishers Multipurpose Coop', office: 'Badagry', id: 'LAG-CS-24-019318', status: 'KYC pending' },
  { name: 'Epe Farmers Produce Cooperative', office: 'Epe', id: 'LAG-CS-24-019377', status: 'Under review' },
  { name: 'Alaba Traders Investment Coop', office: 'Ojo', id: 'LAG-CS-24-019401', status: 'Approved' },
  { name: 'Ìlàjẹ Transport Owners Coop', office: 'Ibeju-Lekki', id: 'LAG-CS-24-019455', status: 'Registration filed' },
  { name: 'Ìdúmọ̀ta Textile Merchants Coop', office: 'Lagos Island', id: 'LAG-CS-24-019488', status: 'Annual returns due' },
  { name: 'Surulere Caterers and Vendors Coop', office: 'Surulere', id: 'LAG-CS-24-019512', status: 'Approved' },
]

const MODULES = [
  {
    n: '01',
    title: 'Cooperative Registry & Governance',
    lens: 'SEKAT layer',
    body:
      'Online registration with a tracking ID, by-laws and trustees, area-office assignment, annual returns and CAP15 supervision, with officer review and a timestamped audit trail on every action.',
    ai: false,
  },
  {
    n: '02',
    title: 'Member & MSME Analytics',
    lens: 'QooP layer',
    body:
      'Member onboarding and KYC, enterprise profiling across turnover, employment, sector and cash flow, and an AI credit score that sets a lending threshold and risk band.',
    ai: true,
  },
  {
    n: '03',
    title: 'LASMECO Financing',
    lens: 'Access to finance',
    body:
      'The seven-step journey from intent to disbursement. Loans up to ₦10,000,000 at 9% per annum, eligibility gated on cooperative membership and platform compliance, human approval at disbursement.',
    ai: false,
  },
  {
    n: '04',
    title: 'Digital Wallet & Payments',
    lens: 'No-cash by design',
    body:
      'Member savings and contributions, esusu and ajo cycles digitised, transfers, withdrawals and escrow, settled through Paystack and Flutterwave. Every flow traceable, no cash handling.',
    ai: false,
  },
  {
    n: '05',
    title: 'Marketplace & Directory',
    lens: 'Commerce and search',
    body:
      'A searchable cooperative directory with premium listings and a coop-merchant marketplace, opening government-linked commerce to societies across all 57 LGAs and LCDAs.',
    ai: false,
  },
  {
    n: '06',
    title: 'Governance Intelligence',
    lens: 'For leadership',
    body:
      'Real-time dashboards for the Director, Permanent Secretary, Honourable Commissioner and Governor\u2019s office. Cooperative activity, loan performance, MSME health per LGA and fraud alerts.',
    ai: true,
  },
]

const ROLES = [
  { id: 'society', title: 'Cooperative Society', desc: 'Register, file returns, manage members and contributions.' },
  { id: 'member', title: 'Member / MSME', desc: 'Onboard, get profiled and scored, save and apply for LASMECO.' },
  { id: 'officer', title: 'Cooperative Officer', desc: 'Review, audit and approve across the 21 area offices.' },
  { id: 'auditor', title: 'Auditor', desc: 'Examine financial returns and sign off on the audit trail.' },
  { id: 'partner', title: 'Financial Partner', desc: 'Disbursement, escrow and wallet infrastructure.' },
  { id: 'leadership', title: 'Leadership / Admin', desc: 'Real-time oversight of the cooperative economy.' },
]

const PERSONAS = [
  ['Cooperative societies', 'One registration, one record, one audit trail.'],
  ['Members and MSMEs', 'A profile, a score, and a route to finance.'],
  ['Cooperative officers', 'Every society across 21 offices, in view.'],
  ['Auditors', 'Returns examined, sign-off recorded.'],
  ['State leadership', 'The cooperative economy, in real time.'],
]

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(m.matches)
    on()
    m.addEventListener?.('change', on)
    return () => m.removeEventListener?.('change', on)
  }, [])
  return reduced
}

/* ---- Live register signature panel ---- */
function LiveRegister({ areaId }) {
  const reduced = usePrefersReducedMotion()
  const pool = areaId === 'state'
    ? REGISTER
    : REGISTER.filter((r) =>
        r.office.toLowerCase().includes(
          (AREA_LENS.find((a) => a.id === areaId)?.label || '').toLowerCase().split('-')[0]
        )
      )
  const rows = (pool.length ? pool : REGISTER)
  const [start, setStart] = useState(0)

  useEffect(() => {
    if (reduced) return
    const t = setInterval(() => setStart((s) => (s + 1) % rows.length), 3200)
    return () => clearInterval(t)
  }, [rows.length, reduced])

  const visible = Array.from({ length: Math.min(4, rows.length) }, (_, i) => rows[(start + i) % rows.length])

  return (
    <aside className="register" aria-label="Live cooperative register (illustrative)">
      <div className="register-head">
        <span className="reg-crest" aria-hidden="true">◆</span>
        <div>
          <p className="reg-title">Cooperative Register</p>
          <p className="reg-sub">Ministry of Commerce, Cooperatives, Trade &amp; Investment</p>
        </div>
        <span className="reg-live">Live</span>
      </div>
      <div className="register-rows">
        {visible.map((r, i) => (
          <div className={'reg-row' + (i === 0 ? ' is-new' : '')} key={r.id + i}>
            <div className="reg-row-main">
              <span className="reg-name">{r.name}</span>
              <span className="reg-office">{r.office} area office</span>
            </div>
            <div className="reg-row-meta">
              <span className="reg-id">{r.id}</span>
              <span className={'reg-status s-' + r.status.split(' ')[0].toLowerCase()}>{r.status}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="register-foot">
        <span>Instructions rotate as societies register</span>
        <span className="reg-stamp">Teaser view</span>
      </div>
    </aside>
  )
}

function RoleModal({ open, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    ref.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="modal-scrim" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Which best describes you?"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        ref={ref}
      >
        <div className="modal-head">
          <p className="eyebrow">Enter the platform</p>
          <h2>Which best describes you?</h2>
          <button className="modal-x" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="role-grid">
          {ROLES.map((r) => (
            <button className="role-card" key={r.id}>
              <span className="role-title">{r.title}</span>
              <span className="role-desc">{r.desc}</span>
              <span className="role-go">Continue →</span>
            </button>
          ))}
        </div>
        <p className="modal-note">
          Sign-in and per-official identity arrive in Stage 2. This picker previews the role-aware entry flow.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const [area, setArea] = useState('state')
  const [modal, setModal] = useState(false)
  const current = AREA_LENS.find((a) => a.id === area) || AREA_LENS[0]

  return (
    <div className="page">
      <style>{CSS}</style>

      {/* NAV */}
      <header className="nav">
        <a className="brand" href="#top">
          <span className="brand-mark" aria-hidden="true">◆</span>
          <span className="brand-name">MCCTI <em>CoopEco</em></span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#modules">Modules</a>
          <a href="#arc">The platform</a>
          <a href="#intelligence">Intelligence</a>
        </nav>
        <button className="btn btn-gold nav-cta" onClick={() => setModal(true)}>Enter platform</button>
      </header>

      {/* HERO */}
      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Lagos State &middot; Ministry of Commerce, Cooperatives, Trade &amp; Investment</p>
            <h1>
              One State.<br />One cooperative economy.<br /><span className="underline">One system.</span>
            </h1>
            <p className="lead">
              13,000 registered cooperatives and 150,000+ members sit across two separate systems and a
              credit programme that cannot see them. MCCTI CoopEco consolidates the registry, member
              analytics, LASMECO financing, wallets and governance intelligence into a single,
              Ministry-owned platform.
            </p>
            <div className="hero-cta">
              <button className="btn btn-gold" onClick={() => setModal(true)}>Which best describes you?</button>
              <a className="btn btn-ghost" href="#modules">See the modules</a>
            </div>
            <p className="hero-foot">
              Ministry-owned &middot; SPV-operated &middot; self-funding from Year 1
            </p>
          </div>
          <LiveRegister areaId={area} />
        </section>

        {/* STAT BAND */}
        <section className="band" aria-label="Headline figures">
          <div className="band-item">
            <span className="band-fig">13,000</span>
            <span className="band-lab">Registered cooperatives</span>
          </div>
          <div className="band-item">
            <span className="band-fig">150,000+</span>
            <span className="band-lab">MSME members</span>
          </div>
          <div className="band-item">
            <span className="band-fig">97%</span>
            <span className="band-lab">MSMEs currently informal</span>
          </div>
          <div className="band-item">
            <span className="band-fig">8</span>
            <span className="band-lab">Platform revenue streams</span>
          </div>
          <div className="band-item">
            <span className="band-fig">₦655M<span className="band-arrow"> → </span>₦1B+</span>
            <span className="band-lab">Year 1 to Year 3</span>
          </div>
        </section>

        {/* AREA LENS */}
        <section className="lens" id="lens">
          <div className="section-head">
            <p className="eyebrow">Area office lens</p>
            <h2>See the cooperative economy, office by office</h2>
            <p className="section-sub">
              Switch between a State-wide view and any of the 21 cooperative area offices. The underserved
              Ikorodu, Epe, Badagry and Ibeju-Lekki corridors are where formalisation has furthest to travel.
            </p>
          </div>
          <div className="lens-tabs" role="tablist" aria-label="Area office">
            {AREA_LENS.map((a) => (
              <button
                key={a.id}
                role="tab"
                aria-selected={area === a.id}
                className={'lens-tab' + (area === a.id ? ' is-on' : '') + (a.corridor ? ' is-corridor' : '')}
                onClick={() => setArea(a.id)}
              >
                {a.label}
              </button>
            ))}
          </div>
          <div className="lens-readout">
            <div className="lens-tag">
              {current.corridor && <span className="corridor-flag">Priority corridor</span>}
              <span className="lens-tag-text">{current.label} &middot; {current.tag}</span>
            </div>
            <div className="lens-figs">
              <div><span className="lf-fig">{current.coops}</span><span className="lf-lab">Cooperatives</span></div>
              <div><span className="lf-fig">{current.members}</span><span className="lf-lab">Members</span></div>
              <div><span className="lf-fig">{current.active}</span><span className="lf-lab">Digitally active</span></div>
            </div>
          </div>
        </section>

        {/* MODULES */}
        <section className="modules" id="modules">
          <div className="section-head">
            <p className="eyebrow">Six modules, one platform</p>
            <h2>Everything the cooperative economy runs on</h2>
          </div>
          <div className="mod-grid">
            {MODULES.map((m) => (
              <article className="mod-card" key={m.n}>
                <div className="mod-top">
                  <span className="mod-n">{m.n}</span>
                  <span className="mod-lens">{m.lens}</span>
                </div>
                <h3>{m.title}</h3>
                <p>{m.body}</p>
                {m.ai && <span className="mod-ai">Summarised by MCCTI CoopEco</span>}
              </article>
            ))}
          </div>
        </section>

        {/* ARC: real sequence */}
        <section className="arc" id="arc">
          <div className="section-head">
            <p className="eyebrow">From fragmentation to ₦1 billion</p>
            <h2>How the platform changes the arithmetic</h2>
          </div>
          <div className="arc-steps">
            <div className="arc-step">
              <span className="arc-n">01</span>
              <h4>The problem: fragmentation</h4>
              <p>
                The registry, the analytics layer and LASMECO operate in isolation. Data is duplicated,
                revenue is uncollected, fraud goes undetected, and Government cannot see its own economy.
              </p>
            </div>
            <div className="arc-arrow" aria-hidden="true">→</div>
            <div className="arc-step">
              <span className="arc-n">02</span>
              <h4>The solution: one unified platform</h4>
              <p>
                Registry, KYC, analytics, wallets, disbursement and dashboards in a single Ministry-owned
                system. KYC at onboarding, timestamped trails, escrow flows, finance as the reward for compliance.
              </p>
            </div>
            <div className="arc-arrow" aria-hidden="true">→</div>
            <div className="arc-step">
              <span className="arc-n">03</span>
              <h4>The return: self-funding IGR</h4>
              <p>
                Eight revenue streams generate ₦655M in Year 1 and cross ₦1 billion by Year 3, at zero capital
                cost to the State, with full ownership retained by the Ministry.
              </p>
            </div>
          </div>
        </section>

        {/* PERSONAS */}
        <section className="personas" id="intelligence">
          <div className="section-head">
            <p className="eyebrow">Role-aware from the first screen</p>
            <h2>Built for everyone who touches a cooperative</h2>
          </div>
          <div className="persona-grid">
            {PERSONAS.map(([t, d]) => (
              <div className="persona" key={t}>
                <span className="persona-t">{t}</span>
                <span className="persona-d">{d}</span>
              </div>
            ))}
          </div>
        </section>

        {/* QUOTE */}
        <section className="quote">
          <blockquote>
            <p>
              &ldquo;This engagement marks a fundamental reset of the cooperative digitalisation agenda in
              Lagos State: one registry, one member record, one governance framework, owned by the Ministry.&rdquo;
            </p>
            <cite>Directorate of Cooperative Services, MCCTI</cite>
          </blockquote>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="foot">
        <div className="foot-top">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">◆</span>
            <span className="brand-name">MCCTI <em>CoopEco</em></span>
          </div>
          <button className="btn btn-gold" onClick={() => setModal(true)}>Enter platform</button>
        </div>
        <div className="foot-grid">
          <p>
            A Ministry-owned digital platform, operated through a Public-Private Partnership and Special
            Purpose Vehicle. Revenue split: Lagos State 50%, Asset Matrix MFB 15%, Imade / Catridge 15%,
            QooP 10%, SEKAT 10%. Subject to final SPV agreement.
          </p>
          <p className="foot-conf">
            Confidential &middot; For the Ministry of Commerce, Cooperatives, Trade &amp; Investment,
            Lagos State Government. Figures on this page are illustrative pending live data.
          </p>
        </div>
      </footer>

      <RoleModal open={modal} onClose={() => setModal(false)} />
    </div>
  )
}

/* ============================== STYLES ================================== */
const CSS = `
:root{
  --ink:#0C1712; --ink-2:#0F1D17; --green:#123A2D; --green-panel:#153F33;
  --line:rgba(198,161,91,.16); --line-soft:rgba(233,226,210,.10);
  --gold:#C6A15B; --gold-soft:#DcC08a; --cream:#F3EEE1; --cream-ink:#182019;
  --sage:#AbC1B4; --sage-dim:#6E877B;
  --serif:'Fraunces',Georgia,'Times New Roman',serif;
  --sans:'Inter',system-ui,-apple-system,sans-serif;
  --mono:'IBM Plex Mono',ui-monospace,monospace;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0}
.page{
  background:
    radial-gradient(1200px 600px at 80% -10%, rgba(21,63,51,.55), transparent 60%),
    radial-gradient(900px 500px at -5% 20%, rgba(198,161,91,.06), transparent 55%),
    var(--ink);
  color:var(--sage); font-family:var(--sans);
  -webkit-font-smoothing:antialiased; min-height:100vh; overflow-x:hidden;
}
.eyebrow{
  font-family:var(--mono); font-size:11px; letter-spacing:.22em; text-transform:uppercase;
  color:var(--gold); margin:0 0 14px;
}
h1,h2,h3,h4{font-family:var(--serif); color:var(--cream); font-weight:500; margin:0}
p{margin:0}

/* buttons */
.btn{
  font-family:var(--sans); font-size:14px; font-weight:600; border:none; cursor:pointer;
  padding:13px 22px; border-radius:2px; text-decoration:none; display:inline-block;
  transition:transform .18s ease, background .18s ease, color .18s ease, border-color .18s ease;
}
.btn-gold{background:var(--gold); color:#20180A}
.btn-gold:hover{background:var(--gold-soft); transform:translateY(-1px)}
.btn-ghost{background:transparent; color:var(--cream); border:1px solid var(--line)}
.btn-ghost:hover{border-color:var(--gold); color:var(--gold-soft)}

/* nav */
.nav{
  position:sticky; top:0; z-index:40; display:flex; align-items:center; justify-content:space-between;
  padding:16px 40px; background:rgba(12,23,18,.78); backdrop-filter:blur(10px);
  border-bottom:1px solid var(--line-soft);
}
.brand{display:flex; align-items:center; gap:10px; text-decoration:none}
.brand-mark{color:var(--gold); font-size:14px}
.brand-name{font-family:var(--serif); color:var(--cream); font-size:19px; letter-spacing:.01em}
.brand-name em{color:var(--gold-soft); font-style:italic}
.nav-links{display:flex; gap:30px}
.nav-links a{color:var(--sage); text-decoration:none; font-size:14px; font-weight:500}
.nav-links a:hover{color:var(--gold-soft)}
.nav-cta{padding:10px 18px}

/* hero */
.hero{
  max-width:1200px; margin:0 auto; padding:84px 40px 40px;
  display:grid; grid-template-columns:1.05fr .95fr; gap:56px; align-items:center;
}
.hero-copy{animation:rise .7s ease both}
h1{font-size:clamp(38px,5vw,66px); line-height:1.04; letter-spacing:-.015em; margin-bottom:22px}
.underline{position:relative; white-space:nowrap}
.underline::after{
  content:''; position:absolute; left:0; bottom:.08em; height:.09em; width:100%;
  background:var(--gold); transform:scaleX(0); transform-origin:left;
  animation:draw 1s .5s ease forwards;
}
.lead{font-size:17px; line-height:1.65; color:var(--sage); max-width:36em; margin-bottom:30px}
.hero-cta{display:flex; gap:14px; flex-wrap:wrap; margin-bottom:22px}
.hero-foot{font-family:var(--mono); font-size:12px; letter-spacing:.06em; color:var(--sage-dim)}

/* register signature */
.register{
  background:linear-gradient(180deg, var(--green-panel), #103028);
  border:1px solid var(--line); border-radius:4px; overflow:hidden;
  box-shadow:0 30px 60px -30px rgba(0,0,0,.6); animation:rise .7s .1s ease both;
}
.register-head{
  display:flex; align-items:center; gap:12px; padding:16px 20px;
  border-bottom:1px solid var(--line); background:rgba(0,0,0,.14);
}
.reg-crest{color:var(--gold); font-size:16px}
.reg-title{font-family:var(--serif); color:var(--cream); font-size:16px}
.reg-sub{font-size:11px; color:var(--sage-dim); margin-top:2px}
.reg-live{
  margin-left:auto; font-family:var(--mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase;
  color:var(--gold); border:1px solid var(--line); padding:4px 9px; border-radius:2px; position:relative;
}
.reg-live::before{
  content:''; display:inline-block; width:6px; height:6px; border-radius:50%; background:var(--gold);
  margin-right:6px; vertical-align:middle; animation:pulse 1.8s ease-in-out infinite;
}
.register-rows{padding:6px 8px; filter:blur(.4px)}
.reg-row{
  display:flex; align-items:center; justify-content:space-between; gap:16px;
  padding:14px 12px; border-bottom:1px solid var(--line-soft);
}
.reg-row:last-child{border-bottom:none}
.reg-row.is-new{animation:fadeIn .6s ease both}
.reg-row-main{display:flex; flex-direction:column; gap:3px; min-width:0}
.reg-name{color:var(--cream); font-size:14px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:16em}
.reg-office{font-size:11px; color:var(--sage-dim)}
.reg-row-meta{display:flex; flex-direction:column; align-items:flex-end; gap:5px; flex-shrink:0}
.reg-id{font-family:var(--mono); font-size:11px; color:var(--gold-soft); letter-spacing:.02em}
.reg-status{font-size:10px; padding:3px 8px; border-radius:2px; letter-spacing:.03em; white-space:nowrap}
.s-approved{background:rgba(198,161,91,.14); color:var(--gold-soft)}
.s-under{background:rgba(171,193,180,.12); color:var(--sage)}
.s-annual{background:rgba(171,193,180,.10); color:var(--sage-dim)}
.s-kyc{background:rgba(171,193,180,.10); color:var(--sage-dim)}
.s-registration{background:rgba(171,193,180,.12); color:var(--sage)}
.register-foot{
  display:flex; justify-content:space-between; align-items:center; padding:12px 20px;
  border-top:1px solid var(--line); font-size:11px; color:var(--sage-dim);
}
.reg-stamp{
  font-family:var(--mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase;
  color:var(--gold); border:1px dashed var(--line); padding:3px 8px; transform:rotate(-1.5deg);
}

/* stat band */
.band{
  max-width:1200px; margin:26px auto 0; padding:26px 40px;
  display:flex; flex-wrap:wrap; gap:14px 40px; justify-content:space-between;
  border-top:1px solid var(--line-soft); border-bottom:1px solid var(--line-soft);
}
.band-item{display:flex; flex-direction:column; gap:5px}
.band-fig{font-family:var(--serif); color:var(--cream); font-size:26px; font-weight:600}
.band-arrow{color:var(--gold)}
.band-lab{font-family:var(--mono); font-size:11px; letter-spacing:.08em; color:var(--sage-dim); text-transform:uppercase}

/* section shell */
section.lens,section.modules,section.arc,section.personas,section.quote{
  max-width:1200px; margin:0 auto; padding:86px 40px;
}
.section-head{max-width:44em; margin-bottom:44px}
.section-head h2{font-size:clamp(26px,3.4vw,40px); line-height:1.12; letter-spacing:-.01em; margin-top:4px}
.section-sub{margin-top:16px; font-size:16px; line-height:1.6; color:var(--sage)}

/* lens */
.lens-tabs{display:flex; flex-wrap:wrap; gap:10px; margin-bottom:28px}
.lens-tab{
  font-family:var(--sans); font-size:13px; font-weight:600; color:var(--sage);
  background:transparent; border:1px solid var(--line-soft); border-radius:2px;
  padding:10px 16px; cursor:pointer; transition:all .16s ease;
}
.lens-tab:hover{border-color:var(--gold); color:var(--gold-soft)}
.lens-tab.is-on{background:var(--gold); color:#20180A; border-color:var(--gold)}
.lens-tab.is-corridor:not(.is-on){border-style:dashed}
.lens-readout{
  display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:24px;
  padding:30px 34px; background:linear-gradient(180deg, var(--green-panel), #0F2A22);
  border:1px solid var(--line); border-radius:4px;
}
.lens-tag{display:flex; align-items:center; gap:12px; flex-wrap:wrap}
.corridor-flag{
  font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase;
  color:var(--gold); border:1px solid var(--line); padding:4px 9px; border-radius:2px;
}
.lens-tag-text{font-family:var(--serif); color:var(--cream); font-size:20px}
.lens-figs{display:flex; gap:40px}
.lens-figs>div{display:flex; flex-direction:column; gap:4px}
.lf-fig{font-family:var(--serif); color:var(--cream); font-size:28px; font-weight:600}
.lf-lab{font-family:var(--mono); font-size:11px; letter-spacing:.07em; color:var(--sage-dim); text-transform:uppercase}

/* modules */
.mod-grid{display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--line-soft); border:1px solid var(--line-soft)}
.mod-card{
  background:var(--ink-2); padding:34px 30px 30px; display:flex; flex-direction:column; gap:12px;
  transition:background .2s ease, transform .2s ease;
}
.mod-card:hover{background:#122a22; transform:translateY(-2px)}
.mod-top{display:flex; align-items:center; justify-content:space-between}
.mod-n{font-family:var(--mono); font-size:12px; color:var(--gold); letter-spacing:.1em}
.mod-lens{font-family:var(--mono); font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--sage-dim)}
.mod-card h3{font-size:20px; line-height:1.2}
.mod-card p{font-size:14px; line-height:1.62; color:var(--sage)}
.mod-ai{
  margin-top:auto; font-family:var(--mono); font-size:10px; letter-spacing:.08em; text-transform:uppercase;
  color:var(--gold-soft); border-top:1px solid var(--line); padding-top:12px;
}

/* arc */
.arc-steps{display:grid; grid-template-columns:1fr auto 1fr auto 1fr; align-items:stretch; gap:18px}
.arc-step{
  background:var(--ink-2); border:1px solid var(--line-soft); border-radius:4px; padding:30px 26px;
  display:flex; flex-direction:column; gap:12px;
}
.arc-step:nth-child(3){border-color:var(--line)}
.arc-n{font-family:var(--mono); font-size:13px; color:var(--gold); letter-spacing:.1em}
.arc-step h4{font-size:19px; line-height:1.2}
.arc-step p{font-size:14px; line-height:1.6; color:var(--sage)}
.arc-arrow{display:flex; align-items:center; color:var(--gold); font-size:22px}

/* personas */
.persona-grid{display:grid; grid-template-columns:repeat(5,1fr); gap:1px; background:var(--line-soft); border:1px solid var(--line-soft)}
.persona{background:var(--ink-2); padding:26px 22px; display:flex; flex-direction:column; gap:10px; min-height:130px}
.persona-t{font-family:var(--serif); color:var(--cream); font-size:16px}
.persona-d{font-size:13px; line-height:1.5; color:var(--sage-dim)}

/* quote */
.quote{text-align:center}
.quote blockquote{margin:0; max-width:40em; margin-inline:auto}
.quote p{font-family:var(--serif); color:var(--cream); font-size:clamp(22px,2.8vw,32px); line-height:1.4; font-weight:400}
.quote cite{display:block; margin-top:22px; font-family:var(--mono); font-size:12px; letter-spacing:.1em; text-transform:uppercase; color:var(--gold); font-style:normal}

/* footer */
.foot{border-top:1px solid var(--line-soft); background:var(--ink-2)}
.foot-top{
  max-width:1200px; margin:0 auto; padding:34px 40px; display:flex; align-items:center;
  justify-content:space-between; border-bottom:1px solid var(--line-soft);
}
.foot-grid{max-width:1200px; margin:0 auto; padding:28px 40px 46px; display:grid; grid-template-columns:1.4fr 1fr; gap:30px}
.foot-grid p{font-size:13px; line-height:1.6; color:var(--sage-dim)}
.foot-conf{font-family:var(--mono); font-size:11px; letter-spacing:.04em}

/* modal */
.modal-scrim{
  position:fixed; inset:0; z-index:60; background:rgba(6,12,9,.72); backdrop-filter:blur(4px);
  display:flex; align-items:center; justify-content:center; padding:24px; animation:fadeIn .2s ease;
}
.modal{
  width:min(760px,100%); max-height:90vh; overflow:auto; background:var(--ink-2);
  border:1px solid var(--line); border-radius:6px; padding:34px; position:relative; outline:none;
}
.modal-head{margin-bottom:24px; position:relative}
.modal-head h2{font-size:28px; margin-top:4px}
.modal-x{
  position:absolute; top:-6px; right:-6px; background:transparent; border:none; color:var(--sage);
  font-size:28px; cursor:pointer; line-height:1; padding:6px;
}
.modal-x:hover{color:var(--gold)}
.role-grid{display:grid; grid-template-columns:repeat(2,1fr); gap:12px}
.role-card{
  text-align:left; background:var(--ink); border:1px solid var(--line-soft); border-radius:4px;
  padding:20px; cursor:pointer; display:flex; flex-direction:column; gap:6px; transition:all .16s ease;
}
.role-card:hover{border-color:var(--gold); transform:translateY(-2px)}
.role-title{font-family:var(--serif); color:var(--cream); font-size:17px}
.role-desc{font-size:13px; line-height:1.5; color:var(--sage-dim)}
.role-go{font-family:var(--mono); font-size:11px; letter-spacing:.06em; color:var(--gold); margin-top:6px}
.modal-note{margin-top:20px; font-size:12px; color:var(--sage-dim); line-height:1.5}

/* motion */
@keyframes rise{from{opacity:0; transform:translateY(16px)}to{opacity:1; transform:none}}
@keyframes draw{to{transform:scaleX(1)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}

/* responsive */
@media(max-width:960px){
  .hero{grid-template-columns:1fr; padding-top:56px}
  .mod-grid{grid-template-columns:1fr 1fr}
  .persona-grid{grid-template-columns:1fr 1fr}
  .arc-steps{grid-template-columns:1fr}
  .arc-arrow{transform:rotate(90deg); justify-content:center; padding:2px 0}
  .foot-grid{grid-template-columns:1fr}
}
@media(max-width:680px){
  .nav{padding:14px 20px}
  .nav-links{display:none}
  .hero{padding:44px 20px 30px}
  section.lens,section.modules,section.arc,section.personas,section.quote{padding:56px 20px}
  .band{padding:22px 20px; gap:18px 26px}
  .mod-grid,.persona-grid{grid-template-columns:1fr}
  .lens-figs{gap:26px}
  .role-grid{grid-template-columns:1fr}
  .foot-top,.foot-grid{padding-left:20px; padding-right:20px}
}
@media(prefers-reduced-motion:reduce){
  *{animation:none !important; transition:none !important}
  .underline::after{transform:scaleX(1)}
}
`
