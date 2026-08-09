ALTER TABLE public.prompts
  ADD COLUMN IF NOT EXISTS showcase boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'image';

ALTER TABLE public.prompts DROP CONSTRAINT IF EXISTS prompts_media_type_check;
ALTER TABLE public.prompts ADD CONSTRAINT prompts_media_type_check CHECK (media_type IN ('image','video'));

-- de-duplicate any existing duplicate slugs, keeping the newest row
DELETE FROM public.prompts p
USING public.prompts q
WHERE p.slug = q.slug AND p.created_at < q.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS prompts_slug_key ON public.prompts (slug);