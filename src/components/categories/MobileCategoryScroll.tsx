
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

  // Manual scroll function for mobile touch sliding
  const handleDragStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    
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

  // Auto-scroll animation for mobile - continuous right-to-left scrolling
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    
    let animationFrameId: number;
    let isPaused = false;
    const scrollSpeed = 0.5; // Slightly faster for better visual flow
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
    
    // Resume animation when touch ends
    const resumeAnimation = () => {
      setTimeout(() => {
        isPaused = false;
        animationFrameId = requestAnimationFrame(scroll);
      }, 1000); // Small delay before resuming
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
      onTouchStart={handleDragStart}
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
