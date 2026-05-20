DROP POLICY IF EXISTS "Visitors can increment prompt copy count" ON public.prompts;

REVOKE UPDATE ON public.prompts FROM anon;
REVOKE UPDATE (copy_count) ON public.prompts FROM anon;

CREATE OR REPLACE FUNCTION public.increment_prompt_copies(prompt_slug text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE public.prompts
    SET copy_count = copy_count + 1
    WHERE slug = prompt_slug
    RETURNING copy_count INTO new_count;
  RETURN COALESCE(new_count, 0);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.increment_prompt_copies(text) TO anon, authenticated;