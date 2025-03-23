
import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useColors } from "@/contexts/ColorContext";
import { DesktopCategoryScroll } from "./DesktopCategoryScroll";
import { MobileCategoryScroll } from "./MobileCategoryScroll";
import { CategorySkeleton } from "./CategorySkeleton";
import { useCategories } from "@/hooks/useCategories";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

export const CategorySection = () => {
  const { colors } = useColors();
  const isMobile = useIsMobile();
  const location = useLocation();
  const isMainPage = location.pathname === "/";
  
  const { 
    infiniteCategories, 
    categoriesLoading, 
    refetchVideos 
  } = useCategories();
  
  useEffect(() => {
    const processExistingVideos = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('categorize-existing-videos', {
          body: {},
        });
        
        if (error) throw error;
        
        if (data?.results?.length > 0) {
          await refetchVideos();
        }
      } catch (error) {
        console.error('Error categorizing videos:', error);
      }
    };

    processExistingVideos();
  }, [refetchVideos]);

  // Handle loading states
  if (categoriesLoading) {
    return (
      <div className="relative w-full py-1 md:py-2 flex justify-center">
        <div className="w-full max-w-screen-sm md:max-w-[1400px] mx-auto px-2 md:px-6">
          <div className="overflow-hidden relative h-[55px] md:h-[150px]">
            <CategorySkeleton />
          </div>
        </div>
      </div>
    );
  }

  // Guard against empty categories
  if (!infiniteCategories || infiniteCategories.length === 0) {
    console.warn("No categories available to display");
    return null;
  }

  return (
    <div className="relative w-full py-1 md:py-2 flex justify-center">
      <div className="w-full max-w-screen-sm md:max-w-[1400px] mx-auto px-2 md:px-6">
        <div className="overflow-hidden relative h-[55px] md:h-[150px]">
          <div 
            className={`absolute left-0 top-0 ${isMobile ? 'w-4' : 'w-8 md:w-48'} h-full z-10`}
            style={{
              background: `linear-gradient(to right, ${colors.backgroundColor}, ${colors.backgroundColor}00)`
            }}
          />
          
          {isMobile ? (
            <MobileCategoryScroll infiniteCategories={infiniteCategories} />
          ) : (
            <DesktopCategoryScroll infiniteCategories={infiniteCategories} />
          )}

          <div 
            className={`absolute right-0 top-0 ${isMobile ? 'w-4' : 'w-8 md:w-48'} h-full z-10`}
            style={{
              background: `linear-gradient(to left, ${colors.backgroundColor}, ${colors.backgroundColor}00)`
            }}
          />
        </div>
      </div>
    </div>
  );
};
