
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './utils.ts';
import { getChannelsFromDatabase } from './db-operations.ts';
import { checkQuota, createQuotaExceededResponse } from './quota-manager.ts';
import { processChannel, updateChannelStatus, logChannelUpdate } from './channel-processor.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    if (!youtubeApiKey) {
      throw new Error('Missing YouTube API configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const now = new Date();
    
    // Check quota status
    const quotaData = await checkQuota(supabase);

    // If quota is depleted, return early with reset time
    if (quotaData.quota_remaining <= 0) {
      console.log('Quota exceeded. Current quota:', quotaData.quota_remaining);
      console.log('Reset scheduled for:', quotaData.quota_reset_at);
      return new Response(
        JSON.stringify({
          success: false,
          message: `Daily quota exceeded. Service will resume at ${new Date(quotaData.quota_reset_at).toUTCString()}`,
          quota_reset_at: quotaData.quota_reset_at
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 // Changed from 429 to 200 to prevent error state
        }
      );
    }

    // Parse request body if present
    let channelsToProcess = [];
    if (req.body) {
      const body = await req.json().catch(() => ({}));
      channelsToProcess = body.channels || [];
    }

    // If no specific channels provided, get all active channels
    if (channelsToProcess.length === 0) {
      channelsToProcess = await getChannelsFromDatabase(supabase);
    }

    if (channelsToProcess.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'No channels to process' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    console.log(`Processing ${channelsToProcess.length} channels`);
    const processedVideos = [];
    const errors = [];

    // Process each channel
    for (const channelId of channelsToProcess) {
      try {
        console.log(`Fetching videos for channel: ${channelId}`);
        
        // Check current quota before processing channel
        const currentQuota = await checkQuota(supabase);
        if (currentQuota.quota_remaining <= 0) {
          return new Response(
            JSON.stringify({
              success: false,
              message: `Daily quota exceeded. Service will resume at ${new Date(currentQuota.quota_reset_at).toUTCString()}`,
              processed: processedVideos.length,
              errors,
              quota_reset_at: currentQuota.quota_reset_at
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200 // Changed from 429 to 200
            }
          );
        }

        const result = await processChannel(supabase, channelId, youtubeApiKey, currentQuota, now);
        
        if (result.quotaExceeded) {
          return new Response(
            JSON.stringify({
              success: false,
              message: `Daily quota exceeded. Service will resume at ${new Date(quotaData.quota_reset_at).toUTCString()}`,
              processed: processedVideos.length,
              errors,
              quota_reset_at: quotaData.quota_reset_at
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200 // Changed from 429 to 200
            }
          );
        }
        
        if (result.videos) {
          processedVideos.push(...result.videos);
        }

      } catch (error) {
        console.error(`Error processing channel ${channelId}:`, error);
        errors.push({ channelId, error: error.message });
        
        // Log error and update channel status
        await logChannelUpdate(supabase, channelId, 0, error.message);
        await updateChannelStatus(supabase, channelId, now, error.message);
      }

      // Add delay between processing channels
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Channel processing complete',
        processed: processedVideos.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'An error occurred while processing the request'
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
