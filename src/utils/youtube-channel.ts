
import { supabase } from "@/integrations/supabase/client";

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
    const urlMatch = channelId.match(/(?:youtube\.com\/(?:channel\/|c\/|user\/|@))([\w-]+)/);
    if (urlMatch && urlMatch[1]) {
      channelId = urlMatch[1];
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
    console.log('Processed channel ID:', channelId);
    
    if (!channelId) {
      throw new Error('Invalid channel ID or URL');
    }
    
    // Check if channel already exists
    const { data: existingChannel } = await supabase
      .from('youtube_channels')
      .select('channel_id')
      .eq('channel_id', channelId)
      .single();

    if (existingChannel) {
      throw new Error('This channel has already been added');
    }

    // Call edge function to add channel
    console.log('Calling edge function with channelId:', channelId);
    const { data, error } = await supabase.functions.invoke('fetch-youtube-channel', {
      body: { channelId }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data received from edge function');
    }

    console.log('Channel added successfully:', data);
    return data;

  } catch (error: any) {
    console.error('Error in addChannel:', error);
    throw error;
  }
};
