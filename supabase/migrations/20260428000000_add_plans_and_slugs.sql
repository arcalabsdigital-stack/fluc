-- Create plans table
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  price NUMERIC NOT NULL,
  asaas_plan_id TEXT,
  features JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on plans
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_plans" ON public.plans;
CREATE POLICY "authenticated_select_plans" ON public.plans FOR SELECT TO authenticated USING (true);

-- Insert base plan
INSERT INTO public.plans (name, price, features) VALUES
('Fluxo', 97.00, '{"description": "Plano básico com todas as funcionalidades"}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Ensure organizations has slug column
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS slug TEXT;

-- Update create_new_workspace function to auto-generate slug
CREATE OR REPLACE FUNCTION public.create_new_workspace(p_name text, p_cnpj text, p_corporate_name text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_org_id UUID;
  v_slug TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Generate a basic slug
  v_slug := lower(regexp_replace(p_name, '[^a-zA-Z0-9]+', '-', 'g'));

  INSERT INTO public.organizations (name, cnpj, corporate_name, slug)
  VALUES (p_name, p_cnpj, p_corporate_name, v_slug)
  RETURNING id INTO v_org_id;

  INSERT INTO public.user_workspaces (user_id, organization_id, role, is_active)
  VALUES (auth.uid(), v_org_id, 'admin', true);

  INSERT INTO public.subscriptions (organization_id, plan, status, trial_start, trial_end)
  VALUES (v_org_id, 'Fluxo', 'trial', now(), now() + interval '7 days');

  UPDATE public.profiles
  SET organization_id = v_org_id
  WHERE id = auth.uid();

  RETURN v_org_id;
END;
$function$
