
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { useLocation } from "react-router-dom";

export const ChannelsGridSkeleton = () => {
  const location = useLocation();
  const isMainPage = location.pathname === "/";
  
  if (isMainPage) {
    return null;
  }
  
  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 md:px-4 h-[300px] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <LoadingAnimation 
          size="medium" 
          color="primary" 
          text="Loading channels..."
        />
      </div>
    </div>
  );
};
