
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { channelId } = await req.json();
    console.log('Received channel ID:', channelId);

    if (!channelId) {
      throw new Error('Channel ID is required');
    }

    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API key not configured');
    }

    // Try to get channel info
    const apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.items?.[0]) {
      throw new Error('Channel not found');
    }

    const channel = data.items[0];
    const channelInfo = {
      channel_id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description || '',
      thumbnail_url: channel.snippet.thumbnails?.default?.url || '',
      default_category: 'other'
    };

    // Save to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Database configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error: dbError } = await supabase
      .from('youtube_channels')
      .insert([channelInfo]);

    if (dbError) {
      if (dbError.code === '23505') {
        throw new Error('This channel has already been added');
      }
      throw new Error('Failed to save channel to database');
    }

    return new Response(
      JSON.stringify(channelInfo),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
