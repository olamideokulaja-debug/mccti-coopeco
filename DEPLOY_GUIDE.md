# MCCTI CoopEco - Deploy Guide (Stage 1)

This is the landing and brand stage of MCCTI CoopEco, built as a real, deployable
Vite + React project. You do not need to code. Follow one step at a time.

## What you have
A complete website project. It shows the platform positioning, a live cooperative
register teaser, an area-office lens, the six modules, the fragmentation-to-₦1-billion
arc, and a role picker ("Which best describes you?"). Sign-in and the modules
themselves arrive in later stages.

## Run it on your own computer (optional)
1. Install Node.js (version 18 or newer) from nodejs.org.
2. Open a terminal in this folder.
3. Type `npm install` and press enter. Wait for it to finish.
4. Type `npm run dev` and press enter. Open the link it shows (usually
   http://localhost:5173).

## Put it online with GitHub and Vercel

### Step 1 - Create a GitHub repository
1. Go to github.com and sign in (create a free account if needed).
2. Click the "+" at the top right, then "New repository".
3. Name it `mccti-coopeco`. Leave it public or private. Click "Create repository".

### Step 2 - Upload this project
1. On the new repository page, click "uploading an existing file".
2. Drag every file and folder from this project into the browser window.
   Do not upload the `node_modules` folder or the `dist` folder if they exist.
3. Click "Commit changes".

### Step 3 - Deploy with Vercel
1. Go to vercel.com and sign in with your GitHub account.
2. Click "Add New" then "Project".
3. Find `mccti-coopeco` in the list and click "Import".
4. Leave every setting as it is (Vercel detects Vite automatically).
5. Click "Deploy". Wait about a minute.
6. Vercel gives you a live web address. That is your site.

### Step 4 - Update later
Whenever a new stage is ready, upload the changed files to the same GitHub
repository. Vercel redeploys automatically within a minute.

## Environment variables
None are needed for Stage 1. Later stages will add keys for Supabase (accounts),
Paystack and Flutterwave (payments), a KYC provider, and the AI proxy. When that
happens you will add them in Vercel under Settings, then Environment Variables,
and each will be flagged for you clearly.

## Branding assets
The Lagos State coat of arms and the MCCTI logo live in the `public` folder
(`lagos-seal.png`, `mccti-logo.png`, and a faint `seal-watermark.png`). They appear
in the letterhead, the live register, the quote and the footer. To swap either mark,
replace the file in `public` with the same name and re-upload. The display face is Lora.

## Notes
- British English throughout. Currency shown as ₦.
- All figures on the landing page are illustrative pending live data.
- The SPV revenue split shown (Lagos State 50%, Asset Matrix MFB 15%,
  Imade / Catridge 15%, QooP 10%, SEKAT 10%) is stated as subject to final
  agreement. It is a display value only and changes in one place when confirmed.
- Compliance items (KYC and NDPR data privacy, CAP15 Lagos Cooperative Law,
  LASMECO terms, escrow handling, audit-trail integrity) are noted through the
  build as they arise. This is not legal advice.
