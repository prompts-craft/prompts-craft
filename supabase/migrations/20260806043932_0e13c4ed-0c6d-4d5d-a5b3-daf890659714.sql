ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'image';

ALTER TABLE public.categories
  ADD CONSTRAINT categories_media_type_check CHECK (media_type IN ('image','video'));