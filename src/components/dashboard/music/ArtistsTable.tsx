
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Artist {
  id: string;
  artist_id: string;
  title: string;
  description: string | null;
}

interface ArtistsTableProps {
  artists: Artist[] | undefined;
  onArtistRemoved: () => void;
}

export const ArtistsTable = ({ artists, onArtistRemoved }: ArtistsTableProps) => {
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

      console.log("Artist and tracks removed successfully");
      onArtistRemoved();
    } catch (error: any) {
      console.error("Error removing artist:", error.message);
    }
  };

  return (
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
  );
};
