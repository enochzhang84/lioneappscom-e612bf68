CREATE OR REPLACE FUNCTION public.list_practice_questions(_categories text[])
RETURNS SETOF jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT to_jsonb(t) FROM (
    SELECT id, question_type, question, image_url, option_a, option_b, option_c, option_d,
           correct_answer, explanation, question_en, option_a_en, option_b_en, option_c_en,
           option_d_en, explanation_en, official_source, manual_name, manual_chapter,
           manual_page, manual_url, google_keywords, category, created_at
    FROM public.quiz_questions
    WHERE category = ANY(_categories)
      AND is_active = true
    ORDER BY category, created_at, id
  ) t;
$$;

GRANT EXECUTE ON FUNCTION public.list_practice_questions(text[]) TO anon, authenticated, service_role;