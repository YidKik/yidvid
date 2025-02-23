
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
  
  if (channelId.includes('youtube.com')) {
    // Handle channel URLs
    const urlMatch = channelId.match(/(?:channel\/|c\/|@)([\w-]+)/);
    if (urlMatch && urlMatch[1]) {
      channelId = urlMatch[1];
    }
  }
  
  // Remove @ from handles
  channelId = channelId.replace(/^@/, '');
  
  return channelId;
};

export const addChannel = async (channelInput: string) => {
  await checkAdminStatus();
  
  const channelId = extractChannelId(channelInput);
  
  // Check if channel already exists
  const { data: existingChannel } = await supabase
    .from('youtube_channels')
    .select('channel_id')
    .eq('channel_id', channelId)
    .single();

  if (existingChannel) {
    throw new Error('This channel has already been added');
  }

  const { data, error } = await supabase.functions.invoke('fetch-youtube-channel', {
    body: { channelId }
  });

  if (error) {
    throw error;
  }

  return data;
};
