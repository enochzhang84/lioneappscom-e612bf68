
ALTER TABLE public.quiz_questions
  ADD COLUMN IF NOT EXISTS question_type text NOT NULL DEFAULT 'single_choice';

ALTER TABLE public.quiz_questions
  DROP CONSTRAINT IF EXISTS quiz_questions_question_type_check;
ALTER TABLE public.quiz_questions
  ADD CONSTRAINT quiz_questions_question_type_check
  CHECK (question_type IN (
    'single_choice','image_choice','sign_recognition',
    'multiple_choice','true_false','fill_blank','hotspot'
  ));

-- Backfill existing DMV sign banks
UPDATE public.quiz_questions
   SET question_type = 'image_choice'
 WHERE question_bank_id = 'dc46319e-13ae-4fb6-8a68-31b2c77f04a5';

UPDATE public.quiz_questions
   SET question_type = 'sign_recognition'
 WHERE question_bank_id = '37f497a7-f0fc-49ae-b6c7-5201505e6de1';

-- Grant read to anon (column already granted for existing cols; ensure new column readable)
GRANT SELECT (question_type) ON public.quiz_questions TO anon;
GRANT SELECT (question_type) ON public.quiz_questions TO authenticated;
