DO $function$
BEGIN
  -- Create organizations table
  CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Add columns if not exist
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS organization_id UUID;
  ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS organization_id UUID;

  -- Create default org if needed and assign existing users
  IF EXISTS (SELECT 1 FROM public.profiles WHERE organization_id IS NULL) THEN
    INSERT INTO public.organizations (name)
    VALUES ('Organização Padrão')
    ON CONFLICT DO NOTHING;
    
    UPDATE public.profiles
    SET organization_id = (SELECT id FROM public.organizations LIMIT 1)
    WHERE organization_id IS NULL;
    
    UPDATE public.transactions
    SET organization_id = (SELECT id FROM public.organizations LIMIT 1)
    WHERE organization_id IS NULL;
  END IF;

  -- Add foreign keys safely
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_organization_id_fkey'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'transactions_organization_id_fkey'
  ) THEN
    ALTER TABLE public.transactions ADD CONSTRAINT transactions_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);
  END IF;
END $function$;

-- Make organization_id NOT NULL
ALTER TABLE public.profiles ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.transactions ALTER COLUMN organization_id SET NOT NULL;

-- Helper function for RLS
CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $function$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$function$;

-- Trigger to auto-set organization_id on transactions
CREATE OR REPLACE FUNCTION public.set_transaction_org_id()
RETURNS trigger AS $function$
BEGIN
  IF NEW.organization_id IS NULL THEN
    NEW.organization_id := public.get_current_user_org_id();
  END IF;
  RETURN NEW;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_transaction_org_id_trigger ON public.transactions;
CREATE TRIGGER set_transaction_org_id_trigger
  BEFORE INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_transaction_org_id();

-- Update handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $function$
DECLARE
  org_id UUID;
  org_name TEXT;
  new_role TEXT;
BEGIN
  org_name := NEW.raw_user_meta_data->>'organization_name';
  
  IF org_name IS NOT NULL THEN
    INSERT INTO public.organizations (name) VALUES (org_name) RETURNING id INTO org_id;
    new_role := 'admin';
  ELSE
    org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
    new_role := COALESCE(NEW.raw_user_meta_data->>'role', 'visitante');
    
    IF org_id IS NULL THEN
       SELECT id INTO org_id FROM public.organizations LIMIT 1;
       IF org_id IS NULL THEN
         INSERT INTO public.organizations (name) VALUES ('Organização Padrão') RETURNING id INTO org_id;
       END IF;
       new_role := 'visitante';
    END IF;
  END IF;
  
  INSERT INTO public.profiles (id, full_name, role, organization_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    new_role,
    org_id
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS Policies
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;
CREATE POLICY "Users can view their own organization" ON public.organizations
  FOR SELECT TO authenticated USING (id = public.get_current_user_org_id());

-- Profiles RLS
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles in their organization" ON public.profiles;

CREATE POLICY "Users can view profiles in their organization" ON public.profiles
  FOR SELECT TO authenticated USING (organization_id = public.get_current_user_org_id());

CREATE POLICY "Admins can update profiles in their organization" ON public.profiles
  FOR UPDATE TO authenticated USING (
    public.is_admin() AND organization_id = public.get_current_user_org_id()
  );

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

-- Transactions RLS
DROP POLICY IF EXISTS "Admins and users can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can delete all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can update all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Collaborators can view latest transaction" ON public.transactions;
DROP POLICY IF EXISTS "Standard users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users view transactions in their org" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert transactions in their org" ON public.transactions;
DROP POLICY IF EXISTS "Users can update transactions in their org" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete transactions in their org" ON public.transactions;

CREATE POLICY "Users view transactions in their org" ON public.transactions
  FOR SELECT TO authenticated USING (organization_id = public.get_current_user_org_id());

CREATE POLICY "Users can insert transactions in their org" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK (organization_id = public.get_current_user_org_id());

CREATE POLICY "Users can update transactions in their org" ON public.transactions
  FOR UPDATE TO authenticated USING (organization_id = public.get_current_user_org_id());

CREATE POLICY "Users can delete transactions in their org" ON public.transactions
  FOR DELETE TO authenticated USING (organization_id = public.get_current_user_org_id());
