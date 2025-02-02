import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface ChannelVideosManagementProps {
  channelId: string;
}

interface Video {
  id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  views: number;
  uploaded_at: string;
}

export const ChannelVideosManagement = ({ channelId }: ChannelVideosManagementProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);

  const { data: videos, refetch, isError, isLoading } = useQuery({
    queryKey: ["channel-videos", channelId],
    queryFn: async () => {
      console.log("Fetching videos for channel:", channelId);
      
      try {
        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .eq("channel_id", channelId)
          .order("uploaded_at", { ascending: false });

        if (error) {
          console.error("Error fetching videos:", error);
          throw error;
        }

        console.log("Fetched videos:", data?.length || 0);
        return data as Video[];
      } catch (error: any) {
        console.error("Error in queryFn:", error);
        throw new Error(error.message || "Failed to fetch videos");
      }
    },
    retry: 1, // Only retry once
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  const handleDeleteVideo = async (videoId: string) => {
    try {
      setIsDeleting(true);
      console.log("Starting video deletion process for:", videoId);

      // Delete related notifications
      const { error: notificationsError } = await supabase
        .from("video_notifications")
        .delete()
        .eq("video_id", videoId);

      if (notificationsError) {
        console.error("Error deleting notifications:", notificationsError);
        throw notificationsError;
      }

      // Delete related reports
      const { error: reportsError } = await supabase
        .from("video_reports")
        .delete()
        .eq("video_id", videoId);

      if (reportsError) {
        console.error("Error deleting reports:", reportsError);
        throw reportsError;
      }

      // Delete related comments
      const { error: commentsError } = await supabase
        .from("video_comments")
        .delete()
        .eq("video_id", videoId);

      if (commentsError) {
        console.error("Error deleting comments:", commentsError);
        throw commentsError;
      }

      // Delete video history
      const { error: historyError } = await supabase
        .from("video_history")
        .delete()
        .eq("video_id", videoId);

      if (historyError) {
        console.error("Error deleting history:", historyError);
        throw historyError;
      }

      // Delete video interactions
      const { error: interactionsError } = await supabase
        .from("user_video_interactions")
        .delete()
        .eq("video_id", videoId);

      if (interactionsError) {
        console.error("Error deleting interactions:", interactionsError);
        throw interactionsError;
      }

      // Finally, delete the video
      const { error: videoError } = await supabase
        .from("youtube_videos")
        .delete()
        .eq("id", videoId);

      if (videoError) {
        console.error("Error deleting video:", videoError);
        throw videoError;
      }

      toast.success("Video deleted successfully");
      refetch();
    } catch (error: any) {
      console.error("Error in deletion process:", error);
      toast.error("Error deleting video");
    } finally {
      setIsDeleting(false);
      setVideoToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Loading videos...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Error loading videos. Please try again later.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!videos?.length) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">No videos found for this channel.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Channel Videos</h2>
      <ScrollArea className="h-[60vh]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thumbnail</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos?.map((video) => (
              <TableRow key={video.id}>
                <TableCell>
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-24 h-16 object-cover rounded"
                  />
                </TableCell>
                <TableCell>{video.title}</TableCell>
                <TableCell>{video.views?.toLocaleString() || 0}</TableCell>
                <TableCell>
                  {new Date(video.uploaded_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isDeleting}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setVideoToDelete(video.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Video</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this video? This action cannot be undone
                          and the video will be permanently removed for all users.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setVideoToDelete(null)}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => videoToDelete && handleDeleteVideo(videoToDelete)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};