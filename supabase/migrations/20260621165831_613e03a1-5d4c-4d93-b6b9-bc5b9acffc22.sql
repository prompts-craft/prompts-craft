-- 1) Harden public.has_role with a self-check guard
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, private
AS $$
BEGIN
  -- Only allow self-checks, unless the caller is already an admin/super_admin.
  -- This prevents authenticated users from enumerating role assignments for
  -- other user IDs via direct RPC calls.
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  IF _user_id <> auth.uid()
     AND NOT EXISTS (
       SELECT 1 FROM public.user_roles
       WHERE user_id = auth.uid()
         AND role IN ('admin'::public.app_role, 'super_admin'::public.app_role)
     )
  THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
END;
$$;

-- 2) Re-affirm that anon/authenticated cannot EXECUTE this function directly.
--    RLS policies that call it still work because policy evaluation runs in
--    the database engine context, not via the API GRANT path.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

-- 3) Defense-in-depth lock on profiles: a RESTRICTIVE policy that blocks ALL
--    access regardless of any future PERMISSIVE policies someone may add.
DROP POLICY IF EXISTS "Profiles are fully restricted" ON public.profiles;
CREATE POLICY "Profiles are fully restricted"
  ON public.profiles
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);