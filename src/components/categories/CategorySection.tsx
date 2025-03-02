
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { CategoryCard } from "./CategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef } from "react";
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
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

  // Use fewer repetitions for better performance
  const infiniteCategories = [...allCategories, ...allCategories, ...allCategories];

  // Manual scroll function for mobile touch sliding
  const handleDragStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current || !isMobile) return;
    
    const container = scrollContainerRef.current;
    const startX = e.touches[0].clientX;
    let lastX = startX;
    let isDragging = true;
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !container) return;
      const currentX = e.touches[0].clientX;
      const diff = lastX - currentX;
      container.scrollLeft += diff;
      lastX = currentX;
    };
    
    const handleTouchEnd = () => {
      isDragging = false;
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);
  };

  // Auto-scroll animation for mobile
  useEffect(() => {
    if (!scrollContainerRef.current || !isMobile) return;
    
    let animationFrameId: number;
    let scrollPosition = 0;
    const scrollSpeed = 1; // Adjust speed as needed
    const container = scrollContainerRef.current;
    
    const scroll = () => {
      if (!container) return;
      
      scrollPosition += scrollSpeed;
      
      // Reset when reaching the end to create infinite scroll effect
      if (scrollPosition >= container.scrollWidth / 2) {
        scrollPosition = 0;
      }
      
      container.scrollLeft = scrollPosition;
      animationFrameId = requestAnimationFrame(scroll);
    };
    
    animationFrameId = requestAnimationFrame(scroll);
    
    // Pause animation on touch
    const pauseAnimation = () => {
      cancelAnimationFrame(animationFrameId);
    };
    
    // Resume animation when touch ends
    const resumeAnimation = () => {
      animationFrameId = requestAnimationFrame(scroll);
    };
    
    container.addEventListener('touchstart', pauseAnimation);
    container.addEventListener('touchend', resumeAnimation);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (container) {
        container.removeEventListener('touchstart', pauseAnimation);
        container.removeEventListener('touchend', resumeAnimation);
      }
    };
  }, [isMobile]);

  if (categoriesLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 max-w-[1200px] mx-auto px-4 md:px-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className={`${isMobile ? 'h-[55px]' : 'h-[90px]'} rounded-xl`} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative w-full py-1 md:py-2 flex justify-center">
      <div className="w-full max-w-screen-sm md:max-w-[1400px] mx-auto px-2 md:px-6">
        <div className="overflow-hidden relative h-[55px] md:h-[150px]">
          <div 
            className={`absolute left-0 top-0 ${isMobile ? 'w-4' : 'w-8 md:w-48'} h-full z-10`}
            style={{
              background: `linear-gradient(to right, ${colors.backgroundColor}, ${colors.backgroundColor}00)`
            }}
          />
          
          {isMobile ? (
            <div 
              ref={scrollContainerRef}
              className="flex gap-2 overflow-x-auto touch-pan-x scrollbar-hide"
              onTouchStart={handleDragStart}
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {infiniteCategories.map((category, index) => (
                <div
                  key={`${category.id}-${index}`}
                  className="flex-shrink-0 w-[100px] relative"
                >
                  <CategoryCard
                    id={category.id}
                    icon={category.icon}
                    label={category.label}
                    isCustomImage={category.isCustom && !category.is_emoji}
                  />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              className="flex gap-2 md:gap-4 cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{
                left: -(infiniteCategories.length * (isMobile ? 85 : 300)),
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
                  className="w-[95px] md:w-[220px] flex-shrink-0 relative"
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
          )}

          <div 
            className={`absolute right-0 top-0 ${isMobile ? 'w-4' : 'w-8 md:w-48'} h-full z-10`}
            style={{
              background: `linear-gradient(to left, ${colors.backgroundColor}, ${colors.backgroundColor}00)`
            }}
          />
        </div>
      </div>
    </div>
  );
};
