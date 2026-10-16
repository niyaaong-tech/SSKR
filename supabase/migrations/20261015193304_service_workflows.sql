-- Only the authenticated BFF service client can call this boundary. Browser
-- JWTs have no grants. The BFF validates policy; event-wide CAS makes capacity,
-- order transitions and participant numbering atomic across concurrent users.
create table sskr_private.commerce (
  event_id uuid primary key references sskr_private.event_drafts(id),
  epoch bigint not null default 0,
  document jsonb not null default '{}' check (jsonb_typeof(document)='object'),
  updated_at timestamptz not null default now()
);
create table sskr_private.workflows (
  event_id uuid not null references sskr_private.event_drafts(id),
  owner_id uuid not null references auth.users(id),
  document jsonb not null default '{}' check (jsonb_typeof(document)='object'),
  updated_at timestamptz not null default now(),
  primary key(event_id,owner_id)
);
create table sskr_private.payment_orders (
  id text primary key,
  event_id uuid not null,
  owner_id uuid not null,
  amount integer not null check(amount>0),
  state text not null,
  foreign key(event_id,owner_id) references sskr_private.workflows(event_id,owner_id)
);
create table sskr_private.workflow_audit (
  id bigint generated always as identity primary key,
  event_id uuid not null,
  actor_id uuid,
  action text not null,
  epoch bigint not null,
  created_at timestamptz not null default now()
);
create table sskr_private.checkin_evidence (
  event_id uuid not null,
  owner_id uuid not null,
  request_id uuid not null,
  document jsonb not null,
  received_at timestamptz not null default now(),
  primary key(event_id,owner_id,request_id),
  foreign key(event_id,owner_id) references sskr_private.workflows(event_id,owner_id)
);
create index workflows_owner_idx on sskr_private.workflows(owner_id,event_id);
create index payment_orders_owner_idx on sskr_private.payment_orders(owner_id,event_id);
create index workflow_audit_event_idx on sskr_private.workflow_audit(event_id,id desc);
alter table sskr_private.commerce enable row level security;
alter table sskr_private.workflows enable row level security;
alter table sskr_private.payment_orders enable row level security;
alter table sskr_private.workflow_audit enable row level security;
alter table sskr_private.checkin_evidence enable row level security;
revoke all on sskr_private.commerce,sskr_private.workflows,sskr_private.payment_orders,
  sskr_private.workflow_audit,sskr_private.checkin_evidence from public,anon,authenticated;
create trigger checkin_evidence_immutable before update or delete on sskr_private.checkin_evidence
  for each row execute function sskr_private.reject_event_history_change();
create trigger workflow_audit_immutable before update or delete on sskr_private.workflow_audit
  for each row execute function sskr_private.reject_event_history_change();

