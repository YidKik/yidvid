
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
    // Get video_id from URL parameters
    const url = new URL(req.url);
    const videoId = url.searchParams.get('video_id');
    
    console.log("Edge function called to fetch video:", videoId);

    let queryResponse;
    
    if (videoId) {
      // First try direct match with video_id or UUID
      queryResponse = await supabase
        .from('youtube_videos')
        .select('*, youtube_channels(thumbnail_url)')
        .or(`video_id.eq.${videoId},id.eq.${videoId}`)
        .maybeSingle();
        
      if (queryResponse.error || !queryResponse.data) {
        console.log("Direct match failed, trying flexible search");
        
        // Try a more flexible search
        queryResponse = await supabase
          .from('youtube_videos')
          .select('*, youtube_channels(thumbnail_url)')
          .ilike('video_id', `%${videoId}%`)
          .limit(1);
          
        // If that fails, try matching against title
        if (queryResponse.error || !queryResponse.data || !queryResponse.data.length) {
          console.log("Flexible ID search failed, trying title search");
          
          queryResponse = await supabase
            .from('youtube_videos')
            .select('*, youtube_channels(thumbnail_url)')
            .ilike('title', `%${videoId.replace(/[^a-zA-Z0-9]/g, '%')}%`)
            .limit(1);
        }
      }
      
      // Return the found video or empty response
      let foundVideo = null;
      
      if (!queryResponse.error) {
        foundVideo = Array.isArray(queryResponse.data) 
          ? (queryResponse.data.length > 0 ? queryResponse.data[0] : null) 
          : queryResponse.data;
      }
      
      console.log("Edge function response:", foundVideo ? "Video found" : "No video found");
      
      return new Response(
        JSON.stringify({
          video: foundVideo,
          status: 'success',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      // Fetch videos without RLS restrictions
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, created_at, category, description')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      // Return the videos
      return new Response(
        JSON.stringify({
          data,
          status: 'success',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        status: 'error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
