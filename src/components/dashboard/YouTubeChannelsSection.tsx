
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChannelVideosManagement } from "@/components/youtube/ChannelVideosManagement";
import { ChannelsHeader } from "./youtube/ChannelsHeader";
import { ChannelListItem } from "./youtube/ChannelListItem";
import { ChannelsSearch } from "./youtube/ChannelsSearch";
import { ChannelVideosFetcher } from "@/components/youtube/ChannelVideosFetcher";

export const YouTubeChannelsSection = () => {
  const navigate = useNavigate();
  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [videoSearchQuery, setVideoSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<string | null>(null);

  const { data: channels = [], isLoading, error, refetch } = useQuery({
    queryKey: ["youtube-channels", searchQuery],
    queryFn: async () => {
      try {
        console.log("Fetching channels for admin management...");
        
        // First try direct database query
        try {
          const { data, error } = await supabase
            .from("youtube_channels")
            .select("*")
            .order("created_at", { ascending: false })
            .is("deleted_at", null);
            
          if (!error && data && data.length > 0) {
            console.log(`Successfully fetched ${data.length} channels directly`);
            return data;
          }
          
          if (error) {
            console.warn("Direct DB fetch error:", error);
          }
        } catch (directError) {
          console.error("Error in direct fetch:", directError);
        }
        
        // Try edge function as fallback
        try {
          console.log("Trying edge function to fetch channels...");
          const response = await fetch("https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-channels", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.data && Array.isArray(result.data) && result.data.length > 0) {
              console.log(`Retrieved ${result.data.length} channels with edge function`);
              
              // Apply search filter if needed
              if (searchQuery.trim()) {
                const filtered = result.data.filter(channel => 
                  channel.title.toLowerCase().includes(searchQuery.toLowerCase())
                );
                return filtered;
              }
              
              return result.data;
            }
          } else {
            console.error("Edge function error:", response.statusText);
          }
        } catch (edgeError) {
          console.error("Error calling edge function:", edgeError);
        }

        console.error("All channel fetch methods failed");
        return [];
      } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("Error fetching channels");
        return [];
      }
    },
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const handleDeleteChannel = async (channelId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to perform this action");
        navigate("/auth");
        return;
      }

      setIsDeleting(true);
      console.log("Starting channel deletion process for:", channelId);

      // Instead of directly deleting, update the deleted_at field
      const { error: channelError } = await supabase
        .from("youtube_channels")
        .update({ deleted_at: new Date().toISOString() })
        .eq("channel_id", channelId);

      if (channelError) {
        console.error("Error soft deleting channel:", channelError);
        throw new Error(`Error deleting channel: ${channelError.message}`);
      }

      // Also update the deleted_at field for related videos
      const { error: videoError } = await supabase
        .from("youtube_videos")
        .update({ deleted_at: new Date().toISOString() })
        .eq("channel_id", channelId);

      if (videoError) {
        console.error("Error soft deleting videos:", videoError);
        // Continue anyway, the channel was successfully marked as deleted
      }

      toast.success("Channel deleted successfully");
      refetch();
      
      // Reset selection if the deleted channel was selected
      if (selectedChannelId === channelId) {
        setSelectedChannelId(null);
      }
    } catch (error: any) {
      console.error("Error in deletion process:", error);
      toast.error(error.message || "Error deleting channel");
    } finally {
      setIsDeleting(false);
      setChannelToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">YouTube Channels</h2>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Channels</h2>
          <p className="text-gray-600">There was a problem fetching the channels.</p>
          <button 
            onClick={() => refetch()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow max-h-[calc(100vh-12rem)]">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <ChannelsHeader
            isVideoDialogOpen={isVideoDialogOpen}
            setIsVideoDialogOpen={setIsVideoDialogOpen}
            isChannelDialogOpen={isChannelDialogOpen}
            setIsChannelDialogOpen={setIsChannelDialogOpen}
            refetchChannels={refetch}
          />
          <ChannelVideosFetcher />
        </div>
        <div className="mt-4">
          <ChannelsSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            videoSearchQuery={videoSearchQuery}
            setVideoSearchQuery={setVideoSearchQuery}
          />
        </div>
      </div>
      <div className="flex h-[calc(100vh-24rem)]">
        <ScrollArea className="w-1/2 border-r">
          <div className="divide-y">
            {channels.length > 0 ? (
              channels.map((channel) => (
                <ChannelListItem
                  key={channel.id}
                  channel={channel}
                  isDeleting={isDeleting}
                  onSelect={setSelectedChannelId}
                  onDelete={handleDeleteChannel}
                  setChannelToDelete={setChannelToDelete}
                />
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No channels found. Try adjusting your search or add a new channel.
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="w-1/2 p-4 overflow-auto">
          {selectedChannelId ? (
            <ChannelVideosManagement channelId={selectedChannelId} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a channel to manage its videos
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
