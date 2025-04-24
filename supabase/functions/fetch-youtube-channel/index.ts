
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

interface YouTubeApiResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      customUrl?: string;
      publishedAt: string;
      thumbnails: {
        default: {
          url: string;
          width: number;
          height: number;
        };
      };
    };
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { channelId } = await req.json();
    console.log('Received request for channel:', channelId);

    if (!channelId) {
      return new Response(
        JSON.stringify({ error: 'Channel ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      console.error('YouTube API key not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'YouTube API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Extract channel ID from URL or handle
    const extractedId = extractChannelIdentifier(channelId);
    console.log('Extracted channel identifier:', extractedId);

    // Connect to Supabase with service role
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase credentials not found');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if channel already exists
    const { data: existingChannel, error: checkError } = await supabaseClient
      .from('youtube_channels')
      .select('channel_id')
      .eq('channel_id', extractedId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking if channel exists:', checkError);
      return new Response(
        JSON.stringify({ error: 'Error checking if channel exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (existingChannel) {
      return new Response(
        JSON.stringify({ error: 'This channel has already been added' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Try to get channel by ID or handle using a server-side API call
    console.log('Making YouTube API request via server-side fetch...');
    
    let apiUrl = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&key=${YOUTUBE_API_KEY}`;
    if (extractedId.startsWith('@')) {
      apiUrl += `&forHandle=${extractedId.substring(1)}`;
    } else {
      apiUrl += `&id=${extractedId}`;
    }

    // IMPORTANT FIX: Use proper headers for the YouTube API to avoid referrer restrictions
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Supabase Edge Function',
        'Referer': 'https://yidvid.com',  // Set a valid referer to avoid referrer blocks
        'Origin': 'https://yidvid.com'    // Set a valid origin to avoid restrictions
      }
    };

    try {
      const response = await fetch(apiUrl, options);
      
      // Before parsing JSON, handle fetch error cases
      if (!response.ok) {
        console.error('YouTube API fetch error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        
        // Handle specific error cases
        if (response.status === 403) {
          return new Response(
            JSON.stringify({ error: 'YouTube API access forbidden. This may be due to API key restrictions.' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
          );
        }
        
        if (response.status === 404) {
          return new Response(
            JSON.stringify({ error: 'Channel not found. Check if the ID or handle is correct.' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
          );
        }
        
        // Generic error response
        return new Response(
          JSON.stringify({ 
            error: `YouTube API error: ${response.status} ${response.statusText}`,
            details: errorText
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
        );
      }
      
      const data: YouTubeApiResponse = await response.json();
      
      if (!data.items || data.items.length === 0) {
        console.error('No channel found:', data);
        return new Response(
          JSON.stringify({ error: 'Channel not found. Check if the ID or handle is correct.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      const channel = data.items[0];
      console.log('Channel data received:', channel);

      // Insert the new channel
      const { data: insertedChannel, error: insertError } = await supabaseClient
        .from('youtube_channels')
        .insert({
          channel_id: channel.id,
          title: channel.snippet.title,
          description: channel.snippet.description || '',
          thumbnail_url: channel.snippet.thumbnails.default.url,
          default_category: 'other' // Set default category
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting channel:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to add channel to database' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // After successful channel insertion, log success
      console.log('Channel added successfully:', insertedChannel);
      
      // Return the channel data
      return new Response(
        JSON.stringify(insertedChannel),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );

    } catch (fetchError) {
      console.error('Error fetching from YouTube API:', fetchError);
      return new Response(
        JSON.stringify({ error: `Failed to fetch channel data: ${fetchError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in fetch-youtube-channel:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});

function extractChannelIdentifier(input: string): string {
  let channelId = input.trim();
  
  // Handle full URLs
  if (channelId.includes('youtube.com/')) {
    // Handle various URL formats
    const urlPatterns = [
      /youtube\.com\/(?:channel|c)\/([^/?&]+)/,  // Standard channel URLs
      /youtube\.com\/(@[\w-]+)/,                 // Handle URLs
      /youtube\.com\/user\/([^/?&]+)/            // Legacy username URLs
    ];

    for (const pattern of urlPatterns) {
      const match = channelId.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
  }

  // Handle direct channel IDs or handles
  if (channelId.startsWith('UC') || channelId.startsWith('@')) {
    return channelId;
  }

  // If no patterns match, return the input as-is
  return channelId;
}
