
-- M1: sb_products schema extension (additive only, idempotent, reversible)

ALTER TABLE public.sb_products
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.solution_product_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS series text,
  ADD COLUMN IF NOT EXISTS generation text,
  ADD COLUMN IF NOT EXISTS codename text,
  ADD COLUMN IF NOT EXISTS architecture text,
  ADD COLUMN IF NOT EXISTS launch_year integer,
  ADD COLUMN IF NOT EXISTS launch_date date,
  ADD COLUMN IF NOT EXISTS gallery_urls text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS specification_pdf_url text,
  ADD COLUMN IF NOT EXISTS performance_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS data_completeness text NOT NULL DEFAULT 'partial',
  ADD COLUMN IF NOT EXISTS internal_notes text;

-- data_completeness check (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sb_products_data_completeness_check'
  ) THEN
    ALTER TABLE public.sb_products
      ADD CONSTRAINT sb_products_data_completeness_check
      CHECK (data_completeness IN ('complete','partial','incomplete'));
  END IF;
END$$;

-- launch_year sanity check (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sb_products_launch_year_check'
  ) THEN
    ALTER TABLE public.sb_products
      ADD CONSTRAINT sb_products_launch_year_check
      CHECK (launch_year IS NULL OR (launch_year BETWEEN 1990 AND 2100));
  END IF;
END$$;

-- Indexes (idempotent via IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_sb_products_category_id ON public.sb_products(category_id);
CREATE INDEX IF NOT EXISTS idx_sb_products_generation ON public.sb_products(generation) WHERE generation IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sb_products_completeness ON public.sb_products(data_completeness);
