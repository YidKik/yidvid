
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

export const CategorySkeleton: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 max-w-[1200px] mx-auto px-4 md:px-6">
      {[...Array(isMobile ? 4 : 6)].map((_, i) => (
        <Skeleton key={i} className={`${isMobile ? 'h-[55px]' : 'h-[90px]'} rounded-xl`} />
      ))}
    </div>
  );
};
