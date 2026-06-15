
REVOKE EXECUTE ON FUNCTION public.log_admin_activity() FROM PUBLIC, anon, authenticated;

DROP POLICY "Anyone authed can insert (via trigger)" ON public.admin_activity_log;
CREATE POLICY "Admins can insert activity"
  ON public.admin_activity_log FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
