-- Create admin email settings table
CREATE TABLE public.admin_email_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  email TEXT NOT NULL,
  receive_contact_notifications BOOLEAN DEFAULT true,
  receive_general_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (admin_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.admin_email_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage email settings" 
ON public.admin_email_settings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Add reply functionality to contact_requests
ALTER TABLE public.contact_requests 
ADD COLUMN admin_reply TEXT,
ADD COLUMN replied_by UUID,
ADD COLUMN replied_at TIMESTAMP WITH TIME ZONE;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_contact_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_requests_updated_at
BEFORE UPDATE ON public.contact_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_contact_request_updated_at();