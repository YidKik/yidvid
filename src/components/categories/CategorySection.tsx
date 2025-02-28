
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { CategoryCard } from "./CategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { useColors } from "@/contexts/ColorContext";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const { colors } = useColors();
  const isMobile = useIsMobile();
  
  const { data: categoryVideos, refetch } = useQuery({
    queryKey: ["category-videos"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .is('deleted_at', null)
          .order("uploaded_at", { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching videos:', error);
        return [];
      }
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

  const infiniteCategories = [...allCategories, ...allCategories, ...allCategories, ...allCategories, ...allCategories, ...allCategories];

  if (categoriesLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 max-w-[1200px] mx-auto px-4 md:px-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[65px] md:h-[90px] rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative w-full py-1 md:py-4">
      <div className="max-w-screen-sm md:max-w-[1400px] mx-auto px-2 md:px-6">
        <div className="overflow-hidden relative h-[65px] md:h-[150px]">
          <div 
            className="absolute left-0 top-0 w-8 md:w-48 h-full z-10" 
            style={{
              background: `linear-gradient(to right, ${colors.backgroundColor}, ${colors.backgroundColor}00)`
            }}
          />
          
          <motion.div
            className="flex gap-2 md:gap-6 cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{
              left: -(infiniteCategories.length * (isMobile ? 100 : 300)),
              right: 0
            }}
            dragElastic={0.2}
            dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
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
            whileTap={{ cursor: "grabbing" }}
          >
            {infiniteCategories.map((category, index) => (
              <div
                key={`${category.id}-${index}`}
                className="w-[100px] md:w-[280px] flex-shrink-0 relative"
              >
                <CategoryCard
                  id={category.id}
                  icon={category.icon}
                  label={category.label}
                  isCustomImage={category.isCustom && !category.is_emoji}
                />
              </div>
            ))}
          </motion.div>

          <div 
            className="absolute right-0 top-0 w-8 md:w-48 h-full z-10"
            style={{
              background: `linear-gradient(to left, ${colors.backgroundColor}, ${colors.backgroundColor}00)`
            }}
          />
        </div>
      </div>
    </div>
  );
};
