-- Applied to IAgile Academy on 2026-10-11; restricted administrator view.
create or replace view academy_private.course_launch_readiness
with (security_invoker=true)
as
select c.slug,c.title,c.published as course_published,
 (select count(*) from public.academy_course_modules m where m.course_slug=c.slug) as module_count,
 (select count(*) from public.academy_course_modules m where m.course_slug=c.slug and m.published) as modules_published,
 (select count(*) from public.academy_deliverable_prompts d where d.course_slug=c.slug) as assessment_count,
 (select count(*) from public.academy_deliverable_prompts d where d.course_slug=c.slug and d.published) as assessments_published,
 (select count(*) from public.academy_course_assets a where a.course_slug=c.slug) as asset_records,
 (select count(*) from public.academy_course_assets a
  where a.course_slug=c.slug and a.published
  and a.content_bytes is not null and a.content_type is not null and a.content_sha256 is not null
  and exists(select 1 from storage.objects o
    where o.bucket_id='iagile-course-files' and o.name=a.storage_path
    and o.metadata->>'size'=a.content_bytes::text
    and o.metadata->>'mimetype'=a.content_type)) as files_ready,
 case when
    exists(select 1 from public.academy_course_modules m where m.course_slug=c.slug)
    and exists(select 1 from public.academy_deliverable_prompts d where d.course_slug=c.slug)
    and not exists(select 1 from public.academy_course_modules m where m.course_slug=c.slug and not m.published)
    and not exists(select 1 from public.academy_deliverable_prompts d where d.course_slug=c.slug and not d.published)
    and not exists(select 1 from public.academy_course_assets a where a.course_slug=c.slug and (
       not a.published or a.content_bytes is null or a.content_type is null or a.content_sha256 is null
       or not exists(select 1 from storage.objects o where
        o.bucket_id='iagile-course-files' and o.name=a.storage_path
        and o.metadata->>'size'=a.content_bytes::text
        and o.metadata->>'mimetype'=a.content_type)))
 then true else false end as content_release_ready
from public.academy_courses c;
revoke all on academy_private.course_launch_readiness from public,anon,authenticated;
