
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChannelFilters } from "./ChannelFilters";
import { BulkActions } from "./BulkActions";
import { ChannelListView } from "./ChannelListView";
import { Channel, VideoCategory } from "./types";

interface ChannelManagementSectionProps {
  // Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (filter: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  
  // Bulk actions
  bulkCategory: VideoCategory | "";
  setBulkCategory: (category: VideoCategory | "") => void;
  selectedChannels: string[];
  setSelectedChannels: (channels: string[]) => void;
  onBulkUpdate: () => void;
  isUpdating: boolean;
  
  // Channel data and actions
  channels: Channel[];
  isLoading: boolean;
  onChannelSelect: (channelId: string) => void;
  onSingleChannelUpdate: (channelId: string, category: VideoCategory) => void;
  onSelectAll: () => void;
}

export const ChannelManagementSection = ({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  viewMode,
  setViewMode,
  bulkCategory,
  setBulkCategory,
  selectedChannels,
  setSelectedChannels,
  onBulkUpdate,
  isUpdating,
  channels,
  isLoading,
  onChannelSelect,
  onSingleChannelUpdate,
  onSelectAll,
}: ChannelManagementSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Category Assignment</CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage channel categories individually or in bulk. Changes will update all videos from these channels.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <ChannelFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          <BulkActions
            bulkCategory={bulkCategory}
            setBulkCategory={setBulkCategory}
            selectedChannels={selectedChannels}
            setSelectedChannels={setSelectedChannels}
            onBulkUpdate={onBulkUpdate}
            isUpdating={isUpdating}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={onSelectAll}
            disabled={channels.length === 0}
            className="w-full sm:w-auto"
          >
            {selectedChannels.length === channels.length ? "Deselect All" : "Select All"}
          </Button>
        </div>

        <ChannelListView
          channels={channels}
          viewMode={viewMode}
          selectedChannels={selectedChannels}
          onChannelSelect={onChannelSelect}
          onSingleChannelUpdate={onSingleChannelUpdate}
          isLoading={isLoading}
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
        />
      </CardContent>
    </Card>
  );
};
