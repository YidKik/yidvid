
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
import { YoutubeVideosTable } from "@/integrations/supabase/types/youtube-videos";
import { useQuery } from "@tanstack/react-query";

interface VideoCategoryManagementProps {
  videos: YoutubeVideosTable['Row'][];
  onUpdate: () => void;
}

type VideoCategory = "music" | "torah" | "inspiration" | "podcast" | "education" | "entertainment" | "other" | "custom";

const defaultCategories: { value: VideoCategory; label: string }[] = [
  { value: "music", label: "Music" },
  { value: "torah", label: "Torah" },
  { value: "inspiration", label: "Inspiration" },
  { value: "podcast", label: "Podcast" },
  { value: "education", label: "Education" },
  { value: "entertainment", label: "Entertainment" },
  { value: "other", label: "Other" },
];

export function VideoCategoryManagement({ videos, onUpdate }: VideoCategoryManagementProps) {
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

  const { data: channels = [] } = useQuery({
    queryKey: ["youtube-channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("channel_id, default_category")
        .is("deleted_at", null);

      if (error) throw error;
      return data || [];
    },
  });

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getChannelCategory = (channelId: string) => {
    const channel = channels.find(c => c.channel_id === channelId);
    return channel?.default_category || "none";
  };

  const handleUpdateCategory = async (videoId: string) => {
    if (!selectedCategory) return;
    setIsUpdating(true);

    try {
      if (defaultCategories.some(cat => cat.value === selectedCategory)) {
        // Handle default category update
        const { error } = await supabase
          .from("youtube_videos")
          .update({ category: selectedCategory as VideoCategory })
          .eq("id", videoId);

        if (error) throw error;
      } else {
        // Handle custom category mapping
        // First, remove any existing custom category mappings
        await supabase
          .from("video_custom_category_mappings")
          .delete()
          .eq("video_id", videoId);

        // Then add the new mapping
        const { error } = await supabase
          .from("video_custom_category_mappings")
          .insert({
            video_id: videoId,
            category_id: selectedCategory
          });

        if (error) throw error;
      }

      toast.success("Video category updated successfully");
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
            placeholder="Search videos..."
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
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Channel Category
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
              {filteredVideos.map((video) => (
                <tr key={video.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="h-16 w-24 object-cover rounded"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{video.title}</div>
                    <div className="text-sm text-gray-500">{video.channel_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100">
                      {getChannelCategory(video.channel_id)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100">
                      {video.category || "No category"}
                    </span>
                    {video.category !== getChannelCategory(video.channel_id) && video.category && getChannelCategory(video.channel_id) !== "none" && (
                      <span className="ml-2 text-xs text-amber-600">
                        (Overridden)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateCategory(video.id)}
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
