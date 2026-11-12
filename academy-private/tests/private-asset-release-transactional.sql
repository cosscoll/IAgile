-- Passed in live Supabase project 2026-10-11. Always ROLLBACK.
begin;
do $qa$
begin
 begin
   update public.academy_course_assets set published=true
     where course_slug='processus' and asset_key='lumen-messages';
   raise exception 'Absent premium file incorrectly published';
 exception when check_violation then null;
 end;
 -- Insert forged Storage METADATA only to verify that a mimetype mismatch
 -- cannot satisfy the database publication guard. No blob is uploaded.
 insert into storage.objects(bucket_id,name,metadata)
   values('iagile-course-files','processus/datasets/LUMEN-MESSAGES.md',
          '{"size":1759,"mimetype":"application/octet-stream"}'::jsonb);
 begin
   update public.academy_course_assets set published=true
     where course_slug='processus' and asset_key='lumen-messages';
   raise exception 'Invalid object MIME incorrectly published';
 exception when check_violation then null;
 end;
 if exists(select 1 from public.academy_course_assets where published)
   then raise exception 'Asset publication unexpectedly changed';end if;
 if exists(select 1 from public.academy_courses where published)
   then raise exception 'Course publication unexpectedly changed';end if;
end $qa$;
rollback;
select 'PASS — missing/invalid private objects blocked, all changes rolled back' as result;
