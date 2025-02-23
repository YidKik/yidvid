
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
    console.log('Received channel input:', channelId);

    if (!channelId) {
      throw new Error('Channel ID is required');
    }

    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API key not configured');
    }

    // Clean up channel ID
    channelId = channelId.trim();
    
    // Handle different URL formats
    if (channelId.includes('youtube.com')) {
      const urlPatterns = [
        /(?:\/channel\/)([^\/\s?]+)/,  // /channel/ID
        /(?:\/c\/)([^\/\s?]+)/,        // /c/name
        /(?:\/@)([^\/\s?]+)/           // @handle
      ];

      for (const pattern of urlPatterns) {
        const match = channelId.match(pattern);
        if (match && match[1]) {
          channelId = match[1];
          break;
        }
      }
    }

    // Remove @ if it's a handle
    channelId = channelId.replace(/^@/, '');
    console.log('Processed channel ID:', channelId);

    // First try to get channel directly
    let apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    let response = await fetch(apiUrl);
    let data = await response.json();

    // If no results, try searching by username/handle
    if (!data.items?.length) {
      console.log('No direct match, trying search...');
      apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${channelId}&key=${YOUTUBE_API_KEY}`;
      response = await fetch(apiUrl);
      data = await response.json();

      if (!data.items?.length) {
        throw new Error('Channel not found');
      }

      // Get the actual channel data
      const foundChannelId = data.items[0].id.channelId;
      apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${foundChannelId}&key=${YOUTUBE_API_KEY}`;
      response = await fetch(apiUrl);
      data = await response.json();
    }

    if (!data.items?.[0]) {
      throw new Error('Could not retrieve channel information');
    }

    const channel = data.items[0];
    console.log('Found channel:', channel.snippet.title);

    const channelInfo = {
      channel_id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description || '',
      thumbnail_url: channel.snippet.thumbnails?.default?.url || '',
      default_category: 'other'
    };

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Database configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if channel already exists
    const { data: existingChannel } = await supabase
      .from('youtube_channels')
      .select('channel_id')
      .eq('channel_id', channel.id)
      .maybeSingle();

    if (existingChannel) {
      throw new Error('This channel has already been added');
    }

    // Insert new channel
    const { error: insertError } = await supabase
      .from('youtube_channels')
      .insert([channelInfo]);

    if (insertError) {
      console.error('Database insertion error:', insertError);
      throw new Error('Failed to save channel to database');
    }

    console.log('Successfully added channel:', channelInfo.title);
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
