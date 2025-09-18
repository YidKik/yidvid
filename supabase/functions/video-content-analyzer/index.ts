import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VideoAnalysisRequest {
  videoId: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  channelName: string;
  storeResults?: boolean;
}

const createSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

const updateVideoAnalysisStatus = async (
  supabase: any, 
  videoId: string, 
  status: string, 
  details: any, 
  score: number, 
  manualReview: boolean = false
) => {
  try {
    const { error } = await supabase
      .rpc('update_video_analysis_status', {
        p_video_id: videoId,
        p_status: status,
        p_details: details,
        p_score: score,
        p_manual_review: manualReview
      });

    if (error) {
      console.error('Error updating video analysis status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateVideoAnalysisStatus:', error);
    return false;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: VideoAnalysisRequest = await req.json();
    const { videoId, title, description, thumbnailUrl, channelName, storeResults = false } = requestData;

    console.log('Analyzing video content for:', { videoId, title });

    const supabase = createSupabaseClient();

    // Call the enhanced analyze-video-content function
    const analysisResponse = await supabase.functions.invoke('analyze-video-content', {
      body: {
        videoId,
        title,
        description,
        thumbnailUrl,
        channelName
      }
    });

    if (analysisResponse.error) {
      console.error('Error calling analyze-video-content:', analysisResponse.error);
      throw new Error('Failed to analyze video content');
    }

    const analysisResult = analysisResponse.data;
    console.log('Analysis result:', analysisResult);

    // Determine status based on analysis
    let status = 'approved';
    let manualReview = false;

    if (!analysisResult.approved) {
      status = 'rejected';
    } else if (analysisResult.finalScore < 0.8) {
      status = 'manual_review';
      manualReview = true;
    }

    // Store results in database if requested
    if (storeResults && videoId !== 'unknown') {
      const updated = await updateVideoAnalysisStatus(
        supabase,
        videoId,
        status,
        {
          textAnalysis: analysisResult.textAnalysis,
          thumbnailAnalysis: analysisResult.thumbnailAnalysis,
          videoAnalysis: analysisResult.videoAnalysis,
          reasoning: analysisResult.reasoning,
          analyzed_at: new Date().toISOString()
        },
        analysisResult.finalScore,
        manualReview
      );

      if (!updated) {
        console.warn('Failed to update video analysis status in database');
      }
    }

    const response = {
      success: true,
      videoId,
      approved: analysisResult.approved,
      status,
      manualReview,
      finalScore: analysisResult.finalScore,
      reasoning: analysisResult.reasoning,
      details: {
        textAnalysis: analysisResult.textAnalysis,
        thumbnailAnalysis: analysisResult.thumbnailAnalysis,
        videoAnalysis: analysisResult.videoAnalysis
      },
      timestamp: new Date().toISOString()
    };

    console.log('Video analysis completed:', { videoId, approved: analysisResult.approved, status });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in video-content-analyzer:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      approved: false,
      status: 'rejected',
      finalScore: 0.0,
      reasoning: 'Analysis failed due to system error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});