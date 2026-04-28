DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view workspaces they belong to" ON public.user_workspaces;
  DROP POLICY IF EXISTS "Admins can view all users in their org" ON public.user_workspaces;

  CREATE POLICY "Users can view workspaces they belong to" ON public.user_workspaces
    FOR SELECT TO authenticated
    USING (
      (auth.uid() = user_id) OR 
      (organization_id IN (
        SELECT organization_id FROM public.user_workspaces WHERE user_id = auth.uid()
      ))
    );
END $$;
