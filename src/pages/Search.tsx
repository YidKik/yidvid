
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VideoCard } from "@/components/VideoCard";
import { Header } from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { BackButton } from "@/components/navigation/BackButton";
import { useEffect, useState } from "react";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [isEdgeFunctionAvailable, setIsEdgeFunctionAvailable] = useState(true);

  // Check if edge function is available
  useEffect(() => {
    const checkEdgeFunction = async () => {
      try {
        const response = await fetch(`https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/quick-search?q=test`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
          }
        });
        setIsEdgeFunctionAvailable(response.ok);
      } catch (error) {
        console.error("Edge function check failed:", error);
        setIsEdgeFunctionAvailable(false);
      }
    };
    
    checkEdgeFunction();
  }, []);

  // Use edge function if available
  const fetchSearchResults = async (searchQuery: string) => {
    if (!searchQuery.trim()) return { videos: [], channels: [] };
    
    if (isEdgeFunctionAvailable) {
      try {
        const response = await fetch(`https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/quick-search?q=${encodeURIComponent(searchQuery)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          return result.data || { videos: [], channels: [] };
        }
      } catch (error) {
        console.error("Edge function search error:", error);
        // Fall back to direct queries
      }
    }
    
    // Direct query fallback
    const [videosResult, channelsResult] = await Promise.all([
      supabase
        .from("youtube_videos")
        .select("*")
        .filter('deleted_at', 'is', null)
        .or(`title.ilike.%${searchQuery}%,channel_name.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(50),
        
      supabase
        .from("youtube_channels")
        .select("*")
        .filter('deleted_at', 'is', null)
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(50)
    ]);
    
    return {
      videos: videosResult.data || [],
      channels: channelsResult.data || []
    };
  };

  const { data, isLoading } = useQuery({
    queryKey: ["search-results", query],
    queryFn: async () => fetchSearchResults(query),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    gcTime: 1000 * 60 * 15,   // 15 minutes garbage collection
  });

  const videos = data?.videos || [];
  const channels = data?.channels || [];

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
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center p-4 animate-pulse">
                    <div className="w-20 h-20 rounded-full bg-gray-200 mb-3"></div>
                    <div className="h-4 bg-gray-200 w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 w-16"></div>
                  </div>
                ))}
              </div>
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
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-video w-full rounded-lg mb-2"></div>
                    <div className="h-4 bg-gray-200 w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 w-1/2"></div>
                  </div>
                ))}
              </div>
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
                    channelId={video.channel_id}
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
