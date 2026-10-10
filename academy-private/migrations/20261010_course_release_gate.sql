-- Applied to Supabase IAgile Academy on 2026-10-10.
-- Prevent incomplete/unsafe courses from accidentally going live.
-- Require all authored lessons, deliverables and asset metadata to be ready.
create or replace function academy_private.verify_course_release_ready()
returns trigger
language plpgsql security definer set search_path=''
as $fn$
declare
 module_count integer;
 prompt_count integer;
 missing_modules integer;
 missing_prompts integer;
 missing_assets integer;
begin
 if not new.published then return new; end if;
 select count(*),count(*) filter(where not m.published)
 into module_count,missing_modules
 from public.academy_course_modules m where m.course_slug=new.slug;
 select count(*),count(*) filter(where not p.published)
 into prompt_count,missing_prompts
 from public.academy_deliverable_prompts p where p.course_slug=new.slug;
 select count(*) into missing_assets
 from public.academy_course_assets a
 where a.course_slug=new.slug
 and (not a.published or not exists(
    select 1 from storage.objects o
    where o.bucket_id='iagile-course-files' and o.name=a.storage_path
 ));
 if module_count=0 or prompt_count=0
 or missing_modules<>0 or missing_prompts<>0 or missing_assets<>0 then
    raise exception 'Course release blocked: modules %, unpublished modules %, prompts %, unpublished prompts %, missing or unpublished assets %',
      module_count,missing_modules,prompt_count,missing_prompts,missing_assets
    using errcode='23514';
 end if;
 return new;
end;
$fn$;
revoke all on function academy_private.verify_course_release_ready() from public,anon,authenticated;
drop trigger if exists academy_verify_course_release_ready on public.academy_courses;
create trigger academy_verify_course_release_ready
before insert or update of published on public.academy_courses
for each row execute function academy_private.verify_course_release_ready();
