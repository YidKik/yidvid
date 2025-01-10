import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const VideoHistorySection = () => {
  const queryClient = useQueryClient();

  const { data: history, isLoading } = useQuery({
    queryKey: ["video-history"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return [];

      const { data, error } = await supabase
        .from("video_history")
        .select(`
          *,
          youtube_videos (
            title,
            channel_name,
            video_id
          )
        `)
        .eq("user_id", session.session.user.id)
        .order("watched_at", { ascending: false });

      if (error) {
        console.error("Error fetching history:", error);
        toast.error("Failed to load video history");
        return [];
      }

      return data;
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("video_history")
        .delete()
        .eq("user_id", session.session.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-history"] });
      toast.success("History cleared successfully");
    },
    onError: (error) => {
      console.error("Error clearing history:", error);
      toast.error("Failed to clear history");
    },
  });

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your entire watch history?")) {
      clearHistoryMutation.mutate();
    }
  };

  if (isLoading) {
    return <div>Loading history...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Watch History</h2>
        <Button 
          variant="destructive" 
          onClick={handleClearHistory}
          disabled={!history?.length}
        >
          Clear History
        </Button>
      </div>

      {history?.length === 0 ? (
        <p className="text-muted-foreground">No watch history found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Video</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Watched</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history?.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <a
                    href={`https://youtube.com/watch?v=${entry.youtube_videos.video_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {entry.youtube_videos.title}
                  </a>
                </TableCell>
                <TableCell>{entry.youtube_videos.channel_name}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(entry.watched_at), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};