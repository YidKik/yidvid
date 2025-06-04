
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
    <div className="h-[35px] flex items-center overflow-hidden mobile-category-container">
      <div 
        ref={scrollContainerRef}
        className="flex gap-0.5 overflow-x-auto touch-pan-x scrollbar-hide no-scrollbar scroll-smooth mobile-category-scroll"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          minWidth: "100%",
          paddingBottom: "2px",
          cursor: isDragging ? 'grabbing' : 'grab',
          whiteSpace: 'nowrap',
          height: '35px',
          alignItems: 'center',
          display: 'flex'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {infiniteCategories.map((category, index) => (
          <div
            key={`${category.id}-${index}`}
            className="flex-shrink-0 w-[60px] relative"
            style={{ 
              minWidth: '60px', 
              maxWidth: '60px',
              height: '35px',
              display: 'flex',
              alignItems: 'center'
            }}
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
