GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.prompts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.prompts TO authenticated;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_prompt_copies(text) TO anon, authenticated;