-- 1. Create multi-workspace and billing tables
CREATE TABLE IF NOT EXISTS public.user_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'visitante',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS cnpj TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS corporate_name TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS slug TEXT;

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE NOT NULL,
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'trial',
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  asaas_customer_id TEXT,
  asaas_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL,
  payment_date TIMESTAMPTZ,
  receipt_url TEXT,
  invoice_url TEXT,
  asaas_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Populate user_workspaces from existing profiles
INSERT INTO public.user_workspaces (user_id, organization_id, role, is_active)
SELECT id, organization_id, role, is_active FROM public.profiles
WHERE organization_id IS NOT NULL
ON CONFLICT (user_id, organization_id) DO NOTHING;

-- 3. Populate subscriptions for existing orgs (giving 7 days trial to existing ones as default)
INSERT INTO public.subscriptions (organization_id, plan, status, trial_start, trial_end)
SELECT id, 'Fluxo', 'active', now(), now() + interval '7 days' FROM public.organizations
ON CONFLICT (organization_id) DO NOTHING;

-- 4. Update Functions to respect multi-workspace logic
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_workspaces
    WHERE user_id = auth.uid() 
      AND organization_id = public.get_current_user_org_id()
      AND role = 'admin' 
      AND is_active = true
  );
END;
$function$

CREATE OR REPLACE FUNCTION public.get_user_role()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN COALESCE((
    SELECT role FROM public.user_workspaces 
    WHERE user_id = auth.uid() 
      AND organization_id = public.get_current_user_org_id()
      AND is_active = true
  ), 'visitante');
END;
$function$

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
  
  new_role := COALESCE(NEW.raw_user_meta_data->>'role', 'admin');
  v_plan := NEW.raw_user_meta_data->>'plan';

  IF org_id IS NULL THEN
     v_org_name := COALESCE(NEW.raw_user_meta_data->>'organization_name', NEW.raw_user_meta_data->>'full_name' || ' - Organização', 'Minha Organização');
     INSERT INTO public.organizations (name) VALUES (v_org_name) RETURNING id INTO org_id;
     new_role := 'admin';
     
     INSERT INTO public.subscriptions (organization_id, plan, status, trial_start, trial_end)
     VALUES (org_id, COALESCE(v_plan, 'Fluxo'), 'trial', now(), now() + interval '7 days');
  END IF;

  BEGIN
    IF org_id IS NOT NULL THEN
      INSERT INTO public.profiles (id, full_name, role, organization_id, is_active, must_change_password, plan)
      VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', new_role, org_id, true, v_must_change_password, v_plan)
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
$function$

-- 5. Update RLS Policies
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;
CREATE POLICY "Users can view profiles in their organization" ON public.profiles
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_workspaces uw
      WHERE uw.user_id = profiles.id AND uw.organization_id = public.get_current_user_org_id()
    )
  );

ALTER TABLE public.user_workspaces ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view workspaces they belong to" ON public.user_workspaces;
CREATE POLICY "Users can view workspaces they belong to" ON public.user_workspaces
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all users in their org" ON public.user_workspaces;
CREATE POLICY "Admins can view all users in their org" ON public.user_workspaces
  FOR SELECT TO authenticated USING (organization_id = public.get_current_user_org_id());

DROP POLICY IF EXISTS "Admins can update users in their org" ON public.user_workspaces;
CREATE POLICY "Admins can update users in their org" ON public.user_workspaces
  FOR UPDATE TO authenticated USING (public.is_admin() AND organization_id = public.get_current_user_org_id());

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view subscriptions in their org" ON public.subscriptions;
CREATE POLICY "Users can view subscriptions in their org" ON public.subscriptions
  FOR SELECT TO authenticated USING (organization_id = public.get_current_user_org_id());

ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view billing in their org" ON public.billing_history;
CREATE POLICY "Users can view billing in their org" ON public.billing_history
  FOR SELECT TO authenticated USING (organization_id = public.get_current_user_org_id());
