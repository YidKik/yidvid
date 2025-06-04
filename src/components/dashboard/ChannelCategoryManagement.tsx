
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { YoutubeChannelsTable } from "@/integrations/supabase/types/youtube-channels";
import { useQuery } from "@tanstack/react-query";

interface ChannelCategoryManagementProps {
  channels: YoutubeChannelsTable['Row'][];
  onUpdate: () => void;
}

type VideoCategory = "music" | "torah" | "inspiration" | "podcast" | "education" | "entertainment" | "other";

const defaultCategories: { value: VideoCategory; label: string }[] = [
  { value: "music", label: "Music" },
  { value: "torah", label: "Torah" },
  { value: "inspiration", label: "Inspiration" },
  { value: "podcast", label: "Podcast" },
  { value: "education", label: "Education" },
  { value: "entertainment", label: "Entertainment" },
  { value: "other", label: "Other" },
];

export function ChannelCategoryManagement({ channels, onUpdate }: ChannelCategoryManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: customCategories = [] } = useQuery({
    queryKey: ["custom-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const filteredChannels = channels.filter((channel) =>
    channel.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateCategory = async (channelId: string) => {
    if (!selectedCategory) return;
    setIsUpdating(true);

    try {
      if (defaultCategories.some(cat => cat.value === selectedCategory)) {
        // Handle default category update
        const { error } = await supabase
          .from("youtube_channels")
          .update({ default_category: selectedCategory as VideoCategory })
          .eq("channel_id", channelId);

        if (error) throw error;
        
        // Update all existing videos from this channel to match the channel's category
        const { error: videoError } = await supabase
          .from("youtube_videos")
          .update({ category: selectedCategory as VideoCategory })
          .eq("channel_id", channelId)
          .is("deleted_at", null);

        if (videoError) throw videoError;
        
      } else {
        // Handle custom category mapping - first remove existing mappings
        await supabase
          .from("channel_custom_category_mappings")
          .delete()
          .eq("channel_id", channelId);

        // Add new mapping
        const { error } = await supabase
          .from("channel_custom_category_mappings")
          .insert({
            channel_id: channelId,
            category_id: selectedCategory
          });

        if (error) throw error;

        // Update videos with custom category mapping
        const { data: channelVideos } = await supabase
          .from("youtube_videos")
          .select("id")
          .eq("channel_id", channelId)
          .is("deleted_at", null);
          
        if (channelVideos && channelVideos.length > 0) {
          const videoIds = channelVideos.map(video => video.id);
          
          // Delete existing mappings
          await supabase
            .from("video_custom_category_mappings")
            .delete()
            .in("video_id", videoIds);
          
          // Create new mappings
          const newMappings = videoIds.map(videoId => ({
            video_id: videoId,
            category_id: selectedCategory
          }));
          
          if (newMappings.length > 0) {
            const { error: mappingError } = await supabase
              .from("video_custom_category_mappings")
              .insert(newMappings);
              
            if (mappingError) throw mappingError;
          }
        }
      }

      toast.success("Channel category updated successfully");
      onUpdate();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
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
          <Select 
            value={selectedCategory || ""} 
            onValueChange={(value) => setSelectedCategory(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg border rounded-md z-50">
              {defaultCategories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
              {customCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thumbnail
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Channel Name
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
              {filteredChannels.map((channel) => (
                <tr key={channel.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={channel.thumbnail_url || '/placeholder.svg'}
                      alt={channel.title}
                      className="h-16 w-16 object-cover rounded"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{channel.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100">
                      {channel.default_category || "No category"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateCategory(channel.channel_id)}
                      disabled={!selectedCategory || isUpdating}
                    >
                      {isUpdating ? "Updating..." : "Update Category"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
