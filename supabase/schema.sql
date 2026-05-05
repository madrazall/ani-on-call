-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on sign up
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

-- Credits
create table public.credits (
  user_id uuid references public.profiles on delete cascade primary key,
  balance integer not null default 0,
  updated_at timestamptz default now() not null
);

alter table public.credits enable row level security;

create policy "Users can view own credits"
  on public.credits for select
  using (auth.uid() = user_id);

-- Auto-create credits row on profile creation
create or replace function public.handle_new_profile()
returns trigger as $$
begin
  insert into public.credits (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_profile();

-- Credit transactions
create table public.credit_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  amount integer not null,
  reason text not null,
  stripe_session_id text,
  created_at timestamptz default now() not null
);

alter table public.credit_transactions enable row level security;

create policy "Users can view own transactions"
  on public.credit_transactions for select
  using (auth.uid() = user_id);

-- Index for common lookups
create index credit_transactions_user_id_idx on public.credit_transactions (user_id);
create index credit_transactions_stripe_session_id_idx on public.credit_transactions (stripe_session_id);

-- RPC: atomically increment a user's credit balance
create or replace function public.increment_credits(p_user_id uuid, p_amount integer)
returns void as $$
begin
  update public.credits
  set balance = balance + p_amount,
      updated_at = now()
  where user_id = p_user_id;
end;
$$ language plpgsql security definer;
