
-- 1) admin_activity_log: add explicit INSERT policy that denies direct writes.
-- The log_admin_activity() SECURITY DEFINER trigger (owned by postgres, BYPASSRLS)
-- continues to write audit rows; no authenticated user can fabricate entries.
DROP POLICY IF EXISTS "Block direct inserts to activity log" ON public.admin_activity_log;
CREATE POLICY "Block direct inserts to activity log"
  ON public.admin_activity_log
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (false);

-- 2) user_roles: add RESTRICTIVE policies so only admins can write, regardless
-- of any future permissive policy misconfiguration. RESTRICTIVE policies AND
-- with all permissive policies, eliminating TOCTOU/self-grant risks.
DROP POLICY IF EXISTS "Restrict role writes to admins (insert)" ON public.user_roles;
CREATE POLICY "Restrict role writes to admins (insert)"
  ON public.user_roles
  AS RESTRICTIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Restrict role writes to admins (update)" ON public.user_roles;
CREATE POLICY "Restrict role writes to admins (update)"
  ON public.user_roles
  AS RESTRICTIVE
  FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Restrict role writes to admins (delete)" ON public.user_roles;
CREATE POLICY "Restrict role writes to admins (delete)"
  ON public.user_roles
  AS RESTRICTIVE
  FOR DELETE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
