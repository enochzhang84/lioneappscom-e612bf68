
-- 1) site-media: restrict public read to files marked is_public in media_assets
DROP POLICY IF EXISTS "Public read site-media" ON storage.objects;

CREATE POLICY "Public read site-media public assets"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'site-media'
  AND EXISTS (
    SELECT 1 FROM public.media_assets ma
    WHERE ma.bucket = 'site-media'
      AND ma.path = storage.objects.name
      AND ma.is_public = true
  )
);

CREATE POLICY "Admins read site-media"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'site-media'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- 2) exam_attempts: prevent spoofing user_id on insert
DROP POLICY IF EXISTS "Anyone can insert exam attempts" ON public.exam_attempts;

CREATE POLICY "Users insert own exam attempts"
ON public.exam_attempts
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (auth.uid() IS NULL AND user_id IS NULL)
  OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
);
