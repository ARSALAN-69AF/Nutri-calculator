-- NutriTrack Supabase schema
--
-- Run this in Supabase SQL Editor when setting up the app or when signup fails
-- with "Database error saving new user".

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  weight_kg numeric,
  height_cm numeric,
  age integer,
  sex text,
  activity_factor numeric,
  goal text,
  cal_target integer,
  pro_target integer,
  car_target integer,
  fat_target integer,
  updated_at timestamptz default now()
);

create table if not exists public.food_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  food_id integer not null,
  food_name text not null,
  quantity_g numeric not null,
  cal numeric not null,
  pro numeric not null,
  car numeric not null,
  fat numeric not null,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.food_logs enable row level security;

drop policy if exists "own profile" on public.profiles;
drop policy if exists "own profile select" on public.profiles;
drop policy if exists "own profile insert" on public.profiles;
drop policy if exists "own profile update" on public.profiles;
drop policy if exists "own profile delete" on public.profiles;

create policy "own profile select"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "own profile insert"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "own profile update"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "own profile delete"
  on public.profiles for delete
  to authenticated
  using (auth.uid() = id);

drop policy if exists "own logs" on public.food_logs;
drop policy if exists "own logs select" on public.food_logs;
drop policy if exists "own logs insert" on public.food_logs;
drop policy if exists "own logs update" on public.food_logs;
drop policy if exists "own logs delete" on public.food_logs;

create policy "own logs select"
  on public.food_logs for select
  to authenticated
  using (auth.uid() = user_id);

create policy "own logs insert"
  on public.food_logs for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "own logs update"
  on public.food_logs for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own logs delete"
  on public.food_logs for delete
  to authenticated
  using (auth.uid() = user_id);

grant usage on schema public to anon, authenticated;
grant all on table public.profiles to authenticated;
grant all on table public.food_logs to authenticated;

do $$
begin
  if to_regclass('public.food_logs_id_seq') is not null then
    grant usage, select on sequence public.food_logs_id_seq to authenticated;
  end if;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
