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
const LOAN_STATUS_CLASS = { 'Applied': 'st-filed', 'In training': 'st-review', 'Shortlisted': 'st-review', 'Coop validated': 'st-review', 'Bank assessment': 'st-review', 'BOI approved': 'st-approved', 'Disbursed': 'st-approved', 'Repaying': 'st-approved', 'Completed': 'st-approved', 'Declined': 'st-returned' }

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
const StatusChip = ({ status, kind }) => <span className={cx('chip', (kind === 'cap15' ? CAP15_CLASS : kind === 'loan' ? LOAN_STATUS_CLASS : STATUS_CLASS)[status] || 'st-review')}>{status}</span>
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
const LEADERS = [
  { img: '/leader-hc.jpg', name: 'Mrs Folashade Ambrose-Medebem', role: 'Honourable Commissioner', body: 'Leads the Ministry of Commerce, Cooperatives, Trade and Investment, driving cooperative development, MSME growth and investment across Lagos State.' },
  { img: '/leader-ps.jpg', name: 'Mr Babatunde Onigbanjo', role: 'Permanent Secretary', body: 'Oversees the administration of the Ministry and the delivery of its cooperative, trade and investment mandate across the area offices.' },
  { img: '/leader-dir.jpg', initials: 'AA', name: 'Dr Adeyinka Adeyemi', role: 'Director of Cooperatives', body: 'Heads the Directorate of Cooperative Services, responsible for the registration, supervision and audit of cooperative societies State-wide.' },
]
const ABOUT_ITEMS = [
  { q: 'The Ministry (MCCTI)', a: 'The Ministry of Commerce, Cooperatives, Trade and Investment formulates policy that stimulates business growth, cooperative development and investment in Lagos State. Through its Directorate of Cooperative Services it registers, supervises and audits cooperative societies across the State’s area offices.' },
  { q: 'LASMECO', a: 'The Lagos State Access to Finance for SMEs through Cooperatives programme provides single-digit (9%) loans of up to ₦10 million to cooperative-based MSMEs, without conventional collateral, delivered with the Bank of Industry and Sterling Bank through a layered guarantee structure and sector Accelerators.' },
  { q: 'SEKAT registry', a: 'SEKAT is the source of the legacy cooperative registry and audit records. In CoopEco, data flows one way from SEKAT into the platform, giving a single consolidated registry that officers and leadership can see.' },
  { q: 'QooP analytics', a: 'QooP is the source of member and MSME analytics. Its KYC and enterprise data flows one way into CoopEco to power member profiles and explainable, advisory credit scoring for LASMECO.' },
  { q: 'The platform (CoopEco)', a: 'MCCTI CoopEco unifies the registry, member analytics, LASMECO financing, wallets and governance intelligence into a single Ministry-owned platform, with role-aware workspaces and live oversight for leadership.' },
]
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
      <section className="modules" id="modules">
        <div className="section-head"><p className="eyebrow">Six modules, one platform</p><h2>Everything the cooperative economy runs on</h2></div>
        <div className="mod-grid">{MODULES.map((m) => (<article className="mod-card" key={m.n}><div className="mod-top"><span className="mod-n">{m.n}</span><span className="mod-lens">{m.lens}</span></div><h3>{m.title}</h3><p>{m.body}</p>{m.ai && <span className="mod-ai">Summarised by MCCTI CoopEco</span>}</article>))}</div>
      </section>
      <section className="arc" id="arc">
        <div className="section-head"><p className="eyebrow">From fragmentation to ₦1 billion</p><h2>How the platform changes the arithmetic</h2></div>
        <div className="arc-steps">
          <div className="arc-step"><span className="arc-n">01</span><h4>The problem: fragmentation</h4><p>The registry, the analytics layer and LASMECO operate in isolation. Data is duplicated, revenue is uncollected, fraud goes undetected, and Government cannot see its own economy.</p></div>
          <div className="arc-arrow" aria-hidden="true">&rarr;</div>
          <div className="arc-step"><span className="arc-n">02</span><h4>The solution: one unified platform</h4><p>Registry, KYC, analytics, wallets, disbursement and dashboards in a single Ministry-owned system. KYC at onboarding, timestamped trails, escrow flows, finance as the reward for compliance.</p></div>
          <div className="arc-arrow" aria-hidden="true">&rarr;</div>
          <div className="arc-step"><span className="arc-n">03</span><h4>The return: self-funding IGR</h4><p>Eight revenue streams generate ₦655M in Year 1 and cross ₦1 billion by Year 3, at zero capital cost to the State, with full ownership retained by the Ministry.</p></div>
        </div>
      </section>
      <section className="personas" id="intelligence">
        <div className="section-head"><p className="eyebrow">Role-aware from the first screen</p><h2>Built for everyone who touches a cooperative</h2></div>
        <div className="persona-grid">{PERSONAS.map(([t, d]) => (<div className="persona" key={t}><span className="persona-t">{t}</span><span className="persona-d">{d}</span></div>))}</div>
      </section>
      <section className="leaders" id="leadership">
        <div className="section-head"><p className="eyebrow"><span className="eb-dot" />Leadership</p><h2>Stewards of the cooperative economy</h2><p className="section-sub">The Ministry’s leadership provides the policy direction, oversight and governance behind MCCTI CoopEco.</p></div>
        <div className="leader-grid">{LEADERS.map((l, i) => (
          <Reveal className="leader-card" key={l.name} delay={i * 90} tag="article">
            <div className="leader-photo">{l.img ? <img src={l.img} alt={l.name} loading="lazy" /> : <span className="leader-mono">{l.initials}</span>}<span className="leader-ring" aria-hidden="true" /></div>
            <div className="leader-body"><span className="leader-role">{l.role}</span><h3>{l.name}</h3><p>{l.body}</p></div>
          </Reveal>))}</div>
      </section>
      <section className="about" id="about">
        <div className="section-head"><p className="eyebrow"><span className="eb-dot" />About</p><h2>What sits behind the platform</h2><p className="section-sub">The institutions and programmes that MCCTI CoopEco brings together.</p></div>
        <Accordion items={ABOUT_ITEMS} />
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
        <div className="status-row"><span>Connection</span><span className="pill muted">Sample feed{hasSupabase ? '' : ' (demo)'}</span></div>
        <div className="status-row"><span>Last sync</span><span className="mono">{info?.lastSync ? fmtDate(info.lastSync) : 'Never'}</span></div>
        <div className="status-row"><span>Societies ingested</span><span className="mono">{info?.count ?? 0}</span></div>
      </div>
      <button className="btn btn-gold btn-sm" onClick={run} disabled={busy}>{busy ? 'Syncing…' : 'Run SEKAT sync'}</button>
      <p className="panel-note">Data flows one way, from SEKAT into MCCTI. Synced societies are read-only here. Connect the live SEKAT source by setting SEKAT_API_URL and SEKAT_API_KEY in the environment; until then this ingests a representative sample that mirrors the SEKAT dataset (registration, custodian, trustees, bank and full audit inputs with examination, approval and signature). Compliance: data flow, retention and NDPR handling to be governed by the SEKAT integration agreement. This is not legal advice.</p>
    </div>
  )
}
function OfficerWorkspace({ ctx }) {
  const [coops, reload] = useRegistry()
  const [tab, setTab] = useState('queue'), [sel, setSel] = useState(null), [loanSel, setLoanSel] = useState(null)
  const [loans, reloadLoans] = useLoans()
  if (!coops) return <p className="muted-line">Loading registry…</p>
  if (sel) return <CoopDetail coop={sel} ctx={ctx} onClose={() => { setSel(null); reload() }} onChanged={reload} />
  if (loanSel) return <LoanDetail loan={loanSel} ctx={ctx} onClose={() => { setLoanSel(null); reloadLoans() }} onChanged={reloadLoans} />
  const queue = coops.filter((c) => ['Filed', 'Under review', 'Returned'].includes(c.status))
  const byOffice = AREA_OFFICES.map((o) => [o, coops.filter((c) => c.areaOffice === o).length]).filter(([, n]) => n)
  const lasmecoQueue = (loans || []).filter((l) => l.status === 'Shortlisted')
  return (
    <div className="ws">
      <StatCards coops={coops} />
      <div className="tabs">{[['queue', 'Review queue'], ['all', 'All societies'], ['members', 'Members'], ['lasmeco', 'LASMECO'], ['offices', 'By area office'], ['audit', 'Audit log'], ['integrations', 'Integrations']].map(([id, l]) => (<button key={id} className={cx('tab', tab === id && 'on')} onClick={() => setTab(id)}>{l}</button>))}</div>
      {tab === 'queue' && <CoopTable coops={queue} onOpen={setSel} />}
      {tab === 'all' && <CoopTable coops={coops} onOpen={setSel} />}
      {tab === 'members' && <MembersAnalytics />}
      {tab === 'lasmeco' && (!loans ? <p className="muted-line">Loading…</p> : <><p className="muted-line">Applications awaiting cooperative validation and 25% guarantee. Open one to validate.</p><LoanTable loans={lasmecoQueue.length ? lasmecoQueue : loans} onOpen={setLoanSel} /></>)}
      {tab === 'offices' && <div className="rtable-wrap"><table className="rtable"><thead><tr><th>Area office</th><th>Societies</th></tr></thead><tbody>{byOffice.map(([o, n]) => (<tr key={o}><td>{o}</td><td className="mono">{n}</td></tr>))}</tbody></table></div>}
      {tab === 'audit' && <OfficerAuditLog />}
      {tab === 'integrations' && <IntegrationsPanel ctx={ctx} onSynced={reload} />}
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
function AuditorWorkspace({ ctx }) {
  const [coops, reload] = useRegistry()
  const [sel, setSel] = useState(null)
  if (!coops) return <p className="muted-line">Loading returns…</p>
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
function AnalyticsDashboard() {
  const [coops, setCoops] = useState(null), [members, setMembers] = useState([]), [loans, setLoans] = useState([])
  useEffect(() => { listCoops().then(setCoops); listMembers().then(setMembers); listLoans().then(setLoans) }, [])
  if (!coops) return <p className="muted-line">Loading analytics…</p>
  const scored = members.map((m) => scoreMember(m))
  const disbursed = loans.filter((l) => ['Disbursed', 'Repaying', 'Completed'].includes(l.status))
  const disbursedValue = disbursed.reduce((a, l) => a + (l.amountApproved || 0), 0)
  const regFees = coops.filter((c) => c.feeStatus === 'Paid').length * COOP_FEES.registration
  const returnsFees = coops.filter((c) => c.returns).length * COOP_FEES.annualReturns
  const portalFees = Math.round(disbursedValue * 0.025)
  const accrued = regFees + returnsFees + portalFees
  const avgScore = scored.length ? Math.round(scored.reduce((a, s) => a + s.score, 0) / scored.length) : 0

  const statusData = [['Approved', CHART_C.green], ['Under review', CHART_C.gold], ['Filed', CHART_C.slate], ['Returned', CHART_C.red]].map(([s, c]) => ({ label: s, value: coops.filter((x) => x.status === s).length, color: c })).filter((d) => d.value)
  const cap15 = [['Compliant', CHART_C.green], ['Under audit', CHART_C.slate], ['Returns due', CHART_C.gold]].map(([s, c]) => ({ label: s, value: coops.filter((x) => x.cap15 === s).length, color: c })).filter((d) => d.value)
  const sourceData = [{ label: 'SEKAT', value: coops.filter((c) => c.source === 'SEKAT').length, color: CHART_C.teal }, { label: 'MCCTI', value: coops.filter((c) => c.source !== 'SEKAT').length, color: CHART_C.gold }].filter((d) => d.value)
  const offices = AREA_OFFICES.map((o) => ({ label: o, value: coops.filter((c) => c.areaOffice === o).length, color: CHART_C.green })).filter((d) => d.value).sort((a, b) => b.value - a.value).slice(0, 6)
  const bands = [['Prime', CHART_C.green], ['Strong', '#5FB07E'], ['Fair', CHART_C.gold], ['Building', CHART_C.amber], ['Thin file', CHART_C.slate]].map(([b, c]) => ({ label: b, value: scored.filter((s) => s.band === b).length, color: c })).filter((d) => d.value)
  const kyc = [['Verified', CHART_C.green], ['Partial', CHART_C.gold], ['Unverified', CHART_C.slate]].map(([s, c]) => ({ label: s, value: members.filter((m) => (m.kyc?.status || 'Unverified') === s).length, color: c })).filter((d) => d.value)
  const pipeline = ['Applied', 'In training', 'Shortlisted', 'Coop validated', 'Bank assessment', 'BOI approved', 'Disbursed'].map((s) => ({ label: s, value: loans.filter((l) => l.status === s).length, color: CHART_C.gold }))
  const sectors = Array.from(new Set(loans.map((l) => l.sector))).map((s) => ({ label: s, value: loans.filter((l) => l.sector === s).length, color: CHART_C.teal }))
  const split = SPV_SPLIT.map(([n, p], i) => ({ label: n, value: Math.round(accrued * p / 100), color: [CHART_C.green, CHART_C.gold, CHART_C.teal, CHART_C.plum, CHART_C.amber][i] }))

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
function LeadershipOverview({ ctx, onViewAs }) {
  const [coops, reload] = useRegistry()
  const [tab, setTab] = useState('overview'), [sel, setSel] = useState(null)
  if (!coops) return <p className="muted-line">Loading overview…</p>
  if (sel) return <CoopDetail coop={sel} ctx={ctx} onClose={() => { setSel(null); reload() }} onChanged={reload} />
  const pending = coops.filter((c) => c.source !== 'SEKAT' && ['Filed', 'Under review', 'Returned'].includes(c.status))
  return (
    <div className="ws">
      <ViewAsBar onViewAs={onViewAs} />
      <StatCards coops={coops} />
      <div className="tabs">{[['overview', 'Overview'], ['applications', 'Applications' + (pending.length ? ' (' + pending.length + ')' : '')], ['members', 'Members'], ['lasmeco', 'LASMECO'], ['viewas', 'View as'], ['integrations', 'Integrations']].map(([id, l]) => (<button key={id} className={cx('tab', tab === id && 'on')} onClick={() => setTab(id)}>{l}</button>))}</div>
      {tab === 'overview' && <AnalyticsDashboard />}
      {tab === 'applications' && (<><p className="muted-line">Review each application's documents, then approve or reject. Societies mirrored from SEKAT are managed in SEKAT.</p><CoopTable coops={pending.length ? pending : coops} onOpen={setSel} /></>)}
      {tab === 'members' && <MembersAnalytics />}
      {tab === 'lasmeco' && <LasmecoOverview ctx={ctx} />}
      {tab === 'viewas' && <ViewAsSwitcher onViewAs={onViewAs} />}
      {tab === 'integrations' && <IntegrationsPanel ctx={ctx} onSynced={reload} />}
      <p className="dash-foot">Real-time oversight across the cooperative economy. Loan performance and fraud alerts arrive with LASMECO and the intelligence module.</p>
    </div>
  )
}
function SocietyWorkspace({ ctx }) {
  const [coops, reload] = useRegistry()
  const [mode, setMode] = useState('view') // view | register | returns
  if (!coops) return <p className="muted-line">Loading…</p>
  const mine = ctx.focusId ? coops.find((c) => c.trackingId === ctx.focusId) : coops.find((c) => c.createdBy === ctx.email)
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
      {mine.source !== 'SEKAT' && mine.feeStatus !== 'Paid' && (
        <div className="fee-banner"><span>Registration fee <strong>{fmtNaira(mine.registrationFee || COOP_FEES.registration)}</strong> to join the platform is outstanding.</span><button className="btn btn-gold btn-sm" onClick={async () => { await payCoopFee(mine.trackingId, ctx); reload() }}>Pay now (demo)</button></div>
      )}
      <div className="society-card">
        <div className="society-top"><div><h3>{mine.name}</h3><p className="detail-sub">{mine.trackingId} &middot; {mine.areaOffice} area office &middot; {mine.sector}</p></div><div className="detail-chips"><StatusChip status={mine.status} /><StatusChip status={mine.cap15} kind="cap15" /></div></div>
        <div className="society-figs"><div><span className="lf-lab">Members</span><span className="society-fig">{Number(mine.members || 0).toLocaleString('en-NG')}</span></div><div><span className="lf-lab">Contributions</span><span className="society-fig">{fmtNaira(mine.contributions)}</span></div><div><span className="lf-lab">Custodian</span><span className="society-fig sm">{mine.custodian || '—'}</span></div></div>
        <div className="society-actions">
          {mine.source === 'SEKAT' ? <span className="returned-flag" style={{ color: '#9DC0E8' }}>Mirrored from SEKAT (read-only). Returns are filed in SEKAT.</span> : <button className="btn btn-gold btn-sm" onClick={() => setMode('returns')}>{mine.returns ? 'Re-file annual returns' : 'File annual returns'}</button>}
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

/* =============================== STAGE 4 ===============================
   Member & MSME Analytics (QooP layer). QooP is treated exactly like SEKAT:
   a one-way source (QooP -> MCCTI). Members and their MSME profiles flow in,
   are mirrored read-only with a QOOP badge, and an explainable credit score is
   computed. Plus GDPR controls (consent, access, portability, erasure) and a
   leadership "view as" switcher across all users.
   ====================================================================== */

const GENDERS = ['Female', 'Male', 'Prefer not to say']
const QOOP_FEED = [
  { ref: 'QP-10231', name: 'Adaeze Okonkwo', coop: 'Ikeja Grand Traders Cooperative', sector: 'Trade', phone: '0803xxxx210', gender: 'Female', kyc: { bvnVerified: true, ninVerified: true }, msme: { monthlyTurnover: 620000, employees: 4, cashFlow: 240000, customerBase: 180, yearsInOperation: 6 } },
  { ref: 'QP-10232', name: 'Emeka Balogun', coop: 'Idumota Textile Merchants Coop', sector: 'Trade', phone: '0806xxxx554', gender: 'Male', kyc: { bvnVerified: true, ninVerified: true }, msme: { monthlyTurnover: 1450000, employees: 9, cashFlow: 520000, customerBase: 420, yearsInOperation: 11 } },
  { ref: 'QP-10233', name: 'Ngozi Underwood', coop: 'Surulere United Artisans Coop', sector: 'Artisan', phone: '0705xxxx018', gender: 'Female', kyc: { bvnVerified: true, ninVerified: false }, msme: { monthlyTurnover: 210000, employees: 2, cashFlow: 60000, customerBase: 55, yearsInOperation: 3 } },
  { ref: 'QP-10234', name: 'Tunde Salami', coop: 'Ibeju-Lekki Farmers Multipurpose Coop', sector: 'Agriculture', phone: '0813xxxx777', gender: 'Male', kyc: { bvnVerified: false, ninVerified: false }, msme: { monthlyTurnover: 95000, employees: 1, cashFlow: 20000, customerBase: 30, yearsInOperation: 2 } },
  { ref: 'QP-10235', name: 'Blessing Achebe', coop: 'Ikeja Grand Traders Cooperative', sector: 'Trade', phone: '0809xxxx341', gender: 'Female', kyc: { bvnVerified: true, ninVerified: true }, msme: { monthlyTurnover: 880000, employees: 6, cashFlow: 330000, customerBase: 260, yearsInOperation: 8 } },
]
const qoopIdFor = (ref) => 'QOOP-' + String(ref).replace(/[^A-Za-z0-9]+/g, '-')
function qoopToMember(r) {
  const now = new Date().toISOString()
  return { memberId: qoopIdFor(r.ref), source: 'QOOP', ref: r.ref, name: r.name, coop: r.coop, sector: r.sector, phone: r.phone, gender: r.gender, kyc: { ...r.kyc, status: (r.kyc.bvnVerified && r.kyc.ninVerified) ? 'Verified' : (r.kyc.bvnVerified || r.kyc.ninVerified) ? 'Partial' : 'Unverified' }, msme: r.msme, createdBy: 'qoop@system', createdAt: now, syncedAt: now }
}
async function listMembers() { return (await kvList('member:')).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)) }
async function getMember(id) { return await kvGet('member:' + id) }
async function createMember(rec, ctx) {
  const memberId = 'M-' + String(Math.floor(Math.random() * 1000000)).padStart(6, '0'); const now = new Date().toISOString()
  const bvnVerified = Boolean(rec.bvn && rec.bvn.length >= 10), ninVerified = Boolean(rec.nin && rec.nin.length >= 10)
  const record = { memberId, source: 'MCCTI', name: rec.name, coop: rec.coop, sector: rec.sector, phone: rec.phone, gender: rec.gender, kyc: { bvn: rec.bvn ? 'on file' : '', nin: rec.nin ? 'on file' : '', bvnVerified, ninVerified, status: (bvnVerified && ninVerified) ? 'Verified' : (bvnVerified || ninVerified) ? 'Partial' : 'Unverified' }, msme: { monthlyTurnover: Number(rec.monthlyTurnover) || 0, employees: Number(rec.employees) || 0, cashFlow: Number(rec.cashFlow) || 0, customerBase: Number(rec.customerBase) || 0, yearsInOperation: Number(rec.yearsInOperation) || 0 }, createdBy: ctx.email, createdAt: now }
  await kvSet('member:' + memberId, record, ctx.uid)
  return record
}
async function syncFromQoop(ctx, silent) {
  let n = 0
  for (const r of QOOP_FEED) { const rec = qoopToMember(r); await kvSet('member:' + rec.memberId, rec); n++ }
  await kvSet('integration:qoop', { lastSync: new Date().toISOString(), count: n, source: 'QooP sample feed' })
  return n
}

/* explainable, human-reviewable credit score (advisory; not a solely automated
   decision - a cooperative officer approves before it affects LASMECO) */
const BAND_CLASS = { Prime: 'st-approved', Strong: 'st-approved', Fair: 'st-review', Building: 'st-review', 'Thin file': 'st-filed' }
function scoreMember(m) {
  const t = Number(m?.msme?.monthlyTurnover) || 0, emp = Number(m?.msme?.employees) || 0, yrs = Number(m?.msme?.yearsInOperation) || 0, cf = Number(m?.msme?.cashFlow) || 0
  const kyc = (m?.kyc?.bvnVerified ? 1 : 0) + (m?.kyc?.ninVerified ? 1 : 0)
  const cT = Math.min(200, (t / 500000) * 200), cC = Math.min(80, (cf / 300000) * 80), cY = Math.min(70, yrs * 14), cE = Math.min(50, emp * 8), cK = kyc * 50
  let s = Math.max(300, Math.min(850, Math.round(300 + cT + cC + cY + cE + cK)))
  const band = s >= 740 ? 'Prime' : s >= 670 ? 'Strong' : s >= 580 ? 'Fair' : s >= 500 ? 'Building' : 'Thin file'
  const threshold = band === 'Prime' ? 10000000 : band === 'Strong' ? 6000000 : band === 'Fair' ? 3000000 : band === 'Building' ? 1000000 : 300000
  const factors = [
    { label: 'Monthly turnover', display: fmtNaira(t), pct: Math.round(cT / 200 * 100) },
    { label: 'Cash flow buffer', display: fmtNaira(cf), pct: Math.round(cC / 80 * 100) },
    { label: 'Years in operation', display: yrs + ' yr' + (yrs === 1 ? '' : 's'), pct: Math.round(cY / 70 * 100) },
    { label: 'Employees', display: String(emp), pct: Math.round(cE / 50 * 100) },
    { label: 'KYC verified', display: kyc + '/2', pct: Math.round(cK / 100 * 100) },
  ]
  return { score: s, band, threshold, factors }
}

/* -------------------------------- GDPR -------------------------------- */
function downloadJson(filename, obj) { const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url) }
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
      <div className="sekat-status"><div className="status-row"><span>Connection</span><span className="pill muted">Sample feed{hasSupabase ? '' : ' (demo)'}</span></div><div className="status-row"><span>Last sync</span><span className="mono">{info?.lastSync ? fmtDate(info.lastSync) : 'Never'}</span></div><div className="status-row"><span>Members ingested</span><span className="mono">{info?.count ?? 0}</span></div></div>
      <button className="btn btn-gold btn-sm" onClick={run} disabled={busy}>{busy ? 'Syncing…' : 'Run QooP sync'}</button>
      <p className="panel-note">Data flows one way, from QooP into MCCTI. Synced members are read-only here. Connect the live source with QOOP_API_URL and QOOP_API_KEY; until then this ingests a representative sample mirroring the QooP dataset (KYC, turnover, employees, cash flow, sector). Compliance: KYC and NDPR/GDPR handling governed by the QooP data-sharing agreement. This is not legal advice.</p>
    </div>
  )
}
function IntegrationsPanel({ ctx, onSynced }) {
  return (<div className="ws"><div><h3 className="ws-h">SEKAT integration &middot; registry</h3><SekatPanel ctx={ctx} onSynced={onSynced} /></div><div><h3 className="ws-h">QooP integration &middot; member analytics</h3><QoopPanel ctx={ctx} onSynced={onSynced} /></div></div>)
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
    try { const rec = await createMember(f, ctx); setDone(rec) } catch (e) { setErr(e.message || 'Could not save your profile.') } setBusy(false)
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
function MemberWorkspace({ ctx }) {
  const [members, setMembers] = useState(null), [coops, setCoops] = useState([]), [loans, setLoans] = useState([])
  const [mode, setMode] = useState('view'), [sel, setSel] = useState(null)
  const reload = useCallback(() => { listMembers().then(setMembers); listCoops().then(setCoops); listLoans().then(setLoans) }, [])
  useEffect(() => { reload() }, [reload])
  if (!members) return <p className="muted-line">Loading…</p>
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
      <div className="society-card">
        <div className="society-top"><div><h3>{mine.name}</h3><p className="detail-sub">{mine.coop} &middot; {mine.sector}{mine.ref ? ' · ' + mine.ref : ''}</p></div><div className="detail-chips"><StatusChip status={mine.kyc?.status || 'Unverified'} kind="cap15" /><SourceBadge source={mine.source} /></div></div>
        <div className="society-figs"><div><span className="lf-lab">Monthly turnover</span><span className="society-fig">{fmtNaira(mine.msme?.monthlyTurnover)}</span></div><div><span className="lf-lab">Employees</span><span className="society-fig">{mine.msme?.employees ?? 0}</span></div><div><span className="lf-lab">Years</span><span className="society-fig">{mine.msme?.yearsInOperation ?? 0}</span></div></div>
        <div className="society-actions"><button className="btn btn-gold btn-sm" onClick={() => setMode('apply')}>Apply for LASMECO finance</button></div>
      </div>
      <div className="returns-box"><h4>Your credit score</h4><CreditScoreCard m={mine} /></div>
      <div className="trail-box"><h4>Your LASMECO applications</h4>{myLoans.length ? <LoanTable loans={myLoans} onOpen={setSel} /> : <p className="muted-line">No applications yet. Apply above; there are no upfront fees.</p>}</div>
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
function genLoanId() { const yy = String(new Date().getFullYear()).slice(2); return 'LN-' + yy + '-' + String(Math.floor(Math.random() * 1000000)).padStart(6, '0') }
async function listLoans() { return (await kvList('loan:')).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)) }
async function createLoan(rec, ctx) {
  const loanId = genLoanId(); const now = new Date().toISOString()
  const record = { loanId, status: 'Applied', apName: '', amountRecommended: null, amountApproved: null, createdBy: ctx.email, createdAt: now, updatedAt: now, ...rec }
  await kvSet('loan:' + loanId, record, ctx.uid)
  await addAudit({ trackingId: loanId, action: 'Application submitted', by: ctx.name, role: ctx.role, note: rec.purpose || '' })
  return record
}
async function updateLoan(id, patch, ctx, action, note) {
  const cur = await kvGet('loan:' + id); if (!cur) return null
  const next = { ...cur, ...patch, updatedAt: new Date().toISOString() }
  await kvSet('loan:' + id, next, cur.user_id)
  if (action) await addAudit({ trackingId: id, action, by: ctx.name, role: ctx.role, note: note || '' })
  return next
}
async function payCoopFee(coopId, ctx) { return updateCoop(coopId, { feeStatus: 'Paid' }, ctx, 'Registration fee paid', fmtNaira(COOP_FEES.registration)) }
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
    try { await createLoan({ memberId: member.memberId, memberName: member.name, coop: member.coop, sector: member.sector, amountRequested: amt, type: f.type, purpose: f.purpose.trim() }, ctx); onDone() }
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
  const [l, setL] = useState(loan), [note, setNote] = useState(''), [amt, setAmt] = useState(''), [busy, setBusy] = useState(false), [rk, setRk] = useState(0)
  const role = ctx.role
  const b = loanBreakdown(l.amountApproved || l.amountRecommended || l.amountRequested)
  const act = async (patch, action, needNote) => {
    if (needNote && !note.trim()) { alert('Add a note for the record.'); return }
    setBusy(true); const next = await updateLoan(l.loanId, patch, ctx, action, note.trim()); setL(next); setNote(''); setRk((k) => k + 1); setBusy(false); onChanged && onChanged()
  }
  const recommend = async () => { const a = Number(amt) || 0; if (a <= 0 || a > 10000000) { alert('Enter a recommended amount up to ₦10,000,000.'); return } await act({ status: 'Shortlisted', amountRecommended: a }, 'Shortlisted; amount recommended', false) }
  const boiApprove = async () => { const a = Number(amt) || l.amountRecommended || 0; if (a <= 0) { alert('Enter the approved amount.'); return } await act({ status: 'BOI approved', amountApproved: a }, 'Final approval and funding (BOI)', true) }
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

      <div className="action-box">
        <label className="field"><span>Note (recorded on the audit trail)</span><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Decision, conditions or findings." /></label>
        {(canAP && l.status === 'In training') || (canBOI && l.status === 'Bank assessment') ? <label className="field"><span>Amount (₦)</span><input type="number" value={amt} onChange={(e) => setAmt(e.target.value)} placeholder={String(l.amountRecommended || l.amountRequested || '')} /></label> : null}
        <div className="action-row">
          {canAP && l.status === 'Applied' && <button className="btn btn-gold btn-sm" disabled={busy} onClick={() => act({ status: 'In training', apName: ctx.name }, 'Enrolled in capacity building')}>Begin capacity building</button>}
          {canAP && l.status === 'In training' && <button className="btn btn-gold btn-sm" disabled={busy} onClick={recommend}>Shortlist &amp; recommend amount</button>}
          {canOff && l.status === 'Shortlisted' && <button className="btn btn-gold btn-sm" disabled={busy} onClick={() => act({ status: 'Coop validated' }, 'Cooperative validated; 25% guarantee issued', true)}>Validate cooperative &amp; guarantee</button>}
          {canSterling && l.status === 'Coop validated' && <button className="btn btn-gold btn-sm" disabled={busy} onClick={() => act({ status: 'Bank assessment' }, 'KYC and assessment complete; 50% Sterling guarantee applied', true)}>Assess &amp; apply 50% guarantee</button>}
          {canBOI && l.status === 'Bank assessment' && <button className="btn btn-gold btn-sm" disabled={busy} onClick={boiApprove}>Grant final approval &amp; fund</button>}
          {canSterling && l.status === 'BOI approved' && <button className="btn btn-gold btn-sm" disabled={busy} onClick={() => act({ status: 'Disbursed' }, 'Funds disbursed to beneficiary', true)}>Disburse to beneficiary</button>}
          {canSterling && l.status === 'Disbursed' && <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => act({ status: 'Completed' }, 'Loan fully repaid', false)}>Mark completed</button>}
          {canDecline && <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => act({ status: 'Declined' }, 'Application declined', true)}>Decline</button>}
        </div>
      </div>

      <div className="trail-box"><h4>Loan trail</h4><AuditTrail trackingId={l.loanId} refreshKey={rk} /></div>
    </div>
  )
}
function useLoans() { const [loans, setLoans] = useState(null); const reload = useCallback(() => listLoans().then(setLoans), []); useEffect(() => { reload() }, [reload]); return [loans, reload] }
function AcceleratorWorkspace({ ctx }) {
  const [loans, reload] = useLoans(); const [tab, setTab] = useState('queue'), [sel, setSel] = useState(null)
  if (!loans) return <p className="muted-line">Loading pipeline…</p>
  if (sel) return <LoanDetail loan={sel} ctx={ctx} onClose={() => { setSel(null); reload() }} onChanged={reload} />
  const queue = loans.filter((l) => AP_STATUSES.includes(l.status))
  const by = (s) => loans.filter((l) => l.status === s).length
  return (
    <div className="ws">
      <div className="statgrid"><div className="stat"><span className="stat-fig">{by('Applied')}</span><span className="stat-lab">New applications</span></div><div className="stat"><span className="stat-fig">{by('In training')}</span><span className="stat-lab">In training</span></div><div className="stat"><span className="stat-fig">{by('Shortlisted')}</span><span className="stat-lab">Shortlisted</span></div><div className="stat"><span className="stat-fig">{loans.length}</span><span className="stat-lab">Total in pipeline</span></div></div>
      <div className="tabs">{[['queue', 'My pipeline'], ['all', 'All loans']].map(([id, l]) => (<button key={id} className={cx('tab', tab === id && 'on')} onClick={() => setTab(id)}>{l}</button>))}</div>
      {tab === 'queue' ? <LoanTable loans={queue} onOpen={setSel} /> : <LoanTable loans={loans} onOpen={setSel} />}
    </div>
  )
}
function LoanRoleWorkspace({ ctx, statuses, cards }) {
  const [loans, reload] = useLoans(); const [tab, setTab] = useState('queue'), [sel, setSel] = useState(null)
  if (!loans) return <p className="muted-line">Loading loans…</p>
  if (sel) return <LoanDetail loan={sel} ctx={ctx} onClose={() => { setSel(null); reload() }} onChanged={reload} />
  const queue = loans.filter((l) => statuses.includes(l.status))
  return (
    <div className="ws">
      <div className="statgrid">{cards(loans).map(([lab, val]) => (<div className="stat" key={lab}><span className="stat-fig">{val}</span><span className="stat-lab">{lab}</span></div>))}</div>
      <div className="tabs">{[['queue', 'My queue'], ['all', 'All loans']].map(([id, l]) => (<button key={id} className={cx('tab', tab === id && 'on')} onClick={() => setTab(id)}>{l}</button>))}</div>
      {tab === 'queue' ? <LoanTable loans={queue} onOpen={setSel} /> : <LoanTable loans={loans} onOpen={setSel} />}
    </div>
  )
}
function SterlingWorkspace({ ctx }) {
  const cards = (loans) => { const d = loans.filter((l) => ['Disbursed', 'Repaying', 'Completed'].includes(l.status)); return [['Awaiting assessment', loans.filter((l) => l.status === 'Coop validated').length], ['To disburse', loans.filter((l) => l.status === 'BOI approved').length], ['Disbursed', d.length], ['Disbursed value', fmtNaira(d.reduce((a, l) => a + (l.amountApproved || 0), 0))]] }
  return <LoanRoleWorkspace ctx={ctx} statuses={['Coop validated', 'BOI approved', 'Disbursed']} cards={cards} />
}
function BoiWorkspace({ ctx }) {
  const cards = (loans) => [['Awaiting approval', loans.filter((l) => l.status === 'Bank assessment').length], ['Approved', loans.filter((l) => l.status === 'BOI approved').length], ['Disbursed', loans.filter((l) => ['Disbursed', 'Repaying', 'Completed'].includes(l.status)).length], ['Applications', loans.length]]
  return <LoanRoleWorkspace ctx={ctx} statuses={['Bank assessment', 'BOI approved']} cards={cards} />
}
const SPV_SPLIT = [['Lagos State (MCCTI)', 50], ['Asset Matrix MFB', 15], ['Imade / Catridge', 15], ['QooP', 10], ['SEKAT', 10]]
function AssetMatrixWorkspace({ ctx }) {
  const [coops, setCoops] = useState(null), [loans, setLoans] = useState([]), [last, setLast] = useState(null), [busy, setBusy] = useState(false)
  const reload = useCallback(() => { listCoops().then(setCoops); listLoans().then(setLoans); kvGet('escrow:last').then(setLast) }, [])
  useEffect(() => { reload() }, [reload])
  if (!coops) return <p className="muted-line">Loading escrow…</p>
  const regFees = coops.filter((c) => c.feeStatus === 'Paid').length * COOP_FEES.registration
  const returnsFees = coops.filter((c) => c.returns).length * COOP_FEES.annualReturns
  const disbursedValue = loans.filter((l) => ['Disbursed', 'Repaying', 'Completed'].includes(l.status)).reduce((a, l) => a + (l.amountApproved || 0), 0)
  const portalFees = Math.round(disbursedValue * 0.025)
  const accrued = regFees + returnsFees + portalFees
  const distribute = async () => { setBusy(true); const rec = { amount: accrued, at: new Date().toISOString(), by: ctx.name, split: SPV_SPLIT.map(([n, p]) => [n, Math.round(accrued * p / 100)]) }; await kvSet('escrow:last', rec); await addAudit({ trackingId: 'ESCROW', action: 'Revenue distributed on 50/15/15/10/10', by: ctx.name, role: 'assetmatrix', note: fmtNaira(accrued) }); setLast(rec); setBusy(false) }
  return (
    <div className="ws">
      <div className="statgrid">
        <div className="stat"><span className="stat-fig">{fmtNaira(accrued)}</span><span className="stat-lab">Escrow accrued</span></div>
        <div className="stat"><span className="stat-fig">{fmtNaira(regFees)}</span><span className="stat-lab">Registration fees</span></div>
        <div className="stat"><span className="stat-fig">{fmtNaira(returnsFees)}</span><span className="stat-lab">Returns fees</span></div>
        <div className="stat"><span className="stat-fig">{fmtNaira(portalFees)}</span><span className="stat-lab">Disbursement portal (2.5%)</span></div>
      </div>
      <div className="dash-grid">
        <section className="dash-card"><h3>Sharing formula distribution</h3>{SPV_SPLIT.map(([n, p]) => (<div className="status-row" key={n}><span>{n} ({p}%)</span><span className="mono">{fmtNaira(Math.round(accrued * p / 100))}</span></div>))}<div className="panel-actions"><button className="btn btn-gold btn-sm" onClick={distribute} disabled={busy}>{busy ? 'Recording…' : 'Record distribution'}</button></div></section>
        <section className="dash-card"><h3>Last distribution</h3>{last ? (<><p className="dash-card-sub">{fmtNaira(last.amount)} on {fmtDate(last.at)} by {last.by}</p>{(last.split || []).map(([n, v]) => (<div className="status-row" key={n}><span>{n}</span><span className="mono">{fmtNaira(v)}</span></div>))}</>) : <p className="muted-line">No distribution recorded yet.</p>}</section>
      </div>
      <p className="dash-foot">Asset Matrix MFB holds the platform revenue escrow. All platform fees accrue here and are distributed on the 50/15/15/10/10 formula. Live bank settlement connects through Paystack or Flutterwave. Not financial advice.</p>
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


const WORKSPACES = { society: SocietyWorkspace, member: MemberWorkspace, officer: OfficerWorkspace, auditor: AuditorWorkspace, sterling: SterlingWorkspace, boi: BoiWorkspace, assetmatrix: AssetMatrixWorkspace, accelerator: AcceleratorWorkspace, leadership: LeadershipOverview }
function Dashboard({ session, onSignOut }) {
  const p = session.profile
  const [viewAs, setViewAs] = useState(null)
  const eff = viewAs || { role: p.role, name: p.name, email: session.email, office: p.office, title: p.title }
  const ctx = { email: eff.email, uid: session.id, role: eff.role, name: eff.name, focusId: eff.focusId }
  const Workspace = WORKSPACES[eff.role] || CapabilityPreview
  return (
    <main className="dash"><div className="dash-inner">
      {viewAs && <div className="viewas-banner"><span>Viewing as <strong>{eff.name}</strong> &middot; {roleTitle(eff.role)}</span><button className="link-inline" onClick={() => setViewAs(null)}>Exit view</button></div>}
      <div className="dash-hero">
        <Avatar name={eff.name} photo={p.photo} size={64} />
        <div className="dash-hero-text"><p className="eyebrow"><span className="eb-dot" />{viewAs ? 'Impersonation view' : greeting()}</p><h1 className="dash-name">{eff.name}</h1><p className="dash-meta">{eff.title} &middot; {eff.office}</p></div>
        <span className="dash-rolebadge">{roleTitle(eff.role)}</span>
      </div>
      {eff.role === 'leadership' && !viewAs
        ? <LeadershipOverview ctx={ctx} onViewAs={setViewAs} />
        : <Workspace ctx={ctx} />}
      {!viewAs && (p.role === 'society' || p.role === 'member') && <div style={{ marginTop: '24px' }}><DataControls ctx={ctx} onDeleted={onSignOut} /></div>}
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
        <nav className="nav-links" aria-label="Primary">{view === 'landing' ? (<><a href="#modules">Modules</a><a href="#leadership">Leadership</a><a href="#about">About</a><a href="#arc">Platform</a><a href="#intelligence">Roles</a></>) : null}</nav>
        {ready && session ? (
          <div className="account"><button className="acct-btn" onClick={() => setView('dashboard')}><Avatar name={session.profile.name} photo={session.profile.photo} size={30} /><span className="acct-name">{session.profile.name.split(' ')[0]}</span></button><button className="signout" onClick={doSignOut}>Sign out</button></div>
        ) : (<button className="btn btn-gold nav-cta" onClick={enter}>Enter platform</button>)}
      </header>
      {view === 'landing' && <Landing area={area} setArea={setArea} onEnter={enter} />}
      {view === 'role' && <RolePage onPick={pickRole} onBack={goHome} />}
      {view === 'auth' && <AuthPage role={chosenRole} onDone={onAuthed} onBack={() => setView('role')} onPrivacy={() => setView('privacy')} />}
      {view === 'privacy' && <PrivacyNotice onBack={() => setView(session ? 'dashboard' : 'landing')} />}
      {view === 'dashboard' && session && <Dashboard session={session} onSignOut={doSignOut} />}
      <footer className="foot">
        <div className="foot-top"><div className="foot-lockup"><img src="/lagos-seal.png" alt="Lagos State" /><img className="foot-mccti" src="/mccti-logo.png" alt="MCCTI" /><div className="foot-lockup-text"><span className="lh-gov">Lagos State Government</span><span className="lh-min">Ministry of Commerce, Cooperatives, Trade &amp; Investment</span></div></div>{!session && <button className="btn btn-gold" onClick={enter}>Enter platform</button>}</div>
        <div className="foot-grid"><p>A Ministry-owned digital platform for the cooperative economy of Lagos State.</p><p className="foot-conf">&copy; Ministry of Commerce, Cooperatives, Trade &amp; Investment, Lagos State Government. <button className="link-inline" onClick={() => setView('privacy')}>Privacy notice</button></p></div>
      </footer>
      <ConsentBanner onOpenPrivacy={() => setView('privacy')} />
    </div>
  )
}

const CSS = `
:root{--ink:#F5F7F3;--ink-2:#FFFFFF;--green:#1C8A4F;--green-panel:#EAF3EC;--line:rgba(20,50,35,.13);--line-soft:rgba(20,50,35,.07);--gold:#B0842F;--gold-soft:#C29A52;--cream:#17241C;--cream-ink:#17241C;--sage:#48524B;--sage-dim:#78837C;--err:#C0533A;--serif:'Lora',Georgia,'Times New Roman',serif;--sans:'Inter',system-ui,-apple-system,sans-serif;--mono:'IBM Plex Mono',ui-monospace,monospace}
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
.leader-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:36px}
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
.viewas-banner{display:flex;align-items:center;justify-content:space-between;gap:16px;background:rgba(90,140,200,.1);border:1px solid rgba(90,140,200,.3);color:#C7DBF0;border-radius:6px;padding:12px 18px;margin-bottom:22px;font-size:14px}
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
.kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
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
@media(max-width:680px){.letterhead{padding:9px 18px;gap:12px}.lh-min{display:none}.lh-seal{height:34px}.lh-mccti{height:32px}.nav{padding:13px 18px}.nav-links{display:none}.hero{padding:40px 18px 30px}section.lens,section.modules,section.arc,section.personas,section.quote,section.leaders,section.about{padding:56px 18px}.band{padding:22px 18px;gap:18px 26px}.mod-grid,.persona-grid,.leader-grid{grid-template-columns:1fr}.lens-figs{gap:26px}.flow{padding:40px 18px 70px}.role-page-grid{grid-template-columns:1fr}.dash{padding:36px 18px 70px}.dash-hero{flex-wrap:wrap}.foot-top,.foot-grid{padding-left:18px;padding-right:18px}.acct-name{display:none}.form-grid{grid-template-columns:1fr}.detail-grid{grid-template-columns:1fr}.consent{padding:14px 18px}}
@media(prefers-reduced-motion:reduce){*{animation:none !important;transition:none !important}.underline::after{transform:scaleX(1)}}
`
