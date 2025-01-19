import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const UpdateChannelThumbnails = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateThumbnails = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(
        "https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/update-channel-thumbnails",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: data.message,
        });
        // Invalidate the channels query to refetch with new thumbnails
        queryClient.invalidateQueries({ queryKey: ["youtube-channels"] });
      } else {
        throw new Error(data.error || "Failed to update thumbnails");
      }
    } catch (error) {
      console.error("Error updating thumbnails:", error);
      toast({
        title: "Error",
        description: "Failed to update channel thumbnails. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Button
      onClick={updateThumbnails}
      disabled={isUpdating}
      variant="outline"
      size="sm"
      className="ml-auto"
    >
      {isUpdating ? "Updating..." : "Update Channel Thumbnails"}
    </Button>
  );
};