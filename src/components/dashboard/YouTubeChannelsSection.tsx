import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Video, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AddChannelForm } from "@/components/AddChannelForm";
import { AddVideoForm } from "@/components/youtube/AddVideoForm";
import { ChannelSearch } from "@/components/youtube/ChannelSearch";
import { ChannelList } from "@/components/youtube/ChannelList";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChannelVideosManagement } from "@/components/youtube/ChannelVideosManagement";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
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

  const handleDeleteChannel = async (channelId: string) => {
    try {
      setIsDeleting(true);
      console.log("Starting channel deletion process for:", channelId);

      // First, delete all videos associated with this channel
      const { error: videosError } = await supabase
        .from("youtube_videos")
        .delete()
        .eq("channel_id", channelId);

      if (videosError) {
        console.error("Error deleting videos:", videosError);
        throw videosError;
      }

      // Then delete the channel
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
      toast.error("Error deleting channel");
    } finally {
      setIsDeleting(false);
      setChannelToDelete(null);
    }
  };

  const handleSuccess = () => {
    setIsChannelDialogOpen(false);
    refetch();
    toast.success("Channel added successfully");
  };

  return (
    <div className="bg-white rounded-lg shadow max-h-[calc(100vh-12rem)]">
      <div className="p-6 border-b">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">YouTube Channels</h2>
            <div className="flex items-center gap-4">
              <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    size="lg"
                    className="inline-flex items-center justify-center gap-2 border-primary text-primary hover:bg-primary/10 font-semibold px-8 py-6 text-lg rounded-md shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    <Video className="h-6 w-6" />
                    Add Video
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Single Video</DialogTitle>
                  </DialogHeader>
                  <AddVideoForm
                    onClose={() => setIsVideoDialogOpen(false)}
                    onSuccess={() => {
                      setIsVideoDialogOpen(false);
                      refetch();
                    }}
                  />
                </DialogContent>
              </Dialog>

              <Dialog open={isChannelDialogOpen} onOpenChange={setIsChannelDialogOpen}>
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
                    onClose={() => setIsChannelDialogOpen(false)}
                    onSuccess={handleSuccess}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <ChannelSearch value={searchQuery} onChange={setSearchQuery} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search videos..."
                  value={videoSearchQuery}
                  onChange={(e) => setVideoSearchQuery(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex h-[calc(100vh-24rem)]">
        <ScrollArea className="w-1/2 border-r">
          <div className="divide-y">
            {channels?.map((channel) => (
              <div 
                key={channel.id} 
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div 
                  className="flex items-center gap-4 cursor-pointer flex-1"
                  onClick={() => setSelectedChannelId(channel.channel_id)}
                >
                  <img 
                    src={channel.thumbnail_url || '/placeholder.svg'} 
                    alt={channel.title}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{channel.title}</h3>
                    <p className="text-sm text-gray-500 truncate max-w-[200px]">
                      {channel.description || 'No description'}
                    </p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isDeleting}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
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
