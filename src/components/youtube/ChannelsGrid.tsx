import { useQuery } from "@tanstack/react-query";
import { Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { RequestChannelDialog } from "./RequestChannelDialog";

interface ChannelsGridProps {
  onError?: (error: any) => void;
}

export const ChannelsGrid = ({ onError }: ChannelsGridProps) => {
  const [hiddenChannels, setHiddenChannels] = useState<Set<string>>(new Set());

  // Load hidden channels
  useEffect(() => {
    const loadHiddenChannels = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: hiddenChannelsData, error } = await supabase
        .from('hidden_channels')
        .select('channel_id')
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error loading hidden channels:', error);
        return;
      }

      setHiddenChannels(new Set(hiddenChannelsData.map(hc => hc.channel_id)));
    };

    loadHiddenChannels();
  }, []);

  const { data: channels, isLoading } = useQuery({
    queryKey: ["youtube-channels"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("youtube_channels")
          .select("*")
          .order("title", { ascending: true });

        if (error) {
          console.error("Error fetching channels:", error);
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error("Channel fetch error:", error);
        onError?.(error);
        return []; // Return empty array instead of throwing
      }
    },
    retry: (failureCount, error: any) => {
      if (error.message?.includes('Failed to fetch')) return failureCount < 3;
      return failureCount < 1;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Trigger video and thumbnail fetch for channels
  useEffect(() => {
    const updateChannels = async () => {
      if (!channels?.length) return;

      const channelIds = channels.map(channel => channel.channel_id);

      try {
        // Fetch videos for channels that haven't been updated recently
        await supabase.functions.invoke('fetch-youtube-videos', {
          body: { channels: channelIds }
        }).catch(error => {
          console.error('Error fetching videos:', error);
          // Don't throw - allow the component to continue working
        });

        // Update channel thumbnails
        await supabase.functions.invoke('update-channel-thumbnails', {
          body: { channels: channelIds }
        }).catch(error => {
          console.error('Error updating thumbnails:', error);
          // Don't throw - allow the component to continue working
        });
      } catch (error) {
        console.error('Error updating channels:', error);
        onError?.(error);
      }
    };

    updateChannels();
  }, [channels]);

  if (isLoading) {
    return (
      <div className="w-full max-w-[1600px] mx-auto px-4">
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <h2 className="text-lg md:text-2xl font-bold text-accent">View All Channels</h2>
          <RequestChannelDialog />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-full mb-2 mx-auto" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Filter out hidden channels
  const visibleChannels = channels?.filter(channel => !hiddenChannels.has(channel.channel_id)) || [];

  if (!visibleChannels.length) {
    return (
      <div className="w-full max-w-[1600px] mx-auto px-4">
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <h2 className="text-lg md:text-2xl font-bold text-accent">View All Channels</h2>
          <RequestChannelDialog />
        </div>
        <div className="text-center py-8 text-gray-500">
          No channels available
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 animate-scaleIn">
      <div className="flex items-center justify-between mb-4 md:mb-8">
        <h2 className="text-lg md:text-2xl font-bold text-accent">View All Channels</h2>
        <RequestChannelDialog />
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
        {visibleChannels.map((channel, index) => (
          <div 
            key={channel.id}
            className="opacity-0 animate-fadeIn group flex flex-col items-center p-2 md:p-6 rounded-lg bg-card hover:bg-accent/5 transition-all duration-300"
            style={{ 
              animationDelay: `${index * 0.1}s`,
              animationFillMode: 'forwards'
            }}
          >
            <Link 
              to={`/channel/${channel.channel_id}`}
              className="block mb-2 md:mb-4"
            >
              <Avatar className="w-16 h-16 md:w-24 md:h-24 transition-transform duration-300 group-hover:scale-110 cursor-pointer">
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
                  <Youtube className="w-8 h-8 md:w-12 md:h-12 text-primary" />
                </AvatarFallback>
              </Avatar>
            </Link>
            <Link 
              to={`/channel/${channel.channel_id}`}
              className="text-xs md:text-sm font-medium text-center line-clamp-2 group-hover:text-[#ea384c] transition-colors duration-300"
            >
              {channel.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
