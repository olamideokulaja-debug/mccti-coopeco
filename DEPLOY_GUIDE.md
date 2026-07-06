# MCCTI CoopEco - Deploy Guide (Stages 1 to 3)

A real, deployable Vite + React project. You do not need to code. Follow one
step at a time.

## What you have now
- Stage 1: the landing and brand, with the Lagos State and MCCTI marks and Lora.
- Stage 2: accounts and the entry flow. "Which best describes you?" role page,
  sign-in and account creation, role saved per account, per-official identity by
  email, and a role-aware dashboard. It runs in demo mode until you add the two
  Supabase keys, so you can try it immediately.
- Stage 3: the Cooperative Registry and Governance module. Societies register and
  get a tracking ID; officers examine, approve or return with sign-off; societies
  file annual returns; auditors examine and sign off; every action is written to a
  timestamped audit trail; officers and leadership see area-office oversight.
  In demo mode a few sample societies are seeded so the officer queue is not empty.
  It also connects to SEKAT one way: once linked, all society, profile and audit
  data flows from SEKAT into MCCTI as read-only mirrors, marked with a SEKAT badge.

## Run it on your own computer (optional)
1. Install Node.js (version 18 or newer) from nodejs.org.
2. Open a terminal in this folder.
3. Type `npm install` and press enter.
4. Type `npm run dev` and press enter, then open the link shown.

## Put it online with GitHub and Vercel

### Step 1 - Create a GitHub repository
1. Go to github.com and sign in. Click "+" then "New repository".
2. Name it `mccti-coopeco`. Click "Create repository".

### Step 2 - Upload this project
1. Click "uploading an existing file".
2. Drag in every file and folder except `node_modules` and `dist`.
3. Click "Commit changes".

### Step 3 - Deploy with Vercel
1. Go to vercel.com and sign in with GitHub.
2. "Add New" then "Project". Import `mccti-coopeco`.
3. Leave the settings as they are. Click "Deploy".
4. Vercel gives you a live web address.

### Step 4 - Update later
Upload changed files to the same repository. Vercel redeploys automatically.

## Turn on real accounts (Supabase)
Until you do this, the site works in demo mode and accounts are saved only in the
visitor's own browser. To store real accounts:

1. Go to supabase.com, create a free account, then create a new project.
2. In the project, open Settings, then API. Copy the "Project URL" and the
   "anon public" key.
3. Create the data table. In Supabase open the SQL editor, paste the block below,
   and click Run:

   create table if not exists kv (
     key text primary key,
     value jsonb,
     user_id uuid references auth.users(id),
     updated_at timestamptz default now()
   );
   alter table kv enable row level security;
   create policy "own rows read"  on kv for select using (auth.uid() = user_id);
   create policy "own rows write" on kv for insert with check (auth.uid() = user_id);
   create policy "own rows update" on kv for update using (auth.uid() = user_id);

4. Add the keys to Vercel. Open your project on vercel.com, then Settings, then
   Environment Variables, and add:
   - VITE_SUPABASE_URL = your Project URL
   - VITE_SUPABASE_ANON_KEY = your anon public key
5. Redeploy. The demo-mode notice disappears once the keys are present.

## Turn on the shared registry (Stage 3, live mode only)
The registry lets officers and auditors review societies filed by other people, so
those rows must be shared while each person's profile stays private. After the kv
table exists, open the Supabase SQL editor, open a New query, paste the contents of
the file `supabase_stage3.sql` included in this project, and click Run. You only do
this once. In demo mode nothing is needed; it already works in your browser.

Security note, flagged for human oversight: at this stage approval controls are
enforced in the interface (a society cannot see the approve button; only officers
can). Server-side role enforcement through the AI proxy and a service role is
scheduled for a later stage before real data goes live. This is a compliance item,
not legal advice.

Tip: for quick testing without email links, in Supabase under Authentication,
Providers, Email, you can turn off "Confirm email". Leave it on for production.

## SEKAT integration (one-way)
SEKAT is the source of the legacy cooperative registry and audit records. In
MCCTI CoopEco data flows in one direction only, SEKAT into MCCTI. Ingested
societies appear alongside native ones, carry a SEKAT badge, and are read-only
here (registration and audit changes are made in SEKAT and flow in on the next
sync). Each SEKAT society brings its full dataset: registration and Reg. No.,
custodian and trustees, bank information, and the audit inputs (income and
expenses, balance sheet, disposal of surplus, trial balance, personal ledger
balances, comparative analysis, additional information) with examination,
approval and signature.

Until SEKAT provides live access, the platform ingests a representative sample so
you can see the flow. To connect the live source, set SEKAT_API_URL and
SEKAT_API_KEY (in .env.local for local use, and in Vercel for the live site). The
ingestion endpoint is `api/sekat-sync.js`; it never writes back to SEKAT. Officers
and leadership can trigger a sync from the SEKAT sync panel in their dashboard.

Compliance, flagged for human oversight: the data-flow direction, retention, and
NDPR handling should be governed by the SEKAT integration and data-sharing
agreement before live data is ingested. This is not legal advice.

## Environment variables
See `.env.example`. For local testing copy it to `.env.local` and fill it in.
- VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY - accounts and data (Stage 2).
- ANTHROPIC_API_KEY - server-side AI proxy, used from Stage 3. Never shown to
  the browser.

## Per-official identity
The dashboard greets each person by name, title and office. Known officials are
matched by their sign-in email in the OFFICIALS list near the top of
`src/App.jsx`. Edit that list, or add real emails, to personalise each account.
Anyone not listed gets a sensible name from their email and their chosen role.

## Branding assets
The Lagos State coat of arms and the MCCTI logo live in the `public` folder
(lagos-seal.png, mccti-logo.png, seal-watermark.png). Replace a file with the
same name to swap a mark. The display face is Lora.

## Notes
- British English throughout. Currency shown as the naira symbol.
- All figures on the landing page are illustrative pending live data.
- SPV revenue split shown (Lagos State 50%, Asset Matrix MFB 15%, Imade / Catridge
  15%, QooP 10%, SEKAT 10%) is a display value, subject to final agreement.
- Compliance items (KYC and NDPR data privacy, CAP15 Lagos Cooperative Law,
  LASMECO terms, escrow handling, audit-trail integrity) are flagged as they
  arise. This is not legal advice.
