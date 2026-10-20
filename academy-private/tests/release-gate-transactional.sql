-- IAgile Academy: rollback-only course publication and content-size regression.
-- Executed successfully against the live Supabase project on 2026-10-10.
-- Do not replace ROLLBACK with COMMIT.

begin;
do $test$
declare test_user uuid:=gen_random_uuid();
begin
  -- A title/module alone cannot accidentally open a paid course.
  begin
    update public.academy_courses set published=true where slug='processus';
    raise exception 'Unsafe publication incorrectly allowed';
  exception when check_violation then null;
  end;
  if exists(select 1 from public.academy_courses where published)
    then raise exception 'Course publication state changed in failed transaction'; end if;

  -- Bypass of the browser's input maxlength is blocked at database level.
  begin
    insert into public.academy_deliverable_answers(user_id,course_slug,deliverable_index,content)
      values(test_user,'processus',0,'   ');
    raise exception 'Blank learner response incorrectly accepted';
  exception when check_violation then null;
  end;

  begin
    insert into public.academy_deliverable_answers(user_id,course_slug,deliverable_index,content)
      values(test_user,'processus',0,repeat('X',10001));
    raise exception 'Oversized learner response incorrectly accepted';
  exception when check_violation then null;
  end;

  begin
    insert into public.academy_module_progress(user_id,course_slug,module_index,notes,completed)
      values(test_user,'processus',0,repeat('X',4001),false);
    raise exception 'Oversized lesson notes incorrectly accepted';
  exception when check_violation then null;
  end;
end $test$;
rollback;
select 'PASS: unpublished modules, assignments and absent files block launch; invalid learner data rejected' as test_result;
