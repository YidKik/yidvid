
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
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Debug log to help diagnose issues
  useEffect(() => {
    console.log(`MobileCategoryScroll rendering with ${infiniteCategories?.length || 0} categories`);
  }, [infiniteCategories]);

  // Guard against empty categories
  if (!infiniteCategories || infiniteCategories.length === 0) {
    console.warn("No categories available for mobile scroll");
    return null;
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="h-full flex items-center overflow-hidden mobile-category-container">
      <div 
        ref={scrollContainerRef}
        className="flex gap-1 overflow-x-auto touch-pan-x scrollbar-hide no-scrollbar scroll-smooth mobile-category-scroll"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          minWidth: "100%",
          paddingBottom: "4px",
          cursor: isDragging ? 'grabbing' : 'grab',
          whiteSpace: 'nowrap'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {infiniteCategories.map((category, index) => (
          <div
            key={`${category.id}-${index}`}
            className="flex-shrink-0 w-[75px] relative"
            style={{ minWidth: '75px', maxWidth: '75px' }}
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
