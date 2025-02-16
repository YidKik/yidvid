
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

export const YouTubeChannelsSection = () => {
  const navigate = useNavigate();
  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [videoSearchQuery, setVideoSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<string | null>(null);

  const { data: channels, refetch } = useQuery({
    queryKey: ["youtube-channels", searchQuery],
    queryFn: async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
        if (sessionError) {
          console.error("Session error:", sessionError);
          toast.error("Authentication error");
          navigate("/auth");
          return [];
        }

        if (!session) {
          console.log("No active session");
          toast.error("Please sign in to access this feature");
          navigate("/auth");
          return [];
        }

        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshedSession) {
          console.error("Session refresh error:", refreshError);
          toast.error("Session expired. Please sign in again");
          navigate("/auth");
          return [];
        }

        let query = supabase
          .from("youtube_channels")
          .select("*")
          .order("created_at", { ascending: false });

        if (searchQuery.trim()) {
          query = query.ilike("title", `%${searchQuery.trim()}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching channels:", error);
          if (error.message.includes("JWT")) {
            toast.error("Session expired. Please sign in again");
            navigate("/auth");
            return [];
          }
          toast.error("Error fetching channels");
          return [];
        }

        return data || [];
      } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred");
        return [];
      }
    },
    retry: 1,
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

      // With ON DELETE CASCADE, we only need to delete the channel
      const { error: channelError } = await supabase
        .from("youtube_channels")
        .delete()
        .eq("channel_id", channelId);

      if (channelError) {
        console.error("Error deleting channel:", channelError);
        throw channelError;
      }

      toast.success("Channel deleted successfully");
      refetch();
      setSelectedChannelId(null);
    } catch (error: any) {
      console.error("Error in deletion process:", error);
      toast.error(error.message || "Error deleting channel");
    } finally {
      setIsDeleting(false);
      setChannelToDelete(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow max-h-[calc(100vh-12rem)]">
      <div className="p-6 border-b">
        <ChannelsHeader
          isVideoDialogOpen={isVideoDialogOpen}
          setIsVideoDialogOpen={setIsVideoDialogOpen}
          isChannelDialogOpen={isChannelDialogOpen}
          setIsChannelDialogOpen={setIsChannelDialogOpen}
          refetchChannels={refetch}
        />
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
            {channels?.map((channel) => (
              <ChannelListItem
                key={channel.id}
                channel={channel}
                isDeleting={isDeleting}
                onSelect={setSelectedChannelId}
                onDelete={handleDeleteChannel}
                setChannelToDelete={setChannelToDelete}
              />
            ))}
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
