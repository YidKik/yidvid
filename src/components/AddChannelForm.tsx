import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AddChannelFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export const AddChannelForm = ({ onClose, onSuccess }: AddChannelFormProps) => {
  const [channelId, setChannelId] = useState("");
  const [isFetchingChannel, setIsFetchingChannel] = useState(false);
  const [isAddingChannel, setIsAddingChannel] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelId) {
      toast.error("Please enter a channel ID or URL");
      return;
    }

    setIsFetchingChannel(true);
    try {
      // First check if the channel already exists
      const { data: existingChannel } = await supabase
        .from("youtube_channels")
        .select("title")
        .eq("channel_id", channelId.trim())
        .maybeSingle();

      if (existingChannel) {
        toast.error("This channel has already been added to your dashboard");
        return;
      }

      const { data, error } = await supabase.functions.invoke('fetch-youtube-channel', {
        body: { channelId: channelId.trim() }
      });
      
      if (error) {
        console.error("Error fetching channel:", error);
        toast.error(error.message || "Failed to fetch channel details");
        return;
      }

      if (!data) {
        toast.error("Could not find a channel with the provided ID");
        return;
      }

      setIsAddingChannel(true);
      const { error: insertError } = await supabase
        .from("youtube_channels")
        .insert({
          channel_id: data.channelId,
          title: data.title,
          description: data.description,
          thumbnail_url: data.thumbnailUrl,
        });

      if (insertError) {
        console.error("Error adding channel:", insertError);
        toast.error("Failed to add the channel");
        return;
      }

      toast.success(`Successfully added ${data.title}`);
      setChannelId("");
      onSuccess?.();
      onClose?.();

      // Wait a bit for videos to be fetched
      setTimeout(() => {
        window.location.reload();
      }, 2000);
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
          placeholder="Enter channel ID, URL, or @handle"
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