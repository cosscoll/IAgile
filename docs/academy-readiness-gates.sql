-- IAgile Academy / audit read-only des verrous de mise en service
-- Rejouer via Supabase SQL Editor en lecture seule.
-- READY=true constate seulement ce verrou. Ce tableau NE constitue PAS un GO commercial :
-- tests Auth/RLS multi-comptes, validation pédagogique, paiement et conformité exigés séparément.
WITH
inventory AS (
  SELECT (SELECT count(*) FROM public.academy_course_modules) AS lessons,
         (SELECT count(*) FROM public.academy_course_modules WHERE published) AS published_lessons,
         (SELECT count(*) FROM public.academy_profiles) AS profiles,
         (SELECT count(*) FROM public.academy_enrollments) AS enrollments
),
assets AS (
  SELECT (SELECT count(*) FROM public.academy_course_assets WHERE course_slug='processus') AS registered,
         (SELECT count(*) FROM storage.objects WHERE bucket_id='iagile-course-files') AS stored
),
bucket AS (
  SELECT (NOT public AND file_size_limit=51200
    AND allowed_mime_types @> ARRAY['text/csv','text/markdown']::text[]) AS safe
  FROM storage.buckets WHERE id='iagile-course-files'
),
rls AS (
  SELECT count(*) AS total, count(*) FILTER (WHERE c.relrowsecurity) AS protected
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relkind='r' AND c.relname LIKE 'academy_%'
),
exercises AS (
  SELECT count(*) AS n,
         bool_or(deliverable_index=7 AND title LIKE 'Épreuve de transfert%') AS transfer_named,
         bool_or(deliverable_index=8 AND title LIKE 'Projet final%') AS final_named
  FROM public.academy_deliverable_prompts WHERE course_slug='processus'
)
SELECT gate,ready,detail
FROM (
  SELECT 'private_storage'::text AS gate,
    coalesce((SELECT safe FROM bucket),false) AS ready,
    'Bucket privé, fichiers CSV/Markdown, limite de 50 Ko'::text AS detail
  UNION ALL SELECT 'rls_all_academy_tables',
    ((SELECT total FROM rls)>=10 AND (SELECT total FROM rls)=(SELECT protected FROM rls)),
    (SELECT protected||'/'||total||' tables RLS actives' FROM rls)
  UNION ALL SELECT 'grade_revision_guard',
    EXISTS(SELECT 1 FROM pg_trigger WHERE
      tgrelid='public.academy_deliverable_feedback'::regclass
      AND tgname='academy_feedback_verify_answer_version' AND NOT tgisinternal),
    'Déclencheur serveur anti-correction périmée'
  UNION ALL SELECT 'processus_9_assignments',
    ((SELECT n FROM exercises)=9 AND (SELECT transfer_named FROM exercises)
       AND (SELECT final_named FROM exercises)),
    'Épreuve de transfert distincte du Playbook final'
  UNION ALL SELECT 'processus_assets_uploaded',
    ((SELECT registered FROM assets)=12 AND (SELECT stored FROM assets)=12),
    (SELECT registered||' ressources enregistrées / '||stored||' objets stockés' FROM assets)
  UNION ALL SELECT 'pilot_accounts_prepared',
    ((SELECT profiles FROM inventory)>=3 AND (SELECT enrollments FROM inventory)>=2),
    (SELECT profiles||' profils / '||enrollments||' inscriptions (ne prouve pas la RLS)' FROM inventory)
  UNION ALL SELECT 'lessons_ready_for_publish',
    ((SELECT published_lessons FROM inventory)>0),
    (SELECT published_lessons||' / '||lessons||' modules publiés' FROM inventory)
) gates ORDER BY gate;
