-- Applied to IAgile Academy, migration academy_feedback_optimistic_revision_lock (2026-10-10).
-- Prevent grading an answer revision that has changed after the instructor opened it.
alter table public.academy_deliverable_feedback
add column answer_updated_at timestamptz not null default now();

create or replace function academy_private.stamp_revised_answer()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at = greatest(pg_catalog.clock_timestamp(), old.updated_at + interval '1 microsecond');
  return new;
end;
$$;
revoke all on function academy_private.stamp_revised_answer() from public, anon, authenticated;
drop trigger if exists academy_answer_touch_on_edit on public.academy_deliverable_answers;
create trigger academy_answer_touch_on_edit
before update of content on public.academy_deliverable_answers
for each row when (old.content is distinct from new.content)
execute function academy_private.stamp_revised_answer();

create or replace function academy_private.reject_stale_deliverable_grade()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  actual_updated_at timestamptz;
begin
  select a.updated_at into actual_updated_at
  from public.academy_deliverable_answers a
  where a.user_id = new.user_id
    and a.course_slug = new.course_slug
    and a.deliverable_index = new.deliverable_index
  for share;
  if actual_updated_at is null or actual_updated_at is distinct from new.answer_updated_at then
    raise exception 'This submission changed since the instructor reviewed it'
    using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function academy_private.reject_stale_deliverable_grade() from public, anon, authenticated;
drop trigger if exists academy_feedback_verify_answer_version on public.academy_deliverable_feedback;
create trigger academy_feedback_verify_answer_version
before insert or update on public.academy_deliverable_feedback
for each row execute function academy_private.reject_stale_deliverable_grade();
