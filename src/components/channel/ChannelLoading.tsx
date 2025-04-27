
import { BackButton } from "@/components/navigation/BackButton";
import { MessageLoadingDots } from "@/components/ui/loading/MessageLoadingDots";
import { useLocation } from "react-router-dom";

export const ChannelLoading = () => {
  const location = useLocation();
  const isMainPage = location.pathname === "/";
  
  if (isMainPage) {
    return null;
  }
  
  return (
    <div className="container mx-auto p-4 mt-16">
      <BackButton />
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <MessageLoadingDots 
          size="large" 
          text="Loading channel..." 
        />
      </div>
    </div>
  );
};
