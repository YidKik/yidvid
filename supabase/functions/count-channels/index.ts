
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
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? 'https://euincktvsiuztsxcuqfd.supabase.co',
      Deno.env.get('SUPABASE_ANON_KEY') ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg'
    );

    // Service role key to bypass RLS (only in edge function, never in client)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? 'https://euincktvsiuztsxcuqfd.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Try first with supabaseClient (uses RLS)
    try {
      const { count, error } = await supabaseClient
        .from('youtube_channels')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      if (!error && count !== null) {
        return new Response(
          JSON.stringify({ count, success: true }),
          { headers: corsHeaders, status: 200 }
        );
      }
    } catch (clientError) {
      console.error("Client query error:", clientError);
      // Continue to admin query if client query fails
    }

    // If client query fails, try with admin privileges
    const { count, error } = await supabaseAdmin
      .from('youtube_channels')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ count, success: true }),
      { headers: corsHeaders, status: 200 }
    );

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: 'Failed to count channels', details: err.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
