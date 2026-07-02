
-- 1) pages.blocks
ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS blocks JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 2) seo_meta
CREATE TABLE IF NOT EXISTS public.seo_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  og_image_url TEXT,
  canonical_url TEXT,
  robots TEXT NOT NULL DEFAULT 'index,follow',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.seo_meta TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_meta TO authenticated;
GRANT ALL ON public.seo_meta TO service_role;
ALTER TABLE public.seo_meta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seo_meta public read active"
  ON public.seo_meta FOR SELECT
  USING (is_active = true);
CREATE POLICY "seo_meta admin all"
  ON public.seo_meta FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER seo_meta_set_updated_at
  BEFORE UPDATE ON public.seo_meta
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3) media_assets
CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket TEXT NOT NULL DEFAULT 'site-media',
  path TEXT NOT NULL,
  name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  width INT,
  height INT,
  alt_text TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(bucket, path)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
GRANT ALL ON public.media_assets TO service_role;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "media_assets admin all"
  ON public.media_assets FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER media_assets_set_updated_at
  BEFORE UPDATE ON public.media_assets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_media_assets_created_at ON public.media_assets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_assets_tags ON public.media_assets USING GIN(tags);
