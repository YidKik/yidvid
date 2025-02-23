
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

  try {
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      throw new Error('Missing YouTube API key');
    }

    const { channelId } = await req.json();
    if (!channelId) {
      throw new Error('Channel ID is required');
    }

    // Clean and validate the channel ID/URL
    let cleanId = channelId.trim();
    
    // Handle URLs
    if (cleanId.includes('youtube.com') || cleanId.includes('youtu.be')) {
      try {
        const url = new URL(cleanId);
        if (url.pathname.includes('/channel/')) {
          cleanId = url.pathname.split('/channel/')[1].split('/')[0];
        } else if (url.pathname.includes('/@')) {
          cleanId = url.pathname.split('/@')[1].split('/')[0];
        } else if (url.pathname.includes('/c/')) {
          cleanId = url.pathname.split('/c/')[1].split('/')[0];
        }
      } catch (e) {
        console.error('Error parsing URL:', e);
      }
    }
    
    // Remove @ symbol if present
    cleanId = cleanId.replace(/^@/, '');

    const apiUrl = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&id=${cleanId}&key=${YOUTUBE_API_KEY}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch channel data');
    }

    if (!data.items?.length) {
      // Try searching by username/handle
      const searchUrl = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(cleanId)}&type=channel&key=${YOUTUBE_API_KEY}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      if (!searchResponse.ok) {
        throw new Error(searchData.error?.message || 'Failed to search for channel');
      }

      if (!searchData.items?.length) {
        throw new Error('Channel not found');
      }

      // Get channel details using the found channel ID
      const foundChannelId = searchData.items[0].id.channelId;
      const channelResponse = await fetch(
        `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&id=${foundChannelId}&key=${YOUTUBE_API_KEY}`
      );
      const channelData = await channelResponse.json();

      if (!channelResponse.ok || !channelData.items?.length) {
        throw new Error('Could not fetch channel details');
      }

      data.items = channelData.items;
    }

    const channel = data.items[0];
    const channelInfo = {
      channelId: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description || '',
      thumbnailUrl: channel.snippet.thumbnails?.default?.url || '',
      default_category: 'other'
    };

    // Store in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing database configuration');
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
      throw new Error('Failed to save channel');
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
    console.error('Edge function error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred'
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
