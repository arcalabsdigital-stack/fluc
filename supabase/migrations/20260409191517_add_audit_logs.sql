CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_name TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (is_admin() AND organization_id = get_current_user_org_id());

DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view their own audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND organization_id = get_current_user_org_id());

DROP POLICY IF EXISTS "Users can insert audit logs" ON public.audit_logs;
CREATE POLICY "Users can insert audit logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (organization_id = get_current_user_org_id());

DROP TRIGGER IF EXISTS set_audit_logs_org_id_trigger ON public.audit_logs;
CREATE TRIGGER set_audit_logs_org_id_trigger
  BEFORE INSERT ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION set_org_id_on_insert();

CREATE OR REPLACE FUNCTION public.log_transaction_audit()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_action TEXT;
    v_entity_name TEXT;
    v_org_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        v_user_id := COALESCE(NEW.user_id, OLD.user_id);
    END IF;

    IF TG_OP = 'INSERT' THEN
        v_action := 'CREATE';
        v_entity_name := NEW.description;
        v_org_id := NEW.organization_id;
    ELSIF TG_OP = 'UPDATE' THEN
        v_action := 'UPDATE';
        v_entity_name := NEW.description;
        v_org_id := NEW.organization_id;
    ELSIF TG_OP = 'DELETE' THEN
        v_action := 'DELETE';
        v_entity_name := OLD.description;
        v_org_id := OLD.organization_id;
    END IF;

    INSERT INTO public.audit_logs (organization_id, user_id, action, entity_type, entity_name, details)
    VALUES (v_org_id, v_user_id, v_action, 'TRANSACTION', v_entity_name, 
            CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE row_to_json(NEW) END);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_transactions_trigger ON public.transactions;
CREATE TRIGGER audit_transactions_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.log_transaction_audit();

CREATE OR REPLACE FUNCTION public.log_profile_audit()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_action TEXT;
    v_entity_name TEXT;
    v_org_id UUID;
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

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_profiles_trigger ON public.profiles;
CREATE TRIGGER audit_profiles_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.log_profile_audit();
