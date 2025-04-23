
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
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get video_id from URL parameters
    const url = new URL(req.url);
    const videoId = url.searchParams.get('video_id');

    let queryResponse;
    
    if (videoId) {
      // Try to find specific video
      queryResponse = await supabase
        .from('youtube_videos')
        .select('*, youtube_channels(thumbnail_url)')
        .or(`video_id.eq.${videoId},id.eq.${videoId}`)
        .maybeSingle();
        
      if (queryResponse.error) {
        // Try a more flexible search
        queryResponse = await supabase
          .from('youtube_videos')
          .select('*, youtube_channels(thumbnail_url)')
          .or(`video_id.ilike.%${videoId}%,id.ilike.%${videoId}%`)
          .limit(1);
      }
      
      // Return the found video or list of videos
      return new Response(
        JSON.stringify({
          video: queryResponse.data && !queryResponse.error ? 
            (Array.isArray(queryResponse.data) ? queryResponse.data[0] : queryResponse.data) : 
            null,
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
        .select('id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, category, description')
        .is('deleted_at', null)
        .order('uploaded_at', { ascending: false })
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
