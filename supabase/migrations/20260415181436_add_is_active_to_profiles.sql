-- 1. Implement Soft Delete Column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- 2. Adjust Foreign Keys for Cascade Delete
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Update the handle_new_user trigger to ensure is_active is set
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
  
  INSERT INTO public.profiles (id, full_name, role, organization_id, is_active)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    new_role,
    org_id,
    true
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Enforce RLS restriction by updating auth functions to only return data for active users
CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS uuid AS $function$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND is_active = true;
$function$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $function$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid() AND is_active = true);
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';
