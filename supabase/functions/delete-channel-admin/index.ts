
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0'
import { corsHeaders } from '../_shared/cors.ts'

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
    const { channelId, userId } = await req.json()
    
    if (!channelId) {
      return new Response(
        JSON.stringify({ error: 'Channel ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    console.log(`Delete channel request received for channel: ${channelId} from user: ${userId}`)
    
    // Check if the user is an admin
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .maybeSingle()
    
    if (profileError) {
      console.error('Error checking admin status:', profileError)
      throw new Error('Failed to verify admin permissions')
    }
    
    if (!profile?.is_admin) {
      console.error('Non-admin user attempted to delete channel:', userId)
      return new Response(
        JSON.stringify({ error: 'Only admin users can delete channels' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }
    
    // First mark videos as deleted to avoid potential FK constraints
    const { error: videoError } = await adminClient
      .from('youtube_videos')
      .update({ deleted_at: new Date().toISOString() })
      .eq('channel_id', channelId)
    
    if (videoError && !videoError.message.includes('No rows')) {
      console.warn('Warning updating videos:', videoError)
    }
    
    // Then mark the channel as deleted
    const { error: channelError } = await adminClient
      .from('youtube_channels')
      .update({ deleted_at: new Date().toISOString() })
      .eq('channel_id', channelId)
    
    if (channelError) {
      console.error('Error deleting channel:', channelError)
      throw new Error(`Error deleting channel: ${channelError.message}`)
    }
    
    console.log(`Successfully marked channel ${channelId} as deleted`)
    
    return new Response(
      JSON.stringify({ success: true, message: 'Channel deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error in delete-channel-admin function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'An unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
