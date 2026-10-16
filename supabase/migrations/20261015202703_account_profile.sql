create table sskr_private.account_profiles (
 owner_id uuid primary key references auth.users(id) on delete cascade,
 profile jsonb not null default '{}',revision bigint not null default 0,
 updated_at timestamptz not null default now()
);
alter table sskr_private.account_profiles enable row level security;
revoke all on sskr_private.account_profiles from public,anon,authenticated;
create function public.sskr_profile(p_data jsonb default null,p_revision bigint default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid:=sskr_private.actor();r sskr_private.account_profiles;
begin
 if p_data is not null then
  if jsonb_typeof(p_data)<>'object' or length(coalesce(p_data->>'name','')) not between 1 and 100
   or length(coalesce(p_data->>'email',''))>254 or coalesce(p_data->>'email','')!~'^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
   or coalesce(p_data->>'phone','')!~'^01[0-9]{8,9}$'
   or exists(select 1 from jsonb_object_keys(p_data) k where k not in ('name','email','phone')) then raise exception 'INVALID_INPUT';end if;
  insert into sskr_private.account_profiles(owner_id) values(actor_id) on conflict do nothing;
  select * into r from sskr_private.account_profiles where owner_id=actor_id for update;
  if p_revision is distinct from r.revision then raise exception 'CONFLICT';end if;
  update sskr_private.account_profiles set profile=p_data,revision=revision+1,updated_at=now() where owner_id=actor_id;
 end if;
 select * into r from sskr_private.account_profiles where owner_id=actor_id;
 return jsonb_build_object('profile',coalesce(r.profile,'{}'),'revision',coalesce(r.revision,0));
end $$;
revoke all on function public.sskr_profile(jsonb,bigint) from public,anon;
grant execute on function public.sskr_profile(jsonb,bigint) to authenticated;
