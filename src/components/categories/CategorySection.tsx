
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { CategoryCard } from "./CategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
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

// Multiply the categories array even more times to ensure ultra-smooth looping
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
    <div className="mt-8 mb-12">
      <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">Browse by Category</h2>
      <div className="relative w-full">
        {/* Left fade overlay */}
        <div className="absolute left-0 top-0 h-full w-32 z-10 bg-gradient-to-r from-white via-white to-transparent" />
        
        {/* Right fade overlay */}
        <div className="absolute right-0 top-0 h-full w-32 z-10 bg-gradient-to-l from-white via-white to-transparent" />
        
        <motion.div
          className="flex absolute gap-6"
          animate={{
            x: ['0%', '-50%'],
            y: [0, -40, 40, -40, 0]
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 90,
              ease: "linear",
              repeatDelay: 0
            },
            y: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 15,
              ease: "easeInOut",
              times: [0, 0.25, 0.5, 0.75, 1]
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

