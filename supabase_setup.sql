-- ============================================================================
-- MCCTI CoopEco - COMPLETE Supabase setup (run this ONE file, top to bottom)
-- ============================================================================
-- This creates the data table and applies every access policy for Stages 2-5.
-- Run it once in the Supabase SQL editor (open a New query, paste, click Run).
-- It replaces the need to run supabase_stage3/4/5.sql separately.
-- Re-running it is safe: it drops and recreates the policies each time, and
-- "create table if not exists" leaves existing data untouched.
-- ============================================================================

-- 1) The data table -----------------------------------------------------------
create table if not exists kv (
  key text primary key,
  value jsonb,
  user_id uuid references auth.users(id),
  updated_at timestamptz default now()
);

alter table kv enable row level security;

-- 2) Private rows: each person's own profile (profile:<uid>) ------------------
drop policy if exists "own rows read"   on kv;
drop policy if exists "own rows write"  on kv;
drop policy if exists "own rows update" on kv;

create policy "own rows read"   on kv for select using (auth.uid() = user_id);
create policy "own rows write"  on kv for insert with check (auth.uid() = user_id);
create policy "own rows update" on kv for update using (auth.uid() = user_id);

-- 3) Shared registry and audit (coop:, audit:) --------------------------------
drop policy if exists "registry read"   on kv;
drop policy if exists "registry write"  on kv;
drop policy if exists "registry update" on kv;

create policy "registry read"   on kv for select to authenticated
  using (key like 'coop:%' or key like 'audit:%');
create policy "registry write"  on kv for insert to authenticated
  with check (key like 'coop:%' or key like 'audit:%');
create policy "registry update" on kv for update to authenticated
  using (key like 'coop:%');

-- 4) Member analytics and integrations (member:, integration:) ----------------
drop policy if exists "members read"   on kv;
drop policy if exists "members write"  on kv;
drop policy if exists "members update" on kv;
drop policy if exists "members delete" on kv;

create policy "members read"   on kv for select to authenticated
  using (key like 'member:%' or key like 'integration:%' or key like 'accelerator:%');
create policy "members write"  on kv for insert to authenticated
  with check (key like 'member:%' or key like 'integration:%' or key like 'accelerator:%');
create policy "members update" on kv for update to authenticated
  using (key like 'member:%' or key like 'integration:%' or key like 'accelerator:%');
create policy "members delete" on kv for delete to authenticated
  using (key like 'member:%' and user_id = auth.uid());

-- 5) LASMECO loans and the escrow (loan:, escrow:) ----------------------------
drop policy if exists "loans read"   on kv;
drop policy if exists "loans write"  on kv;
drop policy if exists "loans update" on kv;

create policy "loans read"   on kv for select to authenticated
  using (key like 'loan:%' or key like 'escrow:%' or key like 'wallet:%' or key like 'ticket:%' or key like 'notif:%' or key like 'doc:%');
create policy "loans write"  on kv for insert to authenticated
  with check (key like 'loan:%' or key like 'escrow:%' or key like 'wallet:%' or key like 'ticket:%' or key like 'notif:%' or key like 'doc:%');
create policy "loans update" on kv for update to authenticated
  using (key like 'loan:%' or key like 'escrow:%' or key like 'wallet:%' or key like 'ticket:%' or key like 'notif:%' or key like 'doc:%');

-- Done. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel, redeploy,
-- and the app will use this database instead of demo mode.

-- ============================================================
-- Document storage (Supabase Storage) for cooperative uploads
-- ============================================================
insert into storage.buckets (id, name, public)
values ('coop-docs', 'coop-docs', true)
on conflict (id) do nothing;

drop policy if exists "coop_docs_read" on storage.objects;
create policy "coop_docs_read" on storage.objects
  for select using (bucket_id = 'coop-docs');

drop policy if exists "coop_docs_insert" on storage.objects;
create policy "coop_docs_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'coop-docs');

drop policy if exists "coop_docs_delete" on storage.objects;
create policy "coop_docs_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'coop-docs');
