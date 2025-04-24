
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
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSessionManager } from "@/hooks/useSessionManager";
import { Skeleton } from "@/components/ui/skeleton";

export const VideoHistorySection = () => {
  const queryClient = useQueryClient();
  const { session, isAuthenticated } = useSessionManager();

  const { data: history, isLoading, error } = useQuery({
    queryKey: ["video-history", session?.user?.id],
    queryFn: async () => {
      try {
        if (!isAuthenticated || !session?.user) {
          console.log("User not authenticated, skipping history fetch");
          return [];
        }

        const { data, error } = await supabase
          .from("video_history")
          .select(`
            *,
            youtube_videos (
              title,
              channel_name,
              video_id,
              id
            )
          `)
          .eq("user_id", session.user.id)
          .order("watched_at", { ascending: false });

        if (error) {
          console.error("Error fetching history:", error);
          toast.error("Failed to load video history");
          throw error;
        }

        return data || [];
      } catch (err) {
        console.error("Error in video history query:", err);
        return [];
      }
    },
    enabled: isAuthenticated && !!session?.user,
    staleTime: 60000, // 1 minute
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated || !session?.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("video_history")
        .delete()
        .eq("user_id", session.user.id);

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

  // If not authenticated, show appropriate message
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Watch History</h2>
        <p className="text-muted-foreground">Please sign in to view your watch history.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Watch History</h2>
          <Button variant="destructive" disabled>
            Clear History
          </Button>
        </div>
        <div className="h-[400px] rounded-md border p-4">
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-1/5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Watch History</h2>
        <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-md">
          <p className="text-destructive">Error loading watch history. Please try again later.</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["video-history"] })}
          >
            Retry
          </Button>
        </div>
      </div>
    );
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

      {!history || history.length === 0 ? (
        <p className="text-muted-foreground">No watch history found.</p>
      ) : (
        <ScrollArea className="h-[400px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky top-0 bg-background">Video</TableHead>
                <TableHead className="sticky top-0 bg-background">Channel</TableHead>
                <TableHead className="sticky top-0 bg-background">Watched</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {entry.youtube_videos ? (
                      <Link
                        to={`/video/${entry.youtube_videos.id}`}
                        className="text-primary hover:underline"
                      >
                        {entry.youtube_videos.title || "Untitled Video"}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">Video unavailable</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {entry.youtube_videos ? entry.youtube_videos.channel_name : "Unknown Channel"}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(entry.watched_at), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}
    </div>
  );
};
