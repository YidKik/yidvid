
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
    } else if (action === 'check') {
      return await checkSubscription(userId, channelId);
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Use "subscribe", "unsubscribe", or "check".', success: false }),
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

async function checkSubscription(userId: string, channelId: string) {
  try {
    console.log(`Checking subscription for user ${userId} on channel ${channelId}`);
    
    // Check if the subscription exists
    const { data: subscription, error } = await adminClient
      .from('channel_subscriptions')
      .select('id')
      .eq('channel_id', channelId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking subscription status:', error);
      throw new Error('Failed to check subscription status');
    }
    
    const isSubscribed = !!subscription;
    console.log(`Subscription status result: User ${userId} ${isSubscribed ? 'is' : 'is not'} subscribed to channel ${channelId}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        isSubscribed: isSubscribed, 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in checkSubscription:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to check subscription status', success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

async function handleSubscribe(userId: string, channelId: string) {
  try {
    console.log(`Processing subscribe request for user ${userId} to channel ${channelId}`);
    
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
    
    // If subscription exists, return success without trying to create it again
    if (existingSubscription) {
      console.log(`User ${userId} is already subscribed to channel ${channelId}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          isSubscribed: true, 
          message: 'Already subscribed to channel',
          data: existingSubscription,
          verified: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // Subscription doesn't exist, create it
    console.log(`Creating new subscription for user ${userId} to channel ${channelId}`);
    
    const timestamp = new Date().toISOString();
    const { data: newSubscription, error: insertError } = await adminClient
      .from('channel_subscriptions')
      .insert([{ 
        channel_id: channelId, 
        user_id: userId,
        created_at: timestamp,
        updated_at: timestamp
      }])
      .select()
      .single();
      
    if (insertError) {
      console.error('Error creating subscription:', insertError);
      throw new Error(`Error creating subscription: ${insertError.message}`);
    }
    
    if (!newSubscription) {
      throw new Error('Failed to create subscription - no data returned');
    }
    
    console.log(`Subscription created successfully:`, newSubscription);
    
    // Double verify the subscription was actually created
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
        data: newSubscription,
        verified: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in handleSubscribe:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to subscribe', success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

async function handleUnsubscribe(userId: string, channelId: string) {
  try {
    console.log(`Processing unsubscribe request for user ${userId} from channel ${channelId}`);
    
    // Check if subscription exists before attempting to delete
    const { data: existingSubscription, error: checkError } = await adminClient
      .from('channel_subscriptions')
      .select('id')
      .eq('channel_id', channelId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing subscription before unsubscribe:', checkError);
      throw new Error('Failed to check subscription status');
    }

    if (!existingSubscription) {
      console.log(`User ${userId} is not subscribed to channel ${channelId}, nothing to unsubscribe`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          isSubscribed: false, 
          message: 'User was not subscribed to this channel',
          verified: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
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
  } catch (error) {
    console.error('Error in handleUnsubscribe:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to unsubscribe', success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}
