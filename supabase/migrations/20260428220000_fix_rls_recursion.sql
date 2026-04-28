DO $$
BEGIN
  -- Drop existing recursive policies to avoid infinite loop
  DROP POLICY IF EXISTS "Users can view workspaces they belong to" ON public.user_workspaces;
  DROP POLICY IF EXISTS "Admins can update users in their org" ON public.user_workspaces;
  DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;
  DROP POLICY IF EXISTS "Admins can update profiles in their organization" ON public.profiles;
  DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;
END $$;

-- Create a security definer function to get auth user workspaces safely, bypassing RLS
CREATE OR REPLACE FUNCTION public.get_auth_user_workspaces()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT organization_id FROM public.user_workspaces WHERE user_id = auth.uid();
$$;

-- Create a security definer function to get auth user admin workspaces safely, bypassing RLS
CREATE OR REPLACE FUNCTION public.get_auth_admin_workspaces()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT organization_id FROM public.user_workspaces WHERE user_id = auth.uid() AND role = 'admin';
$$;

-- Apply non-recursive policies
CREATE POLICY "Users can view workspaces they belong to" ON public.user_workspaces
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR 
    organization_id IN (SELECT public.get_auth_user_workspaces())
  );

CREATE POLICY "Admins can update users in their org" ON public.user_workspaces
  FOR UPDATE TO authenticated
  USING (
    organization_id IN (SELECT public.get_auth_admin_workspaces())
  );

CREATE POLICY "Users can view profiles in their organization" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid() OR 
    organization_id IN (SELECT public.get_auth_user_workspaces())
  );

CREATE POLICY "Admins can update profiles in their organization" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    organization_id IN (SELECT public.get_auth_admin_workspaces())
  );

CREATE POLICY "Users can view their own organization" ON public.organizations
  FOR SELECT TO authenticated
  USING (
    id IN (SELECT public.get_auth_user_workspaces()) OR
    id = public.get_current_user_org_id()
  );
