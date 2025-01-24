import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2, Music2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  const { toast } = useToast();

  const { data: artists, refetch } = useQuery({
    queryKey: ["music-artists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("music_artists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching music artists:", error);
        toast({
          title: "Error fetching music artists",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data || [];
    },
  });

  const handleAddArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelId) {
      toast({
        title: "Channel ID required",
        description: "Please enter a YouTube channel ID",
        variant: "destructive",
      });
      return;
    }

    try {
      // First check if the artist already exists
      const { data: existingArtist } = await supabase
        .from("music_artists")
        .select("title")
        .eq("artist_id", channelId.trim())
        .maybeSingle();

      if (existingArtist) {
        toast({
          title: "Artist already exists",
          description: "This artist has already been added to your dashboard",
        });
        setIsDialogOpen(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('fetch-youtube-channel', {
        body: { channelId: channelId.trim() },
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

      const { error: insertError } = await supabase
        .from("music_artists")
        .insert({
          artist_id: data.channelId,
          title: data.title,
          description: data.description,
          thumbnail_url: data.thumbnailUrl,
        });

      if (insertError) {
        console.error("Error adding artist:", insertError);
        toast({
          title: "Error adding artist",
          description: "Failed to add the artist",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Artist added",
        description: `Successfully added ${data.title}`,
      });
      setChannelId("");
      setIsDialogOpen(false);
      refetch();
    } catch (error: any) {
      console.error("Error in add artist process:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleRemoveArtist = async (artistId: string) => {
    try {
      const { error: tracksError } = await supabase
        .from("music_tracks")
        .delete()
        .eq("artist_id", artistId);

      if (tracksError) throw tracksError;

      const { error: artistError } = await supabase
        .from("music_artists")
        .delete()
        .eq("artist_id", artistId);

      if (artistError) throw artistError;

      toast({
        title: "Artist removed",
        description: "The artist and their tracks have been removed from your dashboard.",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error removing artist",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Music Artists</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="default"
                  size="lg"
                  className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-6 text-lg rounded-md shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <Plus className="h-6 w-6" />
                  Add Music Artist
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Music Artist</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddArtist} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="channelId">YouTube Channel ID or URL</Label>
                    <Input
                      id="channelId"
                      placeholder="Enter channel ID, URL, or @handle"
                      value={channelId}
                      onChange={(e) => setChannelId(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Add Artist
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Artist</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Added On</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {artists?.map((artist) => (
            <TableRow key={artist.id}>
              <TableCell className="flex items-center gap-2">
                {artist.thumbnail_url ? (
                  <img
                    src={artist.thumbnail_url}
                    alt={artist.title}
                    className="w-8 h-8 rounded"
                  />
                ) : (
                  <Music2 className="w-8 h-8 text-primary" />
                )}
                <div>
                  <p className="font-medium">{artist.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {artist.artist_id}
                  </p>
                </div>
              </TableCell>
              <TableCell>{artist.description || "No description"}</TableCell>
              <TableCell>
                {new Date(artist.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveArtist(artist.artist_id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};