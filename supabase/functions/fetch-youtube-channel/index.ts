
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function validateYouTubeApiKey(apiKey: string) {
  try {
    // Make a minimal API call to test the key
    const testUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=UC_x5XG1OV2P6uZZ5FSM9Ttw&key=${apiKey}`;
    const response = await fetch(testUrl);
    const data = await response.json();
    
    if (data.error?.code === 403) {
      console.error('API Key error:', data.error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('API Key validation error:', error);
    return false;
  }
}

const extractYouTubeId = (input: string): string => {
  console.log('Extracting ID from input:', input);
  
  // Handle channel URLs with /channel/
  if (input.includes('youtube.com/channel/')) {
    const match = input.match(/youtube\.com\/channel\/([\w-]+)/);
    if (match && match[1]) {
      console.log('Extracted channel ID:', match[1]);
      return match[1];
    }
  }
  
  // Handle channel URLs with /@
  if (input.includes('youtube.com/@')) {
    const match = input.match(/youtube\.com\/@([\w-]+)/);
    if (match && match[1]) {
      console.log('Extracted username:', match[1]);
      return match[1];
    }
  }
  
  // Handle @username format
  if (input.startsWith('@')) {
    const username = input.substring(1);
    console.log('Extracted username from @:', username);
    return username;
  }
  
  // Handle custom channel URLs
  if (input.includes('youtube.com/c/')) {
    const match = input.match(/youtube\.com\/c\/([\w-]+)/);
    if (match && match[1]) {
      console.log('Extracted custom URL:', match[1]);
      return match[1];
    }
  }
  
  console.log('Using raw input as ID:', input);
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

    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API key not configured');
    }

    // Validate API key first
    console.log('Validating YouTube API key...');
    const isValidKey = await validateYouTubeApiKey(YOUTUBE_API_KEY);
    if (!isValidKey) {
      throw new Error('Invalid or restricted YouTube API key. Please check API key configuration.');
    }

    const processedId = extractYouTubeId(channelId);
    console.log('Processed channel ID:', processedId);

    // First try direct channel lookup
    console.log('Attempting direct channel lookup...');
    let apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${processedId}&key=${YOUTUBE_API_KEY}`;
    let response = await fetch(apiUrl);
    let data = await response.json();
    
    if (data.error) {
      console.error('YouTube API error:', data.error);
      throw new Error(`YouTube API error: ${data.error.message}`);
    }
    
    console.log('Direct lookup response:', data);

    // If not found by ID, try searching by username
    if (!data.items?.length) {
      console.log('No direct match found, trying search...');
      apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${processedId}&key=${YOUTUBE_API_KEY}`;
      response = await fetch(apiUrl);
      data = await response.json();
      
      if (data.error) {
        console.error('Search API error:', data.error);
        throw new Error(`YouTube search API error: ${data.error.message}`);
      }
      
      console.log('Search response:', data);

      if (!data.items?.length) {
        throw new Error('Channel not found. Please verify the channel ID or URL.');
      }

      // Get full channel details using the found channel ID
      const foundChannelId = data.items[0].id.channelId;
      console.log('Found channel ID:', foundChannelId);
      
      apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${foundChannelId}&key=${YOUTUBE_API_KEY}`;
      response = await fetch(apiUrl);
      data = await response.json();
      
      if (data.error) {
        console.error('Channel details API error:', data.error);
        throw new Error(`YouTube API error: ${data.error.message}`);
      }
      
      console.log('Channel details:', data);
    }

    if (!data.items?.[0]) {
      throw new Error('Could not retrieve channel information');
    }

    const channel = data.items[0];
    console.log('Successfully found channel:', channel.snippet.title);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Database configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Prepare channel data
    const channelInfo = {
      channel_id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description || '',
      thumbnail_url: channel.snippet.thumbnails?.default?.url || '',
      default_category: 'other'
    };

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

    console.log('Successfully added channel to database:', channelInfo.title);

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
