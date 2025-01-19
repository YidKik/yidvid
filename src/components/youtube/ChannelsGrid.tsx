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
      
      console.log("Fetched channels with thumbnails:", data);
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-[1800px] mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-accent">YouTube Channels</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="w-20 h-20 bg-gray-200 rounded-full mb-2 mx-auto" />
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
    <div className="w-full max-w-[1800px] mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-accent">YouTube Channels</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {channels.map((channel) => (
          <Link 
            key={channel.id}
            to={`/channel/${channel.channel_id}`}
            className="group flex flex-col items-center p-6 rounded-lg bg-card hover:bg-accent/5 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
          >
            <Avatar className="w-24 h-24 mb-4 transition-transform group-hover:scale-105">
              <AvatarImage
                src={channel.thumbnail_url}
                alt={channel.title}
                className="object-cover"
                onError={(e) => {
                  console.error("Error loading thumbnail for channel:", channel.title);
                  e.currentTarget.style.display = 'none';
                }}
              />
              <AvatarFallback className="bg-primary/10">
                <Youtube className="w-12 h-12 text-primary" />
              </AvatarFallback>
            </Avatar>
            <h3 className="text-sm font-medium text-center line-clamp-2 group-hover:text-[#ea384c] transition-colors">
              {channel.title}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
};