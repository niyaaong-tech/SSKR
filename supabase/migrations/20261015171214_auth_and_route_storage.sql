-- Only the authenticated RPC surface is exposed. Mutations share one owner lock;
-- direct table writes cannot bypass quota, revision or idempotency checks.
create schema if not exists sskr_private;
revoke all on schema sskr_private from public, anon;
grant usage on schema sskr_private to authenticated;

create table sskr_private.settings (
  singleton boolean primary key default true check (singleton),
  max_saved_routes integer not null default 10 check (max_saved_routes between 1 and 100),
  catalog_version text not null,
  routing_version text not null,
  finish_id text not null
);
create table sskr_private.places (
  id text primary key,
  kind text not null check (kind in ('start', 'spot', 'finish')),
  active boolean not null default true
);
create table sskr_private.routes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  plan jsonb not null,
  schedule jsonb not null,
  revision bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index routes_owner_updated_idx on sskr_private.routes(owner_id, updated_at desc);
create table sskr_private.route_requests (
  owner_id uuid not null references auth.users(id) on delete cascade,
  request_key text not null,
  payload jsonb not null,
  response jsonb not null,
  created_at timestamptz not null default now(),
  primary key(owner_id, request_key)
);
alter table sskr_private.settings enable row level security;
alter table sskr_private.places enable row level security;
alter table sskr_private.routes enable row level security;
alter table sskr_private.route_requests enable row level security;
create policy routes_owner on sskr_private.routes for all to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy route_requests_owner on sskr_private.route_requests for all to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
revoke all on all tables in schema sskr_private from public, anon, authenticated;

-- Strict revocation check: a valid but signed-out JWT cannot read/write routes.
create function sskr_private.actor() returns uuid language plpgsql security definer
set search_path = '' as $$
declare actor_id uuid := auth.uid();
begin
  if actor_id is null or not exists (
    select 1 from auth.sessions s join auth.users u on u.id=s.user_id
    where s.id::text = (auth.jwt()->>'session_id') and s.user_id=actor_id
      and (s.not_after is null or s.not_after > now())
      and (u.banned_until is null or u.banned_until <= now())
      and not coalesce(u.is_anonymous, false)
      and exists (select 1 from auth.identities i where i.user_id=u.id and i.provider='google')
  ) then raise exception 'AUTH_REQUIRED'; end if;
  return actor_id;
end $$;
revoke all on function sskr_private.actor() from public, anon;
grant execute on function sskr_private.actor() to authenticated;
create function public.sskr_actor() returns uuid language sql security invoker
set search_path = '' as $$ select sskr_private.actor() $$;
revoke all on function public.sskr_actor() from public, anon;
grant execute on function public.sskr_actor() to authenticated;

