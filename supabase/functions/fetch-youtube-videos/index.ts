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

    console.log('Starting to fetch videos...');

    // Get channels from the database
    const { data: channels, error: channelsError } = await supabaseClient
      .from('youtube_channels')
      .select('channel_id');

    if (channelsError) {
      console.error('Error fetching channels:', channelsError);
      throw channelsError;
    }

    if (!channels?.length) {
      console.log('No channels found');
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

    console.log('Fetching videos for channels:', channels);

    // Fetch videos for each channel
    const videoPromises = channels.map(async (channel) => {
      const apiKey = Deno.env.get('YOUTUBE_API_KEY');
      if (!apiKey) {
        throw new Error('YouTube API key not configured');
      }

      console.log(`Fetching videos for channel ${channel.channel_id}`);

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&channelId=${channel.channel_id}&maxResults=50&order=date&type=video&key=${apiKey}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error fetching videos for channel ${channel.channel_id}:`, errorText);
        return [];
      }

      const data = await response.json();
      console.log(`Received ${data.items?.length || 0} videos for channel ${channel.channel_id}`);
      
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
    console.log(`Total videos fetched: ${videos.length}`);

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

    // Return success response with CORS headers
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
    console.error('Error in edge function:', error);
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