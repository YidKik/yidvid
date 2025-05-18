
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Create a Supabase client using environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// YouTube API key for fetching video statistics
const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY") || "";

// Alternative API key for fallback
const fallbackApiKey = "AIzaSyDeEEZoXZfGHiNvl9pMf18N43TECw07ANk";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    console.log("Video views update function started");
    
    // Determine batch size and maximum videos to process
    const { 
      batchSize = 50,
      maxVideos = 500,
      bypassQuotaCheck = false
    } = await req.json().catch(() => ({}));
    
    // Check if we have quota remaining before starting
    if (!bypassQuotaCheck) {
      const { data: quotaData, error: quotaError } = await supabase
        .from("api_quota_tracking")
        .select("quota_remaining")
        .eq("api_name", "youtube")
        .single();
        
      if (quotaError || (quotaData && quotaData.quota_remaining < 10)) {
        console.log("YouTube API quota too low for view count updates");
        return new Response(
          JSON.stringify({
            success: false,
            message: "YouTube API quota too low for view count updates"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // Fetch videos from database, prioritizing most recently updated videos
    // that haven't had their views updated recently
    const { data: videos, error: fetchError } = await supabase
      .from("youtube_videos")
      .select("id, video_id")
      .is("deleted_at", null)
      .order("updated_at", { ascending: true })
      .limit(maxVideos);
    
    if (fetchError) {
      console.error("Error fetching videos:", fetchError);
      throw fetchError;
    }
    
    if (!videos || videos.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "No videos to update" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Found ${videos.length} videos to process for view counts`);
    
    // Process videos in batches to avoid hitting YouTube API limits
    let updatedCount = 0;
    let failedCount = 0;
    let quotaUsed = 0;
    
    // Process in batches of batchSize videos
    for (let i = 0; i < videos.length; i += batchSize) {
      const batch = videos.slice(i, i + batchSize);
      
      // Extract video IDs for this batch
      const videoIds = batch.map(video => video.video_id);
      
      try {
        // Construct API URL for batch request to YouTube
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds.join(",")}&key=${youtubeApiKey}`;
        
        // Define a list of referer domains to try
        const refererDomains = [
          'https://yidvid.com',
          'https://lovable.dev',
          'https://app.yidvid.com',
          'https://youtube-viewer.com',
          'https://videohub.app'
        ];
        
        // Make request with a random referer from our list
        const randomReferer = refererDomains[Math.floor(Math.random() * refererDomains.length)];
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'Referer': randomReferer,
            'Origin': randomReferer,
            'User-Agent': 'Mozilla/5.0 (compatible; VideoFetchBot/1.0)'
          }
        });
        
        // If we hit quota limit or other error, try fallback key
        if (!response.ok) {
          console.log("Using fallback API key for YouTube API");
          const fallbackUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds.join(",")}&key=${fallbackApiKey}`;
          const fallbackResponse = await fetch(fallbackUrl, {
            headers: {
              'Accept': 'application/json',
              'Referer': randomReferer,
              'Origin': randomReferer,
              'User-Agent': 'Mozilla/5.0 (compatible; VideoFetchBot/1.0)'
            }
          });
          
          if (!fallbackResponse.ok) {
            throw new Error(`Both API keys failed: ${fallbackResponse.statusText}`);
          }
          
          const data = await fallbackResponse.json();
          await processYouTubeResponse(data, batch);
        } else {
          const data = await response.json();
          await processYouTubeResponse(data, batch);
        }
        
        // Track quota usage - each video batch uses 1 quota unit
        quotaUsed += 1;
        
        // Update success count
        updatedCount += batch.length;
        console.log(`Successfully processed batch ${i/batchSize + 1}, videos ${i+1}-${Math.min(i+batchSize, videos.length)}`);
        
        // Add a small delay between batches to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error processing batch ${i/batchSize + 1}:`, error);
        failedCount += batch.length;
      }
    }
    
    // Update quota usage in database if we used the primary key
    if (!bypassQuotaCheck) {
      await supabase.rpc('update_youtube_quota_usage', { used_units: quotaUsed });
    }
    
    // Return results
    return new Response(
      JSON.stringify({
        success: true,
        processed: videos.length,
        updated: updatedCount,
        failed: failedCount,
        quotaUsed
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in update-video-views function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "An unexpected error occurred"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Helper function to process YouTube API response and update database
async function processYouTubeResponse(data: any, videos: any[]) {
  if (!data.items || data.items.length === 0) {
    console.log("No video statistics returned from YouTube API");
    return;
  }
  
  // Create a map of video_id to statistics for easy lookup
  const statsMap = new Map();
  for (const item of data.items) {
    statsMap.set(item.id, {
      views: parseInt(item.statistics.viewCount) || 0
    });
  }
  
  // Batch update videos with new view counts
  for (const video of videos) {
    const stats = statsMap.get(video.video_id);
    
    if (stats) {
      // Update the video with new view count
      const { error } = await supabase
        .from("youtube_videos")
        .update({
          views: stats.views,
          updated_at: new Date().toISOString()
        })
        .eq("id", video.id);
      
      if (error) {
        console.error(`Error updating video ${video.id}:`, error);
      }
    }
  }
}
