
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse query parameters if any
    const url = new URL(req.url);
    const searchQuery = url.searchParams.get('search') || '';
    
    console.log("Edge function called to fetch channels", searchQuery ? `with search: ${searchQuery}` : "");
    
    // Create base query
    let query = supabase
      .from('youtube_channels')
      .select('id, channel_id, title, thumbnail_url, description')
      .is('deleted_at', null)
      .order('title');
    
    // Add search filter if provided
    if (searchQuery) {
      query = query.ilike('title', `%${searchQuery}%`);
    }
    
    // Fetch channel data with service role key to bypass RLS
    const { data, error } = await query.limit(100);
    
    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    console.log(`Successfully fetched ${data?.length || 0} channels`);
    
    return new Response(
      JSON.stringify({
        success: true,
        data
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in get-public-channels:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
