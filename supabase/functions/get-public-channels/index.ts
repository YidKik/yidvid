
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
    // Extract search query if present
    const url = new URL(req.url);
    const searchQuery = url.searchParams.get('search') || '';

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? 'https://euincktvsiuztsxcuqfd.supabase.co',
      Deno.env.get('SUPABASE_ANON_KEY') ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg'
    );

    // Build query - don't limit the number of channels
    let query = supabaseClient
      .from('youtube_channels')
      .select('id, channel_id, title, description, thumbnail_url, created_at, updated_at')
      .is('deleted_at', null)
      .order('title');

    // Add search filter if search query present
    if (searchQuery) {
      query = query.ilike('title', `%${searchQuery}%`);
    }

    // Execute query without limit to retrieve all channels
    const { data, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch channels', details: error.message }),
        { headers: corsHeaders, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ data, success: true, count: data.length }),
      { headers: corsHeaders, status: 200 }
    );

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: 'Unexpected error occurred', details: err.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
