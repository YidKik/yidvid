
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
    // Get parameters from different sources (URL or body)
    let videoId: string | null = null;
    let channelId: string | null = null;
    
    // Check if it's a GET request with query params
    if (req.method === 'GET') {
      const url = new URL(req.url);
      videoId = url.searchParams.get('video_id');
      channelId = url.searchParams.get('channel_id');
    } 
    // Otherwise try to get params from JSON body
    else {
      try {
        const body = await req.json();
        videoId = body.videoId || body.video_id;
        channelId = body.channelId || body.channel_id;
      } catch (jsonError) {
        console.error("Failed to parse JSON body:", jsonError);
      }
    }
    
    console.log("Edge function called to fetch video:", videoId, "or channel videos:", channelId);

    let queryResponse;
    
    // If channel_id is provided, fetch videos for that channel
    if (channelId) {
      console.log("Fetching videos for channel:", channelId);
      
      // Try multiple ways to find the channel videos for better reliability
      
      // First, try exact channel_id match with updated_at sorting
      const { data: exactData, error: exactError } = await supabase
        .from('youtube_videos')
        .select('*, youtube_channels(thumbnail_url)')
        .eq('channel_id', channelId)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(150);
      
      if (!exactError && exactData && exactData.length > 0) {
        console.log(`Found ${exactData.length} videos with exact channel_id match, sorted by updated_at`);
        return new Response(
          JSON.stringify({
            data: exactData,
            status: 'success',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
      
      // If exact match fails, try prefix/suffix matching
      console.log("Exact match failed, trying flexible search");
      const { data: flexData, error: flexError } = await supabase
        .from('youtube_videos')
        .select('*, youtube_channels(thumbnail_url)')
        .or(`channel_id.ilike.%${channelId}%,channel_id.ilike.${channelId}%,channel_id.ilike.%${channelId}`)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(150);
      
      if (!flexError && flexData && flexData.length > 0) {
        console.log(`Found ${flexData.length} videos with flexible channel_id search, sorted by updated_at`);
        return new Response(
          JSON.stringify({
            data: flexData,
            status: 'success',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
      
      // As a last resort, try matching by channel name or segments of channel ID
      console.log("Flexible search failed too, trying name/title search");
      const { data: nameData, error: nameError } = await supabase
        .from('youtube_videos')
        .select('*, youtube_channels(thumbnail_url)')
        .or(`channel_name.ilike.%${channelId}%,title.ilike.%${channelId}%`)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(150);
      
      if (!nameError && nameData && nameData.length > 0) {
        console.log(`Found ${nameData.length} videos by channel name/title search, sorted by updated_at`);
        return new Response(
          JSON.stringify({
            data: nameData,
            status: 'success',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
      
      console.log("No videos found for channel after multiple attempts");
      return new Response(
        JSON.stringify({
          data: [],
          message: "No videos found for this channel",
          status: 'success',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
    // Handle video_id case
    else if (videoId) {
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
      // Fetch videos without RLS restrictions - ensure updated_at sorting
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, created_at, updated_at, category, description')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(150);

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
