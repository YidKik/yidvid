
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface AddArtistDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onArtistAdded: () => void;
}

export const AddArtistDialog = ({ isOpen, onOpenChange, onArtistAdded }: AddArtistDialogProps) => {
  const [channelId, setChannelId] = useState("");
  const { toast } = useToast();

  const handleAddArtist = async () => {
    try {
      if (!channelId) {
        console.log("Channel ID required: Please enter a YouTube channel ID");
        return;
      }

      // First check if artist already exists
      const { data: existingArtist } = await supabase
        .from("music_artists")
        .select("*")
        .eq("artist_id", channelId.trim())
        .maybeSingle();

      if (existingArtist) {
        console.log("Artist already exists: This artist has already been added to the platform.");
        return;
      }

      // Add new artist
      const { error: insertError } = await supabase
        .from("music_artists")
        .insert([
          {
            artist_id: channelId.trim(),
            title: "Loading...", // Will be updated by the fetch-youtube-music function
            description: null,
            thumbnail_url: null,
          },
        ]);

      if (insertError) throw insertError;

      console.log("Artist added successfully: The artist's music will be fetched automatically.");

      setChannelId("");
      onOpenChange(false);
      onArtistAdded();
    } catch (error: any) {
      console.error("Error adding artist:", error.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add YouTube Music Artist</DialogTitle>
          <DialogDescription>
            Enter the YouTube channel ID of the music artist you want to add.
            You can find the channel ID in the URL of the artist's YouTube channel
            or in their channel's about page.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="channelId">YouTube Channel ID</Label>
            <Input
              id="channelId"
              placeholder="Enter channel ID (e.g., UC...)"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleAddArtist}>Add Artist</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
