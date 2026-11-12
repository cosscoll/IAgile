-- Applied 11 October 2026. Replaces two permissive SELECT policies with
-- the exact same union of authorized learner and instructor access.
-- This prevents repeated policy checks on each asset read.
alter policy academy_assets_read on public.academy_course_assets
using (
 (
  published and exists(select 1 from public.academy_courses c
   where c.slug=academy_course_assets.course_slug and c.published)
  and (
   exists(select 1 from public.academy_enrollments e
    join public.academy_profiles p on p.user_id=e.user_id
    where e.user_id=(select auth.uid()) and e.course_slug=academy_course_assets.course_slug
      and e.active and p.account_status='active')
   or exists(select 1 from public.academy_instructor_courses i
    join public.academy_profiles p on p.user_id=i.instructor_id
    where i.instructor_id=(select auth.uid()) and i.course_slug=academy_course_assets.course_slug
      and p.account_status='active')
  )
 )
 or exists(select 1 from public.academy_instructor_courses i
   join public.academy_profiles p on p.user_id=i.instructor_id
   join public.academy_courses c on c.slug=i.course_slug
   where i.course_slug=academy_course_assets.course_slug
     and i.instructor_id=(select auth.uid())
     and p.account_status='active' and c.published=false)
);
drop policy academy_instructor_draft_asset_metadata on public.academy_course_assets;
