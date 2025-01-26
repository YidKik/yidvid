import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const MusicGrid = () => {
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [player, setPlayer] = useState<HTMLIFrameElement | null>(null);

  const { data: tracks, isLoading } = useQuery({
    queryKey: ["music_tracks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("music_tracks")
        .select("*, music_artists(*)")
        .order('plays', { ascending: false });

      if (error) {
        console.error("Error fetching music tracks:", error);
        throw error;
      }

      return data;
    },
  });

  const handlePlay = async (trackId: string, audioUrl: string | null) => {
    if (!audioUrl) {
      toast.error("No audio URL available for this track");
      return;
    }

    // Extract video ID from YouTube URL
    const videoId = audioUrl.split('v=')[1];
    if (!videoId) {
      toast.error("Invalid YouTube URL");
      return;
    }

    if (playingTrackId === trackId) {
      // Stop playing
      if (player) {
        player.src = '';
        document.body.removeChild(player);
        setPlayer(null);
      }
      setPlayingTrackId(null);
    } else {
      // Stop current player if exists
      if (player) {
        player.src = '';
        document.body.removeChild(player);
      }

      // Create new iframe for the track
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      document.body.appendChild(iframe);
      setPlayer(iframe);
      setPlayingTrackId(trackId);

      // Update play count
      try {
        const { error } = await supabase
          .from('music_tracks')
          .update({ plays: (tracks?.find(t => t.id === trackId)?.plays || 0) + 1 })
          .eq('id', trackId);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating play count:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!tracks?.length) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No music tracks found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {tracks.map((track) => (
        <div
          key={track.id}
          className="group relative bg-card rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
        >
          <Link
            to={`/music/${track.id}`}
            className="block"
          >
            <div className="aspect-square">
              <img
                src={track.thumbnail}
                alt={track.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold truncate">{track.title}</h3>
              <p className="text-sm text-muted-foreground">{track.artist_name}</p>
            </div>
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePlay(track.id, track.audio_url);
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                     bg-black/70 hover:bg-black/90 text-white rounded-full p-4
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label={playingTrackId === track.id ? "Stop" : "Play"}
          >
            <Play className={`w-8 h-8 ${playingTrackId === track.id ? 'text-primary' : 'text-white'}`} />
          </button>
        </div>
      ))}
    </div>
  );
};