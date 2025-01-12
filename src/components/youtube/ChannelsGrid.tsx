import { useQuery } from "@tanstack/react-query";
import { Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const ChannelsGrid = () => {
  const { data: channels, isLoading } = useQuery({
    queryKey: ["youtube-channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .order("title", { ascending: true });

      if (error) {
        console.error("Error fetching channels:", error);
        throw error;
      }
      
      console.log("Fetched channels with thumbnails:", data); // Debug log
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-[1800px] mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-8 text-accent">YouTube Channels</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full mb-2 mx-auto" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!channels?.length) {
    return null;
  }

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-8 text-accent">YouTube Channels</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {channels.map((channel) => (
          <Link 
            key={channel.id}
            to={`/channel/${channel.channel_id}`}
            className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Avatar className="w-16 h-16">
              <AvatarImage
                src={channel.thumbnail_url}
                alt={channel.title}
                onError={(e) => {
                  console.error("Error loading thumbnail for channel:", channel.title);
                  e.currentTarget.style.display = 'none';
                }}
              />
              <AvatarFallback className="bg-primary/10">
                <Youtube className="w-8 h-8 text-primary" />
              </AvatarFallback>
            </Avatar>
            <h3 className="text-sm font-medium text-center text-accent line-clamp-2 mt-2">
              {channel.title}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
};