import React, { useState, useEffect, useRef } from 'react'

/* ============================================================================
   MCCTI CoopEco - single-file application (src/App.jsx)
   Stage 1: Landing and brand  (upscaled, Lora, official Lagos State / MCCTI marks)
   Lagos State Ministry of Commerce, Cooperatives, Trade and Investment
   ==========================================================================*/

const AREA_LENS = [
  { id: 'state', label: 'State-wide', tag: 'All 21 area offices', coops: '13,000', members: '150,000+', active: '~15%', corridor: false },
  { id: 'ikeja', label: 'Ikeja', tag: 'Headquarters, Alausa', coops: '2,140', members: '31,400', active: '31%', corridor: false },
  { id: 'ikorodu', label: 'Ikorodu', tag: 'Priority corridor', coops: '1,080', members: '12,600', active: '9%', corridor: true },
  { id: 'epe', label: 'Epe', tag: 'Priority corridor', coops: '640', members: '7,300', active: '6%', corridor: true },
  { id: 'badagry', label: 'Badagry', tag: 'Priority corridor', coops: '520', members: '5,900', active: '5%', corridor: true },
  { id: 'ibeju', label: 'Ibeju-Lekki', tag: 'Priority corridor', coops: '410', members: '4,700', active: '4%', corridor: true },
]

const REGISTER = [
  { name: 'Omoluabi Traders Multipurpose Coop', office: 'Ikeja', id: 'LAG-CS-24-018842', status: 'Approved' },
  { name: 'Idera Market Women Cooperative Society', office: 'Mushin', id: 'LAG-CS-24-019110', status: 'Under review' },
  { name: 'Ajo Isokan Savings Coop', office: 'Ikorodu', id: 'LAG-CS-24-019204', status: 'Annual returns due' },
  { name: 'Eko Artisans Thrift and Credit Coop', office: 'Lagos Island', id: 'LAG-CS-24-019260', status: 'Approved' },
  { name: 'Badagry Fishers Multipurpose Coop', office: 'Badagry', id: 'LAG-CS-24-019318', status: 'KYC pending' },
  { name: 'Epe Farmers Produce Cooperative', office: 'Epe', id: 'LAG-CS-24-019377', status: 'Under review' },
  { name: 'Alaba Traders Investment Coop', office: 'Ojo', id: 'LAG-CS-24-019401', status: 'Approved' },
  { name: 'Ilaje Transport Owners Coop', office: 'Ibeju-Lekki', id: 'LAG-CS-24-019455', status: 'Registration filed' },
  { name: 'Idumota Textile Merchants Coop', office: 'Lagos Island', id: 'LAG-CS-24-019488', status: 'Annual returns due' },
  { name: 'Surulere Caterers and Vendors Coop', office: 'Surulere', id: 'LAG-CS-24-019512', status: 'Approved' },
]

const MODULES = [
  { n: '01', title: 'Cooperative Registry & Governance', lens: 'SEKAT layer', ai: false,
    body: 'Online registration with a tracking ID, by-laws and trustees, area-office assignment, annual returns and CAP15 supervision, with officer review and a timestamped audit trail on every action.' },
  { n: '02', title: 'Member & MSME Analytics', lens: 'QooP layer', ai: true,
    body: 'Member onboarding and KYC, enterprise profiling across turnover, employment, sector and cash flow, and an AI credit score that sets a lending threshold and risk band.' },
  { n: '03', title: 'LASMECO Financing', lens: 'Access to finance', ai: false,
    body: 'The seven-step journey from intent to disbursement. Loans up to \u20A610,000,000 at 9% per annum, eligibility gated on cooperative membership and platform compliance, human approval at disbursement.' },
  { n: '04', title: 'Digital Wallet & Payments', lens: 'No-cash by design', ai: false,
    body: 'Member savings and contributions, esusu and ajo cycles digitised, transfers, withdrawals and escrow, settled through Paystack and Flutterwave. Every flow traceable, no cash handling.' },
  { n: '05', title: 'Marketplace & Directory', lens: 'Commerce and search', ai: false,
    body: 'A searchable cooperative directory with premium listings and a coop-merchant marketplace, opening government-linked commerce to societies across all 57 LGAs and LCDAs.' },
  { n: '06', title: 'Governance Intelligence', lens: 'For leadership', ai: true,
    body: 'Real-time dashboards for the Director, Permanent Secretary, Honourable Commissioner and Governor\u2019s office. Cooperative activity, loan performance, MSME health per LGA and fraud alerts.' },
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
    const on = () => setReduced(m.matches); on()
    m.addEventListener?.('change', on)
    return () => m.removeEventListener?.('change', on)
  }, [])
  return reduced
}

