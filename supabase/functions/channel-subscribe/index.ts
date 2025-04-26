
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
    // Parse the request body
    const { channelId, userId, action } = await req.json();
    
    if (!channelId || !action || !userId) {
      console.error('Missing required parameters:', { channelId, userId, action });
      return new Response(
        JSON.stringify({ error: 'Missing required parameters', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    console.log(`Channel subscription request: ${action} for channel: ${channelId} from user: ${userId}`);
    
    // Verify the channel exists
    const { data: channelExists, error: channelError } = await adminClient
      .from('youtube_channels')
      .select('channel_id')
      .eq('channel_id', channelId)
      .is('deleted_at', null)
      .maybeSingle();
      
    if (channelError) {
      console.error('Error checking channel exists:', channelError);
      throw new Error('Failed to verify channel');
    }
    
    if (!channelExists) {
      console.error('Channel not found:', channelId);
      return new Response(
        JSON.stringify({ error: 'Channel not found or deleted', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }
    
    // Process subscription action
    if (action === 'subscribe') {
      return await handleSubscribe(userId, channelId);
    } else if (action === 'unsubscribe') {
      return await handleUnsubscribe(userId, channelId);
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Use "subscribe" or "unsubscribe".', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in channel-subscribe function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unknown error occurred', success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
});

async function handleSubscribe(userId: string, channelId: string) {
  // First, check if the subscription already exists
  const { data: existingSubscription, error: checkError } = await adminClient
    .from('channel_subscriptions')
    .select('id')
    .eq('channel_id', channelId)
    .eq('user_id', userId)
    .maybeSingle();
    
  if (checkError) {
    console.error('Error checking existing subscription:', checkError);
    throw new Error('Failed to check subscription status');
  }
  
  let result;
  
  if (!existingSubscription) {
    console.log(`Creating new subscription for user ${userId} to channel ${channelId}`);
    
    // Subscription doesn't exist, create it
    const { data, error } = await adminClient
      .from('channel_subscriptions')
      .insert([{ 
        channel_id: channelId, 
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();
      
    if (error) {
      console.error('Error creating subscription:', error);
      throw new Error(`Error creating subscription: ${error.message}`);
    }
    
    result = data?.[0];
    console.log(`Subscription created:`, result);
  } else {
    console.log(`User ${userId} is already subscribed to channel ${channelId}`);
    result = existingSubscription;
  }
  
  // Verify the subscription was actually created
  const { data: verifyData, error: verifyError } = await adminClient
    .from('channel_subscriptions')
    .select('id')
    .eq('channel_id', channelId)
    .eq('user_id', userId)
    .maybeSingle();
    
  if (verifyError) {
    console.error('Error verifying subscription creation:', verifyError);
    throw new Error('Failed to verify subscription creation');
  }
  
  if (!verifyData) {
    console.error('Verification failed - subscription was not created successfully');
    throw new Error('Failed to create subscription - verification failed');
  }
  
  console.log('Verification succeeded - subscription exists in database');
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      isSubscribed: true, 
      message: 'Successfully subscribed to channel',
      data: result,
      verified: true
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  );
}

async function handleUnsubscribe(userId: string, channelId: string) {
  console.log(`Processing unsubscribe request for user ${userId} from channel ${channelId}`);
  
  // Delete the subscription
  const { data, error } = await adminClient
    .from('channel_subscriptions')
    .delete()
    .eq('channel_id', channelId)
    .eq('user_id', userId)
    .select();
    
  if (error) {
    console.error('Error deleting subscription:', error);
    throw new Error(`Error unsubscribing from channel: ${error.message}`);
  }
  
  // Verify the subscription was actually deleted
  const { data: verifyData, error: verifyError } = await adminClient
    .from('channel_subscriptions')
    .select('id')
    .eq('channel_id', channelId)
    .eq('user_id', userId)
    .maybeSingle();
    
  if (verifyError) {
    console.error('Error verifying subscription deletion:', verifyError);
    throw new Error('Failed to verify subscription deletion');
  }
  
  if (verifyData) {
    console.error('Verification failed - subscription still exists after deletion attempt');
    throw new Error('Failed to delete subscription - verification failed');
  }
  
  console.log('Verification succeeded - subscription was properly deleted');
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      isSubscribed: false, 
      message: 'Successfully unsubscribed from channel',
      data: data,
      verified: true
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  );
}
