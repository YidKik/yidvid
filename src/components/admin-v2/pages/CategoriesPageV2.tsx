import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart3, Search, Tag, Undo2, CheckSquare, Loader2, FolderOpen
} from "lucide-react";
import { useChannelQueries } from "@/components/admin/dashboard/channel-category/useChannelQueries";
import { useChannelOperations } from "@/components/admin/dashboard/channel-category/useChannelOperations";
import {
  categories,
  VideoCategory,
  type Channel,
  type RecentChange,
} from "@/components/admin/dashboard/channel-category/channelCategoryTypes";

export const CategoriesPageV2 = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [bulkCategory, setBulkCategory] = useState<VideoCategory | "">("");

  const { channels, isLoading, categoryStats } = useChannelQueries(searchQuery, categoryFilter);
  const {
    isUpdating,
    recentChanges,
    handleSingleChannelUpdate,
    handleBulkCategoryUpdate,
    handleUndoChange,
  } = useChannelOperations(channels);

  const toggleChannel = (channelId: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channelId) ? prev.filter((id) => id !== channelId) : [...prev, channelId]
    );
  };

  const toggleAll = () => {
    setSelectedChannels((prev) =>
      prev.length === channels.length ? [] : channels.map((c) => c.channel_id)
    );
  };

  const onBulkUpdate = async () => {
    await handleBulkCategoryUpdate(selectedChannels, bulkCategory);
    setSelectedChannels([]);
    setBulkCategory("");
  };

  const getCategoryBadge = (cat: string | undefined) => {
    const found = categories.find((c) => c.value === cat);
    if (!found) return <Badge variant="outline" className="border-[#2a2b35] text-gray-500 text-xs">None</Badge>;
    return (
      <Badge className="bg-[#1e2028] text-gray-300 border border-[#2a2b35] text-xs">
        {found.icon} {found.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Category Stats */}
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
        {categoryStats.map((stat) => {
          const cat = categories.find((c) => c.value === stat.category);
          return (
            <Card
              key={stat.category}
              className="bg-[#12131a] border-[#1e2028] cursor-pointer hover:border-[#2a2b35] transition-colors"
              onClick={() => setCategoryFilter(stat.category === "no_category" ? "all" : stat.category)}
            >
              <CardContent className="p-3 text-center">
                <div className="text-xl mb-1">{cat?.icon || "❓"}</div>
                <div className="text-xs text-gray-400 truncate">
                  {stat.category === "no_category" ? "None" : cat?.label || stat.category}
                </div>
                <div className="text-lg font-bold text-indigo-400">{stat.count}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Changes */}
      {recentChanges.length > 0 && (
        <Card className="bg-[#12131a] border-[#1e2028]">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center gap-2">
              <Undo2 className="h-4 w-4 text-indigo-400" />
              <CardTitle className="text-sm text-gray-300">Recent Changes</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="flex flex-wrap gap-2">
              {recentChanges.slice(0, 5).map((change) => (
                <div
                  key={change.id}
                  className="flex items-center gap-2 bg-[#1a1b24] border border-[#2a2b35] rounded-md px-3 py-1.5 text-xs"
                >
                  <span className="text-gray-300 font-medium">{change.channel_title}</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-indigo-400">{change.new_category}</span>
                  <button
                    onClick={() => handleUndoChange(change)}
                    disabled={isUpdating}
                    className="ml-1 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <Undo2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Management Area */}
      <Card className="bg-[#12131a] border-[#1e2028]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-indigo-400" />
              <CardTitle className="text-base text-gray-200">Channel Category Assignment</CardTitle>
            </div>
            <span className="text-xs text-gray-500">{channels.length} channels</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters Row */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-[#1a1b24] border-[#2a2b35] text-gray-200 placeholder:text-gray-500 h-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px] bg-[#1a1b24] border-[#2a2b35] text-gray-300 h-9">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1b24] border-[#2a2b35]">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="no_category">No Category</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedChannels.length > 0 && (
            <div className="flex items-center gap-3 bg-[#1a1b24] border border-indigo-500/30 rounded-lg p-3">
              <CheckSquare className="h-4 w-4 text-indigo-400" />
              <span className="text-sm text-gray-300">{selectedChannels.length} selected</span>
              <Select
                value={bulkCategory}
                onValueChange={(v) => setBulkCategory(v as VideoCategory)}
              >
                <SelectTrigger className="w-[160px] bg-[#12131a] border-[#2a2b35] text-gray-300 h-8 text-xs">
                  <SelectValue placeholder="Set category" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1b24] border-[#2a2b35]">
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={onBulkUpdate}
                disabled={!bulkCategory || isUpdating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs"
              >
                {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : "Apply"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedChannels([])}
                className="text-gray-400 hover:text-gray-200 h-8 text-xs"
              >
                Clear
              </Button>
            </div>
          )}

          {/* Channel List */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAll}
              className="text-gray-400 hover:text-gray-200 text-xs h-7"
            >
              {selectedChannels.length === channels.length && channels.length > 0
                ? "Deselect All"
                : "Select All"}
            </Button>
          </div>

          <ScrollArea className="h-[calc(100vh-28rem)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
              </div>
            ) : channels.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <FolderOpen className="h-8 w-8 mb-2" />
                <p className="text-sm">No channels found</p>
              </div>
            ) : (
              <div className="space-y-1">
                {channels.map((channel) => (
                  <div
                    key={channel.channel_id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                      selectedChannels.includes(channel.channel_id)
                        ? "bg-indigo-500/10 border-indigo-500/30"
                        : "bg-[#1a1b24] border-[#1e2028] hover:border-[#2a2b35]"
                    }`}
                  >
                    <Checkbox
                      checked={selectedChannels.includes(channel.channel_id)}
                      onCheckedChange={() => toggleChannel(channel.channel_id)}
                      className="border-[#2a2b35] data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                    />
                    <img
                      src={channel.thumbnail_url || "/placeholder.svg"}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover bg-[#1e2028]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate font-medium">{channel.title}</p>
                    </div>
                    {getCategoryBadge(channel.default_category ?? undefined)}
                    <Select
                      value={channel.default_category || ""}
                      onValueChange={(v) =>
                        handleSingleChannelUpdate(channel.channel_id, v as VideoCategory)
                      }
                    >
                      <SelectTrigger className="w-[140px] bg-[#12131a] border-[#2a2b35] text-gray-300 h-8 text-xs">
                        <SelectValue placeholder="Set category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1b24] border-[#2a2b35]">
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
