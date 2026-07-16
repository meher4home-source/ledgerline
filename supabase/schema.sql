-- LedgerLine database schema
-- Run this entire file once in your Supabase project's SQL Editor (Supabase Dashboard -> SQL Editor -> New query)

-- 1. Advisor profiles (one row per signed-up advisor, linked to Supabase auth)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  firm_name text not null default 'My Firm',
  email text not null,
  subscription_status text not null default 'trial', -- trial | active | past_due | canceled
  dodo_customer_id text,
  dodo_subscription_id text,
  trial_ends_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

-- 2. Clients belonging to an advisor
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  email text,
  notes text,
  created_at timestamptz not null default now()
);

-- 3. Stock / fund holdings for a client
create table if not exists stock_holdings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  ticker text not null,
  shares numeric not null default 0,
  avg_cost numeric not null default 0,
  created_at timestamptz not null default now()
);

-- 4. Real estate holdings for a client
create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  address text not null,
  purchase_price numeric not null default 0,
  current_value numeric not null default 0,
  down_payment numeric not null default 0,
  loan_balance numeric not null default 0,
  interest_rate numeric not null default 0,
  loan_term_years numeric not null default 30,
  monthly_rent numeric not null default 0,
  monthly_expenses numeric not null default 0,
  created_at timestamptz not null default now()
);

-- 5. Non-mortgage debts for a client (credit cards, personal loans, business loans, etc.)
create table if not exists debts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  lender text,
  balance numeric not null default 0,
  interest_rate numeric not null default 0,
  monthly_payment numeric not null default 0,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security everywhere
alter table profiles enable row level security;
alter table clients enable row level security;
alter table stock_holdings enable row level security;
alter table properties enable row level security;
alter table debts enable row level security;

-- Profiles: an advisor can only see / edit their own profile row
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

-- Clients: an advisor can only see / edit their own clients
create policy "clients_select_own" on clients for select using (auth.uid() = advisor_id);
create policy "clients_insert_own" on clients for insert with check (auth.uid() = advisor_id);
create policy "clients_update_own" on clients for update using (auth.uid() = advisor_id);
create policy "clients_delete_own" on clients for delete using (auth.uid() = advisor_id);

-- Stock holdings: only reachable through a client the advisor owns
create policy "stocks_select_own" on stock_holdings for select
  using (exists (select 1 from clients c where c.id = client_id and c.advisor_id = auth.uid()));
create policy "stocks_insert_own" on stock_holdings for insert
  with check (exists (select 1 from clients c where c.id = client_id and c.advisor_id = auth.uid()));
create policy "stocks_update_own" on stock_holdings for update
  using (exists (select 1 from clients c where c.id = client_id and c.advisor_id = auth.uid()));
create policy "stocks_delete_own" on stock_holdings for delete
  using (exists (select 1 from clients c where c.id = client_id and c.advisor_id = auth.uid()));

-- Properties: same pattern
create policy "properties_select_own" on properties for select
  using (exists (select 1 from clients c where c.id = client_id and c.advisor_id = auth.uid()));
create policy "properties_insert_own" on properties for insert
  with check (exists (select 1 from clients c where c.id = client_id and c.advisor_id = auth.uid()));
create policy "properties_update_own" on properties for update
  using (exists (select 1 from clients c where c.id = client_id and c.advisor_id = auth.uid()));
create policy "properties_delete_own" on properties for delete
  using (exists (select 1 from clients c where c.id = client_id and c.advisor_id = auth.uid()));

-- Debts: same pattern
create policy "debts_select_own" on debts for select
  using (exists (select 1 from clients c where c.id = client_id and c.advisor_id = auth.uid()));
create policy "debts_insert_own" on debts for insert
  with check (exists (select 1 from clients c where c.id = client_id and c.advisor_id = auth.uid()));
create policy "debts_update_own" on debts for update
  using (exists (select 1 from clients c where c.id = client_id and c.advisor_id = auth.uid()));
create policy "debts_delete_own" on debts for delete
  using (exists (select 1 from clients c where c.id = client_id and c.advisor_id = auth.uid()));

-- Auto-create a profile row whenever someone signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
