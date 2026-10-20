-- Already applied to Supabase IAgile Academy on 10 October 2026.
-- Defense in depth: signed Storage URLs require an active, published
-- course and the caller's current enrollment or instructor assignment.
-- This does not revoke signed URLs that have already been issued;
-- the learner app issues links lasting only 60 seconds.
alter policy academy_private_course_file_select on storage.objects
  to authenticated
  using (
    bucket_id = 'iagile-course-files'
    and exists (
      select 1 from public.academy_course_assets a
      join public.academy_courses c on c.slug=a.course_slug
      where a.storage_path=objects.name
        and a.published
        and c.published
        and (
          exists (
            select 1 from public.academy_enrollments e
            join public.academy_profiles p on p.user_id=e.user_id
            where e.user_id=(select auth.uid())
              and e.course_slug=a.course_slug
              and e.active and p.account_status='active'
          )
          or exists (
            select 1 from public.academy_instructor_courses i
            join public.academy_profiles p on p.user_id=i.instructor_id
            where i.instructor_id=(select auth.uid())
              and i.course_slug=a.course_slug
              and p.account_status='active'
          )
        )
    )
  );