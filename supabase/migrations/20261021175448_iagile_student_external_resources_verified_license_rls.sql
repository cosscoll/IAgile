-- Applied in IAgile Academy on 2026-10-21 (Supabase migration 20261021175448).
-- Only learners' external-reference SELECT policy is tightened.
-- Trainers retain their separate draft-review policy, and no resources are published.
-- Mirrors the fail-closed filters already present in academy-app/app.js.
ALTER POLICY academy_external_learning_student_read
ON public.academy_external_learning_resources
TO authenticated
USING (
  published
  AND approved_for_course
  AND NOT archived
  AND source_review_status = 'verified'
  AND license_status = 'CONTRÔLE CIBLÉ'
  AND EXISTS (
    SELECT 1 FROM public.academy_courses c
    WHERE c.slug = academy_external_learning_resources.course_slug
      AND c.published
  )
  AND EXISTS (
    SELECT 1 FROM public.academy_enrollments e
    JOIN public.academy_profiles p ON p.user_id = e.user_id
    WHERE e.user_id = (SELECT auth.uid())
      AND e.course_slug = academy_external_learning_resources.course_slug
      AND e.active
      AND p.account_status = 'active'
  )
);
