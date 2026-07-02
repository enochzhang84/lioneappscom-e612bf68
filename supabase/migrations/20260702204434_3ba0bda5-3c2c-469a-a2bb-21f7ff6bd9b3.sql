
ALTER TABLE public.tool_categories
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'live'
  CHECK (status IN ('developing','live','paused','hidden'));

ALTER TABLE public.tool_items
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'live'
  CHECK (status IN ('developing','live','paused','hidden'));
