-- Reports table
create table public.reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  outcome_ids text[] not null,
  vendor text not null default 'unknown',
  status text not null default 'pending' check (status in ('pending', 'running', 'complete', 'failed')),
  column_map jsonb,
  result_json jsonb,
  credits_used integer not null,
  refund_requested boolean not null default false,
  created_at timestamptz default now() not null
);

alter table public.reports enable row level security;

create policy "Users can view own reports"
  on public.reports for select
  using (auth.uid() = user_id);

create index reports_user_id_idx on public.reports (user_id);

-- RPC: atomically deduct credits, returns false if balance insufficient
create or replace function public.deduct_credits(p_user_id uuid, p_amount integer)
returns boolean as $$
declare
  v_balance integer;
begin
  select balance into v_balance
  from public.credits
  where user_id = p_user_id
  for update;

  if v_balance is null or v_balance < p_amount then
    return false;
  end if;

  update public.credits
  set balance = balance - p_amount,
      updated_at = now()
  where user_id = p_user_id;

  return true;
end;
$$ language plpgsql security definer;
