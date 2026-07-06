import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

/* ============================================================================
   MCCTI CoopEco - single-file application (src/App.jsx)
   Stage 1: Landing and brand
   Stage 2: Deployable stack and entry flow (Supabase auth + kv, roles, identity)
   Stage 3: Cooperative Registry & Governance (SEKAT layer) - registration,
            society dashboard, annual returns, officer review/approval, auditor
            examination, timestamped audit trail, area-office oversight
   ==========================================================================*/

/* ------------------------------ config -------------------------------- */
const SB_URL = import.meta.env.VITE_SUPABASE_URL
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const supa = SB_URL && SB_KEY ? createClient(SB_URL, SB_KEY) : null
const hasSupabase = Boolean(supa)

/* --------------------------- content data ----------------------------- */
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
  { n: '01', title: 'Cooperative Registry & Governance', lens: 'SEKAT layer', ai: false, body: 'Online registration with a tracking ID, by-laws and trustees, area-office assignment, annual returns and CAP15 supervision, with officer review and a timestamped audit trail on every action.' },
  { n: '02', title: 'Member & MSME Analytics', lens: 'QooP layer', ai: true, body: 'Member onboarding and KYC, enterprise profiling across turnover, employment, sector and cash flow, and an AI credit score that sets a lending threshold and risk band.' },
  { n: '03', title: 'LASMECO Financing', lens: 'Access to finance', ai: false, body: 'The seven-step journey from intent to disbursement. Loans up to \u20A610,000,000 at 9% per annum, eligibility gated on cooperative membership and platform compliance, human approval at disbursement.' },
  { n: '04', title: 'Digital Wallet & Payments', lens: 'No-cash by design', ai: false, body: 'Member savings and contributions, esusu and ajo cycles digitised, transfers, withdrawals and escrow, settled through Paystack and Flutterwave. Every flow traceable, no cash handling.' },
  { n: '05', title: 'Marketplace & Directory', lens: 'Commerce and search', ai: false, body: 'A searchable cooperative directory with premium listings and a coop-merchant marketplace, opening government-linked commerce to societies across all 57 LGAs and LCDAs.' },
  { n: '06', title: 'Governance Intelligence', lens: 'For leadership', ai: true, body: 'Real-time dashboards for the Director, Permanent Secretary, Honourable Commissioner and Governor\u2019s office. Cooperative activity, loan performance, MSME health per LGA and fraud alerts.' },
]
const ROLES = [
  { id: 'society', icon: 'society', title: 'Cooperative Society', desc: 'Register, file returns, manage members and contributions.', defaultTitle: 'Society Administrator' },
  { id: 'member', icon: 'member', title: 'Member / MSME', desc: 'Onboard, get profiled and scored, save and apply for LASMECO.', defaultTitle: 'Cooperative Member' },
  { id: 'officer', icon: 'officer', title: 'Cooperative Officer', desc: 'Review, audit and approve across the 21 area offices.', defaultTitle: 'Cooperative Officer' },
  { id: 'auditor', icon: 'auditor', title: 'Auditor', desc: 'Examine financial returns and sign off on the audit trail.', defaultTitle: 'Cooperative Auditor' },
  { id: 'partner', icon: 'partner', title: 'Financial Partner', desc: 'Disbursement, escrow and wallet infrastructure.', defaultTitle: 'Financial Partner' },
  { id: 'leadership', icon: 'leadership', title: 'Leadership / Admin', desc: 'Real-time oversight of the cooperative economy.', defaultTitle: 'MCCTI Leadership' },
]
const PERSONAS = [
  ['Cooperative societies', 'One registration, one record, one audit trail.'],
  ['Members and MSMEs', 'A profile, a score, and a route to finance.'],
  ['Cooperative officers', 'Every society across 21 offices, in view.'],
  ['Auditors', 'Returns examined, sign-off recorded.'],
  ['State leadership', 'The cooperative economy, in real time.'],
]
const OFFICIALS = {
  'commissioner@mccti.lg.gov.ng': { name: 'Honourable Commissioner', title: 'Honourable Commissioner', office: 'MCCTI', role: 'leadership' },
  'permsec@mccti.lg.gov.ng': { name: 'Permanent Secretary', title: 'Permanent Secretary', office: 'MCCTI', role: 'leadership' },
  'director@mccti.lg.gov.ng': { name: 'Director of Cooperatives', title: 'Director, Cooperative Services', office: 'Directorate of Cooperative Services', role: 'officer' },
  'registrar@mccti.lg.gov.ng': { name: 'Area Registrar', title: 'Cooperative Officer', office: 'Ikeja Area Office', role: 'officer' },
}
const ROLE_CAPS = {
  member: ['Complete KYC and MSME profile', 'View your credit score and band', 'Save and contribute (esusu / ajo)', 'Apply for LASMECO finance'],
  partner: ['Process disbursements', 'Manage escrow and settlement', 'Oversee wallet transactions', 'Reconcile the revenue account'],
}

/* --------------------------- Stage 3 config --------------------------- */
const AREA_OFFICES = ['Alausa (HQ)', 'Ikeja', 'Mushin', 'Ikorodu', 'Epe', 'Badagry', 'Ibeju-Lekki', 'Lagos Island', 'Surulere', 'Ojo', 'Agege', 'Oshodi', 'Kosofe', 'Alimosho', 'Eti-Osa', 'Somolu', 'Apapa', 'Amuwo-Odofin', 'Ifako-Ijaiye', 'Lagos Mainland', 'Ajeromi']
const SECTORS = ['Trade', 'Thrift & Credit', 'Artisan', 'Agriculture', 'Transport', 'Manufacturing', 'Processing', 'Services', 'Multipurpose']
const STATUS_CLASS = { 'Filed': 'st-filed', 'Under review': 'st-review', 'Approved': 'st-approved', 'Returned': 'st-returned' }
const CAP15_CLASS = { 'Compliant': 'st-approved', 'Returns due': 'st-review', 'Under audit': 'st-filed' }

const SEED_COOPS = [
  { name: 'Omoluabi Traders Multipurpose Coop', areaOffice: 'Ikeja', sector: 'Trade', status: 'Filed', cap15: 'Returns due', members: 212, contributions: 4800000, custodian: 'B. Ajomale', trustees: ['A. Ogun', 'K. Meadows'] },
  { name: 'Idera Market Women Cooperative Society', areaOffice: 'Mushin', sector: 'Trade', status: 'Under review', cap15: 'Under audit', members: 340, contributions: 9200000, custodian: 'E. Emilia', trustees: ['T. Okafor'] },
  { name: 'Ajo Isokan Savings Coop', areaOffice: 'Ikorodu', sector: 'Thrift & Credit', status: 'Filed', cap15: 'Returns due', members: 98, contributions: 2100000, custodian: 'G. Onuoha', trustees: ['D. Oguntoye'] },
  { name: 'Eko Artisans Thrift and Credit Coop', areaOffice: 'Lagos Island', sector: 'Artisan', status: 'Approved', cap15: 'Compliant', members: 156, contributions: 6400000, custodian: 'S. Bello', trustees: ['R. Ade', 'M. Uche'] },
]

/* ------------------------------ helpers ------------------------------- */
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
const initials = (n) => (n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join('')
const deriveName = (email) => ((email || '').split('@')[0] || 'Member').split(/[._-]+/).filter(Boolean).map((s) => s[0].toUpperCase() + s.slice(1)).join(' ')
function greeting() { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening' }
const roleTitle = (id) => (ROLES.find((r) => r.id === id) || {}).title || id
const fmtNaira = (n) => '\u20A6' + Number(n || 0).toLocaleString('en-NG')
const fmtDate = (iso) => { try { return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) } catch { return iso } }
function genTrackingId() { const yy = String(new Date().getFullYear()).slice(2); const n = String(Math.floor(Math.random() * 1000000)).padStart(6, '0'); return 'LAG-CS-' + yy + '-' + n }
const cx = (...a) => a.filter(Boolean).join(' ')

/* --------------------------- storage layer ---------------------------- */
const LS = {
  get(k, f) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f } catch { return f } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} },
  del(k) { try { localStorage.removeItem(k) } catch {} },
}
const MEM = { read: () => LS.get('coopeco.kv', {}), write: (o) => LS.set('coopeco.kv', o) }
async function kvGet(key) {
  if (supa) { const { data } = await supa.from('kv').select('value').eq('key', key).maybeSingle(); return data?.value ?? null }
  return MEM.read()[key] ?? null
}
async function kvSet(key, value, uid) {
  if (supa) { await supa.from('kv').upsert({ key, value, user_id: uid ?? null, updated_at: new Date().toISOString() }); return }
  const o = MEM.read(); o[key] = value; MEM.write(o)
}
async function kvList(prefix) {
  if (supa) { const { data } = await supa.from('kv').select('value').like('key', prefix + '%'); return (data || []).map((r) => r.value) }
  const o = MEM.read(); return Object.keys(o).filter((k) => k.startsWith(prefix)).map((k) => o[k])
}

/* ---------------------------- data layer ------------------------------ */
function buildProfile(email, role, name) {
  const official = OFFICIALS[(email || '').toLowerCase()]
  const finalRole = official?.role || role || 'member'
  return { email, role: finalRole, name: official?.name || name || deriveName(email), title: official?.title || (ROLES.find((r) => r.id === finalRole)?.defaultTitle) || 'Member', office: official?.office || 'Lagos State' }
}
async function loadProfile(uid, email, meta) {
  if (supa) { const { data } = await supa.from('kv').select('value').eq('key', 'profile:' + uid).maybeSingle(); if (data?.value) return data.value; return buildProfile(email, meta?.role, meta?.name) }
  return buildProfile(email)
}
async function saveProfile(uid, profile) { if (supa) await supa.from('kv').upsert({ key: 'profile:' + uid, value: profile, user_id: uid, updated_at: new Date().toISOString() }) }
async function loadSession() {
  if (supa) {
    const { data } = await supa.auth.getSession(); const user = data?.session?.user; if (!user) return null
    return { email: user.email, id: user.id, profile: await loadProfile(user.id, user.email, user.user_metadata) }
  }
  const email = LS.get('coopeco.session', null); if (!email) return null
  const u = LS.get('coopeco.users', {})[email]; if (!u) return null
  return { email, id: 'demo:' + email, profile: buildProfile(email, u.role, u.name) }
}
async function signUp(email, password, role, name) {
  email = email.trim().toLowerCase()
  if (supa) {
    const { data, error } = await supa.auth.signUp({ email, password, options: { data: { role, name } } }); if (error) throw new Error(error.message)
    const user = data.user; const profile = buildProfile(email, role, name); if (user) await saveProfile(user.id, profile)
    if (!data.session) return { pending: true, profile }; return { email, id: user.id, profile }
  }
  const users = LS.get('coopeco.users', {}); users[email] = { email, password, role, name }; LS.set('coopeco.users', users); LS.set('coopeco.session', email)
  return { email, id: 'demo:' + email, profile: buildProfile(email, role, name) }
}
async function signIn(email, password, chosenRole) {
  email = email.trim().toLowerCase()
  if (supa) {
    const { data, error } = await supa.auth.signInWithPassword({ email, password }); if (error) throw new Error(error.message)
    const user = data.user; const profile = await loadProfile(user.id, email, user.user_metadata)
    if (chosenRole && !OFFICIALS[email]) { profile.role = chosenRole; await saveProfile(user.id, profile) }
    return { email, id: user.id, profile }
  }
  const u = LS.get('coopeco.users', {})[email]; if (!u) throw new Error('No account found for that email. Create one first.')
  if (u.password && password && u.password !== password) throw new Error('That password does not match our records.')
  LS.set('coopeco.session', email); return { email, id: 'demo:' + email, profile: buildProfile(email, chosenRole || u.role, u.name) }
}
async function signOutNow() { if (supa) await supa.auth.signOut(); else LS.del('coopeco.session') }

