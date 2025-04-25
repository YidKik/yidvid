import { supabase } from "@/integrations/supabase/client";
import { checkAdminStatus } from "../admin/check-admin-status";
import { extractChannelId } from "./extract-channel-id";
import type { ManualChannelData } from "./channel-types";

// Define the anon key as a constant since it's already in the client file
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg";

export const addChannelManually = async (channelData: ManualChannelData) => {
  try {
    await checkAdminStatus();
    
    if (!channelData.channel_id) {
      throw new Error('Channel ID is required');
    }
    
    if (!channelData.title) {
      throw new Error('Channel title is required');
    }

    // Keep the @ symbol for display purposes if present
    let channelId = channelData.channel_id;
    console.log('Attempting to add channel manually with ID:', channelId);

    // Check if channel already exists
    const { data: existingChannel, error: checkError } = await supabase
      .from('youtube_channels')
      .select('channel_id')
      .eq('channel_id', channelId)
      .is('deleted_at', null)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking if channel exists:', checkError);
      throw new Error('Error checking if channel exists');
    }

    if (existingChannel) {
      throw new Error('This channel has already been added');
    }

    // Insert the new channel
    const { data: insertedChannel, error: insertError } = await supabase
      .from('youtube_channels')
      .insert({
        channel_id: channelId,
        title: channelData.title,
        description: channelData.description || '',
        thumbnail_url: channelData.thumbnail_url || 'https://placehold.co/100x100?text=YT',
        default_category: channelData.default_category || 'other'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting channel:', insertError);
      throw new Error('Failed to add channel to database');
    }

    console.log('Channel added manually successfully:', insertedChannel);
    return insertedChannel;
    
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
          body: JSON.stringify({ channelId }),
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge function error response:', response.status, errorText);
        
        if (response.status === 429 || errorText.toLowerCase().includes('quota')) {
          throw new Error('YouTube API quota exceeded. Please try again tomorrow.');
        } else if (response.status === 403) {
          throw new Error('YouTube API access forbidden. Please check API key permissions.');
        } else if (response.status === 404 || errorText.toLowerCase().includes('not found')) {
          throw new Error('Channel not found. Please check the channel ID or URL.');
        } else {
          throw new Error(`Error from edge function: ${errorText || response.statusText}`);
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
          body: { channelId },
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
