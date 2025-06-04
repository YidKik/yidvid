
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, Save, X, Settings } from "lucide-react";

interface Channel {
  id: string;
  channel_id: string;
  title: string;
  thumbnail_url?: string;
  default_category?: string;
}

type VideoCategory = "music" | "torah" | "inspiration" | "podcast" | "education" | "entertainment" | "other";

const categories = [
  { value: 'music' as const, label: 'Music' },
  { value: 'torah' as const, label: 'Torah' },
  { value: 'inspiration' as const, label: 'Inspiration' },
  { value: 'podcast' as const, label: 'Podcasts' },
  { value: 'education' as const, label: 'Education' },
  { value: 'entertainment' as const, label: 'Entertainment' },
  { value: 'other' as const, label: 'Other' },
];

export const ChannelCategoryTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [bulkCategory, setBulkCategory] = useState<VideoCategory | "">("");
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  const { data: channels = [], isLoading } = useQuery({
    queryKey: ["admin-channels-bulk", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("youtube_channels")
        .select("*")
        .is("deleted_at", null)
        .order("title", { ascending: true });

      if (searchQuery.trim()) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
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

  const handleBulkCategoryUpdate = async () => {
    if (!bulkCategory || selectedChannels.length === 0) {
      toast.error("Please select channels and a category");
      return;
    }

    setIsUpdating(true);
    try {
      // Update channels
      const { error: channelError } = await supabase
        .from("youtube_channels")
        .update({ default_category: bulkCategory })
        .in("channel_id", selectedChannels);

      if (channelError) throw channelError;

      // Update all videos from these channels
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
    } catch (error) {
      console.error("Error updating categories:", error);
      toast.error("Failed to update categories");
    } finally {
      setIsUpdating(false);
    }
  };

  const getCategoryBadgeColor = (category?: string) => {
    switch (category) {
      case 'music': return 'bg-purple-100 text-purple-800';
      case 'torah': return 'bg-blue-100 text-blue-800';
      case 'inspiration': return 'bg-yellow-100 text-yellow-800';
      case 'podcast': return 'bg-green-100 text-green-800';
      case 'education': return 'bg-indigo-100 text-indigo-800';
      case 'entertainment': return 'bg-pink-100 text-pink-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Channel Category Management</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Assign Categories to Channels</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select channels and assign categories. This will update all videos from these channels.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and Bulk Actions */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={bulkCategory} onValueChange={(value) => setBulkCategory(value as VideoCategory)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleBulkCategoryUpdate}
                disabled={!bulkCategory || selectedChannels.length === 0 || isUpdating}
                className="whitespace-nowrap"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Update Selected ({selectedChannels.length})
              </Button>
            </div>
          </div>

          {/* Selection Controls */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleSelectAll}
              disabled={channels.length === 0}
            >
              {selectedChannels.length === channels.length ? "Deselect All" : "Select All"}
            </Button>
            {selectedChannels.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setSelectedChannels([])}
                size="sm"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Selection
              </Button>
            )}
          </div>

          {/* Channels Grid */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {channels.map((channel: Channel) => (
                <div
                  key={channel.id}
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-all
                    ${selectedChannels.includes(channel.channel_id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => handleChannelSelect(channel.channel_id)}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={channel.thumbnail_url || '/placeholder.svg'}
                      alt={channel.title}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{channel.title}</h4>
                      <Badge className={`text-xs mt-2 ${getCategoryBadgeColor(channel.default_category)}`}>
                        {channel.default_category || 'No category'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {channels.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? "No channels found matching your search" : "No channels available"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
