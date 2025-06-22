
-- Create a security definer function to safely check admin status without RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(is_admin, false) FROM profiles WHERE id = user_id;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_user(uuid) TO anon;

-- Create a function for safe video deletion that bypasses RLS issues
CREATE OR REPLACE FUNCTION public.admin_delete_video(video_id_param uuid, admin_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin_user(admin_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized: Admin access required');
  END IF;

  -- Delete related records first (in correct order to avoid FK constraints)
  DELETE FROM video_custom_category_mappings WHERE video_id = video_id_param;
  DELETE FROM video_category_mappings WHERE video_id = video_id_param;
  DELETE FROM video_notifications WHERE video_id = video_id_param;
  DELETE FROM video_reports WHERE video_id = video_id_param;
  DELETE FROM video_comments WHERE video_id = video_id_param;
  DELETE FROM video_history WHERE video_id = video_id_param;
  DELETE FROM user_video_interactions WHERE video_id = video_id_param;
  
  -- Finally delete the video itself
  DELETE FROM youtube_videos WHERE id = video_id_param;
  
  -- Check if deletion was successful
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Video not found or already deleted');
  END IF;
  
  RETURN json_build_object('success', true, 'message', 'Video deleted successfully');
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.admin_delete_video(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_video(uuid, uuid) TO anon;

-- Create a function for safe channel deletion
CREATE OR REPLACE FUNCTION public.admin_delete_channel(channel_id_param text, admin_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin_user(admin_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized: Admin access required');
  END IF;
  
  -- Soft delete videos from this channel first
  UPDATE youtube_videos 
  SET deleted_at = NOW() 
  WHERE channel_id = channel_id_param AND deleted_at IS NULL;
  
  -- Soft delete the channel
  UPDATE youtube_channels 
  SET deleted_at = NOW() 
  WHERE channel_id = channel_id_param AND deleted_at IS NULL;
  
  -- Check if deletion was successful
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Channel not found or already deleted');
  END IF;
  
  RETURN json_build_object('success', true, 'message', 'Channel deleted successfully');
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.admin_delete_channel(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_channel(text, uuid) TO anon;

-- Create a function to restore deleted videos
CREATE OR REPLACE FUNCTION public.admin_restore_video(video_id_param uuid, admin_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin_user(admin_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized: Admin access required');
  END IF;
  
  -- Restore the video by setting deleted_at to NULL
  UPDATE youtube_videos 
  SET deleted_at = NULL 
  WHERE id = video_id_param;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Video not found');
  END IF;
  
  RETURN json_build_object('success', true, 'message', 'Video restored successfully');
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.admin_restore_video(uuid, uuid) TO authenticated;

-- Create a function to restore deleted channels
CREATE OR REPLACE FUNCTION public.admin_restore_channel(channel_id_param text, admin_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin_user(admin_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized: Admin access required');
  END IF;
  
  -- Restore the channel by setting deleted_at to NULL
  UPDATE youtube_channels 
  SET deleted_at = NULL 
  WHERE channel_id = channel_id_param;
  
  -- Also restore videos from this channel
  UPDATE youtube_videos 
  SET deleted_at = NULL 
  WHERE channel_id = channel_id_param;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Channel not found');
  END IF;
  
  RETURN json_build_object('success', true, 'message', 'Channel and its videos restored successfully');
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.admin_restore_channel(text, uuid) TO authenticated;
