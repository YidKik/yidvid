
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

export const addChannel = async (channelInput: string) => {
  await checkAdminStatus();

  // Extract channel ID from URL or handle
  let channelId = channelInput.trim();
  
  // Handle YouTube URLs
  if (channelId.includes('youtube.com')) {
    const urlMatch = channelId.match(/(?:\/channel\/|\/c\/|@)([\w-]+)/);
    if (urlMatch) {
      channelId = urlMatch[1];
    }
  }
  
  // Remove @ symbol if it's a handle
  channelId = channelId.replace(/^@/, '');

  const { data, error } = await supabase.functions.invoke('fetch-youtube-channel', {
    body: { channelId }
  });

  if (error) {
    throw error;
  }

  return data;
};
