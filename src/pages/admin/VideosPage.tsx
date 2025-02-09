
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/navigation/BackButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Button } from "@/components/ui/button";

const timeRanges = {
  "24h": { days: 1, label: "Last 24 hours" },
  "7d": { days: 7, label: "Last 7 days" },
  "30d": { days: 30, label: "Last 30 days" },
  "all": { days: 0, label: "All time" }
};

export default function VideosPage() {
  const [timeRange, setTimeRange] = useState<keyof typeof timeRanges>("all");
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: videos, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-videos", timeRange],
    queryFn: async () => {
      let query = supabase
        .from("youtube_videos")
        .select("*")
        .is("deleted_at", null)
        .order("uploaded_at", { ascending: false });

      if (timeRange !== "all") {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - timeRanges[timeRange].days);
        query = query.gte("uploaded_at", daysAgo.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching videos:", error);
        throw error;
      }

      return data;
    },
  });

  const handleDeleteVideo = async (videoId: string) => {
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from("youtube_videos")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", videoId);

      if (error) throw error;

      toast.success("Video deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("Failed to delete video");
    } finally {
      setIsDeleting(false);
      setVideoToDelete(null);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-500">
          Error loading videos. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <BackButton />
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Video Management</h1>
          <Select
            value={timeRange}
            onValueChange={(value: keyof typeof timeRanges) => setTimeRange(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(timeRanges).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thumbnail</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Views</TableHead>
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
                    <TableCell className="font-medium max-w-[300px] truncate">
                      {video.title}
                    </TableCell>
                    <TableCell>{video.channel_name}</TableCell>
                    <TableCell>
                      {format(new Date(video.uploaded_at), "PPP")}
                    </TableCell>
                    <TableCell>{video.views?.toLocaleString() || 0}</TableCell>
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
                              Are you sure you want to delete this video? This action cannot be undone.
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
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
