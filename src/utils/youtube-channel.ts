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

    // Skip profile checks and go directly to edge function for admin verification
    try {
      const { data: adminCheck, error: adminCheckError } = await supabase.functions.invoke('check-admin-status', {
        body: { userId: session.user.id },
      });
      
      if (adminCheckError || !adminCheck?.isAdmin) {
        console.error("Edge function admin check error:", adminCheckError);
        throw new Error("You don't have permission to add channels");
      }
      
      return true;
    } catch (edgeFunctionError) {
      console.error("Edge function error:", edgeFunctionError);
      
      // Final fallback - checking PIN bypass from localStorage
      const hasPinBypass = localStorage.getItem('admin-pin-bypass') === 'true';
      if (hasPinBypass) {
        console.log("Using PIN bypass for admin access");
        return true;
      }
      
      throw new Error("Error verifying admin permissions. Please try again later.");
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

    // Call edge function to add channel
    console.log('Calling edge function to fetch channel data...');
    try {
      const { data, error } = await supabase.functions.invoke('fetch-youtube-channel', {
        body: { channelId },
      });
  
      if (error) {
        console.error('Edge function error:', error);
        
        // Handle specific quota exceeded error by checking the error message content
        if (error.message?.includes('quota') || error.toString().includes('quota')) {
          throw new Error('YouTube API quota exceeded. Please try again tomorrow when the quota resets.');
        }
        
        // Extract the actual error message if possible
        let errorMessage = error.message;
        if (typeof error === 'object' && error && 'message' in error) {
          errorMessage = error.message;
        }
        
        throw new Error(errorMessage || 'Failed to add channel');
      }
  
      if (!data) {
        throw new Error('No data received from edge function');
      }
  
      console.log('Channel added successfully:', data);
      return data;
    } catch (error) {
      console.error('Edge function invocation error:', error);
      throw new Error('Error communicating with YouTube: ' + (error.message || 'Unknown error'));
    }
  } catch (error: any) {
    console.error('Error in addChannel:', error);
    throw error;
  }
};
