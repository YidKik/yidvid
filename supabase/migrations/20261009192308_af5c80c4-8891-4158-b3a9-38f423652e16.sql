ALTER TABLE public.youtube_videos ALTER COLUMN views TYPE bigint;
ALTER TABLE public.youtube_videos ADD COLUMN IF NOT EXISTS stats_synced_at timestamptz, ADD COLUMN IF NOT EXISTS stats_missing_at timestamptz;

CREATE TABLE IF NOT EXISTS public.youtube_stats_sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date date NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'running',
  cursor_id uuid,
  total_target integer NOT NULL DEFAULT 0,
  processed integer NOT NULL DEFAULT 0,
  updated integer NOT NULL DEFAULT 0,
  missing integer NOT NULL DEFAULT 0,
  failed integer NOT NULL DEFAULT 0,
  units_used integer NOT NULL DEFAULT 0,
  chunks integer NOT NULL DEFAULT 0,
  missing_ids text[] NOT NULL DEFAULT '{}',
  failed_ids text[] NOT NULL DEFAULT '{}',
  last_error text,
  lease_until timestamptz,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.youtube_stats_sync_runs TO authenticated;
GRANT ALL ON public.youtube_stats_sync_runs TO service_role;
ALTER TABLE public.youtube_stats_sync_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view stats sync runs" ON public.youtube_stats_sync_runs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_youtube_stats_sync_runs_updated_at BEFORE UPDATE ON public.youtube_stats_sync_runs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.youtube_quota_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quota_day_pt date NOT NULL,
  key_label text NOT NULL,
  source text NOT NULL,
  units integer NOT NULL DEFAULT 0,
  attempts integer NOT NULL DEFAULT 0,
  tracking text NOT NULL DEFAULT 'app-tracked',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (quota_day_pt, key_label, source)
);
GRANT SELECT ON public.youtube_quota_usage TO authenticated;
GRANT ALL ON public.youtube_quota_usage TO service_role;
ALTER TABLE public.youtube_quota_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view quota usage" ON public.youtube_quota_usage FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.youtube_videos_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_setting('app.stats_sync', true) = 'on' THEN
    NEW.updated_at = OLD.updated_at;
  ELSE
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS update_youtube_videos_updated_at ON public.youtube_videos;
CREATE TRIGGER update_youtube_videos_updated_at BEFORE UPDATE ON public.youtube_videos FOR EACH ROW EXECUTE FUNCTION public.youtube_videos_set_updated_at();

CREATE OR REPLACE FUNCTION public.bulk_apply_video_stats(p_found jsonb, p_missing text[])
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n_up int := 0; n_miss int := 0;
BEGIN
  PERFORM set_config('app.stats_sync', 'on', true);
  UPDATE youtube_videos v SET views = x.views, stats_synced_at = now(), stats_missing_at = NULL
  FROM jsonb_to_recordset(COALESCE(p_found,'[]'::jsonb)) AS x(video_id text, views bigint)
  WHERE v.video_id = x.video_id AND x.views IS NOT NULL AND x.views >= 0;
  GET DIAGNOSTICS n_up = ROW_COUNT;
  IF p_missing IS NOT NULL AND array_length(p_missing,1) > 0 THEN
    UPDATE youtube_videos SET stats_missing_at = now() WHERE video_id = ANY(p_missing);
    GET DIAGNOSTICS n_miss = ROW_COUNT;
  END IF;
  PERFORM set_config('app.stats_sync', 'off', true);
  RETURN json_build_object('updated', n_up, 'missing_rows', n_miss);
END; $$;
REVOKE ALL ON FUNCTION public.bulk_apply_video_stats(jsonb, text[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bulk_apply_video_stats(jsonb, text[]) TO service_role;

CREATE OR REPLACE FUNCTION public.next_pacific_midnight()
RETURNS timestamptz LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT ((now() AT TIME ZONE 'America/Los_Angeles')::date + 1)::timestamp AT TIME ZONE 'America/Los_Angeles';
$$;

-- Atomic reservation from one shared project-wide pool. Returns remaining units, or -1 if refused.
CREATE OR REPLACE FUNCTION public.reserve_youtube_quota(p_units integer, p_key_label text, p_source text, p_floor integer DEFAULT 0)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE remaining int; day_pt date := (now() AT TIME ZONE 'America/Los_Angeles')::date;
BEGIN
  UPDATE api_quota_tracking SET
    last_reset = CASE WHEN now() >= quota_reset_at THEN now() ELSE last_reset END,
    quota_remaining = (CASE WHEN now() >= quota_reset_at THEN 10000 ELSE quota_remaining END) - p_units,
    quota_reset_at = CASE WHEN now() >= quota_reset_at THEN public.next_pacific_midnight() ELSE quota_reset_at END,
    updated_at = now()
  WHERE api_name = 'youtube'
    AND (CASE WHEN now() >= quota_reset_at THEN 10000 ELSE quota_remaining END) - p_units >= p_floor
  RETURNING quota_remaining INTO remaining;
  IF remaining IS NULL THEN RETURN -1; END IF;
  INSERT INTO youtube_quota_usage (quota_day_pt, key_label, source, units, attempts)
  VALUES (day_pt, p_key_label, p_source, p_units, 1)
  ON CONFLICT (quota_day_pt, key_label, source) DO UPDATE
    SET units = youtube_quota_usage.units + EXCLUDED.units, attempts = youtube_quota_usage.attempts + 1, updated_at = now();
  RETURN remaining;
END; $$;
REVOKE ALL ON FUNCTION public.reserve_youtube_quota(integer, text, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_youtube_quota(integer, text, text, integer) TO service_role;

-- Repaired legacy recorder name (shared pool, unconditional)
CREATE OR REPLACE FUNCTION public.update_youtube_quota_usage(used_units integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.reserve_youtube_quota(used_units, 'unspecified', 'legacy', -100000); END; $$;
REVOKE ALL ON FUNCTION public.update_youtube_quota_usage(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_youtube_quota_usage(integer) TO service_role;

-- Pacific-midnight reset for existing daily reset row
UPDATE public.api_quota_tracking SET quota_reset_at = public.next_pacific_midnight() WHERE api_name = 'youtube' AND quota_reset_at < public.next_pacific_midnight() AND quota_reset_at > now();

CREATE INDEX IF NOT EXISTS idx_youtube_videos_video_id ON public.youtube_videos(video_id);