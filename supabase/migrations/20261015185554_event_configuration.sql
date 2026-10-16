-- Drafts, publication history and authorization remain private. A publication is
-- an immutable snapshot; public readers never observe an unpublished draft.
-- Coordinates needed for reviewed daylight validation, not duplicate place copy.
alter table sskr_private.places add column lat numeric check (lat between -90 and 90);
alter table sskr_private.places add column lng numeric check (lng between -180 and 180);
update sskr_private.places p set lat=v.lat,lng=v.lng from (values
  ('sokcho',38.18743167,128.6052197),('gangneung',37.764,128.954),
  ('mangsang',37.592269,129.089671),('samcheok',37.389,129.232),
  ('uljin',36.97,129.416),('yeongdeok',36.602,129.41),
  ('chilpo',36.131961,129.400554),('gyeongju',35.692,129.475),
  ('jinha',35.383522,129.346011),('gwangalli',35.153813,129.118548),
  ('songjeong',35.178712,129.19964),('daecheon',36.311,126.511)
) as v(id,lat,lng) where p.id=v.id;
create table sskr_private.event_operators (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table sskr_private.event_drafts (
  id uuid primary key default gen_random_uuid(),
  revision bigint not null default 1 check (revision > 0),
  document jsonb not null check (jsonb_typeof(document) = 'object'),
  updated_at timestamptz not null default now()
);
create table sskr_private.event_publications (
  event_id uuid not null references sskr_private.event_drafts(id),
  config_version bigint not null check (config_version > 0),
  document jsonb not null check (jsonb_typeof(document) = 'object'),
  published_at timestamptz not null default now(),
  actor_id uuid not null,
  primary key (event_id, config_version)
);
create table sskr_private.event_current (
  singleton boolean primary key default true check (singleton),
  current_event_id uuid not null,
  current_version bigint not null,
  foreign key (current_event_id, current_version) references sskr_private.event_publications(event_id, config_version)
);
create table sskr_private.event_audit (
  id bigint generated always as identity primary key,
  actor_id uuid not null,
  action text not null check (action in ('CREATE', 'UPDATE', 'PUBLISH')),
  event_id uuid not null references sskr_private.event_drafts(id),
  before_document jsonb,
  after_document jsonb not null,
  created_at timestamptz not null default now()
);
create index event_audit_event_time_idx on sskr_private.event_audit(event_id, created_at desc, id desc);
alter table sskr_private.event_operators enable row level security;
alter table sskr_private.event_drafts enable row level security;
alter table sskr_private.event_publications enable row level security;
alter table sskr_private.event_current enable row level security;
alter table sskr_private.event_audit enable row level security;
revoke all on sskr_private.event_operators, sskr_private.event_drafts,
  sskr_private.event_publications, sskr_private.event_current, sskr_private.event_audit
  from public, anon, authenticated;
revoke all on sequence sskr_private.event_audit_id_seq from public, anon, authenticated;

create function sskr_private.event_timestamp(p_value text) returns timestamptz
language plpgsql immutable security invoker set search_path = '' as $$
begin
  if p_value is null or p_value !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,6})?)?(Z|[+-]\d{2}:\d{2})$' then
    raise exception 'INVALID_EVENT';
  end if;
  return p_value::timestamptz;
exception when invalid_datetime_format or datetime_field_overflow then
  raise exception 'INVALID_EVENT';
end $$;
revoke all on function sskr_private.event_timestamp(text) from public, anon, authenticated;

create function sskr_private.event_document(p_document jsonb) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
  doc jsonb;
  field text;
  entry jsonb;