function LiveRegister({ areaId }) {
  const reduced = usePrefersReducedMotion()
  const label = (AREA_LENS.find((a) => a.id === areaId)?.label || '').toLowerCase().split('-')[0]
  const pool = areaId === 'state' ? REGISTER : REGISTER.filter((r) => r.office.toLowerCase().includes(label))
  const rows = pool.length ? pool : REGISTER
  const [start, setStart] = useState(0)
  useEffect(() => {
    if (reduced) return
    const t = setInterval(() => setStart((s) => (s + 1) % rows.length), 3200)
    return () => clearInterval(t)
  }, [rows.length, reduced])
  const visible = Array.from({ length: Math.min(4, rows.length) }, (_, i) => rows[(start + i) % rows.length])

  return (
    <aside className="register" aria-label="Live cooperative register (illustrative)">
      <div className="register-frame">
        <div className="register-head">
          <img className="reg-seal" src="/lagos-seal.png" alt="" aria-hidden="true" />
          <div>
            <p className="reg-title">Cooperative Register</p>
            <p className="reg-sub">Directorate of Cooperative Services</p>
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
      </div>
    </aside>
  )
}

function RoleModal({ open, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey); ref.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="modal-scrim" onClick={onClose} role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-label="Which best describes you?"
        onClick={(e) => e.stopPropagation()} tabIndex={-1} ref={ref}>
        <div className="modal-head">
          <p className="eyebrow">Enter the platform</p>
          <h2>Which best describes you?</h2>
          <button className="modal-x" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <div className="role-grid">
          {ROLES.map((r) => (
            <button className="role-card" key={r.id}>
              <span className="role-title">{r.title}</span>
              <span className="role-desc">{r.desc}</span>
              <span className="role-go">Continue &rarr;</span>
            </button>
          ))}
        </div>
        <p className="modal-note">Sign-in and per-official identity arrive in Stage 2. This picker previews the role-aware entry flow.</p>
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

      {/* LETTERHEAD */}
      <div className="letterhead">
        <div className="lh-left">
          <img className="lh-seal" src="/lagos-seal.png" alt="Lagos State coat of arms" />
          <div className="lh-text">
            <span className="lh-gov">Lagos State Government</span>
            <span className="lh-min">Ministry of Commerce, Cooperatives, Trade &amp; Investment</span>
          </div>
        </div>
        <img className="lh-mccti" src="/mccti-logo.png" alt="MCCTI" />
      </div>

      {/* NAV */}
      <header className="nav">
        <a className="brand" href="#top">
          <span className="brand-mark" aria-hidden="true">&#9670;</span>
          <span className="brand-name">MCCTI <em>CoopEco</em></span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#modules">Modules</a>
          <a href="#arc">The platform</a>
          <a href="#intelligence">Intelligence</a>
        </nav>
        <button className="btn btn-gold nav-cta" onClick={() => setModal(true)}>Enter platform</button>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="hero">
          <img className="hero-watermark" src="/seal-watermark.png" alt="" aria-hidden="true" />
          <div className="hero-copy">
            <p className="eyebrow"><span className="eb-dot" />Lagos State &middot; A core economic governance reform</p>
            <h1>One State.<br />One cooperative economy.<br /><span className="underline">One system.</span></h1>
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
            <p className="hero-foot">Ministry-owned &middot; SPV-operated &middot; self-funding from Year 1</p>
          </div>
          <LiveRegister areaId={area} />
        </section>

        {/* STAT BAND */}
        <section className="band" aria-label="Headline figures">
          {[['13,000','Registered cooperatives'],['150,000+','MSME members'],['97%','MSMEs currently informal'],['8','Platform revenue streams']].map(([f,l])=>(
            <div className="band-item" key={l}><span className="band-fig">{f}</span><span className="band-lab">{l}</span></div>
          ))}
          <div className="band-item"><span className="band-fig">&#8358;655M<span className="band-arrow"> &rarr; </span>&#8358;1B+</span><span className="band-lab">Year 1 to Year 3</span></div>
        </section>

        {/* AREA LENS */}
        <section className="lens" id="lens">
          <div className="section-head">
            <p className="eyebrow">Area office lens</p>
            <h2>See the cooperative economy, office by office</h2>
            <p className="section-sub">Switch between a State-wide view and any of the 21 cooperative area offices. The underserved Ikorodu, Epe, Badagry and Ibeju-Lekki corridors are where formalisation has furthest to travel.</p>
          </div>
          <div className="lens-tabs" role="tablist" aria-label="Area office">
            {AREA_LENS.map((a) => (
              <button key={a.id} role="tab" aria-selected={area === a.id}
                className={'lens-tab' + (area === a.id ? ' is-on' : '') + (a.corridor ? ' is-corridor' : '')}
                onClick={() => setArea(a.id)}>{a.label}</button>
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
                <div className="mod-top"><span className="mod-n">{m.n}</span><span className="mod-lens">{m.lens}</span></div>
                <h3>{m.title}</h3>
                <p>{m.body}</p>
                {m.ai && <span className="mod-ai">Summarised by MCCTI CoopEco</span>}
              </article>
            ))}
          </div>
        </section>

        {/* ARC */}
        <section className="arc" id="arc">
          <div className="section-head">
            <p className="eyebrow">From fragmentation to &#8358;1 billion</p>
            <h2>How the platform changes the arithmetic</h2>
          </div>
          <div className="arc-steps">
            <div className="arc-step">
              <span className="arc-n">01</span><h4>The problem: fragmentation</h4>
              <p>The registry, the analytics layer and LASMECO operate in isolation. Data is duplicated, revenue is uncollected, fraud goes undetected, and Government cannot see its own economy.</p>
            </div>
            <div className="arc-arrow" aria-hidden="true">&rarr;</div>
            <div className="arc-step">
              <span className="arc-n">02</span><h4>The solution: one unified platform</h4>
              <p>Registry, KYC, analytics, wallets, disbursement and dashboards in a single Ministry-owned system. KYC at onboarding, timestamped trails, escrow flows, finance as the reward for compliance.</p>
            </div>
            <div className="arc-arrow" aria-hidden="true">&rarr;</div>
            <div className="arc-step">
              <span className="arc-n">03</span><h4>The return: self-funding IGR</h4>
              <p>Eight revenue streams generate &#8358;655M in Year 1 and cross &#8358;1 billion by Year 3, at zero capital cost to the State, with full ownership retained by the Ministry.</p>
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
              <div className="persona" key={t}><span className="persona-t">{t}</span><span className="persona-d">{d}</span></div>
            ))}
          </div>
        </section>

        {/* QUOTE */}
        <section className="quote">
          <img className="quote-seal" src="/lagos-seal.png" alt="" aria-hidden="true" />
          <blockquote>
            <p>&ldquo;This engagement marks a fundamental reset of the cooperative digitalisation agenda in Lagos State: one registry, one member record, one governance framework, owned by the Ministry.&rdquo;</p>
            <cite>Directorate of Cooperative Services, MCCTI</cite>
          </blockquote>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="foot">
        <div className="foot-top">
          <div className="foot-lockup">
            <img src="/lagos-seal.png" alt="Lagos State" />
            <img className="foot-mccti" src="/mccti-logo.png" alt="MCCTI" />
            <div className="foot-lockup-text">
              <span className="lh-gov">Lagos State Government</span>
              <span className="lh-min">Ministry of Commerce, Cooperatives, Trade &amp; Investment</span>
            </div>
          </div>
          <button className="btn btn-gold" onClick={() => setModal(true)}>Enter platform</button>
        </div>
        <div className="foot-grid">
          <p>A Ministry-owned digital platform, operated through a Public-Private Partnership and Special Purpose Vehicle. Revenue split: Lagos State 50%, Asset Matrix MFB 15%, Imade / Catridge 15%, QooP 10%, SEKAT 10%. Subject to final SPV agreement.</p>
          <p className="foot-conf">Confidential &middot; For the Ministry of Commerce, Cooperatives, Trade &amp; Investment, Lagos State Government. Figures on this page are illustrative pending live data.</p>
        </div>
      </footer>

      <RoleModal open={modal} onClose={() => setModal(false)} />
    </div>
  )
}

