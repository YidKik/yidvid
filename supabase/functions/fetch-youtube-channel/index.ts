
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
    let { channelId } = await req.json();
    console.log('Received channel ID:', channelId);

    if (!channelId) {
      throw new Error('Channel ID is required');
    }

    // Extract channel ID from URL if needed
    if (channelId.includes('youtube.com')) {
      const match = channelId.match(/(?:\/channel\/|\/c\/|@)([\w-]+)/);
      if (match) {
        channelId = match[1];
      }
    }
    
    // Remove @ if present
    channelId = channelId.replace(/^@/, '');
    console.log('Processed channel ID:', channelId);

    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API key not configured');
    }

    // Try to get channel by ID first
    let apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    console.log('Fetching from:', apiUrl);
    
    let response = await fetch(apiUrl);
    let data = await response.json();
    console.log('API Response:', data);

    // If no results, try searching
    if (!data.items?.length) {
      console.log('No direct match, trying search...');
      apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${channelId}&type=channel&key=${YOUTUBE_API_KEY}`;
      response = await fetch(apiUrl);
      data = await response.json();
      
      if (!data.items?.length) {
        throw new Error('Channel not found');
      }

      channelId = data.items[0].id.channelId;
      apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`;
      response = await fetch(apiUrl);
      data = await response.json();
    }

    if (!data.items?.[0]) {
      throw new Error('Could not find channel');
    }

    const channel = data.items[0];
    const channelInfo = {
      channel_id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description || '',
      thumbnail_url: channel.snippet.thumbnails?.default?.url || '',
      default_category: 'other'
    };

    // Insert into database
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
      console.error('Database error:', dbError);
      if (dbError.code === '23505') {
        throw new Error('This channel has already been added');
      }
      throw new Error('Failed to save channel to database');
    }

    return new Response(
      JSON.stringify(channelInfo),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
