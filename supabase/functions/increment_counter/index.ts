
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

    // Update the views count for the specified video using raw SQL expression
    const { data, error } = await supabase
      .from('youtube_videos')
      .update({ 
        views: supabase.sql`COALESCE(views, 0) + 1`,
        last_viewed_at: new Date().toISOString() 
      })
      .eq('id', videoId)
      .select('id, views');

    if (error) {
      console.error('Error incrementing view count:', error);
      
      // Try direct update as a fallback
      const { data: directData, error: directError } = await supabase
        .rpc('trigger_youtube_video_fetch')
        .then(() => supabase
          .from('youtube_videos')
          .update({ 
            views: supabase.sql`COALESCE(views, 0) + 1`,
            last_viewed_at: new Date().toISOString() 
          })
          .eq('id', videoId)
          .select('id, views')
        );
        
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
