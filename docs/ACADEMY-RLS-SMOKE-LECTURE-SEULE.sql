-- IAgile Academy — contrôle négatif RLS reproductible, 21 octobre 2026.
-- À exécuter sur l'environnement autorisé depuis le SQL Editor.
-- N'insère aucun utilisateur, ne publie aucun cours et ne modifie aucune table.
-- L'identité simulée NE constitue PAS un authentique jeton Supabase Auth.
-- Une recette complète exige deux comptes distincts et un formateur réel.
BEGIN READ ONLY;
SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claim.sub',
  '00000000-0000-4000-8000-000000004211',
  true
);
SELECT
  current_user AS role_sql,
  auth.uid() AS sujet_simule,
  (SELECT count(*) FROM public.academy_courses) AS catalogue_visible,
  (SELECT count(*) FROM public.academy_course_modules) AS lecons_privees_visibles,
  (SELECT count(*) FROM public.academy_deliverable_prompts) AS devoirs_visibles,
  (SELECT count(*) FROM public.academy_prompt_library) AS prompts_visibles,
  (SELECT count(*) FROM public.academy_external_learning_resources) AS ressources_visibles,
  (SELECT count(*) FROM public.academy_course_assets) AS supports_visibles,
  (SELECT count(*) FROM public.academy_enrollments) AS inscriptions_visibles,
  (SELECT count(*) FROM public.academy_module_progress) AS progressions_visibles,
  (SELECT count(*) FROM storage.objects WHERE bucket_id='iagile-course-files') AS objets_storage_visibles;
COMMIT;

-- Sur l'état constaté 2026-10-21 : 4 parcours catalogue, et 0 partout ailleurs.
-- Critère d'échec : une seule ligne premium visible sans inscription active.
-- Ce test négatif ne vérifie PAS qu'un apprenant autorisé accède à son cours
-- ni qu'une révocation/refund retire l'accès immédiatement.
