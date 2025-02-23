
import { supabase } from "@/integrations/supabase/client";

export const checkAdminStatus = async () => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.user?.id) {
    throw new Error("You must be signed in to add channels");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", session.user.id)
    .single();

  if (profileError || !profile?.is_admin) {
    throw new Error("You don't have permission to add channels");
  }

  return true;
};

export const addChannel = async (channelId: string) => {
  await checkAdminStatus();
  
  const { data, error } = await supabase.functions.invoke('fetch-youtube-channel', {
    body: { channelId }
  });

  if (error) {
    console.error("Error adding channel:", error);
    throw new Error(error.message || "Failed to add channel");
  }

  return data;
};
