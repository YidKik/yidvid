
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChannelInput } from "@/components/youtube/ChannelInput";
import {
  validateChannelInput,
  checkAdminStatus,
  checkExistingChannel,
  fetchChannelDetails,
  addChannelToDatabase
} from "@/utils/youtube-channel";

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
    if (!channelId.trim()) {
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
      <ChannelInput
        value={channelId}
        onChange={setChannelId}
        disabled={isFetchingChannel || isAddingChannel}
      />
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
