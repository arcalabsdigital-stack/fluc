-- Remove o trigger problemático de disparo de e-mail vinculado ao banco de dados
-- A responsabilidade de enviar os e-mails foi centralizada nas Edge Functions para evitar o bloqueio ("Database error checking email")
DROP TRIGGER IF EXISTS trigger_send_welcome_email_auth ON auth.users;
DROP TRIGGER IF EXISTS trigger_send_welcome_email ON public.profiles;

DROP FUNCTION IF EXISTS public.send_welcome_email_webhook();
