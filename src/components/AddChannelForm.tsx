
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
    
    const trimmedId = channelId.trim();
    if (!trimmedId) {
      toast.error("Please enter a channel ID or URL");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Submitting channel ID:", trimmedId);
      const result = await addChannel(trimmedId);
      console.log("Add channel result:", result);
      
      toast.success("Channel added successfully!");
      setChannelId("");
      onSuccess?.();
      onClose?.();
    } catch (error: any) {
      console.error("Error in form submission:", error);
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
