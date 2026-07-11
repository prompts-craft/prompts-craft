
-- Prompt reviews (user comments + ratings)
CREATE TABLE public.prompt_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text,
  rating smallint NOT NULL,
  comment text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT prompt_reviews_rating_range CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT prompt_reviews_comment_len CHECK (char_length(comment) BETWEEN 1 AND 2000),
  UNIQUE (prompt_id, user_id)
);

CREATE INDEX prompt_reviews_prompt_idx ON public.prompt_reviews(prompt_id, created_at DESC);

GRANT SELECT ON public.prompt_reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prompt_reviews TO authenticated;
GRANT ALL ON public.prompt_reviews TO service_role;

ALTER TABLE public.prompt_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
ON public.prompt_reviews FOR SELECT
USING (true);

CREATE POLICY "Signed-in users create own reviews"
ON public.prompt_reviews FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own reviews"
ON public.prompt_reviews FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own reviews or admins delete any"
ON public.prompt_reviews FOR DELETE TO authenticated
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
);

CREATE TRIGGER prompt_reviews_updated_at
BEFORE UPDATE ON public.prompt_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- Per-prompt AI model ratings (admin-managed)
CREATE TABLE public.prompt_ai_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  ai_model text NOT NULL,
  stars smallint NOT NULL,
  is_recommended boolean NOT NULL DEFAULT false,
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT prompt_ai_ratings_stars_range CHECK (stars BETWEEN 1 AND 5),
  CONSTRAINT prompt_ai_ratings_model_len CHECK (char_length(ai_model) BETWEEN 1 AND 80),
  UNIQUE (prompt_id, ai_model)
);

CREATE INDEX prompt_ai_ratings_prompt_idx ON public.prompt_ai_ratings(prompt_id, sort_order, stars DESC);

GRANT SELECT ON public.prompt_ai_ratings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prompt_ai_ratings TO authenticated;
GRANT ALL ON public.prompt_ai_ratings TO service_role;

ALTER TABLE public.prompt_ai_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view AI ratings"
ON public.prompt_ai_ratings FOR SELECT
USING (true);

CREATE POLICY "Admins insert AI ratings"
ON public.prompt_ai_ratings FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
);

CREATE POLICY "Admins update AI ratings"
ON public.prompt_ai_ratings FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
);

CREATE POLICY "Admins delete AI ratings"
ON public.prompt_ai_ratings FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
);

CREATE TRIGGER prompt_ai_ratings_updated_at
BEFORE UPDATE ON public.prompt_ai_ratings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
