
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Channel,
  CategoryStats,
  RecentChange,
  VideoCategory,
  categories
} from "./types";

export const useChannelCategoryManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [bulkCategory, setBulkCategory] = useState<VideoCategory | "">("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [recentChanges, setRecentChanges] = useState<RecentChange[]>([]);
  const queryClient = useQueryClient();

  const { data: channels = [], isLoading } = useQuery({
    queryKey: ["admin-channels-bulk", searchQuery, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from("youtube_channels")
        .select("*")
        .is("deleted_at", null)
        .order("updated_at", { ascending: false });

      if (searchQuery.trim()) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      if (categoryFilter) {
        if (categoryFilter === 'no_category') {
          query = query.is("default_category", null);
        } else {
          query = query.eq("default_category", categoryFilter);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const { data: categoryStats = [] } = useQuery({
    queryKey: ["category-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("default_category")
        .is("deleted_at", null);

      if (error) throw error;

      const stats: CategoryStats[] = [];
      const counts = data.reduce((acc, channel) => {
        const category = channel.default_category || 'no_category';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      categories.forEach(cat => {
        stats.push({ category: cat.value, count: counts[cat.value] || 0 });
      });
      stats.push({ category: 'no_category', count: counts['no_category'] || 0 });

      return stats;
    },
  });

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleSelectAll = () => {
    const filteredChannelIds = channels.map(channel => channel.channel_id);
    setSelectedChannels(prev => 
      prev.length === filteredChannelIds.length 
        ? []
        : filteredChannelIds
    );
  };

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

  const handleBulkCategoryUpdate = async () => {
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
      setSelectedChannels([]);
      setBulkCategory("");
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
      const validCategories: VideoCategory[] = ['music', 'torah', 'inspiration', 'podcast', 'education', 'entertainment', 'other'];
      const categoryToRevert = change.old_category === 'no_category' 
        ? null 
        : validCategories.includes(change.old_category as VideoCategory)
          ? change.old_category as VideoCategory
          : 'other';
      
      const { error: channelError } = await supabase
        .from("youtube_channels")
        .update({ default_category: categoryToRevert })
        .eq("channel_id", change.channel_id);

      if (channelError) throw channelError;

      // For videos, ensure we always use a valid VideoCategory (never null)
      const videoCategory = categoryToRevert || 'other';
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

  const getRecentlyUpdatedChannels = () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return channels.filter(channel => new Date(channel.updated_at) > oneDayAgo);
  };

  return {
    // State
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    selectedChannels,
    setSelectedChannels,
    bulkCategory,
    setBulkCategory,
    isUpdating,
    viewMode,
    setViewMode,
    recentChanges,
    
    // Data
    channels,
    isLoading,
    categoryStats,
    
    // Actions
    handleChannelSelect,
    handleSelectAll,
    handleSingleChannelUpdate,
    handleBulkCategoryUpdate,
    handleUndoChange,
    getRecentlyUpdatedChannels,
  };
};
