
-- Add bank metadata columns
ALTER TABLE public.question_bank_nodes
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS include_in_exam BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Restructure DMV tree into 4 levels: category -> license class -> exam project -> bank
DO $$
DECLARE
  v_c1 uuid := '07fa5d85-79b9-4b33-a663-cc41950c3af1';
  v_ab uuid := 'e8c7c40b-9ead-41da-ab3f-adea58833b6f';
  v_written_exam uuid;
  v_signs_exam uuid;
  v_air_exam uuid;
  v_comb_exam uuid;
  v_cdl_exam uuid;
BEGIN
  -- 1) Unify signs exam categories so a single c1_signs exam pools both banks
  UPDATE public.quiz_questions SET category='c1_signs' WHERE category='c1_signs3';

  -- 2) Merge 图标题库3 into 图标题库2 (will become 网站参考题库)
  UPDATE public.quiz_questions
    SET question_bank_id='dc46319e-13ae-4fb6-8a68-31b2c77f04a5'
    WHERE question_bank_id='1b57dd7b-280a-458a-a517-29a0c38acd95';
  DELETE FROM public.question_bank_nodes WHERE id='1b57dd7b-280a-458a-a517-29a0c38acd95';

  -- 3) Rename existing A/B banks' slugs so new modules can reuse the canonical slugs
  UPDATE public.question_bank_nodes SET slug='air-brake-old'    WHERE id='b83da552-0f0f-424a-910a-4f17fdf24212';
  UPDATE public.question_bank_nodes SET slug='combination-old'  WHERE id='1cce2f85-a16a-40d4-b960-11fbb178fc19';
  UPDATE public.question_bank_nodes SET slug='commercial-old'   WHERE id='e1ea9ba4-5ef3-48ea-a825-713a9e6e08f7';
  UPDATE public.question_bank_nodes SET slug='written-old'      WHERE id='11a5ddd3-bd39-435e-ada8-99118b1da964';
  UPDATE public.question_bank_nodes SET slug='signs-old'        WHERE id='37f497a7-f0fc-49ae-b6c7-5201505e6de1';
  UPDATE public.question_bank_nodes SET slug='signs2-old'       WHERE id='dc46319e-13ae-4fb6-8a68-31b2c77f04a5';

  -- 4) Create C1 sub-modules (exam projects)
  INSERT INTO public.question_bank_nodes (parent_id, node_type, name, slug, sort_order, is_active)
    VALUES (v_c1, 'module', '笔试考试', 'written-exam', 10, true) RETURNING id INTO v_written_exam;
  INSERT INTO public.question_bank_nodes (parent_id, node_type, name, slug, sort_order, is_active)
    VALUES (v_c1, 'module', '图标考试', 'signs-exam', 20, true) RETURNING id INTO v_signs_exam;

  -- 5) Move C1 banks under new exam projects and rename
  UPDATE public.question_bank_nodes
    SET parent_id=v_written_exam, name='笔试题库', slug='bank', sort_order=10,
        source='California DMV Official Handbook', include_in_exam=true
    WHERE id='11a5ddd3-bd39-435e-ada8-99118b1da964';

  UPDATE public.question_bank_nodes
    SET parent_id=v_signs_exam, name='官方手册题库', slug='official', sort_order=10,
        source='California DMV Official Handbook', include_in_exam=true
    WHERE id='37f497a7-f0fc-49ae-b6c7-5201505e6de1';

  UPDATE public.question_bank_nodes
    SET parent_id=v_signs_exam, name='网站参考题库', slug='reference', sort_order=20,
        source='Internet Reference (pass-dmv-test.com, jiazhoujiazhao.com)', include_in_exam=true
    WHERE id='dc46319e-13ae-4fb6-8a68-31b2c77f04a5';

  -- 6) Create A/B sub-modules (exam projects)
  INSERT INTO public.question_bank_nodes (parent_id, node_type, name, slug, sort_order, is_active)
    VALUES (v_ab, 'module', '空气制动', 'air-brake', 10, true) RETURNING id INTO v_air_exam;
  INSERT INTO public.question_bank_nodes (parent_id, node_type, name, slug, sort_order, is_active)
    VALUES (v_ab, 'module', '组合车辆', 'combination', 20, true) RETURNING id INTO v_comb_exam;
  INSERT INTO public.question_bank_nodes (parent_id, node_type, name, slug, sort_order, is_active)
    VALUES (v_ab, 'module', '商业驾驶者笔试', 'commercial', 30, true) RETURNING id INTO v_cdl_exam;

  -- 7) Move A/B banks under new exam projects, rename with "题库" suffix
  UPDATE public.question_bank_nodes
    SET parent_id=v_air_exam, name='空气制动题库', slug='bank', sort_order=10,
        source='California Commercial Driver Handbook', include_in_exam=true
    WHERE id='b83da552-0f0f-424a-910a-4f17fdf24212';

  UPDATE public.question_bank_nodes
    SET parent_id=v_comb_exam, name='组合车辆题库', slug='bank', sort_order=10,
        source='California Commercial Driver Handbook', include_in_exam=true
    WHERE id='1cce2f85-a16a-40d4-b960-11fbb178fc19';

  UPDATE public.question_bank_nodes
    SET parent_id=v_cdl_exam, name='商业驾驶者笔试题库', slug='bank', sort_order=10,
        source='California Commercial Driver Handbook', include_in_exam=true
    WHERE id='e1ea9ba4-5ef3-48ea-a825-713a9e6e08f7';
END $$;

-- 8) Remove duplicate signs3 exam + tool entry (now merged into c1_signs pool)
DELETE FROM public.quiz_exams WHERE category='c1_signs3';
DELETE FROM public.tool_items WHERE link_url='app:exam:c1_signs3';

-- 9) Bump c1_signs exam sizing now that the pool has ~71 questions
UPDATE public.quiz_exams
  SET total_questions=20, pass_count=16, title='小型车 C1 · 图标模拟考试'
  WHERE category='c1_signs';
