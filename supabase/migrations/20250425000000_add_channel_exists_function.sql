
-- Create a function to check if a channel exists without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.check_channel_exists(channel_id_param TEXT)
RETURNS TABLE(exists BOOLEAN) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT EXISTS(
    SELECT 1 
    FROM youtube_channels 
    WHERE channel_id = channel_id_param
    AND deleted_at IS NULL
  );
END;
$$;
