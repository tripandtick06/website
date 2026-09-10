-- Leads: iletisim / otel / B2B form gonderimlerinin kalici kaydi.
-- Bildirim kanallari (Telegram, Brevo) dussede lead kaybolmasin.
-- Yazan: src/lib/leads.ts (service-role, PostgREST). Okuyan: admin panel (ileride).

create table if not exists public.leads (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  source       text not null check (source in ('contact', 'hotel', 'b2b', 'booking')),
  ref          text not null,
  name         text not null,
  email        text not null,
  phone        text,
  payload      jsonb not null default '{}'::jsonb,
  telegram_ok  boolean not null default false,
  email_ok     boolean not null default false,
  handled_at   timestamptz,
  handled_by   text
);

create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists leads_open_idx on public.leads (created_at desc) where handled_at is null;
create index if not exists leads_email_idx on public.leads (email);

alter table public.leads enable row level security;

create policy "leads no public access"
  on public.leads
  for all
  to anon, authenticated
  using (false)
  with check (false);
