
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const extractYouTubeId = (input: string): string => {
  // Handle video URLs that might be pasted
  if (input.includes('youtu.be/') || input.includes('youtube.com/watch')) {
    const videoMatch = input.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]+)/);
    if (videoMatch && videoMatch[1]) {
      return videoMatch[1];
    }
  }
  
  // Handle channel URLs
  if (input.includes('youtube.com/')) {
    const channelMatch = input.match(/(?:youtube\.com\/(?:channel\/|c\/|@))([\w-]+)/);
    if (channelMatch && channelMatch[1]) {
      return channelMatch[1];
    }
  }
  
  // Handle @username format
  if (input.startsWith('@')) {
    return input.substring(1);
  }
  
  return input.trim();
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { channelId } = await req.json();
    console.log('Raw input received:', channelId);
    
    if (!channelId) {
      throw new Error('Channel ID is required');
    }

    const processedId = extractYouTubeId(channelId);
    console.log('Processed channel ID:', processedId);

    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API key not configured');
    }

    // First try to find by channel ID
    let apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${processedId}&key=${YOUTUBE_API_KEY}`;
    let response = await fetch(apiUrl);
    let data = await response.json();
    console.log('Direct channel lookup response:', data);

    // If not found, try searching
    if (!data.items?.length) {
      console.log('No direct match, trying channel search...');
      apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${processedId}&key=${YOUTUBE_API_KEY}`;
      response = await fetch(apiUrl);
      data = await response.json();
      console.log('Channel search response:', data);

      if (!data.items?.length) {
        throw new Error('Channel not found. Please check the channel ID or URL.');
      }

      // Get the actual channel ID from search results
      const foundChannelId = data.items[0].id.channelId;
      apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${foundChannelId}&key=${YOUTUBE_API_KEY}`;
      response = await fetch(apiUrl);
      data = await response.json();
      console.log('Found channel details:', data);
    }

    if (!data.items?.[0]) {
      throw new Error('Could not retrieve channel information');
    }

    const channel = data.items[0];
    const channelInfo = {
      channel_id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description || '',
      thumbnail_url: channel.snippet.thumbnails?.default?.url || '',
      default_category: 'other'
    };

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Database configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check for existing channel
    const { data: existingChannel } = await supabase
      .from('youtube_channels')
      .select('channel_id')
      .eq('channel_id', channel.id)
      .single();

    if (existingChannel) {
      throw new Error('This channel has already been added');
    }

    // Insert channel
    const { error: insertError } = await supabase
      .from('youtube_channels')
      .insert([channelInfo]);

    if (insertError) {
      console.error('Database insertion error:', insertError);
      throw new Error('Failed to save channel to database');
    }

    return new Response(
      JSON.stringify(channelInfo),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 400
      }
    );
  }
});
