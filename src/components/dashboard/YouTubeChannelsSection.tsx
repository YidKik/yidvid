import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Video, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AddChannelForm } from "@/components/AddChannelForm";
import { ChannelSearch } from "@/components/youtube/ChannelSearch";
import { ChannelList } from "@/components/youtube/ChannelList";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChannelVideosManagement } from "@/components/youtube/ChannelVideosManagement";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const YouTubeChannelsSection = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<string | null>(null);

  const { data: channels, refetch } = useQuery({
    queryKey: ["youtube-channels", searchQuery],
    queryFn: async () => {
      // Check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error("Authentication error:", sessionError);
        toast.error("Please sign in to access this feature");
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
    },
  });

  const handleSuccess = () => {
    setIsDialogOpen(false);
    refetch();
    toast.success("Channel added successfully");
  };

  const handleDeleteChannel = async (channelId: string) => {
    try {
      setIsDeleting(true);

      // Get all videos for this channel
      const { data: videos, error: videosError } = await supabase
        .from("youtube_videos")
        .select("id")
        .eq("channel_id", channelId);

      if (videosError) throw videosError;

      // Delete all related data for each video
      for (const video of videos || []) {
        // Delete notifications
        await supabase
          .from("video_notifications")
          .delete()
          .eq("video_id", video.id);

        // Delete reports
        await supabase
          .from("video_reports")
          .delete()
          .eq("video_id", video.id);

        // Delete comments
        await supabase
          .from("video_comments")
          .delete()
          .eq("video_id", video.id);

        // Delete history
        await supabase
          .from("video_history")
          .delete()
          .eq("video_id", video.id);

        // Delete interactions
        await supabase
          .from("user_video_interactions")
          .delete()
          .eq("video_id", video.id);
      }

      // Delete all videos
      const { error: deleteVideosError } = await supabase
        .from("youtube_videos")
        .delete()
        .eq("channel_id", channelId);

      if (deleteVideosError) throw deleteVideosError;

      // Delete channel subscriptions
      const { error: subsError } = await supabase
        .from("channel_subscriptions")
        .delete()
        .eq("channel_id", channelId);

      if (subsError) throw subsError;

      // Delete hidden channels
      const { error: hiddenError } = await supabase
        .from("hidden_channels")
        .delete()
        .eq("channel_id", channelId);

      if (hiddenError) throw hiddenError;

      // Finally delete the channel
      const { error: channelError } = await supabase
        .from("youtube_channels")
        .delete()
        .eq("channel_id", channelId);

      if (channelError) throw channelError;

      toast.success("Channel and all related content deleted successfully");
      setSelectedChannelId(null);
      refetch();
    } catch (error: any) {
      console.error("Error deleting channel:", error);
      toast.error("Error deleting channel");
    } finally {
      setIsDeleting(false);
      setChannelToDelete(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow max-h-[calc(100vh-12rem)]">
      <div className="p-6 border-b">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">YouTube Channels</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="default"
                  size="lg"
                  className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-6 text-lg rounded-md shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <Plus className="h-6 w-6" />
                  Add Channel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add YouTube Channel</DialogTitle>
                </DialogHeader>
                <AddChannelForm
                  onClose={() => setIsDialogOpen(false)}
                  onSuccess={handleSuccess}
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="w-full">
            <ChannelSearch value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>
      </div>
      <div className="flex h-[calc(100vh-24rem)]">
        <ScrollArea className="w-1/2 border-r">
          <div className="divide-y">
            {channels?.map((channel) => (
              <div 
                key={channel.id} 
                className="flex items-center justify-between p-4 hover:bg-gray-50 group"
              >
                <div 
                  className="flex items-center gap-4 cursor-pointer flex-1 min-w-0"
                  onClick={() => setSelectedChannelId(channel.channel_id)}
                >
                  <img 
                    src={channel.thumbnail_url || '/placeholder.svg'} 
                    alt={channel.title}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1 pr-4">
                    <h3 className="font-medium truncate">{channel.title}</h3>
                    <p className="text-sm text-gray-500 truncate">
                      {channel.description || 'No description'}
                    </p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isDeleting}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setChannelToDelete(channel.channel_id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Channel</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this channel? This action cannot be undone
                        and will permanently remove the channel and all its videos for all users.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setChannelToDelete(null)}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => channelToDelete && handleDeleteChannel(channelToDelete)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
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