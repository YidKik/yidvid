
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CustomCategory } from "@/types/custom-categories";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";

interface CategoryListProps {
  categories: CustomCategory[];
  onUpdate: () => void;
}

export function CategoryList({ categories, onUpdate }: CategoryListProps) {
  const [selectedCategory, setSelectedCategory] = useState<CustomCategory | null>(null);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

  const { data: videos } = useQuery({
    queryKey: ["all-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .is("deleted_at", null)
        .order("title", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: channels } = useQuery({
    queryKey: ["all-channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .order("title", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: categoryVideos } = useQuery({
    queryKey: ["category-videos", selectedCategory?.id],
    queryFn: async () => {
      if (!selectedCategory) return [];
      const { data, error } = await supabase
        .from("video_category_mappings")
        .select("video_id")
        .eq("category_id", selectedCategory.id);

      if (error) throw error;
      return data.map(mapping => mapping.video_id);
    },
    enabled: !!selectedCategory,
  });

  const { data: categoryChannels } = useQuery({
    queryKey: ["category-channels", selectedCategory?.id],
    queryFn: async () => {
      if (!selectedCategory) return [];
      const { data, error } = await supabase
        .from("channel_category_mappings")
        .select("channel_id")
        .eq("category_id", selectedCategory.id);

      if (error) throw error;
      return data.map(mapping => mapping.channel_id);
    },
    enabled: !!selectedCategory,
  });

  const handleDeleteCategory = async (id: string) => {
    try {
      const categoryToDelete = categories.find(cat => cat.id === id);
      
      if (categoryToDelete && !categoryToDelete.is_emoji) {
        const fileName = categoryToDelete.icon.split('/').pop();
        if (fileName) {
          const { error: deleteStorageError } = await supabase.storage
            .from('category-icons')
            .remove([fileName]);

          if (deleteStorageError) throw deleteStorageError;
        }
      }

      const { error } = await supabase
        .from("custom_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Category deleted successfully");
      onUpdate();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  const handleSaveContent = async () => {
    if (!selectedCategory) return;

    try {
      // Handle videos
      const { error: deleteVideoError } = await supabase
        .from("video_category_mappings")
        .delete()
        .eq("category_id", selectedCategory.id);

      if (deleteVideoError) throw deleteVideoError;

      if (selectedVideos.length > 0) {
        const { error: insertVideoError } = await supabase
          .from("video_category_mappings")
          .insert(
            selectedVideos.map(videoId => ({
              video_id: videoId,
              category_id: selectedCategory.id,
            }))
          );

        if (insertVideoError) throw insertVideoError;
      }

      // Handle channels
      const { error: deleteChannelError } = await supabase
        .from("channel_category_mappings")
        .delete()
        .eq("category_id", selectedCategory.id);

      if (deleteChannelError) throw deleteChannelError;

      if (selectedChannels.length > 0) {
        const { error: insertChannelError } = await supabase
          .from("channel_category_mappings")
          .insert(
            selectedChannels.map(channelId => ({
              channel_id: channelId,
              category_id: selectedCategory.id,
            }))
          );

        if (insertChannelError) throw insertChannelError;
      }

      toast.success("Category content updated successfully");
      setSelectedCategory(null);
    } catch (error) {
      console.error("Error updating category content:", error);
      toast.error("Failed to update category content");
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Existing Categories</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Icon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4">
                  {category.is_emoji ? (
                    <span className="text-2xl">{category.icon}</span>
                  ) : (
                    <img 
                      src={category.icon} 
                      alt={category.name}
                      className="h-8 w-8 object-cover rounded"
                    />
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{category.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {category.is_emoji ? "Emoji" : "Image"}
                  </div>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(category);
                          setSelectedVideos(categoryVideos || []);
                          setSelectedChannels(categoryChannels || []);
                        }}
                      >
                        Manage Content
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Manage Category Content: {category.name}</DialogTitle>
                      </DialogHeader>
                      <Tabs defaultValue="videos" className="w-full">
                        <TabsList className="w-full">
                          <TabsTrigger value="videos" className="flex-1">Videos</TabsTrigger>
                          <TabsTrigger value="channels" className="flex-1">Channels</TabsTrigger>
                        </TabsList>
                        <TabsContent value="videos">
                          <ScrollArea className="h-[400px] w-full border rounded-md p-4">
                            <div className="space-y-4">
                              {videos?.map((video) => (
                                <div key={video.id} className="flex items-start space-x-4">
                                  <Checkbox
                                    checked={selectedVideos.includes(video.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedVideos([...selectedVideos, video.id]);
                                      } else {
                                        setSelectedVideos(selectedVideos.filter(id => id !== video.id));
                                      }
                                    }}
                                  />
                                  <div className="flex-1">
                                    <img
                                      src={video.thumbnail}
                                      alt={video.title}
                                      className="w-24 h-16 object-cover rounded mb-2"
                                    />
                                    <p className="text-sm font-medium">{video.title}</p>
                                    <p className="text-sm text-gray-500">{video.channel_name}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </TabsContent>
                        <TabsContent value="channels">
                          <ScrollArea className="h-[400px] w-full border rounded-md p-4">
                            <div className="space-y-4">
                              {channels?.map((channel) => (
                                <div key={channel.id} className="flex items-start space-x-4">
                                  <Checkbox
                                    checked={selectedChannels.includes(channel.channel_id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedChannels([...selectedChannels, channel.channel_id]);
                                      } else {
                                        setSelectedChannels(selectedChannels.filter(id => id !== channel.channel_id));
                                      }
                                    }}
                                  />
                                  <div className="flex-1">
                                    <img
                                      src={channel.thumbnail_url || '/placeholder.svg'}
                                      alt={channel.title}
                                      className="w-12 h-12 object-cover rounded-full mb-2"
                                    />
                                    <p className="text-sm font-medium">{channel.title}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </TabsContent>
                      </Tabs>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedCategory(null)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleSaveContent}>
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
