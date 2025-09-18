-- Create enum for content analysis status first
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_analysis_status') THEN
        CREATE TYPE content_analysis_status AS ENUM ('pending', 'approved', 'rejected', 'manual_review');
    END IF;
END $$;

-- Add content analysis fields to youtube_videos table with proper types
ALTER TABLE youtube_videos 
ADD COLUMN IF NOT EXISTS content_analysis_status content_analysis_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS analysis_details JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS analysis_score DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS analysis_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS manual_review_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS approved_by_admin UUID DEFAULT NULL;

-- Create indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_youtube_videos_content_analysis ON youtube_videos(content_analysis_status, analysis_score);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_manual_review ON youtube_videos(manual_review_required) WHERE manual_review_required = TRUE;

-- Create content analysis log table
CREATE TABLE IF NOT EXISTS content_analysis_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES youtube_videos(id) ON DELETE CASCADE,
    analysis_stage TEXT NOT NULL,
    stage_result JSONB NOT NULL,
    processing_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on content analysis logs
ALTER TABLE content_analysis_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view analysis logs
CREATE POLICY "Admins can view content analysis logs"
ON content_analysis_logs
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);

-- Create function to update analysis status
CREATE OR REPLACE FUNCTION update_video_analysis_status(
    p_video_id UUID,
    p_status content_analysis_status,
    p_details JSONB DEFAULT '{}',
    p_score DECIMAL DEFAULT 0.0,
    p_manual_review BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE youtube_videos 
    SET 
        content_analysis_status = p_status,
        analysis_details = p_details,
        analysis_score = p_score,
        analysis_timestamp = NOW(),
        manual_review_required = p_manual_review
    WHERE id = p_video_id;
    
    RETURN FOUND;
END;
$$;