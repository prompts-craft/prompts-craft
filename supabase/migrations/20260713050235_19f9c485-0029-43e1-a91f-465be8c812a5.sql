
-- 1) Storage: use hardened private.has_role for blog image uploads
DROP POLICY IF EXISTS "Admins can upload blog images" ON storage.objects;
CREATE POLICY "Admins can upload blog images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'blog-images'
  AND (
    private.has_role(auth.uid(), 'admin'::public.app_role)
    OR private.has_role(auth.uid(), 'super_admin'::public.app_role)
  )
);

-- 2) blog_reviews: restrict base-table reads to owner only; expose anonymized view publicly
DROP POLICY IF EXISTS "Anyone can read blog reviews" ON public.blog_reviews;
CREATE POLICY "Owners can read own blog review"
  ON public.blog_reviews FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

REVOKE SELECT ON public.blog_reviews FROM anon;

CREATE OR REPLACE VIEW public.blog_reviews_public
WITH (security_invoker = false) AS
SELECT
  id,
  blog_id,
  rating,
  comment,
  created_at,
  updated_at,
  substring(md5(user_id::text) from 1 for 8) AS reviewer_hash,
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) AS is_mine
FROM public.blog_reviews;

GRANT SELECT ON public.blog_reviews_public TO anon, authenticated;

-- 3) prompt_reviews: same treatment
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.prompt_reviews;
CREATE POLICY "Owners can read own prompt review"
  ON public.prompt_reviews FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

REVOKE SELECT ON public.prompt_reviews FROM anon;

CREATE OR REPLACE VIEW public.prompt_reviews_public
WITH (security_invoker = false) AS
SELECT
  id,
  prompt_id,
  rating,
  comment,
  created_at,
  updated_at,
  substring(md5(user_id::text) from 1 for 8) AS reviewer_hash,
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) AS is_mine
FROM public.prompt_reviews;

GRANT SELECT ON public.prompt_reviews_public TO anon, authenticated;
