import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BatchAnalysisRequest {
  batchSize?: number;
  maxVideos?: number;
  skipAnalyzed?: boolean;
  onlyPending?: boolean;
}

const createSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

const getVideosToAnalyze = async (
  supabase: any, 
  batchSize: number, 
  skipAnalyzed: boolean,
  onlyPending: boolean
) => {
  let query = supabase
    .from('youtube_videos')
    .select('id, video_id, title, description, thumbnail, channel_name, content_analysis_status')
    .is('deleted_at', null)
    .limit(batchSize);

  if (skipAnalyzed) {
    query = query.in('content_analysis_status', ['pending', 'manual_review']);
  }

  if (onlyPending) {
    query = query.eq('content_analysis_status', 'pending');
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching videos to analyze:', error);
    throw new Error('Failed to fetch videos');
  }

  return data || [];
};

const analyzeVideosBatch = async (supabase: any, videos: any[]) => {
  const results = {
    total: videos.length,
    approved: 0,
    rejected: 0,
    manualReview: 0,
    errors: 0,
    processed: []
  };

  console.log(`Starting batch analysis of ${videos.length} videos`);

  for (const video of videos) {
    try {
      console.log(`Analyzing video: ${video.title} (${video.video_id})`);

      // Call the video content analyzer
      const analysisResponse = await supabase.functions.invoke('video-content-analyzer', {
        body: {
          videoId: video.id,
          title: video.title,
          description: video.description,
          thumbnailUrl: video.thumbnail,
          channelName: video.channel_name,
          storeResults: true
        }
      });

      if (analysisResponse.error) {
        console.error(`Error analyzing video ${video.id}:`, analysisResponse.error);
        results.errors++;
        continue;
      }

      const analysisResult = analysisResponse.data;

      // Count results
      if (analysisResult.approved && analysisResult.status === 'approved') {
        results.approved++;
      } else if (analysisResult.status === 'rejected') {
        results.rejected++;
      } else if (analysisResult.status === 'manual_review') {
        results.manualReview++;
      }

      results.processed.push({
        videoId: video.id,
        title: video.title,
        status: analysisResult.status,
        score: analysisResult.finalScore,
        reasoning: analysisResult.reasoning
      });

      console.log(`Video ${video.id} analyzed: ${analysisResult.status} (score: ${analysisResult.finalScore})`);

      // Small delay to avoid overwhelming the AI services
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`Error processing video ${video.id}:`, error);
      results.errors++;
    }
  }

  return results;
};

const getAnalysisStats = async (supabase: any) => {
  const { data, error } = await supabase
    .from('youtube_videos')
    .select('content_analysis_status')
    .is('deleted_at', null);

  if (error) {
    console.error('Error getting analysis stats:', error);
    return null;
  }

  const stats = {
    total: data.length,
    pending: 0,
    approved: 0,
    rejected: 0,
    manualReview: 0
  };

  data.forEach(video => {
    const status = video.content_analysis_status || 'pending';
    if (status in stats) {
      stats[status as keyof typeof stats]++;
    }
  });

  return stats;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody: BatchAnalysisRequest = await req.json().catch(() => ({}));
    
    const {
      batchSize = 10,
      maxVideos = 100,
      skipAnalyzed = true,
      onlyPending = false
    } = requestBody;

    console.log('Starting batch analysis with options:', {
      batchSize,
      maxVideos,
      skipAnalyzed,
      onlyPending
    });

    const supabase = createSupabaseClient();
    
    // Get current analysis statistics
    const initialStats = await getAnalysisStats(supabase);
    console.log('Initial analysis stats:', initialStats);

    // Get videos to analyze
    const videos = await getVideosToAnalyze(supabase, Math.min(batchSize, maxVideos), skipAnalyzed, onlyPending);
    
    if (videos.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No videos found to analyze',
        stats: initialStats,
        processed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${videos.length} videos to analyze`);

    // Process videos in batches
    let totalProcessed = 0;
    let totalResults = {
      total: 0,
      approved: 0,
      rejected: 0,
      manualReview: 0,
      errors: 0,
      processed: []
    };

    const batchCount = Math.ceil(Math.min(videos.length, maxVideos) / batchSize);
    
    for (let i = 0; i < batchCount; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, videos.length, maxVideos);
      const batch = videos.slice(start, end);

      console.log(`Processing batch ${i + 1}/${batchCount} (${batch.length} videos)`);
      
      const batchResults = await analyzeVideosBatch(supabase, batch);
      
      // Aggregate results
      totalResults.total += batchResults.total;
      totalResults.approved += batchResults.approved;
      totalResults.rejected += batchResults.rejected;
      totalResults.manualReview += batchResults.manualReview;
      totalResults.errors += batchResults.errors;
      totalResults.processed.push(...batchResults.processed);
      
      totalProcessed += batch.length;

      console.log(`Batch ${i + 1} completed. Processed: ${totalProcessed}, Errors: ${totalResults.errors}`);

      // Break if we've reached maxVideos
      if (totalProcessed >= maxVideos) {
        break;
      }

      // Delay between batches to be respectful to API limits
      if (i < batchCount - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Get final statistics
    const finalStats = await getAnalysisStats(supabase);

    const response = {
      success: true,
      message: `Successfully analyzed ${totalProcessed} videos`,
      batchResults: totalResults,
      initialStats,
      finalStats,
      processed: totalProcessed,
      timestamp: new Date().toISOString()
    };

    console.log('Batch analysis completed:', {
      processed: totalProcessed,
      approved: totalResults.approved,
      rejected: totalResults.rejected,
      manualReview: totalResults.manualReview,
      errors: totalResults.errors
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-existing-videos:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      processed: 0,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});