begin
  if p_document is null or jsonb_typeof(p_document) <> 'object' or octet_length(p_document::text) > 65536
    or exists(select 1 from jsonb_object_keys(p_document) k where k not in (
      'publicTitle','editionLabel','description','timezone','eventStartAt','eventEndAt',
      'applicationOpenAt','applicationCloseAt','minimumSpotCheckins','startLocationIds',
      'finishLocationId','sunlight','coreConfirmedAt','spotsConfirmedAt'))
  then raise exception 'INVALID_EVENT'; end if;
  doc := jsonb_build_object('timezone','Asia/Seoul','minimumSpotCheckins',10,
    'finishLocationId','daecheon','startLocationIds','[]'::jsonb) || p_document;
  if doc->>'timezone' is distinct from 'Asia/Seoul' or doc->>'finishLocationId' is distinct from 'daecheon'
    or jsonb_typeof(doc->'minimumSpotCheckins') is distinct from 'number'
    or (doc->>'minimumSpotCheckins') !~ '^[0-9]{1,3}$'
  then raise exception 'INVALID_EVENT'; end if;
  if (doc->>'minimumSpotCheckins')::integer not between 1 and 200 then raise exception 'INVALID_EVENT'; end if;
  foreach field in array array['publicTitle','editionLabel','description'] loop
    if doc ? field and (jsonb_typeof(doc->field) <> 'string'
      or length(doc->>field) > case when field='description' then 4000 when field='publicTitle' then 120 else 80 end)
    then raise exception 'INVALID_EVENT'; end if;
  end loop;
  foreach field in array array['eventStartAt','eventEndAt','applicationOpenAt','applicationCloseAt','coreConfirmedAt','spotsConfirmedAt'] loop
    if doc ? field and doc->field <> 'null'::jsonb then
      if jsonb_typeof(doc->field) <> 'string' then raise exception 'INVALID_EVENT'; end if;
      perform sskr_private.event_timestamp(doc->>field);
    end if;
  end loop;
  if jsonb_typeof(doc->'startLocationIds') is distinct from 'array' then raise exception 'INVALID_EVENT'; end if;
  if jsonb_array_length(doc->'startLocationIds') > 50
    or exists(select 1 from jsonb_array_elements(doc->'startLocationIds') x where jsonb_typeof(x) <> 'string')
    or (select count(*) <> count(distinct x) from jsonb_array_elements_text(doc->'startLocationIds') x)
    or exists(select 1 from jsonb_array_elements_text(doc->'startLocationIds') x
      where not exists(select 1 from sskr_private.places p where p.id=x and p.kind='start' and p.active))
    or not exists(select 1 from sskr_private.places where id='daecheon' and kind='finish' and active)
  then raise exception 'INVALID_EVENT'; end if;
  if doc ? 'sunlight' and doc->'sunlight' <> 'null'::jsonb then
    if jsonb_typeof(doc->'sunlight') <> 'object' then raise exception 'SUNLIGHT_REVIEW_REQUIRED'; end if;
    if exists(select 1 from jsonb_object_keys(doc->'sunlight') k where k not in
      ('eventId','date','timezone','configVersion','verification','sourceUrl','calculationVersion','starts','finish'))
    then raise exception 'SUNLIGHT_REVIEW_REQUIRED'; end if;
    foreach field in array array['eventId','date','timezone','verification','sourceUrl','calculationVersion'] loop
      if (doc->'sunlight') ? field and jsonb_typeof(doc#>array['sunlight',field]) <> 'string' then raise exception 'SUNLIGHT_REVIEW_REQUIRED'; end if;
    end loop;
    if (doc->'sunlight') ? 'configVersion' and jsonb_typeof(doc#>'{sunlight,configVersion}') <> 'number' then raise exception 'SUNLIGHT_REVIEW_REQUIRED'; end if;
    if (doc->'sunlight') ? 'starts' then
      if jsonb_typeof(doc#>'{sunlight,starts}') <> 'array' then raise exception 'SUNLIGHT_REVIEW_REQUIRED'; end if;
      if jsonb_array_length(doc#>'{sunlight,starts}') > 50 then raise exception 'SUNLIGHT_REVIEW_REQUIRED'; end if;
    end if;
    if (doc->'sunlight') ? 'finish' and jsonb_typeof(doc#>'{sunlight,finish}') <> 'object' then raise exception 'SUNLIGHT_REVIEW_REQUIRED'; end if;
    for entry in select value from jsonb_array_elements(coalesce(doc#>'{sunlight,starts}','[]'::jsonb))
      union all select doc#>'{sunlight,finish}' where (doc->'sunlight') ? 'finish'
    loop
      if jsonb_typeof(entry) <> 'object' then raise exception 'SUNLIGHT_REVIEW_REQUIRED'; end if;
      if exists(select 1 from jsonb_object_keys(entry) k where k not in ('locationId','lat','lng','sunriseAt','sunsetAt')) then raise exception 'SUNLIGHT_REVIEW_REQUIRED'; end if;
      foreach field in array array['locationId','sunriseAt','sunsetAt'] loop
        if entry ? field and jsonb_typeof(entry->field) <> 'string' then raise exception 'SUNLIGHT_REVIEW_REQUIRED'; end if;
      end loop;
      foreach field in array array['lat','lng'] loop
        if entry ? field then
          if jsonb_typeof(entry->field) <> 'number' then raise exception 'SUNLIGHT_REVIEW_REQUIRED'; end if;
          if abs((entry->>field)::numeric) > (case when field='lat' then 90 else 180 end) then raise exception 'SUNLIGHT_REVIEW_REQUIRED'; end if;
        end if;
      end loop;
    end loop;
  end if;
  return doc;
end $$;
revoke all on function sskr_private.event_document(jsonb) from public, anon, authenticated;

create function sskr_private.validate_event_publication(p_id uuid, p_version bigint, p_document jsonb) returns void
language plpgsql security invoker set search_path = '' as $$
declare
  doc jsonb := sskr_private.event_document(p_document);
  light jsonb := doc->'sunlight';
  entry jsonb;
  finish jsonb;
  starts timestamptz;
  ends timestamptz;
  sunrise timestamptz;
  sunset timestamptz;
  local_date text;
begin
  if length(btrim(coalesce(doc->>'publicTitle',''))) = 0
    or doc->>'eventStartAt' is null or doc->>'eventEndAt' is null
    or jsonb_array_length(doc->'startLocationIds') = 0
  then raise exception 'INVALID_EVENT'; end if;
  starts := sskr_private.event_timestamp(doc->>'eventStartAt');
  ends := sskr_private.event_timestamp(doc->>'eventEndAt');
  local_date := to_char(starts at time zone 'Asia/Seoul','YYYY-MM-DD');
  if starts >= ends or local_date <> to_char(ends at time zone 'Asia/Seoul','YYYY-MM-DD') then raise exception 'INVALID_EVENT'; end if;
  if doc->>'applicationOpenAt' is not null and doc->>'applicationCloseAt' is not null
    and sskr_private.event_timestamp(doc->>'applicationOpenAt') >= sskr_private.event_timestamp(doc->>'applicationCloseAt')
  then raise exception 'INVALID_EVENT'; end if;
  if jsonb_typeof(light) is distinct from 'object'
    or light->>'eventId' is distinct from p_id::text
    or light->>'date' is distinct from local_date
    or light->>'timezone' is distinct from 'Asia/Seoul'
    or light->'configVersion' is distinct from to_jsonb(p_version)
    or light->>'verification' is distinct from 'REVIEWED'
    or jsonb_typeof(light->'sourceUrl') is distinct from 'string'
    or coalesce(light->>'sourceUrl','') !~ '^https://[^[:space:]]+$'
    or jsonb_typeof(light->'calculationVersion') is distinct from 'string'
    or length(btrim(coalesce(light->>'calculationVersion',''))) not between 1 and 120
    or jsonb_typeof(light->'starts') is distinct from 'array'
    or jsonb_typeof(light->'finish') is distinct from 'object'
  then raise exception 'SUNLIGHT_REVIEW_REQUIRED'; end if;
  if jsonb_array_length(light->'starts') <> jsonb_array_length(doc->'startLocationIds')
    or (select count(*) <> count(distinct x->>'locationId') from jsonb_array_elements(light->'starts') x)
  then raise exception 'SUNLIGHT_REVIEW_REQUIRED'; end if;
  finish := light->'finish';
  if finish->>'locationId' is distinct from doc->>'finishLocationId'
    or jsonb_typeof(finish->'lat') is distinct from 'number' or jsonb_typeof(finish->'lng') is distinct from 'number'
  then raise exception 'SUNLIGHT_REVIEW_REQUIRED'; end if;
  if (finish->>'lat')::numeric not between -90 and 90 or (finish->>'lng')::numeric not between -180 and 180 then raise exception 'SUNLIGHT_REVIEW_REQUIRED'; end if;
  if not exists(select 1 from sskr_private.places where id=finish->>'locationId' and active and kind='finish'
    and lat=(finish->>'lat')::numeric and lng=(finish->>'lng')::numeric) then raise exception 'SUNLIGHT_REVIEW_REQUIRED'; end if;
  begin
    sunset := sskr_private.event_timestamp(finish->>'sunsetAt');
  exception when others then raise exception 'SUNLIGHT_REVIEW_REQUIRED'; end;
  if to_char(sunset at time zone 'Asia/Seoul','YYYY-MM-DD') <> local_date then raise exception 'SUNLIGHT_REVIEW_REQUIRED'; end if;
  for entry in select value from jsonb_array_elements(light->'starts') loop
    if jsonb_typeof(entry) <> 'object' or not (doc->'startLocationIds') ? coalesce(entry->>'locationId','')
      or jsonb_typeof(entry->'lat') is distinct from 'number' or jsonb_typeof(entry->'lng') is distinct from 'number'
    then raise exception 'SUNLIGHT_REVIEW_REQUIRED'; end if;
    if (entry->>'lat')::numeric not between -90 and 90 or (entry->>'lng')::numeric not between -180 and 180 then raise exception 'SUNLIGHT_REVIEW_REQUIRED'; end if;
    if not exists(select 1 from sskr_private.places where id=entry->>'locationId' and active and kind='start'
      and lat=(entry->>'lat')::numeric and lng=(entry->>'lng')::numeric) then raise exception 'SUNLIGHT_REVIEW_REQUIRED'; end if;
    begin
      sunrise := sskr_private.event_timestamp(entry->>'sunriseAt');
    exception when others then raise exception 'SUNLIGHT_REVIEW_REQUIRED'; end;
    if sunrise >= sunset or to_char(sunrise at time zone 'Asia/Seoul','YYYY-MM-DD') <> local_date then raise exception 'SUNLIGHT_REVIEW_REQUIRED'; end if;
  end loop;
end $$;
revoke all on function sskr_private.validate_event_publication(uuid,bigint,jsonb) from public, anon, authenticated;

create function sskr_private.reject_event_history_change() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin raise exception 'EVENT_HISTORY_IMMUTABLE'; end $$;
revoke all on function sskr_private.reject_event_history_change() from public, anon, authenticated;
create trigger event_publications_immutable before update or delete on sskr_private.event_publications
for each row execute function sskr_private.reject_event_history_change();
create trigger event_audit_immutable before update or delete on sskr_private.event_audit
for each row execute function sskr_private.reject_event_history_change();

create function sskr_private.events_api(p_action text, p_id uuid default null, p_document jsonb default null, p_revision bigint default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  operator_id uuid := sskr_private.actor();
  existing sskr_private.event_drafts;
  row_id uuid := coalesce(p_id,gen_random_uuid());
  doc jsonb;
  old_public jsonb;
  stamp timestamptz := clock_timestamp();
  previous_publication sskr_private.event_publications;
begin
  if not exists(select 1 from sskr_private.event_operators where user_id=operator_id) then raise exception 'FORBIDDEN'; end if;
  if p_action='list' then
    return jsonb_build_object('events',coalesce((select jsonb_agg(jsonb_build_object(
      'id',d.id,'revision',d.revision,'document',d.document,'updatedAt',d.updated_at,
      'publishedVersion',(select max(p.config_version) from sskr_private.event_publications p where p.event_id=d.id)) order by d.updated_at desc,d.id)
      from sskr_private.event_drafts d),'[]'::jsonb),
      'current',(select jsonb_build_object('id',current_event_id,'configVersion',current_version) from sskr_private.event_current where singleton));
  end if;
  if p_action not in ('save','publish') then raise exception 'INVALID_ACTION'; end if;
  -- One publication pointer, one lock order. A concurrent operator cannot publish
  -- a revision while another save silently replaces its draft.
  perform pg_advisory_xact_lock(7392,1);
  if p_id is not null then
    select * into existing from sskr_private.event_drafts where id=p_id for update;
    if not found then raise exception 'EVENT_NOT_FOUND'; end if;
    if p_revision is null then raise exception 'REVISION_REQUIRED'; end if;
    if p_revision <> existing.revision then raise exception 'REVISION_CONFLICT'; end if;
  elsif p_action <> 'save' then raise exception 'EVENT_NOT_FOUND';
  elsif p_revision is not null then raise exception 'INVALID_REVISION'; end if;
  if p_action='save' then
    doc := sskr_private.event_document(p_document);
    if jsonb_typeof(doc->'sunlight')='object' then
      -- A copied review cannot remain approved after its date or places change.
      if p_id is not null and (
        ((existing.document->>'eventStartAt')::timestamptz at time zone 'Asia/Seoul')::date is distinct from ((doc->>'eventStartAt')::timestamptz at time zone 'Asia/Seoul')::date
        or existing.document->'startLocationIds' is distinct from doc->'startLocationIds'
        or existing.document->>'finishLocationId' is distinct from doc->>'finishLocationId'
      ) and ((doc->'sunlight') - array['eventId','date','timezone','configVersion'])
        = ((existing.document->'sunlight') - array['eventId','date','timezone','configVersion']) then
        doc := jsonb_set(doc,'{sunlight,verification}','"UNREVIEWED"'::jsonb);
      end if;
      doc := jsonb_set(doc,'{sunlight}',((doc->'sunlight') - array['eventId','date','timezone','configVersion']) || jsonb_strip_nulls(jsonb_build_object('eventId',row_id,
        'configVersion',coalesce(existing.revision,0)+1,'timezone','Asia/Seoul',
        'date',case when doc->>'eventStartAt' is null then null else
          to_char(sskr_private.event_timestamp(doc->>'eventStartAt') at time zone 'Asia/Seoul','YYYY-MM-DD') end)));
    end if;
    insert into sskr_private.event_drafts(id,revision,document,updated_at)
      values(row_id,coalesce(existing.revision,0)+1,doc,stamp)
      on conflict(id) do update set revision=excluded.revision,document=excluded.document,updated_at=excluded.updated_at;
    insert into sskr_private.event_audit(actor_id,action,event_id,before_document,after_document,created_at)
      values(operator_id,case when p_id is null then 'CREATE' else 'UPDATE' end,row_id,
        case when p_id is null then null else jsonb_build_object('revision',existing.revision,'document',existing.document) end,
        jsonb_build_object('revision',coalesce(existing.revision,0)+1,'document',doc),stamp);
    return jsonb_build_object('id',row_id,'revision',coalesce(existing.revision,0)+1,'document',doc,'updatedAt',stamp);
  end if;
  perform sskr_private.validate_event_publication(row_id,existing.revision,existing.document);
  select * into previous_publication from sskr_private.event_publications where event_id=row_id and config_version=existing.revision;
  if found then
    if exists(select 1 from sskr_private.event_current where current_event_id=row_id and current_version=existing.revision) then
      return jsonb_build_object('id',row_id,'revision',existing.revision,'publishedVersion',existing.revision,'publishedAt',previous_publication.published_at);
    end if;
    raise exception 'INVALID_EVENT';
  end if;
  select jsonb_build_object('id',p.event_id,'configVersion',p.config_version,'document',p.document) into old_public
    from sskr_private.event_current c join sskr_private.event_publications p
      on p.event_id=c.current_event_id and p.config_version=c.current_version where c.singleton;
  insert into sskr_private.event_publications(event_id,config_version,document,published_at,actor_id)
    values(row_id,existing.revision,existing.document,stamp,operator_id);
  insert into sskr_private.event_current(singleton,current_event_id,current_version) values(true,row_id,existing.revision)
    on conflict(singleton) do update set current_event_id=excluded.current_event_id,current_version=excluded.current_version;
  insert into sskr_private.event_audit(actor_id,action,event_id,before_document,after_document,created_at)
    values(operator_id,'PUBLISH',row_id,old_public,jsonb_build_object('id',row_id,'configVersion',existing.revision,'document',existing.document),stamp);
  return jsonb_build_object('id',row_id,'revision',existing.revision,'publishedVersion',existing.revision,'publishedAt',stamp);
end $$;
revoke all on function sskr_private.events_api(text,uuid,jsonb,bigint) from public, anon;
grant execute on function sskr_private.events_api(text,uuid,jsonb,bigint) to authenticated;
create function public.sskr_events(p_action text, p_id uuid default null, p_document jsonb default null, p_revision bigint default null)
returns jsonb language sql security invoker set search_path = '' as $$
  select sskr_private.events_api(p_action,p_id,p_document,p_revision)
$$;
revoke all on function public.sskr_events(text,uuid,jsonb,bigint) from public, anon;
grant execute on function public.sskr_events(text,uuid,jsonb,bigint) to authenticated;

-- This is the sole anonymous private-schema entry point. No table grants or
-- draft/actor/admin function grants are added for anon.
grant usage on schema sskr_private to anon;
create function sskr_private.public_event() returns jsonb
language sql stable security definer set search_path = '' as $$
  select p.document || jsonb_build_object('id',p.event_id,'configVersion',p.config_version,
    'published',true,'publishedAt',p.published_at)
  from sskr_private.event_current c join sskr_private.event_publications p
    on p.event_id=c.current_event_id and p.config_version=c.current_version where c.singleton
$$;
revoke all on function sskr_private.public_event() from public;
grant execute on function sskr_private.public_event() to anon,authenticated;
create function public.sskr_public_event() returns jsonb language sql stable security invoker set search_path = '' as $$
  select sskr_private.public_event()
$$;
revoke all on function public.sskr_public_event() from public;
grant execute on function public.sskr_public_event() to anon,authenticated;

create function sskr_private.route_event_snapshot() returns trigger
language plpgsql security definer set search_path = '' as $$
declare current_document jsonb := sskr_private.public_event();
begin
  new.schedule := new.schedule || jsonb_build_object('eventId',current_document->'id',
    'configVersion',current_document->'configVersion','timezone',coalesce(current_document->>'timezone','Asia/Seoul'));
  return new;
end $$;
revoke all on function sskr_private.route_event_snapshot() from public, anon, authenticated;
create trigger route_event_snapshot before insert or update of schedule on sskr_private.routes
for each row execute function sskr_private.route_event_snapshot();

-- Shared transaction locking also covers the no-publication case, where no
-- event_current row exists to lock. Publishing takes the matching exclusive lock.
create function sskr_private.event_routes_api(p_action text, p_id uuid default null, p_plan jsonb default null,
  p_schedule jsonb default null,p_revision bigint default null,p_key text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  current_document jsonb;
  route_owner uuid := sskr_private.actor();
begin
  if p_action in ('save','schedule') then
    perform pg_advisory_xact_lock_shared(7392,1);
    if p_action='save' and p_id is null then
      perform pg_advisory_xact_lock(hashtextextended(route_owner::text,7391));
      if exists(select 1 from sskr_private.route_requests r where r.owner_id=route_owner and r.request_key=p_key) then
        -- A lost response must replay its original success even after publication.
        -- routes_api also rejects a changed payload under that same request key.
        return sskr_private.routes_api(p_action,p_id,p_plan,p_schedule,p_revision,p_key);
      end if;
    end if;
    current_document := sskr_private.public_event();
    if p_schedule ? 'eventId' or p_schedule ? 'configVersion' then
      if coalesce(p_schedule->'eventId','null'::jsonb) is distinct from coalesce(current_document->'id','null'::jsonb)
        or coalesce(p_schedule->'configVersion','null'::jsonb) is distinct from coalesce(current_document->'configVersion','null'::jsonb)
      then raise exception 'EVENT_CHANGED'; end if;
    end if;
  end if;
  return sskr_private.routes_api(p_action,p_id,p_plan,p_schedule,p_revision,p_key);
end $$;
revoke all on function sskr_private.event_routes_api(text,uuid,jsonb,jsonb,bigint,text) from public,anon;
grant execute on function sskr_private.event_routes_api(text,uuid,jsonb,jsonb,bigint,text) to authenticated;
revoke execute on function sskr_private.routes_api(text,uuid,jsonb,jsonb,bigint,text) from authenticated;
create or replace function public.sskr_routes(p_action text, p_id uuid default null, p_plan jsonb default null,
  p_schedule jsonb default null,p_revision bigint default null,p_key text default null)
returns jsonb language sql security invoker set search_path = '' as $$
  select sskr_private.event_routes_api(p_action,p_id,p_plan,p_schedule,p_revision,p_key)
$$;
