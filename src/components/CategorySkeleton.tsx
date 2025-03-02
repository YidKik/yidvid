
import React from "react";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { useIsMobile } from "@/hooks/use-mobile";

export const CategorySkeleton: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex justify-center items-center h-[100px] md:h-[150px]">
      <LoadingAnimation 
        size={isMobile ? "small" : "medium"} 
        color="accent" 
        text="Loading categories..." 
      />
    </div>
  );
};
