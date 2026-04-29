-- Redefine functions as PL/pgSQL to prevent inlining and infinite recursion in RLS policies

CREATE OR REPLACE FUNCTION public.get_auth_user_workspaces()
 RETURNS SETOF uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY SELECT organization_id FROM public.user_workspaces WHERE user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.get_auth_admin_workspaces()
 RETURNS SETOF uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY SELECT organization_id FROM public.user_workspaces WHERE user_id = auth.uid() AND role = 'admin';
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  SELECT organization_id INTO v_org_id FROM public.profiles WHERE id = auth.uid() AND is_active = true LIMIT 1;
  RETURN v_org_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  RETURN COALESCE((
    SELECT role FROM public.user_workspaces 
    WHERE user_id = auth.uid() 
      AND organization_id = public.get_current_user_org_id()
      AND is_active = true
  ), 'visitante');
END;
$$;
