
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VideoCategory, Channel, RecentChange, validCategories } from "./channelCategoryTypes";

export const useChannelOperations = (channels: Channel[]) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [recentChanges, setRecentChanges] = useState<RecentChange[]>([]);
  const queryClient = useQueryClient();

  const handleSingleChannelUpdate = async (channelId: string, category: VideoCategory) => {
    const channel = channels.find(c => c.channel_id === channelId);
    if (!channel) return;

    const oldCategory = channel.default_category || 'no_category';
    
    setIsUpdating(true);
    try {
      const { error: channelError } = await supabase
        .from("youtube_channels")
        .update({ default_category: category })
        .eq("channel_id", channelId);

      if (channelError) throw channelError;

      const { error: videosError } = await supabase
        .from("youtube_videos")
        .update({ category: category })
        .eq("channel_id", channelId)
        .is("deleted_at", null);

      if (videosError) throw videosError;

      const newChange: RecentChange = {
        id: crypto.randomUUID(),
        channel_id: channelId,
        channel_title: channel.title,
        old_category: oldCategory,
        new_category: category,
        timestamp: new Date()
      };
      
      setRecentChanges(prev => [newChange, ...prev.slice(0, 9)]);

      toast.success(`Updated ${channel.title} to ${category} category`);
      queryClient.invalidateQueries({ queryKey: ["admin-channels-bulk"] });
      queryClient.invalidateQueries({ queryKey: ["category-stats"] });
    } catch (error) {
      console.error("Error updating channel category:", error);
      toast.error("Failed to update channel category");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkCategoryUpdate = async (selectedChannels: string[], bulkCategory: VideoCategory | "") => {
    if (!bulkCategory || selectedChannels.length === 0) {
      toast.error("Please select channels and a category");
      return;
    }

    setIsUpdating(true);
    try {
      const { error: channelError } = await supabase
        .from("youtube_channels")
        .update({ default_category: bulkCategory })
        .in("channel_id", selectedChannels);

      if (channelError) throw channelError;

      const { error: videosError } = await supabase
        .from("youtube_videos")
        .update({ category: bulkCategory })
        .in("channel_id", selectedChannels)
        .is("deleted_at", null);

      if (videosError) throw videosError;

      toast.success(`Updated ${selectedChannels.length} channels to ${bulkCategory} category`);
      queryClient.invalidateQueries({ queryKey: ["admin-channels-bulk"] });
      queryClient.invalidateQueries({ queryKey: ["category-stats"] });
    } catch (error) {
      console.error("Error updating categories:", error);
      toast.error("Failed to update categories");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUndoChange = async (change: RecentChange) => {
    setIsUpdating(true);
    try {
      // Validate the old category before casting
      const categoryToRevert = change.old_category === 'no_category' 
        ? null 
        : validCategories.includes(change.old_category as VideoCategory)
          ? (change.old_category as VideoCategory)
          : ('other' as VideoCategory);
      
      const { error: channelError } = await supabase
        .from("youtube_channels")
        .update({ default_category: categoryToRevert })
        .eq("channel_id", change.channel_id);

      if (channelError) throw channelError;

      // For videos, ensure we always use a valid VideoCategory (never null)
      const videoCategory: VideoCategory = categoryToRevert || 'other';
      const { error: videosError } = await supabase
        .from("youtube_videos")
        .update({ category: videoCategory })
        .eq("channel_id", change.channel_id)
        .is("deleted_at", null);

      if (videosError) throw videosError;

      setRecentChanges(prev => prev.filter(c => c.id !== change.id));
      toast.success(`Reverted ${change.channel_title} back to ${change.old_category}`);
      queryClient.invalidateQueries({ queryKey: ["admin-channels-bulk"] });
      queryClient.invalidateQueries({ queryKey: ["category-stats"] });
    } catch (error) {
      console.error("Error undoing change:", error);
      toast.error("Failed to undo change");
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isUpdating,
    recentChanges,
    handleSingleChannelUpdate,
    handleBulkCategoryUpdate,
    handleUndoChange,
  };
};
