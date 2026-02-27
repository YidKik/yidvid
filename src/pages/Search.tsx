
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VideoCard } from "@/components/VideoCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Youtube, Search as SearchIcon, Users, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageLoader } from "@/contexts/LoadingContext";

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
          return [];
        }

        return data || [];
      } catch (error) {
        console.error("Unexpected error searching videos:", error);
        return [];
      }
    },
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
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
          return [];
        }

        return data || [];
      } catch (error) {
        console.error("Unexpected error searching channels:", error);
        return [];
      }
    },
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });

  const isLoading = isLoadingVideos || isLoadingChannels;
  usePageLoader('search', isLoading);

  return (
    <div className="min-h-screen bg-white pt-16 pl-[200px] transition-all duration-300">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SearchIcon className="h-6 w-6 text-[#999999]" />
            <h1 className="text-2xl font-bold text-[#1A1A1A]">
              Search results for "<span className="text-[#FF0000]">{query}</span>"
            </h1>
          </div>
          <p className="text-sm text-[#999999] ml-9">
            {(channels?.length || 0) + (videos?.length || 0)} results found
          </p>
        </div>

        {/* Channels Section */}
        {(isLoadingChannels || (channels && channels.length > 0)) && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E5E5]">
              <Users className="h-5 w-5 text-[#FF0000]" />
              <h2 className="text-lg font-bold text-[#1A1A1A]">Channels</h2>
              {channels && (
                <span className="bg-[#FF0000] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {channels.length}
                </span>
              )}
            </div>

            {isLoadingChannels ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF0000]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {channels?.map((channel) => (
                  <Link
                    key={channel.id}
                    to={`/channel/${channel.channel_id}`}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] hover:border-[#FFCC00] hover:shadow-md transition-all duration-200"
                  >
                    <Avatar className="w-16 h-16 flex-shrink-0 border-2 border-[#E5E5E5] group-hover:border-[#FFCC00] transition-colors">
                      <AvatarImage
                        src={channel.thumbnail_url}
                        alt={channel.title}
                      />
                      <AvatarFallback className="bg-[#F5F5F5]">
                        <Youtube className="w-7 h-7 text-[#FF0000]" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#1A1A1A] text-sm line-clamp-1 group-hover:text-[#FF0000] transition-colors">
                        {channel.title}
                      </h3>
                      {channel.description && (
                        <p className="text-xs text-[#999999] mt-1 line-clamp-2">
                          {channel.description}
                        </p>
                      )}
                      <span className="inline-block mt-2 text-xs font-medium text-[#FF0000] bg-[#FF0000]/10 px-2 py-0.5 rounded-full">
                        View Channel
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* No channels found */}
        {!isLoadingChannels && channels?.length === 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E5E5]">
              <Users className="h-5 w-5 text-[#FF0000]" />
              <h2 className="text-lg font-bold text-[#1A1A1A]">Channels</h2>
              <span className="bg-[#E5E5E5] text-[#999999] text-xs font-bold px-2.5 py-0.5 rounded-full">0</span>
            </div>
            <div className="text-center py-8 bg-[#FAFAFA] rounded-xl border border-[#E5E5E5]">
              <p className="text-sm text-[#999999]">No channels found matching "{query}"</p>
            </div>
          </section>
        )}

        {/* Videos Section */}
        <section>
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E5E5]">
            <Play className="h-5 w-5 text-[#FF0000]" />
            <h2 className="text-lg font-bold text-[#1A1A1A]">Videos</h2>
            {videos && (
              <span className="bg-[#FF0000] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {videos.length}
              </span>
            )}
          </div>

          {isLoadingVideos ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF0000]" />
            </div>
          ) : videos?.length === 0 ? (
            <div className="text-center py-8 bg-[#FAFAFA] rounded-xl border border-[#E5E5E5]">
              <p className="text-sm text-[#999999]">No videos found matching "{query}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
      </main>
    </div>
  );
};

export default Search;
