
-- 1) Remove exposed email column on prompt_reviews
ALTER TABLE public.prompt_reviews DROP COLUMN IF EXISTS user_email;

-- 2) Rewrite all policies that reference public.has_role to use private.has_role
-- admin_activity_log
DROP POLICY IF EXISTS "Super admins view activity" ON public.admin_activity_log;
CREATE POLICY "Super admins view activity" ON public.admin_activity_log
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin'::public.app_role));

-- admin_requests
DROP POLICY IF EXISTS "Super admins delete requests" ON public.admin_requests;
CREATE POLICY "Super admins delete requests" ON public.admin_requests
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "Super admins update requests" ON public.admin_requests;
CREATE POLICY "Super admins update requests" ON public.admin_requests
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "Users can view own requests" ON public.admin_requests;
CREATE POLICY "Users can view own requests" ON public.admin_requests
  FOR SELECT TO authenticated
  USING ((user_id = auth.uid()) OR private.has_role(auth.uid(), 'super_admin'::public.app_role));

-- blogs
DROP POLICY IF EXISTS "Admins can update blogs" ON public.blogs;
CREATE POLICY "Admins can update blogs" ON public.blogs
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role) OR private.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role) OR private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "Published blogs are viewable by everyone" ON public.blogs;
CREATE POLICY "Published blogs are viewable by everyone" ON public.blogs
  FOR SELECT
  USING ((status = 'published'::text) OR private.has_role(auth.uid(), 'admin'::public.app_role) OR private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can insert blogs" ON public.blogs;
CREATE POLICY "Admins can insert blogs" ON public.blogs
  FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role) OR private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can delete blogs" ON public.blogs;
CREATE POLICY "Admins can delete blogs" ON public.blogs
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role) OR private.has_role(auth.uid(), 'super_admin'::public.app_role));

-- categories
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
CREATE POLICY "Admins can insert categories" ON public.categories
  FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
CREATE POLICY "Admins can delete categories" ON public.categories
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
CREATE POLICY "Admins can update categories" ON public.categories
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- prompt_ai_ratings
DROP POLICY IF EXISTS "Admins insert AI ratings" ON public.prompt_ai_ratings;
CREATE POLICY "Admins insert AI ratings" ON public.prompt_ai_ratings
  FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role) OR private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "Admins update AI ratings" ON public.prompt_ai_ratings;
CREATE POLICY "Admins update AI ratings" ON public.prompt_ai_ratings
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role) OR private.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role) OR private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "Admins delete AI ratings" ON public.prompt_ai_ratings;
CREATE POLICY "Admins delete AI ratings" ON public.prompt_ai_ratings
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role) OR private.has_role(auth.uid(), 'super_admin'::public.app_role));

-- prompt_reviews delete policy
DROP POLICY IF EXISTS "Users delete own reviews or admins delete any" ON public.prompt_reviews;
CREATE POLICY "Users delete own reviews or admins delete any" ON public.prompt_reviews
  FOR DELETE TO authenticated
  USING ((auth.uid() = user_id) OR private.has_role(auth.uid(), 'admin'::public.app_role) OR private.has_role(auth.uid(), 'super_admin'::public.app_role));

-- storage.objects blog-images policies
DROP POLICY IF EXISTS "Admins can delete blog images" ON storage.objects;
CREATE POLICY "Admins can delete blog images" ON storage.objects
  FOR DELETE TO authenticated
  USING ((bucket_id = 'blog-images'::text) AND (private.has_role(auth.uid(), 'admin'::public.app_role) OR private.has_role(auth.uid(), 'super_admin'::public.app_role)));

DROP POLICY IF EXISTS "Admins can update blog images" ON storage.objects;
CREATE POLICY "Admins can update blog images" ON storage.objects
  FOR UPDATE TO authenticated
  USING ((bucket_id = 'blog-images'::text) AND (private.has_role(auth.uid(), 'admin'::public.app_role) OR private.has_role(auth.uid(), 'super_admin'::public.app_role)))
  WITH CHECK ((bucket_id = 'blog-images'::text) AND (private.has_role(auth.uid(), 'admin'::public.app_role) OR private.has_role(auth.uid(), 'super_admin'::public.app_role)));

DROP POLICY IF EXISTS "Admins can insert blog images" ON storage.objects;
CREATE POLICY "Admins can insert blog images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK ((bucket_id = 'blog-images'::text) AND (private.has_role(auth.uid(), 'admin'::public.app_role) OR private.has_role(auth.uid(), 'super_admin'::public.app_role)));

DROP POLICY IF EXISTS "Admins can view blog images" ON storage.objects;
CREATE POLICY "Admins can view blog images" ON storage.objects
  FOR SELECT TO authenticated
  USING ((bucket_id = 'blog-images'::text) AND (private.has_role(auth.uid(), 'admin'::public.app_role) OR private.has_role(auth.uid(), 'super_admin'::public.app_role)));

-- 3) Revoke execute on public.has_role from anon/authenticated so it is not callable via API.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;

-- Ensure private.has_role remains callable so RLS policies work.
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO anon, authenticated, service_role;
