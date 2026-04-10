
-- Allow admins to update contact requests
CREATE POLICY "Admins can update contact requests"
ON public.contact_requests
FOR UPDATE
TO authenticated
USING (public.is_user_admin(auth.uid()))
WITH CHECK (public.is_user_admin(auth.uid()));

-- Allow admins to delete contact requests
CREATE POLICY "Admins can delete contact requests"
ON public.contact_requests
FOR DELETE
TO authenticated
USING (public.is_user_admin(auth.uid()));
