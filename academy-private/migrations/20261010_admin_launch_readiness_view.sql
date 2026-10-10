-- Applied on IAgile Academy on 2026-10-10.
-- Operational readiness dashboard; not exposed to anon or authenticated users.
create or replace view academy_private.course_launch_readiness
with (security_invoker = true)
as
select c.slug,c.title,c.published as course_published,
  (select count(*) from public.academy_course_modules m where m.course_slug=c.slug) as module_count,
  (select count(*) from public.academy_course_modules m where m.course_slug=c.slug and m.published) as modules_published,
  (select count(*) from public.academy_deliverable_prompts d where d.course_slug=c.slug) as assessment_count,
  (select count(*) from public.academy_deliverable_prompts d where d.course_slug=c.slug and d.published) as assessments_published,
  (select count(*) from public.academy_course_assets a where a.course_slug=c.slug) as asset_records,
  (select count(*) from public.academy_course_assets a where a.course_slug=c.slug and a.published
    and exists(select 1 from storage.objects o where o.bucket_id='iagile-course-files' and o.name=a.storage_path)) as files_ready,
  case when
    exists(select 1 from public.academy_course_modules m where m.course_slug=c.slug)
    and exists(select 1 from public.academy_deliverable_prompts d where d.course_slug=c.slug)
    and not exists(select 1 from public.academy_course_modules m where m.course_slug=c.slug and not m.published)
    and not exists(select 1 from public.academy_deliverable_prompts d where d.course_slug=c.slug and not d.published)
    and not exists(select 1 from public.academy_course_assets a where a.course_slug=c.slug and
      (not a.published or not exists(select 1 from storage.objects o where o.bucket_id='iagile-course-files' and o.name=a.storage_path)))
    then true else false end as content_release_ready
from public.academy_courses c;
revoke all on academy_private.course_launch_readiness from public,anon,authenticated;
