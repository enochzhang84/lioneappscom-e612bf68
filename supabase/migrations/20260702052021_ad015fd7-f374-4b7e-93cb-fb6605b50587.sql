-- Product Modules: platform-level pluggable product registry
CREATE TABLE public.product_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text,
  icon text,
  category text,
  enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_modules TO authenticated;
GRANT SELECT ON public.product_modules TO anon;
GRANT ALL ON public.product_modules TO service_role;

ALTER TABLE public.product_modules ENABLE ROW LEVEL SECURITY;

-- Public can read enabled modules (used by frontend to render available products)
CREATE POLICY "Public can read enabled modules"
  ON public.product_modules FOR SELECT
  USING (enabled = true);

-- Admins can read all (incl. disabled)
CREATE POLICY "Admins can read all modules"
  ON public.product_modules FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can insert modules"
  ON public.product_modules FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update modules"
  ON public.product_modules FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete modules"
  ON public.product_modules FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER product_modules_updated_at
  BEFORE UPDATE ON public.product_modules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX product_modules_enabled_sort_idx ON public.product_modules (enabled, sort_order);

-- Seed default 6 modules
INSERT INTO public.product_modules (code, name, tagline, icon, category, sort_order) VALUES
  ('website',      'Website Platform',      '官网 / 落地页 / 内容管理',            'Globe',       'core',        10),
  ('church',       'Church Management',     '教会管理平台 HOC3',                    'Church',      'vertical',    20),
  ('construction', 'Construction Quoting',  '装修 / 施工报价平台',                  'Hammer',      'vertical',    30),
  ('crm',          'CRM Suite',             '客户关系与销售管道',                    'Users',       'business',    40),
  ('ai',           'AI Toolkit',            '智能助手 / 内容生成 / 翻译',           'Sparkles',    'ai',          50),
  ('dmv',          'DMV Learning Center',   '驾考模拟与学习中心',                    'Car',         'education',   60);
