CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  emoji TEXT NOT NULL DEFAULT '✨',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.categories (slug, name, description, emoji, sort_order) VALUES
  ('teachers', 'Teachers', 'Lesson plans, rubrics, and classroom helpers.', '🎓', 1),
  ('students', 'Students', 'Study aids, essay helpers, and exam prep.', '📚', 2),
  ('freelancers', 'Freelancers', 'Proposals, client emails, and pricing.', '💼', 3),
  ('marketing', 'Marketing', 'Ad copy, social posts, and campaigns.', '📣', 4),
  ('developers', 'Developers', 'Code reviews, debugging, and docs.', '💻', 5),
  ('upscaling', 'Image Upscaling', 'Sharpen and upscale photos to 4K and beyond.', '🔍', 6),
  ('background-removal', 'Background Removal', 'Clean cutouts for products, portraits, and assets.', '✂️', 7),
  ('creative-images', 'Creative Images', 'Generate stunning AI artwork and concept visuals.', '🎨', 8);
