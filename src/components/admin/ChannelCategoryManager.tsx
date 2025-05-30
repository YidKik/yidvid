
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";

interface Channel {
  id: string;
  channel_id: string;
  title: string;
  thumbnail_url?: string;
  default_category?: string;
}

const categories = [
  { value: 'all', label: 'All Videos' },
  { value: 'music', label: 'Music' },
  { value: 'torah', label: 'Torah' },
  { value: 'inspiration', label: 'Inspiration' },
  { value: 'podcast', label: 'Podcasts' },
  { value: 'education', label: 'Education' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'other', label: 'Other' },
];

export const ChannelCategoryManager = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: channels = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-channels", searchQuery],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .is("deleted_at", null)
        .ilike("title", `%${searchQuery}%`)
        .order("title", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const handleUpdateChannelCategory = async (channelId: string, category: string) => {
    if (!category) return;
    
    setIsUpdating(true);
    try {
      // Update the channel's default category
      const { error: channelError } = await supabase
        .from("youtube_channels")
        .update({ default_category: category })
        .eq("channel_id", channelId);

      if (channelError) throw channelError;

      // Update all videos from this channel to match the category
      const { error: videosError } = await supabase
        .from("youtube_videos")
        .update({ category })
        .eq("channel_id", channelId)
        .is("deleted_at", null);

      if (videosError) throw videosError;

      toast.success("Channel category updated successfully");
      refetch();
    } catch (error) {
      console.error("Error updating channel category:", error);
      toast.error("Failed to update channel category");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveChannelCategory = async (channelId: string) => {
    setIsUpdating(true);
    try {
      // Remove the channel's default category
      const { error: channelError } = await supabase
        .from("youtube_channels")
        .update({ default_category: null })
        .eq("channel_id", channelId);

      if (channelError) throw channelError;

      // Reset all videos from this channel to 'other' category
      const { error: videosError } = await supabase
        .from("youtube_videos")
        .update({ category: 'other' })
        .eq("channel_id", channelId)
        .is("deleted_at", null);

      if (videosError) throw videosError;

      toast.success("Channel category removed successfully");
      refetch();
    } catch (error) {
      console.error("Error removing channel category:", error);
      toast.error("Failed to remove channel category");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredChannels = channels.filter((channel: Channel) =>
    channel.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Category Management</CardTitle>
        <p className="text-sm text-muted-foreground">
          Assign categories to channels. All videos from a channel will automatically inherit its category.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.filter(cat => cat.value !== 'all').map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Channel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredChannels.map((channel: Channel) => (
                    <tr key={channel.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img
                            src={channel.thumbnail_url || '/placeholder.svg'}
                            alt={channel.title}
                            className="h-10 w-10 rounded-full mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {channel.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {channel.channel_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100">
                          {channel.default_category || "No category"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateChannelCategory(channel.channel_id, selectedCategory)}
                          disabled={!selectedCategory || isUpdating}
                        >
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Update Category"
                          )}
                        </Button>
                        {channel.default_category && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveChannelCategory(channel.channel_id)}
                            disabled={isUpdating}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
