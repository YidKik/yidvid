
import { useState } from "react";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddArtistDialog } from "./music/AddArtistDialog";
import { ArtistsTable } from "./music/ArtistsTable";
import { useMusicArtists } from "./music/useMusicArtists";

export const MusicArtistsSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { artists, refetchArtists } = useMusicArtists();

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
        <ArtistsTable 
          artists={artists} 
          onArtistRemoved={refetchArtists}
        />
      )}

      <AddArtistDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onArtistAdded={refetchArtists}
      />
    </div>
  );
};
