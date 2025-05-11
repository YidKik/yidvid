
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Get search query
    const url = new URL(req.url);
    const searchQuery = url.searchParams.get('q') || '';
    
    if (!searchQuery || searchQuery.trim().length < 2) {
      return new Response(
        JSON.stringify({ 
          data: { videos: [], channels: [] }, 
          message: "Search query too short" 
        }),
        { headers: corsHeaders, status: 200 }
      );
    }

    // Initialize Supabase client with service role for better performance
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? 'https://euincktvsiuztsxcuqfd.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Will use service role if available
    );
    
    // Run queries in parallel for better performance
    const [videosResult, channelsResult] = await Promise.all([
      // Videos query
      supabaseClient
        .from('youtube_videos')
        .select('id, title, thumbnail, channel_name')
        .filter('deleted_at', 'is', null)
        .or(`title.ilike.%${searchQuery}%,channel_name.ilike.%${searchQuery}%`)
        .order('uploaded_at', { ascending: false })
        .limit(5),
        
      // Channels query  
      supabaseClient
        .from('youtube_channels')
        .select('channel_id, title, thumbnail_url')
        .filter('deleted_at', 'is', null)
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(3)
    ]);

    // Check for errors
    if (videosResult.error) {
      console.error("Videos search error:", videosResult.error);
    }
    
    if (channelsResult.error) {
      console.error("Channels search error:", channelsResult.error);
    }

    // Return combined results
    return new Response(
      JSON.stringify({
        data: {
          videos: videosResult.error ? [] : (videosResult.data || []),
          channels: channelsResult.error ? [] : (channelsResult.data || [])
        },
        status: 'success'
      }),
      { headers: corsHeaders, status: 200 }
    );
  } catch (err) {
    console.error("Search edge function error:", err);
    return new Response(
      JSON.stringify({ error: 'Unexpected error occurred', details: err.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
