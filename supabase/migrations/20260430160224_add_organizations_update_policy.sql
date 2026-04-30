-- Fix RLS: Allow admins to update their own organizations
DROP POLICY IF EXISTS "Admins can update their organization" ON public.organizations;
CREATE POLICY "Admins can update their organization" ON public.organizations
  FOR UPDATE TO authenticated
  USING (id IN (SELECT get_auth_admin_workspaces()))
  WITH CHECK (id IN (SELECT get_auth_admin_workspaces()));
