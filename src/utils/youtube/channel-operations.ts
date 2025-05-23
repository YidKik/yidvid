
import { supabase } from "@/integrations/supabase/client";
import { checkAdminStatus } from "../admin/check-admin-status";
import { extractChannelId } from "./extract-channel-id";
import type { ManualChannelData } from "./channel-types";
import { hasSufficientQuota } from "@/hooks/video/utils/quota-manager";

// Define the anon key as a constant since it's already in the client file
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg";
// Fallback API key for quota issues
const FALLBACK_API_KEY = "AIzaSyDeEEZoXZfGHiNvl9pMf18N43TECw07ANk";

export const addChannelManually = async (channelData: ManualChannelData) => {
  try {
    await checkAdminStatus();
    
    if (!channelData.channel_id) {
      throw new Error('Channel ID is required');
    }
    
    if (!channelData.title) {
      throw new Error('Channel title is required');
    }

    // Extract or clean the channel ID
    let channelId = extractChannelId(channelData.channel_id);
    console.log('Attempting to add channel manually with ID:', channelId);

    // Check if channel already exists
    try {
      // Use direct query with minimal columns instead of RPC
      const { data: existingChannel, error: directQueryError } = await supabase
        .from('youtube_channels')
        .select('channel_id')
        .eq('channel_id', channelId)
        .is('deleted_at', null)
        .maybeSingle();

      if (directQueryError) {
        console.error('Error checking if channel exists:', directQueryError);
      } else if (existingChannel) {
        throw new Error('This channel has already been added');
      }
    } catch (checkErr) {
      if (checkErr instanceof Error && checkErr.message === 'This channel has already been added') {
        throw checkErr;
      }
      console.error('Error during channel existence check:', checkErr);
      // Continue with insertion attempt even if check failed
    }

    // Use service-role edge function to insert the channel
    // This bypasses RLS policies that might be causing recursion
    try {
      const response = await fetch(
        'https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/admin-add-channel',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            channel_id: channelId,
            title: channelData.title,
            description: channelData.description || '',
            thumbnail_url: channelData.thumbnail_url || 'https://placehold.co/100x100?text=YT',
            default_category: channelData.default_category || 'other'
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Edge function error:', response.status, errorData);
        throw new Error(errorData.error || 'Failed to add channel to database via edge function');
      }

      const insertedChannel = await response.json();
      console.log('Channel added manually successfully via edge function:', insertedChannel);
      return insertedChannel;
    } catch (edgeFunctionError) {
      console.error('Edge function error:', edgeFunctionError);
      throw edgeFunctionError;
    }
    
  } catch (error) {
    console.error('Error in addChannelManually:', error);
    throw error;
  }
};

