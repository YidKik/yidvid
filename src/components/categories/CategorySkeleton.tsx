
import React from "react";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";

export const CategorySkeleton: React.FC = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const isMainPage = location.pathname === "/";
  
  if (isMainPage) {
    return null;
  }
  
  return (
    <div className="flex justify-center items-center h-[100px] md:h-[150px]">
      <LoadingAnimation 
        size={isMobile ? "small" : "medium"} 
        color="primary" 
        text="Loading categories..." 
      />
    </div>
  );
};
