
import React, { useRef, useEffect, useState } from "react";
import { CategoryCard } from "./CategoryCard";

interface MobileCategoryScrollProps {
  infiniteCategories: Array<{
    id: string;
    label: string;
    icon: string;
    isCustom?: boolean;
    is_emoji?: boolean;
  }>;
}

export const MobileCategoryScroll: React.FC<MobileCategoryScrollProps> = ({ 
  infiniteCategories 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Debug log to help diagnose issues
  useEffect(() => {
    console.log(`MobileCategoryScroll rendering with ${infiniteCategories?.length || 0} categories`);
    if (infiniteCategories?.[0]) {
      console.log("First category:", infiniteCategories[0]);
    }
  }, [infiniteCategories]);

  // Guard against empty categories
  if (!infiniteCategories || infiniteCategories.length === 0) {
    console.warn("No categories available for mobile scroll");
    return null;
  }

  // Auto-scroll animation for mobile - continuous right-to-left scrolling
  useEffect(() => {
    if (!scrollContainerRef.current || infiniteCategories.length === 0) return;
    
    // Set flag to ensure animation only starts once
    if (!isInitialized) {
      setIsInitialized(true);
    }
    
    let animationFrameId: number;
    let isPaused = false;
    const scrollSpeed = 0.8;
    const container = scrollContainerRef.current;
    
    const scroll = () => {
      if (!container || isPaused) {
        animationFrameId = requestAnimationFrame(scroll);
        return;
      }
      
      container.scrollLeft += scrollSpeed;
      
      // Reset when reaching the end to create infinite scroll effect
      if (container.scrollLeft >= (container.scrollWidth - container.clientWidth) * 0.95) {
        // Jump back to 1/3 position for smoother looping
        container.scrollLeft = container.scrollWidth / 3;
      }
      
      animationFrameId = requestAnimationFrame(scroll);
    };
    
    // Start the animation immediately
    animationFrameId = requestAnimationFrame(scroll);
    
    // Pause animation on touch
    const pauseAnimation = () => {
      isPaused = true;
    };
    
    // Resume animation after touch ends with a small delay
    const resumeAnimation = () => {
      setTimeout(() => {
        isPaused = false;
      }, 2000);
    };
    
    container.addEventListener('touchstart', pauseAnimation, { passive: true });
    container.addEventListener('touchend', resumeAnimation, { passive: true });
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (container) {
        container.removeEventListener('touchstart', pauseAnimation);
        container.removeEventListener('touchend', resumeAnimation);
      }
    };
  }, [isInitialized, infiniteCategories]);

  return (
    <div className="h-full flex items-center overflow-hidden">
      <div 
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto touch-pan-x scrollbar-hide no-scrollbar"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          minWidth: "100%"
        }}
      >
        {/* Triple the categories to ensure continuous scroll */}
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
    </div>
  );
};
