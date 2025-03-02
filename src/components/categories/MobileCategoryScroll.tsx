
import React, { useRef, useEffect } from "react";
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

  // Auto-scroll animation for mobile - continuous right-to-left scrolling
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    
    let animationFrameId: number;
    let isPaused = false;
    const scrollSpeed = 0.5; // Adjusted for better visual flow
    const container = scrollContainerRef.current;
    
    const scroll = () => {
      if (!container || isPaused) return;
      
      container.scrollLeft += scrollSpeed;
      
      // Reset when reaching the end to create infinite scroll effect
      if (container.scrollLeft >= container.scrollWidth / 2) {
        container.scrollLeft = 0;
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
        animationFrameId = requestAnimationFrame(scroll);
      }, 2000); // Small delay before resuming
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
  }, []);

  return (
    <div 
      ref={scrollContainerRef}
      className="flex gap-2 overflow-x-auto touch-pan-x scrollbar-hide"
      style={{ 
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth'
      }}
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
  );
};
