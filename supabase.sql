create extension if not exists pgcrypto;

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  email text not null,
  full_name text not null,
  course text not null,
  batch text not null,
  college_name text not null,
  mail_id text not null,
  score integer not null,
  total_correct integer not null,
  total_incorrect integer not null,
  unattempted integer not null,
  raw_responses jsonb not null,
  disqualified boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.submissions
  add column if not exists full_name text,
  add column if not exists course text,
  add column if not exists batch text,
  add column if not exists college_name text,
  add column if not exists mail_id text;

alter table public.submissions enable row level security;

create policy "Allow anonymous inserts"
  on public.submissions
  for insert
  to anon
  with check (true);
