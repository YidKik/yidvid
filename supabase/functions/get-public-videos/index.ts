
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
