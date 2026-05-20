ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;

REVOKE ALL ON FUNCTION public.increment_prompt_copies(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_prompt_copies(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.increment_prompt_copies(text) TO anon;