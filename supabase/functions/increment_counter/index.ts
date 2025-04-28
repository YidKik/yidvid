
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Create supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, serviceRoleKey);

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId } = await req.json();
    
    if (!videoId) {
      return new Response(
        JSON.stringify({ error: 'Video ID is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log("Incrementing view for video ID:", videoId);
    
    // Try using direct RPC call first - this avoids the profile recursion issue
    const { data: directData, error: directError } = await supabase.rpc('increment_view_count', {
      video_id: videoId
    });
    
    if (directError) {
      console.error('RPC method failed:', directError);
      
      // Fallback to direct update with service role that bypasses RLS
      const now = new Date().toISOString();
      
      // First get current view count without using user context
      const { data: videoData, error: fetchError } = await supabase
        .from('youtube_videos')
        .select('views')
        .eq('id', videoId)
        .single();
      
      if (fetchError) {
        // If not found by UUID, try to find by video_id (YouTube ID)
        const { data: videoByYoutubeId, error: fetchByYoutubeIdError } = await supabase
          .from('youtube_videos')
          .select('id, views')
          .eq('video_id', videoId)
          .single();
          
        if (fetchByYoutubeIdError || !videoByYoutubeId) {
          console.error("Error finding video:", fetchByYoutubeIdError || "Video not found");
          return new Response(
            JSON.stringify({ error: `Video with ID ${videoId} not found` }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 404
            }
          );
        }
        
        // Use the found ID for the update
        const currentViews = videoByYoutubeId.views || 0;
        const newViews = currentViews + 1;
        
        const { data: updatedData, error: updateError } = await supabase
          .from('youtube_videos')
          .update({ 
            views: newViews,
            updated_at: now,
            last_viewed_at: now
          })
          .eq('id', videoByYoutubeId.id)
          .select('id, views');
          
        if (updateError) {
          console.error('Error updating view count:', updateError);
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500 
            }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: updatedData?.[0] || null,
            message: 'View count incremented successfully (YouTube ID lookup)' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
      
      // Continue with regular update if video was found by UUID
      const currentViews = videoData?.views || 0;
      const newViews = currentViews + 1;
      
      const { data, error } = await supabase
        .from('youtube_videos')
        .update({ 
          views: newViews,
          updated_at: now,
          last_viewed_at: now
        })
        .eq('id', videoId)
        .select('id, views');
        
      if (error) {
        console.error('Error updating view count:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: data?.[0] || null,
          message: 'View count incremented successfully' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }
    
    // If the RPC call succeeded, return success response
    console.log('View count updated through RPC method:', directData);
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { views: directData },
        message: 'View count incremented successfully (RPC method)' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
