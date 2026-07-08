DROP POLICY IF EXISTS "ai_cache readable by all" ON public.ai_cache;
REVOKE SELECT ON public.ai_cache FROM anon;
REVOKE SELECT ON public.ai_cache FROM authenticated;
CREATE POLICY "ai_cache admin select"
  ON public.ai_cache FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));