
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useMusicArtists = () => {
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

  return { artists, refetchArtists };
};
