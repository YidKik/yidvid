import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type InteractionType = "like" | "save" | "view" | "dislike";

export const useVideoLibrary = (userId?: string) => {
  const queryClient = useQueryClient();

  // Fetch user's video interactions (favorites = like, watch later = save)
  const { data: interactions, isLoading: isLoadingInteractions } = useQuery({
    queryKey: ["video-interactions", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("user_video_interactions")
        .select(`
          *,
          video:youtube_videos(*)
        `)
        .eq("user_id", userId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Fetch user's playlists
  const { data: playlists, isLoading: isLoadingPlaylists } = useQuery({
    queryKey: ["video-playlists", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("video_playlists")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Get favorites (liked videos)
  const favorites = interactions?.filter((i) => i.interaction_type === "like") || [];

  // Get watch later (saved videos)
  const watchLater = interactions?.filter((i) => i.interaction_type === "save") || [];

  // Check if video is in favorites
  const isInFavorites = (videoId: string) => {
    return favorites.some((f) => f.video_id === videoId);
  };

  // Check if video is in watch later
  const isInWatchLater = (videoId: string) => {
    return watchLater.some((w) => w.video_id === videoId);
  };

  // Toggle favorite
  const toggleFavorite = useMutation({
    mutationFn: async (videoId: string) => {
      if (!userId) throw new Error("Not authenticated");
      
      const existing = favorites.find((f) => f.video_id === videoId);
      
      if (existing) {
        const { error } = await supabase
          .from("user_video_interactions")
          .delete()
          .eq("id", existing.id);
        if (error) throw error;
        return { action: "removed" };
      } else {
        const { error } = await supabase
          .from("user_video_interactions")
          .insert({
            user_id: userId,
            video_id: videoId,
            interaction_type: "like" as InteractionType,
          });
        if (error) throw error;
        return { action: "added" };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["video-interactions", userId] });
      toast.success(result.action === "added" ? "Added to Favorites" : "Removed from Favorites");
    },
    onError: () => {
      toast.error("Failed to update favorites");
    },
  });

  // Toggle watch later
  const toggleWatchLater = useMutation({
    mutationFn: async (videoId: string) => {
      if (!userId) throw new Error("Not authenticated");
      
      const existing = watchLater.find((w) => w.video_id === videoId);
      
      if (existing) {
        const { error } = await supabase
          .from("user_video_interactions")
          .delete()
          .eq("id", existing.id);
        if (error) throw error;
        return { action: "removed" };
      } else {
        const { error } = await supabase
          .from("user_video_interactions")
          .insert({
            user_id: userId,
            video_id: videoId,
            interaction_type: "save" as InteractionType,
          });
        if (error) throw error;
        return { action: "added" };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["video-interactions", userId] });
      toast.success(result.action === "added" ? "Added to Watch Later" : "Removed from Watch Later");
    },
    onError: () => {
      toast.error("Failed to update watch later");
    },
  });

  // Create playlist
  const createPlaylist = useMutation({
    mutationFn: async ({ title, description }: { title: string; description?: string }) => {
      if (!userId) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("video_playlists")
        .insert({
          user_id: userId,
          title,
          description,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-playlists", userId] });
      toast.success("Playlist created");
    },
    onError: () => {
      toast.error("Failed to create playlist");
    },
  });

  // Update playlist
  const updatePlaylist = useMutation({
    mutationFn: async ({ id, title, description }: { id: string; title: string; description?: string }) => {
      const { error } = await supabase
        .from("video_playlists")
        .update({ title, description })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-playlists", userId] });
      toast.success("Playlist updated");
    },
    onError: () => {
      toast.error("Failed to update playlist");
    },
  });

  // Delete playlist
  const deletePlaylist = useMutation({
    mutationFn: async (playlistId: string) => {
      const { error } = await supabase
        .from("video_playlists")
        .delete()
        .eq("id", playlistId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-playlists", userId] });
      toast.success("Playlist deleted");
    },
    onError: () => {
      toast.error("Failed to delete playlist");
    },
  });

  // Add video to playlist
  const addToPlaylist = useMutation({
    mutationFn: async ({ playlistId, videoId }: { playlistId: string; videoId: string }) => {
      const { error } = await supabase
        .from("video_playlist_items")
        .insert({
          playlist_id: playlistId,
          video_id: videoId,
        });
      if (error) {
        if (error.code === "23505") {
          throw new Error("Video already in playlist");
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlist-items"] });
      toast.success("Added to playlist");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add to playlist");
    },
  });

  // Remove video from playlist
  const removeFromPlaylist = useMutation({
    mutationFn: async ({ playlistId, videoId }: { playlistId: string; videoId: string }) => {
      const { error } = await supabase
        .from("video_playlist_items")
        .delete()
        .eq("playlist_id", playlistId)
        .eq("video_id", videoId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlist-items"] });
      toast.success("Removed from playlist");
    },
    onError: () => {
      toast.error("Failed to remove from playlist");
    },
  });

  return {
    favorites,
    watchLater,
    playlists,
    isLoading: isLoadingInteractions || isLoadingPlaylists,
    isInFavorites,
    isInWatchLater,
    toggleFavorite,
    toggleWatchLater,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addToPlaylist,
    removeFromPlaylist,
  };
};

export const usePlaylistItems = (playlistId?: string) => {
  return useQuery({
    queryKey: ["playlist-items", playlistId],
    queryFn: async () => {
      if (!playlistId) return [];
      const { data, error } = await supabase
        .from("video_playlist_items")
        .select(`
          *,
          video:youtube_videos(*)
        `)
        .eq("playlist_id", playlistId)
        .order("position", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!playlistId,
  });
};
