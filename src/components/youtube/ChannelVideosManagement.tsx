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

export const ChannelVideosManagement = ({ channelId }: ChannelVideosManagementProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);

  const { data: videos, refetch } = useQuery({
    queryKey: ["channel-videos", channelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .eq("channel_id", channelId)
        .order("uploaded_at", { ascending: false });

      if (error) {
        toast.error("Error fetching videos");
        throw error;
      }

      return data || [];
    },
  });

  const handleDeleteVideo = async (videoId: string) => {
    try {
      setIsDeleting(true);

      // First, delete related notifications
      const { error: notificationsError } = await supabase
        .from("video_notifications")
        .delete()
        .eq("video_id", videoId);

      if (notificationsError) throw notificationsError;

      // Then, delete related reports
      const { error: reportsError } = await supabase
        .from("video_reports")
        .delete()
        .eq("video_id", videoId);

      if (reportsError) throw reportsError;

      // Delete related comments
      const { error: commentsError } = await supabase
        .from("video_comments")
        .delete()
        .eq("video_id", videoId);

      if (commentsError) throw commentsError;

      // Delete video history
      const { error: historyError } = await supabase
        .from("video_history")
        .delete()
        .eq("video_id", videoId);

      if (historyError) throw historyError;

      // Delete video interactions
      const { error: interactionsError } = await supabase
        .from("user_video_interactions")
        .delete()
        .eq("video_id", videoId);

      if (interactionsError) throw interactionsError;

      // Finally, delete the video
      const { error: videoError } = await supabase
        .from("youtube_videos")
        .delete()
        .eq("id", videoId);

      if (videoError) throw videoError;

      toast.success("Video deleted successfully");
      refetch();
    } catch (error: any) {
      toast.error("Error deleting video");
      console.error("Error deleting video:", error);
    } finally {
      setIsDeleting(false);
      setVideoToDelete(null);
    }
  };

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