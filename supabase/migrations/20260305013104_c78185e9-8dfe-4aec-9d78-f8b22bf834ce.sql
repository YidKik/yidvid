-- Allow anyone (authenticated or anonymous) to insert contact requests
CREATE POLICY "Anyone can insert contact requests"
ON public.contact_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
