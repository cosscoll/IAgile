-- IAgile Academy — a Storage record alone is not proof of a complete upload.
-- Applies size and declared MIME checks to publication guards. Applied 2026-10-11.
create or replace function academy_private.verify_asset_uploaded_before_publish()
returns trigger language plpgsql security definer set search_path=''
as $fn$
begin
 if new.published and (
    new.content_bytes is null or new.content_type is null or new.content_sha256 is null
    or not exists (
      select 1 from storage.objects o
      where o.bucket_id='iagile-course-files'
        and o.name=new.storage_path
        and o.metadata->>'size'=new.content_bytes::text
        and o.metadata->>'mimetype'=new.content_type
    )
 ) then
   raise exception 'Private asset must exist in Storage with matching size and MIME before publication'
   using errcode='23514';
 end if;
 return new;
end $fn$;
revoke all on function academy_private.verify_asset_uploaded_before_publish()
 from public,anon,authenticated;

create or replace function academy_private.verify_course_release_ready()
returns trigger language plpgsql security definer set search_path=''
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
   and (
      not a.published or a.content_bytes is null
      or a.content_type is null or a.content_sha256 is null
      or not exists(
        select 1 from storage.objects o
        where o.bucket_id='iagile-course-files'
          and o.name=a.storage_path
          and o.metadata->>'size'=a.content_bytes::text
          and o.metadata->>'mimetype'=a.content_type
      )
   );
 if module_count=0 or prompt_count=0
    or missing_modules<>0 or missing_prompts<>0 or missing_assets<>0 then
    raise exception 'Course release blocked: modules %, unpublished modules %, prompts %, unpublished prompts %, missing or invalid assets %',
      module_count,missing_modules,prompt_count,missing_prompts,missing_assets
    using errcode='23514';
 end if;
 return new;
end $fn$;
revoke all on function academy_private.verify_course_release_ready()
 from public,anon,authenticated;
