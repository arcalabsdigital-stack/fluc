CREATE OR REPLACE FUNCTION public.check_user_email_exists(p_email text)
RETURNS json AS $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email LIMIT 1;
  IF v_user_id IS NOT NULL THEN
    RETURN json_build_object('exists', true, 'user_id', v_user_id);
  ELSE
    RETURN json_build_object('exists', false);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
