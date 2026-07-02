ALTER TABLE public.quiz_questions
  ADD COLUMN IF NOT EXISTS official_source text,
  ADD COLUMN IF NOT EXISTS manual_name text,
  ADD COLUMN IF NOT EXISTS manual_chapter text,
  ADD COLUMN IF NOT EXISTS manual_page text,
  ADD COLUMN IF NOT EXISTS manual_url text,
  ADD COLUMN IF NOT EXISTS google_keywords text;