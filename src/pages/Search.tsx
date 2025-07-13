
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VideoCard } from "@/components/VideoCard";
import { Header } from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { BackButton } from "@/components/navigation/BackButton";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const { data: videos, isLoading: isLoadingVideos } = useQuery({
    queryKey: ["search-videos", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      
      try {
        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .filter('deleted_at', 'is', null)
          .or(`title.ilike.%${query}%,channel_name.ilike.%${query}%`)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error searching videos:", error);
          // Return empty array instead of throwing to prevent search failure
          return [];
        }

        return data || [];
      } catch (error) {
        console.error("Unexpected error searching videos:", error);
        return [];
      }
    },
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5, // Cache search results for 5 minutes
    gcTime: 1000 * 60 * 15,   // Keep them in cache for 15 minutes
  });

  const { data: channels, isLoading: isLoadingChannels } = useQuery({
    queryKey: ["search-channels", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      
      try {
        const { data, error } = await supabase
          .from("youtube_channels")
          .select("*")
          .filter('deleted_at', 'is', null)
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error searching channels:", error);
          // Return empty array instead of throwing to prevent search failure
          return [];
        }

        return data || [];
      } catch (error) {
        console.error("Unexpected error searching channels:", error);
        return [];
      }
    },
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5, // Cache search results for 5 minutes
    gcTime: 1000 * 60 * 15,   // Keep them in cache for 15 minutes
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <Header />
      <BackButton className="z-50" />
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-primary/10">
          <h1 className="mb-8 flex items-baseline gap-2">
            <span className="text-lg text-muted-foreground font-normal">Search results for:</span>
            <span className="text-2xl font-bold text-primary">{query}</span>
          </h1>

          <div className="space-y-12">
            {/* Channels Section */}
            <section>
              <div className="flex items-baseline gap-3 mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-primary">Channels</h2>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {channels?.length || 0}
                </span>
              </div>
              {isLoadingChannels ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : channels?.length === 0 ? (
                <div className="text-center py-12 bg-secondary/20 rounded-2xl">
                  <p className="text-muted-foreground">No channels found matching "{query}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {channels?.map((channel) => (
                    <Link
                      key={channel.id}
                      to={`/channel/${channel.channel_id}`}
                      className="group flex flex-col items-center p-6 rounded-2xl hover:bg-primary/5 transition-all duration-300 hover:shadow-lg border border-transparent hover:border-primary/20"
                    >
                      <Avatar className="w-24 h-24 mb-4 transition-transform duration-300 group-hover:scale-110 shadow-lg">
                        <AvatarImage
                          src={channel.thumbnail_url}
                          alt={channel.title}
                        />
                        <AvatarFallback className="bg-primary/10">
                          <Youtube className="w-12 h-12 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-semibold text-center line-clamp-2 group-hover:text-primary transition-colors duration-300">
                        {channel.title}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Videos Section */}
            <section>
              <div className="flex items-baseline gap-3 mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-primary">Videos</h2>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {videos?.length || 0}
                </span>
              </div>
              {isLoadingVideos ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : videos?.length === 0 ? (
                <div className="text-center py-12 bg-secondary/20 rounded-2xl">
                  <p className="text-muted-foreground">No videos found matching "{query}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {videos?.map((video) => (
                    <VideoCard
                      key={video.id}
                      id={video.video_id}
                      uuid={video.id}
                      title={video.title}
                      thumbnail={video.thumbnail}
                      channelName={video.channel_name}
                      channelId={video.channel_id}
                      views={video.views}
                      uploadedAt={video.uploaded_at}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Search;
