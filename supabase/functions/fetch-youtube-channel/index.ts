
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type YouTubeResponse = {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        default?: { url: string };
      };
    };
  }>;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    const { channelId } = await req.json();

    if (!YOUTUBE_API_KEY) {
      throw new Error('Missing YouTube API key configuration');
    }

    if (!channelId) {
      throw new Error('Channel ID is required');
    }

    // Clean the channel ID
    const cleanId = channelId.trim()
      .replace(/^@/, '')  // Remove @ symbol
      .replace(/^(https?:\/\/)?(www\.)?youtube\.com\/(channel\/|c\/|@)?/, '')  // Remove URL parts
      .replace(/\/?$/, '');  // Remove trailing slash

    // First attempt: Direct channel lookup
    console.log('Attempting direct channel lookup for:', cleanId);
    const directUrl = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&id=${cleanId}&key=${YOUTUBE_API_KEY}`;
    let response = await fetch(directUrl, {
      headers: {
        'Accept': 'application/json',
        'Referer': 'https://lovable.dev'
      }
    });

    let data: YouTubeResponse = await response.json();

    // If direct lookup fails, try search
    if (!data.items?.length) {
      console.log('Direct lookup failed, trying search for:', cleanId);
      const searchUrl = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(cleanId)}&type=channel&key=${YOUTUBE_API_KEY}`;
      response = await fetch(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'Referer': 'https://lovable.dev'
        }
      });

      const searchData: YouTubeResponse = await response.json();

      if (!searchData.items?.length) {
        throw new Error('Channel not found');
      }

      // Get full channel details
      const foundId = searchData.items[0].id;
      response = await fetch(
        `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&id=${foundId}&key=${YOUTUBE_API_KEY}`,
        {
          headers: {
            'Accept': 'application/json',
            'Referer': 'https://lovable.dev'
          }
        }
      );
      data = await response.json();
    }

    if (!data.items?.length) {
      throw new Error('Could not retrieve channel details');
    }

    const channel = data.items[0];
    const channelData = {
      channelId: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description || '',
      thumbnailUrl: channel.snippet.thumbnails?.default?.url || '',
      default_category: 'other'
    };

    console.log('Successfully retrieved channel:', channelData);

    // Add channel directly to database from here to ensure atomic operation
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: insertError } = await supabase
      .from('youtube_channels')
      .insert([channelData]);

    if (insertError) {
      if (insertError.code === '23505') {
        throw new Error('This channel has already been added');
      }
      throw new Error('Failed to add channel to database');
    }

    return new Response(
      JSON.stringify(channelData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in fetch-youtube-channel:', error);
    
    const message = error.message || 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.status || 400
      }
    );
  }
});
