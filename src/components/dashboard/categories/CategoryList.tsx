
import { Card } from "@/components/ui/card";
import { CustomCategory } from "@/types/custom-categories";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CategoryTable } from "./list/CategoryTable";
import { CategoryContentManager } from "./list/CategoryContentManager";

interface CategoryListProps {
  categories: CustomCategory[];
  onUpdate: () => void;
}

export function CategoryList({ categories, onUpdate }: CategoryListProps) {
  const [selectedCategory, setSelectedCategory] = useState<CustomCategory | null>(null);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

  const { data: categoryVideos } = useQuery({
    queryKey: ["category-videos", selectedCategory?.id],
    queryFn: async () => {
      if (!selectedCategory) return [];
      const { data, error } = await supabase
        .from("video_custom_category_mappings")
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
        .from("channel_custom_category_mappings")
        .select("channel_id")
        .eq("category_id", selectedCategory.id);

      if (error) throw error;
      return data.map(mapping => mapping.channel_id);
    },
    enabled: !!selectedCategory,
  });

  const handleDeleteCategory = async (id: string) => {
    // Only allow deletion of custom categories (those with UUID format)
    if (id.length === 36) { // UUID length check
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

        // First delete all video and channel mappings
        const { error: videoMappingsError } = await supabase
          .from("video_custom_category_mappings")
          .delete()
          .eq("category_id", id);

        if (videoMappingsError) throw videoMappingsError;

        const { error: channelMappingsError } = await supabase
          .from("channel_custom_category_mappings")
          .delete()
          .eq("category_id", id);

        if (channelMappingsError) throw channelMappingsError;

        // Then delete the category itself
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
    } else {
      toast.error("Default categories cannot be deleted");
    }
  };

  const handleManageContent = (category: CustomCategory) => {
    setSelectedCategory(category);
    setSelectedVideos(categoryVideos || []);
    setSelectedChannels(categoryChannels || []);
  };

  const handleSaveContent = async (selectedVideos: string[], selectedChannels: string[]) => {
    if (!selectedCategory) return;

    try {
      // Handle videos
      const { error: deleteVideoError } = await supabase
        .from("video_custom_category_mappings")
        .delete()
        .eq("category_id", selectedCategory.id);

      if (deleteVideoError) throw deleteVideoError;

      if (selectedVideos.length > 0) {
        const { error: insertVideoError } = await supabase
          .from("video_custom_category_mappings")
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
        .from("channel_custom_category_mappings")
        .delete()
        .eq("category_id", selectedCategory.id);

      if (deleteChannelError) throw deleteChannelError;

      if (selectedChannels.length > 0) {
        const { error: insertChannelError } = await supabase
          .from("channel_custom_category_mappings")
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

  const handleVideoSelectionChange = (videoId: string, checked: boolean) => {
    if (checked) {
      setSelectedVideos([...selectedVideos, videoId]);
    } else {
      setSelectedVideos(selectedVideos.filter(id => id !== videoId));
    }
  };

  const handleChannelSelectionChange = (channelId: string, checked: boolean) => {
    if (checked) {
      setSelectedChannels([...selectedChannels, channelId]);
    } else {
      setSelectedChannels(selectedChannels.filter(id => id !== channelId));
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Existing Categories</h3>
      <CategoryTable
        categories={categories}
        onManageContent={handleManageContent}
        onDeleteCategory={handleDeleteCategory}
      />
      <CategoryContentManager
        category={selectedCategory}
        onClose={() => setSelectedCategory(null)}
        onSave={handleSaveContent}
        selectedVideos={selectedVideos}
        selectedChannels={selectedChannels}
        onVideoSelectionChange={handleVideoSelectionChange}
        onChannelSelectionChange={handleChannelSelectionChange}
      />
    </Card>
  );
}
