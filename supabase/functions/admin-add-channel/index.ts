
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
    
    console.log("Admin add channel function - adding channel:", channelData.channel_id);
    
    // Check if channel already exists
    const { data: existingChannel, error: checkError } = await supabase
      .from('youtube_channels')
      .select('channel_id')
      .eq('channel_id', channelData.channel_id)
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
        channel_id: channelData.channel_id,
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
