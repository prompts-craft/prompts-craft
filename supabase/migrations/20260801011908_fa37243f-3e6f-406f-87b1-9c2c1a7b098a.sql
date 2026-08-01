-- 1. Drop the identifying hash column
ALTER TABLE public.blog_reviews DROP COLUMN IF EXISTS reviewer_hash;
ALTER TABLE public.prompt_reviews DROP COLUMN IF EXISTS reviewer_hash;

-- 2. Remove table-wide SELECT and re-grant only non-identifying columns
REVOKE SELECT ON public.blog_reviews FROM anon, authenticated;
REVOKE SELECT ON public.prompt_reviews FROM anon, authenticated;

GRANT SELECT (id, blog_id, rating, comment, created_at, updated_at)
  ON public.blog_reviews TO anon, authenticated;
GRANT SELECT (id, prompt_id, rating, comment, created_at, updated_at)
  ON public.prompt_reviews TO anon, authenticated;

-- keep write paths intact for signed-in users
GRANT INSERT, UPDATE, DELETE ON public.blog_reviews TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.prompt_reviews TO authenticated;
GRANT ALL ON public.blog_reviews TO service_role;
GRANT ALL ON public.prompt_reviews TO service_role;

-- 3. Callers can look up ONLY their own review id
CREATE OR REPLACE FUNCTION public.my_blog_review_id(_blog_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.blog_reviews
  WHERE blog_id = _blog_id AND user_id = auth.uid()
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.my_prompt_review_id(_prompt_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.prompt_reviews
  WHERE prompt_id = _prompt_id AND user_id = auth.uid()
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.my_blog_review_id(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.my_prompt_review_id(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_blog_review_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_prompt_review_id(uuid) TO authenticated;