
-- 1) Add self-referencing parent_id
ALTER TABLE public.tool_items
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.tool_items(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_tool_items_parent ON public.tool_items(page_id, parent_id, sort_order);

-- 2) Data migration in a single DO block
DO $$
DECLARE
  v_page_id uuid;
  v_cat_id uuid := 'fcab69e5-6331-4141-bc7f-88981766a5c9'; -- 驾照宝典
  v_drive_c1 uuid;
  v_drive_ab uuid;
BEGIN
  SELECT page_id INTO v_page_id FROM public.tool_categories WHERE id = v_cat_id;

  -- Create parent group: 小型车 C1 模拟考试 (drive-c1)
  INSERT INTO public.tool_items (page_id, category_id, parent_id, slug, title, icon, description, sort_order, is_visible)
  VALUES (v_page_id, v_cat_id, NULL, 'drive-c1', '小型车 C1 模拟考试', '🚗', '加州 DMV C1 驾照模拟考试', 0, true)
  ON CONFLICT (page_id, slug) DO UPDATE SET title = EXCLUDED.title, icon = EXCLUDED.icon, parent_id = NULL, category_id = v_cat_id
  RETURNING id INTO v_drive_c1;

  -- Move existing 笔试 under drive-c1, rename
  UPDATE public.tool_items
     SET parent_id = v_drive_c1, category_id = v_cat_id,
         slug = 'drive-c1-written', title = '笔试', icon = '📝',
         description = COALESCE(NULLIF(description,''), '244 题题库随机抽取 36 题'),
         sort_order = 0
   WHERE id = '6a419a46-6f23-411d-b991-95f687e9c2cb';

  -- Move existing 图标 under drive-c1, rename
  UPDATE public.tool_items
     SET parent_id = v_drive_c1, category_id = v_cat_id,
         slug = 'drive-c1-signs', title = '图标', icon = '🚸',
         description = COALESCE(NULLIF(description,''), '交通标志识别练习'),
         sort_order = 1
   WHERE id = '76564300-8df6-412b-ad9a-95deda2ec967';

  -- Convert 064fba5d "A/B照模拟考试" into a parent group (drive-ab)
  UPDATE public.tool_items
     SET parent_id = NULL, category_id = v_cat_id,
         slug = 'drive-ab', title = 'A/B 照模拟考试', icon = '🚚',
         description = COALESCE(NULLIF(description,''), 'A/B 照驾驶模拟考试'),
         link_url = NULL,
         sort_order = 1
   WHERE id = '064fba5d-fbca-4cf0-ada9-229c21a2efcd'
   RETURNING id INTO v_drive_ab;

  -- Create A/B children
  INSERT INTO public.tool_items (page_id, category_id, parent_id, slug, title, icon, description, sort_order, is_visible)
  VALUES (v_page_id, v_cat_id, v_drive_ab, 'drive-ab-written', '笔试', '📝', 'A/B 照笔试模拟', 0, true)
  ON CONFLICT (page_id, slug) DO NOTHING;

  INSERT INTO public.tool_items (page_id, category_id, parent_id, slug, title, icon, description, sort_order, is_visible)
  VALUES (v_page_id, v_cat_id, v_drive_ab, 'drive-ab-signs', '图标', '🚸', 'A/B 照标志练习', 1, true)
  ON CONFLICT (page_id, slug) DO NOTHING;
END $$;
