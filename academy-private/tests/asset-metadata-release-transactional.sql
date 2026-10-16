-- Rollback-only regression for size + MIME metadata publication gates.
-- This test never stores actual premium file bytes.
begin;
insert into storage.objects(bucket_id,name,metadata)
values('iagile-course-files','processus/datasets/LUMEN-MESSAGES.md',
 jsonb_build_object('size',999,'mimetype','text/markdown'));
do $qa$begin
 begin
  update public.academy_course_assets set published=true where asset_key='lumen-messages';
  raise exception 'Incorrect byte count accepted';
 exception when check_violation then null;
 end;
end $qa$;
update storage.objects set metadata=jsonb_build_object('size',1759,'mimetype','text/plain')
where bucket_id='iagile-course-files' and name='processus/datasets/LUMEN-MESSAGES.md';
do $qa$begin
 begin
  update public.academy_course_assets set published=true where asset_key='lumen-messages';
  raise exception 'Incorrect MIME accepted';
 exception when check_violation then null;
 end;
end $qa$;
update storage.objects set metadata=jsonb_build_object('size',1759,'mimetype','text/markdown')
where bucket_id='iagile-course-files' and name='processus/datasets/LUMEN-MESSAGES.md';
update public.academy_course_assets set published=true where asset_key='lumen-messages';
do $qa$begin
 if not exists(select 1 from public.academy_course_assets
     where asset_key='lumen-messages' and published)
 then raise exception 'Valid metadata incorrectly blocked'; end if;
end $qa$;
rollback;
select 'PASS: draft asset length and type validated; all test changes rolled back' result;
