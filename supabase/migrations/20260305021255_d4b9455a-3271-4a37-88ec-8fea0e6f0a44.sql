
CREATE TABLE public.broadcast_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  body text NOT NULL,
  sent_by uuid NOT NULL,
  recipient_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  filter_type text NOT NULL DEFAULT 'subscribed',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.broadcast_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage broadcast emails"
  ON public.broadcast_emails
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
