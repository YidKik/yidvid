
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Loader2, 
  Search, 
  Save, 
  X, 
  Settings, 
  BarChart3, 
  Clock, 
  Undo2,
  Filter,
  Grid,
  List,
  Edit3
} from "lucide-react";

interface Channel {
  id: string;
  channel_id: string;
  title: string;
  thumbnail_url?: string;
  default_category?: string;
  updated_at: string;
}

interface CategoryStats {
  category: string;
  count: number;
}

interface RecentChange {
  id: string;
  channel_id: string;
  channel_title: string;
  old_category: string;
  new_category: string;
  timestamp: Date;
}

type VideoCategory = "music" | "torah" | "inspiration" | "podcast" | "education" | "entertainment" | "other";

const categories = [
  { value: 'music' as const, label: 'Music', icon: '🎵' },
  { value: 'torah' as const, label: 'Torah', icon: '📖' },
  { value: 'inspiration' as const, label: 'Inspiration', icon: '✨' },
  { value: 'podcast' as const, label: 'Podcasts', icon: '🎙️' },
  { value: 'education' as const, label: 'Education', icon: '🎓' },
  { value: 'entertainment' as const, label: 'Entertainment', icon: '🎬' },
  { value: 'other' as const, label: 'Other', icon: '📁' },
];

export const ChannelCategoryTab = () => {
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

      // Track the change for undo functionality
      const newChange: RecentChange = {
        id: crypto.randomUUID(),
        channel_id: channelId,
        channel_title: channel.title,
        old_category: oldCategory,
        new_category: category,
        timestamp: new Date()
      };
      
      setRecentChanges(prev => [newChange, ...prev.slice(0, 9)]); // Keep last 10 changes

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
      const categoryToRevert = change.old_category === 'no_category' ? null : change.old_category;
      
      const { error: channelError } = await supabase
        .from("youtube_channels")
        .update({ default_category: categoryToRevert })
        .eq("channel_id", change.channel_id);

      if (channelError) throw channelError;

      const { error: videosError } = await supabase
        .from("youtube_videos")
        .update({ category: categoryToRevert || 'other' })
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

  const getCategoryBadgeColor = (category?: string) => {
    switch (category) {
      case 'music': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'torah': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'inspiration': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'podcast': return 'bg-green-100 text-green-800 border-green-200';
      case 'education': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'entertainment': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'other': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getCategoryIcon = (category?: string) => {
    return categories.find(c => c.value === category)?.icon || '❓';
  };

  const getRecentlyUpdatedChannels = () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return channels.filter(channel => new Date(channel.updated_at) > oneDayAgo);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Channel Category Management</h2>
      </div>

      {/* Category Statistics */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">Category Statistics</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {categoryStats.map((stat) => (
              <div key={stat.category} className="text-center p-3 bg-gray-50 rounded-lg border">
                <div className="text-2xl mb-1">
                  {stat.category === 'no_category' ? '❓' : getCategoryIcon(stat.category)}
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {stat.category === 'no_category' ? 'No Category' : 
                   categories.find(c => c.value === stat.category)?.label}
                </div>
                <div className="text-lg font-bold text-blue-600">{stat.count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recently Updated Channels */}
      {getRecentlyUpdatedChannels().length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">Recently Updated (Last 24h)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {getRecentlyUpdatedChannels().slice(0, 10).map((channel) => (
                <Badge 
                  key={channel.id} 
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <img
                    src={channel.thumbnail_url || '/placeholder.svg'}
                    alt=""
                    className="w-4 h-4 rounded-full"
                  />
                  {channel.title.substring(0, 20)}...
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Changes & Undo */}
      {recentChanges.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Undo2 className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Recent Changes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {recentChanges.map((change) => (
                <div key={change.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="text-sm">
                    <span className="font-medium">{change.channel_title}</span>
                    <span className="text-gray-500 mx-2">→</span>
                    <span className="text-blue-600">{change.new_category}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUndoChange(change)}
                    disabled={isUpdating}
                    className="h-7 px-2"
                  >
                    <Undo2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Main Management Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Channel Category Assignment</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage channel categories individually or in bulk. Changes will update all videos from these channels.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and Filter Controls */}
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search channels by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="no_category">No Category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-blue-50 rounded-lg border">
              <Select value={bulkCategory} onValueChange={(value) => setBulkCategory(value as VideoCategory)}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Select category for bulk update" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={!bulkCategory || selectedChannels.length === 0 || isUpdating}
                    className="whitespace-nowrap"
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Update Selected ({selectedChannels.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Bulk Update</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to update {selectedChannels.length} channels to the "{bulkCategory}" category? 
                      This will also update all videos from these channels.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkCategoryUpdate}>
                      Confirm Update
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Selection Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleSelectAll}
              disabled={channels.length === 0}
              className="w-full sm:w-auto"
            >
              {selectedChannels.length === channels.length ? "Deselect All" : "Select All"}
            </Button>
            
            {selectedChannels.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedChannels.length} channel{selectedChannels.length !== 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="outline"
                  onClick={() => setSelectedChannels([])}
                  size="sm"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            )}
          </div>

          {/* Channels Display */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {channels.map((channel: Channel) => (
                <div
                  key={channel.id}
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md
                    ${selectedChannels.includes(channel.channel_id)
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => handleChannelSelect(channel.channel_id)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={channel.thumbnail_url || '/placeholder.svg'}
                        alt={channel.title}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate" title={channel.title}>
                          {channel.title}
                        </h4>
                        <div className="flex items-center justify-between mt-2">
                          <Badge className={`text-xs border ${getCategoryBadgeColor(channel.default_category)}`}>
                            {getCategoryIcon(channel.default_category)} {channel.default_category || 'No category'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Select
                        value={channel.default_category || ""}
                        onValueChange={(value) => handleSingleChannelUpdate(channel.channel_id, value as VideoCategory)}
                      >
                        <SelectTrigger 
                          className="h-8 text-xs flex-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          <SelectValue placeholder="Set category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.icon} {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium text-sm">Channel</th>
                    <th className="text-left p-3 font-medium text-sm">Current Category</th>
                    <th className="text-left p-3 font-medium text-sm">Actions</th>
                    <th className="text-left p-3 font-medium text-sm">Select</th>
                  </tr>
                </thead>
                <tbody>
                  {channels.map((channel: Channel) => (
                    <tr key={channel.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={channel.thumbnail_url || '/placeholder.svg'}
                            alt={channel.title}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-medium text-sm">{channel.title}</div>
                            <div className="text-xs text-gray-500">{channel.channel_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={`text-xs border ${getCategoryBadgeColor(channel.default_category)}`}>
                          {getCategoryIcon(channel.default_category)} {channel.default_category || 'No category'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Select
                          value={channel.default_category || ""}
                          onValueChange={(value) => handleSingleChannelUpdate(channel.channel_id, value as VideoCategory)}
                        >
                          <SelectTrigger className="w-40 h-8 text-xs">
                            <Edit3 className="h-3 w-3 mr-1" />
                            <SelectValue placeholder="Change category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.icon} {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedChannels.includes(channel.channel_id)}
                          onChange={() => handleChannelSelect(channel.channel_id)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {channels.length === 0 && !isLoading && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📺</div>
              <h3 className="text-lg font-medium mb-2">No channels found</h3>
              <p className="text-sm">
                {searchQuery || categoryFilter ? 
                  "Try adjusting your search or filter criteria" : 
                  "No channels are available in the system"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
