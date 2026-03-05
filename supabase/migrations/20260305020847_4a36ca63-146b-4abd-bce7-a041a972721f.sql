CREATE OR REPLACE FUNCTION public.delete_user()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_user_id uuid;
BEGIN
    v_user_id := auth.uid();
    
    DELETE FROM profiles WHERE id = v_user_id;
    DELETE FROM video_history WHERE video_history.user_id = v_user_id;
    DELETE FROM user_video_interactions WHERE user_video_interactions.user_id = v_user_id;
    DELETE FROM channel_subscriptions WHERE channel_subscriptions.user_id = v_user_id;
    DELETE FROM video_notifications WHERE video_notifications.user_id = v_user_id;
    DELETE FROM user_preferences WHERE user_preferences.user_id = v_user_id;
    DELETE FROM user_analytics WHERE user_analytics.user_id = v_user_id;
    DELETE FROM email_preferences WHERE email_preferences.user_id = v_user_id;
    DELETE FROM user_roles WHERE user_roles.user_id = v_user_id;
    DELETE FROM video_comments WHERE video_comments.user_id = v_user_id;
    DELETE FROM hidden_channels WHERE hidden_channels.user_id = v_user_id;
    DELETE FROM parental_locks WHERE parental_locks.user_id = v_user_id;
    DELETE FROM auth.users WHERE id = v_user_id;
END;
$function$;