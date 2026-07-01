ALTER TABLE public.tool_items
  ADD COLUMN IF NOT EXISTS subtitle text,
  ADD COLUMN IF NOT EXISTS html_content text;