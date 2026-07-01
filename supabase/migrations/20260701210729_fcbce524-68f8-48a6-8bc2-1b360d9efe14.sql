ALTER TABLE public.tool_items 
  ADD COLUMN IF NOT EXISTS page_title text,
  ADD COLUMN IF NOT EXISTS external_url text,
  ADD COLUMN IF NOT EXISTS internal_url text,
  ADD COLUMN IF NOT EXISTS button_url text;