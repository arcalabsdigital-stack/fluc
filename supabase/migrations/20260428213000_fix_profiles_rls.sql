-- Fix get_current_user_org_id to be plpgsql to prevent any inlining issues
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

-- Fix is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_workspaces
    WHERE user_id = auth.uid() 
      AND organization_id = public.get_current_user_org_id()
      AND role = 'admin' 
      AND is_active = true
  );
END;
$$;

-- Fix handle_new_user to properly handle empty strings and avoid errors
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
DECLARE
  org_id UUID;
  new_role TEXT;
  v_must_change_password BOOLEAN;
  v_org_name TEXT;
  v_plan TEXT;
BEGIN
  v_must_change_password := COALESCE((NEW.raw_user_meta_data->>'must_change_password')::boolean, false);
  
  BEGIN
    org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
  EXCEPTION WHEN OTHERS THEN
    org_id := NULL;
  END;
  
  new_role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'admin');
  v_plan := NEW.raw_user_meta_data->>'plan';

  IF org_id IS NULL THEN
     v_org_name := COALESCE(NULLIF(NEW.raw_user_meta_data->>'organization_name', ''), NULLIF(NEW.raw_user_meta_data->>'full_name', '') || ' - Organização', 'Minha Organização');
     INSERT INTO public.organizations (name) VALUES (v_org_name) RETURNING id INTO org_id;
     new_role := 'admin';
     
     INSERT INTO public.subscriptions (organization_id, plan, status, trial_start, trial_end)
     VALUES (org_id, COALESCE(NULLIF(v_plan, ''), 'Fluxo'), 'trial', now(), now() + interval '7 days')
     ON CONFLICT (organization_id) DO NOTHING;
  END IF;

  BEGIN
    IF org_id IS NOT NULL THEN
      INSERT INTO public.profiles (id, full_name, role, organization_id, is_active, must_change_password, plan)
      VALUES (NEW.id, NULLIF(NEW.raw_user_meta_data->>'full_name', ''), new_role, org_id, true, v_must_change_password, NULLIF(v_plan, ''))
      ON CONFLICT (id) DO UPDATE SET plan = EXCLUDED.plan WHERE profiles.plan IS NULL;
      
      INSERT INTO public.user_workspaces (user_id, organization_id, role, is_active)
      VALUES (NEW.id, org_id, new_role, true)
      ON CONFLICT (user_id, organization_id) DO NOTHING;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user profile insert failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Drop the old recursive policy
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;

-- Create a safe, non-recursive policy
CREATE POLICY "Users can view profiles in their organization" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid() OR 
    organization_id IN (
      SELECT organization_id FROM public.user_workspaces WHERE user_id = auth.uid()
    )
  );

-- Fix update policies too
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid()) 
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Admins can update profiles in their organization" ON public.profiles;
CREATE POLICY "Admins can update profiles in their organization" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    public.is_admin() AND 
    organization_id IN (
      SELECT organization_id FROM public.user_workspaces WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Fix user_workspaces policy
DROP POLICY IF EXISTS "Users can view workspaces they belong to" ON public.user_workspaces;
CREATE POLICY "Users can view workspaces they belong to" ON public.user_workspaces
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR 
    organization_id IN (
      SELECT organization_id FROM public.user_workspaces WHERE user_id = auth.uid()
    )
  );
