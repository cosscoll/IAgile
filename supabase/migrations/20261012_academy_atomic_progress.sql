-- Atomic learner note/progression writes. Requires existing RLS policies.
-- PUBLIC schema only to expose the RPC. SECURITY INVOKER retains learner RLS.
CREATE OR REPLACE FUNCTION public.academy_save_progress(
  p_course_slug text,
  p_module_index integer,
  p_completed boolean DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO ''
AS $function$
DECLARE
  v_user uuid := (select auth.uid());
  v_completed boolean;
  v_notes text;
  v_updated_at timestamptz;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28000';
  END IF;
  IF p_completed IS NULL AND p_notes IS NULL THEN
    RAISE EXCEPTION 'No update requested' USING ERRCODE = '22023';
  END IF;
  IF p_course_slug NOT IN ('processus','agents','automatisation','sites-3d')
     OR p_module_index IS NULL OR p_module_index < 0 OR p_module_index > 199 THEN
    RAISE EXCEPTION 'Invalid course or lesson' USING ERRCODE = '22023';
  END IF;
  IF p_notes IS NOT NULL AND char_length(p_notes) > 4000 THEN
    RAISE EXCEPTION 'Notes too long' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.academy_module_progress AS target
    (user_id,course_slug,module_index,completed,notes,updated_at)
  VALUES
    (v_user,p_course_slug,p_module_index,COALESCE(p_completed,false),
     COALESCE(p_notes,''),pg_catalog.clock_timestamp())
  ON CONFLICT (user_id,course_slug,module_index)
  DO UPDATE SET
    completed = COALESCE(p_completed,target.completed),
    notes = COALESCE(p_notes,target.notes),
    updated_at = pg_catalog.clock_timestamp()
  RETURNING target.completed,target.notes,target.updated_at
    INTO v_completed,v_notes,v_updated_at;

  RETURN pg_catalog.jsonb_build_object(
    'completed',v_completed,'notes',v_notes,'updated_at',v_updated_at
  );
END;
$function$;
REVOKE ALL ON FUNCTION public.academy_save_progress(text,integer,boolean,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.academy_save_progress(text,integer,boolean,text) FROM anon;
GRANT EXECUTE ON FUNCTION public.academy_save_progress(text,integer,boolean,text) TO authenticated;
