
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { YoutubeChannelsTable } from "@/integrations/supabase/types/youtube-channels";

interface AddChannelFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export const AddChannelForm = ({ onClose, onSuccess }: AddChannelFormProps) => {
  const [channelId, setChannelId] = useState("");
  const [isFetchingChannel, setIsFetchingChannel] = useState(false);
  const [isAddingChannel, setIsAddingChannel] = useState(false);

  const validateChannelInput = (input: string) => {
    const cleaned = input.trim();
    
    // Handle YouTube URLs
    try {
      if (cleaned.includes('youtube.com') || cleaned.includes('youtu.be')) {
        const url = new URL(cleaned);
        
        // Handle different URL formats
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
      
      // Handle @username format
      if (cleaned.startsWith('@')) {
        return cleaned.substring(1); // Remove @ symbol
      }
      
      // Handle direct channel IDs
      if (cleaned.startsWith('UC')) {
        return cleaned;
      }
      
      return cleaned;
    } catch (error) {
      console.error("Error parsing channel input:", error);
      return cleaned;
    }
  };

  const checkAdminStatus = async () => {
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

  const checkExistingChannel = async (processedChannelId: string) => {
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
  };

  const fetchChannelDetails = async (processedChannelId: string) => {
    console.log("Calling fetch-youtube-channel function with:", processedChannelId);
    
    const { data, error } = await supabase.functions.invoke('fetch-youtube-channel', {
      body: { channelId: processedChannelId }
    });

    console.log("Response from fetch-youtube-channel:", { data, error });
    
    if (error) {
      console.error("Error fetching channel:", error);
      // Parse error message
      if (error.message?.includes("quota")) {
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
  };

  const addChannelToDatabase = async (data: any) => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelId) {
      toast.error("Please enter a channel ID or URL");
      return;
    }

    setIsFetchingChannel(true);
    setIsAddingChannel(false);

    try {
      const processedChannelId = validateChannelInput(channelId);
      console.log("Processing channel ID:", processedChannelId);

      // Step 1: Check admin status
      await checkAdminStatus();

      // Step 2: Check for existing channel
      await checkExistingChannel(processedChannelId);

      // Step 3: Fetch channel details
      const channelDetails = await fetchChannelDetails(processedChannelId);

      // Step 4: Add channel to database
      setIsAddingChannel(true);
      const channelTitle = await addChannelToDatabase(channelDetails);

      // Success!
      toast.success(`Successfully added ${channelTitle}`);
      setChannelId("");
      onSuccess?.();
      onClose?.();

    } catch (error: any) {
      console.error("Error in add channel process:", error);
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsFetchingChannel(false);
      setIsAddingChannel(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="channelId">YouTube Channel ID or URL</Label>
        <Input
          id="channelId"
          placeholder="Enter channel URL, @handle, or ID"
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
          disabled={isFetchingChannel || isAddingChannel}
        />
      </div>
      <Button 
        type="submit" 
        disabled={isFetchingChannel || isAddingChannel}
        className="w-full"
      >
        {isFetchingChannel ? "Fetching..." : isAddingChannel ? "Adding..." : "Add Channel"}
      </Button>
    </form>
  );
};
