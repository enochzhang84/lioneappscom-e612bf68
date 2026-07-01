
-- tool_categories
CREATE TABLE public.tool_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tool_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tool_categories TO authenticated;
GRANT ALL ON public.tool_categories TO service_role;
ALTER TABLE public.tool_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visible categories public"
  ON public.tool_categories FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);

CREATE POLICY "Admins read all categories"
  ON public.tool_categories FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins write categories"
  ON public.tool_categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER tool_categories_set_updated_at
  BEFORE UPDATE ON public.tool_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_tool_categories_page ON public.tool_categories(page_id, sort_order);

-- tool_items
CREATE TABLE public.tool_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.tool_categories(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  description text,
  content text,
  image_url text,
  video_url text,
  link_url text,
  button_text text,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page_id, slug)
);
GRANT SELECT ON public.tool_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tool_items TO authenticated;
GRANT ALL ON public.tool_items TO service_role;
ALTER TABLE public.tool_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visible items public"
  ON public.tool_items FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);

CREATE POLICY "Admins read all items"
  ON public.tool_items FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins write items"
  ON public.tool_items FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER tool_items_set_updated_at
  BEFORE UPDATE ON public.tool_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_tool_items_page_cat ON public.tool_items(page_id, category_id, sort_order);
