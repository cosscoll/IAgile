-- IAgile Academy — audit rédactionnel (lecture seule, non pédagogique).
-- Les marqueurs lexicaux ne prouvent ni la qualité ni l'absence réelle
-- d'une compétence. Compléter par un audit humain et l'exécution des labs.
WITH per_module AS (
  SELECT course_slug,module_index,title,md5(body_markdown) AS editorial_digest_md5,
    length(body_markdown) AS characters,
    body_markdown LIKE '%## %' AS headings,
    body_markdown ~* '(exercice|mission|atelier|pratique)' AS keyword_practice,
    body_markdown ~* '(correction|critère|vérifi|contrôl)' AS keyword_review,
    body_markdown ~* '(livrable|résultat attendu|preuve)' AS keyword_output,
    body_markdown ~* '(accessibil|alternative)' AS explicit_accessibility_keyword,
    body_markdown LIKE '%```%' AS has_fenced_code,
    body_markdown ~* '(non étalonn|non mesur|à calibrer|non validée auprès)' AS uncalibrated_note,
    published
  FROM public.academy_course_modules
)
SELECT course_slug,count(*) AS modules,
  min(characters) AS min_characters,round(avg(characters)) AS average_characters,
  count(*) FILTER (WHERE NOT headings) AS no_markdown_sections,
  count(*) FILTER (WHERE NOT keyword_practice) AS practice_keyword_missing,
  count(*) FILTER (WHERE NOT keyword_review) AS review_keyword_missing,
  count(*) FILTER (WHERE NOT keyword_output) AS outcome_keyword_missing,
  count(*) FILTER (WHERE NOT explicit_accessibility_keyword) AS accessibility_keyword_missing,
  count(*) FILTER (WHERE has_fenced_code) AS modules_with_fenced_code,
  count(*) FILTER (WHERE uncalibrated_note) AS explicit_uncalibrated_duration,
  count(*) FILTER (WHERE published) AS published
FROM per_module GROUP BY course_slug ORDER BY course_slug;
