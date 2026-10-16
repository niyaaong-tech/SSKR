-- Existing routes remain readable/deletable when an event removes a start.
-- Only an explicit new route, edit or schedule write must use a current start.
create or replace function sskr_private.event_routes_api(p_action text, p_id uuid default null, p_plan jsonb default null,
  p_schedule jsonb default null,p_revision bigint default null,p_key text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  current_document jsonb;
  route_owner uuid := sskr_private.actor();
  selected_start text;
begin
  if p_action in ('save','schedule') then
    -- The publication lock also covers a previously unpublished event. The owner
    -- lock stabilizes a stored start read by the schedule-only mutation.
    perform pg_advisory_xact_lock_shared(7392,1);
    perform pg_advisory_xact_lock(hashtextextended(route_owner::text,7391));
    if p_action='save' and p_id is null
      and exists(select 1 from sskr_private.route_requests r where r.owner_id=route_owner and r.request_key=p_key)
    then
      -- Return the original committed result even if its start was later removed.
      -- A changed payload under the old key is still an idempotency conflict.
      return sskr_private.routes_api(p_action,p_id,p_plan,p_schedule,p_revision,p_key);
    end if;
    current_document := sskr_private.public_event();
    if p_schedule ? 'eventId' or p_schedule ? 'configVersion' then
      if coalesce(p_schedule->'eventId','null'::jsonb) is distinct from coalesce(current_document->'id','null'::jsonb)
        or coalesce(p_schedule->'configVersion','null'::jsonb) is distinct from coalesce(current_document->'configVersion','null'::jsonb)
      then raise exception 'EVENT_CHANGED'; end if;
    end if;
    if p_action='schedule' then
      select r.plan->>'startId' into selected_start from sskr_private.routes r where r.id=p_id and r.owner_id=route_owner;
      if not found then raise exception 'ROUTE_NOT_FOUND'; end if;
    else
      selected_start := p_plan->>'startId';
    end if;
    -- A draft without a selected start is valid. A chosen start must be one of
    -- the public event's locations, including clients without expected metadata.
    if current_document is not null and selected_start is not null
      and not ((current_document->'startLocationIds') ? selected_start)
    then raise exception 'EVENT_START_UNAVAILABLE'; end if;
  end if;
  return sskr_private.routes_api(p_action,p_id,p_plan,p_schedule,p_revision,p_key);
end $$;
revoke all on function sskr_private.event_routes_api(text,uuid,jsonb,jsonb,bigint,text) from public,anon;
grant execute on function sskr_private.event_routes_api(text,uuid,jsonb,jsonb,bigint,text) to authenticated;
-- Keep the event checks mandatory for the public route RPC.
revoke execute on function sskr_private.routes_api(text,uuid,jsonb,jsonb,bigint,text) from authenticated;
