
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Supabase client with admin privileges to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch videos
    const { data: videos, error: videosError } = await supabase
      .from("youtube_videos")
      .select("*")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false });

    if (videosError) {
      throw videosError;
    }

    // Fetch channels
    const { data: channels, error: channelsError } = await supabase
      .from("youtube_channels")
      .select("*")
      .order("title", { ascending: true });

    if (channelsError) {
      throw channelsError;
    }

    // Return only videos and channels data
    return new Response(
      JSON.stringify({
        videos: videos || [],
        channels: channels || []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error fetching admin categories data:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
