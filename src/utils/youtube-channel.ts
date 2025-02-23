
import { supabase } from "@/integrations/supabase/client";

export const checkAdminStatus = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user?.id) {
      throw new Error("You must be signed in to add channels");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", session.user.id)
      .single();

    if (profileError) {
      console.error("Error checking admin status:", profileError);
      throw new Error("Could not verify admin status");
    }

    if (!profile?.is_admin) {
      throw new Error("You don't have permission to add channels");
    }

    return true;
  } catch (error) {
    console.error("Admin check error:", error);
    throw error;
  }
};

export const addChannel = async (channelId: string) => {
  try {
    await checkAdminStatus();
    
    const { data, error } = await supabase.functions.invoke('fetch-youtube-channel', {
      body: { channelId: channelId.trim() }
    });

    if (error) {
      console.error("Edge function error:", error);
      throw new Error(error.message || "Failed to add channel");
    }

    if (!data) {
      throw new Error("No response from server");
    }

    return data;
  } catch (error) {
    console.error("Channel addition error:", error);
    throw error;
  }
};
