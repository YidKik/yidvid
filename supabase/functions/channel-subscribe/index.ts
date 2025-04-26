
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
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }
    
    // Create a client using the user's JWT
    const userClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });
    
    // Get the user from the JWT
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting user from token:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }
    
    // Parse the request body
    const { channelId, userId, action } = await req.json()
    
    if (!channelId || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Verify the user ID matches the token
    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'User ID does not match authorization token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }
    
    console.log(`Channel subscription request: ${action} for channel: ${channelId} from user: ${userId}`)
    
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
    
    let result = null;
    
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
        const { data: insertData, error: insertError } = await adminClient
          .from('channel_subscriptions')
          .insert([{ channel_id: channelId, user_id: userId }])
          .select()
          
        if (insertError) {
          console.error('Error creating subscription:', insertError)
          throw new Error(`Error creating subscription: ${insertError.message}`)
        }
        
        result = insertData?.[0] || null;
        console.log(`Successfully subscribed user ${userId} to channel ${channelId}`, result ? 'Data saved' : 'No data returned')
      } else {
        result = existing;
        console.log(`User ${userId} is already subscribed to channel ${channelId}`)
      }
      
      // Double verify the subscription exists as a final check
      const { data: verifyData, error: verifyError } = await adminClient
        .from('channel_subscriptions')
        .select('id')
        .eq('channel_id', channelId)
        .eq('user_id', userId)
        .maybeSingle()
        
      if (verifyError) {
        console.error('Error verifying subscription creation:', verifyError)
        // Continue anyway since we might have succeeded despite the error
      } else if (!verifyData) {
        console.error('Verification failed - subscription was not found after creation attempt')
      } else {
        console.log('Verification succeeded - subscription exists in database')
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          isSubscribed: true, 
          message: 'Successfully subscribed to channel',
          data: result
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    } else if (action === 'unsubscribe') {
      const { data: deleteData, error: deleteError } = await adminClient
        .from('channel_subscriptions')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', userId)
        .select()
        
      if (deleteError) {
        console.error('Error deleting subscription:', deleteError)
        throw new Error(`Error unsubscribing from channel: ${deleteError.message}`)
      }
      
      result = deleteData;
      console.log(`Successfully unsubscribed user ${userId} from channel ${channelId}`, 
                  deleteData && deleteData.length ? 'Rows deleted' : 'No rows deleted')
      
      // Verify the subscription is gone
      const { data: verifyData, error: verifyError } = await adminClient
        .from('channel_subscriptions')
        .select('id')
        .eq('channel_id', channelId)
        .eq('user_id', userId)
        .maybeSingle()
        
      if (verifyError) {
        console.error('Error verifying subscription deletion:', verifyError)
        // Continue anyway since we might have succeeded despite the error
      } else if (verifyData) {
        console.error('Verification failed - subscription still exists after deletion attempt')
      } else {
        console.log('Verification succeeded - subscription was properly deleted')
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          isSubscribed: false, 
          message: 'Successfully unsubscribed from channel',
          data: result
        }),
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
