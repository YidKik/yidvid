
import { useChannelQueries } from "./useChannelQueries";
import { useChannelOperations } from "./useChannelOperations";
import { useChannelUIState } from "./useChannelUIState";

export const useChannelCategoryManagement = () => {
  // Initialize UI state first
  const uiState = useChannelUIState([]);
  
  // Use queries with current search and filter state
  const { channels, isLoading, categoryStats } = useChannelQueries(
    uiState.searchQuery, 
    uiState.categoryFilter
  );
  
  // Update UI state with actual channels data
  const finalUIState = useChannelUIState(channels);
  
  // Use operations with actual channels
  const operations = useChannelOperations(channels);

  // Combine bulk update handler with UI state clearing
  const handleBulkCategoryUpdate = async () => {
    await operations.handleBulkCategoryUpdate(finalUIState.selectedChannels, finalUIState.bulkCategory);
    finalUIState.setSelectedChannels([]);
    finalUIState.setBulkCategory("");
  };

  return {
    // State
    searchQuery: finalUIState.searchQuery,
    setSearchQuery: finalUIState.setSearchQuery,
    categoryFilter: finalUIState.categoryFilter,
    setCategoryFilter: finalUIState.setCategoryFilter,
    selectedChannels: finalUIState.selectedChannels,
    setSelectedChannels: finalUIState.setSelectedChannels,
    bulkCategory: finalUIState.bulkCategory,
    setBulkCategory: finalUIState.setBulkCategory,
    isUpdating: operations.isUpdating,
    viewMode: finalUIState.viewMode,
    setViewMode: finalUIState.setViewMode,
    recentChanges: operations.recentChanges,
    
    // Data
    channels,
    isLoading,
    categoryStats,
    
    // Actions
    handleChannelSelect: finalUIState.handleChannelSelect,
    handleSelectAll: finalUIState.handleSelectAll,
    handleSingleChannelUpdate: operations.handleSingleChannelUpdate,
    handleBulkCategoryUpdate,
    handleUndoChange: operations.handleUndoChange,
    getRecentlyUpdatedChannels: finalUIState.getRecentlyUpdatedChannels,
  };
};
