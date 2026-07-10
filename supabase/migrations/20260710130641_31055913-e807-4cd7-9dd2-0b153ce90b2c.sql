
CREATE TABLE public.blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  meta_title TEXT,
  meta_description TEXT,
  featured_image TEXT,
  content TEXT NOT NULL DEFAULT '',
  category TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  related_slugs TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX blogs_status_published_at_idx ON public.blogs (status, published_at DESC);
CREATE INDEX blogs_slug_idx ON public.blogs (slug);

GRANT SELECT ON public.blogs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blogs TO authenticated;
GRANT ALL ON public.blogs TO service_role;

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published blogs are viewable by everyone"
  ON public.blogs FOR SELECT
  USING (status = 'published' OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can insert blogs"
  ON public.blogs FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can update blogs"
  ON public.blogs FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can delete blogs"
  ON public.blogs FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