const CSS = `
:root{
  --ink:#0C1712; --ink-2:#0F1D17; --green:#123A2D; --green-panel:#153F33;
  --line:rgba(198,161,91,.20); --line-soft:rgba(233,226,210,.10);
  --gold:#C6A15B; --gold-soft:#DcC08a; --cream:#F3EEE1; --cream-ink:#182019;
  --sage:#AbC1B4; --sage-dim:#6E877B;
  --serif:'Lora',Georgia,'Times New Roman',serif;
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
  color:var(--sage); font-family:var(--sans); -webkit-font-smoothing:antialiased;
  min-height:100vh; overflow-x:hidden;
}
.eyebrow{font-family:var(--mono); font-size:11px; letter-spacing:.22em; text-transform:uppercase; color:var(--gold); margin:0 0 16px; display:flex; align-items:center; gap:9px}
.eb-dot{width:6px; height:6px; border-radius:50%; background:var(--gold); display:inline-block}
h1,h2,h3,h4{font-family:var(--serif); color:var(--cream); font-weight:500; margin:0}
p{margin:0}

.btn{font-family:var(--sans); font-size:14px; font-weight:600; border:none; cursor:pointer; padding:13px 24px; border-radius:2px; text-decoration:none; display:inline-block; transition:transform .18s ease, background .18s ease, color .18s ease, border-color .18s ease}
.btn-gold{background:var(--gold); color:#20180A; box-shadow:0 8px 24px -12px rgba(198,161,91,.6)}
.btn-gold:hover{background:var(--gold-soft); transform:translateY(-1px)}
.btn-ghost{background:transparent; color:var(--cream); border:1px solid var(--line)}
.btn-ghost:hover{border-color:var(--gold); color:var(--gold-soft)}

/* letterhead */
.letterhead{display:flex; align-items:center; justify-content:space-between; gap:20px; padding:11px 40px; background:var(--cream); color:var(--cream-ink); border-bottom:2px solid var(--gold)}
.lh-left{display:flex; align-items:center; gap:14px; min-width:0}
.lh-seal{height:40px; width:auto}
.lh-text{display:flex; flex-direction:column; line-height:1.25; min-width:0}
.lh-gov{font-family:var(--serif); font-weight:600; font-size:14px; color:var(--cream-ink)}
.lh-min{font-family:var(--mono); font-size:10.5px; letter-spacing:.03em; color:#4a5a4f; white-space:nowrap; overflow:hidden; text-overflow:ellipsis}
.lh-mccti{height:38px; width:auto; flex-shrink:0}

/* nav */
.nav{position:sticky; top:0; z-index:40; display:flex; align-items:center; justify-content:space-between; padding:15px 40px; background:rgba(12,23,18,.82); backdrop-filter:blur(12px); border-bottom:1px solid var(--line-soft)}
.brand{display:flex; align-items:center; gap:10px; text-decoration:none}
.brand-mark{color:var(--gold); font-size:13px}
.brand-name{font-family:var(--serif); color:var(--cream); font-size:19px; letter-spacing:.01em; font-weight:600}
.brand-name em{color:var(--gold-soft); font-style:italic; font-weight:500}
.nav-links{display:flex; gap:32px}
.nav-links a{color:var(--sage); text-decoration:none; font-size:14px; font-weight:500}
.nav-links a:hover{color:var(--gold-soft)}
.nav-cta{padding:10px 18px}

/* hero */
.hero{position:relative; max-width:1200px; margin:0 auto; padding:74px 40px 44px; display:grid; grid-template-columns:1.05fr .95fr; gap:56px; align-items:center}
.hero-watermark{position:absolute; right:-90px; top:-30px; width:520px; opacity:.05; pointer-events:none; user-select:none}
.hero-copy{position:relative; z-index:1; animation:rise .7s ease both}
h1{font-size:clamp(38px,5vw,64px); line-height:1.06; letter-spacing:-.01em; margin-bottom:24px}
.underline{position:relative; white-space:nowrap}
.underline::after{content:''; position:absolute; left:0; bottom:.02em; height:.08em; width:100%; background:var(--gold); transform:scaleX(0); transform-origin:left; animation:draw 1s .5s ease forwards}
.lead{font-size:17px; line-height:1.68; color:var(--sage); max-width:36em; margin-bottom:30px}
.hero-cta{display:flex; gap:14px; flex-wrap:wrap; margin-bottom:24px}
.hero-foot{font-family:var(--mono); font-size:12px; letter-spacing:.06em; color:var(--sage-dim)}

/* register - certificate frame */
.register{position:relative; z-index:1; animation:rise .7s .1s ease both}
.register-frame{background:linear-gradient(180deg, var(--green-panel), #103028); border:1px solid var(--gold); border-radius:5px; padding:5px; box-shadow:0 34px 70px -34px rgba(0,0,0,.7)}
.register-frame::after{content:''; position:absolute; inset:9px; border:1px solid var(--line); border-radius:3px; pointer-events:none}
.register-head{display:flex; align-items:center; gap:12px; padding:16px 18px; border-bottom:1px solid var(--line)}
.reg-seal{height:34px; width:auto}
.reg-title{font-family:var(--serif); color:var(--cream); font-size:16px; font-weight:600}
.reg-sub{font-size:11px; color:var(--sage-dim); margin-top:2px}
.reg-live{margin-left:auto; font-family:var(--mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--gold); border:1px solid var(--line); padding:4px 9px; border-radius:2px}
.reg-live::before{content:''; display:inline-block; width:6px; height:6px; border-radius:50%; background:var(--gold); margin-right:6px; vertical-align:middle; animation:pulse 1.8s ease-in-out infinite}
.register-rows{padding:6px 6px; filter:blur(.4px)}
.reg-row{display:flex; align-items:center; justify-content:space-between; gap:16px; padding:14px 12px; border-bottom:1px solid var(--line-soft)}
.reg-row:last-child{border-bottom:none}
.reg-row.is-new{animation:fadeIn .6s ease both}
.reg-row-main{display:flex; flex-direction:column; gap:3px; min-width:0}
.reg-name{color:var(--cream); font-size:14px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:16em}
.reg-office{font-size:11px; color:var(--sage-dim)}
.reg-row-meta{display:flex; flex-direction:column; align-items:flex-end; gap:5px; flex-shrink:0}
.reg-id{font-family:var(--mono); font-size:11px; color:var(--gold-soft); letter-spacing:.02em}
.reg-status{font-size:10px; padding:3px 8px; border-radius:2px; letter-spacing:.03em; white-space:nowrap}
.s-approved{background:rgba(198,161,91,.16); color:var(--gold-soft)}
.s-under{background:rgba(171,193,180,.12); color:var(--sage)}
.s-annual{background:rgba(171,193,180,.10); color:var(--sage-dim)}
.s-kyc{background:rgba(171,193,180,.10); color:var(--sage-dim)}
.s-registration{background:rgba(171,193,180,.12); color:var(--sage)}
.register-foot{display:flex; justify-content:space-between; align-items:center; padding:13px 18px; border-top:1px solid var(--line); font-size:11px; color:var(--sage-dim)}
.reg-stamp{font-family:var(--mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--gold); border:1px dashed var(--line); padding:3px 8px; transform:rotate(-1.5deg)}

/* stat band */
.band{max-width:1200px; margin:26px auto 0; padding:28px 40px; display:flex; flex-wrap:wrap; gap:16px 40px; justify-content:space-between; border-top:1px solid var(--line-soft); border-bottom:1px solid var(--line-soft)}
.band-item{display:flex; flex-direction:column; gap:6px}
.band-fig{font-family:var(--serif); color:var(--cream); font-size:26px; font-weight:600}
.band-arrow{color:var(--gold)}
.band-lab{font-family:var(--mono); font-size:11px; letter-spacing:.08em; color:var(--sage-dim); text-transform:uppercase}

/* sections */
section.lens,section.modules,section.arc,section.personas,section.quote{max-width:1200px; margin:0 auto; padding:88px 40px}
.section-head{max-width:44em; margin-bottom:46px}
.section-head h2{font-size:clamp(26px,3.4vw,40px); line-height:1.14; letter-spacing:-.01em; margin-top:4px}
.section-sub{margin-top:16px; font-size:16px; line-height:1.62; color:var(--sage)}

/* lens */
.lens-tabs{display:flex; flex-wrap:wrap; gap:10px; margin-bottom:28px}
.lens-tab{font-family:var(--sans); font-size:13px; font-weight:600; color:var(--sage); background:transparent; border:1px solid var(--line-soft); border-radius:2px; padding:10px 16px; cursor:pointer; transition:all .16s ease}
.lens-tab:hover{border-color:var(--gold); color:var(--gold-soft)}
.lens-tab.is-on{background:var(--gold); color:#20180A; border-color:var(--gold)}
.lens-tab.is-corridor:not(.is-on){border-style:dashed}
.lens-readout{display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:24px; padding:32px 36px; background:linear-gradient(180deg, var(--green-panel), #0F2A22); border:1px solid var(--line); border-radius:5px}
.lens-tag{display:flex; align-items:center; gap:12px; flex-wrap:wrap}
.corridor-flag{font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--gold); border:1px solid var(--line); padding:4px 9px; border-radius:2px}
.lens-tag-text{font-family:var(--serif); color:var(--cream); font-size:20px; font-weight:600}
.lens-figs{display:flex; gap:44px}
.lens-figs>div{display:flex; flex-direction:column; gap:4px}
.lf-fig{font-family:var(--serif); color:var(--cream); font-size:28px; font-weight:600}
.lf-lab{font-family:var(--mono); font-size:11px; letter-spacing:.07em; color:var(--sage-dim); text-transform:uppercase}

/* modules */
.mod-grid{display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--line-soft); border:1px solid var(--line-soft); border-radius:5px; overflow:hidden}
.mod-card{background:var(--ink-2); padding:36px 30px 30px; display:flex; flex-direction:column; gap:12px; transition:background .2s ease, transform .2s ease}
.mod-card:hover{background:#122a22; transform:translateY(-2px)}
.mod-top{display:flex; align-items:center; justify-content:space-between}
.mod-n{font-family:var(--mono); font-size:12px; color:var(--gold); letter-spacing:.1em}
.mod-lens{font-family:var(--mono); font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--sage-dim)}
.mod-card h3{font-size:20px; line-height:1.22}
.mod-card p{font-size:14px; line-height:1.62; color:var(--sage)}
.mod-ai{margin-top:auto; font-family:var(--mono); font-size:10px; letter-spacing:.08em; text-transform:uppercase; color:var(--gold-soft); border-top:1px solid var(--line); padding-top:12px}

/* arc */
.arc-steps{display:grid; grid-template-columns:1fr auto 1fr auto 1fr; align-items:stretch; gap:18px}
.arc-step{background:var(--ink-2); border:1px solid var(--line-soft); border-radius:5px; padding:32px 28px; display:flex; flex-direction:column; gap:12px}
.arc-step:nth-child(5){border-color:var(--line)}
.arc-n{font-family:var(--mono); font-size:13px; color:var(--gold); letter-spacing:.1em}
.arc-step h4{font-size:19px; line-height:1.2}
.arc-step p{font-size:14px; line-height:1.6; color:var(--sage)}
.arc-arrow{display:flex; align-items:center; color:var(--gold); font-size:22px}

/* personas */
.persona-grid{display:grid; grid-template-columns:repeat(5,1fr); gap:1px; background:var(--line-soft); border:1px solid var(--line-soft); border-radius:5px; overflow:hidden}
.persona{background:var(--ink-2); padding:28px 22px; display:flex; flex-direction:column; gap:10px; min-height:132px}
.persona-t{font-family:var(--serif); color:var(--cream); font-size:16px; font-weight:600}
.persona-d{font-size:13px; line-height:1.5; color:var(--sage-dim)}

/* quote */
.quote{text-align:center; position:relative}
.quote-seal{width:70px; height:auto; margin:0 auto 26px; opacity:.9}
.quote blockquote{margin:0; max-width:40em; margin-inline:auto}
.quote p{font-family:var(--serif); color:var(--cream); font-size:clamp(22px,2.8vw,32px); line-height:1.42; font-weight:400; font-style:italic}
.quote cite{display:block; margin-top:24px; font-family:var(--mono); font-size:12px; letter-spacing:.1em; text-transform:uppercase; color:var(--gold); font-style:normal}

/* footer */
.foot{border-top:1px solid var(--line-soft); background:var(--ink-2)}
.foot-top{max-width:1200px; margin:0 auto; padding:34px 40px; display:flex; align-items:center; justify-content:space-between; gap:24px; border-bottom:1px solid var(--line-soft); flex-wrap:wrap}
.foot-lockup{display:flex; align-items:center; gap:14px}
.foot-lockup img{height:44px; width:auto}
.foot-mccti{height:40px !important}
.foot-lockup-text{display:flex; flex-direction:column; line-height:1.3}
.foot-lockup-text .lh-gov{color:var(--cream)}
.foot-lockup-text .lh-min{color:var(--sage-dim)}
.foot-grid{max-width:1200px; margin:0 auto; padding:28px 40px 46px; display:grid; grid-template-columns:1.4fr 1fr; gap:30px}
.foot-grid p{font-size:13px; line-height:1.6; color:var(--sage-dim)}
.foot-conf{font-family:var(--mono); font-size:11px; letter-spacing:.04em}

/* modal */
.modal-scrim{position:fixed; inset:0; z-index:60; background:rgba(6,12,9,.74); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; padding:24px; animation:fadeIn .2s ease}
.modal{width:min(760px,100%); max-height:90vh; overflow:auto; background:var(--ink-2); border:1px solid var(--line); border-radius:6px; padding:36px; position:relative; outline:none}
.modal-head{margin-bottom:24px; position:relative}
.modal-head h2{font-size:28px; margin-top:4px}
.modal-x{position:absolute; top:-8px; right:-8px; background:transparent; border:none; color:var(--sage); font-size:30px; cursor:pointer; line-height:1; padding:6px}
.modal-x:hover{color:var(--gold)}
.role-grid{display:grid; grid-template-columns:repeat(2,1fr); gap:12px}
.role-card{text-align:left; background:var(--ink); border:1px solid var(--line-soft); border-radius:4px; padding:20px; cursor:pointer; display:flex; flex-direction:column; gap:6px; transition:all .16s ease}
.role-card:hover{border-color:var(--gold); transform:translateY(-2px)}
.role-title{font-family:var(--serif); color:var(--cream); font-size:17px; font-weight:600}
.role-desc{font-size:13px; line-height:1.5; color:var(--sage-dim)}
.role-go{font-family:var(--mono); font-size:11px; letter-spacing:.06em; color:var(--gold); margin-top:6px}
.modal-note{margin-top:20px; font-size:12px; color:var(--sage-dim); line-height:1.5}

@keyframes rise{from{opacity:0; transform:translateY(16px)}to{opacity:1; transform:none}}
@keyframes draw{to{transform:scaleX(1)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}

@media(max-width:960px){
  .hero{grid-template-columns:1fr; padding-top:52px}
  .hero-watermark{display:none}
  .mod-grid{grid-template-columns:1fr 1fr}
  .persona-grid{grid-template-columns:1fr 1fr}
  .arc-steps{grid-template-columns:1fr}
  .arc-arrow{transform:rotate(90deg); justify-content:center; padding:2px 0}
  .foot-grid{grid-template-columns:1fr}
}
@media(max-width:680px){
  .letterhead{padding:9px 18px; gap:12px}
  .lh-min{display:none}
  .lh-seal{height:34px}
  .lh-mccti{height:32px}
  .nav{padding:13px 18px}
  .nav-links{display:none}
  .hero{padding:40px 18px 30px}
  section.lens,section.modules,section.arc,section.personas,section.quote{padding:56px 18px}
  .band{padding:22px 18px; gap:18px 26px}
  .mod-grid,.persona-grid{grid-template-columns:1fr}
  .lens-figs{gap:26px}
  .role-grid{grid-template-columns:1fr}
  .foot-top,.foot-grid{padding-left:18px; padding-right:18px}
}
@media(prefers-reduced-motion:reduce){
  *{animation:none !important; transition:none !important}
  .underline::after{transform:scaleX(1)}
}
`
