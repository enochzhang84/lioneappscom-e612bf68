
-- M2 (additive, idempotent)

-- 1) solution_product_vendors
CREATE TABLE IF NOT EXISTS public.solution_product_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_code text NOT NULL UNIQUE,
  name text NOT NULL,
  name_zh text,
  website_url text,
  vendor_type text,
  country text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.solution_product_vendors TO authenticated;
GRANT ALL ON public.solution_product_vendors TO service_role;
GRANT SELECT ON public.solution_product_vendors TO anon;

ALTER TABLE public.solution_product_vendors ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='solution_product_vendors' AND policyname='vendors admin read all') THEN
    CREATE POLICY "vendors admin read all" ON public.solution_product_vendors
      FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='solution_product_vendors' AND policyname='vendors admin write') THEN
    CREATE POLICY "vendors admin write" ON public.solution_product_vendors
      FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='solution_product_vendors' AND policyname='vendors public read active') THEN
    CREATE POLICY "vendors public read active" ON public.solution_product_vendors
      FOR SELECT TO anon, authenticated USING (is_active = true);
  END IF;
END $$;

DROP TRIGGER IF EXISTS solution_product_vendors_set_updated_at ON public.solution_product_vendors;
CREATE TRIGGER solution_product_vendors_set_updated_at
  BEFORE UPDATE ON public.solution_product_vendors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2) solution_compatibility_rules
CREATE TABLE IF NOT EXISTS public.solution_compatibility_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_code text NOT NULL UNIQUE,
  rule_type text NOT NULL,
  params jsonb NOT NULL DEFAULT '{}'::jsonb,
  severity text NOT NULL DEFAULT 'warning',
  message_zh text,
  message_en text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT solution_compatibility_rules_severity_check
    CHECK (severity IN ('info','warning','error'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.solution_compatibility_rules TO authenticated;
GRANT ALL ON public.solution_compatibility_rules TO service_role;

ALTER TABLE public.solution_compatibility_rules ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='solution_compatibility_rules' AND policyname='compat_rules admin write') THEN
    CREATE POLICY "compat_rules admin write" ON public.solution_compatibility_rules
      FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='solution_compatibility_rules' AND policyname='compat_rules auth read active') THEN
    CREATE POLICY "compat_rules auth read active" ON public.solution_compatibility_rules
      FOR SELECT TO authenticated USING (is_active = true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_compat_rules_type_active
  ON public.solution_compatibility_rules(rule_type) WHERE is_active = true;

DROP TRIGGER IF EXISTS solution_compatibility_rules_set_updated_at ON public.solution_compatibility_rules;
CREATE TRIGGER solution_compatibility_rules_set_updated_at
  BEFORE UPDATE ON public.solution_compatibility_rules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3) solution_price_history extension (additive, keep existing columns/RLS)
ALTER TABLE public.solution_price_history
  ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES public.solution_product_vendors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS price numeric(12,2),
  ADD COLUMN IF NOT EXISTS shipping_price numeric(12,2),
  ADD COLUMN IF NOT EXISTS availability text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS recorded_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_price_history_vendor
  ON public.solution_price_history(vendor_id) WHERE vendor_id IS NOT NULL;
