
import { useState } from "react";
import { VideoCategory, Channel } from "./channelCategoryTypes";

export const useChannelUIState = (channels: Channel[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [bulkCategory, setBulkCategory] = useState<VideoCategory | "">("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const getRecentlyUpdatedChannels = () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return channels.filter(channel => new Date(channel.updated_at) > oneDayAgo);
  };

  return {
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    selectedChannels,
    setSelectedChannels,
    bulkCategory,
    setBulkCategory,
    viewMode,
    setViewMode,
    handleChannelSelect,
    handleSelectAll,
    getRecentlyUpdatedChannels,
  };
};
