
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { CategoryCard } from "./CategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

const categories = [
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'torah', label: 'Torah', icon: '📖' },
  { id: 'inspiration', label: 'Inspiration', icon: '✨' },
  { id: 'podcast', label: 'Podcasts', icon: '🎙️' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { id: 'other', label: 'Other', icon: '📌' },
];

const infiniteCategories = [...categories, ...categories, ...categories, ...categories, ...categories, ...categories];

export const CategorySection = () => {
  const { data: categoryVideos, isLoading, refetch } = useQuery({
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

  const getCategoryCount = (categoryId: string) => {
    return categoryVideos?.filter(video => video.category === categoryId).length || 0;
  };

  if (isLoading) {
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
          className="flex gap-6"
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
              className="w-[300px] flex-shrink-0"
            >
              <CategoryCard
                id={category.id}
                icon={category.icon}
                label={category.label}
                count={getCategoryCount(category.id)}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
