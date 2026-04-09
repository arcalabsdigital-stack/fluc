CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Receita', 'Despesa')),
  grupo TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT categories_nome_tipo_unique UNIQUE (nome, tipo)
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_categories" ON public.categories;
CREATE POLICY "authenticated_select_categories" ON public.categories FOR SELECT TO authenticated USING (true);

INSERT INTO public.categories (nome, tipo, grupo) VALUES
-- Receitas
('Vendas de Produtos', 'Receita', 'RECEITAS (Entradas)'),
('Vendas de Serviços', 'Receita', 'RECEITAS (Entradas)'),
('Consultoria/Mentoria', 'Receita', 'RECEITAS (Entradas)'),
('Aulas/Treinamentos', 'Receita', 'RECEITAS (Entradas)'),
('Royalties/Comissões', 'Receita', 'RECEITAS (Entradas)'),
('Outras Receitas', 'Receita', 'RECEITAS (Entradas)'),

-- Despesas Operacionais
('Salários e Encargos', 'Despesa', 'DESPESAS OPERACIONAIS (Saídas - Funcionamento)'),
('Aluguel/Locação', 'Despesa', 'DESPESAS OPERACIONAIS (Saídas - Funcionamento)'),
('Energia Elétrica', 'Despesa', 'DESPESAS OPERACIONAIS (Saídas - Funcionamento)'),
('Água e Saneamento', 'Despesa', 'DESPESAS OPERACIONAIS (Saídas - Funcionamento)'),
('Internet e Telefone', 'Despesa', 'DESPESAS OPERACIONAIS (Saídas - Funcionamento)'),
('Seguros', 'Despesa', 'DESPESAS OPERACIONAIS (Saídas - Funcionamento)'),
('Manutenção e Reparos', 'Despesa', 'DESPESAS OPERACIONAIS (Saídas - Funcionamento)'),
('Limpeza e Higiene', 'Despesa', 'DESPESAS OPERACIONAIS (Saídas - Funcionamento)'),

-- Marketing e Vendas
('Publicidade Digital', 'Despesa', 'DESPESAS COM MARKETING E VENDAS'),
('Criação de Conteúdo', 'Despesa', 'DESPESAS COM MARKETING E VENDAS'),
('Plataformas de Cursos', 'Despesa', 'DESPESAS COM MARKETING E VENDAS'),
('Email Marketing', 'Despesa', 'DESPESAS COM MARKETING E VENDAS'),
('Hospedagem de Site/App', 'Despesa', 'DESPESAS COM MARKETING E VENDAS'),
('Domínios e Certificados SSL', 'Despesa', 'DESPESAS COM MARKETING E VENDAS'),

-- Administrativas
('Contabilidade e Auditoria', 'Despesa', 'DESPESAS ADMINISTRATIVAS'),
('Consultoria Jurídica', 'Despesa', 'DESPESAS ADMINISTRATIVAS'),
('Software e Ferramentas', 'Despesa', 'DESPESAS ADMINISTRATIVAS'),
('Escritório e Papelaria', 'Despesa', 'DESPESAS ADMINISTRATIVAS'),
('Banco e Taxas Financeiras', 'Despesa', 'DESPESAS ADMINISTRATIVAS'),
('Impostos e Tributos', 'Despesa', 'DESPESAS ADMINISTRATIVAS'),

-- Pessoal
('Salário Base', 'Despesa', 'DESPESAS COM PESSOAL (Detalhado)'),
('FGTS', 'Despesa', 'DESPESAS COM PESSOAL (Detalhado)'),
('INSS Patronal', 'Despesa', 'DESPESAS COM PESSOAL (Detalhado)'),
('Vale Refeição', 'Despesa', 'DESPESAS COM PESSOAL (Detalhado)'),
('Vale Transporte', 'Despesa', 'DESPESAS COM PESSOAL (Detalhado)'),
('Treinamento e Desenvolvimento', 'Despesa', 'DESPESAS COM PESSOAL (Detalhado)'),

-- Produtos/Materia Prima
('Compra de Produtos para Revenda', 'Despesa', 'DESPESAS COM PRODUTOS/MATÉRIA-PRIMA'),
('Matéria-Prima', 'Despesa', 'DESPESAS COM PRODUTOS/MATÉRIA-PRIMA'),
('Embalagem', 'Despesa', 'DESPESAS COM PRODUTOS/MATÉRIA-PRIMA'),
('Logística e Frete', 'Despesa', 'DESPESAS COM PRODUTOS/MATÉRIA-PRIMA'),

-- Financeiras
('Juros de Empréstimos', 'Despesa', 'DESPESAS FINANCEIRAS'),
('Taxas Bancárias', 'Despesa', 'DESPESAS FINANCEIRAS'),
('Multas e Juros de Atraso', 'Despesa', 'DESPESAS FINANCEIRAS'),
('Desconto em Cheques', 'Despesa', 'DESPESAS FINANCEIRAS'),

-- Viagens e Deslocamento
('Passagens Aéreas/Terrestre', 'Despesa', 'DESPESAS COM VIAGENS E DESLOCAMENTO'),
('Hospedagem', 'Despesa', 'DESPESAS COM VIAGENS E DESLOCAMENTO'),
('Alimentação em Viagem', 'Despesa', 'DESPESAS COM VIAGENS E DESLOCAMENTO'),
('Uber/Táxi', 'Despesa', 'DESPESAS COM VIAGENS E DESLOCAMENTO'),
('Combustível', 'Despesa', 'DESPESAS COM VIAGENS E DESLOCAMENTO'),

-- Gerais
('Presentes e Brindes', 'Despesa', 'DESPESAS GERAIS/DIVERSAS'),
('Doações', 'Despesa', 'DESPESAS GERAIS/DIVERSAS'),
('Multas e Penalidades', 'Despesa', 'DESPESAS GERAIS/DIVERSAS'),
('Perdas e Danos', 'Despesa', 'DESPESAS GERAIS/DIVERSAS')
ON CONFLICT (nome, tipo) DO NOTHING;
