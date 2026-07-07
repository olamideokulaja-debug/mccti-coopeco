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
  { n: '03', title: 'LASMECO Financing', lens: 'Access to finance', ai: false, body: 'The seven-step journey from intent to disbursement. Loans up to ₦10,000,000 at 9% per annum, eligibility gated on cooperative membership and platform compliance, human approval at disbursement.' },
  { n: '04', title: 'Digital Wallet & Payments', lens: 'No-cash by design', ai: false, body: 'Member savings and contributions, esusu and ajo cycles digitised, transfers, withdrawals and escrow, settled through Paystack and Flutterwave. Every flow traceable, no cash handling.' },
  { n: '05', title: 'Marketplace & Directory', lens: 'Commerce and search', ai: false, body: 'A searchable cooperative directory with premium listings and a coop-merchant marketplace, opening government-linked commerce to societies across all 57 LGAs and LCDAs.' },
  { n: '06', title: 'Governance Intelligence', lens: 'For leadership', ai: true, body: 'Real-time dashboards for the Director, Permanent Secretary, Honourable Commissioner and Governor’s office. Cooperative activity, loan performance, MSME health per LGA and fraud alerts.' },
]
const ROLES = [
  { id: 'society', icon: 'society', title: 'Cooperative Society', desc: 'Register, file returns, manage members and contributions.', defaultTitle: 'Society Administrator' },
  { id: 'member', icon: 'member', title: 'Member / MSME', desc: 'Onboard, get profiled and scored, save and apply for LASMECO.', defaultTitle: 'Cooperative Member' },
  { id: 'officer', icon: 'officer', title: 'Cooperative Officer', desc: 'Review, audit and approve across the 21 area offices.', defaultTitle: 'Cooperative Officer' },
  { id: 'auditor', icon: 'auditor', title: 'Auditor', desc: 'Examine financial returns and sign off on the audit trail.', defaultTitle: 'Cooperative Auditor' },
  { id: 'sterling', icon: 'partner', title: 'Sterling Bank', desc: 'KYC and assessment, 50% guarantee, and disbursement.', defaultTitle: 'Sterling Bank' },
  { id: 'boi', icon: 'boi', title: 'Bank of Industry', desc: 'Final approval and loan funding for LASMECO.', defaultTitle: 'Bank of Industry' },
  { id: 'assetmatrix', icon: 'vault', title: 'Asset Matrix MFB', desc: 'Platform revenue escrow and distribution.', defaultTitle: 'Asset Matrix MFB' },
  { id: 'accelerator', icon: 'accelerator', title: 'Accelerator Programme', desc: 'Recruit, train and prepare MSMEs; recommend loan amounts.', defaultTitle: 'Accelerator Programme' },
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
  'boi@lasmeco.ng': { name: 'Bank of Industry', title: 'BOI Loan Officer', office: 'Bank of Industry', role: 'boi' },
  'sterling@lasmeco.ng': { name: 'Sterling Bank', title: 'Sterling Loan Officer', office: 'Sterling Bank', role: 'sterling' },
  'escrow@assetmatrix.ng': { name: 'Asset Matrix MFB', title: 'Escrow Administrator', office: 'Asset Matrix Microfinance Bank', role: 'assetmatrix' },
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
const LOAN_STATUS_CLASS = { 'Applied': 'st-filed', 'In training': 'st-review', 'Shortlisted': 'st-review', 'Coop validated': 'st-review', 'Bank assessment': 'st-review', 'BOI approved': 'st-approved', 'Disbursed': 'st-approved', 'Repaying': 'st-approved', 'Completed': 'st-approved', 'Declined': 'st-returned', 'Default': 'st-returned' }
const TICKET_STATUS_CLASS = { 'Open': 'st-review', 'In progress': 'st-filed', 'Resolved': 'st-approved', 'Escalated': 'st-returned' }

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
const fmtNaira = (n) => '₦' + Number(n || 0).toLocaleString('en-NG')
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
async function kvDelete(key) {
  if (supa) { await supa.from('kv').delete().eq('key', key); return }
  const o = MEM.read(); delete o[key]; MEM.write(o)
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
  const record = { trackingId, source: 'MCCTI', regNo: null, status: 'Filed', cap15: 'Returns due', members: 0, contributions: 0, trustees: [], returns: null, registrationFee: COOP_FEES.registration, feeStatus: 'Invoiced', createdBy: ctx.email, createdAt: now, updatedAt: now, ...rec }
  await kvSet('coop:' + trackingId, record, ctx.uid)
  await addAudit({ trackingId, action: 'Registration filed', by: ctx.name, role: ctx.role, note: '' })
  return record
}
async function updateCoop(id, patch, ctx, action, note) {
  const cur = await getCoop(id); if (!cur) return null
  const next = { ...cur, ...patch, updatedAt: new Date().toISOString() }
  await kvSet('coop:' + id, next, cur.user_id)
  if (action) await addAudit({ trackingId: id, action, by: ctx.name, role: ctx.role, note: note || '' })
  if (patch.status && ['Approved', 'Returned'].includes(patch.status) && cur.createdBy && !cur.createdBy.includes('@system') && !cur.createdBy.includes('seed@')) {
    await notify({ to: cur.createdBy, title: 'Cooperative application ' + (patch.status === 'Approved' ? 'approved' : 'returned'), body: cur.name + ' (' + id + ')', event: 'coop' })
  }
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
  await syncFromQoop({ name: 'QooP gateway', role: 'officer', email: 'qoop@system' }, true)
  await seedDemoLoans()
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
async function getIntegration(name) { return (await kvGet('integration:' + (name || 'sekat'))) || { lastSync: null, count: 0 } }
async function fetchLiveRecords(endpoint) {
  try { const r = await fetch(endpoint); if (!r.ok) return null; const d = await r.json(); return (d && Array.isArray(d.data) && d.data.length) ? d.data : null } catch (e) { return null }
}
async function syncFromSekat(ctx, silent) {
  const live = await fetchLiveRecords('/api/sekat-sync')
  const feed = live || SEKAT_FEED
  let n = 0
  for (const r of feed) {
    const rec = sekatToCoop(r); await kvSet('coop:' + rec.trackingId, rec)
    if (!silent) await addAudit({ trackingId: rec.trackingId, action: 'Synced from SEKAT', by: ctx.name || 'SEKAT gateway', role: 'officer', note: 'One-way ingest' })
    n++
  }
  await kvSet('integration:sekat', { lastSync: new Date().toISOString(), count: n, source: live ? 'SEKAT live API' : 'SEKAT sample feed', live: Boolean(live) })
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
    boi: <><path {...p} d="M3 20h18M5 20v-9l5 3v-3l5 3v-3l4 2.5V20" /><path {...p} d="M8 8V4h3v2" /></>,
    vault: <><rect {...p} x="4" y="6" width="16" height="12" rx="2" /><circle {...p} cx="12" cy="12" r="3" /><path {...p} d="M12 9v-.5M12 15v.5M9 12h-.5M15 12h.5" /></>,
    accelerator: <><path {...p} d="M12 3c3 2 4.5 5 4.5 8.5L12 15l-4.5-3.5C7.5 8 9 5 12 3z" /><path {...p} d="M7.5 13l-2 4 3.2-1M16.5 13l2 4-3.2-1M12 9h.01" /></>,
    leadership: <path {...p} d="M4 20V4M4 20h16M8 20v-6m4 6V9m4 11v-8" />,
  }
  return <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">{paths[name] || paths.member}</svg>
}
function Avatar({ name, photo, size = 44 }) {
  if (photo) return <img className="avatar avatar-img" src={photo} alt="" style={{ width: size, height: size }} />
  return <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.36 }}>{initials(name)}</span>
}
const StatusChip = ({ status, kind }) => <span className={cx('chip', (kind === 'cap15' ? CAP15_CLASS : kind === 'loan' ? LOAN_STATUS_CLASS : kind === 'ticket' ? TICKET_STATUS_CLASS : STATUS_CLASS)[status] || 'st-review')}>{status}</span>
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
/* ---------------------- interactive building blocks ------------------- */
function useInView(threshold = 0.15) {
  const ref = useRef(null), [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); ob.disconnect() } }, { threshold })
    ob.observe(el); return () => ob.disconnect()
  }, [threshold])
  return [ref, inView]
}
function Reveal({ children, className = '', delay = 0, tag: Tag = 'div' }) {
  const [ref, inView] = useInView()
  return <Tag ref={ref} className={cx('reveal', inView && 'in', className)} style={delay ? { transitionDelay: delay + 'ms' } : undefined}>{children}</Tag>
}
function CountUp({ end, suffix = '', dur = 1500 }) {
  const [ref, inView] = useInView(0.4), [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return; let raf; const t0 = performance.now()
    const tick = (t) => { const p = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - p, 3); setVal(Math.round(end * e)); if (p < 1) raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf)
  }, [inView, end, dur])
  return <span ref={ref}>{val.toLocaleString('en-NG')}{suffix}</span>
}
function Accordion({ items }) {
  const [open, setOpen] = useState(0)
  return (
    <div className="acc">{items.map((it, i) => (
      <div className={cx('acc-item', open === i && 'open')} key={i}>
        <button className="acc-head" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}><span>{it.q}</span><span className="acc-ic" aria-hidden="true" /></button>
        <div className="acc-panel"><div className="acc-inner">{it.a}</div></div>
      </div>))}</div>
  )
}
const LEADERS_PRINCIPAL = [
  { img: '/leader-gov.jpg', initials: 'BS', name: 'Mr Babajide Sanwo-Olu', role: 'Executive Governor', body: 'Governor of Lagos State, championing the cooperative economy and the \u20A610 billion LASMECO financing initiative for MSME growth and inclusion.' },
  { img: '/leader-deputy.jpg', initials: 'OH', name: 'Dr Obafemi Hamzat', role: 'Deputy Governor', body: 'Deputy Governor of Lagos State, supporting the administration\u2019s economic empowerment and grassroots development agenda.' },
]
const LEADERS_MINISTRY = [
  { img: '/leader-hc.jpg', initials: 'FA', name: 'Mrs Folashade Ambrose-Medebem', role: 'Honourable Commissioner', body: 'Leads the Ministry of Commerce, Cooperatives, Trade and Investment, driving cooperative development, MSME growth and investment across Lagos State.' },
  { img: '/leader-ps.jpg', initials: 'BO', name: 'Mr Babatunde Onigbanjo', role: 'Permanent Secretary', body: 'Oversees the administration of the Ministry and the delivery of its cooperative, trade and investment mandate across the area offices.' },
  { img: '/leader-dir.jpg', initials: 'AA', name: 'Dr Adeyinka Adeyemi', role: 'Director of Cooperatives', body: 'Heads the Directorate of Cooperative Services, responsible for the registration, supervision and audit of cooperative societies State-wide.' },
]
const ABOUT_ITEMS = [
  { q: 'The Ministry (MCCTI)', a: 'The Ministry of Commerce, Cooperatives, Trade and Investment formulates policy that stimulates business growth, cooperative development and investment in Lagos State. Through its Directorate of Cooperative Services it registers, supervises and audits cooperative societies across the State’s area offices.' },
  { q: 'LASMECO', a: 'The Lagos State Access to Finance for SMEs through Cooperatives programme provides single-digit (9%) loans of up to ₦10 million to cooperative-based MSMEs, without conventional collateral, delivered with the Bank of Industry and Sterling Bank through a layered guarantee structure and sector Accelerators.' },
  { q: 'SEKAT registry', a: 'SEKAT is the source of the legacy cooperative registry and audit records. In CoopEco, data flows one way from SEKAT into the platform, giving a single consolidated registry that officers and leadership can see.' },
  { q: 'QooP analytics', a: 'QooP is the source of member and MSME analytics. Its KYC and enterprise data flows one way into CoopEco to power member profiles and explainable, advisory credit scoring for LASMECO.' },
  { q: 'The platform (CoopEco)', a: 'MCCTI CoopEco unifies the registry, member analytics, LASMECO financing, wallets and governance intelligence into a single Ministry-owned platform, with role-aware workspaces and live oversight for leadership.' },
]
function LeaderPhoto({ l }) {
  const [err, setErr] = useState(false)
  return (l.img && !err)
    ? <img src={l.img} alt={l.name} loading="lazy" onError={() => setErr(true)} />
    : <span className="leader-mono">{l.initials}</span>
}
function LeaderCard({ l, i }) {
  return (
    <Reveal className="leader-card" delay={i * 80} tag="article">
      <div className="leader-photo"><LeaderPhoto l={l} /><span className="leader-ring" aria-hidden="true" /></div>
      <div className="leader-body"><span className="leader-role">{l.role}</span><h3>{l.name}</h3><p>{l.body}</p></div>
    </Reveal>
  )
}
const PRICING = [
  { name: 'Cooperative registration', price: '\u20A650,000', unit: 'one-time', who: 'Cooperative societies', body: 'Join the platform and receive a tracking ID and a digital registry record.' },
  { name: 'Annual returns filing', price: '\u20A615,000', unit: 'per year', who: 'Cooperative societies', body: 'File statutory annual financial returns for CAP15 supervision.' },
  { name: 'CAP15 regulatory processing', price: '2.5%', unit: 'of surplus', who: 'Cooperative societies', body: 'Regulatory processing tied to declared operating surplus.' },
  { name: 'LASMECO disbursement portal', price: '2.5%', unit: 'of disbursed funds', who: 'Financing pool', body: 'Portal and processing fee on loans disbursed through the platform.' },
  { name: 'Directory & verification search', price: '\u20A62,000', unit: 'per lookup', who: 'Businesses & partners', body: 'Verify a cooperative\u2019s status and standing on demand.' },
  { name: 'Digital wallet & payments', price: '1%', unit: 'per transaction', who: 'Members & societies', body: 'Wallet funding, savings and esusu movements via connected payment rails.' },
  { name: 'Analytics & data subscriptions', price: 'Custom', unit: 'per agency', who: 'Agencies & partners', body: 'Aggregated, consented analytics on the cooperative economy.' },
  { name: 'Accelerator & partner onboarding', price: 'Programme fee', unit: 'success-based', who: 'Accelerators & partners', body: 'Onboarding and success-based fees for programme partners.' },
]
const LANGS = [['en', 'English'], ['yo', 'Yor\u00f9b\u00e1'], ['ig', 'Igbo'], ['ha', 'Hausa'], ['pcm', 'Naij\u00e1']]
const I18N = {
  'nav.home': { en: 'Home', yo: 'Il\u00e9', ig: '\u1ee4l\u1ecd', ha: 'Gida', pcm: 'Home' },
  'nav.modules': { en: 'Modules' },
  'nav.pricing': { en: 'Pricing', yo: 'Iye ow\u00f3', ig: '\u1ecc\u1e45\u1ee5 ah\u1ecba', ha: 'Fara\u0161i', pcm: 'Price' },
  'nav.leadership': { en: 'Leadership', yo: 'A\u1e63\u00e1\u00e1j\u00fa', ig: 'Nd\u00fa', ha: 'Shugabanci', pcm: 'Leadership' },
  'nav.about': { en: 'About', yo: 'N\u00edpa wa', ig: 'Banyere any\u1ecb', ha: 'Game da mu', pcm: 'About us' },
  'nav.platform': { en: 'Platform' },
  'nav.verify': { en: 'Verify a co-op', yo: '\u1e62\u00e0y\u1eb9\u0300w\u00f2 \u1eb9gb\u1eb9\u0301', ig: 'Nyochaa \u00f2t\u00f9', ha: 'Tabbatar da \u0199ungiya', pcm: 'Check co-op' },
  'cta.enter': { en: 'Enter platform', yo: 'W\u1ecd in\u00fa', ig: 'Banye', ha: 'Shiga', pcm: 'Enter' },
  'hero.h1': { en: 'One State. One cooperative economy. One system.', yo: '\u00ccp\u00ednl\u1eb9\u0300 kan. \u1eccr\u1ecd\u0300-aj\u00e9 \u00e0j\u1ecd kan. \u00c8t\u00f2 kan.', ig: 'Otu Steeti. Otu ak\u1ee5\u0300 na \u1ee5ba \u00f2t\u00f9. Otu usoro.', ha: 'Jiha \u0257aya. Tattalin arziki \u0257aya. Tsari \u0257aya.', pcm: 'One State. One cooperative economy. One system.' },
  'hero.cta': { en: 'Which best describes you?', yo: '\u00c8wo l\u00f3 b\u00e1 \u1ecd mu?', ig: 'Kedu nke kacha k\u1ecdwaa g\u1ecb?', ha: 'Wanne ya fi bayyana ka?', pcm: 'Which one be you?' },
  'hero.ghost': { en: 'See the modules', yo: 'Wo \u00e0w\u1ecdn m\u00f3d\u00f9', ig: 'Lee modul', ha: 'Duba kayan aiki', pcm: 'See di modules' },
}
function t(key, lang) { const e = I18N[key]; if (!e) return key; return e[lang] || e.en || key }
function Landing({ area, setArea, onEnter, lang = 'en', tab = 'home', onTab }) {
  const current = AREA_LENS.find((a) => a.id === area) || AREA_LENS[0]
  useEffect(() => { if (typeof window !== 'undefined') window.scrollTo({ top: 0 }) }, [tab])
  return (
    <main id="top" className={cx(tab !== 'home' && 'landing-sub')}>
      {tab === 'home' && (<>
        <section className="hero">
          <img className="hero-watermark" src="/seal-watermark.png" alt="" aria-hidden="true" />
          <div className="hero-copy">
            <p className="eyebrow"><span className="eb-dot" />Lagos State &middot; A core economic governance reform</p>
            <h1>{lang === 'en' ? <>One State.<br />One cooperative economy.<br /><span className="underline">One system.</span></> : t('hero.h1', lang)}</h1>
            <p className="lead">13,000 registered cooperatives and 150,000+ members sit across two separate systems and a credit programme that cannot see them. MCCTI CoopEco consolidates the registry, member analytics, LASMECO financing, wallets and governance intelligence into a single, Ministry-owned platform.</p>
            <div className="hero-cta"><button className="btn btn-gold" onClick={onEnter}>{t('hero.cta', lang)}</button><button className="btn btn-ghost" onClick={() => onTab && onTab('modules')}>{t('hero.ghost', lang)}</button></div>
            {lang !== 'en' && <p className="lang-note">Translations are provisional and pending review by the Ministry\u2019s language team. Detailed content remains in English for now.</p>}
            <p className="hero-foot">Ministry-owned &middot; SPV-operated &middot; self-funding from Year 1</p>
          </div>
          <LiveRegister areaId={area} />
        </section>
        <section className="band" aria-label="Headline figures">
          {[[13000, '', 'Registered cooperatives'], [150000, '+', 'MSME members'], [97, '%', 'MSMEs currently informal'], [8, '', 'Platform revenue streams']].map(([n, suf, l]) => (<div className="band-item" key={l}><span className="band-fig"><CountUp end={n} suffix={suf} /></span><span className="band-lab">{l}</span></div>))}
          <div className="band-item"><span className="band-fig">₦655M<span className="band-arrow"> &rarr; </span>₦1B+</span><span className="band-lab">Year 1 to Year 3</span></div>
        </section>
        <section className="lens" id="lens">
          <div className="section-head"><p className="eyebrow">Area office lens</p><h2>See the cooperative economy, office by office</h2><p className="section-sub">Switch between a State-wide view and any of the 21 cooperative area offices. The underserved Ikorodu, Epe, Badagry and Ibeju-Lekki corridors are where formalisation has furthest to travel.</p></div>
          <div className="lens-tabs" role="tablist" aria-label="Area office">{AREA_LENS.map((a) => (<button key={a.id} role="tab" aria-selected={area === a.id} className={cx('lens-tab', area === a.id && 'is-on', a.corridor && 'is-corridor')} onClick={() => setArea(a.id)}>{a.label}</button>))}</div>
          <div className="lens-readout">
            <div className="lens-tag">{current.corridor && <span className="corridor-flag">Priority corridor</span>}<span className="lens-tag-text">{current.label} &middot; {current.tag}</span></div>
            <div className="lens-figs"><div><span className="lf-fig">{current.coops}</span><span className="lf-lab">Cooperatives</span></div><div><span className="lf-fig">{current.members}</span><span className="lf-lab">Members</span></div><div><span className="lf-fig">{current.active}</span><span className="lf-lab">Digitally active</span></div></div>
          </div>
        </section>
        <section className="explore">
          <div className="section-head"><p className="eyebrow">Explore</p><h2>Take a closer look</h2></div>
          <div className="explore-grid">{[['modules', 'Modules', 'The six modules the cooperative economy runs on'], ['platform', 'Platform', 'How the platform changes the arithmetic'], ['pricing', 'Pricing', 'Eight revenue streams, self-funding from Year 1'], ['leadership', 'Leadership', 'The stewards behind MCCTI CoopEco'], ['about', 'About', 'The institutions and programmes behind it']].map(([id, title, desc]) => (<button className="explore-card" key={id} onClick={() => onTab && onTab(id)}><span className="explore-title">{title}</span><span className="explore-desc">{desc}</span><span className="explore-arrow" aria-hidden="true">&rarr;</span></button>))}</div>
        </section>
        <section className="quote"><img className="quote-seal" src="/lagos-seal.png" alt="" aria-hidden="true" /><blockquote><p>&ldquo;This engagement marks a fundamental reset of the cooperative digitalisation agenda in Lagos State: one registry, one member record, one governance framework, owned by the Ministry.&rdquo;</p><cite>Directorate of Cooperative Services, MCCTI</cite></blockquote></section>
      </>)}
      {tab === 'modules' && (<section className="modules page" id="modules">
        <div className="section-head"><p className="eyebrow">Six modules, one platform</p><h2>Everything the cooperative economy runs on</h2></div>
        <div className="mod-grid">{MODULES.map((m) => (<article className="mod-card" key={m.n}><div className="mod-top"><span className="mod-n">{m.n}</span><span className="mod-lens">{m.lens}</span></div><h3>{m.title}</h3><p>{m.body}</p>{m.ai && <span className="mod-ai">Summarised by MCCTI CoopEco</span>}</article>))}</div>
        <div className="section-head" style={{ marginTop: '48px' }}><p className="eyebrow">Role-aware from the first screen</p><h2>Built for everyone who touches a cooperative</h2></div>
        <div className="persona-grid">{PERSONAS.map(([tt, d]) => (<div className="persona" key={tt}><span className="persona-t">{tt}</span><span className="persona-d">{d}</span></div>))}</div>
      </section>)}
      {tab === 'platform' && (<section className="arc page" id="arc">
        <div className="section-head"><p className="eyebrow">From fragmentation to ₦1 billion</p><h2>How the platform changes the arithmetic</h2></div>
        <div className="arc-steps">
          <div className="arc-step"><span className="arc-n">01</span><h4>The problem: fragmentation</h4><p>The registry, the analytics layer and LASMECO operate in isolation. Data is duplicated, revenue is uncollected, fraud goes undetected, and Government cannot see its own economy.</p></div>
          <div className="arc-arrow" aria-hidden="true">&rarr;</div>
          <div className="arc-step"><span className="arc-n">02</span><h4>The solution: one unified platform</h4><p>Registry, KYC, analytics, wallets, disbursement and dashboards in a single Ministry-owned system. KYC at onboarding, timestamped trails, escrow flows, finance as the reward for compliance.</p></div>
          <div className="arc-arrow" aria-hidden="true">&rarr;</div>
          <div className="arc-step"><span className="arc-n">03</span><h4>The return: self-funding IGR</h4><p>Eight revenue streams generate ₦655M in Year 1 and cross ₦1 billion by Year 3, at zero capital cost to the State, with full ownership retained by the Ministry.</p></div>
        </div>
      </section>)}
      {tab === 'pricing' && (<section className="pricing page" id="pricing">
        <div className="section-head"><p className="eyebrow"><span className="eb-dot" />Pricing</p><h2>Eight revenue streams, one self-funding platform</h2><p className="section-sub">Transparent, usage-based pricing that makes the platform self-funding from Year 1, at no capital cost to the State.</p></div>
        <div className="price-grid">{PRICING.map((pr, i) => (<Reveal className="price-card" tag="article" key={pr.name} delay={i * 45}><div className="price-top"><span className="price-amt">{pr.price}</span><span className="price-unit">{pr.unit}</span></div><h3>{pr.name}</h3><p className="price-who">{pr.who}</p><p>{pr.body}</p></Reveal>))}</div>
      </section>)}
      {tab === 'leadership' && (<section className="leaders page" id="leadership">
        <div className="section-head"><p className="eyebrow"><span className="eb-dot" />Leadership</p><h2>Stewards of the cooperative economy</h2><p className="section-sub">The State and Ministry leadership provide the policy direction, oversight and governance behind MCCTI CoopEco.</p></div>
        <p className="leader-group-lab">Executive leadership</p>
        <div className="leader-grid two">{LEADERS_PRINCIPAL.map((l, i) => <LeaderCard l={l} i={i} key={l.name} />)}</div>
        <p className="leader-group-lab">Ministry leadership</p>
        <div className="leader-grid">{LEADERS_MINISTRY.map((l, i) => <LeaderCard l={l} i={i} key={l.name} />)}</div>
      </section>)}
      {tab === 'about' && (<section className="about page" id="about">
        <div className="section-head"><p className="eyebrow"><span className="eb-dot" />About</p><h2>What sits behind the platform</h2><p className="section-sub">The institutions and programmes that MCCTI CoopEco brings together.</p></div>
        <Accordion items={ABOUT_ITEMS} />
      </section>)}
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
function AuthPage({ role, onDone, onBack, onPrivacy }) {
  const [mode, setMode] = useState('create'), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [name, setName] = useState('')
  const [busy, setBusy] = useState(false), [err, setErr] = useState(''), [pending, setPending] = useState(false), [agree, setAgree] = useState(false)
  const submit = async () => {
    setErr(''); 
    if (mode === 'create' && !agree) { setErr('Please consent to the processing of your data to continue.'); return }
    setBusy(true)
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
        {mode === 'create' && <label className="consent-check"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /><span>I consent to the processing of my data for cooperative administration, as described in the <button type="button" className="link-inline" onClick={onPrivacy}>Privacy notice</button>.</span></label>}
        <button className="btn btn-gold auth-submit" onClick={submit} disabled={busy}>{busy ? 'Please wait…' : (mode === 'create' ? 'Create account' : 'Sign in')}</button>
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
        <label className="field"><span>Total contributions (₦)</span><input type="number" value={f.contributions} onChange={set('contributions')} placeholder="0" /></label>
        <label className="field span2"><span>By-laws summary</span><textarea value={f.bylaws} onChange={set('bylaws')} placeholder="Objectives, governance structure, meeting cycle, admission and exit rules." rows={4} /></label>
      </div>
      {err && <p className="auth-err">{err}</p>}
      <div className="panel-actions"><button className="btn btn-gold" onClick={submit} disabled={busy}>{busy ? 'Filing…' : 'File registration'}</button></div>
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
        <label className="field"><span>Total income (₦)</span><input type="number" value={f.income} onChange={set('income')} placeholder="0" /></label>
        <label className="field"><span>Total expenses (₦)</span><input type="number" value={f.expenses} onChange={set('expenses')} placeholder="0" /></label>
        <label className="field"><span>Balance sheet total (₦)</span><input type="number" value={f.balanceSheet} onChange={set('balanceSheet')} placeholder="0" /></label>
        <label className="field"><span>Disposal of surplus (₦)</span><input type="number" value={f.disposalOfSurplus} onChange={set('disposalOfSurplus')} placeholder="0" /></label>
        <div className="field span2 computed"><span>Surplus / (deficit), computed</span><strong className={surplus < 0 ? 'neg' : ''}>{fmtNaira(surplus)}</strong></div>
        <label className="field span2"><span>Additional information</span><textarea value={f.notes} onChange={set('notes')} rows={3} placeholder="Trial balance notes, disclosures, any qualifications." /></label>
      </div>
      {err && <p className="auth-err">{err}</p>}
      <div className="panel-actions"><button className="btn btn-gold" onClick={submit} disabled={busy}>{busy ? 'Filing…' : 'Submit returns for audit'}</button></div>
      <p className="panel-note">Annual returns filing fee: {fmtNaira(COOP_FEES.annualReturns)} per year. CAP15 regulatory processing at 2.5% of surplus applies. This is not legal advice.</p>
    </div>
  )
}

/* --------------------------- Stage 3: detail -------------------------- */
function AuditTrail({ trackingId, refreshKey }) {
  const [items, setItems] = useState(null)
  useEffect(() => { let live = true; listAudit(trackingId).then((r) => live && setItems(r)); return () => { live = false } }, [trackingId, refreshKey])
  if (!items) return <p className="muted-line">Loading trail…</p>
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
  const canExamine = ctx.role === 'officer' || ctx.role === 'leadership'
  const canDecide = ctx.role === 'leadership'
  const canAudit = ctx.role === 'auditor' || ctx.role === 'officer'
  const act = async (patch, action, needNote) => {
    if (needNote && !note.trim()) { alert('Add a note explaining the decision.'); return }
    setBusy(true); const next = await updateCoop(c.trackingId, patch, ctx, action, note.trim()); setC(next); setNote(''); setRk((k) => k + 1); setBusy(false); onChanged && onChanged()
  }
  const examineReturns = async () => { setBusy(true); const next = await updateCoop(c.trackingId, { cap15: 'Compliant' }, ctx, 'Returns examined and signed off', note.trim()); setC(next); setNote(''); setRk((k) => k + 1); setBusy(false); onChanged && onChanged() }
  return (
    <div className="detail">
      <div className="detail-head">
        <div><h3>{c.name}</h3><p className="detail-sub">{c.trackingId}{c.regNo ? ' · Reg. ' + c.regNo : ''} &middot; {c.areaOffice} area office &middot; {c.sector}</p></div>
        <button className="link-back" onClick={onClose}>&larr; Back to list</button>
      </div>
      <div className="detail-chips"><StatusChip status={c.status} /><StatusChip status={c.cap15} kind="cap15" /><SourceBadge source={c.source} /></div>
      <div className="detail-grid">
        <div className="field-ro"><span>Custodian</span><strong>{c.custodian || '—'}</strong></div>
        <div className="field-ro"><span>Trustees</span><strong>{(c.trustees || []).join(', ') || '—'}</strong></div>
        <div className="field-ro"><span>Members</span><strong>{Number(c.members || 0).toLocaleString('en-NG')}</strong></div>
        <div className="field-ro"><span>Contributions</span><strong>{fmtNaira(c.contributions)}</strong></div>
        {c.bank && <div className="field-ro span2"><span>Bank information</span><strong>{c.bank.name}{c.bank.accountName ? ' · ' + c.bank.accountName : ''}{c.bank.accountNumber ? ' · ' + c.bank.accountNumber : ''}</strong></div>}
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
          {(c.returns.examinedBy || c.returns.approvedBy) && <p className="muted-line">Examined by {c.returns.examinedBy || '—'} &middot; Approved by {c.returns.approvedBy || '—'}{c.returns.signature ? ' · Signature ' + c.returns.signature : ''}</p>}
        </div>
      )}

      {c.source === 'SEKAT' && <div className="ro-note">This society is mirrored from SEKAT (read-only). Registration and audit changes are made in SEKAT and flow into MCCTI on the next sync. Data moves one way, SEKAT into MCCTI.</div>}

      {c.source !== 'SEKAT' && (canExamine || canDecide || canAudit) && c.status !== 'Approved' && (
        <div className="action-box">
          <label className="field"><span>Decision note (required to approve, reject or sign off)</span><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Findings from the document review, conditions, or the reason for the decision." /></label>
          <div className="action-row">
            {canExamine && c.status === 'Filed' && <button className="btn btn-gold btn-sm" disabled={busy} onClick={() => act({ status: 'Under review' }, 'Begin examination')}>Begin examination</button>}
            {canDecide && (c.status === 'Filed' || c.status === 'Under review') && <button className="btn btn-gold btn-sm" disabled={busy} onClick={() => act({ status: 'Approved' }, 'Application approved by leadership', true)}>Approve &amp; sign off</button>}
            {canDecide && (c.status === 'Filed' || c.status === 'Under review' || c.status === 'Returned') && <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => act({ status: 'Returned' }, 'Application rejected / returned by leadership', true)}>Reject / return</button>}
            {canAudit && c.returns && c.cap15 === 'Under audit' && <button className="btn btn-outline btn-sm" disabled={busy} onClick={examineReturns}>Examine returns &amp; sign off</button>}
          </div>
          {canExamine && !canDecide && <p className="panel-note">You can examine and record findings. Final approval or rejection of the application is made by MCCTI leadership after reviewing all documents.</p>}
        </div>
      )}

      <div className="trail-box"><h4>Documents</h4><DocumentsPanel coopId={c.trackingId} ctx={ctx} canVerify={canExamine} canUpload={canExamine} /></div>
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
  const load = () => getIntegration('sekat').then(setInfo)
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
        <div className="status-row"><span>Connection</span><span className={cx('pill', info?.live ? 'ok' : 'muted')}>{info?.live ? 'Live API' : 'Sample feed' + (hasSupabase ? '' : ' (demo)')}</span></div>
        <div className="status-row"><span>Last sync</span><span className="mono">{info?.lastSync ? fmtDate(info.lastSync) : 'Never'}</span></div>
        <div className="status-row"><span>Societies ingested</span><span className="mono">{info?.count ?? 0}</span></div>
      </div>
      <button className="btn btn-gold btn-sm" onClick={run} disabled={busy}>{busy ? 'Syncing…' : 'Run SEKAT sync'}</button>
      <p className="panel-note">Data flows one way, from SEKAT into MCCTI. Synced societies are read-only here. When SEKAT_API_URL and SEKAT_API_KEY are set, the platform pulls the live SEKAT registry automatically; until then it ingests a representative sample that mirrors the SEKAT dataset (registration, custodian, trustees, bank and full audit inputs with examination, approval and signature). Compliance: data flow, retention and NDPR handling to be governed by the SEKAT integration agreement. This is not legal advice.</p>
    </div>
  )
}
function OfficerWorkspace({ ctx, section }) {
  const [coops, reload] = useRegistry()
  const [sel, setSel] = useState(null), [loanSel, setLoanSel] = useState(null)
  const [loans, reloadLoans] = useLoans()
  if (!coops) return <p className="muted-line">Loading registry\u2026</p>
  if (sel) return <CoopDetail coop={sel} ctx={ctx} onClose={() => { setSel(null); reload() }} onChanged={reload} />
  if (loanSel) return <LoanDetail loan={loanSel} ctx={ctx} onClose={() => { setLoanSel(null); reloadLoans() }} onChanged={reloadLoans} />
  const queue = coops.filter((c) => ['Filed', 'Under review', 'Returned'].includes(c.status))
  const byOffice = AREA_OFFICES.map((o) => [o, coops.filter((c) => c.areaOffice === o).length]).filter(([, n]) => n)
  const lasmecoQueue = (loans || []).filter((l) => l.status === 'Shortlisted')
  return (
    <div className="ws">
      {section === 'overview' && <OfficerOverview coops={coops} />}
      {section === 'queue' && <CoopTable coops={queue} onOpen={setSel} />}
      {section === 'all' && <CoopTable coops={coops} onOpen={setSel} />}
      {section === 'members' && <MembersAnalytics />}
      {section === 'lasmeco' && (!loans ? <p className="muted-line">Loading\u2026</p> : <><p className="muted-line">Applications awaiting cooperative validation and 25% guarantee. Open one to validate.</p><LoanTable loans={lasmecoQueue.length ? lasmecoQueue : loans} onOpen={setLoanSel} /></>)}
      {section === 'offices' && <div className="rtable-wrap"><table className="rtable"><thead><tr><th>Area office</th><th>Societies</th></tr></thead><tbody>{byOffice.map(([o, n]) => (<tr key={o}><td>{o}</td><td className="mono">{n}</td></tr>))}</tbody></table></div>}
      {section === 'audit' && <OfficerAuditLog />}
      {section === 'reports' && <ReportsPanel role="officer" />}
      {section === 'risk' && <RiskPanel />}
      {section === 'integrations' && <IntegrationsPanel ctx={ctx} onSynced={reload} />}
    </div>
  )
}
function OfficerAuditLog() {
  const [items, setItems] = useState(null)
  useEffect(() => { listAudit().then((r) => setItems(r.slice(0, 40))) }, [])
  if (!items) return <p className="muted-line">Loading…</p>
  if (!items.length) return <p className="muted-line">No activity yet.</p>
  return <div className="rtable-wrap"><table className="rtable"><thead><tr><th>When</th><th>Action</th><th>By</th><th>Society</th></tr></thead><tbody>{items.map((a, i) => (<tr key={i}><td className="mono">{fmtDate(a.at)}</td><td>{a.action}</td><td>{a.by}</td><td className="mono">{a.trackingId}</td></tr>))}</tbody></table></div>
}
function AuditorWorkspace({ ctx, section }) {
  const [coops, reload] = useRegistry()
  const [sel, setSel] = useState(null)
  if (!coops) return <p className="muted-line">Loading returns\u2026</p>
  if (sel) return <CoopDetail coop={sel} ctx={ctx} onClose={() => { setSel(null); reload() }} onChanged={reload} />
  const withReturns = coops.filter((c) => c.returns)
  return (
    <div className="ws">
      {section === 'overview' && <AuditorOverview coops={coops} />}
      {section === 'returns' && (withReturns.length ? <CoopTable coops={withReturns} onOpen={setSel} /> : <p className="muted-line">No returns have been filed yet.</p>)}
      {section === 'all' && <CoopTable coops={coops} onOpen={setSel} />}
    </div>
  )
}
/* ---------------------------- charts + analytics ---------------------- */
const CHART_C = { green: '#3E9E6B', gold: '#C6A15B', teal: '#4FA3A0', slate: '#7C858C', amber: '#D0975A', plum: '#9A7AA0', red: '#C0533A' }
function Donut({ data, size = 150, thickness = 20, centerTop, centerBottom }) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1
  const r = (size - thickness) / 2, circ = 2 * Math.PI * r
  let off = 0
  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line-soft)" strokeWidth={thickness} />
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {data.map((d, i) => { const dash = (d.value / total) * circ; const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={d.color} strokeWidth={thickness} strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-off} strokeLinecap="butt" />; off += dash; return el })}
        </g>
        <text x="50%" y="46%" textAnchor="middle" className="donut-c1">{centerTop}</text>
        <text x="50%" y="63%" textAnchor="middle" className="donut-c2">{centerBottom}</text>
      </svg>
      <div className="legend">{data.map((d, i) => (<div key={i} className="lg"><span className="lg-dot" style={{ background: d.color }} />{d.label}<b>{d.value}</b></div>))}</div>
    </div>
  )
}
function Bars({ data, unit }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  if (!data.length) return <p className="muted-line">No data yet.</p>
  return <div className="bars">{data.map((d, i) => (<div key={i} className="bar-row"><span className="bar-lab" title={d.label}>{d.label}</span><span className="bar-track"><span className="bar-fill" style={{ width: Math.max(2, d.value / max * 100) + '%', background: d.color || 'var(--gold)' }} /></span><span className="bar-val">{unit === 'naira' ? fmtNaira(d.value) : d.value}</span></div>))}</div>
}
function MiniArea({ points, color = CHART_C.green }) {
  const w = 300, h = 80, max = Math.max(1, ...points), n = points.length
  if (!n) return null
  const step = n > 1 ? w / (n - 1) : w
  const xy = points.map((v, i) => [i * step, h - (v / max) * (h - 12) - 6])
  const line = 'M' + xy.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L ')
  const area = line + ` L ${w} ${h} L 0 ${h} Z`
  return <svg viewBox={`0 0 ${w} ${h}`} className="miniarea" preserveAspectRatio="none"><path d={area} fill={color} opacity=".14" /><path d={line} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" /></svg>
}
function OfficerOverview({ coops }) {
  const status = [['Approved', CHART_C.green], ['Under review', CHART_C.gold], ['Filed', CHART_C.slate], ['Returned', CHART_C.red]].map(([s, c]) => ({ label: s, value: coops.filter((x) => x.status === s).length, color: c })).filter((d) => d.value)
  const cap = [['Compliant', CHART_C.green], ['Under audit', CHART_C.slate], ['Returns due', CHART_C.gold]].map(([s, c]) => ({ label: s, value: coops.filter((x) => x.cap15 === s).length, color: c })).filter((d) => d.value)
  const offices = AREA_OFFICES.map((o) => ({ label: o, value: coops.filter((c) => c.areaOffice === o).length, color: CHART_C.green })).filter((d) => d.value).sort((a, b) => b.value - a.value).slice(0, 6)
  return (<div className="analytics"><StatCards coops={coops} /><div className="chart-grid">
    <section className="chart-card"><h4>Registration status</h4><Donut data={status} centerTop={String(coops.length)} centerBottom="societies" /></section>
    <section className="chart-card"><h4>CAP15 compliance</h4><Donut data={cap} centerTop={String(coops.filter((c) => c.cap15 === 'Compliant').length)} centerBottom="compliant" /></section>
    <section className="chart-card"><h4>Registry source</h4><Donut data={[{ label: 'SEKAT', value: coops.filter((c) => c.source === 'SEKAT').length, color: CHART_C.teal }, { label: 'MCCTI', value: coops.filter((c) => c.source !== 'SEKAT').length, color: CHART_C.gold }].filter((d) => d.value)} centerTop={String(coops.length)} centerBottom="total" /></section>
    <section className="chart-card wide"><h4>Societies by area office</h4><Bars data={offices} /></section>
  </div></div>)
}
function AuditorOverview({ coops }) {
  const cap = [['Compliant', CHART_C.green], ['Under audit', CHART_C.gold], ['Returns due', CHART_C.slate]].map(([s, c]) => ({ label: s, value: coops.filter((x) => x.cap15 === s).length, color: c })).filter((d) => d.value)
  const withReturns = coops.filter((c) => c.returns).length
  return (<div className="analytics">
    <div className="statgrid"><div className="stat"><span className="stat-fig">{withReturns}</span><span className="stat-lab">Returns filed</span></div><div className="stat"><span className="stat-fig">{coops.filter((c) => c.cap15 === 'Under audit').length}</span><span className="stat-lab">Awaiting examination</span></div><div className="stat"><span className="stat-fig">{coops.filter((c) => c.cap15 === 'Compliant').length}</span><span className="stat-lab">Signed off</span></div><div className="stat"><span className="stat-fig">{coops.length}</span><span className="stat-lab">Societies</span></div></div>
    <div className="chart-grid"><section className="chart-card"><h4>CAP15 compliance</h4><Donut data={cap} centerTop={String(coops.filter((c) => c.cap15 === 'Compliant').length)} centerBottom="compliant" /></section></div>
  </div>)
}
function LoanStageOverview({ loans, cards }) {
  const stages = ['Applied', 'In training', 'Shortlisted', 'Coop validated', 'Bank assessment', 'BOI approved', 'Disbursed'].map((s) => ({ label: s, value: loans.filter((l) => l.status === s).length, color: CHART_C.gold }))
  const sectors = Array.from(new Set(loans.map((l) => l.sector))).map((s) => ({ label: s, value: loans.filter((l) => l.sector === s).length, color: CHART_C.teal }))
  const sched = loans.filter((l) => (l.schedule || []).length)
  const outstanding = sched.reduce((a, l) => a + loanRepayState(l).outstanding, 0)
  const arrears = sched.reduce((a, l) => a + loanRepayState(l).arrears, 0)
  const repaid = sched.reduce((a, l) => a + loanRepayState(l).paid, 0)
  return (<div className="analytics">
    <div className="statgrid">{cards(loans).map(([lab, val]) => (<div className="stat" key={lab}><span className="stat-fig">{val}</span><span className="stat-lab">{lab}</span></div>))}</div>
    {sched.length ? <div className="statgrid"><div className="stat"><span className="stat-fig">{fmtNaira(outstanding)}</span><span className="stat-lab">Portfolio outstanding</span></div><div className="stat"><span className="stat-fig">{fmtNaira(repaid)}</span><span className="stat-lab">Repaid to date</span></div><div className="stat"><span className="stat-fig" style={arrears ? { color: 'var(--err)' } : undefined}>{fmtNaira(arrears)}</span><span className="stat-lab">In arrears</span></div><div className="stat"><span className="stat-fig">{sched.length}</span><span className="stat-lab">On repayment</span></div></div> : null}
    <div className="chart-grid"><section className="chart-card wide"><h4>Pipeline by stage</h4><Bars data={stages} /></section><section className="chart-card"><h4>By sector</h4><Bars data={sectors} /></section></div>
  </div>)
}
function SocietyOverview({ mine }) {
  const r = mine.returns
  const finance = r ? [{ label: 'Income', value: r.income || 0, color: CHART_C.green }, { label: 'Expenses', value: r.expenses || 0, color: CHART_C.gold }, { label: 'Surplus', value: Math.max(0, r.surplus || 0), color: CHART_C.teal }] : []
  return (<div className="analytics">
    <div className="kpi-row">
      <div className="kpi"><span className="kpi-fig">{Number(mine.members || 0).toLocaleString('en-NG')}</span><span className="kpi-lab">Members</span></div>
      <div className="kpi"><span className="kpi-fig">{fmtNaira(mine.contributions)}</span><span className="kpi-lab">Contributions</span></div>
      <div className="kpi"><span className="kpi-fig">{mine.cap15 || '\u2014'}</span><span className="kpi-lab">CAP15 status</span></div>
      <div className="kpi"><span className="kpi-fig">{mine.returns ? 'Filed' : 'Due'}</span><span className="kpi-lab">Annual returns</span></div>
    </div>
    {finance.length ? <div className="chart-grid"><section className="chart-card wide"><h4>Latest annual returns</h4><Bars data={finance} unit="naira" /></section></div> : <p className="muted-line">File your annual returns to see your financial summary here.</p>}
  </div>)
}
function MemberOverview({ mine, loans }) {
  const s = scoreMember(mine)
  return (<div className="analytics">
    <div className="kpi-row">
      <div className="kpi"><span className="kpi-fig">{s.score}</span><span className="kpi-lab">Credit score</span></div>
      <div className="kpi"><span className="kpi-fig">{s.band}</span><span className="kpi-lab">Risk band</span></div>
      <div className="kpi"><span className="kpi-fig">{fmtNaira(s.threshold)}</span><span className="kpi-lab">LASMECO indication</span></div>
      <div className="kpi"><span className="kpi-fig">{loans.length}</span><span className="kpi-lab">Applications</span></div>
    </div>
    <div className="chart-grid"><section className="chart-card wide"><h4>Credit score</h4><CreditScoreCard m={mine} /></section></div>
  </div>)
}
function AnalyticsDashboard() {
  const [coops, setCoops] = useState(null), [members, setMembers] = useState([]), [loans, setLoans] = useState([]), [wallets, setWallets] = useState([]), [tickets, setTickets] = useState([])
  useEffect(() => { listCoops().then(setCoops); listMembers().then(setMembers); listLoans().then(setLoans); kvList('wallet:').then(setWallets); listTickets().then(setTickets) }, [])
  if (!coops) return <p className="muted-line">Loading analytics\u2026</p>
  const scored = members.map((m) => scoreMember(m))
  const disbursed = loans.filter((l) => ['Disbursed', 'Repaying', 'Completed'].includes(l.status))
  const disbursedValue = disbursed.reduce((a, l) => a + (l.amountApproved || 0), 0)
  const funding = wallets.reduce((a, w) => a + (w.txns || []).filter((t) => t.type === 'topup').reduce((s, t) => s + (t.amount || 0), 0), 0)
  const regFees = coops.filter((c) => c.feeStatus === 'Paid').length * COOP_FEES.registration
  const returnsFees = coops.filter((c) => c.returns).length * COOP_FEES.annualReturns
  const portalFees = Math.round(disbursedValue * 0.025)
  const accrued = regFees + returnsFees + portalFees + Math.round(funding * 0.01)
  const avgScore = scored.length ? Math.round(scored.reduce((a, s) => a + s.score, 0) / scored.length) : 0
  const openTickets = tickets.filter((t) => t.status !== 'Resolved').length
  const withSched = loans.filter((l) => (l.schedule || []).length)
  const portfolioOutstanding = withSched.reduce((a, l) => a + loanRepayState(l).outstanding, 0)
  const portfolioArrears = withSched.reduce((a, l) => a + loanRepayState(l).arrears, 0)

  const statusData = [['Approved', CHART_C.green], ['Under review', CHART_C.gold], ['Filed', CHART_C.slate], ['Returned', CHART_C.red]].map(([s, c]) => ({ label: s, value: coops.filter((x) => x.status === s).length, color: c })).filter((d) => d.value)
  const cap15 = [['Compliant', CHART_C.green], ['Under audit', CHART_C.slate], ['Returns due', CHART_C.gold]].map(([s, c]) => ({ label: s, value: coops.filter((x) => x.cap15 === s).length, color: c })).filter((d) => d.value)
  const sourceData = [{ label: 'SEKAT', value: coops.filter((c) => c.source === 'SEKAT').length, color: CHART_C.teal }, { label: 'MCCTI', value: coops.filter((c) => c.source !== 'SEKAT').length, color: CHART_C.gold }].filter((d) => d.value)
  const offices = AREA_OFFICES.map((o) => ({ label: o, value: coops.filter((c) => c.areaOffice === o).length, color: CHART_C.green })).filter((d) => d.value).sort((a, b) => b.value - a.value).slice(0, 6)
  const bands = [['Prime', CHART_C.green], ['Strong', '#5FB07E'], ['Fair', CHART_C.gold], ['Building', CHART_C.amber], ['Thin file', CHART_C.slate]].map(([b, c]) => ({ label: b, value: scored.filter((s) => s.band === b).length, color: c })).filter((d) => d.value)
  const kyc = [['Verified', CHART_C.green], ['Partial', CHART_C.gold], ['Unverified', CHART_C.slate]].map(([s, c]) => ({ label: s, value: members.filter((m) => (m.kyc?.status || 'Unverified') === s).length, color: c })).filter((d) => d.value)
  const pipeline = ['Applied', 'In training', 'Shortlisted', 'Coop validated', 'Bank assessment', 'BOI approved', 'Disbursed'].map((s) => ({ label: s, value: loans.filter((l) => l.status === s).length, color: CHART_C.gold }))
  const sectors = Array.from(new Set(loans.map((l) => l.sector))).map((s) => ({ label: s, value: loans.filter((l) => l.sector === s).length, color: CHART_C.teal }))
  const split = SPV_SPLIT.map(([n, p], i) => ({ label: n, value: Math.round(accrued * p / 100), color: [CHART_C.green, CHART_C.gold, CHART_C.teal, CHART_C.plum, CHART_C.amber][i] }))
  const ticketData = [['Open', CHART_C.gold], ['In progress', CHART_C.slate], ['Escalated', CHART_C.red], ['Resolved', CHART_C.green]].map(([s, c]) => ({ label: s, value: tickets.filter((t) => t.status === s).length, color: c })).filter((d) => d.value)

  const now = new Date(), months = []
  for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); months.push({ key: d.getFullYear() + '-' + d.getMonth(), label: d.toLocaleString('en-GB', { month: 'short' }) }) }
  const regTrend = months.map((m) => coops.filter((c) => { const d = new Date(c.createdAt); return d.getFullYear() + '-' + d.getMonth() === m.key }).length)
  const trendTotal = regTrend.reduce((a, b) => a + b, 0)

  return (
    <div className="analytics">
      <div className="kpi-row">
        <div className="kpi"><span className="kpi-fig">{coops.length}</span><span className="kpi-lab">Cooperative societies</span></div>
        <div className="kpi"><span className="kpi-fig">{members.length}</span><span className="kpi-lab">Members profiled</span></div>
        <div className="kpi"><span className="kpi-fig">{fmtNaira(disbursedValue)}</span><span className="kpi-lab">LASMECO disbursed</span></div>
        <div className="kpi"><span className="kpi-fig">{fmtNaira(accrued)}</span><span className="kpi-lab">Escrow accrued</span></div>
        <div className="kpi"><span className="kpi-fig">{fmtNaira(funding)}</span><span className="kpi-lab">Payments processed</span></div>
        <div className="kpi"><span className="kpi-fig">{fmtNaira(portfolioOutstanding)}</span><span className="kpi-lab">Loan portfolio outstanding</span></div>
        <div className="kpi"><span className="kpi-fig" style={portfolioArrears ? { color: 'var(--err)' } : undefined}>{fmtNaira(portfolioArrears)}</span><span className="kpi-lab">In arrears</span></div>
        <div className="kpi"><span className="kpi-fig">{openTickets}</span><span className="kpi-lab">Open support tickets</span></div>
      </div>
      <div className="chart-grid">
        <section className="chart-card"><h4>Registration status</h4><Donut data={statusData} centerTop={String(coops.length)} centerBottom="societies" /></section>
        <section className="chart-card"><h4>CAP15 compliance</h4><Donut data={cap15} centerTop={String(coops.filter((c) => c.cap15 === 'Compliant').length)} centerBottom="compliant" /></section>
        <section className="chart-card"><h4>Registry source</h4><Donut data={sourceData} centerTop={String(coops.length)} centerBottom="total" /></section>
        <section className="chart-card"><h4>Societies by area office</h4><Bars data={offices} /></section>
        <section className="chart-card"><h4>Member credit bands</h4><Bars data={bands} /></section>
        <section className="chart-card"><h4>KYC status &middot; avg score {avgScore}</h4><Donut data={kyc} centerTop={String(avgScore)} centerBottom="avg score" /></section>
        <section className="chart-card wide"><h4>LASMECO pipeline</h4><Bars data={pipeline} /></section>
        <section className="chart-card"><h4>Applications by sector</h4><Bars data={sectors} /></section>
        <section className="chart-card"><h4>Escrow distribution ({fmtNaira(accrued)})</h4><Bars data={split} unit="naira" /></section>
        <section className="chart-card"><h4>Support tickets</h4>{ticketData.length ? <Donut data={ticketData} centerTop={String(tickets.length)} centerBottom="tickets" /> : <p className="muted-line">No tickets yet.</p>}</section>
        <section className="chart-card wide"><h4>Registrations, last 6 months ({trendTotal})</h4><MiniArea points={regTrend} /><div className="trend-x">{months.map((m) => <span key={m.key}>{m.label}</span>)}</div></section>
      </div>
      <p className="dash-foot">Live analytics across the cooperative economy. Figures update as societies register, members are profiled, and LASMECO loans move through the pipeline.</p>
    </div>
  )
}
function ViewAsBar({ onViewAs }) {
  const [coops, setCoops] = useState([]), [members, setMembers] = useState([])
  useEffect(() => { listCoops().then(setCoops); listMembers().then(setMembers) }, [])
  const titles = { officer: 'Cooperative Officer', auditor: 'Auditor', accelerator: 'Accelerator Programme', sterling: 'Sterling Bank', boi: 'Bank of Industry', assetmatrix: 'Asset Matrix MFB' }
  const pick = (e) => {
    const v = e.target.value; e.target.value = ''
    if (!v) return
    const [kind, id] = v.split('::')
    if (kind === 'role') onViewAs({ role: id, name: titles[id], office: 'Workspace preview', title: titles[id] })
    else if (kind === 'coop') { const c = coops.find((x) => x.trackingId === id); if (c) onViewAs({ role: 'society', name: c.name, email: c.createdBy, focusId: c.trackingId, office: c.areaOffice + ' area office', title: 'Cooperative Society' }) }
    else if (kind === 'member') { const m = members.find((x) => x.memberId === id); if (m) onViewAs({ role: 'member', name: m.name, focusId: m.memberId, office: m.coop, title: 'Member' }) }
  }
  return (
    <div className="switcher">
      <span className="switcher-lab">Open a workspace as</span>
      <select className="switcher-sel" onChange={pick} defaultValue="">
        <option value="" disabled>Select a role, society or member…</option>
        <optgroup label="Roles">{Object.entries(titles).map(([id, l]) => <option key={id} value={'role::' + id}>{l}</option>)}</optgroup>
        <optgroup label="Cooperative societies">{coops.map((c) => <option key={c.trackingId} value={'coop::' + c.trackingId}>{c.name}</option>)}</optgroup>
        <optgroup label="Members">{members.map((m) => <option key={m.memberId} value={'member::' + m.memberId}>{m.name}</option>)}</optgroup>
      </select>
    </div>
  )
}
function LeadershipOverview({ ctx, section, onViewAs }) {
  const [coops, reload] = useRegistry()
  const [sel, setSel] = useState(null)
  if (!coops) return <p className="muted-line">Loading overview\u2026</p>
  if (sel) return <CoopDetail coop={sel} ctx={ctx} onClose={() => { setSel(null); reload() }} onChanged={reload} />
  const pending = coops.filter((c) => c.source !== 'SEKAT' && ['Filed', 'Under review', 'Returned'].includes(c.status))
  return (
    <div className="ws">
      {section === 'overview' && <AnalyticsDashboard />}
      {section === 'applications' && (<><p className="muted-line">Review each application's documents, then approve or reject. Societies mirrored from SEKAT are managed in SEKAT.</p><CoopTable coops={pending.length ? pending : coops} onOpen={setSel} /></>)}
      {section === 'members' && <MembersAnalytics />}
      {section === 'lasmeco' && <LasmecoOverview ctx={ctx} />}
      {section === 'reports' && <ReportsPanel role="leadership" />}
      {section === 'risk' && <RiskPanel />}
      {section === 'sla' && <GovernanceSLA />}
      {section === 'viewas' && <ViewAsSwitcher onViewAs={onViewAs} />}
      {section === 'integrations' && <IntegrationsPanel ctx={ctx} onSynced={reload} />}
    </div>
  )
}
function SocietyWorkspace({ ctx, section }) {
  const [coops, reload] = useRegistry()
  const [mode, setMode] = useState('view') // view | register | returns
  if (!coops) return <p className="muted-line">Loading\u2026</p>
  const mine = ctx.focusId ? coops.find((c) => c.trackingId === ctx.focusId) : coops.find((c) => c.createdBy === ctx.email)
  if (mode === 'register') return <RegistrationForm ctx={ctx} onCancel={() => setMode('view')} onDone={() => { setMode('view'); reload() }} />
  if (mode === 'returns' && mine) return <ReturnsForm coop={mine} ctx={ctx} onCancel={() => setMode('view')} onDone={() => { setMode('view'); reload() }} />
  if (!mine) return (
    <div className="empty">
      <span className="empty-mark">&#9670;</span>
      <h3>Register your cooperative society</h3>
      <p>File your society once. You receive a tracking ID, MCCTI leadership reviews and approves it, and every step is recorded on the audit trail.</p>
      <button className="btn btn-gold" onClick={() => setMode('register')}>Register a society</button>
    </div>
  )
  return (
    <div className="ws">
      {section === 'overview' && <SocietyOverview mine={mine} />}
      {section === 'cooperative' && (<>
        {mine.source !== 'SEKAT' && mine.feeStatus !== 'Paid' && (
          <div className="fee-banner"><span>Registration fee <strong>{fmtNaira(mine.registrationFee || COOP_FEES.registration)}</strong> to join the platform is outstanding.</span><button className="btn btn-gold btn-sm" onClick={async () => { const r = await collectPayment({ email: ctx.email, amountNaira: mine.registrationFee || COOP_FEES.registration, purpose: 'Cooperative registration fee', metadata: { coopId: mine.trackingId } }); if (r.ok) { await payCoopFee(mine.trackingId, ctx); reload() } else if (!r.cancelled) { alert('Payment could not be completed. Please try again.') } }}>{PAYSTACK_PUBLIC ? 'Pay registration fee' : 'Pay now (demo)'}</button></div>
        )}
        <div className="society-card">
          <div className="society-top"><div><h3>{mine.name}</h3><p className="detail-sub">{mine.trackingId} &middot; {mine.areaOffice} area office &middot; {mine.sector}</p></div><div className="detail-chips"><StatusChip status={mine.status} /><StatusChip status={mine.cap15} kind="cap15" /></div></div>
          <div className="society-figs"><div><span className="lf-lab">Members</span><span className="society-fig">{Number(mine.members || 0).toLocaleString('en-NG')}</span></div><div><span className="lf-lab">Contributions</span><span className="society-fig">{fmtNaira(mine.contributions)}</span></div><div><span className="lf-lab">Custodian</span><span className="society-fig sm">{mine.custodian || '\u2014'}</span></div></div>
          <div className="society-actions">
            {mine.source === 'SEKAT' ? <span className="returned-flag" style={{ color: '#2E5C88' }}>Mirrored from SEKAT (read-only). Returns are filed in SEKAT.</span> : <button className="btn btn-gold btn-sm" onClick={() => setMode('returns')}>{mine.returns ? 'Re-file annual returns' : 'File annual returns'}</button>}
            {mine.status === 'Returned' && <span className="returned-flag">Returned for correction. Review the trail and re-file.</span>}
          </div>
        </div>
        <div className="returns-box"><h4>Documents</h4><DocumentsPanel coopId={mine.trackingId} ctx={ctx} canVerify={false} canUpload={mine.source !== 'SEKAT'} /></div>
        <div className="trail-box"><h4>Audit trail</h4><AuditTrail trackingId={mine.trackingId} refreshKey={coops.length} /></div>
      </>)}
      {section === 'savings' && (mine.source !== 'SEKAT' ? <div className="returns-box"><h4>Savings &amp; esusu</h4><CoopEsusu coop={mine} ctx={ctx} /></div> : <p className="muted-line">Savings are managed in SEKAT for mirrored societies.</p>)}
    </div>
  )
}
function CapabilityPreview({ role }) {
  const caps = ROLE_CAPS[role] || ROLE_CAPS.member
  return (
    <div className="ws"><section className="dash-card dash-caps"><h3>Your workspace</h3><p className="dash-card-sub">Tailored to your role. These open as the modules go live from the next stage.</p><ul className="caps">{caps.map((c) => (<li key={c}><span className="cap-tick">&#9670;</span>{c}<span className="cap-soon">Soon</span></li>))}</ul></section></div>
  )
}

/* =============================== STAGE 4 ===============================
   Member & MSME Analytics (QooP layer). QooP is treated exactly like SEKAT:
   a one-way source (QooP -> MCCTI). Members and their MSME profiles flow in,
   are mirrored read-only with a QOOP badge, and an explainable credit score is
   computed. Plus GDPR controls (consent, access, portability, erasure) and a
   leadership "view as" switcher across all users.
   ====================================================================== */

const GENDERS = ['Female', 'Male', 'Prefer not to say']
/* --------------- QooP -> MCCTI integration (one-way analytics) ------------
   QooP (qoop.ng) is a smart cooperative platform: members save and invest, use
   the QooP Wallet (a BNPL / credit wallet), buy on credit via QooP Mall, borrow
   without collateral, pay utilities and transfer funds. QooP therefore holds rich
   financial-behaviour data. It flows one way into MCCTI to power member analytics
   and explainable credit scoring. The sample feed stands in for the live QooP API
   until QOOP_API_URL and QOOP_API_KEY are configured. */
const QOOP_FEED = [
  { ref: 'QP-10231', name: 'Adaeze Okonkwo', coop: 'Ikeja Grand Traders Cooperative', sector: 'Trade', phone: '0803xxxx210', gender: 'Female', kyc: { bvnVerified: true, ninVerified: true }, msme: { monthlyTurnover: 620000, employees: 4, cashFlow: 240000, customerBase: 180, yearsInOperation: 6 }, qoop: { walletActive: true, savingsBalance: 480000, bnplLimit: 300000, creditPurchases: 14, creditOutstanding: 45000, loansTaken: 3, onTimeRepaymentRate: 96, utilityPaymentsMonthly: 8, monthsActive: 34 } },
  { ref: 'QP-10232', name: 'Emeka Balogun', coop: 'Idumota Textile Merchants Coop', sector: 'Trade', phone: '0806xxxx554', gender: 'Male', kyc: { bvnVerified: true, ninVerified: true }, msme: { monthlyTurnover: 1450000, employees: 9, cashFlow: 520000, customerBase: 420, yearsInOperation: 11 }, qoop: { walletActive: true, savingsBalance: 1200000, bnplLimit: 500000, creditPurchases: 40, creditOutstanding: 120000, loansTaken: 5, onTimeRepaymentRate: 99, utilityPaymentsMonthly: 12, monthsActive: 48 } },
  { ref: 'QP-10233', name: 'Ngozi Underwood', coop: 'Surulere United Artisans Coop', sector: 'Artisan', phone: '0705xxxx018', gender: 'Female', kyc: { bvnVerified: true, ninVerified: false }, msme: { monthlyTurnover: 210000, employees: 2, cashFlow: 60000, customerBase: 55, yearsInOperation: 3 }, qoop: { walletActive: true, savingsBalance: 90000, bnplLimit: 80000, creditPurchases: 6, creditOutstanding: 15000, loansTaken: 1, onTimeRepaymentRate: 88, utilityPaymentsMonthly: 4, monthsActive: 18 } },
  { ref: 'QP-10234', name: 'Tunde Salami', coop: 'Ibeju-Lekki Farmers Multipurpose Coop', sector: 'Agriculture', phone: '0813xxxx777', gender: 'Male', kyc: { bvnVerified: false, ninVerified: false }, msme: { monthlyTurnover: 95000, employees: 1, cashFlow: 20000, customerBase: 30, yearsInOperation: 2 }, qoop: { walletActive: false, savingsBalance: 20000, bnplLimit: 0, creditPurchases: 1, creditOutstanding: 0, loansTaken: 0, onTimeRepaymentRate: 0, utilityPaymentsMonthly: 1, monthsActive: 6 } },
  { ref: 'QP-10235', name: 'Blessing Achebe', coop: 'Ikeja Grand Traders Cooperative', sector: 'Trade', phone: '0809xxxx341', gender: 'Female', kyc: { bvnVerified: true, ninVerified: true }, msme: { monthlyTurnover: 880000, employees: 6, cashFlow: 330000, customerBase: 260, yearsInOperation: 8 }, qoop: { walletActive: true, savingsBalance: 620000, bnplLimit: 400000, creditPurchases: 22, creditOutstanding: 60000, loansTaken: 4, onTimeRepaymentRate: 94, utilityPaymentsMonthly: 10, monthsActive: 30 } },
]
const qoopIdFor = (ref) => 'QOOP-' + String(ref).replace(/[^A-Za-z0-9]+/g, '-')
function qoopToMember(r) {
  const now = new Date().toISOString()
  return { memberId: qoopIdFor(r.ref), source: 'QOOP', ref: r.ref, name: r.name, coop: r.coop, sector: r.sector, phone: r.phone, gender: r.gender, kyc: { ...r.kyc, status: (r.kyc.bvnVerified && r.kyc.ninVerified) ? 'Verified' : (r.kyc.bvnVerified || r.kyc.ninVerified) ? 'Partial' : 'Unverified' }, msme: r.msme, qoop: r.qoop || null, createdBy: 'qoop@system', createdAt: now, syncedAt: now }
}
async function listMembers() { return (await kvList('member:')).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)) }
async function getMember(id) { return await kvGet('member:' + id) }
async function createMember(rec, ctx) {
  const memberId = 'M-' + String(Math.floor(Math.random() * 1000000)).padStart(6, '0'); const now = new Date().toISOString()
  const bvnVerified = rec.bvnVerified != null ? Boolean(rec.bvnVerified) : Boolean(rec.bvn && rec.bvn.length >= 10)
  const ninVerified = rec.ninVerified != null ? Boolean(rec.ninVerified) : Boolean(rec.nin && rec.nin.length >= 10)
  const record = { memberId, source: 'MCCTI', name: rec.name, coop: rec.coop, sector: rec.sector, phone: rec.phone, gender: rec.gender, kyc: { bvn: rec.bvn ? 'on file' : '', nin: rec.nin ? 'on file' : '', bvnVerified, ninVerified, status: (bvnVerified && ninVerified) ? 'Verified' : (bvnVerified || ninVerified) ? 'Partial' : 'Unverified' }, msme: { monthlyTurnover: Number(rec.monthlyTurnover) || 0, employees: Number(rec.employees) || 0, cashFlow: Number(rec.cashFlow) || 0, customerBase: Number(rec.customerBase) || 0, yearsInOperation: Number(rec.yearsInOperation) || 0 }, createdBy: ctx.email, createdAt: now }
  await kvSet('member:' + memberId, record, ctx.uid)
  await notify({ to: ctx.email, title: 'Welcome to MCCTI CoopEco', body: 'Your member profile is set up. You can now apply for LASMECO finance.', event: 'member', phone: rec.phone })
  return record
}
async function syncFromQoop(ctx, silent) {
  const live = await fetchLiveRecords('/api/qoop-sync')
  const feed = live || QOOP_FEED
  let n = 0
  for (const r of feed) { const rec = qoopToMember(r); await kvSet('member:' + rec.memberId, rec); n++ }
  await kvSet('integration:qoop', { lastSync: new Date().toISOString(), count: n, source: live ? 'QooP live API' : 'QooP sample feed', live: Boolean(live) })
  return n
}

/* explainable, human-reviewable credit score (advisory; not a solely automated
   decision - a cooperative officer approves before it affects LASMECO) */
const BAND_CLASS = { Prime: 'st-approved', Strong: 'st-approved', Fair: 'st-review', Building: 'st-review', 'Thin file': 'st-filed' }
function scoreMember(m) {
  const t = Number(m?.msme?.monthlyTurnover) || 0, emp = Number(m?.msme?.employees) || 0, yrs = Number(m?.msme?.yearsInOperation) || 0, cf = Number(m?.msme?.cashFlow) || 0
  const kyc = (m?.kyc?.bvnVerified ? 1 : 0) + (m?.kyc?.ninVerified ? 1 : 0)
  const q = m?.qoop || null
  const repayRate = q ? Number(q.onTimeRepaymentRate) || 0 : 0, qSav = q ? Number(q.savingsBalance) || 0 : 0
  const cT = Math.min(180, (t / 500000) * 180), cC = Math.min(70, (cf / 300000) * 70), cY = Math.min(70, yrs * 14), cE = Math.min(50, emp * 8), cK = kyc * 50
  const cR = q ? Math.min(60, repayRate / 100 * 60) : 0, cS = q ? Math.min(40, qSav / 500000 * 40) : 0
  let s = Math.max(300, Math.min(850, Math.round(300 + cT + cC + cY + cE + cK + cR + cS)))
  const band = s >= 740 ? 'Prime' : s >= 670 ? 'Strong' : s >= 580 ? 'Fair' : s >= 500 ? 'Building' : 'Thin file'
  const threshold = band === 'Prime' ? 10000000 : band === 'Strong' ? 6000000 : band === 'Fair' ? 3000000 : band === 'Building' ? 1000000 : 300000
  const factors = [
    { label: 'Monthly turnover', display: fmtNaira(t), pct: Math.round(cT / 180 * 100) },
    { label: 'Cash flow buffer', display: fmtNaira(cf), pct: Math.round(cC / 70 * 100) },
    { label: 'Years in operation', display: yrs + ' yr' + (yrs === 1 ? '' : 's'), pct: Math.round(cY / 70 * 100) },
    { label: 'Employees', display: String(emp), pct: Math.round(cE / 50 * 100) },
    { label: 'KYC verified', display: kyc + '/2', pct: Math.round(cK / 100 * 100) },
  ]
  if (q) {
    factors.push({ label: 'QooP repayment history', display: repayRate + '% on time', pct: Math.round(cR / 60 * 100) })
    factors.push({ label: 'QooP savings', display: fmtNaira(qSav), pct: Math.round(cS / 40 * 100) })
  }
  return { score: s, band, threshold, factors }
}

/* -------------------------------- GDPR -------------------------------- */
function downloadJson(filename, obj) { const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url) }
/* ---- Reporting & exports ------------------------------------------------- */
function toCSV(rows) {
  if (!rows || !rows.length) return ''
  const headers = Object.keys(rows[0])
  const esc = (v) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
  return [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n')
}
function downloadCSV(filename, rows) {
  if (!rows.length) { alert('Nothing to export yet.'); return }
  const blob = new Blob([toCSV(rows)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
}
async function reportCoops() { return (await listCoops()).map((x) => ({ trackingId: x.trackingId, name: x.name, source: x.source, areaOffice: x.areaOffice, sector: x.sector, status: x.status, cap15: x.cap15, members: x.members || 0, contributions: x.contributions || 0, feeStatus: x.feeStatus || '', registered: x.createdAt ? fmtDate(x.createdAt) : '' })) }
async function reportMembers() { return (await listMembers()).map((x) => { const s = scoreMember(x); return { memberId: x.memberId, name: x.name, source: x.source, coop: x.coop, sector: x.sector, kyc: (x.kyc && x.kyc.status) || '', score: s.score, band: s.band, monthlyTurnover: (x.msme && x.msme.monthlyTurnover) || 0, qoopRepaymentPct: x.qoop ? x.qoop.onTimeRepaymentRate : '', qoopSavings: x.qoop ? x.qoop.savingsBalance : '' } }) }
async function reportLoans() { return (await listLoans()).map((x) => { const rp = (x.schedule || []).length ? loanRepayState(x) : null; return { loanId: x.loanId, member: x.memberName, coop: x.coop, sector: x.sector, status: x.status, requested: x.amountRequested || 0, approved: x.amountApproved || 0, tenorMonths: x.tenorMonths || '', outstanding: rp ? rp.outstanding : '', arrears: rp ? rp.arrears : '' } }) }
async function escrowFigures() {
  const coops = await listCoops(), loans = await listLoans(), wallets = await kvList('wallet:')
  const regFees = coops.filter((c) => c.feeStatus === 'Paid').length * COOP_FEES.registration
  const returnsFees = coops.filter((c) => c.returns).length * COOP_FEES.annualReturns
  const disbursedValue = loans.filter((l) => ['Disbursed', 'Repaying', 'Completed'].includes(l.status)).reduce((a, l) => a + (l.amountApproved || 0), 0)
  const portalFees = Math.round(disbursedValue * 0.025)
  const funding = wallets.reduce((a, w) => a + (w.txns || []).filter((t) => t.type === 'topup').reduce((s, t) => s + (t.amount || 0), 0), 0)
  const walletFees = Math.round(funding * 0.01)
  const accrued = regFees + returnsFees + portalFees + walletFees
  const sched = loans.filter((l) => (l.schedule || []).length)
  const outstanding = sched.reduce((a, l) => a + loanRepayState(l).outstanding, 0)
  const arrears = sched.reduce((a, l) => a + loanRepayState(l).arrears, 0)
  return { coops, loans, regFees, returnsFees, disbursedValue, portalFees, funding, walletFees, accrued, outstanding, arrears }
}
async function reportEscrow() {
  const f = await escrowFigures()
  const lines = [['Registration fees', f.regFees], ['Annual returns fees', f.returnsFees], ['Disbursement portal (2.5%)', f.portalFees], ['Wallet fees (1%)', f.walletFees], ['Total accrued', f.accrued]]
  const split = SPV_SPLIT.map(([n, p]) => [n + ' (' + p + '%)', Math.round(f.accrued * p / 100)])
  return [...lines, ...split].map(([item, amount]) => ({ item, amount }))
}
async function generateBoardPack() {
  const f = await escrowFigures()
  const members = await listMembers(), tickets = await listTickets()
  const coops = f.coops, loans = f.loans
  const by = (arr, k, v) => arr.filter((x) => x[k] === v).length
  const money = (n) => '\u20A6' + Number(n || 0).toLocaleString('en-NG')
  const origin = window.location.origin
  const statusRows = ['Approved', 'Under review', 'Filed', 'Returned'].map((s) => `<tr><td>${s}</td><td style="text-align:right">${by(coops, 'status', s)}</td></tr>`).join('')
  const pipeRows = ['Applied', 'In training', 'Shortlisted', 'Coop validated', 'Bank assessment', 'BOI approved', 'Disbursed', 'Repaying', 'Completed'].map((s) => `<tr><td>${s}</td><td style="text-align:right">${by(loans, 'status', s)}</td></tr>`).join('')
  const escrowRows = [['Registration fees', f.regFees], ['Annual returns fees', f.returnsFees], ['Disbursement portal (2.5%)', f.portalFees], ['Wallet fees (1%)', f.walletFees]].map(([k, v]) => `<tr><td>${k}</td><td style="text-align:right">${money(v)}</td></tr>`).join('')
  const splitRows = SPV_SPLIT.map(([n, p]) => `<tr><td>${n} (${p}%)</td><td style="text-align:right">${money(Math.round(f.accrued * p / 100))}</td></tr>`).join('')
  const kpi = (label, val) => `<div style="border:1px solid #dfe6e1;border-radius:8px;padding:12px 14px"><div style="font-size:20px;font-weight:700;color:#17241c">${val}</div><div style="font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#6b7671;margin-top:3px">${label}</div></div>`
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>MCCTI CoopEco Board Pack</title>
  <style>@page{margin:18mm}body{font-family:Georgia,'Times New Roman',serif;color:#17241c;margin:0;padding:0}
  .wrap{max-width:800px;margin:0 auto}h1{font-size:22px;margin:6px 0}h2{font-size:14px;text-transform:uppercase;letter-spacing:.06em;color:#1C8A4F;border-bottom:2px solid #1C8A4F;padding-bottom:4px;margin-top:26px}
  .head{display:flex;align-items:center;gap:14px;border-bottom:1px solid #dfe6e1;padding-bottom:14px}
  .head img{width:52px;height:52px}.sub{color:#6b7671;font-size:12px}
  table{width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:12px;margin-top:8px}
  td,th{border-bottom:1px solid #eef2ef;padding:7px 8px;text-align:left}
  .kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px;font-family:Arial,sans-serif}
  .foot{margin-top:30px;color:#6b7671;font-size:10px;font-family:Arial,sans-serif}</style></head>
  <body><div class="wrap">
  <div class="head"><img src="${origin}/lagos-seal.png" alt=""><div><h1>MCCTI CoopEco \u2014 Board Pack</h1><div class="sub">Ministry of Commerce, Cooperatives, Trade &amp; Investment, Lagos State &middot; ${fmtDate(new Date().toISOString())}</div></div></div>
  <h2>Executive summary</h2>
  <div class="kpis">${kpi('Cooperative societies', coops.length)}${kpi('Members profiled', members.length)}${kpi('LASMECO disbursed', money(f.disbursedValue))}${kpi('Portfolio outstanding', money(f.outstanding))}${kpi('In arrears', money(f.arrears))}${kpi('Escrow accrued', money(f.accrued))}${kpi('Payments processed', money(f.funding))}${kpi('Open tickets', tickets.filter((t) => t.status !== 'Resolved').length)}${kpi('Approved societies', by(coops, 'status', 'Approved'))}</div>
  <h2>Registration status</h2><table><tr><th>Status</th><th style="text-align:right">Societies</th></tr>${statusRows}</table>
  <h2>LASMECO pipeline</h2><table><tr><th>Stage</th><th style="text-align:right">Loans</th></tr>${pipeRows}</table>
  <h2>Escrow &amp; revenue</h2><table><tr><th>Source</th><th style="text-align:right">Amount</th></tr>${escrowRows}<tr><td><strong>Total accrued</strong></td><td style="text-align:right"><strong>${money(f.accrued)}</strong></td></tr></table>
  <h2>SPV distribution</h2><table><tr><th>Party</th><th style="text-align:right">Amount</th></tr>${splitRows}</table>
  <div class="foot">Generated by MCCTI CoopEco. Figures are drawn from live platform data at the time of generation. For internal Ministry use.</div>
  </div></body></html>`
  const w = window.open('', '_blank')
  if (!w) { alert('Please allow pop-ups to generate the board pack.'); return }
  w.document.write(html); w.document.close(); w.focus(); setTimeout(() => { try { w.print() } catch (e) {} }, 500)
}
function ReportsPanel({ role }) {
  const isLeader = role === 'leadership'
  const [busy, setBusy] = useState('')
  const run = (key, fn) => async () => { setBusy(key); try { await fn() } finally { setBusy('') } }
  const stamp = new Date().toISOString().slice(0, 10)
  return (
    <div className="ws">
      <div className="reports-grid">
        <div className="report-card"><h4>Cooperative registry</h4><p>All societies with status, CAP15, members, contributions and fee status.</p><button className="btn btn-outline btn-sm" disabled={busy === 'coops'} onClick={run('coops', async () => downloadCSV('coop-registry-' + stamp + '.csv', await reportCoops()))}>Download CSV</button></div>
        <div className="report-card"><h4>Members &amp; analytics</h4><p>Profiled members with KYC status, credit score, band and QooP signals.</p><button className="btn btn-outline btn-sm" disabled={busy === 'members'} onClick={run('members', async () => downloadCSV('members-' + stamp + '.csv', await reportMembers()))}>Download CSV</button></div>
        {isLeader && <div className="report-card"><h4>LASMECO portfolio</h4><p>All loans with status, approved amount, outstanding balance and arrears.</p><button className="btn btn-outline btn-sm" disabled={busy === 'loans'} onClick={run('loans', async () => downloadCSV('lasmeco-portfolio-' + stamp + '.csv', await reportLoans()))}>Download CSV</button></div>}
        {isLeader && <div className="report-card"><h4>Escrow &amp; distribution</h4><p>Revenue accrued by stream and the SPV sharing-formula distribution.</p><button className="btn btn-outline btn-sm" disabled={busy === 'escrow'} onClick={run('escrow', async () => downloadCSV('escrow-' + stamp + '.csv', await reportEscrow()))}>Download CSV</button></div>}
      </div>
      {isLeader && <div className="report-boardpack"><div><h4>Board pack (PDF)</h4><p className="muted-line">A printable executive summary: KPIs, registration status, LASMECO pipeline and escrow, drawn from live data. Opens a print view \u2014 choose \u201cSave as PDF\u201d.</p></div><button className="btn btn-gold btn-sm" disabled={busy === 'pack'} onClick={run('pack', generateBoardPack)}>Generate board pack</button></div>}
      <p className="panel-note">CSV files open in Excel or Google Sheets. Exports reflect live platform data at the moment of download.</p>
    </div>
  )
}
function maskPhone(p) { const s = String(p || ''); return s.length > 5 ? s.slice(0, 4) + '\u2026' + s.slice(-3) : s }
function computeRiskFlags(members, loans) {
  const flags = []
  const byPhone = {}
  members.forEach((m) => { const p = (m.phone || '').replace(/\s/g, ''); if (p) (byPhone[p] = byPhone[p] || []).push(m) })
  Object.entries(byPhone).forEach(([p, ms]) => { if (ms.length > 1) flags.push({ severity: 'high', type: 'Duplicate phone', title: ms.length + ' members share phone ' + maskPhone(p), detail: ms.map((m) => m.name).join(', ') }) })
  const byName = {}
  members.forEach((m) => { const n = (m.name || '').trim().toLowerCase(); if (n) (byName[n] = byName[n] || []).push(m) })
  Object.values(byName).forEach((ms) => { const coops = Array.from(new Set(ms.map((m) => m.coop))); if (ms.length > 1 && coops.length > 1) flags.push({ severity: 'medium', type: 'Name across cooperatives', title: ms[0].name + ' appears in ' + coops.length + ' cooperatives', detail: coops.join(', ') }) })
  const byMember = {}
  loans.forEach((l) => { const k = l.memberId || l.memberName; if (k) (byMember[k] = byMember[k] || []).push(l) })
  Object.values(byMember).forEach((ls) => { const active = ls.filter((l) => !['Declined', 'Completed', 'Default'].includes(l.status)); if (active.length > 1) flags.push({ severity: 'medium', type: 'Multiple applications', title: ls[0].memberName + ' has ' + active.length + ' active LASMECO applications', detail: active.map((l) => l.loanId + ' (' + l.status + ')').join(', ') }) })
  loans.forEach((l) => { if ((l.schedule || []).length) { const rp = loanRepayState(l); if (l.status === 'Default') flags.push({ severity: 'high', type: 'Default', title: l.memberName + ' \u2014 loan ' + l.loanId + ' in default', detail: 'Outstanding ' + fmtNaira(rp.outstanding) }); else if (rp.arrears > 0) flags.push({ severity: 'medium', type: 'Arrears', title: l.memberName + ' \u2014 ' + l.loanId + ' in arrears', detail: fmtNaira(rp.arrears) + ' overdue' }) } })
  loans.forEach((l) => { const m = members.find((x) => x.memberId === l.memberId || x.name === l.memberName); const turnover = m && m.msme ? m.msme.monthlyTurnover : 0; const req = l.amountRequested || 0; if (turnover > 0 && req > turnover * 18 && ['Applied', 'In training', 'Shortlisted'].includes(l.status)) flags.push({ severity: 'low', type: 'Exposure', title: l.memberName + ' requests ' + fmtNaira(req), detail: 'About ' + Math.round(req / turnover) + '\u00d7 monthly turnover (' + fmtNaira(turnover) + ')' }) })
  const order = { high: 0, medium: 1, low: 2 }
  return flags.sort((a, b) => order[a.severity] - order[b.severity])
}
function RiskPanel() {
  const [data, setData] = useState(null)
  useEffect(() => { Promise.all([listMembers(), listLoans()]).then(([m, l]) => setData(computeRiskFlags(m, l))) }, [])
  if (!data) return <p className="muted-line">Assessing risk\u2026</p>
  const bySev = (s) => data.filter((f) => f.severity === s).length
  return (
    <div className="ws">
      <div className="statgrid">
        <div className="stat"><span className="stat-fig">{data.length}</span><span className="stat-lab">Total flags</span></div>
        <div className="stat"><span className="stat-fig" style={bySev('high') ? { color: 'var(--err)' } : undefined}>{bySev('high')}</span><span className="stat-lab">High</span></div>
        <div className="stat"><span className="stat-fig">{bySev('medium')}</span><span className="stat-lab">Medium</span></div>
        <div className="stat"><span className="stat-fig">{bySev('low')}</span><span className="stat-lab">Low</span></div>
      </div>
      {data.length ? <div className="risk-list">{data.map((f, i) => (<div className="risk-item" key={i}><span className={cx('chip', f.severity === 'high' ? 'st-returned' : f.severity === 'medium' ? 'st-review' : 'st-filed')}>{f.severity}</span><div className="risk-body"><strong>{f.title}</strong><p>{f.type} &middot; {f.detail}</p></div></div>))}</div> : <div className="empty"><span className="empty-mark">&#9670;</span><h3>No risk flags</h3><p>No duplicate identifiers, arrears or anomalies detected in the current data.</p></div>}
      <p className="panel-note">Heuristic monitoring on duplicate phones, repeated names, multiple applications, arrears and exposure. Production-grade duplicate BVN/NIN detection should run server-side through the KYC provider (numbers are not stored in the browser). Flags are advisory and warrant human review \u2014 not an accusation.</p>
    </div>
  )
}
const SLA_TARGETS = { approval: 14, grievance: 3, lasmeco: 30 }
function daysBetween(a, b) { const d = (new Date(b).getTime() - new Date(a).getTime()) / 86400000; return isFinite(d) ? d : 0 }
function slaMetrics(coops, tickets, loans) {
  const nowISO = new Date().toISOString()
  const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
  const pct = (n, d) => d ? Math.round(n / d * 100) : 100
  const decided = coops.filter((c) => ['Approved', 'Returned'].includes(c.status) && c.source !== 'SEKAT')
  const appDays = decided.map((c) => daysBetween(c.createdAt, c.updatedAt)).filter((d) => d >= 0)
  const pending = coops.filter((c) => ['Filed', 'Under review'].includes(c.status) && c.source !== 'SEKAT')
  const pendingBreach = pending.filter((c) => daysBetween(c.createdAt, nowISO) > SLA_TARGETS.approval)
  const resolved = tickets.filter((t) => t.status === 'Resolved')
  const resDays = resolved.map((t) => daysBetween(t.createdAt, t.updatedAt)).filter((d) => d >= 0)
  const openT = tickets.filter((t) => t.status !== 'Resolved')
  const openBreach = openT.filter((t) => daysBetween(t.createdAt, nowISO) > SLA_TARGETS.grievance)
  const disbursed = loans.filter((l) => ['Disbursed', 'Repaying', 'Completed'].includes(l.status))
  const disbDays = disbursed.map((l) => daysBetween(l.createdAt, l.disbursedAt || l.updatedAt)).filter((d) => d >= 0)
  const inPipe = loans.filter((l) => !['Disbursed', 'Repaying', 'Completed', 'Declined', 'Default'].includes(l.status))
  const pipeBreach = inPipe.filter((l) => daysBetween(l.createdAt, nowISO) > SLA_TARGETS.lasmeco)
  const breaching = [
    ...pendingBreach.map((c) => ({ kind: 'Approval', label: c.name + ' (' + c.trackingId + ')', age: Math.round(daysBetween(c.createdAt, nowISO)), target: SLA_TARGETS.approval })),
    ...openBreach.map((t) => ({ kind: 'Grievance', label: t.subject + ' (' + t.ticketId + ')', age: Math.round(daysBetween(t.createdAt, nowISO)), target: SLA_TARGETS.grievance })),
    ...pipeBreach.map((l) => ({ kind: 'LASMECO', label: l.memberName + ' (' + l.loanId + ', ' + l.status + ')', age: Math.round(daysBetween(l.createdAt, nowISO)), target: SLA_TARGETS.lasmeco })),
  ].sort((a, b) => (b.age - b.target) - (a.age - a.target))
  return {
    approval: { avg: avg(appDays), within: pct(appDays.filter((d) => d <= SLA_TARGETS.approval).length, appDays.length), decided: decided.length, pending: pending.length, breach: pendingBreach.length },
    grievance: { avg: avg(resDays), within: pct(resDays.filter((d) => d <= SLA_TARGETS.grievance).length, resDays.length), resolved: resolved.length, open: openT.length, breach: openBreach.length },
    lasmeco: { avg: avg(disbDays), within: pct(disbDays.filter((d) => d <= SLA_TARGETS.lasmeco).length, disbDays.length), disbursed: disbursed.length, inPipe: inPipe.length, breach: pipeBreach.length },
    breaching,
  }
}
function SLABlock({ title, target, unit, m }) {
  return (
    <section className="dash-card"><h3>{title}</h3>
      <div className="sla-figs">
        <div><span className="sla-fig">{m.avg ? m.avg.toFixed(1) : '\u2014'}</span><span className="sla-lab">Avg {unit}</span></div>
        <div><span className="sla-fig" style={m.within < 80 ? { color: 'var(--gold-soft)' } : undefined}>{m.within}%</span><span className="sla-lab">Within {target}{unit === 'days' ? 'd' : ''}</span></div>
        <div><span className="sla-fig" style={m.breach ? { color: 'var(--err)' } : undefined}>{m.breach}</span><span className="sla-lab">Breaching</span></div>
      </div>
    </section>
  )
}
function GovernanceSLA() {
  const [d, setD] = useState(null)
  useEffect(() => { Promise.all([listCoops(), listTickets(), listLoans()]).then(([c, t, l]) => setD(slaMetrics(c, t, l))) }, [])
  if (!d) return <p className="muted-line">Computing service levels\u2026</p>
  return (
    <div className="ws">
      <div className="dash-grid">
        <SLABlock title="Cooperative approvals" target={SLA_TARGETS.approval} unit="days" m={d.approval} />
        <SLABlock title="Grievance resolution" target={SLA_TARGETS.grievance} unit="days" m={d.grievance} />
        <SLABlock title="LASMECO to disbursement" target={SLA_TARGETS.lasmeco} unit="days" m={d.lasmeco} />
      </div>
      <h3 className="ws-h" style={{ marginTop: '24px' }}>Breaching service levels now</h3>
      {d.breaching.length ? <div className="risk-list">{d.breaching.map((x, i) => (<div className="risk-item" key={i}><span className="chip st-returned">{x.age}d</span><div className="risk-body"><strong>{x.label}</strong><p>{x.kind} &middot; target {x.target} days &middot; {x.age - x.target} days over</p></div></div>))}</div> : <div className="empty"><span className="empty-mark">&#9670;</span><h3>All within service levels</h3><p>No approvals, grievances or LASMECO cases are past target.</p></div>}
      <p className="panel-note">Targets: approvals {SLA_TARGETS.approval} days, grievances {SLA_TARGETS.grievance} days, LASMECO {SLA_TARGETS.lasmeco} days. Measured from first record to decision or resolution. Adjust targets in SLA_TARGETS.</p>
    </div>
  )
}
async function exportMyData(ctx) {
  const coops = (await listCoops()).filter((c) => c.createdBy === ctx.email)
  const members = (await listMembers()).filter((m) => m.createdBy === ctx.email)
  const activity = (await listAudit()).filter((a) => a.by === ctx.name)
  return { exportedAt: new Date().toISOString(), controller: 'Ministry of Commerce, Cooperatives, Trade & Investment, Lagos State', account: { email: ctx.email, name: ctx.name, role: ctx.role }, cooperatives: coops, members, activity }
}
async function deleteMyData(ctx) {
  const members = (await listMembers()).filter((m) => m.createdBy === ctx.email)
  for (const m of members) await kvDelete('member:' + m.memberId)
  if (supa) { await kvDelete('profile:' + ctx.uid) } else { const users = LS.get('coopeco.users', {}); delete users[ctx.email]; LS.set('coopeco.users', users) }
}
const consentGiven = () => LS.get('coopeco.consent', false)
const setConsent = () => LS.set('coopeco.consent', true)

/* ---------------------------- GDPR components -------------------------- */
function ConsentBanner({ onOpenPrivacy }) {
  const [show, setShow] = useState(!consentGiven())
  if (!show) return null
  return (
    <div className="consent" role="dialog" aria-label="Data protection">
      <p>We process personal data to administer cooperatives and, where you ask for finance, to assess eligibility. We keep it to what is needed and you can access or erase your data at any time.</p>
      <div className="consent-actions">
        <button className="link-inline" onClick={onOpenPrivacy}>Privacy notice</button>
        <button className="btn btn-gold btn-sm" onClick={() => { setConsent(); setShow(false) }}>Accept</button>
      </div>
    </div>
  )
}
function LoanCalculator() {
  const [amt, setAmt] = useState('1000000'), [tenor, setTenor] = useState('12')
  const a = Number(amt) || 0, t = Math.max(1, Number(tenor) || 12)
  const sched = a > 0 ? buildSchedule(a, t, 9, new Date().toISOString()) : []
  const monthly = sched.length ? sched[0].amount : 0
  const total = sched.reduce((s, r) => s + r.amount, 0)
  const b = loanBreakdown(a)
  return (
    <div className="returns-box"><h4>LASMECO repayment calculator</h4>
      <div className="calc-row"><label className="field"><span>Amount (₦)</span><input type="number" value={amt} onChange={(e) => setAmt(e.target.value)} /></label><label className="field"><span>Tenor (months)</span><input type="number" value={tenor} onChange={(e) => setTenor(e.target.value)} /></label></div>
      <div className="statgrid"><div className="stat"><span className="stat-fig">{fmtNaira(monthly)}</span><span className="stat-lab">Monthly repayment</span></div><div className="stat"><span className="stat-fig">{fmtNaira(total)}</span><span className="stat-lab">Total repayable</span></div><div className="stat"><span className="stat-fig">{fmtNaira(Math.max(0, total - a))}</span><span className="stat-lab">Total interest (9%)</span></div><div className="stat"><span className="stat-fig">{fmtNaira(b.netToBorrower)}</span><span className="stat-lab">Net to you after fees</span></div></div>
      <p className="panel-note">Indicative only, at 9% reducing balance. Final terms are set on approval. One-off fees: ₦200,000 Accelerator and 1% BOI appraisal. Not a loan offer.</p>
    </div>
  )
}
function verifyStanding(s) { return s === 'Approved' ? 'Registered \u2014 approved' : ['Filed', 'Under review'].includes(s) ? 'Registration under review' : s === 'Returned' ? 'Returned for correction' : (s || '\u2014') }
function PublicVerify({ onBack }) {
  const [q, setQ] = useState(''), [results, setResults] = useState(null), [busy, setBusy] = useState(false)
  const search = async () => {
    const term = q.trim(); if (!term) return
    setBusy(true)
    const all = await listCoops()
    const t = term.toLowerCase()
    const found = all.filter((c) => (c.trackingId && c.trackingId.toLowerCase() === t) || (c.regNo && c.regNo.toLowerCase() === t) || (c.name && c.name.toLowerCase().includes(t)))
    setResults(found); setBusy(false)
  }
  return (
    <main className="verify-page"><div className="verify-inner">
      <p className="eyebrow"><span className="eb-dot" />Public register</p>
      <h1 className="verify-h">Verify a cooperative society</h1>
      <p className="verify-sub">Check whether a cooperative is registered with the Lagos State Ministry of Commerce, Cooperatives, Trade &amp; Investment. Search by registration or tracking number, or by name.</p>
      <div className="verify-search"><input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} placeholder="e.g. LAG-CS-24-000123 or society name" /><button className="btn btn-gold" onClick={search} disabled={busy}>{busy ? 'Searching\u2026' : 'Verify'}</button></div>
      {results && (results.length ? (
        <div className="verify-results">{results.slice(0, 8).map((c) => (
          <div className="verify-card" key={c.trackingId}>
            <div className="verify-card-top"><div><h3>{c.name}</h3><p className="detail-sub">{c.trackingId}{c.regNo ? ' \u00b7 ' + c.regNo : ''} \u00b7 {c.areaOffice} area office \u00b7 {c.sector}</p></div><StatusChip status={c.status} /></div>
            <div className="verify-facts"><div><span>Standing</span><strong>{verifyStanding(c.status)}</strong></div><div><span>CAP15 compliance</span><strong>{c.cap15 || '\u2014'}</strong></div><div><span>Register source</span><strong>{c.source === 'SEKAT' ? 'SEKAT legacy register' : 'MCCTI register'}</strong></div></div>
          </div>))}</div>
      ) : <div className="verify-empty">No cooperative found for \u201c{q}\u201d. Check the number or name, or contact the Ministry to confirm.</div>)}
      <button className="link-back" onClick={onBack}>&larr; Back to home</button>
      <p className="panel-note">This public check shows registration standing only. It does not disclose members, bank or financial details. It is not a substitute for official written confirmation from the Ministry.</p>
    </div></main>
  )
}
function PrivacyNotice({ onBack }) {
  const rows = [
    ['Who we are', 'The Ministry of Commerce, Cooperatives, Trade and Investment, Lagos State Government, is the data controller. SEKAT and QooP act as processors under agreement.'],
    ['What we collect', 'Account details, cooperative registration and governance records, and, for members, KYC identifiers and MSME profile data (turnover, employees, cash flow, sector) used for credit assessment.'],
    ['Why, and our lawful basis', 'Public task (cooperative regulation under the Lagos CAP15 Cooperative Law) and your consent for credit assessment. We use only what is needed for each purpose.'],
    ['Automated decisions', 'Credit scoring is explainable and advisory only. A cooperative officer reviews before any decision that affects access to LASMECO finance. You may request that review.'],
    ['Your rights', 'Access, rectification, erasure, portability, restriction and objection. Use Download my data and Delete my data in your dashboard, or contact the Ministry.'],
    ['Sharing and transfers', 'Data flows one way from SEKAT and QooP into MCCTI. It is not sold. Any transfer is governed by the relevant data-sharing agreement and NDPR.'],
    ['Retention', 'Institutional cooperative records are retained under the Ministry’s public task. Personal member data is kept only as long as needed and then erased.'],
  ]
  return (
    <main className="flow"><div className="flow-inner">
      <button className="flow-back" onClick={onBack}>&larr; Back</button>
      <p className="eyebrow"><span className="eb-dot" />Data protection</p>
      <h1 className="flow-title">Privacy notice</h1>
      <p className="flow-sub">How MCCTI CoopEco handles personal data, aligned with the NDPR and GDPR principles. This is a plain-language summary, not legal advice.</p>
      <div className="privacy">{rows.map(([h, b]) => (<div className="privacy-row" key={h}><h4>{h}</h4><p>{b}</p></div>))}</div>
    </div></main>
  )
}
function DataControls({ ctx, onDeleted }) {
  const [busy, setBusy] = useState(false), [confirm, setConfirm] = useState(false)
  const doExport = async () => { const data = await exportMyData(ctx); downloadJson('my-coopeco-data.json', data) }
  const doDelete = async () => { setBusy(true); await deleteMyData(ctx); setBusy(false); onDeleted() }
  return (
    <section className="dash-card data-controls">
      <h3>Privacy &amp; your data</h3>
      <p className="dash-card-sub">You can take a copy of your data or erase your personal data at any time (GDPR access, portability and erasure).</p>
      <div className="dc-actions">
        <button className="btn btn-outline btn-sm" onClick={doExport}>Download my data</button>
        {!confirm ? <button className="btn btn-outline btn-sm" onClick={() => setConfirm(true)}>Delete my data</button> : (
          <span className="dc-confirm">Erase personal data and account?<button className="btn btn-outline btn-sm" onClick={doDelete} disabled={busy}>{busy ? 'Erasing…' : 'Confirm'}</button><button className="link-inline" onClick={() => setConfirm(false)}>Cancel</button></span>
        )}
      </div>
      <p className="panel-note">Institutional cooperative records are retained under the Ministry’s public task. Personal member data is erased. This is not legal advice.</p>
    </section>
  )
}

/* ---------------------------- QooP + members -------------------------- */
function QoopPanel({ ctx, onSynced }) {
  const [info, setInfo] = useState(null), [busy, setBusy] = useState(false)
  const load = () => getIntegration('qoop').then(setInfo)
  useEffect(() => { load() }, [])
  const run = async () => { setBusy(true); await syncFromQoop(ctx, false); await load(); setBusy(false); onSynced && onSynced() }
  return (
    <div className="sekat">
      <div className="sekat-flow"><div className="node src qoop">QooP<span>Member &amp; MSME analytics source</span></div><div className="flow-arrow">&rarr;<span>one-way</span></div><div className="node dst">MCCTI CoopEco<span>Unified analytics</span></div></div>
      <div className="sekat-status"><div className="status-row"><span>Connection</span><span className={cx('pill', info?.live ? 'ok' : 'muted')}>{info?.live ? 'Live API' : 'Sample feed' + (hasSupabase ? '' : ' (demo)')}</span></div><div className="status-row"><span>Last sync</span><span className="mono">{info?.lastSync ? fmtDate(info.lastSync) : 'Never'}</span></div><div className="status-row"><span>Members ingested</span><span className="mono">{info?.count ?? 0}</span></div></div>
      <button className="btn btn-gold btn-sm" onClick={run} disabled={busy}>{busy ? 'Syncing…' : 'Run QooP sync'}</button>
      <p className="panel-note">Data flows one way, from QooP into MCCTI. Synced members are read-only here. When QOOP_API_URL and QOOP_API_KEY are set, the platform pulls live QooP analytics automatically; until then it ingests a representative sample mirroring the QooP dataset: KYC, turnover and cash flow, plus QooP-held financial behaviour \u2014 wallet and BNPL usage, savings, credit purchases, borrowing and on-time repayment history. Compliance: KYC and NDPR/GDPR handling governed by the QooP data-sharing agreement. This is not legal advice.</p>
    </div>
  )
}
function parseCSV(text) {
  const rows = []; let row = [], field = '', inQ = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQ) { if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++ } else inQ = false } else field += c }
    else if (c === '"') inQ = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(field); field = ''; if (row.some((x) => x !== '')) rows.push(row); row = [] }
    else field += c
  }
  if (field !== '' || row.length) { row.push(field); if (row.some((x) => x !== '')) rows.push(row) }
  return rows
}
function csvToObjects(text) { const rows = parseCSV(text); if (rows.length < 2) return []; const headers = rows[0].map((h) => h.trim()); return rows.slice(1).map((r) => { const o = {}; headers.forEach((h, i) => { o[h] = (r[i] || '').trim() }); return o }) }
async function bulkImportCoops(objs, ctx) {
  let n = 0
  for (const o of objs) {
    if (!o.name) continue
    const id = genTrackingId(), now = new Date().toISOString()
    await kvSet('coop:' + id, { trackingId: id, source: 'Bulk import', regNo: o.regNo || null, name: o.name, areaOffice: AREA_OFFICES.includes(o.areaOffice) ? o.areaOffice : AREA_OFFICES[1], sector: o.sector || 'Trade', custodian: o.custodian || '', members: Number(o.members) || 0, contributions: Number(o.contributions) || 0, status: o.status || 'Filed', cap15: 'Under audit', returns: null, feeStatus: '', createdBy: ctx.email, createdAt: now, updatedAt: now })
    await addAudit({ trackingId: id, action: 'Imported via bulk upload', by: ctx.name, role: ctx.role, note: '' })
    n++
  }
  return n
}
async function bulkImportMembers(objs, ctx) {
  let n = 0
  for (const o of objs) {
    if (!o.name) continue
    const id = 'M-' + String(Math.floor(Math.random() * 1000000)).padStart(6, '0'), now = new Date().toISOString()
    await kvSet('member:' + id, { memberId: id, source: 'Bulk import', name: o.name, coop: o.coop || '', sector: o.sector || 'Trade', phone: o.phone || '', gender: o.gender || '', kyc: { bvnVerified: false, ninVerified: false, status: 'Unverified' }, msme: { monthlyTurnover: Number(o.monthlyTurnover) || 0, employees: Number(o.employees) || 0, cashFlow: Number(o.cashFlow) || 0, customerBase: Number(o.customerBase) || 0, yearsInOperation: Number(o.yearsInOperation) || 0 }, createdBy: ctx.email, createdAt: now })
    n++
  }
  return n
}
function BulkImport({ ctx, onDone }) {
  const [type, setType] = useState('coops'), [text, setText] = useState(''), [objs, setObjs] = useState(null), [busy, setBusy] = useState(false), [done, setDone] = useState(null)
  const templates = { coops: 'name,areaOffice,sector,custodian,members,contributions\nIkeja Traders Coop,Ikeja,Trade,F. Ade,120,4500000', members: 'name,coop,sector,phone,monthlyTurnover,employees,cashFlow,customerBase,yearsInOperation\nJane Doe,Ikeja Traders Coop,Trade,08030000000,350000,3,120000,80,4' }
  const onFile = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => setText(String(r.result)); r.readAsText(f) }
  const valid = objs ? objs.filter((o) => o.name) : []
  const doImport = async () => { if (!valid.length) return; setBusy(true); const n = type === 'coops' ? await bulkImportCoops(valid, ctx) : await bulkImportMembers(valid, ctx); setDone(n); setObjs(null); setText(''); setBusy(false); onDone && onDone() }
  return (
    <div className="sekat">
      <div className="bulk-type"><button className={cx('seg', type === 'coops' && 'on')} onClick={() => { setType('coops'); setObjs(null); setDone(null) }}>Cooperatives</button><button className={cx('seg', type === 'members' && 'on')} onClick={() => { setType('members'); setObjs(null); setDone(null) }}>Members</button></div>
      <div className="bulk-actions"><input type="file" accept=".csv" onChange={onFile} /><button className="link-inline" onClick={() => { setText(templates[type]); setDone(null) }}>Load template</button></div>
      <textarea className="bulk-text" rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder={'Paste CSV with headers: ' + templates[type].split('\n')[0]} />
      <div className="panel-actions"><button className="btn btn-outline btn-sm" onClick={() => { setObjs(csvToObjects(text)); setDone(null) }} disabled={!text.trim()}>Preview</button>{valid.length ? <button className="btn btn-gold btn-sm" onClick={doImport} disabled={busy}>{busy ? 'Importing\u2026' : 'Import ' + valid.length + ' ' + type}</button> : null}</div>
      {objs ? <p className="muted-line">{valid.length} valid row{valid.length === 1 ? '' : 's'}{objs.length - valid.length ? ', ' + (objs.length - valid.length) + ' skipped (missing name)' : ''}.</p> : null}
      {valid.length ? <div className="rtable-wrap"><table className="rtable"><thead><tr>{Object.keys(valid[0]).slice(0, 6).map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{valid.slice(0, 5).map((o, i) => <tr key={i}>{Object.keys(valid[0]).slice(0, 6).map((h) => <td key={h}>{o[h]}</td>)}</tr>)}</tbody></table></div> : null}
      {done != null ? <p className="panel-note" style={{ color: 'var(--green)' }}>Imported {done} record{done === 1 ? '' : 's'}. They now appear in the registry{type === 'members' ? ' and member analytics' : ''}.</p> : null}
      <p className="panel-note">Bulk import creates new records tagged \u201cBulk import\u201d. Imported members are Unverified until KYC is run; imported cooperatives pass through the normal approval flow. De-duplicate and check the Risk &amp; fraud view before large batches.</p>
    </div>
  )
}
function IntegrationsPanel({ ctx, onSynced }) {
  return (<div className="ws"><p className="muted-line">SEKAT and QooP sync automatically each time the platform loads (one-way, read-only). You can also trigger a manual re-sync below.</p><div><h3 className="ws-h">SEKAT integration &middot; registry</h3><SekatPanel ctx={ctx} onSynced={onSynced} /></div><div><h3 className="ws-h">QooP integration &middot; member analytics</h3><QoopPanel ctx={ctx} onSynced={onSynced} /></div><div><h3 className="ws-h">Bulk import &middot; migrate from CSV</h3><BulkImport ctx={ctx} onDone={onSynced} /></div></div>)
}
function CreditScoreCard({ m }) {
  const r = scoreMember(m)
  return (
    <div className="score-card">
      <div className="score-head">
        <div className="score-num"><span className="score-val">{r.score}</span><span className="score-scale">/ 850</span></div>
        <div className="score-meta"><StatusChip status={r.band} /><span className="score-cap">LASMECO indication up to <strong>{fmtNaira(r.threshold)}</strong></span></div>
      </div>
      <div className="score-factors">{r.factors.map((f) => (<div className="sf" key={f.label}><div className="sf-top"><span>{f.label}</span><span className="sf-val">{f.display}</span></div><div className="sf-bar"><span style={{ width: Math.max(4, f.pct) + '%' }} /></div></div>))}</div>
      {m.qoop && (
        <div className="qoop-profile"><span className="qoop-profile-lab">QooP financial profile</span><div className="qoop-grid">
          <div><span>Savings</span><strong>{fmtNaira(m.qoop.savingsBalance)}</strong></div>
          <div><span>Wallet / BNPL limit</span><strong>{m.qoop.walletActive ? fmtNaira(m.qoop.bnplLimit) : 'Inactive'}</strong></div>
          <div><span>Credit purchases</span><strong>{m.qoop.creditPurchases}</strong></div>
          <div><span>Outstanding credit</span><strong>{fmtNaira(m.qoop.creditOutstanding)}</strong></div>
          <div><span>Loans taken</span><strong>{m.qoop.loansTaken}</strong></div>
          <div><span>On-time repayment</span><strong>{m.qoop.onTimeRepaymentRate}%</strong></div>
        </div></div>
      )}
      <p className="panel-note">Explainable and advisory. A cooperative officer reviews before this affects LASMECO eligibility (no solely automated decision). Summarised by MCCTI CoopEco.</p>
    </div>
  )
}
function MemberDetail({ m, onClose }) {
  return (
    <div className="detail">
      <div className="detail-head"><div><h3>{m.name}</h3><p className="detail-sub">{m.coop} &middot; {m.sector}{m.ref ? ' · ' + m.ref : ''}</p></div><button className="link-back" onClick={onClose}>&larr; Back to list</button></div>
      <div className="detail-chips"><StatusChip status={m.kyc?.status || 'Unverified'} kind="cap15" /><SourceBadge source={m.source} /></div>
      {m.source === 'QOOP' && <div className="ro-note" style={{ marginTop: '16px' }}>Mirrored from QooP (read-only). KYC and MSME data are maintained in QooP and flow into MCCTI one way.</div>}
      <div className="detail-grid" style={{ marginTop: '20px' }}>
        <div className="field-ro"><span>Phone</span><strong>{m.phone || '—'}</strong></div>
        <div className="field-ro"><span>Gender</span><strong>{m.gender || '—'}</strong></div>
        <div className="field-ro"><span>Employees</span><strong>{m.msme?.employees ?? 0}</strong></div>
        <div className="field-ro"><span>Years in operation</span><strong>{m.msme?.yearsInOperation ?? 0}</strong></div>
        <div className="field-ro"><span>Monthly turnover</span><strong>{fmtNaira(m.msme?.monthlyTurnover)}</strong></div>
        <div className="field-ro"><span>Cash flow</span><strong>{fmtNaira(m.msme?.cashFlow)}</strong></div>
        <div className="field-ro"><span>Customer base</span><strong>{m.msme?.customerBase ?? 0}</strong></div>
        <div className="field-ro"><span>KYC</span><strong>{m.kyc?.status || 'Unverified'}</strong></div>
      </div>
      <div className="returns-box" style={{ marginTop: '22px' }}><h4>Credit score</h4><CreditScoreCard m={m} /></div>
    </div>
  )
}
async function verifyKyc(type, value) {
  if (!value) return { verified: false }
  try { const r = await fetch('/api/kyc-verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, value }) }); return await r.json() } catch (e) { return { verified: /^\d{10,11}$/.test(String(value)), demo: true } }
}
function MemberOnboardingForm({ ctx, coops, onDone, onCancel }) {
  const coopNames = Array.from(new Set(coops.map((c) => c.name)))
  const [f, setF] = useState({ name: ctx.name || '', coop: coopNames[0] || '', sector: SECTORS[0], phone: '', gender: GENDERS[0], bvn: '', nin: '', monthlyTurnover: '', employees: '', cashFlow: '', customerBase: '', yearsInOperation: '', consent: false })
  const [busy, setBusy] = useState(false), [err, setErr] = useState(''), [done, setDone] = useState(null)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const submit = async () => {
    setErr('')
    if (!f.name.trim()) { setErr('Your name is required.'); return }
    if (!f.consent) { setErr('Please consent to processing for credit assessment to continue.'); return }
    setBusy(true)
    try {
      let bvnVerified, ninVerified
      if (f.bvn) { const v = await verifyKyc('bvn', f.bvn); bvnVerified = v.verified }
      if (f.nin) { const v = await verifyKyc('nin', f.nin); ninVerified = v.verified }
      const rec = await createMember({ ...f, bvnVerified, ninVerified }, ctx); setDone(rec)
    } catch (e) { setErr(e.message || 'Could not save your profile.') } setBusy(false)
  }
  if (done) return (<div className="panel"><div className="panel-head"><h3>Profile complete</h3><button className="link-back" onClick={() => onDone(done)}>Done</button></div><p className="panel-sub">{done.name} &middot; {done.coop}</p><CreditScoreCard m={done} /></div>)
  return (
    <div className="panel">
      <div className="panel-head"><h3>Member onboarding &amp; MSME profile</h3><button className="link-back" onClick={onCancel}>Cancel</button></div>
      <div className="form-grid">
        <label className="field span2"><span>Full name</span><input value={f.name} onChange={set('name')} placeholder="Your name" /></label>
        <label className="field"><span>Cooperative</span><select value={f.coop} onChange={set('coop')}>{coopNames.length ? coopNames.map((n) => <option key={n}>{n}</option>) : <option>Not yet a member</option>}</select></label>
        <label className="field"><span>Enterprise sector</span><select value={f.sector} onChange={set('sector')}>{SECTORS.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="field"><span>Phone</span><input value={f.phone} onChange={set('phone')} placeholder="0803..." /></label>
        <label className="field"><span>Gender</span><select value={f.gender} onChange={set('gender')}>{GENDERS.map((g) => <option key={g}>{g}</option>)}</select></label>
        <label className="field"><span>BVN (KYC)</span><input value={f.bvn} onChange={set('bvn')} placeholder="11 digits" /></label>
        <label className="field"><span>NIN (KYC)</span><input value={f.nin} onChange={set('nin')} placeholder="11 digits" /></label>
        <label className="field"><span>Monthly turnover (₦)</span><input type="number" value={f.monthlyTurnover} onChange={set('monthlyTurnover')} placeholder="0" /></label>
        <label className="field"><span>Employees</span><input type="number" value={f.employees} onChange={set('employees')} placeholder="0" /></label>
        <label className="field"><span>Monthly cash flow (₦)</span><input type="number" value={f.cashFlow} onChange={set('cashFlow')} placeholder="0" /></label>
        <label className="field"><span>Customer base</span><input type="number" value={f.customerBase} onChange={set('customerBase')} placeholder="0" /></label>
        <label className="field"><span>Years in operation</span><input type="number" value={f.yearsInOperation} onChange={set('yearsInOperation')} placeholder="0" /></label>
      </div>
      <label className="consent-check"><input type="checkbox" checked={f.consent} onChange={set('consent')} /><span>I consent to the processing of my KYC and MSME data for cooperative administration and credit assessment. I understand a score is advisory and reviewed by an officer.</span></label>
      {err && <p className="auth-err">{err}</p>}
      <div className="panel-actions"><button className="btn btn-gold" onClick={submit} disabled={busy}>{busy ? 'Saving…' : 'Save profile & get score'}</button></div>
      <p className="panel-note">KYC verification will run through a provider such as Smile ID or Dojah. This is not legal advice.</p>
    </div>
  )
}
function MemberWorkspace({ ctx, section }) {
  const [members, setMembers] = useState(null), [coops, setCoops] = useState([]), [loans, setLoans] = useState([])
  const [mode, setMode] = useState('view'), [sel, setSel] = useState(null)
  const reload = useCallback(() => { listMembers().then(setMembers); listCoops().then(setCoops); listLoans().then(setLoans) }, [])
  useEffect(() => { reload() }, [reload])
  if (!members) return <p className="muted-line">Loading\u2026</p>
  const mine = ctx.focusId ? members.find((m) => m.memberId === ctx.focusId) : members.find((m) => m.createdBy === ctx.email)
  const myLoans = mine ? loans.filter((l) => l.memberId === mine.memberId || (l.memberName === mine.name)) : []
  if (mode === 'onboard') return <MemberOnboardingForm ctx={ctx} coops={coops} onCancel={() => setMode('view')} onDone={() => { setMode('view'); reload() }} />
  if (mode === 'apply' && mine) return <LoanApplyForm ctx={ctx} member={mine} onCancel={() => setMode('view')} onDone={() => { setMode('view'); reload() }} />
  if (sel) return <LoanDetail loan={sel} ctx={ctx} onClose={() => { setSel(null); reload() }} onChanged={reload} />
  if (!mine) return (
    <div className="empty"><span className="empty-mark">&#9670;</span><h3>Complete your member profile</h3><p>Onboard once with your KYC and MSME details. You get an explainable credit score and a route to LASMECO finance. Your data is processed with your consent and you can erase it anytime.</p><button className="btn btn-gold" onClick={() => setMode('onboard')}>Start onboarding</button></div>
  )
  return (
    <div className="ws">
      {section === 'overview' && <MemberOverview mine={mine} loans={myLoans} />}
      {section === 'wallet' && <div className="returns-box"><h4>Wallet &amp; savings</h4><MemberWallet member={mine} /></div>}
      {section === 'finance' && (<>
        <div className="society-card">
          <div className="society-top"><div><h3>{mine.name}</h3><p className="detail-sub">{mine.coop} &middot; {mine.sector}{mine.ref ? ' \u00b7 ' + mine.ref : ''}</p></div><div className="detail-chips"><StatusChip status={mine.kyc?.status || 'Unverified'} kind="cap15" /><SourceBadge source={mine.source} /></div></div>
          <div className="society-actions"><button className="btn btn-gold btn-sm" onClick={() => setMode('apply')}>Apply for LASMECO finance</button></div>
        </div>
        <div className="returns-box"><h4>Your credit score</h4><CreditScoreCard m={mine} /></div>
        <LoanCalculator />
        <div className="trail-box"><h4>Your LASMECO applications</h4>{myLoans.length ? <LoanTable loans={myLoans} onOpen={setSel} /> : <p className="muted-line">No applications yet. Apply above; there are no upfront fees.</p>}</div>
      </>)}
    </div>
  )
}
function MembersAnalytics() {
  const [members, setMembers] = useState(null), [sel, setSel] = useState(null)
  useEffect(() => { listMembers().then(setMembers) }, [])
  if (!members) return <p className="muted-line">Loading members…</p>
  if (sel) return <MemberDetail m={sel} onClose={() => setSel(null)} />
  if (!members.length) return <p className="muted-line">No members yet. Run a QooP sync from Integrations.</p>
  const scored = members.map((m) => ({ m, s: scoreMember(m) }))
  const verified = members.filter((m) => m.kyc?.status === 'Verified').length
  const avg = Math.round(scored.reduce((a, x) => a + x.s.score, 0) / scored.length)
  const eligible = scored.filter((x) => x.s.band === 'Prime' || x.s.band === 'Strong').length
  const bands = ['Prime', 'Strong', 'Fair', 'Building', 'Thin file'].map((b) => [b, scored.filter((x) => x.s.band === b).length]).filter(([, n]) => n)
  return (
    <div className="ws">
      <div className="statgrid"><div className="stat"><span className="stat-fig">{members.length}</span><span className="stat-lab">Members</span></div><div className="stat"><span className="stat-fig">{verified}</span><span className="stat-lab">KYC verified</span></div><div className="stat"><span className="stat-fig">{avg}</span><span className="stat-lab">Average score</span></div><div className="stat"><span className="stat-fig">{eligible}</span><span className="stat-lab">LASMECO-ready</span></div></div>
      <div className="band-dist">{bands.map(([b, n]) => (<div className="bd" key={b}><StatusChip status={b} /><span className="bd-n">{n}</span></div>))}</div>
      <div className="rtable-wrap"><table className="rtable"><thead><tr><th>Member</th><th>Cooperative</th><th>Sector</th><th>KYC</th><th>Score</th><th>Band</th><th></th></tr></thead>
        <tbody>{scored.map(({ m, s }) => (<tr key={m.memberId}><td className="td-name">{m.name}<SourceBadge source={m.source} /></td><td>{m.coop}</td><td>{m.sector}</td><td>{m.kyc?.status || 'Unverified'}</td><td className="mono">{s.score}</td><td><StatusChip status={s.band} /></td><td><button className="btn-open" onClick={() => setSel(m)}>Open</button></td></tr>))}</tbody>
      </table></div>
    </div>
  )
}
function ViewAsSwitcher({ onViewAs }) {
  const [coops, setCoops] = useState([]), [members, setMembers] = useState([]), [q, setQ] = useState('')
  useEffect(() => { listCoops().then(setCoops); listMembers().then(setMembers) }, [])
  const ql = q.trim().toLowerCase()
  const fc = coops.filter((c) => !ql || c.name.toLowerCase().includes(ql))
  const fm = members.filter((m) => !ql || m.name.toLowerCase().includes(ql))
  return (
    <div className="viewas">
      <input className="viewas-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search societies and members…" />
      <div className="viewas-cols">
        <div><h4 className="ws-h">Cooperative societies</h4><div className="viewas-list">{fc.slice(0, 12).map((c) => (<button key={c.trackingId} className="viewas-item" onClick={() => onViewAs({ role: 'society', name: c.name, email: c.createdBy, focusId: c.trackingId, office: c.areaOffice + ' area office', title: 'Cooperative Society' })}><span>{c.name}<SourceBadge source={c.source} /></span><span className="va-go">View as &rarr;</span></button>))}</div></div>
        <div><h4 className="ws-h">Members</h4><div className="viewas-list">{fm.slice(0, 12).map((m) => (<button key={m.memberId} className="viewas-item" onClick={() => onViewAs({ role: 'member', name: m.name, email: m.createdBy, focusId: m.memberId, office: m.coop, title: 'Cooperative Member' })}><span>{m.name}<SourceBadge source={m.source} /></span><span className="va-go">View as &rarr;</span></button>))}</div></div>
      </div>
    </div>
  )
}


/* =============================== STAGE 5 ===============================
   LASMECO Financing. The application-to-disbursement pipeline across the
   Accelerator, the Directorate (officer), the bank/BOI (financial partner) and
   leadership, with the guarantee stack, the success-based fees, and human
   approval at final approval and disbursement. Plus cooperative join fees.
   ====================================================================== */

const COOP_FEES = { registration: 50000, annualReturns: 15000 } // NGN, from the platform revenue model
const LOAN_TYPES = ['Term loan (up to 36 months)', 'Working capital (up to 24 months)']
const AP_STATUSES = ['Applied', 'In training', 'Shortlisted']
const PARTNER_STATUSES = ['Coop validated', 'Bank assessment', 'BOI approved']
function loanBreakdown(amount) {
  const a = Number(amount) || 0
  return { amount: a, collateral: Math.round(a * 0.10), coopGuarantee: Math.round(a * 0.25), sterlingGuarantee: Math.round(a * 0.50), apFee: 200000, boiFee: Math.round(a * 0.01), netToBorrower: Math.max(0, a - 200000 - Math.round(a * 0.01)), rate: 9 }
}
function buildSchedule(principal, tenor, annualRatePct, startISO) {
  const P = Number(principal) || 0, n = Math.max(1, Number(tenor) || 12), r = (Number(annualRatePct) || 9) / 100 / 12
  const pay = r > 0 ? P * r / (1 - Math.pow(1 + r, -n)) : P / n
  const start = new Date(startISO || Date.now()), rows = []
  let bal = P
  for (let i = 1; i <= n; i++) {
    const interest = r > 0 ? bal * r : 0
    let principalPart = (i === n) ? bal : pay - interest
    bal = Math.max(0, bal - principalPart)
    const due = new Date(start); due.setMonth(due.getMonth() + i)
    rows.push({ n: i, dueDate: due.toISOString(), amount: Math.round(principalPart + interest), interest: Math.round(interest), principal: Math.round(principalPart), balance: Math.round(bal) })
  }
  return rows
}
function loanRepayState(l) {
  const schedule = l.schedule || []
  const totalDue = schedule.reduce((a, s) => a + s.amount, 0)
  const paid = (l.repayments || []).reduce((a, p) => a + (Number(p.amount) || 0), 0)
  const outstanding = Math.max(0, totalDue - paid)
  const now = Date.now()
  const dueToDate = schedule.filter((s) => new Date(s.dueDate).getTime() <= now).reduce((a, s) => a + s.amount, 0)
  const arrears = Math.max(0, Math.min(outstanding, dueToDate - paid))
  let cum = 0, nextDue = null
  for (const s of schedule) { cum += s.amount; if (cum > paid) { nextDue = s; break } }
  const instStatus = (s) => { let c = 0; for (const x of schedule) { c += x.amount; if (x.n === s.n) break } return c <= paid ? 'Paid' : (new Date(s.dueDate).getTime() < now ? 'Overdue' : 'Due') }
  return { schedule, totalDue, paid, outstanding, arrears, nextDue, instStatus, tenor: schedule.length }
}
function recoveryPlan(outstanding, b) {
  let rem = Number(outstanding) || 0
  const collateral = Math.min(rem, b.collateral); rem -= collateral
  const coop = Math.min(rem, b.coopGuarantee); rem -= coop
  const sterling = Math.min(rem, b.sterlingGuarantee); rem -= sterling
  return { collateral, coop, sterling, shortfall: Math.max(0, rem) }
}
async function recordRepayment(l, amount, ctx, method) {
  const amt = Number(amount) || 0; if (amt <= 0) return l
  const repayments = [...(l.repayments || []), { at: new Date().toISOString(), amount: amt, by: ctx.name, method: method || 'manual' }]
  const st = loanRepayState({ ...l, repayments })
  const status = st.outstanding <= 0 ? 'Completed' : 'Repaying'
  return updateLoan(l.loanId, { repayments, status }, ctx, 'Repayment recorded ' + fmtNaira(amt) + ' (' + (method || 'manual') + ')', '')
}
function genLoanId() { const yy = String(new Date().getFullYear()).slice(2); return 'LN-' + yy + '-' + String(Math.floor(Math.random() * 1000000)).padStart(6, '0') }
async function listLoans() { return (await kvList('loan:')).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)) }
async function createLoan(rec, ctx) {
  const loanId = genLoanId(); const now = new Date().toISOString()
  const record = { loanId, status: 'Applied', apName: '', amountRecommended: null, amountApproved: null, createdBy: ctx.email, createdAt: now, updatedAt: now, ...rec }
  await kvSet('loan:' + loanId, record, ctx.uid)
  await addAudit({ trackingId: loanId, action: 'Application submitted', by: ctx.name, role: ctx.role, note: rec.purpose || '' })
  await notify({ to: ctx.email, title: 'LASMECO application received', body: 'Application ' + loanId + ' submitted to an Accelerator.', event: 'loan', phone: rec.memberPhone })
  await notify({ to: 'role:accelerator', title: 'New LASMECO application', body: rec.memberName + ' \u2014 ' + rec.sector, event: 'loan' })
  return record
}
async function updateLoan(id, patch, ctx, action, note) {
  const cur = await kvGet('loan:' + id); if (!cur) return null
  const next = { ...cur, ...patch, updatedAt: new Date().toISOString() }
  await kvSet('loan:' + id, next, cur.user_id)
  if (action) await addAudit({ trackingId: id, action, by: ctx.name, role: ctx.role, note: note || '' })
  if (patch.status && cur.createdBy && !cur.createdBy.includes('@system')) {
    await notify({ to: cur.createdBy, title: 'LASMECO application update', body: 'Application ' + id + ' is now: ' + patch.status, event: 'loan', phone: cur.memberPhone })
  }
  return next
}
async function payCoopFee(coopId, ctx) { return updateCoop(coopId, { feeStatus: 'Paid' }, ctx, 'Registration fee paid', fmtNaira(COOP_FEES.registration)) }
async function seedDemoData() {
  if (await kvGet('integration:seed-v3')) return
  const now = Date.now(), day = 86400000
  const isoAgo = (ms) => new Date(now - ms).toISOString()
  const monthsAgoISO = (k) => { const d = new Date(now); d.setMonth(d.getMonth() - k); return d.toISOString() }
  // 1) MCCTI cooperatives (varied status / office / compliance)
  const extraCoops = [
    { name: 'Oshodi Market Women Coop', areaOffice: 'Oshodi', sector: 'Trade', custodian: 'R. Alaba', members: 240, contributions: 7200000, status: 'Approved', cap15: 'Compliant', feeStatus: 'Paid' },
    { name: 'Agege Transport Union Coop', areaOffice: 'Agege', sector: 'Transport', custodian: 'S. Okoro', members: 160, contributions: 5400000, status: 'Under review', cap15: 'Under audit', feeStatus: 'Paid' },
    { name: 'Alimosho Tailors Multipurpose', areaOffice: 'Alimosho', sector: 'Artisan', custodian: 'B. Yusuf', members: 95, contributions: 2100000, status: 'Returned', cap15: 'Returns due' },
    { name: 'Kosofe Poultry Farmers Coop', areaOffice: 'Kosofe', sector: 'Agriculture', custodian: 'N. Eze', members: 130, contributions: 3900000, status: 'Filed', cap15: 'Under audit' },
    { name: 'Eti-Osa Fashion Enterprise Coop', areaOffice: 'Eti-Osa', sector: 'Services', custodian: 'T. Coker', members: 210, contributions: 8800000, status: 'Approved', cap15: 'Compliant', feeStatus: 'Paid' },
  ]
  const coopMap = {}
  const allCoopSeeds = [...SEED_COOPS, ...extraCoops]
  for (let i = 0; i < allCoopSeeds.length; i++) {
    const s = allCoopSeeds[i], id = genTrackingId(), created = isoAgo((allCoopSeeds.length - i) * day)
    await kvSet('coop:' + id, { trackingId: id, source: 'MCCTI', regNo: null, returns: null, feeStatus: s.feeStatus || '', createdBy: 'seed@mccti.lg.gov.ng', createdAt: created, updatedAt: created, ...s })
    coopMap[s.name] = id
    await addAudit({ trackingId: id, action: 'Registration filed', by: s.custodian, role: 'society', note: '', at: created })
    if (s.status !== 'Filed') await addAudit({ trackingId: id, action: 'Begin examination', by: 'Area Registrar', role: 'officer', note: '', at: isoAgo((allCoopSeeds.length - i) * day - 3600000) })
    if (s.status === 'Approved') await addAudit({ trackingId: id, action: 'Approved and signed off', by: 'Honourable Commissioner', role: 'leadership', note: 'Compliant with CAP15', at: isoAgo((allCoopSeeds.length - i) * day - 7200000) })
  }
  // 2) Members (varied sectors / KYC / bands)
  const memberSeeds = [
    { name: 'Folake Adisa', coop: 'Oshodi Market Women Coop', sector: 'Trade', phone: '08031000001', gender: 'Female', bvn: 1, nin: 1, msme: { monthlyTurnover: 520000, employees: 4, cashFlow: 200000, customerBase: 160, yearsInOperation: 6 } },
    { name: 'Chidi Okafor', coop: 'Oshodi Market Women Coop', sector: 'Trade', phone: '08031000002', gender: 'Male', bvn: 1, nin: 1, msme: { monthlyTurnover: 780000, employees: 6, cashFlow: 300000, customerBase: 220, yearsInOperation: 8 } },
    { name: 'Aisha Bello', coop: 'Agege Transport Union Coop', sector: 'Transport', phone: '08031000003', gender: 'Female', bvn: 1, nin: 0, msme: { monthlyTurnover: 260000, employees: 2, cashFlow: 80000, customerBase: 70, yearsInOperation: 3 } },
    { name: 'Segun Ade', coop: 'Eti-Osa Fashion Enterprise Coop', sector: 'Services', phone: '08031000004', gender: 'Male', bvn: 1, nin: 1, msme: { monthlyTurnover: 1350000, employees: 9, cashFlow: 500000, customerBase: 380, yearsInOperation: 10 } },
    { name: 'Grace Umeh', coop: 'Kosofe Poultry Farmers Coop', sector: 'Agriculture', phone: '08031000005', gender: 'Female', bvn: 0, nin: 0, msme: { monthlyTurnover: 110000, employees: 1, cashFlow: 30000, customerBase: 40, yearsInOperation: 2 } },
    { name: 'Ibrahim Sule', coop: 'Alimosho Tailors Multipurpose', sector: 'Artisan', phone: '08031000006', gender: 'Male', bvn: 1, nin: 1, msme: { monthlyTurnover: 430000, employees: 3, cashFlow: 150000, customerBase: 120, yearsInOperation: 5 } },
  ]
  const memberMap = {}
  for (let i = 0; i < memberSeeds.length; i++) {
    const s = memberSeeds[i], id = 'M-' + String(100001 + i), email = 'demo.' + s.name.toLowerCase().replace(/[^a-z]+/g, '.') + '@coopeco.ng'
    const status = s.bvn && s.nin ? 'Verified' : (s.bvn || s.nin) ? 'Partial' : 'Unverified'
    await kvSet('member:' + id, { memberId: id, source: 'MCCTI', name: s.name, coop: s.coop, sector: s.sector, phone: s.phone, gender: s.gender, kyc: { bvn: s.bvn ? 'on file' : '', nin: s.nin ? 'on file' : '', bvnVerified: !!s.bvn, ninVerified: !!s.nin, status }, msme: s.msme, createdBy: email, createdAt: isoAgo((10 - i) * day) })
    memberMap[s.name] = { memberId: id, email, phone: s.phone, coop: s.coop, sector: s.sector }
  }
  // 3) Loans across every pipeline stage (with schedules, repayments, arrears, default)
  const mkSchedLoan = (m, amount, tenor, disbMonths, paidCount, status, extra) => {
    const disbAt = monthsAgoISO(disbMonths), schedule = buildSchedule(amount, tenor, 9, disbAt)
    const repayments = []
    for (let k = 0; k < paidCount && k < schedule.length; k++) repayments.push({ at: monthsAgoISO(Math.max(0, disbMonths - k - 1)), amount: schedule[k].amount, by: m.name, method: 'manual' })
    return { memberId: m.memberId, memberName: m.name, memberPhone: m.phone, createdBy: m.email, coop: m.coop, sector: m.sector, amountRequested: amount, amountRecommended: amount, amountApproved: amount, type: LOAN_TYPES[0], purpose: 'Business expansion', status, apName: 'Trade & Commerce Accelerator', tenorMonths: tenor, disbursedAt: disbAt, schedule, repayments, createdAt: monthsAgoISO(disbMonths + 1), updatedAt: new Date().toISOString(), ...(extra || {}) }
  }
  const M = memberMap
  const loanRecs = []
  loanRecs.push({ memberId: M['Grace Umeh'].memberId, memberName: 'Grace Umeh', memberPhone: M['Grace Umeh'].phone, createdBy: M['Grace Umeh'].email, coop: M['Grace Umeh'].coop, sector: 'Agriculture', amountRequested: 900000, type: LOAN_TYPES[0], purpose: 'Feed and stock', status: 'Applied', apName: '', createdAt: isoAgo(2 * day), updatedAt: isoAgo(2 * day) })
  loanRecs.push({ memberId: M['Aisha Bello'].memberId, memberName: 'Aisha Bello', memberPhone: M['Aisha Bello'].phone, createdBy: M['Aisha Bello'].email, coop: M['Aisha Bello'].coop, sector: 'Transport', amountRequested: 1500000, type: LOAN_TYPES[0], purpose: 'Vehicle maintenance', status: 'In training', apName: 'Trade & Commerce Accelerator', createdAt: isoAgo(6 * day), updatedAt: isoAgo(3 * day) })
  loanRecs.push({ memberId: M['Ibrahim Sule'].memberId, memberName: 'Ibrahim Sule', memberPhone: M['Ibrahim Sule'].phone, createdBy: M['Ibrahim Sule'].email, coop: M['Ibrahim Sule'].coop, sector: 'Artisan', amountRequested: 2200000, amountRecommended: 2000000, type: LOAN_TYPES[0], purpose: 'Industrial machines', status: 'Shortlisted', apName: 'Manufacturing Accelerator', createdAt: isoAgo(9 * day), updatedAt: isoAgo(4 * day) })
  loanRecs.push({ memberId: M['Folake Adisa'].memberId, memberName: 'Folake Adisa', memberPhone: M['Folake Adisa'].phone, createdBy: M['Folake Adisa'].email, coop: M['Folake Adisa'].coop, sector: 'Trade', amountRequested: 4000000, amountRecommended: 4000000, type: LOAN_TYPES[0], purpose: 'Bulk inventory', status: 'Coop validated', apName: 'Trade & Commerce Accelerator', createdAt: isoAgo(12 * day), updatedAt: isoAgo(5 * day) })
  loanRecs.push({ memberId: M['Chidi Okafor'].memberId, memberName: 'Chidi Okafor', memberPhone: M['Chidi Okafor'].phone, createdBy: M['Chidi Okafor'].email, coop: M['Chidi Okafor'].coop, sector: 'Trade', amountRequested: 5000000, amountRecommended: 5000000, type: LOAN_TYPES[0], purpose: 'Cold room', status: 'Bank assessment', apName: 'Trade & Commerce Accelerator', createdAt: isoAgo(14 * day), updatedAt: isoAgo(6 * day) })
  loanRecs.push({ memberId: M['Segun Ade'].memberId, memberName: 'Segun Ade', memberPhone: M['Segun Ade'].phone, createdBy: M['Segun Ade'].email, coop: M['Segun Ade'].coop, sector: 'Services', amountRequested: 6000000, amountRecommended: 6000000, amountApproved: 6000000, type: LOAN_TYPES[0], purpose: 'Studio expansion', status: 'BOI approved', apName: 'Trade & Commerce Accelerator', createdAt: isoAgo(16 * day), updatedAt: isoAgo(7 * day) })
  loanRecs.push(mkSchedLoan(M['Folake Adisa'], 3000000, 12, 3, 0, 'Disbursed', { purpose: 'Shop refit' }))       // arrears (no repayments, disbursed 3mo ago)
  loanRecs.push(mkSchedLoan(M['Chidi Okafor'], 4500000, 12, 4, 3, 'Repaying', { purpose: 'Distribution van' }))   // partly repaid
  loanRecs.push(mkSchedLoan(M['Segun Ade'], 2400000, 6, 8, 6, 'Completed', { purpose: 'Equipment' }))              // fully repaid
  const defLoan = mkSchedLoan(M['Ibrahim Sule'], 3600000, 12, 7, 1, 'Default', { purpose: 'Workshop' })
  defLoan.recovery = recoveryPlan(loanRepayState(defLoan).outstanding, loanBreakdown(3600000))
  loanRecs.push(defLoan)
  loanRecs.push({ memberId: M['Grace Umeh'].memberId, memberName: 'Grace Umeh', memberPhone: M['Grace Umeh'].phone, createdBy: M['Grace Umeh'].email, coop: M['Grace Umeh'].coop, sector: 'Agriculture', amountRequested: 8000000, type: LOAN_TYPES[0], purpose: 'Over-exposure request', status: 'Declined', apName: 'Trade & Commerce Accelerator', createdAt: isoAgo(20 * day), updatedAt: isoAgo(15 * day) })
  for (const r of loanRecs) { const id = genLoanId(); await kvSet('loan:' + id, { loanId: id, amountApproved: null, amountRecommended: null, ...r, loanId: id }); await addAudit({ trackingId: id, action: 'Application submitted', by: r.memberName, role: 'member', note: r.purpose || '', at: r.createdAt }) }
  // 4) Wallets + esusu rotation
  await kvSet('wallet:' + mWallet(M['Folake Adisa'].memberId), { id: mWallet(M['Folake Adisa'].memberId), balance: 45000, txns: [{ tid: 'Ts1', type: 'topup', amount: 60000, note: 'Card top-up', by: 'Folake Adisa', at: isoAgo(8 * day) }, { tid: 'Ts2', type: 'debit', amount: 15000, note: 'Saved to cooperative', by: 'Folake Adisa', at: isoAgo(6 * day) }] })
  await kvSet('wallet:' + mWallet(M['Chidi Okafor'].memberId), { id: mWallet(M['Chidi Okafor'].memberId), balance: 30000, txns: [{ tid: 'Ts3', type: 'topup', amount: 50000, note: 'Card top-up', by: 'Chidi Okafor', at: isoAgo(7 * day) }, { tid: 'Ts4', type: 'debit', amount: 20000, note: 'Saved to cooperative', by: 'Chidi Okafor', at: isoAgo(5 * day) }] })
  const poolCoop = coopMap['Oshodi Market Women Coop']
  const order = [M['Folake Adisa'], M['Chidi Okafor']].map((m) => ({ memberId: m.memberId, name: m.name }))
  await kvSet('wallet:' + cWallet(poolCoop), { id: cWallet(poolCoop), balance: 35000, txns: [{ tid: 'Tp1', type: 'contribution-in', amount: 15000, note: 'Save from Folake Adisa', by: 'Folake Adisa', at: isoAgo(6 * day) }, { tid: 'Tp2', type: 'contribution-in', amount: 20000, note: 'Save from Chidi Okafor', by: 'Chidi Okafor', at: isoAgo(5 * day) }], esusu: { order, startAt: monthsAgoISO(1), freq: 'monthly', paid: [] } })
  // 5) Support tickets (varied status/category)
  const tk = (n, status, cat, subject, raiser, raiserName, ageDays, resolvedDays) => { const created = isoAgo(ageDays * day); const updated = resolvedDays != null ? isoAgo(resolvedDays * day) : created; return { ticketId: 'TK-25-' + String(90000 + n), status, category: cat, subject, raisedBy: raiser, raisedByName: raiserName, role: 'member', thread: [{ by: raiserName, role: 'member', text: subject, at: created }, ...(resolvedDays != null ? [{ by: 'Support desk', role: 'officer', text: 'Resolved and closed.', at: updated }] : [])], createdAt: created, updatedAt: updated } }
  const tickets = [
    tk(1, 'Open', 'Wallet / payments', 'Top-up not reflecting', M['Aisha Bello'].email, 'Aisha Bello', 5, null),
    tk(2, 'In progress', 'LASMECO / finance', 'Loan status stuck at assessment', M['Chidi Okafor'].email, 'Chidi Okafor', 4, null),
    tk(3, 'Resolved', 'Registration', 'How to file annual returns', M['Folake Adisa'].email, 'Folake Adisa', 9, 8),
    tk(4, 'Escalated', 'Data / privacy', 'Request to correct my BVN', M['Segun Ade'].email, 'Segun Ade', 6, null),
    tk(5, 'Resolved', 'Annual returns', 'Certificate download failed', M['Ibrahim Sule'].email, 'Ibrahim Sule', 12, 10),
  ]
  for (const t of tickets) await kvSet('ticket:' + t.ticketId, t)
  // 6) Notifications (in-app queues for staff + members)
  const nt = (to, title, body, ageDays) => ({ id: genNotifId(), to, title, body, event: 'seed', at: isoAgo(ageDays * day), read: false })
  const notifs = [
    nt('role:officer', 'New support ticket', 'Top-up not reflecting \u2014 Wallet / payments', 5),
    nt('role:leadership', 'New support ticket', 'Request to correct my BVN \u2014 Data / privacy', 6),
    nt('role:accelerator', 'New LASMECO application', 'Grace Umeh \u2014 Agriculture', 2),
    nt('role:leadership', 'New cooperative application', 'Kosofe Poultry Farmers Coop', 3),
    nt(M['Folake Adisa'].email, 'Welcome to MCCTI CoopEco', 'Your member profile is set up.', 10),
    nt(M['Chidi Okafor'].email, 'LASMECO application update', 'Your application is now: Repaying', 4),
  ]
  for (const n of notifs) await kvSet('notif:' + n.id, n)
  // 7) Documents (metadata) for an approved cooperative
  const docCoop = coopMap['Eti-Osa Fashion Enterprise Coop']
  await kvSet('doc:' + docCoop + ':Dseed1', { id: 'Dseed1', coopId: docCoop, name: 'by-laws.pdf', category: 'By-laws', size: 284000, type: 'application/pdf', url: '', path: '', storage: 'demo', uploadedBy: 'T. Coker', uploadedAt: isoAgo(9 * day), verified: true, verifiedBy: 'Area Registrar' })
  await kvSet('doc:' + docCoop + ':Dseed2', { id: 'Dseed2', coopId: docCoop, name: 'registration-certificate.pdf', category: 'Registration certificate', size: 156000, type: 'application/pdf', url: '', path: '', storage: 'demo', uploadedBy: 'T. Coker', uploadedAt: isoAgo(9 * day), verified: false })
  await kvSet('integration:seed-v3', { done: true, at: new Date().toISOString() })
}
async function seedDemoLoans() {
  if (supa) return
  if ((await kvList('loan:')).length) return
  const base = Date.now() - 5 * 86400000
  const seeds = [
    { memberName: 'Tunde Salami', coop: 'Ibeju-Lekki Farmers Multipurpose Coop', sector: 'Agriculture', amountRequested: 2000000, type: LOAN_TYPES[0], purpose: 'Irrigation equipment', status: 'Applied', apName: '' },
    { memberName: 'Adaeze Okonkwo', coop: 'Ikeja Grand Traders Cooperative', sector: 'Trade', amountRequested: 6000000, amountRecommended: 5000000, type: LOAN_TYPES[0], purpose: 'Expand retail stock', status: 'Shortlisted', apName: 'Trade & Commerce Accelerator' },
    { memberName: 'Emeka Balogun', coop: 'Idumota Textile Merchants Coop', sector: 'Trade', amountRequested: 10000000, amountRecommended: 10000000, type: LOAN_TYPES[0], purpose: 'New machinery', status: 'Coop validated', apName: 'Manufacturing Accelerator' },
    { memberName: 'Blessing Achebe', coop: 'Ikeja Grand Traders Cooperative', sector: 'Trade', amountRequested: 3000000, amountRecommended: 3000000, amountApproved: 3000000, type: LOAN_TYPES[1], purpose: 'Inventory finance', status: 'Disbursed', apName: 'Trade & Commerce Accelerator' },
  ]
  for (let i = 0; i < seeds.length; i++) {
    const id = genLoanId(); const created = new Date(base + i * 86400000).toISOString()
    await kvSet('loan:' + id, { loanId: id, amountApproved: null, amountRecommended: null, ...seeds[i], createdBy: 'qoop@system', createdAt: created, updatedAt: created })
    await addAudit({ trackingId: id, action: 'Application submitted', by: seeds[i].memberName, role: 'member', note: seeds[i].purpose, at: created })
  }
}

function LoanTable({ loans, onOpen }) {
  if (!loans.length) return <p className="muted-line">No applications to show.</p>
  return (
    <div className="rtable-wrap"><table className="rtable">
      <thead><tr><th>Applicant</th><th>Loan ID</th><th>Cooperative</th><th>Sector</th><th>Requested</th><th>Status</th><th></th></tr></thead>
      <tbody>{loans.map((l) => (<tr key={l.loanId}><td className="td-name">{l.memberName}</td><td className="mono">{l.loanId}</td><td>{l.coop}</td><td>{l.sector}</td><td className="mono">{fmtNaira(l.amountApproved || l.amountRecommended || l.amountRequested)}</td><td><StatusChip status={l.status} kind="loan" /></td><td><button className="btn-open" onClick={() => onOpen(l)}>Open</button></td></tr>))}</tbody>
    </table></div>
  )
}
function LoanApplyForm({ ctx, member, onDone, onCancel }) {
  const [f, setF] = useState({ amountRequested: '', type: LOAN_TYPES[0], purpose: '' })
  const [busy, setBusy] = useState(false), [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = async () => {
    setErr('')
    const amt = Number(f.amountRequested) || 0
    if (amt <= 0) { setErr('Enter the amount you need.'); return }
    if (amt > 10000000) { setErr('The LASMECO cap is ₦10,000,000.'); return }
    if (!f.purpose.trim()) { setErr('Describe what the loan is for.'); return }
    setBusy(true)
    try { await createLoan({ memberId: member.memberId, memberName: member.name, memberPhone: member.phone, coop: member.coop, sector: member.sector, amountRequested: amt, type: f.type, purpose: f.purpose.trim() }, ctx); onDone() }
    catch (e) { setErr(e.message || 'Could not submit the application.') } setBusy(false)
  }
  return (
    <div className="panel">
      <div className="panel-head"><h3>Apply for LASMECO finance</h3><button className="link-back" onClick={onCancel}>Cancel</button></div>
      <p className="panel-sub">{member.name} &middot; {member.coop} &middot; {member.sector}</p>
      <div className="form-grid">
        <label className="field"><span>Amount needed (₦, up to 10,000,000)</span><input type="number" value={f.amountRequested} onChange={set('amountRequested')} placeholder="0" /></label>
        <label className="field"><span>Loan type</span><select value={f.type} onChange={set('type')}>{LOAN_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
        <label className="field span2"><span>Purpose</span><textarea value={f.purpose} onChange={set('purpose')} rows={3} placeholder="What the finance is for and the growth it will drive." /></label>
      </div>
      {err && <p className="auth-err">{err}</p>}
      <div className="panel-actions"><button className="btn btn-gold" onClick={submit} disabled={busy}>{busy ? 'Submitting…' : 'Submit to Accelerator'}</button></div>
      <p className="panel-note">No upfront fees. An Accelerator prepares you to bankable standard and recommends an amount. 9% fixed, up to 36 months, 6-month moratorium. A ₦200,000 Accelerator fee and 1% BOI appraisal fee are deducted only on disbursement. This is not legal advice.</p>
    </div>
  )
}
function LoanDetail({ loan, ctx, onClose, onChanged }) {
  const [l, setL] = useState(loan), [note, setNote] = useState(''), [amt, setAmt] = useState(''), [busy, setBusy] = useState(false), [rk, setRk] = useState(0), [tenorInput, setTenorInput] = useState('12'), [repay, setRepay] = useState('')
  const role = ctx.role
  const b = loanBreakdown(l.amountApproved || l.amountRecommended || l.amountRequested)
  const rp = ['Disbursed', 'Repaying', 'Completed', 'Default'].includes(l.status) && (l.schedule || []).length ? loanRepayState(l) : null
  const isBorrower = role === 'member' && (l.createdBy === ctx.email || l.memberId === ctx.focusId)
  const canRecover = role === 'sterling' || role === 'leadership'
  const act = async (patch, action, needNote) => {
    if (needNote && !note.trim()) { alert('Add a note for the record.'); return }
    setBusy(true); const next = await updateLoan(l.loanId, patch, ctx, action, note.trim()); setL(next); setNote(''); setRk((k) => k + 1); setBusy(false); onChanged && onChanged()
  }
  const recommend = async () => { const a = Number(amt) || 0; if (a <= 0 || a > 10000000) { alert('Enter a recommended amount up to ₦10,000,000.'); return } await act({ status: 'Shortlisted', amountRecommended: a }, 'Shortlisted; amount recommended', false) }
  const boiApprove = async () => { const a = Number(amt) || l.amountRecommended || 0; if (a <= 0) { alert('Enter the approved amount.'); return } await act({ status: 'BOI approved', amountApproved: a }, 'Final approval and funding (BOI)', true) }
  const doRepay = async (method) => {
    const a = Number(repay) || 0; if (a <= 0) { alert('Enter a repayment amount.'); return }
    setBusy(true)
    if (method === 'card') { const r = await collectPayment({ email: ctx.email, amountNaira: a, purpose: 'LASMECO repayment ' + l.loanId, metadata: { loanId: l.loanId } }); if (!r.ok) { setBusy(false); if (!r.cancelled) alert('Payment could not be completed.'); return } }
    const next = await recordRepayment(l, a, ctx, method === 'card' ? 'card' : 'manual'); setL(next); setRepay(''); setRk((k) => k + 1); setBusy(false); onChanged && onChanged()
  }
  const doRecover = async () => {
    const plan = recoveryPlan(rp.outstanding, b)
    setBusy(true); const next = await updateLoan(l.loanId, { status: 'Default', recovery: plan }, ctx, 'Default recorded; recovery: collateral ' + fmtNaira(plan.collateral) + ', cooperative ' + fmtNaira(plan.coop) + ', Sterling ' + fmtNaira(plan.sterling) + (plan.shortfall ? ', shortfall ' + fmtNaira(plan.shortfall) : ''), '')
    setL(next); setRk((k) => k + 1); setBusy(false); onChanged && onChanged()
  }
  const canAP = role === 'accelerator', canOff = role === 'officer' || role === 'leadership', canSterling = role === 'sterling', canBOI = role === 'boi'
  const canDecline = (canAP && ['Applied', 'In training'].includes(l.status)) || (canOff && l.status === 'Shortlisted') || (canSterling && ['Coop validated', 'BOI approved'].includes(l.status)) || (canBOI && l.status === 'Bank assessment')
  return (
    <div className="detail">
      <div className="detail-head"><div><h3>{l.memberName}</h3><p className="detail-sub">{l.loanId} &middot; {l.coop} &middot; {l.sector} &middot; {l.type}</p></div><button className="link-back" onClick={onClose}>&larr; Back to list</button></div>
      <div className="detail-chips"><StatusChip status={l.status} kind="loan" />{l.apName && <span className="src-badge src-mccti">{l.apName}</span>}</div>
      <div className="detail-grid" style={{ marginTop: '20px' }}>
        <div className="field-ro"><span>Requested</span><strong>{fmtNaira(l.amountRequested)}</strong></div>
        <div className="field-ro"><span>Recommended</span><strong>{l.amountRecommended ? fmtNaira(l.amountRecommended) : '—'}</strong></div>
        <div className="field-ro"><span>Approved</span><strong>{l.amountApproved ? fmtNaira(l.amountApproved) : '—'}</strong></div>
        <div className="field-ro span2"><span>Purpose</span><strong className="normal">{l.purpose}</strong></div>
      </div>

      {['Bank assessment', 'BOI approved', 'Disbursed', 'Repaying', 'Completed'].includes(l.status) && (
        <div className="returns-box"><h4>Guarantee stack &amp; disbursement</h4>
          <div className="returns-grid">
            <div><span>Loan amount</span><strong>{fmtNaira(b.amount)}</strong></div>
            <div><span>Borrower collateral (10%)</span><strong>{fmtNaira(b.collateral)}</strong></div>
            <div><span>Cooperative guarantee (25%)</span><strong>{fmtNaira(b.coopGuarantee)}</strong></div>
            <div><span>Sterling guarantee (50%)</span><strong>{fmtNaira(b.sterlingGuarantee)}</strong></div>
            <div><span>Accelerator fee</span><strong>{fmtNaira(b.apFee)}</strong></div>
            <div><span>BOI appraisal (1%)</span><strong>{fmtNaira(b.boiFee)}</strong></div>
            <div><span>Net to borrower</span><strong>{fmtNaira(b.netToBorrower)}</strong></div>
            <div><span>Interest</span><strong>9% fixed</strong></div>
          </div>
          {['Disbursed', 'Repaying', 'Completed'].includes(l.status) && <p className="muted-line">Interest 9% = 5% base + 2% Sterling guarantee + 1% Accelerator + 0.5% cooperative + 0.5% monitoring. Repayment over the tenor after the moratorium, by direct debit.</p>}
        </div>
      )}

      {rp && (
        <div className="returns-box"><h4>Repayment schedule{l.tenorMonths ? ' \u00b7 ' + l.tenorMonths + ' months at 9%' : ''}</h4>
          <div className="statgrid">
            <div className="stat"><span className="stat-fig">{fmtNaira(rp.outstanding)}</span><span className="stat-lab">Outstanding</span></div>
            <div className="stat"><span className="stat-fig">{fmtNaira(rp.paid)}</span><span className="stat-lab">Repaid</span></div>
            <div className="stat"><span className="stat-fig">{rp.nextDue ? fmtNaira(rp.nextDue.amount) : '\u2014'}</span><span className="stat-lab">{rp.nextDue ? 'Next due ' + fmtDate(rp.nextDue.dueDate) : 'Fully repaid'}</span></div>
            <div className="stat"><span className="stat-fig" style={rp.arrears ? { color: 'var(--err)' } : undefined}>{fmtNaira(rp.arrears)}</span><span className="stat-lab">In arrears</span></div>
          </div>
          <div className="rtable-wrap"><table className="rtable"><thead><tr><th>#</th><th>Due date</th><th>Amount</th><th>Principal</th><th>Interest</th><th>Status</th></tr></thead>
            <tbody>{rp.schedule.map((s) => { const st = rp.instStatus(s); return (<tr key={s.n}><td className="mono">{s.n}</td><td>{fmtDate(s.dueDate)}</td><td className="mono">{fmtNaira(s.amount)}</td><td className="mono">{fmtNaira(s.principal)}</td><td className="mono">{fmtNaira(s.interest)}</td><td><span className={cx('chip', st === 'Paid' ? 'st-approved' : st === 'Overdue' ? 'st-returned' : 'st-review')}>{st}</span></td></tr>) })}</tbody>
          </table></div>
          {rp.outstanding > 0 && (isBorrower || role === 'sterling' || canOff) && (
            <div className="wallet-actions" style={{ marginTop: '14px' }}>
              <input type="number" value={repay} onChange={(e) => setRepay(e.target.value)} placeholder={'Amount (₦)' + (rp.nextDue ? ', next ' + fmtNaira(rp.nextDue.amount) : '')} />
              {isBorrower && <button className="btn btn-gold btn-sm" disabled={busy} onClick={() => doRepay('card')}>{PAYSTACK_PUBLIC ? 'Pay installment' : 'Pay installment (demo)'}</button>}
              {(role === 'sterling' || canOff) && <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => doRepay('manual')}>Record repayment</button>}
            </div>
          )}
          {rp.arrears > 0 && canRecover && l.status !== 'Default' && (
            <div className="fee-banner" style={{ marginTop: '14px' }}><span>In arrears {fmtNaira(rp.arrears)}. Recovery waterfall: collateral {fmtNaira(recoveryPlan(rp.outstanding, b).collateral)} &rarr; cooperative {fmtNaira(recoveryPlan(rp.outstanding, b).coop)} &rarr; Sterling {fmtNaira(recoveryPlan(rp.outstanding, b).sterling)}.</span><button className="btn btn-outline btn-sm" disabled={busy} onClick={doRecover}>Record default &amp; recovery</button></div>
          )}
          {l.status === 'Default' && l.recovery && (<p className="muted-line">Default recorded. Recovery applied: collateral {fmtNaira(l.recovery.collateral)}, cooperative {fmtNaira(l.recovery.coop)}, Sterling {fmtNaira(l.recovery.sterling)}{l.recovery.shortfall ? ', shortfall ' + fmtNaira(l.recovery.shortfall) : ''}.</p>)}
        </div>
      )}

      <div className="action-box">
        <label className="field"><span>Note (recorded on the audit trail)</span><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Decision, conditions or findings." /></label>
        {(canAP && l.status === 'In training') || (canBOI && l.status === 'Bank assessment') ? <label className="field"><span>Amount (₦)</span><input type="number" value={amt} onChange={(e) => setAmt(e.target.value)} placeholder={String(l.amountRecommended || l.amountRequested || '')} /></label> : null}
        {canSterling && l.status === 'BOI approved' ? <label className="field"><span>Repayment tenor (months)</span><input type="number" value={tenorInput} onChange={(e) => setTenorInput(e.target.value)} placeholder="12" /></label> : null}
        <div className="action-row">
          {canAP && l.status === 'Applied' && <button className="btn btn-gold btn-sm" disabled={busy} onClick={() => act({ status: 'In training', apName: ctx.name }, 'Enrolled in capacity building')}>Begin capacity building</button>}
          {canAP && l.status === 'In training' && <button className="btn btn-gold btn-sm" disabled={busy} onClick={recommend}>Shortlist &amp; recommend amount</button>}
          {canOff && l.status === 'Shortlisted' && <button className="btn btn-gold btn-sm" disabled={busy} onClick={() => act({ status: 'Coop validated' }, 'Cooperative validated; 25% guarantee issued', true)}>Validate cooperative &amp; guarantee</button>}
          {canSterling && l.status === 'Coop validated' && <button className="btn btn-gold btn-sm" disabled={busy} onClick={() => act({ status: 'Bank assessment' }, 'KYC and assessment complete; 50% Sterling guarantee applied', true)}>Assess &amp; apply 50% guarantee</button>}
          {canBOI && l.status === 'Bank assessment' && <button className="btn btn-gold btn-sm" disabled={busy} onClick={boiApprove}>Grant final approval &amp; fund</button>}
          {canSterling && l.status === 'BOI approved' && <button className="btn btn-gold btn-sm" disabled={busy} onClick={() => { const t = Number(tenorInput) || 12; const sched = buildSchedule(l.amountApproved || b.amount, t, 9, new Date().toISOString()); act({ status: 'Disbursed', tenorMonths: t, disbursedAt: new Date().toISOString(), schedule: sched }, 'Funds disbursed; ' + t + '-month repayment schedule generated', true) }}>Disburse to beneficiary</button>}
          {canDecline && <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => act({ status: 'Declined' }, 'Application declined', true)}>Decline</button>}
        </div>
      </div>

      <div className="trail-box"><h4>Loan trail</h4><AuditTrail trackingId={l.loanId} refreshKey={rk} /></div>
    </div>
  )
}
function useLoans() { const [loans, setLoans] = useState(null); const reload = useCallback(() => listLoans().then(setLoans), []); useEffect(() => { reload() }, [reload]); return [loans, reload] }
function AcceleratorWorkspace({ ctx, section }) {
  const [loans, reload] = useLoans(); const [sel, setSel] = useState(null)
  if (!loans) return <p className="muted-line">Loading pipeline\u2026</p>
  if (sel) return <LoanDetail loan={sel} ctx={ctx} onClose={() => { setSel(null); reload() }} onChanged={reload} />
  const queue = loans.filter((l) => AP_STATUSES.includes(l.status))
  const by = (s) => loans.filter((l) => l.status === s).length
  const cards = () => [['New applications', by('Applied')], ['In training', by('In training')], ['Shortlisted', by('Shortlisted')], ['Total in pipeline', loans.length]]
  return (
    <div className="ws">
      {section === 'overview' && <LoanStageOverview loans={loans} cards={cards} />}
      {section === 'queue' && <LoanTable loans={queue} onOpen={setSel} />}
      {section === 'all' && <LoanTable loans={loans} onOpen={setSel} />}
    </div>
  )
}
function LoanRoleWorkspace({ ctx, section, statuses, cards }) {
  const [loans, reload] = useLoans(); const [sel, setSel] = useState(null)
  if (!loans) return <p className="muted-line">Loading loans\u2026</p>
  if (sel) return <LoanDetail loan={sel} ctx={ctx} onClose={() => { setSel(null); reload() }} onChanged={reload} />
  const queue = loans.filter((l) => statuses.includes(l.status))
  return (
    <div className="ws">
      {section === 'overview' && <LoanStageOverview loans={loans} cards={cards} />}
      {section === 'queue' && <LoanTable loans={queue} onOpen={setSel} />}
      {section === 'all' && <LoanTable loans={loans} onOpen={setSel} />}
    </div>
  )
}
function SterlingWorkspace({ ctx, section }) {
  const cards = (loans) => { const d = loans.filter((l) => ['Disbursed', 'Repaying', 'Completed'].includes(l.status)); return [['Awaiting assessment', loans.filter((l) => l.status === 'Coop validated').length], ['To disburse', loans.filter((l) => l.status === 'BOI approved').length], ['Disbursed', d.length], ['Disbursed value', fmtNaira(d.reduce((a, l) => a + (l.amountApproved || 0), 0))]] }
  return <LoanRoleWorkspace ctx={ctx} section={section} statuses={['Coop validated', 'BOI approved', 'Disbursed']} cards={cards} />
}
function BoiWorkspace({ ctx, section }) {
  const cards = (loans) => [['Awaiting approval', loans.filter((l) => l.status === 'Bank assessment').length], ['Approved', loans.filter((l) => l.status === 'BOI approved').length], ['Disbursed', loans.filter((l) => ['Disbursed', 'Repaying', 'Completed'].includes(l.status)).length], ['Applications', loans.length]]
  return <LoanRoleWorkspace ctx={ctx} section={section} statuses={['Bank assessment', 'BOI approved']} cards={cards} />
}
const SPV_SPLIT = [['Lagos State (MCCTI)', 50], ['Asset Matrix MFB', 15], ['Imade / Catridge', 15], ['QooP', 10], ['SEKAT', 10]]
function AssetMatrixWorkspace({ ctx, section }) {
  const [coops, setCoops] = useState(null), [loans, setLoans] = useState([]), [wallets, setWallets] = useState([]), [last, setLast] = useState(null), [busy, setBusy] = useState(false)
  const reload = useCallback(() => { listCoops().then(setCoops); listLoans().then(setLoans); kvList('wallet:').then(setWallets); kvGet('escrow:last').then(setLast) }, [])
  useEffect(() => { reload() }, [reload])
  if (!coops) return <p className="muted-line">Loading escrow\u2026</p>
  const regFees = coops.filter((c) => c.feeStatus === 'Paid').length * COOP_FEES.registration
  const returnsFees = coops.filter((c) => c.returns).length * COOP_FEES.annualReturns
  const disbursedValue = loans.filter((l) => ['Disbursed', 'Repaying', 'Completed'].includes(l.status)).reduce((a, l) => a + (l.amountApproved || 0), 0)
  const portalFees = Math.round(disbursedValue * 0.025)
  const sumTxn = (type) => wallets.reduce((a, w) => a + (w.txns || []).filter((t) => t.type === type).reduce((s, t) => s + (t.amount || 0), 0), 0)
  const funding = sumTxn('topup'), payouts = sumTxn('payout')
  const walletFees = Math.round(funding * 0.01)
  const accrued = regFees + returnsFees + portalFees + walletFees
  const revenueDonut = [{ label: 'Registration & returns', value: regFees + returnsFees, color: CHART_C.gold }, { label: 'Disbursement portal', value: portalFees, color: CHART_C.green }, { label: 'Wallet fees', value: walletFees, color: CHART_C.teal }].filter((d) => d.value)
  const distribute = async () => { setBusy(true); const rec = { amount: accrued, at: new Date().toISOString(), by: ctx.name, split: SPV_SPLIT.map(([n, p]) => [n, Math.round(accrued * p / 100)]) }; await kvSet('escrow:last', rec); await addAudit({ trackingId: 'ESCROW', action: 'Revenue distributed on 50/15/15/10/10', by: ctx.name, role: 'assetmatrix', note: fmtNaira(accrued) }); setLast(rec); setBusy(false) }
  return (
    <div className="ws">
      {section === 'overview' && (<>
        <div className="statgrid">
          <div className="stat"><span className="stat-fig">{fmtNaira(accrued)}</span><span className="stat-lab">Escrow accrued</span></div>
          <div className="stat"><span className="stat-fig">{fmtNaira(regFees + returnsFees)}</span><span className="stat-lab">Registration &amp; returns</span></div>
          <div className="stat"><span className="stat-fig">{fmtNaira(portalFees)}</span><span className="stat-lab">Disbursement portal (2.5%)</span></div>
          <div className="stat"><span className="stat-fig">{fmtNaira(walletFees)}</span><span className="stat-lab">Wallet fees (1%)</span></div>
        </div>
        <div className="chart-grid">
          <section className="chart-card"><h4>Revenue by stream</h4>{revenueDonut.length ? <Donut data={revenueDonut} centerTop={fmtNaira(accrued)} centerBottom="accrued" /> : <p className="muted-line">No revenue accrued yet.</p>}</section>
          <section className="chart-card wide"><h4>Payments throughput</h4><div className="status-row"><span>Wallet funding processed</span><span className="mono">{fmtNaira(funding)}</span></div><div className="status-row"><span>Esusu payouts</span><span className="mono">{fmtNaira(payouts)}</span></div><div className="status-row"><span>LASMECO disbursed</span><span className="mono">{fmtNaira(disbursedValue)}</span></div><div className="status-row"><span>Active wallets</span><span className="mono">{wallets.length}</span></div></section>
        </div>
      </>)}
      {section === 'distribution' && (
        <div className="dash-grid">
          <section className="dash-card"><h3>Sharing formula distribution</h3>{SPV_SPLIT.map(([n, p]) => (<div className="status-row" key={n}><span>{n} ({p}%)</span><span className="mono">{fmtNaira(Math.round(accrued * p / 100))}</span></div>))}<div className="panel-actions"><button className="btn btn-gold btn-sm" onClick={distribute} disabled={busy}>{busy ? 'Recording\u2026' : 'Record distribution'}</button></div></section>
          <section className="dash-card"><h3>Last distribution</h3>{last ? (<><p className="dash-card-sub">{fmtNaira(last.amount)} on {fmtDate(last.at)} by {last.by}</p>{(last.split || []).map(([n, v]) => (<div className="status-row" key={n}><span>{n}</span><span className="mono">{fmtNaira(v)}</span></div>))}</>) : <p className="muted-line">No distribution recorded yet.</p>}</section>
        </div>
      )}
      <p className="dash-foot">Asset Matrix MFB holds the platform revenue escrow, distributed on the 50/15/15/10/10 formula. Live bank settlement connects through Paystack or Flutterwave. Not financial advice.</p>
    </div>
  )
}
function LasmecoOverview({ ctx }) {
  const [loans, reload] = useLoans(); const [sel, setSel] = useState(null)
  if (!loans) return <p className="muted-line">Loading LASMECO…</p>
  if (sel) return <LoanDetail loan={sel} ctx={ctx} onClose={() => { setSel(null); reload() }} onChanged={reload} />
  const disbursed = loans.filter((l) => ['Disbursed', 'Repaying', 'Completed'].includes(l.status))
  const disbursedValue = disbursed.reduce((a, l) => a + (l.amountApproved || 0), 0)
  const bySector = Array.from(new Set(loans.map((l) => l.sector))).map((s) => [s, loans.filter((l) => l.sector === s).length])
  return (
    <div className="ws">
      <div className="statgrid"><div className="stat"><span className="stat-fig">{loans.length}</span><span className="stat-lab">Applications</span></div><div className="stat"><span className="stat-fig">{disbursed.length}</span><span className="stat-lab">Disbursed</span></div><div className="stat"><span className="stat-fig">{fmtNaira(disbursedValue)}</span><span className="stat-lab">Disbursed value</span></div><div className="stat"><span className="stat-fig">{loans.filter((l) => !['Disbursed', 'Repaying', 'Completed', 'Declined'].includes(l.status)).length}</span><span className="stat-lab">In pipeline</span></div></div>
      <div className="band-dist">{bySector.map(([s, n]) => (<div className="bd" key={s}><span className="src-badge src-mccti">{s}</span><span className="bd-n">{n}</span></div>))}</div>
      <LoanTable loans={loans} onOpen={setSel} />
    </div>
  )
}


/* =============================== STAGE 6 ===============================
   Digital Wallet & Payments. Member wallets, cooperative savings pools and a
   rotating esusu / ajo, with transactions. Payments run through a stub that
   uses Paystack or Flutterwave when their keys are configured.
   ====================================================================== */
/* ---- Paystack collections (test mode until keys are set) -----------------
   Inbound payments (fees, wallet funding) run through Paystack when
   VITE_PAYSTACK_PUBLIC_KEY is set and are verified server-side via
   /api/paystack/verify (PAYSTACK_SECRET_KEY). With no key the app falls back to
   a demo success so every flow keeps working. Disbursements use bank rails, not
   card checkout. */
const PAYSTACK_PUBLIC = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) || ''
let _psLoad
function loadPaystack() {
  if (typeof window !== 'undefined' && window.PaystackPop) return Promise.resolve()
  if (_psLoad) return _psLoad
  _psLoad = new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://js.paystack.co/v1/inline.js'; s.onload = res; s.onerror = rej; document.body.appendChild(s) })
  return _psLoad
}
async function verifyPaystack(reference) {
  if (!reference || String(reference).startsWith('DEMO-')) return { status: 'success', demo: true }
  try { const r = await fetch('/api/paystack/verify?reference=' + encodeURIComponent(reference)); return await r.json() } catch (e) { return { status: 'unknown' } }
}
async function collectPayment({ email, amountNaira, purpose, metadata }) {
  const amt = Number(amountNaira) || 0
  if (!PAYSTACK_PUBLIC) return { ok: true, demo: true, reference: 'DEMO-' + Date.now() }
  try { await loadPaystack() } catch (e) { return { ok: false, error: 'Could not load Paystack' } }
  const res = await new Promise((resolve) => {
    try {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC, email: email || 'member@coopeco.ng', amount: Math.round(amt * 100), currency: 'NGN',
        ref: 'CE-' + Date.now() + '-' + Math.floor(Math.random() * 100000), metadata: Object.assign({ purpose }, metadata || {}),
        callback: (resp) => resolve({ ok: true, reference: resp.reference }), onClose: () => resolve({ ok: false, cancelled: true }),
      })
      handler.openIframe()
    } catch (e) { resolve({ ok: false, error: 'Paystack init failed' }) }
  })
  if (!res.ok) return res
  const v = await verifyPaystack(res.reference)
  return { ok: v.status === 'success' || v.demo || v.status === 'demo', reference: res.reference, status: v.status, demo: res.demo || v.demo }
}
/* ---- Notifications (in-app + SMS/WhatsApp) -------------------------------
   Every notification is stored in-app so recipients always see it. When a phone
   number and a provider (Termii or Twilio) are configured, it is also sent by
   SMS or WhatsApp via /api/notify. Recipients are an email or a role (role:officer,
   role:leadership) so staff share a queue. */
function genNotifId() { return 'N' + Date.now() + Math.floor(Math.random() * 10000) }
async function listNotifs(ctx) { const all = await kvList('notif:'); return all.filter((n) => n.to === ctx.email || n.to === 'role:' + ctx.role).sort((a, b) => (a.at < b.at ? 1 : -1)) }
async function notify({ to, title, body, event, phone, channel }) {
  if (!to) return
  const id = genNotifId()
  await kvSet('notif:' + id, { id, to, title, body: body || '', event: event || '', at: new Date().toISOString(), read: false })
  if (phone) { try { await fetch('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: phone, channel: channel || 'sms', message: title + (body ? ': ' + body : '') }) }) } catch (e) { /* in-app only */ } }
}
async function markNotifRead(id) { const n = await kvGet('notif:' + id); if (n && !n.read) await kvSet('notif:' + id, { ...n, read: true }) }
async function markAllNotifsRead(ctx) { const list = await listNotifs(ctx); for (const n of list) if (!n.read) await kvSet('notif:' + n.id, { ...n, read: true }) }
function NotificationCenter({ ctx, onChange }) {
  const [items, setItems] = useState(null)
  const reload = useCallback(() => listNotifs(ctx).then((l) => { setItems(l); onChange && onChange() }), [ctx.email, ctx.role])
  useEffect(() => { reload() }, [reload])
  if (!items) return <p className="muted-line">Loading notifications\u2026</p>
  const unread = items.filter((n) => !n.read).length
  return (
    <div className="ws">
      <div className="support-cta"><span>{unread ? unread + ' unread notification' + (unread === 1 ? '' : 's') : 'You\u2019re all caught up.'}</span>{unread ? <button className="btn btn-outline btn-sm" onClick={async () => { await markAllNotifsRead(ctx); reload() }}>Mark all read</button> : null}</div>
      {items.length ? <div className="notif-list">{items.map((n) => (<div className={cx('notif', !n.read && 'unread')} key={n.id} onClick={async () => { await markNotifRead(n.id); reload() }}><span className="notif-dot" aria-hidden="true" /><div className="notif-body"><strong>{n.title}</strong>{n.body ? <p>{n.body}</p> : null}<span className="notif-at">{fmtDate(n.at)}</span></div></div>))}</div> : <p className="muted-line">No notifications yet.</p>}
    </div>
  )
}
/* ---- Document uploads (Supabase Storage, demo fallback) ------------------ */
const DOC_CATEGORIES = ['By-laws', 'Registration certificate', 'Trustee ID', 'Financial statement', 'Meeting minutes', 'Other']
function fileToDataURL(file) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(file) }) }
function genDocId() { return 'D' + Date.now() + Math.floor(Math.random() * 10000) }
async function listDocs(coopId) { const all = await kvList('doc:'); return all.filter((d) => d.coopId === coopId).sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1)) }
async function uploadDocument(file, coopId, category, ctx) {
  if (!file) return { ok: false, error: 'No file selected.' }
  if (file.size > 5 * 1024 * 1024) return { ok: false, error: 'File exceeds 5MB. Please compress and retry.' }
  const id = genDocId(), safe = file.name.replace(/[^A-Za-z0-9._-]+/g, '_'), path = coopId + '/' + id + '-' + safe
  let url = '', storage = 'demo'
  if (supa) {
    try {
      const up = await supa.storage.from('coop-docs').upload(path, file, { upsert: true, contentType: file.type })
      if (up.error) return { ok: false, error: up.error.message || 'Upload failed. Is the coop-docs bucket created?' }
      const pub = supa.storage.from('coop-docs').getPublicUrl(path)
      url = (pub && pub.data && pub.data.publicUrl) || ''; storage = 'supabase'
    } catch (e) { return { ok: false, error: 'Storage upload failed.' } }
  } else if (file.size <= 1024 * 1024) { url = await fileToDataURL(file) }
  const rec = { id, coopId, name: file.name, category, size: file.size, type: file.type, url, path, storage, uploadedBy: ctx.name, uploadedAt: new Date().toISOString(), verified: false }
  await kvSet('doc:' + coopId + ':' + id, rec)
  return { ok: true, rec }
}
async function setDocVerified(coopId, id, verified, ctx) { const d = await kvGet('doc:' + coopId + ':' + id); if (d) await kvSet('doc:' + coopId + ':' + id, { ...d, verified, verifiedBy: ctx.name, verifiedAt: new Date().toISOString() }) }
async function deleteDocument(coopId, id) { const d = await kvGet('doc:' + coopId + ':' + id); if (d && supa && d.path) { try { await supa.storage.from('coop-docs').remove([d.path]) } catch (e) { /* ignore */ } } await kvDelete('doc:' + coopId + ':' + id) }
function fmtFileSize(b) { return b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB' }
function DocumentsPanel({ coopId, ctx, canVerify, canUpload = true }) {
  const [docs, setDocs] = useState(null), [cat, setCat] = useState(DOC_CATEGORIES[0]), [busy, setBusy] = useState(false), [err, setErr] = useState('')
  const fileRef = useRef(null)
  const reload = useCallback(() => listDocs(coopId).then(setDocs), [coopId])
  useEffect(() => { reload() }, [reload])
  const onUpload = async (e) => { const f = e.target.files[0]; if (!f) return; setErr(''); setBusy(true); const r = await uploadDocument(f, coopId, cat, ctx); setBusy(false); if (fileRef.current) fileRef.current.value = ''; if (!r.ok) setErr(r.error || 'Upload failed.'); else reload() }
  if (!docs) return <p className="muted-line">Loading documents\u2026</p>
  return (
    <div className="docs">
      {canUpload && <div className="docs-upload"><select value={cat} onChange={(e) => setCat(e.target.value)}>{DOC_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select><input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx" onChange={onUpload} disabled={busy} /></div>}
      {busy && <p className="muted-line">Uploading\u2026</p>}
      {err && <p className="auth-err">{err}</p>}
      {docs.length ? <div className="docs-list">{docs.map((d) => (<div className="doc-row" key={d.id}><div className="doc-meta"><strong>{d.name}</strong><span>{d.category} &middot; {fmtFileSize(d.size)} &middot; {d.uploadedBy} {d.verified ? <span className="chip st-approved">Verified</span> : null}</span></div><div className="doc-actions">{d.url ? <a className="link-inline" href={d.url} target="_blank" rel="noreferrer">View</a> : <span className="muted-line sm">Stored</span>}{canVerify && !d.verified ? <button className="link-inline" onClick={async () => { await setDocVerified(coopId, d.id, true, ctx); reload() }}>Verify</button> : null}{(canUpload || canVerify) ? <button className="link-inline danger" onClick={async () => { await deleteDocument(coopId, d.id); reload() }}>Remove</button> : null}</div></div>))}</div> : <p className="muted-line">No documents uploaded yet.</p>}
      {!hasSupabase ? <p className="panel-note">Demo mode: small files preview in-browser only. Connect Supabase Storage (create a bucket named \u201ccoop-docs\u201d) to store full documents securely.</p> : null}
    </div>
  )
}
async function getWallet(id) { return (await kvGet('wallet:' + id)) || { id, balance: 0, txns: [] } }
async function walletTxn(id, type, amount, note, by) {
  const w = await getWallet(id); const amt = Number(amount) || 0
  const credit = ['credit', 'payout', 'topup', 'contribution-in'].includes(type)
  const bal = Math.max(0, (w.balance || 0) + (credit ? amt : -amt))
  const txn = { tid: 'T' + Date.now() + Math.floor(Math.random() * 1000), type, amount: amt, note: note || '', by: by || '', at: new Date().toISOString() }
  const next = { id, balance: bal, txns: [txn, ...(w.txns || [])].slice(0, 60), esusu: w.esusu }
  await kvSet('wallet:' + id, next); return next
}
async function walletTransfer(from, to, amount, note, by) { await walletTxn(from, 'debit', amount, note, by); return walletTxn(to, 'credit', amount, note, by) }
const mWallet = (memberId) => 'M:' + memberId
const cWallet = (coopId) => 'C:' + coopId

function TxnList({ txns }) {
  if (!txns?.length) return <p className="muted-line">No transactions yet.</p>
  const label = { topup: 'Added funds', credit: 'Received', debit: 'Sent', payout: 'Esusu payout', 'contribution-in': 'Contribution', 'fee': 'Fee paid' }
  return (
    <div className="txns">{txns.map((t) => (
      <div className="txn" key={t.tid}>
        <span className={cx('txn-dir', ['topup', 'credit', 'payout', 'contribution-in'].includes(t.type) ? 'in' : 'out')}>{['topup', 'credit', 'payout', 'contribution-in'].includes(t.type) ? '+' : '\u2212'}{fmtNaira(t.amount)}</span>
        <span className="txn-mid"><strong>{label[t.type] || t.type}</strong>{t.note ? ' \u00b7 ' + t.note : ''}</span>
        <span className="txn-at">{fmtDate(t.at)}</span>
      </div>))}</div>
  )
}
function MemberWallet({ member }) {
  const [w, setW] = useState(null), [amt, setAmt] = useState(''), [busy, setBusy] = useState(false), [coops, setCoops] = useState([])
  const id = mWallet(member.memberId)
  const reload = useCallback(() => { getWallet(id).then(setW); listCoops().then(setCoops) }, [id])
  useEffect(() => { reload() }, [reload])
  if (!w) return <p className="muted-line">Loading wallet\u2026</p>
  const coop = coops.find((c) => c.name === member.coop)
  const topup = async () => { const a = Number(amt) || 0; if (a <= 0) return; setBusy(true); const r = await collectPayment({ email: member.createdBy || 'member@coopeco.ng', amountNaira: a, purpose: 'Wallet funding', metadata: { memberId: member.memberId } }); if (r.ok) { await walletTxn(id, 'topup', a, r.demo ? 'Card top-up (demo)' : 'Card top-up', member.name) } else if (!r.cancelled) { alert('Payment could not be completed. Please try again.') } await reload(); setAmt(''); setBusy(false) }
  const save = async () => { const a = Number(amt) || 0; if (a <= 0) { alert('Enter an amount.'); return } if (a > w.balance) { alert('Insufficient wallet balance. Add funds first.'); return } if (!coop) { alert('Your cooperative is not on the platform yet.'); return } setBusy(true); await walletTransfer(id, cWallet(coop.trackingId), a, 'Savings to ' + coop.name, member.name); await reload(); setAmt(''); setBusy(false) }
  return (
    <div className="wallet">
      <div className="wallet-top"><div><span className="wallet-lab">Wallet balance</span><span className="wallet-bal">{fmtNaira(w.balance)}</span></div><span className="wallet-chip">Digital wallet</span></div>
      <div className="wallet-actions">
        <input type="number" value={amt} onChange={(e) => setAmt(e.target.value)} placeholder="Amount (\u20A6)" />
        <button className="btn btn-gold btn-sm" onClick={topup} disabled={busy}>Add funds</button>
        <button className="btn btn-outline btn-sm" onClick={save} disabled={busy}>Save to cooperative</button>
      </div>
      <p className="panel-note">{PAYSTACK_PUBLIC ? 'Card top-ups are processed securely through Paystack (test mode until live keys are set).' : 'Top-ups and transfers are demo movements until Paystack is connected.'} Savings move into your cooperative\u2019s pool.</p>
      <h4 className="wallet-h">Recent transactions</h4>
      <TxnList txns={w.txns} />
    </div>
  )
}
function CoopEsusu({ coop, ctx }) {
  const [w, setW] = useState(null), [members, setMembers] = useState([]), [busy, setBusy] = useState(false)
  const id = cWallet(coop.trackingId)
  const reload = useCallback(() => { getWallet(id).then(setW); listMembers().then(setMembers) }, [id])
  useEffect(() => { reload() }, [reload])
  if (!w) return <p className="muted-line">Loading savings\u2026</p>
  const roster = members.filter((m) => m.coop === coop.name)
  const canManage = ctx.role === 'society' || ctx.role === 'leadership'
  const es = w.esusu && w.esusu.order ? w.esusu : null
  const startRotation = async () => {
    if (roster.length < 2) { alert('You need at least 2 members to start a rotation.'); return }
    setBusy(true)
    const order = roster.map((m) => ({ memberId: m.memberId, name: m.name }))
    const cur = await getWallet(id); await kvSet('wallet:' + id, { ...cur, esusu: { order, startAt: new Date().toISOString(), freq: 'monthly', paid: [] } })
    await reload(); setBusy(false)
  }
  const schedule = () => { if (!es) return []; const start = new Date(es.startAt); return es.order.map((o, i) => { const due = new Date(start); due.setMonth(due.getMonth() + i); const paid = (es.paid || []).find((p) => p.pos === i); return { pos: i, name: o.name, memberId: o.memberId, dueDate: due.toISOString(), paid: !!paid, paidAmount: paid ? paid.amount : 0 } }) }
  const sched = schedule()
  const nextDue = sched.find((s) => !s.paid && new Date(s.dueDate).getTime() <= Date.now())
  const upcoming = sched.find((s) => !s.paid && new Date(s.dueDate).getTime() > Date.now())
  const processDue = async () => {
    if (!nextDue) return
    if (w.balance <= 0) { alert('The savings pool is empty. Members need to save first.'); return }
    setBusy(true)
    const payout = w.balance
    await walletTxn(id, 'debit', payout, 'Esusu payout to ' + nextDue.name, ctx.name)
    await walletTxn(mWallet(nextDue.memberId), 'payout', payout, 'Esusu payout from ' + coop.name, ctx.name)
    const cur = await getWallet(id); const paid = [...((cur.esusu && cur.esusu.paid) || []), { memberId: nextDue.memberId, pos: nextDue.pos, at: new Date().toISOString(), amount: payout }]
    await kvSet('wallet:' + id, { ...cur, esusu: { ...cur.esusu, paid } })
    const m = roster.find((x) => x.memberId === nextDue.memberId); if (m) await notify({ to: m.createdBy, title: 'Esusu payout received', body: fmtNaira(payout) + ' from ' + coop.name, event: 'esusu', phone: m.phone })
    await reload(); setBusy(false)
  }
  return (
    <div className="wallet">
      <div className="wallet-top"><div><span className="wallet-lab">Cooperative savings pool (esusu / ajo)</span><span className="wallet-bal">{fmtNaira(w.balance)}</span></div><span className="wallet-chip">{roster.length} members</span></div>
      {!es ? (
        <div className="esusu-next"><span>No rotation set up yet. Members save into the pool; a rotation pays the pool to each member in turn, on a monthly schedule.</span>{canManage ? <button className="btn btn-gold btn-sm" onClick={startRotation} disabled={busy}>{busy ? 'Starting\u2026' : 'Start rotation'}</button> : null}</div>
      ) : (<>
        <div className="esusu-next"><span>{nextDue ? 'Due now \u2014 pays to' : upcoming ? 'Next payout goes to' : 'Rotation complete for'}</span><strong>{(nextDue || upcoming || sched[sched.length - 1] || {}).name || '\u2014'}</strong>{canManage && nextDue ? <button className="btn btn-gold btn-sm" onClick={processDue} disabled={busy}>{busy ? 'Paying\u2026' : 'Process due payout'}</button> : null}</div>
        <div className="rtable-wrap"><table className="rtable"><thead><tr><th>#</th><th>Member</th><th>Scheduled</th><th>Status</th></tr></thead>
          <tbody>{sched.map((s) => { const st = s.paid ? 'Paid' : (new Date(s.dueDate).getTime() <= Date.now() ? 'Due' : 'Upcoming'); return (<tr key={s.pos}><td className="mono">{s.pos + 1}</td><td>{s.name}</td><td>{fmtDate(s.dueDate)}</td><td><span className={cx('chip', st === 'Paid' ? 'st-approved' : st === 'Due' ? 'st-review' : 'st-filed')}>{st}{s.paid ? ' \u00b7 ' + fmtNaira(s.paidAmount) : ''}</span></td></tr>) })}</tbody>
        </table></div>
      </>)}
      <p className="panel-note">Rotation is scheduled monthly and pays the pool to each member in turn. In production a scheduled job processes each due payout automatically and notifies the recipient; here the society triggers the due payout. Demo movements until payments are connected.</p>
      <h4 className="wallet-h">Pool activity</h4>
      <TxnList txns={w.txns} />
    </div>
  )
}
/* =============================== STAGE 7 ===============================
   Support & Grievance Redress. A help concierge with an FAQ, an optional AI
   assistant (via the server-side proxy when a key is configured), and a
   ticketing / grievance system: members and partners raise issues, the
   Directorate triages, and leadership is the escalation panel.
   ====================================================================== */
const TICKET_CATS = ['Registration', 'Annual returns', 'LASMECO / finance', 'Wallet / payments', 'Data / privacy', 'Other']
const FAQ = [
  { q: 'How do I register my cooperative?', a: 'Sign in as a Cooperative Society and file your society. You receive a tracking ID; MCCTI leadership reviews the documents and approves or returns the application.' },
  { q: 'What does it cost to join?', a: 'A one-time registration fee of \u20A650,000, plus \u20A615,000 per year for annual returns filing. LASMECO loans carry no upfront fee to the borrower.' },
  { q: 'How do I apply for a LASMECO loan?', a: 'As a member, complete your profile and apply from your dashboard. An Accelerator prepares you, your cooperative is validated, Sterling Bank assesses and guarantees, the Bank of Industry approves and funds, and Sterling disburses.' },
  { q: 'How do the wallet and esusu work?', a: 'Add funds to your wallet and save into your cooperative pool. The society disburses the pool to members in rotation (esusu / ajo).' },
  { q: 'How is my data handled?', a: 'You consent to processing at sign-up, can download your data, and can erase your personal data at any time from your dashboard. See the Privacy notice.' },
]
function genTicketId() { return 'TK-' + String(new Date().getFullYear()).slice(2) + '-' + String(Math.floor(Math.random() * 100000)).padStart(5, '0') }
async function listTickets() { return (await kvList('ticket:')).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)) }
async function createTicket(rec, ctx) {
  const id = genTicketId(), now = new Date().toISOString()
  const t = { ticketId: id, status: 'Open', raisedBy: ctx.email, raisedByName: ctx.name, role: ctx.role, thread: [{ by: ctx.name, role: ctx.role, text: rec.message, at: now }], createdAt: now, updatedAt: now, ...rec }
  await kvSet('ticket:' + id, t, ctx.uid)
  await notify({ to: 'role:officer', title: 'New support ticket', body: rec.subject + ' \u2014 ' + (rec.category || ''), event: 'ticket' })
  await notify({ to: 'role:leadership', title: 'New support ticket', body: rec.subject + ' \u2014 ' + (rec.category || ''), event: 'ticket' })
  return t
}
async function updateTicket(id, patch, ctx, reply) {
  const cur = await kvGet('ticket:' + id); if (!cur) return null
  const now = new Date().toISOString()
  const thread = reply ? [...(cur.thread || []), { by: ctx.name, role: ctx.role, text: reply, at: now }] : cur.thread
  const next = { ...cur, ...patch, thread, updatedAt: now }
  await kvSet('ticket:' + id, next, cur.user_id)
  if ((reply || patch.status) && cur.raisedBy && cur.raisedBy !== ctx.email) {
    await notify({ to: cur.raisedBy, title: 'Support ticket update', body: cur.subject + (patch.status ? ' \u2014 ' + patch.status : ' \u2014 new reply'), event: 'ticket' })
  }
  return next
}
function AskConcierge() {
  const [q, setQ] = useState(''), [a, setA] = useState(null), [busy, setBusy] = useState(false)
  const ask = async () => {
    if (!q.trim()) return; setBusy(true); setA(null)
    let ans = ''
    try {
      const r = await fetch('/api/anthropic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: q.trim() }] }) })
      const d = await r.json().catch(() => ({}))
      if (r.ok && d && d.content) ans = Array.isArray(d.content) ? d.content.map((x) => x.text || '').join('') : String(d.content)
    } catch (e) { ans = '' }
    setA(ans || 'The AI concierge activates once the Ministry connects its assistant key. In the meantime, browse the FAQ below or raise a ticket and the Directorate will respond.')
    setBusy(false)
  }
  return (
    <div className="concierge">
      <div className="concierge-row"><input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ask()} placeholder="Ask a question, e.g. how do I apply for LASMECO?" /><button className="btn btn-gold btn-sm" onClick={ask} disabled={busy}>{busy ? 'Asking\u2026' : 'Ask'}</button></div>
      {a && <div className="concierge-ans">{a}</div>}
    </div>
  )
}
function RaiseTicketForm({ ctx, coop, onDone, onCancel }) {
  const [f, setF] = useState({ subject: '', category: TICKET_CATS[0], message: '' })
  const [busy, setBusy] = useState(false), [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = async () => { setErr(''); if (!f.subject.trim() || !f.message.trim()) { setErr('Add a subject and a message.'); return } setBusy(true); await createTicket({ subject: f.subject.trim(), category: f.category, message: f.message.trim(), coop: coop || '' }, ctx); setBusy(false); onDone() }
  return (
    <div className="panel">
      <div className="panel-head"><h3>Raise a support ticket</h3><button className="link-back" onClick={onCancel}>Cancel</button></div>
      <div className="form-grid">
        <label className="field span2"><span>Subject</span><input value={f.subject} onChange={set('subject')} placeholder="Briefly, what is the issue?" /></label>
        <label className="field"><span>Category</span><select value={f.category} onChange={set('category')}>{TICKET_CATS.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="field span2"><span>Message</span><textarea value={f.message} onChange={set('message')} rows={4} placeholder="Describe the issue or grievance in detail." /></label>
      </div>
      {err && <p className="auth-err">{err}</p>}
      <div className="panel-actions"><button className="btn btn-gold" onClick={submit} disabled={busy}>{busy ? 'Submitting\u2026' : 'Submit ticket'}</button></div>
      <p className="panel-note">Grievances are tracked and addressed by the Directorate within the programme\u2019s service timelines, and escalated to leadership where unresolved.</p>
    </div>
  )
}
function TicketDetail({ ticket, ctx, onClose, onChanged }) {
  const [t, setT] = useState(ticket), [reply, setReply] = useState(''), [busy, setBusy] = useState(false)
  const staff = ctx.role === 'officer' || ctx.role === 'leadership'
  const act = async (patch, needReply) => {
    if (needReply && !reply.trim()) { alert('Add a message.'); return }
    setBusy(true); const n = await updateTicket(t.ticketId, patch, ctx, reply.trim()); setT(n); setReply(''); setBusy(false); onChanged && onChanged()
  }
  return (
    <div className="detail">
      <div className="detail-head"><div><h3>{t.subject}</h3><p className="detail-sub">{t.ticketId} &middot; {t.category} &middot; raised by {t.raisedByName}{t.coop ? ' \u00b7 ' + t.coop : ''}</p></div><button className="link-back" onClick={onClose}>&larr; Back</button></div>
      <div className="detail-chips"><StatusChip status={t.status} kind="ticket" /></div>
      <div className="thread">{(t.thread || []).map((m, i) => (<div className={cx('msg', (m.role === 'officer' || m.role === 'leadership') && 'staff')} key={i}><div className="msg-head"><strong>{m.by}</strong><span>{roleTitle(m.role)} &middot; {fmtDate(m.at)}</span></div><p>{m.text}</p></div>))}</div>
      {t.status !== 'Resolved' && (
        <div className="action-box">
          <label className="field"><span>Reply</span><textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3} placeholder="Add a reply or update." /></label>
          <div className="action-row">
            <button className="btn btn-gold btn-sm" disabled={busy} onClick={() => act({ status: staff && t.status === 'Open' ? 'In progress' : t.status }, true)}>Send reply</button>
            {staff && <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => act({ status: 'Resolved' }, false)}>Mark resolved</button>}
            {ctx.role === 'officer' && <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => act({ status: 'Escalated' }, true)}>Escalate to leadership</button>}
          </div>
        </div>
      )}
    </div>
  )
}
function SupportConcierge({ ctx }) {
  const staff = ctx.role === 'officer' || ctx.role === 'leadership'
  const [tickets, setTickets] = useState(null), [mode, setMode] = useState('home'), [sel, setSel] = useState(null)
  const reload = useCallback(() => { listTickets().then(setTickets) }, [])
  useEffect(() => { reload() }, [reload])
  if (!tickets) return <p className="muted-line">Loading support\u2026</p>
  if (sel) return <TicketDetail ticket={sel} ctx={ctx} onClose={() => { setSel(null); reload() }} onChanged={reload} />
  if (mode === 'raise') return <RaiseTicketForm ctx={ctx} onCancel={() => setMode('home')} onDone={() => { setMode('home'); reload() }} />
  const mine = tickets.filter((t) => t.raisedBy === ctx.email)
  const open = tickets.filter((t) => t.status !== 'Resolved')
  const rows = (list) => (
    <div className="rtable-wrap"><table className="rtable"><thead><tr><th>Ticket</th><th>Subject</th><th>Category</th><th>Raised by</th><th>Status</th><th></th></tr></thead>
      <tbody>{list.map((t) => (<tr key={t.ticketId}><td className="mono">{t.ticketId}</td><td className="td-name">{t.subject}</td><td>{t.category}</td><td>{t.raisedByName}</td><td><StatusChip status={t.status} kind="ticket" /></td><td><button className="btn-open" onClick={() => setSel(t)}>Open</button></td></tr>))}</tbody>
    </table></div>
  )
  return (
    <div className="ws">
      <div className="section-head" style={{ maxWidth: 'none', marginBottom: '8px' }}><h2 style={{ fontSize: '24px' }}>{staff ? 'Support &amp; grievance desk' : 'Help &amp; support'}</h2></div>
      <AskConcierge />
      {staff ? (
        <>
          <div className="statgrid"><div className="stat"><span className="stat-fig">{tickets.filter((t) => t.status === 'Open').length}</span><span className="stat-lab">Open</span></div><div className="stat"><span className="stat-fig">{tickets.filter((t) => t.status === 'In progress').length}</span><span className="stat-lab">In progress</span></div><div className="stat"><span className="stat-fig">{tickets.filter((t) => t.status === 'Escalated').length}</span><span className="stat-lab">Escalated</span></div><div className="stat"><span className="stat-fig">{tickets.filter((t) => t.status === 'Resolved').length}</span><span className="stat-lab">Resolved</span></div></div>
          <h4 className="wallet-h">Open tickets</h4>
          {open.length ? rows(open) : <p className="muted-line">No open tickets.</p>}
        </>
      ) : (
        <>
          <div className="support-cta"><span>Can\u2019t find an answer? Raise a ticket and the Directorate will respond.</span><button className="btn btn-gold btn-sm" onClick={() => setMode('raise')}>Raise a ticket</button></div>
          <h4 className="wallet-h">Frequently asked</h4>
          <Accordion items={FAQ} />
          <h4 className="wallet-h">My tickets</h4>
          {mine.length ? rows(mine) : <p className="muted-line">You have no tickets yet.</p>}
        </>
      )}
    </div>
  )
}
const ROLE_NAV = {
  society: [['overview', 'Overview'], ['cooperative', 'My cooperative'], ['savings', 'Savings & esusu']],
  member: [['overview', 'Overview'], ['wallet', 'Wallet & savings'], ['finance', 'LASMECO finance']],
  officer: [['overview', 'Overview'], ['queue', 'Review queue'], ['all', 'All societies'], ['members', 'Members'], ['lasmeco', 'LASMECO'], ['offices', 'Area offices'], ['risk', 'Risk & fraud'], ['audit', 'Audit log'], ['reports', 'Reports'], ['integrations', 'Integrations']],
  auditor: [['overview', 'Overview'], ['returns', 'Returns to examine'], ['all', 'All societies']],
  accelerator: [['overview', 'Overview'], ['queue', 'My pipeline'], ['all', 'All loans']],
  sterling: [['overview', 'Overview'], ['queue', 'My queue'], ['all', 'All loans']],
  boi: [['overview', 'Overview'], ['queue', 'My queue'], ['all', 'All loans']],
  assetmatrix: [['overview', 'Overview'], ['distribution', 'Distribution']],
  leadership: [['overview', 'Overview'], ['applications', 'Applications'], ['members', 'Members'], ['lasmeco', 'LASMECO'], ['sla', 'Service levels'], ['risk', 'Risk & fraud'], ['reports', 'Reports & exports'], ['integrations', 'Integrations']],
}
const WORKSPACES = { society: SocietyWorkspace, member: MemberWorkspace, officer: OfficerWorkspace, auditor: AuditorWorkspace, sterling: SterlingWorkspace, boi: BoiWorkspace, assetmatrix: AssetMatrixWorkspace, accelerator: AcceleratorWorkspace, leadership: LeadershipOverview }
function SideIcon({ name }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }
  const paths = {
    workspace: <><rect {...p} x="3" y="3" width="7" height="7" rx="1.5" /><rect {...p} x="14" y="3" width="7" height="7" rx="1.5" /><rect {...p} x="3" y="14" width="7" height="7" rx="1.5" /><rect {...p} x="14" y="14" width="7" height="7" rx="1.5" /></>,
    help: <><circle {...p} cx="12" cy="12" r="9" /><path {...p} d="M9.5 9.2a2.5 2.5 0 1 1 3 2.4c-.8.3-1.5 1-1.5 2M12 17h.01" /></>,
    privacy: <path {...p} d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z" />,
    bell: <path {...p} d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />,
  }
  return <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">{paths[name]}</svg>
}
function Sidebar({ role, profile, sections, section, setSection, onSignOut, onHome, canPrivacy, unread }) {
  return (
    <aside className="side">
      <button className="side-brand" onClick={onHome}><span className="brand-mark" aria-hidden="true">&#9670;</span><span className="side-brand-name">MCCTI <em>CoopEco</em></span></button>
      <nav className="side-nav" aria-label="Sections">{sections.map(([id, label]) => (<button key={id} className={cx('side-item', section === id && 'on')} onClick={() => setSection(id)}><span className="side-dot" aria-hidden="true" /><span>{label}</span></button>))}</nav>
      <div className="side-sep" />
      <nav className="side-nav" aria-label="Support">
        <button className={cx('side-item', section === 'notifications' && 'on')} onClick={() => setSection('notifications')}><SideIcon name="bell" /><span>Notifications</span>{unread ? <span className="side-badge">{unread}</span> : null}</button>
        <button className={cx('side-item', section === 'help' && 'on')} onClick={() => setSection('help')}><SideIcon name="help" /><span>Help & support</span></button>
        {canPrivacy && <button className={cx('side-item', section === 'privacy' && 'on')} onClick={() => setSection('privacy')}><SideIcon name="privacy" /><span>Privacy & data</span></button>}
      </nav>
      <div className="side-foot">
        <div className="side-user"><Avatar name={profile.name} photo={profile.photo} size={34} /><div className="side-user-text"><span className="side-name">{profile.name}</span><span className="side-role">{roleTitle(role)}</span></div></div>
        <button className="side-signout" onClick={onSignOut}>Sign out</button>
      </div>
    </aside>
  )
}
function Dashboard({ session, onSignOut, onHome }) {
  const p = session.profile
  const [viewAs, setViewAs] = useState(null)
  const eff = viewAs || { role: p.role, name: p.name, email: session.email, office: p.office, title: p.title }
  const ctx = { email: eff.email, uid: session.id, role: eff.role, name: eff.name, focusId: eff.focusId }
  const sections = ROLE_NAV[eff.role] || [['overview', 'Overview']]
  const [section, setSection] = useState(sections[0][0])
  useEffect(() => { setSection((ROLE_NAV[eff.role] || [['overview', 'Overview']])[0][0]) }, [eff.role])
  const canPrivacy = p.role === 'society' || p.role === 'member'
  const Workspace = WORKSPACES[eff.role] || CapabilityPreview
  const [unread, setUnread] = useState(0)
  const refreshUnread = useCallback(() => { listNotifs(ctx).then((l) => setUnread(l.filter((n) => !n.read).length)) }, [ctx.email, ctx.role])
  useEffect(() => { refreshUnread() }, [refreshUnread, section])
  const content = section === 'help'
    ? <SupportConcierge ctx={ctx} />
    : section === 'notifications'
      ? <NotificationCenter ctx={ctx} onChange={refreshUnread} />
      : (section === 'privacy' && canPrivacy)
        ? <DataControls ctx={ctx} onDeleted={onSignOut} />
        : (eff.role === 'leadership' && !viewAs)
          ? <LeadershipOverview ctx={ctx} section={section} onViewAs={setViewAs} />
          : <Workspace ctx={ctx} section={section} />
  return (
    <div className="shell">
      <Sidebar role={eff.role} profile={p} sections={sections} section={section} setSection={setSection} onSignOut={onSignOut} onHome={onHome} canPrivacy={canPrivacy} unread={unread} />
      <main className="shell-main"><div className="dash-inner">
        {viewAs && <div className="viewas-banner"><span>Viewing as <strong>{eff.name}</strong> &middot; {roleTitle(eff.role)}</span><button className="link-inline" onClick={() => setViewAs(null)}>Exit view</button></div>}
        <div className="dash-hero">
          <Avatar name={eff.name} photo={p.photo} size={64} />
          <div className="dash-hero-text"><p className="eyebrow"><span className="eb-dot" />{viewAs ? 'Impersonation view' : greeting()}</p><h1 className="dash-name">{eff.name}</h1><p className="dash-meta">{eff.title} &middot; {eff.office}</p></div>
          <span className="dash-rolebadge">{roleTitle(eff.role)}</span>
        </div>
        {content && eff.role === 'leadership' && !viewAs && <ViewAsBar onViewAs={setViewAs} />}
        {content}
      </div></main>
    </div>
  )
}

/* ------------------------------- app ---------------------------------- */
export default function App() {
  const [area, setArea] = useState('state')
  const [view, setView] = useState('landing')
  const [chosenRole, setChosenRole] = useState(null)
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)
  const [lang, setLang] = useState(() => LS.get('coopeco.lang', 'en'))
  useEffect(() => { LS.set('coopeco.lang', lang) }, [lang])
  const [landingTab, setLandingTab] = useState('home')
  const goLanding = (tab) => { setView('landing'); setLandingTab(tab); if (typeof window !== 'undefined') window.scrollTo({ top: 0 }) }
  useEffect(() => {
    (async () => {
      try { await syncFromSekat({ name: 'SEKAT gateway', role: 'officer', email: 'sekat@system' }, true); await syncFromQoop({ name: 'QooP gateway', role: 'officer', email: 'qoop@system' }, true) } catch (e) { /* offline / not configured */ }
      try { await seedDemoData() } catch (e) { /* seed once, best-effort */ }
      const s = await loadSession(); setSession(s); setReady(true)
    })()
  }, [])
  const enter = useCallback(() => setView(session ? 'dashboard' : 'role'), [session])
  const pickRole = (id) => { setChosenRole(id); setView('auth') }
  const onAuthed = (res) => { setSession(res); setView('dashboard') }
  const doSignOut = async () => { await signOutNow(); setSession(null); setView('landing') }
  const goHome = () => { setView('landing'); setLandingTab('home'); if (typeof window !== 'undefined') window.scrollTo({ top: 0 }) }
  const inApp = view === 'dashboard' && session
  return (
    <div className={cx('page', inApp && 'is-app')}>
      <style>{CSS}</style>
      <div className="letterhead">
        <div className="lh-left"><img className="lh-seal" src="/lagos-seal.png" alt="Lagos State coat of arms" /><div className="lh-text"><span className="lh-gov">Lagos State Government</span><span className="lh-min">Ministry of Commerce, Cooperatives, Trade &amp; Investment</span></div></div>
        <img className="lh-mccti" src="/mccti-logo.png" alt="MCCTI" />
      </div>
      {!inApp && (
        <header className="nav">
          <button className="brand" onClick={goHome}><span className="brand-mark" aria-hidden="true">&#9670;</span><span className="brand-name">MCCTI <em>CoopEco</em></span></button>
          <nav className="nav-links" aria-label="Primary">{view === 'landing' ? (<>{[['home', 'nav.home'], ['modules', 'nav.modules'], ['pricing', 'nav.pricing'], ['leadership', 'nav.leadership'], ['about', 'nav.about'], ['platform', 'nav.platform']].map(([id, k]) => <button key={id} className={cx('nav-page', landingTab === id && 'on')} onClick={() => goLanding(id)}>{t(k, lang)}</button>)}</>) : null}<button className="nav-verify" onClick={() => setView('verify')}>{t('nav.verify', lang)}</button><select className="lang-select" value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Language">{LANGS.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></nav>
          {ready && session ? (
            <div className="account"><button className="acct-btn" onClick={() => setView('dashboard')}><Avatar name={session.profile.name} photo={session.profile.photo} size={30} /><span className="acct-name">{session.profile.name.split(' ')[0]}</span></button><button className="signout" onClick={doSignOut}>Sign out</button></div>
          ) : (<button className="btn btn-gold nav-cta" onClick={enter}>{t('cta.enter', lang)}</button>)}
        </header>
      )}
      {view === 'landing' && <Landing area={area} setArea={setArea} onEnter={enter} lang={lang} tab={landingTab} onTab={goLanding} />}
      {view === 'role' && <RolePage onPick={pickRole} onBack={goHome} />}
      {view === 'auth' && <AuthPage role={chosenRole} onDone={onAuthed} onBack={() => setView('role')} onPrivacy={() => setView('privacy')} />}
      {view === 'privacy' && <PrivacyNotice onBack={() => setView(session ? 'dashboard' : 'landing')} />}
      {view === 'verify' && <PublicVerify onBack={goHome} />}
      {inApp && <Dashboard session={session} onSignOut={doSignOut} onHome={goHome} />}
      {!inApp && (
        <footer className="foot">
          <div className="foot-top"><div className="foot-lockup"><img src="/lagos-seal.png" alt="Lagos State" /><img className="foot-mccti" src="/mccti-logo.png" alt="MCCTI" /><div className="foot-lockup-text"><span className="lh-gov">Lagos State Government</span><span className="lh-min">Ministry of Commerce, Cooperatives, Trade &amp; Investment</span></div></div>{!session && <button className="btn btn-gold" onClick={enter}>Enter platform</button>}</div>
          <div className="foot-grid"><p>A Ministry-owned digital platform for the cooperative economy of Lagos State.</p><p className="foot-conf">&copy; Ministry of Commerce, Cooperatives, Trade &amp; Investment, Lagos State Government. <button className="link-inline" onClick={() => setView('verify')}>Verify a cooperative</button> &middot; <button className="link-inline" onClick={() => setView('privacy')}>Privacy notice</button></p></div>
        </footer>
      )}
      <ConsentBanner onOpenPrivacy={() => setView('privacy')} />
    </div>
  )
}

const CSS = `
:root{--ink:#F5F7F3;--ink-2:#FFFFFF;--green:#1C8A4F;--green-panel:#EAF3EC;--line:rgba(20,50,35,.13);--line-soft:rgba(20,50,35,.07);--gold:#8A681E;--gold-soft:#93701F;--cream:#17241C;--cream-ink:#17241C;--sage:#48524B;--sage-dim:#78837C;--err:#C0533A;--serif:'Lora',Georgia,'Times New Roman',serif;--sans:'Inter',system-ui,-apple-system,sans-serif;--mono:'IBM Plex Mono',ui-monospace,monospace}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0}
.page{background:radial-gradient(1100px 560px at 85% -12%,rgba(28,138,79,.07),transparent 60%),radial-gradient(900px 500px at -5% 15%,rgba(176,132,47,.05),transparent 55%),var(--ink);color:var(--sage);font-family:var(--sans);-webkit-font-smoothing:antialiased;min-height:100vh;overflow-x:hidden;display:flex;flex-direction:column}
.eyebrow{font-family:var(--mono);font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);margin:0 0 16px;display:flex;align-items:center;gap:9px}
.eb-dot{width:6px;height:6px;border-radius:50%;background:var(--green);display:inline-block}
h1,h2,h3,h4{font-family:var(--serif);color:var(--cream);font-weight:500;margin:0}p{margin:0}input,select,textarea{font-family:var(--sans)}
.btn{font-family:var(--sans);font-size:14px;font-weight:600;border:none;cursor:pointer;padding:13px 24px;border-radius:2px;text-decoration:none;display:inline-block;transition:transform .18s ease,background .18s ease,color .18s ease,border-color .18s ease}
.btn-gold{background:var(--green);color:#fff;box-shadow:0 10px 26px -14px rgba(28,138,79,.55)}
.btn-gold:hover{background:var(--gold-soft);transform:translateY(-1px)}.btn-gold:disabled{opacity:.6;cursor:default;transform:none}
.btn-ghost{background:transparent;color:var(--cream);border:1px solid var(--line)}.btn-ghost:hover{border-color:var(--gold);color:var(--gold-soft)}
.btn-outline{background:transparent;color:var(--cream);border:1px solid var(--line);box-shadow:none}.btn-outline:hover{border-color:var(--gold);color:var(--gold-soft)}
.btn-sm{padding:9px 16px;font-size:13px}
.letterhead{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:11px 40px;background:var(--ink-2);color:var(--cream-ink);border-bottom:2px solid var(--green)}
.lh-left{display:flex;align-items:center;gap:14px;min-width:0}.lh-seal{height:40px;width:auto}
.lh-text{display:flex;flex-direction:column;line-height:1.25;min-width:0}
.lh-gov{font-family:var(--serif);font-weight:600;font-size:14px;color:var(--cream-ink)}
.lh-min{font-family:var(--mono);font-size:10.5px;letter-spacing:.03em;color:#4a5a4f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lh-mccti{height:38px;width:auto;flex-shrink:0}
.nav{position:sticky;top:0;z-index:40;display:flex;align-items:center;justify-content:space-between;padding:15px 40px;background:rgba(255,255,255,.86);backdrop-filter:blur(12px);border-bottom:1px solid var(--line-soft)}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;background:none;border:none;cursor:pointer;padding:0}
.brand-mark{color:var(--green);font-size:13px}.brand-name{font-family:var(--serif);color:var(--cream);font-size:19px;letter-spacing:.01em;font-weight:600}.brand-name em{color:var(--gold-soft);font-style:italic;font-weight:500}
.nav-links{display:flex;gap:32px}.nav-links a{color:var(--sage);text-decoration:none;font-size:14px;font-weight:500;position:relative}.nav-links a::after{content:'';position:absolute;left:0;right:0;bottom:-6px;height:2px;background:var(--green);transform:scaleX(0);transform-origin:left;transition:transform .25s ease}.nav-links a:hover{color:var(--cream)}.nav-links a:hover::after{transform:scaleX(1)}
html{scroll-behavior:smooth}section[id]{scroll-margin-top:84px}
.reveal{opacity:0;transform:translateY(20px);transition:opacity .6s cubic-bezier(.2,.7,.2,1),transform .6s cubic-bezier(.2,.7,.2,1)}.reveal.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none;transition:none}html{scroll-behavior:auto}}
/* leadership */
section.leaders{max-width:1200px;margin:0 auto;padding:64px 40px}
section.pricing{max-width:1200px;margin:0 auto;padding:64px 40px}
.price-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:36px}
.price-card{background:var(--ink-2);border:1px solid var(--line-soft);border-radius:10px;padding:22px;display:flex;flex-direction:column;gap:8px;transition:transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .25s ease,border-color .25s ease}
.price-card:hover{transform:translateY(-4px);box-shadow:0 20px 40px -28px rgba(20,50,35,.4);border-color:var(--line)}
.price-top{display:flex;align-items:baseline;gap:8px}
.price-amt{font-family:var(--serif);font-size:26px;font-weight:600;color:var(--green)}
.price-unit{font-family:var(--mono);font-size:11px;color:var(--sage-dim)}
.price-card h3{font-size:16px;line-height:1.25;margin-top:4px}
.price-who{font-family:var(--mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--gold)}
.price-card>p:last-child{font-size:13px;line-height:1.55;color:var(--sage)}
.leader-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:18px}
.leader-grid.two{grid-template-columns:repeat(2,1fr);max-width:780px;margin-left:auto;margin-right:auto}
.leader-group-lab{font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);margin-top:34px}
.leader-card{background:var(--ink-2);border:1px solid var(--line-soft);border-radius:12px;overflow:hidden;transition:transform .3s cubic-bezier(.2,.7,.2,1),box-shadow .3s ease,border-color .3s ease}
.leader-card:hover{transform:translateY(-6px);box-shadow:0 26px 50px -30px rgba(20,50,35,.5);border-color:var(--line)}
.leader-photo{position:relative;aspect-ratio:1/1;background:linear-gradient(160deg,var(--green-panel),#dfeee2);overflow:hidden}
.leader-photo img{width:100%;height:100%;object-fit:cover;object-position:center top;transition:transform .5s cubic-bezier(.2,.7,.2,1)}
.leader-card:hover .leader-photo img{transform:scale(1.04)}
.leader-mono{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:64px;font-weight:600;color:var(--green)}
.leader-ring{position:absolute;inset:0;box-shadow:inset 0 -70px 60px -40px rgba(20,50,35,.18);pointer-events:none}
.leader-body{padding:22px 24px 26px}
.leader-role{font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--green)}
.leader-body h3{font-size:20px;margin:8px 0 10px;line-height:1.2}
.leader-body p{font-size:13.5px;line-height:1.6;color:var(--sage)}
/* about accordion */
section.about{max-width:900px;margin:0 auto;padding:24px 40px 72px}
.acc{margin-top:32px;display:flex;flex-direction:column;gap:12px}
.acc-item{background:var(--ink-2);border:1px solid var(--line-soft);border-radius:10px;overflow:hidden;transition:border-color .2s ease}
.acc-item.open{border-color:var(--green)}
.acc-head{width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;background:none;border:none;cursor:pointer;padding:20px 24px;font-family:var(--serif);font-size:18px;font-weight:600;color:var(--cream);text-align:left}
.acc-ic{position:relative;width:16px;height:16px;flex-shrink:0}
.acc-ic::before,.acc-ic::after{content:'';position:absolute;background:var(--green);border-radius:2px;transition:transform .3s ease,opacity .3s ease}
.acc-ic::before{top:7px;left:0;width:16px;height:2px}
.acc-ic::after{top:0;left:7px;width:2px;height:16px}
.acc-item.open .acc-ic::after{transform:rotate(90deg);opacity:0}
.acc-panel{display:grid;grid-template-rows:0fr;transition:grid-template-rows .32s cubic-bezier(.2,.7,.2,1)}
.acc-item.open .acc-panel{grid-template-rows:1fr}
.acc-inner{overflow:hidden;color:var(--sage);font-size:14.5px;line-height:1.7;padding:0 24px}
.acc-item.open .acc-inner{padding:0 24px 22px}
/* micro-interactions on existing cards */
.mod-card{transition:background .2s ease,transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .25s ease}
.mod-card:hover{transform:translateY(-4px);box-shadow:0 20px 40px -28px rgba(20,50,35,.4)}
.persona{transition:transform .2s ease,border-color .2s ease}.persona:hover{transform:translateY(-3px)}
.band-fig{transition:color .2s ease}
.hero-watermark{animation:floaty 9s ease-in-out infinite}
@keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
@media(prefers-reduced-motion:reduce){.hero-watermark{animation:none}}
.nav-cta{padding:10px 18px}
.account{display:flex;align-items:center;gap:14px}
.acct-btn{display:flex;align-items:center;gap:9px;background:transparent;border:1px solid var(--line-soft);border-radius:40px;padding:5px 14px 5px 5px;cursor:pointer;transition:border-color .16s ease}.acct-btn:hover{border-color:var(--gold)}
.acct-name{color:var(--cream);font-size:14px;font-weight:600}
.signout{background:none;border:none;color:var(--sage-dim);font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}.signout:hover{color:var(--gold-soft)}
.avatar{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;background:var(--green);color:#fff;font-family:var(--serif);font-weight:600;border:none;flex-shrink:0}.avatar-img{object-fit:cover;padding:0}
.hero{position:relative;max-width:1200px;margin:0 auto;padding:74px 40px 44px;display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:center}
.hero-watermark{position:absolute;right:-70px;top:-20px;width:500px;opacity:.08;pointer-events:none;user-select:none}
.hero-copy{position:relative;z-index:1;animation:rise .7s ease both}
h1{font-size:clamp(38px,5vw,64px);line-height:1.06;letter-spacing:-.01em;margin-bottom:24px}
.underline{position:relative;white-space:nowrap}.underline::after{content:'';position:absolute;left:0;bottom:.02em;height:.08em;width:100%;background:var(--gold);transform:scaleX(0);transform-origin:left;animation:draw 1s .5s ease forwards}
.lead{font-size:17px;line-height:1.68;color:var(--sage);max-width:36em;margin-bottom:30px}
.hero-cta{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:24px}.hero-foot{font-family:var(--mono);font-size:12px;letter-spacing:.06em;color:var(--sage-dim)}
.register{position:relative;z-index:1;animation:rise .7s .1s ease both}
.register-frame{background:linear-gradient(180deg,var(--green-panel),#E6EFE7);border:1px solid var(--gold);border-radius:5px;padding:5px;box-shadow:0 34px 70px -34px rgba(0,0,0,.7)}
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
.lens-readout{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:24px;padding:32px 36px;background:linear-gradient(180deg,var(--green-panel),#E6EFE7);border:1px solid var(--line);border-radius:5px}
.lens-tag{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.corridor-flag{font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);border:1px solid var(--line);padding:4px 9px;border-radius:2px}
.lens-tag-text{font-family:var(--serif);color:var(--cream);font-size:20px;font-weight:600}
.lens-figs{display:flex;gap:44px}.lens-figs>div{display:flex;flex-direction:column;gap:4px}.lf-fig{font-family:var(--serif);color:var(--cream);font-size:28px;font-weight:600}.lf-lab{font-family:var(--mono);font-size:11px;letter-spacing:.07em;color:var(--sage-dim);text-transform:uppercase}
.mod-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line-soft);border:1px solid var(--line-soft);border-radius:5px;overflow:hidden}
.mod-card{background:var(--ink-2);padding:36px 30px 30px;display:flex;flex-direction:column;gap:12px;transition:background .2s ease,transform .2s ease}.mod-card:hover{background:#E6EFE7;transform:translateY(-2px)}
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
.role-page-card{text-align:left;background:var(--ink-2);border:1px solid var(--line-soft);border-radius:6px;padding:26px 24px;cursor:pointer;display:flex;flex-direction:column;gap:10px;transition:all .18s ease}.role-page-card:hover{border-color:var(--gold);transform:translateY(-3px);background:#E6EFE7}
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
.shell{flex:1;display:flex;width:100%;align-items:stretch}
.side{width:250px;flex-shrink:0;background:var(--ink-2);border-right:1px solid var(--line-soft);padding:22px 14px;display:flex;flex-direction:column;gap:22px;position:sticky;top:0;height:100vh;overflow-y:auto}
.side-brand{display:flex;align-items:center;gap:10px;background:none;border:none;cursor:pointer;padding:6px 8px}
.side-brand-name{font-family:var(--serif);color:var(--cream);font-size:18px;font-weight:600}.side-brand-name em{color:var(--gold-soft);font-style:italic;font-weight:500}
.side-nav{display:flex;flex-direction:column;gap:4px}
.side-item{display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:8px;border:none;background:none;cursor:pointer;color:var(--sage);font-family:var(--sans);font-size:14px;font-weight:600;text-align:left;transition:background .18s ease,color .18s ease}
.side-item:hover{background:rgba(20,50,35,.05);color:var(--cream)}
.side-item.on{background:rgba(28,138,79,.1);color:var(--green)}
.side-item svg{flex-shrink:0}
.side-dot{width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.45;flex-shrink:0;margin:0 6px}
.side-item.on .side-dot{opacity:1}
.side-sep{height:1px;background:var(--line-soft);margin:4px 6px}
.side-badge{margin-left:auto;min-width:20px;height:20px;padding:0 6px;border-radius:10px;background:var(--green);color:#fff;font-family:var(--mono);font-size:11px;font-weight:600;display:inline-flex;align-items:center;justify-content:center}
.notif-list{display:flex;flex-direction:column;margin-top:16px}
.notif{display:flex;gap:12px;align-items:flex-start;padding:14px 4px;border-bottom:1px solid var(--line-soft);cursor:pointer;transition:background .15s ease}
.notif:hover{background:rgba(20,50,35,.03)}
.notif-dot{width:8px;height:8px;border-radius:50%;background:var(--line);flex-shrink:0;margin-top:6px}
.notif.unread .notif-dot{background:var(--green)}
.notif-body{display:flex;flex-direction:column;gap:2px}
.notif-body strong{font-size:14px;color:var(--cream);font-weight:600}
.notif.unread .notif-body strong{color:var(--cream)}
.notif-body p{font-size:13px;color:var(--sage);line-height:1.5}
.notif-at{font-family:var(--mono);font-size:11px;color:var(--sage-dim);margin-top:2px}
.reports-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.report-card{background:var(--ink-2);border:1px solid var(--line-soft);border-radius:10px;padding:20px;display:flex;flex-direction:column;gap:8px}
.report-card h4{font-size:15px}
.report-card p{font-size:13px;color:var(--sage);line-height:1.5;flex:1}
.report-card button{align-self:flex-start;margin-top:4px}
.report-boardpack{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;background:var(--green-panel);border:1px solid var(--line);border-radius:10px;padding:18px 20px;margin-top:16px}
.report-boardpack h4{font-size:15px;margin-bottom:4px}
@media(max-width:700px){.reports-grid{grid-template-columns:1fr}}
.nav-verify{background:none;border:1px solid var(--line);border-radius:6px;padding:7px 14px;color:var(--sage);font-family:var(--sans);font-size:13px;font-weight:600;cursor:pointer;transition:border-color .18s ease,color .18s ease}
.nav-verify:hover{border-color:var(--green);color:var(--green)}
.lang-select{border:1px solid var(--line);border-radius:6px;padding:7px 10px;background:var(--ink-2);color:var(--sage);font-family:var(--sans);font-size:13px;font-weight:600;cursor:pointer}
.lang-select:focus{outline:none;border-color:var(--green)}
.nav-page{background:none;border:none;padding:6px 2px;font-family:var(--sans);font-size:14px;font-weight:500;color:var(--sage);cursor:pointer;border-bottom:2px solid transparent;transition:color .18s ease,border-color .18s ease}
.nav-page:hover{color:var(--green)}
.nav-page.on{color:var(--green);border-bottom-color:var(--green)}
.landing-sub{min-height:70vh}
.landing-sub .page{padding-top:56px;padding-bottom:72px;animation:rise .5s ease both}
@media(max-width:860px){.landing-sub .page{padding-top:32px}}
.explore{padding:64px 40px}
.explore-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
.explore-card{position:relative;text-align:left;background:var(--ink-2);border:1px solid var(--line-soft);border-radius:12px;padding:22px 22px 44px;cursor:pointer;transition:border-color .18s ease,transform .18s ease,box-shadow .18s ease;display:flex;flex-direction:column;gap:7px}
.explore-card:hover{border-color:var(--green);transform:translateY(-2px);box-shadow:0 10px 26px rgba(20,50,32,.08)}
.explore-title{font-family:var(--serif);font-size:18px;color:var(--cream)}
.explore-desc{font-size:13px;color:var(--sage);line-height:1.5}
.explore-arrow{position:absolute;left:22px;bottom:18px;color:var(--green);font-size:18px;transition:transform .18s ease}
.explore-card:hover .explore-arrow{transform:translateX(4px)}
@media(max-width:680px){.explore{padding:48px 18px}}
.lang-note{font-size:12px;color:var(--gold-soft);margin-top:14px;max-width:520px;font-style:italic}
.verify-page{flex:1;padding:60px 40px 100px;animation:rise .5s ease both}
.verify-inner{max-width:760px;margin:0 auto}
.verify-h{font-family:var(--serif);font-size:36px;color:var(--cream);margin:10px 0 12px}
.verify-sub{color:var(--sage);font-size:16px;line-height:1.6;max-width:620px}
.verify-search{display:flex;gap:10px;margin:26px 0;flex-wrap:wrap}
.verify-search input{flex:1;min-width:240px;padding:14px 16px;border:1px solid var(--line);border-radius:8px;background:var(--ink-2);color:var(--cream);font-size:15px}
.verify-search input:focus{outline:none;border-color:var(--green)}
.verify-results{display:flex;flex-direction:column;gap:14px;margin-top:8px}
.verify-card{background:var(--ink-2);border:1px solid var(--line-soft);border-radius:12px;padding:22px}
.verify-card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:16px}
.verify-card-top h3{font-family:var(--serif);font-size:19px;color:var(--cream)}
.verify-facts{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;border-top:1px solid var(--line-soft);padding-top:16px}
.verify-facts>div{display:flex;flex-direction:column;gap:3px}
.verify-facts span{font-size:11px;color:var(--sage-dim);text-transform:uppercase;letter-spacing:.05em}
.verify-facts strong{font-size:14px;color:var(--cream)}
.verify-empty{background:var(--ink-2);border:1px dashed var(--line);border-radius:12px;padding:26px;color:var(--sage);text-align:center}
.verify-page .link-back{display:inline-block;margin:24px 0 8px}
.calc-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
.risk-list{display:flex;flex-direction:column;gap:10px;margin-top:16px}
.risk-item{display:flex;gap:12px;align-items:flex-start;background:var(--ink-2);border:1px solid var(--line-soft);border-radius:10px;padding:14px 16px}
.risk-item .chip{flex-shrink:0;text-transform:capitalize}
.risk-body strong{font-size:14px;color:var(--cream)}
.risk-body p{font-size:12.5px;color:var(--sage);margin-top:2px;line-height:1.5}
.sla-figs{display:flex;gap:24px;margin-top:6px}
.sla-figs>div{display:flex;flex-direction:column;gap:3px}
.sla-fig{font-family:var(--serif);font-size:26px;color:var(--cream);font-weight:600}
.sla-lab{font-family:var(--mono);font-size:10px;letter-spacing:.05em;text-transform:uppercase;color:var(--sage-dim)}
.bulk-type{display:inline-flex;border:1px solid var(--line);border-radius:8px;overflow:hidden;margin-bottom:12px}
.bulk-type .seg{background:none;border:none;padding:8px 16px;font-family:var(--sans);font-size:13px;font-weight:600;color:var(--sage);cursor:pointer}
.bulk-type .seg.on{background:var(--green);color:#fff}
.bulk-actions{display:flex;align-items:center;gap:14px;margin-bottom:10px;flex-wrap:wrap}
.bulk-text{width:100%;padding:12px 14px;border:1px solid var(--line);border-radius:8px;background:var(--ink-2);color:var(--cream);font-family:var(--mono);font-size:12.5px;line-height:1.5;resize:vertical}
.bulk-text:focus{outline:none;border-color:var(--green)}
.docs-upload{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px}
.docs-upload select{padding:9px 12px;border:1px solid var(--line);border-radius:8px;background:var(--ink-2);color:var(--cream);font-size:13px}
.docs-list{display:flex;flex-direction:column;gap:8px}
.doc-row{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:11px 14px;background:var(--ink-2);border:1px solid var(--line-soft);border-radius:8px}
.doc-meta{display:flex;flex-direction:column;gap:2px;min-width:0}
.doc-meta strong{font-size:13.5px;color:var(--cream);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.doc-meta span{font-size:11.5px;color:var(--sage-dim);display:flex;align-items:center;gap:6px}
.doc-actions{display:flex;align-items:center;gap:12px;flex-shrink:0}
.link-inline.danger{color:var(--err)}
.muted-line.sm{font-size:11px}
@media(max-width:640px){.verify-facts{grid-template-columns:1fr}.verify-h{font-size:28px}.verify-page{padding:40px 18px 70px}}
.side-foot{margin-top:auto;display:flex;flex-direction:column;gap:12px;border-top:1px solid var(--line-soft);padding-top:16px}
.side-user{display:flex;align-items:center;gap:10px;min-width:0}
.side-user-text{display:flex;flex-direction:column;min-width:0}
.side-name{font-size:13.5px;font-weight:600;color:var(--cream);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.side-role{font-family:var(--mono);font-size:10px;letter-spacing:.05em;text-transform:uppercase;color:var(--sage-dim)}
.side-signout{background:none;border:1px solid var(--line);border-radius:6px;padding:9px 12px;color:var(--sage);font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:border-color .18s ease,color .18s ease}
.side-signout:hover{border-color:var(--err);color:var(--err)}
.shell-main{flex:1;min-width:0;padding:44px 40px 80px}
.shell-main .dash-inner{margin:0;max-width:1120px}
@media(max-width:860px){.shell{flex-direction:column}.side{width:100%;height:auto;position:sticky;top:0;z-index:30;flex-direction:row;align-items:center;gap:8px;padding:10px 14px;border-right:none;border-bottom:1px solid var(--line-soft)}.side-brand{display:none}.side-nav{flex-direction:row;flex:0 1 auto;gap:4px;overflow-x:auto}.side-item{white-space:nowrap;padding:9px 12px}.side-foot{margin:0;flex-direction:row;border-top:none;padding-top:0;gap:8px}.side-user{display:none}.shell-main{padding:26px 18px 70px}}
.dash-hero{display:flex;align-items:center;gap:20px;padding-bottom:30px;margin-bottom:30px;border-bottom:1px solid var(--line-soft)}
.dash-hero-text{flex:1;min-width:0}.dash-hero-text .eyebrow{margin-bottom:8px}.dash-name{font-size:clamp(26px,3.4vw,38px);line-height:1.1}.dash-meta{font-size:14px;color:var(--sage-dim);margin-top:6px}
.dash-rolebadge{font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--gold);border:1px solid var(--gold);border-radius:3px;padding:8px 14px;white-space:nowrap}
.dash-grid{display:grid;grid-template-columns:1.6fr 1fr;gap:20px;align-items:start}
.dash-card{background:var(--ink-2);border:1px solid var(--line-soft);border-radius:6px;padding:28px}.dash-card h3{font-size:18px;margin-bottom:6px}.dash-card-sub{font-size:13px;color:var(--sage-dim);line-height:1.55;margin-bottom:20px}
.caps{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}.caps li{display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid var(--line-soft);color:var(--cream);font-size:15px}.caps li:last-child{border-bottom:none}.cap-tick{color:var(--gold);font-size:11px}.cap-soon{margin-left:auto;font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--sage-dim);border:1px solid var(--line-soft);padding:3px 8px;border-radius:2px}
.status-row{display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--line-soft);font-size:14px;color:var(--sage)}.status-row:last-child{border-bottom:none}
.pill{font-family:var(--mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;padding:4px 9px;border-radius:2px}.pill.ok{background:rgba(28,138,79,.14);color:var(--green)}.pill.muted{background:rgba(72,82,75,.10);color:var(--sage-dim)}
.dash-foot{margin-top:26px;font-size:13px;color:var(--sage-dim);line-height:1.6}
/* Stage 3 */
.ws{display:flex;flex-direction:column;gap:24px}.ws-h{font-size:18px}
.muted-line{color:var(--sage-dim);font-size:14px;padding:8px 0}
.statgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.stat{background:var(--ink-2);border:1px solid var(--line-soft);border-radius:6px;padding:22px 24px;display:flex;flex-direction:column;gap:8px}
.stat-fig{font-family:var(--serif);color:var(--cream);font-size:32px;font-weight:600;line-height:1}.stat-lab{font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--sage-dim)}
.tabs{display:flex;gap:8px;flex-wrap:wrap;border-bottom:1px solid var(--line-soft);padding-bottom:0}
.tab{background:none;border:none;border-bottom:2px solid transparent;color:var(--sage);font-family:var(--sans);font-size:14px;font-weight:600;padding:10px 4px;margin-right:14px;cursor:pointer}
.tab:hover{color:var(--gold-soft)}.tab.on{color:var(--cream);border-bottom-color:var(--green)}
.rtable-wrap{overflow-x:auto;border:1px solid var(--line-soft);border-radius:6px}
.rtable{width:100%;border-collapse:collapse;min-width:640px}
.rtable th{text-align:left;font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--sage-dim);padding:14px 16px;border-bottom:1px solid var(--line-soft);font-weight:500;background:rgba(0,0,0,.14)}
.rtable td{padding:15px 16px;border-bottom:1px solid var(--line-soft);font-size:14px;color:var(--sage);vertical-align:middle}
.rtable tr:last-child td{border-bottom:none}.rtable tr:hover td{background:rgba(198,161,91,.04)}
.td-name{color:var(--cream);font-weight:500;max-width:22em}.mono{font-family:var(--mono);font-size:12px;color:var(--gold-soft)}
.btn-open{background:transparent;border:1px solid var(--line);color:var(--gold-soft);font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;padding:6px 12px;border-radius:2px;cursor:pointer}.btn-open:hover{border-color:var(--gold);background:rgba(198,161,91,.08)}
.chip{font-family:var(--mono);font-size:10px;letter-spacing:.05em;padding:4px 9px;border-radius:2px;white-space:nowrap;display:inline-block}
.st-filed{background:rgba(72,82,75,.10);color:var(--sage)}.st-review{background:rgba(176,132,47,.14);color:var(--gold)}.st-approved{background:rgba(28,138,79,.14);color:var(--green)}.st-returned{background:rgba(192,83,58,.14);color:var(--err)}
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
.fee-banner{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;background:rgba(198,161,91,.08);border:1px solid var(--line);border-radius:6px;padding:14px 18px;font-size:14px;color:var(--sage)}
.fee-banner strong{color:var(--cream)}
.qoop-profile{margin-top:16px;border-top:1px solid var(--line-soft);padding-top:14px}
.qoop-profile-lab{font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--green)}
.qoop-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px 16px;margin-top:12px}
.qoop-grid>div{display:flex;flex-direction:column;gap:2px}
.qoop-grid span{font-size:11px;color:var(--sage-dim)}
.qoop-grid strong{font-family:var(--mono);font-size:13px;color:var(--cream)}
.wallet{display:flex;flex-direction:column;gap:16px}
.wallet-top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
.wallet-lab{display:block;font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--sage-dim)}
.wallet-bal{display:block;font-family:var(--serif);font-size:34px;font-weight:600;color:var(--cream);margin-top:4px}
.wallet-chip{font-family:var(--mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--green);background:rgba(28,138,79,.12);padding:4px 8px;border-radius:2px;white-space:nowrap;height:fit-content}
.wallet-actions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.wallet-actions input{background:var(--ink);border:1px solid var(--line);border-radius:5px;padding:10px 12px;color:var(--cream);font-size:14px;max-width:170px}
.wallet-actions input:focus{outline:none;border-color:var(--green)}
.wallet-h{font-size:13px;margin-top:2px}
.txns{display:flex;flex-direction:column}
.txn{display:grid;grid-template-columns:120px 1fr auto;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line-soft);font-size:13px}
.txn:last-child{border-bottom:none}
.txn-dir{font-family:var(--mono);font-weight:600}.txn-dir.in{color:var(--green)}.txn-dir.out{color:var(--err)}
.txn-mid{color:var(--sage)}.txn-mid strong{color:var(--cream);font-weight:600}
.txn-at{font-family:var(--mono);font-size:11px;color:var(--sage-dim);white-space:nowrap}
.esusu-next{display:flex;align-items:center;gap:14px;flex-wrap:wrap;background:var(--ink);border:1px solid var(--line-soft);border-radius:8px;padding:14px 16px}
.esusu-next>span{font-size:13px;color:var(--sage-dim)}.esusu-next strong{color:var(--cream);font-family:var(--serif);font-size:16px;margin-right:auto}
.dash-hero-right{display:flex;align-items:center;gap:14px;margin-left:auto}
.help-btn{background:var(--ink-2);border:1px solid var(--line);border-radius:6px;padding:9px 15px;font-family:var(--sans);font-size:13px;font-weight:600;color:var(--green);cursor:pointer;transition:border-color .2s ease,background .2s ease}
.help-btn:hover,.help-btn.on{border-color:var(--green);background:rgba(28,138,79,.06)}
.concierge{background:var(--ink-2);border:1px solid var(--line-soft);border-radius:10px;padding:20px}
.concierge-row{display:flex;gap:10px;flex-wrap:wrap}
.concierge-row input{flex:1;min-width:240px;background:var(--ink);border:1px solid var(--line);border-radius:6px;padding:12px 14px;color:var(--cream);font-size:14px}
.concierge-row input:focus{outline:none;border-color:var(--green)}
.concierge-ans{margin-top:14px;padding:14px 16px;background:rgba(28,138,79,.06);border:1px solid var(--line-soft);border-radius:8px;font-size:14px;line-height:1.6;color:var(--sage)}
.support-cta{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;background:var(--ink-2);border:1px solid var(--line-soft);border-radius:8px;padding:16px 18px;font-size:14px;color:var(--sage)}
.thread{display:flex;flex-direction:column;gap:12px;margin:20px 0}
.msg{background:var(--ink-2);border:1px solid var(--line-soft);border-radius:10px;padding:14px 16px;max-width:80%}
.msg.staff{align-self:flex-end;background:rgba(28,138,79,.06);border-color:rgba(28,138,79,.2)}
.msg-head{display:flex;align-items:baseline;gap:10px;margin-bottom:6px}.msg-head strong{font-size:13.5px;color:var(--cream)}.msg-head span{font-family:var(--mono);font-size:10px;color:var(--sage-dim)}
.msg p{font-size:14px;line-height:1.6;color:var(--sage)}
.src-badge{font-family:var(--mono);font-size:9px;letter-spacing:.08em;padding:2px 6px;border-radius:2px;margin-left:8px;vertical-align:middle;text-transform:uppercase}
.src-sekat{background:rgba(90,140,200,.16);color:#2E5C88}.src-mccti{background:rgba(198,161,91,.14);color:var(--gold-soft)}
.ro-note{background:rgba(90,140,200,.08);border:1px solid rgba(90,140,200,.28);color:#2E5C88;border-radius:6px;padding:16px 18px;font-size:13px;line-height:1.55;margin-bottom:22px}
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
.link-inline{background:none;border:none;color:var(--gold-soft);cursor:pointer;font-size:inherit;font-family:inherit;padding:0;text-decoration:underline}
.link-inline:hover{color:var(--gold)}
.node.qoop.src{border-color:rgba(230,120,60,.45)}
.consent-check{display:flex;gap:10px;align-items:flex-start;font-size:12.5px;color:var(--sage);line-height:1.5;margin-top:4px}
.consent-check input{margin-top:2px;accent-color:var(--gold);width:16px;height:16px;flex-shrink:0}
.consent{position:fixed;left:0;right:0;bottom:0;z-index:50;background:var(--ink-2);border-top:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:20px;padding:16px 40px;flex-wrap:wrap}
.consent p{font-size:13px;color:var(--sage);line-height:1.5;max-width:64em}
.consent-actions{display:flex;align-items:center;gap:16px}
.privacy{display:flex;flex-direction:column;gap:20px;max-width:44em}
.privacy-row{border-left:2px solid var(--line);padding-left:18px}
.privacy-row h4{font-size:16px;margin-bottom:6px}.privacy-row p{font-size:14px;line-height:1.6;color:var(--sage)}
.data-controls .dc-actions{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:14px}
.dc-confirm{display:flex;align-items:center;gap:12px;font-size:13px;color:var(--err);flex-wrap:wrap}
.viewas-banner{display:flex;align-items:center;justify-content:space-between;gap:16px;background:rgba(90,140,200,.1);border:1px solid rgba(90,140,200,.3);color:#2E5C88;border-radius:6px;padding:12px 18px;margin-bottom:22px;font-size:14px}
.score-card{display:flex;flex-direction:column;gap:20px}
.score-head{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}
.score-num{display:flex;align-items:baseline;gap:8px}
.score-val{font-family:var(--serif);color:var(--cream);font-size:56px;font-weight:600;line-height:1}
.score-scale{font-family:var(--mono);font-size:13px;color:var(--sage-dim)}
.score-meta{display:flex;flex-direction:column;gap:8px;align-items:flex-end}
.score-cap{font-size:13px;color:var(--sage)}.score-cap strong{color:var(--cream)}
.score-factors{display:flex;flex-direction:column;gap:12px}
.sf{display:flex;flex-direction:column;gap:6px}
.sf-top{display:flex;justify-content:space-between;font-size:13px;color:var(--sage)}.sf-val{color:var(--cream);font-family:var(--mono);font-size:12px}
.sf-bar{height:6px;background:var(--line-soft);border-radius:3px;overflow:hidden}.sf-bar span{display:block;height:100%;background:var(--gold);border-radius:3px}
.band-dist{display:flex;gap:12px;flex-wrap:wrap}
.bd{display:flex;align-items:center;gap:8px;background:var(--ink-2);border:1px solid var(--line-soft);border-radius:6px;padding:12px 16px}.bd-n{font-family:var(--serif);color:var(--cream);font-size:18px;font-weight:600}
.viewas{display:flex;flex-direction:column;gap:20px}
.viewas-search{background:var(--ink-2);border:1px solid var(--line-soft);border-radius:4px;padding:12px 14px;color:var(--cream);font-size:14px;max-width:420px}
.viewas-search:focus{outline:none;border-color:var(--gold)}
.viewas-cols{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.viewas-list{display:flex;flex-direction:column;gap:8px}
.viewas-item{display:flex;align-items:center;justify-content:space-between;gap:12px;background:var(--ink-2);border:1px solid var(--line-soft);border-radius:5px;padding:14px 16px;cursor:pointer;color:var(--cream);font-size:14px;text-align:left;transition:border-color .15s ease}
.viewas-item:hover{border-color:var(--gold)}.va-go{font-family:var(--mono);font-size:11px;color:var(--gold);letter-spacing:.04em;white-space:nowrap}
@keyframes rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.analytics{display:flex;flex-direction:column;gap:22px}
.switcher{display:flex;align-items:center;gap:14px;flex-wrap:wrap;background:var(--ink-2);border:1px solid var(--line);border-radius:8px;padding:14px 18px}
.switcher-lab{font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--sage-dim)}
.switcher-sel{flex:1;min-width:240px;background:var(--ink);border:1px solid var(--line);border-radius:5px;padding:11px 12px;color:var(--cream);font-size:14px;font-family:var(--sans);cursor:pointer}
.switcher-sel:focus{outline:none;border-color:var(--green)}
.kpi-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px}
.kpi{background:var(--ink-2);border:1px solid var(--line-soft);border-radius:8px;padding:20px}
.kpi-fig{display:block;font-family:var(--serif);color:var(--cream);font-size:26px;font-weight:600;line-height:1.1}
.kpi-lab{display:block;margin-top:6px;font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--sage-dim)}
.chart-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.chart-card{background:var(--ink-2);border:1px solid var(--line-soft);border-radius:8px;padding:20px 22px;display:flex;flex-direction:column;gap:16px;min-width:0}
.chart-card.wide{grid-column:span 2}
.chart-card h4{font-size:14px;color:var(--cream)}
.donut-wrap{display:flex;align-items:center;gap:20px;flex-wrap:wrap}
.donut{flex-shrink:0}
.donut-c1{fill:var(--cream);font-family:var(--serif);font-size:26px;font-weight:600}
.donut-c2{fill:var(--sage-dim);font-family:var(--mono);font-size:9px;letter-spacing:.08em;text-transform:uppercase}
.legend{display:flex;flex-direction:column;gap:7px;min-width:0}
.lg{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--sage)}
.lg-dot{width:9px;height:9px;border-radius:2px;flex-shrink:0}
.lg b{margin-left:auto;color:var(--cream);font-family:var(--mono);font-size:12px;padding-left:14px}
.bars{display:flex;flex-direction:column;gap:11px}
.bar-row{display:grid;grid-template-columns:130px 1fr auto;align-items:center;gap:12px}
.bar-lab{font-size:12.5px;color:var(--sage);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bar-track{height:9px;background:var(--line-soft);border-radius:5px;overflow:hidden}
.bar-fill{display:block;height:100%;border-radius:5px}
.bar-val{font-family:var(--mono);font-size:12px;color:var(--cream);white-space:nowrap}
.miniarea{width:100%;height:90px;display:block}
.trend-x{display:flex;justify-content:space-between;font-family:var(--mono);font-size:10px;color:var(--sage-dim);margin-top:2px}@keyframes draw{to{transform:scaleX(1)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
@media(max-width:960px){.hero{grid-template-columns:1fr;padding-top:52px}.hero-watermark{display:none}.mod-grid{grid-template-columns:1fr 1fr}.persona-grid{grid-template-columns:1fr 1fr}.arc-steps{grid-template-columns:1fr}.arc-arrow{transform:rotate(90deg);justify-content:center;padding:2px 0}.foot-grid{grid-template-columns:1fr}.role-page-grid{grid-template-columns:1fr 1fr}.dash-grid{grid-template-columns:1fr}.statgrid{grid-template-columns:1fr 1fr}.viewas-cols{grid-template-columns:1fr}.kpi-row{grid-template-columns:1fr 1fr}.chart-grid{grid-template-columns:1fr}.chart-card.wide{grid-column:span 1}.bar-row{grid-template-columns:96px 1fr auto}}
@media(max-width:680px){.letterhead{padding:9px 18px;gap:12px}.lh-min{display:none}.lh-seal{height:34px}.lh-mccti{height:32px}.nav{padding:11px 18px;flex-wrap:wrap}.nav-links{display:flex;order:3;width:100%;overflow-x:auto;white-space:nowrap;gap:20px;padding:8px 0 2px;margin-top:6px;border-top:1px solid var(--line-soft);-webkit-overflow-scrolling:touch}.nav-page,.nav-verify,.lang-select{flex:0 0 auto}.hero{padding:40px 18px 30px}section.lens,section.modules,section.arc,section.personas,section.quote,section.leaders,section.about,section.pricing{padding:56px 18px}.band{padding:22px 18px;gap:18px 26px}.mod-grid,.persona-grid,.leader-grid,.price-grid{grid-template-columns:1fr}.lens-figs{gap:26px}.flow{padding:40px 18px 70px}.role-page-grid{grid-template-columns:1fr}.dash{padding:36px 18px 70px}.dash-hero{flex-wrap:wrap}.foot-top,.foot-grid{padding-left:18px;padding-right:18px}.acct-name{display:none}.form-grid{grid-template-columns:1fr}.detail-grid{grid-template-columns:1fr}.consent{padding:14px 18px}}
@media(prefers-reduced-motion:reduce){*{animation:none !important;transition:none !important}.underline::after{transform:scaleX(1)}}
`
