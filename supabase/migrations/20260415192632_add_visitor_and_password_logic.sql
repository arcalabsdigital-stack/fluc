-- Add must_change_password column logic
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;

-- Update handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  org_id UUID;
  org_name TEXT;
  new_role TEXT;
  v_must_change_password BOOLEAN;
BEGIN
  org_name := NEW.raw_user_meta_data->>'organization_name';
  v_must_change_password := COALESCE((NEW.raw_user_meta_data->>'must_change_password')::boolean, false);

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

  INSERT INTO public.profiles (id, full_name, role, organization_id, is_active, must_change_password)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    new_role,
    org_id,
    true,
    v_must_change_password
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update send_welcome_email_webhook trigger
CREATE OR REPLACE FUNCTION public.send_welcome_email_webhook()
RETURNS trigger AS $$
DECLARE
  v_email text;
  v_temp_password text;
BEGIN
  SELECT email, raw_user_meta_data->>'temp_password' INTO v_email, v_temp_password FROM auth.users WHERE id = NEW.id;

  IF v_email IS NOT NULL THEN
    PERFORM net.http_post(
      url := 'https://hwigxdigeurmrgovdhgi.supabase.co/functions/v1/welcome-email',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3aWd4ZGlnZXVybXJnb3ZkaGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDA1MzQsImV4cCI6MjA5MTA3NjUzNH0.N6gXdXpjuAOP9cUo1geVOduklJrydA8j8NTW1Erd-xU"}'::jsonb,
      body := jsonb_build_object(
        'email', v_email,
        'name', COALESCE(NEW.full_name, 'Usuário'),
        'password', v_temp_password
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Lock down RLS for visitantes on write operations
DROP POLICY IF EXISTS "Users can insert transactions in their org" ON public.transactions;
CREATE POLICY "Users can insert transactions in their org" ON public.transactions
  FOR INSERT TO authenticated
  WITH CHECK (organization_id = get_current_user_org_id() AND public.get_user_role() != 'visitante');

DROP POLICY IF EXISTS "Users can update transactions in their org" ON public.transactions;
CREATE POLICY "Users can update transactions in their org" ON public.transactions
  FOR UPDATE TO authenticated
  USING (organization_id = get_current_user_org_id() AND public.get_user_role() != 'visitante');

DROP POLICY IF EXISTS "Users can delete transactions in their org" ON public.transactions;
CREATE POLICY "Users can delete transactions in their org" ON public.transactions
  FOR DELETE TO authenticated
  USING (organization_id = get_current_user_org_id() AND public.get_user_role() != 'visitante');

DROP POLICY IF EXISTS "Users can insert recurring in their org" ON public.recurring_transactions;
CREATE POLICY "Users can insert recurring in their org" ON public.recurring_transactions
  FOR INSERT TO public
  WITH CHECK (organization_id = get_current_user_org_id() AND public.get_user_role() != 'visitante');

DROP POLICY IF EXISTS "Users can update recurring in their org" ON public.recurring_transactions;
CREATE POLICY "Users can update recurring in their org" ON public.recurring_transactions
  FOR UPDATE TO public
  USING (organization_id = get_current_user_org_id() AND public.get_user_role() != 'visitante');

DROP POLICY IF EXISTS "Users can delete recurring in their org" ON public.recurring_transactions;
CREATE POLICY "Users can delete recurring in their org" ON public.recurring_transactions
  FOR DELETE TO public
  USING (organization_id = get_current_user_org_id() AND public.get_user_role() != 'visitante');
