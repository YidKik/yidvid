import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get channels from the database
    const { data: channels, error: channelsError } = await supabaseClient
      .from('youtube_channels')
      .select('channel_id');

    if (channelsError) {
      console.error('Error fetching channels:', channelsError);
      throw channelsError;
    }

    if (!channels?.length) {
      return new Response(
        JSON.stringify({ message: 'No channels found' }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
          status: 200 
        }
      );
    }

    // Fetch videos for each channel
    const videoPromises = channels.map(async (channel) => {
      const apiKey = Deno.env.get('YOUTUBE_API_KEY');
      if (!apiKey) {
        throw new Error('YouTube API key not configured');
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&channelId=${channel.channel_id}&maxResults=50&order=date&type=video&key=${apiKey}`
      );

      if (!response.ok) {
        console.error(`Error fetching videos for channel ${channel.channel_id}:`, await response.text());
        return [];
      }

      const data = await response.json();
      
      // Map YouTube API response to our database schema
      return data.items.map((item: any) => ({
        video_id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high.url,
        channel_id: channel.channel_id,
        channel_name: item.snippet.channelTitle,
        uploaded_at: item.snippet.publishedAt,
      }));
    });

    const videos = (await Promise.all(videoPromises)).flat();

    // Store videos in the database
    for (const video of videos) {
      const { error: upsertError } = await supabaseClient
        .from('youtube_videos')
        .upsert(video, { 
          onConflict: 'video_id',
          ignoreDuplicates: true 
        });

      if (upsertError) {
        console.error('Error upserting video:', upsertError);
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({ success: true, count: videos.length }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});