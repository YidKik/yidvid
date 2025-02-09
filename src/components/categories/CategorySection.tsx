
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { CategoryCard } from "./CategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const categories = [
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'torah', label: 'Torah', icon: '📖' },
  { id: 'inspiration', label: 'Inspiration', icon: '✨' },
  { id: 'podcast', label: 'Podcasts', icon: '🎙️' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { id: 'other', label: 'Other', icon: '📌' },
];

export const CategorySection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
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
      const toastId = toast.loading("Categorizing videos...");
      try {
        const { data, error } = await supabase.functions.invoke('categorize-existing-videos', {
          body: {},
        });
        
        if (error) throw error;
        
        if (data?.results?.length > 0) {
          await refetch();
          toast.success(`Successfully categorized ${data.results.length} videos`, {
            id: toastId,
          });
        } else {
          toast.success("All videos are already categorized", {
            id: toastId,
          });
        }
      } catch (error) {
        console.error('Error categorizing videos:', error);
        toast.error("Failed to categorize videos. Please try again later.", {
          id: toastId,
        });
      }
    };

    processExistingVideos();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex + 1 >= categories.length ? 0 : prevIndex + 1
      );
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const getCategoryCount = (categoryId: string) => {
    return categoryVideos?.filter(video => video.category === categoryId).length || 0;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-[140px] rounded-lg" />
        ))}
      </div>
    );
  }

  const getVisibleCategories = () => {
    const visibleCategories = [];
    for (let i = 0; i < categories.length; i++) {
      const index = (currentIndex + i) % categories.length;
      visibleCategories.push({
        ...categories[index],
        key: `${categories[index].id}-${i}`,
        position: i
      });
    }
    return visibleCategories;
  };

  const visibleCategories = getVisibleCategories();

  return (
    <div className="mt-8 mb-12">
      <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">Browse by Category</h2>
      <div className="relative h-[140px] overflow-hidden">
        <div className="absolute w-full">
          {visibleCategories.map((category) => (
            <motion.div
              key={category.key}
              className="absolute w-[calc(33.33%-1rem)] top-0"
              initial={{ x: `${(category.position * 33.33) + (category.position * 1)}%` }}
              animate={{ 
                x: `${((category.position - 1) * 33.33) + ((category.position - 1) * 1)}%`,
                opacity: category.position === 0 ? 0 : 1
              }}
              transition={{
                duration: 4.5,
                ease: "easeInOut",
                repeat: 0
              }}
              style={{
                marginRight: '1rem'
              }}
            >
              <CategoryCard
                id={category.id}
                icon={category.icon}
                label={category.label}
                count={getCategoryCount(category.id)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
