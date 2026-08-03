REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Super admins delete requests" ON public.admin_requests;
DROP POLICY IF EXISTS "Super admins update requests" ON public.admin_requests;
DROP POLICY IF EXISTS "Users can view own requests" ON public.admin_requests;
DROP POLICY IF EXISTS "Users can create own requests" ON public.admin_requests;

CREATE POLICY "Users can view own requests"
  ON public.admin_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Users can create own requests"
  ON public.admin_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Super admins update requests"
  ON public.admin_requests FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Super admins delete requests"
  ON public.admin_requests FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin'::public.app_role));

ALTER TABLE public.admin_requests ENABLE ROW LEVEL SECURITY;