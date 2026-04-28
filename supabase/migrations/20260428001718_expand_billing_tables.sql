-- Migration: Expansão das tabelas plans, billing_history e subscriptions

-- 1. Tabela: plans
ALTER TABLE public.plans 
  ADD COLUMN IF NOT EXISTS billing_period text DEFAULT 'mensal',
  ADD COLUMN IF NOT EXISTS price_mensal numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS price_anual numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS desconto_anual_percentual numeric DEFAULT 0;

-- Atualizar planos existentes com a nova estrutura de features
UPDATE public.plans
SET features = '{
  "transacoes_por_mes": 100,
  "categorias_budget": 5,
  "usuarios": 1,
  "dre": false,
  "valuation": false,
  "suporte": "email"
}'::jsonb
WHERE features IS NULL OR features = '{}'::jsonb;

-- 2. Tabela: billing_history
ALTER TABLE public.billing_history 
  ADD COLUMN IF NOT EXISTS cupom_desconto text,
  ADD COLUMN IF NOT EXISTS desconto_valor numeric,
  ADD COLUMN IF NOT EXISTS periodo_faturamento text DEFAULT 'mensal',
  ADD COLUMN IF NOT EXISTS metodo_pagamento text,
  ADD COLUMN IF NOT EXISTS recibo_url text,
  ADD COLUMN IF NOT EXISTS nota_fiscal_url text;

-- 3. Tabela: subscriptions
-- Garantir que os campos existam e com os tipos corretos (já previstos no schema base)
ALTER TABLE public.subscriptions 
  ADD COLUMN IF NOT EXISTS current_period_end timestamptz,
  ADD COLUMN IF NOT EXISTS asaas_subscription_id text,
  ADD COLUMN IF NOT EXISTS asaas_customer_id text;
