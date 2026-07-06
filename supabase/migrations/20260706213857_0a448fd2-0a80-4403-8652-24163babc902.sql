-- AI Knowledge Engine: unified cache table for all products
CREATE TABLE public.ai_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  record_type text NOT NULL,
  record_id text NOT NULL,
  language text NOT NULL DEFAULT 'zh',
  prompt_version text NOT NULL DEFAULT 'v1',
  provider text,
  model text,
  request_hash text,
  ai_content jsonb,
  status text NOT NULL DEFAULT 'ready',
  error text,
  tokens_in integer NOT NULL DEFAULT 0,
  tokens_out integer NOT NULL DEFAULT 0,
  cost_credits numeric(12,4) NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ai_cache_unique_key UNIQUE (module, record_type, record_id, language, prompt_version)
);

CREATE INDEX ai_cache_module_status_idx ON public.ai_cache (module, status);
CREATE INDEX ai_cache_module_type_idx ON public.ai_cache (module, record_type);
CREATE INDEX ai_cache_updated_idx ON public.ai_cache (updated_at DESC);

GRANT SELECT ON public.ai_cache TO anon;
GRANT SELECT ON public.ai_cache TO authenticated;
GRANT ALL ON public.ai_cache TO service_role;

ALTER TABLE public.ai_cache ENABLE ROW LEVEL SECURITY;

-- Anyone can read cached AI content (it's product knowledge, public by nature)
CREATE POLICY "ai_cache readable by all"
  ON public.ai_cache FOR SELECT
  USING (true);

-- Only admins can insert/update/delete directly; server functions with service role also work
CREATE POLICY "ai_cache admin insert"
  ON public.ai_cache FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "ai_cache admin update"
  ON public.ai_cache FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "ai_cache admin delete"
  ON public.ai_cache FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER ai_cache_set_updated_at
  BEFORE UPDATE ON public.ai_cache
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();