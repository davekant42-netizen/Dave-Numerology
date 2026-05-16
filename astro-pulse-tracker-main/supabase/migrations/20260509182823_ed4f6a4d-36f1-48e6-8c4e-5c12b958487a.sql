DROP POLICY IF EXISTS "users_create_own_request" ON public.access_requests;

CREATE POLICY "users_create_own_request"
ON public.access_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'access_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.access_requests;
  END IF;
END $$;