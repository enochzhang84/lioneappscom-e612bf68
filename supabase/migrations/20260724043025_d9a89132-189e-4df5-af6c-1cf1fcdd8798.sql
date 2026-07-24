
-- ===== sb_products =====
CREATE TABLE public.sb_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,             -- e.g. pc-cpu, pc-gpu, nas-chassis, net-router, service
  subcategory TEXT,
  slug TEXT NOT NULL UNIQUE,
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  description_zh TEXT,
  description_en TEXT,
  image_url TEXT,
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,       -- socket, tdp, form_factor, length_mm, capacity_tb, etc.
  compat JSONB NOT NULL DEFAULT '{}'::jsonb,      -- normalized compatibility keys
  cost_price NUMERIC(12,2),                       -- internal cost (never surface publicly)
  list_price NUMERIC(12,2) NOT NULL DEFAULT 0,    -- display price
  install_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock_status TEXT NOT NULL DEFAULT 'in_stock',  -- in_stock | special_order | out_of_stock | discontinued
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_sample BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  price_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT sb_products_stock_check CHECK (stock_status IN ('in_stock','special_order','out_of_stock','discontinued'))
);
CREATE INDEX idx_sb_products_cat ON public.sb_products(category, sort_order);
CREATE INDEX idx_sb_products_visible ON public.sb_products(is_visible);

GRANT SELECT ON public.sb_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sb_products TO authenticated;
GRANT ALL ON public.sb_products TO service_role;

ALTER TABLE public.sb_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sb_products public read visible"
  ON public.sb_products FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);

CREATE POLICY "sb_products admin read all"
  ON public.sb_products FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "sb_products admin write"
  ON public.sb_products FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER sb_products_set_updated_at
  BEFORE UPDATE ON public.sb_products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== sb_settings (single-row config) =====
CREATE TABLE public.sb_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  currency TEXT NOT NULL DEFAULT 'USD',
  tax_rate NUMERIC(6,4) NOT NULL DEFAULT 0.0000,        -- 0.0725 = 7.25%
  default_service_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  margin_rate NUMERIC(6,4) NOT NULL DEFAULT 0.0000,
  discount_rate NUMERIC(6,4) NOT NULL DEFAULT 0.0000,
  proposal_validity_days INTEGER NOT NULL DEFAULT 30,
  contact_email TEXT NOT NULL DEFAULT 'hello@lioneapps.com',
  contact_phone TEXT,
  disclaimer_zh TEXT NOT NULL DEFAULT '本方案为初步配置与预算参考,最终设备兼容性、库存、价格和服务范围需在正式确认后确定。',
  disclaimer_en TEXT NOT NULL DEFAULT 'This document is a preliminary configuration and estimate. Final compatibility, availability, pricing and service scope are subject to confirmation.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT sb_settings_singleton CHECK (id = 1)
);

GRANT SELECT ON public.sb_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.sb_settings TO authenticated;
GRANT ALL ON public.sb_settings TO service_role;

ALTER TABLE public.sb_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sb_settings public read"
  ON public.sb_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "sb_settings admin write"
  ON public.sb_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.sb_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- ===== sb_solutions =====
CREATE SEQUENCE IF NOT EXISTS public.sb_solution_seq START 1001;

CREATE TABLE public.sb_solutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_number TEXT NOT NULL UNIQUE DEFAULT ('LA-' || to_char(now(),'YYYYMMDD') || '-' || nextval('public.sb_solution_seq')),
  solution_type TEXT NOT NULL,                       -- pc | nas | home-network | full-solution
  title TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'zh',
  currency TEXT NOT NULL DEFAULT 'USD',

  -- customer info (all optional)
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  organization_name TEXT,
  customer_city TEXT,
  customer_budget TEXT,
  customer_timeline TEXT,
  customer_notes TEXT,

  -- computed totals snapshot
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  service_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(6,4) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  one_time_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  monthly_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  annual_total NUMERIC(12,2) NOT NULL DEFAULT 0,

  -- full configuration snapshot (line items with prices captured at save time)
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,          -- raw user selections
  computed JSONB NOT NULL DEFAULT '{}'::jsonb,        -- derived outputs (power, raid capacity, etc.)
  compat_warnings JSONB NOT NULL DEFAULT '[]'::jsonb,

  status TEXT NOT NULL DEFAULT 'draft',               -- draft | submitted | contacted | quoted | accepted | rejected | completed | archived
  source TEXT NOT NULL DEFAULT 'builder',
  admin_notes TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- sharing
  share_token TEXT UNIQUE,
  share_expires_at TIMESTAMPTZ,

  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT sb_solutions_status_check CHECK (status IN ('draft','submitted','contacted','quoted','accepted','rejected','completed','archived'))
);
CREATE INDEX idx_sb_solutions_created_by ON public.sb_solutions(created_by, created_at DESC);
CREATE INDEX idx_sb_solutions_status ON public.sb_solutions(status);
CREATE INDEX idx_sb_solutions_share ON public.sb_solutions(share_token) WHERE share_token IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sb_solutions TO authenticated;
GRANT INSERT ON public.sb_solutions TO anon;              -- guest submissions
GRANT ALL ON public.sb_solutions TO service_role;

ALTER TABLE public.sb_solutions ENABLE ROW LEVEL SECURITY;

-- authenticated users: own rows
CREATE POLICY "sb_solutions owner read"
  ON public.sb_solutions FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());
CREATE POLICY "sb_solutions owner update"
  ON public.sb_solutions FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "sb_solutions owner delete"
  ON public.sb_solutions FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());
CREATE POLICY "sb_solutions owner insert"
  ON public.sb_solutions FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid() OR created_by IS NULL);

-- anon: only insert (guest submissions must have created_by NULL)
CREATE POLICY "sb_solutions anon insert"
  ON public.sb_solutions FOR INSERT
  TO anon
  WITH CHECK (created_by IS NULL);

-- admin: full access
CREATE POLICY "sb_solutions admin all"
  ON public.sb_solutions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER sb_solutions_set_updated_at
  BEFORE UPDATE ON public.sb_solutions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
