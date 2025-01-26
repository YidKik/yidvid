import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export const MusicGrid = () => {
  const { data: tracks, isLoading } = useQuery({
    queryKey: ["music_tracks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("music_tracks")
        .select("*, music_artists(*)");

      if (error) {
        console.error("Error fetching music tracks:", error);
        throw error;
      }

      return data;
    },
  });

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
        </div>
      ))}
    </div>
  );
};