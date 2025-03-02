
import { useQuery } from "@tanstack/react-query";
import { Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { RequestChannelDialog } from "./RequestChannelDialog";
import { useDebounce } from "@/hooks/use-debounce";

interface ChannelsGridProps {
  onError?: (error: any) => void;
}

export const ChannelsGrid = ({ onError }: ChannelsGridProps) => {
  const [hiddenChannels, setHiddenChannels] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  
  // Load session with proper caching
  const { data: session } = useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
      } catch (error) {
        console.error("Session fetch error:", error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Load hidden channels with error handling
  const { data: hiddenChannelsData } = useQuery({
    queryKey: ["hidden-channels", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('hidden_channels')
          .select('channel_id')
          .eq('user_id', session!.user.id);

        if (error) {
          console.error('Error loading hidden channels:', error);
          return [];
        }
        
        setHiddenChannels(new Set(data.map(hc => hc.channel_id)));
        return data;
      } catch (error) {
        console.error('Error loading hidden channels:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Fetch channels with improved error handling and caching
  const { data: channels, error } = useQuery({
    queryKey: ["youtube-channels"],
    queryFn: async () => {
      try {
        // Only select necessary fields to avoid potential recursion issues
        const { data, error } = await supabase
          .from("youtube_channels")
          .select("id, channel_id, title, thumbnail_url")
          .is("deleted_at", null)
          .order("title", { ascending: true });

        if (error) {
          console.error("Channel fetch error:", error);
          if (onError) onError(error);
          return []; // Return empty array instead of throwing
        }
        
        return data || [];
      } catch (error: any) {
        console.error("Channel fetch error:", error);
        if (onError) onError(error);
        return []; // Return empty array instead of throwing
      }
    },
    retry: (failureCount, error: any) => {
      // Only retry network errors, max 2 times
      if (error?.message?.includes('Failed to fetch')) return failureCount < 2;
      return false;
    },
    retryDelay: 2000, // Fixed 2 second delay between retries
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    meta: {
      errorMessage: "Channels fetch error handled silently",
      suppressToasts: true
    }
  });

  // Use effect to set loading state with a small delay to ensure UI renders properly
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [channels]);

  if (isLoading) {
    return (
      <div className="w-full max-w-[1600px] mx-auto px-3 md:px-4">
        <div className="flex items-center justify-between mb-3 md:mb-8">
          <h2 className="text-base md:text-2xl font-bold text-accent">View All Channels</h2>
          <RequestChannelDialog />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="w-12 h-12 md:w-20 md:h-20 bg-gray-200 rounded-full mb-2 mx-auto" />
              <div className="h-3 md:h-4 bg-gray-200 rounded w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const visibleChannels = channels?.filter(channel => !hiddenChannels.has(channel.channel_id)) || [];

  // Even if there are no visible channels, still show the "Add Channel" button
  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 md:px-4 animate-scaleIn">
      <div className="flex items-center justify-between mb-3 md:mb-8">
        <h2 className="text-base md:text-2xl font-bold text-accent">View All Channels</h2>
        <RequestChannelDialog />
      </div>
      
      {visibleChannels.length === 0 ? (
        <div className="bg-[#F5F5F5] rounded-lg p-6 text-center">
          <Youtube className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">No channels available yet</p>
          <p className="text-sm text-gray-500 mb-4">Channels will appear here once they're added to the system.</p>
          <p className="text-xs text-gray-400">You can request a new channel using the button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
          {visibleChannels.map((channel, index) => (
            <div 
              key={channel.id}
              className="opacity-0 animate-fadeIn group flex flex-col items-center p-2 md:p-6 rounded-lg bg-[#F5F5F5] hover:bg-[#E8E8E8] transition-all duration-300"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'forwards'
              }}
            >
              <Link 
                to={`/channel/${channel.channel_id}`}
                className="block mb-2 md:mb-4"
              >
                <Avatar className="w-12 h-12 md:w-24 md:h-24 transition-transform duration-300 group-hover:scale-110 cursor-pointer">
                  <AvatarImage
                    src={channel.thumbnail_url}
                    alt={channel.title}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/10">
                    <Youtube className="w-6 h-6 md:w-12 md:h-12 text-primary" />
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Link 
                to={`/channel/${channel.channel_id}`}
                className="text-[10px] md:text-sm font-medium text-center line-clamp-2 group-hover:text-[#ea384c] transition-colors duration-300"
              >
                {channel.title}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
