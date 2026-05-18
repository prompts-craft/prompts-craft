ALTER TABLE public.prompts
  ADD COLUMN IF NOT EXISTS copy_count INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_prompts_copy_count ON public.prompts(copy_count DESC);

CREATE OR REPLACE FUNCTION public.increment_prompt_copies(prompt_slug TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE public.prompts
    SET copy_count = copy_count + 1
    WHERE slug = prompt_slug
    RETURNING copy_count INTO new_count;
  RETURN COALESCE(new_count, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_prompt_copies(TEXT) TO anon, authenticated;