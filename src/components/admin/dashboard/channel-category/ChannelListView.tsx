
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Edit3 } from "lucide-react";
import { Channel, VideoCategory, categories } from "./types";

interface ChannelListViewProps {
  channels: Channel[];
  viewMode: 'grid' | 'list';
  selectedChannels: string[];
  onChannelSelect: (channelId: string) => void;
  onSingleChannelUpdate: (channelId: string, category: VideoCategory) => void;
  isLoading: boolean;
  searchQuery: string;
  categoryFilter: string;
}

export const ChannelListView = ({
  channels,
  viewMode,
  selectedChannels,
  onChannelSelect,
  onSingleChannelUpdate,
  isLoading,
  searchQuery,
  categoryFilter
}: ChannelListViewProps) => {
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (channels.length === 0) {
    return (
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
    );
  }

  if (viewMode === 'grid') {
    return (
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
            onClick={() => onChannelSelect(channel.channel_id)}
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
                  onValueChange={(value) => onSingleChannelUpdate(channel.channel_id, value as VideoCategory)}
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
    );
  }

  return (
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
                  onValueChange={(value) => onSingleChannelUpdate(channel.channel_id, value as VideoCategory)}
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
                  onChange={() => onChannelSelect(channel.channel_id)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
