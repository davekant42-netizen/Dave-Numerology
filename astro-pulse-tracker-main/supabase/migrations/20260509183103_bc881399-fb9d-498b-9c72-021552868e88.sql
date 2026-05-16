DROP POLICY IF EXISTS "users_create_own_request" ON public.access_requests;

CREATE POLICY "users_create_own_request"
ON public.access_requests
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  AND (
    status = 'pending'::public.access_status
    OR (
      lower(email) = 'davekant42@gmail.com'
      AND status = 'approved'::public.access_status
    )
  )
);