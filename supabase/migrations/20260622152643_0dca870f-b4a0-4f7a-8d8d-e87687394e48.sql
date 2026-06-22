ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

DROP POLICY IF EXISTS "Admins can insert activity" ON public.admin_activity_log;