
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useMusicArtists = () => {
  const { data: artists, refetch: refetchArtists } = useQuery({
    queryKey: ["music-artists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("music_artists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching artists:", error.message);
        return [];
      }

      return data;
    },
  });

  return { artists, refetchArtists };
};
