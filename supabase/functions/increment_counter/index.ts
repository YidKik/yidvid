
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

    // First get current view count
    const { data: videoData, error: fetchError } = await supabase
      .from('youtube_videos')
      .select('views')
      .eq('id', videoId)
      .single();
      
    if (fetchError) {
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Calculate new view count and update the video
    const currentViews = videoData?.views || 0;
    const newViews = currentViews + 1;
    const now = new Date().toISOString(); // Convert Date to ISO string for Postgres compatibility
    
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
      console.error('Error incrementing view count:', error);
      
      // Try direct update as a fallback
      const { data: directData, error: directError } = await supabase
        .from('youtube_videos')
        .update({ 
          views: newViews,
          updated_at: now,
          last_viewed_at: now 
        })
        .eq('id', videoId)
        .select('id, views');
        
      if (directError) {
        return new Response(
          JSON.stringify({ error: directError.message }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: directData?.[0] || null,
          message: 'View count incremented successfully (direct update)' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
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
