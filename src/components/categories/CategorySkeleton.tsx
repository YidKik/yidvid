
import React from "react";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";

export const CategorySkeleton: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex justify-center items-center h-[55px] md:h-[150px] w-full">
      <div className="w-full max-w-[1200px] mx-auto overflow-hidden">
        <div className="flex gap-2 md:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton 
              key={i} 
              className={`flex-shrink-0 ${isMobile ? 'w-[100px] h-[55px]' : 'w-[220px] h-[90px]'} rounded-xl opacity-75`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};
