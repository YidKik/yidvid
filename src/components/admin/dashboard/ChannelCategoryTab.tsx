
import { Settings } from "lucide-react";
import { CategoryStats } from "./channel-category/CategoryStats";
import { RecentChanges } from "./channel-category/RecentChanges";
import { RecentlyUpdatedChannels } from "./channel-category/RecentlyUpdatedChannels";
import { ChannelManagementSection } from "./channel-category/ChannelManagementSection";
import { useChannelCategoryManagement } from "./channel-category/useChannelCategoryManagement";

export const ChannelCategoryTab = () => {
  const {
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
  } = useChannelCategoryManagement();

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Channel Category Management</h2>
      </div>

      <CategoryStats categoryStats={categoryStats} />

      <RecentlyUpdatedChannels channels={getRecentlyUpdatedChannels()} />

      <RecentChanges 
        recentChanges={recentChanges}
        onUndoChange={handleUndoChange}
        isUpdating={isUpdating}
      />
      
      <ChannelManagementSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        bulkCategory={bulkCategory}
        setBulkCategory={setBulkCategory}
        selectedChannels={selectedChannels}
        setSelectedChannels={setSelectedChannels}
        onBulkUpdate={handleBulkCategoryUpdate}
        isUpdating={isUpdating}
        channels={channels}
        isLoading={isLoading}
        onChannelSelect={handleChannelSelect}
        onSingleChannelUpdate={handleSingleChannelUpdate}
        onSelectAll={handleSelectAll}
      />
    </div>
  );
};
