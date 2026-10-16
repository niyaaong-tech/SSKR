-- Match the established route/event boundary: public invoker wrapper,
-- private privilege-bearing implementation with strict live-session ownership.
alter function public.sskr_profile(jsonb,bigint) set schema sskr_private;
alter function sskr_private.sskr_profile(jsonb,bigint) rename to profile_api;
revoke all on function sskr_private.profile_api(jsonb,bigint) from public,anon;
grant execute on function sskr_private.profile_api(jsonb,bigint) to authenticated;
create function public.sskr_profile(p_data jsonb default null,p_revision bigint default null)
returns jsonb language sql security invoker set search_path='' as $$
 select sskr_private.profile_api(p_data,p_revision);
$$;
revoke all on function public.sskr_profile(jsonb,bigint) from public,anon;
grant execute on function public.sskr_profile(jsonb,bigint) to authenticated;
