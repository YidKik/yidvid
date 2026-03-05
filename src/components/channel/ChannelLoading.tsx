
import { BackButton } from "@/components/navigation/BackButton";
import { Loader2 } from "lucide-react";
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
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
};
