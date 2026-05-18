CREATE TABLE public.prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  prompt TEXT NOT NULL,
  description TEXT,
  example TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  trending BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prompts are publicly viewable"
  ON public.prompts FOR SELECT
  USING (true);

CREATE INDEX idx_prompts_category ON public.prompts(category);
CREATE INDEX idx_prompts_created_at ON public.prompts(created_at DESC);