-- Add recurring_transaction_id column to transactions
ALTER TABLE public.transactions 
  ADD COLUMN IF NOT EXISTS recurring_transaction_id UUID REFERENCES public.recurring_transactions(id) ON DELETE SET NULL;

-- Update process_recurring_transactions to set the recurring_transaction_id
CREATE OR REPLACE FUNCTION public.process_recurring_transactions()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT * FROM public.recurring_transactions
        WHERE next_date <= CURRENT_DATE
    LOOP
        INSERT INTO public.transactions (
            organization_id, user_id, description, amount, category, type, payment_method, date, recurring_transaction_id
        ) VALUES (
            r.organization_id, r.user_id, r.description, r.amount, r.category, r.type, r.payment_method, r.next_date, r.id
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
$function$;
