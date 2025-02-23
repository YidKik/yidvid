
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
        return cleaned;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelId) {
      toast.error("Please enter a channel ID or URL");
      return;
    }

    const processedChannelId = validateChannelInput(channelId);
    console.log("Processing channel ID:", processedChannelId);

    setIsFetchingChannel(true);
    try {
      // First check if admin
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user?.id) {
        toast.error("You must be signed in to add channels");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .single();

      if (profileError || !profile?.is_admin) {
        toast.error("You don't have permission to add channels");
        return;
      }

      // Check if channel already exists
      const { data: existingChannel, error: checkError } = await supabase
        .from("youtube_channels")
        .select("title, channel_id")
        .eq("channel_id", processedChannelId)
        .is("deleted_at", null)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing channel:", checkError);
        toast.error("Failed to check if channel exists");
        return;
      }

      if (existingChannel) {
        toast.error(`Channel "${existingChannel.title}" has already been added to your dashboard`);
        return;
      }

      // Fetch channel details from YouTube API
      console.log("Calling fetch-youtube-channel function with:", processedChannelId);
      
      const { data, error } = await supabase.functions.invoke('fetch-youtube-channel', {
        body: { channelId: processedChannelId }
      });

      console.log("Response from fetch-youtube-channel:", { data, error });
      
      if (error) {
        console.error("Error fetching channel:", error);
        if (error.message.includes("404")) {
          toast.error("Could not find a channel with the provided ID. Please check the URL or ID and try again.");
        } else {
          toast.error(error.message || "Failed to fetch channel details");
        }
        return;
      }

      if (!data) {
        toast.error("Could not find a channel with the provided ID");
        return;
      }

      setIsAddingChannel(true);

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
          toast.error("This channel has already been added to your dashboard");
        } else {
          toast.error("Failed to add the channel");
        }
        return;
      }

      toast.success(`Successfully added ${data.title}`);
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
