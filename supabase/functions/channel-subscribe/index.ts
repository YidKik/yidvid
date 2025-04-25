
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0'
import { corsHeaders } from '../_shared/cors.ts'

// Get environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Create a Supabase client with the service role key for admin operations
const adminClient = createClient(supabaseUrl, serviceRoleKey);

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    const { channelId, userId, action } = await req.json()
    
    if (!channelId || !userId || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    console.log(`Channel subscription request: ${action} for channel: ${channelId} from user: ${userId}`)
    
    // Verify the user exists
    const { data: userExists, error: userError } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()
      
    if (userError) {
      console.error('Error checking user exists:', userError)
      throw new Error('Failed to verify user')
    }
    
    if (!userExists) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }
    
    // Verify the channel exists
    const { data: channelExists, error: channelError } = await adminClient
      .from('youtube_channels')
      .select('channel_id')
      .eq('channel_id', channelId)
      .is('deleted_at', null)
      .maybeSingle()
      
    if (channelError) {
      console.error('Error checking channel exists:', channelError)
      throw new Error('Failed to verify channel')
    }
    
    if (!channelExists) {
      return new Response(
        JSON.stringify({ error: 'Channel not found or deleted' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }
    
    if (action === 'subscribe') {
      // Check if already subscribed
      const { data: existing, error: checkError } = await adminClient
        .from('channel_subscriptions')
        .select('id')
        .eq('channel_id', channelId)
        .eq('user_id', userId)
        .maybeSingle()
        
      if (checkError) {
        console.error('Error checking existing subscription:', checkError)
        throw new Error('Failed to check subscription status')
      }
      
      // If not already subscribed, create subscription
      if (!existing) {
        const { error: insertError } = await adminClient
          .from('channel_subscriptions')
          .insert({ channel_id: channelId, user_id: userId })
          
        if (insertError) {
          console.error('Error creating subscription:', insertError)
          throw new Error(`Error creating subscription: ${insertError.message}`)
        }
        
        console.log(`Successfully subscribed user ${userId} to channel ${channelId}`)
      } else {
        console.log(`User ${userId} is already subscribed to channel ${channelId}`)
      }
      
      return new Response(
        JSON.stringify({ success: true, isSubscribed: true, message: 'Successfully subscribed to channel' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    } else if (action === 'unsubscribe') {
      const { error: deleteError } = await adminClient
        .from('channel_subscriptions')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', userId)
        
      if (deleteError) {
        console.error('Error deleting subscription:', deleteError)
        throw new Error(`Error unsubscribing from channel: ${deleteError.message}`)
      }
      
      console.log(`Successfully unsubscribed user ${userId} from channel ${channelId}`)
      
      return new Response(
        JSON.stringify({ success: true, isSubscribed: false, message: 'Successfully unsubscribed from channel' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Use "subscribe" or "unsubscribe".' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in channel-subscribe function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'An unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
