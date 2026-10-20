-- Applied to IAgile Academy, migration academy_invalidate_review_on_resubmission (2026-10-10).
-- Feedback about a prior version must not remain "validated" after content changes.
create or replace function academy_private.invalidate_stale_deliverable_feedback()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.academy_deliverable_feedback
  where user_id = new.user_id
    and course_slug = new.course_slug
    and deliverable_index = new.deliverable_index;
  return new;
end;
$$;
revoke all on function academy_private.invalidate_stale_deliverable_feedback() from public, anon, authenticated;
drop trigger if exists academy_answer_revision_invalidates_feedback on public.academy_deliverable_answers;
create trigger academy_answer_revision_invalidates_feedback
after update of content on public.academy_deliverable_answers
for each row
when (old.content is distinct from new.content)
execute function academy_private.invalidate_stale_deliverable_feedback();
