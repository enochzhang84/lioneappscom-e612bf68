CREATE TABLE public.tool_plugins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  category text,
  icon text,
  version text NOT NULL DEFAULT '1.0.0',
  component_key text NOT NULL,
  default_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.tool_plugins TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tool_plugins TO authenticated;
GRANT ALL ON public.tool_plugins TO service_role;

ALTER TABLE public.tool_plugins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled plugins"
  ON public.tool_plugins FOR SELECT
  USING (enabled = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage plugins"
  ON public.tool_plugins FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_tool_plugins_updated
  BEFORE UPDATE ON public.tool_plugins
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed with the exam plugins we already ship
INSERT INTO public.tool_plugins (code, name, description, category, component_key, sort_order) VALUES
  ('exam-runner', 'Exam Runner', '通用 DMV 风格考试组件（quiz_exams 驱动）', 'exam', 'exam-runner', 10),
  ('markdown-page', 'Markdown Page', '简单的富文本/Markdown 展示', 'content', 'markdown-page', 20),
  ('external-link', 'External Link', '跳转到外部链接的工具卡片', 'link', 'external-link', 30)
ON CONFLICT (code) DO NOTHING;
