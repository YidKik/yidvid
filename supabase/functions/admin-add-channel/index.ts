
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

// Create Supabase client with service role key to bypass RLS
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

interface ChannelData {
  channel_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  default_category?: string;
}

// YouTube API functions for channel ID resolution
async function resolveCustomUrlToChannelId(customUrl: string): Promise<string | null> {
  try {
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      console.error("YouTube API key not configured");
      return null;
    }

    // Handle @ format - need to use forHandle parameter
    if (customUrl.startsWith('@')) {
      const handle = customUrl.substring(1); // Remove @ symbol
      const url = `https://youtube.googleapis.com/youtube/v3/channels?part=id&forHandle=${handle}&key=${YOUTUBE_API_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`YouTube API error: ${response.status} - ${response.statusText}`);
        return null;
      }
      
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        return data.items[0].id;
      }
      return null;
    }

    // Handle username or custom URL format
    const url = `https://youtube.googleapis.com/youtube/v3/channels?part=id&forUsername=${customUrl}&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`YouTube API error: ${response.status} - ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return data.items[0].id;
    }
    return null;

  } catch (error) {
    console.error("Error resolving custom URL:", error);
    return null;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get channel data from request
    const channelData: ChannelData = await req.json();
    
    if (!channelData.channel_id || !channelData.title) {
      return new Response(
        JSON.stringify({ error: 'Channel ID and title are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log("Admin add channel function - processing channel:", channelData.channel_id);
    
    // Determine if we need to resolve a custom URL to a channel ID
    let finalChannelId = channelData.channel_id;
    
    // If it doesn't match the UC format and has a @ or other format, try to resolve it
    if (!finalChannelId.match(/^UC[\w-]{22}$/i)) {
      if (finalChannelId.startsWith('@') || 
          finalChannelId.includes('/c/') || 
          finalChannelId.includes('/user/')) {
        
        console.log("Attempting to resolve custom URL to channel ID:", finalChannelId);
        const resolvedId = await resolveCustomUrlToChannelId(finalChannelId);
        
        if (resolvedId) {
          console.log("Resolved custom URL to channel ID:", resolvedId);
          finalChannelId = resolvedId;
        } else {
          console.log("Could not resolve to UC format, using as-is:", finalChannelId);
          // We'll continue with the original ID if we can't resolve it
        }
      }
    }
    
    console.log("Using channel ID for database:", finalChannelId);
    
    // Check if channel already exists
    const { data: existingChannel, error: checkError } = await supabase
      .from('youtube_channels')
      .select('channel_id')
      .eq('channel_id', finalChannelId)
      .is('deleted_at', null)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error("Error checking if channel exists:", checkError);
      return new Response(
        JSON.stringify({ error: `Database error: ${checkError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (existingChannel) {
      return new Response(
        JSON.stringify({ error: 'This channel has already been added' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Insert the new channel using service role client (bypasses RLS)
    const { data: insertedChannel, error: insertError } = await supabase
      .from('youtube_channels')
      .insert({
        channel_id: finalChannelId,
        title: channelData.title,
        description: channelData.description || '',
        thumbnail_url: channelData.thumbnail_url || 'https://placehold.co/100x100?text=YT',
        default_category: channelData.default_category || 'other'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting channel:', insertError);
      return new Response(
        JSON.stringify({ error: `Failed to add channel: ${insertError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Channel added successfully:', insertedChannel);
    
    return new Response(
      JSON.stringify(insertedChannel),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in admin-add-channel:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
