// ─────────────────────────────────────────────
//  db.js  —  Supabase client + data helpers
//
//  HOW TO SET UP:
//  1. Go to https://supabase.com → New Project
//  2. In SQL Editor, run supabase-schema.sql from this project
//  3. Replace SUPABASE_URL and SUPABASE_ANON_KEY
// ─────────────────────────────────────────────
//
//  SQL SCHEMA (run this in Supabase SQL Editor):
//  ─────────────────────────────────────────────
//  The full database schema lives in supabase-schema.sql.
//
//  create table profiles (
//    id uuid references auth.users primary key,
//    weight_kg numeric,
//    height_cm numeric,
//    age integer,
//    sex text,
//    activity_factor numeric,
//    goal text,
//    cal_target integer,
//    pro_target integer,
//    car_target integer,
//    fat_target integer,
//    updated_at timestamptz default now()
//  );
//
//  create table food_logs (
//    id bigint generated always as identity primary key,
//    user_id uuid references auth.users not null,
//    log_date date not null default current_date,
//    food_id integer not null,
//    food_name text not null,
//    quantity_g numeric not null,
//    cal numeric not null,
//    pro numeric not null,
//    car numeric not null,
//    fat numeric not null,
//    created_at timestamptz default now()
//  );
//
//  -- Enable Row Level Security
//  alter table profiles enable row level security;
//  alter table food_logs enable row level security;
//
//  -- Profiles: each user can only see/edit their own row
//  create policy "own profile" on profiles
//    for all using (auth.uid() = id);
//
//  -- Food logs: each user can only see/edit their own logs
//  create policy "own logs" on food_logs
//    for all using (auth.uid() = user_id);
//
//  -- Auto-create profile on signup (optional trigger)
//  create or replace function handle_new_user()
//  returns trigger as $$
//  begin
//    insert into profiles (id) values (new.id);
//    return new;
//  end;
//  $$ language plpgsql security definer;
//
//  create trigger on_auth_user_created
//    after insert on auth.users
//    for each row execute procedure handle_new_user();
// ─────────────────────────────────────────────

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ← Replace these with your actual Supabase project values
const SUPABASE_URL      = 'https://ytknfjcogprvcyvzjxsg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0a25mamNvZ3BydmN5dnpqeHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMjAwMzAsImV4cCI6MjA5NTY5NjAzMH0.Z7sTD5kgFLWzEYRdJ-7flXeemxiXLDLcOp0wS6xzln8';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Auth ─────────────────────────────────────

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ── Profile ──────────────────────────────────

export async function saveProfile(profile) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    ...profile,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function loadProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data;
}

// ── Food Log ─────────────────────────────────

export async function logFood(entry) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.from('food_logs').insert({
    user_id: user.id,
    log_date: entry.date,
    food_id:  entry.foodId,
    food_name: entry.name,
    quantity_g: entry.qty,
    cal: entry.cal,
    pro: entry.pro,
    car: entry.car,
    fat: entry.fat,
  }).select().single();

  if (error) throw error;
  return data;
}

export async function getLogsForDate(dateStr) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('log_date', dateStr)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function deleteLog(logId) {
  const { error } = await supabase
    .from('food_logs')
    .delete()
    .eq('id', logId);
  if (error) throw error;
}

// ── Weekly Summary (last 7 days) ─────────────

export async function getWeeklySummary() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const fromDate = sevenDaysAgo.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('food_logs')
    .select('log_date, cal, pro, car, fat')
    .eq('user_id', user.id)
    .gte('log_date', fromDate)
    .order('log_date', { ascending: true });

  if (error) throw error;

  // Group by date
  const map = {};
  (data ?? []).forEach(row => {
    if (!map[row.log_date]) map[row.log_date] = { cal: 0, pro: 0, car: 0, fat: 0 };
    map[row.log_date].cal += row.cal;
    map[row.log_date].pro += row.pro;
    map[row.log_date].car += row.car;
    map[row.log_date].fat += row.fat;
  });
  return map;
}
