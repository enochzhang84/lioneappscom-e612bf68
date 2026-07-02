
-- 1) TABLE
CREATE TABLE public.quiz_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  total_questions int NOT NULL DEFAULT 20,
  pass_count int NOT NULL DEFAULT 16,
  time_seconds int NOT NULL DEFAULT 1800,
  bilingual boolean NOT NULL DEFAULT false,
  back_href text,
  back_label text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2) GRANT
GRANT SELECT ON public.quiz_exams TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_exams TO authenticated;
GRANT ALL ON public.quiz_exams TO service_role;

-- 3) RLS
ALTER TABLE public.quiz_exams ENABLE ROW LEVEL SECURITY;

-- 4) POLICIES
CREATE POLICY "quiz_exams public read active"
  ON public.quiz_exams FOR SELECT
  USING (is_active = true);

CREATE POLICY "quiz_exams admin read all"
  ON public.quiz_exams FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "quiz_exams admin insert"
  ON public.quiz_exams FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "quiz_exams admin update"
  ON public.quiz_exams FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "quiz_exams admin delete"
  ON public.quiz_exams FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- updated_at trigger
CREATE TRIGGER trg_quiz_exams_updated_at
  BEFORE UPDATE ON public.quiz_exams
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed the 4 existing exams (idempotent via ON CONFLICT on category)
INSERT INTO public.quiz_exams
  (category, title, subtitle, total_questions, pass_count, time_seconds, bilingual, back_href, back_label, sort_order)
VALUES
  ('c1', '小型车 C1 模拟考试',
   'DMV 风格 · 随机 36 题 · 无时限 · 30 题通过',
   36, 30, 0, false, '/p/drive', '← 返回驾考工具', 0),
  ('air_brake', 'A/B 照 · 空气制动模拟考试',
   'DMV 风格 · 中英双语 · 随机 25 题 · 45 分钟 · 20 题通过',
   25, 20, 45 * 60, true, '/p/drive', '← 返回驾考工具', 10),
  ('combination_vehicle', 'A/B 照 · 组合车辆模拟考试',
   'DMV 风格 · 随机 20 题 · 30 分钟 · 16 题通过',
   20, 16, 30 * 60, true, '/p/drive', '← 返回驾考工具', 20),
  ('commercial_driver', '商业驾驶者笔试模拟考试',
   'DMV 风格 · 随机 50 题 · 60 分钟 · 40 题通过',
   50, 40, 60 * 60, true, '/p/drive', '← 返回驾考工具', 30)
ON CONFLICT (category) DO NOTHING;
