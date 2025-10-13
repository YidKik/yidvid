import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisResult {
  finalScore: number;
  status: 'approved' | 'rejected' | 'pending' | 'manual_review';
  approved: boolean;
  manualReview: boolean;
  reasoning: string;
  details: {
    textAnalysis: any;
    thumbnailAnalysis: any;
    videoAnalysis: any;
  };
  category: string;
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
      console.log(`Starting batch analysis of ${videoIds.length} videos`);
      
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
                manual_review_required: analysisResult.manualReview,
                category: analysisResult.category || 'other'
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

      console.log('Batch analysis completed:', results);
      return new Response(JSON.stringify({ success: true, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle fixing videos stuck in pending status
    if (action === 'fix-pending-videos') {
      console.log('Fixing videos stuck in pending status...');
      
      // Get videos that have analysis results but are still marked as pending
      const { data: pendingVideos, error: fetchError } = await supabase
        .from('youtube_videos')
        .select('id, analysis_score, analysis_details, manual_review_required')
        .eq('content_analysis_status', 'pending')
        .not('analysis_score', 'is', null)
        .is('deleted_at', null);

      if (fetchError) {
        console.error('Error fetching pending videos:', fetchError);
        return new Response(JSON.stringify({ error: 'Failed to fetch pending videos' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      let fixed = 0;
      for (const video of pendingVideos || []) {
        try {
          let newStatus: 'approved' | 'rejected' | 'manual_review' = 'manual_review';
          
          // Determine correct status based on analysis score
          if (video.analysis_score >= 7.0) {
            newStatus = 'approved';
          } else if (video.analysis_score <= 3.0) {
            newStatus = 'rejected';
          } else {
            newStatus = 'manual_review';
          }

          // Update the video status
          const { error: updateError } = await supabase
            .from('youtube_videos')
            .update({
              content_analysis_status: newStatus,
              manual_review_required: newStatus === 'manual_review'
            })
            .eq('id', video.id);

          if (!updateError) {
            fixed++;
          } else {
            console.error('Error updating video:', video.id, updateError);
          }
        } catch (error) {
          console.error('Error processing video:', video.id, error);
        }
      }

      console.log(`Fixed ${fixed} videos that were stuck in pending status`);
      return new Response(JSON.stringify({ success: true, fixed }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle fixing videos stuck in pending status
    if (action === 'fix-pending-videos') {
      console.log('Fixing videos stuck in pending status...');
      
      // Get videos that have analysis results but are still marked as pending
      const { data: pendingVideos, error: fetchError } = await supabase
        .from('youtube_videos')
        .select('id, analysis_score, analysis_details, manual_review_required')
        .eq('content_analysis_status', 'pending')
        .not('analysis_score', 'is', null)
        .is('deleted_at', null);

      if (fetchError) {
        console.error('Error fetching pending videos:', fetchError);
        return new Response(JSON.stringify({ error: 'Failed to fetch pending videos' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      let fixed = 0;
      for (const video of pendingVideos || []) {
        try {
          let newStatus: 'approved' | 'rejected' | 'manual_review' = 'manual_review';
          
          // Determine correct status based on analysis score
          if (video.analysis_score >= 7.0) {
            newStatus = 'approved';
          } else if (video.analysis_score <= 3.0) {
            newStatus = 'rejected';
          } else {
            newStatus = 'manual_review';
          }

          // Update the video status
          const { error: updateError } = await supabase
            .from('youtube_videos')
            .update({
              content_analysis_status: newStatus,
              manual_review_required: newStatus === 'manual_review'
            })
            .eq('id', video.id);

          if (!updateError) {
            fixed++;
          } else {
            console.error('Error updating video:', video.id, updateError);
          }
        } catch (error) {
          console.error('Error processing video:', video.id, error);
        }
      }

      console.log(`Fixed ${fixed} videos that were stuck in pending status`);
      return new Response(JSON.stringify({ success: true, fixed }), {
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
      
      console.log(`Analysis result for ${title}:`, {
        status: analysisResult.status,
        score: analysisResult.finalScore,
        approved: analysisResult.approved,
        reasoning: analysisResult.reasoning
      });
      
      // Return result WITHOUT storing - let the calling function decide
      return new Response(JSON.stringify({
        ...analysisResult,
        shouldStore: analysisResult.approved || analysisResult.status === 'manual_review'
      }), {
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
          manual_review_required: analysisResult.manualReview,
          category: analysisResult.category || 'other'
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
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Call the advanced analyze-video-content edge function
    const { data: advancedAnalysis, error: analysisError } = await supabase.functions.invoke('analyze-video-content', {
      body: {
        title: video.title || '',
        description: video.description || '',
        videoId: video.video_id || '',
        thumbnailUrl: video.thumbnail || '',
        channelName: video.channel_name || ''
      }
    });

    if (analysisError) {
      console.error('Error calling analyze-video-content:', analysisError);
      // Fallback to basic analysis if advanced analysis fails
      return fallbackBasicAnalysis(video);
    }

    console.log('Advanced analysis result:', advancedAnalysis);

    // Convert advanced analysis result to our format
    const finalScore = advancedAnalysis.finalScore * 10; // Convert 0-1 scale to 0-10 scale
    let status: 'approved' | 'rejected' | 'pending' | 'manual_review';
    let manualReview = false;

    if (advancedAnalysis.approved) {
      status = 'approved';
      manualReview = false;
    } else if (finalScore <= 3.0) {
      status = 'rejected';
      manualReview = false;
    } else {
      status = 'manual_review';
      manualReview = true;
    }

    return {
      finalScore,
      status,
      approved: advancedAnalysis.approved,
      manualReview,
      reasoning: advancedAnalysis.reasoning,
      details: {
        textAnalysis: advancedAnalysis.textAnalysis,
        thumbnailAnalysis: advancedAnalysis.thumbnailAnalysis,
        videoAnalysis: advancedAnalysis.videoAnalysis
      },
      category: advancedAnalysis.category || 'other'
    };

  } catch (error) {
    console.error('Error in advanced video analysis:', error);
    return fallbackBasicAnalysis(video);
  }
}

// Fallback basic analysis if advanced analysis fails
function fallbackBasicAnalysis(video: any): AnalysisResult {
  console.log('Using fallback basic analysis for:', video.title);
  
  const title = video.title?.toLowerCase() || '';
  const description = video.description?.toLowerCase() || '';
  const channelName = video.channel_name?.toLowerCase() || '';
  
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

  const hasFlaggedContent = flaggedKeywords.some(keyword => 
    title.includes(keyword) || description.includes(keyword) || channelName.includes(keyword)
  );
  
  const hasEducationalContent = educationalKeywords.some(keyword =>
    title.includes(keyword) || description.includes(keyword) || channelName.includes(keyword)
  );

  let finalScore = 5.5;
  let status: 'approved' | 'rejected' | 'pending' | 'manual_review' = 'manual_review';
  let reasoning = 'Fallback basic analysis - advanced analysis unavailable';

  if (hasFlaggedContent) {
    finalScore = 2.0;
    status = 'rejected';
    reasoning = 'Content contains flagged keywords';
  } else if (hasEducationalContent) {
    finalScore = 9.0;
    status = 'approved';
    reasoning = 'Educational/religious content approved';
  }

  return {
    finalScore,
    status,
    approved: status === 'approved',
    manualReview: status === 'manual_review',
    reasoning,
    details: {
      textAnalysis: { flagged_content: hasFlaggedContent, educational_content: hasEducationalContent },
      thumbnailAnalysis: { analyzed: false, message: 'Advanced analysis unavailable' },
      videoAnalysis: { analyzed: false, message: 'Advanced analysis unavailable' }
    },
    category: 'other'
  };
}