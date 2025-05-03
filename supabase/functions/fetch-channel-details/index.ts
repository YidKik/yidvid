
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0';
import { corsHeaders } from '../_shared/cors.ts';

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY') || '';
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Create supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, serviceRoleKey);

// List of referer domains to try
const refererDomains = [
  'https://yidvid.com',
  'https://lovable.dev',
  'https://app.yidvid.com',
  'https://youtube-viewer.com',
  'https://videohub.app'
];

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { channelId } = await req.json();

    if (!channelId) {
      return new Response(
        JSON.stringify({ error: 'channelId is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!YOUTUBE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'YouTube API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    console.log("Fetching channel details from YouTube API for:", channelId);
    
    // Format query based on channelId format
    let apiUrl = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&key=${YOUTUBE_API_KEY}`;
    if (channelId.startsWith('@')) {
      apiUrl += `&forHandle=${channelId.substring(1)}`;
    } else {
      apiUrl += `&id=${channelId}`;
    }
    
    let response = null;
    let lastError = null;
    
    // Try each referer domain until one works
    for (const domain of refererDomains) {
      try {
        console.log(`Trying domain ${domain} for API request`);
        response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) VideoFetchBot/1.0',
            'Referer': domain,
            'Origin': domain,
            'X-Request-Source': 'Supabase Edge Function'
          }
        });
        
        if (response.ok) {
          console.log(`Successfully fetched with domain ${domain}`);
          break; // Exit the loop if successful
        } else {
          const errorText = await response.text();
          console.error(`Error with domain ${domain}:`, response.status, errorText);
          lastError = { status: response.status, text: errorText };
        }
      } catch (fetchError) {
        console.error(`Fetch error with domain ${domain}:`, fetchError);
        lastError = fetchError;
      }
    }
    
    // If all attempts failed
    if (!response || !response.ok) {
      console.error("All API attempts failed. Last error:", lastError);
      return new Response(
        JSON.stringify({ 
          error: `YouTube API error: Unable to fetch channel data`, 
          details: lastError 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Channel not found on YouTube' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    const channelData = data.items[0];
    
    // Format channel data to match our database structure
    const formattedChannel = {
      channel_id: channelData.id,
      title: channelData.snippet.title,
      description: channelData.snippet.description,
      thumbnail_url: channelData.snippet.thumbnails?.default?.url,
    };
    
    // Insert the channel into our database if it doesn't exist
    try {
      const { data: insertedChannel, error: insertError } = await supabase
        .from('youtube_channels')
        .upsert({
          channel_id: formattedChannel.channel_id,
          title: formattedChannel.title,
          description: formattedChannel.description || '',
          thumbnail_url: formattedChannel.thumbnail_url,
        })
        .select()
        .single();
        
      if (insertError) {
        console.error("Error saving channel to database:", insertError);
      } else {
        console.log("Channel saved to database:", insertedChannel);
      }
    } catch (dbError) {
      console.error("Database error:", dbError);
    }
    
    return new Response(
      JSON.stringify({ channel: formattedChannel, status: 'success' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error("Edge function error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message, status: 'error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
