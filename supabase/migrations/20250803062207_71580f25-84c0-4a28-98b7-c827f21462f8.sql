-- Create admin_sessions table for secure admin token management
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_token UUID NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on admin_sessions
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin_sessions
CREATE POLICY "Users can only access their own admin sessions"
ON public.admin_sessions
FOR ALL
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_token 
ON public.admin_sessions(user_id, admin_token);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at 
ON public.admin_sessions(expires_at);

-- Create function to clean up expired admin sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_admin_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.admin_sessions 
  WHERE expires_at < NOW();
END;
$$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE TRIGGER update_admin_sessions_updated_at
BEFORE UPDATE ON public.admin_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();