/* registry */
async function addAudit(e) { const id = 'audit:' + Date.now() + '-' + Math.random().toString(36).slice(2, 7); await kvSet(id, { ...e, at: e.at || new Date().toISOString() }) }
async function listAudit(trackingId) { const all = await kvList('audit:'); const f = trackingId ? all.filter((a) => a.trackingId === trackingId) : all; return f.sort((a, b) => (a.at < b.at ? 1 : -1)) }
async function listCoops() { return (await kvList('coop:')).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)) }
async function getCoop(id) { return await kvGet('coop:' + id) }
async function createCoop(rec, ctx) {
  const trackingId = genTrackingId(); const now = new Date().toISOString()
  const record = { trackingId, source: 'MCCTI', regNo: null, status: 'Filed', cap15: 'Returns due', members: 0, contributions: 0, trustees: [], returns: null, createdBy: ctx.email, createdAt: now, updatedAt: now, ...rec }
  await kvSet('coop:' + trackingId, record, ctx.uid)
  await addAudit({ trackingId, action: 'Registration filed', by: ctx.name, role: ctx.role, note: '' })
  return record
}
async function updateCoop(id, patch, ctx, action, note) {
  const cur = await getCoop(id); if (!cur) return null
  const next = { ...cur, ...patch, updatedAt: new Date().toISOString() }
  await kvSet('coop:' + id, next, cur.user_id)
  if (action) await addAudit({ trackingId: id, action, by: ctx.name, role: ctx.role, note: note || '' })
  return next
}
async function fileReturns(id, returns, ctx) {
  return updateCoop(id, { returns: { ...returns, filedBy: ctx.name, filedAt: new Date().toISOString() }, cap15: 'Under audit' }, ctx, 'Annual returns filed', '')
}
async function seedDemoRegistry() {
  if (supa) return
  if ((await kvList('coop:')).length) return
  const base = Date.now() - 6 * 86400000
  for (let i = 0; i < SEED_COOPS.length; i++) {
    const s = SEED_COOPS[i]; const id = genTrackingId(); const created = new Date(base + i * 86400000).toISOString()
    await kvSet('coop:' + id, { trackingId: id, source: 'MCCTI', regNo: null, returns: null, createdBy: 'seed@mccti.lg.gov.ng', createdAt: created, updatedAt: created, ...s })
    await addAudit({ trackingId: id, action: 'Registration filed', by: s.custodian, role: 'society', note: '', at: created })
    if (s.status !== 'Filed') await addAudit({ trackingId: id, action: 'Begin examination', by: 'Area Registrar', role: 'officer', note: '', at: new Date(base + i * 86400000 + 3600000).toISOString() })
    if (s.status === 'Approved') await addAudit({ trackingId: id, action: 'Approved and signed off', by: 'Director of Cooperatives', role: 'officer', note: 'Compliant with CAP15', at: new Date(base + i * 86400000 + 7200000).toISOString() })
  }
  await syncFromSekat({ name: 'SEKAT gateway', role: 'officer', email: 'sekat@system' }, true)
}

/* ------------------- SEKAT -> MCCTI integration (one-way) ------------------
   SEKAT is the source of truth for the legacy registry and audit data. Data
   flows in one direction, SEKAT into MCCTI. Ingested societies are mirrored
   read-only. The sample feed below stands in for the live SEKAT API/DB until
   SEKAT_API_URL and SEKAT_API_KEY are configured; the field shape mirrors the
   MicMac Coop Portal dataset (registration, custodian, trustees, bank, and the
   full audit inputs with examination, approval and signature). */
const SEKAT_FEED = [
  { regNo: 'LSCS/IK/0453', name: 'Ikeja Grand Traders Cooperative', areaOffice: 'Ikeja', sector: 'Trade', custodian: 'F. Adekoyeni', trustees: ['A. Bello', 'K. Nwosu'], members: 410, contributions: 15200000, bank: { name: 'Asset Matrix MFB', accountName: 'Ikeja Grand Traders Coop', accountNumber: '0142xxxx88' }, status: 'Approved', cap15: 'Compliant', createdAt: '2019-11-04T09:00:00Z', audit: { income: 18400000, expenses: 12600000, balanceSheet: 31200000, disposalOfSurplus: 3200000, trialBalance: 31200000, personalLedgerBalances: 15200000, comparativeAnalysis: [{ year: 2022, surplus: 4100000 }, { year: 2023, surplus: 5800000 }], additionalInformation: 'Clean audit. No qualifications.', examinedBy: 'Area Auditor, Ikeja', approvedBy: 'Director of Cooperatives', signature: 'DoC/2024/0451' } },
  { regNo: 'LSCS/SR/1188', name: 'Surulere United Artisans Coop', areaOffice: 'Surulere', sector: 'Artisan', custodian: 'M. Oladipo', trustees: ['J. Ekene'], members: 268, contributions: 8900000, bank: { name: 'Asset Matrix MFB', accountName: 'Surulere United Artisans', accountNumber: '0142xxxx12' }, status: 'Approved', cap15: 'Compliant', createdAt: '2020-03-19T09:00:00Z', audit: { income: 9600000, expenses: 7100000, balanceSheet: 14800000, disposalOfSurplus: 1400000, trialBalance: 14800000, personalLedgerBalances: 8900000, comparativeAnalysis: [{ year: 2022, surplus: 1900000 }, { year: 2023, surplus: 2500000 }], additionalInformation: 'Minor disclosure on asset revaluation.', examinedBy: 'Area Auditor, Surulere', approvedBy: 'Director of Cooperatives', signature: 'DoC/2024/1180' } },
  { regNo: 'LSCS/IB/0761', name: 'Ibeju-Lekki Farmers Multipurpose Coop', areaOffice: 'Ibeju-Lekki', sector: 'Agriculture', custodian: 'S. Ilaje', trustees: ['O. Fela', 'B. Ade'], members: 134, contributions: 3600000, bank: { name: 'Asset Matrix MFB', accountName: 'Ibeju-Lekki Farmers Coop', accountNumber: '0142xxxx55' }, status: 'Under review', cap15: 'Under audit', createdAt: '2021-07-08T09:00:00Z', audit: { income: 4200000, expenses: 3100000, balanceSheet: 6900000, disposalOfSurplus: 500000, trialBalance: 6900000, personalLedgerBalances: 3600000, comparativeAnalysis: [{ year: 2023, surplus: 1100000 }], additionalInformation: 'Awaiting superior approval.', examinedBy: 'Area Auditor, Ibeju-Lekki', approvedBy: '', signature: '' } },
  { regNo: 'LSCS/LI/0209', name: 'Idumota Textile Merchants Coop', areaOffice: 'Lagos Island', sector: 'Trade', custodian: 'C. Nnaji', trustees: ['R. Uche', 'P. Sanni'], members: 512, contributions: 21400000, bank: { name: 'Asset Matrix MFB', accountName: 'Idumota Textile Merchants', accountNumber: '0142xxxx77' }, status: 'Approved', cap15: 'Compliant', createdAt: '2018-06-14T09:00:00Z', audit: { income: 26800000, expenses: 19200000, balanceSheet: 44500000, disposalOfSurplus: 4600000, trialBalance: 44500000, personalLedgerBalances: 21400000, comparativeAnalysis: [{ year: 2022, surplus: 6200000 }, { year: 2023, surplus: 7600000 }], additionalInformation: 'Clean audit.', examinedBy: 'Area Auditor, Lagos Island', approvedBy: 'Director of Cooperatives', signature: 'DoC/2024/0207' } },
]
const sekatIdFor = (regNo) => 'SEKAT-' + String(regNo).replace(/[^A-Za-z0-9]+/g, '-')
function sekatToCoop(r) {
  const id = sekatIdFor(r.regNo); const now = new Date().toISOString()
  const a = r.audit
  return {
    trackingId: id, source: 'SEKAT', regNo: r.regNo, name: r.name, areaOffice: r.areaOffice, sector: r.sector,
    custodian: r.custodian, trustees: r.trustees || [], members: r.members || 0, contributions: r.contributions || 0,
    bank: r.bank || null, bylaws: r.bylaws || 'On file at SEKAT', status: r.status || 'Approved', cap15: r.cap15 || 'Compliant',
    returns: a ? { income: a.income, expenses: a.expenses, surplus: (a.income || 0) - (a.expenses || 0), balanceSheet: a.balanceSheet, disposalOfSurplus: a.disposalOfSurplus, trialBalance: a.trialBalance, personalLedgerBalances: a.personalLedgerBalances, comparativeAnalysis: a.comparativeAnalysis || [], notes: a.additionalInformation || '', filedBy: 'SEKAT', filedAt: now, examinedBy: a.examinedBy, approvedBy: a.approvedBy, signature: a.signature } : null,
    createdBy: 'sekat@system', createdAt: r.createdAt || now, updatedAt: now, syncedAt: now,
  }
}
async function getIntegration() { return (await kvGet('integration:sekat')) || { lastSync: null, count: 0 } }
async function syncFromSekat(ctx, silent) {
  let n = 0
  for (const r of SEKAT_FEED) {
    const rec = sekatToCoop(r); await kvSet('coop:' + rec.trackingId, rec)
    if (!silent) await addAudit({ trackingId: rec.trackingId, action: 'Synced from SEKAT', by: ctx.name || 'SEKAT gateway', role: 'officer', note: 'One-way ingest' })
    n++
  }
  await kvSet('integration:sekat', { lastSync: new Date().toISOString(), count: n, source: 'SEKAT sample feed' })
  return n
}

/* ------------------------------ icons --------------------------------- */
function RoleIcon({ name }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }
  const paths = {
    society: <path {...p} d="M4 20h16M6 20V9l6-4 6 4v11M10 20v-5h4v5" />,
    member: <><circle {...p} cx="12" cy="8" r="3.2" /><path {...p} d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></>,
    officer: <><path {...p} d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" /><path {...p} d="M9 12l2 2 4-4" /></>,
    auditor: <><rect {...p} x="5" y="3" width="10" height="14" rx="1.5" /><path {...p} d="M8 7h4M8 10h4" /><circle {...p} cx="16" cy="16" r="3" /><path {...p} d="M18.4 18.4L21 21" /></>,
    partner: <path {...p} d="M3 9l9-5 9 5M5 9v8m14-8v8M9 9v8m6-8v8M3 20h18" />,
    leadership: <path {...p} d="M4 20V4M4 20h16M8 20v-6m4 6V9m4 11v-8" />,
  }
  return <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">{paths[name] || paths.member}</svg>
}
function Avatar({ name, photo, size = 44 }) {
  if (photo) return <img className="avatar avatar-img" src={photo} alt="" style={{ width: size, height: size }} />
  return <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.36 }}>{initials(name)}</span>
}
const StatusChip = ({ status, kind }) => <span className={cx('chip', (kind === 'cap15' ? CAP15_CLASS : STATUS_CLASS)[status] || 'st-review')}>{status}</span>
const SourceBadge = ({ source }) => source ? <span className={cx('src-badge', source === 'SEKAT' ? 'src-sekat' : 'src-mccti')}>{source}</span> : null

