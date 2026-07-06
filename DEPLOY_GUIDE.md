# MCCTI CoopEco - Deploy Guide (Stages 1 to 5)

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
- Stage 4: the Member and MSME Analytics module (the QooP layer). QooP is treated
  exactly like SEKAT, a one-way source (QooP into MCCTI): members and their MSME
  profiles flow in as read-only mirrors with a QooP badge. Members onboard with
  KYC and MSME details and receive an explainable, advisory credit score. The app
  is GDPR-aligned (consent banner and sign-up consent, a privacy notice, and
  Download my data and Delete my data controls). Leadership can switch across all
  users with a "View as" tool.
- Stage 5: LASMECO Financing and the Accelerator role. A new Accelerator Programme
  login recruits and trains MSMEs and recommends a loan amount. The full pipeline
  runs Applied to In training to Shortlisted (Accelerator), to Cooperative
  validated with the 25% guarantee (officer), then across the three financial
  partners: Sterling Bank does KYC and assessment and applies the 50% guarantee,
  the Bank of Industry grants final approval and funds, and Sterling then disburses
  to the beneficiary. Asset Matrix MFB runs the platform revenue escrow and
  distributes it on the 50/15/15/10/10 formula. Each of the nine roles has its own
  login, and several people can log into each organisation. Members apply from
  their dashboard. Cooperatives now carry a join fee.

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
the file `supabase_stage3.sql` (and then `supabase_stage4.sql` for members and
integrations) included in this project, and click Run. You only do this once. In demo mode nothing is needed; it already works in your browser.

Security note, flagged for human oversight: at this stage approval controls are
enforced in the interface (a society cannot see the approve button; only officers
can). Server-side role enforcement through the AI proxy and a service role is
scheduled for a later stage before real data goes live. This is a compliance item,
not legal advice.

Tip: for quick testing without email links, in Supabase under Authentication,
Providers, Email, you can turn off "Confirm email". Leave it on for production.

## QooP integration (one-way)
QooP is the source for member and MSME analytics and is handled just like SEKAT:
data flows only from QooP into MCCTI. Synced members carry a QooP badge and are
read-only. Officers and leadership can run a sync from the Integrations tab. To
connect the live source, set QOOP_API_URL and QOOP_API_KEY (the endpoint is
`api/qoop-sync.js`, which never writes back). Until then a representative sample
is ingested so you can see the flow.

## Credit scoring and GDPR
Member credit scores are explainable and advisory. A cooperative officer reviews
before a score affects LASMECO eligibility, so it is not a solely automated
decision. The app includes a consent banner, a consent step at sign-up, a privacy
notice (footer and consent banner), and Download my data and Delete my data
controls in the member and society dashboards. Institutional cooperative records
are retained under the Ministry's public task; personal member data is erasable.
This supports GDPR and NDPR principles but is not legal advice; confirm the KYC
provider terms and data-sharing agreements with your team before going live.

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

## The three financial partners (separate logins)
LASMECO involves three distinct organisations, each with its own login. Several
staff can log into each: anyone who signs up and picks that organisation's role
(or is listed in the OFFICIALS map near the top of `src/App.jsx`) gets that
workspace.
- Sterling Bank (role: Sterling Bank). Receives validated applications, runs KYC
  and assessment, applies the 50% guarantee, and disburses to the beneficiary once
  the Bank of Industry has approved.
- Bank of Industry (role: Bank of Industry). Provides the loan; grants final
  approval and funding after Sterling's assessment. It does not disburse.
- Asset Matrix MFB (role: Asset Matrix MFB). Holds the platform revenue escrow.
  All fees accrue here and are distributed on the 50/15/15/10/10 formula (Lagos
  State 50, Asset Matrix 15, Imade/Catridge 15, QooP 10, SEKAT 10). It records
  distributions; live settlement connects through Paystack or Flutterwave.

Example logins already recognised: sterling@lasmeco.ng, boi@lasmeco.ng,
escrow@assetmatrix.ng (any password in demo). You can also just sign up and pick
the role. In live mode each person creates their own account under that role.

## Cooperative fees
Joining the platform carries a one-time cooperative registration fee of 50,000
Naira, shown as an outstanding banner on the society dashboard with a Pay button
(a demo stub until Paystack or Flutterwave is connected). Annual returns filing is
15,000 Naira per year, and CAP15 regulatory processing is 2.5% of surplus. These
figures come from the platform revenue model and can be changed in COOP_FEES near
the top of `src/App.jsx`. Consider waiving or reducing the join fee for societies
in the Ikorodu, Epe, Badagry and Ibeju-Lekki priority corridors to drive inclusion.

For LASMECO, there are no upfront fees to the borrower. On disbursement, a 200,000
Naira Accelerator fee and a 1% BOI appraisal fee are deducted, and the borrower
provides 10% cash collateral; the guarantee stack is 25% cooperative and 50%
Sterling, at 9% fixed. The app shows the full breakdown at approval and disbursement.

## Turn on the LASMECO pipeline (Stage 5, live mode only)
After the Stage 3 and Stage 4 policies, run `supabase_stage5.sql` once in the SQL
editor so the Accelerator, officer, financial partner and leadership can all see
and act on the same loan pipeline. Not needed in demo mode.

Payments: when you are ready to take real fee payments, add PAYSTACK_SECRET_KEY or
FLUTTERWAVE_SECRET_KEY and we will wire the Pay buttons to live checkout.

## Look and Leadership analytics
The interface uses a neutral charcoal base with green and gold as accents, rather
than a dominant green. To adjust the palette, edit the CSS variables in the :root
block near the top of the styles in `src/App.jsx` (for example --green is the
accent, --gold the secondary accent, --ink and --ink-2 the surfaces).

The Leadership / Admin dashboard opens on an Overview of live analytics across the
whole platform: KPI tiles (societies, members profiled, LASMECO disbursed, escrow
accrued), donut charts for registration status, CAP15 compliance, registry source
and KYC, bar charts for area offices, member credit bands, the LASMECO pipeline,
applications by sector and the escrow distribution, and a six-month registrations
trend. These update automatically from the registry, members, loans and escrow.

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
