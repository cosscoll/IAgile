-- IAgile Academy operational bucket controls, already applied 2026-10-11.
-- Max object size is 50 KiB; imports allow only CSV and Markdown.
-- Payload bytes remain exclusively in Supabase's private Storage backend.
update storage.buckets
set file_size_limit=51200,
    allowed_mime_types=array['text/csv','text/markdown']::text[]
where id='iagile-course-files' and public=false;
