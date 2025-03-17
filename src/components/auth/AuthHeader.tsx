
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

interface AuthHeaderProps {
  onBack?: () => void;
}

export const AuthHeader = ({ onBack }: AuthHeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex items-center ${isMobile ? 'px-4 py-3' : 'px-8 py-6'} bg-transparent border-b border-gray-100`}>
      {onBack && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="mr-2 h-8 w-8 rounded-full"
        >
          <ArrowLeft className="h-4 w-4 text-gray-600" />
        </Button>
      )}
      <div className="flex-1 flex justify-center">
        <img
          src="/lovable-uploads/647f173b-d940-48cd-a88d-b6d8806813fa.png"
          alt="Logo"
          className={`${isMobile ? 'h-6' : 'h-8'}`}
        />
      </div>
      {onBack && <div className="w-8" />}
    </div>
  );
};
