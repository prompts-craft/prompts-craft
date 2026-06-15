
-- Promote all current admins to super_admin too
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT user_id, 'super_admin'::app_role FROM public.user_roles WHERE role = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

-- ============ admin_activity_log ============
CREATE TABLE public.admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text NOT NULL,          -- 'created' | 'updated' | 'deleted'
  entity_type text NOT NULL,     -- 'prompt' | 'category'
  entity_id text,
  entity_label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.admin_activity_log TO authenticated;
GRANT ALL ON public.admin_activity_log TO service_role;

ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins view activity"
  ON public.admin_activity_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Anyone authed can insert (via trigger)"
  ON public.admin_activity_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- trigger function
CREATE OR REPLACE FUNCTION public.log_admin_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action text;
  v_entity text := TG_ARGV[0];
  v_id text;
  v_label text;
  v_email text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'created';
    v_id := (to_jsonb(NEW)->>'id');
    v_label := COALESCE(to_jsonb(NEW)->>'title', to_jsonb(NEW)->>'name');
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'updated';
    v_id := (to_jsonb(NEW)->>'id');
    v_label := COALESCE(to_jsonb(NEW)->>'title', to_jsonb(NEW)->>'name');
  ELSE
    v_action := 'deleted';
    v_id := (to_jsonb(OLD)->>'id');
    v_label := COALESCE(to_jsonb(OLD)->>'title', to_jsonb(OLD)->>'name');
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();

  INSERT INTO public.admin_activity_log (actor_id, actor_email, action, entity_type, entity_id, entity_label)
  VALUES (auth.uid(), v_email, v_action, v_entity, v_id, v_label);

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER log_prompts_activity
AFTER INSERT OR UPDATE OR DELETE ON public.prompts
FOR EACH ROW EXECUTE FUNCTION public.log_admin_activity('prompt');

CREATE TRIGGER log_categories_activity
AFTER INSERT OR UPDATE OR DELETE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.log_admin_activity('category');

-- ============ admin_requests ============
CREATE TABLE public.admin_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid,
  UNIQUE (user_id, status)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_requests TO authenticated;
GRANT ALL ON public.admin_requests TO service_role;

ALTER TABLE public.admin_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests"
  ON public.admin_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can create own requests"
  ON public.admin_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Super admins update requests"
  ON public.admin_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins delete requests"
  ON public.admin_requests FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));
