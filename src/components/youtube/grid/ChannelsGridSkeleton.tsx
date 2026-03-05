
import { Loader2 } from "lucide-react";
import { useLocation } from "react-router-dom";

export const ChannelsGridSkeleton = () => {
  const location = useLocation();
  const isMainPage = location.pathname === "/";
  
  if (isMainPage) {
    return null;
  }
  
  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 md:px-4 h-[300px] flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );
};
