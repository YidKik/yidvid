import { useQuery } from "@tanstack/react-query";
import { Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
      
      console.log("Fetched channels:", data); // Add this log to debug thumbnail data
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
            <div className="w-16 h-16 rounded-full mb-2 overflow-hidden flex items-center justify-center bg-primary/10">
              {channel.thumbnail_url ? (
                <img
                  src={channel.thumbnail_url}
                  alt={channel.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Error loading thumbnail:", e);
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.removeAttribute('style');
                  }}
                />
              ) : null}
              <Youtube 
                className="w-8 h-8 text-primary" 
                style={{ display: channel.thumbnail_url ? 'none' : 'block' }}
              />
            </div>
            <h3 className="text-sm font-medium text-center text-accent line-clamp-2">
              {channel.title}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
};