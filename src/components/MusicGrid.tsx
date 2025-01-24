import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { MusicTrackCard } from "./MusicTrackCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface MusicTrack {
  id: string;
  title: string;
  thumbnail: string;
  track_id: string;
  artist_name: string;
  artist_id: string;
  uploaded_at: string;
  plays: number;
  duration: number;
  music_artists?: {
    artist_id: string;
    thumbnail_url: string;
  };
}

interface MusicGridProps {
  artists?: { artist_id: string; title: string }[];
  selectedArtist?: string | null;
  searchQuery?: string;
  maxTracks?: number;
  rowSize?: number;
}

export const MusicGrid = ({
  artists = [],
  selectedArtist = null,
  searchQuery = "",
  maxTracks = 12,
  rowSize = 4,
}: MusicGridProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllTracks, setShowAllTracks] = useState(false);
  const MAX_RETRIES = 3;

  const fetchTracks = async () => {
    try {
      console.log('Fetching music tracks...');
      const { data: tracksData, error } = await supabase
        .from("music_tracks")
        .select(`
          *,
          music_artists (
            artist_id,
            thumbnail_url
          )
        `)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error fetching tracks:', error);
        toast.error(`Error fetching tracks: ${error.message}`);
        throw error;
      }

      console.log('Raw tracks data:', tracksData);

      if (!tracksData || tracksData.length === 0) {
        // Check if we have any artists in the music_artists table
        const { data: artistsData, error: artistsError } = await supabase
          .from("music_artists")
          .select("*");

        if (artistsError) {
          console.error('Error checking artists:', artistsError);
        } else {
          console.log('Artists in database:', artistsData);
          if (artistsData && artistsData.length > 0) {
            toast.info("Artists found but no tracks available. Please wait a few moments for tracks to be fetched.");
          } else {
            toast.info("No music tracks or artists found. Try adding some artists first.");
          }
        }
      } else {
        console.log('Successfully fetched tracks:', tracksData);
      }

      return tracksData || [];
    } catch (error) {
      console.error('Error in fetchTracks:', error);
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchTracks();
      }
      throw error;
    }
  };

  const { data: tracks = [], error, refetch } = useQuery({
    queryKey: ['tracks', searchQuery],
    queryFn: fetchTracks,
    retry: MAX_RETRIES,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
  });

  useEffect(() => {
    setIsLoading(false);
  }, [tracks]);

  useEffect(() => {
    // Refetch tracks when component mounts
    refetch();
  }, [refetch]);

  if (error) {
    console.error('Query error:', error);
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading tracks. Please try again later.</p>
        <Button onClick={() => refetch()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const filteredTracks = tracks.filter(track => {
    const matchesArtist = !selectedArtist || track.artist_id === selectedArtist;
    const matchesSearch = !searchQuery ||
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesArtist && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p>Loading tracks...</p>
      </div>
    );
  }

  if (filteredTracks.length === 0) {
    return (
      <div className="text-center py-8">
        <p>No tracks found.</p>
        <Button onClick={() => refetch()} className="mt-4">
          Refresh
        </Button>
      </div>
    );
  }

  const initialTracks = filteredTracks.slice(0, maxTracks);
  const totalPages = Math.ceil(filteredTracks.length / maxTracks);
  const startIndex = (currentPage - 1) * maxTracks;
  const endIndex = startIndex + maxTracks;
  const currentTracks = filteredTracks.slice(startIndex, endIndex);
  const tracksToDisplay = showAllTracks ? currentTracks : initialTracks;
  
  const rows = [];
  for (let i = 0; i < tracksToDisplay.length; i += rowSize) {
    rows.push(tracksToDisplay.slice(i, i + rowSize));
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowMore = () => {
    setShowAllTracks(true);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 p-4">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {row.map((track, index) => (
            <MusicTrackCard
              key={track.id}
              id={track.id}
              title={track.title}
              thumbnail={track.thumbnail}
              artistName={track.artist_name}
              plays={track.plays}
              uploadedAt={new Date(track.uploaded_at)}
              artistId={track.artist_id}
              artistThumbnail={track.music_artists?.thumbnail_url}
              duration={track.duration}
              index={rowIndex * rowSize + index}
            />
          ))}
        </div>
      ))}
      
      {!showAllTracks && filteredTracks.length > maxTracks && (
        <div className="flex justify-center mt-8">
          <Button 
            onClick={handleShowMore}
            variant="outline"
            className="px-8"
          >
            See More
          </Button>
        </div>
      )}

      {showAllTracks && totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent className="flex justify-center gap-4">
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                  className="hover:bg-transparent hover:border-primary hover:text-primary transition-colors"
                />
              </PaginationItem>
            )}
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                  }}
                  className="hover:bg-transparent hover:border-primary hover:text-primary transition-colors"
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};