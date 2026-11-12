-- Already applied to IAgile Academy Supabase on 2026-10-11.
-- Authorized instructors may upload ONLY approved unpublished asset paths,
-- directly to the private Storage bucket without any service-role credential
-- in the browser. Learners and unauthenticated users have no INSERT privilege.
create or replace function academy_private.can_manage_draft_asset(path text)
returns boolean language sql stable security definer set search_path = ''
as $fn$
  select (select auth.uid()) is not null
    and exists(
      select 1
      from public.academy_course_assets a
      join public.academy_instructor_courses i on i.course_slug=a.course_slug
      join public.academy_profiles p on p.user_id=i.instructor_id
      join public.academy_courses c on c.slug=a.course_slug
      where a.storage_path=path
        and a.content_sha256 is not null
        and a.content_bytes is not null
        and a.published=false
        and c.published=false
        and i.instructor_id=(select auth.uid())
        and p.account_status='active'
    );
$fn$;
revoke all on function academy_private.can_manage_draft_asset(text) from public,anon,authenticated;
grant execute on function academy_private.can_manage_draft_asset(text) to authenticated;
create policy academy_instructor_draft_asset_metadata
on public.academy_course_assets for select to authenticated
using (
 exists(
    select 1 from public.academy_instructor_courses i
    join public.academy_profiles p on p.user_id=i.instructor_id
    join public.academy_courses c on c.slug=i.course_slug
    where i.course_slug=academy_course_assets.course_slug
      and i.instructor_id=(select auth.uid())
      and p.account_status='active'
      and c.published=false
 )
);
create policy academy_instructor_private_file_insert
on storage.objects for insert to authenticated
with check (
  bucket_id='iagile-course-files'
  and (select academy_private.can_manage_draft_asset(name))
);
create policy academy_instructor_private_draft_file_read
on storage.objects for select to authenticated
using (
  bucket_id='iagile-course-files'
  and (select academy_private.can_manage_draft_asset(name))
);