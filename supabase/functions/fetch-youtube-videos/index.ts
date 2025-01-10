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
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get channels from the database
    const { data: channels, error: channelsError } = await supabaseClient
      .from('youtube_channels')
      .select('channel_id');

    if (channelsError) throw channelsError;

    // Fetch videos for each channel
    const videoPromises = channels.map(async (channel) => {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&channelId=${channel.channel_id}&maxResults=2&order=date&type=video&key=${Deno.env.get('YOUTUBE_API_KEY')}`
      );

      if (!response.ok) {
        console.error(`Error fetching videos for channel ${channel.channel_id}:`, await response.text());
        return [];
      }

      const data = await response.json();
      return data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high.url,
        channelName: item.snippet.channelTitle,
        uploadedAt: item.snippet.publishedAt,
      }));
    });

    const videos = (await Promise.all(videoPromises)).flat();

    return new Response(
      JSON.stringify(videos),
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