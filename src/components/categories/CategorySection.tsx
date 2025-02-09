
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
  const [duplicatedCategories, setDuplicatedCategories] = useState([...categories, ...categories]);
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

  // Infinite scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDuplicatedCategories(prev => {
        const firstItem = prev[0];
        const newArray = [...prev.slice(1), firstItem];
        return newArray;
      });
    }, 3000); // Adjust speed by changing this value

    return () => clearInterval(interval);
  }, []);

  const getCategoryCount = (categoryId: string) => {
    return categoryVideos?.filter(video => video.category === categoryId).length || 0;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 p-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <section className="py-8 px-4 md:px-6 overflow-hidden">
      <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">Browse by Category</h2>
      <div className="relative w-full">
        <div className="flex flex-col gap-4 max-w-[800px] mx-auto">
          {duplicatedCategories.map((category, index) => (
            <motion.div
              key={`${category.id}-${index}`}
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.8,
                ease: "easeInOut",
                delay: index * 0.1
              }}
              className="w-full"
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
    </section>
  );
};
