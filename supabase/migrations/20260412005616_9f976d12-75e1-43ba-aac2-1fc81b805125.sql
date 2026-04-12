
-- Update admin_delete_channel to hard-delete all related data
CREATE OR REPLACE FUNCTION public.admin_delete_channel(channel_id_param text, admin_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin_user(admin_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized: Admin access required');
  END IF;

  -- Check channel exists
  IF NOT EXISTS (SELECT 1 FROM youtube_channels WHERE channel_id = channel_id_param) THEN
    RETURN json_build_object('success', false, 'error', 'Channel not found');
  END IF;

  -- Delete all video-related data for videos from this channel
  DELETE FROM video_history WHERE video_id IN (SELECT id FROM youtube_videos WHERE channel_id = channel_id_param);
  DELETE FROM user_video_interactions WHERE video_id IN (SELECT id FROM youtube_videos WHERE channel_id = channel_id_param);
  DELETE FROM video_notifications WHERE video_id IN (SELECT id FROM youtube_videos WHERE channel_id = channel_id_param);
  DELETE FROM video_comments WHERE video_id IN (SELECT id FROM youtube_videos WHERE channel_id = channel_id_param);
  DELETE FROM video_reports WHERE video_id IN (SELECT id FROM youtube_videos WHERE channel_id = channel_id_param);
  DELETE FROM video_playlist_items WHERE video_id IN (SELECT id FROM youtube_videos WHERE channel_id = channel_id_param);
  DELETE FROM video_category_mappings WHERE video_id IN (SELECT id FROM youtube_videos WHERE channel_id = channel_id_param);
  DELETE FROM video_custom_category_mappings WHERE video_id IN (SELECT id FROM youtube_videos WHERE channel_id = channel_id_param);
  DELETE FROM content_analysis_logs WHERE video_id IN (SELECT id FROM youtube_videos WHERE channel_id = channel_id_param);

  -- Delete channel-related data
  DELETE FROM channel_subscriptions WHERE channel_id = channel_id_param;
  DELETE FROM hidden_channels WHERE channel_id = channel_id_param;
  DELETE FROM channel_category_mappings WHERE channel_id = channel_id_param;
  DELETE FROM channel_custom_category_mappings WHERE channel_id = channel_id_param;

  -- Delete all videos from this channel
  DELETE FROM youtube_videos WHERE channel_id = channel_id_param;

  -- Delete the channel itself
  DELETE FROM youtube_channels WHERE channel_id = channel_id_param;

  RETURN json_build_object('success', true, 'message', 'Channel and all related data permanently deleted');
END;
$function$;

-- Update admin_delete_video to hard-delete all related data
CREATE OR REPLACE FUNCTION public.admin_delete_video(video_id_param uuid, admin_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin_user(admin_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized: Admin access required');
  END IF;

  -- Check video exists
  IF NOT EXISTS (SELECT 1 FROM youtube_videos WHERE id = video_id_param) THEN
    RETURN json_build_object('success', false, 'error', 'Video not found');
  END IF;

  -- Delete all related data
  DELETE FROM video_history WHERE video_id = video_id_param;
  DELETE FROM user_video_interactions WHERE video_id = video_id_param;
  DELETE FROM video_notifications WHERE video_id = video_id_param;
  DELETE FROM video_comments WHERE video_id = video_id_param;
  DELETE FROM video_reports WHERE video_id = video_id_param;
  DELETE FROM video_playlist_items WHERE video_id = video_id_param;
  DELETE FROM video_category_mappings WHERE video_id = video_id_param;
  DELETE FROM video_custom_category_mappings WHERE video_id = video_id_param;
  DELETE FROM content_analysis_logs WHERE video_id = video_id_param;

  -- Delete the video
  DELETE FROM youtube_videos WHERE id = video_id_param;

  RETURN json_build_object('success', true, 'message', 'Video and all related data permanently deleted');
END;
$function$;
