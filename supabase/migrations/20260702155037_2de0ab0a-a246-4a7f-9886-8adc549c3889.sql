
-- 1) tree table
CREATE TABLE public.question_bank_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.question_bank_nodes(id) ON DELETE CASCADE,
  node_type text NOT NULL CHECK (node_type IN ('category','module','bank')),
  name text NOT NULL,
  name_en text,
  slug text NOT NULL,
  icon text,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  legacy_category text UNIQUE,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parent_id, slug)
);

CREATE INDEX question_bank_nodes_parent_idx ON public.question_bank_nodes(parent_id, sort_order);
CREATE INDEX question_bank_nodes_type_idx ON public.question_bank_nodes(node_type);

GRANT SELECT ON public.question_bank_nodes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.question_bank_nodes TO authenticated;
GRANT ALL ON public.question_bank_nodes TO service_role;

ALTER TABLE public.question_bank_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qbn public read active"
  ON public.question_bank_nodes FOR SELECT
  TO anon USING (is_active = true);

CREATE POLICY "qbn auth read all"
  ON public.question_bank_nodes FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "qbn admin write"
  ON public.question_bank_nodes FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER qbn_set_updated_at
  BEFORE UPDATE ON public.question_bank_nodes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2) add FK to questions
ALTER TABLE public.quiz_questions
  ADD COLUMN question_bank_id uuid REFERENCES public.question_bank_nodes(id) ON DELETE SET NULL;

CREATE INDEX quiz_questions_bank_idx ON public.quiz_questions(question_bank_id, is_active);

-- 3) seed DMV tree
WITH dmv AS (
  INSERT INTO public.question_bank_nodes (parent_id, node_type, name, name_en, slug, icon, sort_order)
  VALUES (NULL, 'category', 'DMV 驾照考试', 'DMV Driving Tests', 'dmv', 'Car', 10)
  RETURNING id
),
mod_c1 AS (
  INSERT INTO public.question_bank_nodes (parent_id, node_type, name, name_en, slug, icon, sort_order)
  SELECT id, 'module', 'C1 小型车', 'Class C', 'c1', 'Car', 10 FROM dmv
  RETURNING id
),
mod_ab AS (
  INSERT INTO public.question_bank_nodes (parent_id, node_type, name, name_en, slug, icon, sort_order)
  SELECT id, 'module', 'A/B 商业驾照', 'Class A/B', 'ab', 'Truck', 20 FROM dmv
  RETURNING id
),
bank_c1_written AS (
  INSERT INTO public.question_bank_nodes (parent_id, node_type, name, name_en, slug, sort_order, legacy_category)
  SELECT id, 'bank', '笔试题库', 'Written Test', 'written', 10, 'c1' FROM mod_c1
  RETURNING id, legacy_category
),
bank_c1_signs AS (
  INSERT INTO public.question_bank_nodes (parent_id, node_type, name, name_en, slug, sort_order, legacy_category)
  SELECT id, 'bank', '图标题库', 'Road Signs', 'signs', 20, 'c1_signs' FROM mod_c1
  RETURNING id, legacy_category
),
bank_ab_air AS (
  INSERT INTO public.question_bank_nodes (parent_id, node_type, name, name_en, slug, sort_order, legacy_category)
  SELECT id, 'bank', '空气制动', 'Air Brake', 'air-brake', 10, 'air_brake' FROM mod_ab
  RETURNING id, legacy_category
),
bank_ab_combo AS (
  INSERT INTO public.question_bank_nodes (parent_id, node_type, name, name_en, slug, sort_order, legacy_category)
  SELECT id, 'bank', '组合车辆', 'Combination Vehicles', 'combination', 20, 'combination_vehicle' FROM mod_ab
  RETURNING id, legacy_category
),
bank_ab_comm AS (
  INSERT INTO public.question_bank_nodes (parent_id, node_type, name, name_en, slug, sort_order, legacy_category)
  SELECT id, 'bank', '商业驾驶笔试', 'Commercial Driver', 'commercial', 30, 'commercial_driver' FROM mod_ab
  RETURNING id, legacy_category
),
all_banks AS (
  SELECT * FROM bank_c1_written
  UNION ALL SELECT * FROM bank_c1_signs
  UNION ALL SELECT * FROM bank_ab_air
  UNION ALL SELECT * FROM bank_ab_combo
  UNION ALL SELECT * FROM bank_ab_comm
)
-- 4) backfill quiz_questions.question_bank_id
UPDATE public.quiz_questions q
SET question_bank_id = ab.id
FROM all_banks ab
WHERE q.category = ab.legacy_category;
