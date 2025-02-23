
import { supabase } from "@/integrations/supabase/client";
import type { YoutubeChannelsTable } from "@/integrations/supabase/types/youtube-channels";

export const validateChannelInput = (input: string) => {
  const cleaned = input.trim();
  
  try {
    if (cleaned.includes('youtube.com') || cleaned.includes('youtu.be')) {
      const url = new URL(cleaned);
      
      if (url.pathname.includes('/channel/')) {
        return url.pathname.split('/channel/')[1].split('/')[0];
      }
      if (url.pathname.includes('/@')) {
        return url.pathname.split('/@')[1].split('/')[0];
      }
      if (url.pathname.includes('/c/')) {
        return url.pathname.split('/c/')[1].split('/')[0];
      }
      if (url.pathname.includes('/user/')) {
        return url.pathname.split('/user/')[1].split('/')[0];
      }
    }
    
    if (cleaned.startsWith('@')) {
      return cleaned.substring(1);
    }
    
    if (cleaned.startsWith('UC')) {
      return cleaned;
    }
    
    return cleaned;
  } catch (error) {
    console.error("Error parsing channel input:", error);
    return cleaned;
  }
};

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

    if (profileError || !profile?.is_admin) {
      throw new Error("You don't have permission to add channels");
    }

    return true;
  } catch (error: any) {
    console.error("Error checking admin status:", error);
    throw new Error(error.message || "Failed to verify admin status");
  }
};

export const checkExistingChannel = async (processedChannelId: string) => {
  try {
    const { data: existingChannel, error: checkError } = await supabase
      .from("youtube_channels")
      .select("title, channel_id")
      .eq("channel_id", processedChannelId)
      .is("deleted_at", null)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing channel:", checkError);
      throw new Error("Failed to check if channel exists");
    }

    if (existingChannel) {
      throw new Error(`Channel "${existingChannel.title}" has already been added`);
    }
  } catch (error: any) {
    console.error("Error in checkExistingChannel:", error);
    throw error;
  }
};

export const fetchChannelDetails = async (processedChannelId: string) => {
  try {
    console.log("Calling fetch-youtube-channel function with:", processedChannelId);
    
    const { data, error } = await supabase.functions.invoke('fetch-youtube-channel', {
      body: { channelId: processedChannelId }
    });

    console.log("Response from fetch-youtube-channel:", { data, error });
    
    if (error) {
      console.error("Error fetching channel:", error);
      if (error.message?.toLowerCase().includes("quota")) {
        throw new Error("YouTube API quota exceeded. Please try again later.");
      } else if (error.message?.includes("404")) {
        throw new Error("Could not find a channel with the provided ID. Please check the URL or ID and try again.");
      } else {
        throw new Error(error.message || "Failed to fetch channel details");
      }
    }

    if (!data) {
      throw new Error("Could not find a channel with the provided ID");
    }

    return data;
  } catch (error: any) {
    console.error("Error in fetchChannelDetails:", error);
    throw error;
  }
};

export const addChannelToDatabase = async (data: any) => {
  try {
    const channelData: YoutubeChannelsTable["Insert"] = {
      channel_id: data.channelId,
      title: data.title,
      description: data.description,
      thumbnail_url: data.thumbnailUrl,
      default_category: data.default_category || 'other'
    };

    const { error: insertError } = await supabase
      .from("youtube_channels")
      .insert(channelData);

    if (insertError) {
      console.error("Error adding channel:", insertError);
      if (insertError.code === '23505') {
        throw new Error("This channel has already been added to your dashboard");
      } else {
        throw new Error("Failed to add the channel");
      }
    }

    return data.title;
  } catch (error: any) {
    console.error("Error in addChannelToDatabase:", error);
    throw error;
  }
};
