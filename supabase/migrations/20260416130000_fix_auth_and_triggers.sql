-- Fix auth.users nulls to prevent "Database error checking email" in GoTrue
UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE
  confirmation_token IS NULL OR recovery_token IS NULL
  OR email_change_token_new IS NULL OR email_change IS NULL
  OR email_change_token_current IS NULL
  OR phone_change IS NULL OR phone_change_token IS NULL
  OR reauthentication_token IS NULL;

-- Ensure trigger on auth.users is safe and isolated
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  org_id UUID;
  new_role TEXT;
  v_must_change_password BOOLEAN;
BEGIN
  -- Set defaults
  v_must_change_password := false;
  
  BEGIN
    v_must_change_password := COALESCE((NEW.raw_user_meta_data->>'must_change_password')::boolean, false);
  EXCEPTION WHEN OTHERS THEN
    v_must_change_password := false;
  END;

  BEGIN
    org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
  EXCEPTION WHEN OTHERS THEN
    org_id := NULL;
  END;
  
  new_role := COALESCE(NEW.raw_user_meta_data->>'role', 'visitante');

  IF org_id IS NULL THEN
     BEGIN
       SELECT id INTO org_id FROM public.organizations LIMIT 1;
       IF org_id IS NULL THEN
         INSERT INTO public.organizations (name) VALUES ('Organização Padrão') RETURNING id INTO org_id;
       END IF;
     EXCEPTION WHEN OTHERS THEN
       org_id := NULL;
     END;
     new_role := 'visitante';
  END IF;

  BEGIN
    IF org_id IS NOT NULL THEN
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
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user profile insert failed: %', SQLERRM;
  END;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user general failure: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger on auth.users for handling new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Safely handle webhook trigger for welcome emails
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.send_welcome_email_webhook()
RETURNS trigger AS $$
DECLARE
  v_email text;
  v_temp_password text;
BEGIN
  BEGIN
    v_email := NEW.email;
    v_temp_password := NEW.raw_user_meta_data->>'temp_password';

    IF v_email IS NOT NULL THEN
      PERFORM net.http_post(
        url := 'https://hwigxdigeurmrgovdhgi.supabase.co/functions/v1/welcome-email',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3aWd4ZGlnZXVybXJnb3ZkaGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDA1MzQsImV4cCI6MjA5MTA3NjUzNH0.N6gXdXpjuAOP9cUo1geVOduklJrydA8j8NTW1Erd-xU"}'::jsonb,
        body := jsonb_build_object(
          'email', v_email,
          'name', COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
          'password', v_temp_password
        )
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'send_welcome_email_webhook failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger, moving it from public.profiles to auth.users to ensure availability of metadata
DROP TRIGGER IF EXISTS trigger_send_welcome_email ON public.profiles;
DROP TRIGGER IF EXISTS trigger_send_welcome_email_auth ON auth.users;

CREATE TRIGGER trigger_send_welcome_email_auth
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.send_welcome_email_webhook();

-- Update log_profile_audit to be completely safe against constraints
CREATE OR REPLACE FUNCTION public.log_profile_audit()
RETURNS trigger AS $$
DECLARE
    v_user_id UUID;
    v_action TEXT;
    v_entity_name TEXT;
    v_org_id UUID;
BEGIN
    BEGIN
      v_user_id := auth.uid();
      IF v_user_id IS NULL THEN
          v_user_id := COALESCE(NEW.id, OLD.id);
      END IF;

      IF TG_OP = 'INSERT' THEN
          v_action := 'CREATE';
          v_entity_name := NEW.full_name;
          v_org_id := NEW.organization_id;
      ELSIF TG_OP = 'UPDATE' THEN
          v_action := 'UPDATE';
          v_entity_name := NEW.full_name;
          v_org_id := NEW.organization_id;
      ELSIF TG_OP = 'DELETE' THEN
          v_action := 'DELETE';
          v_entity_name := OLD.full_name;
          v_org_id := OLD.organization_id;
      END IF;

      IF v_entity_name IS NULL OR v_entity_name = '' THEN
          v_entity_name := 'Novo Usuário';
      END IF;

      IF v_org_id IS NOT NULL THEN
        INSERT INTO public.audit_logs (organization_id, user_id, action, entity_type, entity_name, details)
        VALUES (v_org_id, v_user_id, v_action, 'USER', v_entity_name, 
                CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE row_to_json(NEW) END);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'log_profile_audit failed: %', SQLERRM;
    END;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