create function sskr_private.routes_api(
  p_action text, p_id uuid default null, p_plan jsonb default null,
  p_schedule jsonb default null, p_revision bigint default null, p_key text default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor_id uuid := sskr_private.actor();
  cfg sskr_private.settings;
  existing sskr_private.routes;
  previous sskr_private.route_requests;
  result jsonb;
  route_id uuid := coalesce(p_id, gen_random_uuid());
  stamp timestamptz := clock_timestamp();
  doc jsonb; agenda jsonb; route_title text; next_number integer := 1;
  payload jsonb := jsonb_build_object('plan',p_plan,'schedule',p_schedule);
begin
  select * into strict cfg from sskr_private.settings where singleton;
  if p_action = 'list' then
    return jsonb_build_object('maxSavedRoutes',cfg.max_saved_routes,'routes',coalesce((
      select jsonb_agg(jsonb_build_object('plan',plan,'schedule',schedule,'revision',revision) order by updated_at desc,id)
      from sskr_private.routes where owner_id=actor_id), '[]'::jsonb));
  end if;
  if p_action not in ('save','schedule','delete') then raise exception 'INVALID_ACTION'; end if;
  perform pg_advisory_xact_lock(hashtextextended(actor_id::text, 7391));
  if p_id is not null then
    select * into existing from sskr_private.routes where id=p_id and owner_id=actor_id;
    if not found then raise exception 'ROUTE_NOT_FOUND'; end if;
    if p_revision is null then raise exception 'REVISION_REQUIRED'; end if;
    if p_revision <> existing.revision then raise exception 'REVISION_CONFLICT'; end if;
  elsif p_action <> 'save' then raise exception 'ROUTE_NOT_FOUND';
  else
    if p_key is null or length(p_key) < 16 or length(p_key) > 128 then raise exception 'IDEMPOTENCY_REQUIRED'; end if;
    select * into previous from sskr_private.route_requests where owner_id=actor_id and request_key=p_key;
    if found then
      if previous.payload <> payload then raise exception 'IDEMPOTENCY_CONFLICT'; end if;
      return previous.response;
    end if;
    if (select count(*) from sskr_private.routes where owner_id=actor_id) >= cfg.max_saved_routes then raise exception 'ROUTE_LIMIT_REACHED'; end if;
  end if;
  if p_action = 'delete' then
    delete from sskr_private.routes where id=p_id and owner_id=actor_id;
    return jsonb_build_object('deleted',p_id);
  end if;
  agenda := p_schedule;
  if agenda is null or jsonb_typeof(agenda) <> 'object'
    or (coalesce(agenda->>'departureTime','') <> '' and agenda->>'departureTime' !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
    or coalesce(agenda->>'breakMinutes','') !~ '^[0-9]{1,4}$'
    or (agenda->>'breakMinutes')::integer > 1440
    or jsonb_typeof(agenda->'autoDeparture') is distinct from 'boolean'
  then raise exception 'INVALID_SCHEDULE'; end if;
  -- Event metadata is server-owned. The first release has no published event.
  agenda := jsonb_build_object('departureTime',agenda->>'departureTime','breakMinutes',(agenda->>'breakMinutes')::integer,
    'autoDeparture',agenda->'autoDeparture','eventId',null,'configVersion',null,'timezone','Asia/Seoul');
  if p_action = 'schedule' then
    update sskr_private.routes set schedule=agenda, revision=revision+1, updated_at=stamp,
      plan=jsonb_set(plan,'{updatedAt}',to_jsonb(stamp)) where id=p_id and owner_id=actor_id
      returning jsonb_build_object('plan',plan,'schedule',schedule,'revision',revision) into result;
    return result;
  end if;
  if p_plan is null or jsonb_typeof(p_plan) <> 'object'
    or jsonb_typeof(p_plan->'stopIds') is distinct from 'array'
    or jsonb_typeof(coalesce(p_plan->'pinnedStopIds','[]')) <> 'array'
    or jsonb_array_length(p_plan->'stopIds') > 200
    or length(coalesce(p_plan->>'title','')) > 60
    or coalesce(p_plan->>'finishId','') <> cfg.finish_id
  then raise exception 'INVALID_PLAN'; end if;
  if p_plan->>'startId' is not null and not exists(select 1 from sskr_private.places where id=p_plan->>'startId' and kind='start' and active) then raise exception 'INVALID_REFERENCE'; end if;
  if exists(select 1 from jsonb_array_elements_text(p_plan->'stopIds') x where not exists(select 1 from sskr_private.places where id=x and kind='spot' and active))
    or (select count(*)<>count(distinct x) from jsonb_array_elements_text(p_plan->'stopIds') x)
    or exists(select 1 from jsonb_array_elements_text(coalesce(p_plan->'pinnedStopIds','[]')) x where not (p_plan->'stopIds') ? x)
    or (select count(*)<>count(distinct x) from jsonb_array_elements_text(coalesce(p_plan->'pinnedStopIds','[]')) x)
  then raise exception 'INVALID_REFERENCE'; end if;
  if coalesce(p_plan->>'catalogVersion','') <> cfg.catalog_version or (coalesce(p_plan->>'routingVersion','') <> cfg.routing_version and (p_plan->>'routingVersion' is not null or jsonb_array_length(p_plan->'stopIds')>0)) then raise exception 'CATALOG_CHANGED'; end if;
  route_title := btrim(coalesce(p_plan->>'title',''));
  if route_title = '' then
    while exists(select 1 from sskr_private.routes where owner_id=actor_id and
      (regexp_match(plan->>'title', '^루트\s+0*([0-9]+)$'))[1] = next_number::text)
    loop next_number := next_number+1; end loop;
    route_title := '루트 ' || case when next_number < 10 then '0' else '' end || next_number::text;
  end if;
  doc := jsonb_build_object('id',route_id::text,'ownerUserId',actor_id::text,'title',route_title,
    'startId',p_plan->'startId','stopIds',p_plan->'stopIds','pinnedStopIds',coalesce(p_plan->'pinnedStopIds','[]'),
    'finishId',cfg.finish_id,'catalogVersion',cfg.catalog_version,'routingVersion',cfg.routing_version,
    'createdAt',coalesce(existing.created_at,stamp),'updatedAt',stamp);
  insert into sskr_private.routes(id,owner_id,plan,schedule,revision,created_at,updated_at)
    values(route_id,actor_id,doc,agenda,coalesce(existing.revision,0)+1,coalesce(existing.created_at,stamp),stamp)
    on conflict(id) do update set plan=excluded.plan,schedule=excluded.schedule,revision=excluded.revision,updated_at=excluded.updated_at
    returning jsonb_build_object('plan',plan,'schedule',schedule,'revision',revision) into result;
  if p_id is null then insert into sskr_private.route_requests(owner_id,request_key,payload,response) values(actor_id,p_key,payload,result); end if;
  return result;
end $$;
revoke all on function sskr_private.routes_api(text,uuid,jsonb,jsonb,bigint,text) from public, anon;
grant execute on function sskr_private.routes_api(text,uuid,jsonb,jsonb,bigint,text) to authenticated;
create function public.sskr_routes(p_action text, p_id uuid default null, p_plan jsonb default null,
  p_schedule jsonb default null,p_revision bigint default null,p_key text default null)
returns jsonb language sql security invoker set search_path = '' as $$
  select sskr_private.routes_api(p_action,p_id,p_plan,p_schedule,p_revision,p_key)
$$;
revoke all on function public.sskr_routes(text,uuid,jsonb,jsonb,bigint,text) from public, anon;
grant execute on function public.sskr_routes(text,uuid,jsonb,jsonb,bigint,text) to authenticated;

-- Catalog identifiers only; full place data remains in the shared catalog.
insert into sskr_private.settings(singleton,catalog_version,routing_version,finish_id) values(true,'places-dd7cd06c','c24f0f88f894360d4653','daecheon');
insert into sskr_private.places(id,kind) values
('sokcho','start'),
('gangneung','start'),
('mangsang','start'),
('samcheok','start'),
('uljin','start'),
('yeongdeok','start'),
('chilpo','start'),
('gyeongju','start'),
('jinha','start'),
('gwangalli','start'),
('songjeong','start'),
('auraji','spot'),
('cheongnyeongpo','spot'),
('dodam','spot'),
('cheongpung','spot'),
('sujupalbong','spot'),
('sanmagi','spot'),
('buncheon','spot'),
('hoeryongpo','spot'),
('mungyeong','spot'),
('gaeun','spot'),
('munui','spot'),
('hahoe','spot'),
('hwabon','spot'),
('jikjisa','spot'),
('wollyubong','spot'),
('magoksa','spot'),
('daecheon','finish'),
('the-road-1423','spot'),
('bikongs','spot'),
('hichichi','spot'),
('mad-brown','spot'),
('jumunjin-market','spot'),
('jeongseon-market','spot'),
('bongpyeong-market','spot'),
('jecheon-market','spot'),
('goesan-market','spot'),
('yeongdeok-market','spot'),
('gampo-market','spot'),
('yeongju-market','spot'),
('andong-market','spot'),
('yesan-market','spot'),
('hongseong-market','spot'),
('gwangcheon-market','spot'),
('jangho','spot'),
('buseok-seosan','spot'),
('sindolseok','spot'),
('geojosa','spot'),
('hupo','spot'),
('baeron','spot'),
('sainam','spot'),
('jiyong','spot'),
('ojanghwan','spot'),
('gongsanseong','spot'),
('oeam','spot'),
('ganwolam','spot'),
('sudeoksa','spot'),
('gungnamji','spot'),
('muchangpo','spot'),
('haemi','spot'),
('sosu','spot'),
('buseok-yeongju','spot'),
('oryukdo-skywalk','spot'),
('gamcheon','spot'),
('eulsukdo','spot'),
('suro-tomb','spot'),
('bongha','spot'),
('tongdosa','spot'),
('yeongnamru','spot'),
('pyochungsa','spot'),
('upo-wetland','spot'),
('jinjuseong','spot'),
('samcheonpo-bridge','spot'),
('choechampan-house','spot'),
('hwagae-market','spot'),
('donguibogam-village','spot'),
('sangnim-forest','spot'),
('suseungdae','spot'),
('dongpirang','spot'),
('sangjogam','spot'),
('hwaeomsa','spot'),
('maehwa-village','spot'),
('naganeupseong','spot'),
('suncheon-bay','spot'),
('daehan-dawon','spot'),
('juknokwon','spot'),
('unjusa','spot'),
('geumseonggwan','spot'),
('dasan-chodang','spot'),
('seonamsa','spot'),
('soswaewon','spot'),
('gwanghallu','spot'),
('honbul-museum','spot'),
('jeonju-hanok','spot'),
('seonunsa','spot'),
('gochang-fortress','spot'),
('chaeseokgang','spot'),
('gunsan-history','spot'),
('byeokgolje','spot'),
('naesosa','spot'),
('mireuksa','spot'),
('chueam-beach','spot'),
('unilam-banilam','spot'),
('yangdong-village','spot'),
('jangsaengpo-whale','spot'),
('national-lighthouse-museum','spot'),
('cheongju-national-museum','spot'),
('donggung-wolji','spot'),
('piram-seowon','spot'),
('unjoru','spot'),
('dadaepo-beach','spot'),
('boryeong-suyeongseong','spot'),
('clayarch-gimhae','spot'),
('chuncheon-national-museum','spot'),
('dolsan-park','spot'),
('beomeosa','spot'),
('mokpo-marine-relics','spot'),
('gacheon-terraces','spot'),
('geoje-pow-park','spot'),
('gyeongpodae','spot'),
('windy-hill','spot'),
('jeongdongjin-beach','spot'),
('muwisa','spot'),
('baekyangsa','spot'),
('wonju-hyanggyo','spot'),
('ssanggyesa','spot'),
('unmunsa','spot'),
('bulguksa','spot'),
('naksansa','spot'),
('sinheungsa','spot'),
('woljeongsa','spot'),
('ondal-park','spot'),
('borimsa','spot'),
('jeongamsa','spot'),
('uam-park','spot'),
('yeongamsa-site','spot'),
('hapdeok-church','spot'),
('inje-hyanggyo','spot'),
('malisan-tombs','spot'),
('hwaseong-fortress','spot'),
('yunggeolleung','spot'),
('silleuksa','spot'),
('seolbong-park','spot'),
('dumulmeori','spot'),
('anseong-cheongryongsa','spot'),
('chiljangsa','spot'),
('namhansanseong','spot'),
('railroad-museum','spot'),
('samsung-transport','spot'),
('pungsuwon','spot'),
('sutasa','spot'),
('parksugeun','spot'),
('kimyujeong','spot'),
('daegwallyeong-sheep','spot'),
('gossi-cave','spot'),
('hwangji','spot'),
('pohang-jukdo','spot'),
('guryongpo-history','spot'),
('daejeonsa','spot'),
('seoseokji','spot'),
('baekdudaegan-arboretum','spot'),
('munmu-tomb','spot'),
('golgulsa','spot'),
('beopjusa','spot'),
('bogangcheon','spot'),
('jincheon-nongdari','spot'),
('yeongguksa','spot'),
('uirimji','spot'),
('independence-hall','spot'),
('hyeonchungsa','spot'),
('gwanchoksa','spot'),
('donam-seowon','spot'),
('boseoksa','spot'),
('janggoksa','spot'),
('haeinsa','spot'),
('namhae-german-village','spot'),
('daeheungsa','spot'),
('usuyoung','spot'),
('gokseong-rail-village','spot'),
('jeoksang-records','spot'),
('seonyudo','spot'),
('silsangsa','spot'),
('maisantapsa','spot'),
('donghwasa','spot'),
('jangtaesan','spot'),
('ulsan-taehwa','spot'),
('hanhyeong-view','spot'),
('dosan-seowon','spot'),
('bongjeongsa','spot'),
('gakyeonsa','spot'),
('kimjwajin','spot'),
('mallipo','spot'),
('hwangtohyeon','spot'),
('imsil-cheese','spot'),
('namgye-seowon','spot'),
('naewonsa','spot'),
('hyangiram','spot'),
('neunggasa','spot'),
('gwangju-folk-museum','spot'),
('seomun-market','spot'),
('jeongsan-hyanggyo','spot'),
('korea-pop-museum','spot'),
('daewangam-park','spot'),
('geological-museum','spot'),
('sejong-arboretum','spot'),
('sinchang-hyanggyo','spot'),
('buan-guam-dolmens','spot'),
('jisan-tombs','spot'),
('seosan-hyanggyo','spot'),
('dangjin-hyanggyo','spot'),
('songhak-tombs','spot'),
('okjeon-tombs','spot');
