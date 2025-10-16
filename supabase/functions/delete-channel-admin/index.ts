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
    
    // Check if user is admin using secure function
    const { data: isAdmin, error: adminCheckError } = await adminClient
      .rpc('has_role', { _user_id: userId, _role: 'admin' })

    if (adminCheckError || !isAdmin) {
      console.error('Admin check failed')
      return new Response(
        JSON.stringify({ error: 'Operation failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }
    
    // First mark videos as deleted to avoid potential FK constraints
    const { error: videoError } = await adminClient
      .from('youtube_videos')
      .update({ deleted_at: new Date().toISOString() })
      .eq('channel_id', channelId)
    
    if (videoError && !videoError.message.includes('No rows')) {
      console.error('Error soft deleting videos:', videoError)
      return new Response(
        JSON.stringify({ error: 'Operation failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Then mark the channel as deleted
    const { error: channelError } = await adminClient
      .from('youtube_channels')
      .update({ deleted_at: new Date().toISOString() })
      .eq('channel_id', channelId)
    
    if (channelError) {
      console.error('Error soft deleting channel:', channelError)
      return new Response(
        JSON.stringify({ error: 'Operation failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    console.log('Channel successfully marked as deleted')
    
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
