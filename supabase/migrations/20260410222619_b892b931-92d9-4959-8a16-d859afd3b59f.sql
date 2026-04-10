ALTER TABLE public.contact_requests
ADD COLUMN updated_at timestamp with time zone NOT NULL DEFAULT now();