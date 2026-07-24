
GRANT SELECT ON public.solution_compatibility_rules TO anon;
DROP POLICY IF EXISTS "compat_rules auth read active" ON public.solution_compatibility_rules;
CREATE POLICY "compat_rules public read active"
  ON public.solution_compatibility_rules
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
