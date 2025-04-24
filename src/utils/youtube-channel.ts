
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

    // Call edge function to add channel with retries and better error handling
    console.log('Calling edge function to fetch channel data...');
    try {
      const maxRetries = 2;
      let attempt = 0;
      let lastError = null;
      
      while (attempt < maxRetries) {
        try {
          const { data, error } = await supabase.functions.invoke('fetch-youtube-channel', {
            body: { channelId },
          });
      
          if (error) {
            console.error(`Edge function error (attempt ${attempt + 1}):`, error);
            lastError = error;
            // If it's a 500 error, retry; otherwise, throw the error
            if (!error.message?.includes('500')) {
              throw error;
            }
          } else if (!data) {
            throw new Error('No data received from edge function');
          } else {
            console.log('Channel added successfully:', data);
            return data;
          }
        } catch (invocationError) {
          lastError = invocationError;
          console.error(`Edge function invocation error (attempt ${attempt + 1}):`, invocationError);
        }
        
        attempt++;
        if (attempt < maxRetries) {
          console.log(`Retrying in 1 second... (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // All retries failed, extract and throw the most informative error
      let errorMessage = 'Failed to add channel after multiple attempts';
      
      if (lastError) {
        if (typeof lastError === 'object' && lastError && 'message' in lastError) {
          // Check for quota exceeded in the error message
          const errorMsg = lastError.message.toString();
          if (errorMsg.toLowerCase().includes('quota')) {
            throw new Error('YouTube API quota exceeded. Please try again tomorrow when the quota resets.');
          } else if (errorMsg.includes('403') || errorMsg.includes('Forbidden')) {
            throw new Error('YouTube API access forbidden. Please check API key permissions.');
          } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
            throw new Error('Channel not found. Please check the channel ID or URL.');
          } else {
            errorMessage = errorMsg;
          }
        }
      }
      
      throw new Error('Error communicating with YouTube: ' + errorMessage);
      
    } catch (error: any) {
      console.error('Edge function invocation error:', error);
      
      // Extract the most informative message
      let errorMessage = 'Error communicating with YouTube';
      
      if (typeof error === 'object' && error && 'message' in error) {
        errorMessage = error.message;
        
        // Check for specific quota exceeded wording
        if (errorMessage.toLowerCase().includes('quota')) {
          throw new Error('YouTube API quota exceeded. Please try again tomorrow when the quota resets.');
        }
        
        // Check if the error is from the edge function or from the fetch itself
        if (errorMessage.includes('status code')) {
          // This is likely a non-2xx error from the edge function
          if (errorMessage.includes('429')) {
            throw new Error('YouTube API quota exceeded. Please try again tomorrow.');
          } else if (errorMessage.includes('403')) {
            throw new Error('YouTube API access forbidden. Please check API key permissions.');
          } else if (errorMessage.includes('404')) {
            throw new Error('Channel not found. Please check the channel ID or URL.');
          }
        }
      }
      
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    console.error('Error in addChannel:', error);
    throw error;
  }
};
