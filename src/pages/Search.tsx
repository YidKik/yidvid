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
      
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .or(`title.ilike.%${query}%, channel_name.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error searching videos:", error);
        throw error;
      }

      return data || [];
    },
    enabled: query.length > 0,
  });

  const { data: channels, isLoading: isLoadingChannels } = useQuery({
    queryKey: ["search-channels", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .or(`title.ilike.%${query}%, description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error searching channels:", error);
        throw error;
      }

      return data || [];
    },
    enabled: query.length > 0,
  });

  return (
    <div className="min-h-screen">
      <Header />
      <BackButton className="z-50" />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 flex items-baseline gap-2">
          <span className="text-lg text-muted-foreground font-normal">Search results for:</span>
          <span className="text-xl font-semibold">{query}</span>
        </h1>

        <div className="space-y-12">
          {/* Channels Section */}
          <section>
            <div className="flex items-baseline gap-2 mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-accent">Channels</h2>
              <span className="text-base text-muted-foreground">{channels?.length || 0}</span>
            </div>
            {isLoadingChannels ? (
              <div className="text-center">Loading channels...</div>
            ) : channels?.length === 0 ? (
              <div className="text-center text-muted-foreground">
                No channels found matching "{query}"
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {channels?.map((channel) => (
                  <Link
                    key={channel.id}
                    to={`/channel/${channel.channel_id}`}
                    className="group flex flex-col items-center p-4 rounded-lg hover:bg-accent/5 transition-all duration-300"
                  >
                    <Avatar className="w-20 h-20 mb-3 transition-transform duration-300 group-hover:scale-110">
                      <AvatarImage
                        src={channel.thumbnail_url}
                        alt={channel.title}
                      />
                      <AvatarFallback>
                        <Youtube className="w-10 h-10 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-center line-clamp-2 group-hover:text-primary transition-colors duration-300">
                      {channel.title}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Videos Section */}
          <section>
            <div className="flex items-baseline gap-2 mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-accent">Videos</h2>
              <span className="text-base text-muted-foreground">{videos?.length || 0}</span>
            </div>
            {isLoadingVideos ? (
              <div className="text-center">Loading videos...</div>
            ) : videos?.length === 0 ? (
              <div className="text-center text-muted-foreground">
                No videos found matching "{query}"
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {videos?.map((video) => (
                  <VideoCard
                    key={video.id}
                    id={video.video_id}
                    uuid={video.id}
                    title={video.title}
                    thumbnail={video.thumbnail}
                    channelName={video.channel_name}
                    views={video.views}
                    uploadedAt={video.uploaded_at}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Search;