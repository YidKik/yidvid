import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
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
      toast({
        title: "Channel ID required",
        description: "Please enter a channel ID or URL",
        variant: "destructive",
      });
      return;
    }

    setIsFetchingChannel(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-youtube-channel', {
        body: { channelId: channelId.trim() },
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });
      
      if (error) {
        console.error("Error fetching channel:", error);
        toast({
          title: "Error fetching channel",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (!data) {
        toast({
          title: "Channel not found",
          description: "Could not find a channel with the provided ID",
          variant: "destructive",
        });
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
        if (insertError.code === "23505") {
          toast({
            title: "Channel already exists",
            description: "This channel has already been added to your dashboard",
          });
          onSuccess?.();
          onClose?.();
        } else {
          console.error("Error adding channel:", insertError);
          toast({
            title: "Error adding channel",
            description: "Failed to add the channel",
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Channel added",
        description: `Successfully added ${data.title}`,
      });
      setChannelId("");
      onSuccess?.();
      onClose?.();
    } catch (error: any) {
      console.error("Error in add channel process:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
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
      >
        {isFetchingChannel ? "Fetching..." : isAddingChannel ? "Adding..." : "Add Channel"}
      </Button>
    </form>
  );
};