-- Atualiza a função que será chamada pelo gatilho (Webhook) para incluir o token de autorização
CREATE OR REPLACE FUNCTION public.send_welcome_email_webhook()
RETURNS trigger AS $function$
DECLARE
  v_email text;
BEGIN
  -- Busca o email do usuário recém-criado na tabela auth.users usando o ID do novo profile
  SELECT email INTO v_email FROM auth.users WHERE id = NEW.id;
  
  IF v_email IS NOT NULL THEN
    -- Faz uma requisição HTTP POST assíncrona para a Edge Function de boas-vindas com cabeçalho de autorização
    PERFORM net.http_post(
      url := 'https://hwigxdigeurmrgovdhgi.supabase.co/functions/v1/welcome-email',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3aWd4ZGlnZXVybXJnb3ZkaGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDA1MzQsImV4cCI6MjA5MTA3NjUzNH0.N6gXdXpjuAOP9cUo1geVOduklJrydA8j8NTW1Erd-xU"}'::jsonb,
      body := jsonb_build_object(
        'email', v_email,
        'name', COALESCE(NEW.full_name, 'Usuário')
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;