/* --------------------------- live register ---------------------------- */
function LiveRegister({ areaId }) {
  const reduced = usePrefersReducedMotion()
  const label = (AREA_LENS.find((a) => a.id === areaId)?.label || '').toLowerCase().split('-')[0]
  const pool = areaId === 'state' ? REGISTER : REGISTER.filter((r) => r.office.toLowerCase().includes(label))
  const rows = pool.length ? pool : REGISTER
  const [start, setStart] = useState(0)
  useEffect(() => { if (reduced) return; const t = setInterval(() => setStart((s) => (s + 1) % rows.length), 3200); return () => clearInterval(t) }, [rows.length, reduced])
  const visible = Array.from({ length: Math.min(4, rows.length) }, (_, i) => rows[(start + i) % rows.length])
  return (
    <aside className="register" aria-label="Live cooperative register (illustrative)">
      <div className="register-frame">
        <div className="register-head"><img className="reg-seal" src="/lagos-seal.png" alt="" aria-hidden="true" /><div><p className="reg-title">Cooperative Register</p><p className="reg-sub">Directorate of Cooperative Services</p></div><span className="reg-live">Live</span></div>
        <div className="register-rows">
          {visible.map((r, i) => (
            <div className={cx('reg-row', i === 0 && 'is-new')} key={r.id + i}>
              <div className="reg-row-main"><span className="reg-name">{r.name}</span><span className="reg-office">{r.office} area office</span></div>
              <div className="reg-row-meta"><span className="reg-id">{r.id}</span><span className={'reg-status s-' + r.status.split(' ')[0].toLowerCase()}>{r.status}</span></div>
            </div>
          ))}
        </div>
        <div className="register-foot"><span>Instructions rotate as societies register</span><span className="reg-stamp">Teaser view</span></div>
      </div>
    </aside>
  )
}

/* ----------------------------- landing -------------------------------- */
function Landing({ area, setArea, onEnter }) {
  const current = AREA_LENS.find((a) => a.id === area) || AREA_LENS[0]
  return (
    <main id="top">
      <section className="hero">
        <img className="hero-watermark" src="/seal-watermark.png" alt="" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow"><span className="eb-dot" />Lagos State &middot; A core economic governance reform</p>
          <h1>One State.<br />One cooperative economy.<br /><span className="underline">One system.</span></h1>
          <p className="lead">13,000 registered cooperatives and 150,000+ members sit across two separate systems and a credit programme that cannot see them. MCCTI CoopEco consolidates the registry, member analytics, LASMECO financing, wallets and governance intelligence into a single, Ministry-owned platform.</p>
          <div className="hero-cta"><button className="btn btn-gold" onClick={onEnter}>Which best describes you?</button><a className="btn btn-ghost" href="#modules">See the modules</a></div>
          <p className="hero-foot">Ministry-owned &middot; SPV-operated &middot; self-funding from Year 1</p>
        </div>
        <LiveRegister areaId={area} />
      </section>
      <section className="band" aria-label="Headline figures">
        {[['13,000', 'Registered cooperatives'], ['150,000+', 'MSME members'], ['97%', 'MSMEs currently informal'], ['8', 'Platform revenue streams']].map(([f, l]) => (<div className="band-item" key={l}><span className="band-fig">{f}</span><span className="band-lab">{l}</span></div>))}
        <div className="band-item"><span className="band-fig">\u20A6655M<span className="band-arrow"> &rarr; </span>\u20A61B+</span><span className="band-lab">Year 1 to Year 3</span></div>
      </section>
      <section className="lens" id="lens">
        <div className="section-head"><p className="eyebrow">Area office lens</p><h2>See the cooperative economy, office by office</h2><p className="section-sub">Switch between a State-wide view and any of the 21 cooperative area offices. The underserved Ikorodu, Epe, Badagry and Ibeju-Lekki corridors are where formalisation has furthest to travel.</p></div>
        <div className="lens-tabs" role="tablist" aria-label="Area office">{AREA_LENS.map((a) => (<button key={a.id} role="tab" aria-selected={area === a.id} className={cx('lens-tab', area === a.id && 'is-on', a.corridor && 'is-corridor')} onClick={() => setArea(a.id)}>{a.label}</button>))}</div>
        <div className="lens-readout">
          <div className="lens-tag">{current.corridor && <span className="corridor-flag">Priority corridor</span>}<span className="lens-tag-text">{current.label} &middot; {current.tag}</span></div>
          <div className="lens-figs"><div><span className="lf-fig">{current.coops}</span><span className="lf-lab">Cooperatives</span></div><div><span className="lf-fig">{current.members}</span><span className="lf-lab">Members</span></div><div><span className="lf-fig">{current.active}</span><span className="lf-lab">Digitally active</span></div></div>
        </div>
      </section>
      <section className="modules" id="modules">
        <div className="section-head"><p className="eyebrow">Six modules, one platform</p><h2>Everything the cooperative economy runs on</h2></div>
        <div className="mod-grid">{MODULES.map((m) => (<article className="mod-card" key={m.n}><div className="mod-top"><span className="mod-n">{m.n}</span><span className="mod-lens">{m.lens}</span></div><h3>{m.title}</h3><p>{m.body}</p>{m.ai && <span className="mod-ai">Summarised by MCCTI CoopEco</span>}</article>))}</div>
      </section>
      <section className="arc" id="arc">
        <div className="section-head"><p className="eyebrow">From fragmentation to \u20A61 billion</p><h2>How the platform changes the arithmetic</h2></div>
        <div className="arc-steps">
          <div className="arc-step"><span className="arc-n">01</span><h4>The problem: fragmentation</h4><p>The registry, the analytics layer and LASMECO operate in isolation. Data is duplicated, revenue is uncollected, fraud goes undetected, and Government cannot see its own economy.</p></div>
          <div className="arc-arrow" aria-hidden="true">&rarr;</div>
          <div className="arc-step"><span className="arc-n">02</span><h4>The solution: one unified platform</h4><p>Registry, KYC, analytics, wallets, disbursement and dashboards in a single Ministry-owned system. KYC at onboarding, timestamped trails, escrow flows, finance as the reward for compliance.</p></div>
          <div className="arc-arrow" aria-hidden="true">&rarr;</div>
          <div className="arc-step"><span className="arc-n">03</span><h4>The return: self-funding IGR</h4><p>Eight revenue streams generate \u20A6655M in Year 1 and cross \u20A61 billion by Year 3, at zero capital cost to the State, with full ownership retained by the Ministry.</p></div>
        </div>
      </section>
      <section className="personas" id="intelligence">
        <div className="section-head"><p className="eyebrow">Role-aware from the first screen</p><h2>Built for everyone who touches a cooperative</h2></div>
        <div className="persona-grid">{PERSONAS.map(([t, d]) => (<div className="persona" key={t}><span className="persona-t">{t}</span><span className="persona-d">{d}</span></div>))}</div>
      </section>
      <section className="quote"><img className="quote-seal" src="/lagos-seal.png" alt="" aria-hidden="true" /><blockquote><p>&ldquo;This engagement marks a fundamental reset of the cooperative digitalisation agenda in Lagos State: one registry, one member record, one governance framework, owned by the Ministry.&rdquo;</p><cite>Directorate of Cooperative Services, MCCTI</cite></blockquote></section>
    </main>
  )
}

