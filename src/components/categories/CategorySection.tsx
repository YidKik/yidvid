
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { CategoryCard } from "./CategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { CustomCategory } from "@/types/custom-categories";

interface Category {
  id: string;
  label: string;
  icon: string;
  isCustom?: boolean;
  is_emoji?: boolean;
}

const defaultCategories: Category[] = [
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'torah', label: 'Torah', icon: '📖' },
  { id: 'inspiration', label: 'Inspiration', icon: '✨' },
  { id: 'podcast', label: 'Podcasts', icon: '🎙️' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { id: 'other', label: 'Other', icon: '📌' },
];

export const CategorySection = () => {
  const { data: categoryVideos, isLoading: videosLoading, refetch } = useQuery({
    queryKey: ["category-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .is('deleted_at', null)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: customCategories, isLoading: categoriesLoading } = useQuery({
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

  const { data: videoCategoryMappings } = useQuery({
    queryKey: ["video-category-mappings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_category_mappings")
        .select(`
          category_id,
          video_id
        `);

      if (error) throw error;
      return data || [];
    },
  });

  const { data: channelCategoryMappings } = useQuery({
    queryKey: ["channel-category-mappings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channel_category_mappings")
        .select(`
          category_id,
          channel_id
        `);

      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    const processExistingVideos = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('categorize-existing-videos', {
          body: {},
        });
        
        if (error) throw error;
        
        if (data?.results?.length > 0) {
          await refetch();
        }
      } catch (error) {
        console.error('Error categorizing videos:', error);
      }
    };

    processExistingVideos();
  }, []);

  const getCategoryCount = (categoryId: string, isCustom?: boolean) => {
    if (!categoryVideos) return 0;

    if (isCustom) {
      // For custom categories, get videos directly mapped to this category
      const directlyMappedVideos = videoCategoryMappings?.filter(
        mapping => mapping.category_id === categoryId
      ) || [];

      // Get channels mapped to this category
      const mappedChannels = channelCategoryMappings?.filter(
        mapping => mapping.category_id === categoryId
      ).map(mapping => mapping.channel_id) || [];

      // Count videos from mapped channels
      const channelVideosCount = categoryVideos.filter(
        video => mappedChannels.includes(video.channel_id)
      ).length;

      // Count directly mapped videos (that aren't already counted through channel mapping)
      const directVideoIds = directlyMappedVideos.map(mapping => mapping.video_id);
      const directlyMappedCount = categoryVideos.filter(
        video => directVideoIds.includes(video.id) && 
        !mappedChannels.includes(video.channel_id)
      ).length;

      return channelVideosCount + directlyMappedCount;
    }

    // For default categories, count videos with matching category
    return categoryVideos.filter(video => video.category === categoryId).length;
  };

  // Combine default and custom categories
  const allCategories: Category[] = [
    ...defaultCategories,
    ...(customCategories?.map(cat => ({
      id: cat.id,
      label: cat.name,
      icon: cat.icon,
      isCustom: true,
      is_emoji: cat.is_emoji
    })) || [])
  ];

  // Double the categories for the infinite scroll effect
  const infiniteCategories = [...allCategories, ...allCategories, ...allCategories, ...allCategories, ...allCategories, ...allCategories];

  if (videosLoading || categoriesLoading) {
    return (
      <div className="grid grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative max-w-[1400px] mx-auto px-4 md:px-6">
      <div className="overflow-visible relative">
        <motion.div
          className="flex gap-2 md:gap-6"
          animate={{
            x: ['0%', '-50%']
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 180,
              ease: "linear",
              repeatDelay: 0
            }
          }}
          style={{
            width: `${(infiniteCategories.length * 100) / 3}%`
          }}
        >
          {infiniteCategories.map((category, index) => (
            <div
              key={`${category.id}-${index}`}
              className="w-[140px] md:w-[300px] flex-shrink-0"
            >
              <CategoryCard
                id={category.id}
                icon={category.icon}
                label={category.label}
                count={getCategoryCount(category.id, category.isCustom)}
                isCustomImage={category.isCustom && !category.is_emoji}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
