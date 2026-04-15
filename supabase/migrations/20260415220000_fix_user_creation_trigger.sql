-- Make handle_new_user safe against exceptions to avoid transaction rollbacks
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  org_id UUID;
  org_name TEXT;
  new_role TEXT;
  v_must_change_password BOOLEAN;
BEGIN
  BEGIN
    org_name := NEW.raw_user_meta_data->>'organization_name';
    
    BEGIN
      v_must_change_password := COALESCE((NEW.raw_user_meta_data->>'must_change_password')::boolean, false);
    EXCEPTION WHEN OTHERS THEN
      v_must_change_password := false;
    END;

    IF org_name IS NOT NULL THEN
      BEGIN
        INSERT INTO public.organizations (name) VALUES (org_name) RETURNING id INTO org_id;
        new_role := 'admin';
      EXCEPTION WHEN OTHERS THEN
        org_id := NULL;
        new_role := 'admin';
      END;
    ELSE
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
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user general failure: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make send_welcome_email_webhook safe against exceptions
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.send_welcome_email_webhook()
RETURNS trigger AS $$
DECLARE
  v_email text;
  v_temp_password text;
BEGIN
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
  EXCEPTION WHEN OTHERS THEN
    -- Ignore error to prevent transaction rollback
    RAISE WARNING 'send_welcome_email_webhook failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updating log_profile_audit to be safe
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

      INSERT INTO public.audit_logs (organization_id, user_id, action, entity_type, entity_name, details)
      VALUES (v_org_id, v_user_id, v_action, 'USER', v_entity_name, 
              CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE row_to_json(NEW) END);
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'log_profile_audit failed: %', SQLERRM;
    END;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
