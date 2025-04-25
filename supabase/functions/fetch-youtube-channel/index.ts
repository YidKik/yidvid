
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
    console.log("==== FETCH YOUTUBE CHANNEL FUNCTION STARTED ====");
    
    // Support both GET and POST methods
    let channelId: string;
    let isPreviewFetch = false;
    
    if (req.method === 'GET') {
      const url = new URL(req.url);
      channelId = url.searchParams.get('channelId') || '';
      isPreviewFetch = true;
    } else {
      const requestData = await req.json();
      channelId = requestData.channelId || '';
    }
    
    console.log('Received request for channel:', channelId);

    if (!channelId) {
      console.error("Missing channelId in request");
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

    // If this is not a preview fetch (actual add), check if channel already exists
    if (!isPreviewFetch) {
      try {
        const { data: existingChannel, error: checkError } = await supabaseClient
          .from('youtube_channels')
          .select('channel_id, title, thumbnail_url')
          .eq('channel_id', extractedId)
          .is('deleted_at', null)
          .maybeSingle();

        if (checkError) {
          if (checkError.code !== 'PGRST116') {
            console.error('Error checking if channel exists:', checkError);
            return new Response(
              JSON.stringify({ error: `Database error: ${checkError.message}` }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }
        }

        if (existingChannel) {
          console.log("Channel already exists:", existingChannel);
          return new Response(
            JSON.stringify({ 
              error: 'This channel has already been added', 
              channel: existingChannel 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
      } catch (checkErr) {
        console.error("Error during channel existence check:", checkErr);
        // Continue despite check error
      }
    }

    // First check the quota state to avoid making API calls if we're already over quota
    try {
      const { data: quotaData } = await supabaseClient
        .from("api_quota_tracking")
        .select("quota_remaining, quota_reset_at")
        .eq("api_name", "youtube")
        .maybeSingle();
        
      if (quotaData && quotaData.quota_remaining <= 0) {
        console.error('YouTube API quota already exceeded according to our tracking');
        return new Response(
          JSON.stringify({ 
            error: 'YouTube API quota exceeded. Please try again tomorrow or add the channel manually.',
            quotaResetAt: quotaData.quota_reset_at
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
      }
    } catch (quotaErr) {
      console.warn("Error checking quota, continuing anyway:", quotaErr);
    }

    // Try to get channel by ID or handle using a server-side API call
    console.log('Making YouTube API request via server-side fetch...');
    
    // Build the API URL based on the identifier format
    let apiUrl: string;
    
    if (extractedId.startsWith('UC') && /^UC[\w-]{22}$/i.test(extractedId)) {
      // If it's already a channel ID format (UC...)
      apiUrl = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&id=${extractedId}&key=${YOUTUBE_API_KEY}`;
    } else if (extractedId.startsWith('@')) {
      // If it's a handle (@username)
      apiUrl = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&forHandle=${extractedId.substring(1)}&key=${YOUTUBE_API_KEY}`;
    } else {
      // Try as a username
      apiUrl = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&forUsername=${extractedId}&key=${YOUTUBE_API_KEY}`;
    }

    // IMPORTANT: Use different headers to avoid API key restrictions
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Supabase Edge Function',
        'X-Request-Source': 'Supabase Edge Function'
      }
    };

    console.log("Calling YouTube API with endpoint type:", extractedId.startsWith('UC') ? 'ID' : extractedId.startsWith('@') ? 'handle' : 'username');
    
    try {
      console.log("Attempting YouTube API fetch with improved headers");
      const response = await fetch(apiUrl, options);
      console.log("YouTube API response status:", response.status, response.statusText);
      
      // Before parsing JSON, handle fetch error cases
      if (!response.ok) {
        const errorText = await response.text();
        console.error('YouTube API fetch error status:', response.status, response.statusText);
        console.error('Error response body:', errorText);
        
        // Handle quota exceeded error
        if (errorText.toLowerCase().includes('quota') || response.status === 403) {
          console.error("YouTube quota exceeded detected");
          
          try {
            // Get current date and calculate tomorrow's reset date
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0); // Reset to midnight
            
            // Update our quota tracking
            await supabaseClient
              .from("api_quota_tracking")
              .update({ 
                quota_remaining: 0,
                quota_reset_at: tomorrow.toISOString()
              })
              .eq("api_name", "youtube");
              
            // Get the updated reset time to return to the client
            const { data: updatedQuota } = await supabaseClient
              .from("api_quota_tracking")
              .select("quota_reset_at")
              .eq("api_name", "youtube")
              .single();
              
            return new Response(
              JSON.stringify({ 
                error: 'YouTube API quota exceeded. Please try again tomorrow or add the channel manually.',
                quotaResetAt: updatedQuota?.quota_reset_at
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
            );
          } catch (updateErr) {
            console.error("Failed to update quota tracking:", updateErr);
            return new Response(
              JSON.stringify({ 
                error: 'YouTube API quota exceeded. Please try again tomorrow or add the channel manually.' 
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
            );
          }
        }
        
        // Handle channel not found
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
            details: errorText,
            manualAddRequired: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      const data: YouTubeApiResponse = await response.json();
      console.log("YouTube API response data received");
      
      if (!data.items || data.items.length === 0) {
        console.error('No channel found in API response:', data);
        return new Response(
          JSON.stringify({ error: 'Channel not found. Check if the ID or handle is correct.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      const channel = data.items[0];
      console.log('Channel data received:', channel.snippet.title);

      // For GET request in preview mode, just return the channel data without inserting
      if (isPreviewFetch || req.method === 'GET') {
        return new Response(
          JSON.stringify({
            channel_id: channel.id,
            title: channel.snippet.title,
            description: channel.snippet.description,
            thumbnail_url: channel.snippet.thumbnails.default.url
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      // Insert the new channel for POST request
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

      // After successful channel insertion, log success and update quota usage
      console.log('Channel added successfully:', insertedChannel);
      
      try {
        // Decrement quota by approximate units used (1 for channel fetch)
        await supabaseClient
          .rpc("decrement_quota", { quota_amount: 1 })
          .eq("api_name", "youtube");
      } catch (quotaErr) {
        console.error("Failed to update quota usage:", quotaErr);
        // Non-fatal error, continue
      }
      
      // Return the channel data with a 200 status
      return new Response(
        JSON.stringify(insertedChannel),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );

    } catch (fetchError) {
      console.error('Error fetching from YouTube API:', fetchError);
      return new Response(
        JSON.stringify({ 
          error: `Failed to fetch channel data: ${fetchError.message}`,
          manualAddRequired: true 
        }),
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
    // Handle channel URLs with UC format
    const channelMatch = channelId.match(/youtube\.com\/(?:channel\/)(UC[\w-]+)/i);
    if (channelMatch && channelMatch[1]) {
      return channelMatch[1];
    }
    
    // Handle custom URLs with @ format
    const customUrlMatch = channelId.match(/youtube\.com\/(@[\w-]+)/);
    if (customUrlMatch && customUrlMatch[1]) {
      return customUrlMatch[1];
    }
    
    // Handle c/ format URLs
    const cFormatMatch = channelId.match(/youtube\.com\/c\/([\w-]+)/);
    if (cFormatMatch && cFormatMatch[1]) {
      return cFormatMatch[1];
    }

    // Handle user/ format URLs
    const userFormatMatch = channelId.match(/youtube\.com\/user\/([\w-]+)/);
    if (userFormatMatch && userFormatMatch[1]) {
      return userFormatMatch[1];
    }
  }
  
  // If it's already a UC... format, return as is
  if (/^UC[\w-]{22}$/i.test(channelId)) {
    return channelId;
  }

  // Handle @username format
  if (channelId.startsWith('@')) {
    return channelId; // Return including @ symbol
  }

  // If no patterns match, return the input as-is
  return channelId;
}

