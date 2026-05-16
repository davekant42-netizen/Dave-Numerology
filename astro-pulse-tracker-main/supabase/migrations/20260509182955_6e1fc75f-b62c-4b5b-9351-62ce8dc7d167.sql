CREATE OR REPLACE FUNCTION public.request_access()
RETURNS public.access_status
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  current_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  resulting_status public.access_status;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF current_email = '' THEN
    RAISE EXCEPTION 'Email not available';
  END IF;

  INSERT INTO public.access_requests (user_id, email, status)
  VALUES (
    current_user_id,
    current_email,
    CASE
      WHEN current_email = 'davekant42@gmail.com' THEN 'approved'::public.access_status
      ELSE 'pending'::public.access_status
    END
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    email = EXCLUDED.email,
    status = CASE
      WHEN EXCLUDED.email = 'davekant42@gmail.com' THEN 'approved'::public.access_status
      ELSE public.access_requests.status
    END,
    updated_at = CASE
      WHEN EXCLUDED.email = 'davekant42@gmail.com' AND public.access_requests.status <> 'approved'::public.access_status THEN now()
      ELSE public.access_requests.updated_at
    END
  RETURNING status INTO resulting_status;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (current_user_id, 'user'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  IF current_email = 'davekant42@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (current_user_id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN resulting_status;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.request_access() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_access() TO authenticated;