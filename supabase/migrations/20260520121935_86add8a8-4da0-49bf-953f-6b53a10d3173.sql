DROP POLICY IF EXISTS "Visitors can increment prompt copy count" ON public.prompts;
CREATE POLICY "Visitors can increment prompt copy count"
ON public.prompts FOR UPDATE
TO anon, authenticated
USING (id IS NOT NULL AND slug IS NOT NULL)
WITH CHECK (id IS NOT NULL AND slug IS NOT NULL);