CREATE OR REPLACE FUNCTION public.check_quiz_answer(_id uuid, _answer text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _correct text;
BEGIN
  SELECT correct_answer INTO _correct FROM public.quiz_questions WHERE id = _id;
  IF _correct IS NULL THEN
    RETURN jsonb_build_object('is_correct', false);
  END IF;
  IF _correct = _answer THEN
    RETURN jsonb_build_object('is_correct', true);
  END IF;
  RETURN jsonb_build_object('is_correct', false, 'correct_answer', _correct);
END;
$$;

CREATE OR REPLACE FUNCTION public.grade_quiz_questions(_ids uuid[])
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
           manual_page, manual_url, google_keywords, category
    FROM public.quiz_questions
    WHERE id = ANY(_ids)
  ) t;
$$;

GRANT EXECUTE ON FUNCTION public.check_quiz_answer(uuid, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.grade_quiz_questions(uuid[]) TO anon, authenticated, service_role;