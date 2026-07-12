
CREATE TABLE public.blog_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL CHECK (char_length(comment) >= 3 AND char_length(comment) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (blog_id, user_id)
);

GRANT SELECT ON public.blog_reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_reviews TO authenticated;
GRANT ALL ON public.blog_reviews TO service_role;

ALTER TABLE public.blog_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read blog reviews"
  ON public.blog_reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert their own blog review"
  ON public.blog_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blog review"
  ON public.blog_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own blog review"
  ON public.blog_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_blog_reviews_updated_at
  BEFORE UPDATE ON public.blog_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_blog_reviews_blog_id ON public.blog_reviews(blog_id);
