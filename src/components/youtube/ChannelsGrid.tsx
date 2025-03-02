
import { useQuery } from "@tanstack/react-query";
import { Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { RequestChannelDialog } from "./RequestChannelDialog";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

interface ChannelsGridProps {
  onError?: (error: any) => void;
}

export const ChannelsGrid = ({ onError }: ChannelsGridProps) => {
  const [hiddenChannels, setHiddenChannels] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [manuallyFetchedChannels, setManuallyFetchedChannels] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState<any>(null);
  
  // Load hidden channels with fallback
  const { data: hiddenChannelsData } = useQuery({
    queryKey: ["hidden-channels"],
    queryFn: async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (session?.user?.id) {
          const { data, error } = await supabase
            .from('hidden_channels')
            .select('channel_id')
            .eq('user_id', session.user.id);

          if (error) {
            console.error('Error loading hidden channels:', error);
            return [];
          }
          
          setHiddenChannels(new Set(data.map(hc => hc.channel_id)));
          return data;
        }
        return [];
      } catch (error) {
        console.error('Error loading hidden channels:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Fetch channels with improved error handling and caching
  const { data: channels, error, isLoading: isChannelsLoading, refetch } = useQuery({
    queryKey: ["youtube-channels"],
    queryFn: async () => {
      try {
        console.log("Fetching YouTube channels");
        
        // Only select necessary fields to avoid potential recursion issues
        const { data, error } = await supabase
          .from("youtube_channels")
          .select("id, channel_id, title, thumbnail_url")
          .is("deleted_at", null)
          .order("title", { ascending: true });

        if (error) {
          console.error("Channel fetch error:", error);
          setFetchError(error);
          if (onError) onError(error);
          throw error;
        }
        
        console.log(`Successfully fetched ${data?.length || 0} channels`);
        return data || [];
      } catch (error: any) {
        console.error("Channel fetch error:", error);
        if (onError) onError(error);
        // Don't throw here - try manual fetch instead
        await manualFetchChannels();
        return [];
      }
    },
    retry: 0, // Don't retry automatically
    staleTime: 0, // Don't cache to always get fresh channels
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Backup method to fetch channels directly
  const manualFetchChannels = async () => {
    try {
      console.log("Attempting manual channel fetch as backup");
      
      // Using a more direct approach with minimal fields
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("id, channel_id, title, thumbnail_url")
        .is("deleted_at", null)
        .limit(100); // Limit to 100 channels to avoid overload
        
      if (error) {
        console.error("Manual channel fetch also failed:", error);
        setFetchError(error);
        toast.error("Failed to load channels. Please try again later.");
      } else {
        console.log(`Successfully fetched ${data?.length || 0} channels via backup method`);
        setManuallyFetchedChannels(data || []);
      }
    } catch (err) {
      console.error("Unexpected error in manual fetch:", err);
      setFetchError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Use effect to set loading state and ensure we try fetching right away
  useEffect(() => {
    // Force immediate fetch on mount
    refetch().catch(err => {
      console.error("Error fetching channels on mount:", err);
      manualFetchChannels();
    });
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // If we have manually fetched channels, use those
  const displayChannels = channels || manuallyFetchedChannels;

  if (isLoading || isChannelsLoading) {
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

  const visibleChannels = displayChannels?.filter(channel => !hiddenChannels.has(channel.channel_id)) || [];

  // Even if there are no visible channels, still show the "Add Channel" button
  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 md:px-4 animate-scaleIn">
      <div className="flex items-center justify-between mb-3 md:mb-8">
        <h2 className="text-base md:text-2xl font-bold text-accent">View All Channels</h2>
        <RequestChannelDialog />
      </div>
      
      {!visibleChannels || visibleChannels.length === 0 ? (
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
