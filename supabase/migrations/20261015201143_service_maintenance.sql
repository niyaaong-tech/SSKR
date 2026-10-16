-- Server-side housekeeping inventory. No browser role may enumerate owners.
create function public.sskr_maintenance() returns jsonb
language sql security definer set search_path='' as $$
select jsonb_build_object(
 'orders',coalesce((select jsonb_agg(to_jsonb(q)) from (
   select p.id,p.event_id as "eventId",p.owner_id as "ownerId" from sskr_private.payment_orders p
   join sskr_private.workflows w on w.event_id=p.event_id and w.owner_id=p.owner_id
   where p.state in ('PENDING','PROCESSING') order by w.updated_at,p.id limit 50
 ) q),'[]'::jsonb),
 'photos',coalesce((select jsonb_agg(to_jsonb(q)) from (
   select w.event_id as "eventId",w.owner_id as "ownerId",m->>'id' as id
   from sskr_private.workflows w cross join lateral jsonb_array_elements(coalesce(nullif(w.document->'media','null'),'[]')) m
   where m->>'status' in ('UPLOADING','REMOVED') and m->>'purgedAt' is null
     and (m->>'createdAt')::timestamptz<now()-interval '3 hours'
   order by (m->>'createdAt')::timestamptz,m->>'id' limit 50
 ) q),'[]'::jsonb)
);
$$;
revoke all on function public.sskr_maintenance() from public,anon,authenticated;
do $$ begin
 if exists(select 1 from pg_roles where rolname='service_role') then
   grant execute on function public.sskr_maintenance() to service_role;
 end if;
end $$;

create function public.sskr_memorial_media(p_actor uuid) returns jsonb
language sql security definer set search_path='' as $$
 select coalesce(jsonb_agg(m),'[]'::jsonb) from sskr_private.workflows w
 cross join lateral jsonb_array_elements(coalesce(nullif(w.document->'media','null'),'[]')) m
 where w.owner_id=p_actor and m->>'status'='READY';
$$;
revoke all on function public.sskr_memorial_media(uuid) from public,anon,authenticated;
do $$ begin
 if exists(select 1 from pg_roles where rolname='service_role') then
  grant execute on function public.sskr_memorial_media(uuid) to service_role;
 end if;
end $$;