export const addChannel = async (channelInput: string) => {
  try {
    await checkAdminStatus();
    
    const channelId = extractChannelId(channelInput);
    console.log('Attempting to add channel with ID:', channelId);
    
    if (!channelId) {
      throw new Error('Please enter a valid channel ID or URL');
    }
    
    // Check if we have sufficient quota before proceeding
    const hasQuota = await hasSufficientQuota(true);
    if (!hasQuota) {
      console.log('YouTube API quota is low. Will attempt with fallback key.');
      // Continue anyway since we have a fallback key
    }
    
    // Check if channel already exists before calling edge function
    try {
      // Use direct query instead of RPC
      const { data: existingChannel, error: directQueryError } = await supabase
        .from('youtube_channels')
        .select('channel_id')
        .eq('channel_id', channelId)
        .is('deleted_at', null)
        .maybeSingle();
          
      if (!directQueryError && existingChannel) {
        throw new Error('This channel has already been added');
      }
    } catch (checkErr) {
      if (checkErr instanceof Error && checkErr.message === 'This channel has already been added') {
        throw checkErr;
      }
      // Continue with edge function call despite check error
      console.warn('Warning during channel check:', checkErr);
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Authentication error. Please sign in again.');
    }

    console.log('Calling edge function to fetch channel data...');
    
    try {
      const response = await fetch(
        'https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/fetch-youtube-channel',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ 
            channelId,
            useFallbackKey: !hasQuota,
            fallbackApiKey: FALLBACK_API_KEY
          }),
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge function error response:', response.status, errorText);
        
        let errorMessage = 'Error from edge function';
        
        try {
          const errorObj = JSON.parse(errorText);
          if (errorObj && errorObj.error) {
            errorMessage = errorObj.error;
          }
        } catch (parseErr) {
          errorMessage = errorText || response.statusText;
        }
        
        if (response.status === 429 || errorMessage.toLowerCase().includes('quota')) {
          // Try again with explicit fallback key if not already used
          if (!hasQuota) {
            console.error('Both primary and fallback YouTube API keys have exceeded quota');
            throw new Error('All YouTube API keys have exceeded their quota. Please try again tomorrow.');
          } else {
            // Try once more with explicit fallback key
            console.log('Primary API key quota exceeded, retrying with fallback key');
            
            const fallbackResponse = await fetch(
              'https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/fetch-youtube-channel',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({ 
                  channelId,
                  useFallbackKey: true,
                  fallbackApiKey: FALLBACK_API_KEY
                }),
              }
            );
            
            if (fallbackResponse.ok) {
              const data = await fallbackResponse.json();
              console.log('Channel added successfully using fallback key:', data);
              return data;
            } else {
              // Update the quota status in the database to avoid further requests
              try {
                await supabase
                  .from("api_quota_tracking")
                  .update({ quota_remaining: 0 })
                  .eq("api_name", "youtube");
              } catch (updateErr) {
                console.error('Failed to update quota tracking:', updateErr);
              }
              
              throw new Error('YouTube API quota exceeded for all keys. Please try again tomorrow or add the channel manually.');
            }
          }
        } else if (response.status === 403) {
          throw new Error('YouTube API access forbidden. Please check API key permissions.');
        } else if (response.status === 404 || errorMessage.toLowerCase().includes('not found')) {
          throw new Error('Channel not found. Please check the channel ID or URL.');
        } else if (errorMessage.toLowerCase().includes('already been added')) {
          throw new Error('This channel has already been added');
        } else {
          throw new Error(`Error from edge function: ${errorMessage}`);
        }
      }
      
      const data = await response.json();
      
      if (!data) {
        throw new Error('No data received from server');
      }
      
      console.log('Channel added successfully:', data);
      return data;
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error('Error in addChannel:', error);
    throw error;
  }
};

export const getChannelById = async (channelId: string | undefined) => {
  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  console.log("Getting channel details for:", channelId);
  
  try {
    // First try direct database query
    const { data: directChannel, error: directError } = await supabase
      .from("youtube_channels")
      .select("*")
      .eq("channel_id", channelId)
      .maybeSingle();
    
    if (!directError && directChannel) {
      console.log("Channel found directly in database:", directChannel);
      return directChannel;
    }
    
    console.log("Direct channel lookup failed, trying edge function");
    
    try {
      const { data: publicData, error: publicError } = await supabase.functions.invoke(
        'get-public-channel',
        {
          body: { channelId },
        }
      );
      
      if (publicError) {
        console.error("Edge function error:", publicError);
        throw publicError;
      }
      
      if (publicData?.channel) {
        console.log("Channel found via edge function:", publicData.channel);
        return publicData.channel;
      }
    } catch (edgeFunctionError) {
      console.error("Edge function call failed:", edgeFunctionError);
    }
    
    try {
      console.log("Attempting to fetch channel from YouTube API");
      const { data: apiData, error: apiError } = await supabase.functions.invoke(
        'fetch-channel-details',
        {
          body: { 
            channelId, 
            useFallbackKey: true,
            fallbackApiKey: FALLBACK_API_KEY
          },
        }
      );
      
      if (apiError) {
        console.error("API fetch error:", apiError);
        throw apiError;
      }
      
      if (apiData) {
        console.log("Channel found via YouTube API:", apiData);
        return apiData;
      }
    } catch (apiFetchError) {
      console.error("API fetch failed:", apiFetchError);
    }
    
    throw new Error("Channel not found after multiple attempts");
  } catch (error) {
    console.error("Error in getChannelById:", error);
    throw error;
  }
};
