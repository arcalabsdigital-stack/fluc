-- Habilita a extensão pg_net para permitir requisições HTTP assíncronas a partir do banco de dados
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Função que será chamada pelo gatilho (Webhook)
CREATE OR REPLACE FUNCTION public.send_welcome_email_webhook()
RETURNS trigger AS $function$
DECLARE
  v_email text;
BEGIN
  -- Busca o email do usuário recém-criado na tabela auth.users usando o ID do novo profile
  SELECT email INTO v_email FROM auth.users WHERE id = NEW.id;
  
  IF v_email IS NOT NULL THEN
    -- Faz uma requisição HTTP POST assíncrona para a Edge Function de boas-vindas
    PERFORM net.http_post(
      url := 'https://hwigxdigeurmrgovdhgi.supabase.co/functions/v1/welcome-email',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object(
        'email', v_email,
        'name', COALESCE(NEW.full_name, 'Usuário')
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove o gatilho caso ele já exista para garantir a idempotência
DROP TRIGGER IF EXISTS trigger_send_welcome_email ON public.profiles;

-- Cria o gatilho na tabela public.profiles que é acionado após cada inserção (novo usuário)
CREATE TRIGGER trigger_send_welcome_email
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email_webhook();
