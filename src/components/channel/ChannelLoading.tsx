
import { BackButton } from "@/components/navigation/BackButton";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
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
        <LoadingAnimation 
          size="large" 
          color="primary"
          text="Loading channel..." 
        />
      </div>
    </div>
  );
};
