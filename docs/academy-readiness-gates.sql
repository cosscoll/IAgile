-- IAgile Academy — seven read-only, intentionally conservative release checks.
-- This is a diagnostic snapshot, NOT a commercial authorization.
-- Auth/RLS multi-account browser tests, educational review, contract and checkout
-- require separate evidence. Storage SQL metadata does NOT prove the bytes' SHA-256.
WITH
pilot AS (
  SELECT COUNT(*) AS total,COUNT(*) FILTER (WHERE published) AS published
  FROM public.academy_course_modules WHERE course_slug='processus'
),
course AS (
  SELECT COUNT(*) AS total,COUNT(*) FILTER (WHERE published) AS published
  FROM public.academy_courses WHERE slug='processus'
),
assets AS (
  SELECT COUNT(*) AS registered,
         COUNT(*) FILTER (WHERE obj.name IS NOT NULL) AS matched_paths
  FROM public.academy_course_assets AS a
  LEFT JOIN storage.objects AS obj
    ON obj.bucket_id='iagile-course-files' AND obj.name=a.storage_path
  WHERE a.course_slug='processus'
),
storage_count AS (
  SELECT COUNT(*) AS stored
  FROM storage.objects WHERE bucket_id='iagile-course-files'
),
bucket AS (
  SELECT NOT public AND file_size_limit=51200
    AND allowed_mime_types @> ARRAY['text/csv','text/markdown']::text[] AS safe
  FROM storage.buckets WHERE id='iagile-course-files'
),
rls AS (
  SELECT COUNT(*) AS total,COUNT(*) FILTER (WHERE c.relrowsecurity) AS protected
  FROM pg_class AS c JOIN pg_namespace AS n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relkind='r' AND c.relname LIKE 'academy_%'
),
exercises AS (
  SELECT COUNT(*) AS total,
         COUNT(*) FILTER (WHERE deliverable_index=7 AND title LIKE 'Épreuve de transfert%') AS transfer,
         COUNT(*) FILTER (WHERE deliverable_index=8 AND title LIKE 'Projet final%') AS capstone
  FROM public.academy_deliverable_prompts WHERE course_slug='processus'
),
learners AS (
  SELECT COUNT(DISTINCT e.user_id) AS total
  FROM public.academy_enrollments AS e
  JOIN public.academy_profiles AS p ON p.user_id=e.user_id
  WHERE e.course_slug='processus' AND e.active AND p.account_status='active'
),
instructors AS (
  SELECT COUNT(DISTINCT i.instructor_id) AS total
  FROM public.academy_instructor_courses AS i
  JOIN public.academy_profiles AS p ON p.user_id=i.instructor_id
  WHERE i.course_slug='processus' AND p.account_status='active'
)
SELECT gate,ready,detail
FROM (
  SELECT 'private_storage'::text AS gate,
    COALESCE((SELECT safe FROM bucket),false) AS ready,
    'Bucket privé, CSV/Markdown seulement, taille max 50 Ko'::text AS detail
  UNION ALL SELECT 'rls_all_academy_tables',
    (SELECT total>=10 AND total=protected FROM rls),
    (SELECT protected||'/'||total||' tables protégées par RLS' FROM rls)
  UNION ALL SELECT 'grade_revision_guard',
    EXISTS (SELECT 1 FROM pg_trigger
      WHERE tgrelid='public.academy_deliverable_feedback'::regclass
        AND tgname='academy_feedback_verify_answer_version' AND NOT tgisinternal),
    'Contrôle serveur de version de copie'
  UNION ALL SELECT 'processus_9_assignments',
    (SELECT total=9 AND transfer=1 AND capstone=1 FROM exercises),
    'Neuf travaux dont Rivage et Playbook final distincts'
  UNION ALL SELECT 'processus_assets_uploaded',
    (SELECT registered=12 AND matched_paths=12 FROM assets)
      AND (SELECT stored=12 FROM storage_count),
    (SELECT matched_paths||'/'||registered||' chemins présents, '||
      (SELECT stored FROM storage_count)||' objets dans le bucket. SHA-256 et droits à vérifier séparément' FROM assets)
  UNION ALL SELECT 'pilot_accounts_prepared',
    (SELECT total>=2 FROM learners) AND (SELECT total>=1 FROM instructors),
    (SELECT total||' apprenant(s) actif(s) inscrit(s), '||
      (SELECT total FROM instructors)||' formateur(s) actif(s). RLS réelle à tester' FROM learners)
  UNION ALL SELECT 'lessons_ready_for_publish',
    (SELECT total=9 AND published=9 FROM pilot)
      AND (SELECT total=1 AND published=1 FROM course),
    (SELECT published||'/'||total||' modules pilote publiés ; cours publié : '||
      (SELECT published FROM course) FROM pilot)
) AS gates
ORDER BY gate;
