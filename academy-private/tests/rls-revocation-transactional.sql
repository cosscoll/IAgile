-- IAgile Academy — Revocation and suspension RLS regression test.
-- Run manually as database admin. Synthetic accounts exist only within BEGIN/ROLLBACK.
-- This file must never be executed with COMMIT.
begin;
create temp table qa_ids on commit drop as select gen_random_uuid() learner,gen_random_uuid() instructor;
grant select on pg_temp.qa_ids to authenticated;

insert into auth.users(id,instance_id,aud,role,email,created_at,updated_at)
select u.id,'00000000-0000-0000-0000-000000000000'::uuid,'authenticated','authenticated',
'iagile-qa-revoke-'||u.id||'@example.invalid',now(),now()
from pg_temp.qa_ids q cross join lateral(values(q.learner),(q.instructor)) u(id);
insert into public.academy_profiles(user_id,display_name,account_status)
select u.id,u.name,'active' from pg_temp.qa_ids q
cross join lateral(values(q.learner,'QA learner'),(q.instructor,'QA instructor')) u(id,name);
update public.academy_courses set published=true where slug='processus';
update public.academy_course_modules set published=true where course_slug='processus' and module_index=0;
update public.academy_deliverable_prompts set published=true where course_slug='processus' and deliverable_index=0;
insert into public.academy_enrollments(user_id,course_slug,active,source)
select learner,'processus',true,'pilot' from pg_temp.qa_ids;
insert into public.academy_instructor_courses(instructor_id,course_slug)
select instructor,'processus' from pg_temp.qa_ids;

select set_config('request.jwt.claim.sub',(select learner::text from pg_temp.qa_ids),true);
set local role authenticated;
do $$begin
 if(select count(*) from public.academy_course_modules where course_slug='processus' and module_index=0)<>1
 then raise exception 'Before revocation: learner should see one authorized module';end if;
end$$;
insert into public.academy_deliverable_answers(user_id,course_slug,deliverable_index,content)
values ((select learner from pg_temp.qa_ids),'processus',0,'Temporary synthetic practice answer');
reset role;

update public.academy_enrollments set active=false where user_id=(select learner from pg_temp.qa_ids);
select set_config('request.jwt.claim.sub',(select learner::text from pg_temp.qa_ids),true);
set local role authenticated;
do $$begin
 if exists(select 1 from public.academy_course_modules where course_slug='processus')
 then raise exception 'Revoked learner still sees private lesson';end if;
 if exists(select 1 from public.academy_deliverable_answers)
 then raise exception 'Revoked learner still sees private submission';end if;
end$$;
reset role;

select set_config('request.jwt.claim.sub',(select instructor::text from pg_temp.qa_ids),true);
set local role authenticated;
do $$begin
 if exists(select 1 from public.academy_deliverable_answers)
 then raise exception 'Instructor still sees revoked learner submission';end if;
end$$;
reset role;

update public.academy_enrollments set active=true where user_id=(select learner from pg_temp.qa_ids);
update public.academy_profiles set account_status='suspended' where user_id=(select learner from pg_temp.qa_ids);
select set_config('request.jwt.claim.sub',(select learner::text from pg_temp.qa_ids),true);
set local role authenticated;
do $$begin
 if exists(select 1 from public.academy_course_modules where course_slug='processus')
 then raise exception 'Suspended learner still sees private lesson';end if;
end$$;
reset role;

update public.academy_profiles set account_status='active' where user_id=(select learner from pg_temp.qa_ids);
update public.academy_profiles set account_status='suspended' where user_id=(select instructor from pg_temp.qa_ids);
select set_config('request.jwt.claim.sub',(select instructor::text from pg_temp.qa_ids),true);
set local role authenticated;
do $$begin
 if exists(select 1 from public.academy_deliverable_answers)
 then raise exception 'Suspended instructor still sees student submission';end if;
end$$;
reset role;

rollback;
select 'PASS — role revocation and suspension, no data retained' as result;
