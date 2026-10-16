-- An unfinished draft may store SQL NULL, an absent property or JSON null for
-- sunlight. Only JSON objects can participate in the copied-review comparison.
create or replace function sskr_private.events_api(p_action text, p_id uuid default null, p_document jsonb default null, p_revision bigint default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  operator_id uuid := sskr_private.actor();
  existing sskr_private.event_drafts;
  row_id uuid := coalesce(p_id,gen_random_uuid());
  doc jsonb;
  previous_light jsonb;
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
      previous_light := case when jsonb_typeof(existing.document->'sunlight')='object'
        then existing.document->'sunlight' else '{}'::jsonb end;
      -- A copied review cannot remain approved after its date or places change.
      if p_id is not null and (
        ((existing.document->>'eventStartAt')::timestamptz at time zone 'Asia/Seoul')::date is distinct from ((doc->>'eventStartAt')::timestamptz at time zone 'Asia/Seoul')::date
        or existing.document->'startLocationIds' is distinct from doc->'startLocationIds'
        or existing.document->>'finishLocationId' is distinct from doc->>'finishLocationId'
      ) and ((doc->'sunlight') - array['eventId','date','timezone','configVersion'])
        = (previous_light - array['eventId','date','timezone','configVersion']) then
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
revoke all on function sskr_private.events_api(text,uuid,jsonb,bigint) from public,anon;
grant execute on function sskr_private.events_api(text,uuid,jsonb,bigint) to authenticated;