create function public.sskr_workflow(p_action text,p_actor uuid default null,p_event uuid default null,
  p_data jsonb default '{}',p_version bigint default null,p_id text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
  ev jsonb;
  row sskr_private.commerce;
  doc jsonb;
  old_doc jsonb;
  attempt jsonb;
  base_used integer;
  extra_used integer;
  seq integer;
  result jsonb;
begin
  -- Interactive users are verified (including bans) by auth.actor in the BFF.
  -- Payment reconciliation/refunds must still work after an account is blocked.
  if p_actor is not null and not exists(select 1 from auth.users where id=p_actor
    and not coalesce(is_anonymous,false)) then raise exception 'FORBIDDEN'; end if;
  if p_action='order' then
    return (select jsonb_build_object('ownerId',owner_id,'eventId',event_id,'amount',amount,'state',state)
      from sskr_private.payment_orders where id=p_id);
  end if;
  if p_action='media' then
    return (select jsonb_build_object('media',m,'ownerId',w.owner_id,'eventId',w.event_id,
      'public',w.document#>>'{memorial,visibility}'='PUBLIC' and w.document#>>'{memorial,publishStatus}'='PUBLISHED'
        and m->>'moderationStatus'='APPROVED' and exists(select 1 from jsonb_array_elements(w.document#>'{memorial,visits}') v
          where v->>'id'=m->>'visitId' and v->>'photoConsent'='true' and exists(select 1 from jsonb_array_elements(v->'media') vm where vm->>'id'=p_id)))
      from sskr_private.workflows w cross join lateral jsonb_array_elements(coalesce(nullif(w.document->'media','null'),'[]')) m
      where m->>'id'=p_id limit 1);
  end if;
  if p_action='memorials' then
    return jsonb_build_object('items',coalesce((select jsonb_agg(w.document->'memorial' order by w.updated_at desc)
      from sskr_private.workflows w where (w.owner_id=p_actor or
      (w.document#>>'{memorial,visibility}'='PUBLIC' and w.document#>>'{memorial,publishStatus}'='PUBLISHED'))
      and jsonb_typeof(w.document->'memorial')='object'),'[]'::jsonb));
  end if;
  if p_action in ('configure','operations','evidence') and not exists(select 1 from sskr_private.event_operators where user_id=p_actor) then raise exception 'FORBIDDEN'; end if;
  if p_action='evidence' then
    return (select document||jsonb_build_object('receivedAt',received_at) from sskr_private.checkin_evidence
      where event_id=p_event and owner_id=(p_data->>'ownerId')::uuid and request_id=p_id::uuid);
  end if;
  perform pg_advisory_xact_lock_shared(7392,1);
  ev:=sskr_private.public_event();
  if p_event is null then p_event:=(ev->>'id')::uuid; end if;
  if p_event is null then return jsonb_build_object('event',null,'state','{}'::jsonb,'commerce','{}'::jsonb,'epoch',0); end if;
  if ev->>'id' is distinct from p_event::text then
    select document||jsonb_build_object('id',event_id,'configVersion',config_version,'publishedAt',published_at)
      into ev from sskr_private.event_publications where event_id=p_event order by config_version desc limit 1;
  end if;
  if ev is null then raise exception 'NOT_FOUND'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_event::text,7393));
  insert into sskr_private.commerce(event_id) values(p_event) on conflict do nothing;
  select * into row from sskr_private.commerce where event_id=p_event for update;
  if p_action='configure' then
    if p_version is distinct from row.epoch then raise exception 'CONFLICT'; end if;
    if jsonb_typeof(p_data) is distinct from 'object' then raise exception 'INVALID_INPUT'; end if;
    -- An open order freezes its pricing; capacity reductions must not oversell.
    update sskr_private.commerce set document=p_data,epoch=epoch+1,updated_at=now() where event_id=p_event returning * into row;
    insert into sskr_private.workflow_audit(event_id,actor_id,action,epoch) values(p_event,p_actor,'CONFIGURE',row.epoch);
  elsif p_action='commit' then
    if p_actor is null then raise exception 'FORBIDDEN'; end if;
    if p_version is distinct from row.epoch or (p_data->'configVersion') is distinct from (ev->'configVersion') then raise exception 'CONFLICT'; end if;
    doc:=p_data->'state';
    if jsonb_typeof(doc) is distinct from 'object' or octet_length(doc::text)>1048576 then raise exception 'INVALID_INPUT'; end if;
    select document into old_doc from sskr_private.workflows where event_id=p_event and owner_id=p_actor;
    if doc#>>'{participation,state}'='ACTIVE' and old_doc#>>'{participation,participantNumber}' is null then
      select coalesce(max((document#>>'{participation,participantNumber}')::integer),0)+1 into seq
        from sskr_private.workflows where event_id=p_event;
      doc:=jsonb_set(doc,'{participation,participantNumber}',to_jsonb(seq));
    end if;
    insert into sskr_private.workflows(event_id,owner_id,document) values(p_event,p_actor,doc)
      on conflict(event_id,owner_id) do update set document=excluded.document,updated_at=now();
    for attempt in select value from jsonb_array_elements(coalesce(nullif(doc->'paymentAttempts','null'),'[]')) loop
      insert into sskr_private.payment_orders(id,event_id,owner_id,amount,state)
        values(attempt->>'id',p_event,p_actor,(attempt->>'amount')::integer,attempt->>'state')
        on conflict(id) do update set state=excluded.state
        where sskr_private.payment_orders.owner_id=p_actor and sskr_private.payment_orders.event_id=p_event
          and sskr_private.payment_orders.amount=excluded.amount;
      if not found then raise exception 'INVALID_INPUT'; end if;
    end loop;
    if jsonb_typeof(p_data->'evidence')='object' then
      insert into sskr_private.checkin_evidence(event_id,owner_id,request_id,document)
        values(p_event,p_actor,(p_data#>>'{evidence,requestId}')::uuid,p_data->'evidence');
    end if;
    update sskr_private.commerce set epoch=epoch+1 where event_id=p_event returning * into row;
    insert into sskr_private.workflow_audit(event_id,actor_id,action,epoch)
      values(p_event,p_actor,left(coalesce(p_data->>'action','UPDATE'),80),row.epoch);
  elsif p_action not in ('read','operations') then raise exception 'INVALID_INPUT'; end if;
  select count(*) filter(where coalesce(document#>>'{participation,capacityPool}',document#>>'{checkoutHold,capacityPool}','BASE')='BASE'),
    count(*) filter(where coalesce(document#>>'{participation,capacityPool}',document#>>'{checkoutHold,capacityPool}','BASE')='PLATINUM_EXTRA')
    into base_used,extra_used from sskr_private.workflows where event_id=p_event and
    (document#>>'{participation,state}'='ACTIVE' or (document#>>'{checkoutHold,state}'='HELD' and
      ((document#>>'{checkoutHold,expiresAt}')::timestamptz>now() or exists(select 1 from jsonb_array_elements(coalesce(document->'paymentAttempts','[]')) a where a->>'state'='PROCESSING'))));
  if p_action in ('configure','commit') and (base_used>coalesce((row.document->>'baseCapacity')::int,0)
    or extra_used>coalesce((row.document->>'extraCapacity')::int,0)) then raise exception 'CAPACITY_FULL'; end if;
  result:=jsonb_build_object('event',ev,'commerce',row.document,'epoch',row.epoch,
    'history',coalesce((select jsonb_agg(jsonb_build_object('id',w.document#>>'{participation,id}','ownerUserId',w.owner_id,
      'eventId',w.event_id,'eventTitle',ep.document->>'publicTitle','eventDate',ep.document->>'eventStartAt',
      'participantNumber',w.document#>>'{participation,participantNumber}',
      'runResult',case when w.document#>>'{participation,runResult}'='NOT_STARTED' then 'NO_SHOW'
        when w.document#>>'{participation,runResult}'='STARTED' then 'RETIRED' else w.document#>>'{participation,runResult}' end,'synthetic',false))
      from sskr_private.workflows w join lateral(select document from sskr_private.event_publications
        where event_id=w.event_id order by config_version desc limit 1)ep on true
      where w.owner_id=p_actor and w.event_id<>p_event and w.document#>>'{participation,state}'='ACTIVE'
        and (ep.document->>'eventEndAt')::timestamptz<now()),'[]'::jsonb),
    'state',coalesce((select document from sskr_private.workflows where event_id=p_event and owner_id=p_actor),'{}'),
    'capacity',jsonb_build_object('baseUsed',base_used,'platinumExtraUsed',extra_used),
    'tierCounts',coalesce((select jsonb_object_agg(tier,total) from (select document#>>'{application,priceTierId}' tier,count(*) total
      from sskr_private.workflows where event_id=p_event and (document#>>'{participation,state}'='ACTIVE' or
      (document#>>'{checkoutHold,state}'='HELD' and ((document#>>'{checkoutHold,expiresAt}')::timestamptz>now() or
      exists(select 1 from jsonb_array_elements(coalesce(document->'paymentAttempts','[]')) a where a->>'state'='PROCESSING'))))
      group by document#>>'{application,priceTierId}') counts where tier is not null),'{}'::jsonb));
  if p_action='operations' then
    if coalesce(p_data->>'offset','0')!~'^[0-9]{1,6}$' then raise exception 'INVALID_INPUT'; end if;
    result:=result||jsonb_build_object('participants',coalesce((select jsonb_agg(jsonb_build_object('ownerId',owner_id,
      'application',document->'application','participation',document->'participation','refund',document->'refund',
      'run',case when jsonb_typeof(document->'run')='object' then (document->'run')-'rules'-'receipts' else null end,
      'media',document->'media','paymentState',document->'paymentAttempts'->-1->>'state'))
      from(select owner_id,document from sskr_private.workflows where event_id=p_event order by owner_id
        limit 50 offset coalesce((p_data->>'offset')::int,0)) page),'[]'::jsonb),
      'participantCount',(select count(*) from sskr_private.workflows where event_id=p_event));
  end if;
  return result;
end $$;

-- Private bucket: uploads use one-object signed tokens issued by the BFF;
-- downloads are proxied after a fresh ownership/publication check.
do $$ begin
  if to_regclass('storage.buckets') is not null then
    execute $bucket$insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
      values('sskr-visit-photos','sskr-visit-photos',false,8388608,array['image/jpeg','image/png','image/webp'])
      on conflict(id) do update set public=false,file_size_limit=8388608,
        allowed_mime_types=array['image/jpeg','image/png','image/webp']$bucket$;
  end if;
end $$;
revoke all on function public.sskr_workflow(text,uuid,uuid,jsonb,bigint,text) from public,anon,authenticated;
do $$ begin
  if exists(select 1 from pg_roles where rolname='service_role') then
    grant execute on function public.sskr_workflow(text,uuid,uuid,jsonb,bigint,text) to service_role;
  end if;
end $$;
