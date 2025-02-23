
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

  console.log('Adding channel:', channelInput);
  const { data, error } = await supabase.functions.invoke('fetch-youtube-channel', {
    body: { channelId: channelInput }
  });

  if (error || !data) {
    console.error('Error from edge function:', error);
    throw new Error(error?.message || 'Failed to add channel');
  }

  console.log('Channel added successfully:', data);
  return data;
};
