
ALTER TABLE public.quiz_questions
  ADD COLUMN IF NOT EXISTS question_en TEXT,
  ADD COLUMN IF NOT EXISTS option_a_en TEXT,
  ADD COLUMN IF NOT EXISTS option_b_en TEXT,
  ADD COLUMN IF NOT EXISTS option_c_en TEXT,
  ADD COLUMN IF NOT EXISTS option_d_en TEXT,
  ADD COLUMN IF NOT EXISTS explanation_en TEXT;
