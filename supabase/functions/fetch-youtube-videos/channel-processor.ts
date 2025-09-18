
// Import any necessary modules
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Create a Supabase client using environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// AI Content Filtering Function
async function filterVideoContent(videos: any[]): Promise<{
  approvedVideos: any[],
  rejectedVideos: any[],
  manualReviewVideos: any[]
}> {
  const approvedVideos = [];
  const rejectedVideos = [];
  const manualReviewVideos = [];
  
  console.log(`[Content Filter] Starting analysis of ${videos.length} videos`);
  
  for (const video of videos) {
    try {
      // Call the video content analyzer
      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('video-content-analyzer', {
        body: {
          videoId: video.video_id,
          title: video.title,
          description: video.description,
          thumbnailUrl: video.thumbnail,
          channelName: video.channel_name,
          storeResults: false // We'll store results when we insert the video
        }
      });

      if (analysisError) {
        console.error(`[Content Filter] Error analyzing video ${video.video_id}:`, analysisError);
        // On analysis error, put in manual review
        video.content_analysis_status = 'manual_review';
        video.analysis_details = { error: analysisError.message, analyzed_at: new Date().toISOString() };
        video.analysis_score = 0.5;
        video.manual_review_required = true;
        manualReviewVideos.push(video);
        continue;
      }

      // Set analysis results on video object
      video.content_analysis_status = analysisResult.status;
      video.analysis_details = {
        textAnalysis: analysisResult.details.textAnalysis,
        thumbnailAnalysis: analysisResult.details.thumbnailAnalysis,
        videoAnalysis: analysisResult.details.videoAnalysis,
        reasoning: analysisResult.reasoning,
        analyzed_at: new Date().toISOString()
      };
      video.analysis_score = analysisResult.finalScore;
      video.analysis_timestamp = new Date().toISOString();
      video.manual_review_required = analysisResult.manualReview;

      // Categorize based on analysis result
      if (analysisResult.approved && analysisResult.status === 'approved') {
        approvedVideos.push(video);
        console.log(`[Content Filter] ✅ Approved: ${video.title} (score: ${analysisResult.finalScore.toFixed(2)})`);
      } else if (analysisResult.status === 'rejected') {
        rejectedVideos.push(video);
        console.log(`[Content Filter] ❌ Rejected: ${video.title} (${analysisResult.reasoning})`);
      } else {
        manualReviewVideos.push(video);
        console.log(`[Content Filter] ⚠️ Manual Review: ${video.title} (score: ${analysisResult.finalScore.toFixed(2)})`);
      }

      // Small delay to avoid overwhelming the AI service
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`[Content Filter] Unexpected error analyzing video ${video.video_id}:`, error);
      // On unexpected error, put in manual review
      video.content_analysis_status = 'manual_review';
      video.analysis_details = { error: error.message, analyzed_at: new Date().toISOString() };
      video.analysis_score = 0.5;
      video.manual_review_required = true;
      manualReviewVideos.push(video);
    }
  }
  
  console.log(`[Content Filter] Filtering complete: ${approvedVideos.length} approved, ${rejectedVideos.length} rejected, ${manualReviewVideos.length} manual review`);
  
  return {
    approvedVideos,
    rejectedVideos,
    manualReviewVideos
  };
}

export async function processChannel(channelId: string, videos: any[]) {
  try {
    console.log(`[Channel Processor] Processing ${videos.length} videos for channel ${channelId}`);
    
    if (!videos || videos.length === 0) {
      console.log(`[Channel Processor] No videos to process for channel ${channelId}`);
      return { newVideos: 0 };
    }
    
    // Get existing videos for this channel to avoid duplicates
    const { data: existingVideos, error: fetchError } = await supabase
      .from("youtube_videos")
      .select("video_id")
      .eq("channel_id", channelId)
      .is("deleted_at", null);
      
    if (fetchError) {
      console.error(`[Channel Processor] Error fetching existing videos: ${fetchError.message}`);
      throw fetchError;
    }
    
    // Create a set of existing video IDs for fast lookup
    const existingVideoIds = new Set(existingVideos?.map(v => v.video_id) || []);
    console.log(`[Channel Processor] Found ${existingVideoIds.size} existing videos for channel ${channelId}`);
    
    // Filter out videos that already exist in our database
    const candidateVideos = videos.filter(video => !existingVideoIds.has(video.video_id));
    console.log(`[Channel Processor] Found ${candidateVideos.length} candidate videos for channel ${channelId}`);
    
    // Apply AI content filtering to new videos
    const { approvedVideos, rejectedVideos, manualReviewVideos } = await filterVideoContent(candidateVideos);
    console.log(`[Channel Processor] Content filtering results: ${approvedVideos.length} approved, ${rejectedVideos.length} rejected, ${manualReviewVideos.length} manual review`);
    
    // Combine approved and manual review videos for insertion
    const videosToInsert = [...approvedVideos, ...manualReviewVideos];
    console.log(`[Channel Processor] Inserting ${videosToInsert.length} videos (approved + manual review)`);
    
    let successCount = 0;
    let errorCount = 0;
    let rejectedCount = rejectedVideos.length;
    
    // Insert filtered videos in batches to avoid errors with large payloads
    const batchSize = 20;
    for (let i = 0; i < videosToInsert.length; i += batchSize) {
      const batch = videosToInsert.slice(i, i + batchSize);
      
      // Always ensure videos have updated_at field properly set
      const processedVideos = batch.map(video => {
        // Make sure updated_at is explicitly set and is not null
        return {
          ...video,
          updated_at: new Date().toISOString()
        };
      });
      
      // Insert the batch of videos
      const { data: insertedVideos, error: insertError } = await supabase
        .from("youtube_videos")
        .insert(processedVideos)
        .select();
        
      if (insertError) {
        console.error(`[Channel Processor] Error inserting videos batch: ${insertError.message}`);
        errorCount += batch.length;
      } else {
        console.log(`[Channel Processor] Successfully inserted ${insertedVideos?.length || 0} videos`);
        successCount += insertedVideos?.length || 0;
      }
    }
    
    // Update the last_fetch timestamp for the channel
    const { error: updateError } = await supabase
      .from("youtube_channels")
      .update({ last_fetch: new Date().toISOString() })
      .eq("channel_id", channelId);
      
    if (updateError) {
      console.error(`[Channel Processor] Error updating channel last_fetch: ${updateError.message}`);
    }
    
    console.log(`[Channel Processor] Completed processing channel ${channelId}: ${successCount} new videos, ${rejectedCount} rejected, ${errorCount} errors`);
    
    return { 
      newVideos: successCount,
      rejectedVideos: rejectedCount,
      errors: errorCount
    };
  } catch (error) {
    console.error(`[Channel Processor] Error processing channel ${channelId}:`, error);
    return { newVideos: 0, error: error.message };
  }
}
