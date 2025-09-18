import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisResult {
  score: number;
  status: 'approved' | 'rejected' | 'pending';
  details: {
    textAnalysis?: any;
    thumbnailAnalysis?: any;
    overallAssessment: string;
  };
  requiresManualReview: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { action, videoIds } = await req.json();

    if (action === 'analyze-batch') {
      const results = {
        processed: 0,
        approved: 0,
        rejected: 0,
        manualReview: 0,
        errors: 0
      };

      // Process videos in batches
      const batchSize = 10;
      for (let i = 0; i < videoIds.length; i += batchSize) {
        const batch = videoIds.slice(i, i + batchSize);
        
        for (const videoId of batch) {
          try {
            // Fetch video details
            const { data: video, error: fetchError } = await supabase
              .from('youtube_videos')
              .select('*')
              .eq('id', videoId)
              .single();

            if (fetchError || !video) {
              console.error('Failed to fetch video:', fetchError);
              results.errors++;
              continue;
            }

            // Perform AI analysis
            const analysisResult = await analyzeVideo(video);
            
            // Update video with analysis results
            const { error: updateError } = await supabase
              .from('youtube_videos')
              .update({
                content_analysis_status: analysisResult.status,
                analysis_details: analysisResult.details,
                analysis_score: analysisResult.score,
                analysis_timestamp: new Date().toISOString(),
                manual_review_required: analysisResult.requiresManualReview
              })
              .eq('id', videoId);

            if (updateError) {
              console.error('Failed to update video:', updateError);
              results.errors++;
              continue;
            }

            results.processed++;
            if (analysisResult.status === 'approved') results.approved++;
            else if (analysisResult.status === 'rejected') results.rejected++;
            else if (analysisResult.requiresManualReview) results.manualReview++;

            // Log the analysis
            await supabase
              .from('content_analysis_logs')
              .insert({
                video_id: videoId,
                analysis_stage: 'complete',
                stage_result: analysisResult,
                processing_time_ms: 0
              });

          } catch (error) {
            console.error('Error processing video:', videoId, error);
            results.errors++;
          }
        }
      }

      return new Response(JSON.stringify({ success: true, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'analyze-single') {
      const { videoId } = await req.json();
      
      // Fetch video details
      const { data: video, error: fetchError } = await supabase
        .from('youtube_videos')
        .select('*')
        .eq('id', videoId)
        .single();

      if (fetchError || !video) {
        return new Response(JSON.stringify({ error: 'Video not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Perform AI analysis
      const analysisResult = await analyzeVideo(video);
      
      // Update video with analysis results
      const { error: updateError } = await supabase
        .from('youtube_videos')
        .update({
          content_analysis_status: analysisResult.status,
          analysis_details: analysisResult.details,
          analysis_score: analysisResult.score,
          analysis_timestamp: new Date().toISOString(),
          manual_review_required: analysisResult.requiresManualReview
        })
        .eq('id', videoId);

      if (updateError) {
        return new Response(JSON.stringify({ error: 'Failed to update video' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ success: true, result: analysisResult }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in video-content-analyzer:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function analyzeVideo(video: any): Promise<AnalysisResult> {
  console.log('Analyzing video:', video.title);
  
  let score = 7.0; // Default neutral score
  let status: 'approved' | 'rejected' | 'pending' = 'approved';
  let requiresManualReview = false;
  
  const details = {
    textAnalysis: {},
    thumbnailAnalysis: {},
    overallAssessment: 'Automated analysis completed'
  };

  // Text-based analysis
  const title = video.title?.toLowerCase() || '';
  const description = video.description?.toLowerCase() || '';
  const channelName = video.channel_name?.toLowerCase() || '';
  
  // Define flagged keywords (customize based on your content policy)
  const flaggedKeywords = [
    'inappropriate', 'explicit', 'adult', 'violent', 'harmful',
    'hate', 'abuse', 'discrimination', 'spam', 'scam'
  ];
  
  const educationalKeywords = [
    'learn', 'education', 'tutorial', 'lesson', 'study', 'teach',
    'knowledge', 'school', 'academic', 'family', 'kids', 'children'
  ];

  // Check for flagged content
  const hasFlaggedContent = flaggedKeywords.some(keyword => 
    title.includes(keyword) || description.includes(keyword) || channelName.includes(keyword)
  );
  
  // Check for educational content
  const hasEducationalContent = educationalKeywords.some(keyword =>
    title.includes(keyword) || description.includes(keyword) || channelName.includes(keyword)
  );

  if (hasFlaggedContent) {
    score = 2.0;
    status = 'rejected';
    details.overallAssessment = 'Flagged for inappropriate content';
  } else if (hasEducationalContent) {
    score = 9.0;
    status = 'approved';
    details.overallAssessment = 'Approved - Educational content detected';
  } else {
    // Default case - needs manual review for ambiguous content
    score = 6.0;
    status = 'pending';
    requiresManualReview = true;
    details.overallAssessment = 'Requires manual review - Ambiguous content';
  }

  // Additional checks based on channel reputation, view count, etc.
  if (video.view_count && video.view_count > 10000) {
    score += 0.5; // Popular videos get slight boost
  }
  
  if (video.channel_name && video.channel_name.includes('Education')) {
    score += 1.0; // Educational channels get boost
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(10, score));

  details.textAnalysis = {
    title_score: hasEducationalContent ? 9 : hasFlaggedContent ? 1 : 6,
    description_score: hasEducationalContent ? 9 : hasFlaggedContent ? 1 : 6,
    flagged_keywords: hasFlaggedContent,
    educational_keywords: hasEducationalContent
  };

  console.log(`Analysis complete for "${video.title}": Score ${score}, Status ${status}`);

  return {
    score,
    status,
    details,
    requiresManualReview
  };
}