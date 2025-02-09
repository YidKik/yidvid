
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { CategoryCard } from "./CategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { TrendingCategoryBadge } from "./TrendingCategoryBadge";

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
  const { data: categoryVideos, refetch } = useQuery({
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

  // Get view counts for trending calculation based on total views
  const { data: viewCounts } = useQuery({
    queryKey: ["category-views"],
    queryFn: async () => {
      const { data: videos, error } = await supabase
        .from("youtube_videos")
        .select("category, views")
        .is('deleted_at', null)
        .order('views', { ascending: false });

      if (error) throw error;

      // Calculate total views per category
      const categoryViews = (videos || []).reduce((acc, curr) => {
        if (curr.category) {
          acc[curr.category] = (acc[curr.category] || 0) + (curr.views || 0);
        }
        return acc;
      }, {} as Record<string, number>);

      return categoryViews;
    },
    refetchInterval: 60000, // Refetch every minute
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

  if (categoriesLoading) {
    return (
      <div className="grid grid-cols-3 gap-8 max-w-[1200px] mx-auto px-4 md:px-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative max-w-[1200px] mx-auto px-4 md:px-6">
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
              className="w-[140px] md:w-[300px] flex-shrink-0 relative"
            >
              {viewCounts && viewCounts[category.id] && viewCounts[category.id] > 0 && (
                <TrendingCategoryBadge count={viewCounts[category.id]} />
              )}
              <CategoryCard
                id={category.id}
                icon={category.icon}
                label={category.label}
                isCustomImage={category.isCustom && !category.is_emoji}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
