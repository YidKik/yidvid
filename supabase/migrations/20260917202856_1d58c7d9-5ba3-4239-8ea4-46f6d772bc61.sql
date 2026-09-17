CREATE TABLE public.content_scan_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'idle',
  pause_reason text,
  cursor_created_at timestamptz,
  cursor_id uuid,
  processed_count integer NOT NULL DEFAULT 0,
  approved_count integer NOT NULL DEFAULT 0,
  blocked_count integer NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  last_error text,
  lease_until timestamptz,
  started_at timestamptz,
  last_run_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_scan_jobs_singleton_unique UNIQUE (singleton)
);

GRANT SELECT ON public.content_scan_jobs TO authenticated;
GRANT ALL ON public.content_scan_jobs TO service_role;

ALTER TABLE public.content_scan_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view scan job" ON public.content_scan_jobs
FOR SELECT TO authenticated
USING (public.is_user_admin(auth.uid()));

CREATE TRIGGER update_content_scan_jobs_updated_at
BEFORE UPDATE ON public.content_scan_jobs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.content_scan_jobs (singleton, status) VALUES (true, 'idle');