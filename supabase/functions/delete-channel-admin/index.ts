import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0'
import { corsHeaders } from '../_shared/cors.ts'

// Input validation helpers
const validateChannelId = (channelId: string): boolean => {
  const channelIdRegex = /^UC[a-zA-Z0-9_-]{22}$/;
  return channelIdRegex.test(channelId) && channelId.length <= 50;
}

const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Get environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Create a Supabase client with the service role key
const adminClient = createClient(supabaseUrl, serviceRoleKey);

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    const body = await req.json()
    const { channelId, userId } = body
    
    // Validate inputs
    if (!channelId || typeof channelId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid request' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!validateChannelId(channelId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!userId || !validateUUID(userId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    console.log('Validated delete request for channel')
    
    // Use the admin_delete_channel RPC which does a full hard delete
    const { data, error } = await adminClient
      .rpc('admin_delete_channel', { 
        channel_id_param: channelId, 
        admin_user_id: userId 
      })

    if (error) {
      console.error('Error deleting channel:', error)
      return new Response(
        JSON.stringify({ error: 'Operation failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const result = data as { success: boolean; error?: string };
    
    if (!result?.success) {
      console.error('Channel deletion failed:', result?.error)
      return new Response(
        JSON.stringify({ error: result?.error || 'Operation failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }
    
    console.log('Channel permanently deleted with all related data')
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error in delete-channel-admin function:', error)
    return new Response(
      JSON.stringify({ error: 'Operation failed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})