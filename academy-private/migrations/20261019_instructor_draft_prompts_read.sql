-- IAgile Academy: draft exercise preview for assigned active instructors.
-- PROPOSED ONLY (2026-10-19). Do NOT apply before independent security review,
-- isolated Auth/RLS tests, and explicit approval. No premium content in this file.
-- Mirrors academy_instructor_draft_modules_read without changing learner access.
-- Requires existing SELECT grant to authenticated and RLS on this table.
--
-- Acceptance before applying to production:
-- A) active assigned instructor: sees unpublished prompts for assigned course only;
-- B) active instructor of another course: sees none;
-- C) inactive assigned instructor: sees none;
-- D) enrolled learner, non-enrolled user, anon: see no unpublished prompts;
-- E) published-course/learner policies remain unchanged; no INSERT/UPDATE grant.
--
-- Apply in a controlled migration only after approval and rollback plan.
create policy academy_instructor_draft_prompts_read
on public.academy_deliverable_prompts
for select to authenticated
using (
  not published
  and exists (
    select 1
    from public.academy_instructor_courses i
    join public.academy_profiles p on p.user_id = i.instructor_id
    where i.instructor_id = (select auth.uid())
      and i.course_slug = academy_deliverable_prompts.course_slug
      and p.account_status = 'active'
  )
);
