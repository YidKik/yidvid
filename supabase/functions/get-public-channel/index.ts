
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Create supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, serviceRoleKey);

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

    console.log("Edge function searching for channel:", channelId);
    
    // Try exact match first
    let { data: channelData, error: exactError } = await supabase
      .from('youtube_channels')
      .select('*')
      .eq('channel_id', channelId)
      .maybeSingle();
    
    if (!exactError && channelData) {
      console.log("Found channel with exact match");
      return new Response(
        JSON.stringify({ channel: channelData, status: 'success' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // Try flexible search with LIKE
    const { data: likeResults, error: likeError } = await supabase
      .from('youtube_channels')
      .select('*')
      .ilike('channel_id', `%${channelId}%`)
      .limit(1);
      
    if (!likeError && likeResults && likeResults.length > 0) {
      console.log("Found channel with LIKE search");
      return new Response(
        JSON.stringify({ channel: likeResults[0], status: 'success' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // Try by title match as last resort
    const { data: titleResults, error: titleError } = await supabase
      .from('youtube_channels')
      .select('*')
      .ilike('title', `%${channelId}%`)
      .limit(1);
      
    if (!titleError && titleResults && titleResults.length > 0) {
      console.log("Found channel by title match");
      return new Response(
        JSON.stringify({ channel: titleResults[0], status: 'success' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    console.log("No channel found for ID:", channelId);
    
    return new Response(
      JSON.stringify({ error: 'Channel not found', status: 'not_found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    );

  } catch (error) {
    console.error("Edge function error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message, status: 'error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
