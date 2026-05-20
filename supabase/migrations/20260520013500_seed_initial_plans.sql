DO $$
BEGIN
  INSERT INTO public.plans (name, price, billing_period) VALUES
    ('Fluxo', 49.90, 'mensal'),
    ('Lucro', 89.90, 'mensal'),
    ('Patrimônio', 199.90, 'mensal')
  ON CONFLICT (name) DO NOTHING;
END $$;
