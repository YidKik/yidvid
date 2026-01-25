
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Play, Clock, ExternalLink } from "lucide-react";

export const VideoHistorySection = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, user, isLoading: authLoading } = useUnifiedAuth();

  const { data: history, isLoading, error } = useQuery({
    queryKey: ["video-history", user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user?.id) {
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
            id,
            thumbnail
          )
        `)
        .eq("user_id", user.id)
        .order("watched_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching history:", error);
        throw error;
      }

      return data || [];
    },
    enabled: isAuthenticated && !!user?.id && !authLoading,
    staleTime: 60000,
    retry: 2,
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated || !user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("video_history")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-history"] });
      queryClient.invalidateQueries({ queryKey: ["user-analytics-stats"] });
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

  if (authLoading) {
    return (
      <div className="space-y-3">
        {Array(3).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-gray-100 rounded-xl text-center">
        <Play className="h-10 w-10 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">Sign in to see your watch history</p>
        <p className="text-sm text-gray-500 mt-1">Keep track of videos you've watched</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array(3).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
        <p className="text-red-600 font-medium">Error loading watch history</p>
        <Button 
          variant="outline" 
          size="sm"
          className="mt-2"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["video-history"] })}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="p-6 bg-gray-100 rounded-xl text-center">
        <Clock className="h-10 w-10 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No watch history yet</p>
        <p className="text-sm text-gray-500 mt-1">Videos you watch will appear here</p>
        <Link to="/videos">
          <Button variant="outline" size="sm" className="mt-3">
            Browse Videos
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with clear button */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500">{history.length} videos in history</p>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleClearHistory}
          disabled={clearHistoryMutation.isPending}
          className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 text-xs"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          {clearHistoryMutation.isPending ? "Clearing..." : "Clear All"}
        </Button>
      </div>

      {/* History List */}
      <ScrollArea className="h-[280px]">
        <div className="space-y-2 pr-3">
          {history.map((entry) => (
            <Link
              key={entry.id}
              to={entry.youtube_videos ? `/video/${entry.youtube_videos.video_id}` : "#"}
              className="flex gap-3 p-2 rounded-xl bg-white border border-gray-100 hover:border-red-200 hover:shadow-sm transition-all group"
            >
              {/* Thumbnail */}
              <div className="relative flex-shrink-0 w-24 h-14 rounded-lg overflow-hidden bg-gray-200">
                {entry.youtube_videos?.thumbnail ? (
                  <img
                    src={entry.youtube_videos.thumbnail}
                    alt={entry.youtube_videos.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Play className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 py-0.5">
                <p className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-red-600 transition-colors">
                  {entry.youtube_videos?.title || "Video unavailable"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {entry.youtube_videos?.channel_name || "Unknown channel"}
                </p>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(entry.watched_at), { addSuffix: true })}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
