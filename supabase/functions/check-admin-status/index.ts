
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0';
import { corsHeaders } from '../_shared/cors.ts';

// Get environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// This is a service function, so we can bypass RLS with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the userId from the request body
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Checking admin status for user:', userId);
    
    // Query the profiles table directly with service role to bypass RLS
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('Error querying admin status:', error);
      throw error;
    }
    
    const isAdmin = !!data?.is_admin;
    console.log('Admin check result:', isAdmin);
    
    return new Response(
      JSON.stringify({ isAdmin }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in check-admin-status:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
