
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

  // Auto-scroll animation for mobile - continuous right-to-left scrolling
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    
    // Set flag to ensure animation only starts once
    if (!isInitialized) {
      setIsInitialized(true);
    }
    
    let animationFrameId: number;
    let isPaused = false;
    const scrollSpeed = 0.8; // Increased for more visible movement
    const container = scrollContainerRef.current;
    
    const scroll = () => {
      if (!container || isPaused) {
        animationFrameId = requestAnimationFrame(scroll);
        return;
      }
      
      container.scrollLeft += scrollSpeed;
      
      // Reset when reaching the end to create infinite scroll effect
      if (container.scrollLeft >= (container.scrollWidth - container.clientWidth)) {
        // Jump back to start smoothly
        container.scrollLeft = 0;
      }
      
      animationFrameId = requestAnimationFrame(scroll);
    };
    
    // Start the animation immediately
    animationFrameId = requestAnimationFrame(scroll);
    
    // Pause animation on touch
    const pauseAnimation = () => {
      isPaused = true;
      console.log("Touch detected, pausing auto-scroll");
    };
    
    // Resume animation after touch ends with a small delay
    const resumeAnimation = () => {
      console.log("Touch ended, resuming auto-scroll after delay");
      setTimeout(() => {
        isPaused = false;
      }, 2000); // Small delay before resuming
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
  }, [isInitialized]);

  return (
    <div 
      ref={scrollContainerRef}
      className="flex gap-2 overflow-x-auto touch-pan-x scrollbar-hide no-scrollbar"
      style={{ 
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth',
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none' // IE and Edge
      }}
    >
      {/* Double the categories to ensure continuous scroll */}
      {[...infiniteCategories, ...infiniteCategories].map((category, index) => (
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
