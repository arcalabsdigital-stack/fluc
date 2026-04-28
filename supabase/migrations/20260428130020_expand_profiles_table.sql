ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cnpj_ou_cpf text,
ADD COLUMN IF NOT EXISTS tipo_documento text,
ADD COLUMN IF NOT EXISTS razao_social_ou_nome text,
ADD COLUMN IF NOT EXISTS telefone text;

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'usuario.teste.br@example.com') THEN
    new_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'usuario.teste.br@example.com',
      crypt('SenhaForteBR123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Usuário Teste Brasileiro"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    -- Atualizando o profile que foi criado via trigger "on_auth_user_created"
    UPDATE public.profiles SET 
      cnpj_ou_cpf = '43290847000122',
      tipo_documento = 'CNPJ',
      razao_social_ou_nome = 'Empresa Teste Brasil Ltda',
      telefone = '11999998888'
    WHERE id = new_user_id;

  END IF;
END $$;
