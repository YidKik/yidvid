
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const checkAdminStatus = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user?.id) {
    throw new Error("You must be signed in to add channels");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", session.user.id)
    .single();

  if (!profile?.is_admin) {
    throw new Error("You don't have permission to add channels");
  }

  return true;
};

export const extractChannelId = (input: string): string => {
  let channelId = input.trim();
  
  // Handle full URLs
  if (channelId.includes('youtube.com/')) {
    // Handle channel URLs
    const channelMatch = channelId.match(/youtube\.com\/(?:channel\/|c\/|@)([\w-]+)/);
    if (channelMatch && channelMatch[1]) {
      channelId = channelMatch[1];
    }
  } else if (channelId.startsWith('@')) {
    // Handle @username format
    channelId = channelId.substring(1);
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
    
    // Check if channel already exists
    const { data: existingChannel, error: checkError } = await supabase
      .from('youtube_channels')
      .select('channel_id')
      .eq('channel_id', channelId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" which is what we want
      console.error('Error checking existing channel:', checkError);
      throw new Error('Error checking if channel exists');
    }

    if (existingChannel) {
      throw new Error('This channel has already been added');
    }

    // Get the current session's access token
    const { data: { session } } = await supabase.auth.getSession();

    // Call edge function to add channel with proper authorization
    console.log('Calling edge function to fetch channel data...');
    const { data, error } = await supabase.functions.invoke('fetch-youtube-channel', {
      body: { channelId },
      headers: {
        Authorization: `Bearer ${session?.access_token}`
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      const errorMessage = error.message || 'Failed to add channel';
      // If the error message contains a JSON string, try to parse it
      try {
        const parsedError = JSON.parse(errorMessage);
        throw new Error(parsedError.error || errorMessage);
      } catch {
        throw new Error(errorMessage);
      }
    }

    if (!data) {
      throw new Error('No data received from edge function');
    }

    console.log('Channel added successfully:', data);
    return data;

  } catch (error: any) {
    console.error('Error in addChannel:', error);
    // If the error is from the edge function, it might be wrapped in a message property
    const errorMessage = error.message || error.toString();
    throw new Error(errorMessage);
  }
};
