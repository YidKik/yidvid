
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/navigation/BackButton";
import { TimeRangeSelect } from "@/components/admin/TimeRangeSelect";
import { VideosTable } from "@/components/admin/VideosTable";
import { TimeRange, timeRanges } from "@/types/admin";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

export default function VideosPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useUnifiedAuth();

  const { data: videos, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-videos", timeRange],
    queryFn: async () => {
      let query = supabase
        .from("youtube_videos")
        .select("*")
        .is("deleted_at", null)
        .order("updated_at", { ascending: false });

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

      // Transform string dates to Date objects before returning
      return data?.map(video => ({
        ...video,
        created_at: new Date(video.created_at),
        updated_at: new Date(video.updated_at),
        uploaded_at: new Date(video.uploaded_at),
        deleted_at: video.deleted_at ? new Date(video.deleted_at) : undefined,
        last_viewed_at: video.last_viewed_at ? new Date(video.last_viewed_at) : undefined
      }));
    },
  });

  const handleDeleteVideo = async (videoId: string) => {
    if (!user?.id) {
      toast.error("Authentication required to delete videos");
      return;
    }

    try {
      setIsDeleting(true);
      
      // Use the new secure admin function
      const { data, error } = await supabase.rpc('admin_delete_video', {
        video_id_param: videoId,
        admin_user_id: user.id
      });

      if (error) {
        console.error("Error calling admin_delete_video:", error);
        throw new Error(error.message);
      }

      if (!data?.success) {
        console.error("Video deletion failed:", data?.error);
        throw new Error(data?.error || "Failed to delete video");
      }

      toast.success("Video deleted successfully");
      refetch();
    } catch (error: any) {
      console.error("Error deleting video:", error);
      toast.error("Failed to delete video: " + (error.message || "Unknown error"));
    } finally {
      setIsDeleting(false);
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
          <TimeRangeSelect
            value={timeRange}
            onChange={(value: TimeRange) => setTimeRange(value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <VideosTable
            videos={videos}
            isDeleting={isDeleting}
            onDeleteVideo={handleDeleteVideo}
          />
        )}
      </div>
    </div>
  );
}
