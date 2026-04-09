CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    month TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.recurring_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    frequency TEXT NOT NULL,
    start_date DATE NOT NULL,
    next_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view budgets in their org" ON public.budgets;
CREATE POLICY "Users can view budgets in their org" ON public.budgets FOR SELECT USING (organization_id = get_current_user_org_id());

DROP POLICY IF EXISTS "Users can insert budgets in their org" ON public.budgets;
CREATE POLICY "Users can insert budgets in their org" ON public.budgets FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());

DROP POLICY IF EXISTS "Users can update budgets in their org" ON public.budgets;
CREATE POLICY "Users can update budgets in their org" ON public.budgets FOR UPDATE USING (organization_id = get_current_user_org_id());

DROP POLICY IF EXISTS "Users can delete budgets in their org" ON public.budgets;
CREATE POLICY "Users can delete budgets in their org" ON public.budgets FOR DELETE USING (organization_id = get_current_user_org_id());

DROP POLICY IF EXISTS "Users can view recurring in their org" ON public.recurring_transactions;
CREATE POLICY "Users can view recurring in their org" ON public.recurring_transactions FOR SELECT USING (organization_id = get_current_user_org_id());

DROP POLICY IF EXISTS "Users can insert recurring in their org" ON public.recurring_transactions;
CREATE POLICY "Users can insert recurring in their org" ON public.recurring_transactions FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());

DROP POLICY IF EXISTS "Users can update recurring in their org" ON public.recurring_transactions;
CREATE POLICY "Users can update recurring in their org" ON public.recurring_transactions FOR UPDATE USING (organization_id = get_current_user_org_id());

DROP POLICY IF EXISTS "Users can delete recurring in their org" ON public.recurring_transactions;
CREATE POLICY "Users can delete recurring in their org" ON public.recurring_transactions FOR DELETE USING (organization_id = get_current_user_org_id());

DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert notifications" ON public.notifications FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());

CREATE OR REPLACE FUNCTION public.set_org_id_on_insert() RETURNS trigger AS $function$
BEGIN
    IF NEW.organization_id IS NULL THEN
        NEW.organization_id := public.get_current_user_org_id();
    END IF;
    RETURN NEW;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_budgets_org_id_trigger ON public.budgets;
CREATE TRIGGER set_budgets_org_id_trigger BEFORE INSERT ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.set_org_id_on_insert();

DROP TRIGGER IF EXISTS set_recurring_org_id_trigger ON public.recurring_transactions;
CREATE TRIGGER set_recurring_org_id_trigger BEFORE INSERT ON public.recurring_transactions FOR EACH ROW EXECUTE FUNCTION public.set_org_id_on_insert();

DROP TRIGGER IF EXISTS set_notifications_org_id_trigger ON public.notifications;
CREATE TRIGGER set_notifications_org_id_trigger BEFORE INSERT ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.set_org_id_on_insert();

CREATE OR REPLACE FUNCTION public.process_recurring_transactions()
RETURNS void AS $function$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT * FROM public.recurring_transactions
        WHERE next_date <= CURRENT_DATE
    LOOP
        INSERT INTO public.transactions (
            organization_id, user_id, description, amount, category, type, payment_method, date
        ) VALUES (
            r.organization_id, r.user_id, r.description, r.amount, r.category, r.type, r.payment_method, r.next_date
        );
        
        UPDATE public.recurring_transactions
        SET next_date = CASE 
            WHEN frequency = 'monthly' THEN next_date + INTERVAL '1 month'
            WHEN frequency = 'weekly' THEN next_date + INTERVAL '1 week'
            WHEN frequency = 'yearly' THEN next_date + INTERVAL '1 year'
            ELSE next_date + INTERVAL '1 month'
        END,
        updated_at = NOW()
        WHERE id = r.id;
        
        INSERT INTO public.notifications (organization_id, user_id, title, message)
        VALUES (
            r.organization_id, r.user_id, 
            'Gasto Recorrente', 
            'O gasto fixo "' || r.description || '" foi registrado automaticamente.'
        );
    END LOOP;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_budget_on_transaction()
RETURNS trigger AS $function$
DECLARE
    v_budget RECORD;
    v_spent NUMERIC;
    v_month TEXT;
BEGIN
    IF NEW.type = 'Despesa' THEN
        v_month := to_char(NEW.date, 'YYYY-MM');
        
        SELECT * INTO v_budget FROM public.budgets 
        WHERE category = NEW.category 
        AND month = v_month 
        AND organization_id = NEW.organization_id;
        
        IF FOUND THEN
            SELECT COALESCE(SUM(amount), 0) + NEW.amount INTO v_spent
            FROM public.transactions
            WHERE category = NEW.category 
            AND type = 'Despesa'
            AND to_char(date, 'YYYY-MM') = v_month
            AND organization_id = NEW.organization_id
            AND id != NEW.id;
            
            IF v_spent >= v_budget.amount AND (v_spent - NEW.amount) < v_budget.amount THEN
                INSERT INTO public.notifications (organization_id, user_id, title, message)
                VALUES (
                    NEW.organization_id, NEW.user_id, 
                    'Alerta de Orçamento', 
                    'Atenção! Você atingiu ou ultrapassou o limite definido para esta categoria.'
                );
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS check_budget_trigger ON public.transactions;
CREATE TRIGGER check_budget_trigger AFTER INSERT OR UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.check_budget_on_transaction();