/* ---------------------------- role + auth ----------------------------- */
function RolePage({ onPick, onBack }) {
  return (
    <main className="flow"><div className="flow-inner">
      <button className="flow-back" onClick={onBack}>&larr; Back</button>
      <p className="eyebrow"><span className="eb-dot" />Enter the platform</p>
      <h1 className="flow-title">Which best describes you?</h1>
      <p className="flow-sub">Choose your role. The platform tailors every screen, and your pricing, to how you use it.</p>
      <div className="role-page-grid">{ROLES.map((r) => (<button className="role-page-card" key={r.id} onClick={() => onPick(r.id)}><span className="role-ico"><RoleIcon name={r.icon} /></span><span className="role-title">{r.title}</span><span className="role-desc">{r.desc}</span><span className="role-go">Continue &rarr;</span></button>))}</div>
    </div></main>
  )
}
function AuthPage({ role, onDone, onBack }) {
  const [mode, setMode] = useState('create'), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [name, setName] = useState('')
  const [busy, setBusy] = useState(false), [err, setErr] = useState(''), [pending, setPending] = useState(false)
  const submit = async () => {
    setErr(''); setBusy(true)
    try { if (!email || !password) throw new Error('Enter your email and a password.'); const res = mode === 'create' ? await signUp(email, password, role, name) : await signIn(email, password, role); if (res.pending) { setPending(true); setBusy(false); return } onDone(res) }
    catch (e) { setErr(e.message || 'Something went wrong.') } setBusy(false)
  }
  if (pending) return (<main className="flow"><div className="flow-inner narrow"><p className="eyebrow"><span className="eb-dot" />Confirm your email</p><h1 className="flow-title">Almost there</h1><p className="flow-sub">We have sent a confirmation link to {email}. Open it to activate your account, then sign in.</p><button className="btn btn-gold" onClick={() => { setPending(false); setMode('signin') }}>Back to sign in</button></div></main>)
  return (
    <main className="flow"><div className="flow-inner narrow">
      <button className="flow-back" onClick={onBack}>&larr; Change role</button>
      <p className="eyebrow"><span className="eb-dot" />{roleTitle(role)}</p>
      <h1 className="flow-title">{mode === 'create' ? 'Create your account' : 'Sign in'}</h1>
      <p className="flow-sub">{mode === 'create' ? 'Your role is saved to your account and shapes your dashboard.' : 'Welcome back to MCCTI CoopEco.'}</p>
      {!hasSupabase && <div className="demo-chip">Demo mode &middot; accounts are stored in this browser. Add Supabase keys to go live.</div>}
      <div className="auth-form">
        {mode === 'create' && <label className="field"><span>Full name</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Adaeze Okonkwo" /></label>}
        <label className="field"><span>Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label>
        <label className="field"><span>Password</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" onKeyDown={(e) => e.key === 'Enter' && submit()} /></label>
        {err && <p className="auth-err">{err}</p>}
        <button className="btn btn-gold auth-submit" onClick={submit} disabled={busy}>{busy ? 'Please wait\u2026' : (mode === 'create' ? 'Create account' : 'Sign in')}</button>
        <p className="auth-toggle">{mode === 'create' ? 'Already have an account?' : 'New to the platform?'}{' '}<button onClick={() => { setErr(''); setMode(mode === 'create' ? 'signin' : 'create') }}>{mode === 'create' ? 'Sign in' : 'Create one'}</button></p>
      </div>
    </div></main>
  )
}

/* --------------------------- Stage 3: forms --------------------------- */
function RegistrationForm({ ctx, onDone, onCancel }) {
  const [f, setF] = useState({ name: '', areaOffice: AREA_OFFICES[1], sector: SECTORS[0], custodian: '', trustees: '', bylaws: '', members: '', contributions: '' })
  const [busy, setBusy] = useState(false), [err, setErr] = useState(''), [done, setDone] = useState(null)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = async () => {
    setErr('')
    if (!f.name.trim() || !f.custodian.trim()) { setErr('Society name and custodian are required.'); return }
    setBusy(true)
    try {
      const rec = await createCoop({ name: f.name.trim(), areaOffice: f.areaOffice, sector: f.sector, custodian: f.custodian.trim(), trustees: f.trustees.split(',').map((s) => s.trim()).filter(Boolean), bylaws: f.bylaws.trim(), members: Number(f.members) || 0, contributions: Number(f.contributions) || 0 }, ctx)
      setDone(rec)
    } catch (e) { setErr(e.message || 'Could not file the registration.') } setBusy(false)
  }
  if (done) return (
    <div className="panel success-panel">
      <span className="success-mark">&#9670;</span>
      <h3>Registration filed</h3>
      <p>{done.name} has been submitted for review at the {done.areaOffice} area office.</p>
      <div className="tracking"><span>Tracking ID</span><strong>{done.trackingId}</strong></div>
      <p className="panel-note">A cooperative officer will examine and approve the registration. Every step is recorded on the audit trail.</p>
      <button className="btn btn-gold" onClick={() => onDone(done)}>Go to my cooperative</button>
    </div>
  )
  return (
    <div className="panel">
      <div className="panel-head"><h3>Register a cooperative society</h3><button className="link-back" onClick={onCancel}>Cancel</button></div>
      <div className="form-grid">
        <label className="field span2"><span>Society name</span><input value={f.name} onChange={set('name')} placeholder="e.g. Ikeja Traders Multipurpose Coop" /></label>
        <label className="field"><span>Area office</span><select value={f.areaOffice} onChange={set('areaOffice')}>{AREA_OFFICES.map((a) => <option key={a}>{a}</option>)}</select></label>
        <label className="field"><span>Cooperative sector</span><select value={f.sector} onChange={set('sector')}>{SECTORS.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="field"><span>Custodian / secretary</span><input value={f.custodian} onChange={set('custodian')} placeholder="Full name" /></label>
        <label className="field"><span>Trustees (comma separated)</span><input value={f.trustees} onChange={set('trustees')} placeholder="Name one, Name two" /></label>
        <label className="field"><span>Registered members</span><input type="number" value={f.members} onChange={set('members')} placeholder="0" /></label>
        <label className="field"><span>Total contributions (\u20A6)</span><input type="number" value={f.contributions} onChange={set('contributions')} placeholder="0" /></label>
        <label className="field span2"><span>By-laws summary</span><textarea value={f.bylaws} onChange={set('bylaws')} placeholder="Objectives, governance structure, meeting cycle, admission and exit rules." rows={4} /></label>
      </div>
      {err && <p className="auth-err">{err}</p>}
      <div className="panel-actions"><button className="btn btn-gold" onClick={submit} disabled={busy}>{busy ? 'Filing\u2026' : 'File registration'}</button></div>
      <p className="panel-note">Compliance: registration is filed under the Lagos CAP15 Cooperative Law. Approval requires officer sign-off. This is not legal advice.</p>
    </div>
  )
}
function ReturnsForm({ coop, ctx, onDone, onCancel }) {
  const [f, setF] = useState({ income: '', expenses: '', balanceSheet: '', disposalOfSurplus: '', notes: '' })
  const [busy, setBusy] = useState(false), [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const surplus = (Number(f.income) || 0) - (Number(f.expenses) || 0)
  const submit = async () => {
    setErr(''); setBusy(true)
    try { await fileReturns(coop.trackingId, { income: Number(f.income) || 0, expenses: Number(f.expenses) || 0, surplus, balanceSheet: Number(f.balanceSheet) || 0, disposalOfSurplus: Number(f.disposalOfSurplus) || 0, notes: f.notes.trim() }, ctx); onDone() }
    catch (e) { setErr(e.message || 'Could not file returns.') } setBusy(false)
  }
  return (
    <div className="panel">
      <div className="panel-head"><h3>File annual returns</h3><button className="link-back" onClick={onCancel}>Cancel</button></div>
      <p className="panel-sub">{coop.name} &middot; {coop.trackingId}</p>
      <div className="form-grid">
        <label className="field"><span>Total income (\u20A6)</span><input type="number" value={f.income} onChange={set('income')} placeholder="0" /></label>
        <label className="field"><span>Total expenses (\u20A6)</span><input type="number" value={f.expenses} onChange={set('expenses')} placeholder="0" /></label>
        <label className="field"><span>Balance sheet total (\u20A6)</span><input type="number" value={f.balanceSheet} onChange={set('balanceSheet')} placeholder="0" /></label>
        <label className="field"><span>Disposal of surplus (\u20A6)</span><input type="number" value={f.disposalOfSurplus} onChange={set('disposalOfSurplus')} placeholder="0" /></label>
        <div className="field span2 computed"><span>Surplus / (deficit), computed</span><strong className={surplus < 0 ? 'neg' : ''}>{fmtNaira(surplus)}</strong></div>
        <label className="field span2"><span>Additional information</span><textarea value={f.notes} onChange={set('notes')} rows={3} placeholder="Trial balance notes, disclosures, any qualifications." /></label>
      </div>
      {err && <p className="auth-err">{err}</p>}
      <div className="panel-actions"><button className="btn btn-gold" onClick={submit} disabled={busy}>{busy ? 'Filing\u2026' : 'Submit returns for audit'}</button></div>
    </div>
  )
}

/* --------------------------- Stage 3: detail -------------------------- */
function AuditTrail({ trackingId, refreshKey }) {
  const [items, setItems] = useState(null)
  useEffect(() => { let live = true; listAudit(trackingId).then((r) => live && setItems(r)); return () => { live = false } }, [trackingId, refreshKey])
  if (!items) return <p className="muted-line">Loading trail\u2026</p>
  if (!items.length) return <p className="muted-line">No entries yet.</p>
  return (
    <ul className="timeline">
      {items.map((a, i) => (
        <li key={i} className="tl-item"><span className="tl-dot" /><div className="tl-body"><div className="tl-top"><span className="tl-action">{a.action}</span><span className="tl-time">{fmtDate(a.at)}</span></div><span className="tl-by">{a.by} &middot; {roleTitle(a.role)}</span>{a.note && <span className="tl-note">&ldquo;{a.note}&rdquo;</span>}</div></li>
      ))}
    </ul>
  )
}
function CoopDetail({ coop, ctx, onClose, onChanged }) {
  const [note, setNote] = useState(''), [busy, setBusy] = useState(false), [c, setC] = useState(coop), [rk, setRk] = useState(0)
  const canOfficer = ctx.role === 'officer' || ctx.role === 'leadership'
  const canAudit = ctx.role === 'auditor' || ctx.role === 'officer'
  const act = async (patch, action, needNote) => {
    if (needNote && !note.trim()) { alert('Add a note explaining the decision.'); return }
    setBusy(true); const next = await updateCoop(c.trackingId, patch, ctx, action, note.trim()); setC(next); setNote(''); setRk((k) => k + 1); setBusy(false); onChanged && onChanged()
  }
  const examineReturns = async () => { setBusy(true); const next = await updateCoop(c.trackingId, { cap15: 'Compliant' }, ctx, 'Returns examined and signed off', note.trim()); setC(next); setNote(''); setRk((k) => k + 1); setBusy(false); onChanged && onChanged() }
  return (
    <div className="detail">
      <div className="detail-head">
        <div><h3>{c.name}</h3><p className="detail-sub">{c.trackingId}{c.regNo ? ' \u00b7 Reg. ' + c.regNo : ''} &middot; {c.areaOffice} area office &middot; {c.sector}</p></div>
        <button className="link-back" onClick={onClose}>&larr; Back to list</button>
      </div>
      <div className="detail-chips"><StatusChip status={c.status} /><StatusChip status={c.cap15} kind="cap15" /><SourceBadge source={c.source} /></div>
      <div className="detail-grid">
        <div className="field-ro"><span>Custodian</span><strong>{c.custodian || '\u2014'}</strong></div>
        <div className="field-ro"><span>Trustees</span><strong>{(c.trustees || []).join(', ') || '\u2014'}</strong></div>
        <div className="field-ro"><span>Members</span><strong>{Number(c.members || 0).toLocaleString('en-NG')}</strong></div>
        <div className="field-ro"><span>Contributions</span><strong>{fmtNaira(c.contributions)}</strong></div>
        {c.bank && <div className="field-ro span2"><span>Bank information</span><strong>{c.bank.name}{c.bank.accountName ? ' \u00b7 ' + c.bank.accountName : ''}{c.bank.accountNumber ? ' \u00b7 ' + c.bank.accountNumber : ''}</strong></div>}
        <div className="field-ro span2"><span>By-laws</span><strong className="normal">{c.bylaws || 'Not supplied'}</strong></div>
      </div>

      {c.returns && (
        <div className="returns-box">
          <h4>Annual returns</h4>
          <div className="returns-grid">
            <div><span>Income</span><strong>{fmtNaira(c.returns.income)}</strong></div>
            <div><span>Expenses</span><strong>{fmtNaira(c.returns.expenses)}</strong></div>
            <div><span>Surplus</span><strong className={c.returns.surplus < 0 ? 'neg' : ''}>{fmtNaira(c.returns.surplus)}</strong></div>
            <div><span>Balance sheet</span><strong>{fmtNaira(c.returns.balanceSheet)}</strong></div>
            <div><span>Disposal of surplus</span><strong>{fmtNaira(c.returns.disposalOfSurplus)}</strong></div>
            {c.returns.trialBalance != null && <div><span>Trial balance</span><strong>{fmtNaira(c.returns.trialBalance)}</strong></div>}
            {c.returns.personalLedgerBalances != null && <div><span>Personal ledger balances</span><strong>{fmtNaira(c.returns.personalLedgerBalances)}</strong></div>}
          </div>
          {c.returns.comparativeAnalysis?.length ? (<div className="comp-analysis"><span className="ca-lab">Comparative analysis of operating surplus</span><div className="ca-rows">{c.returns.comparativeAnalysis.map((r) => (<span key={r.year} className="ca-row">{r.year}: <strong>{fmtNaira(r.surplus)}</strong></span>))}</div></div>) : null}
          {c.returns.notes && <p className="returns-notes">{c.returns.notes}</p>}
          <p className="muted-line">Filed by {c.returns.filedBy} on {fmtDate(c.returns.filedAt)}</p>
          {(c.returns.examinedBy || c.returns.approvedBy) && <p className="muted-line">Examined by {c.returns.examinedBy || '\u2014'} &middot; Approved by {c.returns.approvedBy || '\u2014'}{c.returns.signature ? ' \u00b7 Signature ' + c.returns.signature : ''}</p>}
        </div>
      )}

      {c.source === 'SEKAT' && <div className="ro-note">This society is mirrored from SEKAT (read-only). Registration and audit changes are made in SEKAT and flow into MCCTI on the next sync. Data moves one way, SEKAT into MCCTI.</div>}

      {c.source !== 'SEKAT' && (canOfficer || canAudit) && c.status !== 'Approved' && (
        <div className="action-box">
          <label className="field"><span>Officer note (required for returns and sign-off)</span><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Findings, conditions, or reason for the decision." /></label>
          <div className="action-row">
            {canOfficer && c.status === 'Filed' && <button className="btn btn-gold btn-sm" disabled={busy} onClick={() => act({ status: 'Under review' }, 'Begin examination')}>Begin examination</button>}
            {canOfficer && c.status === 'Under review' && <button className="btn btn-gold btn-sm" disabled={busy} onClick={() => act({ status: 'Approved' }, 'Approved and signed off', true)}>Approve &amp; sign off</button>}
            {canOfficer && (c.status === 'Under review' || c.status === 'Filed') && <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => act({ status: 'Returned' }, 'Returned for correction', true)}>Return for correction</button>}
            {canAudit && c.returns && c.cap15 === 'Under audit' && <button className="btn btn-outline btn-sm" disabled={busy} onClick={examineReturns}>Examine returns &amp; sign off</button>}
          </div>
        </div>
      )}

      <div className="trail-box"><h4>Audit trail</h4><AuditTrail trackingId={c.trackingId} refreshKey={rk} /></div>
    </div>
  )
}

/* ------------------------ Stage 3: workspaces ------------------------- */
function StatCards({ coops }) {
  const total = coops.length
  const by = (s) => coops.filter((c) => c.status === s).length
  const cards = [['Total societies', total], ['Awaiting review', by('Filed')], ['Under review', by('Under review')], ['Approved', by('Approved')]]
  return <div className="statgrid">{cards.map(([l, v]) => (<div className="stat" key={l}><span className="stat-fig">{v}</span><span className="stat-lab">{l}</span></div>))}</div>
}
function useRegistry() {
  const [coops, setCoops] = useState(null)
  const reload = useCallback(() => listCoops().then(setCoops), [])
  useEffect(() => { reload() }, [reload])
  return [coops, reload]
}
function CoopTable({ coops, onOpen }) {
  if (!coops.length) return <p className="muted-line">No societies to show.</p>
  return (
    <div className="rtable-wrap"><table className="rtable">
      <thead><tr><th>Society</th><th>Tracking ID</th><th>Area office</th><th>Sector</th><th>Status</th><th>CAP15</th><th></th></tr></thead>
      <tbody>{coops.map((c) => (<tr key={c.trackingId}><td className="td-name">{c.name}<SourceBadge source={c.source} /></td><td className="mono">{c.trackingId}</td><td>{c.areaOffice}</td><td>{c.sector}</td><td><StatusChip status={c.status} /></td><td><StatusChip status={c.cap15} kind="cap15" /></td><td><button className="btn-open" onClick={() => onOpen(c)}>Open</button></td></tr>))}</tbody>
    </table></div>
  )
}
function SekatPanel({ ctx, onSynced }) {
  const [info, setInfo] = useState(null), [busy, setBusy] = useState(false)
  const load = () => getIntegration().then(setInfo)
  useEffect(() => { load() }, [])
  const run = async () => { setBusy(true); await syncFromSekat(ctx, false); await load(); setBusy(false); onSynced && onSynced() }
  return (
    <div className="sekat">
      <div className="sekat-flow">
        <div className="node src">SEKAT<span>Registry &amp; audit source</span></div>
        <div className="flow-arrow">&rarr;<span>one-way</span></div>
        <div className="node dst">MCCTI CoopEco<span>Unified registry</span></div>
      </div>
      <div className="sekat-status">
        <div className="status-row"><span>Connection</span><span className="pill muted">Sample feed{hasSupabase ? '' : ' (demo)'}</span></div>
        <div className="status-row"><span>Last sync</span><span className="mono">{info?.lastSync ? fmtDate(info.lastSync) : 'Never'}</span></div>
        <div className="status-row"><span>Societies ingested</span><span className="mono">{info?.count ?? 0}</span></div>
      </div>
      <button className="btn btn-gold btn-sm" onClick={run} disabled={busy}>{busy ? 'Syncing\u2026' : 'Run SEKAT sync'}</button>
      <p className="panel-note">Data flows one way, from SEKAT into MCCTI. Synced societies are read-only here. Connect the live SEKAT source by setting SEKAT_API_URL and SEKAT_API_KEY in the environment; until then this ingests a representative sample that mirrors the SEKAT dataset (registration, custodian, trustees, bank and full audit inputs with examination, approval and signature). Compliance: data flow, retention and NDPR handling to be governed by the SEKAT integration agreement. This is not legal advice.</p>
    </div>
  )
}
function OfficerWorkspace({ ctx }) {
  const [coops, reload] = useRegistry()
  const [tab, setTab] = useState('queue'), [sel, setSel] = useState(null)
  if (!coops) return <p className="muted-line">Loading registry\u2026</p>
  if (sel) return <CoopDetail coop={sel} ctx={ctx} onClose={() => { setSel(null); reload() }} onChanged={reload} />
  const queue = coops.filter((c) => ['Filed', 'Under review', 'Returned'].includes(c.status))
  const byOffice = AREA_OFFICES.map((o) => [o, coops.filter((c) => c.areaOffice === o).length]).filter(([, n]) => n)
  return (
    <div className="ws">
      <StatCards coops={coops} />
      <div className="tabs">{[['queue', 'Review queue'], ['all', 'All societies'], ['offices', 'By area office'], ['audit', 'Audit log'], ['sekat', 'SEKAT sync']].map(([id, l]) => (<button key={id} className={cx('tab', tab === id && 'on')} onClick={() => setTab(id)}>{l}</button>))}</div>
      {tab === 'queue' && <CoopTable coops={queue} onOpen={setSel} />}
      {tab === 'all' && <CoopTable coops={coops} onOpen={setSel} />}
      {tab === 'offices' && <div className="rtable-wrap"><table className="rtable"><thead><tr><th>Area office</th><th>Societies</th></tr></thead><tbody>{byOffice.map(([o, n]) => (<tr key={o}><td>{o}</td><td className="mono">{n}</td></tr>))}</tbody></table></div>}
      {tab === 'audit' && <OfficerAuditLog />}
      {tab === 'sekat' && <SekatPanel ctx={ctx} onSynced={reload} />}
    </div>
  )
}
function OfficerAuditLog() {
  const [items, setItems] = useState(null)
  useEffect(() => { listAudit().then((r) => setItems(r.slice(0, 40))) }, [])
  if (!items) return <p className="muted-line">Loading\u2026</p>
  if (!items.length) return <p className="muted-line">No activity yet.</p>
  return <div className="rtable-wrap"><table className="rtable"><thead><tr><th>When</th><th>Action</th><th>By</th><th>Society</th></tr></thead><tbody>{items.map((a, i) => (<tr key={i}><td className="mono">{fmtDate(a.at)}</td><td>{a.action}</td><td>{a.by}</td><td className="mono">{a.trackingId}</td></tr>))}</tbody></table></div>
}
function AuditorWorkspace({ ctx }) {
  const [coops, reload] = useRegistry()
  const [sel, setSel] = useState(null)
  if (!coops) return <p className="muted-line">Loading returns\u2026</p>
  if (sel) return <CoopDetail coop={sel} ctx={ctx} onClose={() => { setSel(null); reload() }} onChanged={reload} />
  const withReturns = coops.filter((c) => c.returns)
  return (
    <div className="ws">
      <div className="statgrid"><div className="stat"><span className="stat-fig">{withReturns.length}</span><span className="stat-lab">Returns filed</span></div><div className="stat"><span className="stat-fig">{coops.filter((c) => c.cap15 === 'Under audit').length}</span><span className="stat-lab">Awaiting examination</span></div><div className="stat"><span className="stat-fig">{coops.filter((c) => c.cap15 === 'Compliant').length}</span><span className="stat-lab">Signed off</span></div></div>
      <h3 className="ws-h">Financial returns for examination</h3>
      {withReturns.length ? <CoopTable coops={withReturns} onOpen={setSel} /> : <p className="muted-line">No returns have been filed yet.</p>}
    </div>
  )
}
function LeadershipOverview({ ctx }) {
  const [coops, reload] = useRegistry()
  if (!coops) return <p className="muted-line">Loading overview\u2026</p>
  const byOffice = AREA_OFFICES.map((o) => [o, coops.filter((c) => c.areaOffice === o).length]).filter(([, n]) => n)
  return (
    <div className="ws">
      <StatCards coops={coops} />
      <div className="dash-grid">
        <section className="dash-card"><h3>Compliance snapshot</h3><div className="status-row"><span>Compliant (CAP15)</span><span className="pill ok">{coops.filter((c) => c.cap15 === 'Compliant').length}</span></div><div className="status-row"><span>Under audit</span><span className="pill muted">{coops.filter((c) => c.cap15 === 'Under audit').length}</span></div><div className="status-row"><span>Returns due</span><span className="pill muted">{coops.filter((c) => c.cap15 === 'Returns due').length}</span></div></section>
        <section className="dash-card"><h3>Societies by source</h3><div className="status-row"><span>From SEKAT (mirrored)</span><span className="mono">{coops.filter((c) => c.source === 'SEKAT').length}</span></div><div className="status-row"><span>Native to MCCTI</span><span className="mono">{coops.filter((c) => c.source !== 'SEKAT').length}</span></div><div className="office-list" style={{ marginTop: '10px' }}>{byOffice.slice(0, 6).map(([o, n]) => (<div className="status-row" key={o}><span>{o}</span><span className="mono">{n}</span></div>))}</div></section>
      </div>
      <h3 className="ws-h">SEKAT integration</h3>
      <SekatPanel ctx={ctx} onSynced={reload} />
      <p className="dash-foot">Read-only oversight. Loan performance, MSME health and fraud alerts arrive with the analytics and intelligence modules.</p>
    </div>
  )
}
function SocietyWorkspace({ ctx }) {
  const [coops, reload] = useRegistry()
  const [mode, setMode] = useState('view') // view | register | returns
  if (!coops) return <p className="muted-line">Loading\u2026</p>
  const mine = coops.find((c) => c.createdBy === ctx.email)
  if (mode === 'register') return <RegistrationForm ctx={ctx} onCancel={() => setMode('view')} onDone={() => { setMode('view'); reload() }} />
  if (mode === 'returns' && mine) return <ReturnsForm coop={mine} ctx={ctx} onCancel={() => setMode('view')} onDone={() => { setMode('view'); reload() }} />
  if (!mine) return (
    <div className="empty">
      <span className="empty-mark">&#9670;</span>
      <h3>Register your cooperative society</h3>
      <p>File your society once. You receive a tracking ID, an officer reviews and approves it, and every step is recorded on the audit trail.</p>
      <button className="btn btn-gold" onClick={() => setMode('register')}>Register a society</button>
    </div>
  )
  return (
    <div className="ws">
      <div className="society-card">
        <div className="society-top"><div><h3>{mine.name}</h3><p className="detail-sub">{mine.trackingId} &middot; {mine.areaOffice} area office &middot; {mine.sector}</p></div><div className="detail-chips"><StatusChip status={mine.status} /><StatusChip status={mine.cap15} kind="cap15" /></div></div>
        <div className="society-figs"><div><span className="lf-lab">Members</span><span className="society-fig">{Number(mine.members || 0).toLocaleString('en-NG')}</span></div><div><span className="lf-lab">Contributions</span><span className="society-fig">{fmtNaira(mine.contributions)}</span></div><div><span className="lf-lab">Custodian</span><span className="society-fig sm">{mine.custodian || '\u2014'}</span></div></div>
        <div className="society-actions">
          <button className="btn btn-gold btn-sm" onClick={() => setMode('returns')}>{mine.returns ? 'Re-file annual returns' : 'File annual returns'}</button>
          {mine.status === 'Returned' && <span className="returned-flag">Returned for correction. Review the trail and re-file.</span>}
        </div>
      </div>
      <div className="trail-box"><h4>Audit trail</h4><AuditTrail trackingId={mine.trackingId} refreshKey={coops.length} /></div>
    </div>
  )
}
function CapabilityPreview({ role }) {
  const caps = ROLE_CAPS[role] || ROLE_CAPS.member
  return (
    <div className="ws"><section className="dash-card dash-caps"><h3>Your workspace</h3><p className="dash-card-sub">Tailored to your role. These open as the modules go live from the next stage.</p><ul className="caps">{caps.map((c) => (<li key={c}><span className="cap-tick">&#9670;</span>{c}<span className="cap-soon">Soon</span></li>))}</ul></section></div>
  )
}

/* ---------------------------- dashboard ------------------------------- */
function Dashboard({ session }) {
  const p = session.profile
  const ctx = { email: session.email, uid: session.id, role: p.role, name: p.name }
  const Workspace = { society: SocietyWorkspace, officer: OfficerWorkspace, auditor: AuditorWorkspace, leadership: LeadershipOverview }[p.role]
  return (
    <main className="dash"><div className="dash-inner">
      <div className="dash-hero">
        <Avatar name={p.name} photo={p.photo} size={64} />
        <div className="dash-hero-text"><p className="eyebrow"><span className="eb-dot" />{greeting()}</p><h1 className="dash-name">{p.name}</h1><p className="dash-meta">{p.title} &middot; {p.office}</p></div>
        <span className="dash-rolebadge">{roleTitle(p.role)}</span>
      </div>
      {Workspace ? <Workspace ctx={ctx} /> : <CapabilityPreview role={p.role} />}
    </div></main>
  )
}

/* ------------------------------- app ---------------------------------- */
export default function App() {
  const [area, setArea] = useState('state')
  const [view, setView] = useState('landing')
  const [chosenRole, setChosenRole] = useState(null)
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)
  useEffect(() => { seedDemoRegistry().finally(() => loadSession().then((s) => { setSession(s); setReady(true) })) }, [])
  const enter = useCallback(() => setView(session ? 'dashboard' : 'role'), [session])
  const pickRole = (id) => { setChosenRole(id); setView('auth') }
  const onAuthed = (res) => { setSession(res); setView('dashboard') }
  const doSignOut = async () => { await signOutNow(); setSession(null); setView('landing') }
  const goHome = () => setView('landing')
  return (
    <div className="page">
      <style>{CSS}</style>
      <div className="letterhead">
        <div className="lh-left"><img className="lh-seal" src="/lagos-seal.png" alt="Lagos State coat of arms" /><div className="lh-text"><span className="lh-gov">Lagos State Government</span><span className="lh-min">Ministry of Commerce, Cooperatives, Trade &amp; Investment</span></div></div>
        <img className="lh-mccti" src="/mccti-logo.png" alt="MCCTI" />
      </div>
      <header className="nav">
        <button className="brand" onClick={goHome}><span className="brand-mark" aria-hidden="true">&#9670;</span><span className="brand-name">MCCTI <em>CoopEco</em></span></button>
        <nav className="nav-links" aria-label="Primary">{view === 'landing' ? (<><a href="#modules">Modules</a><a href="#arc">The platform</a><a href="#intelligence">Intelligence</a></>) : null}</nav>
        {ready && session ? (
          <div className="account"><button className="acct-btn" onClick={() => setView('dashboard')}><Avatar name={session.profile.name} photo={session.profile.photo} size={30} /><span className="acct-name">{session.profile.name.split(' ')[0]}</span></button><button className="signout" onClick={doSignOut}>Sign out</button></div>
        ) : (<button className="btn btn-gold nav-cta" onClick={enter}>Enter platform</button>)}
      </header>
      {view === 'landing' && <Landing area={area} setArea={setArea} onEnter={enter} />}
      {view === 'role' && <RolePage onPick={pickRole} onBack={goHome} />}
      {view === 'auth' && <AuthPage role={chosenRole} onDone={onAuthed} onBack={() => setView('role')} />}
      {view === 'dashboard' && session && <Dashboard session={session} />}
      <footer className="foot">
        <div className="foot-top"><div className="foot-lockup"><img src="/lagos-seal.png" alt="Lagos State" /><img className="foot-mccti" src="/mccti-logo.png" alt="MCCTI" /><div className="foot-lockup-text"><span className="lh-gov">Lagos State Government</span><span className="lh-min">Ministry of Commerce, Cooperatives, Trade &amp; Investment</span></div></div>{!session && <button className="btn btn-gold" onClick={enter}>Enter platform</button>}</div>
        <div className="foot-grid"><p>A Ministry-owned digital platform, operated through a Public-Private Partnership and Special Purpose Vehicle. Revenue split: Lagos State 50%, Asset Matrix MFB 15%, Imade / Catridge 15%, QooP 10%, SEKAT 10%. Subject to final SPV agreement.</p><p className="foot-conf">Confidential &middot; For the Ministry of Commerce, Cooperatives, Trade &amp; Investment, Lagos State Government. Figures on this page are illustrative pending live data.</p></div>
      </footer>
    </div>
  )
}

const CSS = `
:root{--ink:#0C1712;--ink-2:#0F1D17;--green:#123A2D;--green-panel:#153F33;--line:rgba(198,161,91,.20);--line-soft:rgba(233,226,210,.10);--gold:#C6A15B;--gold-soft:#DcC08a;--cream:#F3EEE1;--cream-ink:#182019;--sage:#AbC1B4;--sage-dim:#6E877B;--err:#E08A6A;--serif:'Lora',Georgia,'Times New Roman',serif;--sans:'Inter',system-ui,-apple-system,sans-serif;--mono:'IBM Plex Mono',ui-monospace,monospace}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0}
.page{background:radial-gradient(1200px 600px at 80% -10%,rgba(21,63,51,.55),transparent 60%),radial-gradient(900px 500px at -5% 20%,rgba(198,161,91,.06),transparent 55%),var(--ink);color:var(--sage);font-family:var(--sans);-webkit-font-smoothing:antialiased;min-height:100vh;overflow-x:hidden;display:flex;flex-direction:column}
.eyebrow{font-family:var(--mono);font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);margin:0 0 16px;display:flex;align-items:center;gap:9px}
.eb-dot{width:6px;height:6px;border-radius:50%;background:var(--gold);display:inline-block}
h1,h2,h3,h4{font-family:var(--serif);color:var(--cream);font-weight:500;margin:0}p{margin:0}input,select,textarea{font-family:var(--sans)}
.btn{font-family:var(--sans);font-size:14px;font-weight:600;border:none;cursor:pointer;padding:13px 24px;border-radius:2px;text-decoration:none;display:inline-block;transition:transform .18s ease,background .18s ease,color .18s ease,border-color .18s ease}
.btn-gold{background:var(--gold);color:#20180A;box-shadow:0 8px 24px -12px rgba(198,161,91,.6)}
.btn-gold:hover{background:var(--gold-soft);transform:translateY(-1px)}.btn-gold:disabled{opacity:.6;cursor:default;transform:none}
.btn-ghost{background:transparent;color:var(--cream);border:1px solid var(--line)}.btn-ghost:hover{border-color:var(--gold);color:var(--gold-soft)}
.btn-outline{background:transparent;color:var(--cream);border:1px solid var(--line);box-shadow:none}.btn-outline:hover{border-color:var(--gold);color:var(--gold-soft)}
.btn-sm{padding:9px 16px;font-size:13px}
.letterhead{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:11px 40px;background:var(--cream);color:var(--cream-ink);border-bottom:2px solid var(--gold)}
.lh-left{display:flex;align-items:center;gap:14px;min-width:0}.lh-seal{height:40px;width:auto}
.lh-text{display:flex;flex-direction:column;line-height:1.25;min-width:0}
.lh-gov{font-family:var(--serif);font-weight:600;font-size:14px;color:var(--cream-ink)}
.lh-min{font-family:var(--mono);font-size:10.5px;letter-spacing:.03em;color:#4a5a4f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lh-mccti{height:38px;width:auto;flex-shrink:0}
.nav{position:sticky;top:0;z-index:40;display:flex;align-items:center;justify-content:space-between;padding:15px 40px;background:rgba(12,23,18,.82);backdrop-filter:blur(12px);border-bottom:1px solid var(--line-soft)}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;background:none;border:none;cursor:pointer;padding:0}
.brand-mark{color:var(--gold);font-size:13px}.brand-name{font-family:var(--serif);color:var(--cream);font-size:19px;letter-spacing:.01em;font-weight:600}.brand-name em{color:var(--gold-soft);font-style:italic;font-weight:500}
.nav-links{display:flex;gap:32px}.nav-links a{color:var(--sage);text-decoration:none;font-size:14px;font-weight:500}.nav-links a:hover{color:var(--gold-soft)}
.nav-cta{padding:10px 18px}
.account{display:flex;align-items:center;gap:14px}
.acct-btn{display:flex;align-items:center;gap:9px;background:transparent;border:1px solid var(--line-soft);border-radius:40px;padding:5px 14px 5px 5px;cursor:pointer;transition:border-color .16s ease}.acct-btn:hover{border-color:var(--gold)}
.acct-name{color:var(--cream);font-size:14px;font-weight:600}
.signout{background:none;border:none;color:var(--sage-dim);font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}.signout:hover{color:var(--gold-soft)}
.avatar{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;background:linear-gradient(180deg,var(--green-panel),#0F2A22);color:var(--gold-soft);font-family:var(--serif);font-weight:600;border:1.5px solid var(--gold);flex-shrink:0}.avatar-img{object-fit:cover;padding:0}
.hero{position:relative;max-width:1200px;margin:0 auto;padding:74px 40px 44px;display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:center}
.hero-watermark{position:absolute;right:-90px;top:-30px;width:520px;opacity:.05;pointer-events:none;user-select:none}
.hero-copy{position:relative;z-index:1;animation:rise .7s ease both}
h1{font-size:clamp(38px,5vw,64px);line-height:1.06;letter-spacing:-.01em;margin-bottom:24px}
.underline{position:relative;white-space:nowrap}.underline::after{content:'';position:absolute;left:0;bottom:.02em;height:.08em;width:100%;background:var(--gold);transform:scaleX(0);transform-origin:left;animation:draw 1s .5s ease forwards}
.lead{font-size:17px;line-height:1.68;color:var(--sage);max-width:36em;margin-bottom:30px}
.hero-cta{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:24px}.hero-foot{font-family:var(--mono);font-size:12px;letter-spacing:.06em;color:var(--sage-dim)}
.register{position:relative;z-index:1;animation:rise .7s .1s ease both}
.register-frame{background:linear-gradient(180deg,var(--green-panel),#103028);border:1px solid var(--gold);border-radius:5px;padding:5px;box-shadow:0 34px 70px -34px rgba(0,0,0,.7)}
.register-frame::after{content:'';position:absolute;inset:9px;border:1px solid var(--line);border-radius:3px;pointer-events:none}
.register-head{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid var(--line)}.reg-seal{height:34px;width:auto}
.reg-title{font-family:var(--serif);color:var(--cream);font-size:16px;font-weight:600}.reg-sub{font-size:11px;color:var(--sage-dim);margin-top:2px}
.reg-live{margin-left:auto;font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);border:1px solid var(--line);padding:4px 9px;border-radius:2px}
.reg-live::before{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--gold);margin-right:6px;vertical-align:middle;animation:pulse 1.8s ease-in-out infinite}
.register-rows{padding:6px 6px;filter:blur(.4px)}
.reg-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 12px;border-bottom:1px solid var(--line-soft)}.reg-row:last-child{border-bottom:none}.reg-row.is-new{animation:fadeIn .6s ease both}
.reg-row-main{display:flex;flex-direction:column;gap:3px;min-width:0}.reg-name{color:var(--cream);font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:16em}.reg-office{font-size:11px;color:var(--sage-dim)}
.reg-row-meta{display:flex;flex-direction:column;align-items:flex-end;gap:5px;flex-shrink:0}.reg-id{font-family:var(--mono);font-size:11px;color:var(--gold-soft);letter-spacing:.02em}
.reg-status{font-size:10px;padding:3px 8px;border-radius:2px;letter-spacing:.03em;white-space:nowrap}
.s-approved{background:rgba(198,161,91,.16);color:var(--gold-soft)}.s-under{background:rgba(171,193,180,.12);color:var(--sage)}.s-annual{background:rgba(171,193,180,.10);color:var(--sage-dim)}.s-kyc{background:rgba(171,193,180,.10);color:var(--sage-dim)}.s-registration{background:rgba(171,193,180,.12);color:var(--sage)}
.register-foot{display:flex;justify-content:space-between;align-items:center;padding:13px 18px;border-top:1px solid var(--line);font-size:11px;color:var(--sage-dim)}
.reg-stamp{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);border:1px dashed var(--line);padding:3px 8px;transform:rotate(-1.5deg)}
.band{max-width:1200px;margin:26px auto 0;padding:28px 40px;display:flex;flex-wrap:wrap;gap:16px 40px;justify-content:space-between;border-top:1px solid var(--line-soft);border-bottom:1px solid var(--line-soft)}
.band-item{display:flex;flex-direction:column;gap:6px}.band-fig{font-family:var(--serif);color:var(--cream);font-size:26px;font-weight:600}.band-arrow{color:var(--gold)}.band-lab{font-family:var(--mono);font-size:11px;letter-spacing:.08em;color:var(--sage-dim);text-transform:uppercase}
section.lens,section.modules,section.arc,section.personas,section.quote{max-width:1200px;margin:0 auto;padding:88px 40px}
.section-head{max-width:44em;margin-bottom:46px}.section-head h2{font-size:clamp(26px,3.4vw,40px);line-height:1.14;letter-spacing:-.01em;margin-top:4px}.section-sub{margin-top:16px;font-size:16px;line-height:1.62;color:var(--sage)}
.lens-tabs{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:28px}
.lens-tab{font-family:var(--sans);font-size:13px;font-weight:600;color:var(--sage);background:transparent;border:1px solid var(--line-soft);border-radius:2px;padding:10px 16px;cursor:pointer;transition:all .16s ease}.lens-tab:hover{border-color:var(--gold);color:var(--gold-soft)}.lens-tab.is-on{background:var(--gold);color:#20180A;border-color:var(--gold)}.lens-tab.is-corridor:not(.is-on){border-style:dashed}
.lens-readout{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:24px;padding:32px 36px;background:linear-gradient(180deg,var(--green-panel),#0F2A22);border:1px solid var(--line);border-radius:5px}
.lens-tag{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.corridor-flag{font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);border:1px solid var(--line);padding:4px 9px;border-radius:2px}
.lens-tag-text{font-family:var(--serif);color:var(--cream);font-size:20px;font-weight:600}
.lens-figs{display:flex;gap:44px}.lens-figs>div{display:flex;flex-direction:column;gap:4px}.lf-fig{font-family:var(--serif);color:var(--cream);font-size:28px;font-weight:600}.lf-lab{font-family:var(--mono);font-size:11px;letter-spacing:.07em;color:var(--sage-dim);text-transform:uppercase}
.mod-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line-soft);border:1px solid var(--line-soft);border-radius:5px;overflow:hidden}
.mod-card{background:var(--ink-2);padding:36px 30px 30px;display:flex;flex-direction:column;gap:12px;transition:background .2s ease,transform .2s ease}.mod-card:hover{background:#122a22;transform:translateY(-2px)}
.mod-top{display:flex;align-items:center;justify-content:space-between}.mod-n{font-family:var(--mono);font-size:12px;color:var(--gold);letter-spacing:.1em}.mod-lens{font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--sage-dim)}
.mod-card h3{font-size:20px;line-height:1.22}.mod-card p{font-size:14px;line-height:1.62;color:var(--sage)}
.mod-ai{margin-top:auto;font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--gold-soft);border-top:1px solid var(--line);padding-top:12px}
.arc-steps{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;align-items:stretch;gap:18px}
.arc-step{background:var(--ink-2);border:1px solid var(--line-soft);border-radius:5px;padding:32px 28px;display:flex;flex-direction:column;gap:12px}.arc-step:nth-child(5){border-color:var(--line)}
.arc-n{font-family:var(--mono);font-size:13px;color:var(--gold);letter-spacing:.1em}.arc-step h4{font-size:19px;line-height:1.2}.arc-step p{font-size:14px;line-height:1.6;color:var(--sage)}.arc-arrow{display:flex;align-items:center;color:var(--gold);font-size:22px}
.persona-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:1px;background:var(--line-soft);border:1px solid var(--line-soft);border-radius:5px;overflow:hidden}
.persona{background:var(--ink-2);padding:28px 22px;display:flex;flex-direction:column;gap:10px;min-height:132px}.persona-t{font-family:var(--serif);color:var(--cream);font-size:16px;font-weight:600}.persona-d{font-size:13px;line-height:1.5;color:var(--sage-dim)}
.quote{text-align:center;position:relative}.quote-seal{width:70px;height:auto;margin:0 auto 26px;opacity:.9}
.quote blockquote{margin:0;max-width:40em;margin-inline:auto}.quote p{font-family:var(--serif);color:var(--cream);font-size:clamp(22px,2.8vw,32px);line-height:1.42;font-weight:400;font-style:italic}.quote cite{display:block;margin-top:24px;font-family:var(--mono);font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);font-style:normal}
.flow{flex:1;display:flex;align-items:flex-start;justify-content:center;padding:64px 40px 90px}
.flow-inner{width:100%;max-width:960px;animation:rise .5s ease both}.flow-inner.narrow{max-width:440px}
.flow-back{background:none;border:none;color:var(--sage-dim);font-family:var(--mono);font-size:12px;letter-spacing:.06em;cursor:pointer;margin-bottom:26px;padding:0}.flow-back:hover{color:var(--gold-soft)}
.flow-title{font-size:clamp(30px,4vw,46px);line-height:1.08;margin-bottom:14px}.flow-sub{font-size:16px;line-height:1.6;color:var(--sage);max-width:34em;margin-bottom:36px}
.role-page-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.role-page-card{text-align:left;background:var(--ink-2);border:1px solid var(--line-soft);border-radius:6px;padding:26px 24px;cursor:pointer;display:flex;flex-direction:column;gap:10px;transition:all .18s ease}.role-page-card:hover{border-color:var(--gold);transform:translateY(-3px);background:#122a22}
.role-ico{color:var(--gold);display:inline-flex;width:46px;height:46px;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:8px;margin-bottom:6px}
.role-title{font-family:var(--serif);color:var(--cream);font-size:18px;font-weight:600}.role-desc{font-size:13px;line-height:1.5;color:var(--sage-dim)}.role-go{font-family:var(--mono);font-size:11px;letter-spacing:.06em;color:var(--gold);margin-top:6px}
.demo-chip{font-family:var(--mono);font-size:11px;letter-spacing:.03em;color:var(--gold-soft);background:rgba(198,161,91,.08);border:1px solid var(--line);border-radius:3px;padding:10px 14px;margin-bottom:22px;line-height:1.5}
.auth-form{display:flex;flex-direction:column;gap:16px}
.field{display:flex;flex-direction:column;gap:7px}.field span{font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--sage-dim)}
.field input,.field select,.field textarea{background:var(--ink-2);border:1px solid var(--line-soft);border-radius:3px;padding:13px 14px;color:var(--cream);font-size:15px;transition:border-color .16s ease;width:100%}
.field input:focus,.field select:focus,.field textarea:focus{outline:none;border-color:var(--gold)}
.field input::placeholder,.field textarea::placeholder{color:var(--sage-dim)}
.field select{appearance:none;cursor:pointer}
.auth-err{color:var(--err);font-size:13px;line-height:1.5}
.auth-submit{margin-top:4px;width:100%}.auth-toggle{font-size:13px;color:var(--sage-dim);text-align:center}
.auth-toggle button{background:none;border:none;color:var(--gold-soft);cursor:pointer;font-size:13px;font-weight:600;padding:0}.auth-toggle button:hover{text-decoration:underline}
.dash{flex:1;padding:52px 40px 90px}.dash-inner{max-width:1080px;margin:0 auto;animation:rise .5s ease both}
.dash-hero{display:flex;align-items:center;gap:20px;padding-bottom:30px;margin-bottom:30px;border-bottom:1px solid var(--line-soft)}
.dash-hero-text{flex:1;min-width:0}.dash-hero-text .eyebrow{margin-bottom:8px}.dash-name{font-size:clamp(26px,3.4vw,38px);line-height:1.1}.dash-meta{font-size:14px;color:var(--sage-dim);margin-top:6px}
.dash-rolebadge{font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--gold);border:1px solid var(--gold);border-radius:3px;padding:8px 14px;white-space:nowrap}
.dash-grid{display:grid;grid-template-columns:1.6fr 1fr;gap:20px;align-items:start}
.dash-card{background:var(--ink-2);border:1px solid var(--line-soft);border-radius:6px;padding:28px}.dash-card h3{font-size:18px;margin-bottom:6px}.dash-card-sub{font-size:13px;color:var(--sage-dim);line-height:1.55;margin-bottom:20px}
.caps{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}.caps li{display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid var(--line-soft);color:var(--cream);font-size:15px}.caps li:last-child{border-bottom:none}.cap-tick{color:var(--gold);font-size:11px}.cap-soon{margin-left:auto;font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--sage-dim);border:1px solid var(--line-soft);padding:3px 8px;border-radius:2px}
.status-row{display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--line-soft);font-size:14px;color:var(--sage)}.status-row:last-child{border-bottom:none}
.pill{font-family:var(--mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;padding:4px 9px;border-radius:2px}.pill.ok{background:rgba(198,161,91,.16);color:var(--gold-soft)}.pill.muted{background:rgba(171,193,180,.10);color:var(--sage-dim)}
.dash-foot{margin-top:26px;font-size:13px;color:var(--sage-dim);line-height:1.6}
/* Stage 3 */
.ws{display:flex;flex-direction:column;gap:24px}.ws-h{font-size:18px}
.muted-line{color:var(--sage-dim);font-size:14px;padding:8px 0}
.statgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.stat{background:var(--ink-2);border:1px solid var(--line-soft);border-radius:6px;padding:22px 24px;display:flex;flex-direction:column;gap:8px}
.stat-fig{font-family:var(--serif);color:var(--cream);font-size:32px;font-weight:600;line-height:1}.stat-lab{font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--sage-dim)}
.tabs{display:flex;gap:8px;flex-wrap:wrap;border-bottom:1px solid var(--line-soft);padding-bottom:0}
.tab{background:none;border:none;border-bottom:2px solid transparent;color:var(--sage);font-family:var(--sans);font-size:14px;font-weight:600;padding:10px 4px;margin-right:14px;cursor:pointer}
.tab:hover{color:var(--gold-soft)}.tab.on{color:var(--cream);border-bottom-color:var(--gold)}
.rtable-wrap{overflow-x:auto;border:1px solid var(--line-soft);border-radius:6px}
.rtable{width:100%;border-collapse:collapse;min-width:640px}
.rtable th{text-align:left;font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--sage-dim);padding:14px 16px;border-bottom:1px solid var(--line-soft);font-weight:500;background:rgba(0,0,0,.14)}
.rtable td{padding:15px 16px;border-bottom:1px solid var(--line-soft);font-size:14px;color:var(--sage);vertical-align:middle}
.rtable tr:last-child td{border-bottom:none}.rtable tr:hover td{background:rgba(198,161,91,.04)}
.td-name{color:var(--cream);font-weight:500;max-width:22em}.mono{font-family:var(--mono);font-size:12px;color:var(--gold-soft)}
.btn-open{background:transparent;border:1px solid var(--line);color:var(--gold-soft);font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;padding:6px 12px;border-radius:2px;cursor:pointer}.btn-open:hover{border-color:var(--gold);background:rgba(198,161,91,.08)}
.chip{font-family:var(--mono);font-size:10px;letter-spacing:.05em;padding:4px 9px;border-radius:2px;white-space:nowrap;display:inline-block}
.st-filed{background:rgba(171,193,180,.12);color:var(--sage)}.st-review{background:rgba(198,161,91,.14);color:var(--gold-soft)}.st-approved{background:rgba(120,180,120,.16);color:#9FCF9F}.st-returned{background:rgba(224,138,106,.16);color:var(--err)}
.panel,.detail,.empty,.society-card,.action-box,.returns-box,.trail-box{background:var(--ink-2);border:1px solid var(--line-soft);border-radius:8px}
.panel{padding:30px;max-width:760px}
.panel-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}.panel-head h3{font-size:20px}
.panel-sub{color:var(--sage-dim);font-size:13px;margin:-10px 0 18px}
.link-back{background:none;border:none;color:var(--sage-dim);font-family:var(--mono);font-size:12px;letter-spacing:.05em;cursor:pointer}.link-back:hover{color:var(--gold-soft)}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.form-grid .span2{grid-column:1 / -1}
.field textarea{resize:vertical;line-height:1.5}
.computed{background:rgba(198,161,91,.06);border:1px dashed var(--line);border-radius:4px;padding:12px 14px}.computed strong{font-family:var(--serif);color:var(--cream);font-size:20px}.computed strong.neg,.neg{color:var(--err)}
.panel-actions{margin-top:22px}.panel-note{margin-top:16px;font-size:12px;color:var(--sage-dim);line-height:1.55}
.success-panel{text-align:center;max-width:520px;margin:0 auto;padding:40px}
.success-mark{color:var(--gold);font-size:22px;display:block;margin-bottom:14px}
.success-panel h3{font-size:24px;margin-bottom:10px}.success-panel p{font-size:15px;color:var(--sage);line-height:1.6}
.tracking{display:flex;flex-direction:column;gap:6px;align-items:center;margin:22px 0;padding:18px;border:1px solid var(--line);border-radius:6px;background:rgba(198,161,91,.06)}
.tracking span{font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--sage-dim)}.tracking strong{font-family:var(--mono);font-size:20px;color:var(--gold-soft);letter-spacing:.04em}
.empty{text-align:center;padding:56px 40px;max-width:560px;margin:0 auto}.empty-mark{color:var(--gold);font-size:24px;display:block;margin-bottom:16px}.empty h3{font-size:24px;margin-bottom:12px}.empty p{font-size:15px;color:var(--sage);line-height:1.65;margin-bottom:26px;max-width:40em;margin-inline:auto}
.detail{padding:30px}
.detail-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:16px}.detail-head h3{font-size:22px}.detail-sub{font-family:var(--mono);font-size:12px;color:var(--sage-dim);margin-top:6px}
.detail-chips{display:flex;gap:8px;flex-wrap:wrap}
.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:24px 0;padding:22px 0;border-top:1px solid var(--line-soft);border-bottom:1px solid var(--line-soft)}
.field-ro{display:flex;flex-direction:column;gap:5px}.field-ro.span2{grid-column:1 / -1}.field-ro span{font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--sage-dim)}.field-ro strong{color:var(--cream);font-size:15px;font-weight:500}.field-ro strong.normal{font-weight:400;line-height:1.55;color:var(--sage)}
.returns-box{padding:24px;margin-bottom:22px}.returns-box h4{font-size:16px;margin-bottom:16px}
.returns-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:16px}
.returns-grid>div{display:flex;flex-direction:column;gap:4px}.returns-grid span{font-family:var(--mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--sage-dim)}.returns-grid strong{color:var(--cream);font-size:16px;font-family:var(--serif)}
.returns-notes{margin-top:16px;font-size:13px;color:var(--sage);line-height:1.55}
.action-box{padding:24px;margin-bottom:22px}
.action-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:14px}
.trail-box{padding:24px}.trail-box h4{font-size:16px;margin-bottom:18px}
.timeline{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.tl-item{position:relative;padding:0 0 22px 26px;border-left:1px solid var(--line-soft)}
.tl-item:last-child{border-left-color:transparent;padding-bottom:0}
.tl-dot{position:absolute;left:-5px;top:3px;width:9px;height:9px;border-radius:50%;background:var(--gold)}
.tl-body{display:flex;flex-direction:column;gap:3px}
.tl-top{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}.tl-action{color:var(--cream);font-size:14px;font-weight:600}.tl-time{font-family:var(--mono);font-size:11px;color:var(--sage-dim)}
.tl-by{font-size:12px;color:var(--sage-dim)}.tl-note{font-size:13px;color:var(--sage);font-style:italic;margin-top:2px}
.society-card{padding:28px}
.society-top{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:flex-start;margin-bottom:22px}.society-top h3{font-size:22px}
.society-figs{display:flex;gap:40px;flex-wrap:wrap;padding:20px 0;border-top:1px solid var(--line-soft);border-bottom:1px solid var(--line-soft);margin-bottom:20px}
.society-figs>div{display:flex;flex-direction:column;gap:6px}.society-fig{font-family:var(--serif);color:var(--cream);font-size:24px;font-weight:600}.society-fig.sm{font-size:16px}
.society-actions{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.returned-flag{color:var(--err);font-size:13px}
.src-badge{font-family:var(--mono);font-size:9px;letter-spacing:.08em;padding:2px 6px;border-radius:2px;margin-left:8px;vertical-align:middle;text-transform:uppercase}
.src-sekat{background:rgba(90,140,200,.16);color:#9DC0E8}.src-mccti{background:rgba(198,161,91,.14);color:var(--gold-soft)}
.ro-note{background:rgba(90,140,200,.08);border:1px solid rgba(90,140,200,.28);color:#B9D2EC;border-radius:6px;padding:16px 18px;font-size:13px;line-height:1.55;margin-bottom:22px}
.sekat{background:var(--ink-2);border:1px solid var(--line-soft);border-radius:8px;padding:28px;display:flex;flex-direction:column;gap:20px;max-width:660px}
.sekat-flow{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.node{flex:1;min-width:150px;background:var(--ink);border:1px solid var(--line-soft);border-radius:6px;padding:18px;display:flex;flex-direction:column;gap:6px;font-family:var(--serif);font-weight:600;font-size:16px;color:var(--cream)}
.node span{font-family:var(--sans);font-weight:400;font-size:12px;color:var(--sage-dim)}
.node.src{border-color:rgba(90,140,200,.4)}.node.dst{border-color:var(--line)}
.flow-arrow{display:flex;flex-direction:column;align-items:center;color:var(--gold);font-size:22px}.flow-arrow span{font-family:var(--mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--sage-dim)}
.sekat-status{border-top:1px solid var(--line-soft);border-bottom:1px solid var(--line-soft);padding:6px 0}
.comp-analysis{margin-top:16px;display:flex;flex-direction:column;gap:8px}.ca-lab{font-family:var(--mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--sage-dim)}
.ca-rows{display:flex;gap:18px;flex-wrap:wrap}.ca-row{font-size:13px;color:var(--sage)}.ca-row strong{color:var(--cream);font-family:var(--serif)}
.foot{border-top:1px solid var(--line-soft);background:var(--ink-2)}
.foot-top{max-width:1200px;margin:0 auto;padding:34px 40px;display:flex;align-items:center;justify-content:space-between;gap:24px;border-bottom:1px solid var(--line-soft);flex-wrap:wrap}
.foot-lockup{display:flex;align-items:center;gap:14px}.foot-lockup img{height:44px;width:auto}.foot-mccti{height:40px !important}
.foot-lockup-text{display:flex;flex-direction:column;line-height:1.3}.foot-lockup-text .lh-gov{color:var(--cream)}.foot-lockup-text .lh-min{color:var(--sage-dim)}
.foot-grid{max-width:1200px;margin:0 auto;padding:28px 40px 46px;display:grid;grid-template-columns:1.4fr 1fr;gap:30px}.foot-grid p{font-size:13px;line-height:1.6;color:var(--sage-dim)}.foot-conf{font-family:var(--mono);font-size:11px;letter-spacing:.04em}
@keyframes rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}@keyframes draw{to{transform:scaleX(1)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
@media(max-width:960px){.hero{grid-template-columns:1fr;padding-top:52px}.hero-watermark{display:none}.mod-grid{grid-template-columns:1fr 1fr}.persona-grid{grid-template-columns:1fr 1fr}.arc-steps{grid-template-columns:1fr}.arc-arrow{transform:rotate(90deg);justify-content:center;padding:2px 0}.foot-grid{grid-template-columns:1fr}.role-page-grid{grid-template-columns:1fr 1fr}.dash-grid{grid-template-columns:1fr}.statgrid{grid-template-columns:1fr 1fr}}
@media(max-width:680px){.letterhead{padding:9px 18px;gap:12px}.lh-min{display:none}.lh-seal{height:34px}.lh-mccti{height:32px}.nav{padding:13px 18px}.nav-links{display:none}.hero{padding:40px 18px 30px}section.lens,section.modules,section.arc,section.personas,section.quote{padding:56px 18px}.band{padding:22px 18px;gap:18px 26px}.mod-grid,.persona-grid{grid-template-columns:1fr}.lens-figs{gap:26px}.flow{padding:40px 18px 70px}.role-page-grid{grid-template-columns:1fr}.dash{padding:36px 18px 70px}.dash-hero{flex-wrap:wrap}.foot-top,.foot-grid{padding-left:18px;padding-right:18px}.acct-name{display:none}.form-grid{grid-template-columns:1fr}.detail-grid{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){*{animation:none !important;transition:none !important}.underline::after{transform:scaleX(1)}}
`
