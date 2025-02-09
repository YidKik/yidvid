
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
        prevIndex + 3 >= categories.length ? 0 : prevIndex + 3
      );
    }, 5000); // Slower transition interval

    return () => clearInterval(interval);
  }, []);

  const getCategoryCount = (categoryId: string) => {
    return categoryVideos?.filter(video => video.category === categoryId).length || 0;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4 p-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-[140px] rounded-lg" />
        ))}
      </div>
    );
  }

  const getVisibleCategories = () => {
    const currentGroup = [];
    const nextGroup = [];
    
    for (let i = 0; i < 3; i++) {
      const currentIdx = (currentIndex + i) % categories.length;
      currentGroup.push(categories[currentIdx]);
      
      const nextIdx = (currentIndex + 3 + i) % categories.length;
      nextGroup.push(categories[nextIdx]);
    }
    
    return { currentGroup, nextGroup };
  };

  const { currentGroup, nextGroup } = getVisibleCategories();

  return (
    <section className="py-8 px-4 md:px-6">
      <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">Browse by Category</h2>
      <div className="relative h-[140px] overflow-hidden">
        <motion.div
          className="grid grid-cols-3 gap-4 absolute w-full"
          animate={{ x: "-100%" }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          {currentGroup.map((category, index) => (
            <CategoryCard
              key={`current-${category.id}-${index}`}
              id={category.id}
              icon={category.icon}
              label={category.label}
              count={getCategoryCount(category.id)}
            />
          ))}
        </motion.div>

        <motion.div
          className="grid grid-cols-3 gap-4 absolute w-full"
          initial={{ x: "100%" }}
          animate={{ x: "0%" }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          {nextGroup.map((category, index) => (
            <CategoryCard
              key={`next-${category.id}-${index}`}
              id={category.id}
              icon={category.icon}
              label={category.label}
              count={getCategoryCount(category.id)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
