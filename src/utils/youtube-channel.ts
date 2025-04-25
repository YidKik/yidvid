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
    
    // Handle custom URLs with @ format
    const customUrlMatch = channelId.match(/youtube\.com\/(@[\w-]+)/);
    if (customUrlMatch && customUrlMatch[1]) {
      return customUrlMatch[1]; // Return with @ symbol for the edge function
    }
    
    // Handle c/ format URLs
    const cFormatMatch = channelId.match(/youtube\.com\/c\/([\w-]+)/);
    if (cFormatMatch && cFormatMatch[1]) {
      return cFormatMatch[1];
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
    
    // Call edge function with direct fetch instead of invoke
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
