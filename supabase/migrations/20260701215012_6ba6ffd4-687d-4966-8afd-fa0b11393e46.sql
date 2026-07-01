-- 1) Restrict anon column access on quiz_questions so answer keys are not exposed
REVOKE SELECT ON public.quiz_questions FROM anon;
GRANT SELECT (id, question, option_a, option_b, option_c, option_d, category, difficulty, is_active, sort_order, created_at, updated_at)
  ON public.quiz_questions TO anon;

-- 2) Tighten first-admin claim policy so only truly the first admin can be claimed
DROP POLICY IF EXISTS "First signed-in user can claim admin" ON public.user_roles;
CREATE POLICY "First signed-in user can claim admin"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND role = 'admin'::public.app_role
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles WHERE role = 'admin'::public.app_role
    )
  );