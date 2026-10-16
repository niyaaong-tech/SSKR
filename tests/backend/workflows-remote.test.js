'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto'),{promisify}=require('node:util'),{execFile}=require('node:child_process');
const fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');
const project='rdskiwnrzmrppsuwbavg';
test('development workflows: service-only RPC, atomic capacity/version checks, private bucket, rollback isolation',{skip:process.env.SSKR_REMOTE_TEST!==project,timeout:60000},async()=>{
  const users=[randomUUID(),randomUUID()],event=randomUUID(),session=randomUUID();
  const directory=await fs.mkdtemp(path.join(os.tmpdir(),'sskr-workflow-test-')),file=path.join(directory,'check.sql');
  const sql=`begin;
    insert into auth.users(id,aud,role,email,is_anonymous) values
      ('${users[0]}','authenticated','authenticated','${users[0]}@sskr-test.invalid',false),
      ('${users[1]}','authenticated','authenticated','${users[1]}@sskr-test.invalid',false);
    insert into sskr_private.event_operators(user_id) values('${users[0]}');
    insert into auth.identities(provider_id,user_id,identity_data,provider) values('${users[0]}','${users[0]}','{"sub":"${users[0]}"}','google');
    insert into auth.sessions(id,user_id,created_at,updated_at) values('${session}','${users[0]}',now(),now());
    select set_config('request.jwt.claims','{"sub":"${users[0]}","session_id":"${session}"}',true);
    insert into sskr_private.event_drafts(id,document) values('${event}','{}');
    insert into sskr_private.event_publications(event_id,config_version,actor_id,document)
      values('${event}',1,'${users[0]}','{"publicTitle":"rollback workflow fixture","eventEndAt":"2099-01-01T00:00:00Z"}');
    set local role authenticated;
    do $test$ begin
      perform public.sskr_profile('{"name":"profile fixture","email":"contact@example.invalid","phone":"01012345678"}',0);
      if public.sskr_profile()#>>'{profile,email}'<>'contact@example.invalid' then raise exception 'profile write failed';end if;
      begin perform public.sskr_workflow('read');raise exception 'client RPC leaked';
      exception when insufficient_privilege then null;end;
      begin perform public.sskr_maintenance();raise exception 'maintenance leaked';
      exception when insufficient_privilege then null;end;
      begin perform public.sskr_memorial_media('${users[0]}');raise exception 'photo inventory leaked';
      exception when insufficient_privilege then null;end;
    end $test$;
    reset role;set local role service_role;
    do $test$ declare s jsonb; doc jsonb; begin
      s:=public.sskr_workflow('configure','${users[0]}','${event}','{"baseCapacity":1,"extraCapacity":0}',0);
      doc:=jsonb_build_object('paymentAttempts','[]'::jsonb,'participation',jsonb_build_object('state','ACTIVE','userId','${users[0]}','capacityPool','BASE'));
      s:=public.sskr_workflow('commit','${users[0]}','${event}',jsonb_build_object('configVersion',1,'state',doc),1);
      if s#>>'{state,participation,participantNumber}'<>'1' or s#>>'{capacity,baseUsed}'<>'1' then raise exception 'allocation failed';end if;
      begin perform public.sskr_workflow('commit','${users[1]}','${event}',jsonb_build_object('configVersion',1,'state',doc),2);raise exception 'oversold';
        exception when others then if sqlerrm<>'CAPACITY_FULL' then raise;end if;end;
      begin perform public.sskr_workflow('commit','${users[0]}','${event}',jsonb_build_object('configVersion',1,'state',doc),1);raise exception 'stale accepted';
        exception when others then if sqlerrm<>'CONFLICT' then raise;end if;end;
      s:=public.sskr_workflow('read','${users[1]}','${event}');
      if s->'state'<>'{}'::jsonb then raise exception 'failed transaction persisted';end if;
    end $test$;
    reset role;
    do $test$ begin
      if not exists(select 1 from storage.buckets where id='sskr-visit-photos' and public=false and file_size_limit=8388608)
        then raise exception 'private bucket missing';end if;
    end $test$;
    rollback;
    select not exists(select 1 from auth.users where id in ('${users[0]}','${users[1]}')) as cleaned,
      not exists(select 1 from sskr_private.event_drafts where id='${event}') as event_cleaned;`;
  try{
    await fs.writeFile(file,sql);
    const {stdout}=await promisify(execFile)(process.execPath,[path.resolve('node_modules/supabase/dist/supabase.js'),'db','query','--linked','--project-ref',project,'--file',file,'-o','json'],{windowsHide:true,timeout:50000,maxBuffer:1024*1024});
    const rows=JSON.parse(stdout).rows;assert.equal(rows.at(-1).cleaned,true);assert.equal(rows.at(-1).event_cleaned,true);
  }catch(error){throw Error(String(error.stderr||error.message).slice(0,2000));}
  finally{await fs.rm(file,{force:true});await fs.rmdir(directory);}
});
