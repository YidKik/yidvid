
import { DelayedLoadingAnimation } from "@/components/ui/DelayedLoadingAnimation";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export const ChannelsGridSkeleton = () => {
  const location = useLocation();
  const isMainPage = location.pathname === "/";
  const { isMobile } = useIsMobile();
  
  if (isMainPage) {
    return null;
  }
  
  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 md:px-4 h-[300px] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <DelayedLoadingAnimation 
          size={isMobile ? "small" : "medium"} 
          color="primary" 
          text="Loading channels..."
          delayMs={3000}
        />
      </div>
    </div>
  );
};
