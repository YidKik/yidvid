
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw } from "lucide-react";

export const RestoreDeletedItems = () => {
  const { user } = useUnifiedAuth();
  const [isRestoring, setIsRestoring] = useState(false);

  // Fetch deleted videos
  const { data: deletedVideos, isLoading: videosLoading, refetch: refetchVideos } = useQuery({
    queryKey: ["deleted-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch deleted channels
  const { data: deletedChannels, isLoading: channelsLoading, refetch: refetchChannels } = useQuery({
    queryKey: ["deleted-channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
  });

  const handleRestoreVideo = async (videoId: string) => {
    if (!user?.id) {
      toast.error("Authentication required");
      return;
    }

    try {
      setIsRestoring(true);
      
      const { data, error } = await supabase.rpc('admin_restore_video', {
        video_id_param: videoId,
        admin_user_id: user.id
      });

      if (error) throw new Error(error.message);
      
      if (!data?.success) {
        throw new Error(data?.error || "Failed to restore video");
      }

      toast.success("Video restored successfully");
      refetchVideos();
    } catch (error: any) {
      console.error("Error restoring video:", error);
      toast.error("Failed to restore video: " + error.message);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleRestoreChannel = async (channelId: string) => {
    if (!user?.id) {
      toast.error("Authentication required");
      return;
    }

    try {
      setIsRestoring(true);
      
      const { data, error } = await supabase.rpc('admin_restore_channel', {
        channel_id_param: channelId,
        admin_user_id: user.id
      });

      if (error) throw new Error(error.message);
      
      if (!data?.success) {
        throw new Error(data?.error || "Failed to restore channel");
      }

      toast.success("Channel and its videos restored successfully");
      refetchChannels();
      refetchVideos();
    } catch (error: any) {
      console.error("Error restoring channel:", error);
      toast.error("Failed to restore channel: " + error.message);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Restore Deleted Items</h2>
      
      <Tabs defaultValue="videos" className="w-full">
        <TabsList>
          <TabsTrigger value="videos">Deleted Videos</TabsTrigger>
          <TabsTrigger value="channels">Deleted Channels</TabsTrigger>
        </TabsList>
        
        <TabsContent value="videos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Deleted Videos ({deletedVideos?.length || 0})</h3>
            <Button variant="outline" size="sm" onClick={() => refetchVideos()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          {videosLoading ? (
            <p>Loading deleted videos...</p>
          ) : deletedVideos?.length === 0 ? (
            <p className="text-muted-foreground">No deleted videos found.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {deletedVideos?.map((video) => (
                <div key={video.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium truncate">{video.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Channel: {video.channel_name} | Deleted: {new Date(video.deleted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleRestoreVideo(video.id)}
                    disabled={isRestoring}
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="channels" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Deleted Channels ({deletedChannels?.length || 0})</h3>
            <Button variant="outline" size="sm" onClick={() => refetchChannels()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          {channelsLoading ? (
            <p>Loading deleted channels...</p>
          ) : deletedChannels?.length === 0 ? (
            <p className="text-muted-foreground">No deleted channels found.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {deletedChannels?.map((channel) => (
                <div key={channel.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{channel.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      ID: {channel.channel_id} | Deleted: {new Date(channel.deleted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleRestoreChannel(channel.channel_id)}
                    disabled={isRestoring}
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};
