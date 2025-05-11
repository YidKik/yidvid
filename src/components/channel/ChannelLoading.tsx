
import { BackButton } from "@/components/navigation/BackButton";
import { DelayedLoadingAnimation } from "@/components/ui/DelayedLoadingAnimation";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export const ChannelLoading = () => {
  const location = useLocation();
  const isMainPage = location.pathname === "/";
  const { isMobile } = useIsMobile();
  
  if (isMainPage) {
    return null;
  }
  
  return (
    <div className="container mx-auto p-4 mt-16">
      <BackButton />
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <DelayedLoadingAnimation 
          size={isMobile ? "small" : "large"} 
          text="Loading channel..." 
          delayMs={3000}
        />
      </div>
    </div>
  );
};
