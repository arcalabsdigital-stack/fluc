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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
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
          payment_method?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
// Table: profiles
//   id: uuid (not null)
//   full_name: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
//   role: text (not null, default: 'visitante'::text)
//   avatar_url: text (nullable)
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

// --- CONSTRAINTS ---
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id)
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
//   CHECK profiles_role_check: CHECK ((role = ANY (ARRAY['admin'::text, 'colaborador'::text, 'visitante'::text])))
// Table: transactions
//   PRIMARY KEY transactions_pkey: PRIMARY KEY (id)
//   FOREIGN KEY transactions_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: profiles
//   Policy "Admins can update all profiles" (UPDATE, PERMISSIVE) roles={public}
//     USING: is_admin()
//   Policy "Admins can view all profiles" (SELECT, PERMISSIVE) roles={public}
//     USING: is_admin()
//   Policy "Users can insert their own profile" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (auth.uid() = id)
//   Policy "Users can update own profile" (UPDATE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = id)
//   Policy "Users can update their own profile" (UPDATE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = id)
//   Policy "Users can view own profile" (SELECT, PERMISSIVE) roles={public}
//     USING: (auth.uid() = id)
//   Policy "Users can view their own profile" (SELECT, PERMISSIVE) roles={public}
//     USING: (auth.uid() = id)
// Table: transactions
//   Policy "Admins and users can insert transactions" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (is_admin() OR (auth.uid() = user_id))
//   Policy "Admins can delete all transactions" (DELETE, PERMISSIVE) roles={public}
//     USING: is_admin()
//   Policy "Admins can update all transactions" (UPDATE, PERMISSIVE) roles={public}
//     USING: is_admin()
//   Policy "Admins can view all transactions" (SELECT, PERMISSIVE) roles={public}
//     USING: is_admin()
//   Policy "Collaborators can view latest transaction" (SELECT, PERMISSIVE) roles={public}
//     USING: ((get_user_role() = 'colaborador'::text) AND (id = get_latest_transaction_id()))
//   Policy "Standard users can view own transactions" (SELECT, PERMISSIVE) roles={public}
//     USING: ((COALESCE(get_user_role(), 'visitante'::text) <> ALL (ARRAY['admin'::text, 'colaborador'::text])) AND (user_id = auth.uid()))
//   Policy "Users can delete own transactions" (DELETE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = user_id)
//   Policy "Users can delete their own transactions" (DELETE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = user_id)
//   Policy "Users can update own transactions" (UPDATE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = user_id)
//   Policy "Users can update their own transactions" (UPDATE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = user_id)

// --- DATABASE FUNCTIONS ---
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
//   BEGIN
//     INSERT INTO public.profiles (id, full_name, role)
//     VALUES (
//       new.id,
//       new.raw_user_meta_data->>'full_name',
//       'visitante'
//     )
//     ON CONFLICT (id) DO NOTHING;
//     RETURN new;
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

// --- INDEXES ---
// Table: transactions
//   CREATE INDEX transactions_created_at_idx ON public.transactions USING btree (created_at DESC)
