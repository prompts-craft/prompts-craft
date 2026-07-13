
-- Undo the SECURITY DEFINER views from the previous migration
DROP VIEW IF EXISTS public.blog_reviews_public;
DROP VIEW IF EXISTS public.prompt_reviews_public;

-- Restore public read policies on base tables (column grants will hide user_id)
DROP POLICY IF EXISTS "Owners can read own blog review" ON public.blog_reviews;
CREATE POLICY "Anyone can read blog reviews"
  ON public.blog_reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Owners can read own prompt review" ON public.prompt_reviews;
CREATE POLICY "Anyone can view reviews"
  ON public.prompt_reviews FOR SELECT
  USING (true);

-- Add a stable, anonymous reviewer code as a generated column
ALTER TABLE public.blog_reviews
  ADD COLUMN IF NOT EXISTS reviewer_hash text
  GENERATED ALWAYS AS (substring(md5(user_id::text) from 1 for 8)) STORED;

ALTER TABLE public.prompt_reviews
  ADD COLUMN IF NOT EXISTS reviewer_hash text
  GENERATED ALWAYS AS (substring(md5(user_id::text) from 1 for 8)) STORED;

-- Column-level SELECT: hide user_id from anon and authenticated
REVOKE SELECT ON public.blog_reviews FROM anon, authenticated;
GRANT SELECT (id, blog_id, rating, comment, created_at, updated_at, reviewer_hash)
  ON public.blog_reviews TO anon, authenticated;

REVOKE SELECT ON public.prompt_reviews FROM anon, authenticated;
GRANT SELECT (id, prompt_id, rating, comment, created_at, updated_at, reviewer_hash)
  ON public.prompt_reviews TO anon, authenticated;
