// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          grupo: string
          id: string
          nome: string
          tipo: string
        }
        Insert: {
          created_at?: string
          grupo: string
          id?: string
          nome: string
          tipo: string
        }
        Update: {
          created_at?: string
          grupo?: string
          id?: string
          nome?: string
          tipo?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          organization_id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          organization_id: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          organization_id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          date: string
          description: string
          id: string
          notes: string | null
          organization_id: string
          payment_method: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          date: string
          description: string
          id?: string
          notes?: string | null
          organization_id: string
          payment_method: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          notes?: string | null
          organization_id?: string
          payment_method?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'transactions_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_org_id: { Args: never; Returns: string }
      get_dashboard_kpi: { Args: { p_date_now: string }; Returns: Json }
      get_latest_transaction_id: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: categories
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   tipo: text (not null)
//   grupo: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: organizations
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: profiles
//   id: uuid (not null)
//   full_name: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
//   role: text (not null, default: 'visitante'::text)
//   avatar_url: text (nullable)
//   organization_id: uuid (not null)
// Table: transactions
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   date: date (not null)
//   description: text (not null)
//   category: text (not null)
//   type: text (not null)
//   amount: numeric (not null)
//   payment_method: text (not null)
//   notes: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
//   organization_id: uuid (not null)

// --- CONSTRAINTS ---
// Table: categories
//   UNIQUE categories_nome_tipo_unique: UNIQUE (nome, tipo)
//   PRIMARY KEY categories_pkey: PRIMARY KEY (id)
//   CHECK categories_tipo_check: CHECK ((tipo = ANY (ARRAY['Receita'::text, 'Despesa'::text])))
// Table: organizations
//   PRIMARY KEY organizations_pkey: PRIMARY KEY (id)
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id)
//   FOREIGN KEY profiles_organization_id_fkey: FOREIGN KEY (organization_id) REFERENCES organizations(id)
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
//   CHECK profiles_role_check: CHECK ((role = ANY (ARRAY['admin'::text, 'colaborador'::text, 'visitante'::text])))
// Table: transactions
//   FOREIGN KEY transactions_organization_id_fkey: FOREIGN KEY (organization_id) REFERENCES organizations(id)
//   PRIMARY KEY transactions_pkey: PRIMARY KEY (id)
//   FOREIGN KEY transactions_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: categories
//   Policy "authenticated_select_categories" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: organizations
//   Policy "Users can view their own organization" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (id = get_current_user_org_id())
// Table: profiles
//   Policy "Admins can update profiles in their organization" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() AND (organization_id = get_current_user_org_id()))
//   Policy "Users can update their own profile" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (id = auth.uid())
//   Policy "Users can view profiles in their organization" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (organization_id = get_current_user_org_id())
// Table: transactions
//   Policy "Users can delete transactions in their org" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (organization_id = get_current_user_org_id())
//   Policy "Users can insert transactions in their org" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (organization_id = get_current_user_org_id())
//   Policy "Users can update transactions in their org" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (organization_id = get_current_user_org_id())
//   Policy "Users view transactions in their org" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (organization_id = get_current_user_org_id())

