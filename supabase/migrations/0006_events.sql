-- Birinci-taraf davranış ölçümü (2026-09-18).
-- Cookie YOK, kişisel veri YOK: oturum kimliği sessionStorage'da rastgele, ziyaretçi
-- hash'i sunucuda günlük tuzlu sha256(ip|ua|gün) — IP/UA saklanmaz, ertesi gün eşleşmez.
-- Yazan: src/app/api/event/route.ts (service-role, PostgREST batch insert).
-- Okuyan: src/app/api/admin/analytics/route.ts → analytics_summary(p_days) RPC.
-- Neden: sitede hiçbir davranış ölçümü yoktu (GA prod'da yok, CF Web Analytics Lite
-- 10'luk örneklem). Giriş/çıkış sayfası, funnel, WhatsApp/rezervasyon tıklaması burada.

create table if not exists public.events (
  id         bigint generated always as identity primary key,
  ts         timestamptz not null default now(),
  sid        text not null,                 -- oturum (sessionStorage, 30 dk idle → yeni)
  seq        int  not null default 1,       -- oturum içi sıra (1 = giriş sayfası)
  vhash      text,                          -- günlük dönen ziyaretçi hash'i (IP saklanmaz)
  name       text not null check (name in (
               'page_view','page_exit','click','booking_step','search','form_submit','error')),
  path       text not null,
  locale     text,
  ref_host   text,                          -- yalnız oturumun ilk page_view'ında dolu
  country    text,                          -- cf-ipcountry
  device     text,                          -- mobile | tablet | desktop
  product    text,                          -- detay sayfasındaki ürün slug'ı (varsa)
  props      jsonb not null default '{}'::jsonb
);

create index if not exists events_ts_idx      on public.events (ts desc);
create index if not exists events_sid_ts_idx  on public.events (sid, ts);
create index if not exists events_name_ts_idx on public.events (name, ts desc);
create index if not exists events_path_idx    on public.events (path);

alter table public.events enable row level security;

create policy "events no public access"
  on public.events
  for all
  to anon, authenticated
  using (false)
  with check (false);

-- 90 günden eski satırları temizle (admin API her çağrıda opportunistik çağırır).
create or replace function public.analytics_prune(p_keep_days int default 90)
returns int
language sql
security definer
set search_path = public
as $$
  with d as (
    delete from public.events where ts < now() - make_interval(days => p_keep_days) returning 1
  )
  select count(*)::int from d;
$$;

-- Özet: giriş/çıkış sayfaları, funnel, sayfa süreleri, ürünler, kaynaklar.
create or replace function public.analytics_summary(p_days int default 7)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
with ev as (
  select * from public.events
  where ts >= now() - make_interval(days => greatest(1, least(p_days, 90)))
),
pv as (select * from ev where name = 'page_view'),
sess as (
  select
    p.sid,
    min(p.ts)                                    as started,
    max(p.ts)                                    as ended,
    count(*)                                     as pvs,
    (array_agg(p.path  order by p.seq, p.ts))[1] as entry_path,
    (array_agg(p.path  order by p.seq desc, p.ts desc))[1] as exit_path,
    max(p.locale)                                as locale,
    max(p.country)                               as country,
    max(p.device)                                as device,
    max(p.ref_host)                              as ref_host,
    bool_or(p.product is not null)               as saw_product,
    bool_or(p.path like '%/rezervasyon/%')       as saw_booking
  from pv p
  group by p.sid
),
flags as (
  select
    e.sid,
    bool_or(e.name = 'click' and e.props->>'kind' = 'whatsapp') as wa,
    bool_or(e.name = 'click' and e.props->>'kind' = 'reserve')  as reserve,
    bool_or(e.name = 'click' and e.props->>'kind' = 'tel')      as tel,
    bool_or(e.name = 'booking_step' and (e.props->>'step')::int >= 3) as booking_deep,
    bool_or(e.name = 'booking_step' and (e.props->>'step')::int >= 6) as booking_done,
    bool_or(e.name = 'form_submit')                             as form_submit,
    bool_or(e.name = 'search')                                  as searched
  from ev e
  group by e.sid
),
s as (
  select sess.*, coalesce(f.wa,false) wa, coalesce(f.reserve,false) reserve, coalesce(f.tel,false) tel,
         coalesce(f.booking_deep,false) booking_deep, coalesce(f.booking_done,false) booking_done,
         coalesce(f.form_submit,false) form_submit, coalesce(f.searched,false) searched
  from sess left join flags f using (sid)
),
exits as (
  select x.sid, x.path, (x.props->>'seconds')::numeric as seconds, (x.props->>'scroll')::numeric as scroll
  from ev x where x.name = 'page_exit'
),
totals as (
  select jsonb_build_object(
    'sessions',        count(*),
    'pageviews',       coalesce(sum(pvs),0),
    'bounce_rate',     round(100.0 * count(*) filter (where pvs = 1) / nullif(count(*),0), 1),
    'avg_pageviews',   round(avg(pvs), 2),
    'whatsapp_sessions', count(*) filter (where wa),
    'reserve_sessions',  count(*) filter (where reserve),
    'tel_sessions',      count(*) filter (where tel),
    'booking_page_sessions', count(*) filter (where saw_booking),
    'booking_deep_sessions', count(*) filter (where booking_deep),
    'booking_done_sessions', count(*) filter (where booking_done),
    'form_sessions',     count(*) filter (where form_submit),
    'avg_session_seconds', round(avg(extract(epoch from (ended - started))), 0)
  ) from s
),
daily as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'date', d, 'sessions', n, 'pageviews', pvs, 'whatsapp', wa) order by d), '[]'::jsonb)
  from (
    select (started at time zone 'Europe/Istanbul')::date d, count(*) n, sum(pvs) pvs, count(*) filter (where wa) wa
    from s group by 1
  ) t
),
entry as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'path', entry_path, 'sessions', n, 'bounce_rate', br, 'whatsapp', wa, 'reserve', rs) order by n desc), '[]'::jsonb)
  from (
    select entry_path, count(*) n,
           round(100.0 * count(*) filter (where pvs = 1) / count(*), 1) br,
           count(*) filter (where wa) wa, count(*) filter (where reserve) rs
    from s group by entry_path order by n desc limit 30
  ) t
),
exit_pages as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'path', exit_path, 'exits', n, 'share', round(100.0 * n / nullif((select count(*) from s),0), 1)) order by n desc), '[]'::jsonb)
  from (select exit_path, count(*) n from s group by exit_path order by n desc limit 30) t
),
pages as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'path', path, 'pageviews', pvn, 'avg_seconds', secs, 'avg_scroll', scr, 'whatsapp', wa, 'reserve', rs) order by pvn desc), '[]'::jsonb)
  from (
    select p.path,
           count(*) pvn,
           (select round(avg(seconds),0) from exits x where x.path = p.path) secs,
           (select round(avg(scroll),0)  from exits x where x.path = p.path) scr,
           (select count(*) from ev c where c.name='click' and c.props->>'kind'='whatsapp' and c.path = p.path) wa,
           (select count(*) from ev c where c.name='click' and c.props->>'kind'='reserve'  and c.path = p.path) rs
    from pv p group by p.path order by pvn desc limit 40
  ) t
),
products as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'product', product, 'views', v, 'whatsapp', wa, 'reserve', rs, 'booking_deep', bd) order by v desc), '[]'::jsonb)
  from (
    select e.product,
           count(*) filter (where e.name = 'page_view') v,
           count(distinct e.sid) filter (where e.name='click' and e.props->>'kind'='whatsapp') wa,
           count(distinct e.sid) filter (where e.name='click' and e.props->>'kind'='reserve') rs,
           count(distinct e.sid) filter (where e.name='booking_step' and (e.props->>'step')::int >= 3) bd
    from ev e where e.product is not null group by e.product order by v desc limit 40
  ) t
),
dims as (
  select jsonb_build_object(
    'locale',  (select coalesce(jsonb_agg(jsonb_build_object('key', coalesce(locale,'?'), 'sessions', n, 'whatsapp', wa) order by n desc),'[]'::jsonb)
                from (select locale, count(*) n, count(*) filter (where wa) wa from s group by locale order by n desc limit 20) x),
    'country', (select coalesce(jsonb_agg(jsonb_build_object('key', coalesce(country,'?'), 'sessions', n, 'whatsapp', wa) order by n desc),'[]'::jsonb)
                from (select country, count(*) n, count(*) filter (where wa) wa from s group by country order by n desc limit 20) x),
    'device',  (select coalesce(jsonb_agg(jsonb_build_object('key', coalesce(device,'?'), 'sessions', n, 'whatsapp', wa) order by n desc),'[]'::jsonb)
                from (select device, count(*) n, count(*) filter (where wa) wa from s group by device order by n desc) x),
    'referrer',(select coalesce(jsonb_agg(jsonb_build_object('key', coalesce(ref_host,'(direct)'), 'sessions', n, 'whatsapp', wa) order by n desc),'[]'::jsonb)
                from (select ref_host, count(*) n, count(*) filter (where wa) wa from s group by ref_host order by n desc limit 20) x)
  )
),
searches as (
  select coalesce(jsonb_agg(jsonb_build_object('q', q, 'n', n) order by n desc), '[]'::jsonb)
  from (select lower(e.props->>'q') q, count(*) n from ev e where e.name='search' and coalesce(e.props->>'q','') <> '' group by 1 order by n desc limit 30) t
)
select jsonb_build_object(
  'days',      p_days,
  'generated', now(),
  'totals',    (select * from totals),
  'daily',     (select * from daily),
  'entry_pages', (select * from entry),
  'exit_pages',  (select * from exit_pages),
  'pages',     (select * from pages),
  'products',  (select * from products),
  'dims',      (select * from dims),
  'searches',  (select * from searches)
);
$$;

revoke all on function public.analytics_summary(int) from public, anon, authenticated;
revoke all on function public.analytics_prune(int)   from public, anon, authenticated;
