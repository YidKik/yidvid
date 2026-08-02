-- 1. email_logs: enable RLS, admin-only read
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.email_logs TO authenticated;
GRANT ALL ON public.email_logs TO service_role;
DROP POLICY IF EXISTS "Admins can view email logs" ON public.email_logs;
CREATE POLICY "Admins can view email logs" ON public.email_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_user_admin(auth.uid()));

-- 2. user_video_interactions: remove public read
DROP POLICY IF EXISTS "Enable public read access for video interactions" ON public.user_video_interactions;

-- 3. video_category_mappings: admin-only writes
DROP POLICY IF EXISTS "Authenticated users can delete video category mappings" ON public.video_category_mappings;
DROP POLICY IF EXISTS "Authenticated users can insert video category mappings" ON public.video_category_mappings;
DROP POLICY IF EXISTS "Authenticated users can update video category mappings" ON public.video_category_mappings;
CREATE POLICY "Admins can manage video category mappings" ON public.video_category_mappings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_user_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_user_admin(auth.uid()));

-- 4. youtube_videos: drop blanket write policy
DROP POLICY IF EXISTS "Enable insert update delete for authenticated users" ON public.youtube_videos;
DROP POLICY IF EXISTS "Enable insert for admins" ON public.youtube_videos;
CREATE POLICY "Enable insert for admins" ON public.youtube_videos
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_user_admin(auth.uid()));

-- 5. video_comments: comments are public content; make read policy explicit
DROP POLICY IF EXISTS "Authenticated users can read comments" ON public.video_comments;
CREATE POLICY "Comments are publicly readable" ON public.video_comments
  FOR SELECT TO anon, authenticated
  USING (true);

-- 6. custom_categories / layout_configurations: use safe admin functions
DROP POLICY IF EXISTS "Allow insert/update/delete for admins only" ON public.custom_categories;
CREATE POLICY "Admins manage custom categories" ON public.custom_categories
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_user_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow write access to admin users" ON public.layout_configurations;
CREATE POLICY "Admins manage layout configurations" ON public.layout_configurations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_user_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_user_admin(auth.uid()));

-- 7. Storage: category-icons + logos -> public read, admin-only writes
DROP POLICY IF EXISTS "Allow public access to category icons" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload logos" ON storage.objects;

CREATE POLICY "Public read category icons" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'category-icons');
CREATE POLICY "Admins manage category icons" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'category-icons' AND (public.has_role(auth.uid(), 'admin') OR public.is_user_admin(auth.uid())))
  WITH CHECK (bucket_id = 'category-icons' AND (public.has_role(auth.uid(), 'admin') OR public.is_user_admin(auth.uid())));
CREATE POLICY "Admins manage logos" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'logos' AND (public.has_role(auth.uid(), 'admin') OR public.is_user_admin(auth.uid())))
  WITH CHECK (bucket_id = 'logos' AND (public.has_role(auth.uid(), 'admin') OR public.is_user_admin(auth.uid())));

-- 8. Function search_path hardening
ALTER FUNCTION public.update_contact_request_updated_at() SET search_path = public;
ALTER FUNCTION public.update_video_analysis_status(uuid, content_analysis_status, jsonb, numeric, boolean) SET search_path = public;
ALTER FUNCTION public.get_cron_jobs() SET search_path = public;

-- 9. Revoke EXECUTE on privileged SECURITY DEFINER functions from API roles
REVOKE ALL ON FUNCTION public.admin_delete_channel(text, uuid) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_delete_video(uuid, uuid) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_restore_channel(text, uuid) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_restore_video(uuid, uuid) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.cleanup_expired_admin_sessions() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.cleanup_expired_sessions() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.fetch_overdue_channels() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.trigger_youtube_video_fetch() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.get_cron_jobs() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.check_admin_rate_limit(text) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.update_video_analysis_status(uuid, content_analysis_status, jsonb, numeric, boolean) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_user() FROM anon;
REVOKE ALL ON FUNCTION public.invalidate_admin_session(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.is_admin_user(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.is_user_admin(uuid) FROM anon;