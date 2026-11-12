-- IAgile Academy: synthetic end-to-end RLS/grade test.
-- Run manually as the project's database admin using one connection.
-- This test temporarily inserts synthetic users and publishes two course records
-- INSIDE a transaction, then ROLLBACK removes every synthetic change.
-- Never replace ROLLBACK with COMMIT. Never use actual student data.
begin;

create temp table qa_ids on commit drop as
select gen_random_uuid() learner_a,gen_random_uuid() learner_b,gen_random_uuid() teacher;
grant select on pg_temp.qa_ids to authenticated;
create temp table qa_old_version(answer_updated_at timestamptz) on commit drop;
grant select on pg_temp.qa_old_version to authenticated;

insert into auth.users(id,instance_id,aud,role,email,created_at,updated_at)
select x.id,'00000000-0000-0000-0000-000000000000'::uuid,'authenticated','authenticated',
'iagile-qa-'||x.id||'@example.invalid',now(),now()
from pg_temp.qa_ids q
cross join lateral (values(q.learner_a),(q.learner_b),(q.teacher)) x(id);

insert into public.academy_profiles(user_id,display_name,account_status)
select x.id,x.name,'active'
from pg_temp.qa_ids q
cross join lateral (values(q.learner_a,'QA learner A'),(q.learner_b,'QA learner B'),(q.teacher,'QA instructor')) x(id,name);

update public.academy_courses set published=true where slug in('processus','agents');
update public.academy_course_modules set published=true where module_index=0 and course_slug in('processus','agents');
update public.academy_deliverable_prompts set published=true where deliverable_index=0 and course_slug in('processus','agents');
insert into public.academy_enrollments(user_id,course_slug,active,source)
select learner_a,'processus',true,'pilot' from pg_temp.qa_ids
union all select learner_b,'agents',true,'pilot' from pg_temp.qa_ids;
insert into public.academy_instructor_courses(instructor_id,course_slug)
select teacher,'processus' from pg_temp.qa_ids;

select set_config('request.jwt.claim.sub',(select learner_a::text from pg_temp.qa_ids),true);
set local role authenticated;
do $$begin
  if(select count(*) from public.academy_course_modules where module_index=0)<>1
  then raise exception 'Learner A accessed wrong modules';end if;
end$$;
insert into public.academy_deliverable_answers(user_id,course_slug,deliverable_index,content)
values ((select learner_a from pg_temp.qa_ids),'processus',0,'Version initiale du test A');
reset role;
insert into pg_temp.qa_old_version
select updated_at from public.academy_deliverable_answers
where user_id=(select learner_a from pg_temp.qa_ids);

select set_config('request.jwt.claim.sub',(select teacher::text from pg_temp.qa_ids),true);
set local role authenticated;
insert into public.academy_deliverable_feedback(user_id,course_slug,deliverable_index,instructor_id,status,feedback_text,answer_updated_at)
values ((select learner_a from pg_temp.qa_ids),'processus',0,(select teacher from pg_temp.qa_ids),
'validated','Une première version correctement évaluée dans le test.',(select answer_updated_at from pg_temp.qa_old_version));
reset role;

select set_config('request.jwt.claim.sub',(select learner_b::text from pg_temp.qa_ids),true);
set local role authenticated;
do $$begin
  if exists(select 1 from public.academy_deliverable_feedback)
  then raise exception 'Cross-learner private grade exposure';end if;
  if(select count(*) from public.academy_course_modules where module_index=0)<>1
  then raise exception 'Cross-learner lesson exposure';end if;
end$$;
reset role;

select set_config('request.jwt.claim.sub',(select learner_a::text from pg_temp.qa_ids),true);
set local role authenticated;
update public.academy_deliverable_answers
set content='Version corrigée du test A'
where user_id=(select learner_a from pg_temp.qa_ids) and course_slug='processus' and deliverable_index=0;
do $$begin
  if exists(select 1 from public.academy_deliverable_feedback)
  then raise exception 'Old grade survived learner revision';end if;
end$$;
reset role;

do $$begin
  if (select updated_at from public.academy_deliverable_answers where user_id=(select learner_a from pg_temp.qa_ids))
      <=(select answer_updated_at from pg_temp.qa_old_version)
  then raise exception 'Answer revision timestamp did not advance';end if;
end$$;

select set_config('request.jwt.claim.sub',(select teacher::text from pg_temp.qa_ids),true);
set local role authenticated;
do $$begin
  begin
    insert into public.academy_deliverable_feedback(user_id,course_slug,deliverable_index,instructor_id,status,feedback_text,answer_updated_at)
    values ((select learner_a from pg_temp.qa_ids),'processus',0,(select teacher from pg_temp.qa_ids),
      'validated','Tentative de correction de la mauvaise version.',(select answer_updated_at from pg_temp.qa_old_version));
    raise exception 'Stale grade was incorrectly accepted';
  exception when check_violation then null;
  end;
end$$;
insert into public.academy_deliverable_feedback(user_id,course_slug,deliverable_index,instructor_id,status,feedback_text,answer_updated_at)
select a.user_id,a.course_slug,a.deliverable_index,(select teacher from pg_temp.qa_ids),
'validated','Validation légitime de la version actuellement soumise.',a.updated_at
from public.academy_deliverable_answers a where a.user_id=(select learner_a from pg_temp.qa_ids);
do $$begin
  if(select count(*) from public.academy_deliverable_feedback)<>1
  then raise exception 'Authorized current grade missing';end if;
end$$;
reset role;

rollback;
select 'PASS: RLS and revision-locked review tested; no rows retained' as status;
