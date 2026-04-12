
-- Revert admin_delete_channel to soft-delete
CREATE OR REPLACE FUNCTION public.admin_delete_channel(channel_id_param text, admin_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_admin_user(admin_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized: Admin access required');
  END IF;

  -- Soft delete videos from this channel
  UPDATE youtube_videos 
  SET deleted_at = NOW() 
  WHERE channel_id = channel_id_param AND deleted_at IS NULL;

  -- Soft delete the channel
  UPDATE youtube_channels 
  SET deleted_at = NOW() 
  WHERE channel_id = channel_id_param AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Channel not found or already deleted');
  END IF;

  RETURN json_build_object('success', true, 'message', 'Channel and videos deleted successfully');
END;
$function$;

-- Revert admin_delete_video to soft-delete
CREATE OR REPLACE FUNCTION public.admin_delete_video(video_id_param uuid, admin_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_admin_user(admin_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized: Admin access required');
  END IF;

  UPDATE youtube_videos 
  SET deleted_at = NOW() 
  WHERE id = video_id_param AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Video not found or already deleted');
  END IF;

  RETURN json_build_object('success', true, 'message', 'Video deleted successfully');
END;
$function$;
