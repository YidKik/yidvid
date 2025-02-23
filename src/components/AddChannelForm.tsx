
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChannelInput } from "@/components/youtube/ChannelInput";
import { addChannel } from "@/utils/youtube-channel";

interface AddChannelFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export const AddChannelForm = ({ onClose, onSuccess }: AddChannelFormProps) => {
  const [channelId, setChannelId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!channelId.trim()) {
      toast.error("Please enter a channel ID or URL");
      return;
    }

    setIsLoading(true);

    try {
      const result = await addChannel(channelId);
      toast.success(`Successfully added ${result.title}`);
      setChannelId("");
      onSuccess?.();
      onClose?.();
    } catch (error: any) {
      console.error("Error adding channel:", error);
      toast.error(error.message || "Failed to add channel");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ChannelInput
        value={channelId}
        onChange={setChannelId}
        disabled={isLoading}
      />
      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Adding Channel..." : "Add Channel"}
      </Button>
    </form>
  );
};
