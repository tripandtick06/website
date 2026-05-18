-- Email dead-letter queue (Brevo failed-send persistence).
-- Sessiyon-7 retry/DLQ: 3x retry exhausted veya permanent 4xx -> insert.
-- Re-drive flow: ops-tool reads pending rows, retries via sendBrevoEmail,
-- marks resolved_at when redelivered.

create table if not exists public.email_dead_letter (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz,
  to_email     text not null,
  subject      text not null,
  tags         text[] not null default '{}',
  last_status  int,
  last_error   text not null,
  payload      jsonb not null,
  retry_count  int not null default 0
);

create index if not exists email_dead_letter_pending_idx
  on public.email_dead_letter (created_at)
  where resolved_at is null;

create index if not exists email_dead_letter_to_email_idx
  on public.email_dead_letter (to_email);

alter table public.email_dead_letter enable row level security;

-- Only service-role writes/reads (anon/authenticated have no policy = no access).
-- Service role bypasses RLS entirely; explicit deny for anon for defense-in-depth:
create policy "email_dead_letter no public access"
  on public.email_dead_letter
  for all
  to anon, authenticated
  using (false)
  with check (false);
