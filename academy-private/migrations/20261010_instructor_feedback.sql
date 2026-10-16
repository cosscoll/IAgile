-- Already applied to project daabfmdlgcwcykevvrcm on 2026-10-10.
-- Instructor feedback is private to the enrolled learner and assigned, active instructors.
create table if not exists public.academy_deliverable_feedback (
  user_id uuid not null,
  course_slug text not null,
  deliverable_index integer not null,
  instructor_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('validated','needs_revision')),
  feedback_text text not null check (char_length(trim(feedback_text)) between 20 and 5000),
  reviewed_at timestamptz not null default now(),
  primary key (user_id, course_slug, deliverable_index),
  foreign key (user_id,course_slug,deliverable_index)
    references public.academy_deliverable_answers(user_id,course_slug,deliverable_index) on delete cascade
);
create index if not exists academy_feedback_instructor_idx
  on public.academy_deliverable_feedback (instructor_id,reviewed_at desc);
alter table public.academy_deliverable_feedback enable row level security;
revoke all on public.academy_deliverable_feedback from public,anon,authenticated;
grant select,insert,update on public.academy_deliverable_feedback to authenticated;
create policy academy_feedback_read on public.academy_deliverable_feedback
for select to authenticated using (
  (
    user_id=(select auth.uid())
    and exists (
      select 1 from public.academy_enrollments e
      join public.academy_profiles p on p.user_id=e.user_id
      where e.user_id=academy_deliverable_feedback.user_id
      and e.course_slug=academy_deliverable_feedback.course_slug
      and e.active and p.account_status='active'
    )
  )
  or (
    (select academy_private.current_instructor_active())
    and exists (
      select 1 from public.academy_instructor_courses i
      join public.academy_enrollments e on e.course_slug=i.course_slug
      where i.instructor_id=(select auth.uid())
      and i.course_slug=academy_deliverable_feedback.course_slug
      and e.user_id=academy_deliverable_feedback.user_id and e.active
    )
  )
);
create policy academy_feedback_insert on public.academy_deliverable_feedback
for insert to authenticated with check (
  instructor_id=(select auth.uid())
  and (select academy_private.current_instructor_active())
  and exists (
    select 1 from public.academy_instructor_courses i
    join public.academy_enrollments e on e.course_slug=i.course_slug
    join public.academy_courses c on c.slug=i.course_slug
    where i.instructor_id=(select auth.uid())
    and i.course_slug=academy_deliverable_feedback.course_slug
    and e.user_id=academy_deliverable_feedback.user_id
    and e.active and c.published
  )
);
create policy academy_feedback_update on public.academy_deliverable_feedback
for update to authenticated
using (
  instructor_id=(select auth.uid())
  and (select academy_private.current_instructor_active())
  and exists (
    select 1 from public.academy_instructor_courses i
    where i.instructor_id=(select auth.uid())
    and i.course_slug=academy_deliverable_feedback.course_slug
  )
)
with check (
  instructor_id=(select auth.uid())
  and (select academy_private.current_instructor_active())
  and exists (
    select 1 from public.academy_instructor_courses i
    join public.academy_enrollments e on e.course_slug=i.course_slug
    join public.academy_courses c on c.slug=i.course_slug
    where i.instructor_id=(select auth.uid())
    and i.course_slug=academy_deliverable_feedback.course_slug
    and e.user_id=academy_deliverable_feedback.user_id
    and e.active and c.published
  )
);
