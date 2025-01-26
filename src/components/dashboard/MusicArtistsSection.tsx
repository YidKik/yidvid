import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const MusicArtistsSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [channelId, setChannelId] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const { data: artists, refetch: refetchArtists } = useQuery({
    queryKey: ["music-artists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("music_artists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching artists",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data;
    },
  });

  const handleAddArtist = async () => {
    try {
      if (!channelId) {
        toast({
          title: "Channel ID required",
          description: "Please enter a YouTube channel ID",
          variant: "destructive",
        });
        return;
      }

      // First check if artist already exists
      const { data: existingArtist } = await supabase
        .from("music_artists")
        .select("*")
        .eq("artist_id", channelId.trim())
        .maybeSingle();

      if (existingArtist) {
        toast({
          title: "Artist already exists",
          description: "This artist has already been added to the platform.",
          variant: "destructive",
        });
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

      toast({
        title: "Artist added successfully",
        description: "The artist's music will be fetched automatically.",
      });

      setChannelId("");
      setIsDialogOpen(false);
      refetchArtists();
    } catch (error: any) {
      toast({
        title: "Error adding artist",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveArtist = async (artistId: string) => {
    try {
      // First remove all tracks
      const { error: tracksError } = await supabase
        .from("music_tracks")
        .delete()
        .eq("artist_id", artistId);

      if (tracksError) throw tracksError;

      // Then remove the artist
      const { error: artistError } = await supabase
        .from("music_artists")
        .delete()
        .eq("artist_id", artistId);

      if (artistError) throw artistError;

      toast({
        title: "Artist removed",
        description: "The artist and their tracks have been removed.",
      });
      refetchArtists();
    } catch (error: any) {
      toast({
        title: "Error removing artist",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <div 
        className="p-4 border-b flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Music Artists</h2>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            setIsDialogOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Artist
        </Button>
      </div>

      {isExpanded && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Artist</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {artists?.map((artist) => (
              <TableRow key={artist.id}>
                <TableCell className="font-medium">{artist.title}</TableCell>
                <TableCell>{artist.description || "No description"}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveArtist(artist.artist_id)}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleAddArtist}>Add Artist</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};