import { supabase } from "@/integrations/supabase/client";

// Define the anon key as a constant since it's already in the client file
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg";

export const checkAdminStatus = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      throw new Error("Authentication error. Please try signing in again.");
    }
    
    if (!session?.user?.id) {
      throw new Error("You must be signed in to add channels");
    }

    // Try multiple approaches to verify admin status
    try {
      // 1. First attempt: Call the edge function for admin verification
      console.log("Checking admin status via edge function for user:", session.user.id);
      
      const { data: adminCheck, error: adminCheckError } = await supabase.functions.invoke('check-admin-status', {
        body: { userId: session.user.id },
      });
      
      if (adminCheckError) {
        console.error("Edge function admin check error:", adminCheckError);
        throw new Error("Error verifying admin permissions");
      }
      
      if (!adminCheck?.isAdmin) {
        throw new Error("You don't have permission to add channels");
      }
      
      console.log("Admin status confirmed via edge function");
      return true;
    } catch (edgeFunctionError) {
      console.error("Edge function error:", edgeFunctionError);
      
      try {
        // 2. Second attempt: Direct database query with better error handling
        console.log("Attempting direct profile query");
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error("Profile query error:", profileError);
          throw profileError;
        }
        
        if (!profile?.is_admin) {
          throw new Error("You don't have permission to add channels");
        }
        
        console.log("Admin status confirmed via direct query");
        return true;
      } catch (dbError) {
        console.error("Database query error:", dbError);
        
        // 3. Final fallback: Check localStorage for PIN bypass
        const hasPinBypass = localStorage.getItem('admin-pin-bypass') === 'true';
        
        if (hasPinBypass) {
          console.log("Using PIN bypass for admin access");
          return true;
        }
        
        throw new Error("You don't have permission to add channels");
      }
    }
  } catch (error) {
    console.error("Admin check error:", error);
    throw error;
  }
};

export const extractChannelId = (input: string): string => {
  let channelId = input.trim();
  
  // Handle full URLs
  if (channelId.includes('youtube.com/')) {
    // Handle channel URLs with channel ID
    const channelMatch = channelId.match(/youtube\.com\/(?:channel\/)([\w-]+)/);
    if (channelMatch && channelMatch[1]) {
      return channelMatch[1];
    }
    
    // Handle custom URLs
    const customUrlMatch = channelId.match(/youtube\.com\/(?:c\/|@)([\w-]+)/);
    if (customUrlMatch && customUrlMatch[1]) {
      return customUrlMatch[1];
    }
  } else if (channelId.startsWith('@')) {
    // Handle @username format
    return channelId; // Return including @ symbol for the edge function
  }
  
  return channelId;
};

export const addChannel = async (channelInput: string) => {
  try {
    // First check admin status
    await checkAdminStatus();
    
    const channelId = extractChannelId(channelInput);
    console.log('Attempting to add channel with ID:', channelId);
    
    if (!channelId) {
      throw new Error('Please enter a valid channel ID or URL');
    }
    
    // Get the current session's access token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Authentication error. Please sign in again.');
    }

    // Improved error handling with detailed logging
    console.log('Calling edge function to fetch channel data...');
    
    // Call edge function with explicit error handling for debugging
    try {
      const { data, error } = await supabase.functions.invoke('fetch-youtube-channel', {
        body: { channelId },
      });
    
      if (error) {
        console.error('Edge function error:', error);
        
        // Extract the most helpful error message
        if (error.message) {
          if (error.message.includes('quota')) {
            throw new Error('YouTube API quota exceeded. Please try again tomorrow.');
          } else if (error.message.includes('403') || error.message.includes('forbidden')) {
            throw new Error('YouTube API access forbidden. Please check API key permissions.');
          } else if (error.message.includes('404') || error.message.includes('not found')) {
            throw new Error('Channel not found. Please check the channel ID or URL.');
          }
          
          // If we have a specific error message, use it
          throw new Error(error.message);
        }
        
        // Default error if we can't extract anything useful
        throw new Error('Error communicating with the YouTube API. Please try again later.');
      }
      
      if (!data) {
        throw new Error('No data received from server');
      }
      
      console.log('Channel added successfully:', data);
      return data;
    } catch (invokeError) {
      console.error('Edge function invocation error:', invokeError);
      
      // Rethrow with the most descriptive message possible
      if (typeof invokeError === 'object' && invokeError && 'message' in invokeError) {
        const errorMessage = invokeError.message.toString();
        
        // Check for common error patterns
        if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
          throw new Error('YouTube API quota exceeded. Please try again tomorrow.');
        } else if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
          throw new Error('YouTube API access forbidden. Please check API key permissions.');
        } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          throw new Error('Channel not found. Please check the channel ID or URL.');
        }
        
        throw new Error(`YouTube API error: ${errorMessage}`);
      }
      
      // Generic error as fallback
      throw new Error('Error communicating with YouTube API. Please try again later.');
    }
  } catch (error) {
    console.error('Error in addChannel:', error);
    throw error;
  }
};

// New function to get channel by ID from various sources
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
    
    // Try via edge function for more robust search
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
    
    // Last resort: Try to get from YouTube API directly
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
