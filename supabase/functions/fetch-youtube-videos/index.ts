
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    });
  }

  const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
  if (!YOUTUBE_API_KEY) {
    console.error("No YouTube API key found");
    return new Response(
      JSON.stringify({ error: "YouTube API key not configured" }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }

  try {
    const { channels = [], forceUpdate = false } = await req.json();
    console.log("Processing channels:", channels, "Force update:", forceUpdate);

    if (!channels.length) {
      return new Response(
        JSON.stringify({ error: "No channels provided" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    let processedChannels = 0;
    let newVideos = 0;
    const errors = [];

    for (const channelId of channels) {
      try {
        const url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=50&order=date&type=video&key=${YOUTUBE_API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          const error = await response.json();
          console.error(`Error fetching videos for channel ${channelId}:`, error);
          
          if (error.error?.message?.includes('quota')) {
            return new Response(
              JSON.stringify({ error: "YouTube API quota exceeded", quota_exceeded: true }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 429 
              }
            );
          }
          
          errors.push(`Failed to fetch videos for channel ${channelId}: ${error.error?.message || 'Unknown error'}`);
          continue;
        }

        const data = await response.json();
        const videos = data.items || [];

        // Filter out upcoming live streams and only include published videos
        const publishedVideos = videos.filter(video => {
          const liveBroadcastContent = video.snippet?.liveBroadcastContent;
          // Only include videos that are not upcoming or live
          return liveBroadcastContent === 'none';
        });

        if (publishedVideos.length > 0) {
          const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
          );

          for (const video of publishedVideos) {
            const videoData = {
              video_id: video.id.videoId,
              title: video.snippet.title,
              description: video.snippet.description,
              thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
              channel_id: video.snippet.channelId,
              channel_name: video.snippet.channelTitle,
              uploaded_at: video.snippet.publishedAt
            };

            const { error: insertError } = await supabase
              .from('youtube_videos')
              .insert(videoData)
              .onConflict('video_id')
              .ignore();

            if (!insertError) newVideos++;
          }
        }

        processedChannels++;
      } catch (error) {
        console.error(`Error processing channel ${channelId}:`, error);
        errors.push(`Error processing channel ${channelId}: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedChannels,
        newVideos,
        errors: errors.length ? errors : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request", details: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