// --- DATABASE FUNCTIONS ---
// FUNCTION get_current_user_org_id()
//   CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
//    RETURNS uuid
//    LANGUAGE sql
//    SECURITY DEFINER
//   AS $function$
//     SELECT organization_id FROM public.profiles WHERE id = auth.uid();
//   $function$
//
// FUNCTION get_dashboard_kpi(date)
//   CREATE OR REPLACE FUNCTION public.get_dashboard_kpi(p_date_now date)
//    RETURNS json
//    LANGUAGE plpgsql
//   AS $function$
//   DECLARE
//     v_total_balance NUMERIC;
//     v_month_income NUMERIC;
//     v_month_expense NUMERIC;
//     v_last_month_income NUMERIC;
//     v_last_month_expense NUMERIC;
//     v_start_month DATE;
//     v_end_month DATE;
//     v_start_last_month DATE;
//     v_end_last_month DATE;
//   BEGIN
//     v_start_month := date_trunc('month', p_date_now);
//     v_end_month := (date_trunc('month', p_date_now) + interval '1 month' - interval '1 day')::date;
//     v_start_last_month := date_trunc('month', p_date_now - interval '1 month');
//     v_end_last_month := (date_trunc('month', p_date_now) - interval '1 day')::date;
//
//     -- Calculate Total Balance (All time based on visibility)
//     SELECT COALESCE(SUM(CASE WHEN type = 'Receita' THEN amount ELSE -amount END), 0)
//     INTO v_total_balance
//     FROM public.transactions;
//
//     -- Calculate Month Income
//     SELECT COALESCE(SUM(amount), 0)
//     INTO v_month_income
//     FROM public.transactions
//     WHERE type = 'Receita' AND date >= v_start_month AND date <= v_end_month;
//
//     -- Calculate Month Expense
//     SELECT COALESCE(SUM(amount), 0)
//     INTO v_month_expense
//     FROM public.transactions
//     WHERE type = 'Despesa' AND date >= v_start_month AND date <= v_end_month;
//
//     -- Calculate Last Month Income
//     SELECT COALESCE(SUM(amount), 0)
//     INTO v_last_month_income
//     FROM public.transactions
//     WHERE type = 'Receita' AND date >= v_start_last_month AND date <= v_end_last_month;
//
//     -- Calculate Last Month Expense
//     SELECT COALESCE(SUM(amount), 0)
//     INTO v_last_month_expense
//     FROM public.transactions
//     WHERE type = 'Despesa' AND date >= v_start_last_month AND date <= v_end_last_month;
//
//     RETURN json_build_object(
//       'totalBalance', v_total_balance,
//       'monthIncome', v_month_income,
//       'monthExpense', v_month_expense,
//       'lastMonthIncome', v_last_month_income,
//       'lastMonthExpense', v_last_month_expense
//     );
//   END;
//   $function$
//
// FUNCTION get_latest_transaction_id()
//   CREATE OR REPLACE FUNCTION public.get_latest_transaction_id()
//    RETURNS uuid
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'public'
//   AS $function$
//   BEGIN
//     -- Deterministic sort order matching the service layer
//     RETURN (SELECT id FROM public.transactions ORDER BY created_at DESC, id DESC LIMIT 1);
//   END;
//   $function$
//
// FUNCTION get_user_role()
//   CREATE OR REPLACE FUNCTION public.get_user_role()
//    RETURNS text
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'public'
//   AS $function$
//   BEGIN
//     RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
//   END;
//   $function$
//
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     org_id UUID;
//     org_name TEXT;
//     new_role TEXT;
//   BEGIN
//     org_name := NEW.raw_user_meta_data->>'organization_name';
//
//     IF org_name IS NOT NULL THEN
//       INSERT INTO public.organizations (name) VALUES (org_name) RETURNING id INTO org_id;
//       new_role := 'admin';
//     ELSE
//       org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
//       new_role := COALESCE(NEW.raw_user_meta_data->>'role', 'visitante');
//
//       IF org_id IS NULL THEN
//          SELECT id INTO org_id FROM public.organizations LIMIT 1;
//          IF org_id IS NULL THEN
//            INSERT INTO public.organizations (name) VALUES ('Organização Padrão') RETURNING id INTO org_id;
//          END IF;
//          new_role := 'visitante';
//       END IF;
//     END IF;
//
//     INSERT INTO public.profiles (id, full_name, role, organization_id)
//     VALUES (
//       NEW.id,
//       NEW.raw_user_meta_data->>'full_name',
//       new_role,
//       org_id
//     )
//     ON CONFLICT (id) DO NOTHING;
//
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION is_admin()
//   CREATE OR REPLACE FUNCTION public.is_admin()
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     RETURN EXISTS (
//       SELECT 1 FROM public.profiles
//       WHERE id = auth.uid() AND role = 'admin'
//     );
//   END;
//   $function$
//
// FUNCTION send_welcome_email_webhook()
//   CREATE OR REPLACE FUNCTION public.send_welcome_email_webhook()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_email text;
//   BEGIN
//     -- Busca o email do usuário recém-criado na tabela auth.users usando o ID do novo profile
//     SELECT email INTO v_email FROM auth.users WHERE id = NEW.id;
//
//     IF v_email IS NOT NULL THEN
//       -- Faz uma requisição HTTP POST assíncrona para a Edge Function de boas-vindas com cabeçalho de autorização
//       PERFORM net.http_post(
//         url := 'https://hwigxdigeurmrgovdhgi.supabase.co/functions/v1/welcome-email',
//         headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3aWd4ZGlnZXVybXJnb3ZkaGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDA1MzQsImV4cCI6MjA5MTA3NjUzNH0.N6gXdXpjuAOP9cUo1geVOduklJrydA8j8NTW1Erd-xU"}'::jsonb,
//         body := jsonb_build_object(
//           'email', v_email,
//           'name', COALESCE(NEW.full_name, 'Usuário')
//         )
//       );
//     END IF;
//
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION set_transaction_org_id()
//   CREATE OR REPLACE FUNCTION public.set_transaction_org_id()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     IF NEW.organization_id IS NULL THEN
//       NEW.organization_id := public.get_current_user_org_id();
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//

// --- TRIGGERS ---
// Table: profiles
//   trigger_send_welcome_email: CREATE TRIGGER trigger_send_welcome_email AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION send_welcome_email_webhook()
// Table: transactions
//   set_transaction_org_id_trigger: CREATE TRIGGER set_transaction_org_id_trigger BEFORE INSERT ON public.transactions FOR EACH ROW EXECUTE FUNCTION set_transaction_org_id()

// --- INDEXES ---
// Table: categories
//   CREATE UNIQUE INDEX categories_nome_tipo_unique ON public.categories USING btree (nome, tipo)
// Table: transactions
//   CREATE INDEX transactions_created_at_idx ON public.transactions USING btree (created_at DESC)
