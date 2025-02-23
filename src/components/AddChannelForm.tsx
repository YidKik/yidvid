
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
    toast.loading("Adding channel...");

    try {
      await addChannel(channelId);
      toast.dismiss();
      toast.success("Channel added successfully!");
      setChannelId("");
      onSuccess?.();
      onClose?.();
    } catch (error: any) {
      console.error("Error adding channel:", error);
      toast.dismiss();
      toast.error(error.message || "Failed to add channel");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <ChannelInput
          value={channelId}
          onChange={setChannelId}
          disabled={isLoading}
        />
        <p className="text-sm text-muted-foreground">
          Enter a YouTube channel URL (e.g., https://www.youtube.com/@channelname) or channel handle (e.g., @channelname)
        </p>
      </div>
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
