import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisResult {
  finalScore: number;
  status: 'approved' | 'rejected' | 'pending';
  approved: boolean;
  manualReview: boolean;
  reasoning: string;
  details: {
    textAnalysis: any;
    thumbnailAnalysis: any;
    videoAnalysis: any;
  };
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

    const body = await req.json();
    const { action, videoIds, videoId, title, description, thumbnailUrl, channelName, storeResults } = body;

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
                analysis_score: analysisResult.finalScore,
                analysis_timestamp: new Date().toISOString(),
                manual_review_required: analysisResult.manualReview
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
            else if (analysisResult.manualReview) results.manualReview++;

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

    // Handle single video analysis (called from channel processor)
    if (!action && videoId && title !== undefined) {
      console.log(`Analyzing single video: ${title} (${videoId})`);
      
      // Create mock video object for analysis
      const videoData = {
        video_id: videoId,
        title: title,
        description: description || '',
        thumbnail: thumbnailUrl || '',
        channel_name: channelName || ''
      };

      // Perform AI analysis
      const analysisResult = await analyzeVideo(videoData);
      
      // Optionally store results if requested
      if (storeResults && videoId) {
        const { error: updateError } = await supabase
          .from('youtube_videos')
          .update({
            content_analysis_status: analysisResult.status,
            analysis_details: analysisResult.details,
            analysis_score: analysisResult.finalScore,
            analysis_timestamp: new Date().toISOString(),
            manual_review_required: analysisResult.manualReview
          })
          .eq('video_id', videoId);

        if (updateError) {
          console.error('Failed to store analysis results:', updateError);
        }
      }

      return new Response(JSON.stringify(analysisResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'analyze-single') {
      // Fetch video details from database
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
          analysis_score: analysisResult.finalScore,
          analysis_timestamp: new Date().toISOString(),
          manual_review_required: analysisResult.manualReview
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
  
  let finalScore = 7.0; // Default neutral score
  let status: 'approved' | 'rejected' | 'pending' = 'approved';
  let manualReview = false;
  let reasoning = 'Standard automated analysis';
  
  const details = {
    textAnalysis: {},
    thumbnailAnalysis: {},
    videoAnalysis: {}
  };

  // Text-based analysis
  const title = video.title?.toLowerCase() || '';
  const description = video.description?.toLowerCase() || '';
  const channelName = video.channel_name?.toLowerCase() || '';
  
  // Define content analysis keywords
  const flaggedKeywords = [
    'inappropriate', 'explicit', 'adult', 'violent', 'harmful',
    'hate', 'abuse', 'discrimination', 'spam', 'scam', 'nudity',
    'sexual', 'drug', 'alcohol', 'gambling', 'violence', 'weapon'
  ];
  
  const educationalKeywords = [
    'torah', 'talmud', 'jewish', 'kosher', 'rabbi', 'synagogue', 'shabbat',
    'learn', 'education', 'tutorial', 'lesson', 'study', 'teach',
    'knowledge', 'school', 'academic', 'family', 'kids', 'children',
    'parsha', 'mitzvah', 'prayer', 'yeshiva', 'chassidus', 'halacha'
  ];

  const inspirationalKeywords = [
    'inspire', 'motivation', 'spiritual', 'faith', 'hope', 'blessing',
    'community', 'charity', 'kindness', 'wisdom', 'growth', 'healing'
  ];

  // Content analysis
  const hasFlaggedContent = flaggedKeywords.some(keyword => 
    title.includes(keyword) || description.includes(keyword) || channelName.includes(keyword)
  );
  
  const hasEducationalContent = educationalKeywords.some(keyword =>
    title.includes(keyword) || description.includes(keyword) || channelName.includes(keyword)
  );

  const hasInspirationalContent = inspirationalKeywords.some(keyword =>
    title.includes(keyword) || description.includes(keyword) || channelName.includes(keyword)
  );

  // Determine content status and score
  if (hasFlaggedContent) {
    finalScore = 2.0;
    status = 'rejected';
    reasoning = 'Content contains flagged keywords that violate content policy';
  } else if (hasEducationalContent) {
    finalScore = 9.0;
    status = 'approved';
    reasoning = 'Educational/religious content approved for kosher platform';
  } else if (hasInspirationalContent) {
    finalScore = 8.0;
    status = 'approved';
    reasoning = 'Inspirational content approved';
  } else {
    // Ambiguous content - manual review needed
    finalScore = 5.5;
    status = 'pending';
    manualReview = true;
    reasoning = 'Content requires manual review - no clear educational or inspirational markers';
  }

  // Channel reputation adjustments
  if (video.views && video.views > 10000) {
    finalScore += 0.3; // Popular videos get slight boost
  }
  
  if (channelName.includes('rabbi') || channelName.includes('yeshiva') || channelName.includes('torah')) {
    finalScore += 0.5; // Religious channels get boost
  }

  // Ensure score is within bounds
  finalScore = Math.max(0, Math.min(10, finalScore));

  // Final status determination based on score
  if (finalScore >= 7.0 && !hasFlaggedContent) {
    status = 'approved';
    manualReview = false;
  } else if (finalScore <= 3.0 || hasFlaggedContent) {
    status = 'rejected';
    manualReview = false;
  } else {
    status = 'pending';
    manualReview = true;
  }

  details.textAnalysis = {
    title_score: hasEducationalContent ? 9 : hasFlaggedContent ? 1 : 6,
    description_score: hasEducationalContent ? 9 : hasFlaggedContent ? 1 : 6,
    flagged_content: hasFlaggedContent,
    educational_content: hasEducationalContent,
    inspirational_content: hasInspirationalContent,
    keywords_found: {
      flagged: flaggedKeywords.filter(k => title.includes(k) || description.includes(k)),
      educational: educationalKeywords.filter(k => title.includes(k) || description.includes(k)),
      inspirational: inspirationalKeywords.filter(k => title.includes(k) || description.includes(k))
    }
  };

  details.thumbnailAnalysis = {
    analyzed: false,
    message: 'Thumbnail analysis not implemented in this version'
  };

  details.videoAnalysis = {
    analyzed: false,
    message: 'Video content analysis not implemented in this version'
  };

  console.log(`Analysis complete for "${video.title}": Score ${finalScore}, Status ${status}, Manual Review: ${manualReview}`);

  return {
    finalScore,
    status,
    approved: status === 'approved',
    manualReview,
    reasoning,
    details
  };
}