CREATE OR REPLACE FUNCTION public.create_new_workspace(
  p_name TEXT,
  p_cnpj TEXT,
  p_corporate_name TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_org_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.organizations (name, cnpj, corporate_name)
  VALUES (p_name, p_cnpj, p_corporate_name)
  RETURNING id INTO v_org_id;

  INSERT INTO public.user_workspaces (user_id, organization_id, role, is_active)
  VALUES (auth.uid(), v_org_id, 'admin', true);

  INSERT INTO public.subscriptions (organization_id, plan, status, trial_start, trial_end)
  VALUES (v_org_id, 'Fluxo', 'trial', now(), now() + interval '7 days');

  UPDATE public.profiles
  SET organization_id = v_org_id
  WHERE id = auth.uid();

  RETURN v_org_id;
END;
$function$
