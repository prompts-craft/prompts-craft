CREATE OR REPLACE FUNCTION public.increment_prompt_copies(prompt_slug text)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
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
GRANT UPDATE (copy_count) ON public.prompts TO anon, authenticated;

DROP POLICY IF EXISTS "Visitors can increment prompt copy count" ON public.prompts;
CREATE POLICY "Visitors can increment prompt copy count"
ON public.prompts FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Profiles are locked down" ON public.profiles;
CREATE POLICY "Profiles are locked down"
ON public.profiles FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);